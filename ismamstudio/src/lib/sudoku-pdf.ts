// src/lib/sudoku-pdf.ts
import { jsPDF } from "jspdf";
import { Grid, Difficulty } from "./sudokuGenerator";
import { drawCoverPagePart, drawWatermark } from "../app/utils/pdfExportService";

interface PdfOptions {
  puzzles: { puzzle: Grid; solution: Grid }[];
  difficulty: Difficulty;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title: string;
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  isPremium?: boolean;
}

function drawSudokuGrid(
  doc: jsPDF,
  grid: Grid,
  width: number,
  height: number,
  isSolution: boolean,
  puzzleNumber: number,
  title: string
) {
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 30);
  const label = isSolution
    ? `${title} #${puzzleNumber} — Answer Key`
    : `${title} #${puzzleNumber}`;
  doc.text(label, width / 2, 0.65, { align: "center" });

  // Difficulty badge
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    isSolution ? "Solution" : "Puzzle",
    width / 2,
    0.95,
    { align: "center" }
  );

  // Grid sizing
  const gridSize = Math.min(width - 1.0, height - 2.6);
  const cellSize = gridSize / 9;
  const startX = (width - gridSize) / 2;
  const startY = 1.3;

  // Draw thin cell borders first
  doc.setLineWidth(0.005);
  doc.setDrawColor(180, 180, 190);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;
      doc.rect(x, y, cellSize, cellSize);
    }
  }

  // Draw thick 3x3 box borders on top
  doc.setLineWidth(0.022);
  doc.setDrawColor(25, 25, 35);
  for (let b = 0; b <= 3; b++) {
    const offset = b * cellSize * 3;
    // Vertical thick lines
    doc.line(startX + offset, startY, startX + offset, startY + gridSize);
    // Horizontal thick lines
    doc.line(startX, startY + offset, startX + gridSize, startY + offset);
  }

  // Draw numbers
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        if (isSolution) {
          // Solution answers in indigo
          doc.setTextColor(79, 70, 229);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 34));
        } else {
          // Puzzle givens in dark slate
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 34));
        }

        doc.text(
          val.toString(),
          x + cellSize / 2,
          y + cellSize * 0.65,
          { align: "center" }
        );
      }
    }
  }

  // Reset
  doc.setTextColor(0);

  // Page number footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Page ${puzzleNumber}`,
    width - 0.5,
    height - 0.35,
    { align: "right" }
  );
}

export async function downloadSudokuPdf(options: PdfOptions, filename: string) {
  const { puzzles, title, trimSize, includeSolutions = true, includeCover = false, coverState = null, isPremium } = options;

  let width = 8.5;
  let height = 11;
  if (trimSize === "6x9") { width = 6; height = 9; }
  if (trimSize === "5x8") { width = 5; height = 8; }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [width, height],
  });

  // 1. Draw Front Cover if integrated
  let firstPageAdded = false;
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
  }

  // ── Puzzle pages ──────────────────────────────────────────────
  puzzles.forEach((item, index) => {
    if (firstPageAdded || index > 0) doc.addPage();
    firstPageAdded = true;
    drawSudokuGrid(doc, item.puzzle, width, height, false, index + 1, title);
  });

  // ── Solution pages (appended after all puzzles) ───────────────
  if (includeSolutions) {
    puzzles.forEach((item, index) => {
      doc.addPage();
      drawSudokuGrid(doc, item.solution, width, height, true, index + 1, title);
    });
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  // Apply watermark to all interior pages if not premium
  if (isPremium === false) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      const isFrontCover = includeCover && coverState && i === 1;
      const isBackCover = includeCover && coverState && i === totalPages;
      if (!isFrontCover && !isBackCover) {
        doc.setPage(i);
        drawWatermark(doc, width, height);
      }
    }
  }

  doc.save(filename);
}