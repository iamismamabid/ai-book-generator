import { jsPDF } from "jspdf";
import { splitManuscriptIntoChapters } from "./epubExport";

export interface PdfFormatterOptions {
  title: string;
  author: string;
  rawText: string;
  trimSize: "6x9" | "8.5x11" | "5x8";
  fontFamily: "times" | "helvetica" | "courier";
  fontSize: number; // 10, 11, 12
  lineSpacing: number; // 1.15, 1.25, 1.5
  pageNumbers: boolean;
  runningHeaders: boolean;
}

const TRIM_SIZES: Record<string, [number, number]> = {
  "6x9": [6.0, 9.0],
  "8.5x11": [8.5, 11.0],
  "5x8": [5.0, 8.0],
};

export function getGutterMargin(pageCount: number): number {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.500;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.750;
  return 0.875;
}

export async function generateInteriorPdf(options: PdfFormatterOptions): Promise<{ blob: Blob; pageCount: number }> {
  const chapters = splitManuscriptIntoChapters(options.rawText);
  const [width, height] = TRIM_SIZES[options.trimSize] || TRIM_SIZES["6x9"];

  // Pass 1: Typeset with default gutter to estimate page count
  const tempDoc = runTypeset(chapters, width, height, 0.5, options);
  const pageCountEst = tempDoc.getNumberOfPages();

  // Pass 2: Typeset with exact required gutter based on estimated page count
  const finalGutter = getGutterMargin(pageCountEst);
  const finalDoc = runTypeset(chapters, width, height, finalGutter, options);
  const pageCount = finalDoc.getNumberOfPages();

  // Return final PDF Blob and page count
  const blob = finalDoc.output("blob");
  return { blob, pageCount };
}

function runTypeset(
  chapters: { title: string; content: string }[],
  width: number,
  height: number,
  gutter: number,
  options: PdfFormatterOptions
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [width, height],
  });

  const outerMargin = 0.5;
  const innerMargin = 0.5 + gutter; // Inner margin includes outer margin base + gutter
  const topMargin = 0.75;
  const bottomMargin = 0.75;

  const printableWidth = width - innerMargin - outerMargin;
  const printableHeight = height - topMargin - bottomMargin;

  const fontFamily = options.fontFamily;
  const fontSize = options.fontSize;
  const lineSpacing = options.lineSpacing;
  const lineHeight = (fontSize * lineSpacing) / 72; // Convert pt to inches

  // ----------------------------------------------------
  // Page 1: Title Page (Odd - Left margin = innerMargin)
  // ----------------------------------------------------
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(fontSize * 2.2);
  const titleY = height / 3;
  doc.text(options.title, width / 2, titleY, { align: "center" });

  doc.setFont(fontFamily, "normal");
  doc.setFontSize(fontSize * 1.2);
  doc.text(`By ${options.author}`, width / 2, titleY + 0.6, { align: "center" });

  doc.setFontSize(fontSize * 0.9);
  doc.text("Self-Published Edition", width / 2, height - 1.2, { align: "center" });

  // ----------------------------------------------------
  // Page 2: Copyright Page (Even - Left margin = outerMargin)
  // ----------------------------------------------------
  doc.addPage();
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(fontSize * 0.8);
  const copyrightText = [
    `Copyright © ${new Date().getFullYear()} by ${options.author}`,
    "All rights reserved.",
    "",
    "No part of this book may be reproduced in any form or by any electronic or mechanical means, including information storage and retrieval systems, without written permission from the author, except for the use of brief quotations in a book review.",
    "",
    "This book is a work of fiction/non-fiction. Names, characters, places, and incidents are products of the author's imagination or are used fictitiously. Any resemblance to actual events or locales or persons, living or dead, is entirely coincidental.",
    "",
    "First Edition",
    "Printed in the United States of America"
  ];

  let copyY = height - 3.5;
  const copyX = outerMargin;
  const copyWidth = printableWidth;

  copyrightText.forEach((paragraph) => {
    if (paragraph === "") {
      copyY += 0.15;
    } else {
      const wrapped = doc.splitTextToSize(paragraph, copyWidth);
      wrapped.forEach((line: string) => {
        doc.text(line, copyX, copyY);
        copyY += (fontSize * 0.8 * 1.2) / 72;
      });
      copyY += 0.05;
    }
  });

  // ----------------------------------------------------
  // Page 3: Table of Contents Placeholders (Odd)
  // ----------------------------------------------------
  doc.addPage();

  // ----------------------------------------------------
  // Page 4: Blank Page (Even)
  // ----------------------------------------------------
  doc.addPage();

  // ----------------------------------------------------
  // Pages 5+: Chapter Typesetting
  // ----------------------------------------------------
  const chapterStarts: { title: string; page: number }[] = [];

  chapters.forEach((chapter) => {
    // Force chapter openings onto a right-hand (recto/odd) page, per standard
    // print layout — insert a blank verso page first if needed.
    if (doc.getNumberOfPages() % 2 !== 0) {
      doc.addPage();
    }
    doc.addPage();

    const startPage = doc.getNumberOfPages();
    chapterStarts.push({ title: chapter.title, page: startPage });

    // Set font to bold & large for chapter heading
    doc.setFont(fontFamily, "bold");
    const headingSize = fontSize * 1.5;
    doc.setFontSize(headingSize);

    const currentPageNum = doc.getNumberOfPages();
    const isOdd = currentPageNum % 2 !== 0;
    const currentXOffset = isOdd ? innerMargin : outerMargin;
    const printableCenter = currentXOffset + printableWidth / 2;

    let currentY = topMargin + 0.6;
    doc.text(chapter.title, printableCenter, currentY, { align: "center" });

    currentY += (headingSize * 2.0) / 72; // Gap after heading

    // Reset font to body text
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(fontSize);

    // Process paragraph text
    const paragraphs = chapter.content.split(/\r?\n\s*\r?\n/);
    paragraphs.forEach((paragraph) => {
      const trimmed = paragraph.trim();
      if (trimmed.length === 0) return;

      const wrappedLines = doc.splitTextToSize(trimmed, printableWidth);
      wrappedLines.forEach((line: string) => {
        if (currentY + lineHeight > height - bottomMargin) {
          doc.addPage();
          const pageNum = doc.getNumberOfPages();
          const pageIsOdd = pageNum % 2 !== 0;
          const pageXOffset = pageIsOdd ? innerMargin : outerMargin;

          currentY = topMargin;
          doc.text(line, pageXOffset, currentY);
          currentY += lineHeight;
        } else {
          const pageNum = doc.getNumberOfPages();
          const pageIsOdd = pageNum % 2 !== 0;
          const pageXOffset = pageIsOdd ? innerMargin : outerMargin;

          doc.text(line, pageXOffset, currentY);
          currentY += lineHeight;
        }
      });

      // Paragraph spacing gap
      currentY += lineHeight * 0.4;
    });
  });

  const totalPages = doc.getNumberOfPages();

  // ----------------------------------------------------
  // Write Table of Contents (Page 3)
  // ----------------------------------------------------
  doc.setPage(3);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(fontSize * 1.6);
  const tocCenterX = innerMargin + printableWidth / 2;
  const tocLeftX = innerMargin;
  const tocRightX = width - outerMargin;

  doc.text("Table of Contents", tocCenterX, topMargin + 0.5, { align: "center" });

  doc.setFont(fontFamily, "normal");
  doc.setFontSize(fontSize);
  let tocY = topMargin + 1.2;

  chapterStarts.forEach((chStart) => {
    if (tocY > height - bottomMargin - 0.5) return;

    doc.setFont(fontFamily, "bold");
    doc.text(chStart.title, tocLeftX, tocY);

    doc.setFont(fontFamily, "normal");
    const textWidth = doc.getTextWidth(chStart.title);
    const pageStr = chStart.page.toString();
    const pageNumWidth = doc.getTextWidth(pageStr);

    const startDotsX = tocLeftX + textWidth + 0.1;
    const endDotsX = tocRightX - pageNumWidth - 0.1;
    if (endDotsX > startDotsX) {
      let dotStr = "";
      while (doc.getTextWidth(dotStr + ".") < (endDotsX - startDotsX)) {
        dotStr += ".";
      }
      doc.text(dotStr, startDotsX, tocY);
    }

    doc.text(pageStr, tocRightX, tocY, { align: "right" });
    tocY += (fontSize * 1.3) / 72 + 0.1;
  });

  // ----------------------------------------------------
  // Second Pass: Add running headers & page numbers (Pages 5+)
  // ----------------------------------------------------
  for (let i = 5; i <= totalPages; i++) {
    doc.setPage(i);
    const isOdd = i % 2 !== 0;

    const leftX = outerMargin;
    const rightX = width - outerMargin;

    // 1. Running Headers
    if (options.runningHeaders) {
      doc.setFont(fontFamily, "italic");
      doc.setFontSize(fontSize * 0.75);
      doc.setTextColor(100, 116, 139);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.008);

      if (isOdd) {
        const chapterForPage = [...chapterStarts]
          .reverse()
          .find(c => c.page <= i);
        const headerTitle = chapterForPage ? chapterForPage.title : options.title;
        doc.text(headerTitle, rightX, topMargin - 0.25, { align: "right" });
        doc.line(innerMargin, topMargin - 0.18, rightX, topMargin - 0.18);
      } else {
        const evenRightX = width - innerMargin;
        doc.text(options.author, leftX, topMargin - 0.25);
        doc.line(leftX, topMargin - 0.18, evenRightX, topMargin - 0.18);
      }
    }

    // 2. Page Numbers
    if (options.pageNumbers) {
      doc.setFont(fontFamily, "normal");
      doc.setFontSize(fontSize * 0.85);
      doc.setTextColor(15, 23, 42);

      const pageStr = i.toString();
      if (isOdd) {
        doc.text(pageStr, rightX, height - bottomMargin + 0.35, { align: "right" });
      } else {
        doc.text(pageStr, leftX, height - bottomMargin + 0.35);
      }
    }
  }

  return doc;
}
