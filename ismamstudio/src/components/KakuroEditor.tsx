"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, BookOpen, AlertCircle } from "lucide-react";
import { generateKakuro, KakuroPuzzle } from "../lib/kakuro";

export function KakuroEditor({ page, updatePage }: any) {
  const [sizeId, setSizeId] = useState<string>(page.config.sizeId || "6x6");
  const [difficulty, setDifficulty] = useState<string>(page.config.difficulty || "medium");
  const [puzzleData, setPuzzleData] = useState<KakuroPuzzle | null>(page.config.gridData || null);

  const isSolution = page.config.isSolution || false;

  const handleGenerate = (currentSize = sizeId, currentDiff = difficulty) => {
    const result = generateKakuro(currentSize, currentDiff);
    setPuzzleData(result);
    updatePage({ sizeId: currentSize, difficulty: currentDiff, gridData: result, isSolution });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({ sizeId, difficulty, gridData: puzzleData, isSolution: solMode });
  };

  useEffect(() => {
    if (!puzzleData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      {/* Editor Controls Panel */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
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

          {/* Size Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Grid Size</h3>
            <select
              value={sizeId}
              onChange={(e) => {
                const s = e.target.value;
                setSizeId(s);
                handleGenerate(s, difficulty);
              }}
              className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:border-indigo-500 outline-none shadow-sm"
            >
              <option value="4x4">4x4 Grid (Standard)</option>
              <option value="6x6">6x6 Grid (Medium)</option>
              <option value="8x8">8x8 Grid (Large)</option>
              <option value="9x11">9x11 Grid (Book size)</option>
              <option value="9x17">9x17 Grid (Giant)</option>
            </select>
          </div>

          {/* Difficulty Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Difficulty</h3>
            <div className="grid grid-cols-2 gap-2">
              {["easy", "intermediate", "hard", "challenging", "expert"].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d);
                    handleGenerate(sizeId, d);
                  }}
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
        </div>

        <button
          onClick={() => handleGenerate()}
          className="w-full bg-indigo-600 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-95 transition"
        >
          <RefreshCw className="w-4 h-4" /> Generate Kakuro
        </button>

        {/* Informational Guidelines Card */}
        <div className="p-4 bg-indigo-50 border border-indigo-200/50 rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-900 leading-normal font-semibold">
            <strong>Rulebook:</strong> Fill cells with numbers 1 to 9. Values in any run must add up to the clue cell value, with no repeating numbers allowed in a single row/column run.
          </p>
        </div>
      </div>

      {/* Canvas Rendering Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center justify-between text-slate-800">
        <div className="text-center w-full">
          <h1 className="text-3xl font-black text-center mb-1 uppercase tracking-widest text-slate-800">
            Kakuro Puzzle {isSolution && <span className="text-indigo-600">(Solution)</span>}
          </h1>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-6">
            Difficulty: {difficulty} | Size: {sizeId}
          </p>
        </div>

        {puzzleData ? (
          <div
            className="grid gap-0 border-[3px] border-slate-900 bg-slate-900 shadow-xl overflow-hidden"
            style={{
              gridTemplateRef: "none",
              gridTemplateRows: `repeat(${puzzleData.rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${puzzleData.cols}, minmax(0, 1fr))`,
              width: "100%",
              maxWidth: sizeId === "9x17" ? "320px" : "400px",
              aspectRatio: `${puzzleData.cols}/${puzzleData.rows}`
            }}
          >
            {puzzleData.grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell.type === "white") {
                  const disp = isSolution ? cell.value : cell.displayValue;
                  const isSolutionNum = isSolution && !cell.displayValue;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`aspect-square border border-slate-200 flex items-center justify-center text-sm md:text-base font-bold select-none ${
                        isSolutionNum ? "text-indigo-600 bg-indigo-50/40" : "text-slate-800 bg-white"
                      }`}
                    >
                      {disp || ""}
                    </div>
                  );
                } else {
                  // Clue / Black Cell
                  const hasRow = cell.rowClue !== undefined;
                  const hasCol = cell.colClue !== undefined;
                  const hasClues = hasRow || hasCol;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square bg-slate-800 border border-slate-900 relative overflow-hidden flex items-center justify-center"
                    >
                      {hasClues && (
                        <>
                          {/* Diagonal divider line */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-600/40 to-transparent pointer-events-none" />
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="0" x2="100" y2="100" stroke="#475569" strokeWidth="2.5" />
                          </svg>

                          {/* Row sum (Top Right) */}
                          {hasRow && (
                            <span className="absolute top-1 right-1 text-[9px] md:text-[10px] font-black text-slate-100 leading-none">
                              {cell.rowClue}
                            </span>
                          )}

                          {/* Col sum (Bottom Left) */}
                          {hasCol && (
                            <span className="absolute bottom-1 left-1 text-[9px] md:text-[10px] font-black text-slate-100 leading-none">
                              {cell.colClue}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                }
              })
            )}
          </div>
        ) : (
          <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Generating Grid...</div>
        )}

        <div className="w-full text-center mt-6 text-[10px] font-semibold text-slate-400 max-w-sm leading-relaxed">
          Pre-formatted to fit standard paperback trim guidelines with safe inner gutter bounds automatically configured.
        </div>
      </div>
    </div>
  );
}
