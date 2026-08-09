"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getYouTubeEmbedUrl } from "@/lib/videoConfig";
import {
  Palette,
  Grid3x3,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Download,
  Shield,
  Layers,
  X,
  Key,
  Calculator,
  Shuffle,
  Play,
  Hash,
  QrCode,
  Scissors,
  Package,
  ScanText,
  BookOpen,
  LayoutTemplate,
  Star
} from "lucide-react";
import dynamic from "next/dynamic";

import TrustpilotWidget from "./components/TrustpilotWidget";
import UserReviewsSection from "./components/UserReviewsSection";
import { AI_FEATURES_ENABLED } from "@/lib/features";

const PricingSection = dynamic(() => import("../components/PricingSection"), {
  ssr: true,
});

export default function HomeClient() {
  const [activeVideoTab, setActiveVideoTab] = useState<"interior" | "cover">("interior");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-700 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">

      {/* Soft ambient blooms for White & Cream Theme */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-purple-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-6 overflow-hidden z-10">

        <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/80 text-indigo-600 text-xs font-black uppercase tracking-[0.2em] shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              The Ultimate Publishing Suite for KDP Self-Publishers
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-800 tracking-tight leading-[1.1]">
              Create 10 Unique <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">KDP Puzzle Books</span> in 5 Minutes
            </h1>

            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              The ultimate all-in-one publishing suite. Generate mathematically unique puzzles, custom shape-masked mazes, and print-ready covers designed for instant Amazon KDP upload.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Creating Now
                <ArrowRight className="w-5 h-5 text-white" />
              </Link>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-black text-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
                Watch Official Video Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/60 text-xs font-bold text-slate-500">
              <span className="text-slate-400 font-black uppercase tracking-wider text-[10px]">Quick Jump:</span>
              <Link href="/pricing" className="hover:text-indigo-600 hover:underline transition-colors">Pricing Plans</Link>
              <span>•</span>
              <a href="#tools" className="hover:text-indigo-600 hover:underline transition-colors">Puzzle Engines</a>
              <span>•</span>
              <a href="#reviews" className="hover:text-indigo-600 hover:underline transition-colors">User Reviews</a>
              <span>•</span>
              <a href="#founder-story" className="hover:text-indigo-600 hover:underline transition-colors">Founder Story</a>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">Best For:</span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                KDP Self-Publishers
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                Activity &amp; Puzzle Authors
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                Low-Content Creators
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                Etsy Sellers &amp; Agencies
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Arcade Walkthrough Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-indigo-100/40 rounded-[3rem] blur-3xl" />

            <div className="relative bg-white border border-slate-200/80 rounded-[2.5rem] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04),0_24px_48px_rgba(15,23,42,0.06)] overflow-hidden animate-float">
              {/* Header with Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button
                    onClick={() => setActiveVideoTab("interior")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
                      activeVideoTab === "interior"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Grid3x3 className="w-3.5 h-3.5" />
                    Interior Studio
                  </button>
                  <button
                    onClick={() => setActiveVideoTab("cover")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
                      activeVideoTab === "cover"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    Cover Studio
                  </button>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
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
                />
              </div>

              {/* Footer Tip */}
              <p className="text-[10px] text-center text-slate-400 mt-3 font-semibold font-sans">
                💡 Click on the hotspots inside the interactive video to try the layout engine!
              </p>
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* Real-time Interior Previews (Marquee) */}
      <section className="relative z-10 w-full overflow-hidden py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Live KDP Vector Templates</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5 font-sans">High-converting low-content & puzzle layouts</h3>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 self-start">Hover to Pause</span>
          </div>
        </div>
        <div className="relative w-full overflow-hidden flex">
          <div className="animate-marquee flex gap-6">
            {[
              { label: "Heart Labyrinth", type: "Maze", desc: "Perfect for Valentine KDP niches", emoji: "💖" },
              { label: "Sudoku Grid", type: "Math Logic", desc: "100% compliant trim sizing", emoji: "🔢" },
              { label: "Word Search", type: "Puzzle", desc: "Vocabulary & clue layout builder", emoji: "🔍" },
              { label: "Daily Planner", type: "Low-Content", desc: "Schedule, priorities & water logging", emoji: "☀️" },
              { label: "Lined Journal", type: "Low-Content", desc: "Classic horizontal writing lines", emoji: "📖" },
              { label: "Cryptogram", type: "Quotes", desc: "Shuffled letter decryption keys", emoji: "🔐" },
              { label: "Math sums", type: "Arithmetic", desc: "Sums, grid puzzle fill sheets", emoji: "➕" }
            ].concat([
              { label: "Heart Labyrinth", type: "Maze", desc: "Perfect for Valentine KDP niches", emoji: "💖" },
              { label: "Sudoku Grid", type: "Math Logic", desc: "100% compliant trim sizing", emoji: "🔢" },
              { label: "Word Search", type: "Puzzle", desc: "Vocabulary & clue layout builder", emoji: "🔍" },
              { label: "Daily Planner", type: "Low-Content", desc: "Schedule, priorities & water logging", emoji: "☀️" },
              { label: "Lined Journal", type: "Low-Content", desc: "Classic horizontal writing lines", emoji: "📖" },
              { label: "Cryptogram", type: "Quotes", desc: "Shuffled letter decryption keys", emoji: "🔐" },
              { label: "Math sums", type: "Arithmetic", desc: "Sums, grid puzzle fill sheets", emoji: "➕" }
            ]).map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl w-64 whitespace-normal shrink-0 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 ease-in-out">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">{item.type}</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase">{item.label}</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* SaaS Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">

        {/* Section 1: Core Publishing Tools */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider mb-3">
            ★ Core Workspace
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">
            Professional KDP Publishing Studios
          </h2>
          <p className="text-slate-600 text-base max-w-lg mx-auto font-semibold leading-relaxed">
            All-in-one workspaces to design your covers, assemble layouts, and merge interiors.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-24">
          {/* 1. All-In-One Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors duration-300 ease-in-out mb-3">All-In-One Creator Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Build multi-page interiors and covers in one workspace, with live KDP bleed guides and auto-generated solution keys.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors duration-300 ease-in-out mt-6"
            >
              Open Creator Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Section 2: Premium Puzzle Engines */}
        <div id="tools" className="text-center mb-16 border-t border-slate-100 pt-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-black uppercase tracking-wider mb-3">
            💎 Premium Puzzle Tools
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">
            Specialized Puzzle Compilation Engines
          </h2>
          <p className="text-slate-600 text-base max-w-lg mx-auto font-semibold leading-relaxed">
            Generate mathematically verified, single-solution puzzles tailored for Amazon KDP niches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 3. Labyrinth Designer */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Labyrinth Designer</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Square, Circle &amp; Heart mazes with single-solution paths and KDP-safe margins.
              </p>
            </div>
            <Link
              href="/maze"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Design Mazes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4. Sudoku Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Sudoku Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Bulk Sudoku grids, Easy to Hard, each verified for exactly one solution.
              </p>
            </div>
            <Link
              href="/sudoku"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Generate Sudokus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5. Word Search Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Word Search Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Import a word list or CSV, build the grid, export the interior sheet.
              </p>
            </div>
            <Link
              href="/tools/word-search"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Open Word Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6. Cryptogram Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Cryptogram Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Substitution-cipher worksheets from your own quotes, up to 1,000+ pages.
              </p>
            </div>
            <Link
              href="/studio/cryptogram"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Generate Cryptograms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 7. Math Puzzle Builder */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Math Puzzle Builder</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Arithmetic and logic-grid sheets for kids, seniors, and workbooks.
              </p>
            </div>
            <Link
              href="/studio/math-puzzle"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Generate Math Puzzles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8. Word Scramble Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Shuffle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Word Scramble Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Scramble your word list into activity worksheets, ready to export.
              </p>
            </div>
            <Link
              href="/studio/word-scramble"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Generate Scrambles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8.5. Kakuro Generator */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Hash className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Kakuro Generator</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Number-sum logic grids, 4x4 to 9x17, Easy to Expert.
              </p>
            </div>
            <Link
              href="/studio/kakuro"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Generate Kakuros <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8.6. Crossword Studio */}
          <div className="gemini-hover-card group relative bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Crossword Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Custom crosswords, 10x10 to 20x20, up to 1,000+ pages, your clues.
              </p>
            </div>
            <Link
              href="/studio/crossword"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Open Crosswords <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 9. AI Novel Writer & Outliner */}
          {AI_FEATURES_ENABLED && (
            <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
              <div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Novel Outline & Writer</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  Generate 12-chapter novel outlines based on custom parameters, concepts, and genres. Co-write novel chapters using high-speed Llama 3.3 models.
                </p>
              </div>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
              >
                Create New Novel Outline <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </section>



      {/* KDP Niche Hunter Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50/60 to-white rounded-[3rem] border border-indigo-100 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          {/* Decorative glows */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Free Research Tool
            </span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              KDP Niche Hunter & Keyword Spy
            </h2>
            <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
              Stop guessing what sells. Search autocomplete suggestions, estimate monthly sales targets, and calculate royalties using precise BSR estimators.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Real-time search volumes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> BSR sales estimators</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Competition difficulty scores</span>
            </div>
          </div>

          <div className="shrink-0 bg-white border border-indigo-100 px-6 py-8 rounded-3xl text-center max-w-[200px] w-full mx-auto md:mx-0 shadow-sm relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-2">Research Console</span>
            <span className="text-xs text-slate-600 font-semibold block mb-4">Validate KDP niches instantly for free</span>
            <Link
              href="/tools/keyword-research"
              className="inline-block w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5"
            >
              Open Niche Hunter
            </Link>
          </div>
        </div>
      </section>


      {/* Free Tools Spotlight — internal links for crawl/discovery of /tools/* pages */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 30+ Tools — No Signup Required
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">
            Free KDP Tools Every Publisher Needs
          </h2>
          <p className="text-slate-600 text-sm font-semibold max-w-2xl mx-auto">
            Calculators, generators, and utilities for every stage of publishing — completely free, no account required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: "/tools/print-cost-calculator", icon: Calculator, name: "Free Print Cost Calculator", desc: "Paperback & hardcover printing costs" },
            { href: "/tools/ebook-royalty-calculator", icon: Calculator, name: "Free eBook Royalty Calculator", desc: "35% vs 70% Kindle plans" },
            { href: "/tools/kenp-calculator", icon: BookOpen, name: "Free KENP Royalty Calculator", desc: "Kindle Unlimited earnings estimator" },
            { href: "/tools/readability-calculator", icon: Hash, name: "Free Readability Calculator", desc: "Flesch-Kincaid, Gunning Fog & more" },
            { href: "/tools/qr-code-generator", icon: QrCode, name: "Free QR Code Generator", desc: "High-res QR codes for marketing" },
            { href: "/tools/background-remover", icon: Scissors, name: "Free Background Remover", desc: "Transparent PNGs for covers" },
            { href: "/tools/pdf-compressor", icon: Package, name: "Free PDF Compressor", desc: "Shrink files for KDP upload limits" },
            { href: "/tools/ocr-scanner", icon: ScanText, name: "Free OCR Scanner", desc: "Extract text from scanned pages" },
            { href: "/tools/book-planner", icon: BookOpen, name: "Free Book Planner", desc: "Chapters, characters & progress" },
            { href: "/tools/interior-templates", icon: LayoutTemplate, name: "Free Interior Templates", desc: "Journals, planners & notebooks" },
            { href: "/tools/pattern-generator", icon: Palette, name: "Free Pattern Generator", desc: "Seamless covers & endpapers" },
            { href: "/tools/image-resizer", icon: Layers, name: "Free Mass Image Resizer", desc: "Bulk resize with KDP presets" },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <tool.icon className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors block">
                  {tool.name}
                </span>
                <span className="text-xs font-semibold text-slate-500">{tool.desc}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            See All 30+ Free Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Founder's Story & Mission (Social Proof) */}
      <section id="founder-story" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Founder Avatar / Initial Grid */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-white rounded-[22px] flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">IA</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-1 font-sans">Founder</span>
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider mb-3">
                  Our Mission & Story
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-sans">
                  Why I Built KDPage
                </h2>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest font-sans">
                  A message from Ismam Abid, Creator of KDPage
                </p>
              </div>

              <div className="space-y-4 text-slate-600 text-sm md:text-base font-semibold leading-relaxed font-sans">
                <p>
                  "As a web developer, software engineer, and self-publisher on Amazon KDP, I quickly realized how expensive and fragmented the book-creation process can be. Many standard publishing tools are scattered across different platforms, making it tedious to compile a single book. I knew there had to be a more efficient and integrated way."
                </p>
                <p>
                  "That is why I built KDPage. My goal was to create a single, automated, and genuinely premium workspace that empowers independent publishers. I wanted to make it possible to design mathematically verified puzzles, shape-masked labyrinths, and professional cover layouts in under 30 seconds."
                </p>
                <p>
                  "Whether you are just starting your KDP journey or scaling a publishing agency, this studio is designed to grow with you. With flexible options — including monthly and annual plans — I keep premium tools accessible so you can keep 100% of your royalties and focus on what matters: creating."
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="text-xs font-bold text-slate-400">
                  Built with ❤️ for KDP Self-Publishers worldwide.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Actively Maintained &amp; Updated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💬 User Reviews */}
      <UserReviewsSection />

      {/* 🌟 Official Trustpilot Rating & Technical Product Guarantees */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center mb-16 space-y-4">
          <Link 
            href="https://www.trustpilot.com/review/kdpage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest shadow-sm transition-all hover:scale-105"
          >
            <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            Check Our Live Reviews on Trustpilot
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            Built for Bestselling <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">KDP Authors</span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto font-medium">
            3 technical foundations built into every book you create with KDPage.
          </p>
          <TrustpilotWidget />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guarantee 1 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-black">
                🛡️
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">KDP-Spec Formatting</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Automatic gutter margins (0.375" - 0.5") based on total page count, calculated to meet Amazon KDP's bleed and safety-margin specifications.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bleed &amp; Safety</span>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Spec-Compliant</span>
            </div>
          </div>

          {/* Guarantee 2 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center text-xl font-black">
                🔢
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Single-Solution Uniqueness</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Our backtracking solver evaluates <code className="text-xs font-bold bg-purple-50 text-purple-700 px-1 py-0.5 rounded">countSolutions(grid, 2)</code> to mathematically guarantee exactly 1 unique solution per grid.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sudoku &amp; Logic</span>
              <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Mathematically Verified</span>
            </div>
          </div>

          {/* Guarantee 3 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl font-black">
                🎨
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Fabric.js Cover Math</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Calculates exact spine thickness <code className="text-xs font-bold bg-amber-50 text-amber-700 px-1 py-0.5 rounded">pageCount * 0.002252"</code> for crisp, professional wrap-around covers.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cover Studio</span>
              <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Zero Trim Shift</span>
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 font-semibold mt-8 max-w-2xl mx-auto">
          Final approval remains subject to Amazon KDP's own review process and content policies.
        </p>
      </section>

      {/* Pricing & FAQ Section */}
      <PricingSection />

      {/* Lead Generation Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200/70 shadow-sm rounded-[3rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="absolute inset-0 bg-indigo-50/40 pointer-events-none" />

          <div className="max-w-xl space-y-4 relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-wider">
              🎁 Free KDP Checklist
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Get the Ultimate KDP Bestseller Checklist
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Not ready to join? Download our free step-by-step formatting guidelines, bleed/gutter cheat sheet, and 50 low-competition puzzle keywords to start making sales.
            </p>
          </div>

          <div className="w-full md:w-auto relative z-10 shrink-0">
            {leadSubmitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200 max-w-sm">
                <p className="text-emerald-600 font-black text-sm">🎉 Successfully Registered!</p>
                <Link
                  href="/kdp-checklist"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                >
                  Download / Print Checklist
                </Link>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (leadEmail) setLeadSubmitted(true);
                }}
                className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-md"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 font-semibold text-sm focus:border-indigo-400 focus:outline-none w-full min-w-[260px] shadow-inner"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/15 transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:scale-95 shrink-0"
                >
                  Send Me the Checklist
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="bg-white border border-slate-200/70 shadow-sm rounded-[3rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-[0.25em] mb-4">
              <Shield className="w-4 h-4" /> Secure & Compliant
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">Designed for Amazon KDP Specs</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              All PDF exports automatically include precise gutters, safety bleed buffers, standard book sizes (6"x9", 8.5"x11"), and optimized vector paths ready for printing.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/studio"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-1 shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/20 flex items-center gap-2"
            >
              Create Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🎬 YouTube Official Video Modal (Portaled to document.body) */}
      {mounted && isVideoModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-base font-black text-white">KDPage Full Walkthrough &amp; Demo</h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                aria-label="Close video modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={getYouTubeEmbedUrl(undefined, true)}
                title="KDPage Full Walkthrough & Demo"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
