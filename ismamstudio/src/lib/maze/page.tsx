"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateMaze, MazeGrid, Shape } from "@/lib/maze";
import { downloadMazePdf } from "@/lib/maze-pdf";
import DownloadButton from "@/components/DownloadButton"; // Adjusted to use clean alias

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
          if (!cell.isActive) {
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
  const [shape, setShape] = useState<Shape>("square");
  const [gridSize, setGridSize] = useState<number>(15);
  const [bookCount, setBookCount] = useState<number>(10);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  
  const [previewMaze, setPreviewMaze] = useState<{
    grid: MazeGrid;
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const maze = generateMaze(gridSize, gridSize, shape);
        setPreviewMaze(maze);
      } catch (err) {
        console.error("Failed to generate preview:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      try {
        const mazes = Array.from({ length: bookCount }, () => 
          generateMaze(gridSize, gridSize, shape)
        );

        downloadMazePdf(
          {
            mazes,
            shape,
            trimSize,
            includeSolutions,
            title: `Premium ${shape.charAt(0).toUpperCase() + shape.slice(1)} Maze Book`,
          },
          `maze-${shape}-${bookCount}puzzles.pdf`
        );
      } catch (err) {
        console.error("Failed to download PDF:", err);
      } finally {
        setIsDownloading(false);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
          Premium Maze Generator
        </h1>
        <p className="text-slate-400">
          Generate print-ready shape-masked mazes (Square, Circle, Heart) perfect for Amazon KDP interiors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Controls Column */}
        <div className="space-y-6">
          {/* Shape Selector */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4 text-amber-300">1. Select Maze Shape</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["square", "circle", "heart"] as Shape[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`py-3 rounded-xl font-semibold capitalize transition text-sm ${
                    shape === s
                      ? "bg-amber-500 text-slate-950 shadow-lg font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Book Specs */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
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
                <label className="block text-sm text-slate-400 mb-2">Number of Puzzles</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={bookCount}
                  onChange={(e) => setBookCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">KDP Trim Size</label>
                <select
                  value={trimSize}
                  onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
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
              <label htmlFor="solutions" className="text-sm text-slate-300 cursor-pointer select-none">
                Include 2x2 grid Solution Keys at the end of the book
              </label>
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 border border-slate-700 shadow-md"
            >
              {isGenerating ? "Mapping Labyrinths..." : "Generate Preview Grid"}
            </button>

            <DownloadButton
              onClick={handleDownloadPdf}
              label={isDownloading ? "Assembling Book..." : "Download High-Res PDF"}
            />
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between items-center min-h-[450px]">
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
    </div>
  );
}