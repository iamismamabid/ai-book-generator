/**
 * KDPage Nonogram PDF Exporter
 * 300 DPI Vector PDF generator for Amazon KDP Print-Ready Interiors
 */

import jsPDF from "jspdf";
import { NonogramPuzzle } from "./nonogramEngine";
import { getTrimDimensions, KdpTrimSize } from "./kdpTrimSizes";

export interface NonogramPdfOptions {
  trimSize: KdpTrimSize;
  includeSolutions: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  authorName?: string;
  solutionsPerPage?: 4 | 6 | 9;
  showPageNumbers?: boolean;
}

export async function exportNonogramBookPdf(
  puzzles: NonogramPuzzle[],
  options: NonogramPdfOptions,
  onProgress?: (percent: number) => void
): Promise<jsPDF> {
  const dims = getTrimDimensions(options.trimSize);
  const widthInches = dims.widthInches || dims.width || dims.w || 8.5;
  const heightInches = dims.heightInches || dims.height || dims.h || 11;
  const pageWidth = widthInches * 72; // jsPDF points
  const pageHeight = heightInches * 72;

  const doc = new jsPDF({
    orientation: widthInches > heightInches ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
  });

  const totalSteps = puzzles.length + (options.includeSolutions ? Math.ceil(puzzles.length / (options.solutionsPerPage || 4)) : 0);
  let currentStep = 0;

  // 1. Cover / Title Page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text(options.bookTitle || "NONOGRAM PUZZLE BOOK", pageWidth / 2, pageHeight * 0.38, { align: "center" });

  if (options.bookSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(options.bookSubtitle, pageWidth / 2, pageHeight * 0.44, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`${puzzles.length} Japanese Logic Pixel Art Puzzles with Solutions`, pageWidth / 2, pageHeight * 0.50, { align: "center" });

  if (options.authorName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Created by ${options.authorName}`, pageWidth / 2, pageHeight * 0.75, { align: "center" });
  }

  // 2. Render Each Puzzle Page
  for (let i = 0; i < puzzles.length; i++) {
    doc.addPage([pageWidth, pageHeight]);
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

    const puzzle = puzzles[i];
    renderSinglePuzzlePage(doc, puzzle, i + 1, pageWidth, pageHeight, options.showPageNumbers !== false);
  }

  // 3. Render Solutions Section (if enabled)
  if (options.includeSolutions && puzzles.length > 0) {
    // Divider Page
    doc.addPage([pageWidth, pageHeight]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(30, 41, 59);
    doc.text("SOLUTIONS", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Answer keys to verify your pixel art pictures", pageWidth / 2, pageHeight / 2 + 15, { align: "center" });

    const perPage = options.solutionsPerPage || 4;
    const solutionChunks: NonogramPuzzle[][] = [];
    for (let i = 0; i < puzzles.length; i += perPage) {
      solutionChunks.push(puzzles.slice(i, i + perPage));
    }

    let solutionPageIndex = 1;
    for (const chunk of solutionChunks) {
      doc.addPage([pageWidth, pageHeight]);
      currentStep++;
      if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));

      renderSolutionsPage(doc, chunk, solutionPageIndex++, pageWidth, pageHeight, perPage);
    }
  }

  return doc;
}

function renderSinglePuzzlePage(
  doc: jsPDF,
  puzzle: NonogramPuzzle,
  puzzleNum: number,
  pageWidth: number,
  pageHeight: number,
  showPageNumber: boolean
) {
  const margin = 40;
  const headerHeight = 60;
  const footerHeight = 40;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`PUZZLE #${puzzleNum}`, margin, margin + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`${puzzle.width}x${puzzle.height} ${puzzle.difficulty.toUpperCase()} • ${puzzle.category || "LOGIC"}`, pageWidth - margin, margin + 20, { align: "right" });

  // Thin dividing line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

  // Calculate Clue Bounds
  const maxRowClues = Math.max(...puzzle.clues.rows.map((r) => r.length), 1);
  const maxColClues = Math.max(...puzzle.clues.cols.map((c) => c.length), 1);

  // Available area for grid + clues
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin - headerHeight - footerHeight;

  // Dynamic cell size
  const maxCellWidth = (availWidth * 0.70) / puzzle.width;
  const maxCellHeight = (availHeight * 0.70) / puzzle.height;
  const cellSize = Math.min(maxCellWidth, maxCellHeight, 28);

  const gridWidth = puzzle.width * cellSize;
  const gridHeight = puzzle.height * cellSize;

  const leftClueWidth = maxRowClues * (cellSize * 0.75);
  const topClueHeight = maxColClues * (cellSize * 0.75);

  const totalBoardWidth = leftClueWidth + gridWidth;
  const totalBoardHeight = topClueHeight + gridHeight;

  const startX = (pageWidth - totalBoardWidth) / 2;
  const startY = margin + headerHeight + (availHeight - totalBoardHeight) / 2;

  const gridX = startX + leftClueWidth;
  const gridY = startY + topClueHeight;

  // 1. Render Top Column Clues
  doc.setFont("helvetica", "bold");
  const colFontSize = Math.max(7, Math.min(cellSize * 0.5, 11));
  doc.setFontSize(colFontSize);
  doc.setTextColor(51, 65, 85);

  for (let c = 0; c < puzzle.width; c++) {
    const clues = puzzle.clues.cols[c] || [0];
    const cellCenterX = gridX + c * cellSize + cellSize / 2;
    const clueStep = topClueHeight / maxColClues;

    // Align clues from bottom up
    for (let i = 0; i < clues.length; i++) {
      const clueVal = clues[clues.length - 1 - i];
      const clueY = gridY - 5 - i * clueStep;
      doc.text(String(clueVal), cellCenterX, clueY, { align: "center" });
    }
  }

  // 2. Render Left Row Clues
  const rowFontSize = Math.max(7, Math.min(cellSize * 0.5, 11));
  doc.setFontSize(rowFontSize);

  for (let r = 0; r < puzzle.height; r++) {
    const clues = puzzle.clues.rows[r] || [0];
    const cellCenterY = gridY + r * cellSize + cellSize / 2 + rowFontSize / 3;
    const clueStep = leftClueWidth / maxRowClues;

    // Align clues from right to left
    for (let i = 0; i < clues.length; i++) {
      const clueVal = clues[clues.length - 1 - i];
      const clueX = gridX - 6 - i * clueStep;
      doc.text(String(clueVal), clueX, cellCenterY, { align: "right" });
    }
  }

  // 3. Render Grid Lines (Fine lines for cells, Bold lines every 5 cells)
  for (let r = 0; r <= puzzle.height; r++) {
    const y = gridY + r * cellSize;
    const isMajor = r % 5 === 0;
    doc.setDrawColor(isMajor ? 15 : 148, isMajor ? 23 : 163, isMajor ? 42 : 184);
    doc.setLineWidth(isMajor ? 1.5 : 0.5);
    doc.line(gridX, y, gridX + gridWidth, y);
  }

  for (let c = 0; c <= puzzle.width; c++) {
    const x = gridX + c * cellSize;
    const isMajor = c % 5 === 0;
    doc.setDrawColor(isMajor ? 15 : 148, isMajor ? 23 : 163, isMajor ? 42 : 184);
    doc.setLineWidth(isMajor ? 1.5 : 0.5);
    doc.line(x, gridY, x, gridY + gridHeight);
  }

  // Footer Page Number
  if (showPageNumber) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(String(puzzleNum), pageWidth / 2, pageHeight - margin + 15, { align: "center" });
  }
}

function renderSolutionsPage(
  doc: jsPDF,
  puzzles: NonogramPuzzle[],
  pageIndex: number,
  pageWidth: number,
  pageHeight: number,
  perPage: number
) {
  const margin = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`SOLUTIONS (Part ${pageIndex})`, margin, margin + 20);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

  const cols = perPage === 9 ? 3 : 2;
  const rows = perPage === 9 ? 3 : perPage === 6 ? 3 : 2;

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - 70;

  const cellBoxWidth = contentWidth / cols;
  const cellBoxHeight = contentHeight / rows;

  puzzles.forEach((puzzle, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);

    const boxX = margin + colIdx * cellBoxWidth;
    const boxY = margin + 50 + rowIdx * cellBoxHeight;

    // Mini solution header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`${puzzle.title}`, boxX + cellBoxWidth / 2, boxY + 12, { align: "center" });

    // Render Mini Filled Grid
    const maxDrawWidth = cellBoxWidth - 30;
    const maxDrawHeight = cellBoxHeight - 35;
    const miniCell = Math.min(maxDrawWidth / puzzle.width, maxDrawHeight / puzzle.height, 14);

    const miniGridW = puzzle.width * miniCell;
    const miniGridH = puzzle.height * miniCell;
    const miniStartX = boxX + (cellBoxWidth - miniGridW) / 2;
    const miniStartY = boxY + 20 + (maxDrawHeight - miniGridH) / 2;

    // Draw Filled Cells
    doc.setFillColor(30, 41, 59);
    for (let r = 0; r < puzzle.height; r++) {
      for (let c = 0; c < puzzle.width; c++) {
        if (puzzle.grid[r][c] === 1) {
          doc.rect(miniStartX + c * miniCell, miniStartY + r * miniCell, miniCell, miniCell, "F");
        }
      }
    }

    // Draw Mini Grid Outline & 5x5 lines
    for (let r = 0; r <= puzzle.height; r++) {
      const y = miniStartY + r * miniCell;
      doc.setDrawColor(r % 5 === 0 ? 0 : 180);
      doc.setLineWidth(r % 5 === 0 ? 0.8 : 0.3);
      doc.line(miniStartX, y, miniStartX + miniGridW, y);
    }
    for (let c = 0; c <= puzzle.width; c++) {
      const x = miniStartX + c * miniCell;
      doc.setDrawColor(c % 5 === 0 ? 0 : 180);
      doc.setLineWidth(c % 5 === 0 ? 0.8 : 0.3);
      doc.line(x, miniStartY, x, miniStartY + miniGridH);
    }
  });
}
