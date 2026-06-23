"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { generateSudoku, Difficulty } from "../lib/sudokuGenerator";

export function SudokuEditor({ page, updatePage }: any) {
  const [difficulty, setDifficulty] = useState<Difficulty>(page.config.difficulty || "medium");
  const [puzzleData, setPuzzleData] = useState<any>(page.config.gridData || null);

  const handleGenerate = () => {
    const result = generateSudoku(difficulty);
    setPuzzleData(result);
    updatePage({ difficulty, gridData: result });
  };

  useEffect(() => {
    if (!puzzleData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      {/* Editor Panel */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Difficulty</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
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

        <button 
          onClick={handleGenerate} 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4"/> Generate Sudoku
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-slate-800">Sudoku</h1>
        
        {puzzleData ? (
          <div className="grid grid-cols-9 gap-0 w-full max-w-md mx-auto border-4 border-slate-900 bg-white">
            {puzzleData.puzzle.map((row: number[], r: number) =>
              row.map((val: number, c: number) => {
                const thickRight = (c + 1) % 3 === 0 && c !== 8;
                const thickBottom = (r + 1) % 3 === 0 && r !== 8;
                
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square flex items-center justify-center text-lg font-bold border border-slate-300
                      ${thickRight ? "border-r-4 border-r-slate-900" : ""}
                      ${thickBottom ? "border-b-4 border-b-slate-900" : ""}
                      text-slate-800 bg-white
                    `}
                  >
                    {val !== 0 ? val : ""}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load puzzle.</div>
        )}
      </div>
    </div>
  );
}
