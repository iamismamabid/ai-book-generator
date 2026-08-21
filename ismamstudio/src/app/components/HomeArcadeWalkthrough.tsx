"use client";

import { useState } from "react";
import { Grid3x3, Palette, Play } from "lucide-react";
import Image from "next/image";
import {
  INTERIOR_DEMO_YOUTUBE_ID,
  COVER_DEMO_YOUTUBE_ID,
  getYouTubeEmbedUrl,
} from "@/lib/videoConfig";

export default function HomeArcadeWalkthrough() {
  const [activeVideoTab, setActiveVideoTab] = useState<"interior" | "cover">("interior");
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVideoId =
    activeVideoTab === "interior"
      ? INTERIOR_DEMO_YOUTUBE_ID
      : COVER_DEMO_YOUTUBE_ID;

  const embedUrl = getYouTubeEmbedUrl(currentVideoId, true, false);

  const handleTabChange = (tab: "interior" | "cover") => {
    setActiveVideoTab(tab);
    // If already playing, keep playing new video; otherwise keep facade
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04),0_24px_48px_rgba(15,23,42,0.06)] overflow-hidden animate-float">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleTabChange("interior")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 cursor-pointer ${
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
            onClick={() => handleTabChange("cover")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 cursor-pointer ${
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

        <button
          onClick={() => setIsPlaying(true)}
          className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50 hover:scale-105 transition-transform cursor-pointer"
        >
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <Play className="w-2.5 h-2.5 fill-red-600" />
          {isPlaying ? "Playing Now" : "Watch Demo"}
        </button>
      </div>

      {/* YouTube Showcase Player (Facade with zero-overhead initial load) */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner relative group">
        {isPlaying ? (
          <iframe
            key={`${activeVideoTab}-${currentVideoId}`}
            src={embedUrl}
            title="KDPage Studio Video Walkthrough"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center group overflow-hidden bg-slate-950"
            role="button"
            aria-label="Play video walkthrough"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIsPlaying(true);
            }}
          >
            {/* High-res YouTube Thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`}
              alt="KDPage Walkthrough Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
              loading="lazy"
              width={640}
              height={360}
            />

            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/20" />

            {/* Play Button Glow Container */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 group-hover:scale-110 group-hover:shadow-indigo-500/80 transition-all duration-300">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white translate-x-0.5" />
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Watch {activeVideoTab === "interior" ? "Interior" : "Cover"} Studio Demo (2 min)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-3 font-semibold font-sans">
        {isPlaying
          ? "🔊 Video is playing. Click player controls to adjust volume or expand full screen."
          : "✨ Click anywhere to play the interactive video walkthrough."}
      </p>
    </div>
  );
}

