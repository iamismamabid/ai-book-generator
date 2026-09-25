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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Calculator,
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getClientSafePremiumStatus } from "@/lib/clientAuth";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import {
  CalcudokuPuzzle,
  generateCalcudoku,
  generateCalcudokuBook,
} from "@/lib/calcudokuEngine";
import { exportCalcudokuBookPdf } from "@/lib/calcudokuPdfExporter";

export default function CalcudokuGenerator() {
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

  // Settings
  const [gridSize, setGridSize] = useState<4 | 5 | 6 | 8>(6);
  const [opsAllowed, setOpsAllowed] = useState<"all" | "add_sub" | "add_only" | "mul_div">("all");
  const [puzzlesPerPage, setPuzzlesPerPage] = useState<1 | 2 | 4>(1);

  // Book Options
  const [trimSize, setTrimSize] = useState<KdpTrimSize>(KDP_TRIM_SIZES[0]);
  const [bookPageCount, setBookPageCount] = useState<number>(20);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [bookTitle, setBookTitle] = useState<string>("Calcudoku Math Puzzle Book");
  const [authorName, setAuthorName] = useState<string>("");

  // Puzzles list
  const [puzzleList, setPuzzleList] = useState<CalcudokuPuzzle[]>([]);
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Interactive Play Grid (User's entered numbers)
  const [userEntries, setUserEntries] = useState<Record<string, number>>({});
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Initialize puzzles
  useEffect(() => {
    const list = generateCalcudokuBook(bookPageCount, gridSize, opsAllowed);
    setPuzzleList(list);
    setActivePuzzleIndex(0);
    setUserEntries({});
    setSelectedCell(null);
  }, [gridSize, opsAllowed]);

  const currentPuzzle = useMemo(() => {
    return puzzleList[activePuzzleIndex] || generateCalcudoku(gridSize, 101, opsAllowed);
  }, [puzzleList, activePuzzleIndex, gridSize, opsAllowed]);

  // Generate single fresh puzzle
  const handleGenerateFresh = () => {
    const seed = Math.floor(Math.random() * 90000) + 1000;
    const newPuzzle = generateCalcudoku(
      gridSize,
      seed,
      opsAllowed,
      `Calcudoku #${puzzleList.length + 1}`
    );
    setPuzzleList((prev) => [newPuzzle, ...prev]);
    setActivePuzzleIndex(0);
    setUserEntries({});
    setShowSolution(false);
  };

  // Keyboard navigation & number entry for solving on canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= gridSize) {
        setUserEntries((prev) => ({ ...prev, [`${r},${c}`]: num }));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        setUserEntries((prev) => {
          const next = { ...prev };
          delete next[`${r},${c}`];
          return next;
        });
      } else if (e.key === "ArrowUp") {
        setSelectedCell([Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown") {
        setSelectedCell([Math.min(gridSize - 1, r + 1), c]);
      } else if (e.key === "ArrowLeft") {
        setSelectedCell([r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight") {
        setSelectedCell([r, Math.min(gridSize - 1, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, gridSize]);

  // Export Full KDP PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      let exportPuzzles = [...puzzleList];
      if (exportPuzzles.length < bookPageCount) {
        exportPuzzles = generateCalcudokuBook(bookPageCount, gridSize, opsAllowed);
        setPuzzleList(exportPuzzles);
      } else if (exportPuzzles.length > bookPageCount) {
        exportPuzzles = exportPuzzles.slice(0, bookPageCount);
      }

      const doc = await exportCalcudokuBookPdf(
        exportPuzzles,
        {
          trimSize,
          includeSolutions,
          bookTitle,
          authorName,
          puzzlesPerPage,
          showPageNumbers: true,
        },
        (progress) => setExportProgress(progress)
      );

      doc.save(`calcudoku-${gridSize}x${gridSize}-${bookPageCount}puzzles.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Download Single PNG
  const handleDownloadSinglePng = () => {
    const canvas = document.getElementById("calcudoku-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${currentPuzzle.title.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Canvas Drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPuzzle) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = currentPuzzle.size;
    const cellSize = size <= 4 ? 80 : size <= 5 ? 70 : size <= 6 ? 60 : 45;
    const totalSize = size * cellSize;
    const padding = 20;

    canvas.width = (totalSize + padding * 2) * 2;
    canvas.height = (totalSize + padding * 2) * 2;
    canvas.style.width = `${totalSize + padding * 2}px`;
    canvas.style.height = `${totalSize + padding * 2}px`;

    ctx.scale(2, 2);
    ctx.clearRect(0, 0, totalSize + padding * 2, totalSize + padding * 2);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalSize + padding * 2, totalSize + padding * 2);

    const startX = padding;
    const startY = padding;

    // Map each cell to cage
    const cellCageMap = new Map<string, number>();
    currentPuzzle.cages.forEach((cage) => {
      cage.cells.forEach(([r, c]) => {
        cellCageMap.set(`${r},${c}`, cage.id);
      });
    });

    // Draw Selected Cell Highlight
    if (selectedCell) {
      const [sr, sc] = selectedCell;
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
      ctx.fillRect(startX + sc * cellSize, startY + sr * cellSize, cellSize, cellSize);
    }

    // Draw Numbers (Solution or User Entries)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${Math.max(14, cellSize * 0.45)}px -apple-system, sans-serif`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellSize + cellSize / 2;
        const cy = startY + r * cellSize + cellSize / 2 + (cellSize * 0.12);

        if (showSolution) {
          ctx.fillStyle = "#1e293b";
          ctx.fillText(String(currentPuzzle.grid[r][c]), cx, cy);
        } else if (userEntries[`${r},${c}`]) {
          const val = userEntries[`${r},${c}`];
          const isCorrect = val === currentPuzzle.grid[r][c];
          ctx.fillStyle = isCorrect ? "#4f46e5" : "#e11d48";
          ctx.fillText(String(val), cx, cy);
        }
      }
    }

    // Draw Inner Lines (Thin dashed/dotted for inside cage, solid thick for cage borders)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const currentCage = cellCageMap.get(`${r},${c}`);
        const cx = startX + c * cellSize;
        const cy = startY + r * cellSize;

        // Bottom border
        if (r < size - 1) {
          const bottomCage = cellCageMap.get(`${r + 1},${c}`);
          const isCageBoundary = currentCage !== bottomCage;
          ctx.strokeStyle = isCageBoundary ? "#0f172a" : "#cbd5e1";
          ctx.lineWidth = isCageBoundary ? 3 : 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy + cellSize);
          ctx.lineTo(cx + cellSize, cy + cellSize);
          ctx.stroke();
        }

        // Right border
        if (c < size - 1) {
          const rightCage = cellCageMap.get(`${r},${c + 1}`);
          const isCageBoundary = currentCage !== rightCage;
          ctx.strokeStyle = isCageBoundary ? "#0f172a" : "#cbd5e1";
          ctx.lineWidth = isCageBoundary ? 3 : 0.8;
          ctx.beginPath();
          ctx.moveTo(cx + cellSize, cy);
          ctx.lineTo(cx + cellSize, cy + cellSize);
          ctx.stroke();
        }
      }
    }

    // Outer Thick Grid Border
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(startX, startY, totalSize, totalSize);

    // Draw Cage Clues (e.g. "12×", "7+")
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `bold ${Math.max(10, cellSize * 0.22)}px -apple-system, sans-serif`;
    ctx.fillStyle = "#0f172a";

    currentPuzzle.cages.forEach((cage) => {
      const firstCell = cage.cells[0];
      if (!firstCell) return;
      const [r, c] = firstCell;
      const clueX = startX + c * cellSize + 4;
      const clueY = startY + r * cellSize + 4;
      ctx.fillText(`${cage.target}${cage.op}`, clueX, clueY);
    });
  }, [currentPuzzle, showSolution, userEntries, selectedCell]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
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
              Calcudoku (KenKen) Studio
            </h1>
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              MATH LOGIC PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveToNotebookButton
            category="calcudoku"
            title={currentPuzzle.title}
            data={{
              puzzle: currentPuzzle,
              gridSize,
              opsAllowed,
              bookPageCount,
            }}
          />
          <CoverStudioCTA source="calcudoku-studio" />
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Exporting KDP Book ({exportProgress}%)
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
        {/* Left Controls */}
        <aside className="w-full lg:w-96 border-r border-slate-800 bg-[#0c111d] flex flex-col overflow-y-auto p-5 gap-6">
          {/* Grid Size */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Grid Dimension
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { size: 4, label: "4x4", desc: "Kids" },
                { size: 5, label: "5x5", desc: "Easy" },
                { size: 6, label: "6x6", desc: "Standard" },
                { size: 8, label: "8x8", desc: "Expert" },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setGridSize(item.size as any)}
                  className={`p-2 rounded-xl border text-center transition ${
                    gridSize === item.size
                      ? "border-indigo-500 bg-indigo-500/20 text-white font-bold"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Math Operations */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Math Operations Allowed
            </label>
            <div className="space-y-1.5">
              {[
                { id: "all", label: "All Operations (+, −, ×, ÷)", desc: "Standard KDP logic puzzle" },
                { id: "add_sub", label: "Addition & Subtraction (+, −)", desc: "Popular for mid-grade math" },
                { id: "add_only", label: "Addition Only (+)", desc: "Perfect for young kids & beginners" },
                { id: "mul_div", label: "Multiplication & Division (×, ÷)", desc: "Times table mastery" },
              ].map((op) => (
                <button
                  key={op.id}
                  onClick={() => setOpsAllowed(op.id as any)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    opsAllowed === op.id
                      ? "border-indigo-500 bg-indigo-500/15 text-white"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{op.label}</div>
                    <div className="text-[10px] text-slate-400">{op.desc}</div>
                  </div>
                  {opsAllowed === op.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Page Layout */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Puzzles Per Page (Interior)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 1, label: "1 / Page", desc: "Large Print" },
                { count: 2, label: "2 / Page", desc: "Standard" },
                { count: 4, label: "4 / Page", desc: "Compact" },
              ].map((item) => (
                <button
                  key={item.count}
                  onClick={() => setPuzzlesPerPage(item.count as any)}
                  className={`p-2 rounded-xl border text-center transition ${
                    puzzlesPerPage === item.count
                      ? "border-indigo-500 bg-indigo-500/20 text-white font-bold"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Generator Button */}
          <button
            onClick={handleGenerateFresh}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> Generate New Mystery Grid
          </button>

          {/* KDP Book Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Book Interior Specs
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
                  <option value={50}>50 Puzzles</option>
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
                  <span>Answer Keys</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Book Title</span>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. KenKen Math Logic Book"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>
        </aside>

        {/* Center Canvas Preview */}
        <main className="flex-1 flex flex-col bg-[#080b12] relative overflow-hidden">
          {/* Subheader */}
          <div className="h-14 border-b border-slate-800 bg-[#090d16]/80 backdrop-blur px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{currentPuzzle.title}</span>
              <span className="text-xs text-slate-400">
                ({currentPuzzle.size}x{currentPuzzle.size} • {currentPuzzle.difficulty.toUpperCase()})
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

              <button
                onClick={() => setUserEntries({})}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 ml-2 transition"
              >
                <RotateCcw className="w-3 h-3" /> Clear My Inputs
              </button>
            </div>

            {/* Pagination Controls */}
            {puzzleList.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActivePuzzleIndex((prev) => Math.max(0, prev - 1));
                    setUserEntries({});
                  }}
                  disabled={activePuzzleIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {activePuzzleIndex + 1} / {puzzleList.length}
                </span>
                <button
                  onClick={() => {
                    setActivePuzzleIndex((prev) => Math.min(puzzleList.length - 1, prev + 1));
                    setUserEntries({});
                  }}
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
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 relative">
              <canvas
                id="calcudoku-canvas"
                ref={canvasRef}
                className="cursor-pointer block"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const padding = 20;
                  const size = currentPuzzle.size;
                  const cellSize = size <= 4 ? 80 : size <= 5 ? 70 : size <= 6 ? 60 : 45;

                  if (
                    x >= padding &&
                    x <= padding + size * cellSize &&
                    y >= padding &&
                    y <= padding + size * cellSize
                  ) {
                    const col = Math.floor((x - padding) / cellSize);
                    const row = Math.floor((y - padding) / cellSize);
                    setSelectedCell([row, col]);
                  }
                }}
              />
            </div>

            {/* On-Screen Number Pad for Interactive Solving */}
            <div className="mt-4 flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-400 px-2">Tap/Type:</span>
              {Array.from({ length: currentPuzzle.size }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    if (selectedCell) {
                      const [r, c] = selectedCell;
                      setUserEntries((prev) => ({ ...prev, [`${r},${c}`]: n }));
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center transition"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => {
                  if (selectedCell) {
                    const [r, c] = selectedCell;
                    setUserEntries((prev) => {
                      const next = { ...prev };
                      delete next[`${r},${c}`];
                      return next;
                    });
                  }
                }}
                className="px-2.5 h-8 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition"
              >
                Del
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
