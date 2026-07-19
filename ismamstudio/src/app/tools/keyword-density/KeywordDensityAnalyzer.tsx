"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { splitWords, STOPWORDS } from "@/components/tools/textStats";
import { Search, Hash, Info, AlertTriangle } from "lucide-react";

interface NGramRow {
  phrase: string;
  count: number;
  density: number;
}

function topNGrams(words: string[], n: number, filterStops: boolean, limit = 12): NGramRow[] {
  const counts = new Map<string, number>();
  for (let i = 0; i + n <= words.length; i++) {
    const gram = words.slice(i, i + n);
    if (filterStops) {
      // For 1-grams drop stopwords entirely; for phrases require a non-stopword edge
      if (n === 1 && STOPWORDS.has(gram[0])) continue;
      if (n > 1 && (STOPWORDS.has(gram[0]) || STOPWORDS.has(gram[n - 1]))) continue;
    }
    const key = gram.join(" ");
    if (key.length < 3) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const total = Math.max(1, words.length - n + 1);
  return [...counts.entries()]
    .filter(([, c]) => (n === 1 ? c >= 2 : c >= 2))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase, count]) => ({ phrase, count, density: (count / total) * 100 }));
}

export default function KeywordDensityAnalyzer() {
  const [text, setText] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [filterStops, setFilterStops] = useState<boolean>(true);

  const words = useMemo(() => splitWords(text), [text]);

  const oneGrams = useMemo(() => topNGrams(words, 1, filterStops), [words, filterStops]);
  const twoGrams = useMemo(() => topNGrams(words, 2, filterStops), [words, filterStops]);
  const threeGrams = useMemo(() => topNGrams(words, 3, filterStops), [words, filterStops]);

  const targetStats = useMemo(() => {
    const t = target.trim().toLowerCase();
    if (!t || words.length === 0) return null;
    const tWords = splitWords(t);
    if (tWords.length === 0) return null;
    let count = 0;
    for (let i = 0; i + tWords.length <= words.length; i++) {
      if (tWords.every((w, j) => words[i + j] === w)) count++;
    }
    const density = (count / Math.max(1, words.length - tWords.length + 1)) * 100;
    return { count, density };
  }, [target, words]);

  const faqs = [
    {
      q: "What keyword density should I aim for on Amazon?",
      a: "1-3% density on your primary keyword is generally healthy; above 3% starts to read as keyword stuffing, which this tool flags in red.",
    },
    {
      q: "Should I filter out stopwords?",
      a: "Yes for most analysis — filtering words like \"the\" and \"and\" surfaces the meaningful keywords and phrases readers actually search for.",
    },
    {
      q: "Does this check backend keywords too?",
      a: "You can paste your backend keyword string directly into the analyzer alongside your description to see how phrases repeat across both.",
    },
  ];

  const tableCard = (title: string, rows: NGramRow[]) => (
    <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-3">
      <h3 className="text-sm font-black text-white flex items-center gap-2">
        <Hash className="w-4 h-4 text-indigo-400" /> {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-[11px] font-semibold text-slate-500">
          Not enough repeated phrases yet — paste more text.
        </p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900">
              <th className="py-2 pr-4">Phrase</th>
              <th className="py-2 pr-4">Count</th>
              <th className="py-2">Density</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.phrase} className="border-b border-slate-900/50 text-xs font-bold">
                <td className="py-2 pr-4 text-slate-200">{r.phrase}</td>
                <td className="py-2 pr-4 text-slate-400">{r.count}</td>
                <td className={`py-2 ${r.density > 3 ? "text-rose-400" : "text-emerald-400"}`}>
                  {r.density.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <ToolShell
      title="Keyword Density"
      highlight="Analyzer"
      subtitle="Analyze keyword usage in your book description, blurb, or A+ content. Spot over-optimization before Amazon's algorithm does."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Content To Analyze
            </h3>
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your book description, blurb, or listing content here. Analysis runs locally in your browser."
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Target Keyword (optional)
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. sudoku puzzle book"
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterStops}
                onChange={(e) => setFilterStops(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">
                Filter common stopwords (the, and, of…)
              </span>
            </label>
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 flex justify-between text-xs font-bold">
              <span className="text-slate-400">Total words:</span>
              <span className="text-white">{words.length.toLocaleString()}</span>
            </div>
          </div>

          {/* Target keyword result */}
          {targetStats && (
            <div
              className={`rounded-3xl p-6 border ${
                targetStats.density > 3
                  ? "bg-rose-500/10 border-rose-500/25"
                  : targetStats.count === 0
                    ? "bg-amber-500/10 border-amber-500/25"
                    : "bg-emerald-500/10 border-emerald-500/25"
              }`}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Target: &quot;{target.trim()}&quot;
              </span>
              <div className="flex items-end gap-6">
                <div>
                  <span className="text-3xl font-black text-white">{targetStats.count}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">occurrences</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-white">
                    {targetStats.density.toFixed(2)}%
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-1">density</span>
                </div>
              </div>
              <p className="text-[11px] font-bold mt-2 text-slate-300">
                {targetStats.count === 0
                  ? "Your target keyword doesn't appear in the text — work it in naturally."
                  : targetStats.density > 3
                    ? "Over 3% density reads as keyword stuffing — dial it back."
                    : "Healthy density. Keywords appear naturally without stuffing."}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {words.length < 20 ? (
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-10 text-center">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                Paste at least 20 words to generate keyword density tables.
              </p>
            </div>
          ) : (
            <>
              {tableCard("Top Single Keywords", oneGrams)}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {tableCard("Two-Word Phrases", twoGrams)}
                {tableCard("Three-Word Phrases", threeGrams)}
              </div>
            </>
          )}

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              For Amazon listings, aim for 1–3% density on your primary keyword and use two/three
              word phrases that mirror real shopper searches. Green = healthy, red = potential
              keyword stuffing (&gt;3%).
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
