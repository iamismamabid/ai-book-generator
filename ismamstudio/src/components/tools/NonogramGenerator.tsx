"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  BookOpen,
  Pencil,
  Eraser,
  RotateCcw,
  Palette,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lock,
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getClientSafePremiumStatus } from "@/lib/clientAuth";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import {
  NonogramPuzzle,
  PRESET_NONOGRAMS,
  PredefinedNonogramItem,
  createPuzzleFromPreset,
  generateProceduralNonogram,
  generateNonogramBook,
  extractClues,
} from "@/lib/nonogramEngine";
import { exportNonogramBookPdf } from "@/lib/nonogramPdfExporter";

export default function NonogramGenerator() {
  const router = useRouter();

  // Premium status
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getClientSafePremiumStatus();
        setPremiumStatus(res as any);
      } catch (e) {
        console.error("Auth check error:", e);
      }
    }
    checkAuth();
  }, []);

  // Studio Mode: 'presets' | 'draw' | 'procedural'
  const [studioMode, setStudioMode] = useState<"presets" | "draw" | "procedural">("presets");
  const [gridSize, setGridSize] = useState<5 | 10 | 15>(10);
  const [presetCategory, setPresetCategory] = useState<string>("All");

  // Current Active Puzzle & Canvas
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [puzzleList, setPuzzleList] = useState<NonogramPuzzle[]>([]);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [drawTool, setDrawTool] = useState<"pencil" | "eraser">("pencil");
  const [customDrawing, setCustomDrawing] = useState<number[][]>(() =>
    Array(10).fill(0).map(() => Array(10).fill(0))
  );

  // Book Options
  const [trimSize, setTrimSize] = useState<KdpTrimSize>(KDP_TRIM_SIZES[0]);
  const [bookPageCount, setBookPageCount] = useState<number>(20);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [bookTitle, setBookTitle] = useState<string>("Nonogram Puzzle Book");
  const [authorName, setAuthorName] = useState<string>("");
  const [facingPages, setFacingPages] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Initialize with handcrafted presets for current size
  useEffect(() => {
    const initialBook = generateNonogramBook(bookPageCount, gridSize, presetCategory);
    setPuzzleList(initialBook);
    setActivePuzzleIndex(0);
    // Reset custom draw grid
    setCustomDrawing(Array(gridSize).fill(0).map(() => Array(gridSize).fill(0)));
  }, [gridSize, presetCategory]);

  const currentPuzzle = useMemo(() => {
    if (studioMode === "draw") {
      const clues = extractClues(customDrawing);
      return {
        id: "custom-drawing",
        title: "My Custom Nonogram",
        difficulty: gridSize === 5 ? "easy" : gridSize === 10 ? "medium" : "hard",
        width: gridSize,
        height: gridSize,
        grid: customDrawing,
        clues,
        category: "Custom",
      } as NonogramPuzzle;
    }
    return puzzleList[activePuzzleIndex] || puzzleList[0] || generateProceduralNonogram(gridSize, 1);
  }, [studioMode, puzzleList, activePuzzleIndex, customDrawing, gridSize]);

  // Handle Preset Click
  const handleSelectPreset = (preset: PredefinedNonogramItem) => {
    const puzzle = createPuzzleFromPreset(preset);
    setPuzzleList([puzzle, ...puzzleList.filter((p) => p.id !== puzzle.id)]);
    setActivePuzzleIndex(0);
    setShowSolution(false);
  };

  // Handle Cell Click / Drawing in Draw Mode
  const handleCellClick = (r: number, c: number) => {
    if (studioMode !== "draw") return;
    setCustomDrawing((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = drawTool === "pencil" ? 1 : 0;
      return next;
    });
  };

  // Generate Fresh Random Puzzle
  const handleGenerateRandom = () => {
    const seed = Math.floor(Math.random() * 90000) + 1000;
    const newPuzzle = generateProceduralNonogram(gridSize, seed, `Logic Pattern #${puzzleList.length + 1}`);
    setPuzzleList((prev) => [newPuzzle, ...prev]);
    setActivePuzzleIndex(0);
    setShowSolution(false);
  };

  // Export Full KDP PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress(5);
    try {
      // Ensure we have the target count of puzzles
      let exportPuzzles = [...puzzleList];
      if (exportPuzzles.length < bookPageCount) {
        exportPuzzles = generateNonogramBook(bookPageCount, gridSize, presetCategory);
        setPuzzleList(exportPuzzles);
      } else if (exportPuzzles.length > bookPageCount) {
        exportPuzzles = exportPuzzles.slice(0, bookPageCount);
      }

      const doc = await exportNonogramBookPdf(
        exportPuzzles,
        {
          trimSize,
          includeSolutions,
          bookTitle,
          authorName,
          solutionsPerPage: 4,
          showPageNumbers: true,
          facingPages,
        },
        (progress) => setExportProgress(progress)
      );

      doc.save(`nonogram-${gridSize}x${gridSize}-${bookPageCount}pages.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Export Single Page PNG
  const handleDownloadSinglePng = () => {
    const canvas = document.getElementById("nonogram-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${currentPuzzle.title.toLowerCase().replace(/\s+/g, "-")}-nonogram.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Render Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPuzzle) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = currentPuzzle.width;
    const height = currentPuzzle.height;

    // Calculate clue counts
    const maxRowClues = Math.max(...currentPuzzle.clues.rows.map((r) => r.length), 1);
    const maxColClues = Math.max(...currentPuzzle.clues.cols.map((c) => c.length), 1);

    const cellSize = width <= 5 ? 44 : width <= 10 ? 32 : 24;
    const leftClueWidth = maxRowClues * (cellSize * 0.75);
    const topClueHeight = maxColClues * (cellSize * 0.75);

    const totalWidth = leftClueWidth + width * cellSize + 20;
    const totalHeight = topClueHeight + height * cellSize + 20;

    canvas.width = totalWidth * 2; // retina scaling
    canvas.height = totalHeight * 2;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.scale(2, 2);
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    const gridX = 10 + leftClueWidth;
    const gridY = 10 + topClueHeight;

    // Draw Column Clues (Top)
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold ${Math.max(9, cellSize * 0.42)}px -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let c = 0; c < width; c++) {
      const clues = currentPuzzle.clues.cols[c] || [0];
      const cellCenterX = gridX + c * cellSize + cellSize / 2;
      const clueStep = topClueHeight / maxColClues;

      for (let i = 0; i < clues.length; i++) {
        const val = clues[clues.length - 1 - i];
        const clueY = gridY - 8 - i * clueStep;
        ctx.fillText(String(val), cellCenterX, clueY);
      }
    }

    // Draw Row Clues (Left)
    ctx.textAlign = "right";
    for (let r = 0; r < height; r++) {
      const clues = currentPuzzle.clues.rows[r] || [0];
      const cellCenterY = gridY + r * cellSize + cellSize / 2;
      const clueStep = leftClueWidth / maxRowClues;

      for (let i = 0; i < clues.length; i++) {
        const val = clues[clues.length - 1 - i];
        const clueX = gridX - 8 - i * clueStep;
        ctx.fillText(String(val), clueX, cellCenterY);
      }
    }

    // Draw Grid Cells & Solution
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const cellX = gridX + c * cellSize;
        const cellY = gridY + r * cellSize;
        const isFilled = currentPuzzle.grid[r][c] === 1;

        if (showSolution || studioMode === "draw") {
          if (isFilled) {
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }
        }
      }
    }

    // Draw Grid Lines (0.5px for minor, 2px for 5x5 major blocks)
    for (let r = 0; r <= height; r++) {
      const y = gridY + r * cellSize;
      const isMajor = r % 5 === 0;
      ctx.strokeStyle = isMajor ? "#0f172a" : "#cbd5e1";
      ctx.lineWidth = isMajor ? 2 : 0.8;
      ctx.beginPath();
      ctx.moveTo(gridX, y);
      ctx.lineTo(gridX + width * cellSize, y);
      ctx.stroke();
    }

    for (let c = 0; c <= width; c++) {
      const x = gridX + c * cellSize;
      const isMajor = c % 5 === 0;
      ctx.strokeStyle = isMajor ? "#0f172a" : "#cbd5e1";
      ctx.lineWidth = isMajor ? 2 : 0.8;
      ctx.beginPath();
      ctx.moveTo(x, gridY);
      ctx.lineTo(x, gridY + height * cellSize);
      ctx.stroke();
    }
  }, [currentPuzzle, showSolution, studioMode]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0c111d] px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Tools
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
            <h1 className="text-base font-bold text-white tracking-wide">
              Nonogram (Picross) Studio
            </h1>
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              KDP PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveToNotebookButton
            category="nonogram"
            title={currentPuzzle.title}
            data={{
              puzzle: currentPuzzle,
              gridSize,
              bookPageCount,
            }}
          />
          <CoverStudioCTA source="nonogram-studio" />
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating KDP Book ({exportProgress}%)
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export KDP Interior PDF
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full lg:w-96 border-r border-slate-800 bg-[#0c111d] flex flex-col overflow-y-auto p-5 gap-6">
          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Creation Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setStudioMode("presets")}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  studioMode === "presets"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> Library
              </button>
              <button
                onClick={() => setStudioMode("draw")}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  studioMode === "draw"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" /> Draw Art
              </button>
              <button
                onClick={() => {
                  setStudioMode("procedural");
                  handleGenerateRandom();
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  studioMode === "procedural"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Random
              </button>
            </div>
          </div>

          {/* Grid Size */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Grid Dimension
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 5, label: "5x5", desc: "Easy / Kids" },
                { size: 10, label: "10x10", desc: "Classic" },
                { size: 15, label: "15x15", desc: "Challenging" },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setGridSize(item.size as any)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    gridSize === item.size
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode 1: Pixel Art Presets Library */}
          {studioMode === "presets" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Handcrafted Pixel Art
                </label>
                <select
                  value={presetCategory}
                  onChange={(e) => setPresetCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                >
                  <option value="All">All Categories</option>
                  <option value="Animals">Animals</option>
                  <option value="Nature & Food">Nature & Food</option>
                  <option value="Objects & Fantasy">Objects & Fantasy</option>
                  <option value="Kids & Easy">Kids & Easy</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {PRESET_NONOGRAMS.filter(
                  (p) =>
                    p.width === gridSize &&
                    (presetCategory === "All" || p.category === presetCategory)
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      currentPuzzle.id === preset.id
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{preset.name}</div>
                      <div className="text-[10px] text-slate-400">{preset.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Interactive Draw Tools */}
          {studioMode === "draw" && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Pixel Drawing Tools
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDrawTool("pencil")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    drawTool === "pencil"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Fill (Pencil)
                </button>
                <button
                  onClick={() => setDrawTool("eraser")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    drawTool === "eraser"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" /> Erase
                </button>
              </div>
              <button
                onClick={() =>
                  setCustomDrawing(
                    Array(gridSize).fill(0).map(() => Array(gridSize).fill(0))
                  )
                }
                className="w-full py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear Canvas
              </button>
            </div>
          )}

          {/* Mode 3: Procedural Generator */}
          {studioMode === "procedural" && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Procedural Generator
              </label>
              <p className="text-xs text-slate-400">
                Algorithmically generates perfectly symmetrical, solvable logic patterns.
              </p>
              <button
                onClick={handleGenerateRandom}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <Sparkles className="w-4 h-4" /> Generate New Mystery Pattern
              </button>
            </div>
          )}

          {/* KDP Book Interior Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> KDP Book Settings
            </label>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Trim Size</span>
              <select
                value={trimSize.label}
                onChange={(e) => {
                  const found = KDP_TRIM_SIZES.find((t) => t.label === e.target.value);
                  if (found) setTrimSize(found);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                {KDP_TRIM_SIZES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label} ({t.width} x {t.height} in)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Puzzle Count
                </span>
                <select
                  value={bookPageCount}
                  onChange={(e) => setBookPageCount(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <option value={10}>10 Puzzles</option>
                  <option value={20}>20 Puzzles</option>
                  <option value={50}>50 Puzzles (Pro)</option>
                  <option value={100}>100 Puzzles (Pro)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Solutions
                </span>
                <label className="flex items-center gap-2 h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSolutions}
                    onChange={(e) => setIncludeSolutions(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Keys</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div>
                <div className="text-xs text-slate-300 font-medium">Right & Left Page Layout</div>
                <div className="text-[10px] text-slate-500">Alternating KDP gutter margins for spine binding (Facing Pages)</div>
              </div>
              <input
                type="checkbox"
                checked={facingPages}
                onChange={(e) => setFacingPages(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Book Title (For Cover/Interior)
              </span>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. Japanese Nonogram Puzzle Book"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>
        </aside>

        {/* Center Interactive Preview Area */}
        <main className="flex-1 flex flex-col bg-[#080b12] relative overflow-hidden">
          {/* Canvas Sub-Header Toolbar */}
          <div className="h-14 border-b border-slate-800 bg-[#090d16]/80 backdrop-blur px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{currentPuzzle.title}</span>
              <span className="text-xs text-slate-400">
                ({currentPuzzle.width}x{currentPuzzle.height})
              </span>
              <button
                onClick={() => setShowSolution((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  showSolution
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {showSolution ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Hide Solution
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Reveal Solution
                  </>
                )}
              </button>
            </div>

            {/* Pagination for generated book */}
            {studioMode !== "draw" && puzzleList.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePuzzleIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activePuzzleIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {activePuzzleIndex + 1} / {puzzleList.length}
                </span>
                <button
                  onClick={() =>
                    setActivePuzzleIndex((prev) => Math.min(puzzleList.length - 1, prev + 1))
                  }
                  disabled={activePuzzleIndex === puzzleList.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadSinglePng}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" /> PNG
            </button>
          </div>

          {/* Interactive Canvas Stage */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 relative">
              <canvas
                id="nonogram-canvas"
                ref={canvasRef}
                className="cursor-pointer block"
                onClick={(e) => {
                  if (studioMode !== "draw") return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const width = currentPuzzle.width;
                  const height = currentPuzzle.height;
                  const maxRowClues = Math.max(...currentPuzzle.clues.rows.map((r) => r.length), 1);
                  const maxColClues = Math.max(...currentPuzzle.clues.cols.map((c) => c.length), 1);

                  const cellSize = width <= 5 ? 44 : width <= 10 ? 32 : 24;
                  const leftClueWidth = maxRowClues * (cellSize * 0.75);
                  const topClueHeight = maxColClues * (cellSize * 0.75);

                  const gridX = 10 + leftClueWidth;
                  const gridY = 10 + topClueHeight;

                  if (
                    x >= gridX &&
                    x <= gridX + width * cellSize &&
                    y >= gridY &&
                    y <= gridY + height * cellSize
                  ) {
                    const col = Math.floor((x - gridX) / cellSize);
                    const row = Math.floor((y - gridY) / cellSize);
                    handleCellClick(row, col);
                  }
                }}
              />

              {studioMode === "draw" && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-400 font-medium">
                  Click on any cell to draw your pixel art. Clue numbers update dynamically!
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
