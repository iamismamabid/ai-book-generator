// src/lib/sudoku-pdf.ts
import { jsPDF } from "jspdf";
import { Grid, Difficulty } from "./sudokuGenerator";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";
import { getGutterMargin } from "./gutterMargin";

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
  if (count === 2) return [
    { x: x0, y: y0, w: safeW, h: safeH / 2 - 0.2 },
    { x: x0, y: y0 + safeH / 2 + 0.2, w: safeW, h: safeH / 2 - 0.2 },
  ];
  return [
    { x: x0, y: y0, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0 + safeW / 2 + 0.15, y: y0, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0, y: y0 + safeH / 2 + 0.15, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
    { x: x0 + safeW / 2 + 0.15, y: y0 + safeH / 2 + 0.15, w: safeW / 2 - 0.15, h: safeH / 2 - 0.15 },
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
    doc.setFontSize(size > 4.5 ? 14 : 11);
    doc.setTextColor(15, 23, 42);
    const label = isSolution ? `Answer #${puzzleNumber}` : `Puzzle #${puzzleNumber}`;
    doc.text(label, x + size / 2, y - 0.1, { align: "center" });
  }

  const cellSize = size / 9;

  // Thin cell borders scaled with user borderThickness
  const thinLine = Math.max(0.004, borderThickness * 0.004);
  doc.setLineWidth(thinLine);
  doc.setDrawColor(148, 163, 184);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = x + c * cellSize;
      const cellY = y + r * cellSize;
      doc.rect(cellX, cellY, cellSize, cellSize);
    }
  }

  // Thick 3x3 box borders scaled with user borderThickness
  const thickLine = Math.max(0.012, borderThickness * 0.012);
  doc.setLineWidth(thickLine);
  doc.setDrawColor(15, 23, 42);
  for (let b = 0; b <= 3; b++) {
    const offset = b * cellSize * 3;
    doc.line(x + offset, y, x + offset, y + size);
    doc.line(x, y + offset, x + size, y + offset);
  }

  // Draw numbers in solid rich black for crisp Amazon KDP print readability
  const numberFontSize = Math.max(8, Math.floor(cellSize * 30));
  doc.setFontSize(numberFontSize);
  doc.setFont(pdfFont, "bold");
  doc.setTextColor(15, 23, 42);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        doc.text(
          val.toString(),
          x + c * cellSize + cellSize / 2,
          y + r * cellSize + cellSize * 0.66,
          { align: "center" }
        );
      }
    }
  }

  doc.setTextColor(0);
}

function drawFrontMatterTitlePage(
  doc: jsPDF,
  options: {
    title: string;
    subtitle?: string;
    authorName?: string;
    difficulty: Difficulty;
    puzzleCount: number;
    pdfFont: string;
  },
  width: number,
  height: number,
  insideMargin: number,
  outsideMargin: number
) {
  // Page 1 is a Recto (Right-hand) page: Spine is on the LEFT
  const marginLeft = insideMargin;
  const marginRight = outsideMargin;
  const contentW = width - marginLeft - marginRight;
  const centerX = marginLeft + contentW / 2;

  // Category Header Badge
  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("PREMIUM PUZZLE COLLECTION", centerX, 2.2, { align: "center" });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.015);
  doc.line(centerX - 0.75, 2.4, centerX + 0.75, 2.4);

  // Main Title
  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(options.title || "Sudoku Master", contentW - 0.5);
  doc.text(titleLines, centerX, 3.2, { align: "center" });

  const titleBottomY = 3.2 + titleLines.length * 0.38;

  // Subtitle
  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  const defaultSub = `${options.puzzleCount} Handcrafted Large Print Puzzles with Complete Solutions`;
  const subLines = doc.splitTextToSize(options.subtitle || defaultSub, contentW - 0.6);
  doc.text(subLines, centerX, titleBottomY + 0.25, { align: "center" });

  // Elegant Divider
  const divY = titleBottomY + 0.45 + subLines.length * 0.22;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.01);
  doc.line(centerX - 1.5, divY, centerX + 1.5, divY);

  // Specs & Badges Box
  const badgeY = divY + 0.55;
  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`DIFFICULTY LEVEL: ${options.difficulty.toUpperCase()}`, centerX, badgeY, { align: "center" });

  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Standard 9×9 Grids • 100% Mathematically Unique Solutions", centerX, badgeY + 0.25, { align: "center" });
  doc.text("Engineered for Large Print Perfection", centerX, badgeY + 0.45, { align: "center" });

  // Author & Imprint
  const authorY = height - 2.1;
  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("CREATED & PUBLISHED BY", centerX, authorY - 0.25, { align: "center" });

  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(options.authorName || "Ismam Abid", centerX, authorY, { align: "center" });

  // Publishing imprint
  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("KDPage Studio • Independent Publishing Edition", centerX, height - 1.0, { align: "center" });
}

function drawFrontMatterCopyrightAndRulesPage(
  doc: jsPDF,
  options: {
    authorName?: string;
    pdfFont: string;
  },
  width: number,
  height: number,
  insideMargin: number,
  outsideMargin: number
) {
  // Page 2 is a Verso (Left-hand) page: Spine is on the RIGHT
  const marginLeft = outsideMargin;
  const marginRight = insideMargin;
  const contentW = width - marginLeft - marginRight;
  const centerX = marginLeft + contentW / 2;

  // Section Header: HOW TO PLAY SUDOKU
  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("HOW TO PLAY SUDOKU", centerX, 1.2, { align: "center" });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.012);
  doc.line(centerX - 1.0, 1.35, centerX + 1.0, 1.35);

  // Intro text
  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const intro = "Sudoku is a logic-based number placement puzzle. The objective is to fill a 9×9 grid with digits so that every row, column, and 3×3 subgrid contains all the numbers from 1 to 9.";
  const introLines = doc.splitTextToSize(intro, contentW);
  doc.text(introLines, marginLeft, 1.65);

  // Rules Box
  const boxTop = 1.65 + introLines.length * 0.2 + 0.15;
  const boxHeight = 1.65;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.012);
  doc.roundedRect(marginLeft, boxTop, contentW, boxHeight, 0.08, 0.08, "FD");

  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("THE THREE FUNDAMENTAL RULES", marginLeft + 0.25, boxTop + 0.32);

  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const rules = [
    "1. Each row (horizontal) must contain the digits 1 through 9, with no duplicates.",
    "2. Each column (vertical) must contain the digits 1 through 9, with no duplicates.",
    "3. Each 3×3 box (region) must contain the digits 1 through 9, with no duplicates.",
  ];

  let curRuleY = boxTop + 0.6;
  rules.forEach((rule) => {
    const lines = doc.splitTextToSize(rule, contentW - 0.5);
    doc.text(lines, marginLeft + 0.25, curRuleY);
    curRuleY += lines.length * 0.16 + 0.1;
  });

  // Solving Tips
  const tipsTop = boxTop + boxHeight + 0.3;
  doc.setFont(options.pdfFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("PRO SOLVING STRATEGIES", marginLeft, tipsTop);

  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const tips = [
    "• Start with scanning: Focus on rows, columns, or 3×3 boxes that already have 5 or more numbers completed.",
    "• Elimination technique: Cross-reference rows and columns to find cells where only a single digit can legally fit (naked singles).",
    "• Single unique solutions: Every puzzle in this book is mathematically verified to have exactly ONE unique solution—no guessing is ever required!",
    "• Complete solution keys: Full answer grids are provided at the back of this book for quick checking.",
  ];

  let curTipY = tipsTop + 0.22;
  tips.forEach((tip) => {
    const lines = doc.splitTextToSize(tip, contentW);
    doc.text(lines, marginLeft, curTipY);
    curTipY += lines.length * 0.16 + 0.08;
  });

  // Copyright Section at bottom
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.01);
  doc.line(marginLeft, height - 2.1, marginLeft + contentW, height - 2.1);

  doc.setFont(options.pdfFont, "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  const year = new Date().getFullYear();
  const author = options.authorName || "Ismam Abid";
  const copyrightNotice = [
    `Copyright © ${year} by ${author}. All rights reserved.`,
    "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without prior written permission of the author or publisher.",
    "Published Independently • First Edition",
    "Printed on Demand. 100% Quality Guaranteed.",
  ];

  let cY = height - 1.85;
  copyrightNotice.forEach((cLine) => {
    const lines = doc.splitTextToSize(cLine, contentW);
    doc.text(lines, centerX, cY, { align: "center" });
    cY += lines.length * 0.15 + 0.05;
  });
}

export async function generateSudokuPdf(options: PdfOptions): Promise<jsPDF> {
  const {
    puzzles,
    difficulty,
    trimSize,
    title = "Sudoku Puzzle Book",
    subtitle,
    authorName = "Ismam Abid",
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
  const totalSolPages = includeSolutions ? Math.ceil(puzzles.length / solPerPage) : 0;
  const frontMatterPages = (!includeCover && includeFrontMatter) ? 2 : 0;
  const totalExpectedPages = frontMatterPages + puzzles.length + totalSolPages;

  // KDP gutter calculation (0.375" up to 150 pages, 0.5" up to 300 pages)
  const gutterExtra = getGutterMargin(totalExpectedPages);
  const outsideMargin = 0.5;
  const insideMargin = 0.5 + Math.min(0.35, gutterExtra); // 0.75" to 0.85" inside spine margin

  let firstPageAdded = false;
  let currentPage = 0;

  // 1. Draw Front Cover if integrated
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
    currentPage++;
  }

  // 2. Standard KDP Front Matter (Title Page & Copyright/Instructions)
  if (!includeCover && includeFrontMatter) {
    // Page 1: Title Page (Recto / Right page, spine on LEFT)
    drawFrontMatterTitlePage(
      doc,
      {
        title,
        subtitle,
        authorName,
        difficulty,
        puzzleCount: puzzles.length,
        pdfFont,
      },
      width,
      height,
      insideMargin,
      outsideMargin
    );
    firstPageAdded = true;
    currentPage = 1;

    // Page 2: Copyright & Rules Page (Verso / Left page, spine on RIGHT)
    doc.addPage();
    currentPage = 2;
    drawFrontMatterCopyrightAndRulesPage(
      doc,
      {
        authorName,
        pdfFont,
      },
      width,
      height,
      insideMargin,
      outsideMargin
    );
  }

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
    doc.setTextColor(15, 23, 42);
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
    doc.setTextColor(100, 116, 139);
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
      doc.setTextColor(15, 23, 42);
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
        const titleSpace = 0.25;
        const tileSize = Math.min(zone.w, zone.h - titleSpace);
        const startX = zone.x + (zone.w - tileSize) / 2;
        const startY = zone.y + titleSpace;

        drawSudokuTile(doc, puzzles[solIndex].solution, startX, startY, tileSize, true, solIndex + 1, true, pdfFont, borderThickness);
      }

      // Solution Page Footer
      doc.setFont(pdfFont, "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
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

  return doc;
}

export async function downloadSudokuPdf(options: PdfOptions, filename: string) {
  const doc = await generateSudokuPdf(options);
  options.onProgress?.({
    phase: "saving",
    current: 100,
    total: 100,
    percent: 100,
    message: "Saving PDF file...",
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  doc.save(filename);
}