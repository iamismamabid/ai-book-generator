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
  ChevronRight,
  Info,
  PenTool,
  X as XIcon,
  Trophy,
} from "lucide-react";
import {
  SlitherlinkPuzzle,
  SlitherlinkDifficulty,
  EdgeState,
  createEmptyPlayerEdges,
  generateSlitherlink,
  generateSlitherlinkBook,
  isValidSingleLoop,
  getCellEdgeCount,
} from "@/lib/slitherlinkEngine";
import { exportSlitherlinkBookPdf } from "@/lib/slitherlinkPdfExporter";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";

export default function SlitherlinkGenerator() {
  // Puzzle configuration
  const [rows, setRows] = useState<number>(7);
  const [cols, setCols] = useState<number>(7);
  const [difficulty, setDifficulty] = useState<SlitherlinkDifficulty>("medium");
  const [activePuzzle, setActivePuzzle] = useState<SlitherlinkPuzzle | null>(null);

  // Player solving state
  const [hEdges, setHEdges] = useState<EdgeState[][]>([]);
  const [vEdges, setVEdges] = useState<EdgeState[][]>([]);
  const [editTool, setEditTool] = useState<"line" | "cross">("line");
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Book Export & Batch State
  const [bookTitle, setBookTitle] = useState<string>("Slitherlink Puzzle Book");
  const [bookSubtitle, setBookSubtitle] = useState<string>("Classic Loop-the-Loop Logic Puzzles");
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
    const puzzle = generateSlitherlink(rows, cols, difficulty);
    setActivePuzzle(puzzle);
    const { hEdges: newH, vEdges: newV } = createEmptyPlayerEdges(rows, cols);
    setHEdges(newH);
    setVEdges(newV);
    setShowSolution(false);
  }, [rows, cols, difficulty]);

  useEffect(() => {
    handleGenerateNew();
  }, [handleGenerateNew]);

  // Reset current puzzle player progress
  const handleReset = () => {
    if (!activePuzzle) return;
    const { hEdges: newH, vEdges: newV } = createEmptyPlayerEdges(activePuzzle.rows, activePuzzle.cols);
    setHEdges(newH);
    setVEdges(newV);
    setShowSolution(false);
  };

  // Toggle horizontal edge
  const handleToggleH = (r: number, c: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (showSolution) return;
    setHEdges((prev) => {
      const next = prev.map((row) => [...row]);
      const current = next[r][c];
      if (editTool === "cross" || e?.button === 2) {
        next[r][c] = current === "cross" ? "none" : "cross";
      } else {
        next[r][c] = current === "line" ? "none" : "line";
      }
      return next;
    });
  };

  // Toggle vertical edge
  const handleToggleV = (r: number, c: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (showSolution) return;
    setVEdges((prev) => {
      const next = prev.map((row) => [...row]);
      const current = next[r][c];
      if (editTool === "cross" || e?.button === 2) {
        next[r][c] = current === "cross" ? "none" : "cross";
      } else {
        next[r][c] = current === "line" ? "none" : "line";
      }
      return next;
    });
  };

  // Analyze solver state: check satisfied clues, violations, and loop completion
  const puzzleStatus = useMemo(() => {
    if (!activePuzzle || hEdges.length === 0 || vEdges.length === 0) {
      return { isSolved: false, clueViolations: new Set<string>(), satisfiedClues: new Set<string>() };
    }

    const clueViolations = new Set<string>();
    const satisfiedClues = new Set<string>();

    let allCluesSatisfied = true;

    for (let r = 0; r < activePuzzle.rows; r++) {
      for (let c = 0; c < activePuzzle.cols; c++) {
        const clue = activePuzzle.clues[r][c];
        if (clue !== null && clue !== undefined) {
          const count = getCellEdgeCount(r, c, hEdges, vEdges);
          if (count > clue) {
            clueViolations.add(`${r},${c}`);
            allCluesSatisfied = false;
          } else if (count === clue) {
            satisfiedClues.add(`${r},${c}`);
          } else {
            allCluesSatisfied = false;
          }
        }
      }
    }

    // Convert player lines to booleans to check single closed loop
    const boolH = hEdges.map((row) => row.map((edge) => edge === "line"));
    const boolV = vEdges.map((row) => row.map((edge) => edge === "line"));

    const isSingleLoop = isValidSingleLoop(boolH, boolV, activePuzzle.rows, activePuzzle.cols);
    const isSolved = allCluesSatisfied && isSingleLoop;

    return { isSolved, clueViolations, satisfiedClues };
  }, [activePuzzle, hEdges, vEdges]);

  // Export KDP PDF book
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      const batchPuzzles = generateSlitherlinkBook(
        bookPageCount,
        rows,
        cols,
        difficulty
      );
      setExportProgress(40);

      const doc = await exportSlitherlinkBookPdf(
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Studio Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1220]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Slitherlink Studio</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                Loop the Loop
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Japanese single-loop fence logic puzzles with 300 DPI KDP PDF export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveToNotebookButton
            category="slitherlink"
            getItem={() => ({
              type: "puzzle",
              title: activePuzzle?.title || "Slitherlink Puzzle",
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
                  onClick={() => setEditTool("line")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editTool === "line"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" /> Draw Line
                </button>
                <button
                  type="button"
                  onClick={() => setEditTool("cross")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editTool === "cross"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <XIcon className="w-3.5 h-3.5" /> Mark Cross (X)
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
                {showSolution ? "Hide Solution" : "Reveal Loop"}
              </button>

              <button
                type="button"
                onClick={handleGenerateNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Puzzle
              </button>
            </div>
          </div>

          {/* Victory Banner */}
          {puzzleStatus.isSolved && !showSolution && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 animate-in fade-in zoom-in-95 duration-200 shadow-lg shadow-emerald-500/10">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <p className="font-black text-sm text-white">Congratulations! Single Loop Completed!</p>
                <p className="text-xs font-medium text-emerald-300/80">
                  Every clue matches its surrounding fences without branching or crossing.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Grid Canvas Card */}
          <div className="bg-[#0c1220] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
            {/* Background subtle radial glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            {activePuzzle && (
              <div
                className="relative select-none"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  width: activePuzzle.cols * 56 + 24,
                  height: activePuzzle.rows * 56 + 24,
                }}
              >
                {/* Cells layer: contains numeric clues & violation highlights */}
                {Array.from({ length: activePuzzle.rows }).map((_, r) =>
                  Array.from({ length: activePuzzle.cols }).map((_, c) => {
                    const clue = activePuzzle.clues[r][c];
                    const isViolated = puzzleStatus.clueViolations.has(`${r},${c}`);
                    const isSatisfied = puzzleStatus.satisfiedClues.has(`${r},${c}`);

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        className={`absolute flex items-center justify-center rounded-lg transition-all ${
                          isViolated
                            ? "bg-rose-500/20 ring-1 ring-rose-500/60"
                            : isSatisfied
                            ? "bg-emerald-500/10"
                            : ""
                        }`}
                        style={{
                          left: c * 56 + 12,
                          top: r * 56 + 12,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {clue !== null && clue !== undefined && (
                          <span
                            className={`text-xl font-black transition-colors ${
                              isViolated
                                ? "text-rose-400 font-extrabold"
                                : isSatisfied
                                ? "text-emerald-400"
                                : "text-amber-400/95"
                            }`}
                          >
                            {clue}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Horizontal Edges: (rows + 1) rows, cols per row */}
                {Array.from({ length: activePuzzle.rows + 1 }).map((_, r) =>
                  Array.from({ length: activePuzzle.cols }).map((_, c) => {
                    const isSolutionLine = showSolution && activePuzzle.solutionH[r][c];
                    const playerState = hEdges[r]?.[c] || "none";
                    const isLine = isSolutionLine || playerState === "line";
                    const isCross = !showSolution && playerState === "cross";

                    return (
                      <div
                        key={`h-edge-${r}-${c}`}
                        onClick={(e) => handleToggleH(r, c, e)}
                        onContextMenu={(e) => handleToggleH(r, c, e)}
                        className="absolute cursor-pointer flex items-center justify-center group"
                        style={{
                          left: c * 56 + 12,
                          top: r * 56 + 12 - 12,
                          width: 56,
                          height: 24,
                        }}
                      >
                        {/* Visible Line Bar */}
                        <div
                          className={`w-full transition-all duration-150 rounded-full ${
                            isLine
                              ? "h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                              : "h-0.5 bg-transparent group-hover:bg-slate-700/80 group-hover:h-1"
                          }`}
                        />
                        {/* Cross mark */}
                        {isCross && (
                          <span className="absolute text-xs font-black text-rose-500/80 pointer-events-none">
                            ✕
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Vertical Edges: rows rows, (cols + 1) per row */}
                {Array.from({ length: activePuzzle.rows }).map((_, r) =>
                  Array.from({ length: activePuzzle.cols + 1 }).map((_, c) => {
                    const isSolutionLine = showSolution && activePuzzle.solutionV[r][c];
                    const playerState = vEdges[r]?.[c] || "none";
                    const isLine = isSolutionLine || playerState === "line";
                    const isCross = !showSolution && playerState === "cross";

                    return (
                      <div
                        key={`v-edge-${r}-${c}`}
                        onClick={(e) => handleToggleV(r, c, e)}
                        onContextMenu={(e) => handleToggleV(r, c, e)}
                        className="absolute cursor-pointer flex items-center justify-center group"
                        style={{
                          left: c * 56 + 12 - 12,
                          top: r * 56 + 12,
                          width: 24,
                          height: 56,
                        }}
                      >
                        {/* Visible Line Bar */}
                        <div
                          className={`h-full transition-all duration-150 rounded-full ${
                            isLine
                              ? "w-1.5 bg-gradient-to-b from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                              : "w-0.5 bg-transparent group-hover:bg-slate-700/80 group-hover:w-1"
                          }`}
                        />
                        {/* Cross mark */}
                        {isCross && (
                          <span className="absolute text-xs font-black text-rose-500/80 pointer-events-none">
                            ✕
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Dots Layer: (rows + 1) * (cols + 1) */}
                {Array.from({ length: activePuzzle.rows + 1 }).map((_, r) =>
                  Array.from({ length: activePuzzle.cols + 1 }).map((_, c) => (
                    <div
                      key={`dot-${r}-${c}`}
                      className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-slate-100 shadow-md shadow-white/20 border border-slate-900 pointer-events-none z-10"
                      style={{
                        left: c * 56 + 12,
                        top: r * 56 + 12,
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {/* Hint footer */}
            <p className="mt-8 text-xs font-semibold text-slate-500 flex items-center gap-1.5 text-center">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Left-click to toggle loop fence. Right-click or select &ldquo;Mark Cross&rdquo; to eliminate impossible edges.
            </p>
          </div>
        </section>

        {/* Right Configuration & KDP Export Sidebar (5 Cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Puzzle Generator Options */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Puzzle Engine Setup
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
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30"
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
                {(["easy", "medium", "hard", "expert"] as SlitherlinkDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl border transition-all ${
                      difficulty === d
                        ? "bg-teal-600 border-teal-500 text-white shadow-md shadow-teal-600/30"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Trim Size</label>
                  <select
                    value={trimSize}
                    onChange={(e) => setTrimSize(e.target.value as KdpTrimSize)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-900"
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
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-900"
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? `Exporting Book (${exportProgress}%)...` : "Export 300 DPI Vector PDF"}
              </button>
            </div>
          </div>

          {/* How to Play Card */}
          <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-3xl p-6 text-xs text-slate-400 space-y-3">
            <h3 className="font-black text-sm text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" /> How to Play Slitherlink
            </h3>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-400 font-medium">
              <li>Connect adjacent dots with horizontal and vertical lines to form a <strong className="text-slate-200">single continuous loop</strong>.</li>
              <li>The loop cannot touch or cross itself. There are no loose ends or branches.</li>
              <li>The number inside each cell indicates how many of its 4 sides are part of the loop.</li>
              <li>Cells with no numbers can have any number of edges (0 to 3).</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
