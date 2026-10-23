import { NextRequest, NextResponse } from "next/server";
import { getIncidents, updateIncidentStatus, getESGMetrics } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const precinct = searchParams.get("precinct");
    const priority = searchParams.get("priority");

    let incidents = await getIncidents();

    if (precinct && precinct !== "ALL") {
      incidents = incidents.filter((inc) => inc.precinct.toLowerCase().includes(precinct.toLowerCase()));
    }

    if (priority && priority !== "ALL") {
      incidents = incidents.filter((inc) => inc.agent_analysis.priority === priority);
    }

    const esgMetrics = await getESGMetrics();

    return NextResponse.json({
      incidents,
      total_count: incidents.length,
      esg_metrics: esgMetrics,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, status } = body;

    if (!ticket_id || !status) {
      return NextResponse.json({ error: "Missing ticket_id or status" }, { status: 400 });
    }

    const updated = await updateIncidentStatus(ticket_id, status);
    if (!updated) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, incident: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
