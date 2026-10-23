"use client";

import React from "react";
import { ESGImpactMetrics } from "@/lib/incident-store";
import { Droplet, Leaf, ShieldAlert, Zap, CloudLightning } from "lucide-react";

interface ESGHeaderProps {
  metrics: ESGImpactMetrics;
  weatherSummary: string;
}

export default function ESGHeader({ metrics, weatherSummary }: ESGHeaderProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {/* WATER CONSERVATION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
            Water Saved
          </div>
          <div className="text-sm sm:text-lg font-bold font-mono text-white truncate">
            {metrics.waterSavedLiters.toLocaleString()}{" "}
            <span className="text-[10px] sm:text-xs text-sky-400 font-normal">L</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate hidden xs:block">Early pipe triage</div>
        </div>
      </div>

      {/* CARBON EMISSIONS AVOIDED */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
            Decarbonization
          </div>
          <div className="text-sm sm:text-lg font-bold font-mono text-white truncate">
            {metrics.tripsEliminated}{" "}
            <span className="text-[10px] sm:text-xs text-emerald-400 font-normal">Trips</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate hidden xs:block">
            ~{metrics.carbonAvoidedKg} kg CO₂e
          </div>
        </div>
      </div>

      {/* PREVENTED FLOOD OPEX */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
            OPEX Avoided
          </div>
          <div className="text-sm sm:text-lg font-bold font-mono text-white truncate">
            RM {(metrics.preventedDamageOpexMyr / 1000).toFixed(0)}k+
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate hidden xs:block">Flood prevention</div>
        </div>
      </div>

      {/* DISPATCH LATENCY */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
            Dispatch Speed
          </div>
          <div className="text-sm sm:text-lg font-bold font-mono text-teal-400 truncate">
            &lt; 3.8s
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate hidden xs:block">Photo ➔ JKR Order</div>
        </div>
      </div>
    </div>
  );
}
