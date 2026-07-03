"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  BookOpen, 
  Sparkles, 
  Sliders 
} from "lucide-react";

// Paper Type specifications
type PaperType = "white" | "cream" | "color";

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

const PRESETS: TrimPreset[] = [
  { name: '6" x 9" (Standard Novel)', width: 6, height: 9 },
  { name: '8.5" x 11" (Standard Workbook/Coloring)', width: 8.5, height: 11 },
  { name: '5.5" x 8.5" (Compact Novel)', width: 5.5, height: 8.5 },
  { name: '8.25" x 6" (Landscape Children)', width: 8.25, height: 6 },
  { name: '8.5" x 8.5" (Square Coloring)', width: 8.5, height: 8.5 },
];

export default function SpineCalculatorPage() {
  const [trimWidth, setTrimWidth] = useState<number>(6);
  const [trimHeight, setTrimHeight] = useState<number>(9);
  const [pageCount, setPageCount] = useState<number>(100);
  const [paperType, setPaperType] = useState<PaperType>("white");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0); // 0 is 6x9, -1 is custom
  
  // Copy feedback states
  const [copiedSpine, setCopiedSpine] = useState(false);
  const [copiedWidth, setCopiedWidth] = useState(false);
  const [copiedHeight, setCopiedHeight] = useState(false);

  // Hard KDP constraints
  const getPageLimits = () => {
    switch (paperType) {
      case "white":
        return { min: 24, max: 828 };
      case "cream":
        return { min: 24, max: 776 };
      case "color":
        return { min: 24, max: 828 };
    }
  };

  const { min: minPages, max: maxPages } = getPageLimits();

  // Spine Calculation Multipliers (inches per page)
  const calculateDimensions = (): Dimensions => {
    let spineMultiplier = 0.002252; // White Paper (Black & White printing)
    if (paperType === "cream") spineMultiplier = 0.0025; // Cream Paper (Black & White printing)
    if (paperType === "color") spineMultiplier = 0.002347; // White Paper (Color printing)

    // Calculate Spine Width
    const spineWidth = pageCount * spineMultiplier;

    // Full Cover Width = Trim Width * 2 + Spine Width + 0.25 (0.125" bleed on each side)
    const fullWidth = trimWidth * 2 + spineWidth + 0.25;

    // Full Cover Height = Trim Height + 0.25 (0.125" bleed on top and bottom)
    const fullHeight = trimHeight + 0.25;

    return {
      spineWidth,
      fullWidth,
      fullHeight,
    };
  };

  const dims = calculateDimensions();

  // Reset function
  const handleReset = () => {
    setTrimWidth(6);
    setTrimHeight(9);
    setPageCount(100);
    setPaperType("white");
    setSelectedPresetIndex(0);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Book Design Utilities
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              KDP Spine & Cover Dimensions Calculator
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Determine precise spine widths and full cover layouts matching Amazon KDP specifications.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
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
                          ? "bg-indigo-650/20 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                          : "bg-slate-950/40 border-slate-900 text-slate-450 hover:bg-slate-900 hover:text-slate-200"
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
                        ? "bg-indigo-650/20 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                        : "bg-slate-950/40 border-slate-900 text-slate-450 hover:bg-slate-900 hover:text-slate-200"
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
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-450">
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
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-450">
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

              {/* Paper Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Paper Type & Printing
                </label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value as PaperType)}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="white">White Paper (Black & White printing)</option>
                  <option value="cream">Cream Paper (Black & White printing)</option>
                  <option value="color">White Paper (Premium Color printing)</option>
                </select>
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
                      value={pageCount || ""}
                      onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-900 text-white rounded-lg px-2.5 py-1 text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-450 font-bold">pages</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={minPages}
                  max={maxPages}
                  value={pageCount || minPages}
                  onChange={(e) => setPageCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[10px] text-slate-450 font-black">
                  <span>{minPages} PGS</span>
                  <span>RECOMMENDED MAX: {maxPages} PGS</span>
                </div>
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
                  <span className="text-indigo-455 font-bold">•</span>
                  <span>Bleed requirements: Adds <strong>0.125"</strong> to all outer edges (totaling 0.25" added to height, and 0.25" to combined width).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-455 font-bold">•</span>
                  <span>Barcode Safety: Keep all text/important details 0.25" away from the cover edges and 0.125" away from spine hinges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-455 font-bold">•</span>
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
              
              <h3 className="text-lg font-black text-white">Calculated Measurements</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Spine Card */}
                <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Spine Width</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">
                      {dims.spineWidth.toFixed(4)}"
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(dims.spineWidth.toFixed(4), setCopiedSpine)}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedSpine ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-450" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Value
                      </>
                    )}
                  </button>
                </div>

                {/* Cover Width Card */}
                <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Cover Width</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">
                      {dims.fullWidth.toFixed(3)}"
                    </div>
                    <span className="text-[9px] text-slate-450 font-bold block mt-0.5">
                      ({trimWidth}" + {dims.spineWidth.toFixed(4)}" + {trimWidth}" + 0.25")
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dims.fullWidth.toFixed(3), setCopiedWidth)}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedWidth ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-450" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Value
                      </>
                    )}
                  </button>
                </div>

                {/* Cover Height Card */}
                <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Cover Height</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">
                      {dims.fullHeight.toFixed(3)}"
                    </div>
                    <span className="text-[9px] text-slate-450 font-bold block mt-0.5">
                      ({trimHeight}" + 0.25" bleed)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dims.fullHeight.toFixed(3), setCopiedHeight)}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedHeight ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-450" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Value
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Dynamic SVG Blueprint */}
              <div className="bg-slate-950/80 border border-slate-900/60 rounded-2xl p-6 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-4 block self-start">
                  Dynamic Cover Blueprint Preview
                </span>

                {/* SVG Mockup */}
                <div className="w-full max-w-[450px] aspect-[1.618/1] relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 240"
                    className="w-full h-full text-slate-200 fill-none"
                  >
                    {/* Background Grid Lines */}
                    <defs>
                      <pattern id="small-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(99, 102, 241, 0.03)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#small-grid)" />

                    {/* Outer Bleed Boundary (Dashed red line) */}
                    <rect 
                      x="10" 
                      y="20" 
                      width="380" 
                      height="180" 
                      stroke="#ef4444" 
                      strokeDasharray="4,4" 
                      strokeWidth="1" 
                    />
                    <text x="14" y="32" fill="#ef4444" fontSize="8" fontWeight="bold">Bleed Area Boundary (+0.125")</text>

                    {/* Trim Line Boundary */}
                    <rect 
                      x="16" 
                      y="26" 
                      width="368" 
                      height="168" 
                      stroke="#6366f1" 
                      strokeWidth="1.5" 
                    />
                    
                    {/* Back Cover Fill */}
                    <rect 
                      x="16" 
                      y="26" 
                      width="168" 
                      height="168" 
                      fill="rgba(99, 102, 241, 0.05)" 
                    />
                    
                    {/* Front Cover Fill */}
                    <rect 
                      x="216" 
                      y="26" 
                      width="168" 
                      height="168" 
                      fill="rgba(99, 102, 241, 0.05)" 
                    />

                    {/* Spine Area */}
                    <rect 
                      x="184" 
                      y="26" 
                      width="32" 
                      height="168" 
                      fill="rgba(99, 102, 241, 0.15)" 
                      stroke="#818cf8" 
                      strokeWidth="1" 
                    />

                    {/* Barcode Placeholder */}
                    <rect 
                      x="30" 
                      y="140" 
                      width="40" 
                      height="30" 
                      fill="rgba(255, 255, 255, 0.15)" 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      strokeWidth="1" 
                    />
                    <line x1="35" y1="145" x2="35" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                    <line x1="40" y1="145" x2="40" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                    <line x1="45" y1="145" x2="45" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
                    <line x1="50" y1="145" x2="50" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                    <line x1="55" y1="145" x2="55" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
                    <line x1="60" y1="145" x2="60" y2="165" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                    <text x="34" y="177" fill="rgba(255, 255, 255, 0.3)" fontSize="5">Barcode</text>

                    {/* Labels */}
                    <text x="100" y="110" fill="#a5b4fc" fontSize="10" fontWeight="bold" textAnchor="middle">Back Cover</text>
                    <text x="300" y="110" fill="#a5b4fc" fontSize="10" fontWeight="bold" textAnchor="middle">Front Cover</text>
                    
                    {/* Spine Text / Alignment */}
                    <g transform="translate(200, 110) rotate(90)">
                      <text 
                        x="0" 
                        y="0" 
                        fill={isSpineTextEligible ? "#e0e7ff" : "rgba(239, 68, 68, 0.4)"} 
                        fontSize={isSpineTextEligible ? "6" : "5"} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {isSpineTextEligible ? "SPINE TEXT" : "TEXT SAFETY BLOCKED"}
                      </text>
                    </g>

                    {/* Dimensions Guides */}
                    {/* Spine Width Arrow */}
                    <line x1="184" y1="210" x2="216" y2="210" stroke="#818cf8" strokeWidth="1" />
                    <polygon points="184,210 188,207 188,213" fill="#818cf8" />
                    <polygon points="216,210 212,207 212,213" fill="#818cf8" />
                    <text x="200" y="222" fill="#818cf8" fontSize="7" fontWeight="bold" textAnchor="middle">
                      {dims.spineWidth.toFixed(3)}"
                    </text>

                    {/* Full Width Indicator */}
                    <line x1="10" y1="230" x2="390" y2="230" stroke="#a5b4fc" strokeWidth="1" />
                    <polygon points="10,230 15,227 15,233" fill="#a5b4fc" />
                    <polygon points="390,230 385,227 385,233" fill="#a5b4fc" />
                    <text x="200" y="239" fill="#a5b4fc" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Total Cover Width: {dims.fullWidth.toFixed(3)}"
                    </text>

                    {/* Height Indicator (Vertical Right Side) */}
                    <line x1="395" y1="20" x2="395" y2="200" stroke="#a5b4fc" strokeWidth="1" />
                    <polygon points="395,20 392,25 398,25" fill="#a5b4fc" />
                    <polygon points="395,200 392,195 398,195" fill="#a5b4fc" />
                    <text x="397" y="113" fill="#a5b4fc" fontSize="8" fontWeight="bold" transform="rotate(90 397 113)" textAnchor="middle">
                      Height: {dims.fullHeight.toFixed(3)}"
                    </text>
                  </svg>
                </div>

                {/* Guide Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full border-t border-slate-900/60 pt-4 mt-2 text-[10px] text-slate-450 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-500/10 border border-indigo-500 block rounded" />
                    <span>Trim Size area</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-500/20 border border-indigo-400 block rounded" />
                    <span>Spine area</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0 border-t border-dashed border-red-500 block" />
                    <span>Bleed border</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-700 block rounded" />
                    <span>Barcode zone</span>
                  </div>
                </div>

              </div>

              {/* Action Link to Cover Studio */}
              <div className="flex justify-between items-center p-4 bg-indigo-550/10 border border-indigo-500/20 rounded-2xl">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs text-white font-black block">Ready to design your cover?</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Use these measurements directly inside the Creator Studio to lay out your cover canvas.
                  </span>
                </div>
                <Link
                  href="/studio?tab=cover"
                  className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Open Cover Studio
                </Link>
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
              <h3 className="font-bold text-indigo-400">What is "Bleed" and why is it exactly 0.25"?</h3>
              <p className="text-slate-450 font-semibold leading-relaxed">
                Bleed is the extra print margin (0.125" on each outer edge) required by printers to ensure colors and artwork 
                extend fully to the edge after the page is trimmed. Since bleed is added to the left and right sides of the cover, 
                it increases the overall cover width by 0.25". Similarly, it increases the cover height by 0.25" (top and bottom).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">Why can't I put text on my spine?</h3>
              <p className="text-slate-450 font-semibold leading-relaxed">
                Books with fewer than 79 pages have extremely thin spines (under 0.17 inches). 
                Printers cannot guarantee the alignment of text on such thin areas without it spilling onto the front or back covers, 
                so Amazon KDP prohibits spine text for books under 79 pages.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What is the difference between Paper Types?</h3>
              <p className="text-slate-450 font-semibold leading-relaxed">
                White and Cream paper types have slightly different physical thicknesses (Cream is thicker at 0.0025" per page vs. White at 0.002252"). 
                Color printing uses another grade of white paper which is slightly thicker (0.002347"). Choosing the correct option ensures your spine 
                matches the real thickness perfectly.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
