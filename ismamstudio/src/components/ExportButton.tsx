"use client";

import posthog from "posthog-js";
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { drawCoverPagePart, drawWatermark } from "@/app/utils/pdfExportService";
import ExportInteriorModal from "./ExportInteriorModal";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ExportButtonProps {
  title?: string;
  subtitle?: string;
  content?: string; // Book Blurb / Intro
  chapters?: Chapter[];
  customFont?: "times" | "helvetica" | "courier";
  customFontSize?: number;
  customLineSpacing?: number;
  customTextColor?: string;
}

export default function ExportButton({
  title = "My Book",
  subtitle = "An AI Generated Journey",
  content = "No content available.",
  chapters = [],
  customFont = "times",
  customFontSize = 18,
  customLineSpacing = 1.8,
  customTextColor = "#1e293b",
}: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportPDF = async (options: {
    includeCover: boolean;
    coverState: any;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
    isPremium?: boolean;
  }) => {
    const { includeCover, coverState, trimSize, hasBleed, showGuides, isPremium } = options;

    // 1. Determine trim dimensions in inches
    let w = 8.5;
    let h = 11;
    if (trimSize === "6x9") {
      w = 6;
      h = 9;
    } else if (trimSize === "5x8") {
      w = 5;
      h = 8;
    }

    const bleed = 0.125;
    const pageW = hasBleed ? w + bleed * 2 : w;
    const pageH = hasBleed ? h + bleed * 2 : h;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [pageW, pageH],
    });

    // Typography & Margins custom layout parameters
    const docFont = customFont;
    
    // Map CSS px size to PDF font size (pt)
    const docFontSize = Math.max(8, Math.min(20, Math.round(customFontSize * 0.65)));
    
    // Map line height spacing (in)
    const lineSpacing = customLineSpacing * 0.13;

    // Convert hex text color to RGB values
    let r = 30, g = 41, b = 59;
    if (customTextColor) {
      const cleanHex = customTextColor.replace("#", "");
      if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
    }

    const marginT = 0.85;
    const marginB = 0.85;

    let pageNum = 1;
    let currentLineIndex = 0;
    let firstPageAdded = false;

    // Helper to draw headers & footers (KDP layout)
    const drawHeaderAndFooter = (doc: jsPDF, pNum: number, currentChapterTitle: string) => {
      if (pNum === 1) return; // Skip title page

      const isOdd = pNum % 2 === 1;
      const marginL = isOdd ? 0.85 : 0.5;
      const marginR = isOdd ? 0.5 : 0.85;
      const headerY = 0.45;
      const footerY = pageH - 0.45;

      // Draw running header thin line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.005);
      doc.line(marginL, headerY + 0.05, pageW - marginR, headerY + 0.05);

      // Draw Running Header Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500

      if (isOdd) {
        // Odd Page: Book Title Left, Chapter Title Right
        doc.text(title, marginL, headerY);
        doc.text(currentChapterTitle, pageW - marginR, headerY, { align: "right" });
      } else {
        // Even Page: Chapter Title Left, Book Title Right
        doc.text(currentChapterTitle, marginL, headerY);
        doc.text(title, pageW - marginR, headerY, { align: "right" });
      }

      // Draw Footer Page Number
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Page ${pNum}`, marginL + (pageW - marginL - marginR) / 2, footerY, { align: "center" });
    };

    // Helper to print blocks of text with paragraph indentation
    const renderTextBlock = (text: string, currentChapterTitle: string) => {
      // Split text into paragraphs
      const paragraphs = text
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      paragraphs.forEach((pText) => {
        const indent = 0.25; // 0.25 in indent for standard novel layout
        let isFirstLine = true;
        let remainingText = pText;

        while (remainingText.length > 0) {
          // Alternating inside/outside margins
          const isOdd = pageNum % 2 === 1;
          const marginL = isOdd ? 0.85 : 0.5;
          const marginR = isOdd ? 0.5 : 0.85;
          const contentW = pageW - marginL - marginR;
          const contentH = pageH - marginT - marginB;

          const maxLinesPerPage = Math.floor(contentH / lineSpacing);

          if (currentLineIndex >= maxLinesPerPage) {
            // Close page and add header/footer
            drawHeaderAndFooter(doc, pageNum, currentChapterTitle);
            if (isPremium === false) {
              drawWatermark(doc, pageW, pageH);
            }

            // Create new page
            doc.addPage();
            pageNum++;
            currentLineIndex = 0;
          }

          const activeWidth = isFirstLine ? contentW - indent : contentW;
          const activeX = isFirstLine ? marginL + indent : marginL;

          doc.setFont(docFont, "normal");
          doc.setFontSize(docFontSize);
          doc.setTextColor(r, g, b);

          const splitResult = doc.splitTextToSize(remainingText, activeWidth);
          const lineToPrint = splitResult[0];

          if (!lineToPrint) break;

          const printY = marginT + currentLineIndex * lineSpacing + 0.15;
          doc.text(lineToPrint, activeX, printY);
          currentLineIndex++;

          remainingText = remainingText.substring(lineToPrint.length).trim();
          isFirstLine = false;
        }
      });
    };

    // ── 1. FRONT COVER ──────────────────────────────────────────
    if (includeCover && coverState) {
      await drawCoverPagePart(doc, coverState, "front", pageW, pageH);
      firstPageAdded = true;
    }

    // ── 2. TITLE PAGE ───────────────────────────────────────────
    if (firstPageAdded) {
      doc.addPage();
    }
    firstPageAdded = true;

    // Title page margins (Page 1)
    const titleMarginL = 0.85;
    const titleContentW = pageW - titleMarginL - 0.5;

    doc.setFont(docFont, "bold");
    doc.setFontSize(28);
    doc.setTextColor(r, g, b);
    const titleLines = doc.splitTextToSize(title, titleContentW);
    doc.text(titleLines, titleMarginL + titleContentW / 2, pageH * 0.3, { align: "center" });

    // Decorative divider line
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.015);
    doc.line(titleMarginL + titleContentW * 0.4, pageH * 0.4, titleMarginL + titleContentW * 0.6, pageH * 0.4);

    doc.setFont(docFont, "italic");
    doc.setFontSize(14);
    doc.setTextColor(r, g, b);
    const subtitleLines = doc.splitTextToSize(subtitle, titleContentW);
    doc.text(subtitleLines, titleMarginL + titleContentW / 2, pageH * 0.46, { align: "center" });

    if (isPremium === false) {
      drawWatermark(doc, pageW, pageH);
    }

    // ── 3. BOOK INTRODUCTION / BLURB ───────────────────────────
    doc.addPage();
    pageNum++;
    currentLineIndex = 0;

    // Title: Introduction
    doc.setFont(docFont, "bold");
    doc.setFontSize(20);
    doc.setTextColor(r, g, b);
    doc.text("Introduction", 0.85, marginT + 0.2);
    currentLineIndex = 3; // Leave space under heading

    renderTextBlock(content, "Introduction");

    // Close introduction page
    drawHeaderAndFooter(doc, pageNum, "Introduction");
    if (isPremium === false) {
      drawWatermark(doc, pageW, pageH);
    }

    // ── 4. CHAPTERS ─────────────────────────────────────────────
    chapters.forEach((chapter) => {
      doc.addPage();
      pageNum++;
      currentLineIndex = 0;

      // Stylized Chapter Start layout
      const isOdd = pageNum % 2 === 1;
      const marginL = isOdd ? 0.85 : 0.5;
      const marginR = isOdd ? 0.5 : 0.85;
      const contentW = pageW - marginL - marginR;

      // Bold stylized Chapter Title starting lower on the page (1.8 inches down)
      doc.setFont(docFont, "bold");
      doc.setFontSize(22);
      doc.setTextColor(r, g, b);
      
      const chapterTitleText = chapter.title.toUpperCase();
      const splitTitle = doc.splitTextToSize(chapterTitleText, contentW);
      doc.text(splitTitle, marginL + contentW / 2, 1.8, { align: "center" });

      // Decorative divider under chapter header
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.005);
      doc.line(marginL + contentW * 0.35, 2.3, marginL + contentW * 0.65, 2.3);

      // Start text below title area
      currentLineIndex = 9;

      // Print chapter paragraphs
      renderTextBlock(chapter.content, chapter.title);

      // Close final page of the chapter
      drawHeaderAndFooter(doc, pageNum, chapter.title);
      if (isPremium === false) {
        drawWatermark(doc, pageW, pageH);
      }
    });

    // ── 5. BACK COVER ───────────────────────────────────────────
    if (includeCover && coverState) {
      doc.addPage();
      await drawCoverPagePart(doc, coverState, "back", pageW, pageH);
    }

    // Save PDF
    doc.save(`${title.replace(/\s+/g, "_")}_Interior.pdf`);
    posthog.capture("book_exported_pdf", {
      trim_size: trimSize,
      include_cover: includeCover,
      has_bleed: hasBleed,
      chapter_count: chapters.length,
      is_premium: isPremium,
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-650 shadow-md transition-all active:scale-95 pointer-events-auto cursor-pointer"
      >
        <Download className="w-4 h-4" /> Export PDF
      </button>

      <ExportInteriorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showSolutionsToggle={false}
        defaultTrimSize="6x9"
        onExport={handleExportPDF}
      />
    </>
  );
}
