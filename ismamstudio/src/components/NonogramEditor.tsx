"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Sparkles, Grid3X3 } from "lucide-react";
import {
  NonogramPuzzle,
  PRESET_NONOGRAMS,
  createPuzzleFromPreset,
  generateProceduralNonogram,
  generateNonogramBook,
  extractClues,
} from "../lib/nonogramEngine";

export function NonogramEditor({ page, updatePage, bulkAddPages }: any) {
  const [gridSize, setGridSize] = useState<number>(page.config?.size || 10);
  const [category, setCategory] = useState<string>(page.config?.category || "All");
  const [puzzleData, setPuzzleData] = useState<NonogramPuzzle | null>(page.config?.puzzleData || null);
  const [customCount, setCustomCount] = useState<number>(10);

  const isSolution = page.config?.isSolution || false;

  const handleGenerate = (currentSize = gridSize, currentCategory = category) => {
    let puzzle: NonogramPuzzle;
    // Check if preset exists
    const matchingPresets = PRESET_NONOGRAMS.filter(
      (p) => p.width === currentSize && (currentCategory === "All" || p.category.toLowerCase() === currentCategory.toLowerCase())
    );

    if (matchingPresets.length > 0) {
      const chosen = matchingPresets[Math.floor(Math.random() * matchingPresets.length)];
      puzzle = createPuzzleFromPreset(chosen);
    } else {
      puzzle = generateProceduralNonogram(
        currentSize,
        Math.floor(Math.random() * 1000000),
        `${currentSize}x${currentSize} Pixel Art`,
        currentSize <= 5 ? "easy" : currentSize <= 10 ? "medium" : "hard"
      );
    }

    setPuzzleData(puzzle);
    updatePage({
      size: currentSize,
      category: currentCategory,
      puzzleData: puzzle,
      isSolution,
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      size: gridSize,
      category,
      puzzleData,
      isSolution: solMode,
    });
  };

  useEffect(() => {
    if (!puzzleData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickAddNonograms = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const newPuzzles = generateNonogramBook(num, gridSize, category);
    const configs = newPuzzles.map((p) => ({
      size: gridSize,
      category,
      puzzleData: p,
      isSolution: false,
    }));

    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Nonogram puzzles (${gridSize}x${gridSize} • ${category}) to your book!`);
  };

  // Extract clue bounds for UI rendering
  const maxRowClues = puzzleData?.clues?.rows
    ? Math.max(...puzzleData.clues.rows.map((r) => r?.length || 0), 1)
    : 1;
  const maxColClues = puzzleData?.clues?.cols
    ? Math.max(...puzzleData.clues.cols.map((c) => c?.length || 0), 1)
    : 1;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Editor Controls Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Page Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                  !isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                Puzzle
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                  isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                Solution
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Grid Size Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Grid Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setGridSize(s);
                    handleGenerate(s, category);
                  }}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    gridSize === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Preset Category</h3>
            <select
              value={category}
              onChange={(e) => {
                const c = e.target.value;
                setCategory(c);
                handleGenerate(gridSize, c);
              }}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none shadow-sm"
            >
              <option value="All">All Categories (Random)</option>
              <option value="Animal">Animals</option>
              <option value="Food">Food &amp; Drinks</option>
              <option value="Object">Objects &amp; Symbols</option>
              <option value="Nature">Nature &amp; Plants</option>
              <option value="Geometric">Geometric &amp; Shapes</option>
            </select>
          </div>

          {/* Randomize Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Generate Another
          </button>
        </div>

        {/* Quick Add Nonogram Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400 capitalize">{gridSize}x{gridSize} • {category}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleQuickAddNonograms(cnt)}
                  className="py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  +{cnt}
                </button>
              ))}
            </div>

            {/* Custom Add Page Option */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-[11px] font-bold text-slate-500 mr-1.5 shrink-0">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 bg-transparent outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleQuickAddNonograms(customCount)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0"
              >
                Add Pages
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidelines Card */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-900 dark:text-indigo-200 leading-normal font-semibold">
            <strong>Nonogram Rules:</strong> Numbers outside the grid indicate runs of consecutive filled squares in that row or column. Deduce the pixel art picture!
          </p>
        </div>
      </div>

      {/* Canvas Rendering Area */}
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[400px] lg:min-h-[700px] flex flex-col items-center justify-between text-slate-800 dark:text-slate-100">
        <div className="text-center w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-full text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Grid3X3 className="w-3.5 h-3.5" />
            {puzzleData?.category || "Pixel Art"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-1 uppercase tracking-widest text-slate-800 dark:text-slate-100">
            {puzzleData?.title || "Nonogram Puzzle"} {isSolution && <span className="text-indigo-600 dark:text-indigo-400">(Solution)</span>}
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-6">
            Difficulty: {puzzleData?.difficulty || "medium"} | Size: {gridSize}x{gridSize}
          </p>
        </div>

        {puzzleData ? (
          <div className="w-full max-w-[480px] flex flex-col items-center select-none overflow-auto p-2">
            {/* Nonogram Grid with Clues */}
            <div className="inline-block border-2 border-slate-800 dark:border-slate-200 bg-white dark:bg-slate-950 p-2 rounded-xl shadow-lg">
              {/* Top row: empty corner + column clues */}
              <div className="flex">
                {/* Top-left empty corner */}
                <div
                  className="shrink-0 flex items-end justify-end p-1 text-[9px] font-bold text-slate-300 dark:text-slate-600"
                  style={{ width: `${maxRowClues * 22}px` }}
                >
                  px
                </div>

                {/* Column Clues */}
                <div className="flex">
                  {puzzleData.clues.cols.map((colClues, c) => (
                    <div
                      key={`col-${c}`}
                      className="w-7 sm:w-8 flex flex-col justify-end items-center pb-1 text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                      style={{ height: `${maxColClues * 18}px` }}
                    >
                      {colClues.map((num, i) => (
                        <span key={i} className="leading-tight py-0.5">{num}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows: Row clue + cells */}
              {puzzleData.grid.map((row, r) => (
                <div key={`row-${r}`} className="flex items-center">
                  {/* Row Clues on left */}
                  <div
                    className="shrink-0 flex justify-end items-center gap-1.5 pr-2 text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300"
                    style={{ width: `${maxRowClues * 22}px`, height: "28px" }}
                  >
                    {puzzleData.clues.rows[r]?.map((num, i) => (
                      <span key={i}>{num}</span>
                    ))}
                  </div>

                  {/* Grid cells in row */}
                  <div className="flex">
                    {row.map((cell, c) => {
                      const isFilled = cell === 1;
                      const isBorderRight5 = (c + 1) % 5 === 0 && c + 1 < puzzleData.width;
                      const isBorderBottom5 = (r + 1) % 5 === 0 && r + 1 < puzzleData.height;

                      return (
                        <div
                          key={`cell-${r}-${c}`}
                          className={`w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center border border-slate-200 dark:border-slate-800 transition-colors ${
                            isBorderRight5 ? "border-r-2 border-r-slate-800 dark:border-r-slate-200" : ""
                          } ${
                            isBorderBottom5 ? "border-b-2 border-b-slate-800 dark:border-b-slate-200" : ""
                          } ${
                            isSolution && isFilled
                              ? "bg-slate-900 dark:bg-indigo-400"
                              : "bg-white dark:bg-slate-900"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Generating Nonogram...</div>
        )}

        <div className="w-full text-center mt-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
          Pre-formatted for KDP interior printing with alternating gutter shifts and solution answer keys.
        </div>
      </div>
    </div>
  );
}
