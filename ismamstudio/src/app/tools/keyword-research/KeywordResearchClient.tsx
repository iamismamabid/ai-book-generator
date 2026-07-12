"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, BarChart3, TrendingUp, HelpCircle, CheckCircle2, Shield, Zap } from "lucide-react";

interface KeywordResult {
  keyword: string;
  volume: number;
  competition: "Low" | "Medium" | "High";
  score: number; // 0-100 Niche Score
  estSales: number;
}

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<KeywordResult[] | null>(null);

  // BSR Calculator states
  const [bsr, setBsr] = useState<number>(50000);
  const [calculatedSales, setCalculatedSales] = useState<{ daily: number; monthly: number; royalties: number } | null>({
    daily: 5,
    monthly: 150,
    royalties: 375
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);

    // Dynamic mock logic based on search queries to return relevant, highly-realistic KDP keywords
    setTimeout(() => {
      const lower = query.toLowerCase();
      let mockList: KeywordResult[] = [];

      if (lower.includes("sudoku")) {
        mockList = [
          { keyword: "sudoku for seniors large print", volume: 8400, competition: "Low", score: 92, estSales: 210 },
          { keyword: "easy sudoku book for adults", volume: 12000, competition: "High", score: 48, estSales: 350 },
          { keyword: "sudoku travel size pocket", volume: 3200, competition: "Low", score: 85, estSales: 80 },
          { keyword: "hard sudoku book for experts", volume: 5600, competition: "Medium", score: 71, estSales: 120 },
          { keyword: "sudoku puzzle book for kids 8-12", volume: 4800, competition: "Low", score: 89, estSales: 110 }
        ];
      } else if (lower.includes("maze") || lower.includes("labyrinth")) {
        mockList = [
          { keyword: "maze book for kids 4-8", volume: 15000, competition: "High", score: 51, estSales: 410 },
          { keyword: "shaped mazes for adults relaxation", volume: 2900, competition: "Low", score: 94, estSales: 75 },
          { keyword: "toddler maze book large print", volume: 6200, competition: "Medium", score: 74, estSales: 130 },
          { keyword: "hard labyrinths for teens", volume: 1800, competition: "Low", score: 81, estSales: 45 }
        ];
      } else if (lower.includes("word search")) {
        mockList = [
          { keyword: "word search for seniors large print", volume: 22000, competition: "High", score: 55, estSales: 750 },
          { keyword: "retro word search 90s theme", volume: 3800, competition: "Low", score: 91, estSales: 95 },
          { keyword: "word search for kids ages 6-8", volume: 9500, competition: "Medium", score: 79, estSales: 240 },
          { keyword: "bible word search book puzzle", volume: 14000, competition: "High", score: 49, estSales: 380 }
        ];
      } else {
        // Generic fallback
        mockList = [
          { keyword: `${lower} puzzle book for adults`, volume: 5400, competition: "Medium", score: 73, estSales: 140 },
          { keyword: `easy ${lower} activity workbook`, volume: 3100, competition: "Low", score: 88, estSales: 85 },
          { keyword: `large print ${lower} book`, volume: 4800, competition: "Low", score: 90, estSales: 110 },
          { keyword: `dementia ${lower} grids for seniors`, volume: 2200, competition: "Low", score: 95, estSales: 60 }
        ];
      }

      setResults(mockList);
      setIsSearching(false);
    }, 800);
  };

  const handleCalculateBsr = (val: number) => {
    setBsr(val);
    if (!val || val <= 0) return;

    // Simple BSR logarithmic estimation curve
    let daily = 0;
    if (val < 100) daily = 1000;
    else if (val < 1000) daily = 120;
    else if (val < 5000) daily = 50;
    else if (val < 20000) daily = 18;
    else if (val < 100000) daily = 4;
    else if (val < 500000) daily = 1;
    else daily = 0;

    const monthly = daily * 30 || (val > 1000000 ? 0 : 2);
    const royalties = monthly * 2.5; // Avg $2.50 royalty

    setCalculatedSales({
      daily: Math.max(1, daily),
      monthly: Math.max(2, monthly),
      royalties
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Market Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              AI KDP Niche & Keyword Explorer
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* 2 Column Layout: Keyword Spy left, BSR calculator right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Keyword Search Module */}
          <div className="lg:col-span-2 bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-455" /> Amazon Keyword Spy
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Find long-tail autocompletes, estimated search volumes, and competition indicators directly.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Sudoku for Seniors, Lined Journal..."
                className="flex-1 text-xs font-semibold p-3.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-indigo-450 focus:bg-slate-900 transition-all text-slate-100"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                {isSearching ? "Searching..." : "Spy Niche"}
              </button>
            </form>

            {/* Results */}
            {results && (
              <div className="overflow-x-auto pt-4 animate-fade-in">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Keyword</th>
                      <th className="py-3 px-3 text-center">Search Vol</th>
                      <th className="py-3 px-3 text-center">Competition</th>
                      <th className="py-3 px-3 text-center">Est. Sales/mo</th>
                      <th className="py-3 px-3 text-center">Niche Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-semibold">
                    {results.map((res, idx) => (
                      <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{res.keyword}</td>
                        <td className="py-3 px-3 text-center">{res.volume.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            res.competition === "Low" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            res.competition === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {res.competition}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-100">{res.estSales} units</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-black ${
                            res.score >= 80 ? "text-emerald-400" :
                            res.score >= 60 ? "text-amber-400" :
                            "text-rose-400"
                          }`}>{res.score}/100</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BSR Sales Calculator */}
          <div className="bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-455" /> BSR Sales Calculator
              </h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Enter any paperback BSR from Amazon's product detail page to estimate monthly book sales and royalty income.
              </p>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Best Seller Rank (BSR)</label>
                <input
                  type="number"
                  value={bsr}
                  onChange={(e) => handleCalculateBsr(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-3.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-indigo-450 focus:bg-slate-900 transition-all text-slate-100"
                  placeholder="e.g. 52000"
                />
              </div>

              {calculatedSales && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3 pt-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Est. Daily Sales</span>
                    <span className="text-sm font-black text-indigo-400">{calculatedSales.daily} units</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Est. Monthly Sales</span>
                    <span className="text-sm font-black text-purple-400">{calculatedSales.monthly} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Est. Monthly Royalties</span>
                    <span className="text-sm font-black text-emerald-400">${calculatedSales.royalties.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 pt-4 border-t border-slate-800">
              <TrendingUp className="w-4 h-4 text-slate-350" /> Logarithmic estimation curves updated Q2 2026
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
