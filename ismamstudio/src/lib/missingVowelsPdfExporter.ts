/**
 * KDPage Missing Vowels PDF Exporter
 * 300 DPI Vector PDF generator for Amazon KDP Print-Ready Interiors
 */

import jsPDF from "jspdf";
import { MissingVowelsWorksheet } from "./missingVowelsEngine";
import { getTrimDimensions, KdpTrimSize } from "./kdpTrimSizes";

export interface MissingVowelsPdfOptions {
  trimSize: KdpTrimSize;
  includeSolutions: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  authorName?: string;
  showPageNumbers?: boolean;
}

export async function exportMissingVowelsBookPdf(
  worksheets: MissingVowelsWorksheet[],
  options: MissingVowelsPdfOptions,
  onProgress?: (percent: number) => void
): Promise<jsPDF> {
  const { widthInches, heightInches } = getTrimDimensions(options.trimSize);
  const pageWidth = widthInches * 72;
  const pageHeight = heightInches * 72;

  const doc = new jsPDF({
    orientation: widthInches > heightInches ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
  });

  const totalPuzzlePages = worksheets.length;
  // Answer keys: 4 worksheets per page in solution section
  const totalSolutionPages = options.includeSolutions ? Math.ceil(worksheets.length / 4) : 0;
  const totalSteps = totalPuzzlePages + totalSolutionPages + 2;
  let currentStep = 0;

  // 1. Title Page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(30, 41, 59);
  doc.text(options.bookTitle || "MISSING VOWELS PUZZLE BOOK", pageWidth / 2, pageHeight * 0.38, {
    align: "center",
  });

  if (options.bookSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text(options.bookSubtitle, pageWidth / 2, pageHeight * 0.44, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${worksheets.length} Thematic Word & Vocabulary Brain-Teaser Worksheets with Solutions`,
    pageWidth / 2,
    pageHeight * 0.50,
    { align: "center" }
  );

  if (options.authorName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Created by ${options.authorName}`, pageWidth / 2, pageHeight * 0.85, {
      align: "center",
    });
  }

  currentStep++;
  onProgress?.(Math.round((currentStep / totalSteps) * 100));

  // 2. Worksheet Pages
  for (let idx = 0; idx < worksheets.length; idx++) {
    const ws = worksheets[idx];
    doc.addPage([pageWidth, pageHeight]);

    // Margins
    const marginX = 40;
    const marginY = 40;
    const contentWidth = pageWidth - marginX * 2;

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(ws.title.toUpperCase(), marginX, marginY + 15);

    // Category / Badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text(ws.category.toUpperCase(), marginX, marginY + 28);

    // Instruction bar
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    const instructionText =
      ws.mode === "pure_consonants"
        ? "Vowels (A, E, I, O, U) have been completely removed. Reconstruct each word on the line below:"
        : "Fill in the missing vowels (A, E, I, O, U) to spell each target word correctly:";
    doc.text(instructionText, marginX, marginY + 44);

    // Divider rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(marginX, marginY + 52, marginX + contentWidth, marginY + 52);

    // Render Items
    const startY = marginY + 68;
    const usableHeight = pageHeight - startY - 45;
    const itemCount = ws.items.length;
    const itemSpacing = usableHeight / itemCount;

    ws.items.forEach((item, itemIdx) => {
      const itemY = startY + itemIdx * itemSpacing;

      // Question Number Pill
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.75);
      doc.roundedRect(marginX, itemY, 24, 20, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(String(itemIdx + 1).padStart(2, "0"), marginX + 12, itemY + 13.5, {
        align: "center",
      });

      // Puzzle Text (Masked)
      doc.setFont("courier", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text(item.puzzle, marginX + 34, itemY + 14);

      // Hint (if present)
      if (item.hint) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const truncatedHint = item.hint.length > 55 ? item.hint.substring(0, 52) + "..." : item.hint;
        doc.text(`Hint: ${truncatedHint}`, marginX + 34, itemY + 27);
      }

      // Answer Writing Line on the right side
      const answerLineStart = marginX + contentWidth * 0.62;
      const answerLineWidth = contentWidth * 0.38;
      const lineY = itemY + 16;

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.8);
      doc.line(answerLineStart, lineY, answerLineStart + answerLineWidth, lineY);

      // Answer label prompt
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("ANSWER:", answerLineStart, lineY + 9);

      // Subtle bottom separator between questions
      if (itemIdx < itemCount - 1) {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.5);
        const sepY = itemY + itemSpacing - 4;
        doc.line(marginX, sepY, marginX + contentWidth, sepY);
      }
    });

    // Page Number Footer
    if (options.showPageNumbers !== false) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${idx + 1}`, pageWidth / 2, pageHeight - 20, { align: "center" });
    }

    currentStep++;
    onProgress?.(Math.round((currentStep / totalSteps) * 100));
  }

  // 3. Solutions Section
  if (options.includeSolutions && worksheets.length > 0) {
    // Solution Cover Page
    doc.addPage([pageWidth, pageHeight]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(30, 41, 59);
    doc.text("SOLUTIONS", pageWidth / 2, pageHeight * 0.45, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text("Complete Answer Keys & Word Lists", pageWidth / 2, pageHeight * 0.52, {
      align: "center",
    });

    currentStep++;
    onProgress?.(Math.round((currentStep / totalSteps) * 100));

    // 4 worksheets per solution page (2x2 grid)
    const perSolPage = 4;
    for (let s = 0; s < worksheets.length; s += perSolPage) {
      doc.addPage([pageWidth, pageHeight]);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("ANSWER KEYS", 40, 36);

      const marginX = 40;
      const marginY = 50;
      const blockWidth = (pageWidth - marginX * 2 - 20) / 2;
      const blockHeight = (pageHeight - marginY - 45 - 20) / 2;

      for (let sub = 0; sub < perSolPage; sub++) {
        const wsIdx = s + sub;
        if (wsIdx >= worksheets.length) break;

        const ws = worksheets[wsIdx];
        const col = sub % 2;
        const row = Math.floor(sub / 2);
        const bx = marginX + col * (blockWidth + 20);
        const by = marginY + row * (blockHeight + 20);

        // Card box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.8);
        doc.roundedRect(bx, by, blockWidth, blockHeight, 4, 4, "FD");

        // Worksheet Title in box
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Worksheet #${ws.pageNumber}: ${ws.title}`, bx + 10, by + 18);

        // Category
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(99, 102, 241);
        doc.text(ws.category, bx + 10, by + 28);

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(bx + 10, by + 33, bx + blockWidth - 10, by + 33);

        // Word list (2 columns inside block if items > 6)
        const items = ws.items;
        const itemYStart = by + 45;
        const availH = blockHeight - 55;
        const stepY = Math.min(14, availH / Math.ceil(items.length / 2));

        items.forEach((item, iIdx) => {
          const inCol = items.length > 6 && iIdx >= Math.ceil(items.length / 2) ? 1 : 0;
          const colX = bx + 10 + inCol * (blockWidth / 2);
          const rowIdx = inCol === 1 ? iIdx - Math.ceil(items.length / 2) : iIdx;
          const currY = itemYStart + rowIdx * stepY;

          if (currY < by + blockHeight - 8) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(`${iIdx + 1}.`, colX, currY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            doc.text(item.original, colX + 14, currY);
          }
        });
      }

      currentStep++;
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
    }
  }

  return doc;
}
