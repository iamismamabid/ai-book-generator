"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  Info,
  Waves,
  CircleDot,
  Eraser,
  Trophy,
} from "lucide-react";
import {
  NurikabePuzzle,
  NurikabeDifficulty,
  CellState,
  generateNurikabe,
  generateNurikabeBook,
  isValidSea,
} from "@/lib/nurikabeEngine";
import { exportNurikabeBookPdf } from "@/lib/nurikabePdfExporter";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";

export default function NurikabeGenerator() {
  // Puzzle configuration
  const [rows, setRows] = useState<number>(7);
  const [cols, setCols] = useState<number>(7);
  const [difficulty, setDifficulty] = useState<NurikabeDifficulty>("medium");
  const [activePuzzle, setActivePuzzle] = useState<NurikabePuzzle | null>(null);

  // Player solving state: 2D matrix of CellState ("unmarked" | "sea" | "island")
  const [playerGrid, setPlayerGrid] = useState<CellState[][]>([]);
  const [activeTool, setActiveTool] = useState<"sea" | "island" | "cycle">("cycle");
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Book Export & Batch State
  const [bookTitle, setBookTitle] = useState<string>("Nurikabe Puzzle Book");
  const [bookSubtitle, setBookSubtitle] = useState<string>("Islands in the Stream Japanese Logic Puzzles");
  const [authorName, setAuthorName] = useState<string>("");
  const [bookPageCount, setBookPageCount] = useState<number>(20);
  const [trimSize, setTrimSize] = useState<KdpTrimSize>("8.5x11");
  const [puzzlesPerPage, setPuzzlesPerPage] = useState<1 | 2 | 4>(2);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [facingPages, setFacingPages] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Initialize new puzzle
  const handleGenerateNew = useCallback(() => {
    const puzzle = generateNurikabe(rows, cols, difficulty);
    setActivePuzzle(puzzle);

    // Initial player grid: Clued cells start as islands, rest unmarked
    const initialGrid: CellState[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        puzzle.clues[r][c] !== null ? "island" : "unmarked"
      )
    );
    setPlayerGrid(initialGrid);
    setShowSolution(false);
  }, [rows, cols, difficulty]);

  useEffect(() => {
    handleGenerateNew();
  }, [handleGenerateNew]);

  // Reset player progress
  const handleReset = () => {
    if (!activePuzzle) return;
    const initialGrid: CellState[][] = Array.from({ length: activePuzzle.rows }, (_, r) =>
      Array.from({ length: activePuzzle.cols }, (_, c) =>
        activePuzzle.clues[r][c] !== null ? "island" : "unmarked"
      )
    );
    setPlayerGrid(initialGrid);
    setShowSolution(false);
  };

  // Toggle cell on click
  const handleCellClick = (r: number, c: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (showSolution || !activePuzzle) return;

    // Fixed clue cells cannot be made into sea
    if (activePuzzle.clues[r][c] !== null) return;

    setPlayerGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const current = next[r][c];

      if (e?.button === 2) {
        // Right click: quick toggle sea <-> unmarked
        next[r][c] = current === "sea" ? "unmarked" : "sea";
      } else if (activeTool === "sea") {
        next[r][c] = current === "sea" ? "unmarked" : "sea";
      } else if (activeTool === "island") {
        next[r][c] = current === "island" ? "unmarked" : "island";
      } else {
        // Cycle mode: unmarked -> sea -> island -> unmarked
        if (current === "unmarked") next[r][c] = "sea";
        else if (current === "sea") next[r][c] = "island";
        else next[r][c] = "unmarked";
      }

      return next;
    });
  };

  // Analyze solver state: check pools, islands, and victory
  const puzzleStatus = useMemo(() => {
    if (!activePuzzle || playerGrid.length === 0) {
      return { isSolved: false, hasPools: false, poolCells: new Set<string>() };
    }

    const poolCells = new Set<string>();
    let hasPools = false;

    // Check 2x2 sea pools
    for (let r = 0; r < activePuzzle.rows - 1; r++) {
      for (let c = 0; c < activePuzzle.cols - 1; c++) {
        if (
          playerGrid[r][c] === "sea" &&
          playerGrid[r + 1][c] === "sea" &&
          playerGrid[r][c + 1] === "sea" &&
          playerGrid[r + 1][c + 1] === "sea"
        ) {
          hasPools = true;
          poolCells.add(`${r},${c}`);
          poolCells.add(`${r + 1},${c}`);
          poolCells.add(`${r},${c + 1}`);
          poolCells.add(`${r + 1},${c + 1}`);
        }
      }
    }

    // Check if every cell is marked and matches solution
    let isExactMatch = true;
    for (let r = 0; r < activePuzzle.rows; r++) {
      for (let c = 0; c < activePuzzle.cols; c++) {
        const expected = activePuzzle.solution[r][c];
        const actual = playerGrid[r][c];
        if (actual !== expected) {
          isExactMatch = false;
          break;
        }
      }
      if (!isExactMatch) break;
    }

    return {
      isSolved: isExactMatch && !hasPools,
      hasPools,
      poolCells,
    };
  }, [activePuzzle, playerGrid]);

  // Export KDP PDF book
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      const batchPuzzles = generateNurikabeBook(
        bookPageCount,
        rows,
        cols,
        difficulty
      );
      setExportProgress(40);

      const doc = await exportNurikabeBookPdf(
        batchPuzzles,
        {
          trimSize,
          includeSolutions,
          bookTitle,
          bookSubtitle,
          authorName,
          puzzlesPerPage,
          showPageNumbers: true,
          facingPages,
        },
        (p) => setExportProgress(40 + Math.round(p * 0.55))
      );

      doc.save(`${bookTitle.toLowerCase().replace(/\s+/g, "-")}-kdp.pdf`);
      setExportProgress(100);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Studio Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1220]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Nurikabe Studio</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                Islands &amp; Sea
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Japanese islands &amp; ocean wall logic puzzles with 300 DPI vector PDF export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveToNotebookButton
            category="nurikabe"
            getItem={() => ({
              type: "puzzle",
              title: activePuzzle?.title || "Nurikabe Puzzle",
              puzzleData: activePuzzle,
            })}
          />
          <Link
            href="/studio"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Cover Studio
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Canvas Area (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Controls Bar */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              {/* Tool selector */}
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTool("cycle")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTool === "cycle"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Cycle Mode
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool("sea")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTool === "sea"
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" /> Sea (Water)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool("island")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTool === "island"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5" /> Island (Land)
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Reset Player Progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSolution(!showSolution)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  showSolution
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSolution ? "Hide Solution" : "Reveal Sea"}
              </button>

              <button
                type="button"
                onClick={handleGenerateNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Puzzle
              </button>
            </div>
          </div>

          {/* Victory Banner */}
          {puzzleStatus.isSolved && !showSolution && (
            <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center gap-3 text-cyan-300 animate-in fade-in zoom-in-95 duration-200 shadow-lg shadow-cyan-500/10">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <p className="font-black text-sm text-white">Congratulations! Nurikabe Solved!</p>
                <p className="text-xs font-medium text-cyan-300/80">
                  The sea is fully connected, contains no 2×2 pools, and all islands are separated!
                </p>
              </div>
            </div>
          )}

          {/* 2x2 Pool Warning Banner */}
          {puzzleStatus.hasPools && !showSolution && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center gap-2.5 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>2×2 Pool Detected:</strong> The sea cannot form a 2×2 square of water cells.
              </span>
            </div>
          )}

          {/* Interactive Grid Canvas Card */}
          <div className="bg-[#0c1220] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
            {/* Background subtle radial glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

            {activePuzzle && playerGrid.length > 0 && (
              <div
                className="grid gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/90 select-none shadow-2xl"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  gridTemplateColumns: `repeat(${activePuzzle.cols}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: activePuzzle.rows }).map((_, r) =>
                  Array.from({ length: activePuzzle.cols }).map((_, c) => {
                    const clue = activePuzzle.clues[r][c];
                    const isSolutionSea = showSolution && activePuzzle.solution[r][c] === "sea";
                    const isPlayerSea = !showSolution && playerGrid[r]?.[c] === "sea";
                    const isPlayerIsland = !showSolution && playerGrid[r]?.[c] === "island";
                    const isPool = puzzleStatus.poolCells.has(`${r},${c}`);

                    const isSea = isSolutionSea || isPlayerSea;

                    return (
                      <button
                        key={`cell-${r}-${c}`}
                        type="button"
                        onClick={(e) => handleCellClick(r, c, e)}
                        onContextMenu={(e) => handleCellClick(r, c, e)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                          isSea
                            ? isPool
                              ? "bg-rose-950/80 border border-rose-500 text-rose-300 shadow-md shadow-rose-950/50"
                              : "bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 shadow-inner shadow-cyan-900/40"
                            : isPlayerIsland
                            ? "bg-slate-900 border border-amber-500/50 text-amber-300"
                            : "bg-[#0f172a] border border-slate-800 hover:border-slate-700 text-slate-100"
                        }`}
                      >
                        {/* Clue Number */}
                        {clue !== null && clue !== undefined ? (
                          <span className="text-amber-400 font-extrabold drop-shadow-md">
                            {clue}
                          </span>
                        ) : isPlayerIsland ? (
                          <div className="w-2 h-2 rounded-full bg-amber-400/80 shadow-sm" />
                        ) : null}

                        {/* Sea wave hint icon for shaded cells */}
                        {isSea && (
                          <Waves className="w-4 h-4 text-cyan-400/40 absolute pointer-events-none" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Hint footer */}
            <p className="mt-8 text-xs font-semibold text-slate-500 flex items-center gap-1.5 text-center">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Click cells to toggle between Sea (Water) and Island (Land). Right-click for quick toggle.
            </p>
          </div>
        </section>

        {/* Right Configuration & KDP Export Sidebar (5 Cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Puzzle Generator Options */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Puzzle Engine Setup
            </h2>

            {/* Grid Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Grid Dimensions ({rows}×{cols})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { r: 5, c: 5, label: "5×5" },
                  { r: 6, c: 6, label: "6×6" },
                  { r: 7, c: 7, label: "7×7" },
                  { r: 8, c: 8, label: "8×8" },
                  { r: 10, c: 10, label: "10×10" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setRows(item.r);
                      setCols(item.c);
                    }}
                    className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${
                      rows === item.r && cols === item.c
                        ? "bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Difficulty Level</label>
              <div className="grid grid-cols-4 gap-2">
                {(["easy", "medium", "hard", "expert"] as NurikabeDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl border transition-all ${
                      difficulty === d
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amazon KDP Interior PDF Exporter */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> KDP Print Book Export
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Book Title</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Trim Size</label>
                  <select
                    value={trimSize}
                    onChange={(e) => setTrimSize(e.target.value as KdpTrimSize)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                  >
                    {KDP_TRIM_SIZES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Puzzles Count</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Layout (Puzzles / Page)</label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 4] as (1 | 2 | 4)[]).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPuzzlesPerPage(num)}
                      className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${
                        puzzlesPerPage === num
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {num} {num === 1 ? "Puzzle" : "Puzzles"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSolutions}
                    onChange={(e) => setIncludeSolutions(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    Include Solutions &amp; Answer Keys at Back
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facingPages}
                    onChange={(e) => setFacingPages(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    KDP Facing Pages (Alternating Spine Gutter Margins)
                  </span>
                </label>
              </div>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportPdf}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? `Exporting Book (${exportProgress}%)...` : "Export 300 DPI Vector PDF"}
              </button>
            </div>
          </div>

          {/* How to Play Card */}
          <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-3xl p-6 text-xs text-slate-400 space-y-3">
            <h3 className="font-black text-sm text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> How to Play Nurikabe
            </h3>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-400 font-medium">
              <li>Each number belongs to an <strong className="text-slate-200">island</strong> of connected white cells equal to that number.</li>
              <li>Islands cannot touch each other horizontally or vertically (only diagonally).</li>
              <li>All shaded cells form a single continuous body of water called <strong className="text-slate-200">the sea</strong>.</li>
              <li>There are <strong className="text-slate-200">no 2×2 pools</strong> of water allowed anywhere in the sea.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
