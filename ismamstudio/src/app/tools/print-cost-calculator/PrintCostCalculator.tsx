"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Calculator, Globe, AlertTriangle, TrendingUp, Info } from "lucide-react";

type Binding = "paperback" | "hardcover";
type Ink = "bw" | "premium";

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
  pb: { bw: RateTier; premium: RateTier };
  hc: { bw: RateTier; premium: RateTier } | null;
}

// Estimated Amazon KDP printing rates (June 2023 revision).
// Always verify final costs in the official KDP Printing Cost & Royalty Calculator.
const MARKETS: Market[] = [
  {
    code: "US",
    label: "Amazon.com (US)",
    symbol: "$",
    pb: {
      bw: { small: 2.3, smallMax: 108, base: 1.0, per: 0.012, min: 24, max: 828 },
      premium: { small: 3.65, smallMax: 40, base: 1.0, per: 0.0655, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 6.8, smallMax: 108, base: 5.65, per: 0.012, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 5.65, per: 0.0655, min: 75, max: 550 },
    },
  },
  {
    code: "UK",
    label: "Amazon.co.uk (UK)",
    symbol: "£",
    pb: {
      bw: { small: 1.93, smallMax: 108, base: 0.85, per: 0.01, min: 24, max: 828 },
      premium: { small: 3.05, smallMax: 40, base: 0.85, per: 0.055, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 5.23, smallMax: 108, base: 4.15, per: 0.01, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 4.15, per: 0.055, min: 75, max: 550 },
    },
  },
  {
    code: "EU",
    label: "Amazon EU (DE/FR/IT/ES)",
    symbol: "€",
    pb: {
      bw: { small: 2.05, smallMax: 108, base: 0.9, per: 0.01, min: 24, max: 828 },
      premium: { small: 3.42, smallMax: 40, base: 0.9, per: 0.06, min: 24, max: 828 },
    },
    hc: {
      bw: { small: 5.95, smallMax: 108, base: 4.85, per: 0.01, min: 75, max: 550 },
      premium: { small: null, smallMax: 0, base: 4.85, per: 0.06, min: 75, max: 550 },
    },
  },
  {
    code: "CA",
    label: "Amazon.ca (Canada)",
    symbol: "C$",
    pb: {
      bw: { small: 2.99, smallMax: 108, base: 1.26, per: 0.016, min: 24, max: 828 },
      premium: { small: 4.42, smallMax: 40, base: 1.26, per: 0.083, min: 24, max: 828 },
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

  const market = MARKETS.find((m) => m.code === marketCode) || MARKETS[0];
  const rates = binding === "paperback" ? market.pb : market.hc;
  const tier = rates ? rates[ink] : null;
  const cost = tier ? printCost(tier, pages) : null;

  const royalty = cost !== null ? Math.max(0, listPrice * 0.6 - cost) : null;
  const minListPrice = cost !== null ? cost / 0.6 : null;
  const marginPct =
    royalty !== null && listPrice > 0 ? Math.min(100, (royalty / listPrice) * 100) : 0;

  return (
    <ToolShell
      title="KDP Print Cost"
      highlight="Calculator"
      subtitle="Estimate Amazon KDP printing costs for paperbacks and hardcovers across major marketplaces — and see your royalty per sale instantly."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Book Specifications
            </h3>

            {/* Binding */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Binding Type
              </label>
              <div className="flex gap-2">
                {(["paperback", "hardcover"] as Binding[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBinding(b)}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      binding === b
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Ink */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Ink Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInk("bw")}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                    ink === "bw"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  Black &amp; White
                </button>
                <button
                  onClick={() => setInk("premium")}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                    ink === "premium"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  Premium Color
                </button>
              </div>
            </div>

            {/* Marketplace */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Marketplace
              </label>
              <select
                value={marketCode}
                onChange={(e) => setMarketCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {MARKETS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pages */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Page Count — {pages}
              </label>
              <input
                type="range"
                min={24}
                max={828}
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <input
                type="number"
                min={24}
                max={828}
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value) || 24)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* List price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                List Price ({market.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={listPrice}
                onChange={(e) => setListPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {rates === null ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-amber-200">
                Hardcover printing is not available on {market.label}. Choose a different
                marketplace or switch to paperback.
              </p>
            </div>
          ) : cost === null ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-rose-200">
                {binding === "hardcover" ? "Hardcover" : "Paperback"} page count must be between{" "}
                {tier?.min} and {tier?.max} pages for this ink type.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Printing Cost
                  </span>
                  <span className="text-3xl font-black text-rose-400">
                    {market.symbol}
                    {cost.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Royalty / Sale (60%)
                  </span>
                  <span className="text-3xl font-black text-emerald-400">
                    {market.symbol}
                    {royalty!.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Min. List Price
                  </span>
                  <span className="text-3xl font-black text-yellow-500">
                    {market.symbol}
                    {minListPrice!.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Margin bar */}
              <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Profit Margin
                  </span>
                  <span className="text-sm font-black text-white">{marginPct.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full rounded-full transition-all ${
                      marginPct >= 30
                        ? "bg-emerald-500"
                        : marginPct >= 15
                          ? "bg-yellow-500"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${marginPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {marginPct >= 30
                    ? "Healthy margin — you have room for advertising spend."
                    : marginPct >= 15
                      ? "Workable margin, but ads will eat into profits quickly."
                      : "Thin margin — consider raising your list price or reducing page count."}
                </p>
              </div>

              {/* All marketplaces comparison */}
              <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" /> Printing Cost Across Marketplaces
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900">
                        <th className="py-2 pr-4">Marketplace</th>
                        <th className="py-2 pr-4">Print Cost</th>
                        <th className="py-2">Min. List Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MARKETS.map((m) => {
                        const r = binding === "paperback" ? m.pb : m.hc;
                        const c = r ? printCost(r[ink], pages) : null;
                        return (
                          <tr key={m.code} className="border-b border-slate-900/50 text-xs font-bold">
                            <td className="py-2.5 pr-4 text-slate-300">{m.label}</td>
                            <td className="py-2.5 pr-4 text-rose-400">
                              {c !== null ? `${m.symbol}${c.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-2.5 text-yellow-500">
                              {c !== null ? `${m.symbol}${(c / 0.6).toFixed(2)}` : "—"}
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

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Estimates are based on Amazon KDP&apos;s published print-on-demand rate structure
              (fixed cost + per-page cost). Amazon adjusts rates occasionally — always confirm
              final figures with the official KDP Printing Cost &amp; Royalty Calculator before
              setting prices.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
