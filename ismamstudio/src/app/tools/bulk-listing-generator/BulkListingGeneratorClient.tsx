"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Sparkles, Loader2, Download, Copy, Check, Lock, AlertCircle } from "lucide-react";
import { generateBulkKdpListings, checkPremiumStatus, type KdpListingResult } from "@/app/actions";

function toCsv(results: KdpListingResult[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Input", "Title", "Subtitle", "Description", "Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5", "Keyword 6", "Keyword 7", "Category 1", "Category 2"];
  const rows = results.map(r => [
    r.input, r.title, r.subtitle, r.description,
    ...Array.from({ length: 7 }, (_, i) => r.keywords[i] || ""),
    r.categories[0] || "", r.categories[1] || "",
  ].map(escape).join(","));
  return [header.map(escape).join(","), ...rows].join("\n");
}

export default function BulkListingGeneratorClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<{ checked: boolean; isPremium: boolean; plan?: string }>({ checked: false, isPremium: false });
  const [concepts, setConcepts] = useState("Seniors Easy Sudoku Puzzle Book Volume 1\nOcean Animals Word Search for Kids\nRetro Diner Themed Crossword Puzzles");
  const [results, setResults] = useState<KdpListingResult[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      checkPremiumStatus().then((res) => setPremiumStatus(res as any)).catch(() => setPremiumStatus({ checked: true, isPremium: false }));
    } else if (isLoaded) {
      setPremiumStatus({ checked: true, isPremium: false });
    }
  }, [isLoaded, isSignedIn]);

  const conceptLines = concepts.split("\n").map(l => l.trim()).filter(Boolean);
  const maxBatch: number = premiumStatus.plan === "starter" ? 5 : premiumStatus.plan === "pro" ? 15 : premiumStatus.isPremium ? 50 : 0;

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const res = await generateBulkKdpListings(conceptLines);
      if (!res.success) {
        setError(res.error || "Something went wrong.");
      } else {
        setResults(res.results || []);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating listings. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (r: KdpListingResult, index: number) => {
    const text = `TITLE:\n${r.title}\n\nSUBTITLE:\n${r.subtitle}\n\nDESCRIPTION:\n${r.description}\n\nKEYWORDS:\n${r.keywords.join(", ")}\n\nCATEGORIES:\n${r.categories.join(" | ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleExportCsv = () => {
    if (!results) return;
    const blob = new Blob([toCsv(results)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kdp-bulk-listings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (premiumStatus.checked && !premiumStatus.isPremium) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">Bulk KDP Listing Generator is a Premium Tool</h1>
          <p className="text-slate-400 text-sm">
            Generate AI-written Amazon titles, subtitles, descriptions, backend keywords, and category suggestions for a whole batch of books at once. Available on Starter, Pro, and Agency plans.
          </p>
          <Link href="/pricing" className="block w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3.5 rounded-2xl shadow-lg">
            View Pricing Plans
          </Link>
          <Link href="/tools" className="block text-slate-500 hover:text-slate-300 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Bulk KDP Listing Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Paste one book title or concept per line — get an AI-written title, subtitle, description, 7 keywords, and category suggestions for each, ready to paste into KDP.
            </p>
          </div>
        </div>

        {premiumStatus.checked && (
          <p className="text-xs font-bold text-indigo-500 mb-4">
            Your plan allows up to {maxBatch} book{maxBatch === 1 ? "" : "s"} per batch.
          </p>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
          <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Book Titles / Concepts (one per line)</label>
          <textarea
            value={concepts}
            onChange={(e) => setConcepts(e.target.value)}
            rows={6}
            className="w-full mt-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl p-3 text-sm font-mono resize-none outline-none focus:border-indigo-500"
            placeholder={"Seniors Easy Sudoku Puzzle Book Volume 1\nOcean Animals Word Search for Kids"}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400 font-semibold">{conceptLines.length} concept{conceptLines.length === 1 ? "" : "s"} entered{maxBatch ? ` (max ${maxBatch})` : ""}</span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || conceptLines.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md active:scale-95 transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "Generating..." : "Generate Listings"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-semibold p-4 rounded-2xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleExportCsv} className="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl">
                <Download className="w-3.5 h-3.5" /> Export All as CSV
              </button>
            </div>

            {results.map((r, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Concept: {r.input}</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{r.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold italic">{r.subtitle}</p>
                  </div>
                  <button onClick={() => handleCopy(r, i)} className="shrink-0 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl">
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === i ? "Copied" : "Copy"}
                  </button>
                </div>

                {r.error ? (
                  <p className="text-rose-500 text-sm font-semibold">{r.error}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">{r.description}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">7 Backend Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {r.keywords.map((k, ki) => (
                            <span key={ki} className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg">{k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Suggested Categories</span>
                        <div className="space-y-1">
                          {r.categories.map((c, ci) => (
                            <p key={ci} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{c}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
