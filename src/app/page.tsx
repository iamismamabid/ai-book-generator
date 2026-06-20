"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatesudoku, generatesudokuBook, Grid, Difficulty } from '@/lib/sudoku';
import { downloadsudokuPdf } from '@/lib/sudoku-pdf';



import DownloadButton from "@/components/DownloadButton";

// FIXED: Properly enclosed the return statement inside the function body
function SudokuPreview({ grid }: { grid: Grid }) {
  return (
    <div className="grid grid-cols-9 gap-0 w-full max-w-md mx-auto border-4 border-slate-700">
      {grid.flatMap((row, r) =>
        row.map((val, c) => {
          // Thicker borders for the 3x3 grid intersections
          const thickRight = (c + 1) % 3 === 0 && c !== 8;
          const thickBottom = (r + 1) % 3 === 0 && r !== 8;
          
          return (
            <div
              key={`${r}-${c}`}
              className={`aspect-square flex items-center justify-center text-lg font-bold border border-slate-600/50
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

// FIXED: Capitalized the main page component (React best practice)
export default function SudokuGeneratorPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [bookCount, setBookCount] = useState(10);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [currentPuzzle, setCurrentPuzzle] = useState<{ puzzle: Grid; solution: Grid } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreview = () => {
    setIsGenerating(true);
    // setTimeout lets the loading state render before the (synchronous,
    // CPU-heavy) generation blocks the main thread
    setTimeout(() => {
      const result = generatesudoku(difficulty);
      setCurrentPuzzle(result);
      setIsGenerating(false);
    }, 50);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const puzzles = generatesudokuBook(bookCount, difficulty);
      downloadsudokuPdf(
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
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-amber-500 text-sm mb-4"
          >
            ← Back to home
          </button>
          <h1 className="text-4xl font-bold mb-2">Sudoku Generator</h1>
          <p className="text-slate-400">
            Generate print-ready sudoku puzzle books for KDP. Choose your
            difficulty, preview a sample, then download the full book as PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Settings panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold mb-4">Difficulty</h2>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-lg font-semibold capitalize transition ${
                      difficulty === d
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {difficulty === "easy" && "~40 numbers shown — good for beginners"}
                {difficulty === "medium" && "~32 numbers shown — balanced challenge"}
                {difficulty === "hard" && "~26 numbers shown — for experienced solvers"}
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold mb-4">Book settings</h2>

              <label className="block text-sm text-slate-400 mb-2">
                Number of puzzles
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={bookCount}
                onChange={(e) => setBookCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 mb-4 text-white"
              />

              <label className="block text-sm text-slate-400 mb-2">Trim size</label>
              <select
                value={trimSize}
                onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="6x9">6" x 9" (most popular)</option>
                <option value="8.5x11">8.5" x 11" (large print)</option>
                <option value="5x8">5" x 8" (compact)</option>
              </select>
            </div>

            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Preview a puzzle"}
            </button>

            <DownloadButton
              onClick={handleDownloadPdf}
              label={isDownloading ? "Downloading..." : "Download PDF"}
            />
          </div>

          {/* Preview panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold mb-4">Live preview</h2>
            {currentPuzzle ? (
              // FIXED: Changed <sudokuPreview> to <SudokuPreview>
              <SudokuPreview grid={currentPuzzle.puzzle} />
            ) : (
              <div className="aspect-square flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl">
                Click "Preview a puzzle" to see a sample
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}