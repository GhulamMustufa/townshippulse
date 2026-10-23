"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { IncidentTicket } from "@/types/incident";
import { ESGImpactMetrics } from "@/lib/incident-store";
import IncidentFeed from "@/components/IncidentFeed";
import ESGHeader from "@/components/ESGHeader";
import WorkOrderModal from "@/components/WorkOrderModal";
import JudgeQRModal from "@/components/JudgeQRModal";
import WhatsAppSimulator from "@/components/WhatsAppSimulator";
import {
  Sparkles,
  QrCode,
  CloudRain,
  Radio,
  ExternalLink,
  Presentation,
  RefreshCw,
  Building2,
  Clock,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";

// Dynamically import Leaflet map with SSR disabled
const TownshipMap = dynamic(() => import("@/components/TownshipMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
      Loading Township GIS Map...
    </div>
  ),
});

export default function OperationsCommandCenter() {
  const [incidents, setIncidents] = useState<IncidentTicket[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentTicket | null>(null);
  const [modalIncident, setModalIncident] = useState<IncidentTicket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // MULTI-TOWNSHIP SWITCHER STATE
  const [activeTownship, setActiveTownship] = useState<"City of Elmina" | "Bandar Bukit Raja">(
    "City of Elmina"
  );

  // MOBILE RESPONSIVE TAB VIEW (MAP VS FEED)
  const [mobileView, setMobileView] = useState<"map" | "feed">("map");

  const [selectedPrecinct, setSelectedPrecinct] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  const [esgMetrics, setEsgMetrics] = useState<ESGImpactMetrics>({
    waterSavedLiters: 140000,
    carbonAvoidedKg: 58.8,
    tripsEliminated: 240,
    preventedDamageOpexMyr: 70000,
    totalResolvedCount: 4,
    activeCriticalCount: 2,
  });

  const [currentTime, setCurrentTime] = useState("");
  const prevIncidentCountRef = useRef<number>(0);

  // SYNTHETIC RADAR OPERATIONAL CHIME
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (err) {
      console.warn("Audio chime disabled:", err);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      if (data.incidents) {
        if (
          prevIncidentCountRef.current > 0 &&
          data.incidents.length > prevIncidentCountRef.current
        ) {
          playAlertChime();
        }
        prevIncidentCountRef.current = data.incidents.length;
        setIncidents(data.incidents);
      }
      if (data.esg_metrics) {
        setEsgMetrics(data.esg_metrics);
      }
    } catch (e) {
      console.error("Failed to load incidents:", e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3500);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kuala_Lumpur",
        }) + " MYT"
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, [soundEnabled]);

  const ticketHandledRef = useRef<string | null>(null);

  // AUTO-SELECT INCIDENT WHEN REDIRECTED FROM /report (?ticket=ID)
  useEffect(() => {
    if (typeof window !== "undefined" && incidents.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get("ticket");
      if (ticketParam && ticketHandledRef.current !== ticketParam) {
        const found = incidents.find(
          (i) => i.ticket_id === ticketParam || i.work_order?.work_order_id === ticketParam
        );
        if (found) {
          ticketHandledRef.current = ticketParam;
          setSelectedIncident(found);
          setModalIncident(found);
          if (found.township === "Bandar Bukit Raja") {
            setActiveTownship("Bandar Bukit Raja");
          } else {
            setActiveTownship("City of Elmina");
          }
        }
      }
    }
  }, [incidents]);

  const handleSelectIncident = (inc: IncidentTicket) => {
    setSelectedIncident(inc);
    setModalIncident(inc);
  };

  const handleStatusUpdate = (ticketId: string, status: "DISPATCHED" | "RESOLVED") => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.ticket_id === ticketId && item.work_order) {
          return {
            ...item,
            work_order: {
              ...item.work_order,
              status,
            },
          };
        }
        return item;
      })
    );
    if (modalIncident && modalIncident.ticket_id === ticketId && modalIncident.work_order) {
      setModalIncident({
        ...modalIncident,
        work_order: {
          ...modalIncident.work_order,
          status,
        },
      });
    }
  };

  // Filter by active township and precinct
  const filteredIncidents = incidents.filter((inc) => {
    const matchTownship = inc.township === activeTownship;
    const matchPrecinct =
      selectedPrecinct === "ALL" ||
      inc.precinct.toLowerCase().includes(selectedPrecinct.toLowerCase());
    const matchPriority =
      selectedPriority === "ALL" || inc.agent_analysis.priority === selectedPriority;
    return matchTownship && matchPrecinct && matchPriority;
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070c18] text-slate-100">
      {/* TOP COMMAND HEADER */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-lg sm:text-xl">🏙️</span>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm tracking-tight text-white">
                <span>TownshipPulse</span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Ops
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block">
                Sime Darby Property × Kolaxus
              </div>
            </div>
          </div>

          {/* MULTI-TOWNSHIP SELECTOR (VISIBLE ON ALL SCREENS) */}
          <div className="flex items-center gap-1 ml-1 sm:ml-3 pl-1 sm:pl-3 border-l border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden xs:block" />
            <select
              value={activeTownship}
              onChange={(e) => {
                setActiveTownship(e.target.value as any);
                setSelectedPrecinct("ALL");
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[125px] sm:max-w-none truncate"
            >
              <option value="City of Elmina">City of Elmina (5k Ac)</option>
              <option value="Bandar Bukit Raja">Bandar Bukit Raja (4.3k Ac)</option>
            </select>
          </div>
        </div>

        {/* WEATHER TICKER & ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title={soundEnabled ? "Mute alert chime" : "Unmute alert chime"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* WEATHER RADAR TICKER (COMPACT ON MOBILE) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <CloudRain className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-amber-300 font-mono">
              {activeTownship === "City of Elmina"
                ? "Shah Alam: 31°C | Monsoon Alert 35mm/h"
                : "Klang: 32°C | Silt Basin Alert"}
            </span>
          </div>

          {/* SLIDES LINK */}
          <a
            href="/interactive_slides.html"
            target="_blank"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            title="Open Presentation Slides"
          >
            <Presentation className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Slides</span>
          </a>

          {/* JUDGE LIVE QR BUTTON */}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Judge Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </header>

      {/* ESG METRICS TICKER ROW */}
      <section className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <ESGHeader
          metrics={esgMetrics}
          weatherSummary={`${activeTownship} Meteorological Radar Active`}
        />
      </section>

      {/* MOBILE SEGMENTED VIEW TOGGLE (MAP VS FEED) */}
      <div className="lg:hidden px-3 pt-2 pb-1 bg-[#070c18] shrink-0">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileView === "map"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🗺️ GIS Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView("feed")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileView === "feed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📋 Live Feed ({filteredIncidents.length})</span>
          </button>
        </div>
      </div>

      {/* MAIN OPERATIONS INTERFACE (SPLIT VIEW ON DESKTOP, TABBED ON MOBILE) */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* INCIDENT FEED */}
        <section
          className={`lg:col-span-5 h-full overflow-hidden flex flex-col ${
            mobileView === "feed" ? "flex" : "hidden lg:flex"
          }`}
        >
          <IncidentFeed
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            selectedPrecinct={selectedPrecinct}
            onChangePrecinct={setSelectedPrecinct}
            selectedPriority={selectedPriority}
            onChangePriority={setSelectedPriority}
          />
        </section>

        {/* LEAFLET GIS MAP */}
        <section
          className={`lg:col-span-7 h-full overflow-hidden ${
            mobileView === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <TownshipMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            activeTownship={activeTownship}
          />
        </section>
      </main>

      {/* MODALS */}
      {modalIncident && (
        <WorkOrderModal
          incident={modalIncident}
          onClose={() => {
            setModalIncident(null);
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              if (url.searchParams.has("ticket")) {
                url.searchParams.delete("ticket");
                window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
              }
            }
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showQRModal && <JudgeQRModal onClose={() => setShowQRModal(false)} />}

      {/* FLOATING WHATSAPP CHAT SIMULATOR */}
      <WhatsAppSimulator />
    </div>
  );
}
