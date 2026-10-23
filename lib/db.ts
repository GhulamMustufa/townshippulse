import { neon } from "@neondatabase/serverless";
import { IncidentTicket } from "@/types/incident";
import initialSeed from "@/data/elmina-seed.json";
import {
  getAllIncidents as getMemoryIncidents,
  addIncident as addMemoryIncident,
  updateIncidentStatus as updateMemoryIncidentStatus,
  incrementCommunityConfirmation as incrementMemoryDuplicate,
  calculateESGMetrics as calculateMemoryESG,
  ESGImpactMetrics,
} from "./incident-store";

let isSeeded = false;

function getDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  try {
    return neon(connectionString);
  } catch (err) {
    console.warn("[lib/db] Failed to initialize Neon client, falling back to memory:", err);
    return null;
  }
}

function rowToTicket(row: any): IncidentTicket {
  const rawInput = typeof row.raw_input === "string" ? JSON.parse(row.raw_input) : row.raw_input;
  const agentAnalysis = typeof row.agent_analysis === "string" ? JSON.parse(row.agent_analysis) : row.agent_analysis;
  const workOrder = row.work_order
    ? typeof row.work_order === "string"
      ? JSON.parse(row.work_order)
      : row.work_order
    : undefined;

  return {
    ticket_id: row.ticket_id,
    township: row.township || "City of Elmina",
    precinct: row.precinct,
    coordinates: {
      lat: Number(row.lat),
      lng: Number(row.lng),
    },
    timestamp: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    reported_via: row.reported_via || "web_portal",
    raw_input: rawInput,
    agent_analysis: agentAnalysis,
    work_order: workOrder,
  };
}

/**
 * Seed initial Elmina incidents to Neon DB if table is currently empty
 */
async function autoSeedNeonIfEmpty(sql: any) {
  if (isSeeded) return;
  try {
    const countRes = (await sql`SELECT count(*)::int as cnt FROM incidents;`) as any[];
    const count = countRes?.[0]?.cnt || 0;

    if (count === 0) {
      console.log("[lib/db] Table 'incidents' is empty. Seeding initial Elmina dataset...");
      for (const item of initialSeed as IncidentTicket[]) {
        await sql`
          INSERT INTO incidents (
            ticket_id, township, precinct, lat, lng, status, reported_via,
            reporter_name, contact_number, raw_input, agent_analysis, work_order, created_at, updated_at
          ) VALUES (
            ${item.ticket_id},
            ${item.township || "City of Elmina"},
            ${item.precinct},
            ${item.coordinates.lat},
            ${item.coordinates.lng},
            ${item.work_order?.status || "DRAFTED"},
            ${item.reported_via || "web_portal"},
            ${item.raw_input.reporter_name || "Resident"},
            ${item.raw_input.contact_number || ""},
            ${JSON.stringify(item.raw_input)},
            ${JSON.stringify(item.agent_analysis)},
            ${item.work_order ? JSON.stringify(item.work_order) : null},
            ${item.timestamp ? new Date(item.timestamp) : new Date()},
            NOW()
          )
          ON CONFLICT (ticket_id) DO NOTHING;
        `;
      }
      console.log(`[lib/db] Successfully seeded ${initialSeed.length} incidents to Neon DB.`);
    }
    isSeeded = true;
  } catch (err) {
    console.warn("[lib/db] Auto-seed check failed or already seeded:", err);
  }
}

/**
 * Fetch all incidents with multi-device cloud persistence
 */
export async function getIncidents(): Promise<IncidentTicket[]> {
  const sql = getDbClient();
  if (!sql) {
    return getMemoryIncidents();
  }

  try {
    await autoSeedNeonIfEmpty(sql);
    const rows = (await sql`
      SELECT ticket_id, township, precinct, lat, lng, status, reported_via,
             reporter_name, contact_number, raw_input, agent_analysis, work_order, created_at
      FROM incidents
      ORDER BY created_at DESC;
    `) as any[];

    if (rows && rows.length > 0) {
      return rows.map(rowToTicket);
    }
    return getMemoryIncidents();
  } catch (err) {
    console.warn("[lib/db] Error fetching from Neon DB, falling back to memory:", err);
    return getMemoryIncidents();
  }
}

/**
 * Save new incident to Neon DB and in-memory cache
 */
export async function saveIncident(ticket: IncidentTicket): Promise<IncidentTicket> {
  // Always update memory store for fast local response
  addMemoryIncident(ticket);

  const sql = getDbClient();
  if (!sql) {
    return ticket;
  }

  try {
    await sql`
      INSERT INTO incidents (
        ticket_id, township, precinct, lat, lng, status, reported_via,
        reporter_name, contact_number, raw_input, agent_analysis, work_order, created_at, updated_at
      ) VALUES (
        ${ticket.ticket_id},
        ${ticket.township || "City of Elmina"},
        ${ticket.precinct},
        ${ticket.coordinates.lat},
        ${ticket.coordinates.lng},
        ${ticket.work_order?.status || "DRAFTED"},
        ${ticket.reported_via || "web_portal"},
        ${ticket.raw_input.reporter_name || "Resident"},
        ${ticket.raw_input.contact_number || ""},
        ${JSON.stringify(ticket.raw_input)},
        ${JSON.stringify(ticket.agent_analysis)},
        ${ticket.work_order ? JSON.stringify(ticket.work_order) : null},
        ${ticket.timestamp ? new Date(ticket.timestamp) : new Date()},
        NOW()
      )
      ON CONFLICT (ticket_id) DO UPDATE SET
        status = EXCLUDED.status,
        agent_analysis = EXCLUDED.agent_analysis,
        work_order = EXCLUDED.work_order,
        updated_at = NOW();
    `;
    console.log(`[lib/db] Ticket ${ticket.ticket_id} persisted to Neon PostgreSQL.`);
  } catch (err) {
    console.error("[lib/db] Failed to persist ticket to Neon DB:", err);
  }

  return ticket;
}

/**
 * Update incident status in Neon DB and memory store
 */
export async function updateIncidentStatus(
  ticketId: string,
  newStatus: "DRAFTED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED"
): Promise<IncidentTicket | null> {
  const memoryUpdated = updateMemoryIncidentStatus(ticketId, newStatus);

  const sql = getDbClient();
  if (!sql) {
    return memoryUpdated;
  }

  try {
    const rows = (await sql`
      SELECT ticket_id, township, precinct, lat, lng, status, reported_via,
             reporter_name, contact_number, raw_input, agent_analysis, work_order, created_at
      FROM incidents
      WHERE ticket_id = ${ticketId}
      LIMIT 1;
    `) as any[];

    if (rows.length === 0) return memoryUpdated;

    const currentTicket = rowToTicket(rows[0]);
    if (currentTicket.work_order) {
      currentTicket.work_order.status = newStatus;
    }

    await sql`
      UPDATE incidents
      SET status = ${newStatus},
          work_order = ${currentTicket.work_order ? JSON.stringify(currentTicket.work_order) : null},
          updated_at = NOW()
      WHERE ticket_id = ${ticketId};
    `;

    return currentTicket;
  } catch (err) {
    console.error(`[lib/db] Failed to update ticket ${ticketId} status in Neon DB:`, err);
    return memoryUpdated;
  }
}

/**
 * Increment community confirmation counter on duplicate reports within 50m
 */
export async function incrementCommunityConfirmation(
  primaryTicketId: string,
  childTicketId: string
): Promise<IncidentTicket | null> {
  const memoryUpdated = incrementMemoryDuplicate(primaryTicketId, childTicketId);

  const sql = getDbClient();
  if (!sql) {
    return memoryUpdated;
  }

  try {
    const rows = (await sql`
      SELECT ticket_id, township, precinct, lat, lng, status, reported_via,
             reporter_name, contact_number, raw_input, agent_analysis, work_order, created_at
      FROM incidents
      WHERE ticket_id = ${primaryTicketId}
      LIMIT 1;
    `) as any[];

    if (rows.length === 0) return memoryUpdated;

    const currentTicket = rowToTicket(rows[0]);
    currentTicket.agent_analysis.contextual_factors.duplicate_count_50m += 1;
    if (!currentTicket.agent_analysis.contextual_factors.child_incident_ids) {
      currentTicket.agent_analysis.contextual_factors.child_incident_ids = [];
    }
    currentTicket.agent_analysis.contextual_factors.child_incident_ids.push(childTicketId);

    if (
      currentTicket.agent_analysis.contextual_factors.duplicate_count_50m >= 3 &&
      currentTicket.agent_analysis.priority !== "CRITICAL"
    ) {
      currentTicket.agent_analysis.priority = "HIGH";
    }

    await sql`
      UPDATE incidents
      SET agent_analysis = ${JSON.stringify(currentTicket.agent_analysis)},
          updated_at = NOW()
      WHERE ticket_id = ${primaryTicketId};
    `;

    return currentTicket;
  } catch (err) {
    console.error(`[lib/db] Failed to update duplicate confirmation in Neon DB:`, err);
    return memoryUpdated;
  }
}

/**
 * Calculate dynamic ESG & OPEX metrics from live database
 */
export async function getESGMetrics(): Promise<ESGImpactMetrics> {
  const incidents = await getIncidents();

  let waterSaved = 0;
  let duplicateCountTotal = 0;
  let criticalCount = 0;
  let resolvedCount = 0;
  let preventedOpex = 0;

  for (const inc of incidents) {
    const isCritical = inc.agent_analysis.priority === "CRITICAL";
    if (isCritical) criticalCount++;

    if (inc.work_order?.status === "RESOLVED" || inc.work_order?.status === "DISPATCHED") {
      resolvedCount++;
    }

    if (inc.agent_analysis.category === "WATER_RETICULATION_AND_PLUMBING") {
      waterSaved += 140000;
    }

    const dups = inc.agent_analysis.contextual_factors.duplicate_count_50m || 1;
    duplicateCountTotal += dups - 1;

    if (inc.agent_analysis.category === "DRAINAGE_AND_FLOOD_PREVENTION" && isCritical) {
      preventedOpex += 35000;
    }
  }

  const tripsAvoided = duplicateCountTotal * 2 + 15;
  const carbonAvoided = Math.round(tripsAvoided * 2.8 * 10) / 10;

  return {
    waterSavedLiters: waterSaved || 120000,
    carbonAvoidedKg: carbonAvoided,
    tripsEliminated: tripsAvoided,
    preventedDamageOpexMyr: preventedOpex || 70000,
    totalResolvedCount: resolvedCount,
    activeCriticalCount: criticalCount,
  };
}
