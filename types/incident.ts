export type DefectCategory =
  | "DRAINAGE_AND_FLOOD_PREVENTION"
  | "ROAD_AND_PAVEMENT"
  | "STREETLIGHTING_AND_ELECTRICAL"
  | "WATER_RETICULATION_AND_PLUMBING"
  | "LANDSCAPING_AND_PARKS"
  | "OTHER";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RawInput {
  image_url: string;
  text: string;
  voice_transcript?: string;
  reporter_name?: string;
  contact_number?: string;
}

export interface ContextualFactors {
  weather_alert?: string;
  rainfall_mm_per_h?: number;
  duplicate_count_50m: number;
  is_primary_incident: boolean;
  child_incident_ids?: string[];
  distance_to_nearest_m?: number;
}

export interface AgentAnalysis {
  category: DefectCategory;
  defect_type: string;
  confidence: number;
  severity_score: number; // 1 to 10
  priority: PriorityLevel;
  is_authentic: boolean;
  rejection_reason?: string;
  contextual_factors: ContextualFactors;
  summary_malay: string;
  summary_english: string;
}

export interface WorkOrder {
  work_order_id: string;
  contractor_id: string;
  contractor_name: string;
  task_description: string;
  estimated_materials: string[];
  estimated_labor_hours: number;
  estimated_cost_myr: number;
  jkr_code: string;
  status: "DRAFTED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  dispatch_timestamp: string;
}

export interface IncidentTicket {
  ticket_id: string;
  township: string;
  precinct: string;
  coordinates: Coordinates;
  timestamp: string;
  reported_via: "whatsapp_bot" | "web_portal";
  raw_input: RawInput;
  agent_analysis: AgentAnalysis;
  work_order?: WorkOrder;
}

export interface JKRRateItem {
  code: string;
  category: DefectCategory;
  defect_type: string;
  description: string;
  unit: string;
  rate_myr: number;
  default_contractor: string;
  typical_materials: string[];
  estimated_hours: number;
}
