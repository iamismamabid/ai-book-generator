// src/lib/wordSearch-pdf.ts
import { jsPDF } from "jspdf";
import { WordSearchGridData } from "../app/utils/puzzleEngine";
import {
  drawCoverPagePart,
  drawWatermark,
  drawWordSearchGrid,
  drawWordSearchWordList,
  WordSearchStyle,
} from "../app/utils/pdfExportService";
import { calculateKdpMargins, drawKdpTitlePage, drawKdpCopyrightAndInstructionsPage } from "./kdpBookEngine";

interface PdfOptions {
  puzzles: WordSearchGridData[];
  title: string;
  subtitle?: string;
  authorName?: string;
  trimSize: "6x9" | "8.5x11" | "5x8";
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  includeFrontMatter?: boolean;
  isPremium?: boolean;
  style?: Partial<WordSearchStyle>;
}

function drawWordSearchPage(
  doc: jsPDF,
  data: WordSearchGridData,
  width: number,
  height: number,
  isSolution: boolean,
  pageNumber: number,
  puzzleIndex: number,
  title: string,
  totalPages: number,
  style?: Partial<WordSearchStyle>
) {
  // Alternating KDP Gutter Margins
  const margins = calculateKdpMargins(pageNumber, totalPages, width);
  const { marginLeft, contentW, contentCenterX } = margins;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);

  const marginTop = 0.6;
  const safeH = height - (marginTop * 2);

  const titleBlockH = 0.45;
  const wordColumns = 3;
  const wordRowStep = 0.24;
  const numWordRows = isSolution ? 0 : Math.ceil((data.words?.length || 12) / wordColumns);
  const wordListSpace = isSolution ? 0 : 0.35 + (numWordRows * wordRowStep);

  const STANDARD_CELL_IN = 0.45;
  const gridPx = Math.min(contentW, safeH - titleBlockH - wordListSpace, data.grid.length * STANDARD_CELL_IN);

  const totalContentH = titleBlockH + gridPx + wordListSpace;
  const verticalOffset = Math.max(0, (safeH - totalContentH) / 2);
  const contentTop = marginTop + verticalOffset;

  const label = isSolution ? `${title} #${puzzleIndex} — Answer Key` : `${title} #${puzzleIndex}`;
  doc.text(label, contentCenterX, contentTop + 0.22, { align: "center" });

  const startX = marginLeft + (contentW - gridPx) / 2;
  const startY = contentTop + titleBlockH;

  drawWordSearchGrid(doc, data, { x: startX, y: startY, size: gridPx }, isSolution, style);

  if (!isSolution) {
    drawWordSearchWordList(doc, data.words, { x: startX, y: startY + gridPx + 0.35, w: gridPx }, {
      showHeading: true,
      style: { wordColumns: 3, wordFontSize: 9.5, ...style },
    });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(`Page ${pageNumber}`, contentCenterX, height - 0.4, { align: "center" });
  doc.setTextColor(0);
}

export async function generateWordSearchPdf(options: PdfOptions): Promise<jsPDF> {
  const {
    puzzles,
    title = "Word Search Puzzle Book",
    subtitle,
    authorName = "Independent Publisher",
    trimSize,
    includeSolutions = true,
    includeCover = false,
    coverState = null,
    includeFrontMatter = true,
    style,
  } = options;

  let width = 8.5;
  let height = 11;
  if (trimSize === "6x9") { width = 6; height = 9; }
  if (trimSize === "5x8") { width = 5; height = 8; }

  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [width, height] });

  const frontMatterPages = 2;
  const solPages = includeSolutions ? puzzles.length : 0;
  const totalExpectedPages = frontMatterPages + puzzles.length + solPages;

  let firstPageAdded = false;
  let currentPage = 0;

  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
    currentPage++;
  }

  // Standard KDP Front Matter (Mandatory)
  if (firstPageAdded) doc.addPage();
  firstPageAdded = true;
  currentPage++;
  drawKdpTitlePage(doc, {
    title,
    subtitle: subtitle || `${puzzles.length} Themed Word Searches with Solutions Included`,
    authorName,
    puzzleType: "word_search",
    puzzleCount: puzzles.length,
    width,
    height,
    totalPages: totalExpectedPages,
  });

  doc.addPage();
  currentPage++;
  drawKdpCopyrightAndInstructionsPage(doc, {
    authorName,
    puzzleType: "word_search",
    width,
    height,
    totalPages: totalExpectedPages,
  });

  // Draw Puzzles
  puzzles.forEach((data, index) => {
    if (firstPageAdded) doc.addPage();
    firstPageAdded = true;
    currentPage++;
    drawWordSearchPage(doc, data, width, height, false, currentPage, index + 1, title, totalExpectedPages, style);
  });

  // Draw Solutions
  if (includeSolutions) {
    puzzles.forEach((data, index) => {
      doc.addPage();
      currentPage++;
      drawWordSearchPage(doc, data, width, height, true, currentPage, index + 1, title, totalExpectedPages, style);
    });
  }

  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  if (!options.isPremium) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      const isFrontCover = includeCover && coverState && i === 1;
      const isBackCover = includeCover && coverState && i === totalPages;
      if (!isFrontCover && !isBackCover) {
        doc.setPage(i);
        drawWatermark(doc, width, height);
      }
    }
  }

  return doc;
}

export async function downloadWordSearchPdf(options: PdfOptions, filename = "word-search-book.pdf") {
  const doc = await generateWordSearchPdf(options);
  doc.save(filename);
}

