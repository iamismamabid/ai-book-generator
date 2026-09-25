"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Sparkles, Calculator } from "lucide-react";
import {
  CalcudokuPuzzle,
  CalcudokuOp,
  generateCalcudoku,
  generateCalcudokuBook,
} from "../lib/calcudokuEngine";

export function CalcudokuEditor({ page, updatePage, bulkAddPages }: any) {
  const [gridSize, setGridSize] = useState<number>(page.config?.size || 5);
  const [opsMode, setOpsMode] = useState<"all" | "add_sub" | "add_only" | "mul_div">(
    page.config?.opsMode || "all"
  );
  const [puzzleData, setPuzzleData] = useState<CalcudokuPuzzle | null>(
    page.config?.puzzleData || null
  );
  const [customCount, setCustomCount] = useState<number>(10);

  const isSolution = page.config?.isSolution || false;

  const resolveOps = (mode: string): CalcudokuOp[] => {
    switch (mode) {
      case "add_only":
        return ["+"];
      case "add_sub":
        return ["+", "-"];
      case "mul_div":
        return ["*", "/"];
      case "all":
      default:
        return ["+", "-", "*", "/"];
    }
  };

  const handleGenerate = (currentSize = gridSize, currentOpsMode = opsMode) => {
    const ops = resolveOps(currentOpsMode);
    const puzzle = generateCalcudoku(
      currentSize,
      Math.floor(Math.random() * 1000000),
      ops,
      `Calcudoku ${currentSize}x${currentSize}`
    );

    setPuzzleData(puzzle);
    updatePage({
      size: currentSize,
      opsMode: currentOpsMode,
      puzzleData: puzzle,
      isSolution,
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      size: gridSize,
      opsMode,
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

  const handleQuickAddCalcudoku = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const ops = resolveOps(opsMode);
    const newPuzzles = generateCalcudokuBook(num, gridSize, ops);
    const configs = newPuzzles.map((p) => ({
      size: gridSize,
      opsMode,
      puzzleData: p,
      isSolution: false,
    }));

    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Calcudoku puzzles (${gridSize}x${gridSize}) to your book!`);
  };

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
            <div className="grid grid-cols-4 gap-1.5">
              {[4, 5, 6, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setGridSize(s);
                    handleGenerate(s, opsMode);
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

          {/* Operations Allowed */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Math Operations</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "all", label: "All (+ - × ÷)" },
                { id: "add_sub", label: "Add & Sub (+ -)" },
                { id: "add_only", label: "Addition Only (+)" },
                { id: "mul_div", label: "Mul & Div (× ÷)" },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => {
                    setOpsMode(op.id as any);
                    handleGenerate(gridSize, op.id as any);
                  }}
                  className={`py-2 px-1 text-center rounded-lg font-bold text-[11px] transition ${
                    opsMode === op.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {op.label}
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

        {/* Quick Add Calcudoku Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400 capitalize">{gridSize}x{gridSize}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleQuickAddCalcudoku(cnt)}
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
                onClick={() => handleQuickAddCalcudoku(customCount)}
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
            <strong>Calcudoku Rules:</strong> Fill each row and column with digits 1 to {gridSize} without repeating. Numbers in each heavily outlined cage must compute the cage target using the specified math operator!
          </p>
        </div>
      </div>

      {/* Canvas Rendering Area */}
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[400px] lg:min-h-[700px] flex flex-col items-center justify-between text-slate-800 dark:text-slate-100">
        <div className="text-center w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Arithmetic Logic Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-1 uppercase tracking-widest text-slate-800 dark:text-slate-100">
            Calcudoku {isSolution && <span className="text-indigo-600 dark:text-indigo-400">(Solution)</span>}
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-6">
            Grid: {gridSize}x{gridSize} | Operations: {opsMode.toUpperCase()}
          </p>
        </div>

        {puzzleData ? (
          <div className="w-full max-w-[420px] select-none p-2 flex flex-col items-center">
            {/* Grid Box */}
            <div
              className="grid border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-950 shadow-xl overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: "100%",
                aspectRatio: "1/1",
              }}
            >
              {Array.from({ length: gridSize }).map((_, r) =>
                Array.from({ length: gridSize }).map((_, c) => {
                  const cageId = puzzleData.cageGrid[r][c];
                  const cage = puzzleData.cages[cageId];
                  const isTopLeft = cage?.cells[0]?.[0] === r && cage?.cells[0]?.[1] === c;

                  // Cage boundary checks
                  const isTopCage = r === 0 || puzzleData.cageGrid[r - 1]?.[c] !== cageId;
                  const isBottomCage = r === gridSize - 1 || puzzleData.cageGrid[r + 1]?.[c] !== cageId;
                  const isLeftCage = c === 0 || puzzleData.cageGrid[r]?.[c - 1] !== cageId;
                  const isRightCage = c === gridSize - 1 || puzzleData.cageGrid[r]?.[c + 1] !== cageId;

                  const cellValue = puzzleData.solution[r][c];

                  return (
                    <div
                      key={`calc-${r}-${c}`}
                      className="relative flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800"
                      style={{
                        borderTop: isTopCage ? "2.5px solid #0f172a" : undefined,
                        borderBottom: isBottomCage ? "2.5px solid #0f172a" : undefined,
                        borderLeft: isLeftCage ? "2.5px solid #0f172a" : undefined,
                        borderRight: isRightCage ? "2.5px solid #0f172a" : undefined,
                      }}
                    >
                      {/* Cage clue in top left */}
                      {isTopLeft && cage && (
                        <span className="absolute top-1 left-1.5 text-[9px] sm:text-[10px] font-black tracking-tight text-slate-800 dark:text-slate-200 select-none">
                          {cage.target}
                          {cage.op !== "none" ? cage.op : ""}
                        </span>
                      )}

                      {/* Solution Value */}
                      {isSolution && (
                        <span className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {cellValue}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Generating Calcudoku...</div>
        )}

        <div className="w-full text-center mt-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
          Complies with KDP trim and spine gutter regulations with automatic answer key packing.
        </div>
      </div>
    </div>
  );
}
