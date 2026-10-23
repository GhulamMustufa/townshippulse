import { NextRequest, NextResponse } from "next/server";
import { inspectDefectVision } from "@/lib/gemini-vision";
import { detectSpatialCluster } from "@/lib/spatial";
import { evaluateWeatherContext } from "@/lib/weather";
import { lookupJKRRate } from "@/lib/jkr-rates";
import { getIncidents, saveIncident, incrementCommunityConfirmation } from "@/lib/db";
import { IncidentTicket, PriorityLevel, WorkOrder } from "@/types/incident";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      image_data,
      text_description = "",
      lat = 3.2032,
      lng = 101.5125,
      township = "City of Elmina",
      precinct = "Elmina Green 1",
      reported_via = "web_portal",
      reporter_name = "Resident",
      contact_number = "+6012-0000000",
    } = body;

    const coordinates = { lat: Number(lat), lng: Number(lng) };
    const currentTimestamp = new Date().toISOString();
    const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTicketId = `ELM-${new Date().getFullYear()}-${randomTicketSuffix}`;

    // -------------------------------------------------------------
    // TOOL 1: inspect_defect_vision()
    // -------------------------------------------------------------
    const visionResult = await inspectDefectVision(image_data, text_description);

    if (!visionResult.is_authentic) {
      return NextResponse.json(
        {
          error: "IMAGE_AUTHENTICITY_REJECTED",
          message:
            visionResult.rejection_reason ||
            "Uploaded image does not appear to show a physical municipal infrastructure defect. Please provide a clear outdoor photo of the defect.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // TOOL 2: spatial_cluster_detector() (50m Radius)
    // -------------------------------------------------------------
    const existingIncidents = await getIncidents();
    const clusterResult = detectSpatialCluster(coordinates, existingIncidents, 50.0);

    // -------------------------------------------------------------
    // TOOL 3: weather_context_evaluator()
    // -------------------------------------------------------------
    const weatherResult = await evaluateWeatherContext(coordinates.lat, coordinates.lng);

    // Dynamic Priority Reasoning
    let finalPriority: PriorityLevel = visionResult.priority;

    // Environmental Monsoon Escalation Rule:
    // If defect is drainage or road-washout and rainfall > 30mm/h, escalate to CRITICAL
    if (
      (visionResult.category === "DRAINAGE_AND_FLOOD_PREVENTION" ||
        visionResult.defect_type === "ROAD_POTHOLE_HAZARD") &&
      weatherResult.isHeavyRainForecast
    ) {
      finalPriority = "CRITICAL";
    }

    // -------------------------------------------------------------
    // TOOL 4: contractor_work_order_generator() (Malaysian JKR Rates)
    // -------------------------------------------------------------
    const jkrRate = lookupJKRRate(visionResult.category, visionResult.defect_type);

    const workOrder: WorkOrder = {
      work_order_id: `WO-${newTicketId}`,
      contractor_id: `VND-${jkrRate.code.replace(/[^A-Z0-9]/g, "").slice(0, 8)}`,
      contractor_name: jkrRate.default_contractor,
      task_description: `${jkrRate.description} at ${precinct}`,
      estimated_materials: jkrRate.typical_materials,
      estimated_labor_hours: jkrRate.estimated_hours,
      estimated_cost_myr: jkrRate.rate_myr,
      jkr_code: jkrRate.code,
      status: "DISPATCHED",
      dispatch_timestamp: currentTimestamp,
    };

    // If duplicate within 50m, merge under primary ticket and update community counter
    if (clusterResult.isDuplicate && clusterResult.primaryIncident) {
      await incrementCommunityConfirmation(clusterResult.primaryIncident.ticket_id, newTicketId);

      return NextResponse.json({
        success: true,
        is_duplicate: true,
        message: `Report matched an existing active incident within ${Math.round(
          clusterResult.distanceMeters || 0
        )}m. Community urgency incremented to prevent duplicate contractor spam.`,
        primary_ticket_id: clusterResult.primaryIncident.ticket_id,
        distance_meters: clusterResult.distanceMeters,
        current_urgency_count:
          clusterResult.primaryIncident.agent_analysis.contextual_factors.duplicate_count_50m,
        primary_incident: clusterResult.primaryIncident,
      });
    }

    // Assemble new Primary Incident Ticket
    const newIncident: IncidentTicket = {
      ticket_id: newTicketId,
      township,
      precinct,
      coordinates,
      timestamp: currentTimestamp,
      reported_via,
      raw_input: {
        image_url:
          image_data && image_data.startsWith("http")
            ? image_data
            : "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
        text: text_description,
        reporter_name,
        contact_number,
      },
      agent_analysis: {
        category: visionResult.category,
        defect_type: visionResult.defect_type,
        confidence: visionResult.confidence,
        severity_score: visionResult.severity_score,
        priority: finalPriority,
        is_authentic: true,
        contextual_factors: {
          weather_alert: weatherResult.alertCode,
          rainfall_mm_per_h: weatherResult.upcomingPeakRainfallMm,
          duplicate_count_50m: 1,
          is_primary_incident: true,
          child_incident_ids: [],
        },
        summary_malay: visionResult.summary_malay,
        summary_english: visionResult.summary_english,
      },
      work_order: workOrder,
    };

    // Persist to store
    await saveIncident(newIncident);

    return NextResponse.json({
      success: true,
      is_duplicate: false,
      ticket: newIncident,
      weather_context: weatherResult,
      jkr_rate: jkrRate,
    });
  } catch (error: any) {
    console.error("Agentic copilot execution error:", error);
    return NextResponse.json(
      { error: "INTERNAL_AGENT_ERROR", message: error.message || "Failed to process incident" },
      { status: 500 }
    );
  }
}
