"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, RefreshCw, AlertCircle, FileText, CheckCircle2, Sliders, Settings, BookOpen
} from "lucide-react";
import { jsPDF } from "jspdf";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import { drawCoverPagePart, drawWatermark } from "@/app/utils/pdfExportService";
import { checkPremiumStatus } from "@/app/actions";

const TRIM_SIZES = [
  { id: "6x9", label: "6\" x 9\" (Novel)", w: 6, h: 9 },
  { id: "8.5x11", label: "8.5\" x 11\" (Large Print)", w: 8.5, h: 11 },
  { id: "5x8", label: "5\" x 8\" (Compact)", w: 5, h: 8 }
];

type PuzzleType = "addition" | "multiplication" | "number_fill";

interface AdditionPuzzle {
  grid: number[]; // 9 values: 
  // [A, B, C] -> A + B = C
  // [D, E, F] -> D + E = F
  // [G, H, I] -> G + H = I (sums of cols & total)
  hiddenIndices: number[];
}

interface MultiplicationPuzzle {
  rowFactors: number[];
  colFactors: number[];
  grid: number[][]; // products
  hiddenRows: number[];
  hiddenCols: number[];
  hiddenProducts: Array<[number, number]>;
}

interface NumberFillPuzzle {
  grid: number[][]; // 4x4 grid
  rowSums: number[];
  colSums: number[];
  hiddenCells: Array<[number, number]>;
}

export default function MathPuzzleGenerator() {
  const router = useRouter();

  // Settings
  const [puzzleType, setPuzzleType] = useState<PuzzleType>("addition");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [numPages, setNumPages] = useState<number>(3);
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch (err) {
        console.error(err);
      }
    }
    loadPremium();
  }, []);
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [includeCover, setIncludeCover] = useState<boolean>(false);

  // Puzzle lists states
  const [additionPuzzles, setAdditionPuzzles] = useState<AdditionPuzzle[]>([]);
  const [multiplicationPuzzles, setMultiplicationPuzzles] = useState<MultiplicationPuzzle[]>([]);
  const [numberFillPuzzles, setNumberFillPuzzles] = useState<NumberFillPuzzle[]>([]);

  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Generate Addition Equation Systems
  const generateAdditionPuzzles = () => {
    const list: AdditionPuzzle[] = [];
    const minVal = difficulty === "easy" ? 1 : difficulty === "medium" ? 5 : 10;
    const maxVal = difficulty === "easy" ? 9 : difficulty === "medium" ? 20 : 50;

    for (let p = 0; p < numPages; p++) {
      const a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      const b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      const d = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      const e = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

      const c = a + b;
      const f = d + e;
      const g = a + d;
      const h = b + e;
      const i = c + f; // mathematically (a+b) + (d+e) === (a+d) + (b+e)

      const grid = [a, b, c, d, e, f, g, h, i];

      // Hide indexes based on difficulty: 
      // easy: hide 3 cells, medium: hide 5, hard: hide 7
      const hideCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
      const hiddenIndices: number[] = [];
      while (hiddenIndices.length < hideCount) {
        const idx = Math.floor(Math.random() * 9);
        if (!hiddenIndices.includes(idx)) {
          hiddenIndices.push(idx);
        }
      }

      list.push({ grid, hiddenIndices });
    }
    setAdditionPuzzles(list);
  };

  // Generate Multiplication Times Tables
  const generateMultiplicationPuzzles = () => {
    const list: MultiplicationPuzzle[] = [];
    const size = 4; // factor size: 1-9 for times tables

    for (let p = 0; p < numPages; p++) {
      const rowFactors = Array.from({ length: size }, () => Math.floor(Math.random() * 9) + 1);
      const colFactors = Array.from({ length: size }, () => Math.floor(Math.random() * 9) + 1);

      const grid: number[][] = [];
      for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
          grid[r][c] = rowFactors[r] * colFactors[c];
        }
      }

      // Hiding factors & products based on difficulty
      // easy: hide 2 row factors, 2 col factors, 4 products
      // medium: hide 3 row factors, 3 col factors, 6 products
      // hard: hide allfactors (4 row, 4 col), 8 products
      const rHide = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
      const cHide = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
      const pHide = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;

      const hiddenRows: number[] = [];
      while (hiddenRows.length < rHide) {
        const idx = Math.floor(Math.random() * size);
        if (!hiddenRows.includes(idx)) hiddenRows.push(idx);
      }

      const hiddenCols: number[] = [];
      while (hiddenCols.length < cHide) {
        const idx = Math.floor(Math.random() * size);
        if (!hiddenCols.includes(idx)) hiddenCols.push(idx);
      }

      const hiddenProducts: Array<[number, number]> = [];
      while (hiddenProducts.length < pHide) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (!hiddenProducts.some(cell => cell[0] === r && cell[1] === c)) {
          hiddenProducts.push([r, c]);
        }
      }

      list.push({ rowFactors, colFactors, grid, hiddenRows, hiddenCols, hiddenProducts });
    }
    setMultiplicationPuzzles(list);
  };

  // Generate Number Sum Fill-in Grids
  const generateNumberFillPuzzles = () => {
    const list: NumberFillPuzzle[] = [];
    const size = 4;

    for (let p = 0; p < numPages; p++) {
      const grid: number[][] = [];
      const rowSums = Array(size).fill(0);
      const colSums = Array(size).fill(0);

      // Create valid 4x4 matrix
      for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
          const val = Math.floor(Math.random() * 9) + 1; // 1-9
          grid[r][c] = val;
          rowSums[r] += val;
          colSums[c] += val;
        }
      }

      // Hiding cells based on difficulty
      // easy: hide 4 cells, medium: hide 8, hard: hide 12
      const hideCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 12;
      const hiddenCells: Array<[number, number]> = [];
      while (hiddenCells.length < hideCount) {
        const r = Math.floor(Math.random() * 4);
        const c = Math.floor(Math.random() * 4);
        if (!hiddenCells.some(cell => cell[0] === r && cell[1] === c)) {
          hiddenCells.push([r, c]);
        }
      }

      list.push({ grid, rowSums, colSums, hiddenCells });
    }
    setNumberFillPuzzles(list);
  };

  // Trigger generators
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (puzzleType === "addition") {
        generateAdditionPuzzles();
      } else if (puzzleType === "multiplication") {
        generateMultiplicationPuzzles();
      } else if (puzzleType === "number_fill") {
        generateNumberFillPuzzles();
      }
      setActivePreviewIndex(0);
      setIsGenerating(false);
    }, 50);
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleType, difficulty, numPages]);

  // Export PDF function
  const handleExportPDF = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
    isPremium?: boolean;
  }) => {
    setIsDownloading(true);
    const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, hasBleed: finalBleed, showGuides: finalGuides, isPremium } = options;

    setTimeout(async () => {
      let finalW = 8.5;
      let finalH = 11;
      if (finalTrim === "6x9") {
        finalW = 6;
        finalH = 9;
      } else if (finalTrim === "5x8") {
        finalW = 5;
        finalH = 8;
      }

      const bleed = 0.125;
      const pageW = finalBleed ? finalW + bleed * 2 : finalW;
      const pageH = finalBleed ? finalH + bleed * 2 : finalH;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [pageW, pageH]
      });

      const marginL = 0.75;
      const marginR = 0.5;
      const marginT = 0.75;
      const marginB = 0.75;

      const contentW = pageW - marginL - marginR;
      const contentH = pageH - marginT - marginB;

      // 1. Draw Front Cover if integrated
      let firstPageAdded = false;
      if (incCover && coverState) {
        await drawCoverPagePart(doc, coverState, 'front', pageW, pageH);
        firstPageAdded = true;
      }

      // 1. Draw Puzzle Pages
      for (let pIdx = 0; pIdx < numPages; pIdx++) {
        if (firstPageAdded || pIdx > 0) doc.addPage();
        firstPageAdded = true;

        // Title Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        const titleStr = puzzleType === "addition" ? "Addition Grid" : puzzleType === "multiplication" ? "Multiplication Grid" : "Number Sums Grid";
        doc.text(`${titleStr} #${pIdx + 1}`, marginL + contentW / 2, marginT + 0.3, { align: "center" });

        // Instruction subtitle
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const instruction = puzzleType === "addition" 
          ? "Fill in the blanks to make all horizontal and vertical equations correct."
          : puzzleType === "multiplication"
          ? "Fill in the missing factors on the headers and products inside the times table grid."
          : "Fill in the grid so that each row and column sums up to the target numbers shown.";
        doc.text(instruction, marginL + contentW / 2, marginT + 0.6, { align: "center" });

        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 0.8, marginL + contentW, marginT + 0.8);

        // Render selected math puzzle structure
        if (puzzleType === "addition" && additionPuzzles[pIdx]) {
          drawPdfAddition(doc, additionPuzzles[pIdx], marginL, marginT + 1.6, contentW);
        } else if (puzzleType === "multiplication" && multiplicationPuzzles[pIdx]) {
          drawPdfMultiplication(doc, multiplicationPuzzles[pIdx], marginL, marginT + 1.4, contentW);
        } else if (puzzleType === "number_fill" && numberFillPuzzles[pIdx]) {
          drawPdfNumberFill(doc, numberFillPuzzles[pIdx], marginL, marginT + 1.4, contentW);
        }

        // Footer page numbers
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${pIdx + 1}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      }

      // 2. Draw Answer Keys
      if (incSol) {
        doc.addPage();
        const ansPageIdx = numPages + 1;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("Answer Key", marginL + contentW / 2, marginT + 0.3, { align: "center" });
        doc.line(marginL, marginT + 0.6, marginL + contentW, marginT + 0.6);

        // Print answer grids 2 per page
        const gridH = 4.2;

        for (let pIdx = 0; pIdx < numPages; pIdx++) {
          const row = pIdx % 2;
          
          if (pIdx > 0 && row === 0) {
            doc.addPage();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text("Answer Key (Cont.)", marginL + contentW / 2, marginT + 0.3, { align: "center" });
            doc.line(marginL, marginT + 0.6, marginL + contentW, marginT + 0.6);
          }

          const startY = marginT + 1.2 + row * gridH;

          // Mini Puzzle Label
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(`Puzzle #${pIdx + 1} Answers`, marginL, startY);

          if (puzzleType === "addition" && additionPuzzles[pIdx]) {
            drawPdfAddition(doc, additionPuzzles[pIdx], marginL + 0.5, startY + 0.4, contentW - 1.0, true);
          } else if (puzzleType === "multiplication" && multiplicationPuzzles[pIdx]) {
            drawPdfMultiplication(doc, multiplicationPuzzles[pIdx], marginL + 0.5, startY + 0.4, contentW - 1.0, true);
          } else if (puzzleType === "number_fill" && numberFillPuzzles[pIdx]) {
            drawPdfNumberFill(doc, numberFillPuzzles[pIdx], marginL + 0.5, startY + 0.4, contentW - 1.0, true);
          }
        }

        // Footer page numbering for Answer page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${ansPageIdx}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      }

      // 3. Draw Back Cover if integrated
      if (incCover && coverState) {
        doc.addPage();
        await drawCoverPagePart(doc, coverState, 'back', pageW, pageH);
      }

      // Apply watermark to all interior pages if not premium
      if (isPremium === false) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          const isFrontCover = incCover && coverState && i === 1;
          const isBackCover = incCover && coverState && i === totalPages;
          if (!isFrontCover && !isBackCover) {
            doc.setPage(i);
            drawWatermark(doc, pageW, pageH);
          }
        }
      }

      doc.save(`math-puzzle-${puzzleType}-${numPages}pages.pdf`);
      setIsDownloading(false);
    }, 50);
  };

  // Helper adding addition PDF Grid
  const drawPdfAddition = (doc: any, puzzle: AdditionPuzzle, x: number, y: number, width: number, showAll = false) => {
    // 3x3 math cells. We draw them with boxes.
    const size = 3;
    const boxW = 0.55;
    const boxH = 0.55;
    const cellSpacing = 0.45;
    
    const startX = x + (width - (size * boxW + (size - 1) * cellSpacing)) / 2;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = r * 3 + c;
        const cx = startX + c * (boxW + cellSpacing);
        const cy = y + r * (boxH + cellSpacing);

        // Draw outer borders
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.015);
        doc.rect(cx, cy, boxW, boxH);

        const val = puzzle.grid[idx];
        const isHidden = puzzle.hiddenIndices.includes(idx) && !showAll;

        if (!isHidden) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(30, 41, 59);
          if (puzzle.hiddenIndices.includes(idx) && showAll) {
            doc.setTextColor(79, 70, 229); // answers in color
          }
          doc.text(val.toString(), cx + boxW / 2, cy + boxH / 2 + 0.06, { align: "center" });
        }

        // Draw inline Math operators (plus signs, equal signs)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(100, 116, 139);

        // Horizontal Plus
        if (c < size - 1) {
          const operatorChar = c === 1 ? "=" : "+";
          doc.text(operatorChar, cx + boxW + cellSpacing / 2, cy + boxH / 2 + 0.05, { align: "center" });
        }

        // Vertical Plus
        if (r < size - 1) {
          const operatorChar = r === 1 ? "=" : "+";
          doc.text(operatorChar, cx + boxW / 2, cy + boxH + cellSpacing / 2 + 0.05, { align: "center" });
        }
      }
    }
  };

  // Helper multiplication PDF Grid
  const drawPdfMultiplication = (doc: any, puzzle: MultiplicationPuzzle, x: number, y: number, width: number, showAll = false) => {
    const size = 5; // 4x4 + 1 header column/row
    const cellW = 0.55;
    const cellH = 0.55;
    
    const startX = x + (width - size * cellW) / 2;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = y + r * cellH;

        // Header cells vs normal cells
        const isHeader = r === 0 || c === 0;
        
        if (isHeader) {
          doc.setFillColor(241, 245, 249); // slate-100
          doc.rect(cx, cy, cellW, cellH, "FD");
        } else {
          doc.rect(cx, cy, cellW, cellH);
        }

        // Write cell values
        if (r === 0 && c === 0) {
          // Top left corner math icon multiplier sign
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(79, 70, 229);
          doc.text("x", cx + cellW / 2, cy + cellH / 2 + 0.05, { align: "center" });
        } 
        else if (r === 0) {
          // Column Headers
          const val = puzzle.colFactors[c - 1];
          const isHidden = puzzle.hiddenCols.includes(c - 1) && !showAll;
          if (!isHidden) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            if (puzzle.hiddenCols.includes(c - 1) && showAll) doc.setTextColor(79, 70, 229);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } 
        else if (c === 0) {
          // Row Headers
          const val = puzzle.rowFactors[r - 1];
          const isHidden = puzzle.hiddenRows.includes(r - 1) && !showAll;
          if (!isHidden) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            if (puzzle.hiddenRows.includes(r - 1) && showAll) doc.setTextColor(79, 70, 229);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } 
        else {
          // Products inside the table
          const val = puzzle.grid[r - 1][c - 1];
          const isHidden = puzzle.hiddenProducts.some(p => p[0] === r - 1 && p[1] === c - 1) && !showAll;
          
          if (!isHidden) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            if (puzzle.hiddenProducts.some(p => p[0] === r - 1 && p[1] === c - 1) && showAll) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(79, 70, 229);
            }
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  };

  // Helper Number Fill sums grid PDF
  const drawPdfNumberFill = (doc: any, puzzle: NumberFillPuzzle, x: number, y: number, width: number, showAll = false) => {
    const size = 5; // 4x4 cells + 1 summary column/row for sums
    const cellW = 0.55;
    const cellH = 0.55;
    
    const startX = x + (width - size * cellW) / 2;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = y + r * cellH;

        // Sum headers are the last column & last row
        const isSumHeader = r === 4 || c === 4;

        if (r === 4 && c === 4) {
          // Empty bottom-right grid cell corner
          continue;
        }

        if (isSumHeader) {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(148, 163, 184); // lighter borders for sums
          doc.rect(cx, cy, cellW, cellH, "FD");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          const sumVal = r === 4 ? puzzle.colSums[c] : puzzle.rowSums[r];
          doc.text(sumVal.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
        } else {
          doc.setDrawColor(30, 41, 59);
          doc.rect(cx, cy, cellW, cellH);

          const val = puzzle.grid[r][c];
          const isHidden = puzzle.hiddenCells.some(cell => cell[0] === r && cell[1] === c) && !showAll;

          if (!isHidden) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            if (puzzle.hiddenCells.some(cell => cell[0] === r && cell[1] === c) && showAll) {
              doc.setTextColor(79, 70, 229);
            }
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 animate-in fade-in duration-500" style={{ boxShadow: "var(--shadow-soft-lg)" }}>

      {/* 🔮 Options sidebar panel */}
      <div className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => router.push("/studio")} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4"/> Back
          </button>
          <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Sliders className="w-3.5 h-3.5"/> Math
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Puzzle types selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Puzzle Type</label>
            <div className="space-y-2">
              <button
                onClick={() => setPuzzleType("addition")}
                className={`w-full p-3 rounded-2xl text-xs font-black text-left transition-all duration-200 ${
                  puzzleType === "addition" ? "bg-amber-500 text-slate-950 shadow" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                1. Addition Equation Grid
              </button>
              <button
                onClick={() => setPuzzleType("multiplication")}
                className={`w-full p-3 rounded-2xl text-xs font-black text-left transition-all duration-200 ${
                  puzzleType === "multiplication" ? "bg-amber-500 text-slate-950 shadow" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                2. Multiplication Times Table
              </button>
              <button
                onClick={() => setPuzzleType("number_fill")}
                className={`w-full p-3 rounded-2xl text-xs font-black text-left transition-all duration-200 ${
                  puzzleType === "number_fill" ? "bg-amber-500 text-slate-950 shadow" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                3. Number Sums Grid (Kakuro-lite)
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Difficulty Modes */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-1 rounded-2xl text-xs font-black capitalize transition-all duration-200 ${
                    difficulty === d
                      ? "bg-amber-500 text-slate-950 shadow-lg"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              {difficulty === "easy" && "✓ Single digit integers (1-9). Good for youngsters."}
              {difficulty === "medium" && "✓ Values up to 20. Balanced number of hidden cells."}
              {difficulty === "hard" && "✓ Values up to 50. Most grid slots are blank."}
            </p>
          </div>

          {/* Page Sizing */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Book Trim Size</label>
              <select
                value={trimSize.id}
                onChange={(e) => {
                  const size = TRIM_SIZES.find(s => s.id === e.target.value);
                  if (size) setTrimSize(size);
                }}
                className="w-full text-xs font-bold bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-colors duration-200"
              >
                {TRIM_SIZES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex justify-between mb-1.5">
                <span>Number of Pages</span>
                <span className="text-amber-400 font-bold">
                  {premiumStatus.isPremium ? "Premium: Unlimited (Max 1000)" : "Free Limit: 3"}
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={premiumStatus.isPremium ? 1000 : 3}
                value={numPages}
                onChange={(e) => {
                  let val = Math.max(1, parseInt(e.target.value) || 1);
                  const maxLimit = premiumStatus.isPremium ? 1000 : 3;
                  if (val > maxLimit) val = maxLimit;
                  setNumPages(val);
                }}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-amber-400 focus:border-indigo-500 outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Document settings */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">Document Settings</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Answer Key Page
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Cover Pages (Add Front & Back cover)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Bleed (+0.125" KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>

        </div>

        {/* Action Panel buttons */}
        <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-premium w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 normal-case"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : "Regenerate Grid"}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isDownloading}
            className="btn-premium w-full bg-amber-500 hover:bg-amber-600 text-slate-950 normal-case hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 24px rgba(245, 158, 11, 0.18)" }}
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Download Print PDF
          </button>

          <CoverStudioCTA trimSize={trimSize.id} />
        </div>
      </div>

      {/* 🎨 Preview Workspace */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 flex flex-col overflow-hidden transition-colors duration-300">

        {/* Pagination bar */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Preview:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
              {Array.from({ length: numPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    activePreviewIndex === idx ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  P#{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Trim Size: {trimSize.label}
          </div>
        </div>

        {/* Canvas view desk */}
        <div className="flex-1 p-10 overflow-y-auto flex items-center justify-center relative bg-slate-100/60 dark:bg-slate-950/40 transition-colors duration-300">

          {((puzzleType === "addition" && additionPuzzles.length > 0) ||
            (puzzleType === "multiplication" && multiplicationPuzzles.length > 0) ||
            (puzzleType === "number_fill" && numberFillPuzzles.length > 0)) ? (

            <div
              className="relative bg-white rounded-2xl border border-slate-200/80 flex flex-col p-12 overflow-hidden cursor-default transition-all duration-300"
              style={{
                boxShadow: "var(--shadow-soft-lg)",
                width: "480px", // proportional scaling for viewing
                height: `${480 * (trimSize.h / trimSize.w)}px`,
                paddingTop: "40px",
                paddingBottom: "40px",
                paddingLeft: "45px",
                paddingRight: "30px"
              }}
            >
              {showGuides && (
                <>
                  <div className="absolute top-0 bottom-0 left-0 border-r border-dashed border-rose-400/40 pointer-events-none" style={{ width: "45px" }} />
                  <div className="absolute top-0 bottom-0 right-0 border-l border-dashed border-rose-400/40 pointer-events-none" style={{ width: "30px" }} />
                  <div className="absolute left-0 right-0 top-0 border-b border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <span className="absolute bottom-1 right-2 text-[8px] font-black text-rose-500 opacity-60">SAFE PRINT AREA</span>
                </>
              )}

              {/* Grid content box */}
              <div className="flex flex-col h-full justify-between">
                
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                    {puzzleType === "addition" ? "Addition Equations" : puzzleType === "multiplication" ? "Multiplication Table" : "Number Sums Grid"}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Puzzle #{activePreviewIndex + 1} Preview
                  </p>
                  <div className="h-px bg-slate-100 my-3" />
                </div>

                {/* Draw Puzzle grid structures */}
                <div className="flex-1 flex items-center justify-center py-4">
                  
                  {/* addition preview grid */}
                  {puzzleType === "addition" && additionPuzzles[activePreviewIndex] && (
                    <div className="grid grid-cols-5 gap-y-3 gap-x-2 items-center text-center justify-center font-bold text-sm max-w-[280px]">
                      {(() => {
                        const puzzle = additionPuzzles[activePreviewIndex];
                        return (
                          <>
                            {/* row 1 */}
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(0) ? "" : puzzle.grid[0]}
                            </div>
                            <div className="text-slate-400">+</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(1) ? "" : puzzle.grid[1]}
                            </div>
                            <div className="text-slate-400">=</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(2) ? "" : puzzle.grid[2]}
                            </div>

                            {/* signs row 1 */}
                            <div className="text-slate-400 text-center">+</div>
                            <div className="text-slate-400"/>
                            <div className="text-slate-400 text-center">+</div>
                            <div className="text-slate-400"/>
                            <div className="text-slate-400 text-center">+</div>

                            {/* row 2 */}
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(3) ? "" : puzzle.grid[3]}
                            </div>
                            <div className="text-slate-400">+</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(4) ? "" : puzzle.grid[4]}
                            </div>
                            <div className="text-slate-400">=</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(5) ? "" : puzzle.grid[5]}
                            </div>

                            {/* signs row 2 */}
                            <div className="text-slate-400 text-center">=</div>
                            <div className="text-slate-400"/>
                            <div className="text-slate-400 text-center">=</div>
                            <div className="text-slate-400"/>
                            <div className="text-slate-400 text-center">=</div>

                            {/* row 3 */}
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(6) ? "" : puzzle.grid[6]}
                            </div>
                            <div className="text-slate-400">+</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(7) ? "" : puzzle.grid[7]}
                            </div>
                            <div className="text-slate-400">=</div>
                            <div className="interactive-cell w-10 h-10 border-2 border-slate-700 bg-slate-50 rounded-md flex items-center justify-center text-xs">
                              {puzzle.hiddenIndices.includes(8) ? "" : puzzle.grid[8]}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* multiplication preview grid */}
                  {puzzleType === "multiplication" && multiplicationPuzzles[activePreviewIndex] && (
                    <div className="grid grid-cols-5 gap-[2px] bg-slate-200 border-2 border-slate-700">
                      {(() => {
                        const puzzle = multiplicationPuzzles[activePreviewIndex];
                        const cells = [];
                        for (let r = 0; r < 5; r++) {
                          for (let c = 0; c < 5; c++) {
                            const isHeader = r === 0 || c === 0;
                            let valStr = "";
                            let isAnswerColor = false;

                            if (r === 0 && c === 0) {
                              valStr = "×";
                            } else if (r === 0) {
                              const val = puzzle.colFactors[c - 1];
                              const isHidden = puzzle.hiddenCols.includes(c - 1);
                              valStr = isHidden ? "" : val.toString();
                            } else if (c === 0) {
                              const val = puzzle.rowFactors[r - 1];
                              const isHidden = puzzle.hiddenRows.includes(r - 1);
                              valStr = isHidden ? "" : val.toString();
                            } else {
                              const val = puzzle.grid[r - 1][c - 1];
                              const isHidden = puzzle.hiddenProducts.some(p => p[0] === r - 1 && p[1] === c - 1);
                              valStr = isHidden ? "" : val.toString();
                            }

                            cells.push(
                              <div 
                                key={`${r}-${c}`}
                                className={`interactive-cell w-[36px] h-[36px] flex items-center justify-center text-[10px] font-black
                                  ${isHeader ? "bg-slate-100 text-slate-800" : "bg-white text-slate-700"}
                                `}
                              >
                                {valStr}
                              </div>
                            );
                          }
                        }
                        return cells;
                      })()}
                    </div>
                  )}

                  {/* number fill sums preview grid */}
                  {puzzleType === "number_fill" && numberFillPuzzles[activePreviewIndex] && (
                    <div className="grid grid-cols-5 gap-[2px] bg-slate-200 border-2 border-slate-700">
                      {(() => {
                        const puzzle = numberFillPuzzles[activePreviewIndex];
                        const cells = [];
                        for (let r = 0; r < 5; r++) {
                          for (let c = 0; c < 5; c++) {
                            const isSumHeader = r === 4 || c === 4;
                            let valStr = "";
                            let cellBg = "bg-white text-slate-900";

                            if (r === 4 && c === 4) {
                              cellBg = "bg-slate-100";
                            } else if (isSumHeader) {
                              const sumVal = r === 4 ? puzzle.colSums[c] : puzzle.rowSums[r];
                              valStr = sumVal.toString();
                              cellBg = "bg-indigo-50/70 text-indigo-700 font-black";
                            } else {
                              const val = puzzle.grid[r][c];
                              const isHidden = puzzle.hiddenCells.some(cell => cell[0] === r && cell[1] === c);
                              valStr = isHidden ? "" : val.toString();
                            }

                            cells.push(
                              <div 
                                key={`${r}-${c}`}
                                className={`interactive-cell w-[36px] h-[36px] flex items-center justify-center text-[10px] font-bold ${cellBg}`}
                              >
                                {valStr}
                              </div>
                            );
                          }
                        }
                        return cells;
                      })()}
                    </div>
                  )}

                </div>

                <div className="text-center text-[9px] text-slate-300 font-bold tracking-widest pt-2 border-t border-slate-100">
                  PAGE PREVIEW ONLY
                </div>

              </div>

            </div>
          ) : (
            <div className="surface-card flex flex-col items-center justify-center p-12 max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-black text-slate-700 dark:text-slate-200 text-lg mb-1">No puzzle generated</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold leading-relaxed">
                Configure options on the left and click "Regenerate Grid".
              </p>
            </div>
          )}

        </div>

      </div>

      <ExportInteriorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTrimSize="8.5x11"
        onExport={handleExportPDF}
      />
    </div>
  );
}
