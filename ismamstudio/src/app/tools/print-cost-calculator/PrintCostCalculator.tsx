"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/components/tools/ToolShell";
import {
  Calculator,
  Globe,
  AlertTriangle,
  TrendingUp,
  Info,
  Sparkles,
  ArrowRight,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Percent,
  Layers,
  HelpCircle
} from "lucide-react";

type Binding = "paperback" | "hardcover";
type Ink = "bw" | "standard" | "premium";

interface RateTier {
  small: number | null; // fixed cost for low page counts (null = no fixed tier)
  smallMax: number; // last page count covered by the fixed tier
  base: number;
  per: number;
  min: number;
  max: number;
}

interface Market {
  code: string;
  label: string;
  symbol: string;
  pb: {
    bw: RateTier;
    standard: RateTier;
    premium: RateTier;
  };
  hc: {
    bw: RateTier;
    premium: RateTier;
  } | null;
}

// Official Amazon KDP printing rate structures (2026 active rates).
const MARKETS: Market[] = [
  {
    code: "US",
    label: "Amazon.com (US)",
    symbol: "$",
    pb: {
      bw: { small: 2.30, smallMax: 108, base: 1.00, per: 0.012, min: 24, max: 828 },
      standard: { small: 2.70, smallMax: 40, base: 0.85, per: 0.038, min: 24, max: 600 },
      premium: { small: 3.65, smallMax: 40, base: 1.00, per: 0.0655, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 6.80, smallMax: 108, base: 5.65, per: 0.012, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 5.65, per: 0.0655, min: 75, max: 550 },
    },
  },
  {
    code: "UK",
    label: "Amazon.co.uk (UK)",
    symbol: "£",
    pb: {
      bw: { small: 1.93, smallMax: 108, base: 0.85, per: 0.010, min: 24, max: 828 },
      standard: { small: 2.25, smallMax: 40, base: 0.70, per: 0.031, min: 24, max: 600 },
      premium: { small: 3.05, smallMax: 40, base: 0.85, per: 0.055, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 5.23, smallMax: 108, base: 4.15, per: 0.010, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 4.15, per: 0.055, min: 75, max: 550 },
    },
  },
  {
    code: "EU",
    label: "Amazon EU (DE/FR/IT/ES/NL)",
    symbol: "€",
    pb: {
      bw: { small: 2.05, smallMax: 108, base: 0.90, per: 0.010, min: 24, max: 828 },
      standard: { small: 2.50, smallMax: 40, base: 0.75, per: 0.035, min: 24, max: 600 },
      premium: { small: 3.42, smallMax: 40, base: 0.90, per: 0.060, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 5.95, smallMax: 108, base: 4.85, per: 0.010, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 4.85, per: 0.060, min: 75, max: 550 },
    },
  },
  {
    code: "CA",
    label: "Amazon.ca (Canada)",
    symbol: "C$",
    pb: {
      bw: { small: 2.99, smallMax: 108, base: 1.26, per: 0.016, min: 24, max: 828 },
      standard: { small: 3.60, smallMax: 40, base: 1.05, per: 0.048, min: 24, max: 600 },
      premium: { small: 4.42, smallMax: 40, base: 1.26, per: 0.083, min: 24, max: 828 },
    },
    hc: null,
  },
  {
    code: "AU",
    label: "Amazon.com.au (Australia)",
    symbol: "A$",
    pb: {
      bw: { small: 4.23, smallMax: 108, base: 1.85, per: 0.022, min: 24, max: 828 },
      standard: { small: 4.85, smallMax: 40, base: 1.85, per: 0.058, min: 24, max: 600 },
      premium: { small: 6.15, smallMax: 40, base: 1.85, per: 0.110, min: 24, max: 828 },
    },
    hc: null,
  },
];

function printCost(tier: RateTier, pages: number): number | null {
  if (pages < tier.min || pages > tier.max) return null;
  if (tier.small !== null && pages <= tier.smallMax) return tier.small;
  return tier.base + tier.per * pages;
}

export default function PrintCostCalculator() {
  const [binding, setBinding] = useState<Binding>("paperback");
  const [ink, setInk] = useState<Ink>("bw");
  const [pages, setPages] = useState<number>(120);
  const [marketCode, setMarketCode] = useState<string>("US");
  const [listPrice, setListPrice] = useState<number>(9.99);
  const [showExpandedDist, setShowExpandedDist] = useState<boolean>(false);

  const market = MARKETS.find((m) => m.code === marketCode) || MARKETS[0]!;

  // Effective tier lookup
  let tier: RateTier | null = null;
  let isStandardHardcoverFallback = false;

  if (binding === "paperback") {
    tier = market.pb[ink];
  } else {
    if (market.hc) {
      if (ink === "standard") {
        isStandardHardcoverFallback = true;
        tier = market.hc.premium;
      } else {
        tier = market.hc[ink];
      }
    } else {
      tier = null;
    }
  }

  const cost = tier ? printCost(tier, pages) : null;

  // Standard 60% distribution
  const royalty = cost !== null ? Math.max(0, listPrice * 0.6 - cost) : null;
  const minListPrice = cost !== null ? cost / 0.6 : null;
  const marginPct =
    royalty !== null && listPrice > 0 ? Math.min(100, (royalty / listPrice) * 100) : 0;

  // Expanded 40% distribution
  const expandedRoyalty = cost !== null ? Math.max(0, listPrice * 0.4 - cost) : null;
  const expandedMinListPrice = cost !== null ? cost / 0.4 : null;

  const faqs = [
    {
      q: "What is the official Amazon KDP print cost formula in 2026?",
      a: "Amazon KDP print cost consists of a Fixed Cost plus a Per-Page Charge. For standard black & white paperbacks over 108 pages in the US, the formula is: $1.00 (Fixed Cost) + (Page Count × $0.012). For books between 24 and 108 pages, Amazon charges a flat fixed rate of $2.30 with zero per-page charge.",
    },
    {
      q: "What is the difference between Standard Color and Premium Color on KDP?",
      a: "Standard Color is printed on 50 lb (74 gsm) paper and costs significantly less (e.g. $0.85 base + $0.038/page in the US), making it ideal for coloring books, puzzle books with colored hints, and children's fiction. Premium Color uses heavier 60 lb (90 gsm) paper with richer inks (e.g. $1.00 base + $0.0655/page), ideal for photo albums, art portfolios, and recipe books.",
    },
    {
      q: "How is my author royalty calculated on Amazon KDP?",
      a: "For standard sales through Amazon's marketplace, your royalty rate is 60%. The formula is: Royalty = (List Price × 60%) − Printing Cost. For example, on a $9.99 paperback with a $2.44 printing cost, your profit is: ($9.99 × 0.60) − $2.44 = $3.55 per book sold.",
    },
    {
      q: "How is the Minimum List Price determined for KDP paperbacks?",
      a: "The minimum list price is the lowest retail price Amazon permits to ensure printing costs are covered: Minimum List Price = Printing Cost ÷ 0.60. If you enable Expanded Distribution, the minimum price increases to: Printing Cost ÷ 0.40.",
    },
    {
      q: "Does book trim size (e.g. 6x9 vs 8.5x11) increase printing cost on KDP?",
      a: "No! Unlike traditional print shops, Amazon KDP does NOT charge extra for larger trim sizes. An 8.5\" x 11\" paperback with 120 pages costs the exact same to print as a 5\" x 8\" paperback with 120 pages ($2.44 on Amazon US). Choosing a larger trim size actually lets you fit more text per page, reducing page count and lowering your overall print cost.",
    },
    {
      q: "Why is hardcover unavailable for some marketplaces?",
      a: "Amazon KDP print-on-demand facilities currently print hardcovers primarily in the US, UK, and European facilities. Hardcover is not currently available for Amazon.ca (Canada) or Amazon.com.au (Australia) via direct KDP printing.",
    },
  ];

  return (
    <ToolShell
      badge="2026 Updated Formula — 100% Free"
      title="Amazon KDP Print Cost"
      highlight="Calculator"
      subtitle="Calculate exact Amazon KDP printing costs, minimum retail list prices, and 60% author royalties across US, UK, EU, CA, and AU marketplaces."
      appCategory="FinanceApplication"
      faqs={faqs}
    >
      <div className="space-y-12">
        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                <Calculator className="w-5 h-5 text-indigo-400" /> Book Specifications
              </h3>

              {/* Binding */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Binding Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["paperback", "hardcover"] as Binding[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBinding(b)}
                      className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        binding === b
                          ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Type */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Interior Ink Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setInk("bw")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer text-center ${
                      ink === "bw"
                        ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    Black &amp; White
                  </button>
                  <button
                    onClick={() => setInk("standard")}
                    disabled={binding === "hardcover"}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all text-center ${
                      binding === "hardcover"
                        ? "opacity-30 cursor-not-allowed bg-slate-950 border-slate-900 text-slate-600"
                        : ink === "standard"
                          ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
                    }`}
                    title={binding === "hardcover" ? "Standard color is only available for Paperback" : ""}
                  >
                    Standard Color
                  </button>
                  <button
                    onClick={() => setInk("premium")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer text-center ${
                      ink === "premium"
                        ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    Premium Color
                  </button>
                </div>
                {binding === "hardcover" && ink === "standard" && (
                  <p className="text-[10px] text-amber-400 font-bold">
                    * KDP does not offer Standard Color for Hardcovers. Calculated using Premium Color.
                  </p>
                )}
              </div>

              {/* Marketplace */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Amazon Marketplace
                </label>
                <select
                  value={marketCode}
                  onChange={(e) => setMarketCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {MARKETS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label} ({m.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pages */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Page Count
                  </label>
                  <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {pages} Pages
                  </span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={828}
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <input
                  type="number"
                  min={24}
                  max={828}
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value) || 24)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* List Price */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Target List Price ({market.symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {market.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={listPrice}
                    onChange={(e) => setListPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Expanded Distribution Toggle */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">Show Expanded Distribution (40%)</span>
                  <span className="text-[10px] text-slate-500">Sales outside Amazon to bookstores &amp; libraries</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExpandedDist(!showExpandedDist)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    showExpandedDist ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showExpandedDist ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {binding === "hardcover" && !market.hc ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-amber-300">Hardcover Not Available in {market.label}</h4>
                  <p className="text-xs text-amber-200/80 leading-relaxed font-semibold">
                    Amazon KDP print-on-demand does not currently print hardcovers in this marketplace. Switch to Paperback or select US/UK/EU.
                  </p>
                </div>
              </div>
            ) : cost === null ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-rose-300">Invalid Page Count</h4>
                  <p className="text-xs text-rose-200/80 leading-relaxed font-semibold">
                    {binding === "hardcover" ? "Hardcovers" : "Paperbacks"} must be between{" "}
                    <strong>{tier?.min}</strong> and <strong>{tier?.max}</strong> pages for this ink type.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/40" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      KDP Print Cost
                    </span>
                    <span className="text-3xl font-black text-rose-400">
                      {market.symbol}
                      {cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                      Per printed copy
                    </span>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/40" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Author Royalty (60%)
                    </span>
                    <span className="text-3xl font-black text-emerald-400">
                      {market.symbol}
                      {royalty!.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                      Profit per sale on Amazon
                    </span>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/40" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Min. List Price
                    </span>
                    <span className="text-3xl font-black text-amber-400">
                      {market.symbol}
                      {minListPrice!.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                      Breakeven list price
                    </span>
                  </div>
                </div>

                {/* Expanded Distribution Metrics (if toggled) */}
                {showExpandedDist && (
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center sm:text-left space-y-1">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">
                        Expanded Distribution Royalty (40%)
                      </span>
                      <span className="text-2xl font-black text-indigo-400">
                        {market.symbol}{expandedRoyalty!.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Royalty earned when sold via Barnes &amp; Noble, libraries, etc.
                      </p>
                    </div>

                    <div className="text-center sm:text-left space-y-1 sm:border-l sm:border-indigo-500/20 sm:pl-4">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">
                        Expanded Min. List Price
                      </span>
                      <span className="text-2xl font-black text-indigo-300">
                        {market.symbol}{expandedMinListPrice!.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Minimum price required if Expanded Distribution is checked in KDP.
                      </p>
                    </div>
                  </div>
                )}

                {/* Profit Margin Progress Bar */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" /> Net Profit Margin (60% Rate)
                    </span>
                    <span className={`text-base font-black ${marginPct >= 30 ? "text-emerald-400" : marginPct >= 15 ? "text-yellow-400" : "text-rose-400"}`}>
                      {marginPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        marginPct >= 30
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : marginPct >= 15
                            ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                            : "bg-gradient-to-r from-rose-500 to-red-400"
                      }`}
                      style={{ width: `${marginPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                    <span>
                      {marginPct >= 30
                        ? "✅ Excellent margin — strong profitability with headroom for Amazon PPC ads."
                        : marginPct >= 15
                          ? "⚠️ Average margin — adequate for organic sales, but ads will compress profit."
                          : "❌ Razor-thin margin — increase your list price to avoid losing money."}
                    </span>
                  </p>
                </div>

                {/* All Marketplaces Comparison Table */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                      <Globe className="w-4 h-4 text-indigo-400" /> Worldwide Printing Cost Comparison
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {pages} Pages • {ink.toUpperCase()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">
                          <th className="py-2.5 pr-4">Marketplace</th>
                          <th className="py-2.5 pr-4">Print Cost</th>
                          <th className="py-2.5 pr-4">Min List Price</th>
                          <th className="py-2.5">Royalty @ {market.symbol}{listPrice.toFixed(2)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MARKETS.map((m) => {
                          const r = binding === "paperback" ? m.pb : m.hc;
                          let selectedTier: RateTier | null = null;

                          if (r) {
                            if (binding === "paperback") {
                              selectedTier = (r as any)[ink];
                            } else {
                              selectedTier = ink === "standard" ? (r as any).premium : (r as any)[ink];
                            }
                          }

                          const c = selectedTier ? printCost(selectedTier, pages) : null;
                          const estRoyalty = c !== null ? Math.max(0, listPrice * 0.6 - c) : null;

                          return (
                            <tr key={m.code} className="border-b border-slate-800/60 text-xs font-bold hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 pr-4 text-slate-200">{m.label}</td>
                              <td className="py-3 pr-4 text-rose-400">
                                {c !== null ? `${m.symbol}${c.toFixed(2)}` : "—"}
                              </td>
                              <td className="py-3 pr-4 text-amber-400">
                                {c !== null ? `${m.symbol}${(c / 0.6).toFixed(2)}` : "—"}
                              </td>
                              <td className="py-3 text-emerald-400">
                                {estRoyalty !== null ? `${m.symbol}${estRoyalty.toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Rates strictly reflect Amazon KDP&apos;s published print-on-demand formulas. Amazon adjusts international conversion rates periodically. Always cross-reference final values in the KDP dashboard prior to publishing.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Official Formula Breakdown Banner */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
              Mathematical Ground Truth
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Official 2026 Amazon KDP Print Cost &amp; Royalty Formulas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Amazon KDP uses an automated piecewise formula based on fixed setup charges and individual page counts. Here is the exact calculation logic applied on Amazon.com (US):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Paperback Printing Formulas (US)
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">B&amp;W (24–108 pages):</span>
                  <strong>$2.30 flat</strong> (no per-page cost)
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">B&amp;W (110–828 pages):</span>
                  <strong>$1.00 + (Pages × $0.012)</strong>
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Standard Color (42–600 pages):</span>
                  <strong>$0.85 + (Pages × $0.038)</strong>
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Premium Color (42–828 pages):</span>
                  <strong>$1.00 + (Pages × $0.0655)</strong>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Author Royalty &amp; Price Formulas
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Amazon Royalty (60% Rate):</span>
                  <strong>(List Price × 0.60) − Print Cost</strong>
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Minimum Amazon List Price:</span>
                  <strong>Print Cost ÷ 0.60</strong>
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Expanded Distribution Royalty (40%):</span>
                  <strong>(List Price × 0.40) − Print Cost</strong>
                </li>
                <li className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Hardcover B&amp;W Formula:</span>
                  <strong>$5.65 + (Pages × $0.012)</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Strategies to Lower KDP Print Cost */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Profit Optimization
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              4 Proven Ways to Cut KDP Printing Costs &amp; Boost Margins
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Actionable tactics top self-publishers use to maximize royalties on every Amazon sale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Tactic 1</span>
              <h3 className="text-lg font-black text-white tracking-tight">Target the 108-Page Threshold</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                For black-and-white paperbacks on Amazon US, every book between 24 and 108 pages has the exact same printing cost ($2.30). Publishing an 80-page or 100-page book gives your buyers much higher perceived value without costing you a single cent extra in printing!
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-indigo-400 text-xs font-black uppercase tracking-wider">Tactic 2</span>
              <h3 className="text-lg font-black text-white tracking-tight">Use Standard Color Instead of Premium</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Standard color costs $0.038 per page vs $0.0655 per page for Premium. On a 100-page color activity book, Standard Color printing costs $4.65 compared to $7.55 for Premium. That extra $2.90 per copy goes straight into your pocket as net author royalty.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">Tactic 3</span>
              <h3 className="text-lg font-black text-white tracking-tight">Leverage Larger Trim Sizes</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Amazon KDP charges by page count, NOT paper size. An 8.5" x 11" page costs the exact same as a 5" x 8" page. By formatting puzzle books, workbooks, and journals at 8.5" x 11", you can place 2 puzzles per page instead of 1, effectively cutting your total page count in half!
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-rose-400 text-xs font-black uppercase tracking-wider">Tactic 4</span>
              <h3 className="text-lg font-black text-white tracking-tight">Calculate Minimums Before Setting Prices</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                If you price a book at $6.99 and your printing cost is $4.00, your 60% royalty is only $0.19. If you accidentally enable Expanded Distribution, your 40% royalty becomes negative and Amazon will block your price submission. Always verify breakeven with this calculator first.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Cross-Tool Bridges & Studio Upsell */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              ⚡ Free KDP Publishing Toolkit
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Complete Your Amazon KDP Publishing Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Now that you know your exact printing cost and profit margin, use these free companion tools to design your book:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/tools/royalty-estimator"
              className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-2 transition group"
            >
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">KDP Royalty Estimator →</span>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Monthly Royalty Forecaster</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Forecast your monthly earnings based on unit sales and book volume.</p>
            </Link>

            <Link
              href="/tools/spine-calculator"
              className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-2 transition group"
            >
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block">KDP Spine Calculator →</span>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Spine &amp; Bleed Measurements</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Calculate exact spine thickness and wrap-around bleed dimensions.</p>
            </Link>

            <Link
              href="/tools/kdp-cover-creator"
              className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-2 transition group"
            >
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">KDP Cover Creator →</span>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Automated Wrap-Around Covers</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Generate 300 DPI wrap-around cover templates with zero bleed errors.</p>
            </Link>

            <Link
              href="/tools/kdp-puzzle-generator"
              className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-2 transition group"
            >
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">KDP Puzzle Generator →</span>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Word Search &amp; Sudoku Engine</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Generate print-ready puzzles with automatic solution keys.</p>
            </Link>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition hover:scale-105"
            >
              <span>Build Complete Book in KDPage Studio Free</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
