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
  Printer,
  Paintbrush,
  Eraser,
  PaintBucket,
  Undo2,
  Redo2,
  Trash2
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

const QUICK_PALETTE = [
  "#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E",
  "#14B8A6", "#3B82F6", "#6366F1", "#A855F7", "#EC4899",
  "#78350F", "#000000",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// Small static preview of a preset's pattern, rendered once and never
// re-rendered on parent state changes (complexity/lineWidth/etc. only affect
// the live canvas, not these thumbnails) so browsing templates stays fast.
function PresetThumbnail({ preset }: { preset: PresetItem }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawColoringPattern(ctx, canvas.width, canvas.height, {
      presetId: preset.id,
      complexity: Math.min(preset.defaultComplexity, 14),
      lineWidth: 2,
      isColorByNumber: false,
      isMidnightMode: false,
      frameStyle: "minimal",
      seed: 7,
    });
  }, [preset.id]);

  return (
    <canvas
      ref={ref}
      width={130}
      height={168}
      className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
    />
  );
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

  // Interactive "Preview Coloring" canvas state -- a fun/demo layer for
  // trying out colors in-browser. Purely a preview: it never touches the
  // blank line-art PNG/PDF export used for the actual KDP interior.
  const [isColoringMode, setIsColoringMode] = useState(false);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser" | "fill">("brush");
  const [brushColor, setBrushColor] = useState<string>(QUICK_PALETTE[0]);
  const [brushSize, setBrushSize] = useState<number>(18);
  const [history, setHistory] = useState<{ stack: string[]; index: number }>({ stack: [], index: -1 });

  useEffect(() => {
    checkPremiumStatus()
      .then((res: any) => setIsPremium(!!res.isPremium))
      .catch(() => setIsPremium(false));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

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
      transparentBg: isColoringMode,
    });
  }, [activePreset, complexity, frameStyle, isColorByNumber, isMidnightMode, lineWidth, seed, isColoringMode]);

  useEffect(() => {
    drawPattern();
    // The line art just changed shape, so any painted colors underneath no
    // longer line up -- reset the paint layer and its undo/redo history.
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;
    const cctx = colorCanvas.getContext("2d");
    if (cctx) cctx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    setHistory({ stack: [colorCanvas.toDataURL()], index: 0 });
  }, [drawPattern]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const pushHistory = useCallback(() => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    setHistory((prev) => {
      const trimmed = prev.stack.slice(0, prev.index + 1);
      const next = [...trimmed, snapshot].slice(-25);
      return { stack: next, index: next.length - 1 };
    });
  }, []);

  const loadSnapshot = (dataUrl: string) => {
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      loadSnapshot(prev.stack[newIndex]);
      return { ...prev, index: newIndex };
    });
  };

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.index >= prev.stack.length - 1) return prev;
      const newIndex = prev.index + 1;
      loadSnapshot(prev.stack[newIndex]);
      return { ...prev, index: newIndex };
    });
  };

  const handleClearColors = () => {
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistory();
  };

  // Flood-fills the clicked region of the color layer, using the line-art
  // layer's ink as the wall mask so fills stop at the drawn outlines.
  const floodFill = (startX: number, startY: number) => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;
    const w = colorCanvas.width;
    const h = colorCanvas.height;
    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;

    const lineCtx = lineCanvas.getContext("2d");
    const colorCtx = colorCanvas.getContext("2d");
    if (!lineCtx || !colorCtx) return;

    const lineData = lineCtx.getImageData(0, 0, w, h).data;
    const isWall = (idx: number) => lineData[idx + 3] > 40;

    const startIdx = (sy * w + sx) * 4;
    if (isWall(startIdx)) return; // clicked directly on a drawn line

    const colorImage = colorCtx.getImageData(0, 0, w, h);
    const data = colorImage.data;
    const fillColor = hexToRgb(brushColor);
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];
    if (targetR === fillColor.r && targetG === fillColor.g && targetB === fillColor.b && targetA === 255) return;
    const matchesTarget = (idx: number) =>
      data[idx] === targetR && data[idx + 1] === targetG && data[idx + 2] === targetB && data[idx + 3] === targetA;

    const visited = new Uint8Array(w * h);
    const stack: number[] = [sy * w + sx];
    visited[sy * w + sx] = 1;

    while (stack.length) {
      const p = stack.pop()!;
      const idx4 = p * 4;
      if (isWall(idx4) || !matchesTarget(idx4)) continue;
      data[idx4] = fillColor.r;
      data[idx4 + 1] = fillColor.g;
      data[idx4 + 2] = fillColor.b;
      data[idx4 + 3] = 255;

      const px = p % w;
      const py = (p / w) | 0;
      if (px > 0 && !visited[p - 1]) { visited[p - 1] = 1; stack.push(p - 1); }
      if (px < w - 1 && !visited[p + 1]) { visited[p + 1] = 1; stack.push(p + 1); }
      if (py > 0 && !visited[p - w]) { visited[p - w] = 1; stack.push(p - w); }
      if (py < h - 1 && !visited[p + w]) { visited[p + w] = 1; stack.push(p + w); }
    }

    colorCtx.putImageData(colorImage, 0, 0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isColoringMode) return;
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);

    if (activeTool === "fill") {
      floodFill(pt.x, pt.y);
      pushHistory();
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = pt;
    ctx.globalCompositeOperation = activeTool === "eraser" ? "destination-out" : "source-over";
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isColoringMode || !isDrawingRef.current) return;
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pt = getCanvasPoint(e);
    const last = lastPointRef.current ?? pt;
    ctx.globalCompositeOperation = activeTool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
  };

  const handlePointerUp = () => {
    if (!isColoringMode || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    pushHistory();
  };

  const handleDownloadColoredPng = () => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = trimSize.pxW;
    exportCanvas.height = trimSize.pxH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = isMidnightMode ? "#0F172A" : "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(colorCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(lineCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    if (!isPremium) drawCanvasWatermark(ctx, exportCanvas.width, exportCanvas.height);

    const link = document.createElement("a");
    link.download = `KDPage_${activePreset.id}_colored_preview.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setComplexity(preset.defaultComplexity);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      activePreset.id === preset.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <PresetThumbnail preset={preset} />
                    <div className="text-[10.5px] font-black mt-1.5 leading-tight line-clamp-2">{preset.name}</div>
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
          <div className="lg:col-span-7 bg-slate-200 dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center min-h-[650px]">

            <div className="w-full max-w-[540px] flex items-center justify-between gap-2 mb-4">
              <button
                onClick={() => setIsColoringMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition cursor-pointer ${
                  isColoringMode
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                {isColoringMode ? "Exit Coloring Preview" : "Try Coloring This Page"}
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>300 DPI Live Vector Canvas</span>
              </div>
            </div>

            {isColoringMode && (
              <div className="w-full max-w-[540px] mb-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTool("brush")}
                    className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "brush" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    title="Brush"
                  >
                    <Paintbrush className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("eraser")}
                    className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "eraser" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    title="Eraser"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("fill")}
                    className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "fill" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    title="Fill Bucket"
                  >
                    <PaintBucket className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {QUICK_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      style={{ background: c }}
                      className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${brushColor === c ? "border-indigo-600 scale-110" : "border-white dark:border-slate-700"}`}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Custom color"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Size</span>
                  <input
                    type="range"
                    min="4"
                    max="48"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-16 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUndo}
                    disabled={history.index <= 0}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={history.index >= history.stack.length - 1}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearColors}
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
                    title="Clear colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleDownloadColoredPng}
                  className="ml-auto inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Colored PNG
                </button>
              </div>
            )}

            {/* Canvas Container */}
            <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden relative aspect-[8.5/11] w-full max-w-[540px]">
              <canvas
                ref={colorCanvasRef}
                width={850}
                height={1100}
                className="absolute inset-0 w-full h-full object-contain touch-none"
                style={{ cursor: isColoringMode ? (activeTool === "fill" ? "crosshair" : "pointer") : "default" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              <canvas
                ref={canvasRef}
                width={850}
                height={1100}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            </div>

            {isColoringMode && (
              <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400 max-w-[540px]">
                🎨 This is a fun in-browser preview -- it doesn&apos;t change the blank line-art PDF/PNG your book actually exports. Changing any setting on the left resets your coloring.
              </p>
            )}

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
