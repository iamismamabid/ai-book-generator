"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSudoku, generateSudokuBook, Grid, Difficulty } from '../../lib/sudoku'; 
import { downloadSudokuPdf } from '../../lib/sudoku-pdf';
import DownloadButton from "@/components/DownloadButton";
import { CheckCircle2, BookOpen, Eye, Grid3x3, FileText } from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";

// Live preview — puzzle grid
function SudokuPreview({ grid, isSolution = false }: { grid: Grid; isSolution?: boolean }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-9 gap-0 border-[3px] border-slate-700 rounded-sm overflow-hidden">
        {grid.flatMap((row, r) =>
          row.map((val, c) => {
            const thickRight  = (c + 1) % 3 === 0 && c !== 8;
            const thickBottom = (r + 1) % 3 === 0 && r !== 8;

            return (
              <div
                key={`${r}-${c}`}
                className={`aspect-square flex items-center justify-center text-sm font-bold border border-slate-700/40
                  ${thickRight  ? "border-r-[2.5px] border-r-slate-600" : ""}
                  ${thickBottom ? "border-b-[2.5px] border-b-slate-600" : ""}
                  ${val !== 0
                    ? isSolution
                      ? "text-indigo-400 bg-slate-800/60"
                      : "text-amber-400 bg-slate-800/80"
                    : "bg-slate-900"}
                `}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SudokuGeneratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generator" | "solution" | "guide">("generator");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [bookCount, setBookCount] = useState(10);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [currentPuzzle, setCurrentPuzzle] = useState<{ puzzle: Grid; solution: Grid } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [includeCover, setIncludeCover] = useState(false);

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
    setTimeout(async () => {
      let coverState = null;
      if (includeCover) {
        const saved = localStorage.getItem("kdp-cover-draft");
        if (saved) {
          try {
            coverState = JSON.parse(saved);
          } catch (e) {
            console.error("Error loading cover draft", e);
          }
        }
        if (!coverState) {
          alert("No saved cover found! Please design a cover in the Cover Studio first.");
          setIsDownloading(false);
          return;
        }
      }

      const count = Math.max(1, bookCount);
      const puzzles = generateSudokuBook(count, difficulty);
      await downloadSudokuPdf(
        {
          puzzles,
          difficulty,
          trimSize,
          title: `Sudoku Puzzle Book`,
          includeSolutions,
          includeCover,
          coverState,
        },
        `sudoku-${difficulty}-${count}puzzles.pdf`
      );
      setIsDownloading(false);
    }, 50);
  };

  const tabs = [
    { id: "generator", label: "Puzzle Creator",  icon: Grid3x3 },
    { id: "solution",  label: "Solution View",   icon: Eye      },
    { id: "guide",     label: "KDP Guide",        icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-amber-500 text-sm mb-4 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
            Sudoku Book Studio
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            Compile print-ready Sudoku puzzle collections for Amazon KDP. Customize difficulty levels and export standard trims.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-900 pb-4 mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === id
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── GENERATOR TAB ──────────────────────────────────────── */}
        {activeTab === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Settings panel */}
            <div className="space-y-5">

              {/* Difficulty */}
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
                <p className="text-xs text-slate-500 mt-3">
                  {difficulty === "easy"   && "~40 numbers shown — good for beginners"}
                  {difficulty === "medium" && "~32 numbers shown — balanced challenge"}
                  {difficulty === "hard"   && "~26 numbers shown — for experienced solvers"}
                </p>
              </div>

              {/* Book settings */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 space-y-4">
                <h2 className="text-lg font-bold text-amber-300">Book Settings</h2>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Number of puzzles
                    <span className="ml-2 text-xs text-slate-600">(no upper limit)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bookCount}
                    onChange={(e) => setBookCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Trim size</label>
                  <select
                    value={trimSize}
                    onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="6x9">6″ × 9″ (most popular)</option>
                    <option value="8.5x11">8.5″ × 11″ (large print)</option>
                    <option value="5x8">5″ × 8″ (compact)</option>
                  </select>
                </div>

                {/* Solution toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-bold text-slate-300">Include solution pages</p>
                    <p className="text-xs text-slate-500">Answer key appended after all puzzles</p>
                  </div>
                  <button
                    onClick={() => setIncludeSolutions(!includeSolutions)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      includeSolutions ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        includeSolutions ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Cover toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div>
                    <p className="text-sm font-bold text-slate-300">Include Cover Pages</p>
                    <p className="text-xs text-slate-500">Adds saved Front & Back cover to PDF</p>
                  </div>
                  <button
                    onClick={() => setIncludeCover(!includeCover)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      includeCover ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        includeCover ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 border border-slate-750"
              >
                {isGenerating ? "Generating..." : "Preview Single Puzzle"}
              </button>

              <DownloadButton
                onClick={handleDownloadPdf}
                label={
                  isDownloading
                    ? "Compiling PDF..."
                    : `Download ${bookCount} Puzzle${bookCount !== 1 ? "s" : ""} PDF`
                }
              />

              {/* Summary badge */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 text-xs text-slate-500 font-semibold">
                📄 PDF will contain <span className="text-amber-400 font-black">{bookCount}</span> puzzle page{bookCount !== 1 ? "s" : ""}
                {includeSolutions && (
                  <> + <span className="text-indigo-400 font-black">{bookCount}</span> solution page{bookCount !== 1 ? "s" : ""}</>
                )}
                {" "}= <span className="text-white font-black">{bookCount * (includeSolutions ? 2 : 1)}</span> total pages
              </div>

              <CoverStudioCTA trimSize={trimSize} />
            </div>

            {/* Preview panel */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-300">Live Preview — Puzzle</h2>
              {currentPuzzle ? (
                <SudokuPreview grid={currentPuzzle.puzzle} isSolution={false} />
              ) : (
                <div className="aspect-square flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl flex-1 min-h-[300px] flex-col gap-3">
                  <Grid3x3 className="w-10 h-10 text-slate-700" />
                  <span>Click "Preview Single Puzzle" to see a sample</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SOLUTION TAB ───────────────────────────────────────── */}
        {activeTab === "solution" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-indigo-300 mb-1">Solution Key Preview</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Preview the full answer grid for any generated puzzle. Solution pages are printed in indigo in the exported PDF.
                </p>
              </div>

              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate New Puzzle + Solution"}
              </button>

              {currentPuzzle && (
                <div className="bg-slate-950/40 border border-indigo-500/20 rounded-xl p-4 text-xs text-slate-400 space-y-1 font-semibold">
                  <p className="text-indigo-300 font-black uppercase tracking-wider text-[10px]">About this solution</p>
                  <p>✓ Mathematically unique — only one valid solution exists</p>
                  <p>✓ Generated with a backtracking constraint solver</p>
                  <p>✓ Indigo numbers in the PDF identify answer-key cells</p>
                </div>
              )}

              <div className="border-t border-slate-850 pt-4">
                <p className="text-xs text-slate-500 font-semibold mb-3">Solution pages in your PDF export:</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-bold">Include solution pages</span>
                  <button
                    onClick={() => setIncludeSolutions(!includeSolutions)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      includeSolutions ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        includeSolutions ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Solution grid preview */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-indigo-300">Solution Grid</h2>
              {currentPuzzle ? (
                <SudokuPreview grid={currentPuzzle.solution} isSolution={true} />
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-indigo-900/50 rounded-xl flex-1 min-h-[300px] gap-3">
                  <Eye className="w-10 h-10 text-indigo-900" />
                  <span>Generate a puzzle to see its solution</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── KDP GUIDE TAB ──────────────────────────────────────── */}
        {activeTab === "guide" && (
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-850 space-y-8 animate-fade-in text-slate-350 text-sm leading-relaxed font-semibold">

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> KDP Sudoku Trim Guidelines
              </h3>
              <p>When publishing puzzle books on Amazon KDP, layout sizes and spacing dictate your book rejection rate. Follow these standard specifications:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li><strong>8.5″ × 11″ (Large Print)</strong>: Best for senior citizens or younger children. Keeps grid squares large enough for comfortable writing.</li>
                <li><strong>6″ × 9″ (Standard Pocket)</strong>: Perfect for travel booklets and quick-solve challenge books. Highly popular.</li>
                <li><strong>5″ × 8″ (Compact)</strong>: Smaller purse/pocket size for on-the-go solvers.</li>
                <li><strong>Gutter Margin</strong>: Our Sudoku PDF generator leaves exactly 0.5″ of safety gutter so grids are not lost in the book fold.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Solution Page Strategy
              </h3>
              <p>Every professional Sudoku book includes an answer key. Ismam Studio automatically appends all solution pages <strong>after</strong> the puzzle pages — exactly how Amazon reviewers and readers expect to find them. Toggle this on/off in the book settings.</p>
              <p className="text-slate-400">For a 100-puzzle book with solutions, your final PDF will be <strong>200 pages</strong> — factor this into your spine width calculation in the Cover Studio.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Print Quality Specs
              </h3>
              <p>All exported PDFs are constructed as high-resolution <strong>vector graphics</strong>. This guarantees that puzzle lines, numbers, and grid boundaries remain perfectly sharp without pixelation during commercial printing.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> How to Launch Your Sudoku Book
              </h3>
              <ol className="list-decimal list-inside pl-4 space-y-2 text-slate-400 font-bold">
                <li>Configure difficulty, puzzle count, and trim size. Toggle solution pages on. Click <strong>Download PDF</strong>.</li>
                <li>Note the total page count displayed in the summary badge below the download button.</li>
                <li>Open the <strong>Ismam Studio Cover Canvas</strong>, insert your page count to auto-calculate spine width, then design your covers.</li>
                <li>Upload both files to Amazon KDP with niche keywords (e.g., "large print sudoku for seniors") and set your royalty price.</li>
              </ol>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}