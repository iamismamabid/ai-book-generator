"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSudoku, generateSudokuBook, Grid, Difficulty } from '../../lib/sudoku'; 
import { downloadSudokuPdf } from '../../lib/sudoku-pdf';
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
  const [activeTab, setActiveTab] = useState<"generator" | "guide">("generator");
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
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-amber-500 text-sm mb-4 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-amber-250 bg-clip-text text-transparent mb-2">
            Sudoku Book Studio
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            Compile print-ready Sudoku puzzle collections for Amazon KDP. Customize difficulty levels and export standard trims.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-slate-900 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === "generator"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Interactive Creator
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === "guide"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            KDP Publishing Guide
          </button>
        </div>

        {activeTab === "generator" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Settings panel */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850">
                <h2 className="text-lg font-bold mb-4 text-amber-300">Difficulty</h2>
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-3 rounded-lg font-semibold capitalize transition ${
                        difficulty === d
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-350 hover:bg-slate-700"
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

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850">
                <h2 className="text-lg font-bold mb-4 text-amber-300">Book settings</h2>

                <label className="block text-sm text-slate-400 mb-2">
                  Number of puzzles
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={bookCount}
                  onChange={(e) => setBookCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 mb-4 text-white font-mono"
                />

                <label className="block text-sm text-slate-400 mb-2">Trim size</label>
                <select
                  value={trimSize}
                  onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 text-white font-bold"
                >
                  <option value="6x9">6" x 9" (most popular)</option>
                  <option value="8.5x11">8.5" x 11" (large print)</option>
                  <option value="5x8">5" x 8" (compact)</option>
                </select>
              </div>

              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 border border-slate-750"
              >
                {isGenerating ? "Generating..." : "Preview a puzzle"}
              </button>

              <DownloadButton
                onClick={handleDownloadPdf}
                label={isDownloading ? "Downloading..." : "Download PDF"}
              />
            </div>

            {/* Preview panel */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <h2 className="text-lg font-bold mb-4 text-slate-300">Live preview</h2>
              {currentPuzzle ? (
                <SudokuPreview grid={currentPuzzle.puzzle} />
              ) : (
                <div className="aspect-square flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl flex-1 min-h-[300px]">
                  Click "Preview a puzzle" to see a sample
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detailed KDP Publishing Guide Tab */
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-850 space-y-8 animate-fade-in text-slate-350 text-sm leading-relaxed font-semibold">
            
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> KDP Sudoku Trim Guidelines
              </h3>
              <p>
                When publishing puzzle books on Amazon KDP, layout sizes and spacing dictate your book rejection rate. Follow these standard specifications:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>**8.5" x 11" (Large Print)**: Best for senior citizens or younger children. Keeps grid squares large enough (minimum 0.5 inches per cell) for comfortable writing.</li>
                <li>**6" x 9" (Standard Pocket)**: Perfect for travel booklets and quick-solve challenge books. Highly popular.</li>
                <li>**Gutter Margin**: Our Sudoku PDF generator leaves exactly 0.5 inches of safety gutter so grids are not lost in the book fold.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Print Quality Specs
              </h3>
              <p>
                All exported PDFs are constructed as high-resolution **vector graphics**. This guarantees that the puzzle lines, numbers, and grid boundaries remain perfectly sharp without pixelation during commercial industrial printing.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> How to Launch Your Sudoku Book
              </h3>
              <ol className="list-decimal list-inside pl-4 space-y-2 text-slate-400 font-bold">
                <li>Configure the difficulty and select puzzle counts. Click **Download PDF** to export your interior pages.</li>
                <li>Verify your PDF interior file. Note the exact page count (solutions are automatically added to the back).</li>
                <li>Navigate to the **Ismam Studio Cover Canvas**, insert your total page count to calculate the spine size, and design your back/front covers.</li>
                <li>Upload both files to Amazon KDP, write high-converting keywords (e.g., "mind exercise large print sudoku"), and set your royalty pricing!</li>
              </ol>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}