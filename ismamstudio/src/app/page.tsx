"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
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
  Shuffle
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
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    id: "maze",
    title: "The Shaped Maze Odyssey",
    category: "Labyrinths",
    trim: "8.5\" x 11\"",
    difficulty: "Medium",
    badge: "Heart & Circle Masks",
    desc: "Dazzling shape-masked maze interiors formatted with precise gutters and bleed buffers. Complete with 2x2 solution layouts.",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
  {
    id: "word-search",
    title: "Retro Senior Word Search",
    category: "Word Search",
    trim: "8.5\" x 11\"",
    difficulty: "Large Print",
    badge: "Custom CSV Import",
    desc: "High-contrast word search puzzles built using custom word lists. Features large font options and clear answer grids.",
    bgGradient: "from-pink-500/10 via-pink-500/5 to-transparent",
  }
];

export default function HomePage() {
  const [activePreview, setActivePreview] = useState<string>("sudoku");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 overflow-hidden relative">

      {/* 🔮 Background Glow Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-2s' }} />

      {/* 🚀 Two-Column Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] shadow-inner">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              The Ultimate Publishing Suite for KDP Self-Publishers
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
              Create 10 Unique <span className="bg-gradient-to-r from-indigo-450 via-indigo-400 to-purple-450 bg-clip-text text-transparent">KDP Puzzle Books</span> in 5 Minutes
            </h1>

            <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              The ultimate all-in-one publishing suite. Generate mathematically unique puzzles, custom shape-masked mazes, and print-ready covers designed for instant Amazon KDP upload.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Open Creator Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-3.5 py-1.5 rounded-full">
                For KDP Self-Publishers & Indie Authors
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                100% KDP bleed & safety compliant
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Studio Canvas Simulator */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl" />

            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl animate-float">

              {/* Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-2">Labyrinth Book Designer</span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                  8.5″ × 11″ KDP
                </span>
              </div>

              {/* Shape Selector Tabs */}
              <div className="flex gap-2 mb-4">
                {[
                  { icon: "❤", label: "Heart", active: true },
                  { icon: "◯", label: "Circle", active: false },
                  { icon: "▪", label: "Square", active: false },
                ].map((tab) => (
                  <span
                    key={tab.label}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${tab.active
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950/60 text-slate-500 border-slate-800"
                      }`}
                  >
                    <span className={tab.label === "Heart" ? "text-rose-500" : ""}>{tab.icon}</span>
                    {tab.label}
                  </span>
                ))}
              </div>

              {/* Main Canvas Area */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
                {/* Bleed guides */}
                <div className="absolute inset-2 border border-dashed border-rose-500/20 rounded-xl pointer-events-none" />
                <div className="absolute top-3 right-3 text-[6px] font-bold text-rose-500/50 uppercase tracking-wider">Bleed Safe</div>

                {/* Heart Maze Grid */}
                <div className="flex flex-col items-center justify-center py-2 gap-0.5">
                  {[
                    "  ██   ██  ",
                    " █████████ ",
                    "███████████",
                    "███████████",
                    " █████████ ",
                    "  ███████  ",
                    "   █████   ",
                    "    ███    ",
                    "     █     ",
                  ].map((row, i) => (
                    <div key={i} className="font-mono text-[9px] leading-[1.1] tracking-[0.15em] text-emerald-400/80 select-none whitespace-pre">
                      {row}
                    </div>
                  ))}
                  {/* Entry/Exit badges */}
                  <div className="flex gap-6 mt-2">
                    <span className="text-[7px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">▶ START</span>
                    <span className="text-[7px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">★ FINISH</span>
                  </div>
                </div>
              </div>

              {/* Difficulty + Options Row */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {["Easy", "Med", "Hard"].map((d, i) => (
                    <span
                      key={d}
                      className={`text-[8px] font-black px-2 py-1 rounded-lg border uppercase ${i === 1
                          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          : "bg-slate-950/60 text-slate-600 border-slate-800"
                        }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <Compass className="w-3 h-3" /> Auto Solution Key
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Pages", value: "50" },
                  { label: "Trim", value: "8.5×11" },
                  { label: "Shapes", value: "3 types" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[11px] font-black text-white">{stat.value}</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 🎬 Real-time Interior Previews (Marquee) */}
      <section className="relative z-10 w-full overflow-hidden py-10 bg-slate-950/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Live KDP Vector Templates</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mt-0.5 font-sans">High-converting low-content & puzzle layouts</h3>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 self-start">Hover to Pause</span>
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
              <div key={idx} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl w-64 whitespace-normal shrink-0 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{item.type}</span>
                </div>
                <h4 className="text-xs font-black text-white uppercase">{item.label}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚠️ Problem / Solution Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-900 p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8">KDP Publishing Is Hard...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-450 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10">Traditional Formatting Pitfalls</span>
              <ul className="space-y-3 font-semibold text-xs md:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Formatting interiors takes hours of manual ruler calculations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Puzzle generators yield duplicate grids rejected by Amazon KDP.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Cover design calculations require expensive, custom layout software.</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">The Ismam Studio Solution</span>
              <ul className="space-y-3 font-semibold text-xs md:text-sm text-slate-350">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                  <span>All-in-one suite. Go from zero to publication-ready PDF in 30 seconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-455 shrink-0 mt-0.5" />
                  <span>Mathematically unique, single-solution puzzles every compile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                  <span>Dynamic cover canvas with live bleed guides and margins.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ SaaS Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Professional KDP Creation Engines
          </h2>
          <p className="text-slate-300 text-base max-w-lg mx-auto font-semibold mb-8">
            Choose from a suite of specialized puzzle builders and cover editors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* 1. Book Builder & Cover Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Book & Cover Studio</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Design custom crossword grids and word searches, drag & drop elements, and compile front/back covers with live KDP bleed guidelines.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Open Creator Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>



          {/* 3. Shaped Labyrinth Designer */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Labyrinth Designer</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Generate 50+ unique maze shapes (Square, Circle, Heart masks) with mathematically guaranteed single-solution output and KDP safety margins.
              </p>
            </div>
            <Link
              href="/maze"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Design Mazes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4. Sudoku Generator */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Sudoku Studio</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Compile print-ready Sudoku puzzle grids (Easy, Medium, Hard) in bulk with mathematically guaranteed single-solution uniqueness.
              </p>
            </div>
            <Link
              href="/sudoku"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Generate Sudokus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5. Word Search Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Word Search Studio</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Import custom word lists or CSVs to build unique Word Search grids. Adjust fonts, highlighter options, and export interior sheets.
              </p>
            </div>
            <Link
              href="/tools/word-search"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Open Word Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6. Cryptogram Generator */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-455 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Cryptogram Studio</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Create substitution cipher worksheets from custom quote libraries, complete with letter hints and solution keys formatted for publishing.
              </p>
            </div>
            <Link
              href="/studio/cryptogram"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Generate Cryptograms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 7. Math Puzzle Builder */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Math Puzzle Builder</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Generate arithmetic, cross-number, and logic puzzle sheets for children, senior exercises, or educational KDP workbook niches.
              </p>
            </div>
            <Link
              href="/studio/math-puzzle"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Generate Math Puzzles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8. Word Scramble Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Shuffle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Word Scramble Studio</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Scramble custom word lists to build activity worksheets. Customize difficulty, borders, layout guides, and download PDF sheets.
              </p>
            </div>
            <Link
              href="/studio/word-scramble"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Generate Scrambles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 9. Complete Book Compilation */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-450 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">KDP Interiors Merge</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                Combine your custom puzzles, word searches, and activity pages into a single PDF document formatted with print-ready safety margins.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-350 hover:text-white transition-colors mt-6"
            >
              Start Assembling <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 🛠️ How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50 text-center">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
            <Sliders className="w-4 h-4" /> Simple Blueprint
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">How It Works</h2>
          <p className="text-slate-300 text-sm font-semibold max-w-md mx-auto">
            Three simple steps to publish your puzzle, activity, or story book directly to Amazon KDP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto relative z-10">

          {/* Step 1 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-black text-lg mx-auto">1</div>
            <h3 className="text-white font-bold text-lg">Pick a Creation Engine</h3>
            <p className="text-slate-300 text-xs font-semibold leading-relaxed">
              Select one of our specialized tools: Sudoku Studio, Shaped Maze Designer, Word Search, or other puzzle compilers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-purple-500/15 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 font-black text-lg mx-auto">2</div>
            <h3 className="text-white font-bold text-lg">Build & Format</h3>
            <p className="text-slate-300 text-xs font-semibold leading-relaxed">
              Customize puzzle complexity, layout shapes, or story parameters, and download print-ready vector PDF interiors.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20 font-black text-lg mx-auto">3</div>
            <h3 className="text-white font-bold text-lg">Wrap Cover & Publish</h3>
            <p className="text-slate-300 text-xs font-semibold leading-relaxed">
              Design a gorgeous cover in our canvas based on page counts, compile all sections together, and upload directly to Amazon KDP!
            </p>
          </div>

        </div>
      </section>

      {/* 🔮 KDP Niche Hunter Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-md rounded-[3rem] border border-indigo-900/35 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          {/* Decorative glows */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Now Live & Active
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              KDP Niche Hunter & Keyword Spy
            </h2>
            <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
              Stop guessing what sells. Search autocomplete suggestions, estimate monthly sales targets, and calculate royalties using precise BSR estimators.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-350 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Real-time search volumes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> BSR sales estimators</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Competition difficulty scores</span>
            </div>
          </div>

          <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-6 py-8 rounded-3xl text-center max-w-[200px] w-full mx-auto md:mx-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-2">Research Console</span>
            <span className="text-xs text-slate-300 font-semibold block mb-4">Validate KDP niches instantly for free</span>
            <Link
              href="/tools/keyword-research"
              className="inline-block w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition"
            >
              Open Niche Hunter
            </Link>
          </div>
        </div>
      </section>

      {/* 📚 KDP Interior Samples & Gallery (Social Proof) */}
      <section id="examples" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <Layers className="w-4 h-4" /> Sample Gallery
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Interactive Book Showcase
          </h2>
          <p className="text-slate-300 text-sm font-semibold max-w-md mx-auto">
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
                className={`w-full p-6 text-left rounded-3xl border transition-all flex flex-col gap-2 ${activePreview === sample.id
                    ? "bg-gradient-to-r from-indigo-500/20 via-slate-900 to-slate-900 border-indigo-500 shadow-lg"
                    : "bg-slate-950/30 border-slate-900 hover:border-slate-800"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {sample.category}
                  </span>
                  <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {sample.trim}
                  </span>
                </div>
                <h3 className="text-base font-black text-white">{sample.title}</h3>
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
                  className={`bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden bg-gradient-to-br ${sample.bgGradient} flex flex-col md:flex-row gap-8 items-center justify-between animate-fade-in`}
                >
                  <div className="space-y-4 max-w-md">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                      {sample.badge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{sample.title}</h3>
                    <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                      {sample.desc}
                    </p>
                    <div className="flex items-center gap-6 pt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Trim Size: <strong className="text-white">{sample.trim}</strong></span>
                      <span>Difficulty: <strong className="text-white">{sample.difficulty}</strong></span>
                    </div>
                    <div className="pt-4">
                      <Link
                        href={sample.id === "novel" ? "/generate" : sample.id === "word-search" ? "/tools/word-search" : `/${sample.id}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-3 rounded-xl transition"
                      >
                        Try Generator Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Graphic Visual Representation of the PDF page */}
                  <div className="w-full max-w-[200px] aspect-[1/1.4] bg-white rounded-xl shadow-2xl p-4 border border-slate-200 flex flex-col justify-between items-center text-slate-900 selection:bg-transparent relative">
                    <div className="w-full text-center border-b border-slate-200 pb-1.5">
                      <span className="text-[6px] font-black tracking-widest uppercase block text-slate-400">Sample Interior Page</span>
                      <span className="text-[8px] font-black uppercase text-indigo-600">{sample.title}</span>
                    </div>

                    {/* Dynamic graphic inside sample */}
                    {sample.id === "sudoku" && (
                      <div className="w-full grid grid-cols-4 gap-0.5 border border-slate-900 p-1 bg-slate-550">
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
                        <div className="h-1 bg-slate-350 w-1/4 rounded pt-1" />
                        <div className="h-0.5 bg-slate-200 w-full rounded" />
                        <div className="h-0.5 bg-slate-200 w-11/12 rounded" />
                      </div>
                    )}

                    <div className="w-full text-center border-t border-slate-100 pt-1 flex justify-between items-center text-[5px] font-bold text-slate-400">
                      <span>Page 14</span>
                      <span>Ismam Studio KDP Compliant</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* 💬 How it Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-indigo-400 animate-pulse" /> Step-by-Step Workflow
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            How Ismam Studio Works
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-semibold max-w-xl mx-auto mt-4 leading-relaxed">
            Create publication-ready KDP book interiors and covers in three simple, automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Step 1 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem] group-hover:bg-indigo-500/10 transition-colors" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">1. Configure Trim & Bleed</h3>
              <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
                Choose standard KDP sizes (6"x9", 8.5"x11"), margin guidelines, and page sizes. Our layouts automatically compute gutter bleed margins so your book passes KDP reviews without margin violations.
              </p>
            </div>
            <div className="text-indigo-400/30 font-black text-6xl select-none text-right">01</div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-[4rem] group-hover:bg-purple-500/10 transition-colors" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">2. Generate Puzzles & Text</h3>
              <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
                Use our puzzle generator engine to create infinite unique Sudokus, mazes, cryptograms, and word search grids. Outline novel chapters automatically with our advanced AI Writer powered by Llama-3.
              </p>
            </div>
            <div className="text-purple-400/30 font-black text-6xl select-none text-right">02</div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[4rem] group-hover:bg-emerald-500/10 transition-colors" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">3. Export Print-Ready PDF</h3>
              <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
                Compile your entire creation (puzzles, dividers, solutions, and custom covers) into a high-fidelity vector PDF. Download and upload directly to Amazon KDP, Etsy, or IngramSpark instantly.
              </p>
            </div>
            <div className="text-emerald-400/30 font-black text-6xl select-none text-right">03</div>
          </div>

        </div>

        {/* Visual Video Card / Quick Tour Block */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-900/30 border border-slate-900 rounded-[2.5rem] p-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Mock Player */}
            <div onClick={() => setIsVideoModalOpen(true)} className="w-full md:w-1/2 aspect-video bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-center relative overflow-hidden shadow-inner cursor-pointer">
              {/* Fake play button */}
              <div className="w-16 h-16 rounded-full bg-indigo-600/90 border border-indigo-500/30 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300">
                <svg className="w-6 h-6 fill-current text-white translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* Fake timeline */}
              <div className="absolute bottom-4 inset-x-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-indigo-500" />
              </div>
              <div className="absolute bottom-7 left-4 text-[9px] font-black uppercase text-indigo-400">
                Ismam Studio Quick-Start Guide (2:15)
              </div>
            </div>
            {/* Player Info */}
            <div className="space-y-4 text-center md:text-left flex-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Interactive Video Walkthrough
              </span>
              <h3 className="text-xl font-black text-white">Watch Ismam Studio In Action</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                See how to generate mathematically unique Sudokus, customize shape-masked labyrinth layouts, and use the Cover Canvas to align spine margins for Amazon KDP uploads in under 2 minutes.
              </p>
              <button onClick={() => setIsVideoModalOpen(true)} className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-2 mx-auto md:mx-0 cursor-pointer">
                <span>Watch Walkthrough Video</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 👨‍💻 Founder's Story & Mission (Social Proof) */}
      <section id="founder-story" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-slate-900/50">
        <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-purple-950/20 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/60 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Decorative glows */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Founder Avatar / Initial Grid */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-0.5 shadow-xl shrink-0">
              <div className="w-full h-full bg-[#0b0f19] rounded-[22px] flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">IA</span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mt-1 font-sans">Founder</span>
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
                  Our Mission & Story
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">
                  Why I Built Ismam Studio
                </h2>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest font-sans">
                  A message from Ismam Abid, Creator of Ismam Studio
                </p>
              </div>

              <div className="space-y-4 text-slate-300 text-sm md:text-base font-semibold leading-relaxed font-sans">
                <p>
                  "As a CSE student and self-publisher on Amazon KDP, I quickly realized how expensive and fragmented the book-creation process can be. Many standard publishing tools are scattered across different platforms, making it tedious to compile a single book. I knew there had to be a more efficient and integrated way."
                </p>
                <p>
                  "That is why I built Ismam Studio. My goal was to create a single, automated, and genuinely premium workspace that empowers independent publishers. I wanted to make it possible to design mathematically verified puzzles, shape-masked labyrinths, and professional cover layouts in under 30 seconds."
                </p>
                <p>
                  "Whether you are just starting your KDP journey or scaling a publishing agency, this studio is designed to grow with you. With flexible options — including monthly, annual, and lifetime access plans — we keep premium tools accessible so you can keep 100% of your royalties and focus on what matters: creating."
                </p>
              </div>

              <div className="h-px bg-slate-800/80" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="text-xs font-bold text-slate-500">
                  Built with ❤️ for KDP Self-Publishers worldwide.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Active & Improving Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💳 Pricing & FAQ Section */}
      <PricingSection />

      {/* 🔒 Trust Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-slate-800 p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.25em] mb-4">
              <Shield className="w-4 h-4" /> Secure & Compliant
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Designed for Amazon KDP Specs</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-semibold">
              All PDF exports automatically include precise gutters, safety bleed buffers, standard book sizes (6"x9", 8.5"x11"), and optimized vector paths ready for printing.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/studio"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 flex items-center gap-2"
            >
              Create Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🎬 Video Walkthrough Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden p-1 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-white rounded-full transition shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full rounded-2xl overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/2_gP4hR6v8Q?autoplay=1"
                title="KDP Puzzle Book Tutorial"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}