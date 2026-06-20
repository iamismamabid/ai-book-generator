// src/lib/sudoku-pdf.ts
import { jsPDF } from "jspdf";
import { Grid, Difficulty } from "./sudokuGenerator";

interface PdfOptions {
  puzzles: { puzzle: Grid; solution: Grid }[];
  difficulty: Difficulty;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title: string;
}

export function downloadSudokuPdf(options: PdfOptions, filename: string) {
  // Determine dimensions based on trim size selection
  let width = 8.5;
  let height = 11;
  if (options.trimSize === "6x9") { width = 6; height = 9; }
  if (options.trimSize === "5x8") { width = 5; height = 8; }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [width, height],
  });

  // Loop through generated puzzles and compile pages
  options.puzzles.forEach((item, index) => {
    if (index > 0) doc.addPage();

    // Render Title Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${options.title} #${index + 1}`, width / 2, 0.8, { align: "center" });

    // Simple Sudoku Grid Drawing Layout Blueprint
    const gridSize = Math.min(width - 1.5, height - 3);
    const cellSize = gridSize / 9;
    const startX = (width - gridSize) / 2;
    const startY = 1.5;

    doc.setLineWidth(0.01);
    doc.setDrawColor(100, 100, 100);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        // Draw outer cell frame border box
        doc.rect(x, y, cellSize, cellSize);

        // Render values
        const val = item.puzzle[r][c];
        if (val !== 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          doc.text(val.toString(), x + cellSize / 2, y + cellSize / 2 + 0.05, {
            align: "center",
          });
        }
      }
    }
  });

  // Save out PDF file system buffer trace
  doc.save(filename);
}