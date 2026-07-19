"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { analyzeText, readabilityScores, fleschLabel } from "@/components/tools/textStats";
import { BookOpen, Gauge, Info } from "lucide-react";

const SAMPLE =
  "The quick brown fox jumps over the lazy dog. Reading level matters when you publish a book. If your sentences run long and your vocabulary is dense, casual readers will put your book down. Keep it clear. Keep it simple. Your readers will thank you for it.";

export default function ReadabilityCalculator() {
  const [text, setText] = useState<string>("");

  const stats = useMemo(() => analyzeText(text), [text]);
  const scores = useMemo(() => readabilityScores(stats), [stats]);
  const hasText = stats.words >= 10;
  const flesch = Math.max(0, Math.min(100, scores.fleschReadingEase));
  const { label, audience } = fleschLabel(scores.fleschReadingEase);

  const gradeScores = [
    { name: "Flesch-Kincaid Grade", value: scores.fleschKincaidGrade, desc: "US school grade level needed to understand the text" },
    { name: "Gunning Fog Index", value: scores.gunningFog, desc: "Years of formal education needed on first reading" },
    { name: "SMOG Index", value: scores.smog, desc: "Grade level based on polysyllabic word density" },
    { name: "Coleman-Liau Index", value: scores.colemanLiau, desc: "Grade level from characters instead of syllables" },
    { name: "Automated Readability", value: scores.ari, desc: "Grade level from characters and word lengths" },
  ];

  const faqs = [
    {
      q: "What's a good Flesch Reading Ease score for a book?",
      a: "Most bestselling fiction scores 60-80 (roughly 8th-9th grade level); children's and middle-grade books typically score 80 or higher.",
    },
    {
      q: "Why do the five formulas give slightly different grade levels?",
      a: "Each formula weighs sentence length, syllables, or character counts differently — treat them as a range rather than one precise number.",
    },
    {
      q: "Is my text uploaded to a server?",
      a: "No — all scoring happens locally in your browser using standard published formula coefficients.",
    },
  ];

  return (
    <ToolShell
      title="Readability"
      highlight="Calculator"
      subtitle="Score your manuscript with Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, and ARI — all computed instantly in your browser."
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Your Text
              </h3>
              <button
                onClick={() => setText(SAMPLE)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Try a sample
              </button>
            </div>
            <textarea
              rows={16}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a chapter, your book description, or your whole manuscript here (at least 10 words). Nothing is uploaded — analysis runs locally."
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["Words", stats.words],
                ["Sentences", stats.sentences],
                ["Syllables", stats.syllables],
                ["Complex", stats.complexWords],
              ].map(([l, v]) => (
                <div key={l as string} className="bg-slate-950/60 border border-slate-900 rounded-xl p-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{l}</span>
                  <span className="text-sm font-black text-white">{(v as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-6">
          {/* Flesch hero */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/35 border border-indigo-500/20 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" /> Flesch Reading Ease
              </span>
              {hasText && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
                  {label}
                </span>
              )}
            </div>
            <span className="text-5xl font-black text-white">
              {hasText ? scores.fleschReadingEase.toFixed(1) : "—"}
            </span>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 mt-4">
              <div
                className={`h-full rounded-full transition-all ${
                  flesch >= 60 ? "bg-emerald-500" : flesch >= 40 ? "bg-yellow-500" : "bg-rose-500"
                }`}
                style={{ width: `${hasText ? flesch : 0}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-400 mt-3">
              {hasText ? `Suits: ${audience}` : "Paste at least 10 words to see your scores."}
            </p>
          </div>

          {/* Grade-level scores */}
          <div className="space-y-3">
            {gradeScores.map((s) => (
              <div
                key={s.name}
                className="bg-slate-900/35 border border-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-black text-white block">{s.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{s.desc}</span>
                </div>
                <span className="text-xl font-black text-yellow-500 whitespace-nowrap">
                  {hasText ? `Grade ${Math.max(0, s.value).toFixed(1)}` : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Most bestselling fiction scores between grade 4 and 7 — clarity sells. Aim for
              Flesch 60+ for general audiences, or 70+ for children&apos;s and middle-grade books.
              Formulas use standard published coefficients; syllables are estimated heuristically.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
