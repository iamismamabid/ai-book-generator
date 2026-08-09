"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Relative paths matching your library utilities
import { generateSudoku, generateSudokuBook, Grid, Difficulty } from '../lib/sudokuGenerator';
import { downloadSudokuPdf } from '../lib/sudoku-pdf';

// Changed from '@/components/DownloadButton' to a relative path
import DownloadButton from "./DownloadButton";

function SudokuPreview({ grid }: { grid: Grid }) {
  return (
    <div className="grid grid-cols-9 gap-0 w-full max-w-md mx-auto border-4 border-slate-700">
      {grid.flatMap((row, r) =>
        row.map((val, c) => {
          const thickRight = (c + 1) % 3 === 0 && c !== 8;
          const thickBottom = (r + 1) % 3 === 0 && r !== 8;
          
          return (
            <div
              key={`${r}-${c}`}
              className={`interactive-cell aspect-square flex items-center justify-center text-lg font-bold border border-slate-600/50
                ${thickRight ? "border-r-4 border-r-slate-700" : ""}
                ${thickBottom ? "border-b-4 border-b-slate-700" : ""}
                ${val !== 0 ? "text-amber-500 bg-slate-800/80" : "bg-slate-900"}
              `}
            >
              {val !== 0 ? val : ""}
            </div>
          );
        })
      )}
    </div>
  );
}

export function SudokuGenerator() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [bookCount, setBookCount] = useState(10);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [currentPuzzle, setCurrentPuzzle] = useState<{ puzzle: Grid; solution: Grid } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateSudoku(difficulty);
      setCurrentPuzzle(result);
      setIsGenerating(false);
    }, 50);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const puzzles = generateSudokuBook(bookCount, difficulty);
      downloadSudokuPdf(
        {
          puzzles,
          difficulty,
          trimSize,
          title: `Sudoku Puzzle Book - ${difficulty}`,
        },
        `sudoku-${difficulty}-${bookCount}puzzles.pdf`
      );
      setIsDownloading(false);
    }, 50);
  };

  return (
    <div className="bg-slate-950 text-white p-8 rounded-3xl mt-12" style={{ boxShadow: "var(--shadow-soft-lg)" }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Sudoku Generator Tool</h2>
        <p className="text-slate-400">
          Generate print-ready sudoku puzzle books for KDP right from this page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4">Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-2xl font-semibold capitalize transition-all duration-200 ease-out active:scale-[0.97] ${
                    difficulty === d
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4">Book settings</h3>
            <label className="block text-sm text-slate-400 mb-2">Number of puzzles</label>
            <input
              type="number"
              min={1}
              max={200}
              value={bookCount}
              onChange={(e) => setBookCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 mb-4 text-white focus:border-indigo-500 outline-none transition-colors duration-200"
            />
            <label className="block text-sm text-slate-400 mb-2">Trim size</label>
            <select
              value={trimSize}
              onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors duration-200"
            >
              <option value="6x9">6" x 9" (most popular)</option>
              <option value="8.5x11">8.5" x 11" (large print)</option>
              <option value="5x8">5" x 8" (compact)</option>
            </select>
          </div>

          {/* 300 DPI Print-Ready Badge */}
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              300 DPI
            </span>
            <span>Print-Ready High-Resolution Exports (KDP Compliant)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 text-sm"
            >
              {isGenerating ? "Generating..." : "Preview a Puzzle"}
            </button>

            <button
              onClick={() => {
                if (!currentPuzzle) return alert("Generate a preview puzzle first!");
                const canvas = document.createElement("canvas");
                const size = trimSize === "8.5x11" ? 2550 : trimSize === "6x9" ? 1800 : 1500;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, size, size);
                const cellSize = size / 9;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `bold ${cellSize * 0.5}px sans-serif`;
                ctx.fillStyle = "#0F172A";

                for (let r = 0; r < 9; r++) {
                  for (let c = 0; c < 9; c++) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    const val = currentPuzzle.puzzle[r][c];
                    ctx.lineWidth = (r % 3 === 0 || c % 3 === 0) ? size * 0.006 : size * 0.002;
                    ctx.strokeStyle = "#1E293B";
                    ctx.strokeRect(x, y, cellSize, cellSize);
                    if (val !== 0) {
                      ctx.fillText(String(val), x + cellSize / 2, y + cellSize / 2);
                    }
                  }
                }
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `sudoku-puzzle-300dpi-${difficulty}.png`;
                link.click();
              }}
              disabled={!currentPuzzle}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-40 text-sm flex items-center justify-center gap-1.5"
            >
              📷 Download 300 DPI PNG
            </button>
          </div>

          {/* Inline Download Button for PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 rounded-2xl transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: "0 8px 24px rgba(245, 158, 11, 0.18)" }}
          >
            {isDownloading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></span>
                Downloading 300 DPI PDF...
              </>
            ) : (
              "Download 300 DPI PDF Book"
            )}
          </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-4">Live Preview (300 DPI Ready)</h3>
          {currentPuzzle ? (
            <SudokuPreview grid={currentPuzzle.puzzle} />
          ) : (
            <div className="aspect-square flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-2xl">
              Click "Preview a Puzzle" to see a sample
            </div>
          )}
        </div>
      </div>
    </div>
  );
}