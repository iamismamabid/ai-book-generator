"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Maximize2, Sparkles, Download, Check } from "lucide-react";

interface ExampleItem {
  id: string;
  title: string;
  category: string;
  trim: string;
  difficulty: string;
  badge: string;
  desc: string;
  bgGradient: string;
  previewType: "sudoku" | "maze" | "word-search" | "novel";
}

const EXAMPLES_LIST: ExampleItem[] = [
  {
    id: "sudoku-med",
    title: "Classic Sudoku (Medium Challenge)",
    category: "Sudoku",
    trim: "8.5\" x 11\"",
    difficulty: "Medium",
    badge: "Large Print Grids",
    desc: "Mathematical grids with 32 starting numbers, crisp lines, and dedicated solution page mapping.",
    bgGradient: "from-amber-500/10 via-slate-900 to-transparent",
    previewType: "sudoku"
  },
  {
    id: "heart-labyrinth",
    title: "Heart-Masked Maze Interior",
    category: "Labyrinths",
    trim: "8.5\" x 11\"",
    difficulty: "Mixed",
    badge: "Unique Shape-Masking",
    desc: "Custom shaped labyrinth utilizing a heart outline vector mask. Perfect for Valentine's Day niches.",
    bgGradient: "from-emerald-500/10 via-slate-900 to-transparent",
    previewType: "maze"
  },
  {
    id: "seniors-word-search",
    title: "Seniors Retro Word Search",
    category: "Word Search",
    trim: "8.5\" x 11\"",
    difficulty: "Large Font",
    badge: "Custom CSV Import",
    desc: "A 15-word grid using large font sizes (16pt+) for senior readers. Clear highlight solutions included.",
    bgGradient: "from-pink-500/10 via-slate-900 to-transparent",
    previewType: "word-search"
  },
  {
    id: "sci-fi-novel-chapters",
    title: "The Stellar Drift Outline",
    category: "AI Outline",
    trim: "6\" x 9\"",
    difficulty: "Llama-3 Turbo",
    badge: "Groq AI Generation",
    desc: "A fully populated 12-chapter space opera plot, character descriptions, and blurb ready for formatting.",
    bgGradient: "from-purple-500/10 via-slate-900 to-transparent",
    previewType: "novel"
  }
];

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = selectedCategory === "all" 
    ? EXAMPLES_LIST 
    : EXAMPLES_LIST.filter(item => item.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-900 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Spec Gallery
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              KDP Interior & Cover Gallery
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-2">
              Browse examples of the professional PDF grids and outlines produced by our engines.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900 p-1 rounded-2xl border border-slate-900 w-fit">
          {["all", "sudoku", "labyrinths", "word search", "outline"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all ${
                selectedCategory === cat 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {cat === "labyrinths" ? "Mazes" : cat}
            </button>
          ))}
        </div>

        {/* Grid of Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-950/45 border border-slate-900 rounded-[2.5rem] p-8 bg-gradient-to-br ${item.bgGradient} flex flex-col sm:flex-row gap-8 items-center justify-between hover:border-slate-800 transition-all`}
            >
              <div className="space-y-4 max-w-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  {item.badge}
                </span>
                <h3 className="text-2xl font-black text-white">{item.title}</h3>
                <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
                  {item.desc}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Trim: <strong className="text-white">{item.trim}</strong></span>
                  <span>Type: <strong className="text-white">{item.category}</strong></span>
                </div>
                <div className="pt-2">
                  <Link
                    href={item.category === "Sudoku" ? "/sudoku" : item.category === "Labyrinths" ? "/maze" : item.category === "Word Search" ? "/tools/word-search" : "/generate"}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 dark:text-slate-300 border border-slate-800 hover:border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    Open Generator <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Graphic Visual Representation of the PDF page */}
              <div className="w-full max-w-[170px] aspect-[1/1.4] bg-white rounded-xl shadow-2xl p-4 border border-slate-200 flex flex-col justify-between items-center text-slate-900 relative shrink-0">
                <div className="w-full text-center border-b border-slate-200 pb-1.5">
                  <span className="text-[5px] font-black tracking-widest uppercase block text-slate-400">KDP Interior Spec</span>
                  <span className="text-[7px] font-black uppercase text-indigo-600">{item.category}</span>
                </div>

                {/* Dynamic graphics */}
                {item.previewType === "sudoku" && (
                  <div className="w-full grid grid-cols-4 gap-0.5 border border-slate-900 p-0.5 bg-slate-500">
                    {"4132324124131324".split("").map((num, i) => (
                      <div key={i} className="aspect-square flex items-center justify-center text-[7px] font-bold border border-slate-100 bg-slate-50">{num}</div>
                    ))}
                  </div>
                )}
                {item.previewType === "maze" && (
                  <div className="w-full flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded aspect-square">
                    <div className="text-[6px] font-mono leading-none select-none text-slate-600 font-black">
                      {"#####\n#S  #\n# #E#\n#####".split("\n").map((r, i) => (
                        <div key={i}>{r}</div>
                      ))}
                    </div>
                  </div>
                )}
                {item.previewType === "word-search" && (
                  <div className="w-full font-mono text-[6px] leading-tight select-none text-center bg-slate-50 border border-slate-100 p-1.5 rounded">
                    {"A B C\nD E F\nG H I".split("\n").map((r, i) => (
                      <div key={i} className="tracking-wider">{r}</div>
                    ))}
                  </div>
                )}
                {item.previewType === "novel" && (
                  <div className="w-full space-y-1.5 py-1">
                    <div className="h-1 bg-slate-300 w-1/3 rounded" />
                    <div className="h-0.5 bg-slate-200 w-full rounded" />
                    <div className="h-0.5 bg-slate-200 w-4/5 rounded" />
                    <div className="h-0.5 bg-slate-200 w-11/12 rounded" />
                  </div>
                )}

                <div className="w-full text-center border-t border-slate-100 pt-1 flex justify-between items-center text-[5px] font-black text-slate-500">
                  <span>Page 14</span>
                  <span>KDPage</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
