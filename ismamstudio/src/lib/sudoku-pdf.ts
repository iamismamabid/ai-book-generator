// src/lib/sudoku-pdf.ts
import { jsPDF } from "jspdf";
import { Grid, Difficulty } from "./sudokuGenerator";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";
import { getGutterMargin } from "./gutterMargin";
import { calculateKdpMargins, drawKdpTitlePage, drawKdpCopyrightAndInstructionsPage, drawKdpSolutionsDividerPage, ensureEvenPageCount } from "./kdpBookEngine";

export interface PdfProgressInfo {
  phase: "generating_pages" | "generating_solutions" | "decorating" | "saving";
  current: number;
  total: number;
  percent: number;
  message: string;
}

export interface PdfOptions {
  puzzles: { puzzle: Grid; solution: Grid }[];
  difficulty: Difficulty;
  trimSize: "6x9" | "8.5x11" | "5x8";
  title?: string;
  subtitle?: string;
  authorName?: string;
  headerText?: string;
  footerText?: string;
  borderThickness?: number;
  fontFamily?: "sans-serif" | "serif" | "monospace";
  includeSolutions?: boolean;
  solutionsPerPage?: number; // 1, 2, or 4 per page
  includeCover?: boolean;
  coverState?: any;
  includeFrontMatter?: boolean;
  isPremium?: boolean;
  hasBleed?: boolean;
  showGuides?: boolean;
  borderTheme?: BorderThemeId;
  onProgress?: (info: PdfProgressInfo) => void;
}

const FONT_MAP: Record<string, string> = {
  "sans-serif": "helvetica",
  "serif": "times",
  "monospace": "courier",
};

function getSolutionPackZones(count: number, x0: number, y0: number, safeW: number, safeH: number) {
  if (count <= 1) return [{ x: x0, y: y0, w: safeW, h: safeH }];
  if (count === 2) {
    const gap = 0.4;
    const h = (safeH - gap) / 2;
    return [
      { x: x0, y: y0, w: safeW, h },
      { x: x0, y: y0 + h + gap, w: safeW, h },
    ];
  }
  const gapX = 0.45;
  const gapY = 0.5;
  const w = (safeW - gapX) / 2;
  const h = (safeH - gapY) / 2;
  return [
    { x: x0, y: y0, w, h },
    { x: x0 + w + gapX, y: y0, w, h },
    { x: x0, y: y0 + h + gapY, w, h },
    { x: x0 + w + gapX, y: y0 + h + gapY, w, h },
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
    doc.setFontSize(size > 4.5 ? 14 : 10.5);
    doc.setTextColor(0);
    const label = isSolution ? `Answer #${puzzleNumber}` : `Puzzle #${puzzleNumber}`;
    doc.text(label, x + size / 2, y - 0.12, { align: "center" });
  }

  const cellSize = size / 9;

  // Thin cell borders scaled with user borderThickness
  const thinLine = Math.max(0.006, Math.min(0.012, borderThickness * 0.006));
  doc.setLineWidth(thinLine);
  doc.setDrawColor(0);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = x + c * cellSize;
      const cellY = y + r * cellSize;
      doc.rect(cellX, cellY, cellSize, cellSize);
    }
  }

  // Thick 3x3 box borders scaled with user borderThickness
  const thickLine = Math.max(0.012, Math.min(0.024, borderThickness * 0.012));
  doc.setLineWidth(thickLine);
  doc.setDrawColor(0);
  for (let b = 0; b <= 3; b++) {
    const offset = b * cellSize * 3;
    doc.line(x + offset, y, x + offset, y + size);
    doc.line(x, y + offset, x + size, y + offset);
  }

  // Draw numbers: precise optical centering + safe proportional font sizing
  const numberFontSize = isSolution
    ? Math.max(7, Math.min(10, Math.floor(cellSize * 24)))
    : Math.max(12, Math.min(20, Math.floor(cellSize * 28)));

  doc.setFontSize(numberFontSize);
  doc.setFont(pdfFont, "bold");
  doc.setTextColor(0);

  const verticalOffset = cellSize * 0.65;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        doc.text(
          val.toString(),
          x + c * cellSize + cellSize / 2,
          y + r * cellSize + verticalOffset,
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
    subtitle,
    authorName = "Independent Publisher",
    headerText,
    footerText,
    borderThickness = 2,
    fontFamily = "sans-serif",
    includeSolutions = true,
    solutionsPerPage = 4,
    includeCover = false,
    coverState = null,
    includeFrontMatter = true,
    isPremium,
    hasBleed = false,
    showGuides = false,
    borderTheme,
    onProgress,
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

  // Calculate total pages for KDP inside gutter margin sizing
  const solPerPage = Math.min(4, Math.max(1, solutionsPerPage));
  const solDividerPages = includeSolutions ? 1 : 0;
  const totalSolPages = includeSolutions ? Math.ceil(puzzles.length / solPerPage) : 0;
  const frontMatterPages = 2;
  const totalExpectedPages = frontMatterPages + puzzles.length + solDividerPages + totalSolPages;

  // KDP gutter calculation (0.375" up to 150 pages, 0.5" up to 300 pages)
  const gutterExtra = getGutterMargin(totalExpectedPages);
  const outsideMargin = 0.5;
  // Dynamically scale inside gutter with book thickness: 0.75" for <=300 pages up to 1.00" for 500+ pages
  const insideMargin = Math.max(0.75, Math.min(1.0, 0.25 + gutterExtra));

  let firstPageAdded = false;
  let currentPage = 0;

  // 1. Draw Front Cover if integrated
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
    currentPage++;
  }

  // 2. Standard KDP Front Matter (Title Page & Copyright/Instructions) - Mandatory
  if (firstPageAdded) doc.addPage();
  firstPageAdded = true;
  currentPage++;
  drawKdpTitlePage(doc, {
    title: title || "Sudoku Master",
    subtitle: subtitle || `${puzzles.length} Handcrafted Large Print Sudoku Puzzles with Complete Solutions`,
    authorName: authorName || "Independent Publisher",
    puzzleType: "sudoku",
    difficulty,
    puzzleCount: puzzles.length,
    pdfFont,
    width,
    height,
    totalPages: totalExpectedPages,
  });

  // Page 2: Copyright & Rules Page (Verso / Left page)
  doc.addPage();
  currentPage++;
  drawKdpCopyrightAndInstructionsPage(doc, {
    authorName: authorName || "Independent Publisher",
    puzzleType: "sudoku",
    width,
    height,
    totalPages: totalExpectedPages,
    pdfFont,
  });

  // ── Puzzle pages (1 per page - Standard KDP Book Format) ─────────
  for (let index = 0; index < puzzles.length; index++) {
    const item = puzzles[index];
    if (firstPageAdded) doc.addPage();
    firstPageAdded = true;
    currentPage++;

    // Alternating KDP Gutter Margins:
    // Odd pages (recto / right page): Spine is on the LEFT -> inside margin on left
    // Even pages (verso / left page): Spine is on the RIGHT -> inside margin on right
    const isOdd = currentPage % 2 !== 0;
    const marginLeft = isOdd ? insideMargin : outsideMargin;
    const marginRight = isOdd ? outsideMargin : insideMargin;
    const contentW = width - marginLeft - marginRight;
    const contentCenterX = marginLeft + contentW / 2;

    let maxGridSize = 5.5;
    if (trimSize === "6x9") maxGridSize = 4.2;
    if (trimSize === "5x8") maxGridSize = 3.5;

    const gridSize = Math.min(maxGridSize, contentW, height - 1.6);
    const startX = marginLeft + (contentW - gridSize) / 2;
    const startY = (height - gridSize) / 2 - 0.1;

    // Header Title
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    const pageHeader = headerText && headerText.trim()
      ? (headerText.includes("#") ? headerText : `${headerText} #${index + 1}`)
      : `${title} #${index + 1}`;
    doc.text(pageHeader, contentCenterX, startY - 0.35, { align: "center" });

    // Draw Sudoku Tile with chosen border thickness and font
    drawSudokuTile(doc, item.puzzle, startX, startY, gridSize, false, index + 1, false, pdfFont, borderThickness);

    if (showGuides) {
      drawMarginGuides(doc, marginLeft, 0.5, marginRight, 0.5, width, height);
    }

    // Footer Copyright Line & Page Number
    doc.setFont(pdfFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
    if (footerText && footerText.trim()) {
      doc.text(footerText, marginLeft, height - 0.4);
      doc.text(`Page ${currentPage}`, width - marginRight, height - 0.4, { align: "right" });
    } else {
      doc.text(`Page ${currentPage}`, contentCenterX, height - 0.4, { align: "center" });
    }

    // Yield periodically to keep UI fluid and responsive
    if ((index + 1) % 10 === 0 || index === puzzles.length - 1) {
      const pct = Math.round(((index + 1) / puzzles.length) * 100);
      onProgress?.({
        phase: "generating_pages",
        current: index + 1,
        total: puzzles.length,
        percent: pct,
        message: `Compiling puzzle pages (${index + 1}/${puzzles.length})...`,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // ── Solution pages (1, 2, or 4 per page) ─────────────────────
  if (includeSolutions) {
    doc.addPage();
    currentPage++;
    drawKdpSolutionsDividerPage(doc, {
      puzzleCount: puzzles.length,
      puzzleType: "sudoku",
      width,
      height,
      pageNumber: currentPage,
      totalPages: totalExpectedPages,
      pdfFont,
      customSubtitle: `Complete Answer Keys for Sudoku Puzzles #1 to #${puzzles.length}`,
    });

    for (let p = 0; p < totalSolPages; p++) {
      doc.addPage();
      currentPage++;

      // Alternating KDP Gutter Margins for solution pages
      const isOdd = currentPage % 2 !== 0;
      const marginLeft = isOdd ? insideMargin : outsideMargin;
      const marginRight = isOdd ? outsideMargin : insideMargin;
      const contentW = width - marginLeft - marginRight;
      const contentCenterX = marginLeft + contentW / 2;

      const marginTop = 0.5;
      const safeH = height - marginTop * 2;
      const topReserved = 0.5;
      const availH = safeH - topReserved;

      // Solution Section Header
      doc.setFont(pdfFont, "bold");
      doc.setFontSize(14);
      doc.setTextColor(0);
      const solHeader = headerText && headerText.trim()
        ? `${headerText} — Solutions`
        : `Solutions (Page ${p + 1} of ${totalSolPages})`;
      doc.text(solHeader, contentCenterX, marginTop + 0.3, { align: "center" });

      if (showGuides) {
        drawMarginGuides(doc, marginLeft, marginTop, marginRight, marginTop, width, height);
      }

      const zones = getSolutionPackZones(solPerPage, marginLeft, marginTop + topReserved, contentW, availH);

      for (let z = 0; z < solPerPage; z++) {
        const solIndex = p * solPerPage + z;
        if (solIndex >= puzzles.length) break;

        const zone = zones[z];
        const titleSpace = 0.28;
        const maxTileW = zone.w - 0.1;
        const maxTileH = zone.h - titleSpace - 0.1;
        const maxAllowedSize = trimSize === "5x8" ? 1.5 : trimSize === "6x9" ? 2.0 : 2.7;
        const tileSize = Math.min(maxTileW, maxTileH, maxAllowedSize);
        const startX = zone.x + (zone.w - tileSize) / 2;
        const startY = zone.y + titleSpace + (zone.h - titleSpace - tileSize) / 2;

        drawSudokuTile(doc, puzzles[solIndex].solution, startX, startY, tileSize, true, solIndex + 1, true, pdfFont, borderThickness);
      }

      // Solution Page Footer
      doc.setFont(pdfFont, "normal");
      doc.setFontSize(9);
      doc.setTextColor(0);
      if (footerText && footerText.trim()) {
        doc.text(footerText, marginLeft, height - 0.35);
        doc.text(`Page ${currentPage}`, width - marginRight, height - 0.35, { align: "right" });
      } else {
        doc.text(`Page ${currentPage}`, contentCenterX, height - 0.35, { align: "center" });
      }

      // Yield periodically to keep UI responsive
      if ((p + 1) % 5 === 0 || p === totalSolPages - 1) {
        const pct = Math.round(((p + 1) / totalSolPages) * 100);
        onProgress?.({
          phase: "generating_solutions",
          current: p + 1,
          total: totalSolPages,
          percent: pct,
          message: `Compiling solutions (${p + 1}/${totalSolPages})...`,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  // Apply watermark (unpaid/free tier) and the decorative border theme
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

      if (i % 20 === 0 || i === totalPages) {
        onProgress?.({
          phase: "decorating",
          current: i,
          total: totalPages,
          percent: Math.round((i / totalPages) * 100),
          message: `Finalizing page styling (${i}/${totalPages})...`,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  ensureEvenPageCount(doc);
  return doc;
}

export async function downloadSudokuPdf(options: PdfOptions, filename: string) {
  const doc = await generateSudokuPdf(options);
  options.onProgress?.({
    phase: "saving",
    current: 100,
    total: 100,
    percent: 100,
    message: "Embedding print-ready fonts and saving PDF...",
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const { saveKdpCompliantPdf } = await import("./kdpFontEmbedder");
  await saveKdpCompliantPdf(doc, filename);
}