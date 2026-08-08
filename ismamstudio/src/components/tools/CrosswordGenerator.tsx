"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, RefreshCw, AlertCircle, FileText, CheckCircle2, Sliders, Settings, BookOpen, Upload, Lock, Sparkles
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { checkPremiumStatus } from "@/app/actions";
import { generateCrosswordGrid } from "@/app/utils/crosswordGenerator";

const DEFAULT_CROSSWORDS_TEXT = `# Puzzle 1
REACT, A popular UI library
NEXTJS, A React framework
VERCEL, Hosting platform
CODING, Writing software
ENGINE, Core system logic

# Puzzle 2
LION, King of the jungle
TIGER, Striped orange wild cat
ELEPHANT, Large mammal with a trunk
GIRAFFE, Long-necked African mammal
ZEBRA, Black and white striped animal

# Puzzle 3
GUITAR, String instrument with frets
PIANO, Keyed musical instrument
DRUMS, Percussion instrument
VIOLIN, Bowed string instrument
FLUTE, Wind instrument played sideways`;

const TRIM_SIZES = [
  { id: "8.5x11", label: "8.5\" x 11\" (Large Print)", w: 8.5, h: 11 },
  { id: "6x9", label: "6\" x 9\" (Novel)", w: 6, h: 9 },
  { id: "5x8", label: "5\" x 8\" (Compact)", w: 5, h: 8 }
];

export default function CrosswordGenerator() {
  const router = useRouter();
  
  // Premium and user states
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
  const [inputText, setInputText] = useState(DEFAULT_CROSSWORDS_TEXT);
  const [gridSize, setGridSize] = useState<number>(15);
  const [numPuzzles, setNumPuzzles] = useState<number>(3);
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [includeCover, setIncludeCover] = useState<boolean>(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Puzzle generation states
  const [puzzles, setPuzzles] = useState<Array<{
    index: number;
    title: string;
    grid: string[][];
    placedWords: any[];
  }>>([]);
  
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [previewSolMode, setPreviewSolMode] = useState<boolean>(false);

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch (err) {
        console.error(err);
      }
    }
    loadPremium();
  }, []);

  // Fetches plan status fresh rather than trusting whatever `premiumStatus`
  // happened to hold at render time -- the initial useEffect above populates
  // it for the UI label, but relying on that same state to gate generation
  // had a race: clicking Generate before the async load resolved (or before
  // a newly-redeemed plan reflected) silently fell back to the free-tier
  // default and capped a genuinely premium account too low.
  const getFreshPremiumStatus = async () => {
    try {
      const res = await checkPremiumStatus();
      setPremiumStatus(res as any);
      return res as any;
    } catch (err) {
      console.error(err);
      return premiumStatus;
    }
  };

  const tierMaxFor = (plan: string) =>
    plan === "free" ? 20 :
      plan === "starter" ? 100 :
        plan === "pro" ? 250 :
          1000;

  // Parse file CSV/TXT
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      setInputText(cleaned);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const parseAndGeneratePuzzles = async () => {
    setIsGenerating(true);

    const freshStatus = await getFreshPremiumStatus();
    const maxAllowed = tierMaxFor(freshStatus.plan);
    const targetCount = Math.min(numPuzzles, maxAllowed);

    // Parse puzzles separated by '#' or standard word/clue rows
    const sections = inputText.split(/#\s*Puzzle\s*\d+/i);
    const parsedTemplatesList: Array<{ title: string; words: Array<{ word: string; clue: string }> }> = [];

    if (sections.length > 1) {
      // Markdown header style
      sections.forEach((sec) => {
        const lines = sec.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;
        
        const words: Array<{ word: string; clue: string }> = [];
        lines.forEach(l => {
          const parts = l.split(",");
          if (parts[0] && parts[1]) {
            words.push({ word: parts[0].trim().toUpperCase(), clue: parts[1].trim() });
          }
        });
        
        if (words.length > 0) {
          parsedTemplatesList.push({
            title: "Crossword Puzzle",
            words
          });
        }
      });
    } else {
      // Fallback: Group words into chunks
      const lines = inputText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      const words: Array<{ word: string; clue: string }> = [];
      lines.forEach(l => {
        const parts = l.split(",");
        if (parts[0] && parts[1]) {
          words.push({ word: parts[0].trim().toUpperCase(), clue: parts[1].trim() });
        }
      });

      if (words.length > 0) {
        parsedTemplatesList.push({
          title: "Crossword Puzzle",
          words
        });
      }
    }

    if (parsedTemplatesList.length === 0) {
      alert("No valid crossword puzzles found in the text area.");
      setIsGenerating(false);
      return;
    }

    // Build targetCount puzzles by cycling through available templates
    const finalPuzzlesList: Array<{ title: string; words: Array<{ word: string; clue: string }> }> = [];
    for (let i = 0; i < targetCount; i++) {
      const tmpl = parsedTemplatesList[i % parsedTemplatesList.length];
      finalPuzzlesList.push({
        title: `Crossword Puzzle #${i + 1}`,
        words: [...tmpl.words]
      });
    }

    // Generate puzzle grids for all targetCount puzzles
    const generated = finalPuzzlesList.map((p, index) => {
      const { grid, placedWords } = generateCrosswordGrid(p.words, gridSize);
      return {
        index: index + 1,
        title: p.title,
        grid,
        placedWords
      };
    });

    setPuzzles(generated);
    setActivePreviewIndex(0);
    setIsGenerating(false);
  };

  useEffect(() => {
    parseAndGeneratePuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, numPuzzles]);

  // Compile and Export PDF
  const handleExportPDF = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
    isPremium?: boolean;
  }) => {
    if (puzzles.length === 0) return;
    setIsDownloading(true);
    const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, hasBleed: finalBleed, showGuides: finalGuides, isPremium } = options;

    setTimeout(async () => {
      let finalW = 8.5;
      let finalH = 11;
      if (finalTrim === "6x9") {
        finalW = 6;
        finalH = 9;
      } else if (finalTrim === "5x8") {
        finalW = 5;
        finalH = 8;
      }

      const bleed = 0.125;
      const pageW = finalBleed ? finalW + bleed * 2 : finalW;
      const pageH = finalBleed ? finalH + bleed * 2 : finalH;

      const [{ jsPDF }, { drawCoverPagePart, drawWatermark, drawMarginGuides }] = await Promise.all([
        import("jspdf"),
        import("@/app/utils/pdfExportService"),
      ]);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [pageW, pageH]
      });

      const marginL = 0.75;
      const marginR = 0.5;
      const marginT = 0.75;
      const marginB = 0.75;
      const contentW = pageW - marginL - marginR;
      const contentH = pageH - marginT - marginB;

      let firstPageAdded = false;
      if (incCover && coverState) {
        await drawCoverPagePart(doc, coverState, 'front', pageW, pageH);
        firstPageAdded = true;
      }

      const drawHeaderFooter = (titleText: string, pageNum: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59);
        doc.text(titleText, marginL + contentW / 2, marginT + 0.3, { align: "center" });

        if (finalGuides) {
          drawMarginGuides(doc, marginL, marginR, marginT, marginB, pageW, pageH);
        }

        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 0.5, marginL + contentW, marginT + 0.5);

        // Footer page numbering
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${pageNum}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      };

      // Draw Puzzles
      puzzles.forEach((puzzle, idx) => {
        if (firstPageAdded || idx > 0) {
          doc.addPage();
        }
        firstPageAdded = true;
        
        const pageNum = idx + 1;
        drawHeaderFooter(puzzle.title, pageNum);

        // Draw Crossword Grid
        const gridOffsetTop = marginT + 0.8;
        const gridRenderW = Math.min(contentW, 4.5); // Cap width to fit
        const cellSize = gridRenderW / gridSize;
        const gridStartX = marginL + (contentW - gridRenderW) / 2;

        puzzle.grid.forEach((row, r) => {
          row.forEach((cell, c) => {
            const isBlank = cell === '';
            const cellX = gridStartX + c * cellSize;
            const cellY = gridOffsetTop + r * cellSize;

            if (isBlank) {
              doc.setFillColor(30, 41, 59); // dark block
              doc.rect(cellX, cellY, cellSize, cellSize, 'F');
            } else {
              doc.setDrawColor(30, 41, 59);
              doc.setLineWidth(0.008);
              doc.setFillColor(255, 255, 255);
              doc.rect(cellX, cellY, cellSize, cellSize, 'FD');

              // Draw small number if word starts here
              const wordStart = puzzle.placedWords.find(w => w.r === r && w.c === c);
              if (wordStart) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(cellSize * 18); // scaled sizing
                doc.setTextColor(30, 41, 59);
                doc.text(String(wordStart.num), cellX + 0.02, cellY + (cellSize * 0.35));
              }
            }
          });
        });

        // Draw Clues (Across / Down columns)
        const cluesStartY = gridOffsetTop + gridRenderW + 0.4;
        const colW = contentW / 2 - 0.2;

        // Across
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text("ACROSS", marginL, cluesStartY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);

        let acrossY = cluesStartY + 0.2;
        puzzle.placedWords.filter(w => w.dir === 'H').forEach(w => {
          const text = `${w.num}. ${w.clue}`;
          const wrapped = doc.splitTextToSize(text, colW);
          doc.text(wrapped, marginL, acrossY);
          acrossY += wrapped.length * 0.16 + 0.05;
        });

        // Down
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text("DOWN", marginL + colW + 0.4, cluesStartY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);

        let downY = cluesStartY + 0.2;
        puzzle.placedWords.filter(w => w.dir === 'V').forEach(w => {
          const text = `${w.num}. ${w.clue}`;
          const wrapped = doc.splitTextToSize(text, colW);
          doc.text(wrapped, marginL + colW + 0.4, downY);
          downY += wrapped.length * 0.16 + 0.05;
        });
      });

      // Draw Solutions
      if (incSol) {
        puzzles.forEach((puzzle, idx) => {
          doc.addPage();
          const pageNum = puzzles.length + idx + 1;
          drawHeaderFooter(`${puzzle.title} (Solution)`, pageNum);

          // Draw Crossword Grid with solutions filled
          const gridOffsetTop = marginT + 0.8;
          const gridRenderW = Math.min(contentW, 4.5);
          const cellSize = gridRenderW / gridSize;
          const gridStartX = marginL + (contentW - gridRenderW) / 2;

          puzzle.grid.forEach((row, r) => {
            row.forEach((cell, c) => {
              const isBlank = cell === '';
              const cellX = gridStartX + c * cellSize;
              const cellY = gridOffsetTop + r * cellSize;

              if (isBlank) {
                doc.setFillColor(30, 41, 59);
                doc.rect(cellX, cellY, cellSize, cellSize, 'F');
              } else {
                doc.setDrawColor(30, 41, 59);
                doc.setLineWidth(0.008);
                doc.setFillColor(255, 255, 255);
                doc.rect(cellX, cellY, cellSize, cellSize, 'FD');

                // Draw small number
                const wordStart = puzzle.placedWords.find(w => w.r === r && w.c === c);
                if (wordStart) {
                  doc.setFont("helvetica", "bold");
                  doc.setFontSize(cellSize * 18);
                  doc.setTextColor(30, 41, 59);
                  doc.text(String(wordStart.num), cellX + 0.02, cellY + (cellSize * 0.35));
                }

                // Draw solution letter
                doc.setFont("helvetica", "black");
                doc.setFontSize(cellSize * 25);
                doc.setTextColor(79, 70, 229);
                doc.text(cell, cellX + cellSize / 2, cellY + cellSize * 0.72, { align: "center" });
              }
            });
          });
        });
      }

      // Draw Back Cover
      if (incCover && coverState) {
        doc.addPage();
        await drawCoverPagePart(doc, coverState, 'back', pageW, pageH);
      }

      // Watermark for free tier
      if (isPremium === false) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          const isFrontCover = incCover && coverState && i === 1;
          const isBackCover = incCover && coverState && i === totalPages;
          if (!isFrontCover && !isBackCover) {
            doc.setPage(i);
            drawWatermark(doc, pageW, pageH);
          }
        }
      }

      doc.save(`crosswords-${puzzles.length}-pack.pdf`);
      setIsDownloading(false);
    }, 50);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 animate-in fade-in duration-500" style={{ boxShadow: "var(--shadow-soft-lg)" }}>
      
      {/* Sidebar Controls */}
      <div className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4"/> Back to Home
          </button>
          <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            <Sliders className="w-3.5 h-3.5"/> Crossword
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Text Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Words &amp; Clues</label>
              <button 
                onClick={() => csvInputRef.current?.click()}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded"
              >
                <Upload className="w-2.5 h-2.5"/> CSV Import
              </button>
              <input type="file" accept=".csv,.txt" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="WORD, Clue per line&#10;Or separate puzzles by # Puzzle 1"
              className="w-full h-44 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-200 resize-none font-mono"
            />
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Grid settings */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Grid Size ({gridSize}x{gridSize})</label>
              <input 
                type="range" 
                min="10" 
                max="20" 
                value={gridSize} 
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Number of Puzzles</label>
                <span className="text-[10px] font-bold text-amber-400">
                  Max {tierMaxFor(premiumStatus.plan)} Puzzles ({premiumStatus.plan === "free" ? "Free" : premiumStatus.plan})
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={tierMaxFor(premiumStatus.plan)}
                value={numPuzzles}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const maxVal = tierMaxFor(premiumStatus.plan);
                  setNumPuzzles(Math.min(maxVal, Math.max(1, val)));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500 font-mono mb-2"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNumPuzzles(5)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => setNumPuzzles(20)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
                >
                  20
                </button>
                <button
                  type="button"
                  onClick={() => setNumPuzzles(50)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
                >
                  50
                </button>
                <button
                  type="button"
                  onClick={() => setNumPuzzles(100)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
                >
                  100
                </button>
                <button
                  type="button"
                  onClick={() => setNumPuzzles(1000)}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black transition"
                >
                  ⚡ 1,000 Puzzles
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Book Trim Size</label>
              <select
                value={trimSize.id}
                onChange={(e) => {
                  const size = TRIM_SIZES.find(s => s.id === e.target.value);
                  if (size) setTrimSize(size);
                }}
                className="w-full text-xs font-bold bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-colors duration-200"
              >
                {TRIM_SIZES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Guidelines */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">Document Settings</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="rounded accent-indigo-500 text-slate-900"
              />
              Include Solutions Pages
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded accent-indigo-500 text-slate-900"
              />
              Include Cover Pages (Front &amp; Back)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-indigo-500 text-slate-900"
              />
              Bleed (+0.125" KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-indigo-500 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <button
            onClick={parseAndGeneratePuzzles}
            disabled={isGenerating}
            className="btn-premium w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 normal-case"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : "Generate Crossword"}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isDownloading || puzzles.length === 0}
            className="btn-premium w-full bg-amber-500 hover:bg-amber-600 text-slate-950 normal-case hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 24px rgba(245, 158, 11, 0.18)" }}
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Download Print PDF
          </button>

          <SaveToNotebookButton
            title={`Crossword Collection (${puzzles.length} Puzzles)`}
            content={`Crossword interior with ${puzzles.length} puzzles, trim size ${trimSize.id}${includeAnswers ? ", with solutions" : ", no solutions"}.`}
            category="crossword"
            data={{ puzzlesCount: puzzles.length, trimSize: trimSize.id, includeAnswers, includeCover, hasBleed, inputText }}
            className="w-full justify-center"
          />

          <CoverStudioCTA trimSize={trimSize.id} />
        </div>
      </div>

      {/* Visual Preview Workspace */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 flex flex-col overflow-hidden transition-colors duration-300">
        
        {/* Pagination Toolbar */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Preview Puzzle:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
              {puzzles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    activePreviewIndex === idx ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  P#{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewSolMode(!previewSolMode)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border transition ${
                previewSolMode 
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {previewSolMode ? "Hide Answers" : "Show Answers"}
            </button>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Trim: {trimSize.label} | Puzzles: {puzzles.length}
            </div>
          </div>
        </div>

        {/* Workspace Canvas Container */}
        <div className="flex-1 p-10 overflow-y-auto flex items-center justify-center relative bg-slate-100/60 dark:bg-slate-950/40 transition-colors duration-300">
          
          {puzzles.length > 0 && puzzles[activePreviewIndex] ? (
            <div
              className="relative bg-white rounded-2xl border border-slate-200/80 flex flex-col p-12 overflow-hidden cursor-default transition-all duration-300"
              style={{
                boxShadow: "var(--shadow-soft-lg)",
                width: "480px", 
                height: `${480 * (trimSize.h / trimSize.w)}px`,
                paddingTop: "40px",
                paddingBottom: "40px",
                paddingLeft: "45px",
                paddingRight: "30px"
              }}
            >
              {showGuides && (
                <>
                  <div className="absolute top-0 bottom-0 left-0 border-r border-dashed border-rose-400/40 pointer-events-none" style={{ width: "45px" }} />
                  <div className="absolute top-0 bottom-0 right-0 border-l border-dashed border-rose-400/40 pointer-events-none" style={{ width: "30px" }} />
                  <div className="absolute left-0 right-0 top-0 border-b border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <span className="absolute bottom-1 right-2 text-[8px] font-black text-rose-500 opacity-60">SAFE PRINT AREA</span>
                </>
              )}

              {/* Live Preview Page Content */}
              <div className="flex flex-col h-full justify-between overflow-hidden">
                
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                    {puzzles[activePreviewIndex].title}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    {previewSolMode ? "Crossword Grid (Solution)" : "Fill in the blank clues below"}
                  </p>
                  <div className="h-px bg-slate-100 my-2" />
                </div>

                {/* Crossword Grid Canvas */}
                <div className="flex justify-center my-2 select-none">
                  <div 
                    className="grid border-[2px] border-slate-900 bg-slate-900 shadow-md"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                  >
                    {puzzles[activePreviewIndex].grid.map((row, r) => 
                      row.map((cell, c) => {
                        const isBlank = cell === '';
                        const wordStart = puzzles[activePreviewIndex].placedWords.find(w => w.r === r && w.c === c);
                        return (
                          <div 
                            key={`${r}-${c}`}
                            className={`w-6 h-6 flex items-center justify-center relative transition-all duration-300
                              ${isBlank ? 'bg-slate-900' : 'bg-white border-[0.5px] border-slate-900 hover:bg-slate-50'}`}
                          >
                            {wordStart && (
                              <span className="absolute top-0.5 left-0.5 text-[5px] font-black text-slate-800 leading-none">
                                {wordStart.num}
                              </span>
                            )}
                            {!isBlank && previewSolMode && (
                              <span className="text-xs font-black text-slate-800">{cell}</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Clues split columns */}
                <div className="flex-1 grid grid-cols-2 gap-4 border-t border-slate-100 pt-2 overflow-y-auto scrollbar-thin">
                  <div>
                    <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Across</h4>
                    <ul className="space-y-1 text-[8px] text-slate-600 font-medium">
                      {puzzles[activePreviewIndex].placedWords.filter(w => w.dir === 'H').map(w => (
                        <li key={w.num} className="truncate">
                          <span className="font-bold text-slate-900">{w.num}.</span> {w.clue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Down</h4>
                    <ul className="space-y-1 text-[8px] text-slate-600 font-medium">
                      {puzzles[activePreviewIndex].placedWords.filter(w => w.dir === 'V').map(w => (
                        <li key={w.num} className="truncate">
                          <span className="font-bold text-slate-900">{w.num}.</span> {w.clue}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer page number indicator */}
                <div className="text-center text-[9px] text-slate-300 font-bold tracking-widest pt-2">
                  PAGE {puzzles[activePreviewIndex].index}
                </div>

              </div>

            </div>
          ) : (
            <div className="surface-card flex flex-col items-center justify-center p-12 max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-black text-slate-700 dark:text-slate-200 text-lg mb-1">No crossword generated</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold leading-relaxed">
                Add some words and clues on the left panel to preview your puzzle sheets.
              </p>
            </div>
          )}

        </div>

      </div>

      <ExportInteriorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTrimSize="8.5x11"
        onExport={handleExportPDF}
      />
    </div>
  );
}
