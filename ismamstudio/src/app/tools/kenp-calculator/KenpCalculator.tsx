"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { BookOpen, Coins, Info, Calculator } from "lucide-react";

// Approximate KENP-per-word ratio: 1 KENP ≈ 187 words (community-observed average)
const WORDS_PER_KENP = 187;

export default function KenpCalculator() {
  const [kenpc, setKenpc] = useState<number>(300);
  const [rate, setRate] = useState<number>(0.0045);
  const [fullReads, setFullReads] = useState<number>(100);
  const [wordCount, setWordCount] = useState<number>(50000);

  const perFullRead = kenpc * rate;
  const monthly = perFullRead * fullReads;
  const yearly = monthly * 12;
  const estimatedKenpc = Math.round(wordCount / WORDS_PER_KENP);

  return (
    <ToolShell
      title="KENP Royalty"
      highlight="Calculator"
      subtitle="Estimate your Kindle Unlimited earnings from KENP page reads. Model different KDP Select fund rates and read-through volumes."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Your Book&apos;s Numbers
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                KENP Count (from your KDP dashboard)
              </label>
              <input
                type="number"
                min={1}
                value={kenpc}
                onChange={(e) => setKenpc(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 font-semibold">
                Found under &quot;Kindle eBook Details&quot; → Kindle Edition Normalized Page Count.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Per-Page Rate — ${rate.toFixed(4)}
              </label>
              <input
                type="range"
                min={0.003}
                max={0.006}
                step={0.0001}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500 font-semibold">
                The KDP Select Global Fund rate fluctuates monthly — recent US rates have hovered
                around $0.004–$0.005 per page.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Full Read-Throughs / Month — {fullReads}
              </label>
              <input
                type="range"
                min={1}
                max={2000}
                value={fullReads}
                onChange={(e) => setFullReads(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <input
                type="number"
                min={0}
                value={fullReads}
                onChange={(e) => setFullReads(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* KENPC estimator */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" /> Don&apos;t know your KENP count?
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Manuscript Word Count
              </label>
              <input
                type="number"
                min={0}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3">
              <span className="text-xs font-bold text-slate-400">Estimated KENP:</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-yellow-500">
                  ~{estimatedKenpc.toLocaleString()}
                </span>
                <button
                  onClick={() => setKenpc(estimatedKenpc)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Use This
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Per Full Read
              </span>
              <span className="text-3xl font-black text-emerald-400">
                ${perFullRead.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Monthly Estimate
              </span>
              <span className="text-3xl font-black text-yellow-500">
                ${monthly.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Yearly Projection
              </span>
              <span className="text-3xl font-black text-indigo-400">
                ${yearly.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" /> Earnings At Different Rates
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900">
                    <th className="py-2 pr-4">Fund Rate</th>
                    <th className="py-2 pr-4">Per Full Read</th>
                    <th className="py-2">Monthly ({fullReads} reads)</th>
                  </tr>
                </thead>
                <tbody>
                  {[0.004, 0.0042, 0.0045, 0.0048, 0.005].map((r) => (
                    <tr
                      key={r}
                      className={`border-b border-slate-900/50 text-xs font-bold ${
                        Math.abs(r - rate) < 0.0001 ? "text-yellow-500" : "text-slate-300"
                      }`}
                    >
                      <td className="py-2.5 pr-4">${r.toFixed(4)}</td>
                      <td className="py-2.5 pr-4">${(kenpc * r).toFixed(2)}</td>
                      <td className="py-2.5">${(kenpc * r * fullReads).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              KENP royalties are paid from the monthly KDP Select Global Fund, so the actual
              per-page rate is only announced after each month closes. Your book must be enrolled
              in KDP Select to earn from Kindle Unlimited page reads. Estimates only.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
