"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  Download,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Eye,
  ShieldCheck,
  Zap,
  Grid,
  BookOpen,
  Info,
  Hash,
  ArrowRight,
  Printer
} from "lucide-react";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import { PRESETS, PresetItem, drawColoringPattern } from "@/lib/coloringBookPatterns";
import { checkPremiumStatus } from "@/app/actions";

// Matches drawWatermark's look in pdfExportService.ts (used by every other
// tool's PDF export) so free-tier output is consistently branded across the
// whole app, not just this one tool's own style.
function drawCanvasWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#8C8C8C";
  ctx.font = `bold ${Math.floor(w * 0.09)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.fillText("SAMPLE - KDPAGE", 0, 0);
  ctx.restore();
}

// Trim sizes
const TRIM_SIZES = [
  { id: "8.5x11", label: '8.5" × 11" (Standard)', w: 8.5, h: 11, pxW: 2550, pxH: 3300 },
  { id: "6x9", label: '6" × 9" (Trade Paperback)', w: 6, h: 9, pxW: 1800, pxH: 2700 },
  { id: "8x10", label: '8" × 10" (Squareish)', w: 8, h: 10, pxW: 2400, pxH: 3000 },
];

export default function ColoringBookClient() {
  // Config state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePreset, setActivePreset] = useState<PresetItem>(PRESETS[0]);
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [complexity, setComplexity] = useState<number>(12);
  const [isColorByNumber, setIsColorByNumber] = useState<boolean>(true);
  const [isMidnightMode, setIsMidnightMode] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<"ornamental" | "circle" | "minimal" | "none">("ornamental");
  const [seed, setSeed] = useState<number>(42);
  const [bookPagesCount, setBookPagesCount] = useState<number>(30);

  // Export States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    checkPremiumStatus()
      .then((res: any) => setIsPremium(!!res.isPremium))
      .catch(() => setIsPremium(false));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render procedure on Canvas
  const drawPattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawColoringPattern(ctx, canvas.width, canvas.height, {
      presetId: activePreset.id,
      complexity,
      lineWidth,
      isColorByNumber,
      isMidnightMode,
      frameStyle,
      seed,
    });
  }, [activePreset, complexity, frameStyle, isColorByNumber, isMidnightMode, lineWidth, seed]);

  useEffect(() => {
    drawPattern();
  }, [drawPattern]);

  // Download Single 300 DPI PNG Page
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res export canvas @ 300 DPI
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = trimSize.pxW;
    exportCanvas.height = trimSize.pxH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Draw high res copy
    ctx.drawImage(canvas, 0, 0, trimSize.pxW, trimSize.pxH);
    if (!isPremium) drawCanvasWatermark(ctx, trimSize.pxW, trimSize.pxH);

    const link = document.createElement("a");
    link.download = `KDPage_${activePreset.id}_300DPI.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  // Export Full 300 DPI KDP PDF Book Interior
  const handleExportPdfBook = async () => {
    setIsGeneratingPdf(true);
    setExportProgress(10);

    try {
      const [{ jsPDF }, { drawWatermark }] = await Promise.all([
        import("jspdf"),
        import("@/app/utils/pdfExportService"),
      ]);
      const doc = new jsPDF({
        unit: "in",
        format: [trimSize.w, trimSize.h],
        orientation: "portrait",
      });

      const totalP = Math.max(1, Math.min(100, bookPagesCount));

      // Each page gets its own offscreen canvas re-rendered with a distinct
      // seed -- reusing the single on-screen preview canvas here previously
      // meant every page in the export was an identical copy of whatever was
      // currently shown, despite the book claiming "endless variation".
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = trimSize.pxW;
      pageCanvas.height = trimSize.pxH;
      const pageCtx = pageCanvas.getContext("2d");

      for (let p = 0; p < totalP; p++) {
        if (p > 0) doc.addPage([trimSize.w, trimSize.h]);

        if (pageCtx) {
          drawColoringPattern(pageCtx, pageCanvas.width, pageCanvas.height, {
            presetId: activePreset.id,
            complexity,
            lineWidth,
            isColorByNumber,
            isMidnightMode,
            frameStyle,
            seed: seed + p * 137,
          });
          const imgData = pageCanvas.toDataURL("image/png", 1.0);
          doc.addImage(imgData, "PNG", 0, 0, trimSize.w, trimSize.h);
        }

        // Page Number
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${p + 1}`, trimSize.w / 2, trimSize.h - 0.3, { align: "center" });

        if (!isPremium) drawWatermark(doc, trimSize.w, trimSize.h);

        setExportProgress(Math.floor(((p + 1) / totalP) * 100));
      }

      doc.save(`KDPage_Coloring_Book_${trimSize.id}_${totalP}Pages.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
      setExportProgress(0);
    }
  };

  const filteredPresets = PRESETS.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* 🚀 Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo_transparent.png"
                alt="KDPage Logo"
                className="w-9 h-9 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform"
              />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                Coloring Book Studio
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  300 DPI Vector
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
                Non-Living Objects & Color-by-Number Interior Generator for KDP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tools"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition"
            >
              All Tools
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* 🛡️ Non-Living Guarantee Alert Banner */}
        <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  Tons of Templates for Your Art &amp; Coloring Books
                </h2>
                <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Verified Safe
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Strictly non-living subjects only — Mandalas, Stained Glass, Landscapes, Citrus Slices, Architecture &amp; Cozy Still Life. Zero humans, animals, or living beings.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Thousands of unique vector combinations
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ⚙️ Left Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Category Filter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-indigo-500" /> Category Filter
                </label>
                <span className="text-xs font-bold text-slate-500">{filteredPresets.length} Presets</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["All", "Botanical & Floral", "Mandalas & Sacred Geometry", "Stained Glass & Architecture", "Landscapes & Celestial", "Food, Drinks & Kitchen", "Cozy Objects & Still Life", "Abstract & Art Deco", "Single Object Clip-Art", "European Flags", "North American Flags", "Concept Cars"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Select Design Template
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setComplexity(preset.defaultComplexity);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      activePreset.id === preset.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{preset.description}</div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 ml-2">
                      {preset.category.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" /> Customization Controls
              </h3>

              {/* Color by Number Toggle */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Color-by-Number Overlay
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Adds numbered regions (1-10) + Top Color Palette Key
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isColorByNumber}
                  onChange={(e) => setIsColorByNumber(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Line Thickness */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Line Thickness</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Detail Complexity */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Pattern Complexity</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{complexity} density</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  value={complexity}
                  onChange={(e) => setComplexity(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Frame Style & Page Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Page Border Frame
                  </label>
                  <select
                    value={frameStyle}
                    onChange={(e) => setFrameStyle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                  >
                    <option value="ornamental">Ornamental Frame</option>
                    <option value="circle">Circle Vignette</option>
                    <option value="minimal">Minimal Line Box</option>
                    <option value="none">Full Bleed (No Border)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Page Style Mode
                  </label>
                  <button
                    onClick={() => setIsMidnightMode(!isMidnightMode)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isMidnightMode
                        ? "bg-slate-950 text-white border-slate-800"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {isMidnightMode ? "🌙 Midnight (Dark)" : "☀️ Standard (White)"}
                  </button>
                </div>
              </div>

              {/* Trim Size */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  KDP Book Trim Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRIM_SIZES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTrimSize(t)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        trimSize.id === t.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regenerate Seed */}
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Endless Variation
              </button>

            </div>

            {/* Export Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              {isPremium === false && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-semibold leading-relaxed">
                  Free accounts export with a light "SAMPLE - KDPAGE" watermark.{" "}
                  <Link href="/pricing" target="_blank" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200">
                    Upgrade to remove it →
                  </Link>
                </div>
              )}
              <button
                onClick={handleDownloadPng}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download 300 DPI PNG Page
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>KDP Interior PDF Pages</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bookPagesCount}
                    onChange={(e) => setBookPagesCount(Number(e.target.value))}
                    className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleExportPdfBook}
                  disabled={isGeneratingPdf}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {isGeneratingPdf ? `Generating PDF (${exportProgress}%)...` : `Export Full ${bookPagesCount}-Page KDP Book PDF`}
                </button>
              </div>

              <SaveToNotebookButton
                title={`Coloring Page: ${activePreset.name}`}
                content={`Coloring page preset "${activePreset.name}" with line thickness ${lineWidth}px, complexity ${complexity}, color-by-number ${isColorByNumber ? "enabled" : "disabled"}`}
                category="coloring-book"
                data={{ activePreset, lineWidth, complexity, isColorByNumber, isMidnightMode, frameStyle, seed, trimSize }}
                className="w-full justify-center"
              />

              <CoverStudioCTA trimSize={`${trimSize.w}x${trimSize.h}`} />
            </div>

          </div>

          {/* 🖼️ Right Canvas Live Preview Area */}
          <div className="lg:col-span-7 bg-slate-200 dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[650px]">
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>300 DPI Live Vector Canvas</span>
            </div>

            {/* Canvas Container */}
            <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden relative aspect-[8.5/11] w-full max-w-[540px]">
              <canvas
                ref={canvasRef}
                width={850}
                height={1100}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Preset: <strong className="text-slate-900 dark:text-slate-100">{activePreset.name}</strong> ({activePreset.category})
              </span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
