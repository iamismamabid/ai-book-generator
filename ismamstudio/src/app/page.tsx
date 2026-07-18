"use client";

import { useState } from "react";
import Link from "next/link";
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
  Sliders,
  X,
  Key,
  Calculator,
  Shuffle,
  Play,
  Hash
} from "lucide-react";
import PricingSection from "../components/PricingSection";

interface BookSample {
  id: string;
  title: string;
  category: string;
  trim: string;
  difficulty: string;
  badge: string;
  desc: string;
  bgGradient: string;
}

const BOOK_SAMPLES: BookSample[] = [
  {
    id: "sudoku",
    title: "Sudoku Master Class",
    category: "Sudoku",
    trim: "8.5\" x 11\"",
    difficulty: "Mixed (Easy to Hard)",
    badge: "100% Unique Solutions",
    desc: "A collection of 200 high-fidelity Sudoku grids with mathematically guaranteed single-solution uniqueness, ready for large-print publishing.",
    bgGradient: "from-amber-50 via-amber-50/40 to-transparent",
  },
  {
    id: "maze",
    title: "The Shaped Maze Odyssey",
    category: "Labyrinths",
    trim: "8.5\" x 11\"",
    difficulty: "Medium",
    badge: "Heart & Circle Masks",
    desc: "Dazzling shape-masked maze interiors formatted with precise gutters and bleed buffers. Complete with 2x2 solution layouts.",
    bgGradient: "from-emerald-50 via-emerald-50/40 to-transparent",
  },
  {
    id: "word-search",
    title: "Retro Senior Word Search",
    category: "Word Search",
    trim: "8.5\" x 11\"",
    difficulty: "Large Print",
    badge: "Custom CSV Import",
    desc: "High-contrast word search puzzles built using custom word lists. Features large font options and clear answer grids.",
    bgGradient: "from-pink-50 via-pink-50/40 to-transparent",
  }
];

export default function HomePage() {
  const [activePreview, setActivePreview] = useState<string>("sudoku");
  const [activeVideoTab, setActiveVideoTab] = useState<"interior" | "cover">("interior");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-700 overflow-hidden relative" suppressHydrationWarning>

      {/* Soft ambient blooms */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-purple-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-2s' }} />

      {/* Two-Column Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
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
              <Link
                href="https://app.arcade.software/share/zwSHISc2CSSG683DpmUh"
                target="_blank"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-black text-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
                Watch Walkthrough Video
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
                For KDP Self-Publishers & Indie Authors
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                100% KDP bleed & safety compliant
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          {/* 1. All-In-One Studio */}
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">All-In-One Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Design custom crossword grids and word searches, drag & drop elements, and compile front/back covers with live KDP bleed guidelines.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Open Creator Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. KDP Interiors Merge */}
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">KDP Interiors Merge</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Combine your custom puzzles, word searches, and activity pages into a single PDF document formatted with print-ready safety margins.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mt-6"
            >
              Start Assembling <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Section 2: Premium Puzzle Engines */}
        <div className="text-center mb-16 border-t border-slate-100 pt-16">
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Labyrinth Designer</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Generate 50+ unique maze shapes (Square, Circle, Heart masks) with mathematically guaranteed single-solution output and KDP safety margins.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Sudoku Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Compile print-ready Sudoku puzzle grids (Easy, Medium, Hard) in bulk with mathematically guaranteed single-solution uniqueness.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Word Search Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Import custom word lists or CSVs to build unique Word Search grids. Adjust fonts, highlighter options, and export interior sheets.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Cryptogram Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Create substitution cipher worksheets from custom quote libraries, complete with letter hints and solution keys formatted for publishing.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Math Puzzle Builder</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Generate arithmetic, cross-number, and logic puzzle sheets for children, senior exercises, or educational KDP workbook niches.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Shuffle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Word Scramble Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Scramble custom word lists to build activity worksheets. Customize difficulty, borders, layout guides, and download PDF sheets.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Hash className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Kakuro Generator</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Design crossword-style number sums logic puzzles. Select grids from 4x4 up to 9x17, adjust difficulty from easy to expert, and export print-ready PDFs.
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
          <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">Crossword Studio</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Compile custom crossword puzzles (10x10 to 20x20). Customize clues, adjust word placements, and export KDP paperback-ready PDF sheets.
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
          {!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && (
            <div className="group relative bg-white border border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col justify-between h-[360px]">
              <div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 ease-in-out shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors duration-300 ease-in-out mb-3">AI Novel Writer & Outliner</h3>
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
              <Sparkles className="w-3.5 h-3.5" /> Now Live & Active
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


      {/* KDP Interior Samples & Gallery (Social Proof) */}
      <section id="examples" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-black uppercase tracking-wider mb-3">
            <Layers className="w-4 h-4" /> Sample Gallery
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            Interactive Book Showcase
          </h2>
          <p className="text-slate-600 text-sm font-semibold max-w-md mx-auto leading-relaxed">
            Click on a sample category below to explore its KDP interior and layout specification.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sample Navigation List */}
          <div className="lg:col-span-4 space-y-3">
            {BOOK_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setActivePreview(sample.id)}
                className={`w-full p-6 text-left rounded-3xl border transition-all duration-300 ease-in-out flex flex-col gap-2 ${activePreview === sample.id
                  ? "bg-gradient-to-r from-indigo-50 via-white to-white border-indigo-200 shadow-md"
                  : "bg-white border-slate-200/70 shadow-sm hover:border-slate-300 hover:shadow-md"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {sample.category}
                  </span>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {sample.trim}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-800">{sample.title}</h3>
              </button>
            ))}
          </div>

          {/* Sample Live Canvas Preview */}
          <div className="lg:col-span-8">
            {BOOK_SAMPLES.map((sample) => {
              if (sample.id !== activePreview) return null;
              return (
                <div
                  key={sample.id}
                  className={`bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden bg-gradient-to-br ${sample.bgGradient} flex flex-col md:flex-row gap-8 items-center justify-between animate-fade-in`}
                >
                  <div className="space-y-4 max-w-md">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
                      {sample.badge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800">{sample.title}</h3>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                      {sample.desc}
                    </p>
                    <div className="flex items-center gap-6 pt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Trim Size: <strong className="text-slate-800">{sample.trim}</strong></span>
                      <span>Difficulty: <strong className="text-slate-800">{sample.difficulty}</strong></span>
                    </div>
                    <div className="pt-4">
                      <Link
                        href={sample.id === "novel" ? "/generate" : sample.id === "word-search" ? "/tools/word-search" : `/${sample.id}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-3 rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-md"
                      >
                        Try Generator Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Graphic Visual Representation of the PDF page */}
                  <div className="w-full max-w-[200px] aspect-[1/1.4] bg-white rounded-xl shadow-lg p-4 border border-slate-200 flex flex-col justify-between items-center text-slate-900 selection:bg-transparent relative">
                    <div className="w-full text-center border-b border-slate-200 pb-1.5">
                      <span className="text-[6px] font-black tracking-widest uppercase block text-slate-400">Sample Interior Page</span>
                      <span className="text-[8px] font-black uppercase text-indigo-600">{sample.title}</span>
                    </div>

                    {/* Dynamic graphic inside sample */}
                    {sample.id === "sudoku" && (
                      <div className="w-full grid grid-cols-4 gap-0.5 border border-slate-900 p-1 bg-slate-600">
                        {"3124423124131342".split("").map((num, i) => (
                          <div key={i} className="aspect-square flex items-center justify-center text-[8px] font-bold border border-slate-100 bg-slate-50">{num}</div>
                        ))}
                      </div>
                    )}
                    {sample.id === "maze" && (
                      <div className="w-full flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg aspect-square">
                        <div className="text-[7px] font-mono leading-none select-none text-slate-600 font-bold">
                          {"#######\n#S #  #\n# ##  #\n#   #E#\n#######".split("\n").map((r, i) => (
                            <div key={i}>{r}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {sample.id === "word-search" && (
                      <div className="w-full font-mono text-[7px] leading-tight select-none text-center bg-slate-50 border border-slate-100 p-2 rounded">
                        {"D O G X\nC A T Y\nF I S H\nB I R D".split("\n").map((r, i) => (
                          <div key={i} className="tracking-widest">{r}</div>
                        ))}
                      </div>
                    )}
                    {sample.id === "novel" && (
                      <div className="w-full space-y-1.5 py-2">
                        <div className="h-1 bg-slate-300 w-1/3 rounded" />
                        <div className="h-0.5 bg-slate-200 w-full rounded" />
                        <div className="h-0.5 bg-slate-200 w-5/6 rounded" />
                        <div className="h-0.5 bg-slate-200 w-4/5 rounded" />
                        <div className="h-1 bg-slate-300 w-1/4 rounded pt-1" />
                        <div className="h-0.5 bg-slate-200 w-full rounded" />
                        <div className="h-0.5 bg-slate-200 w-11/12 rounded" />
                      </div>
                    )}

                    <div className="w-full text-center border-t border-slate-100 pt-1 flex justify-between items-center text-[5px] font-bold text-slate-400">
                      <span>Page 14</span>
                      <span>KDPage KDP Compliant</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-indigo-500 animate-pulse" /> Step-by-Step Workflow
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            How KDPage Works
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-semibold max-w-xl mx-auto mt-4 leading-relaxed">
            Create publication-ready KDP book interiors and covers in three simple, automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Step 1 */}
          <div className="bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] group-hover:bg-indigo-100 transition-colors duration-300" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">1. Configure Trim & Bleed</h3>
              <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                Choose standard KDP sizes (6"x9", 8.5"x11"), margin guidelines, and page sizes. Our layouts automatically compute gutter bleed margins so your book passes KDP reviews without margin violations.
              </p>
            </div>
            <div className="text-indigo-100 font-black text-6xl select-none text-right">01</div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[4rem] group-hover:bg-purple-100 transition-colors duration-300" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">2. Generate Puzzles & Text</h3>
              <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                Use our puzzle generator engine to create infinite unique Sudokus, mazes, cryptograms, and word search grids. Auto-generate complete chapter outlines and write full-text chapters with our advanced Chapter Writer tool.
              </p>
            </div>
            <div className="text-purple-100 font-black text-6xl select-none text-right">02</div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/70 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] group-hover:bg-emerald-100 transition-colors duration-300" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">3. Export Print-Ready PDF</h3>
              <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                Compile your entire creation (puzzles, dividers, solutions, and custom covers) into a high-fidelity vector PDF. Download and upload directly to Amazon KDP, Etsy, or IngramSpark instantly.
              </p>
            </div>
            <div className="text-emerald-100 font-black text-6xl select-none text-right">03</div>
          </div>

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
                  "As a CSE student and self-publisher on Amazon KDP, I quickly realized how expensive and fragmented the book-creation process can be. Many standard publishing tools are scattered across different platforms, making it tedious to compile a single book. I knew there had to be a more efficient and integrated way."
                </p>
                <p>
                  "That is why I built KDPage. My goal was to create a single, automated, and genuinely premium workspace that empowers independent publishers. I wanted to make it possible to design mathematically verified puzzles, shape-masked labyrinths, and professional cover layouts in under 30 seconds."
                </p>
                <p>
                  "Whether you are just starting your KDP journey or scaling a publishing agency, this studio is designed to grow with you. With flexible options — including monthly, annual, and lifetime access plans — we keep premium tools accessible so you can keep 100% of your royalties and focus on what matters: creating."
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="text-xs font-bold text-slate-400">
                  Built with ❤️ for KDP Self-Publishers worldwide.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Active & Improving Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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

    </div>
  );
}
