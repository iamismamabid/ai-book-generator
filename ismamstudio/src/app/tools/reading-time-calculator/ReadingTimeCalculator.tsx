"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Clock, BookOpen, Mic, FileText, Info } from "lucide-react";

const SPEED_PRESETS = [
  { label: "Slow / Careful", wpm: 150 },
  { label: "Average Adult", wpm: 238 },
  { label: "Fast Reader", wpm: 300 },
  { label: "Skimming", wpm: 450 },
];

const WORDS_PER_PAGE = 275; // typical 6x9 trade paperback
const NARRATION_WPM = 150; // typical audiobook narration speed

function formatDuration(totalMinutes: number): string {
  if (!isFinite(totalMinutes) || totalMinutes <= 0) return "0 min";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
}

export default function ReadingTimeCalculator() {
  const [mode, setMode] = useState<"count" | "paste">("count");
  const [wordCount, setWordCount] = useState<number>(50000);
  const [text, setText] = useState<string>("");
  const [wpm, setWpm] = useState<number>(238);

  const pastedWords = text.trim() ? text.trim().split(/\s+/).length : 0;
  const words = mode === "count" ? wordCount : pastedWords;

  const readingMinutes = words / wpm;
  const narrationMinutes = words / NARRATION_WPM;
  const pages = Math.ceil(words / WORDS_PER_PAGE);

  const faqs = [
    {
      q: "How accurate is the reading time estimate?",
      a: "It's based on average adult silent-reading speed (~238 words per minute) and will vary by reader and genre — use the speed slider to model faster or slower readers.",
    },
    {
      q: "How is audiobook length estimated?",
      a: "From standard professional narration pace (~150 words per minute), which is what ACX and most audiobook producers use to estimate finished-hour length.",
    },
    {
      q: "Does pasted text get uploaded anywhere?",
      a: "No — word counting and analysis happen entirely in your browser; nothing you paste is sent to a server.",
    },
  ];

  return (
    <ToolShell
      title="Reading Time"
      highlight="Calculator"
      subtitle="Estimate how long readers need to finish your book — plus audiobook length and printed page estimates."
      maxWidth="max-w-5xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Your Manuscript
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("count")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                  mode === "count"
                    ? "bg-indigo-600/20 border-indigo-500 text-white"
                    : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                }`}
              >
                Enter Word Count
              </button>
              <button
                onClick={() => setMode("paste")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                  mode === "paste"
                    ? "bg-indigo-600/20 border-indigo-500 text-white"
                    : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                }`}
              >
                Paste Text
              </button>
            </div>

            {mode === "count" ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Total Word Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Paste Your Text ({pastedWords.toLocaleString()} words)
                </label>
                <textarea
                  rows={7}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a chapter or your whole manuscript here — everything stays in your browser."
                  className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Reading Speed — {wpm} WPM
              </label>
              <input
                type="range"
                min={100}
                max={600}
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="grid grid-cols-2 gap-2">
                {SPEED_PRESETS.map((p) => (
                  <button
                    key={p.wpm}
                    onClick={() => setWpm(p.wpm)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      wpm === p.wpm
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {p.label} ({p.wpm})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/35 border border-indigo-500/20 rounded-[2rem] p-8 text-center">
            <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Estimated Reading Time
            </span>
            <span className="text-5xl font-black text-white tracking-tight">
              {formatDuration(readingMinutes)}
            </span>
            <p className="text-xs font-bold text-slate-400 mt-2">
              {words.toLocaleString()} words at {wpm} words per minute
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6">
              <Mic className="w-5 h-5 text-yellow-500 mb-2" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Audiobook Length
              </span>
              <span className="text-2xl font-black text-yellow-500">
                {formatDuration(narrationMinutes)}
              </span>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                At standard narration pace (~{NARRATION_WPM} wpm). ACX pays per finished hour.
              </p>
            </div>
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6">
              <BookOpen className="w-5 h-5 text-emerald-400 mb-2" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Estimated Print Pages
              </span>
              <span className="text-2xl font-black text-emerald-400">~{pages.toLocaleString()}</span>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                Based on ~{WORDS_PER_PAGE} words per page (6&quot;×9&quot; trade paperback).
              </p>
            </div>
          </div>

          {/* Common book length reference */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-black text-white">Reference: Typical Book Lengths</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900">
                    <th className="py-2 pr-4">Format</th>
                    <th className="py-2 pr-4">Words</th>
                    <th className="py-2">Reading Time @ {wpm} wpm</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Short story", 7500],
                    ["Novella", 30000],
                    ["Standard novel", 80000],
                    ["Epic fantasy", 120000],
                    ["Non-fiction guide", 50000],
                  ].map(([label, w]) => (
                    <tr key={label as string} className="border-b border-slate-900/50 text-xs font-bold text-slate-300">
                      <td className="py-2.5 pr-4">{label}</td>
                      <td className="py-2.5 pr-4">{(w as number).toLocaleString()}</td>
                      <td className="py-2.5">{formatDuration((w as number) / wpm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              The 238 wpm default comes from a widely cited meta-analysis of adult silent-reading
              speeds for non-fiction English text. Pasted text never leaves your browser.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
