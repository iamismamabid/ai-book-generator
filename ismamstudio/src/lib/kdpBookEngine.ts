// src/lib/kdpBookEngine.ts
import { jsPDF } from "jspdf";
import { getGutterMargin } from "./gutterMargin";

export type KdpPuzzleType =
  | "sudoku"
  | "maze"
  | "word_search"
  | "kakuro"
  | "crossword"
  | "cryptogram"
  | "word_scramble"
  | "math_puzzle";

export interface KdpMarginResult {
  isOdd: boolean;
  marginLeft: number;
  marginRight: number;
  contentW: number;
  contentCenterX: number;
  insideMargin: number;
  outsideMargin: number;
}

export function calculateKdpMargins(
  pageNumber: number,
  totalPages: number,
  pageWidth: number
): KdpMarginResult {
  const gutterExtra = getGutterMargin(totalPages);
  const outsideMargin = 0.5;
  // Dynamically scale inside gutter with book thickness: 0.75" for <=300 pages up to 1.00" for 500+ pages
  const insideMargin = Math.max(0.75, Math.min(1.0, 0.25 + gutterExtra));

  const isOdd = pageNumber % 2 !== 0; // Odd = Recto (Right page): spine on LEFT
  const marginLeft = isOdd ? insideMargin : outsideMargin;
  const marginRight = isOdd ? outsideMargin : insideMargin;
  const contentW = pageWidth - marginLeft - marginRight;
  const contentCenterX = marginLeft + contentW / 2;

  return {
    isOdd,
    marginLeft,
    marginRight,
    contentW,
    contentCenterX,
    insideMargin,
    outsideMargin,
  };
}

export interface KdpTitlePageOptions {
  title: string;
  subtitle?: string;
  authorName?: string;
  puzzleType: KdpPuzzleType;
  difficulty?: string;
  puzzleCount: number;
  pdfFont?: string;
  width: number;
  height: number;
  totalPages: number;
}

export function drawKdpTitlePage(doc: jsPDF, opts: KdpTitlePageOptions) {
  const pdfFont = opts.pdfFont || "helvetica";
  // Page 1 is Recto (Right page): Spine is on LEFT
  const margins = calculateKdpMargins(1, opts.totalPages, opts.width);
  const { contentW, contentCenterX, marginLeft } = margins;

  // 1. Elegant outer double-line border frame
  const frameL = marginLeft + 0.15;
  const frameT = Math.max(0.55, opts.height * 0.065);
  const frameW = contentW - 0.3;
  const frameH = opts.height - frameT * 2;

  doc.setDrawColor(0);
  doc.setLineWidth(0.02);
  doc.rect(frameL, frameT, frameW, frameH);

  doc.setLineWidth(0.008);
  doc.rect(frameL + 0.04, frameT + 0.04, frameW - 0.08, frameH - 0.08);

  // Corner decorative accent squares
  const markSize = 0.07;
  doc.setFillColor(0);
  doc.rect(frameL - 0.015, frameT - 0.015, markSize, markSize, "F");
  doc.rect(frameL + frameW - markSize + 0.015, frameT - 0.015, markSize, markSize, "F");
  doc.rect(frameL - 0.015, frameT + frameH - markSize + 0.015, markSize, markSize, "F");
  doc.rect(frameL + frameW - markSize + 0.015, frameT + frameH - markSize + 0.015, markSize, markSize, "F");

  // 2. Main Book Title
  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 22 : 28);
  doc.setTextColor(0);
  const titleLines = doc.splitTextToSize(opts.title || "Puzzle Master", frameW - 0.6);
  const titleY = frameT + (opts.height < 10 ? 0.75 : 0.95);
  doc.text(titleLines, contentCenterX, titleY, { align: "center" });

  const titleBottomY = titleY + (titleLines.length - 1) * (opts.width < 7 ? 0.32 : 0.4);

  // 4. Subtitle
  doc.setFont(pdfFont, "normal");
  doc.setFontSize(opts.width < 7 ? 10.5 : 12);
  doc.setTextColor(0);
  const countDisplay = opts.puzzleCount ? `${opts.puzzleCount}` : "Handcrafted";
  const defaultSub = `${countDisplay} Handcrafted Large Print Puzzles with Complete Solutions`;
  const rawSub = opts.subtitle && opts.subtitle.trim() ? opts.subtitle : defaultSub;
  const cleanSub = opts.puzzleCount
    ? rawSub.replace(/\b(undefined|\d+)\s+(Large Print Puzzles|Puzzles|Handcrafted)/i, `${opts.puzzleCount} $1`)
    : rawSub.replace(/\bundefined\s*/i, "");
  const subLines = doc.splitTextToSize(cleanSub, frameW - 0.8);
  const subY = titleBottomY + (opts.height < 10 ? 0.25 : 0.35);
  doc.text(subLines, contentCenterX, subY, { align: "center" });

  // 5. Divider Line with Accent Dot
  const divY = subY + subLines.length * (opts.width < 7 ? 0.18 : 0.22) + 0.12;
  const divW = Math.min(3.6, frameW - 1.0);
  doc.setLineWidth(0.015);
  doc.setDrawColor(0);
  doc.line(contentCenterX - divW / 2, divY, contentCenterX + divW / 2, divY);
  doc.setFillColor(0);
  doc.circle(contentCenterX, divY, 0.035, "F");

  // 6. Specs & Badges Box (Solid Header + Clean Border)
  const specBoxW = Math.min(5.8, frameW - 0.6);
  const specBoxH = opts.height < 10 ? 1.15 : 1.35;
  const specBoxX = contentCenterX - specBoxW / 2;
  const specBoxY = divY + (opts.height < 10 ? 0.25 : 0.4);

  doc.setDrawColor(0);
  doc.setLineWidth(0.015);
  doc.roundedRect(specBoxX, specBoxY, specBoxW, specBoxH, 0.08, 0.08, "S");

  // Spec Box Top Header Banner
  const specHeaderH = opts.height < 10 ? 0.3 : 0.35;
  doc.setFillColor(0);
  doc.roundedRect(specBoxX, specBoxY, specBoxW, specHeaderH, 0.08, 0.08, "F");
  doc.rect(specBoxX, specBoxY + specHeaderH - 0.15, specBoxW, 0.15, "F");

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 9.5 : 10.5);
  doc.setTextColor(255);
  const countStr = opts.puzzleCount ? `${opts.puzzleCount} PUZZLES` : "PREMIUM PUZZLES";
  const editionText = opts.difficulty
    ? `DIFFICULTY LEVEL: ${opts.difficulty.toUpperCase()} • ${countStr}`
    : `COMPLETE EDITION • ${countStr}`;
  doc.text(editionText, contentCenterX, specBoxY + specHeaderH * 0.66, { align: "center" });

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(opts.width < 7 ? 8.5 : 9.5);
  doc.setTextColor(0);
  const lineSpacing = opts.height < 10 ? 0.22 : 0.25;
  doc.text("• 100% Mathematically Verified Solutions Included", contentCenterX, specBoxY + specHeaderH + lineSpacing * 1.0, { align: "center" });
  doc.text("• Precision Clean Vector Lines • Large Print Format", contentCenterX, specBoxY + specHeaderH + lineSpacing * 1.9, { align: "center" });
  doc.text("• Engineered for Amazon KDP Print Perfection", contentCenterX, specBoxY + specHeaderH + lineSpacing * 2.8, { align: "center" });

  // 7. Author & Imprint
  const authorY = frameT + frameH - (opts.height < 10 ? 0.85 : 1.15);
  doc.setLineWidth(0.01);
  doc.setDrawColor(0);
  doc.line(contentCenterX - 1.2, authorY - 0.25, contentCenterX + 1.2, authorY - 0.25);

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(opts.width < 7 ? 8 : 9);
  doc.setTextColor(0);
  doc.text("CREATED & PUBLISHED BY", contentCenterX, authorY - 0.1, { align: "center" });

  const author = opts.authorName?.trim() || "Independent Publisher";
  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 12 : 14);
  doc.setTextColor(0);
  doc.text(author, contentCenterX, authorY + 0.15, { align: "center" });

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(opts.width < 7 ? 7.5 : 8.5);
  doc.setTextColor(0);
  doc.text("Independent Publishing Edition • All Rights Reserved", contentCenterX, authorY + (opts.height < 10 ? 0.38 : 0.48), { align: "center" });
}

export interface KdpSolutionsDividerOptions {
  puzzleCount: number;
  puzzleType?: KdpPuzzleType;
  width: number;
  height: number;
  pageNumber: number;
  totalPages: number;
  pdfFont?: string;
  customSubtitle?: string;
}

export function drawKdpSolutionsDividerPage(doc: jsPDF, opts: KdpSolutionsDividerOptions) {
  const pdfFont = opts.pdfFont || "helvetica";
  const margins = calculateKdpMargins(opts.pageNumber, opts.totalPages, opts.width);
  const { contentW, contentCenterX, marginLeft } = margins;

  // Frame
  const frameL = marginLeft + 0.15;
  const frameT = Math.max(0.55, opts.height * 0.065);
  const frameW = contentW - 0.3;
  const frameH = opts.height - frameT * 2;

  doc.setDrawColor(0);
  doc.setLineWidth(0.02);
  doc.rect(frameL, frameT, frameW, frameH);

  doc.setLineWidth(0.008);
  doc.rect(frameL + 0.04, frameT + 0.04, frameW - 0.08, frameH - 0.08);

  // 4 corner decorative squares
  const markSize = 0.07;
  doc.setFillColor(0);
  doc.rect(frameL - 0.015, frameT - 0.015, markSize, markSize, "F");
  doc.rect(frameL + frameW - markSize + 0.015, frameT - 0.015, markSize, markSize, "F");
  doc.rect(frameL - 0.015, frameT + frameH - markSize + 0.015, markSize, markSize, "F");
  doc.rect(frameL + frameW - markSize + 0.015, frameT + frameH - markSize + 0.015, markSize, markSize, "F");

  // Center Hero Ribbon / Banner for SOLUTIONS
  const bannerW = Math.min(5.8, frameW - 0.6);
  const bannerH = opts.height < 10 ? 0.95 : 1.15;
  const bannerX = contentCenterX - bannerW / 2;
  const bannerY = opts.height / 2 - (opts.height < 10 ? 0.9 : 1.1);

  doc.setFillColor(0);
  doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 0.08, 0.08, "F");

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 24 : 32);
  doc.setTextColor(255);
  doc.text("SOLUTIONS", contentCenterX, bannerY + bannerH * 0.5, { align: "center" });

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 9 : 11);
  doc.setTextColor(255);
  doc.text("COMPLETE ANSWER KEYS & VERIFIED SOLUTIONS", contentCenterX, bannerY + bannerH * 0.8, { align: "center" });

  // Subtitle / guide card underneath
  const cardW = bannerW;
  const cardH = opts.height < 10 ? 1.05 : 1.25;
  const cardX = bannerX;
  const cardY = bannerY + bannerH + (opts.height < 10 ? 0.25 : 0.35);

  doc.setDrawColor(0);
  doc.setLineWidth(0.015);
  doc.roundedRect(cardX, cardY, cardW, cardH, 0.08, 0.08, "S");

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(opts.width < 7 ? 9.5 : 11);
  doc.setTextColor(0);
  const cardHeading = opts.customSubtitle || `ANSWER KEYS FOR PUZZLES #1 TO #${opts.puzzleCount}`;
  doc.text(cardHeading.toUpperCase(), contentCenterX, cardY + (opts.height < 10 ? 0.28 : 0.35), { align: "center" });

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(opts.width < 7 ? 8.5 : 9.5);
  doc.setTextColor(0);
  const lineSpacing = opts.height < 10 ? 0.22 : 0.25;
  doc.text("All solutions are organized in consecutive numerical order.", contentCenterX, cardY + (opts.height < 10 ? 0.28 : 0.35) + lineSpacing * 1.1, { align: "center" });
  doc.text("Each answer key displays the direct, step-by-step solved solution.", contentCenterX, cardY + (opts.height < 10 ? 0.28 : 0.35) + lineSpacing * 2.1, { align: "center" });
}


interface RuleGuide {
  title: string;
  intro: string;
  rules: string[];
  tips: string[];
}

const PUZZLE_GUIDES: Record<KdpPuzzleType, RuleGuide> = {
  sudoku: {
    title: "HOW TO PLAY SUDOKU",
    intro: "Sudoku is a logic-based number placement puzzle. The objective is to fill a 9×9 grid with digits so that every row, column, and 3×3 subgrid contains all the numbers from 1 to 9.",
    rules: [
      "1. Each row (horizontal) must contain digits 1 through 9 with no duplicates.",
      "2. Each column (vertical) must contain digits 1 through 9 with no duplicates.",
      "3. Each 3×3 box (region) must contain digits 1 through 9 with no duplicates.",
    ],
    tips: [
      "• Start by scanning rows, columns, or 3×3 boxes with 5 or more clues.",
      "• Cross-reference rows and columns to find 'naked singles' (cells with only one legal number).",
      "• Every puzzle has exactly ONE unique solution—no guesswork is required!",
    ],
  },
  maze: {
    title: "HOW TO SOLVE MAZES",
    intro: "A maze is a complex tour puzzle with branching paths, passages, and dead ends. The objective is to find an unbroken route from the designated Start point to the Goal.",
    rules: [
      "1. Navigate only through open white pathways; never cross solid black boundaries or walls.",
      "2. The path must start at the labeled Entrance/Start marker and finish at the Exit/Goal.",
      "3. Continuous loop: The solution forms a continuous, uninterrupted line from start to finish.",
    ],
    tips: [
      "• Work backwards: Trace from the Exit back toward the Entrance to eliminate decoy dead-ends.",
      "• Wall follower rule: In simply-connected labyrinths, keeping your right hand continuously on the outer wall leads directly to the exit.",
      "• Use a light pencil to trace candidates before committing with ink.",
    ],
  },
  word_search: {
    title: "HOW TO SOLVE WORD SEARCHES",
    intro: "A word search consists of letters arranged in a grid with hidden target words. The objective is to locate and circle or highlight all listed words within the letter matrix.",
    rules: [
      "1. Words can run horizontally (left-to-right or right-to-left).",
      "2. Words can run vertically (top-to-bottom or bottom-to-top).",
      "3. Words can run diagonally in any direction, and may intersect or share letters.",
    ],
    tips: [
      "• Scan systematically for rare letters (such as Q, X, Z, J, or double letters like EE, OO).",
      "• Cross off found words from the word bank to keep track of remaining clues.",
      "• Complete answer keys with letter highlights are included at the back of this book.",
    ],
  },
  kakuro: {
    title: "HOW TO PLAY KAKURO (CROSS SUMS)",
    intro: "Kakuro is a mathematical crossword puzzle. The objective is to fill the white cells with digits 1 through 9 such that each run sums up to the clue indicated in the diagonal clue cell.",
    rules: [
      "1. Clues in the upper-right triangle represent the sum of the horizontal row to the right.",
      "2. Clues in the lower-left triangle represent the sum of the vertical column below.",
      "3. Digits 1 through 9 only: No number may be repeated within any single sum run.",
    ],
    tips: [
      "• Memorize unique sum combinations: A sum of 3 across 2 cells is always (1+2); a sum of 4 across 2 cells is always (1+3).",
      "• Highest combos: A sum of 16 across 2 cells is always (7+9); 17 is always (8+9).",
      "• Cross-reference intersections where row and column constraints only share a single legal candidate.",
    ],
  },
  crossword: {
    title: "HOW TO SOLVE CROSSWORDS",
    intro: "A crossword is a word puzzle where letter grids are populated by answering numbered Across and Down clues. Intersecting letters must match across both intersecting words.",
    rules: [
      "1. Read the numbered clues (Across for horizontal entries, Down for vertical entries).",
      "2. Write one letter per white square, matching the letter count of the entry.",
      "3. Black squares serve as word dividers and do not contain letters.",
    ],
    tips: [
      "• Fill in the most obvious clues first to establish anchor letters for crossing words.",
      "• Plural clues end in 'S' and past-tense clues usually end in 'ED'—fill in these suffixes early.",
      "• When stuck on a clue, solve its crossing words to reveal key intersecting letters.",
    ],
  },
  cryptogram: {
    title: "HOW TO SOLVE CRYPTOGRAMS",
    intro: "A cryptogram is a cipher puzzle where an inspirational quote has been encrypted using a substitution cipher. Each letter in the alphabet has been substituted with a different letter.",
    rules: [
      "1. Consistency: Every occurrence of an encrypted letter represents the exact same plaintext letter.",
      "2. Punctuation, numbers, and spacing remain unchanged throughout the cipher.",
      "3. No letter encrypts to itself.",
    ],
    tips: [
      "• Look for single-letter words: In English, a standalone single letter is almost always 'A' or 'I'.",
      "• Identify two-letter words: Common two-letter words include OF, TO, IN, IS, IT, ON, HE, AS, AT, BE.",
      "• Letter frequency: 'E', 'T', 'A', 'O', 'I', 'N', and 'S' are the most frequently occurring letters in the English language.",
      "• Look for apostrophes: Words ending in 'T are usually contraction endings like DON'T or CAN'T. Words ending in 'S indicate possessives.",
    ],
  },
  word_scramble: {
    title: "HOW TO SOLVE WORD SCRAMBLES",
    intro: "Word scramble (anagram) puzzles present jumbled letters that must be rearranged to form valid English words. The objective is to decipher each scrambled word.",
    rules: [
      "1. Use all given letters exactly once to form a valid, correctly spelled word.",
      "2. Letters can be rearranged in any order.",
      "3. Each scramble corresponds to a specific target dictionary word.",
    ],
    tips: [
      "• Separate vowels (A, E, I, O, U) from consonants to visualize possible syllable structures.",
      "• Look for common prefixes (RE-, UN-, DIS-, PRE-) and suffixes (-ING, -ED, -ER, -TION, -LY).",
      "• Test common consonant pairs (CH, SH, TH, WH, BL, CL, FL, ST, TR).",
    ],
  },
  math_puzzle: {
    title: "HOW TO SOLVE MATH PUZZLES",
    intro: "Math grid puzzles challenge your arithmetic and logic skills. The objective is to fill the missing blanks with numbers and operators so that all horizontal and vertical equations are balanced.",
    rules: [
      "1. Every row and column equation must compute to the exact target result indicated.",
      "2. Follow standard arithmetic operations (+, −, ×, ÷) left-to-right and top-to-bottom.",
      "3. Each missing cell must contain a single valid digit or designated operator.",
    ],
    tips: [
      "• Start with multiplication and division steps to narrow down candidate factors.",
      "• Check target parity (even vs. odd) to deduce whether an addition or subtraction step is needed.",
      "• Work symmetrically between crossing equations to verify each candidate value.",
    ],
  },
};

export interface KdpCopyrightPageOptions {
  authorName?: string;
  puzzleType: KdpPuzzleType;
  pdfFont?: string;
  width: number;
  height: number;
  totalPages: number;
  guideTitle?: string;
  guideIntro?: string;
  guideRules?: string[];
  guideTips?: string[];
  copyrightText?: string;
  copyrightYear?: string | number;
}

export function drawKdpCopyrightAndInstructionsPage(
  doc: jsPDF,
  opts: KdpCopyrightPageOptions
) {
  const pdfFont = opts.pdfFont || "helvetica";
  // Page 2 is Verso (Left page): Spine is on RIGHT
  const margins = calculateKdpMargins(2, opts.totalPages, opts.width);
  const { marginLeft, contentW, contentCenterX } = margins;

  const defaultGuide = PUZZLE_GUIDES[opts.puzzleType] || PUZZLE_GUIDES.sudoku;
  const guideTitle = opts.guideTitle?.trim() || defaultGuide.title;
  const guideIntro = opts.guideIntro?.trim() || defaultGuide.intro;
  const guideRules = (opts.guideRules && opts.guideRules.length > 0) ? opts.guideRules : defaultGuide.rules;
  const guideTips = (opts.guideTips && opts.guideTips.length > 0) ? opts.guideTips : defaultGuide.tips;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(guideTitle, contentCenterX, 1.2, { align: "center" });

  doc.setDrawColor(0);
  doc.setLineWidth(0.01);
  doc.line(contentCenterX - 1.0, 1.35, contentCenterX + 1.0, 1.35);

  // Intro text
  doc.setFont(pdfFont, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0);
  const introLines = doc.splitTextToSize(guideIntro, contentW);
  doc.text(introLines, marginLeft, 1.65);

  // Rules Box with Solid Black Header Banner
  const boxTop = 1.65 + introLines.length * 0.2 + 0.15;
  let estimatedRuleLines = 0;
  guideRules.forEach((rule) => {
    const lines = doc.splitTextToSize(rule, contentW - 0.4);
    estimatedRuleLines += lines.length;
  });
  const boxHeight = Math.max(1.65, 0.55 + estimatedRuleLines * 0.28);

  doc.setFillColor(255);
  doc.setDrawColor(0);
  doc.setLineWidth(0.015);
  doc.roundedRect(marginLeft, boxTop, contentW, boxHeight, 0.08, 0.08, "FD");

  // Solid black header banner
  doc.setFillColor(0);
  doc.roundedRect(marginLeft, boxTop, contentW, 0.35, 0.08, 0.08, "F");
  doc.rect(marginLeft, boxTop + 0.2, contentW, 0.15, "F");

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(255);
  doc.text("CORE RULES & OBJECTIVES", marginLeft + 0.2, boxTop + 0.24);

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0);

  let curRuleY = boxTop + 0.62;
  guideRules.forEach((rule) => {
    const lines = doc.splitTextToSize(rule, contentW - 0.4);
    doc.text(lines, marginLeft + 0.2, curRuleY);
    curRuleY += lines.length * 0.18 + 0.1;
  });

  // Solving Strategies / Tips with Solid Black Header Banner
  const tipsTop = boxTop + boxHeight + 0.35;
  doc.setFillColor(0);
  doc.roundedRect(marginLeft, tipsTop, contentW, 0.35, 0.08, 0.08, "F");
  doc.rect(marginLeft, tipsTop + 0.2, contentW, 0.15, "F");

  doc.setFont(pdfFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(255);
  doc.text("PRO SOLVING STRATEGIES", marginLeft + 0.2, tipsTop + 0.24);

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0);

  let curTipY = tipsTop + 0.6;
  guideTips.forEach((tip) => {
    const lines = doc.splitTextToSize(tip, contentW);
    doc.text(lines, marginLeft, curTipY);
    curTipY += lines.length * 0.18 + 0.08;
  });

  // Copyright Section at bottom
  doc.setDrawColor(0);
  doc.setLineWidth(0.015);
  doc.line(marginLeft, opts.height - 2.1, marginLeft + contentW, opts.height - 2.1);

  doc.setFont(pdfFont, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0);

  const year = opts.copyrightYear || new Date().getFullYear();
  const author = opts.authorName?.trim() || "Independent Publisher";
  const copyrightNotice = opts.copyrightText?.trim()
    ? [
        opts.copyrightText.trim(),
        "Published Independently • First Edition",
        "Printed on Demand. 100% Quality Guaranteed.",
      ]
    : [
        `Copyright © ${year} by ${author}. All rights reserved.`,
        "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without prior written permission of the author or publisher.",
        "Published Independently • First Edition",
        "Printed on Demand. 100% Quality Guaranteed.",
      ];

  let cY = opts.height - 1.85;
  copyrightNotice.forEach((cLine) => {
    const lines = doc.splitTextToSize(cLine, contentW);
    doc.text(lines, contentCenterX, cY, { align: "center" });
    cY += lines.length * 0.16 + 0.05;
  });
}

/**
 * Ensures that the document has an EVEN total page count for Amazon KDP signature printing.
 * Amazon KDP physical sheets fold into signatures (2 pages per sheet / double-sided).
 * If the current page count is odd, it appends a clean blank page so that totalPages % 2 === 0.
 *
 * @returns true if a padding page was added, false if already even.
 */
export function ensureEvenPageCount(doc: jsPDF): boolean {
  const currentTotal = doc.getNumberOfPages();
  if (currentTotal % 2 !== 0) {
    doc.addPage();
    return true;
  }
  return false;
}
