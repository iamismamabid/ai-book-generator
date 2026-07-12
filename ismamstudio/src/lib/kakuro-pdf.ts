import { jsPDF } from "jspdf";
import { KakuroGrid, KakuroPuzzle } from "./kakuro";
import { drawCoverPagePart, drawWatermark } from "../app/utils/pdfExportService";

interface KakuroPdfOptions {
  puzzles: { puzzle: KakuroPuzzle; solution: KakuroPuzzle }[];
  difficulty: string;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title: string;
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  isPremium?: boolean;
}

export function drawKakuroGridPDF(
  doc: jsPDF,
  puzzle: KakuroPuzzle,
  width: number,
  height: number,
  isSolution: boolean,
  puzzleNumber: number,
  title: string
) {
  const { grid, rows, cols } = puzzle;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 30);
  const label = isSolution
    ? `${title} #${puzzleNumber} — Answer Key`
    : `${title} #${puzzleNumber}`;
  doc.text(label, width / 2, 0.65, { align: "center" });

  // Sizing and alignment
  const marginX = 0.75;
  const marginY = 1.2;
  const maxW = width - (marginX * 2);
  const maxH = height - (marginY * 2);

  // Calculate cell size that fits both width and height constraints
  const cellSize = Math.min(maxW / cols, maxH / rows);
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  const startX = (width - gridW) / 2;
  const startY = marginY + (maxH - gridH) / 2;

  // Render Grid cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;

      if (cell.type === "white") {
        // Draw white playable cell
        doc.setLineWidth(0.005);
        doc.setDrawColor(180, 180, 190);
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, cellSize, cellSize, "FD");

        // Display numbers inside
        if (isSolution) {
          doc.setTextColor(79, 70, 229); // Solution in Indigo
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 32));
          doc.text(String(cell.value), x + cellSize / 2, y + cellSize * 0.65, { align: "center" });
        } else if (cell.displayValue) {
          doc.setTextColor(51, 65, 85); // Clues/helpers in dark slate
          doc.setFont("helvetica", "normal");
          doc.setFontSize(Math.floor(cellSize * 30));
          doc.text(cell.displayValue, x + cellSize / 2, y + cellSize * 0.65, { align: "center" });
        }
      } else {
        // Draw black / clue cell
        doc.setLineWidth(0.005);
        doc.setDrawColor(60, 60, 70);
        doc.setFillColor(30, 30, 35); // Dark gray fill
        doc.rect(x, y, cellSize, cellSize, "FD");

        const hasRowClue = cell.rowClue !== undefined;
        const hasColClue = cell.colClue !== undefined;

        if (hasRowClue || hasColClue) {
          // Draw diagonal line from top-left to bottom-right
          doc.setLineWidth(0.008);
          doc.setDrawColor(100, 100, 110);
          doc.line(x, y, x + cellSize, y + cellSize);

          // Clue text styling
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 18));
          doc.setTextColor(248, 250, 252); // White clue text

          // 1. Row Clue (Top-Right triangle)
          if (hasRowClue) {
            doc.text(
              String(cell.rowClue),
              x + cellSize * 0.72,
              y + cellSize * 0.38,
              { align: "center" }
            );
          }

          // 2. Col Clue (Bottom-Left triangle)
          if (hasColClue) {
            doc.text(
              String(cell.colClue),
              x + cellSize * 0.28,
              y + cellSize * 0.8,
              { align: "center" }
            );
          }
        }
      }
    }
  }

  // Draw outer thick borders
  doc.setLineWidth(0.015);
  doc.setDrawColor(25, 25, 35);
  doc.rect(startX, startY, gridW, gridH);

  // Reset text color
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

export async function downloadKakuroPdf(options: KakuroPdfOptions, filename: string) {
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
    drawKakuroGridPDF(doc, item.puzzle, width, height, false, index + 1, title);
  });

  // ── Solution pages (appended after all puzzles) ───────────────
  if (includeSolutions) {
    puzzles.forEach((item, index) => {
      doc.addPage();
      drawKakuroGridPDF(doc, item.solution, width, height, true, index + 1, title);
    });
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  // Apply watermark to all interior pages if not premium
  if (isPremium === false) {
    const totalPages = doc.internal.getNumberOfPages();
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
