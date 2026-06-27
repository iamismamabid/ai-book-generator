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
  Star,
  Layers,
  Sliders,
  Type,
  Maximize2,
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
  },
  {
    id: "novel",
    title: "Cosmic Shadows (Sci-Fi Outline)",
    category: "AI Novel Outline",
    trim: "6\" x 9\"",
    difficulty: "Llama-3 Assisted",
    badge: "Instant Plot Generation",
    desc: "A fully populated 12-chapter novel outline, story blurb, and character structures generated using advanced Groq AI model nodes.",
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  }
];

export default function HomePage() {
  const [activePreview, setActivePreview] = useState<string>("sudoku");
  const [mockSelectedLayer, setMockSelectedLayer] = useState<string>("title");
  const [mockColor, setMockColor] = useState<string>("#f59e0b");
  const [mockScale, setMockScale] = useState<number>(90);

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
              The Ultimate KDP Interior & Cover Creator
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
              Create Best-Selling <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">KDP Books</span> in Minutes
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Produce professional puzzle interiors, AI-assisted stories, shape-masked labyrinths, and gorgeous book covers—all in one place. Compliant with Amazon specifications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/studio"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Open Creator Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/generate"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-slate-900 border border-slate-850 text-slate-350 dark:text-slate-350 font-black text-lg hover:bg-slate-850 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                AI Outline Writer
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                100% KDP bleed & safety compliant
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Studio Canvas Simulator */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl" />
            
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl animate-float">
              
              {/* Studio Canvas Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-2">Ismam Studio Simulator</span>
                </div>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/25">
                  6" x 9" Template
                </span>
              </div>

              {/* Layout Simulator */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* Floating toolbars */}
                <div className="col-span-3 space-y-3">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">Layers</span>
                    <button 
                      onClick={() => setMockSelectedLayer("title")}
                      className={`w-full py-1.5 px-2 rounded text-left text-[9px] font-bold flex items-center gap-1.5 transition-colors ${
                        mockSelectedLayer === "title" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Type className="w-3 h-3" /> Title Text
                    </button>
                    <button 
                      onClick={() => setMockSelectedLayer("maze")}
                      className={`w-full py-1.5 px-2 rounded text-left text-[9px] font-bold flex items-center gap-1.5 transition-colors ${
                        mockSelectedLayer === "maze" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Compass className="w-3 h-3" /> Puzzle Grid
                    </button>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">Colors</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["#f59e0b", "#6366f1", "#10b981", "#ec4899", "#3b82f6", "#ffffff"].map((c) => (
                        <button 
                          key={c}
                          onClick={() => setMockColor(c)}
                          className={`w-full aspect-square rounded-full border transition-transform ${
                            mockColor === c ? "scale-110 border-white" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Canvas */}
                <div className="col-span-9 bg-slate-950 rounded-2xl border border-slate-850 p-4 relative overflow-hidden flex flex-col items-center justify-between min-h-[220px]">
                  
                  {/* Bleed Safety Margin lines */}
                  <div className="absolute inset-2.5 border border-dashed border-rose-500/35 rounded-xl pointer-events-none flex items-start justify-end p-1">
                    <span className="text-[6px] font-bold uppercase tracking-wider text-rose-500/60">Bleed Safety Area</span>
                  </div>

                  {/* Title node */}
                  <div 
                    className={`transition-all duration-300 text-center cursor-pointer mt-4 ${
                      mockSelectedLayer === "title" ? "ring-2 ring-indigo-500 p-1.5 rounded-lg" : ""
                    }`}
                    onClick={() => setMockSelectedLayer("title")}
                  >
                    <span 
                      className="text-sm font-black uppercase tracking-widest block transition-colors duration-300"
                      style={{ color: mockColor }}
                    >
                      THE MAZE MASTER
                    </span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                      100 Shape-Masked Puzzles
                    </span>
                  </div>

                  {/* Puzzle node */}
                  <div 
                    className={`transition-all duration-300 flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 w-[110px] aspect-square relative cursor-pointer my-2 ${
                      mockSelectedLayer === "maze" ? "ring-2 ring-indigo-500" : ""
                    }`}
                    style={{ transform: `scale(${mockScale / 100})` }}
                    onClick={() => setMockSelectedLayer("maze")}
                  >
                    {/* Simulated heart maze grid */}
                    <div className="text-[7px] leading-[1] font-mono text-indigo-400 font-bold select-none text-center">
                      {"###   ###\n##### #####\n###########\n #########\n  #######\n   ###\n    #".split("\n").map((row, idx) => (
                        <div key={idx}>{row}</div>
                      ))}
                    </div>
                  </div>

                  {/* Spine indicators */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l border-dashed border-slate-850 pointer-events-none" />

                </div>

              </div>

              {/* Slider Controller */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <Sliders className="w-3.5 h-3.5" /> Object Scale: {mockScale}%
                </div>
                <input 
                  type="range"
                  min={70}
                  max={110}
                  value={mockScale}
                  onChange={(e) => setMockScale(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

            </div>
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
          <p className="text-slate-400 text-base max-w-lg mx-auto font-semibold">
            Choose from a suite of specialized puzzle builders and cover editors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Book Builder & Cover Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Book & Cover Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Design custom crossword grids and word searches, drag & drop elements, and compile front/back covers in print-ready KDP dimensions.
              </p>
            </div>
            <Link 
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-indigo-400 hover:text-indigo-300 mt-6"
            >
              Open Creator Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. AI Novel Writer */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">AI Novel Writer</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Generate story outlines, structures, blurbs, and text expansions instantly using advanced Llama-3 model nodes.
              </p>
            </div>
            <Link 
              href="/generate"
              className="inline-flex items-center gap-2 text-sm font-black text-purple-400 hover:text-purple-300 mt-6"
            >
              Start Generating <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. Shaped Labyrinth Designer */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Labyrinth Designer</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Create shape-masked maze interiors (Square, Circle, Heart shapes) in clean standard trim sizing with automated solutions key generation.
              </p>
            </div>
            <Link 
              href="/maze"
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-400 hover:text-emerald-300 mt-6"
            >
              Design Mazes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4. Sudoku Generator */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Sudoku Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Compile print-ready Sudoku puzzle grids (Easy, Medium, and Hard) with mathematically guaranteed single-solution uniqueness.
              </p>
            </div>
            <Link 
              href="/sudoku"
              className="inline-flex items-center gap-2 text-sm font-black text-amber-400 hover:text-amber-300 mt-6"
            >
              Generate Sudokus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5. Word Search Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Word Search Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Import custom word lists or CSVs to build unique Word Search grids. Adjust fonts, highlighter options, and export interior sheets.
              </p>
            </div>
            <Link 
              href="/tools/word-search"
              className="inline-flex items-center gap-2 text-sm font-black text-pink-400 hover:text-pink-300 mt-6"
            >
              Open Word Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6. Cryptogram Generator */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Cryptogram Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Create substitution cipher worksheets from custom quote libraries, complete with letter hints and solution keys formatted for publishing.
              </p>
            </div>
            <Link 
              href="/studio/cryptogram"
              className="inline-flex items-center gap-2 text-sm font-black text-yellow-450 hover:text-yellow-300 mt-6"
            >
              Generate Cryptograms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 7. Math Puzzle Builder */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 mb-6 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Math Puzzle Builder</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Generate arithmetic, cross-number, and logic puzzle sheets for children, senior exercises, or educational KDP workbook niches.
              </p>
            </div>
            <Link 
              href="/studio/math-puzzle"
              className="inline-flex items-center gap-2 text-sm font-black text-sky-405 hover:text-sky-300 mt-6"
            >
              Generate Math Puzzles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8. Word Scramble Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mb-6 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Shuffle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Word Scramble Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Scramble custom word lists to build activity worksheets. Customize difficulty, borders, layout guides, and download PDF sheets.
              </p>
            </div>
            <Link 
              href="/studio/word-scramble"
              className="inline-flex items-center gap-2 text-sm font-black text-rose-450 hover:text-rose-300 mt-6"
            >
              Generate Scrambles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 9. Complete Book Compilation */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">KDP Interiors Merge</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Combine your custom puzzles, word searches, and AI-written chapters into a single PDF document formatted directly for KDP upload.
              </p>
            </div>
            <Link 
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-cyan-400 hover:text-cyan-300 mt-6"
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
          <p className="text-slate-400 text-sm font-semibold max-w-md mx-auto">
            Three simple steps to publish your puzzle, activity, or story book directly to Amazon KDP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto relative z-10">
          
          {/* Step 1 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-black text-lg mx-auto">1</div>
            <h3 className="text-white font-bold text-lg">Pick a Creation Engine</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Select one of our specialized tools: Sudoku Studio, Shaped Maze Designer, Word Search, or the AI Novel Chapter Writer.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-purple-500/15 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 font-black text-lg mx-auto">2</div>
            <h3 className="text-white font-bold text-lg">Build & Format</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Customize puzzle complexity, layout shapes, or story parameters, and download print-ready vector PDF interiors.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all">
            <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20 font-black text-lg mx-auto">3</div>
            <h3 className="text-white font-bold text-lg">Wrap Cover & Publish</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Design a gorgeous cover in our canvas based on page counts, compile all sections together, and upload directly to Amazon KDP!
            </p>
          </div>

        </div>
      </section>

      {/* 🔮 Upcoming Feature Teaser: AI Niche Hunter */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-md rounded-[3rem] border border-indigo-900/35 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          {/* Decorative glows */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Coming Q3 2026
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              AI KDP Niche Hunter & Keyword Spy
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
              We are closing the final gap. Stop guessing what sells. Our upcoming spy tool will let you fetch Amazon search volumes, analyze BSR (Best Seller Rank) data, and check competitor margins directly from your Ismam Studio dashboard.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-350 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Real-time search volumes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> BSR sales estimators</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Competition difficulty scores</span>
            </div>
          </div>

          <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-6 py-8 rounded-3xl text-center max-w-[200px] w-full mx-auto md:mx-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-2">Beta Access</span>
            <span className="text-xs text-slate-300 font-semibold block mb-4">Included free for Agency members</span>
            <Link
              href="/#pricing"
              className="inline-block w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition"
            >
              Secure Spot
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
          <p className="text-slate-400 text-sm font-semibold max-w-md mx-auto">
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
                className={`w-full p-6 text-left rounded-3xl border transition-all flex flex-col gap-2 ${
                  activePreview === sample.id 
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
                    <p className="text-slate-400 text-sm font-semibold leading-relaxed">
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

      {/* 💬 Verified Testimonials Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
            <Star className="w-4 h-4 text-indigo-400 fill-indigo-400 animate-pulse" /> Self-Publishers Love Us
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Verified Publisher Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Review 1 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2rem] p-8 flex flex-col justify-between space-y-6">
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              "Ismam Studio saved me hundreds of hours. I generated 12 puzzle books in two weeks, and all passed KDP review on the first attempt! The gutter and bleed guides are incredibly precise."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center font-black text-xs text-slate-950">
                SJ
              </div>
              <div>
                <h4 className="text-white font-black text-sm">Sarah Jenkins</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">KDP Self-Publisher</span>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2rem] p-8 flex flex-col justify-between space-y-6">
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              "The shape-masked mazes (heart and circle) sell like hotcakes on Etsy. Being able to export high-quality vector PDFs is a game changer. Customer support answered my margin questions in 10 minutes."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 flex items-center justify-center font-black text-xs text-slate-950">
                DL
              </div>
              <div>
                <h4 className="text-white font-black text-sm">David L.</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Etsy Shop Owner</span>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-[2rem] p-8 flex flex-col justify-between space-y-6">
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              "The AI Writer outlined my fantasy book chapters beautifully. Merging it with custom puzzle dividers and covers inside the studio makes compiling a breeze! High-quality, fast, and extremely easy."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center font-black text-xs text-slate-950">
                ER
              </div>
              <div>
                <h4 className="text-white font-black text-sm">Elena Rostova</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activity Book Author</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 📊 Metrics / Stats Bar */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900/40 border border-slate-900/60 rounded-[3rem] p-8 md:p-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center backdrop-blur-sm">
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-white bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">54,230+</h3>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 block">Books Compiled</span>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-white bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">12,490+</h3>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 block">Active Authors</span>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-white bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">99.8%</h3>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 block">KDP Approval Rate</span>
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
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">
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

    </div>
  );
}