import { IncidentTicket } from "@/types/incident";
import initialSeed from "@/data/elmina-seed.json";

// In-memory singleton store for demo & prototype execution
let incidents: IncidentTicket[] = [...(initialSeed as IncidentTicket[])];

export function getAllIncidents(): IncidentTicket[] {
  return incidents;
}

export function getIncidentById(id: string): IncidentTicket | undefined {
  return incidents.find((inc) => inc.ticket_id === id);
}

export function addIncident(newIncident: IncidentTicket): IncidentTicket {
  // Add to top of list
  incidents = [newIncident, ...incidents];
  return newIncident;
}

export function updateIncidentStatus(ticketId: string, newStatus: "DRAFTED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED"): IncidentTicket | null {
  const target = incidents.find((inc) => inc.ticket_id === ticketId);
  if (!target) return null;

  if (target.work_order) {
    target.work_order.status = newStatus;
  }
  return target;
}

export function incrementCommunityConfirmation(primaryTicketId: string, childTicketId: string): IncidentTicket | null {
  const target = incidents.find((inc) => inc.ticket_id === primaryTicketId);
  if (!target) return null;

  target.agent_analysis.contextual_factors.duplicate_count_50m += 1;
  if (!target.agent_analysis.contextual_factors.child_incident_ids) {
    target.agent_analysis.contextual_factors.child_incident_ids = [];
  }
  target.agent_analysis.contextual_factors.child_incident_ids.push(childTicketId);

  // If duplicate confirmations reach 3 or more, bump priority to HIGH/CRITICAL
  if (target.agent_analysis.contextual_factors.duplicate_count_50m >= 3 && target.agent_analysis.priority !== "CRITICAL") {
    target.agent_analysis.priority = "HIGH";
  }

  return target;
}

export interface ESGImpactMetrics {
  waterSavedLiters: number;
  carbonAvoidedKg: number;
  tripsEliminated: number;
  preventedDamageOpexMyr: number;
  totalResolvedCount: number;
  activeCriticalCount: number;
}

export function calculateESGMetrics(): ESGImpactMetrics {
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

    // Water calculations for pipe bursts
    if (inc.agent_analysis.category === "WATER_RETICULATION_AND_PLUMBING") {
      // 2,500 L/hr saved by resolving within 4 hours vs typical 7 days
      waterSaved += 140000;
    }

    // Duplicates eliminated
    const dups = inc.agent_analysis.contextual_factors.duplicate_count_50m || 1;
    duplicateCountTotal += dups - 1;

    // Preventative flood OPEX savings
    if (inc.agent_analysis.category === "DRAINAGE_AND_FLOOD_PREVENTION" && isCritical) {
      preventedOpex += 35000; // Estimated flood remediation avoided
    }
  }

  // Each eliminated inspection trip avoids a ~15km round trip in Klang Valley (~2.8 kg CO2e)
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
