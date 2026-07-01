"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, RefreshCw, AlertCircle, FileText, CheckCircle2, Sliders, Settings, BookOpen
} from "lucide-react";
import { jsPDF } from "jspdf";
import CoverStudioCTA from "@/components/CoverStudioCTA";

const DEFAULT_WORDS = [
  "AEROSPACE", "PROPULSION", "CONTAINMENT", "STABILIZATION",
  "ANTIGRAVITY", "FLIGHT", "PAYLOAD", "SCHEMATICS", "HOLOGRAM",
  "ENGINEERING", "GRAVITATIONAL", "AIRSPACE", "SAFETY", "VELOCITY",
  "LIFT", "THRUST", "VECTOR", "FIELD", "SATELLITE", "ORBIT",
  "QUANTUM", "MAGNETIC", "GENERATOR", "VACUUM", "ATMOSPHERE",
  "LEVITATION", "PROPEL", "KINETIC", "ENERGY", "FORCE"
];

const TRIM_SIZES = [
  { id: "6x9", label: "6\" x 9\" (Novel)", w: 6, h: 9 },
  { id: "8.5x11", label: "8.5\" x 11\" (Large Print)", w: 8.5, h: 11 },
  { id: "5x8", label: "5\" x 8\" (Compact)", w: 5, h: 8 }
];

export default function WordScrambleGenerator() {
  const router = useRouter();
  
  // Input word state
  const [inputText, setInputText] = useState(DEFAULT_WORDS.join("\n"));
  const [words, setWords] = useState<string[]>(DEFAULT_WORDS);
  
  // Options states
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [numPages, setNumPages] = useState<number>(3);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [includeCover, setIncludeCover] = useState<boolean>(false);
  
  // Puzzle data states
  const [puzzles, setPuzzles] = useState<Array<{
    index: number;
    original: string[];
    scrambled: string[];
    wordBank: string[];
  }>>([]);
  
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Parse words & generate puzzles
  const parseAndGeneratePuzzles = () => {
    setIsGenerating(true);
    
    // Parse words from textarea
    const parsed = inputText
      .split("\n")
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length > 0 && /^[A-Z]+$/.test(w)); // letters only
      
    if (parsed.length === 0) {
      alert("Please enter at least a few valid words (letters only).");
      setIsGenerating(false);
      return;
    }
    
    setWords(parsed);
    
    // Distribute words to pages
    const generated: typeof puzzles = [];
    const wordsPerPage = Math.ceil(parsed.length / numPages);
    
    for (let p = 0; p < numPages; p++) {
      const startIndex = p * wordsPerPage;
      const originalList = parsed.slice(startIndex, startIndex + wordsPerPage);
      
      if (originalList.length === 0) break;
      
      const scrambledList = originalList.map(word => scrambleWord(word, difficulty));
      
      // Shuffle original words for the word bank helper box
      const bankList = [...originalList].sort(() => 0.5 - Math.random());
      
      generated.push({
        index: p + 1,
        original: originalList,
        scrambled: scrambledList,
        wordBank: bankList
      });
    }
    
    setPuzzles(generated);
    setActivePreviewIndex(0);
    setIsGenerating(false);
  };

  // Helper: Scramble letters
  const scrambleWord = (word: string, diff: typeof difficulty) => {
    if (word.length <= 2) return word;
    
    // Easy: Keep first and last letter in place, scramble middle
    if (diff === "easy" && word.length > 3) {
      const first = word[0];
      const last = word[word.length - 1];
      const middle = word.substring(1, word.length - 1).split("");
      
      // shuffle middle
      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }
      
      return first + middle.join("") + last;
    } 
    // Medium / Hard: full shuffle
    else {
      const letters = word.split("");
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      
      return letters.join("");
    }
  };

  // Run on mount
  useEffect(() => {
    parseAndGeneratePuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, numPages]);

  // Export PDF function
  const handleExportPDF = () => {
    if (puzzles.length === 0) return;
    setIsDownloading(true);
    
    setTimeout(async () => {
      let coverState = null;
      if (includeCover) {
        const saved = localStorage.getItem("kdp-cover-draft");
        if (saved) {
          try {
            coverState = JSON.parse(saved);
          } catch (e) {
            console.error("Error loading cover draft", e);
          }
        }
        if (!coverState) {
          alert("No saved cover found! Please design a cover in the Cover Studio first.");
          setIsDownloading(false);
          return;
        }
      }

      // Trim size configurations
      const w = trimSize.w;
      const h = trimSize.h;
      
      // Bleed adjustment
      const bleed = 0.125;
      const pageW = hasBleed ? w + bleed * 2 : w;
      const pageH = hasBleed ? h + bleed * 2 : h;
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [pageW, pageH]
      });
      
      // Safety Margins
      const marginL = 0.75; // Inside/gutter margin
      const marginR = 0.5;
      const marginT = 0.75;
      const marginB = 0.75;
      
      const contentW = pageW - marginL - marginR;
      const contentH = pageH - marginT - marginB;

      // 1. Draw Front Cover if integrated
      let firstPageAdded = false;
      if (includeCover && coverState) {
        // @ts-ignore
        await drawCoverPagePart(doc, coverState, 'front', pageW, pageH);
        firstPageAdded = true;
      }
      
      // 1. Draw Puzzles
      puzzles.forEach((puzzle, pIdx) => {
        if (firstPageAdded || pIdx > 0) doc.addPage();
        firstPageAdded = true;
        
        // Header Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(`Word Scramble #${puzzle.index}`, marginL + contentW / 2, marginT + 0.3, { align: "center" });
        
        // Subtitle instructions
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(
          "Unscramble the letters below and write the correct word in the blank space.",
          marginL + contentW / 2, 
          marginT + 0.6, 
          { align: "center" }
        );
        
        // Divider line
        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(marginL, marginT + 0.8, marginL + contentW, marginT + 0.8);
        
        // Draw Words list
        const listStartY = marginT + 1.2;
        const availableHeight = contentH - 2.2; // leave space for word bank
        const stepY = Math.min(0.55, availableHeight / puzzle.scrambled.length);
        
        puzzle.scrambled.forEach((scrambled, wIdx) => {
          const y = listStartY + wIdx * stepY;
          
          // Number indicator
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(`${wIdx + 1}.`, marginL + 0.2, y);
          
          // Scrambled letters separated by spaces
          const displayScrambled = scrambled.split("").join(" ");
          doc.setFont("courier", "bold");
          doc.setFontSize(13);
          doc.setTextColor(30, 41, 59);
          doc.text(displayScrambled, marginL + 0.6, y);
          
          // Write-in underline
          doc.setDrawColor(148, 163, 184);
          doc.setLineWidth(0.01);
          doc.line(marginL + contentW - 2.5, y + 0.05, marginL + contentW - 0.2, y + 0.05);
        });
        
        // Draw Word Bank if difficulty allows
        if (difficulty !== "hard") {
          const numWords = puzzle.wordBank.length;
          const numRows = Math.ceil(numWords / 3);
          const rowSpacing = 0.22;
          const boxHeight = 0.35 + numRows * rowSpacing;
          const bankStartY = marginT + contentH - boxHeight;
          
          // Word bank container box
          doc.setDrawColor(203, 213, 225); // slate-300
          doc.setFillColor(248, 250, 252); // slate-50
          doc.setLineWidth(0.01);
          doc.roundedRect(marginL + 0.1, bankStartY, contentW - 0.2, boxHeight, 0.1, 0.1, "FD");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229); // indigo-600
          doc.text("WORD BANK", marginL + 0.3, bankStartY + 0.22);
          
          // Render sorted list in columns
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105); // slate-600
          
          const colW = (contentW - 0.6) / 3;
          let row = 0;
          let col = 0;
          
          puzzle.wordBank.forEach((w) => {
            const wx = marginL + 0.3 + col * colW;
            const wy = bankStartY + 0.45 + row * rowSpacing;
            doc.text(w, wx, wy);
            col++;
            if (col >= 3) {
              col = 0;
              row++;
            }
          });
        }
        
        // Footer page numbering
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${pIdx + 1}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      });
      
      // 2. Draw Answer Keys Page
      if (includeAnswers) {
        doc.addPage();
        
        const ansPageIdx = puzzles.length + 1;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("Answer Key", marginL + contentW / 2, marginT + 0.3, { align: "center" });
        
        // Divider line
        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 0.6, marginL + contentW, marginT + 0.6);
        
        // Render 2 or 4 mini-keys per page
        const gridCols = 2;
        const colW = contentW / gridCols;
        
        puzzles.forEach((puzzle, pIdx) => {
          const rowIdx = Math.floor(pIdx / gridCols);
          const colIdx = pIdx % gridCols;
          
          const startX = marginL + colIdx * colW + 0.2;
          const startY = marginT + 1.0 + rowIdx * 2.8;
          
          if (startY + 2.4 > pageH - marginB) {
            // Add page for remaining answer keys if layout overflows
            doc.addPage();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text("Answer Key (Cont.)", marginL + contentW / 2, marginT + 0.3, { align: "center" });
            doc.line(marginL, marginT + 0.6, marginL + contentW, marginT + 0.6);
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(`Puzzle #${puzzle.index}`, startX, startY);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          
          puzzle.original.forEach((origWord, wIdx) => {
            const y = startY + 0.25 + wIdx * 0.18;
            doc.text(`${wIdx + 1}. ${origWord}`, startX, y);
          });
        });
        
        // Footer page numbering for Answer page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${ansPageIdx}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      }

      // 3. Draw Back Cover if integrated
      if (includeCover && coverState) {
        doc.addPage();
        await drawCoverPagePart(doc, coverState, 'back', pageW, pageH);
      }
      
      doc.save(`word-scramble-${difficulty}-${numPages}pages.pdf`);
      setIsDownloading(false);
    }, 50);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
      
      {/* 🔮 Left Customization Options Sidebar */}
      <div className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => router.push("/studio")} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4"/> Back
          </button>
          <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Sliders className="w-3.5 h-3.5"/> Scramble
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Word list input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Word List</label>
              <button 
                onClick={() => setInputText(DEFAULT_WORDS.join("\n"))}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center gap-1"
                title="Reset to defaults"
              >
                <RefreshCw className="w-2.5 h-2.5"/> Default List
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter one word per line..."
              className="w-full h-44 bg-slate-850 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none text-slate-200 resize-none font-mono"
            />
            <p className="text-[10px] text-slate-500 font-medium">Valid characters: A-Z letters only. Spaces & special signs ignored.</p>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Difficulty Modes */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition-all ${
                    difficulty === d
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                      : "bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
              {difficulty === "easy" && "✓ Letter positions hint + Word bank provided."}
              {difficulty === "medium" && "✓ Full scramble + Word bank provided."}
              {difficulty === "hard" && "✓ Full scramble. No word bank. Highly challenging!"}
            </p>
          </div>

          {/* Page Sizing & Count */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Book Trim Size</label>
              <select
                value={trimSize.id}
                onChange={(e) => {
                  const size = TRIM_SIZES.find(s => s.id === e.target.value);
                  if (size) setTrimSize(size);
                }}
                className="w-full text-xs font-bold bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
              >
                {TRIM_SIZES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex justify-between block mb-1.5">
                <span>Number of Pages</span>
                <span className="text-amber-400 font-bold">{numPages}</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={numPages}
                onChange={(e) => setNumPages(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-ew-resize bg-slate-800 rounded-lg h-1.5"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Output Checklist Options */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">Document Settings</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Answer Key Page
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Cover Pages (Add Front & Back cover)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Bleed (+0.125" KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>

        </div>

        {/* Generate / Action buttons */}
        <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <button
            onClick={parseAndGeneratePuzzles}
            disabled={isGenerating}
            className="w-full bg-slate-800 hover:bg-slate-750 text-white py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : "Generate Scramble"}
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isDownloading || puzzles.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Download Print PDF
          </button>

          <CoverStudioCTA trimSize={trimSize.id} />
        </div>
      </div>

      {/* 🎨 Preview Workspace */}
      <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden">
        
        {/* Top Pagination Toolbar */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Preview:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {puzzles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    activePreviewIndex === idx ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  P#{idx + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Trim Size: {trimSize.label} | Words: {words.length}
          </div>
        </div>

        {/* Workspace Canvas Container */}
        <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center relative bg-slate-200/50">
          
          {puzzles.length > 0 && puzzles[activePreviewIndex] ? (
            <div 
              className="relative bg-white shadow-[0_15px_40px_rgba(0,0,0,0.06)] rounded-sm border border-slate-300/80 flex flex-col p-12 overflow-hidden cursor-default transition-all duration-300"
              style={{
                width: "480px", // proportional scaling for viewing
                height: `${480 * (trimSize.h / trimSize.w)}px`,
                paddingTop: "40px",
                paddingBottom: "40px",
                paddingLeft: "45px",
                paddingRight: "30px"
              }}
            >
              {/* Guidelines overlay for visual inspection */}
              {showGuides && (
                <>
                  {/* Inside gutter guidelines */}
                  <div className="absolute top-0 bottom-0 left-0 border-r border-dashed border-rose-400/40 pointer-events-none" style={{ width: "45px" }} />
                  <div className="absolute top-0 bottom-0 right-0 border-l border-dashed border-rose-400/40 pointer-events-none" style={{ width: "30px" }} />
                  <div className="absolute left-0 right-0 top-0 border-b border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  
                  <span className="absolute bottom-1 right-2 text-[8px] font-black text-rose-500 opacity-60">SAFE PRINT AREA</span>
                </>
              )}

              {/* Live Preview Page Content */}
              <div className="flex flex-col h-full justify-between">
                
                {/* Header block */}
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                    Word Scramble #{puzzles[activePreviewIndex].index}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Unscramble and write solutions
                  </p>
                  <div className="h-px bg-slate-100 my-3" />
                </div>

                {/* Scrambled Items List */}
                <div className="flex-1 py-2 flex flex-col justify-around">
                  {puzzles[activePreviewIndex].scrambled.map((scrambled, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 w-4 text-right">{idx + 1}.</span>
                        <span className="font-mono font-bold tracking-[0.25em] text-slate-800 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {scrambled.split("").join(" ")}
                        </span>
                      </div>
                      
                      {/* underline solution indicator */}
                      <div className="w-36 border-b border-slate-300 h-4 mr-2" />
                    </div>
                  ))}
                </div>

                {/* Word Bank Area */}
                {difficulty !== "hard" && (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center mt-3">
                    <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Word Bank</h4>
                    <div className="grid grid-cols-3 gap-y-1.5 gap-x-2 text-[9px] text-slate-600 font-medium text-left px-2">
                      {puzzles[activePreviewIndex].wordBank.map((word, idx) => (
                        <div key={idx} className="truncate select-none">
                          • {word}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Footer page number indicator */}
                <div className="text-center text-[9px] text-slate-300 font-bold tracking-widest pt-2">
                  PAGE {puzzles[activePreviewIndex].index}
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 max-w-sm text-center shadow-md">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-black text-slate-700 text-lg mb-1">No puzzle generated</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Add some words in the left panel and click "Generate Scramble" to preview and download.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
