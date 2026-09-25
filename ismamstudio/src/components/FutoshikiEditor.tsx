"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Sparkles, Compass } from "lucide-react";
import {
  FutoshikiPuzzle,
  FutoshikiSize,
  FutoshikiDifficulty,
  generateFutoshiki,
  generateFutoshikiBook,
} from "../lib/futoshikiEngine";

export function FutoshikiEditor({ page, updatePage, bulkAddPages }: any) {
  const [gridSize, setGridSize] = useState<FutoshikiSize>(page.config?.size || 5);
  const [difficulty, setDifficulty] = useState<FutoshikiDifficulty>(
    page.config?.difficulty || "medium"
  );
  const [puzzleData, setPuzzleData] = useState<FutoshikiPuzzle | null>(
    page.config?.puzzleData || null
  );
  const [customCount, setCustomCount] = useState<number>(10);

  const isSolution = page.config?.isSolution || false;

  const handleGenerate = (currentSize = gridSize, currentDiff = difficulty) => {
    const puzzle = generateFutoshiki(
      currentSize,
      currentDiff,
      Math.floor(Math.random() * 1000000),
      `Futoshiki ${currentSize}x${currentSize}`
    );

    setPuzzleData(puzzle);
    updatePage({
      size: currentSize,
      difficulty: currentDiff,
      puzzleData: puzzle,
      isSolution,
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      size: gridSize,
      difficulty,
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

  const handleQuickAddFutoshiki = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const newPuzzles = generateFutoshikiBook(num, gridSize, difficulty);
    const configs = newPuzzles.map((p) => ({
      size: gridSize,
      difficulty,
      puzzleData: p,
      isSolution: false,
    }));

    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Futoshiki puzzles (${gridSize}x${gridSize}) to your book!`);
  };

  // Quick lookup maps for horizontal & vertical inequalities
  const hMap = useMemo(() => {
    const map: Record<string, "<" | ">"> = {};
    if (puzzleData?.hInequalities) {
      puzzleData.hInequalities.forEach((h) => {
        map[`${h.row},${h.col}`] = h.sign;
      });
    }
    return map;
  }, [puzzleData]);

  const vMap = useMemo(() => {
    const map: Record<string, "^" | "v"> = {};
    if (puzzleData?.vInequalities) {
      puzzleData.vInequalities.forEach((v) => {
        map[`${v.row},${v.col}`] = v.sign;
      });
    }
    return map;
  }, [puzzleData]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Controls Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
              Page Mode
            </h3>
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
                Worksheet
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
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Grid Size
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {([4, 5, 6, 7] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setGridSize(sz);
                    handleGenerate(sz, difficulty);
                  }}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    gridSize === sz
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {sz}x{sz}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Difficulty
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    setDifficulty(diff);
                    handleGenerate(gridSize, diff);
                  }}
                  className={`py-2 px-2 capitalize rounded-lg font-bold text-xs transition ${
                    difficulty === diff
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
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

        {/* Quick Add Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400 capitalize">
                {gridSize}x{gridSize} • {difficulty}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleQuickAddFutoshiki(cnt)}
                  className="py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  +{cnt}
                </button>
              ))}
            </div>

            {/* Custom Count */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-[11px] font-bold text-slate-500 mr-1.5 shrink-0">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customCount}
                  onChange={(e) =>
                    setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                  }
                  className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-slate-100 outline-none"
                  placeholder="20"
                />
                <span className="text-[10px] text-slate-400 font-bold ml-1 shrink-0">pages</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAddFutoshiki(customCount)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800/80 min-h-[460px]">
        {puzzleData && (
          <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center max-w-lg w-full">
            <h2 className="text-xl font-black uppercase tracking-wider mb-1">
              {isSolution ? "Futoshiki Solution" : puzzleData.title}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-6">
              Digits 1 to {gridSize} • Difficulty: {difficulty.toUpperCase()}
            </p>

            {/* Grid preview with inequalities */}
            <div className="inline-block p-4 bg-slate-50 rounded-xl border border-slate-300">
              {Array.from({ length: gridSize }).map((_, r) => (
                <React.Fragment key={`f-row-${r}`}>
                  <div className="flex items-center justify-center">
                    {Array.from({ length: gridSize }).map((_, c) => {
                      const initialVal = puzzleData.initialGrid[r][c];
                      const solVal = puzzleData.solution[r][c];
                      const displayVal = isSolution
                        ? solVal
                        : initialVal !== null
                        ? initialVal
                        : "";
                      const hSign = hMap[`${r},${c}`];

                      return (
                        <React.Fragment key={`f-cell-${r}-${c}`}>
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg sm:text-xl ${
                              initialVal !== null
                                ? "bg-slate-200/80 border-slate-400 text-slate-900 font-black"
                                : isSolution
                                ? "bg-amber-50 border-amber-300 text-amber-900"
                                : "bg-white border-slate-300 text-slate-400"
                            }`}
                          >
                            {displayVal}
                          </div>
                          {c < gridSize - 1 && (
                            <div className="w-5 sm:w-6 flex items-center justify-center font-black text-slate-700 text-sm font-mono">
                              {hSign || ""}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {r < gridSize - 1 && (
                    <div className="flex items-center justify-center my-0.5">
                      {Array.from({ length: gridSize }).map((_, c) => {
                        const vSign = vMap[`${r},${c}`];
                        return (
                          <React.Fragment key={`f-v-${r}-${c}`}>
                            <div className="w-10 sm:w-12 flex items-center justify-center font-black text-slate-700 text-xs font-mono">
                              {vSign === "^" ? "▲" : vSign === "v" ? "▼" : ""}
                            </div>
                            {c < gridSize - 1 && <div className="w-5 sm:w-6" />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
