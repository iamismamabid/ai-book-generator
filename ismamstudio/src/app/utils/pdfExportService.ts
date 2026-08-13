import { jsPDF } from "jspdf";
import { getGutterMargin } from "@/lib/pdfFormatter";
import { drawPageBorderTheme } from "./borderThemeDrawing";
import { BorderThemeId } from "@/lib/borderThemes";
import { drawColoringPattern } from "@/lib/coloringBookPatterns";

export interface ExportOptions {
  includeCover?: boolean;
  coverState?: any;
  includePageNumbers?: boolean;
  gutterMargin?: boolean;
  trimSize?: { label: string; w: number; h: number };
  isPremium?: boolean;
  borderTheme?: BorderThemeId;
}

export const exportBookToPDF = async (bookPages: any[], options: ExportOptions = {}) => {
  const {
    includeCover = false,
    coverState = null,
    includePageNumbers = true,
    gutterMargin = false,
    trimSize = { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
    borderTheme,
  } = options;

  const w = trimSize.w;
  const h = trimSize.h;
  
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [w, h] });
  let firstPageAdded = false;

  // KDP's required binding gutter scales with page count (0.375" up to 150
  // pages, rising to 0.875" past 700) -- a flat 0.375" shift under-serves
  // thicker books and risks content getting lost in the spine.
  const requiredGutter = getGutterMargin(bookPages.length);

  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', w, h);
    firstPageAdded = true;
  }

  // 2. Add Interior Pages
  bookPages.forEach((page, index) => {
    if (firstPageAdded || index > 0) {
      doc.addPage([w, h], "portrait");
    }
    firstPageAdded = true;

    // Apply gutter margin if requested
    const leftMarginShift = gutterMargin ? (index % 2 === 0 ? requiredGutter : 0) : 0;

    // Page Title (except for title/blank pages)
    if (page.type !== 'title' && page.type !== 'blank') {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      const isSol = page.config.isSolution || false;
      const isMultiSol = page.config.isMultiSolution || false;
      const solSuffix = isSol
        ? (!isMultiSol && page.config.pageNumber ? ` (PAGE ${page.config.pageNumber} SOLUTION)` : ' (SOLUTION)')
        : '';
      const title = `${page.type.replace('_', ' ').toUpperCase()}${solSuffix}`;
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (w - titleWidth) / 2 + leftMarginShift, 0.6);

      // Render Page Number
      if (includePageNumbers) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Page ${index + 1}`, w - 1.0 + leftMarginShift, h - 0.6);
      }
    }

    if (page.type === 'crossword' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawCrosswordSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'crossword' && page.config.gridData) {
      drawCrossword(doc, page, leftMarginShift, w);
    } else if (page.type === 'word_search' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawWordSearchSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'word_search' && page.config.gridData) {
      drawWordSearch(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'sudoku' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawSudokuSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'sudoku' && page.config.gridData) {
      drawSudoku(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'kakuro' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawKakuroSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'kakuro' && page.config.gridData) {
      drawKakuro(doc, page, leftMarginShift, w);
    } else if (page.type === 'maze' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawMazeSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'maze' && page.config.gridData) {
      drawMaze(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'word_scramble' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawWordScrambleSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'word_scramble' && page.config.scrambledData) {
      drawWordScramble(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'cryptogram' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawCryptogramSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'cryptogram' && page.config.cryptogramData) {
      drawCryptogram(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'math_puzzle' && page.config.isMultiSolution && page.config.solutionGroup) {
      drawMathPuzzleSolutionPack(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'math_puzzle' && page.config.puzzleData) {
      drawMathPuzzle(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'coloring_book' && page.config.presetId) {
      drawColoringBookPage(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'low_content') {
      drawLowContent(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'title') {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(32);
      const titleText = page.config.title || "Book Title";
      const titleW = doc.getTextWidth(titleText);
      doc.text(titleText, (w - titleW) / 2 + leftMarginShift, h * 0.3);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(16);
      const subtitleText = page.config.subtitle || "Book Subtitle";
      const subtitleW = doc.getTextWidth(subtitleText);
      doc.text(subtitleText, (w - subtitleW) / 2 + leftMarginShift, h * 0.38);

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(14);
      const authorText = page.config.author ? `By ${page.config.author}` : "Author Name";
      const authorW = doc.getTextWidth(authorText);
      doc.text(authorText, (w - authorW) / 2 + leftMarginShift, h * 0.68);
    }

    // Apply the decorative border theme and the free-tier watermark
    if (borderTheme && borderTheme !== "none") {
      drawPageBorderTheme(doc, borderTheme, w, h, leftMarginShift);
    }
    if (!options.isPremium) {
      drawWatermark(doc, w, h);
    }
  });

  // 3. Add Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage([w, h], "portrait");
    await drawCoverPagePart(doc, coverState, 'back', w, h);
  }

  doc.save("My_KDP_Puzzle_Book.pdf");
};

// helper: Wrap text inside canvas 2D context
function wrapCanvasText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const paragraphs = text.split('\n');
  let currentY = y;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
}

// helper: Draw Watermark for Free Tier
export function drawWatermark(doc: any, w: number, h: number) {
  try {
    doc.saveGraphicsState();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(56);
    doc.setTextColor(140, 140, 140); // darker grey for high visibility

    // Try drawing with opacity/transparency
    try {
      if (doc.GState) {
        const gState = new doc.GState({ opacity: 0.22 });
        doc.setGState(gState);
      }
    } catch (gErr) {
      // ignore GState errors (older browsers / standard pdf compatibility)
    }

    doc.text("SAMPLE - KDPAGE", w / 2, h / 2, {
      align: "center",
      angle: 45
    });

    doc.restoreGraphicsState();
  } catch (err) {
    console.error("Error drawing PDF watermark:", err);
  }
}

// helper: Draw dashed margin/safe-zone guide box for layout review (not meant for final upload)
export function drawMarginGuides(doc: any, marginL: number, marginR: number, marginT: number, marginB: number, pageW: number, pageH: number) {
  try {
    doc.saveGraphicsState();
    doc.setDrawColor(129, 140, 248); // indigo-400
    doc.setLineWidth(0.008);
    if (typeof doc.setLineDashPattern === "function") {
      doc.setLineDashPattern([0.05, 0.05], 0);
    }
    doc.rect(marginL, marginT, pageW - marginL - marginR, pageH - marginT - marginB);
    if (typeof doc.setLineDashPattern === "function") {
      doc.setLineDashPattern([], 0);
    }
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("Error drawing margin guides:", err);
  }
}

// Helper: Draw a non-living coloring/color-by-number page. Renders the
// shared canvas pattern offscreen at 300 DPI and embeds it as a PNG --
// same raster-embed approach Cover Studio already uses for its own
// canvas-based designs, since this art (mandalas, lattices, wave contours)
// is generated procedurally on a 2D canvas, not drawn as jsPDF vector
// primitives like the grid-based puzzle types.
const drawColoringBookPage = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const margin = 0.5;
  const topReserved = 0.95;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  if (safeW <= 0 || safeH <= 0) return;

  const dpi = 300;
  const pxW = Math.max(1, Math.round(safeW * dpi));
  const pxH = Math.max(1, Math.round(safeH * dpi));

  const canvas = document.createElement("canvas");
  canvas.width = pxW;
  canvas.height = pxH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawColoringPattern(ctx, pxW, pxH, {
    presetId: page.config.presetId,
    complexity: page.config.complexity ?? 12,
    lineWidth: page.config.lineWidth ?? 3,
    isColorByNumber: page.config.isColorByNumber ?? true,
    isMidnightMode: page.config.isMidnightMode ?? false,
    frameStyle: page.config.frameStyle || "ornamental",
    seed: page.config.seed ?? 42,
  });

  doc.addImage(canvas.toDataURL("image/png", 1.0), "PNG", margin + xShift, topReserved, safeW, safeH);
};

// Helper: Draw Crossword Grid & Clues
const drawCrossword = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;
  const gridSize = 15;
  
  // Calculate dynamic cellSize to avoid margin overflows (especially on 6"x9" and 5"x8" sizes)
  const maxW = pageWidth - 1.0 - Math.abs(xShift);
  const cellSize = Math.min(0.3, maxW / gridSize);
  
  const startX = (pageWidth - gridSize * cellSize) / 2 + xShift;
  const startY = 1.3;

  doc.setLineWidth(cellSize * 0.033);
  doc.setDrawColor(30, 41, 59);

  // Draw grid
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((cell: string, c: number) => {
      const x = startX + (c * cellSize);
      const y = startY + (r * cellSize);
      
      if (cell === '') {
        // Black block
        doc.setFillColor(30, 41, 59);
        doc.rect(x, y, cellSize, cellSize, "F");
      } else {
        // White cell
        doc.rect(x, y, cellSize, cellSize);
        
        // Find if a word starts here
        const wordStart = data.placedWords.find((w: any) => w.r === r && w.c === c);
        if (wordStart) {
          doc.setFontSize(Math.max(4.5, Math.floor(cellSize * 20)));
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          doc.text(String(wordStart.num), x + cellSize * 0.1, y + cellSize * 0.3);
        }

        // Draw solved letter if it is solution mode
        if (isSolution) {
          doc.setFontSize(Math.max(8, Math.floor(cellSize * 40)));
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          const letterWidth = doc.getTextWidth(cell);
          doc.text(cell, x + (cellSize - letterWidth) / 2, y + cellSize * 0.73);
        }
      }
    });
  });

  // Reset text color
  doc.setTextColor(0);

  // Clues (only draw clues on the puzzle page, skip on solution pages to save space)
  if (!isSolution) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    const clueY = startY + (gridSize * cellSize) + 0.4;
    
    // Across Clues
    doc.text("ACROSS", startX + 0.2, clueY);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    let acrossOffset = 0.2;
    data.placedWords.filter((w: any) => w.dir === 'H').forEach((w: any) => {
      doc.text(`${w.num}. ${w.clue}`, startX + 0.2, clueY + acrossOffset);
      acrossOffset += 0.17;
    });

    // Down Clues
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DOWN", startX + 2.5, clueY);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    let downOffset = 0.2;
    data.placedWords.filter((w: any) => w.dir === 'V').forEach((w: any) => {
      doc.text(`${w.num}. ${w.clue}`, startX + 2.5, clueY + downOffset);
      downOffset += 0.17;
    });
  }
};

// Helper: Draw Word Search Grid
// --- SHARED WORD SEARCH PDF PRIMITIVES ---
// Single implementation of grid + word-list rendering, reused by the
// BookBuilder export flow below, the standalone Word Search Studio
// (src/app/tools/word-search/WordSearchClient.tsx), and the bulk generator
// (src/lib/wordSearch-pdf.ts) so all three flows render identically styled
// puzzles instead of maintaining separate copies.
export interface WordSearchStyle {
  font?: string;
  letterFontSize?: number;
  lineWidth?: number;
  cellColor?: string;
  borderColor?: string;
  wordFont?: string;
  wordFontSize?: number;
  wordTextColor?: string;
  wordTextAlign?: 'left' | 'center';
  wordColumns?: number;
  wordRowStep?: number;
  highlightColor?: string;
  highlightTextColor?: string;
  solutionHighlighter?: 'apple' | 'fill' | 'fade';
  letterBold?: boolean;
}

const WORD_SEARCH_DEFAULT_STYLE: Required<WordSearchStyle> = {
  font: 'helvetica',
  letterFontSize: 16,
  lineWidth: 0.012,
  cellColor: '#FFFFFF',
  borderColor: '#94A3B8',
  wordFont: 'helvetica',
  wordFontSize: 11,
  wordTextColor: '#000000',
  wordTextAlign: 'left',
  wordColumns: 3,
  wordRowStep: 0.22,
  highlightColor: '#E0E7FF',
  highlightTextColor: '#4F46E5',
  solutionHighlighter: 'apple',
  letterBold: true,
};

export function drawWordSearchGrid(
  doc: any,
  data: { grid: string[][]; words: any[]; mask: boolean[][]; active?: boolean[][]; shape?: string; hiddenMessage?: { cells: { r: number; c: number }[] } },
  zone: { x: number; y: number; size: number },
  isSolution: boolean,
  style: Partial<WordSearchStyle> = {}
) {
  const s = { ...WORD_SEARCH_DEFAULT_STYLE, ...style };
  const gridSize = data.grid.length;
  const cellSize = zone.size / gridSize;
  // Shaped puzzles (circle/heart/diamond/star) mark cells outside the shape
  // inactive — those are skipped entirely so the printed page shows the
  // silhouette instead of a full rectangle. Unshaped puzzles have no `active`
  // grid at all, so every cell draws as before.
  const isActive = (r: number, c: number) => !data.active || data.active[r][c];
  const isShaped = Boolean(data.active && (data.shape ? data.shape !== 'square' : true));
  const hiddenMessageCells = new Set((data.hiddenMessage?.cells || []).map(({ r, c }) => `${r},${c}`));

  // 1. Draw all cell backgrounds first (and cell borders for square puzzles)
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((letter: string, c: number) => {
      if (!isActive(r, c)) return;
      const x = zone.x + (c * cellSize);
      const y = zone.y + (r * cellSize);
      const isWordLetter = isSolution && data.mask && data.mask[r][c];
      const isMessageLetter = isSolution && hiddenMessageCells.has(`${r},${c}`);

      doc.setDrawColor(s.borderColor);
      doc.setLineWidth(s.lineWidth);
      doc.setFillColor(s.cellColor);
      // For shaped puzzles (e.g. circle, heart, diamond), fill cells without drawing individual square box borders around every letter
      doc.rect(x, y, cellSize, cellSize, (isShaped || s.lineWidth <= 0) ? "F" : "FD");

      if (isSolution && s.solutionHighlighter === 'fill' && isWordLetter) {
        doc.setFillColor(s.highlightColor);
        doc.roundedRect(x + cellSize * 0.06, y + cellSize * 0.06, cellSize * 0.88, cellSize * 0.88, cellSize * 0.12, cellSize * 0.12, "F");
      }

      if (isMessageLetter) {
        // Distinct highlight (amber) so the revealed message reads clearly
        // against the word-search green/apple highlight used for found words.
        doc.setFillColor(252, 211, 77);
        doc.roundedRect(x + cellSize * 0.12, y + cellSize * 0.12, cellSize * 0.76, cellSize * 0.76, cellSize * 0.1, cellSize * 0.1, "F");
      }
    });
  });

  // Draw smooth outer shape outline for shaped puzzles (circle, diamond, etc.)
  if (isShaped && (s.lineWidth > 0 || !style.lineWidth)) {
    doc.setDrawColor(s.borderColor);
    doc.setLineWidth(Math.max(s.lineWidth || 0.015, 0.015));
    const currentShape = data.shape || 'circle';

    if (currentShape === 'circle' || (!data.shape && data.active)) {
      const centerX = zone.x + (zone.size / 2);
      const centerY = zone.y + (zone.size / 2);
      const radius = (zone.size / 2) - (cellSize * 0.1);
      doc.circle(centerX, centerY, radius, "S");
    } else if (currentShape === 'diamond') {
      const cx = zone.x + zone.size / 2;
      const cy = zone.y + zone.size / 2;
      const rx = (zone.size / 2) - (cellSize * 0.1);
      const ry = (zone.size / 2) - (cellSize * 0.1);
      doc.line(cx, cy - ry, cx + rx, cy);
      doc.line(cx + rx, cy, cx, cy + ry);
      doc.line(cx, cy + ry, cx - rx, cy);
      doc.line(cx - rx, cy, cx, cy - ry);
    }
  }

  // 2. "Apple style" solution markers: each found word is its own opaque rounded-
  // rectangle "sticker" (flat sides, small rounded corners -- not a full pill)
  // with a shadow, a border, and a fill, drawn as one complete unit per word, in
  // order, so a later word's opaque sticker fully overwrites whatever an earlier
  // word left underneath at any crossing point. Translucent fills (an earlier
  // approach) always blend into a wash wherever two shapes overlap, however
  // small the shapes are, because alpha blending combines the colors instead of
  // one simply covering the other -- opacity near 1 on the border+fill is what
  // actually stops that "merging" look, not shape or size. The rectangle can't
  // rotate via jsPDF's built-in roundedRect, so it's built manually via
  // context2d: translate+rotate to the word's angle, then trace a rounded-rect
  // path with bezierCurveTo corners (context2d.arcTo/roundRect aren't
  // implemented in this jsPDF build).
  if (isSolution && s.solutionHighlighter === 'apple') {
    doc.saveGraphicsState();
    const ctx = doc.context2d;
    const K = 0.5522847498; // cubic-bezier circular-arc approximation constant
    const setOpacity = (v: number) => {
      try {
        if (doc.GState) doc.setGState(new doc.GState({ opacity: v }));
      } catch {
        // ignore GState errors (older browsers / standalone pdf compatibility)
      }
    };

    const roundedRectPath = (x0: number, y0: number, x1: number, y1: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x0 + r, y0);
      ctx.lineTo(x1 - r, y0);
      ctx.bezierCurveTo(x1 - r + r * K, y0, x1, y0 + r - r * K, x1, y0 + r);
      ctx.lineTo(x1, y1 - r);
      ctx.bezierCurveTo(x1, y1 - r + r * K, x1 - r + r * K, y1, x1 - r, y1);
      ctx.lineTo(x0 + r, y1);
      ctx.bezierCurveTo(x0 + r - r * K, y1, x0, y1 - r + r * K, x0, y1 - r);
      ctx.lineTo(x0, y0 + r);
      ctx.bezierCurveTo(x0, y0 + r - r * K, x0 + r - r * K, y0, x0 + r, y0);
      ctx.closePath();
    };

    const padX = cellSize * 0.38;
    const halfH = cellSize * 0.26;
    const radius = cellSize * 0.09;
    const borderExtra = cellSize * 0.05; // how much bigger the border pass is than the fill pass

    data.words.forEach((w: any) => {
      const sX = zone.x + (w.startC * cellSize) + (cellSize / 2);
      const sY = zone.y + (w.startR * cellSize) + (cellSize / 2);
      const eX = zone.x + (w.endC * cellSize) + (cellSize / 2);
      const eY = zone.y + (w.endR * cellSize) + (cellSize / 2);
      const angle = Math.atan2(eY - sY, eX - sX);
      const len = Math.hypot(eX - sX, eY - sY);

      const drawPill = (dx: number, dy: number, grow: number, fill: string, opacity: number) => {
        setOpacity(opacity);
        ctx.save();
        ctx.translate(sX + dx, sY + dy);
        ctx.rotate(angle);
        roundedRectPath(-padX - grow, -halfH - grow, len + padX + grow, halfH + grow, radius + grow);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
      };

      // Shadow: soft, offset down-right, behind this word's own border+fill.
      drawPill(cellSize * 0.06, cellSize * 0.07, borderExtra, "#64748B", 0.24);
      // Border: opaque, slightly bigger than the fill so it forms a visible ring.
      drawPill(0, 0, borderExtra, "#64748B", 0.95);
      // Fill: opaque light gray, on top, at normal size.
      drawPill(0, 0, 0, "#E2E8F0", 0.98);
    });

    doc.restoreGraphicsState();
  }

  // 3. Draw all letters on top with dynamic scaling based on cellSize
  const scaledLetterFontSize = Math.max(9, Math.floor(cellSize * 36));
  doc.setFontSize(scaledLetterFontSize);
  
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((letter: string, c: number) => {
      if (!isActive(r, c) || !letter) return;
      const x = zone.x + (c * cellSize);
      const y = zone.y + (r * cellSize);
      const isWordLetter = isSolution && data.mask && data.mask[r][c];

      // Masked (answer) letters are always bold; other cells follow style.letterBold.
      doc.setFont(s.font, isWordLetter || s.letterBold ? "bold" : "normal");

      if (isWordLetter) {
        doc.setTextColor(s.solutionHighlighter === 'apple' ? '#000000' : s.highlightTextColor);
      } else if (isSolution && (s.solutionHighlighter === 'fade' || s.solutionHighlighter === 'apple')) {
        doc.setTextColor(210, 210, 210);
      } else {
        doc.setTextColor(30, 41, 59);
      }

      const letterWidth = doc.getTextWidth(letter);
      doc.text(letter, x + (cellSize - letterWidth) / 2, y + cellSize * 0.65);
    });
  });

  doc.setTextColor(0);
}

export function drawWordSearchWordList(
  doc: any,
  words: any[],
  zone: { x: number; y: number; w: number },
  opts: { isSolution?: boolean; showHeading?: boolean; style?: Partial<WordSearchStyle> } = {}
) {
  const s = { ...WORD_SEARCH_DEFAULT_STYLE, ...opts.style };
  const isSolution = opts.isSolution || false;

  // Calculate dynamic scale factor based on layout width (target width is ~4.75 in)
  const scaleFactor = zone.w < 4.75 ? zone.w / 4.75 : 1;
  const wordRowStep = s.wordRowStep * scaleFactor;

  let headingOffset = 0;
  if (opts.showHeading) {
    doc.setFont(s.wordFont, "bold");
    doc.setFontSize(Math.max(7, Math.floor(11 * scaleFactor)));
    doc.setTextColor(0);
    doc.text("WORDS TO FIND:", zone.x, zone.y);
    headingOffset = 0.25 * scaleFactor;
  }

  doc.setFont(s.wordFont, "bold");
  doc.setFontSize(Math.max(6, Math.floor(s.wordFontSize * scaleFactor)));
  doc.setTextColor(isSolution ? "#94A3B8" : s.wordTextColor);

  const colWidth = zone.w / s.wordColumns;
  // jsPDF's align:"center" centers the text ON the given x, so x itself has
  // to move to the column's midpoint for center alignment -- using the
  // column's left edge for both modes (as before) made "Center" render no
  // differently from "Left" plus an off-by-half-column shift.
  words.forEach((w: any, idx: number) => {
    const rowIdx = Math.floor(idx / s.wordColumns);
    const colIdx = idx % s.wordColumns;
    const colLeft = zone.x + (colIdx * colWidth);
    const x = s.wordTextAlign === 'center' ? colLeft + colWidth / 2 : colLeft;
    const y = zone.y + headingOffset + ((rowIdx + 1) * wordRowStep);
    doc.text(w.text, x, y, { align: s.wordTextAlign });
  });

  doc.setTextColor(0);
}

const drawWordSearch = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number = 11) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;

  const margin = 0.7;
  const safeW = pageWidth - (margin * 2);
  const safeH = (pageHeight || 11) - (margin * 2);

  const titleSpace = 0.3;
  const wordListSpace = isSolution ? 0.3 : 1.4;
  // Balanced KDP layout: grid stays well short of full page width, leaving
  // proper breathing room instead of running edge-to-edge. The solution
  // grid is capped smaller still -- it's an answer key, not a second
  // full-size puzzle to solve.
  const gridDrawSize = isSolution
    ? Math.min(safeW * 0.82, safeH - titleSpace - wordListSpace, 4.5)
    : Math.min(safeW * 0.82, safeH - titleSpace - wordListSpace);

  const startX = (pageWidth - gridDrawSize) / 2 + xShift;
  const startY = margin + titleSpace + 0.1;

  drawWordSearchGrid(doc, data, { x: startX, y: startY, size: gridDrawSize }, isSolution);

  if (!isSolution) {
    drawWordSearchWordList(doc, data.words, { x: startX, y: startY + gridDrawSize + 0.3, w: gridDrawSize }, {
      isSolution,
      showHeading: true,
      style: { wordColumns: 3, wordFontSize: 11, wordRowStep: 0.24 }
    });
  }
};

// Splits the page into 2 or 4 tiles below the generic page title (reserving
// the same 1.4" top offset drawWordSearch uses) and draws one answer grid
// per tile — reusing the shared drawWordSearchGrid primitive so answer keys
// pack multiple-per-page instead of one full page each, cutting page count
// and print cost the same way the standalone /tools/word-search generator does.
const getSolutionPackZones = (count: number, x0: number, y0: number, safeW: number, safeH: number) => {
  if (count <= 1) return [{ x: x0, y: y0, w: safeW, h: safeH }];
  if (count === 2) return [
    { x: x0, y: y0, w: safeW, h: safeH / 2 - 0.25 },
    { x: x0, y: y0 + safeH / 2 + 0.25, w: safeW, h: safeH / 2 - 0.25 },
  ];
  return [
    { x: x0, y: y0, w: safeW / 2 - 0.1, h: safeH / 2 - 0.1 },
    { x: x0 + safeW / 2 + 0.1, y: y0, w: safeW / 2 - 0.1, h: safeH / 2 - 0.1 },
    { x: x0, y: y0 + safeH / 2 + 0.1, w: safeW / 2 - 0.1, h: safeH / 2 - 0.1 },
    { x: x0 + safeW / 2 + 0.1, y: y0 + safeH / 2 + 0.1, w: safeW / 2 - 0.1, h: safeH / 2 - 0.1 },
  ];
};

const drawWordSearchSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { gridData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.4; // matches drawWordSearch's own startY, below the generic page title
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;

  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.gridData) return;

    const titleSpace = 0.3;
    // Cap at a standard answer-key size instead of stretching to fill the
    // whole zone when this puzzle is alone on the page.
    const gridDrawSize = Math.min(zone.w, zone.h - titleSpace, 4.5);
    const startX = zone.x + (zone.w - gridDrawSize) / 2;
    const startY = zone.y + titleSpace;

    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.2, { align: "center" });

    drawWordSearchGrid(doc, entry.gridData, { x: startX, y: startY, size: gridDrawSize }, true);
  });
};

// Helper: Draw Sudoku Grid (Ultra Large 7.8" Grid Size)
const drawSudoku = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number = 11) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;
  
  const margin = 0.7;
  const safeW = pageWidth - (margin * 2);
  const safeH = (pageHeight || 11) - (margin * 2);

  const titleSpace = 0.3;
  // The solution grid is an answer key, not a second full-size puzzle to
  // solve, so cap it smaller than the puzzle's own grid.
  const gridDrawSize = isSolution
    ? Math.min(safeW * 0.82, safeH - titleSpace - 0.3, 4.5)
    : Math.min(safeW * 0.82, safeH - titleSpace - 0.3);
  const cellSize = gridDrawSize / 9;

  const startX = (pageWidth - gridDrawSize) / 2 + xShift;
  const startY = margin + titleSpace + 0.1;

  // Draw thin cell borders first
  doc.setLineWidth(0.01);
  doc.setDrawColor(148, 163, 184);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = startX + (c * cellSize);
      const y = startY + (r * cellSize);
      doc.rect(x, y, cellSize, cellSize);

      // Value
      const initialVal = data.puzzle ? data.puzzle[r][c] : (data.grid ? data.grid[r][c] : 0);
      const displayedVal = isSolution ? (data.solution ? data.solution[r][c] : initialVal) : initialVal;
      const isAnswer = isSolution && initialVal === 0;

      if (displayedVal !== 0) {
        if (isAnswer) {
          doc.setTextColor(79, 70, 229); // Indigo 600
          doc.setFont("Helvetica", "bold");
        } else {
          doc.setTextColor(15, 23, 42); // slate-900
          doc.setFont("Helvetica", "bold");
        }
        const scaledFontSize = Math.max(10, Math.floor(cellSize * 36));
        doc.setFontSize(scaledFontSize);
        const valStr = String(displayedVal);
        doc.text(valStr, x + cellSize / 2, y + cellSize * 0.68, { align: "center" });
      }
    }
  }

  // Draw thicker borders for 3x3 subdivisions
  doc.setLineWidth(0.028);
  doc.setDrawColor(15, 23, 42);
  for (let i = 0; i <= 9; i += 3) {
    const offset = i * cellSize;
    // Vertical lines
    doc.line(startX + offset, startY, startX + offset, startY + gridDrawSize);
    // Horizontal lines
    doc.line(startX, startY + offset, startX + gridDrawSize, startY + offset);
  }

  // Reset text color
  doc.setTextColor(0);
};

const drawSudokuSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { gridData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;

  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.gridData) return;

    const titleSpace = 0.3;
    // Cap at a standard answer-key size instead of stretching to fill the
    // whole zone -- a solution grid only needs to be read, not written in,
    // so it shouldn't grow as large as the puzzle's own grid.
    const gridDrawSize = Math.min(zone.w, zone.h - titleSpace, 4.5);
    const startX = zone.x + (zone.w - gridDrawSize) / 2;
    const startY = zone.y + titleSpace;

    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.2, { align: "center" });

    const data = entry.gridData;
    const cellSize = gridDrawSize / 9;

    doc.setLineWidth(0.006);
    doc.setDrawColor(148, 163, 184);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        doc.rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
      }
    }

    doc.setLineWidth(0.02);
    doc.setDrawColor(15, 23, 42);
    for (let b = 0; b <= 3; b++) {
      const offset = b * cellSize * 3;
      doc.line(startX + offset, startY, startX + offset, startY + gridDrawSize);
      doc.line(startX, startY + offset, startX + gridDrawSize, startY + offset);
    }

    const numberFontSize = Math.max(9, Math.floor(cellSize * 36));
    doc.setFontSize(numberFontSize);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = data.solution ? data.solution[r][c] : (data.grid ? data.grid[r][c] : 0);
        if (val !== 0) {
          doc.setTextColor(79, 70, 229);
          doc.setFont("Helvetica", "bold");
          doc.text(String(val), startX + c * cellSize + cellSize / 2, startY + r * cellSize + cellSize * 0.68, { align: "center" });
        }
      }
    }
  });
};

// Helper: Draw Kakuro Grid
const drawKakuro = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const puzzle = page.config.gridData;
  if (!puzzle) return;
  const { grid, rows, cols } = puzzle;
  const isSolution = page.config.isSolution || false;

  // Sizing and alignment
  const marginX = 0.75;
  const marginY = 1.6;
  const maxW = pageWidth - (marginX * 2);
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxH = pageHeight - (marginY * 2);

  // Calculate cell size that fits both width and height constraints, capped
  // so a small grid (e.g. 6x6) doesn't balloon into oversized cells -- other
  // number-grid puzzles like Sudoku stay around ~0.65in/cell regardless of
  // grid size, so match that instead of stretching to fill the page. The
  // solution grid is an answer key, not a second full-size puzzle to solve,
  // so it's capped smaller still.
  const cellSize = isSolution
    ? Math.min(maxW / cols, maxH / rows, 4.5 / cols, 4.5 / rows, 0.65)
    : Math.min(maxW / cols, maxH / rows, 0.65);
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  const startX = (pageWidth - gridW) / 2 + xShift;
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
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 32));
          doc.text(String(cell.value), x + cellSize / 2, y + cellSize * 0.65, { align: "center" });
        } else if (cell.displayValue) {
          doc.setTextColor(51, 65, 85); // Clues/helpers in dark slate
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(Math.floor(cellSize * 30));
          doc.text(cell.displayValue, x + cellSize / 2, y + cellSize * 0.65, { align: "center" });
        }
      } else {
        // Draw black / clue cell
        doc.setLineWidth(0.005);
        doc.setDrawColor(60, 60, 70);
        doc.setFillColor(30, 30, 35); // Dark gray fill
        doc.rect(x, y, cellSize, cellSize, "FD");

        const hasRow = cell.rowClue !== undefined;
        const hasCol = cell.colClue !== undefined;
        const hasClues = hasRow || hasCol;

        if (hasClues) {
          // Draw diagonal line from top-left to bottom-right
          doc.setLineWidth(0.008);
          doc.setDrawColor(100, 100, 110);
          doc.line(x, y, x + cellSize, y + cellSize);

          // Clue text styling
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(Math.floor(cellSize * 18));
          doc.setTextColor(248, 250, 252); // White clue text

          // 1. Row Clue (Top-Right triangle)
          if (hasRow) {
            doc.text(
              String(cell.rowClue),
              x + cellSize * 0.72,
              y + cellSize * 0.38,
              { align: "center" }
            );
          }

          // 2. Col Clue (Bottom-Left triangle)
          if (hasCol) {
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
};

// Helper: Draw Maze Challenge (Ultra Large 7.8" Grid Size)
const drawMaze = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number = 11) => {
  const data = page.config.gridData;
  if (!data || !data.grid) return;
  const showSolution = page.config.showSolution || page.config.isSolution || false;
  const rows = data.grid.length;
  const cols = data.grid[0].length;
  
  const margin = 0.7;
  const topReserved = 1.35;
  const safeW = pageWidth - (margin * 2);
  const safeH = (pageHeight || 11) - topReserved - margin;

  // The solution maze is an answer key, not a second full-size puzzle to
  // solve, so cap it smaller than the puzzle's own "ultra large" grid.
  const mazeSize = showSolution
    ? Math.min(safeW * 0.85, safeH - 0.2, 4.5)
    : Math.min(safeW * 0.85, safeH - 0.2);
  const cellSize = mazeSize / Math.max(rows, cols);

  const mazeW = cols * cellSize;
  const mazeH = rows * cellSize;
  const startX = (pageWidth - mazeW) / 2 + xShift;
  const startY = topReserved + (safeH - mazeH) / 2;

  // Draw maze walls
  doc.setLineWidth(Math.max(0.015, cellSize * 0.08));
  doc.setDrawColor(15, 23, 42); // slate-900 bold black walls

  data.grid.forEach((row: any[], r: number) => {
    row.forEach((cell: any, c: number) => {
      if (!cell.active) return;
      const x1 = startX + (c * cellSize);
      const y1 = startY + (r * cellSize);
      const x2 = x1 + cellSize;
      const y2 = y1 + cellSize;

      if (cell.walls.top) doc.line(x1, y1, x2, y1);
      if (cell.walls.bottom) doc.line(x1, y2, x2, y2);
      if (cell.walls.right) doc.line(x2, y1, x2, y2);
      if (cell.walls.left) doc.line(x1, y1, x1, y2);
    });
  });

  // Start / Exit markers with bold typography
  const markerFontSize = Math.max(8, Math.floor(cellSize * 32));
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(markerFontSize);

  if (data.start) {
    doc.setTextColor(37, 99, 235); // Blue-600 Start
    doc.text("S", startX + data.start[1] * cellSize + cellSize / 2, startY + data.start[0] * cellSize + cellSize * 0.72, { align: "center" });
  }

  if (data.end) {
    doc.setTextColor(220, 38, 38); // Red-600 Exit
    doc.text("E", startX + data.end[1] * cellSize + cellSize / 2, startY + data.end[0] * cellSize + cellSize * 0.72, { align: "center" });
  }

  // Draw Solution Path if checked
  if (showSolution && data.solution && data.solution.length > 0) {
    doc.setLineWidth(Math.max(0.02, cellSize * 0.15));
    doc.setDrawColor(239, 68, 68); // Vibrant Red path

    const path = data.solution;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const x1 = startX + p1[1] * cellSize + cellSize / 2;
      const y1 = startY + p1[0] * cellSize + cellSize / 2;
      const x2 = startX + p2[1] * cellSize + cellSize / 2;
      const y2 = startY + p2[0] * cellSize + cellSize / 2;
      doc.line(x1, y1, x2, y2);
    }
  }

  // Reset text color
  doc.setTextColor(0);
};

// Helper: Map standard font families to jsPDF built-in fonts
const getSafeFontFamily = (font: string): string => {
  const f = (font || "").toLowerCase();
  if (f.includes("times") || f.includes("serif") || f.includes("georgia")) return "times";
  if (f.includes("courier") || f.includes("mono")) return "courier";
  return "helvetica"; // Default to helvetica (sans-serif) to match Arial/Inter/Roboto
};

// Helper: Draw Full Widescreen Cover Page (Back Cover + Spine + Front Cover)
export const drawFullWidescreenCover = async (doc: any, coverState: any, pageWidth: number, pageHeight: number) => {
  const { 
    coverElements = [], 
    frontCoverColor = '#1E293B', 
    backCoverColor = '#0F172A',
    frontCoverType = 'solid', 
    backCoverType = 'solid',
    frontCoverGradientStart = '#1E293B',
    frontCoverGradientEnd = '#0F172A',
    backCoverGradientStart = '#0F172A',
    backCoverGradientEnd = '#020617',
    spineWidth = 0.22,
    trimSize = { w: 8.5, h: 11 },
    backCoverImage = '',
    frontCoverImage = '',
    fullCoverImage = ''
  } = coverState;

  if (typeof window === 'undefined') return;

  try {
    const canvas = document.createElement('canvas');
    // Render at 300 DPI for high quality
    canvas.width = Math.round(pageWidth * 300);
    canvas.height = Math.round(pageHeight * 300);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Scale calculation from widescreen canvas (800xHeight)
    const CANVAS_WIDTH = 800;
    const bleed = 0.125;
    const coverTotalWidthInches = (trimSize.w * 2) + spineWidth + (bleed * 2);
    const scale_canvas = CANVAS_WIDTH / coverTotalWidthInches;
    const canvasHeight = (trimSize.h + bleed * 2) * scale_canvas;

    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / canvasHeight;

    const spineLeftPx = (bleed + trimSize.w) * scale_canvas;
    const spineRightPx = spineLeftPx + (spineWidth * scale_canvas);

    // 1. Draw Back Cover Background
    const backLeft = 0;
    const backWidth = spineLeftPx * scaleX;
    if (backCoverType === 'gradient') {
      const gradient = ctx.createLinearGradient(backLeft, 0, backLeft + backWidth, 0);
      gradient.addColorStop(0, backCoverGradientStart);
      gradient.addColorStop(1, backCoverGradientEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backCoverColor;
    }
    ctx.fillRect(backLeft, 0, backWidth, height);

    // 2. Draw Spine Background
    const spineLeft = spineLeftPx * scaleX;
    const spineWidthCanvas = (spineRightPx - spineLeftPx) * scaleX;
    ctx.fillStyle = frontCoverColor;
    ctx.fillRect(spineLeft, 0, spineWidthCanvas, height);

    // 3. Draw Front Cover Background
    const frontLeft = spineRightPx * scaleX;
    const frontWidth = width - frontLeft;
    if (frontCoverType === 'gradient') {
      const gradient = ctx.createLinearGradient(frontLeft, 0, frontLeft + frontWidth, 0);
      gradient.addColorStop(0, frontCoverGradientStart);
      gradient.addColorStop(1, frontCoverGradientEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = frontCoverColor;
    }
    ctx.fillRect(frontLeft, 0, frontWidth, height);

    // 4. Draw Background Images if present
    if (fullCoverImage) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = fullCoverImage;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });
      } catch (e) {
        console.error("Error drawing full cover image:", e);
      }
    } else {
      if (backCoverImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = backCoverImage;
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, backLeft, 0, backWidth, height);
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        } catch (e) {
          console.error("Error drawing back cover image:", e);
        }
      }
      if (frontCoverImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = frontCoverImage;
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, frontLeft, 0, frontWidth, height);
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        } catch (e) {
          console.error("Error drawing front cover image:", e);
        }
      }
    }

    // 5. Draw Vector Elements
    for (const el of coverElements) {
      const elX = typeof el.x === 'number' ? el.x : 0;
      const elY = typeof el.y === 'number' ? el.y : 0;
      const elW = typeof el.width === 'number' ? el.width : 240;
      const elH = typeof el.height === 'number' ? el.height : 100;
      const elRadius = typeof el.radius === 'number' ? el.radius : 50;

      const width = el.type === 'circle' ? elRadius * 2 : elW;
      const height = el.type === 'circle' ? elRadius * 2 : elH;

      const centerX = elX + width / 2;
      const centerY = elY + height / 2;

      const scaledCenterX = centerX * scaleX;
      const scaledCenterY = centerY * scaleY;
      const cw = width * scaleX;
      const ch = height * scaleY;
      const cRadius = (width / 2) * scaleX;

      if (isNaN(scaledCenterX) || isNaN(scaledCenterY) || isNaN(cw) || isNaN(ch)) continue;

      ctx.save();
      ctx.translate(scaledCenterX, scaledCenterY);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      if (typeof el.opacity === 'number') {
        ctx.globalAlpha = el.opacity;
      }

      if (el.type === 'rect') {
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#F59E0B";
        const rx = el.cornerRadius ? el.cornerRadius * scaleX : 0;
        if (rx > 0) {
          ctx.beginPath();
          ctx.moveTo(-cw / 2 + rx, -ch / 2);
          ctx.arcTo(cw / 2, -ch / 2, cw / 2, ch / 2, rx);
          ctx.arcTo(cw / 2, ch / 2, -cw / 2, ch / 2, rx);
          ctx.arcTo(-cw / 2, ch / 2, -cw / 2, -ch / 2, rx);
          ctx.arcTo(-cw / 2, -ch / 2, cw / 2, -ch / 2, rx);
          ctx.closePath();
          ctx.fill();
          if (el.strokeWidth && el.strokeWidth > 0) {
            ctx.strokeStyle = el.stroke || "#FFFFFF";
            ctx.lineWidth = el.strokeWidth * scaleX;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
          if (el.strokeWidth && el.strokeWidth > 0) {
            ctx.strokeStyle = el.stroke || "#FFFFFF";
            ctx.lineWidth = el.strokeWidth * scaleX;
            ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
          }
        }
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, cRadius, 0, 2 * Math.PI);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#3B82F6";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(0, 0, cw / 2, ch / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -ch / 2);
        ctx.lineTo(-cw / 2, ch / 2);
        ctx.lineTo(cw / 2, ch / 2);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#10B981";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'hexagon' || (el.type === 'polygon' && el.isHexagon)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.5, -ch * 0.25);
        ctx.lineTo(cw * 0.5, ch * 0.25);
        ctx.lineTo(0, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.25);
        ctx.lineTo(-cw * 0.5, -ch * 0.25);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#8B5CF6";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'pentagon' || (el.type === 'polygon' && el.isPentagon)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.475, -ch * 0.155);
        ctx.lineTo(cw * 0.294, ch * 0.405);
        ctx.lineTo(-cw * 0.294, ch * 0.405);
        ctx.lineTo(-cw * 0.475, -ch * 0.155);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'octagon' || (el.type === 'polygon' && el.isOctagon)) {
        ctx.beginPath();
        ctx.moveTo(-cw * 0.207, -ch * 0.5);
        ctx.lineTo(cw * 0.207, -ch * 0.5);
        ctx.lineTo(cw * 0.5, -ch * 0.207);
        ctx.lineTo(cw * 0.5, ch * 0.207);
        ctx.lineTo(cw * 0.207, ch * 0.5);
        ctx.lineTo(-cw * 0.207, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.207);
        ctx.lineTo(-cw * 0.5, -ch * 0.207);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'diamond' || (el.type === 'polygon' && el.isDiamond)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.5, 0);
        ctx.lineTo(0, ch * 0.5);
        ctx.lineTo(-cw * 0.5, 0);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'trapezoid' || (el.type === 'polygon' && el.isTrapezoid)) {
        ctx.beginPath();
        ctx.moveTo(-cw * 0.25, -ch * 0.5);
        ctx.lineTo(cw * 0.25, -ch * 0.5);
        ctx.lineTo(cw * 0.5, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.5);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'star' || el.type === 'polygon') {
        ctx.save();
        ctx.scale(cw / 238, ch / 226);
        ctx.translate(-350, -188);
        ctx.beginPath();
        ctx.moveTo(350, 75);
        ctx.lineTo(379, 161);
        ctx.lineTo(469, 161);
        ctx.lineTo(397, 215);
        ctx.lineTo(423, 301);
        ctx.lineTo(350, 250);
        ctx.lineTo(277, 301);
        ctx.lineTo(303, 215);
        ctx.lineTo(231, 161);
        ctx.lineTo(321, 161);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#10B981";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth;
          ctx.stroke();
        }
        ctx.restore();
      } else if (el.type === 'heart') {
        ctx.save();
        ctx.scale(cw / 80, ch / 80);
        ctx.translate(-50, -50);
        const path = new Path2D("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z");
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#EF4444";
        ctx.fill(path);
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth;
          ctx.stroke(path);
        }
        ctx.restore();
      } else if (el.type === 'line') {
        const points = el.points || [0, 0, 100, 0];
        const midX = (points[0] + points[2]) / 2;
        const midY = (points[1] + points[3]) / 2;
        const lx1 = (points[0] - midX) * scaleX;
        const ly1 = (points[1] - midY) * scaleY;
        const lx2 = (points[2] - midX) * scaleX;
        const ly2 = (points[3] - midY) * scaleY;

        ctx.beginPath();
        ctx.moveTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
        ctx.strokeStyle = el.stroke || "#FFFFFF";
        ctx.lineWidth = (el.strokeWidth || 2) * scaleX;
        ctx.stroke();
      } else if (el.type === 'text' || el.type === 'textbox') {
        const fontSizePx = el.fontSize * scaleY;
        ctx.font = `${el.fontStyle || 'normal'} ${fontSizePx}px ${el.fontFamily || 'Arial'}`;
        ctx.fillStyle = el.fill || "#FFFFFF";
        ctx.textAlign = el.align || 'left';
        ctx.textBaseline = 'top';

        const textX = ctx.textAlign === 'center' ? 0 : (ctx.textAlign === 'right' ? cw / 2 : -cw / 2);
        const textY = -ch / 2;

        const textStr = el.text || '';
        const lines = textStr.split('\n');
        const lineHeight = fontSizePx * 1.25;

        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textX, textY + i * lineHeight);
        }
      } else if (el.type === 'clipart') {
        if (el.src) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = el.src;
            await new Promise((resolve) => {
              img.onload = () => {
                ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
                resolve(true);
              };
              img.onerror = () => resolve(false);
            });
          } catch (e) {
            console.error("Failed to load clipart image inside drawing loop:", e);
          }
        }
      } else if (el.type === 'path') {
        ctx.save();
        const vb = el.viewBox || 24;
        ctx.scale(cw / vb, ch / vb);
        ctx.translate(-vb / 2, -vb / 2);
        const path = new Path2D(el.pathData);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill(path);
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#000000";
          ctx.lineWidth = el.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (el.strokeDashArray) {
            ctx.setLineDash(el.strokeDashArray);
          }
          ctx.stroke(path);
        }
        ctx.restore();
      }
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    doc.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
  } catch (err) {
    console.error("Error drawing widescreen cover with canvas:", err);
    doc.setFillColor(frontCoverColor);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }
};

export const drawCoverPagePart = async (doc: any, coverState: any, side: 'front' | 'back', pageWidth: number, pageHeight: number) => {
  const { 
    coverElements = [],
    spineWidth = 0.22,
    trimSize = { w: 8.5, h: 11 },
    frontCoverColor = '#1E293B', 
    backCoverColor = '#0F172A',
    frontCoverType = 'solid', 
    backCoverType = 'solid',
    frontCoverGradientStart = '#1E293B',
    frontCoverGradientEnd = '#0F172A',
    backCoverGradientStart = '#0F172A',
    backCoverGradientEnd = '#020617'
  } = coverState;

  const pgW = pageWidth;
  const pgH = pageHeight;

  if (typeof window === 'undefined') return;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(pgW * 300);
    canvas.height = Math.round(pgH * 300);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Robustly extract trim size dimensions to support legacy drafts
    let trimW = 8.5;
    let trimH = 11;
    if (trimSize && typeof trimSize === 'object') {
      if (typeof trimSize.w === 'number') trimW = trimSize.w;
      if (typeof trimSize.h === 'number') trimH = trimSize.h;
      else if (typeof trimSize.label === 'string') {
        if (trimSize.label.includes('6" x 9"')) { trimW = 6; trimH = 9; }
        else if (trimSize.label.includes('5.5" x 8.5"')) { trimW = 5.5; trimH = 8.5; }
        else if (trimSize.label.includes('5" x 8"')) { trimW = 5; trimH = 8; }
      }
    }

    const bleed = 0.125;
    const CANVAS_WIDTH = 800;

    const coverTotalWidthInches = (trimW * 2) + spineWidth + (bleed * 2);
    const scale = CANVAS_WIDTH / (coverTotalWidthInches || 12.475);
    const canvasHeight = (trimH + bleed * 2) * scale;
    
    const trimLeftPx = bleed * scale;
    const trimTopPx = bleed * scale;
    const spineLeftPx = (bleed + trimW) * scale;
    const spineRightPx = spineLeftPx + (spineWidth * scale);

    // Calculate crop window relative to widescreen canvas
    const isFront = side === 'front';
    const srcX = isFront ? spineRightPx : trimLeftPx;
    const srcY = trimTopPx;
    const srcW = trimW * scale;
    const srcH = trimH * scale;

    const scaleX = width / srcW;
    const scaleY = height / srcH;

    // 1. Draw Page Background
    const bgColor = isFront ? frontCoverColor : backCoverColor;
    const isGradient = isFront ? frontCoverType === 'gradient' : backCoverType === 'gradient';
    const gradStart = isFront ? frontCoverGradientStart : backCoverGradientStart;
    const gradEnd = isFront ? frontCoverGradientEnd : backCoverGradientEnd;

    if (isGradient) {
      // Draw gradient aligned to the canvas representation
      let gradient: CanvasGradient;
      if (isFront) {
        // Front cover gradient starts at spine (x=0) and ends at right bleed edge
        gradient = ctx.createLinearGradient(0, 0, (pgW + bleed) * 300, 0);
      } else {
        // Back cover gradient starts at left bleed edge (x=-bleed) and ends at spine (x=trimW)
        gradient = ctx.createLinearGradient(-bleed * 300, 0, pgW * 300, 0);
      }
      gradient.addColorStop(0, gradStart);
      gradient.addColorStop(1, gradEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Background Image
    const bgImage = isFront ? coverState.frontCoverImage : coverState.backCoverImage;
    if (bgImage) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = bgImage;
        await new Promise((resolve) => {
          img.onload = () => {
            if (isFront) {
              // Front cover image extends to the right bleed edge
              ctx.drawImage(img, 0, -bleed * 300, (pgW + bleed) * 300, (pgH + bleed * 2) * 300);
            } else {
              // Back cover image starts at the left bleed edge
              ctx.drawImage(img, -bleed * 300, -bleed * 300, (bleed + pgW) * 300, (pgH + bleed * 2) * 300);
            }
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });
      } catch (imgErr) {
        console.error("Failed to draw cover part background image:", imgErr);
      }
    }

    // 3. Draw Vector Elements
    for (const el of coverElements) {
      const elX = typeof el.x === 'number' ? el.x : 0;
      const elY = typeof el.y === 'number' ? el.y : 0;
      const elW = typeof el.width === 'number' ? el.width : 240;
      const elH = typeof el.height === 'number' ? el.height : 100;
      const elRadius = typeof el.radius === 'number' ? el.radius : 50;

      // Check if element belongs to this side of the cover using the exact guidelines
      if (side === 'back' && elX >= spineLeftPx) continue;
      if (side === 'front' && elX < spineRightPx) continue;

      const width = el.type === 'circle' ? elRadius * 2 : elW;
      const height = el.type === 'circle' ? elRadius * 2 : elH;

      const centerX = elX + width / 2;
      const centerY = elY + height / 2;

      const relativeCenterX = centerX - srcX;
      const relativeCenterY = centerY - srcY;

      const scaledCenterX = relativeCenterX * scaleX;
      const scaledCenterY = relativeCenterY * scaleY;
      const cw = width * scaleX;
      const ch = height * scaleY;
      const cRadius = (width / 2) * scaleX;

      if (isNaN(scaledCenterX) || isNaN(scaledCenterY) || isNaN(cw) || isNaN(ch)) continue;

      ctx.save();
      ctx.translate(scaledCenterX, scaledCenterY);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      if (typeof el.opacity === 'number') {
        ctx.globalAlpha = el.opacity;
      }

      if (el.type === 'rect') {
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#F59E0B";
        const rx = el.cornerRadius ? el.cornerRadius * scaleX : 0;
        if (rx > 0) {
          ctx.beginPath();
          ctx.moveTo(-cw / 2 + rx, -ch / 2);
          ctx.arcTo(cw / 2, -ch / 2, cw / 2, ch / 2, rx);
          ctx.arcTo(cw / 2, ch / 2, -cw / 2, ch / 2, rx);
          ctx.arcTo(-cw / 2, ch / 2, -cw / 2, -ch / 2, rx);
          ctx.arcTo(-cw / 2, -ch / 2, cw / 2, -ch / 2, rx);
          ctx.closePath();
          ctx.fill();
          if (el.strokeWidth && el.strokeWidth > 0) {
            ctx.strokeStyle = el.stroke || "#FFFFFF";
            ctx.lineWidth = el.strokeWidth * scaleX;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
          if (el.strokeWidth && el.strokeWidth > 0) {
            ctx.strokeStyle = el.stroke || "#FFFFFF";
            ctx.lineWidth = el.strokeWidth * scaleX;
            ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
          }
        }
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, cRadius, 0, 2 * Math.PI);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#3B82F6";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(0, 0, cw / 2, ch / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -ch / 2);
        ctx.lineTo(-cw / 2, ch / 2);
        ctx.lineTo(cw / 2, ch / 2);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#10B981";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'hexagon' || (el.type === 'polygon' && el.isHexagon)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.5, -ch * 0.25);
        ctx.lineTo(cw * 0.5, ch * 0.25);
        ctx.lineTo(0, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.25);
        ctx.lineTo(-cw * 0.5, -ch * 0.25);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#8B5CF6";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'pentagon' || (el.type === 'polygon' && el.isPentagon)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.475, -ch * 0.155);
        ctx.lineTo(cw * 0.294, ch * 0.405);
        ctx.lineTo(-cw * 0.294, ch * 0.405);
        ctx.lineTo(-cw * 0.475, -ch * 0.155);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'octagon' || (el.type === 'polygon' && el.isOctagon)) {
        ctx.beginPath();
        ctx.moveTo(-cw * 0.207, -ch * 0.5);
        ctx.lineTo(cw * 0.207, -ch * 0.5);
        ctx.lineTo(cw * 0.5, -ch * 0.207);
        ctx.lineTo(cw * 0.5, ch * 0.207);
        ctx.lineTo(cw * 0.207, ch * 0.5);
        ctx.lineTo(-cw * 0.207, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.207);
        ctx.lineTo(-cw * 0.5, -ch * 0.207);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'diamond' || (el.type === 'polygon' && el.isDiamond)) {
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.5);
        ctx.lineTo(cw * 0.5, 0);
        ctx.lineTo(0, ch * 0.5);
        ctx.lineTo(-cw * 0.5, 0);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'trapezoid' || (el.type === 'polygon' && el.isTrapezoid)) {
        ctx.beginPath();
        ctx.moveTo(-cw * 0.25, -ch * 0.5);
        ctx.lineTo(cw * 0.25, -ch * 0.5);
        ctx.lineTo(cw * 0.5, ch * 0.5);
        ctx.lineTo(-cw * 0.5, ch * 0.5);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth * scaleX;
          ctx.stroke();
        }
      } else if (el.type === 'star' || el.type === 'polygon') {
        ctx.save();
        ctx.scale(cw / 238, ch / 226);
        ctx.translate(-350, -188);
        ctx.beginPath();
        ctx.moveTo(350, 75);
        ctx.lineTo(379, 161);
        ctx.lineTo(469, 161);
        ctx.lineTo(397, 215);
        ctx.lineTo(423, 301);
        ctx.lineTo(350, 250);
        ctx.lineTo(277, 301);
        ctx.lineTo(303, 215);
        ctx.lineTo(231, 161);
        ctx.lineTo(321, 161);
        ctx.closePath();
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#10B981";
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth;
          ctx.stroke();
        }
        ctx.restore();
      } else if (el.type === 'heart') {
        ctx.save();
        ctx.scale(cw / 80, ch / 80);
        ctx.translate(-50, -50);
        const path = new Path2D("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z");
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "#EF4444";
        ctx.fill(path);
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#FFFFFF";
          ctx.lineWidth = el.strokeWidth;
          ctx.stroke(path);
        }
        ctx.restore();
      } else if (el.type === 'line') {
        const points = el.points || [0, 0, 100, 0];
        const midX = (points[0] + points[2]) / 2;
        const midY = (points[1] + points[3]) / 2;
        const lx1 = (points[0] - midX) * scaleX;
        const ly1 = (points[1] - midY) * scaleY;
        const lx2 = (points[2] - midX) * scaleX;
        const ly2 = (points[3] - midY) * scaleY;

        ctx.beginPath();
        ctx.moveTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
        ctx.strokeStyle = el.stroke || "#FFFFFF";
        ctx.lineWidth = (el.strokeWidth || 2) * scaleX;
        ctx.stroke();
      } else if (el.type === 'text' || el.type === 'textbox') {
        const fontSizePx = el.fontSize * scaleY;
        ctx.font = `${el.fontStyle || 'normal'} ${fontSizePx}px ${el.fontFamily || 'Arial'}`;
        ctx.fillStyle = el.fill || "#FFFFFF";
        ctx.textAlign = el.align || 'left';
        ctx.textBaseline = 'top';

        const textX = ctx.textAlign === 'center' ? 0 : (ctx.textAlign === 'right' ? cw / 2 : -cw / 2);
        const textY = -ch / 2;

        const textStr = el.text || '';
        const lineHeight = fontSizePx * 1.25;

        if (el.type === 'textbox') {
          wrapCanvasText(ctx, textStr, textX, textY, cw, lineHeight);
        } else {
          const lines = textStr.split('\n');
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], textX, textY + i * lineHeight);
          }
        }
      } else if (el.type === 'clipart') {
        if (el.src) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = el.src;
            await new Promise((resolve) => {
              img.onload = () => {
                ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
                resolve(true);
              };
              img.onerror = () => resolve(false);
            });
          } catch (e) {
            console.error("Failed to load clipart image inside drawing loop:", e);
          }
        }
      } else if (el.type === 'path') {
        ctx.save();
        const vb = el.viewBox || 24;
        ctx.scale(cw / vb, ch / vb);
        ctx.translate(-vb / 2, -vb / 2);
        const path = new Path2D(el.pathData);
        ctx.fillStyle = (el.fill !== undefined && el.fill !== null) ? el.fill : "transparent";
        ctx.fill(path);
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke || "#000000";
          ctx.lineWidth = el.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (el.strokeDashArray) {
            ctx.setLineDash(el.strokeDashArray);
          }
          ctx.stroke(path);
        }
        ctx.restore();
      }
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    doc.addImage(dataUrl, 'PNG', 0, 0, pgW, pgH);
  } catch (err) {
    console.error("Error drawing cover page part with canvas:", err);
    doc.setFillColor(side === 'front' ? frontCoverColor : backCoverColor);
    doc.rect(0, 0, pgW, pgH, "F");
  }
};

// Helper: Hex color parser supporting 3 and 6 characters
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper: Load and crop image using a temporary HTML Canvas
const loadAndCropImage = (
  url: string, 
  cropX: number, 
  cropY: number, 
  cropW: number, 
  cropH: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(url);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(url);
        }
      } catch (e) {
        console.error("Error cropping image in canvas", e);
        resolve(url);
      }
    };
    img.onerror = () => {
      resolve(url);
    };
  });
};

// Helper: Draw Word Scramble
const drawWordScramble = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const data = page.config.scrambledData;
  const difficulty = page.config.difficulty || "easy";
  const isSolution = page.config.isSolution || false;

  const marginL = 0.75 + xShift;
  const marginR = 0.5;
  const marginT = 1.3;
  const marginB = 0.75;

  const contentW = pageWidth - (0.75 + marginR);
  const contentH = pageHeight - marginT - marginB;

  // Draw Words list
  const listStartY = marginT + 0.3;
  const availableHeight = contentH - 1.5;
  const stepY = Math.min(0.5, availableHeight / data.scrambled.length);

  data.scrambled.forEach((scrambled: string, wIdx: number) => {
    const y = listStartY + wIdx * stepY;

    // Number indicator
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text(`${wIdx + 1}.`, marginL + 0.2, y);

    // Scrambled letters
    const displayScrambled = scrambled.split("").join(" ");
    doc.setFont("Courier", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(displayScrambled, marginL + 0.6, y);

    // Answer representation
    if (isSolution) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text(data.original[wIdx], marginL + contentW - 2.0, y);
    } else {
      // Underline
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.008);
      doc.line(marginL + contentW - 2.2, y + 0.05, marginL + contentW - 0.2, y + 0.05);
    }
  });

  // Reset colors
  doc.setTextColor(0);

  // Word Bank (if easy/medium and not solution)
  if (difficulty !== "hard" && !isSolution) {
    const numWords = data.wordBank.length;
    const numRows = Math.ceil(numWords / 3);
    const rowSpacing = 0.2;
    const boxHeight = 0.35 + numRows * rowSpacing;
    const bankStartY = pageHeight - marginB - boxHeight - 0.05;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.setLineWidth(0.008);
    doc.roundedRect(marginL + 0.1, bankStartY, contentW - 0.2, boxHeight, 0.08, 0.08, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("WORD BANK", marginL + 0.3, bankStartY + 0.2);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const colW = (contentW - 0.6) / 3;
    let row = 0;
    let col = 0;

    data.wordBank.forEach((w: string) => {
      const wx = marginL + 0.3 + col * colW;
      const wy = bankStartY + 0.42 + row * rowSpacing;
      doc.text(w, wx, wy);
      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }
    });
  }

  doc.setTextColor(0);
};

// Helper: Draw Cryptogram
const drawCryptogram = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const data = page.config.cryptogramData;
  const isSolution = page.config.isSolution || false;

  const marginL = 0.75 + xShift;
  const marginR = 0.75;
  const marginT = 1.35;
  const marginB = 0.75;

  const contentW = pageWidth - (0.75 + marginR);

  // Large Print box sizing for high KDP readability
  const charBoxW = 0.36;
  const charBoxH = 0.42;
  const charSpacing = 0.08;
  const wordSpacing = 0.32;
  const lineStepY = 0.9;

  let curX = marginL;
  let curY = marginT + 0.2;

  // Safe bottom: leave room for cipher labels below boxes + footer
  // On solution pages also reserve 1.5" for the substitution key
  const reservedBottom = isSolution ? 1.6 : 0.45;
  const safeBottomY = pageHeight - marginB - reservedBottom;

  // Helper: add overflow page and reset Y cursor
  const addOverflowPage = () => {
    doc.addPage();
    curX = marginL + 0.2;
    curY = marginT + 0.1;
  };

  const wordsList = data.encrypted.split(" ");
  const originalWordsList = data.original.split(" ");

  wordsList.forEach((word: string, wIdx: number) => {
    const originalWord = originalWordsList[wIdx] || "";
    const wordLen = word.length;
    const wordWidthInches = wordLen * charBoxW + (wordLen - 1) * charSpacing;

    // Word wrap: if word doesn't fit on current line, move down
    if (curX + wordWidthInches > marginL + contentW - 0.2) {
      curX = marginL + 0.2;
      curY += lineStepY;
    }

    // PAGE BREAK GUARD: boxes + cipher label below must fit before safe bottom
    if (curY + charBoxH + 0.2 > safeBottomY) {
      addOverflowPage();
    }

    for (let i = 0; i < wordLen; i++) {
      const char = word[i];
      const isLetter = /[A-Z]/.test(char);
      const originalChar = originalWord[i] || "";

      if (isLetter) {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.008);
        doc.rect(curX, curY, charBoxW, charBoxH);

        if (isSolution) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(originalChar, curX + charBoxW / 2, curY + charBoxH - 0.08, { align: "center" });
        }

        // Bottom Cipher letter
        doc.setFont("Courier", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(char, curX + charBoxW / 2, curY + charBoxH + 0.16, { align: "center" });
      } else {
        doc.setFont("Courier", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(char, curX + charBoxW / 2, curY + charBoxH - 0.05, { align: "center" });
      }

      curX += charBoxW + charSpacing;
    }

    curX += wordSpacing;
  });

  // Substitution Key (Solution only)
  if (isSolution && data.cipherMap) {
    const keyStartY = pageHeight - marginB - 1.2;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("SUBSTITUTION KEY:", marginL + 0.2, keyStartY);

    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const alpha1 = "A B C D E F G H I J K L M";
    const alpha2 = "N O P Q R S T U V W X Y Z";

    const getCipherStr = (alpha: string) =>
      alpha
        .split(" ")
        .map((l) => data.cipherMap[l] || "_")
        .join(" ");

    doc.text(`ALPHABET: ${alpha1}`, marginL + 0.2, keyStartY + 0.25);
    doc.text(`CIPHER:   ${getCipherStr(alpha1)}`, marginL + 0.2, keyStartY + 0.4);

    doc.text(`ALPHABET: ${alpha2}`, marginL + 0.2, keyStartY + 0.65);
    doc.text(`CIPHER:   ${getCipherStr(alpha2)}`, marginL + 0.2, keyStartY + 0.8);
  }

  doc.setTextColor(0);
};

// Helper: Draw Math Puzzle Grid
// Height (in inches) of a single math puzzle grid, used both to lay out two
// boxes on one page and by the look-ahead page-break guard below.
const getMathGridHeight = (puzzleType: string): number => {
  if (puzzleType === "addition") return 3 * 0.55 + 2 * 0.45; // 3 rows + 2 gaps
  return 5 * 0.55; // multiplication / number_fill: 5 rows
};

// Draws one math puzzle grid (addition/multiplication/number_fill) at a given
// vertical offset, with an optional label above it. Extracted from
// drawMathPuzzle so a page can hold either one box (legacy single-puzzle
// pages) or two boxes stacked with a divider between them.
const drawMathPuzzleBox = (
  doc: any,
  puzzleType: string,
  puzzle: any,
  xShift: number,
  pageWidth: number,
  startY: number,
  isSolution: boolean,
  label?: string
) => {
  if (label) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    const labelW = doc.getTextWidth(label);
    doc.text(label, (pageWidth - labelW) / 2 + xShift, startY - 0.2);
  }

  if (puzzleType === "addition") {
    // 3x3 Addition Grid
    const size = 3;
    const boxW = 0.55;
    const boxH = 0.55;
    const cellSpacing = 0.45;
    const startX = (pageWidth - (size * boxW + (size - 1) * cellSpacing)) / 2 + xShift;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = r * 3 + c;
        const cx = startX + c * (boxW + cellSpacing);
        const cy = startY + r * (boxH + cellSpacing);

        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.015);
        doc.rect(cx, cy, boxW, boxH);

        const val = puzzle.grid[idx];
        const isHidden = puzzle.hiddenIndices.includes(idx) && !isSolution;
        const isAnswer = isSolution && puzzle.hiddenIndices.includes(idx);

        if (!isHidden) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          if (isAnswer) {
            doc.setTextColor(79, 70, 229);
          } else {
            doc.setTextColor(30, 41, 59);
          }
          doc.text(val.toString(), cx + boxW / 2, cy + boxH / 2 + 0.05, { align: "center" });
        }

        // Operators
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);

        if (c < size - 1) {
          const char = c === 1 ? "=" : "+";
          doc.text(char, cx + boxW + cellSpacing / 2, cy + boxH / 2 + 0.05, { align: "center" });
        }

        if (r < size - 1) {
          const char = r === 1 ? "=" : "+";
          doc.text(char, cx + boxW / 2, cy + boxH + cellSpacing / 2 + 0.05, { align: "center" });
        }
      }
    }
  } else if (puzzleType === "multiplication") {
    // 5x5 Grid (headers and values)
    const size = 5;
    const cellW = 0.55;
    const cellH = 0.55;
    const startX = (pageWidth - size * cellW) / 2 + xShift;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = startY + r * cellH;
        const isHeader = r === 0 || c === 0;

        if (isHeader) {
          doc.setFillColor(241, 245, 249);
          doc.rect(cx, cy, cellW, cellH, "FD");
        } else {
          doc.rect(cx, cy, cellW, cellH);
        }

        if (r === 0 && c === 0) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(79, 70, 229);
          doc.text("x", cx + cellW / 2, cy + cellH / 2 + 0.05, { align: "center" });
        } else if (r === 0) {
          const val = puzzle.colFactors[c - 1];
          const isHidden = puzzle.hiddenCols.includes(c - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenCols.includes(c - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } else if (c === 0) {
          const val = puzzle.rowFactors[r - 1];
          const isHidden = puzzle.hiddenRows.includes(r - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenRows.includes(r - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } else {
          const val = puzzle.grid[r - 1][c - 1];
          const isHidden = puzzle.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", isAnswer ? "bold" : "normal");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  } else if (puzzleType === "number_fill") {
    // 5x5 Number Sums Fill Grid
    const size = 5;
    const cellW = 0.55;
    const cellH = 0.55;
    const startX = (pageWidth - size * cellW) / 2 + xShift;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = startY + r * cellH;
        const isSumHeader = r === 4 || c === 4;

        if (r === 4 && c === 4) continue;

        if (isSumHeader) {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(148, 163, 184);
          doc.rect(cx, cy, cellW, cellH, "FD");

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          const sumVal = r === 4 ? puzzle.colSums[c] : puzzle.rowSums[r];
          doc.text(sumVal.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
        } else {
          doc.setDrawColor(30, 41, 59);
          doc.rect(cx, cy, cellW, cellH);

          const val = puzzle.grid[r][c];
          const isHidden = puzzle.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  }

  doc.setTextColor(0);
};

const drawMathPuzzle = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const puzzleType = page.config.puzzleType || "addition";
  const puzzleA = page.config.puzzleData;
  const puzzleB = page.config.puzzleDataB;
  const isSolution = page.config.isSolution || false;
  const gridH = getMathGridHeight(puzzleType);
  const bottomMargin = 0.65; // safe bottom boundary in inches

  // ── Look-ahead page-break guard ─────────────────────────────────────────
  // Two boxes stacked need roughly double the height of one, plus a label
  // and divider between them. Ensure it fits above the footer; if not,
  // force a new page BEFORE drawing anything.
  const labelSpace = 0.3;
  const dividerSpace = 0.35;
  const totalNeeded = puzzleB
    ? 1.5 + (labelSpace + gridH) * 2 + dividerSpace + 0.3
    : 1.6 + gridH + 0.3;

  if (totalNeeded > pageHeight - bottomMargin) {
    // Not enough room — add a new page and reprint the section title
    doc.addPage();
    const isSol = page.config.isSolution || false;
    const titleText = `${puzzleType.replace("_", " ").toUpperCase()}${isSol ? " (SOLUTION)" : ""}`;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0);
    const titleW = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleW) / 2 + xShift, 0.8);
  }
  // ────────────────────────────────────────────────────────────────────────

  if (puzzleB) {
    // Two boxes on one page, each labeled, separated by a divider line.
    const startYA = 1.5 + labelSpace;
    drawMathPuzzleBox(doc, puzzleType, puzzleA, xShift, pageWidth, startYA, isSolution, "Math Puzzle #1");

    const dividerY = startYA + gridH + dividerSpace / 2;
    doc.setLineWidth(0.01);
    doc.setDrawColor(226, 232, 240);
    doc.line(0.75 + xShift, dividerY, pageWidth - 0.75 + xShift, dividerY);

    const startYB = startYA + gridH + dividerSpace + labelSpace;
    drawMathPuzzleBox(doc, puzzleType, puzzleB, xShift, pageWidth, startYB, isSolution, "Math Puzzle #2");
  } else {
    // Legacy single-box page (or a page created before this feature existed).
    drawMathPuzzleBox(doc, puzzleType, puzzleA, xShift, pageWidth, 1.6, isSolution);
  }
};

// ── Crossword Solution Pack (1, 2, or 4 per page) ─────────────────────────────
const drawCrosswordSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { gridData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.gridData) return;
    const data = entry.gridData;
    const gridSize = 15;
    const titleSpace = 0.28;
    const maxCellSize = Math.min(zone.w, zone.h - titleSpace) / gridSize;
    const cellSize = Math.min(0.3, maxCellSize);
    const gridW = cellSize * gridSize;
    const startX = zone.x + (zone.w - gridW) / 2;
    const startY = zone.y + titleSpace;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0);
    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.18, { align: "center" });

    doc.setLineWidth(cellSize * 0.033);
    doc.setDrawColor(30, 41, 59);
    data.grid.forEach((row: string[], r: number) => {
      row.forEach((cell: string, c: number) => {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;
        if (cell === '') {
          doc.setFillColor(30, 41, 59);
          doc.rect(x, y, cellSize, cellSize, "F");
        } else {
          doc.rect(x, y, cellSize, cellSize);
          doc.setFontSize(Math.max(5, Math.floor(cellSize * 38)));
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          const lw = doc.getTextWidth(cell);
          doc.text(cell, x + (cellSize - lw) / 2, y + cellSize * 0.73);
        }
      });
    });
  });
};

// ── Kakuro Solution Pack (1, 2, or 4 per page) ─────────────────────────────────
const drawKakuroSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { gridData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.gridData) return;
    const { grid, rows, cols } = entry.gridData;
    const titleSpace = 0.28;
    // Cap at a standard answer-key size instead of stretching to fill the
    // whole zone when this puzzle is alone on the page, and match the
    // ~0.65in/cell weight other number-grid puzzles (Sudoku) use.
    const cellSize = Math.min((zone.w) / cols, (zone.h - titleSpace) / rows, 4.5 / cols, 4.5 / rows, 0.65);
    const gridW = cellSize * cols;
    const gridH = cellSize * rows;
    const startX = zone.x + (zone.w - gridW) / 2;
    const startY = zone.y + titleSpace + (zone.h - titleSpace - gridH) / 2;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0);
    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.18, { align: "center" });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;
        if (cell.type === "white") {
          doc.setLineWidth(0.005); doc.setDrawColor(180, 180, 190); doc.setFillColor(255, 255, 255);
          doc.rect(x, y, cellSize, cellSize, "FD");
          doc.setTextColor(79, 70, 229); doc.setFont("Helvetica", "bold");
          doc.setFontSize(Math.max(6, Math.floor(cellSize * 30)));
          doc.text(String(cell.value), x + cellSize / 2, y + cellSize * 0.65, { align: "center" });
        } else {
          doc.setLineWidth(0.005); doc.setDrawColor(60, 60, 70); doc.setFillColor(30, 30, 35);
          doc.rect(x, y, cellSize, cellSize, "FD");
          const hasRow = cell.rowClue !== undefined;
          const hasCol = cell.colClue !== undefined;
          if (hasRow || hasCol) {
            doc.setLineWidth(0.006); doc.setDrawColor(100, 100, 110);
            doc.line(x, y, x + cellSize, y + cellSize);
            doc.setFont("Helvetica", "bold"); doc.setFontSize(Math.max(5, Math.floor(cellSize * 15)));
            doc.setTextColor(248, 250, 252);
            if (hasRow) doc.text(String(cell.rowClue), x + cellSize * 0.72, y + cellSize * 0.38, { align: "center" });
            if (hasCol) doc.text(String(cell.colClue), x + cellSize * 0.28, y + cellSize * 0.8, { align: "center" });
          }
        }
      }
    }
    doc.setLineWidth(0.012); doc.setDrawColor(25, 25, 35);
    doc.rect(startX, startY, gridW, gridH);
  });
  doc.setTextColor(0);
};

// ── Maze Solution Pack (1, 2, or 4 per page) ──────────────────────────────────
const drawMazeSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { gridData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.35;
  const topReserved = 0.8;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.gridData) return;
    const data = entry.gridData;
    const rows = data.grid.length;
    const cols = data.grid[0].length;
    const titleSpace = 0.25;
    // Cap at a standard answer-key size instead of stretching to fill the
    // whole zone when this puzzle is alone on the page.
    const cellSize = Math.min(zone.w / cols, (zone.h - titleSpace) / rows, 4.5 / cols, 4.5 / rows);
    const mazeW = cols * cellSize;
    const mazeH = rows * cellSize;
    const startX = zone.x + (zone.w - mazeW) / 2;
    const startY = zone.y + titleSpace;

    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.setFont("Helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0);
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.18, { align: "center" });

    doc.setLineWidth(Math.max(0.01, cellSize * 0.08)); doc.setDrawColor(15, 23, 42);
    data.grid.forEach((row: any[], r: number) => {
      row.forEach((cell: any, c: number) => {
        if (!cell.active) return;
        const x1 = startX + c * cellSize; const y1 = startY + r * cellSize;
        const x2 = x1 + cellSize; const y2 = y1 + cellSize;
        if (cell.walls.top) doc.line(x1, y1, x2, y1);
        if (cell.walls.bottom) doc.line(x1, y2, x2, y2);
        if (cell.walls.right) doc.line(x2, y1, x2, y2);
        if (cell.walls.left) doc.line(x1, y1, x1, y2);
      });
    });

    // Start / End markers
    const markerFontSize = Math.max(6, Math.floor(cellSize * 30));
    doc.setFont("Helvetica", "bold"); doc.setFontSize(markerFontSize);
    if (data.start) {
      doc.setTextColor(37, 99, 235);
      doc.text("S", startX + data.start[1] * cellSize + cellSize / 2, startY + data.start[0] * cellSize + cellSize * 0.72, { align: "center" });
    }
    if (data.end) {
      doc.setTextColor(220, 38, 38);
      doc.text("E", startX + data.end[1] * cellSize + cellSize / 2, startY + data.end[0] * cellSize + cellSize * 0.72, { align: "center" });
    }

    // Draw high contrast bold solution path
    if (data.solution && data.solution.length > 0) {
      doc.setLineWidth(Math.max(0.018, cellSize * 0.16)); doc.setDrawColor(239, 68, 68);
      const path = data.solution;
      for (let pi = 0; pi < path.length - 1; pi++) {
        const p1 = path[pi]; const p2 = path[pi + 1];
        doc.line(startX + p1[1] * cellSize + cellSize / 2, startY + p1[0] * cellSize + cellSize / 2,
                 startX + p2[1] * cellSize + cellSize / 2, startY + p2[0] * cellSize + cellSize / 2);
      }
    }
  });
  doc.setTextColor(0);
};

// ── Word Scramble Solution Pack (1, 2, or 4 per page) ─────────────────────────
const drawWordScrambleSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { scrambledData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.scrambledData) return;
    const data = entry.scrambledData;

    doc.setFont("Helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0);
    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.18, { align: "center" });

    const titleSpace = 0.28;
    const words = data.original || [];
    const stepY = Math.min(0.26, (zone.h - titleSpace - 0.1) / Math.max(1, words.length));
    words.forEach((word: string, wi: number) => {
      const y = zone.y + titleSpace + wi * stepY + 0.1;
      doc.setFont("Helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text(`${wi + 1}.`, zone.x + 0.1, y);
      doc.setFont("Courier", "bold"); doc.setFontSize(9); doc.setTextColor(30, 41, 59);
      doc.text((data.scrambled[wi] || "").split("").join(" "), zone.x + 0.32, y);
      doc.setFont("Helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(79, 70, 229);
      doc.text(word, zone.x + zone.w - 0.1, y, { align: "right" });
    });
  });
  doc.setTextColor(0);
};

// ── Cryptogram Solution Pack (1, 2, or 4 per page) ────────────────────────────
const drawCryptogramSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { cryptogramData: any; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  // Scale type size to how much room each solution actually gets: a lone
  // cryptogram on a full-page zone should read like a poster, not be stuck
  // at the same small size used when 4 share a page. cipherMax/cipherMin
  // bound the font-fit step below (the alphabet key is always the same 61
  // fixed characters, so its size is solved for rather than guessed).
  const sizeTier = group.length <= 1
    ? { title: 18, sentence: 26, lineStep: 0.46, cipherGap: 0.5, cipherMax: 14, cipherMin: 7 }
    : group.length === 2
    ? { title: 14, sentence: 16, lineStep: 0.32, cipherGap: 0.36, cipherMax: 11, cipherMin: 6 }
    : { title: 10, sentence: 9, lineStep: 0.22, cipherGap: 0.25, cipherMax: 8, cipherMin: 5 };

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.cryptogramData) return;
    const data = entry.cryptogramData;
    const innerW = zone.w - 0.3;

    doc.setFont("Helvetica", "bold"); doc.setFontSize(sizeTier.title); doc.setTextColor(0);
    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.3, { align: "center" });
    const titleSpace = 0.32 + (sizeTier.title - 10) * 0.02;

    // Decoded sentence: splitTextToSize does the safe, tested wrapping (the
    // same call the standalone Cryptogram Studio answer key uses) instead of
    // a hand-rolled word-wrap loop.
    doc.setFont("Helvetica", "bold"); doc.setFontSize(sizeTier.sentence);
    const sentenceLines: string[] = doc.splitTextToSize(data.original || "", innerW);

    // Cipher key as two aligned monospace rows ("Original: A B C ..." /
    // "Cipher:   X Y Z ...") -- same layout as the standalone Cryptogram
    // Studio answer key, and it sidesteps the per-token wrap entirely since
    // both rows are always the same fixed 61-character length. Solve for the
    // largest font size (within this tier's bounds) that actually fits the
    // zone width rather than guessing a size and hoping it's small enough.
    const alphaStr = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
    const origLine = `Original: ${alphaStr}`;
    const cipherLine = `Cipher:   ${alphaStr.split(" ").map((l: string) => data.cipherMap?.[l] || "_").join(" ")}`;
    doc.setFont("Courier", "bold");
    doc.setFontSize(sizeTier.cipherMax);
    const fullW = doc.getTextWidth(origLine);
    const cipherFont = Math.max(sizeTier.cipherMin, Math.min(sizeTier.cipherMax, sizeTier.cipherMax * (innerW / fullW)));
    doc.setFontSize(cipherFont);
    const cipherLineHeight = (cipherFont / 72) * 1.5;

    const contentHeight = sentenceLines.length * sizeTier.lineStep + sizeTier.cipherGap + 2 * cipherLineHeight;
    const availableHeight = zone.h - titleSpace;
    const contentStartY = zone.y + titleSpace + Math.max(0, (availableHeight - contentHeight) / 2);

    doc.setFont("Helvetica", "bold"); doc.setFontSize(sizeTier.sentence); doc.setTextColor(79, 70, 229);
    let sy = contentStartY + sizeTier.lineStep;
    sentenceLines.forEach((line: string) => {
      doc.text(line, zone.x + 0.15, sy);
      sy += sizeTier.lineStep;
    });

    if (data.cipherMap) {
      doc.setFont("Courier", "bold"); doc.setFontSize(cipherFont); doc.setTextColor(51, 65, 85);
      const keyY = sy - sizeTier.lineStep + sizeTier.cipherGap + cipherLineHeight;
      doc.text(origLine, zone.x + 0.15, keyY);
      doc.setTextColor(100, 116, 139);
      doc.text(cipherLine, zone.x + 0.15, keyY + cipherLineHeight);
    }
  });
  doc.setTextColor(0);
};

// ── Math Puzzle Solution Pack (1, 2, or 4 per page) ───────────────────────────
const drawMathPuzzleSolutionPack = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const group: { puzzleData: any; puzzleType: string; puzzleIndex: number; pageNumber?: number }[] = page.config.solutionGroup || [];
  const margin = 0.5;
  const topReserved = 1.2;
  const x0 = margin + xShift;
  const safeW = pageWidth - margin * 2;
  const safeH = pageHeight - topReserved - margin;
  const zones = getSolutionPackZones(group.length, x0, topReserved, safeW, safeH);

  group.forEach((entry, i) => {
    const zone = zones[i];
    if (!zone || !entry.puzzleData) return;
    const puzzle = entry.puzzleData;
    const puzzleType = entry.puzzleType || "addition";

    doc.setFont("Helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0);
    const solLabel = entry.pageNumber ? `Page ${entry.pageNumber} Solution` : `Answer #${entry.puzzleIndex}`;
    doc.text(solLabel, zone.x + zone.w / 2, zone.y + 0.18, { align: "center" });

    const titleSpace = 0.3;
    const availH = zone.h - titleSpace;

    if (puzzleType === "addition") {
      const size = 3;
      const boxW = Math.min(0.55, (zone.w - 0.4) / (size + (size - 1)));
      const cellSpacing = boxW * 0.82;
      const totalW = size * boxW + (size - 1) * cellSpacing;
      const startX = zone.x + (zone.w - totalW) / 2;
      const startY = zone.y + titleSpace + (availH - (size * boxW + (size - 1) * cellSpacing)) / 2;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const idx = r * 3 + c;
          const cx = startX + c * (boxW + cellSpacing);
          const cy = startY + r * (boxW + cellSpacing);
          doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.01); doc.rect(cx, cy, boxW, boxW);
          const val = puzzle.grid[idx];
          const isAnswer = puzzle.hiddenIndices.includes(idx);
          doc.setFont("Helvetica", "bold"); doc.setFontSize(Math.max(8, Math.floor(boxW * 22)));
          doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
          doc.text(val.toString(), cx + boxW / 2, cy + boxW / 2 + boxW * 0.1, { align: "center" });
          doc.setFontSize(Math.max(7, Math.floor(boxW * 20))); doc.setTextColor(100, 116, 139);
          if (c < size - 1) doc.text(c === 1 ? "=" : "+", cx + boxW + cellSpacing / 2, cy + boxW / 2 + boxW * 0.1, { align: "center" });
          if (r < size - 1) doc.text(r === 1 ? "=" : "+", cx + boxW / 2, cy + boxW + cellSpacing / 2 + boxW * 0.1, { align: "center" });
        }
      }
    } else if (puzzleType === "multiplication" || puzzleType === "number_fill") {
      const size = 5;
      const cellW = Math.min(0.5, zone.w / (size + 0.5));
      const cellH = Math.min(0.5, availH / (size + 0.5));
      const totalW = size * cellW; const totalH = size * cellH;
      const startX = zone.x + (zone.w - totalW) / 2;
      const startY = zone.y + titleSpace + (availH - totalH) / 2;

      doc.setLineWidth(0.01); doc.setDrawColor(30, 41, 59);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cx = startX + c * cellW; const cy = startY + r * cellH;
          if (puzzleType === "multiplication") {
            const isHeader = r === 0 || c === 0;
            if (isHeader) { doc.setFillColor(241, 245, 249); doc.rect(cx, cy, cellW, cellH, "FD"); }
            else doc.rect(cx, cy, cellW, cellH);
            let val: any = ""; let isAnswer = false;
            if (r === 0 && c === 0) { val = "×"; }
            else if (r === 0) { val = puzzle.colFactors[c-1]; isAnswer = puzzle.hiddenCols.includes(c-1); }
            else if (c === 0) { val = puzzle.rowFactors[r-1]; isAnswer = puzzle.hiddenRows.includes(r-1); }
            else { val = puzzle.grid[r-1][c-1]; isAnswer = puzzle.hiddenProducts.some((p: any) => p[0]===r-1 && p[1]===c-1); }
            doc.setFont("Helvetica", "bold"); doc.setFontSize(Math.max(7, Math.floor(cellW * 18)));
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW/2, cy + cellH/2 + cellH*0.08, { align: "center" });
          } else {
            if (r === size-1 && c === size-1) continue;
            const isSumHeader = r === size-1 || c === size-1;
            if (isSumHeader) { doc.setFillColor(248, 250, 252); doc.setDrawColor(148, 163, 184); doc.rect(cx, cy, cellW, cellH, "FD"); }
            else { doc.setDrawColor(30, 41, 59); doc.rect(cx, cy, cellW, cellH); }
            doc.setFont("Helvetica", "bold"); doc.setFontSize(Math.max(7, Math.floor(cellW * 18)));
            const isAnswer = !isSumHeader && puzzle.hiddenCells.some((cell: any) => cell[0]===r && cell[1]===c);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            const val = isSumHeader ? (r === size-1 ? puzzle.colSums[c] : puzzle.rowSums[r]) : puzzle.grid[r][c];
            doc.text(val.toString(), cx + cellW/2, cy + cellH/2 + cellH*0.08, { align: "center" });
          }
        }
      }
    }
  });
  doc.setTextColor(0);
};

const drawLowContent = (doc: any, page: any, xShift: number, w: number, h: number) => {
  const templateType = page.config.template || 'lined_journal';
  const pageTitle = page.config.pageTitle || 'Journal';
  const lineSpacing = page.config.lineSpacing || 24; 
  const ptSpacing = lineSpacing * 0.0104; 

  // 1. Draw Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  const titleWidth = doc.getTextWidth(pageTitle.toUpperCase());
  doc.text(pageTitle.toUpperCase(), (w - titleWidth) / 2 + xShift, 0.95);

  doc.setLineWidth(0.015);
  doc.setDrawColor(79, 70, 229);
  doc.line((w - 1.2) / 2 + xShift, 1.1, (w + 1.2) / 2 + xShift, 1.1);

  // 2. Render templates
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.008);

  const startX = 0.75 + xShift;
  const endX = w - 0.75 + xShift;

  if (templateType === 'lined_journal') {
    let currentY = 1.6;
    while (currentY < h - 0.8) {
      doc.line(startX, currentY, endX, currentY);
      currentY += ptSpacing;
    }
  } 
  else if (templateType === 'dot_grid') {
    const spacing = 0.25; 
    for (let currentY = 1.6; currentY < h - 0.8; currentY += spacing) {
      for (let currentX = startX; currentX < endX; currentX += spacing) {
        doc.setFillColor(148, 163, 184);
        doc.circle(currentX, currentY, 0.01, "F");
      }
    }
  } 
  else if (templateType === 'weekly_planner') {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Weekend", "Notes"];
    days.forEach((day, idx) => {
      const isNotes = day === "Notes";
      const colIdx = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      
      const cardW = isNotes ? (w - 1.5) : (w - 1.8) / 2;
      const cardH = isNotes ? 1.4 : 1.6;
      const cX = isNotes ? (0.75 + xShift) : (0.75 + colIdx * (cardW + 0.3) + xShift);
      const cY = 1.6 + rowIdx * 1.9;

      doc.setDrawColor(203, 213, 225);
      doc.rect(cX, cY, cardW, cardH);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(day.toUpperCase(), cX + 0.1, cY + 0.2);

      doc.setDrawColor(241, 245, 249);
      doc.line(cX + 0.1, cY + 0.3, cX + cardW - 0.1, cY + 0.3);
    });
  } 
  else if (templateType === 'daily_planner') {
    const sW = (w - 1.8) / 2;
    const sH = h - 2.4;
    const sX = 0.75 + xShift;
    const sY = 1.6;

    doc.rect(sX, sY, sW, sH);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text("TODAY'S SCHEDULE", sX + 0.15, sY + 0.25);
    
    doc.setDrawColor(241, 245, 249);
    let schedY = sY + 0.55;
    const hours = ["7:00 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"];
    hours.forEach((time) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(time, sX + 0.15, schedY + 0.03);
      doc.line(sX + 0.85, schedY, sX + sW - 0.15, schedY);
      schedY += 0.55;
    });

    const rX = 0.75 + sW + 0.3 + xShift;
    const pW = sW;
    
    doc.setDrawColor(203, 213, 225);
    doc.rect(rX, sY, pW, 2.2);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text("TOP PRIORITIES", rX + 0.15, sY + 0.25);
    
    let priorityY = sY + 0.65;
    for (let i = 0; i < 3; i++) {
      doc.rect(rX + 0.15, priorityY - 0.08, 0.12, 0.12);
      doc.line(rX + 0.35, priorityY, rX + pW - 0.15, priorityY);
      priorityY += 0.55;
    }

    doc.rect(rX, sY + 2.5, pW, 1.2);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text("WATER INTAKE", rX + 0.15, sY + 2.75);

    const dropXStart = rX + (pW - (8 * 0.3)) / 2;
    for (let i = 0; i < 8; i++) {
      const dX = dropXStart + i * 0.3;
      const dY = sY + 3.2;
      doc.rect(dX, dY - 0.1, 0.15, 0.15); 
    }
  } 
  else if (templateType === 'habit_tracker') {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("MONTHLY HABIT LOG", startX, 1.75);

    const cellW = 0.16;
    const descW = 2.0;
    const rowH = 0.45;
    const startY = 1.95;

    doc.setFillColor(248, 250, 252);
    doc.rect(startX, startY, descW + (31 * cellW), rowH, "F");
    doc.rect(startX, startY, descW + (31 * cellW), rowH);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("HABIT DESCRIPTION", startX + 0.1, startY + 0.28);
    doc.text("DAYS OF THE MONTH (1 - 31)", startX + descW + 1.2, startY + 0.28);

    // Row count scales with page height instead of a fixed 10, so taller
    // trims get a fully-filled habit grid rather than blank space below it.
    const numRows = Math.floor((h - 0.8 - (startY + rowH)) / rowH);
    for (let r = 0; r < numRows; r++) {
      const cY = startY + (r + 1) * rowH;
      doc.rect(startX, cY, descW + (31 * cellW), rowH);
      doc.line(startX + descW, cY, startX + descW, cY + rowH);

      for (let c = 1; c <= 31; c++) {
        const cX = startX + descW + c * cellW;
        doc.line(cX, cY, cX, cY + rowH);
      }
    }
  }
  else if (templateType === 'password_keeper') {
    let currentY = 1.6;
    const blockH = 1.3;
    const blockStep = 1.6;
    // Loops until the next block would overrun the bottom margin, instead of
    // a fixed 4, so taller trims fill up with more entry blocks.
    while (currentY + blockH <= h - 0.8) {
      doc.rect(startX, currentY, w - 1.5, blockH);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("WEBSITE:", startX + 0.15, currentY + 0.35);
      doc.text("USERNAME / EMAIL:", startX + 0.15, currentY + 0.7);
      doc.text("PASSWORD:", startX + 0.15, currentY + 1.05);

      doc.setDrawColor(241, 245, 249);
      doc.line(startX + 1.8, currentY + 0.4, startX + w - 1.8, currentY + 0.4);
      doc.line(startX + 1.8, currentY + 0.75, startX + w - 1.8, currentY + 0.75);
      doc.line(startX + 1.8, currentY + 1.1, startX + w - 1.8, currentY + 1.1);

      doc.setDrawColor(203, 213, 225);
      currentY += blockStep;
    }
  }
  else if (templateType === 'budget_log') {
    const colW = [1.2, 3.8, 2.0];
    const headerH = 0.45;
    const rowH = 0.4;
    const startY = 1.6;

    doc.setFillColor(248, 250, 252);
    doc.rect(startX, startY, w - 1.5, headerH, "F");
    doc.rect(startX, startY, w - 1.5, headerH);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("DATE", startX + 0.15, startY + 0.28);
    doc.text("DESCRIPTION", startX + colW[0] + 0.15, startY + 0.28);
    doc.text("AMOUNT / BALANCE", startX + colW[0] + colW[1] + 0.15, startY + 0.28);

    doc.line(startX + colW[0], startY, startX + colW[0], startY + headerH);
    doc.line(startX + colW[0] + colW[1], startY, startX + colW[0] + colW[1], startY + headerH);

    // Row count scales with the actual page height (same "fill to h - 0.8"
    // bottom-margin convention as lined_journal/dot_grid above) instead of a
    // fixed count, so taller trims don't leave the bottom of the page blank.
    const numRows = Math.floor((h - 0.8 - (startY + headerH)) / rowH);
    for (let r = 0; r < numRows; r++) {
      const cY = startY + headerH + r * rowH;
      doc.rect(startX, cY, w - 1.5, rowH);
      doc.line(startX + colW[0], cY, startX + colW[0], cY + rowH);
      doc.line(startX + colW[0] + colW[1], cY, startX + colW[0] + colW[1], cY + rowH);
    }
  }
  else if (templateType === 'recipe_journal') {
    const cardW = (w - 1.8) / 3;
    const startY = 1.6;
    ["SERVINGS: ______", "PREP TIME: _____", "COOK TIME: _____"].forEach((lbl, idx) => {
      const cX = startX + idx * (cardW + 0.15);
      doc.rect(cX, startY, cardW, 0.45);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(lbl, cX + 0.1, startY + 0.28);
    });

    const boxW = (w - 1.8) / 2;
    const boxH = h - 3.4;
    const boxY = startY + 0.75;

    doc.rect(startX, boxY, boxW, boxH);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("INGREDIENTS", startX + 0.15, boxY + 0.3);

    // Line counts scale with boxH (which already scales with page height)
    // instead of fixed 12/10, so the ingredient/direction lines actually
    // fill the box rather than stopping partway on taller trims.
    const ingredientLines = Math.floor((boxH - 0.75) / 0.4);
    for (let i = 0; i < ingredientLines; i++) {
      doc.circle(startX + 0.2, boxY + 0.6 + i * 0.4, 0.015, "F");
      doc.line(startX + 0.35, boxY + 0.62 + i * 0.4, startX + boxW - 0.15, boxY + 0.62 + i * 0.4);
    }

    doc.rect(startX + boxW + 0.3, boxY, boxW, boxH);
    doc.text("DIRECTIONS / NOTES", startX + boxW + 0.45, boxY + 0.3);
    const directionLines = Math.floor((boxH - 0.77) / 0.48);
    for (let i = 0; i < directionLines; i++) {
      doc.line(startX + boxW + 0.45, boxY + 0.62 + i * 0.48, startX + w - 0.9, boxY + 0.62 + i * 0.48);
    }
  }
  else if (templateType === 'gratitude_journal') {
    const prompts = [
      "Three things I am grateful for today:",
      "A self-reflection / quote that inspired me:",
      "The highlights and wins of my day:"
    ];
    let currentY = 1.6;
    prompts.forEach((p) => {
      doc.rect(startX, currentY, w - 1.5, 2.2);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(p.toUpperCase(), startX + 0.15, currentY + 0.3);

      doc.setDrawColor(241, 245, 249);
      doc.line(startX + 0.15, currentY + 0.75, startX + w - 0.9, currentY + 0.75);
      doc.line(startX + 0.15, currentY + 1.25, startX + w - 0.9, currentY + 1.25);
      doc.line(startX + 0.15, currentY + 1.75, startX + w - 0.9, currentY + 1.75);

      doc.setDrawColor(203, 213, 225);
      currentY += 2.5;
    });
  } 
  else if (templateType === 'guest_book') {
    let currentY = 1.6;
    const blockH = 1.4;
    const blockStep = 1.7;
    // Loops until the next block would overrun the bottom margin, instead of
    // a fixed 4, so taller trims fill up with more guest entry blocks.
    while (currentY + blockH <= h - 0.8) {
      doc.rect(startX, currentY, w - 1.5, blockH);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("VISITOR NAME:", startX + 0.15, currentY + 0.35);
      doc.text("DATE: _____________", startX + w - 2.8, currentY + 0.35);
      doc.text("MESSAGE / THOUGHTS:", startX + 0.15, currentY + 0.75);

      doc.setDrawColor(241, 245, 249);
      doc.line(startX + 1.8, currentY + 0.4, startX + w - 3.2, currentY + 0.4);
      doc.line(startX + 0.15, currentY + 1.05, startX + w - 0.9, currentY + 1.05);

      doc.setDrawColor(203, 213, 225);
      currentY += blockStep;
    }
  }
  else if (templateType === 'graph') {
    const spacing = 0.25;
    for (let currentX = startX; currentX <= endX; currentX += spacing) {
      doc.line(currentX, 1.6, currentX, h - 0.8);
    }
    for (let currentY = 1.6; currentY <= h - 0.8; currentY += spacing) {
      doc.line(startX, currentY, endX, currentY);
    }
  }
  else if (templateType === 'cornell') {
    const cueW = (w - 1.5) * 0.3;
    const summaryH = 1.4;
    doc.line(startX + cueW, 1.6, startX + cueW, h - 0.8 - summaryH);
    doc.line(startX, h - 0.8 - summaryH, endX, h - 0.8 - summaryH);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text("CUES / KEYWORDS", startX + 0.1, 1.8);
    doc.text("NOTES", startX + cueW + 0.15, 1.8);
    doc.text("SUMMARY", startX + 0.1, h - 0.8 - summaryH + 0.25);

    doc.setDrawColor(241, 245, 249);
    let noteY = 2.1;
    while (noteY < h - 0.8 - summaryH - 0.2) {
      doc.line(startX + cueW + 0.15, noteY, endX, noteY);
      noteY += 0.3;
    }
  }
  else if (templateType === 'meal_planner') {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const rowH = 0.65;
    let cY = 1.6;
    days.forEach(d => {
      if (cY + rowH <= h - 0.8) {
        doc.rect(startX, cY, w - 1.5, rowH);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(d.toUpperCase(), startX + 0.15, cY + 0.38);
        doc.line(startX + 1.1, cY, startX + 1.1, cY + rowH);
        cY += rowH + 0.08;
      }
    });
  }
  else if (templateType === 'workout_log') {
    const colW = [2.0, 0.8, 0.8, 0.9, 1.2];
    const headerH = 0.4;
    const rowH = 0.38;
    const startY = 1.6;
    doc.setFillColor(248, 250, 252);
    doc.rect(startX, startY, w - 1.5, headerH, "F");
    doc.rect(startX, startY, w - 1.5, headerH);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("EXERCISE", startX + 0.1, startY + 0.25);
    doc.text("SETS", startX + colW[0] + 0.1, startY + 0.25);
    doc.text("REPS", startX + colW[0] + colW[1] + 0.1, startY + 0.25);
    doc.text("WEIGHT", startX + colW[0] + colW[1] + colW[2] + 0.1, startY + 0.25);
    doc.text("NOTES", startX + colW[0] + colW[1] + colW[2] + colW[3] + 0.1, startY + 0.25);
    
    let currentX = startX;
    colW.slice(0, 4).forEach(cw => {
      currentX += cw;
      doc.line(currentX, startY, currentX, startY + headerH);
    });

    const numRows = Math.floor((h - 0.8 - (startY + headerH)) / rowH);
    for (let r = 0; r < numRows; r++) {
      const cY = startY + headerH + r * rowH;
      doc.rect(startX, cY, w - 1.5, rowH);
      let cx = startX;
      colW.slice(0, 4).forEach(cw => {
        cx += cw;
        doc.line(cx, cY, cx, cY + rowH);
      });
    }
  }
  else if (templateType === 'reading_log') {
    let currentY = 1.6;
    const blockH = 1.3;
    const blockStep = 1.5;
    while (currentY + blockH <= h - 0.8) {
      doc.rect(startX, currentY, w - 1.5, blockH);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("BOOK TITLE:", startX + 0.15, currentY + 0.35);
      doc.text("AUTHOR:", startX + 0.15, currentY + 0.7);
      doc.text("RATING & THOUGHTS:", startX + 0.15, currentY + 1.05);
      doc.setDrawColor(241, 245, 249);
      doc.line(startX + 1.8, currentY + 0.4, startX + w - 1.8, currentY + 0.4);
      doc.line(startX + 1.8, currentY + 0.75, startX + w - 1.8, currentY + 0.75);
      doc.line(startX + 1.8, currentY + 1.1, startX + w - 1.8, currentY + 1.1);
      doc.setDrawColor(203, 213, 225);
      currentY += blockStep;
    }
  }

  doc.setTextColor(0);
};