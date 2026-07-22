"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, RefreshCw, AlertCircle, FileText, CheckCircle2, Sliders, Settings, BookOpen
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import { generateKakuro, KakuroPuzzle } from "@/lib/kakuro";
import { downloadKakuroPdf } from "@/lib/kakuro-pdf";
import { checkPremiumStatus } from "@/app/actions";

const TRIM_SIZES = [
  { id: "6x9", label: "6\" x 9\" (Novel)", w: 6, h: 9 },
  { id: "8.5x11", label: "8.5\" x 11\" (Large Print)", w: 8.5, h: 11 },
  { id: "5x8", label: "5\" x 8\" (Compact)", w: 5, h: 8 }
];

export default function KakuroGenerator() {
  const router = useRouter();

  // Settings
  const [sizeId, setSizeId] = useState<string>("6x6");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [numPages, setNumPages] = useState<number>(5);
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [includeCover, setIncludeCover] = useState<boolean>(false);

  // Preview puzzle state
  const [previewPuzzle, setPreviewPuzzle] = useState<{ puzzle: KakuroPuzzle; solution: KakuroPuzzle } | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

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

  const handleGeneratePreview = () => {
    setIsGenerating(true);
    try {
      const sol = generateKakuro(sizeId, difficulty);
      const puz = JSON.parse(JSON.stringify(sol)) as KakuroPuzzle;
      puz.grid.forEach(row => {
        row.forEach(cell => {
          if (cell.type === "white" && !cell.displayValue) {
            delete cell.value;
          }
        });
      });
      setPreviewPuzzle({ puzzle: puz, solution: sol });
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    handleGeneratePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeId, difficulty]);

  const handleDownload = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
  }) => {
    const { includeCover: incCover, coverState, includeSolutions, trimSize: finalTrimSize } = options;
    setIsDownloading(true);
    try {
      const generatedPuzzles: { puzzle: KakuroPuzzle; solution: KakuroPuzzle }[] = [];
      for (let p = 0; p < numPages; p++) {
        const sol = generateKakuro(sizeId, difficulty);
        const puz = JSON.parse(JSON.stringify(sol)) as KakuroPuzzle;
        puz.grid.forEach(row => {
          row.forEach(cell => {
            if (cell.type === "white" && !cell.displayValue) {
              delete cell.value;
            }
          });
        });
        generatedPuzzles.push({ puzzle: puz, solution: sol });
      }

      await downloadKakuroPdf({
        puzzles: generatedPuzzles,
        difficulty,
        trimSize: finalTrimSize,
        title: "Kakuro",
        includeSolutions: includeSolutions,
        includeCover: incCover,
        coverState,
        isPremium: premiumStatus.isPremium
      }, `Kakuro_${sizeId}_${difficulty}_${numPages}_Pages.pdf`);
    } catch (e) {
      console.error(e);
    }
    setIsDownloading(false);
    setIsExportModalOpen(false);
  };

  const previewItem = previewPuzzle;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-8 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[130px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/tools")}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] shadow-inner group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Kakuro Puzzle Generator <span className="bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">Premium</span>
              </h1>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-0.5">
                Generate high-quality crossword-style arithmetic puzzles compliant with KDP margin bounds.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-black rounded-2xl text-xs transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2 border border-indigo-500/20"
            style={{ boxShadow: "var(--shadow-glow-primary)" }}
          >
            <Download className="w-4 h-4" /> Download PDF Interior
          </button>
        </div>

        {/* Dashboard Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings Console (Cols: 4) */}
          <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 rounded-[2rem] space-y-6" style={{ boxShadow: "var(--shadow-soft-lg)" }}>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Generator Console</h2>
            </div>

            {/* Grid Size Select */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Grid Size</label>
              <select
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:border-indigo-500 outline-none transition-colors duration-200"
              >
                <option value="4x4">4x4 Grid (Standard)</option>
                <option value="6x6">6x6 Grid (Medium)</option>
                <option value="8x8">8x8 Grid (Large)</option>
                <option value="9x11">9x11 Grid (Book size)</option>
                <option value="9x17">9x17 Grid (Giant)</option>
              </select>
            </div>

            {/* Difficulty Level select */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Difficulty Level</label>
              <div className="grid grid-cols-2 gap-2">
                {["easy", "intermediate", "hard", "challenging", "expert"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2.5 rounded-2xl text-xs font-black capitalize transition-all duration-200 ease-out active:scale-[0.97] ${
                      difficulty === d
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                        : "bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Print Settings (Trim size) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Print & PDF Sizing</h3>
              </div>

              {/* Trim Size Select */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Book Trim Size</label>
                <select
                  value={trimSize.id}
                  onChange={(e) => setTrimSize(TRIM_SIZES.find(t => t.id === e.target.value) || TRIM_SIZES[0])}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:border-indigo-500 outline-none transition-colors duration-200"
                >
                  {TRIM_SIZES.map((size) => (
                    <option key={size.id} value={size.id}>{size.label}</option>
                  ))}
                </select>
              </div>

              {/* Pages count input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Number of Pages</label>
                  <span className="text-[10px] font-black text-indigo-400">
                    {premiumStatus.isPremium ? "Premium: Unlimited (Max 1000)" : "Free Limit: 5"}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={premiumStatus.isPremium ? 1000 : 5}
                  value={numPages}
                  onChange={(e) => {
                    let val = Math.max(1, parseInt(e.target.value) || 1);
                    const maxLimit = premiumStatus.isPremium ? 1000 : 5;
                    if (val > maxLimit) val = maxLimit;
                    setNumPages(val);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-indigo-400 focus:border-indigo-500 outline-none transition-colors duration-200"
                />
              </div>

              {/* Show Solutions Toggle */}
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-2xl border border-slate-800/50">
                <div>
                  <label className="text-xs font-black text-slate-300 block">Include Solutions</label>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Append answers at back</span>
                </div>
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => handleGeneratePreview()}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 ease-out active:scale-[0.97] shadow"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> Refresh Preview Grid
            </button>
          </div>

          {/* Canvas Previewer (Cols: 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Realtime Canvas */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center justify-between min-h-[580px] relative" style={{ boxShadow: "var(--shadow-soft-lg)" }}>

              {/* Guides layout visual overlay */}
              {showGuides && (
                <div className="absolute inset-8 border border-dashed border-slate-800/40 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="absolute top-2 left-2 text-[8px] font-black uppercase text-slate-600 tracking-wider">KDP Margins Margin Safe</span>
                </div>
              )}

              {/* Upper Pagination */}
              <div className="flex justify-between items-center w-full relative z-10">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                  Previewing Random Grid Layout
                </div>
                <button
                  onClick={handleGeneratePreview}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} /> Refresh Preview
                </button>
              </div>

              {/* The Kakuro Grid Preview */}
              {previewItem ? (
                <div className="my-8 flex flex-col items-center gap-6 w-full">
                  <div
                    className="grid gap-0 border-[3.5px] border-slate-900 bg-slate-900 rounded-xl overflow-hidden"
                    style={{
                      boxShadow: "var(--shadow-soft-lg)",
                      gridTemplateRows: `repeat(${previewItem.puzzle.rows}, minmax(0, 1fr))`,
                      gridTemplateColumns: `repeat(${previewItem.puzzle.cols}, minmax(0, 1fr))`,
                      width: "100%",
                      maxWidth: sizeId === "9x17" ? "240px" : "320px",
                      aspectRatio: `${previewItem.puzzle.cols}/${previewItem.puzzle.rows}`
                    }}
                  >
                    {previewItem.puzzle.grid.map((row, r) =>
                      row.map((cell, c) => {
                        if (cell.type === "white") {
                          const val = cell.displayValue;
                          return (
                            <div
                              key={`${r}-${c}`}
                              className="interactive-cell aspect-square border border-slate-200 flex items-center justify-center text-xs md:text-sm font-bold text-slate-800 bg-white select-none"
                            >
                              {val || ""}
                            </div>
                          );
                        } else {
                          const hasRow = cell.rowClue !== undefined;
                          const hasCol = cell.colClue !== undefined;
                          const hasClues = hasRow || hasCol;

                          return (
                            <div
                              key={`${r}-${c}`}
                              className="aspect-square bg-slate-800 border border-slate-900 relative overflow-hidden flex items-center justify-center"
                            >
                              {hasClues && (
                                <>
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <line x1="0" y1="0" x2="100" y2="100" stroke="#475569" strokeWidth="2.5" />
                                  </svg>

                                  {hasRow && (
                                    <span className="absolute top-0.5 right-1 text-[8px] md:text-[9px] font-black text-slate-100 leading-none">
                                      {cell.rowClue}
                                    </span>
                                  )}

                                  {hasCol && (
                                    <span className="absolute bottom-0.5 left-1 text-[8px] md:text-[9px] font-black text-slate-100 leading-none">
                                      {cell.colClue}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        }
                      })
                    )}
                  </div>

                  {/* Rules and guidelines description */}
                  <div className="max-w-md text-center bg-slate-950/40 p-4 border border-slate-800/50 rounded-2xl flex gap-2.5 items-start">
                    <BookOpen className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 font-semibold text-left leading-relaxed">
                      <strong>Kakuro Guidelines:</strong> Kakuro is like a crossword puzzle with numbers. Each &quot;word&quot; must add up to the number provided in the clue above it or to the left. Words can only use the numbers 1 through 9, and a given number can only be used once in a word. Every kakuro puzzle has one and only solution, and can be solved through logic alone.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 font-black uppercase text-xs tracking-widest my-20">Click refresh to load templates</div>
              )}

              {/* Lower Options Panel */}
              <div className="flex gap-4 relative z-10 w-full">
                <button
                  onClick={() => setShowGuides(prev => !prev)}
                  className={`flex-1 py-3 border rounded-2xl text-xs font-black transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
                    showGuides
                      ? "bg-slate-900 border-indigo-500/35 text-indigo-400"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  {showGuides ? "HIDE PRINT MARGINS" : "SHOW PRINT MARGINS"}
                </button>
              </div>
            </div>

            {/* Quick Actions / Cover Studio Link */}
            <CoverStudioCTA />
          </div>

        </div>
      </div>

      {/* Export modal and pdf settings */}
      {isExportModalOpen && (
        <ExportInteriorModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          defaultTrimSize={trimSize.id as any}
          onExport={handleDownload}
        />
      )}
    </div>
  );
}
