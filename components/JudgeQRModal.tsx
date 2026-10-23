"use client";

import React, { useState } from "react";
import { X, QrCode, Smartphone, Sparkles, Check, Copy, ExternalLink } from "lucide-react";

interface JudgeQRModalProps {
  onClose: () => void;
}

export default function JudgeQRModal({ onClose }: JudgeQRModalProps) {
  const [copied, setCopied] = useState(false);
  const reportUrl = typeof window !== "undefined" ? `${window.location.origin}/report` : "http://localhost:3000/report";

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          Judge Live Interactive Demo
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Scan with your smartphone to test the zero-download resident copilot live.
        </p>

        {/* QR CODE BOX */}
        <div className="bg-white p-4 rounded-2xl shadow-inner mx-auto w-48 h-48 flex items-center justify-center mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              reportUrl
            )}`}
            alt="Scan QR for Resident Portal"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2 mb-4 text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              1
            </span>
            <span>Point phone camera at this QR code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              2
            </span>
            <span>Zero app download: page opens instantly</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              3
            </span>
            <span>Tap any demo card & watch dashboard update!</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Link!" : "Copy Link"}</span>
          </button>

          <a
            href="/report"
            target="_blank"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Tab</span>
          </a>
        </div>
      </div>
    </div>
  );
}
