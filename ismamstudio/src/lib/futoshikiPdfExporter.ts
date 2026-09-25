/**
 * KDPage Futoshiki PDF Exporter
 * 300 DPI Vector PDF generator for Amazon KDP Print-Ready Interiors
 * Supports Facing Pages (Left & Right alternating KDP spine gutter margins)
 */

import jsPDF from "jspdf";
import { FutoshikiPuzzle } from "./futoshikiEngine";
import { getTrimDimensions, KdpTrimSize } from "./kdpTrimSizes";
import { getGutterMargin } from "./gutterMargin";

export interface FutoshikiPdfOptions {
  trimSize: KdpTrimSize;
  includeSolutions: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  authorName?: string;
  puzzlesPerPage?: 1 | 2 | 4;
  showPageNumbers?: boolean;
  facingPages?: boolean; // Right & Left page layout (Alternating KDP spine gutter)
}

export async function exportFutoshikiBookPdf(
  puzzles: FutoshikiPuzzle[],
  options: FutoshikiPdfOptions,
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

  // Calculate dynamic KDP inside gutter margin based on total page count
  const totalExpectedPages =
    1 + totalPuzzlePages + (options.includeSolutions ? 1 + totalSolutionPages : 0);
  const gutterExtra = getGutterMargin(totalExpectedPages);
  const outsideMargin = 0.5 * 72; // 36 pt
  const insideMargin = Math.max(0.65, Math.min(1.0, 0.25 + gutterExtra)) * 72;

  // 1. Title Page (Recto / Right-hand Page)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text(
    options.bookTitle || "FUTOSHIKI PUZZLE BOOK",
    pageWidth / 2,
    pageHeight * 0.38,
    { align: "center" }
  );

  if (options.bookSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(options.bookSubtitle, pageWidth / 2, pageHeight * 0.44, {
      align: "center",
    });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${puzzles.length} Japanese Logic Inequality Grid Puzzles with Complete Solutions`,
    pageWidth / 2,
    pageHeight * 0.5,
    { align: "center" }
  );

  if (options.authorName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Created by ${options.authorName}`, pageWidth / 2, pageHeight * 0.75, {
      align: "center",
    });
  }

  currentStep++;
  onProgress?.(Math.round((currentStep / totalSteps) * 100));

  // Helper to draw a single Futoshiki grid (puzzle or solution)
  const drawFutoshikiGrid = (
    puzzle: FutoshikiPuzzle,
    startX: number,
    startY: number,
    gridSizePt: number,
    isSolution: boolean = false
  ) => {
    const N = puzzle.size;
    // Step size includes cell + inequality gap
    const cellGapRatio = 0.35; // gap between cells for inequalities
    const totalUnits = N + (N - 1) * cellGapRatio;
    const cellSize = gridSizePt / totalUnits;
    const gapSize = cellSize * cellGapRatio;

    // Quick lookup maps
    const hMap: Record<string, "<" | ">"> = {};
    puzzle.hInequalities.forEach((h) => {
      hMap[`${h.row},${h.col}`] = h.sign;
    });

    const vMap: Record<string, "^" | "v"> = {};
    puzzle.vInequalities.forEach((v) => {
      vMap[`${v.row},${v.col}`] = v.sign;
    });

    // 1. Draw cells and numbers
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = startX + c * (cellSize + gapSize);
        const y = startY + r * (cellSize + gapSize);

        // Cell box
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(1.2);
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, cellSize, cellSize, "FD");

        // Cell number
        const initialVal = puzzle.initialGrid[r][c];
        const solVal = puzzle.solution[r][c];

        if (isSolution && solVal !== null) {
          doc.setFont("helvetica", initialVal !== null ? "bold" : "normal");
          doc.setFontSize(Math.max(8, cellSize * 0.52));
          doc.setTextColor(initialVal !== null ? 15 : 70, initialVal !== null ? 23 : 80, initialVal !== null ? 42 : 120);
          doc.text(
            String(solVal),
            x + cellSize / 2,
            y + cellSize / 2 + cellSize * 0.18,
            { align: "center" }
          );
        } else if (initialVal !== null) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.max(9, cellSize * 0.54));
          doc.setTextColor(15, 23, 42);
          doc.text(
            String(initialVal),
            x + cellSize / 2,
            y + cellSize / 2 + cellSize * 0.18,
            { align: "center" }
          );
        }
      }
    }

    // 2. Draw Horizontal inequalities (< or >)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(Math.max(8, gapSize * 1.3));
    doc.setTextColor(30, 41, 59);

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N - 1; c++) {
        const sign = hMap[`${r},${c}`];
        if (sign) {
          const midX = startX + c * (cellSize + gapSize) + cellSize + gapSize / 2;
          const midY = startY + r * (cellSize + gapSize) + cellSize / 2 + gapSize * 0.35;
          doc.text(sign, midX, midY, { align: "center" });
        }
      }
    }

    // 3. Draw Vertical inequalities (^ or v)
    for (let r = 0; r < N - 1; r++) {
      for (let c = 0; c < N; c++) {
        const sign = vMap[`${r},${c}`];
        if (sign) {
          const midX = startX + c * (cellSize + gapSize) + cellSize / 2;
          const midY = startY + r * (cellSize + gapSize) + cellSize + gapSize / 2 + gapSize * 0.35;
          doc.text(sign, midX, midY, { align: "center" });
        }
      }
    }
  };

  // 2. Puzzle Pages
  for (let pageIdx = 0; pageIdx < totalPuzzlePages; pageIdx++) {
    doc.addPage([pageWidth, pageHeight]);

    const currentPageNum = doc.internal.getNumberOfPages();
    const isOdd = currentPageNum % 2 !== 0;
    const isFacing = options.facingPages !== false;

    const marginL = isFacing ? (isOdd ? insideMargin : outsideMargin) : 36;
    const marginR = isFacing ? (isOdd ? outsideMargin : insideMargin) : 36;
    const contentW = pageWidth - marginL - marginR;
    const contentH = pageHeight - 72; // top & bottom margins

    const puzzlesOnThisPage = puzzles.slice(pageIdx * ppp, (pageIdx + 1) * ppp);

    if (ppp === 1) {
      const puz = puzzlesOnThisPage[0];
      if (puz) {
        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text(puz.title, pageWidth / 2, 54, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Difficulty: ${puz.difficulty.toUpperCase()} • Size: ${puz.size}x${puz.size}`,
          pageWidth / 2,
          68,
          { align: "center" }
        );

        const gridDim = Math.min(contentW * 0.82, contentH * 0.72);
        const gx = marginL + (contentW - gridDim) / 2;
        const gy = 86 + (contentH - gridDim) / 3;

        drawFutoshikiGrid(puz, gx, gy, gridDim, false);
      }
    } else if (ppp === 2) {
      // 2 Puzzles vertically stacked
      const slotH = contentH / 2;
      const gridDim = Math.min(contentW * 0.75, slotH - 46);

      puzzlesOnThisPage.forEach((puz, i) => {
        const topY = 40 + i * slotH;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text(puz.title, pageWidth / 2, topY + 14, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Difficulty: ${puz.difficulty.toUpperCase()} • ${puz.size}x${puz.size}`,
          pageWidth / 2,
          topY + 25,
          { align: "center" }
        );

        const gx = marginL + (contentW - gridDim) / 2;
        const gy = topY + 36;
        drawFutoshikiGrid(puz, gx, gy, gridDim, false);
      });
    } else {
      // 4 Puzzles in 2x2 grid
      const colW = contentW / 2;
      const rowH = contentH / 2;
      const gridDim = Math.min(colW * 0.85, rowH - 40);

      puzzlesOnThisPage.forEach((puz, i) => {
        const cIdx = i % 2;
        const rIdx = Math.floor(i / 2);
        const cellX = marginL + cIdx * colW;
        const cellY = 40 + rIdx * rowH;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(puz.title, cellX + colW / 2, cellY + 12, { align: "center" });

        const gx = cellX + (colW - gridDim) / 2;
        const gy = cellY + 24;
        drawFutoshikiGrid(puz, gx, gy, gridDim, false);
      });
    }

    // Page number
    if (options.showPageNumbers !== false) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(String(currentPageNum), pageWidth / 2, pageHeight - 20, {
        align: "center",
      });
    }

    currentStep++;
    onProgress?.(Math.round((currentStep / totalSteps) * 100));
  }

  // 3. Solutions Section (Answer Keys)
  if (options.includeSolutions && totalSolutionPages > 0) {
    // Solutions Cover Divider Page
    doc.addPage([pageWidth, pageHeight]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(30, 41, 59);
    doc.text("SOLUTIONS", pageWidth / 2, pageHeight * 0.45, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Futoshiki Answer Keys", pageWidth / 2, pageHeight * 0.50, {
      align: "center",
    });

    for (let solPage = 0; solPage < totalSolutionPages; solPage++) {
      doc.addPage([pageWidth, pageHeight]);

      const currentPageNum = doc.internal.getNumberOfPages();
      const isOdd = currentPageNum % 2 !== 0;
      const isFacing = options.facingPages !== false;

      const marginL = isFacing ? (isOdd ? insideMargin : outsideMargin) : 36;
      const marginR = isFacing ? (isOdd ? outsideMargin : insideMargin) : 36;
      const contentW = pageWidth - marginL - marginR;
      const contentH = pageHeight - 72;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(71, 85, 105);
      doc.text("SOLUTIONS", pageWidth / 2, 34, { align: "center" });

      // 4 Solutions per page in 2x2 grid
      const pagePuzzles = puzzles.slice(solPage * 4, (solPage + 1) * 4);
      const colW = contentW / 2;
      const rowH = contentH / 2;
      const gridDim = Math.min(colW * 0.8, rowH - 34);

      pagePuzzles.forEach((puz, i) => {
        const cIdx = i % 2;
        const rIdx = Math.floor(i / 2);
        const cellX = marginL + cIdx * colW;
        const cellY = 46 + rIdx * rowH;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(puz.title, cellX + colW / 2, cellY + 10, { align: "center" });

        const gx = cellX + (colW - gridDim) / 2;
        const gy = cellY + 18;
        drawFutoshikiGrid(puz, gx, gy, gridDim, true);
      });

      // Page number
      if (options.showPageNumbers !== false) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(String(currentPageNum), pageWidth / 2, pageHeight - 20, {
          align: "center",
        });
      }

      currentStep++;
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
    }
  }

  return doc;
}
