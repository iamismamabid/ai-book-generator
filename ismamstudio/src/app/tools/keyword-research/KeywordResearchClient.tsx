"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, Sparkles, BarChart3, TrendingUp, HelpCircle,
  CheckCircle2, Shield, Zap, Copy, Check, Filter, Layers, Info,
  Star, BookOpen, Loader2, AlertTriangle
} from "lucide-react";
import type { CompetingBook } from "@/app/api/keyword-research/route";

interface KeywordResult {
  keyword: string;
  volume: number;
  competition: "Low" | "Medium" | "High";
  score: number; // 0-100 Niche Score
  estSales: number;
}

// Anchor points calibrated against publicly documented BSR-to-daily-sales
// benchmarks (Kindlepreneur and similar publisher-reported comparisons).
// Values between anchors are interpolated log-log (power-law), which is how
// real BSR calculators work, instead of a coarse step function — a flat
// bucket badly overestimates sales in the long tail (BSR 50k-500k), which is
// where most real KDP books actually sit.
const BSR_SALES_ANCHORS: [bsr: number, dailySales: number][] = [
  [1, 1500],
  [100, 800],
  [1000, 100],
  [5000, 40],
  [10000, 20],
  [20000, 8],
  [50000, 2],
  [100000, 0.5],
  [300000, 0.15],
  [1000000, 0.02],
];

function estimateDailySalesFromBsr(bsr: number): number {
  const anchors = BSR_SALES_ANCHORS;
  if (bsr <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (bsr >= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [x1, y1] = anchors[i];
    const [x2, y2] = anchors[i + 1];
    if (bsr >= x1 && bsr <= x2) {
      const t = (Math.log(bsr) - Math.log(x1)) / (Math.log(x2) - Math.log(x1));
      return Math.exp(Math.log(y1) + t * (Math.log(y2) - Math.log(y1)));
    }
  }
  return 0;
}

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<KeywordResult[] | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);
  const [backendSlots, setBackendSlots] = useState<string[]>(["", "", "", "", "", "", ""]);

  // Real competing-book data, sourced live from Google Books (not Amazon —
  // Amazon has no public API for search volume or BSR; see BSR calculator below
  // for turning a manually-entered Amazon BSR into a sales estimate instead).
  const [competingBooks, setCompetingBooks] = useState<CompetingBook[] | null>(null);
  const [totalBooksFound, setTotalBooksFound] = useState<number | null>(null);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);

  // BSR Calculator states
  const [bsr, setBsr] = useState<number>(50000);
  const [calculatedSales, setCalculatedSales] = useState<{ daily: number; monthly: number; royalties: number } | null>(() => {
    const daily = estimateDailySalesFromBsr(50000);
    const monthly = daily * 30;
    return {
      daily: Math.round(daily * 100) / 100,
      monthly: Math.round(monthly),
      royalties: Math.round(monthly * 2.5 * 100) / 100
    };
  });

  const fetchCompetingBooks = async (searchTerm: string) => {
    setIsSearchingBooks(true);
    setBooksError(null);
    setCompetingBooks(null);
    try {
      const res = await fetch(`/api/keyword-research?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch competing books");
      }
      setCompetingBooks(data.books);
      setTotalBooksFound(data.totalItems);
    } catch (err) {
      setBooksError(err instanceof Error ? err.message : "Failed to fetch competing books");
    } finally {
      setIsSearchingBooks(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setIsSearching(true);
    setQuery(searchTerm);
    fetchCompetingBooks(searchTerm);

    setTimeout(() => {
      const lower = searchTerm.toLowerCase();
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
      } else if (lower.includes("word search") || lower.includes("wordsearch")) {
        mockList = [
          { keyword: "word search for seniors large print", volume: 22000, competition: "High", score: 55, estSales: 750 },
          { keyword: "retro word search 90s theme", volume: 3800, competition: "Low", score: 91, estSales: 95 },
          { keyword: "word search for kids ages 6-8", volume: 9500, competition: "Medium", score: 79, estSales: 240 },
          { keyword: "bible word search book puzzle", volume: 14000, competition: "High", score: 49, estSales: 380 }
        ];
      } else if (lower.includes("cryptogram") || lower.includes("crypto")) {
        mockList = [
          { keyword: "cryptogram puzzle books for adults large print", volume: 4200, competition: "Low", score: 88, estSales: 90 },
          { keyword: "inspirational quotes cryptograms", volume: 2800, competition: "Low", score: 84, estSales: 65 },
          { keyword: "funny cryptograms books", volume: 1500, competition: "Low", score: 78, estSales: 30 }
        ];
      } else if (lower.includes("kakuro") || lower.includes("cross sum")) {
        mockList = [
          { keyword: "kakuro puzzle books for adults", volume: 1900, competition: "Low", score: 82, estSales: 40 },
          { keyword: "extreme kakuro grids", volume: 900, competition: "Low", score: 73, estSales: 15 },
          { keyword: "kakuro and sudoku cross sums", volume: 1200, competition: "Low", score: 79, estSales: 25 }
        ];
      } else {
        mockList = [
          { keyword: `${lower} puzzle book for adults`, volume: 5400, competition: "Medium", score: 73, estSales: 140 },
          { keyword: `easy ${lower} activity workbook`, volume: 3100, competition: "Low", score: 88, estSales: 85 },
          { keyword: `large print ${lower} book`, volume: 4800, competition: "Low", score: 90, estSales: 110 },
          { keyword: `dementia ${lower} grids for seniors`, volume: 2200, competition: "Low", score: 95, estSales: 60 }
        ];
      }

      setResults(mockList);
      setIsSearching(false);
    }, 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    handleSearch(query);
  };

  const handleCalculateBsr = (val: number) => {
    setBsr(val);
    if (!val || val <= 0) return;

    const daily = estimateDailySalesFromBsr(val);
    const monthly = daily * 30;
    const royalties = monthly * 2.5; // Avg $2.50 royalty

    setCalculatedSales({
      daily: Math.round(daily * 100) / 100,
      monthly: Math.round(monthly),
      royalties: Math.round(royalties * 100) / 100
    });
  };

  // Toggle keyword selection for 7 backend slots
  const toggleKeywordSelection = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

  // Pack selected keywords into 7 KDP backend slots (50 character limit each)
  useEffect(() => {
    if (selectedKeywords.length === 0) {
      setBackendSlots(["", "", "", "", "", "", ""]);
      return;
    }

    // Extract all unique words, remove common fillers
    const fillerWords = new Set([
      "a", "an", "the", "book", "books", "puzzle", "puzzles", 
      "by", "for", "in", "to", "and", "or", "of", "with", "at", "from"
    ]);

    const words: string[] = [];
    selectedKeywords.forEach(phrase => {
      phrase.toLowerCase().split(/\s+/).forEach(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, "");
        if (cleaned && !fillerWords.has(cleaned) && !words.includes(cleaned)) {
          words.push(cleaned);
        }
      });
    });

    // Pack words into 7 slots
    const slots: string[] = ["", "", "", "", "", "", ""];
    let currentSlotIdx = 0;

    words.forEach(word => {
      if (currentSlotIdx >= 7) return;

      const currentSlotContent = slots[currentSlotIdx];
      const proposedContent = currentSlotContent ? `${currentSlotContent} ${word}` : word;

      if (proposedContent.length <= 50) {
        slots[currentSlotIdx] = proposedContent;
      } else {
        currentSlotIdx++;
        if (currentSlotIdx < 7) {
          slots[currentSlotIdx] = word;
        }
      }
    });

    setBackendSlots(slots);
  }, [selectedKeywords]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSlot(index);
    setTimeout(() => setCopiedSlot(null), 2000);
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
              KDP Niche & Keyword Explorer
            </h1>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
        </div>

        {/* Niche Quick Filters */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-900 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Puzzle Niches:
          </span>
          {["Sudoku", "Word Search", "Mazes", "Cryptograms", "Kakuro"].map(niche => (
            <button
              key={niche}
              onClick={() => handleSearch(niche)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition cursor-pointer"
            >
              {niche}
            </button>
          ))}
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Keyword Search Module */}
          <div className="lg:col-span-2 bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Long-Tail Phrase Ideas
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Long-tail phrase variations to fill your 7 backend keyword slots. <span className="text-amber-400">Amazon doesn't publish keyword search-volume data</span> — the volume/competition/score numbers below are a directional heuristic, not measured stats. For real, live data, see Competing Books below.
            </p>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Sudoku for Seniors, Lined Journal..."
                className="flex-1 text-xs font-semibold p-3.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-indigo-400 focus:bg-slate-900 transition-all text-slate-100"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {isSearching ? "Searching..." : "Spy Niche"}
              </button>
            </form>

            {/* Results Table */}
            {results && (
              <div className="overflow-x-auto pt-4 animate-fade-in">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">Select</th>
                      <th className="py-3 px-3">Keyword</th>
                      <th className="py-3 px-3 text-center">Search Vol</th>
                      <th className="py-3 px-3 text-center">Competition</th>
                      <th className="py-3 px-3 text-center">Est. Sales/mo</th>
                      <th className="py-3 px-3 text-center">Niche Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-semibold">
                    {results.map((res, idx) => {
                      const isSelected = selectedKeywords.includes(res.keyword);
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => toggleKeywordSelection(res.keyword)}
                          className={`border-b border-slate-900 hover:bg-slate-900/20 transition-colors cursor-pointer ${
                            isSelected ? "bg-indigo-500/5 text-white" : ""
                          }`}
                        >
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleKeywordSelection(res.keyword)}
                              className="rounded border-slate-800 accent-indigo-500 cursor-pointer"
                            />
                          </td>
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
                              res.score >= 60 ? "text-yellow-400" :
                              "text-rose-400"
                            }`}>{res.score}/100</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BSR Sales Calculator */}
          <div className="bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> BSR Sales Calculator
              </h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Enter any paperback BSR from Amazon's product detail page to estimate monthly book sales and royalty income.
              </p>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Best Seller Rank (BSR)</label>
                <input
                  type="number"
                  value={bsr}
                  onChange={(e) => handleCalculateBsr(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-3.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 transition-all text-slate-100"
                  placeholder="e.g. 52000"
                />
              </div>

              {calculatedSales && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 space-y-3 pt-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Est. Daily Sales</span>
                    <span className="text-sm font-black text-indigo-400">{calculatedSales.daily} units</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Est. Monthly Sales</span>
                    <span className="text-sm font-black text-purple-400">{calculatedSales.monthly} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Est. Monthly Royalties</span>
                    <span className="text-sm font-black text-emerald-400">${calculatedSales.royalties.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-2 pt-4 border-t border-slate-800">
              <TrendingUp className="w-4 h-4 text-slate-500" /> Logarithmic estimation curves updated Q2 2026
            </div>
          </div>

        </div>

        {/* Real Competing Books — live data via Google Books */}
        <div className="bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  Real Competing Books
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Data
                  </span>
                </h2>
                <p className="text-slate-500 text-xs font-semibold mt-1">
                  Actual published titles, ratings, and page counts for this search — pulled live from Google Books, since Amazon doesn't provide this publicly.
                </p>
              </div>
            </div>
            {totalBooksFound !== null && !isSearchingBooks && (
              <div className="text-right shrink-0">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Published Titles Found</span>
                <span className={`text-lg font-black ${
                  totalBooksFound > 1000 ? "text-rose-400" : totalBooksFound > 200 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {totalBooksFound.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {!query && !isSearchingBooks && (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed text-slate-500 font-semibold text-xs">
              Run a search above to see real competing books for that niche.
            </div>
          )}

          {isSearchingBooks && (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900 flex flex-col items-center gap-2 text-slate-400 text-xs font-bold">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> Fetching real book data...
            </div>
          )}

          {booksError && (
            <div className="p-4 bg-rose-50/5 border border-rose-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-rose-300">{booksError}</span>
            </div>
          )}

          {competingBooks && competingBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competingBooks.slice(0, 12).map((book) => (
                <div key={book.id} className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex gap-3">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-md" />
                  ) : (
                    <div className="w-14 h-20 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-slate-700" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-black text-white leading-snug line-clamp-2">{book.title}</p>
                    {book.authors.length > 0 && (
                      <p className="text-[10px] text-slate-500 font-semibold truncate">{book.authors.join(", ")}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {book.averageRating !== null && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {book.averageRating}
                          {book.ratingsCount !== null && <span className="text-slate-500 font-semibold"> ({book.ratingsCount})</span>}
                        </span>
                      )}
                      {book.pageCount !== null && (
                        <span className="text-[10px] text-slate-500 font-semibold">{book.pageCount}pg</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {competingBooks && competingBooks.length === 0 && (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed text-slate-500 font-semibold text-xs">
              No published books found matching this search — could mean very low competition, or a very narrow phrase.
            </div>
          )}
        </div>

        {/* 7 KDP Backend Slots Generator */}
        <div className="bg-slate-900/55 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-black text-white">KDP 7 Backend Keywords Packer</h2>
              <p className="text-slate-500 text-xs font-semibold">
                Amazon KDP lets you upload 7 backend keyword slots. This tool packs selected keywords without repeating words, respecting the 50-character limit.
              </p>
            </div>
          </div>

          {selectedKeywords.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed text-slate-500 font-semibold text-xs flex flex-col items-center gap-2">
              <Info className="w-6 h-6 text-indigo-500" />
              <span>No keywords selected. Tick checkboxes in the search results table to auto-generate KDP slots.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {backendSlots.map((slot, index) => (
                <div key={index} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 relative group flex flex-col justify-between min-h-[120px]">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-indigo-400 uppercase">Slot {index + 1}</span>
                      <span className={`text-[9px] font-bold ${slot.length > 45 ? "text-amber-500" : "text-slate-500"}`}>
                        {slot.length}/50
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 break-words leading-relaxed">
                      {slot || <span className="text-slate-600 italic">Empty</span>}
                    </p>
                  </div>
                  
                  {slot && (
                    <button
                      onClick={() => copyToClipboard(slot, index)}
                      className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      {copiedSlot === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Slot
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Studio Callout */}
        <section className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-md rounded-[3rem] border border-indigo-900/35 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Found your niche? Build the book now.
            </h2>
            <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
              Take these keywords straight into KDPage Studio — generate a print-ready puzzle interior and cover in minutes, then paste your backend slots into KDP at publish time.
            </p>
          </div>
          <Link
            href="/studio"
            className="shrink-0 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
          >
            Start Building
          </Link>
        </section>

      </div>
    </div>
  );
}
