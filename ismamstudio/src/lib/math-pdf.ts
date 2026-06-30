// src/lib/math-pdf.ts
// Generates print-ready PDFs for Math Puzzles (Addition, Multiplication, Number Fill)
// Each puzzle gets its own page with the puzzle grid + solution key on the SAME page.

import { jsPDF } from "jspdf";

// ─── Shared Helpers ───────────────────────────────────────────────────────────

/** Converts mm → pt-agnostic value (jsPDF mm unit passthrough). */
const mm = (v: number) => v;

/** Draws a centered bold title */
function drawTitle(
  pdf: jsPDF,
  text: string,
  y: number,
  pageWidth: number,
  color: [number, number, number] = [20, 20, 30],
  size = 16
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  pdf.text(text, pageWidth / 2, y, { align: "center" });
}

/** Draws a faint horizontal divider */
function drawDivider(pdf: jsPDF, y: number, margin: number, pageWidth: number) {
  pdf.setDrawColor(200, 200, 210);
  pdf.setLineWidth(0.4);
  pdf.line(margin, y, pageWidth - margin, y);
}

// ─── MULTIPLICATION ───────────────────────────────────────────────────────────

function drawMultiplicationGrid(
  pdf: jsPDF,
  puzzleData: any,
  isSolution: boolean,
  startY: number,
  margin: number,
  pageWidth: number
): number {
  const cols = 5;
  const usableWidth = pageWidth - margin * 2;
  const cellW = usableWidth / cols;   // wider — spans full usable width
  const cellH = cellW * 0.75;         // shorter than wide for a wider look

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * cellW;
      const y = startY + r * cellH;

      // Fill
      if (r === 0 || c === 0) {
        pdf.setFillColor(235, 235, 248); // light indigo header
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.setDrawColor(100, 100, 120);
      pdf.setLineWidth(0.4);
      pdf.rect(x, y, cellW, cellH, "FD");

      // Content
      let text = "";
      let isHidden = false;
      let isAnswer = false;

      if (r === 0 && c === 0) {
        text = "×";
      } else if (r === 0) {
        text = String(puzzleData.colFactors[c - 1]);
        isHidden = puzzleData.hiddenCols.includes(c - 1) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenCols.includes(c - 1);
      } else if (c === 0) {
        text = String(puzzleData.rowFactors[r - 1]);
        isHidden = puzzleData.hiddenRows.includes(r - 1) && !isSolution;
        isAnswer = isSolution && puzzleData.hiddenRows.includes(r - 1);
      } else {
        text = String(puzzleData.grid[r - 1][c - 1]);
        isHidden = puzzleData.hiddenProducts.some(
          (p: any) => p[0] === r - 1 && p[1] === c - 1
        ) && !isSolution;
        isAnswer =
          isSolution &&
          puzzleData.hiddenProducts.some(
            (p: any) => p[0] === r - 1 && p[1] === c - 1
          );
      }

      if (!isHidden) {
        pdf.setFontSize(r === 0 || c === 0 ? 14 : 13);
        if (r === 0 && c === 0) {
          pdf.setTextColor(79, 70, 229);
        } else if (isAnswer) {
          pdf.setTextColor(79, 70, 229);
        } else if (r === 0 || c === 0) {
          pdf.setTextColor(40, 40, 60);
        } else {
          pdf.setTextColor(15, 23, 42);
        }
        pdf.setFont("helvetica", "bold");
        pdf.text(text, x + cellW / 2, y + cellH / 2 + 1.5, {
          align: "center",
          baseline: "middle",
        });
      } else {
        // draw an underscore placeholder
        pdf.setDrawColor(160, 160, 170);
        pdf.setLineWidth(0.6);
        pdf.line(x + cellW * 0.25, y + cellH * 0.72, x + cellW * 0.75, y + cellH * 0.72);
      }
    }
  }

  return startY + cols * cellH; // return bottom Y
}

// ─── ADDITION ────────────────────────────────────────────────────────────────

/**
 * 3×3 grid of values, displayed with + / = operators between them.
 * Layout:
 *   a + b = c
 *   +   +   +   (visual, not a row)
 *   d + e = f
 *   =   =   =
 *   g + h = i
 */
function drawAdditionGrid(
  pdf: jsPDF,
  puzzleData: any,
  isSolution: boolean,
  startY: number,
  margin: number,
  pageWidth: number
): number {
  const usableWidth = pageWidth - margin * 2;
  const cellW = usableWidth / 5;   // 3 cells + 2 operator gaps
  const cellH = 18;
  const opW = cellW * 0.6;         // narrower for operator
  const gapH = 10;                 // vertical operator gap

  // Column layout: [cell][op][cell][op][cell]
  // Row layout:    [row][op-row][row][op-row][row]
  const colXs = [
    margin,
    margin + cellW,
    margin + cellW + opW,
    margin + 2 * cellW + opW,
    margin + 2 * cellW + 2 * opW,
  ];
  const cellCols = [0, 2, 4];
  const opHCols = [1, 3];

  const rowYs = [
    startY,
    startY + cellH,
    startY + cellH + gapH,
    startY + 2 * cellH + gapH,
    startY + 2 * cellH + 2 * gapH,
  ];
  const cellRows = [0, 2, 4];
  const opVRows = [1, 3];

  // Draw cells
  for (let ri = 0; ri < 3; ri++) {
    for (let ci = 0; ci < 3; ci++) {
      const idx = ri * 3 + ci;
      const val = puzzleData.grid[idx];
      const isHidden = puzzleData.hiddenIndices.includes(idx) && !isSolution;
      const isAnswer = isSolution && puzzleData.hiddenIndices.includes(idx);

      const x = colXs[cellCols[ci]];
      const y = rowYs[cellRows[ri]];

      // Background
      if (isHidden) {
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(180, 180, 200);
      } else if (isAnswer) {
        pdf.setFillColor(238, 242, 255);
        pdf.setDrawColor(129, 140, 248);
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(80, 80, 100);
      }
      pdf.setLineWidth(isHidden ? 0.3 : 0.5);
      pdf.rect(x, y, cellW, cellH, "FD");

      if (!isHidden) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(isAnswer ? 79 : 15, isAnswer ? 70 : 23, isAnswer ? 229 : 42);
        pdf.text(String(val), x + cellW / 2, y + cellH / 2 + 1.5, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // Draw horizontal operators (+ and =) between cells in same row
  const hOps = ["+", "="];
  for (let ri = 0; ri < 3; ri++) {
    for (let oi = 0; oi < 2; oi++) {
      const x = colXs[opHCols[oi]];
      const y = rowYs[cellRows[ri]];
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(120, 120, 140);
      pdf.text(hOps[oi], x + opW / 2, y + cellH / 2 + 1.5, {
        align: "center",
        baseline: "middle",
      });
    }
  }

  // Draw vertical operators (+ and =) between rows in same column
  const vOps = ["+", "="];
  for (let ci = 0; ci < 3; ci++) {
    for (let oi = 0; oi < 2; oi++) {
      const x = colXs[cellCols[ci]];
      const y = rowYs[opVRows[oi]];
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(120, 120, 140);
      pdf.text(vOps[oi], x + cellW / 2, y + gapH / 2 + 1, {
        align: "center",
        baseline: "middle",
      });
    }
  }

  return rowYs[4] + cellH + 4;
}

// ─── NUMBER FILL ──────────────────────────────────────────────────────────────

function drawNumberFillGrid(
  pdf: jsPDF,
  puzzleData: any,
  isSolution: boolean,
  startY: number,
  margin: number,
  pageWidth: number
): number {
  const cols = 5; // 4 data + 1 sum col
  const rows = 5; // 4 data + 1 sum row
  const usableWidth = pageWidth - margin * 2;
  const cellW = usableWidth / cols;
  const cellH = cellW * 0.75;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * cellW;
      const y = startY + r * cellH;

      const isSumCell = r === 4 || c === 4;
      const isCorner = r === 4 && c === 4;

      if (isCorner) {
        // skip corner
        continue;
      }

      let displayVal = "";
      let isHidden = false;
      let isAnswer = false;

      if (isSumCell) {
        displayVal = String(
          c === 4 ? puzzleData.rowSums[r] : puzzleData.colSums[c]
        );
        pdf.setFillColor(235, 235, 248);
        pdf.setDrawColor(100, 100, 200);
      } else {
        displayVal = String(puzzleData.grid[r][c]);
        isHidden =
          puzzleData.hiddenCells.some(
            (cell: any) => cell[0] === r && cell[1] === c
          ) && !isSolution;
        isAnswer =
          isSolution &&
          puzzleData.hiddenCells.some(
            (cell: any) => cell[0] === r && cell[1] === c
          );

        if (isHidden) {
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(180, 180, 200);
        } else if (isAnswer) {
          pdf.setFillColor(238, 242, 255);
          pdf.setDrawColor(129, 140, 248);
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(100, 100, 120);
        }
      }

      pdf.setLineWidth(0.4);
      pdf.rect(x, y, cellW, cellH, "FD");

      if (!isHidden) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(isSumCell ? 12 : 13);
        pdf.setTextColor(
          isSumCell ? 79 : isAnswer ? 79 : 15,
          isSumCell ? 70 : isAnswer ? 70 : 23,
          isSumCell ? 229 : isAnswer ? 229 : 42
        );
        pdf.text(displayVal, x + cellW / 2, y + cellH / 2 + 1.5, {
          align: "center",
          baseline: "middle",
        });
      } else {
        pdf.setDrawColor(160, 160, 170);
        pdf.setLineWidth(0.6);
        pdf.line(x + cellW * 0.25, y + cellH * 0.72, x + cellW * 0.75, y + cellH * 0.72);
      }
    }
  }

  return startY + rows * cellH;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export type MathPuzzleType = "addition" | "multiplication" | "number_fill";

/**
 * Generates a PDF containing `puzzles.length` pages.
 * Each page has: puzzle title → puzzle grid → divider → solution title → solution grid.
 */
export function downloadMathPDF(
  puzzleType: MathPuzzleType,
  puzzles: any[],
  filename = "Math_Puzzles.pdf"
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();   // 210
  const pageH = pdf.internal.pageSize.getHeight();  // 297
  const margin = mm(15);

  const typeLabel =
    puzzleType === "addition"
      ? "Addition Puzzle"
      : puzzleType === "multiplication"
      ? "Multiplication Table"
      : "Number Fill Puzzle";

  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) pdf.addPage();

    let y = mm(18);

    // ── Puzzle Section ────────────────────────────────────────────
    drawTitle(pdf, `${typeLabel} #${idx + 1}`, y, pageW, [20, 20, 30], 17);
    y += mm(6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      puzzleType === "addition"
        ? "Fill in the blank boxes to make all equations correct."
        : puzzleType === "multiplication"
        ? "Fill in the missing factors and products."
        : "Complete the grid so rows and columns match the targets.",
      pageW / 2,
      y,
      { align: "center" }
    );
    y += mm(8);

    if (puzzleType === "multiplication") {
      y = drawMultiplicationGrid(pdf, puzzle, false, y, margin, pageW) + mm(4);
    } else if (puzzleType === "addition") {
      y = drawAdditionGrid(pdf, puzzle, false, y, margin, pageW) + mm(4);
    } else {
      y = drawNumberFillGrid(pdf, puzzle, false, y, margin, pageW) + mm(4);
    }

    // ── Divider ───────────────────────────────────────────────────
    drawDivider(pdf, y, margin, pageW);
    y += mm(6);

    // ── Solution Section ──────────────────────────────────────────
    drawTitle(pdf, `Solution Key #${idx + 1}`, y, pageW, [79, 70, 229], 14);
    y += mm(7);

    if (puzzleType === "multiplication") {
      drawMultiplicationGrid(pdf, puzzle, true, y, margin, pageW);
    } else if (puzzleType === "addition") {
      drawAdditionGrid(pdf, puzzle, true, y, margin, pageW);
    } else {
      drawNumberFillGrid(pdf, puzzle, true, y, margin, pageW);
    }

    // ── Page number footer ────────────────────────────────────────
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${idx + 1}`, pageW - margin, pageH - mm(8), { align: "right" });
  });

  pdf.save(filename);
}
