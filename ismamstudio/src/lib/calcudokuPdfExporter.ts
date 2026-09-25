/**
 * KDPage Calcudoku PDF Exporter
 * 300 DPI Vector PDF generator for Amazon KDP Print-Ready Interiors
 */

import jsPDF from "jspdf";
import { CalcudokuPuzzle } from "./calcudokuEngine";
import { getTrimDimensions, KdpTrimSize } from "./kdpTrimSizes";

export interface CalcudokuPdfOptions {
  trimSize: KdpTrimSize;
  includeSolutions: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  authorName?: string;
  puzzlesPerPage?: 1 | 2 | 4;
  showPageNumbers?: boolean;
}

export async function exportCalcudokuBookPdf(
  puzzles: CalcudokuPuzzle[],
  options: CalcudokuPdfOptions,
  onProgress?: (percent: number) => void
): Promise<jsPDF> {
  const dims = getTrimDimensions(options.trimSize);
  const widthInches = dims.widthInches || dims.width || dims.w || 8.5;
  const heightInches = dims.heightInches || dims.height || dims.h || 11;
  const pageWidth = widthInches * 72;
  const pageHeight = heightInches * 72;

  const doc = new jsPDF({
    orientation: widthInches > heightInches ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
  });

  const ppp = options.puzzlesPerPage || (puzzles[0]?.size <= 5 ? 2 : 1);
  const totalPuzzlePages = Math.ceil(puzzles.length / ppp);
  const totalSolutionPages = options.includeSolutions ? Math.ceil(puzzles.length / 4) : 0;
  const totalSteps = totalPuzzlePages + totalSolutionPages + 2;
  let currentStep = 0;

  // 1. Title Page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text(options.bookTitle || "CALCUDOKU PUZZLE BOOK", pageWidth / 2, pageHeight * 0.38, { align: "center" });

  if (options.bookSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(options.bookSubtitle, pageWidth / 2, pageHeight * 0.44, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`${puzzles.length} Math Logic Grid Puzzles with Solutions`, pageWidth / 2, pageHeight * 0.50, { align: "center" });

  if (options.authorName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Created by ${options.authorName}`, pageWidth / 2, pageHeight * 0.75, { align: "center" });
  }

  currentStep++;
  if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

  // 2. Render Puzzle Pages
  let pageNumber = 1;
  for (let i = 0; i < puzzles.length; i += ppp) {
    doc.addPage([pageWidth, pageHeight]);
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

    const chunk = puzzles.slice(i, i + ppp);
    renderPuzzlesOnPage(doc, chunk, i + 1, pageNumber++, pageWidth, pageHeight, ppp, options.showPageNumbers !== false);
  }

  // 3. Render Solutions Section
  if (options.includeSolutions && puzzles.length > 0) {
    // Divider
    doc.addPage([pageWidth, pageHeight]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(30, 41, 59);
    doc.text("SOLUTIONS", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Complete answer keys for all puzzles", pageWidth / 2, pageHeight / 2 + 15, { align: "center" });

    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

    for (let i = 0; i < puzzles.length; i += 4) {
      doc.addPage([pageWidth, pageHeight]);
      currentStep++;
      if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

      const chunk = puzzles.slice(i, i + 4);
      renderSolutionsGrid(doc, chunk, i + 1, pageNumber++, pageWidth, pageHeight);
    }
  }

  return doc;
}

function renderPuzzlesOnPage(
  doc: jsPDF,
  puzzles: CalcudokuPuzzle[],
  startIdx: number,
  pageNumber: number,
  pageWidth: number,
  pageHeight: number,
  ppp: number,
  showPageNumber: boolean
) {
  const margin = 40;
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2 - 40;

  if (ppp === 1) {
    const puzzle = puzzles[0];
    renderSingleGrid(doc, puzzle, startIdx, margin, margin, availWidth, availHeight, false);
  } else if (ppp === 2) {
    const slotHeight = availHeight / 2 - 20;
    puzzles.forEach((puzzle, idx) => {
      const y = margin + idx * (slotHeight + 30);
      renderSingleGrid(doc, puzzle, startIdx + idx, margin, y, availWidth, slotHeight, false);
    });
  } else {
    // 4 per page
    const slotWidth = availWidth / 2 - 15;
    const slotHeight = availHeight / 2 - 20;
    puzzles.forEach((puzzle, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = margin + col * (slotWidth + 30);
      const y = margin + row * (slotHeight + 30);
      renderSingleGrid(doc, puzzle, startIdx + idx, x, y, slotWidth, slotHeight, false);
    });
  }

  if (showPageNumber) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(String(pageNumber), pageWidth / 2, pageHeight - margin + 15, { align: "center" });
  }
}

function renderSingleGrid(
  doc: jsPDF,
  puzzle: CalcudokuPuzzle,
  puzzleNum: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  isSolution: boolean
) {
  const headerHeight = 35;
  const gridAvailW = boxWidth;
  const gridAvailH = boxHeight - headerHeight;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`PUZZLE #${puzzleNum}`, boxX, boxY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${puzzle.size}x${puzzle.size} • ${puzzle.difficulty.toUpperCase()}`, boxX + boxWidth, boxY + 15, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(boxX, boxY + 22, boxX + boxWidth, boxY + 22);

  // Grid dimensions
  const cellSize = Math.min(gridAvailW / puzzle.size, gridAvailH / puzzle.size, 55);
  const gridTotalW = puzzle.size * cellSize;
  const gridTotalH = puzzle.size * cellSize;

  const startX = boxX + (boxWidth - gridTotalW) / 2;
  const startY = boxY + headerHeight + (gridAvailH - gridTotalH) / 2;

  // Map each cell to its cage
  const cellCageMap: Map<string, number> = new Map();
  puzzle.cages.forEach((cage) => {
    cage.cells.forEach(([r, c]) => {
      cellCageMap.set(`${r},${c}`, cage.id);
    });
  });

  // Render Numbers (if solution)
  if (isSolution) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(Math.max(10, cellSize * 0.45));
    doc.setTextColor(30, 41, 59);

    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const cx = startX + c * cellSize + cellSize / 2;
        const cy = startY + r * cellSize + cellSize / 2 + (cellSize * 0.15);
        doc.text(String(puzzle.grid[r][c]), cx, cy, { align: "center" });
      }
    }
  }

  // Render Inner Lines
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const currentCage = cellCageMap.get(`${r},${c}`);
      const cx = startX + c * cellSize;
      const cy = startY + r * cellSize;

      // Bottom border
      if (r < puzzle.size - 1) {
        const bottomCage = cellCageMap.get(`${r + 1},${c}`);
        const isCageBoundary = currentCage !== bottomCage;
        doc.setDrawColor(isCageBoundary ? 15 : 180, isCageBoundary ? 23 : 180, isCageBoundary ? 42 : 180);
        doc.setLineWidth(isCageBoundary ? 2 : 0.4);
        doc.line(cx, cy + cellSize, cx + cellSize, cy + cellSize);
      }

      // Right border
      if (c < puzzle.size - 1) {
        const rightCage = cellCageMap.get(`${r},${c + 1}`);
        const isCageBoundary = currentCage !== rightCage;
        doc.setDrawColor(isCageBoundary ? 15 : 180, isCageBoundary ? 23 : 180, isCageBoundary ? 42 : 180);
        doc.setLineWidth(isCageBoundary ? 2 : 0.4);
        doc.line(cx + cellSize, cy, cx + cellSize, cy + cellSize);
      }
    }
  }

  // Outer Grid Border (Heavy)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(2.2);
  doc.rect(startX, startY, gridTotalW, gridTotalH);

  // Render Cage Clues (e.g. "12×", "7+")
  doc.setFont("helvetica", "bold");
  const clueFontSize = Math.max(7, Math.min(cellSize * 0.28, 10));
  doc.setFontSize(clueFontSize);
  doc.setTextColor(30, 41, 59);

  puzzle.cages.forEach((cage) => {
    const firstCell = cage.cells[0]; // sorted top-left
    if (!firstCell) return;
    const [r, c] = firstCell;
    const clueX = startX + c * cellSize + 3;
    const clueY = startY + r * cellSize + clueFontSize + 2;
    const label = `${cage.target}${cage.op}`;
    doc.text(label, clueX, clueY);
  });
}

function renderSolutionsGrid(
  doc: jsPDF,
  puzzles: CalcudokuPuzzle[],
  startIdx: number,
  pageNumber: number,
  pageWidth: number,
  pageHeight: number
) {
  const margin = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`SOLUTIONS #${startIdx} – #${startIdx + puzzles.length - 1}`, margin, margin + 15);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

  const availW = pageWidth - margin * 2;
  const availH = pageHeight - margin * 2 - 50;

  const slotW = availW / 2 - 15;
  const slotH = availH / 2 - 20;

  puzzles.forEach((puzzle, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = margin + col * (slotW + 30);
    const y = margin + 35 + row * (slotH + 30);

    renderSingleGrid(doc, puzzle, startIdx + idx, x, y, slotW, slotH, true);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(String(pageNumber), pageWidth / 2, pageHeight - margin + 15, { align: "center" });
}
