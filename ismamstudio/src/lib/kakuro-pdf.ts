import { jsPDF } from "jspdf";
import { KakuroGrid, KakuroPuzzle } from "./kakuro";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";
import { calculateKdpMargins, drawKdpTitlePage, drawKdpCopyrightAndInstructionsPage } from "./kdpBookEngine";

interface KakuroPdfOptions {
  puzzles: { puzzle: KakuroPuzzle; solution: KakuroPuzzle }[];
  difficulty: string;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title: string;
  subtitle?: string;
  authorName?: string;
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  includeFrontMatter?: boolean;
  isPremium?: boolean;
  hasBleed?: boolean;
  showGuides?: boolean;
  borderTheme?: BorderThemeId;
}

export function drawKakuroGridPDF(
  doc: jsPDF,
  puzzle: KakuroPuzzle,
  width: number,
  height: number,
  isSolution: boolean,
  pageNumber: number,
  puzzleNumber: number,
  title: string,
  totalPages: number,
  showGuides: boolean = false
) {
  const { grid, rows, cols } = puzzle;
  const margins = calculateKdpMargins(pageNumber, totalPages, width);
  const { marginLeft, contentW, contentCenterX } = margins;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  const label = isSolution
    ? `${title} #${puzzleNumber} — Answer Key`
    : `${title} #${puzzleNumber}`;
  doc.text(label, contentCenterX, 0.65, { align: "center" });

  // Sizing and alignment
  const marginY = 1.2;
  const maxW = contentW;
  const maxH = height - (marginY * 2);

  if (showGuides) {
    drawMarginGuides(doc, margins.marginLeft, margins.marginRight, marginY, 0.5, width, height);
  }

  // Calculate cell size that fits both width and height constraints
  const cellSize = Math.min(maxW / cols, maxH / rows);
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  const startX = marginLeft + (contentW - gridW) / 2;
  const startY = marginY + (maxH - gridH) / 2;

  // Render Grid cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const cellX = startX + c * cellSize;
      const cellY = startY + r * cellSize;

      if (cell.type === "white") {
        // Playable white cell
        doc.setFillColor(255);
        doc.rect(cellX, cellY, cellSize, cellSize, "F");

        doc.setDrawColor(180);
        doc.setLineWidth(0.005);
        doc.rect(cellX, cellY, cellSize, cellSize, "S");

        // Render solution value if in solution view
        if (isSolution && cell.value !== undefined) {
          doc.setFontSize(Math.max(8, Math.floor(cellSize * 24)));
          doc.setTextColor(0); // Solid pure black for KDP B&W
          doc.setFont("helvetica", "bold");
          doc.text(
            cell.value.toString(),
            cellX + cellSize / 2,
            cellY + cellSize * 0.72,
            { align: "center" }
          );
        } else if (cell.displayValue) {
          doc.setFontSize(Math.max(7, Math.floor(cellSize * 22)));
          doc.setTextColor(40);
          doc.setFont("helvetica", "normal");
          doc.text(
            cell.displayValue,
            cellX + cellSize / 2,
            cellY + cellSize * 0.72,
            { align: "center" }
          );
        }
      } else {
        // Dark cell or Clue cell
        const hasRowClue = cell.rowClue !== undefined;
        const hasColClue = cell.colClue !== undefined;

        if (hasRowClue || hasColClue) {
          // Clue cell with diagonal divider
          doc.setFillColor(60);
          doc.rect(cellX, cellY, cellSize, cellSize, "F");

          doc.setDrawColor(180);
          doc.setLineWidth(0.008);
          doc.line(cellX, cellY, cellX + cellSize, cellY + cellSize);

          doc.setFontSize(Math.max(6, Math.floor(cellSize * 14)));
          doc.setTextColor(255);
          doc.setFont("helvetica", "bold");

          // Vertical down clue (bottom-left triangle)
          if (hasColClue) {
            doc.text(
              String(cell.colClue),
              cellX + cellSize * 0.25,
              cellY + cellSize * 0.78,
              { align: "center" }
            );
          }

          // Horizontal right clue (top-right triangle)
          if (hasRowClue) {
            doc.text(
              String(cell.rowClue),
              cellX + cellSize * 0.75,
              cellY + cellSize * 0.38,
              { align: "center" }
            );
          }
        } else {
          // Unplayable solid black cell
          doc.setFillColor(20);
          doc.rect(cellX, cellY, cellSize, cellSize, "F");
        }
      }
    }
  }

  // Draw outer thick borders
  doc.setLineWidth(0.015);
  doc.setDrawColor(0);
  doc.rect(startX, startY, gridW, gridH);

  // Reset text color
  doc.setTextColor(0);

  // Page number footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Page ${pageNumber}`, contentCenterX, height - 0.4, { align: "center" });
}

export async function downloadKakuroPdf(options: KakuroPdfOptions, filename: string) {
  const {
    puzzles,
    title = "Kakuro Cross Sums",
    subtitle,
    authorName = "Independent Publisher",
    difficulty,
    trimSize,
    includeSolutions = true,
    includeCover = false,
    coverState = null,
    includeFrontMatter = true,
    isPremium,
    hasBleed = false,
    showGuides = false,
    borderTheme,
  } = options;

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

  const frontMatterPages = 2;
  const solPages = includeSolutions ? puzzles.length : 0;
  const totalExpectedPages = frontMatterPages + puzzles.length + solPages;

  let firstPageAdded = false;
  let currentPage = 0;

  // 1. Draw Front Cover if integrated
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
    currentPage++;
  }

  // Standard KDP Front Matter (Mandatory)
  if (firstPageAdded) doc.addPage();
  firstPageAdded = true;
  currentPage++;
  drawKdpTitlePage(doc, {
    title,
    subtitle: subtitle || `${puzzles.length} Cross Sum Kakuro Puzzles with Complete Solutions`,
    authorName,
    puzzleType: "kakuro",
    difficulty,
    puzzleCount: puzzles.length,
    width,
    height,
    totalPages: totalExpectedPages,
  });

  doc.addPage();
  currentPage++;
  drawKdpCopyrightAndInstructionsPage(doc, {
    authorName,
    puzzleType: "kakuro",
    width,
    height,
    totalPages: totalExpectedPages,
  });

  // ── Puzzle pages ──────────────────────────────────────────────
  puzzles.forEach((item, index) => {
    if (firstPageAdded) doc.addPage();
    firstPageAdded = true;
    currentPage++;
    drawKakuroGridPDF(doc, item.puzzle, width, height, false, currentPage, index + 1, title, totalExpectedPages, showGuides);
  });

  // ── Solution pages (appended after all puzzles) ───────────────
  if (includeSolutions) {
    puzzles.forEach((item, index) => {
      doc.addPage();
      currentPage++;
      drawKakuroGridPDF(doc, item.solution, width, height, true, currentPage, index + 1, title, totalExpectedPages, showGuides);
    });
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  // Apply watermark (free tier) and the decorative border theme to every
  // interior page, skipping the front/back cover pages.
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

  doc.save(filename);
}
