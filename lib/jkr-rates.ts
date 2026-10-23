import { JKRRateItem, DefectCategory } from "@/types/incident";

export const JKR_RATES_DATABASE: JKRRateItem[] = [
  {
    code: "JKR-DRN-402",
    category: "DRAINAGE_AND_FLOOD_PREVENTION",
    defect_type: "HEAVY_SILT_AND_DEBRIS_BLOCKAGE",
    description: "High-pressure jetting, clearing silt, plastic waste and unblocking roadside culvert/drain (up to 600mm dia)",
    unit: "per location",
    rate_myr: 350.0,
    default_contractor: "Selangor EcoDrain & Hydraulic Services",
    typical_materials: ["Water Jetting Machine", "Waste Suction Tanker", "Waste Disposal Skip"],
    estimated_hours: 2.5,
  },
  {
    code: "JKR-DRN-405",
    category: "DRAINAGE_AND_FLOOD_PREVENTION",
    defect_type: "COLLAPSED_DRAIN_WALL",
    description: "Reconstruction of damaged precast concrete drain block (1.2m section) including excavation and cement bedding",
    unit: "per section",
    rate_myr: 850.0,
    default_contractor: "Elmina Infrastructure Maintenance Sdn Bhd",
    typical_materials: ["Precast U-Drain 600mm", "Class C20 Concrete", "Steel Reinforcement Mesh"],
    estimated_hours: 6.0,
  },
  {
    code: "JKR-RD-102",
    category: "ROAD_AND_PAVEMENT",
    defect_type: "ROAD_POTHOLE_HAZARD",
    description: "Saw-cutting edges, applying bitumen tack coat, and compacting hot/cold mix asphalt wearing course up to 2m²",
    unit: "per patch",
    rate_myr: 420.0,
    default_contractor: "Guthrie Paving & Civil Works",
    typical_materials: ["Asphalt Premix 50mm", "Bituminous Tack Coat", "Vibratory Plate Compactor"],
    estimated_hours: 2.0,
  },
  {
    code: "JKR-RD-108",
    category: "ROAD_AND_PAVEMENT",
    defect_type: "CRACKED_KERB_AND_WALKWAY",
    description: "Removal and replacement of broken interlocking concrete paver or cast-in-situ road kerb up to 3 meters",
    unit: "per 3m span",
    rate_myr: 290.0,
    default_contractor: "Guthrie Paving & Civil Works",
    typical_materials: ["Standard Precast Kerb Unit", "Cement Sand Mortar 1:3"],
    estimated_hours: 3.0,
  },
  {
    code: "JKR-EL-201",
    category: "STREETLIGHTING_AND_ELECTRICAL",
    defect_type: "NON_FUNCTIONAL_STREETLIGHT",
    description: "Testing underground supply, replacement of faulty 120W LED luminaire head and 7-pin photocell sensor",
    unit: "per pole",
    rate_myr: 280.0,
    default_contractor: "Tenaga Elmina Engineering",
    typical_materials: ["120W LED IP66 Luminaire Head", "NEMA Photocell Sensor", "Sky-lift Crane Truck"],
    estimated_hours: 1.5,
  },
  {
    code: "JKR-WTR-301",
    category: "WATER_RETICULATION_AND_PLUMBING",
    defect_type: "BURST_RETICULATION_PIPE",
    description: "Excavation, localized isolation, and installation of stainless steel wrap-around repair clamp on HDPE/uPVC pipe",
    unit: "per joint",
    rate_myr: 650.0,
    default_contractor: "Air Selangor Panel Specialist (Zone Elmina)",
    typical_materials: ["SS304 Pipe Repair Clamp 150mm", "Backfill Sand Bedding", "Safety Barrier Set"],
    estimated_hours: 4.0,
  },
  {
    code: "JKR-LND-501",
    category: "LANDSCAPING_AND_PARKS",
    defect_type: "FALLEN_TREE_BRANCH_OBSTRUCTION",
    description: "Emergency chainsaw sectioning of fallen tree limb obstructing road or jogging track, debris removal to landfill",
    unit: "per operation",
    rate_myr: 260.0,
    default_contractor: "Elmina Central Park Horticultural Care",
    typical_materials: ["Heavy Duty Chainsaw", "Wood Chipper", "3-Ton Disposal Truck"],
    estimated_hours: 2.0,
  },
];

export function lookupJKRRate(category: DefectCategory, defectType: string): JKRRateItem {
  const match = JKR_RATES_DATABASE.find(
    (item) => item.category === category || item.defect_type.toLowerCase() === defectType.toLowerCase()
  );

  if (match) return match;

  // Fallback default rate
  return {
    code: "JKR-GEN-999",
    category: category,
    defect_type: defectType,
    description: `Standard general inspection & localized restorative civil works for ${defectType}`,
    unit: "per incident",
    rate_myr: 300.0,
    default_contractor: "Elmina General Maintenance Team",
    typical_materials: ["General Civil Consumables", "Inspection Checklist"],
    estimated_hours: 2.0,
  };
}
