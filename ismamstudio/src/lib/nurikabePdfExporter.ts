/**
 * KDPage Nurikabe PDF Exporter
 * 300 DPI Vector PDF generator for Amazon KDP Print-Ready Interiors
 * Supports Facing Pages (Left & Right alternating KDP spine gutter margins)
 */

import jsPDF from "jspdf";
import { NurikabePuzzle } from "./nurikabeEngine";
import { getTrimDimensions, KdpTrimSize } from "./kdpTrimSizes";
import { getGutterMargin } from "./gutterMargin";

export interface NurikabePdfOptions {
  trimSize: KdpTrimSize;
  includeSolutions: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  authorName?: string;
  puzzlesPerPage?: 1 | 2 | 4;
  showPageNumbers?: boolean;
  facingPages?: boolean;
}

export async function exportNurikabeBookPdf(
  puzzles: NurikabePuzzle[],
  options: NurikabePdfOptions,
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

  const ppp = options.puzzlesPerPage || (puzzles[0]?.rows <= 6 ? 2 : 1);
  const totalPuzzlePages = Math.ceil(puzzles.length / ppp);
  const totalSolutionPages = options.includeSolutions ? Math.ceil(puzzles.length / 4) : 0;
  const totalSteps = totalPuzzlePages + totalSolutionPages + 2;
  let currentStep = 0;

  const totalExpectedPages =
    1 + totalPuzzlePages + (options.includeSolutions ? 1 + totalSolutionPages : 0);
  const gutterExtra = getGutterMargin(totalExpectedPages);
  const outsideMargin = 0.5 * 72;
  const insideMargin = Math.max(0.65, Math.min(1.0, 0.25 + gutterExtra)) * 72;

  // Title Page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text(
    options.bookTitle || "NURIKABE PUZZLE BOOK",
    pageWidth / 2,
    pageHeight * 0.38,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text(
    options.bookSubtitle || "Islands in the Stream Japanese Logic Puzzles",
    pageWidth / 2,
    pageHeight * 0.44,
    { align: "center" }
  );

  if (options.authorName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`By ${options.authorName}`, pageWidth / 2, pageHeight * 0.54, {
      align: "center",
    });
  }

  currentStep++;
  if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

  let pageNum = 1;

  // Render Puzzle Pages
  for (let pageIdx = 0; pageIdx < totalPuzzlePages; pageIdx++) {
    doc.addPage([pageWidth, pageHeight]);
    pageNum++;

    const isRecto = pageNum % 2 !== 0;
    const leftMargin = options.facingPages
      ? isRecto
        ? insideMargin
        : outsideMargin
      : outsideMargin;
    const rightMargin = options.facingPages
      ? isRecto
        ? outsideMargin
        : insideMargin
      : outsideMargin;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    const topMargin = 0.6 * 72;
    const bottomMargin = 0.6 * 72;
    const contentHeight = pageHeight - topMargin - bottomMargin;

    if (options.showPageNumbers) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        String(pageNum),
        isRecto ? pageWidth - rightMargin : leftMargin,
        pageHeight - 24,
        { align: isRecto ? "right" : "left" }
      );
    }

    const startPuzzleIdx = pageIdx * ppp;
    const pagePuzzles = puzzles.slice(startPuzzleIdx, startPuzzleIdx + ppp);

    if (ppp === 1) {
      const puzzle = pagePuzzles[0];
      if (puzzle) {
        drawNurikabePuzzle(
          doc,
          puzzle,
          leftMargin,
          topMargin,
          contentWidth,
          contentHeight,
          false
        );
      }
    } else if (ppp === 2) {
      const subHeight = (contentHeight - 24) / 2;
      pagePuzzles.forEach((puzzle, idx) => {
        const subTop = topMargin + idx * (subHeight + 24);
        drawNurikabePuzzle(
          doc,
          puzzle,
          leftMargin,
          subTop,
          contentWidth,
          subHeight,
          false
        );
      });
    } else {
      const subWidth = (contentWidth - 20) / 2;
      const subHeight = (contentHeight - 20) / 2;
      pagePuzzles.forEach((puzzle, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const subLeft = leftMargin + col * (subWidth + 20);
        const subTop = topMargin + row * (subHeight + 20);
        drawNurikabePuzzle(
          doc,
          puzzle,
          subLeft,
          subTop,
          subWidth,
          subHeight,
          false
        );
      });
    }

    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));
  }

  // Solution Section Divider
  if (options.includeSolutions && puzzles.length > 0) {
    doc.addPage([pageWidth, pageHeight]);
    pageNum++;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(30, 41, 59);
    doc.text("SOLUTIONS & SEA MAPS", pageWidth / 2, pageHeight * 0.45, {
      align: "center",
    });

    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

    // Render 4 Solutions per page
    const solPpp = 4;
    for (let solIdx = 0; solIdx < puzzles.length; solIdx += solPpp) {
      doc.addPage([pageWidth, pageHeight]);
      pageNum++;

      const isRecto = pageNum % 2 !== 0;
      const leftMargin = options.facingPages
        ? isRecto
          ? insideMargin
          : outsideMargin
        : outsideMargin;
      const rightMargin = options.facingPages
        ? isRecto
          ? outsideMargin
          : insideMargin
        : outsideMargin;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      const topMargin = 0.6 * 72;
      const bottomMargin = 0.6 * 72;
      const contentHeight = pageHeight - topMargin - bottomMargin;

      if (options.showPageNumbers) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(
          String(pageNum),
          isRecto ? pageWidth - rightMargin : leftMargin,
          pageHeight - 24,
          { align: isRecto ? "right" : "left" }
        );
      }

      const chunk = puzzles.slice(solIdx, solIdx + solPpp);
      const subWidth = (contentWidth - 20) / 2;
      const subHeight = (contentHeight - 20) / 2;

      chunk.forEach((puzzle, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const subLeft = leftMargin + col * (subWidth + 20);
        const subTop = topMargin + row * (subHeight + 20);
        drawNurikabePuzzle(
          doc,
          puzzle,
          subLeft,
          subTop,
          subWidth,
          subHeight,
          true
        );
      });

      currentStep++;
      if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));
    }
  }

  return doc;
}

export function drawNurikabePuzzle(
  doc: jsPDF,
  puzzle: NurikabePuzzle,
  x: number,
  y: number,
  w: number,
  h: number,
  isSolution: boolean = false
) {
  const headerHeight = 24;
  const maxGridWidth = w * 0.92;
  const maxGridHeight = h - headerHeight - 12;

  const cellSize = Math.min(
    maxGridWidth / puzzle.cols,
    maxGridHeight / puzzle.rows
  );

  const gridWidth = cellSize * puzzle.cols;
  const gridHeight = cellSize * puzzle.rows;
  const startX = x + (w - gridWidth) / 2;
  const startY = y + headerHeight + (maxGridHeight - gridHeight) / 2;

  // Title / Number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(isSolution ? 10 : 13);
  doc.setTextColor(30, 41, 59);
  doc.text(
    isSolution ? `Solution — ${puzzle.title}` : puzzle.title,
    x + w / 2,
    y + 16,
    { align: "center" }
  );

  // Draw Cells
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cx = startX + c * cellSize;
      const cy = startY + r * cellSize;
      const isSea = isSolution && puzzle.solution[r][c] === "sea";

      if (isSea) {
        doc.setFillColor(30, 41, 59); // dark charcoal for sea
        doc.rect(cx, cy, cellSize, cellSize, "F");
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(cx, cy, cellSize, cellSize, "F");
      }

      // Cell Grid Border
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.6);
      doc.rect(cx, cy, cellSize, cellSize, "S");

      // Clue Number
      const clue = puzzle.clues[r][c];
      if (clue !== null && clue !== undefined) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.max(9, Math.round(cellSize * 0.44)));
        doc.setTextColor(30, 41, 59);
        const cellCenterX = cx + cellSize / 2;
        const cellCenterY = cy + cellSize / 2 + cellSize * 0.16;
        doc.text(String(clue), cellCenterX, cellCenterY, { align: "center" });
      }
    }
  }

  // Outer Grid Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.4);
  doc.rect(startX, startY, gridWidth, gridHeight, "S");
}
