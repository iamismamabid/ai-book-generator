"use client";

import { useState } from "react";
import { Grid3x3, Palette, Play } from "lucide-react";
import {
  INTERIOR_DEMO_YOUTUBE_ID,
  COVER_DEMO_YOUTUBE_ID,
  getYouTubeEmbedUrl,
} from "@/lib/videoConfig";

export default function HomeArcadeWalkthrough() {
  const [activeVideoTab, setActiveVideoTab] = useState<"interior" | "cover">("interior");

  const currentVideoId =
    activeVideoTab === "interior"
      ? INTERIOR_DEMO_YOUTUBE_ID
      : COVER_DEMO_YOUTUBE_ID;

  // Autoplay + Mute ensures instant start across all browsers without requiring user click
  const embedUrl = getYouTubeEmbedUrl(currentVideoId, true, true);

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04),0_24px_48px_rgba(15,23,42,0.06)] overflow-hidden animate-float">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveVideoTab("interior")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
              activeVideoTab === "interior"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            aria-label="Switch to Interior Studio Video"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            Interior Studio
          </button>
          <button
            onClick={() => setActiveVideoTab("cover")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
              activeVideoTab === "cover"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            aria-label="Switch to Cover Studio Video"
          >
            <Palette className="w-3.5 h-3.5" />
            Cover Studio
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <Play className="w-2.5 h-2.5 fill-red-600" />
          Live Demo
        </span>
      </div>

      {/* YouTube Showcase Player */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner relative group">
        <iframe
          key={`${activeVideoTab}-${currentVideoId}`}
          src={embedUrl}
          title="KDPage Studio Video Walkthrough"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
        />
      </div>

      {/* Footer Tip */}
      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-3 font-semibold font-sans">
        🔊 Video autoplays muted. Tap the speaker icon on the player to unmute audio.
      </p>
    </div>
  );
}

