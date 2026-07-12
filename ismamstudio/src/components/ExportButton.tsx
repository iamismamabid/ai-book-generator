"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { drawCoverPagePart, drawWatermark } from "@/app/utils/pdfExportService";
import ExportInteriorModal from "./ExportInteriorModal";

interface ExportButtonProps {
  title?: string;
  content?: string;
}

export default function ExportButton({ title = "My Book", content = "No content available." }: ExportButtonProps) {
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

    const marginL = 0.75;
    const marginR = 0.5;
    const marginT = 0.75;
    const marginB = 0.75;
    const contentW = pageW - marginL - marginR;
    const contentH = pageH - marginT - marginB;

    let firstPageAdded = false;

    // 1. Add Front Cover
    if (includeCover && coverState) {
      await drawCoverPagePart(doc, coverState, "front", pageW, pageH);
      firstPageAdded = true;
    }

    // 2. Add Title Page
    if (firstPageAdded) {
      doc.addPage();
    }
    firstPageAdded = true;

    // Optional safe margins guides (Disabled to keep final PDF clean)
    /*
    if (showGuides) {
      doc.setDrawColor(244, 63, 94);
      doc.setLineDashPattern([0.1, 0.05], 0);
      doc.setLineWidth(0.005);
      doc.rect(marginL, marginT, contentW, contentH);
      doc.setLineDashPattern([], 0);
    }
    */

    // Draw Title Page
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(title, contentW);
    doc.text(titleLines, marginL + contentW / 2, marginT + contentH * 0.3, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text("An AI Generated Masterpiece", marginL + contentW / 2, marginT + contentH * 0.45, {
      align: "center",
    });

    if (isPremium === false) {
      drawWatermark(doc, pageW, pageH);
    }

    // 3. Add Chapters / Text Content
    doc.addPage();
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    const textLines = doc.splitTextToSize(content, contentW);
    const lineSpacing = 0.22; // inches
    const maxLinesPerPage = Math.floor(contentH / lineSpacing);

    let currentLine = 0;
    let pageNum = 1;

    while (currentLine < textLines.length) {
      if (currentLine > 0) {
        doc.addPage();
        pageNum++;
      }

      // Draw guides (Disabled to keep final PDF clean)
      /*
      if (showGuides) {
        doc.setDrawColor(244, 63, 94);
        doc.setLineDashPattern([0.1, 0.05], 0);
        doc.setLineWidth(0.005);
        doc.rect(marginL, marginT, contentW, contentH);
        doc.setLineDashPattern([], 0);
      }
      */

      // Draw lines for current page
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);

      const linesToPrint = textLines.slice(currentLine, currentLine + maxLinesPerPage);
      linesToPrint.forEach((line: string, index: number) => {
        const yPos = marginT + index * lineSpacing + 0.2;
        doc.text(line, marginL, yPos);
      });

      // Footer Page Number
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${pageNum}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });

      if (isPremium === false) {
        drawWatermark(doc, pageW, pageH);
      }

      currentLine += maxLinesPerPage;
    }

    // 4. Add Back Cover
    if (includeCover && coverState) {
      doc.addPage();
      await drawCoverPagePart(doc, coverState, "back", pageW, pageH);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_Interior.pdf`);
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
