"use client";

import React, { useEffect, useRef } from "react";
import { IncidentTicket } from "@/types/incident";

interface TownshipMapProps {
  incidents: IncidentTicket[];
  selectedIncident: IncidentTicket | null;
  onSelectIncident: (inc: IncidentTicket) => void;
  activeTownship: string; // "City of Elmina" or "Bandar Bukit Raja"
}

export default function TownshipMap({
  incidents,
  selectedIncident,
  onSelectIncident,
  activeTownship,
}: TownshipMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const polygonsRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically import Leaflet on client-side
    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return; // Map already initialized

      // Fix standard leaflet icon path issues in React
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current) return;
      const elminaCenter: [number, number] = [3.1970, 101.5110];

      const map = L.map(mapContainerRef.current, {
        center: elminaCenter,
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // ESRI ArcGIS World Dark Gray Canvas (100% Free, Zero API Key, Zero Watermarks)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap contributors',
          maxZoom: 16,
        }
      ).addTo(map);

      // ESRI Dark Gray Reference Labels (Road names, street labels)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update precinct polygons & camera position when activeTownship changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Remove existing polygons
      polygonsRef.current.forEach((poly) => poly.remove());
      polygonsRef.current = [];

      if (activeTownship === "Bandar Bukit Raja") {
        // Fly smoothly across Selangor to Klang (Bandar Bukit Raja)
        map.flyTo([3.0830, 101.4450], 14, { duration: 1.8 });

        // Bandar Bukit Raja Industrial Gateway 16 Polygon
        const bbrGateway16: [number, number][] = [
          [3.0880, 101.4380],
          [3.0910, 101.4470],
          [3.0820, 101.4490],
          [3.0810, 101.4400],
        ];
        const p1 = L.polygon(bbrGateway16, {
          color: "#f59e0b",
          fillColor: "#f59e0b",
          fillOpacity: 0.12,
          weight: 1.5,
        }).bindTooltip("🏭 Gateway 16 Industrial Park (Bandar Bukit Raja)", { sticky: true }).addTo(map);
        polygonsRef.current.push(p1);

        // Retention Pond Wetland Basin Polygon
        const bbrWetland: [number, number][] = [
          [3.0830, 101.4450],
          [3.0850, 101.4520],
          [3.0780, 101.4530],
          [3.0760, 101.4460],
        ];
        const p2 = L.polygon(bbrWetland, {
          color: "#38bdf8",
          fillColor: "#38bdf8",
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: "3, 5",
        }).bindTooltip("💧 BBR Central Retention Basin (125 Acres)", { sticky: true }).addTo(map);
        polygonsRef.current.push(p2);

      } else {
        // Fly to City of Elmina (Shah Alam)
        map.flyTo([3.1970, 101.5110], 14, { duration: 1.8 });

        // 1. Elmina Central Park (300-Acre Master Park & Lake)
        const centralParkPolygon: [number, number][] = [
          [3.2020, 101.5030],
          [3.2040, 101.5070],
          [3.1980, 101.5090],
          [3.1950, 101.5050],
          [3.1970, 101.5020],
        ];
        const p1 = L.polygon(centralParkPolygon, {
          color: "#10b981",
          fillColor: "#10b981",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "3, 5",
        }).bindTooltip("🌿 Elmina Central Park (300 Acres)", { sticky: true }).addTo(map);
        polygonsRef.current.push(p1);

        // 2. Elmina Green Precinct
        const elminaGreenPolygon: [number, number][] = [
          [3.2060, 101.5100],
          [3.2085, 101.5160],
          [3.2010, 101.5175],
          [3.2000, 101.5115],
        ];
        const p2 = L.polygon(elminaGreenPolygon, {
          color: "#38bdf8",
          fillColor: "#38bdf8",
          fillOpacity: 0.08,
          weight: 1.5,
        }).bindTooltip("🏡 Elmina Green 1 & 2 Precinct", { sticky: true }).addTo(map);
        polygonsRef.current.push(p2);

        // 3. Elmina Valley Precinct
        const elminaValleyPolygon: [number, number][] = [
          [3.1920, 101.5140],
          [3.1930, 101.5220],
          [3.1840, 101.5240],
          [3.1830, 101.5160],
        ];
        const p3 = L.polygon(elminaValleyPolygon, {
          color: "#f59e0b",
          fillColor: "#f59e0b",
          fillOpacity: 0.08,
          weight: 1.5,
        }).bindTooltip("🏡 Elmina Valley 1–5 Precinct", { sticky: true }).addTo(map);
        polygonsRef.current.push(p3);
      }
    });
  }, [activeTownship]);

  // Update incident markers when incidents prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      incidents.forEach((inc) => {
        const isCritical = inc.agent_analysis.priority === "CRITICAL";
        const isHigh = inc.agent_analysis.priority === "HIGH";
        const isResolved = inc.work_order?.status === "RESOLVED";

        let markerColor = "#38bdf8"; // Blue (Medium)
        if (isResolved) markerColor = "#10b981"; // Green (Resolved)
        else if (isCritical) markerColor = "#ef4444"; // Red (Critical)
        else if (isHigh) markerColor = "#f59e0b"; // Amber (High)

        const dups = inc.agent_analysis.contextual_factors.duplicate_count_50m || 1;
        const hasCluster = dups > 1;

        const customIcon = L.divIcon({
          className: "custom-incident-pin",
          html: `
            <div style="position:relative; display:flex; align-items:center; justify-content:center;">
              ${
                isCritical
                  ? `<div style="position:absolute; width:36px; height:36px; border-radius:50%; background:${markerColor}; opacity:0.35; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ""
              }
              <div style="
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: ${markerColor};
                border: 2px solid #ffffff;
                box-shadow: 0 0 14px ${markerColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-weight: 800;
                font-size: 11px;
                font-family: monospace;
              ">
                ${hasCluster ? dups : "•"}
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
          icon: customIcon,
        }).addTo(map);

        const popupContent = `
          <div style="font-family:system-ui,sans-serif; min-width:210px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:10px; font-weight:800; color:${markerColor}; text-transform:uppercase;">
                ${inc.agent_analysis.priority} ${isCritical ? "⚡" : ""}
              </span>
              <span style="font-size:10px; font-family:monospace; color:#94a3b8;">${inc.ticket_id}</span>
            </div>
            <div style="font-size:12px; font-weight:700; color:#fff; margin-bottom:4px;">
              ${inc.agent_analysis.defect_type.replace(/_/g, " ")}
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:8px;">
              ${inc.precinct} (${inc.township})
            </div>
            ${
              hasCluster
                ? `<div style="font-size:10px; background:rgba(56,189,248,0.15); color:#38bdf8; padding:3px 6px; border-radius:4px; margin-bottom:8px; font-weight:600;">
                     ⚡ 50m Spatial Cluster: ${dups} Reports Merged
                   </div>`
                : ""
            }
            ${
              inc.work_order
                ? `<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px; font-size:11px;">
                     <span style="color:#94a3b8;">JKR Rate:</span>
                     <b style="color:#10b981; font-family:monospace;">RM ${inc.work_order.estimated_cost_myr.toFixed(2)}</b>
                   </div>`
                : ""
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => onSelectIncident(inc));
        markersRef.current[inc.ticket_id] = marker;
      });
    });
  }, [incidents, onSelectIncident]);

  // Pan to selected incident if any
  useEffect(() => {
    if (!selectedIncident || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedIncident.coordinates.lat, selectedIncident.coordinates.lng],
      16,
      { duration: 1.2 }
    );
    const marker = markersRef.current[selectedIncident.ticket_id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* MAP LEGEND OVERLAY */}
      <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md z-10 text-[11px] space-y-1.5 shadow-lg">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
          {activeTownship} GIS Pins
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
          <span className="text-slate-300">Critical (Monsoon Storm Alert)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">High Priority Pothole / Rutting</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span className="text-slate-300">Medium (Streetlight / Silt)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Resolved / Contractor Verified</span>
        </div>
      </div>
    </div>
  );
}
