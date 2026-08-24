"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import { generateMaze, solveMaze, Shape } from "../lib/maze";

export function MazeEditor({ page, updatePage }: any) {
  const [shape, setShape] = useState<Shape>(page.config.shape || "square");
  const [gridSize, setGridSize] = useState<number>(page.config.gridSize || 20);
  const [showSolution, setShowSolution] = useState<boolean>(page.config.showSolution || false);
  const [mazeData, setMazeData] = useState<any>(page.config.gridData || null);

  const handleGenerate = () => {
    // Keep rows & cols equal to gridSize
    const result = generateMaze({ rows: gridSize, cols: gridSize, shape });
    const solution = solveMaze(result.grid, result.start, result.end);
    const data = {
      grid: result.grid.map(row => row.map(cell => ({
        row: cell.row,
        col: cell.col,
        walls: { ...cell.walls },
        active: cell.active
      }))),
      start: result.start,
      end: result.end,
      solution
    };
    setMazeData(data);
    updatePage({ shape, gridSize, showSolution, gridData: data });
  };

  const toggleSolution = () => {
    const nextSol = !showSolution;
    setShowSolution(nextSol);
    if (mazeData) {
      updatePage({ shape, gridSize, showSolution: nextSol, gridData: mazeData });
    }
  };

  useEffect(() => {
    if (!mazeData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders the Maze as React SVG lines
  const renderMazeSVG = () => {
    if (!mazeData) return null;
    const cellSize = 16;
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    const lines: any[] = [];
    mazeData.grid.forEach((row: any[], r: number) => {
      row.forEach((cell: any, c: number) => {
        if (!cell.active) return;
        const x1 = c * cellSize;
        const y1 = r * cellSize;
        const x2 = x1 + cellSize;
        const y2 = y1 + cellSize;

        if (cell.walls.top) {
          lines.push(<line key={`t-${r}-${c}`} x1={x1} y1={y1} x2={x2} y2={y1} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />);
        }
        if (cell.walls.bottom) {
          lines.push(<line key={`b-${r}-${c}`} x1={x1} y1={y2} x2={x2} y2={y2} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />);
        }
        if (cell.walls.right) {
          lines.push(<line key={`r-${r}-${c}`} x1={x2} y1={y1} x2={x2} y2={y2} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />);
        }
        if (cell.walls.left) {
          lines.push(<line key={`l-${r}-${c}`} x1={x1} y1={y1} x2={x1} y2={y2} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />);
        }
      });
    });

    // Draw start and end indicators
    const startCell = mazeData.start;
    const endCell = mazeData.end;

    // Draw Solution Path
    const pathLines: any[] = [];
    if (showSolution && mazeData.solution && mazeData.solution.length > 0) {
      const path = mazeData.solution;
      let pathD = "";
      path.forEach(([r, c]: [number, number], i: number) => {
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;
        if (i === 0) {
          pathD += `M ${cx} ${cy - cellSize / 2} L ${cx} ${cy}`;
        } else {
          pathD += ` L ${cx} ${cy}`;
        }
        if (i === path.length - 1) {
          pathD += ` L ${cx} ${cy + cellSize / 2}`;
        }
      });
      pathLines.push(
        <path key="sol-path" d={pathD} stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      );
    }

    return (
      <svg id="maze-svg-element" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-2xl w-full mx-auto drop-shadow-md">
        <g>{lines}</g>
        <g>{pathLines}</g>
        {/* Start / End Labels */}
        <text x={startCell[1] * cellSize + cellSize/2} y={startCell[0] * cellSize - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563EB">START</text>
        <text x={endCell[1] * cellSize + cellSize/2} y={endCell[0] * cellSize + cellSize + 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#DC2626">EXIT</text>
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Editor Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Shape</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["square", "circle", "heart"] as Shape[]).map((sh) => (
                <button
                  key={sh}
                  onClick={() => {
                    setShape(sh);
                    // Persist immediately so a page-switch doesn't lose the change
                    updatePage({ shape: sh, gridSize, showSolution, gridData: mazeData || undefined });
                  }}
                  className={`py-2 rounded-lg font-bold text-xs capitalize transition ${
                    shape === sh
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Grid Size ({gridSize}x{gridSize})</h3>
            <input 
              type="range"
              min="10"
              max="30"
              step="2"
              value={gridSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                setGridSize(size);
                // Persist immediately so a page-switch doesn't lose the change
                updatePage({ shape, gridSize: size, showSolution, gridData: mazeData || undefined });
              }}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* 300 DPI Print-Ready Badge */}
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900">
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            300 DPI
          </span>
          <span>Print-Ready High-Res Maze (KDP Compliant)</span>
        </div>

        <button 
          onClick={toggleSolution} 
          className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
        >
          {showSolution ? (
            <>
              <EyeOff className="w-4 h-4"/> Hide Solution
            </>
          ) : (
            <>
              <Eye className="w-4 h-4"/> Show Solution
            </>
          )}
        </button>

        <button 
          onClick={() => {
            const svgEl = document.querySelector("#maze-svg-element");
            if (!svgEl) return alert("Generate a maze first!");
            const canvas = document.createElement("canvas");
            const size = 2550; // 8.5" @ 300 DPI
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, size, size);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgEl);
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);
            img.onload = () => {
              ctx.drawImage(img, 0, 0, size, size);
              URL.revokeObjectURL(url);
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = `maze-300dpi-${shape}-${gridSize}x${gridSize}.png`;
              a.click();
            };
            img.src = url;
          }}
          className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs"
        >
          📷 Download 300 DPI PNG
        </button>

        <button 
          onClick={handleGenerate} 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4"/> Generate Maze
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 lg:p-10 shadow-2xl border border-slate-200 min-h-[400px] lg:min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-slate-800">Maze Challenge</h1>
        
        {mazeData ? (
          <div className="w-full flex justify-center p-4 bg-white">
            {renderMazeSVG()}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load puzzle.</div>
        )}
      </div>
    </div>
  );
}
