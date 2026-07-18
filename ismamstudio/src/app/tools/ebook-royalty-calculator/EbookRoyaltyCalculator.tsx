"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Percent, Zap, Info, AlertTriangle, TrendingUp } from "lucide-react";

interface EbookMarket {
  code: string;
  label: string;
  symbol: string;
  deliveryPerMb: number; // charged only on the 70% plan
  band70: [number, number]; // min/max list price for 70% eligibility
}

const MARKETS: EbookMarket[] = [
  { code: "US", label: "Amazon.com (US)", symbol: "$", deliveryPerMb: 0.15, band70: [2.99, 9.99] },
  { code: "UK", label: "Amazon.co.uk (UK)", symbol: "£", deliveryPerMb: 0.1, band70: [1.77, 9.99] },
  { code: "DE", label: "Amazon.de (Germany)", symbol: "€", deliveryPerMb: 0.12, band70: [2.6, 9.7] },
  { code: "CA", label: "Amazon.ca (Canada)", symbol: "C$", deliveryPerMb: 0.15, band70: [2.99, 9.99] },
  { code: "AU", label: "Amazon.com.au (Australia)", symbol: "A$", deliveryPerMb: 0.22, band70: [3.99, 11.99] },
];

export default function EbookRoyaltyCalculator() {
  const [price, setPrice] = useState<number>(4.99);
  const [fileSizeMb, setFileSizeMb] = useState<number>(2);
  const [plan, setPlan] = useState<35 | 70>(70);
  const [marketCode, setMarketCode] = useState<string>("US");
  const [monthlySales, setMonthlySales] = useState<number>(100);

  const market = MARKETS.find((m) => m.code === marketCode) || MARKETS[0];
  const [min70, max70] = market.band70;
  const eligible70 = price >= min70 && price <= max70;

  const deliveryFee = fileSizeMb * market.deliveryPerMb;
  const royalty70 = eligible70 ? Math.max(0, price * 0.7 - deliveryFee) : null;
  const royalty35 = Math.max(0, price * 0.35);
  const activeRoyalty = plan === 70 ? (royalty70 ?? 0) : royalty35;

  const bestPlan =
    royalty70 !== null && royalty70 > royalty35 ? 70 : 35;

  return (
    <ToolShell
      title="Kindle eBook Royalty"
      highlight="Calculator"
      subtitle="Compare 35% vs 70% royalty plans, factor in delivery fees, and project your monthly Kindle income across marketplaces."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" /> Pricing Setup
            </h3>

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

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                List Price ({market.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                eBook File Size — {fileSizeMb.toFixed(1)} MB
              </label>
              <input
                type="range"
                min={0.1}
                max={50}
                step={0.1}
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500 font-semibold">
                Delivery fees ({market.symbol}
                {market.deliveryPerMb.toFixed(2)}/MB) only apply on the 70% plan.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Royalty Plan
              </label>
              <div className="flex gap-2">
                {([35, 70] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      plan === p
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {p}% Royalty
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Projected Monthly Sales — {monthlySales}
              </label>
              <input
                type="range"
                min={1}
                max={2000}
                value={monthlySales}
                onChange={(e) => setMonthlySales(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {plan === 70 && !eligible70 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-200">
                The 70% plan on {market.label} requires a list price between {market.symbol}
                {min70.toFixed(2)} and {market.symbol}
                {max70.toFixed(2)}. Your current price of {market.symbol}
                {price.toFixed(2)} is outside that band — Amazon would force the 35% plan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Royalty / Sale
              </span>
              <span className="text-3xl font-black text-emerald-400">
                {market.symbol}
                {activeRoyalty.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Delivery Fee
              </span>
              <span className="text-3xl font-black text-rose-400">
                {plan === 70 ? `${market.symbol}${deliveryFee.toFixed(2)}` : `${market.symbol}0.00`}
              </span>
            </div>
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Monthly Income
              </span>
              <span className="text-3xl font-black text-yellow-500">
                {market.symbol}
                {(activeRoyalty * monthlySales).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Plan comparison */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> 35% vs 70% Comparison
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-5 rounded-2xl border ${
                  bestPlan === 35
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-950/40 border-slate-900"
                }`}
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  35% Plan
                </span>
                <span className="text-2xl font-black text-white">
                  {market.symbol}
                  {royalty35.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-1">
                  No delivery fee · No price band restriction
                </span>
              </div>
              <div
                className={`p-5 rounded-2xl border ${
                  bestPlan === 70
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-950/40 border-slate-900"
                }`}
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  70% Plan
                </span>
                <span className="text-2xl font-black text-white">
                  {royalty70 !== null ? `${market.symbol}${royalty70.toFixed(2)}` : "Not eligible"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-1">
                  After {market.symbol}
                  {deliveryFee.toFixed(2)} delivery fee
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Best choice at this price:{" "}
              <span className="text-emerald-400">{bestPlan}% royalty plan</span>
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              List prices shown exclude VAT (added automatically in EU/UK marketplaces). The 70%
              plan also requires your eBook to be priced at least 20% below any physical edition.
              Confirm current delivery-fee rates in your KDP pricing dashboard.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
