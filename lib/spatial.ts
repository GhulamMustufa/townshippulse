import { Coordinates, IncidentTicket } from "@/types/incident";

/**
 * Calculates the Haversine distance between two GPS coordinates in meters.
 */
export function calculateHaversineDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
}

export interface ClusterMatchResult {
  isDuplicate: boolean;
  distanceMeters: number | null;
  primaryIncident: IncidentTicket | null;
}

/**
 * Tool 2: spatial_cluster_detector()
 * Checks whether an existing active incident exists within the given radius (default 50 meters).
 */
export function detectSpatialCluster(
  newCoord: Coordinates,
  existingIncidents: IncidentTicket[],
  radiusMeters: number = 50.0
): ClusterMatchResult {
  let nearestDistance: number | null = null;
  let matchedIncident: IncidentTicket | null = null;

  for (const incident of existingIncidents) {
    const dist = calculateHaversineDistanceMeters(newCoord, incident.coordinates);
    if (dist <= radiusMeters) {
      if (nearestDistance === null || dist < nearestDistance) {
        nearestDistance = dist;
        matchedIncident = incident;
      }
    }
  }

  return {
    isDuplicate: matchedIncident !== null,
    distanceMeters: nearestDistance,
    primaryIncident: matchedIncident,
  };
}
