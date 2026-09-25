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
  Compass,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getClientSafePremiumStatus } from "@/lib/clientAuth";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import {
  FutoshikiPuzzle,
  FutoshikiSize,
  FutoshikiDifficulty,
  generateFutoshiki,
  generateFutoshikiBook,
} from "@/lib/futoshikiEngine";
import { exportFutoshikiBookPdf } from "@/lib/futoshikiPdfExporter";

export default function FutoshikiGenerator() {
  const router = useRouter();

  // Premium status
  const [premiumStatus, setPremiumStatus] = useState({
    checked: false,
    isPremium: false,
    plan: "free",
  });
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
  const [gridSize, setGridSize] = useState<FutoshikiSize>(5);
  const [difficulty, setDifficulty] = useState<FutoshikiDifficulty>("medium");
  const [puzzlesPerPage, setPuzzlesPerPage] = useState<1 | 2 | 4>(1);

  // Book Options
  const [trimSize, setTrimSize] = useState<KdpTrimSize>(KDP_TRIM_SIZES[0]);
  const [bookPageCount, setBookPageCount] = useState<number>(20);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [bookTitle, setBookTitle] = useState<string>("Futoshiki Puzzle Book");
  const [authorName, setAuthorName] = useState<string>("");
  const [facingPages, setFacingPages] = useState<boolean>(true);

  // Puzzles list
  const [puzzleList, setPuzzleList] = useState<FutoshikiPuzzle[]>([]);
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
    const list = generateFutoshikiBook(bookPageCount, gridSize, difficulty);
    setPuzzleList(list);
    setActivePuzzleIndex(0);
    setUserEntries({});
    setSelectedCell(null);
  }, [gridSize, difficulty]);

  const currentPuzzle = useMemo(() => {
    return puzzleList[activePuzzleIndex] || generateFutoshiki(gridSize, difficulty, 101);
  }, [puzzleList, activePuzzleIndex, gridSize, difficulty]);

  // Generate single fresh puzzle
  const handleGenerateFresh = () => {
    const seed = Math.floor(Math.random() * 90000) + 1000;
    const newPuzzle = generateFutoshiki(
      gridSize,
      difficulty,
      seed,
      `Futoshiki #${puzzleList.length + 1}`
    );
    setPuzzleList((prev) => [newPuzzle, ...prev]);
    setActivePuzzleIndex(0);
    setUserEntries({});
    setShowSolution(false);
  };

  // Keyboard navigation & number entry for solving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= "1" && e.key <= String(gridSize)) {
        const val = parseInt(e.key, 10);
        if (currentPuzzle.initialGrid[r][c] === null) {
          setUserEntries((prev) => ({
            ...prev,
            [`${r},${c}`]: val,
          }));
        }
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        if (currentPuzzle.initialGrid[r][c] === null) {
          setUserEntries((prev) => {
            const next = { ...prev };
            delete next[`${r},${c}`];
            return next;
          });
        }
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
  }, [selectedCell, gridSize, currentPuzzle]);

  // Validate conflict in row, column, or inequalities
  const cellErrors = useMemo(() => {
    const errors = new Set<string>();
    const N = gridSize;

    // Build effective grid
    const effective: (number | null)[][] = Array(N)
      .fill(null)
      .map((_, r) =>
        Array(N)
          .fill(null)
          .map((_, c) => currentPuzzle.initialGrid[r][c] ?? userEntries[`${r},${c}`] ?? null)
      );

    // Row duplicates
    for (let r = 0; r < N; r++) {
      const counts: Record<number, number[]> = {};
      for (let c = 0; c < N; c++) {
        const val = effective[r][c];
        if (val !== null) {
          counts[val] = counts[val] || [];
          counts[val].push(c);
        }
      }
      Object.values(counts).forEach((cols) => {
        if (cols.length > 1) {
          cols.forEach((c) => errors.add(`${r},${c}`));
        }
      });
    }

    // Col duplicates
    for (let c = 0; c < N; c++) {
      const counts: Record<number, number[]> = {};
      for (let r = 0; r < N; r++) {
        const val = effective[r][c];
        if (val !== null) {
          counts[val] = counts[val] || [];
          counts[val].push(r);
        }
      }
      Object.values(counts).forEach((rows) => {
        if (rows.length > 1) {
          rows.forEach((r) => errors.add(`${r},${c}`));
        }
      });
    }

    // Horizontal inequality violations
    currentPuzzle.hInequalities.forEach((h) => {
      const v1 = effective[h.row][h.col];
      const v2 = effective[h.row][h.col + 1];
      if (v1 !== null && v2 !== null) {
        if (h.sign === "<" && !(v1 < v2)) {
          errors.add(`${h.row},${h.col}`);
          errors.add(`${h.row},${h.col + 1}`);
        } else if (h.sign === ">" && !(v1 > v2)) {
          errors.add(`${h.row},${h.col}`);
          errors.add(`${h.row},${h.col + 1}`);
        }
      }
    });

    // Vertical inequality violations
    currentPuzzle.vInequalities.forEach((v) => {
      const v1 = effective[v.row][v.col];
      const v2 = effective[v.row + 1][v.col];
      if (v1 !== null && v2 !== null) {
        if (v.sign === "^" && !(v1 < v2)) {
          errors.add(`${v.row},${v.col}`);
          errors.add(`${v.row + 1},${v.col}`);
        } else if (v.sign === "v" && !(v1 > v2)) {
          errors.add(`${v.row},${v.col}`);
          errors.add(`${v.row + 1},${v.col}`);
        }
      }
    });

    return errors;
  }, [currentPuzzle, userEntries, gridSize]);

  // Is puzzle solved completely & correctly?
  const isSolved = useMemo(() => {
    const N = gridSize;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const val = currentPuzzle.initialGrid[r][c] ?? userEntries[`${r},${c}`];
        if (val !== currentPuzzle.solution[r][c]) return false;
      }
    }
    return true;
  }, [currentPuzzle, userEntries, gridSize]);

  // Export PDF
  const handleExportPdf = async () => {
    if (puzzleList.length === 0) return;
    setIsExporting(true);
    setExportProgress(5);

    try {
      const pdf = await exportFutoshikiBookPdf(
        puzzleList,
        {
          trimSize,
          includeSolutions,
          bookTitle,
          authorName: authorName.trim() || undefined,
          puzzlesPerPage,
          showPageNumbers: true,
          facingPages,
        },
        (progress) => setExportProgress(progress)
      );

      const fileName = `${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(
        trimSize.id || "8.5x11"
      ).replace(/\s+/g, "")}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export Futoshiki PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Quick lookup maps for rendering inequalities
  const hMap = useMemo(() => {
    const m: Record<string, "<" | ">"> = {};
    currentPuzzle.hInequalities.forEach((h) => {
      m[`${h.row},${h.col}`] = h.sign;
    });
    return m;
  }, [currentPuzzle]);

  const vMap = useMemo(() => {
    const m: Record<string, "^" | "v"> = {};
    currentPuzzle.vInequalities.forEach((v) => {
      m[`${v.row},${v.col}`] = v.sign;
    });
    return m;
  }, [currentPuzzle]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800"
              title="Back to Tools"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-white uppercase">
                    Futoshiki Studio
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">
                    不等式 • More or Less
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  300 DPI Print-Ready Amazon KDP Inequality Grid Interiors & Solutions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SaveToNotebookButton
              toolName="futoshiki"
              contentType="puzzle"
              title={currentPuzzle.title}
              getData={() => ({
                gridSize,
                difficulty,
                puzzle: currentPuzzle,
              })}
            />

            <CoverStudioCTA source="futoshiki" className="hidden sm:inline-flex" />

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Exporting ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export 300 DPI PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Settings & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Puzzle Generator Options Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 backdrop-blur-xs">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Puzzle Configuration
            </h2>

            {/* Grid Size Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Grid Dimensions:</label>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  {gridSize}x{gridSize} (Digits 1–{gridSize})
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {([4, 5, 6, 7, 8, 9] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setGridSize(sz)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      gridSize === sz
                        ? "bg-gradient-to-r from-cyan-600 to-indigo-600 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {sz}x{sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Difficulty Level:</label>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  {difficulty}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 text-xs font-black capitalize rounded-xl border transition-all ${
                      difficulty === diff
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Puzzles Per Page */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Puzzles Per Page:</label>
                <span className="text-[10px] text-slate-500 font-medium">Layout Density</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 4] as const).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPuzzlesPerPage(num)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      puzzlesPerPage === num
                        ? "bg-slate-800 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {num} per Page
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateFresh}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-700 shadow-sm active:scale-98 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Generate Fresh Puzzle
            </button>
          </div>

          {/* Book & Print Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 backdrop-blur-xs">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              KDP Book Publishing Options
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">KDP Trim Size:</label>
              <select
                value={trimSize.label}
                onChange={(e) => {
                  const found = KDP_TRIM_SIZES.find((t) => t.label === e.target.value);
                  if (found) setTrimSize(found);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {KDP_TRIM_SIZES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label} ({t.width} x {t.height} in)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Total Book Puzzles:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 50, 100].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setBookPageCount(cnt);
                      const list = generateFutoshikiBook(cnt, gridSize, difficulty);
                      setPuzzleList(list);
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      bookPageCount === cnt
                        ? "bg-violet-600 border-violet-400 text-white shadow-md shadow-violet-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Include Solutions Section (Answer Keys)</span>
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-300 font-medium">Facing Pages Layout</div>
                <div className="text-[10px] text-slate-500">Alternating KDP spine gutter margins</div>
              </div>
              <input
                type="checkbox"
                checked={facingPages}
                onChange={(e) => setFacingPages(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-400">Book Title on Title Page:</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                placeholder="Futoshiki Puzzle Book"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Author / Publisher Name:</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                placeholder="e.g. Mastermind Publishing"
              />
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Preview & Solver */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Navigation Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivePuzzleIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activePuzzleIndex === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors border border-slate-700/60 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-slate-200 px-3">
                  Puzzle {activePuzzleIndex + 1} of {puzzleList.length || 1}
                </span>
                <button
                  onClick={() =>
                    setActivePuzzleIndex((prev) => Math.min(puzzleList.length - 1, prev + 1))
                  }
                  disabled={activePuzzleIndex >= puzzleList.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors border border-slate-700/60 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="px-3 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black uppercase tracking-wider">
                {currentPuzzle.difficulty} • {currentPuzzle.size}x{currentPuzzle.size}
              </span>

              {isSolved && !showSolution && (
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Solved!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                  showSolution
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSolution ? "Hide Solution" : "Reveal Solution"}</span>
              </button>
              <button
                onClick={() => setUserEntries({})}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Interactive Futoshiki Canvas Card */}
          <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[580px]">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {currentPuzzle.title}
                  </h3>
                  <div className="text-xs font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
                    {currentPuzzle.size}x{currentPuzzle.size} Futoshiki • {currentPuzzle.difficulty}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-300">
                    Digits 1 to {currentPuzzle.size}
                  </span>
                </div>
              </div>

              {/* Instructions Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-4 flex items-center gap-2.5 text-xs text-slate-600">
                <Lightbulb className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>
                  Fill in the grid so that every row and column contains numbers 1 to {currentPuzzle.size} without repeating, and all inequality symbols (&lt;, &gt;, ^, v) are satisfied. Click any cell to solve!
                </span>
              </div>

              {/* Interactive Grid Canvas */}
              <div className="flex flex-col items-center justify-center my-6 select-none">
                <div className="inline-block p-4 sm:p-6 bg-slate-50 rounded-2xl border-2 border-slate-300 shadow-inner">
                  {Array.from({ length: currentPuzzle.size }).map((_, r) => (
                    <React.Fragment key={`row-${r}`}>
                      {/* Cells and Horizontal Inequalities */}
                      <div className="flex items-center justify-center">
                        {Array.from({ length: currentPuzzle.size }).map((_, c) => {
                          const initialVal = currentPuzzle.initialGrid[r][c];
                          const userVal = userEntries[`${r},${c}`];
                          const solVal = currentPuzzle.solution[r][c];
                          const displayVal = showSolution
                            ? solVal
                            : initialVal !== null
                            ? initialVal
                            : userVal || "";

                          const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                          const hasError = cellErrors.has(`${r},${c}`);
                          const hSign = hMap[`${r},${c}`];

                          return (
                            <React.Fragment key={`cell-${r}-${c}`}>
                              <div
                                onClick={() => setSelectedCell([r, c])}
                                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl font-black transition-all cursor-pointer ${
                                  isSelected
                                    ? "ring-4 ring-cyan-500/50 border-cyan-600 bg-cyan-50 scale-105 z-10"
                                    : hasError
                                    ? "border-rose-500 bg-rose-50 text-rose-700"
                                    : initialVal !== null
                                    ? "bg-slate-200/80 border-slate-400 text-slate-900"
                                    : showSolution
                                    ? "bg-amber-50 border-amber-300 text-amber-900"
                                    : userVal
                                    ? "bg-white border-indigo-400 text-indigo-700 shadow-sm"
                                    : "bg-white border-slate-300 hover:border-slate-400"
                                }`}
                              >
                                {displayVal}
                              </div>

                              {/* Horizontal Inequality Sign between columns */}
                              {c < currentPuzzle.size - 1 && (
                                <div className="w-6 sm:w-8 flex items-center justify-center font-black text-slate-800 text-base sm:text-lg font-mono">
                                  {hSign || ""}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Vertical Inequalities between rows */}
                      {r < currentPuzzle.size - 1 && (
                        <div className="flex items-center justify-center my-1">
                          {Array.from({ length: currentPuzzle.size }).map((_, c) => {
                            const vSign = vMap[`${r},${c}`];
                            return (
                              <React.Fragment key={`v-sign-${r}-${c}`}>
                                <div className="w-11 h-6 sm:w-14 sm:h-7 flex items-center justify-center font-black text-slate-800 text-base sm:text-lg font-mono">
                                  {vSign === "^" ? "▲" : vSign === "v" ? "▼" : ""}
                                </div>
                                {c < currentPuzzle.size - 1 && (
                                  <div className="w-6 sm:w-8" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* On-screen Keypad for fast solving */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">
                    Keypad:
                  </span>
                  {Array.from({ length: currentPuzzle.size }).map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => {
                        if (!selectedCell) return;
                        const [r, c] = selectedCell;
                        if (currentPuzzle.initialGrid[r][c] === null) {
                          setUserEntries((prev) => ({
                            ...prev,
                            [`${r},${c}`]: i + 1,
                          }));
                        }
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-500 border border-slate-300 text-slate-900 font-mono font-black text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCell) return;
                      const [r, c] = selectedCell;
                      if (currentPuzzle.initialGrid[r][c] === null) {
                        setUserEntries((prev) => {
                          const next = { ...prev };
                          delete next[`${r},${c}`];
                          return next;
                        });
                      }
                    }}
                    className="px-3 h-9 sm:h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:border-rose-400 border border-slate-300 text-slate-600 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Erase
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>KDPage Publishing Studio • 300 DPI Vector Print-Ready</span>
              <span>www.kdpage.com</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
