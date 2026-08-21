"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Grid3x3,
  Compass,
  Palette,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  FileCheck
} from "lucide-react";

type StudioTab = "sudoku" | "maze" | "cover" | "wordsearch";

export default function HomeStudioShowcase() {
  const [activeTab, setActiveTab] = useState<StudioTab>("sudoku");

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06),0_24px_48px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300">
      {/* Interactive Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("sudoku")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sudoku"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            Sudoku
          </button>
          <button
            onClick={() => setActiveTab("maze")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "maze"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Shape Maze
          </button>
          <button
            onClick={() => setActiveTab("cover")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "cover"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Cover Studio
          </button>
          <button
            onClick={() => setActiveTab("wordsearch")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "wordsearch"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Word Search
          </button>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          300 DPI Vector
        </div>
      </div>

      {/* Live Vector Showcase Canvas */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 p-4 sm:p-6 flex flex-col justify-between shadow-inner">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Tab 1: Sudoku Vector Showcase */}
        {activeTab === "sudoku" && (
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60">
                Algorithm: Backtracking Solver (Unique Seed)
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                Difficulty: Hard
              </span>
            </div>

            {/* Visual Sudoku Matrix Grid */}
            <div className="my-auto mx-auto max-w-[260px] sm:max-w-[290px] w-full grid grid-cols-9 gap-0.5 bg-slate-800 p-1.5 rounded-xl border-2 border-indigo-500/40 shadow-2xl">
              {[
                5, 3, "", "", 7, "", "", "", "",
                6, "", "", 1, 9, 5, "", "", "",
                "", 9, 8, "", "", "", "", 6, "",
                8, "", "", "", 6, "", "", "", 3,
                4, "", "", 8, "", 3, "", "", 1,
                7, "", "", "", 2, "", "", "", 6,
                "", 6, "", "", "", "", 2, 8, "",
                "", "", "", 4, 1, 9, "", "", 5,
                "", "", "", "", 8, "", "", 7, 9
              ].map((val, i) => {
                const isBorderRight = (i + 1) % 3 === 0 && (i + 1) % 9 !== 0;
                const isBorderBottom = Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5;
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-slate-100 bg-slate-900/90 rounded-xs transition-colors hover:bg-indigo-600/40 ${
                      val ? "text-indigo-300 font-black" : "text-slate-600"
                    } ${isBorderRight ? "border-r-2 border-indigo-500/60 mr-0.5" : ""} ${
                      isBorderBottom ? "border-b-2 border-indigo-500/60 mb-0.5" : ""
                    }`}
                  >
                    {val || ""}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>✦ Trim: 8.5" × 11" No-Bleed</span>
              <span className="text-emerald-400 font-bold">✓ 100% KDP Verified Single Solution</span>
            </div>
          </div>
        )}

        {/* Tab 2: Shape-Masked Maze Studio */}
        {activeTab === "maze" && (
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-purple-400 font-bold bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/60">
                Shape Mask: Valentine Heart Labyrinth
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                Pathing: Wilson's Algorithm
              </span>
            </div>

            {/* Visual SVG Vector Maze */}
            <div className="my-auto mx-auto max-w-[220px] sm:max-w-[250px] w-full flex items-center justify-center">
              <svg viewBox="0 0 100 90" className="w-full h-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <path
                  d="M 50,85 A 25,25 0 0,1 10,40 A 20,20 0 0,1 50,20 A 20,20 0 0,1 90,40 A 25,25 0 0,1 50,85 Z"
                  fill="#0f172a"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                />
                {/* Labyrinth Grid Paths */}
                <path
                  d="M 30,30 L 45,30 L 45,45 L 35,45 L 35,60 L 50,60 L 50,75 M 55,25 L 70,25 L 70,40 L 60,40 L 60,55 L 75,55 M 25,45 L 20,50 L 35,65 M 65,45 L 80,50 L 65,65"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Solution Path Glowing Line */}
                <path
                  d="M 50,22 L 50,35 L 40,35 L 40,52 L 55,52 L 55,70 L 50,82"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="2 1"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="22" r="3" fill="#22c55e" />
                <circle cx="50" cy="82" r="3" fill="#ef4444" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>✦ Mask Options: Heart, Star, Circle, Custom SVG</span>
              <span className="text-purple-400 font-bold">✓ Vector Solution Key Generated</span>
            </div>
          </div>
        )}

        {/* Tab 3: Cover Studio with Dynamic Spine */}
        {activeTab === "cover" && (
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                Wrap-Around Cover Canvas: 120 Pages
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                Spine: 0.270" (White Paper)
              </span>
            </div>

            {/* Visual Book Cover Wrap Template */}
            <div className="my-auto mx-auto max-w-[340px] w-full flex items-stretch h-32 sm:h-36 rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-900">
              {/* Back Cover */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 to-indigo-950 p-2.5 flex flex-col justify-between border-r border-dashed border-cyan-400/40">
                <div className="space-y-1">
                  <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
                  <div className="w-20 h-1 bg-slate-700 rounded-full" />
                  <div className="w-16 h-1 bg-slate-700 rounded-full" />
                </div>
                {/* Barcode box */}
                <div className="self-start bg-white p-1 rounded border border-slate-300 w-12 h-6 flex items-center justify-center">
                  <div className="font-mono text-[7px] text-slate-900 font-black tracking-tighter">||| | |||| |</div>
                </div>
              </div>

              {/* Spine */}
              <div className="w-7 sm:w-8 bg-gradient-to-b from-indigo-700 to-purple-800 flex items-center justify-center text-white border-r border-dashed border-cyan-400/40">
                <span className="rotate-90 text-[8px] font-black tracking-widest uppercase whitespace-nowrap">
                  KDP BOOK
                </span>
              </div>

              {/* Front Cover */}
              <div className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-2.5 flex flex-col justify-between text-right">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Activity Book</span>
                  <div className="font-black text-xs text-white leading-tight">ULTIMATE SUDOKU</div>
                </div>
                <div className="self-end text-[7px] text-indigo-300 font-bold bg-black/40 px-1.5 py-0.5 rounded">
                  300 DPI Vector PDF
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>✦ Bleed: 0.125" Auto-Calculated</span>
              <span className="text-cyan-400 font-bold">✓ Print-Ready Full Wrap PDF</span>
            </div>
          </div>
        )}

        {/* Tab 4: Word Search Studio */}
        {activeTab === "wordsearch" && (
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                Theme: Space Exploration (15×15)
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                Clues: 12 Words
              </span>
            </div>

            {/* Word Search Letter Grid */}
            <div className="my-auto mx-auto max-w-[280px] w-full font-mono text-[10px] sm:text-xs text-slate-300 font-semibold leading-relaxed tracking-widest text-center bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/30">
              <div className="text-indigo-400 font-black">G A L A X Y O R B I T</div>
              <div>P L A N E T <span className="text-emerald-400 font-black bg-emerald-950/80 px-1 rounded">S T A R</span> S W</div>
              <div>R O C K E T C O S M O</div>
              <div>A S T E R O I D M A R</div>
              <div>L U N A R <span className="text-amber-400 font-black bg-amber-950/80 px-1 rounded">S P A C E</span> K D</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>✦ CSV Word List Import Supported</span>
              <span className="text-emerald-400 font-bold">✓ Large Print Senior Compliant</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive KDPage Engine — 0ms Server Latency</span>
        </div>

        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
        >
          Open Studio Free
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
