// lib/sudoku-pdf.ts
// Generates a KDP-ready PDF of sudoku puzzles using jsPDF (already in your
// project's dependencies). One puzzle per page, with a solutions section
// at the end — standard format for KDP puzzle books.

import jsPDF from "jspdf";
import { Grid, Difficulty } from "./sudoku";

interface PdfOptions {
  puzzles: { puzzle: Grid; solution: Grid }[];
  difficulty: Difficulty;
  title?: string;
  trimSize?: "6x9" | "8.5x11" | "5x8";
  includeSolutions?: boolean;
}

const TRIM_SIZES: Record<string, [number, number]> = {
  "6x9": [6, 9],
  "8.5x11": [8.5, 11],
  "5x8": [5, 8],
};

function drawGrid(
  doc: jsPDF,
  grid: Grid,
  startX: number,
  startY: number,
  size: number,
  showNumbers: boolean
) {
  const cellSize = size / 9;

  // Draw cells and numbers
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;

      // Thin cell border
      doc.setLineWidth(0.2);
      doc.rect(x, y, cellSize, cellSize);

      const val = grid[r][c];
      if (val !== 0 && showNumbers) {
        doc.setFontSize(cellSize * 5.5);
        doc.text(String(val), x + cellSize / 2, y + cellSize / 2 + cellSize * 0.15, {
          align: "center",
        });
      }
    }
  }

  // Thick lines for 3x3 boxes
  doc.setLineWidth(0.8);
  for (let i = 0; i <= 9; i += 3) {
    const offset = i * cellSize;
    doc.line(startX + offset, startY, startX + offset, startY + size); // vertical
    doc.line(startX, startY + offset, startX + size, startY + offset); // horizontal
  }

  // Outer border
  doc.setLineWidth(1);
  doc.rect(startX, startY, size, size);
}

export function generatesudokuPdf({
  puzzles,
  difficulty,
  title = "sudoku Puzzle Book",
  trimSize = "8.5x11",
  includeSolutions = true,
}: PdfOptions): jsPDF {
  const [w, h] = TRIM_SIZES[trimSize];

  const doc = new jsPDF({
    unit: "in",
    format: [w, h],
  });

  const margin = 0.5;
  const gridSize = Math.min(w, h) - margin * 2 - 1; // leave room for header/footer

  // ---- Title page ----
  doc.setFontSize(28);
  doc.text(title, w / 2, h / 3, { align: "center" });
  doc.setFontSize(14);
  doc.text(
    `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty`,
    w / 2,
    h / 3 + 0.4,
    { align: "center" }
  );
  doc.setFontSize(11);
  doc.text(`${puzzles.length} Puzzles`, w / 2, h / 3 + 0.7, { align: "center" });

  // ---- Puzzle pages ----
  puzzles.forEach((p, idx) => {
    doc.addPage();
    doc.setFontSize(16);
    doc.text(`Puzzle ${idx + 1}`, w / 2, margin + 0.3, { align: "center" });

    const gridX = (w - gridSize) / 2;
    const gridY = margin + 0.6;

    drawGrid(doc, p.puzzle, gridX, gridY, gridSize, true);

    doc.setFontSize(9);
    doc.text(`Difficulty: ${difficulty}`, margin, h - margin / 2);
  });

  // ---- Solutions section ----
  if (includeSolutions) {
    doc.addPage();
    doc.setFontSize(20);
    doc.text("Solutions", w / 2, margin + 0.4, { align: "center" });

    // Pack 4 small solution grids per page (2x2)
    const smallGridSize = (w - margin * 3) / 2 - 0.3;
    let solutionsOnPage = 0;

    puzzles.forEach((p, idx) => {
      const col = solutionsOnPage % 2;
      const row = Math.floor(solutionsOnPage / 2) % 2;

      if (solutionsOnPage > 0 && solutionsOnPage % 4 === 0) {
        doc.addPage();
      }

      const x = margin + col * (smallGridSize + 0.4);
      const y = margin + 0.8 + row * (smallGridSize + 0.6);

      doc.setFontSize(9);
      doc.text(`Puzzle ${idx + 1}`, x, y - 0.1);
      drawGrid(doc, p.solution, x, y, smallGridSize, true);

      solutionsOnPage++;
    });
  }

  return doc;
}

export function downloadsudokuPdf(options: PdfOptions, filename = "sudoku-book.pdf") {
  const doc = generatesudokuPdf(options);
  doc.save(filename);
}