"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function GlowSettingToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("geminiGlowEnabled");
      setEnabled(saved === "true");
    }
  }, []);

  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    localStorage.setItem("geminiGlowEnabled", nextState ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("geminiGlowToggle", { detail: { enabled: nextState } })
    );
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
        enabled
          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm"
          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      }`}
      title="Toggle Gemini Click & Screen Glow Rays (Default: OFF)"
    >
      <Sparkles className={`w-3.5 h-3.5 ${enabled ? "text-indigo-400 animate-pulse" : "text-slate-500"}`} />
      <span>Gemini Glow Effects: <strong className={enabled ? "text-indigo-400" : "text-slate-500"}>{enabled ? "ON" : "OFF"}</strong></span>
    </button>
  );
}
