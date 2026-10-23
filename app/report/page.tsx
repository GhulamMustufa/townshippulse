"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  MapPin,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Wrench,
  ArrowLeft,
  RefreshCw,
  Layers,
  ShieldCheck,
  Mic,
  MicOff,
  Upload,
  Crosshair,
  Image as ImageIcon,
  ExternalLink,
  Clock,
} from "lucide-react";

interface PresetScenario {
  title: string;
  icon: string;
  category: string;
  precinct: string;
  lat: number;
  lng: number;
  text: string;
  imageUrl: string;
}

const PRESET_SCENARIOS_BM: PresetScenario[] = [
  {
    title: "Longkang Sumbat + Monsun",
    icon: "🌊",
    category: "Drainage",
    precinct: "Elmina Green 1",
    lat: 3.2032,
    lng: 101.5125,
    text: "Longkang besar sumbat dekat simpang Elmina Green 1, air dah mula melimpah naik ke jalan raya.",
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27e69c1?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Jalan Berlubang Bahaya",
    icon: "🕳️",
    category: "Roads",
    precinct: "Persiaran Mokhtar Dahari",
    lat: 3.1945,
    lng: 101.5123,
    text: "Lubang jalan sangat dalam selepas lampu isyarat menuju ke Elmina Valley. Sangat bahaya waktu malam.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Paip Bocor (Kluster 50m)",
    icon: "💧",
    category: "Water",
    precinct: "Elmina Valley 2",
    lat: 3.1865,
    lng: 101.5192,
    text: "Paip bawah tanah bocor di tepi jalan Elmina Valley 2/3. Air bersih membuak laju masuk longkang.",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Lampu Tiang Padam",
    icon: "💡",
    category: "Electrical",
    precinct: "Elmina Central Park",
    lat: 3.1992,
    lng: 101.5054,
    text: "Lampu tiang padam dekat trek jogging Central Park. Sangat gelap untuk aktiviti malam.",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
  },
];

const PRESET_SCENARIOS_EN: PresetScenario[] = [
  {
    title: "Clogged Culvert + Monsoon Alert",
    icon: "🌊",
    category: "Drainage",
    precinct: "Elmina Green 1",
    lat: 3.2032,
    lng: 101.5125,
    text: "Severe drainage clog at Elmina Green 1 junction, water overflowing onto main roadway during heavy rain.",
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27e69c1?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Dangerous Road Pothole",
    icon: "🕳️",
    category: "Roads",
    precinct: "Persiaran Mokhtar Dahari",
    lat: 3.1945,
    lng: 101.5123,
    text: "Deep pothole right after traffic light heading towards Elmina Valley. Very dangerous for motorcyclists.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Burst Pipe (Test 50m Cluster)",
    icon: "💧",
    category: "Water",
    precinct: "Elmina Valley 2",
    lat: 3.1865,
    lng: 101.5192,
    text: "Underground water pipe leaking along road shoulder of Elmina Valley 2/3. Clean water gushing into drain.",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Dark Streetlamp",
    icon: "💡",
    category: "Electrical",
    precinct: "Elmina Central Park",
    lat: 3.1992,
    lng: 101.5054,
    text: "Street light pole failed near Central Park jogging track. Very dark and unsafe for evening joggers.",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
  },
];

export default function ResidentReportPage() {
  const [lang, setLang] = useState<"BM" | "EN">("BM");
  const [precinct, setPrecinct] = useState("Elmina Green 1");
  const [coords, setCoords] = useState({ lat: 3.2032, lng: 101.5125 });
  const [description, setDescription] = useState(
    "Longkang besar sumbat dekat simpang Elmina Green 1, air dah mula melimpah naik ke jalan raya."
  );
  const [imagePreview, setImagePreview] = useState<string>(
    "https://images.unsplash.com/photo-1542314831-c6a4d27e69c1?w=800&auto=format&fit=crop&q=80"
  );
  const [reporterName, setReporterName] = useState("Faizal Rahman");
  const [contactNumber, setContactNumber] = useState("+6012-3849120");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // REAL AUDIO RECORDING / SPEECH RECOGNITION STATE
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // REAL CAMERA INPUT REF
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const presets = lang === "BM" ? PRESET_SCENARIOS_BM : PRESET_SCENARIOS_EN;

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = lang === "BM" ? "ms-MY" : "en-US"; // Dynamic BM / EN speech recognition

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recog.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, [lang]);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert("Voice speech recognition is not supported in this browser. Please type your description.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // REAL CAMERA CAPTURE / FILE UPLOAD HANDLER
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // REAL GEOLOCATION HANDLER
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        });
      },
      (err) => {
        console.warn("Location error:", err);
        // Default to City of Elmina center if blocked
        setCoords({ lat: 3.1970, lng: 101.5110 });
      }
    );
  };

  const applyPreset = (preset: PresetScenario) => {
    setPrecinct(preset.precinct);
    setCoords({ lat: preset.lat, lng: preset.lng });
    setDescription(preset.text);
    setImagePreview(preset.imageUrl);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: imagePreview,
          text_description: description,
          lat: coords.lat,
          lng: coords.lng,
          township: "City of Elmina",
          precinct,
          reporter_name: reporterName,
          contact_number: contactNumber,
          reported_via: "web_portal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process incident report.");
      }

      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      setError(err.message || "An error occurred while contacting the copilot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 flex flex-col justify-between">
      {/* HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ops Dashboard</span>
        </Link>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm tracking-tight">
            <span>🏙️ TownshipPulse</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
              LIVE MVP
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {lang === "BM" ? "Aduan Komuniti Tanpa Muat Turun" : "Zero-Download Resident Ingestion"}
          </div>
        </div>

        {/* 1-CLICK DUAL-LANGUAGE SWITCHER (BM / EN) */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setLang("BM")}
            className={`px-2 py-0.5 rounded transition ${
              lang === "BM"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Tukar ke Bahasa Melayu"
          >
            🇲🇾 BM
          </button>
          <button
            type="button"
            onClick={() => setLang("EN")}
            className={`px-2 py-0.5 rounded transition ${
              lang === "EN"
                ? "bg-sky-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Switch to English"
          >
            🇬🇧 EN
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col justify-center">
        {result ? (
          /* =========================================================
             CLEAN DEDICATED CONFIRMATION SCREEN (REPLACES FORM)
             Zero Clutter • Consumer Simplicity (Grab/Uber Style)
             ========================================================= */
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/10 space-y-5 animate-in zoom-in-95 duration-200">
            {/* SUCCESS ICON & TITLE */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 animate-in bounce-in duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {lang === "BM" ? "Aduan Berjaya Diterima!" : "Report Logged Successfully!"}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {lang === "BM"
                  ? "Ejen AI telah menyemak, mengesahkan lokasi, dan menyelaraskan aduan anda dalam masa < 4 saat."
                  : "AI copilot inspected, verified GPS coordinates, and triaged your complaint in < 4 seconds."}
              </p>
            </div>

            {/* OFFICIAL TICKET REFERENCE CARD */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  {lang === "BM" ? "No. Rujukan Tiket" : "Official Ticket Ref"}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  {result.is_duplicate ? result.primary_ticket_id : result.ticket?.ticket_id}
                </span>
              </div>

              {/* 50M SPATIAL DEDUPLICATION NOTICE (IF APPLICABLE) */}
              {result.is_duplicate ? (
                <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3 text-xs text-sky-300 flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      {lang === "BM" ? "Disatukan Bersama Komuniti!" : "Unified Community Priority!"}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {lang === "BM"
                        ? `Laporan anda telah digabungkan dengan ${result.current_urgency_count} aduan jiran dalam radius 50m. Ini mengelakkan panggilan berganda dan menaikkan aduan ini ke keutamaan teratas kontraktor.`
                        : `Your report was merged with ${result.current_urgency_count} neighbor confirmations within 50m. Boosted to top priority on the contractor queue without duplicate fees.`}
                    </div>
                  </div>
                </div>
              ) : (
                /* SINGLE TICKET SUMMARY */
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === "BM" ? "Kerosakan:" : "Defect:"}</span>
                    <span className="font-semibold text-slate-200">
                      {result.ticket?.agent_analysis.defect_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === "BM" ? "Presint:" : "Precinct:"}</span>
                    <span className="font-semibold text-slate-200">{precinct}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === "BM" ? "Kontraktor:" : "Contractor:"}</span>
                    <span className="font-semibold text-emerald-400">
                      {result.ticket?.work_order?.contractor_name || "Pasukan Tindakan Pantas"}
                    </span>
                  </div>
                </div>
              )}

              {/* SIMPLE 3-STEP RESOLUTION PROGRESS */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === "BM" ? "1. Laporan Disahkan AI (< 4s)" : "1. Verified by AI Copilot (< 4s)"}</span>
                </div>
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === "BM" ? "2. Kontraktor Ditugaskan (SLA: 2–4 Jam)" : "2. Contractor En Route (SLA: 2–4 Hrs)"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>{lang === "BM" ? "3. Pembaikan & SMS Pengesahan Siap" : "3. Completion & Resident SMS"}</span>
                </div>
              </div>
            </div>

            {/* WHAT TO DO NEXT: 2 CLEAR, PROMINENT BUTTONS */}
            <div className="space-y-2 pt-1">
              <Link
                href={`/?ticket=${result.is_duplicate ? result.primary_ticket_id : result.ticket?.ticket_id}`}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition active:scale-95 text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {lang === "BM" ? "🗺️ Pantau Langsung di Peta Operasi" : "🗺️ View Live on Township Map"}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setDescription("");
                  setImagePreview("");
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === "BM" ? "➕ Hantar Satu Lagi Aduan" : "➕ Submit Another Report"}</span>
              </button>
            </div>

            <div className="text-[10px] text-center text-slate-500 pt-1">
              {lang === "BM"
                ? `SMS pengesahan dihantar ke ${contactNumber}. Tiada muat turun aplikasi diperlukan.`
                : `Confirmation SMS dispatched to ${contactNumber}. No app download needed.`}
            </div>
          </div>
        ) : (
          /* =========================================================
             INPUT FORM STATE (Visible when not submitted)
             ========================================================= */
          <>
            {/* HERO BADGE */}
            <div className="bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-emerald-950/40 border border-slate-800 rounded-xl p-3.5 mb-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Operational Copilot</span>
              </div>
              <p className="text-xs text-slate-300">
                {lang === "BM"
                  ? "Ambil foto atau rakam suara. AI menyemak, mengelompok aduan bertindih, dan menghantar kontraktor < 5s."
                  : "Snap photo or record voice. AI inspects, clusters duplicates, and dispatches in < 5s."}
              </p>
            </div>

            {/* PRESET DEMO SCENARIOS */}
            <div className="mb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>
                  {lang === "BM"
                    ? "⚡ Contoh Aduan Segera (Untuk Juri)"
                    : "⚡ Instant Demo Presets (For Judges)"}
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {lang === "BM" ? "Ketik 1-Klik" : "1-Click Load"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded-lg p-2 text-left transition flex items-start gap-2 text-xs"
                  >
                    <span className="text-base">{p.icon}</span>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-200 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.precinct}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* REPORT FORM */}
            <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
              {/* REAL CAMERA & FILE UPLOAD */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    {lang === "BM" ? "Foto Kerosakan (Kamera / Muat Naik)" : "Defect Photo (Real Camera / Upload)"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {lang === "BM" ? "Pengecaman AI" : "Real Vision Ingestion"}
                  </span>
                </div>

                {/* HIDDEN NATIVE INPUTS */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* PREVIEW CONTAINER */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44 bg-slate-950 flex flex-col items-center justify-center group mb-2">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Defect Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-500 text-xs p-4 flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                      <span>{lang === "BM" ? "Tiada foto diambil lagi" : "No photo taken yet"}</span>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS FOR CAMERA & GALLERY */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{lang === "BM" ? "Ambil Foto" : "Snap Photo"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{lang === "BM" ? "Muat Naik Fail" : "Upload File"}</span>
                  </button>
                </div>
              </div>

              {/* PRECINCT & REAL GEOLOCATION */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === "BM" ? "Presint & Lokasi Perbandaran" : "Township Precinct & Location"}
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono font-semibold"
                  >
                    <Crosshair className="w-3 h-3" /> {lang === "BM" ? "Kesan GPS Saya" : "Detect My GPS"}
                  </button>
                </div>

                <select
                  value={precinct}
                  onChange={(e) => setPrecinct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Elmina Green 1">Elmina Green 1</option>
                  <option value="Elmina Green 2">Elmina Green 2</option>
                  <option value="Elmina Valley 1">Elmina Valley 1</option>
                  <option value="Elmina Valley 2">Elmina Valley 2</option>
                  <option value="Elmina Central Park">Elmina Central Park (300 Acres)</option>
                  <option value="Persiaran Mokhtar Dahari">Persiaran Mokhtar Dahari (Arterial)</option>
                  <option value="Bandar Bukit Raja">Bandar Bukit Raja (Klang)</option>
                </select>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                  <span>Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {lang === "BM" ? "Auto-Tag GPS" : "Auto-GPS Tagged"}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION + REAL VOICE RECORDING */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-300">
                  <span>{lang === "BM" ? "Huraian Kerosakan (BM / English)" : "Description (English / Malay)"}</span>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-800 text-slate-300 hover:text-emerald-400"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>
                      {isRecording
                        ? (lang === "BM" ? "Sedang Dengar (Ketik Berhenti)" : "Listening (Tap to Stop)")
                        : (lang === "BM" ? "Nota Suara" : "Voice Note")}
                    </span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === "BM"
                      ? "cth: Longkang sumbat air melimpah / Paip bocor di tepi jalan..."
                      : "e.g. Clogged drain overflowing / Pothole on main road..."
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>
                      {lang === "BM"
                        ? "Analisis Ejen AI Sedang Berjalan..."
                        : "Agent Reasoning in Progress..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>
                      {lang === "BM"
                        ? "Hantar Aduan ke TownshipPulse"
                        : "Submit Complaint to TownshipPulse"}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-4 bg-red-950/40 border border-red-800/80 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Validation Alert</div>
                  <div>{error}</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-3 text-[11px] text-slate-600 border-t border-slate-900">
        Sime Darby Property University Hackathon 2026 — Ghulam Mustafa
      </footer>
    </div>
  );
}
