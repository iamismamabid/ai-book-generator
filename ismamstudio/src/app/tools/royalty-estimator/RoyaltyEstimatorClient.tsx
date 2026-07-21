"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Sparkles, Calculator, HelpCircle, AlertCircle, 
  DollarSign, BarChart3, BookOpen, Layers, ShieldAlert, Award, TrendingUp 
} from "lucide-react";

export default function RoyaltyEstimatorClient() {
  const [pages, setPages] = useState<number>(120);
  const [price, setPrice] = useState<number>(8.99);
  const [colorType, setColorType] = useState<"bw" | "color">("bw");
  const [paperColor, setPaperColor] = useState<"white" | "cream">("white");
  const [bindingType, setBindingType] = useState<"paperback" | "hardcover">("paperback");
  const [expandedDist, setExpandedDist] = useState<boolean>(false);
  const [competitiveness, setCompetitiveness] = useState<"low" | "medium" | "high">("medium");

  // Promo/Marketing simulator
  const [promoType, setPromoType] = useState<"none" | "discount" | "ku">("none");
  const [promoDiscount, setPromoDiscount] = useState<number>(20); // 20% discount
  const [adCpc, setAdCpc] = useState<number>(0.35); // CPC ad click cost
  const [adConv, setAdConv] = useState<number>(10); // 10% conversion rate (10 clicks per purchase)
  const [kuReadRate, setKuReadRate] = useState<number>(80); // % of page read

  // Printing cost logic
  const calculatePrintingCost = () => {
    let base = 0.0;
    let pageCost = 0.0;

    if (bindingType === "paperback") {
      base = 0.85;
      pageCost = colorType === "bw" ? 0.012 : 0.07;
    } else {
      // Hardcover requires min 75 pages on KDP
      base = 5.65;
      pageCost = colorType === "bw" ? 0.012 : 0.07;
    }

    return base + (pages * pageCost);
  };

  const printCost = calculatePrintingCost();

  // Royalties Math
  const getRoyaltyData = () => {
    const royaltyRate = expandedDist ? 0.40 : 0.60;
    
    // Base royalty calculation
    const baseRoyalty = (price * royaltyRate) - printCost;
    const baseMargin = (baseRoyalty / price) * 100;

    // Promo royalty calculation
    let actualPrice = price;
    let promoRoyalty = baseRoyalty;
    
    if (promoType === "discount") {
      actualPrice = price * (1 - promoDiscount / 100);
      promoRoyalty = (actualPrice * royaltyRate) - printCost;
    } else if (promoType === "ku") {
      // Kindle Unlimited pays per Kindle Edition Normalized Page (KENP) read.
      // Average KENP rate is ~$0.0045 per page read.
      promoRoyalty = pages * (kuReadRate / 100) * 0.0045;
    }

    // Ad spends calculation
    // Ad Spend = CPC / (Conversion rate / 100)
    const adSpendPerSale = adCpc / (adConv / 100);
    
    const netProfit = promoRoyalty - adSpendPerSale;
    const netMargin = (netProfit / actualPrice) * 100;

    return {
      baseRoyalty: Math.max(0, baseRoyalty),
      baseMargin: Math.max(0, baseMargin),
      promoRoyalty: Math.max(0, promoRoyalty),
      promoPrice: actualPrice,
      adSpendPerSale,
      netProfit,
      netMargin
    };
  };

  const {
    baseRoyalty,
    baseMargin,
    promoRoyalty,
    promoPrice,
    adSpendPerSale,
    netProfit,
    netMargin
  } = getRoyaltyData();

  // Spine Math
  const calculateSpineWidth = () => {
    let multiplier = 0.002252; // White paper (paperback)
    if (colorType === "color") {
      multiplier = 0.002347; // Premium color
    } else if (paperColor === "cream") {
      multiplier = 0.0025; // Cream
    }

    let spine = pages * multiplier;
    if (bindingType === "hardcover") {
      // Hardcover wrap offset adds about 0.14 inches
      spine += 0.14;
    }
    return spine;
  };

  const spineWidth = calculateSpineWidth();

  // Viability Score
  const getViabilityReport = () => {
    let score = 50; // base score

    // Profit margin points
    if (netProfit > 3.0) score += 30;
    else if (netProfit > 1.5) score += 15;
    else if (netProfit <= 0) score -= 30;

    // Margin percentage points
    if (netMargin > 35) score += 20;
    else if (netMargin > 20) score += 10;
    else if (netMargin < 10) score -= 15;

    // Competitiveness influence
    if (competitiveness === "low") score += 20;
    else if (competitiveness === "high") score -= 25;

    let level: "excellent" | "moderate" | "poor" = "moderate";
    let color = "text-yellow-400 border-yellow-500/30 bg-yellow-500/5";
    let desc = "Moderate potential. Reasonable earnings possible but margins are sensitive to marketing spend and keyword bidding.";

    if (score >= 70) {
      level = "excellent";
      color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      desc = "Highly Lucrative & Scalable! Low competition and robust net profit margins make this puzzle book idea worth scaling immediately.";
    } else if (score < 40) {
      level = "poor";
      color = "text-rose-400 border-rose-500/30 bg-rose-500/5";
      desc = "High Risk / Crowded Market. Ad costs (PPC) and low pricing thresholds will likely wash out margins. Recommend selecting narrower sub-niches.";
    }

    return { score: Math.min(100, Math.max(0, score)), level, color, desc };
  };

  const viability = getViabilityReport();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        
        {/* Navigation & Title */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" /> Market Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              KDP Royalty & Market Viability Estimator
            </h1>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
        </div>

        {/* main interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Form Configurations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2rem] p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Book Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Page Count */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-400">Page Count: {pages}</label>
                    <span className="text-[10px] text-slate-500 font-semibold">(Min: 24, Max: 600)</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="600"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="24"
                    max="600"
                    value={pages}
                    onChange={(e) => setPages(Math.max(24, Math.min(600, Number(e.target.value) || 24)))}
                    className="w-24 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none"
                  />
                </div>

                {/* Retail Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">Retail Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none"
                      placeholder="8.99"
                    />
                  </div>
                </div>

                {/* Color/Binding Configs */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">Binding Type</label>
                  <div className="flex gap-2">
                    {(["paperback", "hardcover"] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setBindingType(b);
                          if (b === "hardcover" && pages < 75) setPages(75);
                        }}
                        className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border transition ${
                          bindingType === b
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color option */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">Color Option</label>
                  <div className="flex gap-2">
                    {(["bw", "color"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setColorType(c);
                          if (c === "color") setPaperColor("white");
                        }}
                        className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border transition ${
                          colorType === c
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {c === "bw" ? "Black & White" : "Premium Color"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper Color */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">Paper Color</label>
                  <div className="flex gap-2">
                    {(["white", "cream"] as const).map((p) => (
                      <button
                        key={p}
                        disabled={colorType === "color"}
                        onClick={() => setPaperColor(p)}
                        className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border transition disabled:opacity-30 ${
                          paperColor === p
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distribution option */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">Distribution Channel</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedDist(false)}
                      className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border transition ${
                        !expandedDist
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Amazon US (60%)
                    </button>
                    <button
                      onClick={() => setExpandedDist(true)}
                      className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border transition ${
                        expandedDist
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Expanded (40%)
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Promo & Marketing simulation */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2rem] p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> KDP Promotion & PPC Ad Simulator
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Promo type Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">Simulate Sales Strategy</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "none", name: "Standard Retail Sales" },
                      { id: "discount", name: "Countdown Deals / Promo discount" },
                      { id: "ku", name: "Kindle Unlimited (KU Page Reads)" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPromoType(t.id as any)}
                        className={`w-full py-2.5 px-4 text-xs text-left font-semibold rounded-xl border transition ${
                          promoType === t.id
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contextual parameters based on selection */}
                <div className="space-y-4">
                  {promoType === "discount" && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-xs font-bold text-slate-400 block">Promotional Discount: {promoDiscount}%</label>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-semibold block">Effective Promo Price: ${(price * (1 - promoDiscount/100)).toFixed(2)}</span>
                    </div>
                  )}

                  {promoType === "ku" && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-xs font-bold text-slate-400 block">Est. Page Read Completion: {kuReadRate}%</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={kuReadRate}
                        onChange={(e) => setKuReadRate(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-semibold block">KENP rate: ~$0.0045/page. Est. income: ${(pages * kuReadRate/100 * 0.0045).toFixed(2)}</span>
                    </div>
                  )}

                  {promoType === "none" && (
                    <p className="text-xs text-slate-500 italic leading-relaxed pt-3">
                      Simulate normal organic sales. Standard Amazon delivery charges are integrated in printing calculations.
                    </p>
                  )}
                </div>

                {/* Ads CPC (Pay Per Click) */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-400">Target Ads CPC ($)</label>
                    <span className="text-[10px] text-slate-500 font-semibold">Cost per click</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={adCpc}
                    onChange={(e) => setAdCpc(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none"
                    placeholder="0.35"
                  />
                </div>

                {/* Ads Conversion rate */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-400">Ads Conversion Rate: {adConv}%</label>
                    <span className="text-[10px] text-slate-500 font-semibold">(e.g., 10% = 10 clicks per sale)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={adConv}
                    onChange={(e) => setAdConv(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

              </div>
            </div>

            {/* Spine calculations & trim specifications */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2rem] p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Automated Cover Spine Math
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-600 block uppercase">Paper Spine Width</span>
                  <span className="text-sm font-black text-indigo-400">{spineWidth.toFixed(4)}"</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-600 block uppercase">Minimum Pages</span>
                  <span className="text-sm font-black text-indigo-400">{bindingType === "hardcover" ? "75 pages" : "24 pages"}</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-600 block uppercase">Bleed Requirement</span>
                  <span className="text-sm font-black text-indigo-400">0.125" borders</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-600 block uppercase">Wrap Safety margins</span>
                  <span className="text-sm font-black text-indigo-400">0.25" margins</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Spine formulas based on Amazon KDP template specifications (White Paper: 0.002252" per page, Cream Paper: 0.0025" per page, Color: 0.002347" per page).
              </p>
            </div>

          </div>

          {/* Right Column - Financial Summary & Viability score */}
          <div className="space-y-6">
            
            {/* Financial summary card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-md font-black text-white flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-emerald-400 animate-pulse" /> Financial Summary
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between border-b border-slate-900 pb-3">
                  <span className="text-slate-500">Base Trim Cost</span>
                  <span className="text-white font-bold">${printCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-slate-900 pb-3">
                  <span className="text-slate-500">Gross Royalty</span>
                  <span className="text-emerald-400 font-bold">${(promoType !== "none" ? promoRoyalty : baseRoyalty).toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-slate-900 pb-3">
                  <span className="text-slate-500">Ad Cost (Per Book Sold)</span>
                  <span className="text-red-400 font-bold">${adSpendPerSale.toFixed(2)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs font-black uppercase">Net Profit Margin</span>
                    <span className={`text-md font-black ${netProfit > 0 ? "text-emerald-400" : "text-rose-500"}`}>
                      ${netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${netMargin > 30 ? "bg-emerald-500" : netMargin > 15 ? "bg-yellow-500" : "bg-rose-500"}`}
                      style={{ width: `${Math.min(100, Math.max(0, netMargin))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-bold">
                    <span>Margin %</span>
                    <span>{netMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Niche Viability Score Card */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-6">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Niche Viability Scoring
              </h3>

              {/* category competitiveness selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Category Competition</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((comp) => (
                    <button
                      key={comp}
                      onClick={() => setCompetitiveness(comp)}
                      className={`py-1.5 text-[10px] font-black uppercase rounded-lg border transition ${
                        competitiveness === comp
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Display */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 text-center space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Market Viability Score</span>
                <div className="flex justify-center items-baseline gap-1">
                  <span className={`text-4xl font-black ${
                    viability.score >= 70 ? "text-emerald-400" :
                    viability.score >= 40 ? "text-yellow-400" :
                    "text-rose-400"
                  }`}>{viability.score}</span>
                  <span className="text-xs text-slate-500 font-bold">/100</span>
                </div>
                <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block border ${viability.color}`}>
                  {viability.level} POTENTIAL
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-900">
                <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 font-medium leading-normal">
                  {viability.desc}
                </p>
              </div>

              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-t border-slate-900 pt-4">
                <Award className="w-4 h-4 text-slate-500" /> Amazon KDP Trends Updated July 2026
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
