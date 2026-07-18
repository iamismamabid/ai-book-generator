"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { BarChart2, Target, Info, TrendingUp, TrendingDown } from "lucide-react";

export default function AdsRoiCalculator() {
  const [spend, setSpend] = useState<number>(100);
  const [impressions, setImpressions] = useState<number>(20000);
  const [clicks, setClicks] = useState<number>(150);
  const [orders, setOrders] = useState<number>(12);
  const [listPrice, setListPrice] = useState<number>(9.99);
  const [royaltyPerSale, setRoyaltyPerSale] = useState<number>(3.5);
  const [kenpEarnings, setKenpEarnings] = useState<number>(0);

  const revenue = orders * listPrice;
  const royaltyIncome = orders * royaltyPerSale + kenpEarnings;
  const profit = royaltyIncome - spend;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cvr = clicks > 0 ? (orders / clicks) * 100 : 0;
  const acos = revenue > 0 ? (spend / revenue) * 100 : 0;
  const roas = spend > 0 ? revenue / spend : 0;
  const breakEvenAcos = listPrice > 0 ? (royaltyPerSale / listPrice) * 100 : 0;
  const costPerOrder = orders > 0 ? spend / orders : 0;
  const maxProfitableBid = (cvr / 100) * royaltyPerSale;

  const isProfit = profit >= 0;

  const numInput =
    "w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none";
  const labelCls = "block text-xs font-black uppercase tracking-wider text-slate-400";

  return (
    <ToolShell
      title="Book Ads ROI"
      highlight="Calculator"
      subtitle="Analyze your Amazon Ads, Facebook, or BookBub campaigns — ACOS, ROAS, break-even points, and maximum profitable bids in one dashboard."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" /> Campaign Data
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Ad Spend ($)</label>
                <input type="number" min={0} step="0.01" value={spend} onChange={(e) => setSpend(parseFloat(e.target.value) || 0)} className={numInput} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Impressions</label>
                <input type="number" min={0} value={impressions} onChange={(e) => setImpressions(parseInt(e.target.value) || 0)} className={numInput} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Clicks</label>
                <input type="number" min={0} value={clicks} onChange={(e) => setClicks(parseInt(e.target.value) || 0)} className={numInput} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Orders</label>
                <input type="number" min={0} value={orders} onChange={(e) => setOrders(parseInt(e.target.value) || 0)} className={numInput} />
              </div>
            </div>

            <div className="border-t border-slate-900 pt-5 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Book Economics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>List Price ($)</label>
                  <input type="number" min={0} step="0.01" value={listPrice} onChange={(e) => setListPrice(parseFloat(e.target.value) || 0)} className={numInput} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Royalty / Sale ($)</label>
                  <input type="number" min={0} step="0.01" value={royaltyPerSale} onChange={(e) => setRoyaltyPerSale(parseFloat(e.target.value) || 0)} className={numInput} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>KU / KENP Earnings From Campaign ($) — optional</label>
                <input type="number" min={0} step="0.01" value={kenpEarnings} onChange={(e) => setKenpEarnings(parseFloat(e.target.value) || 0)} className={numInput} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profit hero */}
          <div
            className={`rounded-[2rem] p-8 border flex items-center justify-between ${
              isProfit
                ? "bg-emerald-500/10 border-emerald-500/25"
                : "bg-rose-500/10 border-rose-500/25"
            }`}
          >
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Campaign Profit (Royalties − Spend)
              </span>
              <span className={`text-4xl font-black ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                {profit < 0 ? "-" : "+"}${Math.abs(profit).toFixed(2)}
              </span>
            </div>
            {isProfit ? (
              <TrendingUp className="w-12 h-12 text-emerald-500/50" />
            ) : (
              <TrendingDown className="w-12 h-12 text-rose-500/50" />
            )}
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "CTR", value: `${ctr.toFixed(2)}%`, hint: "Clicks ÷ impressions" },
              { label: "Avg CPC", value: `$${cpc.toFixed(2)}`, hint: "Spend ÷ clicks" },
              { label: "Conv. Rate", value: `${cvr.toFixed(1)}%`, hint: "Orders ÷ clicks" },
              { label: "Cost / Order", value: `$${costPerOrder.toFixed(2)}`, hint: "Spend ÷ orders" },
              { label: "ACOS", value: `${acos.toFixed(1)}%`, hint: "Spend ÷ revenue" },
              { label: "ROAS", value: `${roas.toFixed(2)}x`, hint: "Revenue ÷ spend" },
              { label: "Break-even ACOS", value: `${breakEvenAcos.toFixed(1)}%`, hint: "Royalty ÷ price" },
              { label: "Max Profitable Bid", value: `$${maxProfitableBid.toFixed(2)}`, hint: "CVR × royalty" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-900/35 border border-slate-900 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                  {m.label}
                </span>
                <span className="text-xl font-black text-white block my-1">{m.value}</span>
                <span className="text-[9px] font-semibold text-slate-600">{m.hint}</span>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-500" /> Campaign Verdict
            </h3>
            <p className="text-xs font-bold text-slate-300 leading-relaxed">
              {acos === 0
                ? "Enter your campaign data to see an analysis."
                : acos <= breakEvenAcos
                  ? `Your ACOS (${acos.toFixed(1)}%) is below your break-even ACOS (${breakEvenAcos.toFixed(1)}%) — this campaign is profitable on direct sales alone. Consider scaling your budget while maintaining bids.`
                  : `Your ACOS (${acos.toFixed(1)}%) is above your break-even ACOS (${breakEvenAcos.toFixed(1)}%) — you're losing money on direct sales${kenpEarnings > 0 ? ", though KU reads offset part of the loss" : ""}. Lower bids toward your max profitable bid of $${maxProfitableBid.toFixed(2)}, pause underperforming keywords, or improve your conversion rate (cover, description, reviews).`}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Works for Amazon Ads, Facebook/Meta Ads, and BookBub campaigns — just plug in the
              spend and results from each platform&apos;s dashboard. Remember that ads also drive
              unattributed organic sales and read-through on series, so a slightly-above-break-even
              ACOS can still be worthwhile.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
