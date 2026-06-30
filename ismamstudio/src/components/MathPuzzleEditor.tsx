"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import jsPDF from "jspdf";

// ==========================================
// 📄 PDF EXPORT LOGIC (1 Huge Block Per Page)
// ==========================================
const downloadMathPuzzlesPDF = (puzzleData: any, puzzleType: string) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();

  let title = "Math Puzzle";
  if (puzzleType === "addition") title = "Addition Equation Grid";
  else if (puzzleType === "multiplication") title = "Multiplication Table";
  else if (puzzleType === "number_fill") title = "Number Sums Puzzle";

  // --- PAGE 1: The Puzzle (Huge Block) ---
  let currentY = 40; // Push down slightly so it sits nicely in the middle of the page
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, currentY, { align: "center" });

  currentY += 25;
  drawSpecificPuzzle(pdf, puzzleData, puzzleType, false, currentY, pageWidth);

  // --- PAGE 2: The Solution (Huge Block) ---
  pdf.addPage(); // Force the solution to a completely new page

  currentY = 40;
  pdf.setFontSize(28);
  pdf.setTextColor(65, 105, 225); // Blue title for the solution
  pdf.text(`${title} (Solution Key)`, pageWidth / 2, currentY, { align: "center" });

  currentY += 25;
  drawSpecificPuzzle(pdf, puzzleData, puzzleType, true, currentY, pageWidth);

  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

// Route to the correct drawing function
const drawSpecificPuzzle = (pdf: any, puzzleData: any, type: string, isSolution: boolean, startY: number, pageWidth: number) => {
  if (type === "addition") {
    drawAdditionGridPDF(pdf, puzzleData, isSolution, startY, pageWidth);
  } else if (type === "multiplication") {
    drawMultiplicationTablePDF(pdf, puzzleData, isSolution, startY, pageWidth);
  } else if (type === "number_fill") {
    drawNumberFillGridPDF(pdf, puzzleData, isSolution, startY, pageWidth);
  }
};

// 1. Addition Grid (Huge Block)
const drawAdditionGridPDF = (pdf: any, puzzleData: any, isSolution: boolean, startY: number, pageWidth: number) => {
  const cellW = 35; // Massive cells
  const spacing = 15; // Plenty of space for the + and = signs
  const totalW = (cellW * 3) + (spacing * 2);
  const startX = (pageWidth - totalW) / 2; // Center horizontally perfectly

  pdf.setLineWidth(0.8);
  for (let idx = 0; idx < 9; idx++) {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    const xPos = startX + (c * (cellW + spacing));
    const yPos = startY + (r * (cellW + spacing));

    const isHidden = puzzleData.hiddenIndices.includes(idx) && !isSolution;
    const isAnswer = isSolution && puzzleData.hiddenIndices.includes(idx);
    const val = puzzleData.grid[idx];

    // Draw box
    pdf.setDrawColor(0, 0, 0);
    if (isHidden) {
      pdf.setLineDashPattern([3, 3], 0);
      pdf.setFillColor(255, 255, 255);
    } else {
      pdf.setLineDashPattern([], 0);
      pdf.setFillColor(isAnswer ? 240 : 255, isAnswer ? 245 : 255, isAnswer ? 255 : 255);
    }

    pdf.rect(xPos, yPos, cellW, cellW, "FD");
    pdf.setLineDashPattern([], 0);

    // Draw text inside box
    if (!isHidden) {
      pdf.setFontSize(28);
      pdf.setTextColor(isAnswer ? 65 : 0, isAnswer ? 105 : 0, isAnswer ? 225 : 0);
      pdf.text(String(val), xPos + (cellW / 2), yPos + (cellW / 2) + 3, { align: "center", baseline: "middle" });
    }

    // Draw Math Operators (+ and =)
    pdf.setFontSize(32);
    pdf.setTextColor(150, 150, 150);
    if (c < 2) {
      pdf.text(c === 0 ? "+" : "=", xPos + cellW + (spacing / 2), yPos + (cellW / 2) + 3, { align: "center", baseline: "middle" });
    }
    if (r < 2) {
      pdf.text(r === 0 ? "+" : "=", xPos + (cellW / 2), yPos + cellW + (spacing / 2), { align: "center", baseline: "middle" });
    }
  }
};

// 2. Multiplication Table (Huge Block)
const drawMultiplicationTablePDF = (pdf: any, puzzleData: any, isSolution: boolean, startY: number, pageWidth: number) => {
  const cellW = 30; // 30 * 5 = 150mm wide. This will take up almost the whole A4 width!
  const totalW = cellW * 5;
  const startX = (pageWidth - totalW) / 2;

  pdf.setLineWidth(0.8);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const xPos = startX + (c * cellW);
      const yPos = startY + (r * cellW);

      pdf.setDrawColor(0, 0, 0);
      pdf.setFillColor(255, 255, 255);
      if (r === 0 || c === 0) pdf.setFillColor(240, 240, 245);

      pdf.rect(xPos, yPos, cellW, cellW, "FD");

      let text = "";
      let isHidden = false;
      let isAnswer = false;

      if (r === 0 && c === 0) {
        text = "X";
      } else if (r === 0) {
        text = String(puzzleData.colFactors[c - 1]);
        isHidden = puzzleData.hiddenCols.includes(c - 1) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenCols.includes(c - 1);
      } else if (c === 0) {
        text = String(puzzleData.rowFactors[r - 1]);
        isHidden = puzzleData.hiddenRows.includes(r - 1) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenRows.includes(r - 1);
      } else {
        text = String(puzzleData.grid[r - 1][c - 1]);
        isHidden = puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1);
      }

      if (!isHidden) {
        pdf.setFontSize(28); // Giant font for the single page
        if (r === 0 && c === 0) pdf.setTextColor(65, 105, 225);
        else if (isAnswer) pdf.setTextColor(65, 105, 225);
        else pdf.setTextColor(0, 0, 0);

        pdf.text(text, xPos + (cellW / 2), yPos + (cellW / 2) + 3, { align: "center", baseline: "middle" });
      }
    }
  }
};

// 3. Number Fill Sums (Huge Block)
const drawNumberFillGridPDF = (pdf: any, puzzleData: any, isSolution: boolean, startY: number, pageWidth: number) => {
  const cellW = 30; // 30 * 5 = 150mm wide
  const totalW = cellW * 5;
  const startX = (pageWidth - totalW) / 2;

  pdf.setLineWidth(0.8);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 4 && c === 4) continue; // Bottom right corner remains empty

      const xPos = startX + (c * cellW);
      const yPos = startY + (r * cellW);
      const isSumHeader = r === 4 || c === 4;

      pdf.setDrawColor(0, 0, 0);
      if (isSumHeader) {
        pdf.setFillColor(240, 245, 255);
      } else {
        pdf.setFillColor(255, 255, 255);
      }

      pdf.rect(xPos, yPos, cellW, cellW, "FD");

      let text = "";
      let isHidden = false;
      let isAnswer = false;

      if (isSumHeader) {
        const sumVal = r === 4 ? puzzleData.colSums[c] : puzzleData.rowSums[r];
        text = String(sumVal);
      } else {
        const val = puzzleData.grid[r][c];
        isHidden = puzzleData.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c);
        text = String(val);
      }

      if (!isHidden) {
        pdf.setFontSize(28);
        if (isSumHeader) pdf.setTextColor(65, 105, 225);
        else if (isAnswer) pdf.setTextColor(65, 105, 225);
        else pdf.setTextColor(0, 0, 0);

        pdf.text(text, xPos + (cellW / 2), yPos + (cellW / 2) + 3, { align: "center", baseline: "middle" });
      }
    }
  }
};
// ==========================================


type PuzzleType = "addition" | "multiplication" | "number_fill";

// ==========================================
// ⚛️ REACT COMPONENT
// ==========================================
export function MathPuzzleEditor({ page, updatePage }: any) {
  const [puzzleType, setPuzzleType] = useState<PuzzleType>(
    page?.config?.puzzleType || "addition"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    page?.config?.difficulty || "easy"
  );
  const [puzzleData, setPuzzleData] = useState<any>(
    page?.config?.puzzleData || null
  );

  const isSolution = page?.config?.isSolution || false;

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

    const size = 5;
    const rowFactors: number[] = [];
    const colFactors: number[] = [];

    while (rowFactors.length < size - 1) {
      const val = Math.floor(Math.random() * (factorMax - factorMin + 1)) + factorMin;
      if (!rowFactors.includes(val)) rowFactors.push(val);
    }

    while (colFactors.length < size - 1) {
      const val = Math.floor(Math.random() * (factorMax - factorMin + 1)) + factorMin;
      if (!colFactors.includes(val)) colFactors.push(val);
    }

    const grid: number[][] = [];
    for (let r = 0; r < size - 1; r++) {
      grid[r] = [];
      for (let c = 0; c < size - 1; c++) {
        grid[r][c] = rowFactors[r] * colFactors[c];
      }
    }

    const hiddenRows: number[] = [];
    const hiddenCols: number[] = [];
    const hiddenProducts: Array<[number, number]> = [];

    const hideHeadersCount = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    while (hiddenRows.length < hideHeadersCount) {
      const idx = Math.floor(Math.random() * (size - 1));
      if (!hiddenRows.includes(idx)) hiddenRows.push(idx);
    }
    while (hiddenCols.length < hideHeadersCount) {
      const idx = Math.floor(Math.random() * (size - 1));
      if (!hiddenCols.includes(idx)) hiddenCols.push(idx);
    }

    const hideProductCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 11;
    while (hiddenProducts.length < hideProductCount) {
      const r = Math.floor(Math.random() * (size - 1));
      const c = Math.floor(Math.random() * (size - 1));
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
    if (updatePage) {
      updatePage({
        puzzleType,
        difficulty,
        puzzleData: result,
        isSolution
      });
    }
  };

  const handleToggleMode = (solMode: boolean) => {
    if (updatePage) {
      updatePage({
        puzzleType,
        difficulty,
        puzzleData,
        isSolution: solMode
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!puzzleData) return;
    downloadMathPuzzlesPDF(puzzleData, puzzleType);
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleType, difficulty]);

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-80 flex flex-col gap-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl shrink-0">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Page Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToggleMode(false)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${!isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              Puzzle
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${isSolution
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
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold capitalize transition border ${puzzleType === t
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
                className={`py-2 rounded-lg font-bold text-xs capitalize transition ${difficulty === d
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

        <button
          onClick={handleDownloadPDF}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 transition-all"
        >
          <Download className="w-4 h-4" /> Download as PDF
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center overflow-y-auto">
        <h1 className="text-4xl font-black text-center mb-2 uppercase tracking-widest text-slate-800">
          {puzzleType === "addition"
            ? "Addition Grid"
            : puzzleType === "multiplication"
              ? "Multiplication Table"
              : "Number Sums"}
          {isSolution && <span className="text-indigo-600"> (Solution)</span>}
        </h1>
        <p className="text-sm text-slate-400 uppercase tracking-widest mb-10 text-center max-w-sm">
          {puzzleType === "addition"
            ? "Fill in the blank boxes to make all equations correct."
            : puzzleType === "multiplication"
              ? "Fill in the missing factors and products."
              : "Complete the grid so rows/cols match the targets."}
        </p>

        {puzzleData ? (
          <div className="w-full max-w-3xl flex-1 flex flex-col justify-start items-center pt-4">

            {/* Addition Grid */}
            {puzzleType === "addition" && puzzleData.hiddenIndices && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 relative p-10 bg-slate-50/50 border border-slate-200 rounded-3xl">
                {puzzleData.grid.map((val: number, idx: number) => {
                  const r = Math.floor(idx / 3);
                  const c = idx % 3;
                  const isHidden = puzzleData.hiddenIndices.includes(idx) && !isSolution;
                  const isAnswer = isSolution && puzzleData.hiddenIndices.includes(idx);

                  return (
                    <div key={idx} className="relative flex items-center justify-center">
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl font-black border-2 shadow-sm transition-all
                          ${isHidden
                            ? "bg-white border-dashed border-slate-300 text-transparent"
                            : isAnswer
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                              : "bg-white border-slate-800 text-slate-800"
                          }
                        `}
                      >
                        {!isHidden ? val : ""}
                      </div>

                      {c < 2 && (
                        <span className="absolute -right-8 text-3xl font-extrabold text-slate-400">
                          {c === 0 ? "+" : "="}
                        </span>
                      )}
                      {r < 2 && (
                        <span className="absolute -bottom-9 text-3xl font-extrabold text-slate-400">
                          {r === 0 ? "+" : "="}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multiplication Grid */}
            {puzzleType === "multiplication" && puzzleData.colFactors && (
              <div className="grid grid-cols-5 gap-2 md:gap-3 border-4 border-slate-900 bg-white p-3 md:p-5 rounded-3xl shadow-xl w-full">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => {
                    const isHeader = r === 0 || c === 0;

                    if (r === 0 && c === 0) {
                      return (
                        <div key="0-0" className="aspect-square w-full flex items-center justify-center font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-2xl md:text-4xl">
                          ×
                        </div>
                      );
                    }

                    let displayedVal = "";
                    let isHidden = false;
                    let isAnswer = false;

                    if (r === 0) {
                      const val = puzzleData.colFactors[c - 1];
                      isHidden = puzzleData.hiddenCols.includes(c - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenCols.includes(c - 1);
                      displayedVal = String(val);
                    } else if (c === 0) {
                      const val = puzzleData.rowFactors[r - 1];
                      isHidden = puzzleData.hiddenRows.includes(r - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenRows.includes(r - 1);
                      displayedVal = String(val);
                    } else {
                      const val = puzzleData.grid[r - 1][c - 1];
                      isHidden = puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1) && !isSolution;
                      isAnswer = isSolution && puzzleData.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1);
                      displayedVal = String(val);
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`aspect-square w-full flex items-center justify-center text-2xl md:text-4xl font-bold border-2 rounded-2xl transition-all duration-300
                          ${isHeader
                            ? "bg-slate-100 border-slate-200 text-slate-800 font-extrabold"
                            : "border-slate-200"
                          }
                          ${isHidden
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
            {puzzleType === "number_fill" && puzzleData.hiddenCells && (
              <div className="grid grid-cols-5 gap-2 md:gap-3 border-4 border-slate-900 bg-white p-3 md:p-5 rounded-3xl shadow-xl w-full">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => {
                    const isSumHeader = r === 4 || c === 4;

                    if (r === 4 && c === 4) {
                      return <div key="corner" className="aspect-square w-full bg-transparent" />;
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
                        className={`aspect-square w-full flex items-center justify-center text-xl md:text-3xl font-bold border-2 rounded-2xl transition-all duration-300
                          ${isSumHeader
                            ? "bg-indigo-50 border-indigo-100 text-indigo-700 font-black"
                            : "border-slate-200"
                          }
                          ${isHidden
                            ? "bg-slate-50 border-dashed border-slate-300 text-transparent"
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