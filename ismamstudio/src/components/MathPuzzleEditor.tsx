"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

type PuzzleType = "addition" | "multiplication" | "number_fill";

export function MathPuzzleEditor({ page, updatePage }: any) {
  const [puzzleType, setPuzzleType] = useState<PuzzleType>(
    page.config.puzzleType || "addition"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    page.config.difficulty || "easy"
  );
  const [puzzleData, setPuzzleData] = useState<any>(
    page.config.puzzleData || null
  );

  const isSolution = page.config.isSolution || false;

  const generateAdditionPuzzle = () => {
    const minVal = difficulty === "easy" ? 1 : difficulty === "medium" ? 5 : 10;
    const maxVal = difficulty === "easy" ? 9 : difficulty === "medium" ? 20 : 50;

    const a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    const b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    const d = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    const e = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

    const c = a + b;
    const f = d + e;
    const g = a + d;
    const h = b + e;
    const i = c + f;

    const grid = [a, b, c, d, e, f, g, h, i];

    const hideCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
    const hiddenIndices: number[] = [];
    while (hiddenIndices.length < hideCount) {
      const idx = Math.floor(Math.random() * 9);
      if (!hiddenIndices.includes(idx)) {
        hiddenIndices.push(idx);
      }
    }

    return { grid, hiddenIndices };
  };

  const generateMultiplicationPuzzle = () => {
    const factorMin = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    const factorMax = difficulty === "easy" ? 9 : difficulty === "medium" ? 12 : 20;

    const size = 4;
    const rowFactors: number[] = [];
    const colFactors: number[] = [];

    while (rowFactors.length < size) {
      const val = Math.floor(Math.random() * (factorMax - factorMin + 1)) + factorMin;
      if (!rowFactors.includes(val)) rowFactors.push(val);
    }

    while (colFactors.length < size) {
      const val = Math.floor(Math.random() * (factorMax - factorMin + 1)) + factorMin;
      if (!colFactors.includes(val)) colFactors.push(val);
    }

    const grid: number[][] = [];
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        grid[r][c] = rowFactors[r] * colFactors[c];
      }
    }

    const hiddenRows: number[] = [];
    const hiddenCols: number[] = [];
    const hiddenProducts: Array<[number, number]> = [];

    const hideHeadersCount = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    while (hiddenRows.length < hideHeadersCount) {
      const idx = Math.floor(Math.random() * size);
      if (!hiddenRows.includes(idx)) hiddenRows.push(idx);
    }
    while (hiddenCols.length < hideHeadersCount) {
      const idx = Math.floor(Math.random() * size);
      if (!hiddenCols.includes(idx)) hiddenCols.push(idx);
    }

    const hideProductCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 11;
    while (hiddenProducts.length < hideProductCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!hiddenProducts.some(p => p[0] === r && p[1] === c)) {
        hiddenProducts.push([r, c]);
      }
    }

    return { rowFactors, colFactors, grid, hiddenRows, hiddenCols, hiddenProducts };
  };

  const generateNumberFillPuzzle = () => {
    const minVal = difficulty === "easy" ? 1 : difficulty === "medium" ? 5 : 10;
    const maxVal = difficulty === "easy" ? 9 : difficulty === "medium" ? 20 : 35;

    const grid: number[][] = [];
    const rowSums = [0, 0, 0, 0];
    const colSums = [0, 0, 0, 0];

    for (let r = 0; r < 4; r++) {
      grid[r] = [];
      for (let c = 0; c < 4; c++) {
        const val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        grid[r][c] = val;
        rowSums[r] += val;
        colSums[c] += val;
      }
    }

    const hideCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 11;
    const hiddenCells: Array<[number, number]> = [];

    while (hiddenCells.length < hideCount) {
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);
      if (!hiddenCells.some(cell => cell[0] === r && cell[1] === c)) {
        hiddenCells.push([r, c]);
      }
    }

    return { grid, rowSums, colSums, hiddenCells };
  };

  const handleGenerate = () => {
    let result: any = null;
    if (puzzleType === "addition") {
      result = generateAdditionPuzzle();
    } else if (puzzleType === "multiplication") {
      result = generateMultiplicationPuzzle();
    } else if (puzzleType === "number_fill") {
      result = generateNumberFillPuzzle();
    }

    setPuzzleData(result);
    updatePage({
      puzzleType,
      difficulty,
      puzzleData: result,
      isSolution
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      puzzleType,
      difficulty,
      puzzleData,
      isSolution: solMode
    });
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleType, difficulty]);

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-80 flex flex-col gap-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Page Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToggleMode(false)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                !isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Puzzle
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Solution
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Puzzle Grid Type</h3>
          <div className="space-y-2">
            {(["addition", "multiplication", "number_fill"] as PuzzleType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPuzzleType(t)}
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold capitalize transition border ${
                  puzzleType === t
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t === "addition"
                  ? "Addition Equation Grid"
                  : t === "multiplication"
                  ? "Multiplication Times Table"
                  : "Number Sums Fill"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Difficulty</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 rounded-lg font-bold text-xs capitalize transition ${
                  difficulty === d
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate Math Grid
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-widest text-slate-800">
          {puzzleType === "addition"
            ? "Addition Grid"
            : puzzleType === "multiplication"
            ? "Multiplication Table"
            : "Number Sums"}
          {isSolution && <span className="text-indigo-600"> (Solution)</span>}
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-8 text-center max-w-sm">
          {puzzleType === "addition"
            ? "Fill in the blank boxes to make all equations correct."
            : puzzleType === "multiplication"
            ? "Fill in the missing factors and products."
            : "Complete the grid so rows/cols match the targets."}
        </p>

        {puzzleData ? (
          <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center">
            {/* Addition Grid */}
            {puzzleType === "addition" && (
              <div className="grid grid-cols-3 gap-y-8 gap-x-8 relative p-6 bg-slate-50/50 border border-slate-250 rounded-3xl">
                {puzzleData.grid.map((val: number, idx: number) => {
                  const r = Math.floor(idx / 3);
                  const c = idx % 3;
                  const isHidden = puzzleData.hiddenIndices.includes(idx) && !isSolution;
                  const isAnswer = isSolution && puzzleData.hiddenIndices.includes(idx);

                  return (
                    <div key={idx} className="relative flex items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black border-2 shadow-sm transition-all
                          ${
                            isHidden
                              ? "bg-white border-dashed border-slate-300 text-transparent"
                              : isAnswer
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                              : "bg-white border-slate-800 text-slate-850"
                          }
                        `}
                      >
                        {!isHidden ? val : ""}
                      </div>

                      {/* Math Operators */}
                      {c < 2 && (
                        <span className="absolute -right-5 text-lg font-extrabold text-slate-400">
                          {c === 0 ? "+" : "="}
                        </span>
                      )}
                      {r < 2 && (
                        <span className="absolute -bottom-6 text-lg font-extrabold text-slate-400">
                          {r === 0 ? "+" : "="}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multiplication Grid */}
            {puzzleType === "multiplication" && (
              <div className="grid grid-cols-5 gap-1.5 border-4 border-slate-900 bg-white p-2 rounded-2xl shadow-lg">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => {
                    const isHeader = r === 0 || c === 0;

                    if (r === 0 && c === 0) {
                      return (
                        <div key="0-0" className="w-12 h-12 flex items-center justify-center font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl text-lg">
                          ×
                        </div>
                      );
                    }

                    let displayedVal = "";
                    let isHidden = false;
                    let isAnswer = false;

                    if (r === 0) {
                      // Column Factor Header
                      const val = puzzleData.colFactors[c - 1];
                      isHidden = puzzleData.hiddenCols.includes(c - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenCols.includes(c - 1);
                      displayedVal = String(val);
                    } else if (c === 0) {
                      // Row Factor Header
                      const val = puzzleData.rowFactors[r - 1];
                      isHidden = puzzleData.hiddenRows.includes(r - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenRows.includes(r - 1);
                      displayedVal = String(val);
                    } else {
                      // Product Cell
                      const val = puzzleData.grid[r - 1][c - 1];
                      isHidden = puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1);
                      displayedVal = String(val);
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-12 h-12 flex items-center justify-center text-sm font-bold border rounded-xl transition-all duration-300
                          ${
                            isHeader
                              ? "bg-slate-100 border-slate-200 text-slate-800 font-extrabold"
                              : "border-slate-200"
                          }
                          ${
                            isHidden
                              ? "bg-slate-50 border-dashed border-slate-300 text-transparent"
                              : isAnswer
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold"
                              : "text-slate-800"
                          }
                        `}
                      >
                        {!isHidden ? displayedVal : ""}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Number Fill (Sums Grid) */}
            {puzzleType === "number_fill" && (
              <div className="grid grid-cols-5 gap-1.5 border-4 border-slate-900 bg-white p-2 rounded-2xl shadow-lg">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => {
                    const isSumHeader = r === 4 || c === 4;

                    if (r === 4 && c === 4) {
                      return <div key="corner" className="w-12 h-12 bg-transparent" />;
                    }

                    let displayedVal = "";
                    let isHidden = false;
                    let isAnswer = false;

                    if (isSumHeader) {
                      const sumVal = r === 4 ? puzzleData.colSums[c] : puzzleData.rowSums[r];
                      displayedVal = String(sumVal);
                    } else {
                      const val = puzzleData.grid[r][c];
                      isHidden = puzzleData.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c);
                      displayedVal = String(val);
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-12 h-12 flex items-center justify-center text-sm font-bold border rounded-xl transition-all duration-300
                          ${
                            isSumHeader
                              ? "bg-indigo-50 border-indigo-100 text-indigo-700 font-black"
                              : "border-slate-200"
                          }
                          ${
                            isHidden
                              ? "bg-slate-50 border-dashed border-slate-350 text-transparent"
                              : isAnswer
                              ? "bg-indigo-100 border-indigo-400 text-indigo-800 font-extrabold"
                              : isSumHeader
                              ? ""
                              : "text-slate-800"
                          }
                        `}
                      >
                        {!isHidden ? displayedVal : ""}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load math grid.</div>
        )}
      </div>
    </div>
  );
}
