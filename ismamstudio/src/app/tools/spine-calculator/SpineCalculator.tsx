"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight,
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  BookOpen, 
  Sparkles, 
  Sliders,
  CheckCircle2
} from "lucide-react";
import { KDP_TRIM_SIZES } from "@/lib/kdpTrimSizes";
import { 
  calculateKdpLayout, 
  getKdpSpineMultiplier,
  KdpBindingType, 
  KdpInteriorType, 
  KdpPaperType,
  KdpMeasurementItem
} from "@/app/utils/kdpLayout";

interface Dimensions {
  spineWidth: number;
  fullWidth: number;
  fullHeight: number;
}

interface TrimPreset {
  name: string;
  width: number;
  height: number;
}

const PRESETS: TrimPreset[] = KDP_TRIM_SIZES.map((sz) => ({
  name: sz.label,
  width: sz.w,
  height: sz.h,
}));

export default function SpineCalculator() {
  const [bindingType, setBindingType] = useState<KdpBindingType>("paperback");
  const [interiorType, setInteriorType] = useState<KdpInteriorType>("standard_color");
  const [paperType, setPaperType] = useState<KdpPaperType>("white");
  const [trimWidth, setTrimWidth] = useState<number>(8.5);
  const [trimHeight, setTrimHeight] = useState<number>(11);
  const [pageCount, setPageCount] = useState<number>(200);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(() => {
    const idx = PRESETS.findIndex((p) => p.width === 8.5 && p.height === 11);
    return idx !== -1 ? idx : 0;
  });
  
  // Copy feedback states
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  // Hard KDP constraints
  const getPageLimits = () => {
    if (bindingType === "hardcover") {
      return { min: 75, max: 550 };
    }
    switch (paperType) {
      case "white":
        return { min: 24, max: 828 };
      case "cream":
        return { min: 24, max: 776 };
    }
  };

  const { min: minPages, max: maxPages } = getPageLimits();

  // Calculate layout using official Amazon KDP formula
  const layout = calculateKdpLayout({
    trimWidth,
    trimHeight,
    pageCount,
    bindingType,
    interiorType,
    paperType,
  });

  const dims: Dimensions = {
    spineWidth: layout.spineWidth,
    fullWidth: layout.coverWidthInches,
    fullHeight: layout.coverHeightInches,
  };

  // Reset function
  const handleReset = () => {
    setBindingType("paperback");
    setInteriorType("standard_color");
    setPaperType("white");
    setTrimWidth(8.5);
    setTrimHeight(11);
    setPageCount(200);
    const idx = PRESETS.findIndex((p) => p.width === 8.5 && p.height === 11);
    setSelectedPresetIndex(idx !== -1 ? idx : 0);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all 9 measurements formatted as a table
  const handleCopyAllTable = () => {
    const text = [
      `--- Official Amazon KDP Cover Measurements ---`,
      `Binding type: ${bindingType === 'paperback' ? 'Paperback' : 'Hardcover'}`,
      `Interior type: ${interiorType === 'standard_color' ? 'Standard color' : interiorType === 'premium_color' ? 'Premium color' : 'Black & white'}`,
      `Paper type: ${paperType === 'white' ? 'White paper' : 'Cream paper'}`,
      `Trim size: ${trimWidth}" x ${trimHeight}"`,
      `Page count: ${pageCount}`,
      ``,
      `#  Description         Width (in)  Height (in)`,
      `----------------------------------------------`,
      ...layout.measurements.items.map(
        item => `${item.id}  ${item.description.padEnd(19)} ${item.width.toFixed(3).padEnd(11)} ${item.height.toFixed(3)}`
      ),
      `----------------------------------------------`,
      `Calculated by KDPage (https://kdpage.com/tools/spine-calculator)`
    ].join('\n');
    handleCopy(text, 'all');
  };

  // Handle preset change
  const handlePresetSelect = (index: number) => {
    setSelectedPresetIndex(index);
    if (index >= 0) {
      setTrimWidth(PRESETS[index].width);
      setTrimHeight(PRESETS[index].height);
    }
  };

  // Handle manual dimension adjustments
  const handleDimensionChange = (val: number, isWidth: boolean) => {
    setSelectedPresetIndex(-1); // Switch to custom
    if (isWidth) {
      setTrimWidth(val);
    } else {
      setTrimHeight(val);
    }
  };

  // Warning Checks
  const isSpineTextEligible = pageCount >= 79;
  const isExceedingLimit = pageCount > maxPages;
  const isBelowMin = pageCount < minPages;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden font-sans">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 100% Free Tool
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Free KDP Spine & Cover Calculator
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Determine precise spine widths and full cover layouts matching Amazon KDP specifications. No registration required.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Free Tool Banner */}
        <div className="bg-gradient-to-r from-emerald-950/20 to-indigo-950/20 border border-emerald-500/25 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-200">
              Free specifications generator — no account creation, login, or credit card required.
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full">
            Ready to use
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls & Inputs (Left 5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" /> Cover Specifications
                </h3>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Trim Size Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Book Trim Size
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetSelect(idx)}
                      className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
                        selectedPresetIndex === idx
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                          : "bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="opacity-80 font-mono">
                        {preset.width}" x {preset.height}"
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => handlePresetSelect(-1)}
                    className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
                      selectedPresetIndex === -1
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <span>Custom Dimensions</span>
                    <span className="opacity-80">Manual Entry</span>
                  </button>
                </div>
              </div>

              {/* Custom Dimension Inputs */}
              {selectedPresetIndex === -1 && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Trim Width (inches)
                    </span>
                    <input
                      type="number"
                      step="0.001"
                      min="4"
                      max="12"
                      value={trimWidth || ""}
                      onChange={(e) => handleDimensionChange(parseFloat(e.target.value) || 0, true)}
                      className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. 6"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Trim Height (inches)
                    </span>
                    <input
                      type="number"
                      step="0.001"
                      min="4"
                      max="12"
                      value={trimHeight || ""}
                      onChange={(e) => handleDimensionChange(parseFloat(e.target.value) || 0, false)}
                      className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. 9"
                    />
                  </div>
                </div>
              )}

              {/* Binding Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Binding Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBindingType("paperback")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      bindingType === "paperback"
                        ? "bg-indigo-600 border-indigo-500 text-white font-black shadow-md shadow-indigo-600/20"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Paperback
                    <span className="block text-[9px] opacity-75">Standard (0.125" Bleed)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBindingType("hardcover")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      bindingType === "hardcover"
                        ? "bg-indigo-600 border-indigo-500 text-white font-black shadow-md shadow-indigo-600/20"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Hardcover
                    <span className="block text-[9px] opacity-75">Case Laminate (0.562" Wrap)</span>
                  </button>
                </div>
              </div>

              {/* Interior Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Interior Type
                </label>
                <select
                  value={interiorType}
                  onChange={(e) => {
                    const newType = e.target.value as KdpInteriorType;
                    setInteriorType(newType);
                    if (newType !== "black_white") {
                      setPaperType("white");
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="standard_color">Standard color (0.00225" per page)</option>
                  <option value="premium_color">Premium color (0.002347" per page)</option>
                  <option value="black_white">Black &amp; white (Standard paperback)</option>
                </select>
              </div>

              {/* Paper Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Paper Type
                </label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value as KdpPaperType)}
                  disabled={interiorType !== "black_white"}
                  className={`w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    interiorType !== "black_white" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="white">White paper</option>
                  <option value="cream">Cream paper (B&amp;W only)</option>
                </select>
                {interiorType !== "black_white" && (
                  <span className="text-[10px] text-slate-500 block">
                    * KDP Color printing exclusively uses 50-70 lb white paper.
                  </span>
                )}
              </div>

              {/* Page Count */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Page Count
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={minPages}
                      max={maxPages}
                      step={2}
                      value={pageCount || ""}
                      onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-900 text-white rounded-lg px-2.5 py-1 text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-bold">pages</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={minPages}
                  max={maxPages}
                  step={2}
                  value={pageCount || minPages}
                  onChange={(e) => setPageCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-black">
                  <span>{minPages} PGS</span>
                  <span>RECOMMENDED MAX: {maxPages} PGS</span>
                </div>
                {pageCount > 0 && pageCount % 2 !== 0 && (
                  <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                    ℹ️ Amazon KDP paperback requires an even page count. {pageCount}p is automatically calculated as {pageCount + 1}p for the physical spine.
                  </p>
                )}
              </div>

              {/* Constraint/Warnings alerts */}
              <div className="space-y-2 pt-2">
                {!isSpineTextEligible && pageCount > 0 && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl text-xs leading-relaxed font-semibold">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Spine text requires a minimum of <strong>79 pages</strong>. 
                      At {pageCount} pages, Amazon KDP will reject covers containing text on the spine fold.
                    </span>
                  </div>
                )}
                {isExceedingLimit && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs leading-relaxed font-semibold">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Page count exceeds KDP limits for this paper type (Max <strong>{maxPages} pages</strong>).
                    </span>
                  </div>
                )}
                {isBelowMin && pageCount > 0 && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs leading-relaxed font-semibold">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Page count is below KDP minimum requirements (Min <strong>{minPages} pages</strong>).
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Quick specifications Reference */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-6 space-y-4 backdrop-blur-md text-xs">
              <h4 className="font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" /> KDP Cover Design Rules
              </h4>
              <ul className="space-y-2 text-slate-400 font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>Bleed requirements: Adds <strong>0.125"</strong> to all outer edges (totaling 0.25" added to height, and 0.25" to combined width).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>Barcode Safety: Keep all text/important details 0.25" away from the cover edges and 0.125" away from spine hinges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>Calculations are output in <strong>inches (in)</strong>. Ideal DPI is <strong>300 DPI</strong> for printing.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Results & Live SVG Preview (Right 7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Calculation Outputs Panel */}
            <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/40 rounded-[2rem] border border-indigo-900/30 p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[5rem] -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Exact Amazon KDP Measurements
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Calculated matching official Amazon KDP Cover Calculator specifications.
                  </p>
                </div>
                <button
                  onClick={handleCopyAllTable}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  {copiedId === 'all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Table
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy All Specs
                    </>
                  )}
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Full Cover Card (#1) */}
                <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">#1 Full Cover</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">Total</span>
                    </div>
                    <div className="text-xl font-black text-white mt-1 font-mono">
                      {layout.coverWidthInches.toFixed(3)}" × {layout.coverHeightInches.toFixed(3)}"
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      ({trimWidth}"×2 + {layout.spineWidth.toFixed(3)}" + 0.25" bleed)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(`${layout.coverWidthInches.toFixed(3)}" × ${layout.coverHeightInches.toFixed(3)}"`, 'full')}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedId === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>

                {/* Spine Width Card (#6) */}
                <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">#6 Spine Width</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">Spine</span>
                    </div>
                    <div className="text-xl font-black text-white mt-1 font-mono">
                      {layout.spineWidth.toFixed(3)}"
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      ({pageCount} pgs × {getKdpSpineMultiplier(interiorType, paperType)}")
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(layout.spineWidth.toFixed(3), 'spine')}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedId === 'spine' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>

                {/* Safe Area Card (#3) */}
                <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">#3 Safe Area</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Live</span>
                    </div>
                    <div className="text-xl font-black text-white mt-1 font-mono">
                      {layout.measurements.safeArea.width.toFixed(3)}" × {layout.measurements.safeArea.height.toFixed(3)}"
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      (0.125" safety margin inside trim)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(`${layout.measurements.safeArea.width.toFixed(3)}" × ${layout.measurements.safeArea.height.toFixed(3)}"`, 'safe')}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedId === 'safe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
              </div>

              {/* Official Amazon KDP 9-Measurement Table */}
              <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Official KDP Cover Calculator Breakdown
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    Units: Inches (in)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Width (in)</th>
                        <th className="py-2.5 px-3 text-right">Height (in)</th>
                        <th className="py-2.5 px-3 text-center">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/80 font-mono text-slate-200">
                      {layout.measurements.items.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-500/5 transition-colors">
                          <td className="py-2 px-3 font-bold">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[11px] font-bold">
                              {item.id}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans font-bold text-slate-200">
                            {item.description}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-amber-400">
                            {item.width.toFixed(3)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-amber-400">
                            {item.height.toFixed(3)}
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <button
                              onClick={() => handleCopy(`${item.description}: ${item.width.toFixed(3)}" × ${item.height.toFixed(3)}"`, item.id)}
                              className="inline-flex items-center justify-center p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                              title={`Copy ${item.description}`}
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic SVG Blueprint with Official Numbered Callouts (❶ to ❾) */}
              <div className="bg-slate-950/80 border border-slate-900/60 rounded-2xl p-6 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Official Template Blueprint with Guide Numbers (❶–❾)
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400">
                    Matches Amazon KDP Cover Diagram
                  </span>
                </div>

                {/* SVG Mockup */}
                <div className="w-full max-w-[480px] aspect-[1.6/1] relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 420 250"
                    className="w-full h-full text-slate-200 fill-none select-none"
                  >
                    <defs>
                      <pattern id="small-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(99, 102, 241, 0.04)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#small-grid)" />

                    {/* Outer Bleed Boundary (Dashed red line) - #4 */}
                    <rect 
                      x="15" 
                      y="20" 
                      width="390" 
                      height="190" 
                      stroke="#ef4444" 
                      strokeDasharray="4,4" 
                      strokeWidth="1.2" 
                    />

                    {/* Trim Line Boundary - #2 */}
                    <rect 
                      x="22" 
                      y="27" 
                      width="376" 
                      height="176" 
                      stroke="#6366f1" 
                      strokeWidth="1.5" 
                    />
                    
                    {/* Safe Area Inner Boundary (Dashed Green) - #3 */}
                    <rect 
                      x="28" 
                      y="33" 
                      width="168" 
                      height="164" 
                      stroke="#10b981" 
                      strokeDasharray="3,3" 
                      strokeWidth="1" 
                    />
                    <rect 
                      x="224" 
                      y="33" 
                      width="168" 
                      height="164" 
                      stroke="#10b981" 
                      strokeDasharray="3,3" 
                      strokeWidth="1" 
                    />

                    {/* Back Cover Fill */}
                    <rect 
                      x="22" 
                      y="27" 
                      width="180" 
                      height="176" 
                      fill="rgba(99, 102, 241, 0.04)" 
                    />
                    
                    {/* Front Cover Fill */}
                    <rect 
                      x="218" 
                      y="27" 
                      width="180" 
                      height="176" 
                      fill="rgba(99, 102, 241, 0.04)" 
                    />

                    {/* Spine Area - #6 */}
                    <rect 
                      x="202" 
                      y="27" 
                      width="16" 
                      height="176" 
                      fill="rgba(245, 158, 11, 0.12)" 
                      stroke="#f59e0b" 
                      strokeWidth="1" 
                    />

                    {/* Spine Safe Area - #7 */}
                    <rect 
                      x="204" 
                      y="33" 
                      width="12" 
                      height="164" 
                      stroke="#10b981" 
                      strokeDasharray="2,2" 
                      strokeWidth="0.8" 
                    />

                    {/* Barcode Placeholder - #9 */}
                    <rect 
                      x="35" 
                      y="150" 
                      width="42" 
                      height="32" 
                      fill="rgba(255, 255, 255, 0.12)" 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      strokeWidth="1" 
                    />
                    <line x1="40" y1="155" x2="40" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <line x1="45" y1="155" x2="45" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <line x1="50" y1="155" x2="50" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
                    <line x1="55" y1="155" x2="55" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <line x1="60" y1="155" x2="60" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                    <line x1="65" y1="155" x2="65" y2="175" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <text x="40" y="180" fill="rgba(255, 255, 255, 0.4)" fontSize="4.5" fontWeight="bold">BARCODE</text>

                    {/* Section Titles */}
                    <text x="112" y="115" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle">Back Cover</text>
                    <text x="308" y="115" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle">Front Cover</text>
                    
                    {/* Spine Text / Safety Status */}
                    <g transform="translate(210, 115) rotate(90)">
                      <text 
                        x="0" 
                        y="0" 
                        fill={layout.canHaveSpineText ? "#fbbf24" : "rgba(239, 68, 68, 0.6)"} 
                        fontSize={layout.canHaveSpineText ? "5.5" : "4.5"} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {layout.canHaveSpineText ? "SPINE TEXT" : "TEXT BLOCKED (<79p)"}
                      </text>
                    </g>

                    {/* NUMBERED CALLOUT BADGES MATCHING AMAZON KDP DIAGRAM (#1 to #9) */}
                    
                    {/* ❶ Full Cover Badge (Right edge dimension) */}
                    <circle cx="410" cy="115" r="7" fill="#6366f1" />
                    <text x="410" y="118" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">1</text>

                    {/* ❷ Front Cover Badge */}
                    <circle cx="395" cy="115" r="7" fill="#6366f1" />
                    <text x="395" y="118" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">2</text>

                    {/* ❸ Safe Area Badge */}
                    <circle cx="380" cy="115" r="7" fill="#10b981" />
                    <text x="380" y="118" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">3</text>

                    {/* ❹ Bleed Badge (Top margin) */}
                    <circle cx="360" cy="14" r="7" fill="#ef4444" />
                    <text x="360" y="17" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">4</text>

                    {/* ❺ Margin Badge (Top margin between trim & safe) */}
                    <circle cx="342" cy="14" r="7" fill="#10b981" />
                    <text x="342" y="17" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">5</text>

                    {/* ❻ Spine Badge (Top center) */}
                    <circle cx="210" cy="14" r="7" fill="#f59e0b" />
                    <text x="210" y="17" fill="#000000" fontSize="8" fontWeight="black" textAnchor="middle">6</text>

                    {/* ❼ Spine Safe Area Badge */}
                    <circle cx="210" cy="225" r="7" fill="#10b981" />
                    <text x="210" y="228" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">7</text>

                    {/* ❽ Spine Margin Badge */}
                    <circle cx="190" cy="225" r="7" fill="#818cf8" />
                    <text x="190" y="228" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">8</text>

                    {/* ❾ Barcode Margin Badge */}
                    <circle cx="82" cy="166" r="7" fill="#f59e0b" />
                    <text x="82" y="169" fill="#000000" fontSize="8" fontWeight="black" textAnchor="middle">9</text>

                    {/* Dimension Arrows */}
                    {/* Full Width Arrow (Bottom) */}
                    <line x1="15" y1="240" x2="405" y2="240" stroke="#818cf8" strokeWidth="1" />
                    <polygon points="15,240 20,237 20,243" fill="#818cf8" />
                    <polygon points="405,240 400,237 400,243" fill="#818cf8" />
                    <text x="210" y="247" fill="#818cf8" fontSize="7" fontWeight="bold" textAnchor="middle">
                      #1 Full Cover Width: {layout.coverWidthInches.toFixed(3)}"
                    </text>
                  </svg>
                </div>

                {/* Guide Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full border-t border-slate-900/80 pt-4 mt-3 text-[10px] text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[9px] font-black shrink-0">1</span>
                    <span>Full Cover (Bleed incl.)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center text-[9px] font-black shrink-0">2</span>
                    <span>Front/Back Trim</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center text-[9px] font-black shrink-0">3</span>
                    <span>Live Safe Area</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-black inline-flex items-center justify-center text-[9px] font-black shrink-0">6</span>
                    <span>Spine Width ({layout.spineWidth.toFixed(3)}")</span>
                  </div>
                </div>

              </div>

              {/* High-Intent Conversion Bridge directly under Blueprint */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-5 p-6 md:p-7 bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border-2 border-amber-400/60 rounded-[2rem] shadow-xl shadow-amber-500/10 backdrop-blur-sm mt-4">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    Cover Dimensions Ready: {dims.fullWidth.toFixed(3)}&quot; × {dims.fullHeight.toFixed(3)}&quot;
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-white">
                    Auto-Generate Your Cover &amp; 100+ Page Interior in 60s
                  </h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
                    Transfer these exact dimensions straight into KDPage Studio. Export print-ready 300 DPI vector PDFs with zero KDP rejection risk.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <a
                    href="https://www.dealfuel.com/seller/kdpage-kdp-book-creator/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center px-6 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
                  >
                    <span>🎁 Claim $69 Lifetime Deal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </a>
                  <Link
                    href="/studio?tab=cover"
                    className="w-full text-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Free Studio</span>
                    <ArrowLeft className="-rotate-180 w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* F.A.Q. Guide */}
        <section className="bg-slate-900/20 rounded-[2.5rem] border border-slate-900/50 p-8 md:p-12 relative overflow-hidden shadow-xl">
          <h2 className="text-2xl font-black text-white mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">Why does my page count affect the cover size?</h3>
              <p className="text-slate-400 font-semibold leading-relaxed">
                In physical books, the spine width grows or shrinks based on how many sheets of paper are bound together. 
                Our calculator automatically adjusts the spine width using the precise sheet thickness multipliers provided by Amazon KDP.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What is &quot;Bleed&quot; and why is it exactly 0.25&quot;?</h3>
              <p className="text-slate-500 font-semibold leading-relaxed">
                Bleed is the extra print margin (0.125&quot; on each outer edge) required by printers to ensure colors and artwork 
                extend fully to the edge after the page is trimmed. Since bleed is added to the left and right sides of the cover, 
                it increases the overall cover width by 0.25&quot;. Similarly, it increases the cover height by 0.25&quot; (top and bottom).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">Why can&apos;t I put text on my spine?</h3>
              <p className="text-slate-500 font-semibold leading-relaxed">
                Books with fewer than 79 pages have extremely thin spines (under 0.17 inches). 
                Printers cannot guarantee the alignment of text on such thin areas without it spilling onto the front or back covers, 
                so Amazon KDP prohibits spine text for books under 79 pages.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What is the difference between Paper Types?</h3>
              <p className="text-slate-500 font-semibold leading-relaxed">
                White and Cream paper types have slightly different physical thicknesses (Cream is thicker at 0.0025&quot; per page vs. White at 0.002252&quot;). 
                Color printing uses another grade of white paper which is slightly thicker (0.002347&quot;). Choosing the correct option ensures your spine 
                matches the real thickness perfectly.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Rich SEO Content Block (Updated 2025) ─── */}
        <section className="space-y-10 text-sm leading-relaxed text-slate-400">

          {/* Freshness badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            KDP Specifications — Updated 2026
          </div>

          {/* Formula block */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-black text-white">How to Calculate KDP Spine Width — The Official Amazon Formula</h2>
            <p className="text-slate-400">
              Amazon KDP calculates spine width using the physical thickness of each individual page multiplied by your total page count.
              The exact multiplier depends on your chosen paper type:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "White Paper (B&W)", value: "0.002252\"", sub: "per page", color: "indigo" },
                { label: "Cream Paper (B&W)", value: "0.0025\"", sub: "per page (thicker)", color: "amber" },
                { label: "White Paper (Color)", value: "0.002347\"", sub: "per page", color: "emerald" },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${
                  item.color === "indigo" ? "bg-indigo-500/10 border-indigo-500/20" :
                  item.color === "amber" ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-emerald-500/10 border-emerald-500/20"
                }`}>
                  <div className={`text-2xl font-black mb-1 ${
                    item.color === "indigo" ? "text-indigo-300" :
                    item.color === "amber" ? "text-amber-300" : "text-emerald-300"
                  }`}>{item.value}</div>
                  <div className="font-bold text-slate-200 text-xs">{item.label}</div>
                  <div className="text-slate-500 text-[11px]">{item.sub}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-950/60 rounded-xl p-4 font-mono text-xs space-y-1">
              <p className="text-emerald-400 font-black">{"/* KDP Spine Width Formula */"}</p>
              <p className="text-slate-300">Spine Width = Page Count × Paper Multiplier</p>
              <p className="text-slate-300">Full Cover Width = (Trim Width × 2) + Spine Width + 0.25&quot;</p>
              <p className="text-slate-300">Full Cover Height = Trim Height + 0.25&quot;</p>
              <p className="text-slate-500 text-[10px] mt-2">* 0.25&quot; = 0.125&quot; bleed on each outer edge (left + right, or top + bottom)</p>
            </div>
          </div>

          {/* Page count reference table */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-white">KDP Spine Width Reference Table — White Paper (B&W)</h2>
            <p className="text-slate-400">Pre-calculated spine widths for common page counts using the official 0.002252&quot;/page multiplier:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 pr-4 text-slate-400 font-black">Page Count</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-black">Spine Width (in)</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-black">Spine Width (mm)</th>
                    <th className="text-left py-2 text-slate-400 font-black">Spine Text OK?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [50, "0.1126", "2.86", "No (< 79 pages)"],
                    [79, "0.1779", "4.52", "Yes (minimum)"],
                    [100, "0.2252", "5.72", "Yes"],
                    [150, "0.3378", "8.58", "Yes"],
                    [200, "0.4504", "11.44", "Yes"],
                    [250, "0.5630", "14.30", "Yes"],
                    [300, "0.6756", "17.16", "Yes"],
                    [350, "0.7882", "20.02", "Yes"],
                    [400, "0.9008", "22.88", "Yes"],
                    [500, "1.1260", "28.60", "Yes"],
                    [600, "1.3512", "34.32", "Yes"],
                    [700, "1.5764", "40.04", "Yes"],
                    [828, "1.8647", "47.36", "Yes (max)"],
                  ].map(([pages, inches, mm, text]) => (
                    <tr key={pages} className="border-b border-slate-900/60 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2 pr-4 text-white font-bold">{pages}</td>
                      <td className="py-2 pr-4 text-indigo-300 font-mono">{inches}&quot;</td>
                      <td className="py-2 pr-4 text-slate-300 font-mono">{mm} mm</td>
                      <td className={`py-2 font-bold text-[11px] ${String(text).startsWith("Yes") ? "text-emerald-400" : "text-red-400"}`}>{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paper type comparison */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-white">KDP Paper Type Comparison — Which Should You Choose?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                {
                  title: "White Paper (B&W)",
                  multiplier: "0.002252\"/page",
                  maxPages: "828 pages",
                  best: "Novels, journals, workbooks, puzzle books",
                  note: "Standard option. Bright white finish.",
                  color: "indigo"
                },
                {
                  title: "Cream Paper (B&W)",
                  multiplier: "0.0025\"/page",
                  maxPages: "776 pages",
                  best: "Fiction, literary books, poetry",
                  note: "Warmer tone. 11% thicker per page than white.",
                  color: "amber"
                },
                {
                  title: "White Paper (Color)",
                  multiplier: "0.002347\"/page",
                  maxPages: "828 pages",
                  best: "Children's books, coloring books, illustrated guides",
                  note: "Higher print cost. Vivid color reproduction.",
                  color: "emerald"
                },
              ].map((item) => (
                <div key={item.title} className={`p-4 rounded-xl border space-y-2 ${
                  item.color === "indigo" ? "bg-indigo-500/[0.06] border-indigo-500/20" :
                  item.color === "amber" ? "bg-amber-500/[0.06] border-amber-500/20" :
                  "bg-emerald-500/[0.06] border-emerald-500/20"
                }`}>
                  <div className="font-black text-white">{item.title}</div>
                  <div className={`font-mono font-black text-sm ${
                    item.color === "indigo" ? "text-indigo-300" :
                    item.color === "amber" ? "text-amber-300" : "text-emerald-300"
                  }`}>{item.multiplier}</div>
                  <div className="text-slate-400"><span className="text-slate-300 font-bold">Max: </span>{item.maxPages}</div>
                  <div className="text-slate-400"><span className="text-slate-300 font-bold">Best for: </span>{item.best}</div>
                  <div className="text-slate-500 italic">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Common trim sizes */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-white">Amazon KDP Standard Trim Sizes — 2026</h2>
            <p className="text-slate-400">These are the most popular KDP paperback trim sizes used by self-publishers:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { size: "5\" × 8\"", use: "Novels, memoirs" },
                { size: "5.25\" × 8\"", use: "Fiction" },
                { size: "5.5\" × 8.5\"", use: "Compact non-fiction" },
                { size: "6\" × 9\"", use: "Standard (most popular)" },
                { size: "7\" × 10\"", use: "Textbooks, workbooks" },
                { size: "8\" × 10\"", use: "Workbooks" },
                { size: "8.5\" × 8.5\"", use: "Square coloring books" },
                { size: "8.5\" × 11\"", use: "Large workbooks, planners" },
                { size: "8.25\" × 6\"", use: "Landscape children's books" },
              ].map((item) => (
                <div key={item.size} className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                  <span className="text-indigo-400 font-black font-mono shrink-0">{item.size}</span>
                  <span className="text-slate-500">{item.use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Cover Dimensions Cheat Sheet (6x9 and 8.5x11) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Fast Dimensions Lookup
              </div>
              <h2 className="text-2xl font-black text-white">
                KDP Cover Dimensions Quick Reference (6&quot; × 9&quot; &amp; 8.5&quot; × 11&quot;)
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Full wrap-around cover dimensions including 0.125&quot; bleed on all outer edges for white paper (0.002252&quot;/page):
              </p>
            </div>

            {/* 6x9 Table */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-indigo-300">6&quot; × 9&quot; Standard Paperback Dimensions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                      <th className="py-2.5 pr-4">Page Count</th>
                      <th className="py-2.5 pr-4">Spine Width</th>
                      <th className="py-2.5 pr-4">Full Width (with bleed)</th>
                      <th className="py-2.5 pr-4">Full Height</th>
                      <th className="py-2.5">Canvas Pixels (300 DPI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-medium text-slate-300">
                    {[
                      { pages: "100 pages", spine: '0.225"', width: '12.475"', height: '9.250"', px: "3743 × 2775 px" },
                      { pages: "120 pages", spine: '0.270"', width: '12.520"', height: '9.250"', px: "3756 × 2775 px" },
                      { pages: "150 pages", spine: '0.338"', width: '12.588"', height: '9.250"', px: "3776 × 2775 px" },
                      { pages: "200 pages", spine: '0.450"', width: '12.700"', height: '9.250"', px: "3810 × 2775 px" },
                      { pages: "300 pages", spine: '0.676"', width: '12.926"', height: '9.250"', px: "3878 × 2775 px" },
                    ].map((row) => (
                      <tr key={row.pages} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-white">{row.pages}</td>
                        <td className="py-2.5 pr-4 font-mono text-indigo-300">{row.spine}</td>
                        <td className="py-2.5 pr-4 font-mono text-emerald-300">{row.width}</td>
                        <td className="py-2.5 pr-4 font-mono text-slate-300">{row.height}</td>
                        <td className="py-2.5 font-mono text-amber-300 font-bold">{row.px}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8.5x11 Table */}
            <div className="space-y-2 pt-2">
              <h3 className="text-base font-bold text-amber-300">8.5&quot; × 11&quot; Workbook &amp; Activity Book Dimensions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                      <th className="py-2.5 pr-4">Page Count</th>
                      <th className="py-2.5 pr-4">Spine Width</th>
                      <th className="py-2.5 pr-4">Full Width (with bleed)</th>
                      <th className="py-2.5 pr-4">Full Height</th>
                      <th className="py-2.5">Canvas Pixels (300 DPI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-medium text-slate-300">
                    {[
                      { pages: "80 pages", spine: '0.180"', width: '17.430"', height: '11.250"', px: "5229 × 3375 px" },
                      { pages: "100 pages", spine: '0.225"', width: '17.475"', height: '11.250"', px: "5243 × 3375 px" },
                      { pages: "120 pages", spine: '0.270"', width: '17.520"', height: '11.250"', px: "5256 × 3375 px" },
                      { pages: "150 pages", spine: '0.338"', width: '17.588"', height: '11.250"', px: "5276 × 3375 px" },
                      { pages: "200 pages", spine: '0.450"', width: '17.700"', height: '11.250"', px: "5310 × 3375 px" },
                    ].map((row) => (
                      <tr key={row.pages} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-white">{row.pages}</td>
                        <td className="py-2.5 pr-4 font-mono text-indigo-300">{row.spine}</td>
                        <td className="py-2.5 pr-4 font-mono text-emerald-300">{row.width}</td>
                        <td className="py-2.5 pr-4 font-mono text-slate-300">{row.height}</td>
                        <td className="py-2.5 font-mono text-amber-300 font-bold">{row.px}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </section>

        {/* Conversion Bridge to Studio & Lifetime Deal */}
        <section className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-amber-500/25 via-slate-900 to-amber-950/40 border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.35)]">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              {/* Eye-catching badge with bold BLACK text */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-xl shadow-amber-500/40 border border-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                <span>🚀 Need a Complete Full-Wrap Cover? Use Our Automated Cover Creator!</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Turn Your Cover Math Into A <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Published Book</span> Today
              </h3>
              
              <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                Ready to publish? Skip Photoshop and Canva hassles. Take your calculated dimensions directly into KDPage Studio to design full-bleed covers, auto-generate 100+ pages of puzzle interiors with solution keys, and export print-ready 300 DPI vector PDFs with zero rejection risk.
              </p>

              {/* 3 bullet perks */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-bold text-slate-200 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold">100% Watermark-Free 300 DPI</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold">Commercial Resale License</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold">Zero KDP Rejection Guarantee</span>
                </span>
              </div>
            </div>

            {/* High-converting action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full lg:w-auto shrink-0">
              <Link
                href="/tools/kdp-cover-creator"
                className="w-full text-center px-9 py-4.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
              >
                <span>Automated Cover Creator →</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
              
              <Link
                href="/studio"
                className="w-full text-center px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-2"
              >
                <span>Launch Free Studio</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
