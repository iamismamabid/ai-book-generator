"use client";

import { useState, useEffect } from "react";
import { Grid3x3, Palette, Loader2, Shuffle, KeyRound, Calculator, ArrowRight, Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic import for FabricCoverStudio to prevent server-side rendering errors
const FabricCoverStudio = dynamic(() => import("@/components/FabricCoverStudio"), { ssr: false });

// Import our BookBuilder component!
import BookBuilder from "../../components/BookBuilder";

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

const PUZZLE_TOOLS = [
  {
    href: "/studio/word-scramble",
    icon: Shuffle,
    title: "Word Scramble",
    description: "Generate print-ready word scramble puzzle books with custom word lists, difficulty settings, and KDP-safe PDF export.",
    badge: "New",
    color: "indigo",
  },
  {
    href: "/studio/cryptogram",
    icon: KeyRound,
    title: "Cryptogram",
    description: "Create substitution cipher quote puzzles. Generate a unique letter mapping and export multi-page puzzle books.",
    badge: "New",
    color: "violet",
  },
  {
    href: "/studio/math-puzzle",
    icon: Calculator,
    title: "Math Puzzle Grid",
    description: "Build addition equation grids, multiplication times tables, and number sums logic puzzles for all ages.",
    badge: "New",
    color: "emerald",
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  indigo: {
    bg: "from-indigo-500/10 to-indigo-600/5",
    border: "border-indigo-200 hover:border-indigo-400",
    icon: "text-indigo-500 bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-600/5",
    border: "border-violet-200 hover:border-violet-400",
    icon: "text-violet-500 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-200 hover:border-emerald-400",
    icon: "text-emerald-500 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

export default function MasterStudioApp() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [activeTab, setActiveTab] = useState<'interior' | 'cover' | 'tools'>('interior');
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(100);

  const [backCoverColor, setBackCoverColor] = useState('#0F172A');
  const [backCoverType, setBackCoverType] = useState<'solid' | 'gradient'>('solid');
  const [backCoverGradientStart, setBackCoverGradientStart] = useState('#0F172A');
  const [backCoverGradientEnd, setBackCoverGradientEnd] = useState('#020617');

  const [frontCoverColor, setFrontCoverColor] = useState('#1E293B');
  const [frontCoverType, setFrontCoverType] = useState<'solid' | 'gradient'>('solid');
  const [frontCoverGradientStart, setFrontCoverGradientStart] = useState('#1E293B');
  const [frontCoverGradientEnd, setFrontCoverGradientEnd] = useState('#0F172A');

  const [coverElements, setCoverElements] = useState<any[]>([]);
  const [showKdpGuides, setShowKdpGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Cover Math
  const spineWidth = pageCount * 0.002252;

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col overflow-hidden">

      {/* APP HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center max-w-[1600px] mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">AI</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">KDP Master Studio</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Premium Cover & Interior Creator</p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-slate-200/80 p-1 rounded-full shadow-inner border border-slate-300/40">
          <button
            onClick={() => setActiveTab('interior')}
            className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'interior' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Grid3x3 className="w-4 h-4"/> Book Builder
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'cover' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Palette className="w-4 h-4"/> Cover Studio
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'tools' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Sparkles className="w-4 h-4"/> Puzzle Tools
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto">

        {/* ================= 1. INTERIOR COMPONENT ================= */}
        {activeTab === 'interior' && (
          <div className="animate-in fade-in duration-300 w-full h-full">
            <BookBuilder
              coverState={{
                coverElements,
                frontCoverColor,
                backCoverColor,
                frontCoverType,
                backCoverType,
                frontCoverGradientStart,
                frontCoverGradientEnd,
                backCoverGradientStart,
                backCoverGradientEnd,
                spineWidth,
                trimSize
              }}
            />
          </div>
        )}

        {/* ================= 2. COVER STUDIO COMPONENT ================= */}
        {activeTab === 'cover' && (
          <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
            <FabricCoverStudio
              trimSize={trimSize}
              setTrimSize={setTrimSize}
              pageCount={pageCount}
              setPageCount={setPageCount}

              backCoverColor={backCoverColor}
              setBackCoverColor={setBackCoverColor}
              backCoverType={backCoverType}
              setBackCoverType={setBackCoverType}
              backCoverGradientStart={backCoverGradientStart}
              setBackCoverGradientStart={setBackCoverGradientStart}
              backCoverGradientEnd={backCoverGradientEnd}
              setBackCoverGradientEnd={setBackCoverGradientEnd}

              frontCoverColor={frontCoverColor}
              setFrontCoverColor={setFrontCoverColor}
              frontCoverType={frontCoverType}
              setFrontCoverType={setFrontCoverType}
              frontCoverGradientStart={frontCoverGradientStart}
              setFrontCoverGradientStart={setFrontCoverGradientStart}
              frontCoverGradientEnd={frontCoverGradientEnd}
              setFrontCoverGradientEnd={setFrontCoverGradientEnd}

              showKdpGuides={showKdpGuides}
              setShowKdpGuides={setShowKdpGuides}
              snapToGrid={snapToGrid}
              setSnapToGrid={setSnapToGrid}
              initialElements={coverElements}
              onSaveWorkspace={(elements) => {
                setCoverElements(elements);
              }}
            />
          </div>
        )}

        {/* ================= 3. PUZZLE TOOLS LAUNCHER ================= */}
        {activeTab === 'tools' && (
          <div className="animate-in fade-in duration-300">
            {/* Hero section */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-black uppercase text-amber-700 tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> KDP Puzzle Book Tools
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Generate Puzzle Books</h2>
              <p className="text-slate-500 text-sm font-semibold max-w-xl mx-auto">
                Build print-ready KDP puzzle books in seconds. Each tool generates a live preview and exports a fully formatted PDF.
              </p>
            </div>

            {/* Tool cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {PUZZLE_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const colors = COLOR_MAP[tool.color];
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`group relative flex flex-col p-6 bg-white rounded-2xl border-2 ${colors.border} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                  >
                    {/* Background gradient glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon} shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${colors.badge}`}>
                          {tool.badge}
                        </span>
                      </div>

                      {/* Title & description */}
                      <h3 className="text-lg font-black text-slate-900 mb-2">{tool.title}</h3>
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed flex-1">{tool.description}</p>

                      {/* CTA footer */}
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors">
                        Open Generator
                        <ArrowRight className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick tips section */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h4 className="text-sm font-black uppercase text-amber-400 tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4"/> Pro Tips for KDP Puzzle Books
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tip: "Use 6\" × 9\" trim", detail: "The most popular KDP size. Words have room to breathe without wasted space." },
                  { tip: "Enable bleed edges", detail: "Add 0.125\" bleed on all sides so colored backgrounds print to the full edge." },
                  { tip: "Always include answer key", detail: "Amazon customers expect answer pages — include one at the end of every puzzle book." }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                    <p className="text-xs font-black text-white mb-1">{item.tip}</p>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}