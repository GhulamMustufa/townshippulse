"use client";

import React from "react";
import { IncidentTicket, PriorityLevel } from "@/types/incident";
import {
  AlertCircle,
  Clock,
  Layers,
  Wrench,
  ChevronRight,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface IncidentFeedProps {
  incidents: IncidentTicket[];
  selectedIncident: IncidentTicket | null;
  onSelectIncident: (inc: IncidentTicket) => void;
  selectedPrecinct: string;
  onChangePrecinct: (p: string) => void;
  selectedPriority: string;
  onChangePriority: (pr: string) => void;
}

export default function IncidentFeed({
  incidents,
  selectedIncident,
  onSelectIncident,
  selectedPrecinct,
  onChangePrecinct,
  selectedPriority,
  onChangePriority,
}: IncidentFeedProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* FILTER BAR */}
      <div className="p-2.5 sm:p-3.5 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Incidents ({incidents.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <select
            value={selectedPrecinct}
            onChange={(e) => onChangePrecinct(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] sm:text-[11px] text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Precincts</option>
            <option value="Elmina Green">Elmina Green</option>
            <option value="Elmina Valley">Elmina Valley</option>
            <option value="Central Park">Central Park</option>
            <option value="Mokhtar Dahari">Persiaran M. Dahari</option>
            <option value="Bukit Raja">Bandar Bukit Raja</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => onChangePriority(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] sm:text-[11px] text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Priority</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* INCIDENT LIST */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No incidents found matching criteria.
          </div>
        ) : (
          incidents.map((inc) => {
            const isSelected = selectedIncident?.ticket_id === inc.ticket_id;
            const isCritical = inc.agent_analysis.priority === "CRITICAL";
            const isHigh = inc.agent_analysis.priority === "HIGH";
            const isResolved = inc.work_order?.status === "RESOLVED";
            const dups = inc.agent_analysis.contextual_factors.duplicate_count_50m || 1;

            return (
              <div
                key={inc.ticket_id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? "bg-slate-800/90 border-sky-500/70 shadow-lg shadow-sky-500/10"
                    : "bg-slate-900/40 hover:bg-slate-800/60 border-slate-800/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* PRIORITY BADGE */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isResolved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isCritical
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                          : isHigh
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                      {inc.agent_analysis.priority}
                    </span>

                    {/* 50M CLUSTER BADGE */}
                    {dups > 1 && (
                      <span className="text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                        <Layers className="w-2.5 h-2.5" />
                        +{dups - 1} Duplicates Merged
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-slate-400">
                      {inc.ticket_id}
                    </span>
                  </div>

                  {/* JKR RATE */}
                  {inc.work_order && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        RM {inc.work_order.estimated_cost_myr.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">JKR Rate</div>
                    </div>
                  )}
                </div>

                {/* DEFECT TITLE */}
                <div className="text-xs font-semibold text-slate-100 mb-0.5">
                  {inc.agent_analysis.defect_type.replace(/_/g, " ")}
                </div>

                {/* PRECINCT & TIME */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{inc.precinct}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* WEATHER ALERT NOTICE */}
                {inc.agent_analysis.contextual_factors.weather_alert && (
                  <div className="mt-1.5 text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                    <span>⚡ Weather Escalation:</span>
                    <span className="truncate">
                      {inc.agent_analysis.contextual_factors.weather_alert}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
