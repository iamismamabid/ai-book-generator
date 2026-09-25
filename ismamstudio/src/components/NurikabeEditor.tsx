"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Sparkles, Layers, Waves } from "lucide-react";
import {
  NurikabePuzzle,
  NurikabeDifficulty,
  generateNurikabe,
  generateNurikabeBook,
} from "../lib/nurikabeEngine";

export function NurikabeEditor({ page, updatePage, bulkAddPages }: any) {
  const [rows, setRows] = useState<number>(page.config?.rows || 7);
  const [cols, setCols] = useState<number>(page.config?.cols || 7);
  const [difficulty, setDifficulty] = useState<NurikabeDifficulty>(
    page.config?.difficulty || "medium"
  );
  const [puzzleData, setPuzzleData] = useState<NurikabePuzzle | null>(
    page.config?.puzzleData || null
  );
  const [customCount, setCustomCount] = useState<number>(10);

  const isSolution = page.config?.isSolution || false;

  const handleGenerate = (currentRows = rows, currentCols = cols, currentDiff = difficulty) => {
    const puzzle = generateNurikabe(
      currentRows,
      currentCols,
      currentDiff,
      `Nurikabe ${currentRows}x${currentCols}`
    );

    setPuzzleData(puzzle);
    updatePage({
      rows: currentRows,
      cols: currentCols,
      difficulty: currentDiff,
      puzzleData: puzzle,
      isSolution,
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      rows,
      cols,
      difficulty,
      puzzleData,
      isSolution: solMode,
    });
  };

  useEffect(() => {
    if (!puzzleData) {
      handleGenerate();
    }
  }, []);

  const handleBulkAdd = () => {
    if (!bulkAddPages) return;
    const puzzles = generateNurikabeBook(customCount, rows, cols, difficulty);

    // Add puzzle pages
    const puzzlePages = puzzles.map((p, idx) => ({
      type: "nurikabe",
      name: `Nurikabe #${idx + 1}`,
      config: {
        rows,
        cols,
        difficulty,
        puzzleData: p,
        isSolution: false,
      },
    }));

    // Add solution pages
    const solutionPages = puzzles.map((p, idx) => ({
      type: "nurikabe",
      name: `Nurikabe Sol #${idx + 1}`,
      config: {
        rows,
        cols,
        difficulty,
        puzzleData: p,
        isSolution: true,
      },
    }));

    bulkAddPages([...puzzlePages, ...solutionPages]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto w-80">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
            <Waves className="w-4 h-4" />
          </div>
          <h3 className="font-black text-sm text-white">Nurikabe Page</h3>
        </div>
        <button
          onClick={() => handleGenerate()}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Regenerate single puzzle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Solution or Puzzle Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Page View Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => handleToggleMode(false)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isSolution
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Puzzle Only
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Show Solution
            </button>
          </div>
        </div>

        {/* Grid Dimensions */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Grid Dimensions
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { r: 5, c: 5, label: "5×5" },
              { r: 6, c: 6, label: "6×6" },
              { r: 7, c: 7, label: "7×7" },
              { r: 8, c: 8, label: "8×8" },
              { r: 10, c: 10, label: "10×10" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setRows(item.r);
                  setCols(item.c);
                  handleGenerate(item.r, item.c, difficulty);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  rows === item.r && cols === item.c
                    ? "bg-cyan-600 border-cyan-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["easy", "medium", "hard", "expert"] as NurikabeDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  handleGenerate(rows, cols, d);
                }}
                className={`py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  difficulty === d
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Preview */}
        {puzzleData && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Canvas Preview
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-center">
              <div
                className="grid gap-0.5 p-1 bg-slate-900 border border-slate-800 rounded-lg select-none"
                style={{
                  gridTemplateColumns: `repeat(${puzzleData.cols}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: puzzleData.rows }).map((_, r) =>
                  Array.from({ length: puzzleData.cols }).map((_, c) => {
                    const clue = puzzleData.clues[r][c];
                    const isSea = isSolution && puzzleData.solution[r][c] === "sea";

                    return (
                      <div
                        key={`prev-cell-${r}-${c}`}
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-xs ${
                          isSea
                            ? "bg-cyan-950 border border-cyan-800/80 text-cyan-400"
                            : "bg-slate-950 border border-slate-800/80 text-amber-400"
                        }`}
                      >
                        {clue !== null && clue !== undefined ? clue : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Add Section */}
        {bulkAddPages && (
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Bulk Add Puzzles
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={50}
                value={customCount}
                onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none"
              />
              <button
                onClick={handleBulkAdd}
                className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
              >
                Add {customCount} Puzzles (+ Solutions)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
