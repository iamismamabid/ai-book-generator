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
  solutionsPerPage?: number; // 1, 2, or 4 per page
  includeCover?: boolean;
  coverState?: any;
  isPremium?: boolean;
}

function getSolutionPackZones(count: number, x0: number, y0: number, safeW: number, safeH: number) {
  if (count <= 1) return [{ x: x0, y: y0, w: safeW, h: safeH }];
  if (count === 2) return [
    { x: x0, y: y0, w: safeW, h: safeH / 2 - 0.2 },
    { x: x0, y: y0 + safeH / 2 + 0.2, w: safeW, h: safeH / 2 - 0.2 },
  ];
  return [
    { x: x0, y: y0, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0 + safeW / 2 + 0.15, y: y0, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0, y: y0 + safeH / 2 + 0.15, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0 + safeW / 2 + 0.15, y: y0 + safeH / 2 + 0.15, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
  ];
}

function drawSudokuTile(
  doc: jsPDF,
  grid: Grid,
  x: number,
  y: number,
  size: number,
  isSolution: boolean,
  puzzleNumber: number,
  showTitle: boolean = true
) {
  if (showTitle) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size > 4.5 ? 14 : 11);
    doc.setTextColor(20, 20, 30);
    const label = isSolution ? `Answer #${puzzleNumber}` : `Puzzle #${puzzleNumber}`;
    doc.text(label, x + size / 2, y - 0.1, { align: "center" });
  }

  const cellSize = size / 9;

  // Thin cell borders
  doc.setLineWidth(0.008);
  doc.setDrawColor(148, 163, 184);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = x + c * cellSize;
      const cellY = y + r * cellSize;
      doc.rect(cellX, cellY, cellSize, cellSize);
    }
  }

  // Thick 3x3 box borders
  doc.setLineWidth(0.024);
  doc.setDrawColor(15, 23, 42);
  for (let b = 0; b <= 3; b++) {
    const offset = b * cellSize * 3;
    doc.line(x + offset, y, x + offset, y + size);
    doc.line(x, y + offset, x + size, y + offset);
  }

  // Draw numbers
  const numberFontSize = Math.max(9, Math.floor(cellSize * 36));
  doc.setFontSize(numberFontSize);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (isSolution) {
          doc.setTextColor(79, 70, 229);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
        }

        doc.text(
          val.toString(),
          x + c * cellSize + cellSize / 2,
          y + r * cellSize + cellSize * 0.68,
          { align: "center" }
        );
      }
    }
  }

  doc.setTextColor(0);
}

export async function generateSudokuPdf(options: PdfOptions): Promise<jsPDF> {
  const {
    puzzles,
    difficulty,
    trimSize,
    title,
    includeSolutions = true,
    solutionsPerPage = 4,
    includeCover = false,
    coverState = null,
    isPremium,
  } = options;

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

  // ── Puzzle pages (1 per page - Large) ─────────────────────────
  puzzles.forEach((item, index) => {
    if (firstPageAdded || index > 0) doc.addPage();
    firstPageAdded = true;

    const margin = 0.5;
    const safeW = width - (margin * 2);
    const safeH = height - (margin * 2);

    const titleSpace = 0.45;
    const gridSize = Math.min(safeW * 0.86, safeH - titleSpace - 0.4);
    const startX = (width - gridSize) / 2;
    const startY = margin + titleSpace + 0.2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 30);
    doc.text(`${title} #${index + 1}`, width / 2, margin + 0.35, { align: "center" });

    drawSudokuTile(doc, item.puzzle, startX, startY, gridSize, false, index + 1, false);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${index + 1}`, width - 0.5, height - 0.35, { align: "right" });
  });

  // ── Solution pages (1, 2, or 4 per page) ─────────────────────
  if (includeSolutions) {
    const solPerPage = Math.min(4, Math.max(1, solutionsPerPage));
    const totalSolPages = Math.ceil(puzzles.length / solPerPage);

    for (let p = 0; p < totalSolPages; p++) {
      doc.addPage();
      const margin = 0.5;
      const safeW = width - (margin * 2);
      const safeH = height - (margin * 2);
      const topReserved = 0.5;
      const availH = safeH - topReserved;

      const zones = getSolutionPackZones(solPerPage, margin, margin + topReserved, safeW, availH);

      for (let z = 0; z < solPerPage; z++) {
        const solIndex = p * solPerPage + z;
        if (solIndex >= puzzles.length) break;

        const zone = zones[z];
        const titleSpace = 0.25;
        const tileSize = Math.min(zone.w, zone.h - titleSpace);
        const startX = zone.x + (zone.w - tileSize) / 2;
        const startY = zone.y + titleSpace;

        drawSudokuTile(doc, puzzles[solIndex].solution, startX, startY, tileSize, true, solIndex + 1, true);
      }
    }
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

  return doc;
}

export async function downloadSudokuPdf(options: PdfOptions, filename: string) {
  const doc = await generateSudokuPdf(options);
  doc.save(filename);
}