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

interface PdfOptions {
  puzzles: WordSearchGridData[];
  title: string;
  trimSize: "6x9" | "8.5x11" | "5x8";
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  isPremium?: boolean;
  style?: Partial<WordSearchStyle>;
}

function drawWordSearchPage(
  doc: jsPDF,
  data: WordSearchGridData,
  width: number,
  height: number,
  isSolution: boolean,
  puzzleNumber: number,
  title: string,
  style?: Partial<WordSearchStyle>
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 30);
  const label = isSolution ? `${title} #${puzzleNumber} — Answer Key` : `${title} #${puzzleNumber}`;
  doc.text(label, width / 2, 0.65, { align: "center" });

  const margin = 0.5;
  const safeW = width - (margin * 2);
  const safeH = height - (margin * 2);

  const titleSpace = 0.5;
  const wordListSpace = isSolution ? 0.4 : 1.5;
  const gridPx = Math.min(safeW, safeH - titleSpace - wordListSpace);

  const startX = (width - gridPx) / 2;
  const startY = margin + titleSpace + 0.3;

  drawWordSearchGrid(doc, data, { x: startX, y: startY, size: gridPx }, isSolution, style);

  if (!isSolution) {
    drawWordSearchWordList(doc, data.words, { x: startX, y: startY + gridPx + 0.25, w: gridPx }, {
      showHeading: true,
      style: { wordColumns: 3, wordFontSize: 9.5, ...style },
    });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Page ${puzzleNumber}`, width - 0.5, height - 0.35, { align: "right" });
  doc.setTextColor(0);
}

export async function generateWordSearchPdf(options: PdfOptions): Promise<jsPDF> {
  const {
    puzzles,
    title,
    trimSize,
    includeSolutions = true,
    includeCover = false,
    coverState = null,
    style,
  } = options;

  let width = 8.5;
  let height = 11;
  if (trimSize === "6x9") { width = 6; height = 9; }
  if (trimSize === "5x8") { width = 5; height = 8; }

  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [width, height] });

  let firstPageAdded = false;
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', width, height);
    firstPageAdded = true;
  }

  puzzles.forEach((data, index) => {
    if (firstPageAdded || index > 0) doc.addPage();
    firstPageAdded = true;
    drawWordSearchPage(doc, data, width, height, false, index + 1, title, style);
  });

  if (includeSolutions) {
    puzzles.forEach((data, index) => {
      doc.addPage();
      drawWordSearchPage(doc, data, width, height, true, index + 1, title, style);
    });
  }

  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', width, height);
  }

  if (options.isPremium === false) {
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
