"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateMaze, MazeGrid, Shape } from "@/lib/maze";
import { downloadMazePdf } from "@/lib/maze-pdf";
import DownloadButton from "@/components/DownloadButton";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import { Lock } from "lucide-react";
import { checkPremiumStatus } from "@/app/actions";

function MazePreview({ 
  grid, 
  start, 
  end 
}: { 
  grid: MazeGrid; 
  start: [number, number]; 
  end: [number, number]; 
}) {
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div 
      className="grid gap-0 bg-slate-900 p-4 rounded-xl border border-slate-800 max-w-md mx-auto w-full aspect-square justify-center items-center overflow-hidden"
      style={{
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          if (!cell.active) {
            return <div key={`${r}-${c}`} className="bg-transparent aspect-square" />;
          }

          const isStart = r === start[0] && c === start[1];
          const isEnd = r === end[0] && c === end[1];

          return (
            <div
              key={`${r}-${c}`}
              className={`aspect-square relative border border-slate-700/20 bg-slate-950 flex items-center justify-center text-[10px] font-black
                ${cell.walls.top ? "border-t-2 border-t-slate-400" : ""}
                ${cell.walls.bottom ? "border-b-2 border-b-slate-400" : ""}
                ${cell.walls.left ? "border-l-2 border-l-slate-400" : ""}
                ${cell.walls.right ? "border-r-2 border-r-slate-400" : ""}
              `}
            >
              {isStart && <span className="text-blue-500 animate-pulse">S</span>}
              {isEnd && <span className="text-red-500 animate-pulse">E</span>}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function MazeGeneratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generator" | "guide">("generator");
  const [shape, setShape] = useState<Shape>("square");
  const [gridSize, setGridSize] = useState<number>(15);
  const [bookCount, setBookCount] = useState<number>(5);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [includeCover, setIncludeCover] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  
  const [previewMaze, setPreviewMaze] = useState<{
    grid: MazeGrid;
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
        if (res.plan === "free") {
          setShape("square");
          setBookCount(5);
        } else if (res.plan === "starter") {
          setShape("square");
          setBookCount(20);
        } else {
          setShape("circle");
          setBookCount(50);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPremium();
  }, []);

  const maxMazes = premiumStatus.plan === "free" ? 5 : premiumStatus.plan === "starter" ? 20 : 500;

  const handleBookCountChange = (val: number) => {
    let count = Math.max(1, val);
    if (premiumStatus.checked && count > maxMazes) {
      count = maxMazes;
    }
    setBookCount(count);
  };

  const handlePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const maze = generateMaze({ rows: gridSize, cols: gridSize, shape });
        setPreviewMaze(maze);
      } catch (err) {
        console.error("Failed to generate preview:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  const handleDownloadPdf = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    isPremium?: boolean;
  }) => {
    setIsDownloading(true);
    const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, isPremium } = options;
    try {
      const mazes = Array.from({ length: bookCount }, () => 
        generateMaze({ rows: gridSize, cols: gridSize, shape })
      );

      await downloadMazePdf(
        {
          mazes,
          shape,
          trimSize: finalTrim,
          includeSolutions: incSol,
          title: `Premium ${shape.charAt(0).toUpperCase() + shape.slice(1)} Maze Book`,
          includeCover: incCover,
          coverState,
          isPremium,
        },
        `maze-${shape}-${bookCount}puzzles.pdf`
      );
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-slate-900 pb-6">
        <button
          onClick={() => router.push("/")}
          className="text-slate-400 hover:text-amber-500 text-sm mb-4 block transition-colors"
        >
          ← Back to Home
        </button>
        <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
          Labyrinth Book Designer
        </h1>
        <p className="text-slate-400 text-sm font-semibold">
          Generate print-ready shape-masked mazes (Square, Circle, Heart) perfect for Amazon KDP interiors.
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
          <span className="ml-1.5 bg-amber-500/20 text-amber-300 text-[9px] uppercase px-1.5 py-0.5 rounded-full">
            Specs
          </span>
        </button>
      </div>

      {activeTab === "generator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Controls Column */}
          <div className="space-y-6">
            {/* Shape Selector */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850">
              <h3 className="text-lg font-bold mb-4 text-amber-300">1. Select Maze Shape</h3>
              <div className="grid grid-cols-3 gap-3">
                {(["square", "circle", "heart"] as Shape[]).map((s) => {
                  const isLocked =
                    (s === "circle" || s === "heart") &&
                    (premiumStatus.plan === "free" || premiumStatus.plan === "starter");

                  return (
                    <button
                      key={s}
                      disabled={isLocked && premiumStatus.checked}
                      onClick={() => !isLocked && setShape(s)}
                      className={`relative py-3 rounded-xl font-semibold capitalize transition text-sm flex items-center justify-center gap-1.5 ${
                        shape === s
                          ? "bg-amber-500 text-slate-950 shadow-lg font-bold"
                          : isLocked
                          ? "bg-slate-900/40 text-slate-600 border border-slate-850/30 cursor-not-allowed"
                          : "bg-slate-800 text-slate-350 hover:bg-slate-700"
                      }`}
                    >
                      {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size & Book Specs */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 space-y-4">
              <h3 className="text-lg font-bold text-amber-300">2. Configuration settings</h3>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Grid Size / Complexity: <span className="text-white font-bold">{gridSize} x {gridSize}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={30}
                  step={1}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10 (Easy)</span>
                  <span>20 (Medium)</span>
                  <span>30 (Hard)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Number of Puzzles
                    <span className="ml-1 text-[10px] text-slate-500">
                      {premiumStatus.plan === "free" ? "(Max 5)" : premiumStatus.plan === "starter" ? "(Max 20)" : ""}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={maxMazes}
                    value={bookCount}
                    onChange={(e) => handleBookCountChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">KDP Trim Size</label>
                  <select
                    value={trimSize}
                    onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="6x9">6" x 9" (Standard)</option>
                    <option value="8.5x11">8.5" x 11" (Large Print)</option>
                    <option value="5x8">5" x 8" (Pocket)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="solutions"
                  checked={includeSolutions}
                  onChange={(e) => setIncludeSolutions(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="solutions" className="text-sm text-slate-350 cursor-pointer select-none font-bold">
                  Include 2x2 grid Solution Keys at the end of the book
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <input
                  type="checkbox"
                  id="cover"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="cover" className="text-sm text-slate-350 cursor-pointer select-none font-bold">
                  Include Cover Pages (Add Front & Back cover to PDF)
                </label>
              </div>
            </div>

            {/* Core Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-slate-850 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 border border-slate-750 shadow-md"
              >
                {isGenerating ? "Mapping Labyrinths..." : "Generate Preview Grid"}
              </button>

              <DownloadButton
                onClick={() => setIsExportModalOpen(true)}
                label={isDownloading ? "Assembling Book..." : "Download High-Res PDF"}
              />

              <CoverStudioCTA trimSize={trimSize} />
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between items-center min-h-[450px]">
            <div className="w-full border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-300">Live Architecture Canvas</h3>
            </div>
            
            {previewMaze ? (
              <div className="w-full flex-grow flex items-center justify-center">
                <MazePreview 
                  grid={previewMaze.grid} 
                  start={previewMaze.start} 
                  end={previewMaze.end} 
                />
              </div>
            ) : (
              <div className="w-full flex-grow flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
                <span className="text-4xl mb-3">🧭</span>
                Click "Generate Preview Grid" to visualize the structure before compile.
              </div>
            )}

            {previewMaze && (
              <p className="text-xs text-slate-500 mt-4 text-center">
                Blue marker <span className="text-blue-500 font-bold">S</span> indicates Entrance. Red marker <span className="text-red-500 font-bold">E</span> indicates Exit.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Maze Publishing Guide */
        <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-850 space-y-8 animate-fade-in text-slate-350 text-sm leading-relaxed font-semibold">
          
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Labyrinth Trim & Bleed Guidelines
            </h3>
            <p>
              Unlike standard text, maze paths often stretch close to page boundaries. Make sure to adhere to KDP margins:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
              <li>**Bleed Option**: If you select "Bleed" on KDP, your background design elements can touch the cut line. We recommend downloading your maze PDFs as **No Bleed** and positioning them inside standard margin zones.</li>
              <li>**Safe Zone Buffer**: Our generator positions grids automatically within the 0.5-inch printable safety area to avoid trimming hazards.</li>
              <li>**8.5" x 11" Large Print**: Strongly recommended for intricate maze shapes (Circle and Heart) to keep the lanes wide enough (min 0.15 inches) for standard pencils.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Solution Keys & Solutions Layout
            </h3>
            <p>
              Activity books with solution guides sell at a 40% higher conversion rate. Always select **"Include 2x2 grid Solution Keys"** to append small solution diagrams at the back. Amazon reviewers look for this to verify that the puzzle is indeed solvable.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Print-On-Demand compliance
            </h3>
            <p>
              All output files are vector PDFs, which use mathematical formulas rather than pixels to define borders. They will print at maximum DPI resolution on Amazon's cream or white paper options.
            </p>
          </section>

        </div>
      )}

      <ExportInteriorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTrimSize={trimSize}
        onExport={handleDownloadPdf}
      />
    </div>
  );
}
