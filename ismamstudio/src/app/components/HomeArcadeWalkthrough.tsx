"use client";

import { useState } from "react";
import { Grid3x3, Palette } from "lucide-react";

export default function HomeArcadeWalkthrough() {
  const [activeVideoTab, setActiveVideoTab] = useState<"interior" | "cover">("interior");

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-[2.5rem] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04),0_24px_48px_rgba(15,23,42,0.06)] overflow-hidden animate-float">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => setActiveVideoTab("interior")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
              activeVideoTab === "interior"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "text-slate-600 hover:text-slate-900"
            }`}
            aria-label="Switch to Interior Studio Demo"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            Interior Studio
          </button>
          <button
            onClick={() => setActiveVideoTab("cover")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
              activeVideoTab === "cover"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "text-slate-600 hover:text-slate-900"
            }`}
            aria-label="Switch to Cover Studio Demo"
          >
            <Palette className="w-3.5 h-3.5" />
            Cover Studio
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Interactive Preview
        </span>
      </div>

      {/* Showcase Player */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner relative group">
        <iframe
          src={
            activeVideoTab === "interior"
              ? "https://app.arcade.software/share/zwSHISc2CSSG683DpmUh"
              : "https://app.arcade.software/share/VevNAwGPFIYsVGMX1yML"
          }
          title="KDPage Interactive Walkthrough"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Footer Tip */}
      <p className="text-[10px] text-center text-slate-500 mt-3 font-semibold font-sans">
        💡 Click on the hotspots inside the interactive video to try the layout engine!
      </p>
    </div>
  );
}
