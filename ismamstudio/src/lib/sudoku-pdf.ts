// src/lib/sudoku-pdf.ts
import { jsPDF } from "jspdf";
import { Grid, Difficulty } from "./sudokuGenerator";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";

export interface PdfOptions {
  puzzles: { puzzle: Grid; solution: Grid }[];
  difficulty: Difficulty;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title?: string;
  headerText?: string;
  footerText?: string;
  borderThickness?: number;
  fontFamily?: "sans-serif" | "serif" | "monospace";
  includeSolutions?: boolean;
  solutionsPerPage?: number; // 1, 2, or 4 per page
  includeCover?: boolean;
  coverState?: any;
  isPremium?: boolean;
  hasBleed?: boolean;
  showGuides?: boolean;
  borderTheme?: BorderThemeId;
}

const FONT_MAP: Record<string, string> = {
  "sans-serif": "helvetica",
  "serif": "times",
  "monospace": "courier",
};

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
  showTitle: boolean = true,
  pdfFont: string = "helvetica",
  borderThickness: number = 2
) {
  if (showTitle) {
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(size > 4.5 ? 14 : 11);
    doc.setTextColor(20, 20, 30);
    const label = isSolution ? `Answer #${puzzleNumber}` : `Puzzle #${puzzleNumber}`;
    doc.text(label, x + size / 2, y - 0.1, { align: "center" });
  }

  const cellSize = size / 9;

  // Thin cell borders scaled with user borderThickness
  const thinLine = Math.max(0.004, borderThickness * 0.004);
  doc.setLineWidth(thinLine);
  doc.setDrawColor(148, 163, 184);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = x + c * cellSize;
      const cellY = y + r * cellSize;
      doc.rect(cellX, cellY, cellSize, cellSize);
    }
  }

  // Thick 3x3 box borders scaled with user borderThickness
  const thickLine = Math.max(0.012, borderThickness * 0.012);
  doc.setLineWidth(thickLine);
  doc.setDrawColor(15, 23, 42);
  for (let b = 0; b <= 3; b++) {
    const offset = b * cellSize * 3;
    doc.line(x + offset, y, x + offset, y + size);
    doc.line(x, y + offset, x + size, y + offset);
  }

  // Draw numbers
  const numberFontSize = Math.max(8, Math.floor(cellSize * 30));
  doc.setFontSize(numberFontSize);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (isSolution) {
          doc.setTextColor(79, 70, 229);
          doc.setFont(pdfFont, "bold");
        } else {
          doc.setTextColor(15, 23, 42);
          doc.setFont(pdfFont, "bold");
        }

        doc.text(
          val.toString(),
          x + c * cellSize + cellSize / 2,
          y + r * cellSize + cellSize * 0.66,
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
    title = "Sudoku Puzzle Book",
    headerText,
    footerText,
    borderThickness = 2,
    fontFamily = "sans-serif",
    includeSolutions = true,
    solutionsPerPage = 4,
    includeCover = false,
    coverState = null,
    isPremium,
    hasBleed = false,
    showGuides = false,
    borderTheme,
  } = options;

  const pdfFont = FONT_MAP[fontFamily] || "helvetica";

  let width = 8.5;
  let height = 11;
  if (trimSize === "6x9") { width = 6; height = 9; }
  if (trimSize === "5x8") { width = 5; height = 8; }

  const bleed = hasBleed ? 0.125 : 0;
  width += bleed;
  height += bleed * 2;

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

  // ── Puzzle pages (1 per page - Standard KDP Book Format) ─────────
  puzzles.forEach((item, index) => {
    if (firstPageAdded || index > 0) doc.addPage();
    firstPageAdded = true;

    let maxGridSize = 5.4;
    if (trimSize === "6x9") maxGridSize = 4.2;
    if (trimSize === "5x8") maxGridSize = 3.5;

    const safeMarginX = 0.65;
    const safeW = width - (safeMarginX * 2);
    const safeH = height - 1.5;

    const gridSize = Math.min(maxGridSize, safeW, safeH);
    const startX = (width - gridSize) / 2;
    const startY = (height - gridSize) / 2 - 0.1;

    // Header Title
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 30);
    const pageHeader = headerText && headerText.trim()
      ? (headerText.includes("#") ? headerText : `${headerText} #${index + 1}`)
      : `${title} #${index + 1}`;
    doc.text(pageHeader, width / 2, startY - 0.35, { align: "center" });

    // Draw Sudoku Tile with chosen border thickness and font
    drawSudokuTile(doc, item.puzzle, startX, startY, gridSize, false, index + 1, false, pdfFont, borderThickness);

    if (showGuides) {
      const margin = 0.5;
      drawMarginGuides(doc, margin, margin, margin, margin, width, height);
    }

    // Footer Copyright Line & Page Number
    doc.setFont(pdfFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    if (footerText && footerText.trim()) {
      doc.text(footerText, safeMarginX, height - 0.4);
      doc.text(`Page ${index + 1}`, width - safeMarginX, height - 0.4, { align: "right" });
    } else {
      doc.text(`Page ${index + 1}`, width - 0.5, height - 0.4, { align: "right" });
    }
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

      // Solution Section Header
      doc.setFont(pdfFont, "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 30);
      const solHeader = headerText && headerText.trim()
        ? `${headerText} — Solutions`
        : `Solutions (Page ${p + 1} of ${totalSolPages})`;
      doc.text(solHeader, width / 2, margin + 0.3, { align: "center" });

      if (showGuides) {
        drawMarginGuides(doc, margin, margin, margin, margin, width, height);
      }

      const zones = getSolutionPackZones(solPerPage, margin, margin + topReserved, safeW, availH);

      for (let z = 0; z < solPerPage; z++) {
        const solIndex = p * solPerPage + z;
        if (solIndex >= puzzles.length) break;

        const zone = zones[z];
        const titleSpace = 0.25;
        const tileSize = Math.min(zone.w, zone.h - titleSpace);
        const startX = zone.x + (zone.w - tileSize) / 2;
        const startY = zone.y + titleSpace;

        drawSudokuTile(doc, puzzles[solIndex].solution, startX, startY, tileSize, true, solIndex + 1, true, pdfFont, borderThickness);
      }

      // Solution Page Footer
      if (footerText && footerText.trim()) {
        doc.setFont(pdfFont, "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(footerText, margin, height - 0.35);
      }
    }
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  // Apply watermark (free tier) and the decorative border theme
  if (!isPremium || (borderTheme && borderTheme !== "none")) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      const isFrontCover = includeCover && coverState && i === 1;
      const isBackCover = includeCover && coverState && i === totalPages;
      if (!isFrontCover && !isBackCover) {
        doc.setPage(i);
        if (borderTheme && borderTheme !== "none") drawPageBorderTheme(doc, borderTheme, width, height);
        if (!isPremium) drawWatermark(doc, width, height);
      }
    }
  }

  return doc;
}

export async function downloadSudokuPdf(options: PdfOptions, filename: string) {
  const doc = await generateSudokuPdf(options);
  doc.save(filename);
}