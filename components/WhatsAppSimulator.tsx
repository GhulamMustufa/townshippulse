"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, CheckCheck, Sparkles, Image, ShieldCheck, MapPin } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  imageUrl?: string;
}

export default function WhatsAppSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Selamat pagi! 🏙️ Ini adalah Khidmat Aduan Automatik TownshipPulse untuk Perbandaran Sime Darby Property. Sila hantar foto kerosakan (longkang, jalan berlubang, lampu padam) atau taip aduan anda.",
      time: "09:14",
    },
  ]);

  const handleSend = async (textToSend?: string, customImage?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Connect to Real TownshipPulse Autonomous Agent Backend
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_description: text,
          image_data: customImage,
          lat: 3.2032,
          lng: 101.5125,
          township: "City of Elmina",
          precinct: "Elmina Green 1",
          reported_via: "whatsapp_bot",
          reporter_name: "Resident (WhatsApp)",
          contact_number: "+6012-3849120",
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      // Check whether user query is English or Malay
      const textLower = text.toLowerCase();
      const enKeywords = ["pipe", "burst", "leak", "pothole", "street", "light", "drain", "water", "road", "broken", "overflow", "culvert", "lamp", "flood", "help"];
      const bmKeywords = ["longkang", "sumbat", "bocor", "paip", "lubang", "lampu", "rosak", "air", "jalan", "gelap", "hujan", "melimpah", "tolong"];
      let enScore = 0;
      let bmScore = 0;
      enKeywords.forEach((k) => { if (textLower.includes(k)) enScore += 2; });
      bmKeywords.forEach((k) => { if (textLower.includes(k)) bmScore += 2; });
      const isEnglish = enScore > bmScore;

      let botReply = "";

      if (!res.ok) {
        botReply = isEnglish
          ? `⚠️ ATTENTION: ${
              data.message ||
              "Could not process report. Please specify location and defect type (e.g. drainage, pipe burst, or pothole)."
            }`
          : `⚠️ PERINGATAN: ${
              data.message ||
              "Aduan tidak dapat diproses. Sila nyatakan lokasi dan jenis kerosakan fizikal seperti longkang, paip, atau jalan berlubang."
            }`;
      } else if (data.is_duplicate) {
        botReply = isEnglish
          ? `✅ COMPLAINT RECORDED: #${data.primary_ticket_id} (SPATIAL MERGE)\n━━━━━━━━━━━━━━━━━━━━\n📍 Location: Elmina Green 1 (~${Math.round(
              data.distance_meters || 0
            )}m from active report)\n⚡ Community Urgency: ${
              data.current_urgency_count
            } neighbor reports unified!\n\nℹ️ System auto-merged your report into an active 50m cluster to prevent contractor duplicate callout charges and accelerate resolution.`
          : `✅ ADUAN DITERIMA: #${data.primary_ticket_id} (GABUNGAN AUTOMATIK)\n━━━━━━━━━━━━━━━━━━━━\n📍 Lokasi: Elmina Green 1 (~${Math.round(
              data.distance_meters || 0
            )}m dari aduan sedia ada)\n⚡ Urgensi Komuniti: ${
              data.current_urgency_count
            } aduan jiran disatukan!\n\nℹ️ Sistem telah menggabungkan laporan anda dengan aduan sedia ada dalam radius 50m untuk mengelakkan spam kontraktor dan mempercepatkan tindakan kerja.`;
      } else if (data.ticket) {
        const t = data.ticket;
        const wo = t.work_order;

        if (isEnglish) {
          const weatherNotice = t.agent_analysis.contextual_factors.weather_alert
            ? `\n🌧️ Weather Alert: ${t.agent_analysis.contextual_factors.weather_alert}`
            : "";

          botReply = `✅ OFFICIAL COMPLAINT RECEIVED: #${t.ticket_id}\n━━━━━━━━━━━━━━━━━━━━\n📍 Precinct: ${
            t.precinct
          }, ${t.township}\n🛠️ Category: ${t.agent_analysis.category.replace(
            /_/g,
            " "
          )}\n⚡ Priority: ${t.agent_analysis.priority} (Severity: ${
            t.agent_analysis.severity_score
          }/10)${weatherNotice}\n👷 Assigned Contractor: ${
            wo?.contractor_name || "Rapid Response Team"
          }\n💰 JKR Schedule Rate: RM ${
            wo?.estimated_cost_myr ? wo.estimated_cost_myr.toFixed(2) : "350.00"
          }\n\n📝 AI Summary: ${
            t.agent_analysis.summary_english || t.agent_analysis.summary_malay
          }\n\nTicket routed instantly to Sime Darby Central Operations Command Center.`;
        } else {
          const weatherNotice = t.agent_analysis.contextual_factors.weather_alert
            ? `\n🌧️ Amaran Cuaca: ${t.agent_analysis.contextual_factors.weather_alert}`
            : "";

          botReply = `✅ ADUAN RASMI DITERIMA: #${t.ticket_id}\n━━━━━━━━━━━━━━━━━━━━\n📍 Presint: ${
            t.precinct
          }, ${t.township}\n🛠️ Kategori: ${t.agent_analysis.category.replace(
            /_/g,
            " "
          )}\n⚡ Keutamaan: ${t.agent_analysis.priority} (Skor: ${
            t.agent_analysis.severity_score
          }/10)${weatherNotice}\n👷 Kontraktor: ${
            wo?.contractor_name || "Pasukan Tindakan Pantas"
          }\n💰 Anggaran JKR: RM ${
            wo?.estimated_cost_myr ? wo.estimated_cost_myr.toFixed(2) : "350.00"
          }\n\n📝 Ringkasan: ${t.agent_analysis.summary_malay}\n\nTiket telah dihantar terus ke Papan Pemuka Operasi Pusat Sime Darby.`;
        }
      } else {
        botReply = isEnglish
          ? `✅ COMPLAINT RECEIVED: #${data.primary_ticket_id || "ELM-2026"}\nYour report has been processed and synced to Township Operations Map.`
          : `✅ ADUAN DITERIMA: #${data.primary_ticket_id || "ELM-2026"}\nLaporan anda telah diproses dan diselaraskan ke Peta Operasi Perbandaran.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "⚠️ Maaf, terdapat ralat sambungan sementara ke pelayan pusat. Sila cuba sebentar lagi.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <>
      {/* FLOATING WHATSAPP BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 sm:p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20 transition transform hover:scale-105 active:scale-95 group"
          title="Test Resident WhatsApp Ingestion"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold font-sans pr-1 hidden sm:inline-block">
            WhatsApp Bot Demo
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-ping absolute top-1 right-1"></span>
        </button>
      )}

      {/* WHATSAPP CHAT DRAWER */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-96 h-[480px] sm:h-[520px] max-h-[90vh] bg-[#0b141a] text-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col font-sans animate-in slide-in-from-bottom-5 duration-200">
          {/* WHATSAPP TOP BAR */}
          <div className="bg-[#1f2c34] p-3.5 flex items-center justify-between border-b border-slate-700/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                🏙️
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>TownshipPulse Ops</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Autonomous AI Agent • online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#0b141a] bg-opacity-95 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed whitespace-pre-wrap shadow-md ${
                    m.sender === "user"
                      ? "bg-[#005c4b] text-white rounded-tr-none"
                      : "bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40"
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                      m.sender === "user" ? "text-emerald-300" : "text-slate-400"
                    }`}
                  >
                    <span>{m.time}</span>
                    {m.sender === "user" && <CheckCheck className="w-3 h-3 text-sky-400" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 bg-[#202c33] text-slate-400 px-3 py-1.5 rounded-full w-fit text-[11px] animate-pulse">
                <span>TownshipPulse is typing...</span>
              </div>
            )}
          </div>

          {/* QUICK PROMPT CHIPS (BM & EN TEST CHIPS) */}
          <div className="px-3 py-1.5 bg-[#1f2c34]/70 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] shrink-0">
            <button
              type="button"
              onClick={() =>
                handleSend(
                  "Longkang tersumbat dekat simpang Elmina Green 1, air dah mula melimpah naik ke jalan.",
                  "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80"
                )
              }
              className="bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full whitespace-nowrap active:scale-95 transition"
              title="Test Bahasa Melayu Drainage Complaint"
            >
              🌊 Longkang (BM)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSend(
                  "High pressure clean water pipe burst along road shoulder at Elmina Valley 2, water gushing rapidly.",
                  "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop&q=80"
                )
              }
              className="bg-[#202c33] hover:bg-[#2a3942] text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full whitespace-nowrap active:scale-95 transition"
              title="Test English Pipe Burst Complaint"
            >
              🚰 Pipe Burst (EN)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSend(
                  "Ada lubang jalan sangat dalam dekat Persiaran Mokhtar Dahari, bahaya gila untuk motor.",
                  "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                )
              }
              className="bg-[#202c33] hover:bg-[#2a3942] text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full whitespace-nowrap active:scale-95 transition"
              title="Test Bahasa Melayu Pothole Complaint"
            >
              🕳️ Jalan Berlubang (BM)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSend(
                  "Streetlight pole completely dark along Central Park jogging loop, very dangerous at night.",
                  "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80"
                )
              }
              className="bg-[#202c33] hover:bg-[#2a3942] text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full whitespace-nowrap active:scale-95 transition"
              title="Test English Streetlight Complaint"
            >
              💡 Dark Streetlamp (EN)
            </button>
          </div>

          {/* INPUT BAR */}
          <div className="p-2.5 bg-[#1f2c34] border-t border-slate-700/80 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type complaint in Malay or English..."
              className="flex-1 bg-[#2a3942] border-none text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#25D366]"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white p-2 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
