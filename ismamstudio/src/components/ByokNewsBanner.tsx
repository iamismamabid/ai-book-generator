"use client";

import React from "react";
import { Sparkles, Key, ArrowRight, Wand2 } from "lucide-react";

interface ByokNewsBannerProps {
  studioType: "cover" | "coloring";
  onOpenModal: () => void;
  variant?: "top-ribbon" | "sidebar-card" | "badge-chip";
}

export default function ByokNewsBanner({ studioType, onOpenModal, variant = "top-ribbon" }: ByokNewsBannerProps) {
  const isCover = studioType === "cover";

  if (variant === "badge-chip") {
    return (
      <button
        onClick={onOpenModal}
        title="AI Magic Studio (BYOK) — Generate unlimited high-res art"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-amber-200 transition-all shadow-sm cursor-pointer group"
      >
        <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform animate-pulse" />
        <span>AI MAGIC</span>
        <span className="px-1 py-0.2 text-[8px] bg-amber-500/20 rounded font-black text-amber-300">BYOK</span>
      </button>
    );
  }

  if (variant === "sidebar-card") {
    return (
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 text-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
        
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-wider">AI Magic Studio</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono">
            UNLIMITED BYOK
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug mb-3">
          {isCover
            ? "Turn simple words into 8K photorealistic book covers, cinematic backdrops, and fantasy artwork at direct raw API cost."
            : "Transform text prompts into crisp 300 DPI vector line art, intricate mandalas & coloring pages with zero platform limits."}
        </p>

        <button
          onClick={onOpenModal}
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3 h-3" /> Open AI Magic Studio
        </button>
      </div>
    );
  }

  // Default: top-ribbon
  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-xs select-none">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> AI MAGIC
        </span>
        <span className="text-[11px] text-slate-200 truncate font-medium">
          <strong className="text-white font-bold">Infinite AI Magic (BYOK):</strong>{" "}
          {isCover
            ? "Generate 8K book covers & cinematic landscapes with OpenAI, Gemini, or Stability at zero platform markups."
            : "Generate unlimited 300 DPI vector line art & coloring pages with your own API keys at raw provider cost."}
        </span>
      </div>

      <button
        onClick={onOpenModal}
        className="flex-shrink-0 ml-3 text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
      >
        <span>Explore Magic</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
