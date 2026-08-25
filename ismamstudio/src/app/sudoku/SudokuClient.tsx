"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { generateSudoku, generateSudokuBook, Grid, Difficulty } from '../../lib/sudoku';
import DownloadButton from "@/components/DownloadButton";
import { CheckCircle2, BookOpen, Eye, Grid3x3, FileText, Lock, Download, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import GenericStudioTour from "@/components/GenericStudioTour";
import { checkPremiumStatus, getNotebookEntryData, syncMySubscription } from "../actions";
import { exportSudokuToSvg, downloadSvgFile } from "@/lib/svgExporter";
import { loadHeaderFooterPresets, HeaderFooterPreset } from "@/lib/headerFooterPresets";

// Live preview — puzzle grid
function SudokuPreview({
  grid,
  isSolution = false,
  borderThickness = 2,
  fontFamily = "sans-serif",
}: {
  grid: Grid;
  isSolution?: boolean;
  borderThickness?: number;
  fontFamily?: "sans-serif" | "serif" | "monospace";
}) {
  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "monospace"
      ? "font-mono"
      : "font-sans";

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className={`grid grid-cols-9 gap-0 rounded-sm overflow-hidden ${fontClass}`}
        style={{
          border: `${Math.max(2, borderThickness)}px solid #334155`,
        }}
      >
        {grid.flatMap((row, r) =>
          row.map((val, c) => {
            const thickRight = (c + 1) % 3 === 0 && c !== 8;
            const thickBottom = (r + 1) % 3 === 0 && r !== 8;

            return (
              <div
                key={`${r}-${c}`}
                className={`aspect-square flex items-center justify-center text-sm font-bold border border-slate-700/40
                  ${val !== 0
                    ? isSolution
                      ? "text-indigo-400 bg-slate-800/60"
                      : "text-amber-400 bg-slate-800/80"
                    : "bg-slate-900"}
                `}
                style={{
                  borderRightWidth: thickRight ? `${Math.max(2, borderThickness)}px` : undefined,
                  borderRightColor: thickRight ? "#475569" : undefined,
                  borderBottomWidth: thickBottom ? `${Math.max(2, borderThickness)}px` : undefined,
                  borderBottomColor: thickBottom ? "#475569" : undefined,
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SudokuClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generator" | "solution" | "guide">("generator");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [bookCount, setBookCount] = useState(5);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("8.5x11");
  const [currentPuzzle, setCurrentPuzzle] = useState<{ puzzle: Grid; solution: Grid } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [solutionsPerPage, setSolutionsPerPage] = useState<number>(4);
  const [includeCover, setIncludeCover] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Advanced Styling & Brand Presets
  const [borderThickness, setBorderThickness] = useState<number>(2);
  const [fontFamily, setFontFamily] = useState<"sans-serif" | "serif" | "monospace">("sans-serif");
  const [headerText, setHeaderText] = useState("SUDOKU CHALLENGE");
  const [footerText, setFooterText] = useState("KDPage Studio • All Rights Reserved");
  const [presets, setPresets] = useState<HeaderFooterPreset[]>([]);

  useEffect(() => {
    setPresets(loadHeaderFooterPresets());
  }, []);

  const handleDownloadSvgVector = () => {
    let puzzleGrid = currentPuzzle?.puzzle;
    if (!puzzleGrid) {
      const generated = generateSudoku(difficulty);
      puzzleGrid = generated.puzzle;
      setCurrentPuzzle(generated);
    }
    const svgContent = exportSudokuToSvg(puzzleGrid, {
      borderThickness,
      fontFamily,
      headerText,
      footerText,
    });
    downloadSvgFile(svgContent, `sudoku-${difficulty}-vector.svg`);
  };

  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  const [premiumStatus, setPremiumStatus] = useState<{
    checked: boolean;
    isPremium: boolean;
    plan: string;
    limits?: {
      tier: number;
      brands: number;
      aiChapters: number;
      puzzles: string[];
      maxBookCount: number;
    };
  }>({ checked: false, isPremium: false, plan: "free" });

  const isPro = Boolean(premiumStatus.isPremium || user?.publicMetadata?.isPremium);

  // True when this page was opened to restore a saved My Notebook entry, so
  // the plan-based defaults below don't clobber the restored settings.
  const isRestoringRef = useRef(
    typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("notebookId")
  );

  const loadPremium = async () => {
    try {
      const res = await checkPremiumStatus();
      setPremiumStatus(res as any);
      if (isRestoringRef.current) return;
      if (res.plan === "free") {
        setDifficulty("easy");
        setBookCount(5);
      } else if (res.plan === "starter") {
        setDifficulty("medium");
        setBookCount(20);
      } else {
        setDifficulty("hard");
        setBookCount(50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPremium();
  }, [user]);

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
      await syncMySubscription();
      await loadPremium();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Restore a saved My Notebook entry (via /sudoku?notebookId=...).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const notebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (!notebookId) return;

    getNotebookEntryData(notebookId)
      .then((res) => {
        if (!res.success || !res.data) return;
        const d: any = res.data;
        if (d.difficulty) setDifficulty(d.difficulty);
        if (typeof d.bookCount === "number") setBookCount(d.bookCount);
        if (d.trimSize) setTrimSize(d.trimSize);
        if (typeof d.includeSolutions === "boolean") setIncludeSolutions(d.includeSolutions);
        if (typeof d.solutionsPerPage === "number") setSolutionsPerPage(d.solutionsPerPage);
        if (typeof d.includeCover === "boolean") setIncludeCover(d.includeCover);
        if (typeof d.borderThickness === "number") setBorderThickness(d.borderThickness);
        if (d.fontFamily) setFontFamily(d.fontFamily);
        if (typeof d.headerText === "string") setHeaderText(d.headerText);
        if (typeof d.footerText === "string") setFooterText(d.footerText);
      })
      .catch((err) => console.error("Failed to load notebook entry:", err));
  }, []);

  const maxPuzzles =
    isPro ? 50 :
      premiumStatus.plan === "starter" ? 20 :
        premiumStatus.plan === "agency" ? 500 :
          5;

  const handleBookCountChange = (val: number) => {
    let count = Math.max(1, val);
    if (premiumStatus.checked && count > maxPuzzles) {
      count = maxPuzzles;
    }
    setBookCount(count);
  };

  const handlePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateSudoku(difficulty);
      setCurrentPuzzle(result);
      setIsGenerating(false);
    }, 50);
  };

  // Fetches plan status fresh rather than trusting whatever `premiumStatus`
  // happened to hold at render time
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
    plan === "free" ? 5 :
      plan === "starter" ? 20 :
        plan === "pro" ? 50 :
          500;

  const handleDownloadPdf = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed?: boolean;
    showGuides?: boolean;
    borderTheme?: import("@/lib/borderThemes").BorderThemeId;
    isPremium?: boolean;
  }) => {
    setIsDownloading(true);
    const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, hasBleed, showGuides, borderTheme } = options;

    const freshStatus = await getFreshPremiumStatus();
    const effectiveIsPro = freshStatus.isPremium || Boolean(user?.publicMetadata?.isPremium) || isOwner;
    const count = Math.min(Math.max(1, bookCount), tierMaxFor(effectiveIsPro ? "pro" : freshStatus.plan));
    const puzzles = generateSudokuBook(count, difficulty);
    const { downloadSudokuPdf } = await import('../../lib/sudoku-pdf');
    await downloadSudokuPdf(
      {
        puzzles,
        difficulty,
        trimSize: finalTrim,
        title: headerText || `Sudoku Puzzle Book`,
        headerText,
        footerText,
        borderThickness,
        fontFamily,
        includeSolutions: incSol,
        solutionsPerPage,
        includeCover: incCover,
        coverState,
        hasBleed,
        showGuides,
        isPremium: effectiveIsPro,
        borderTheme,
      },
      `sudoku-${difficulty}-${count}puzzles.pdf`
    );
    setIsDownloading(false);
  };

  // A genuinely small, fixed-size sample -- always exactly 10 puzzles and
  // never watermarked, regardless of plan. Previously this reused the
  // user-adjustable bookCount and hardcoded isPremium: true, so while
  // bookCount was tier-clamped, the label's promised "10" wasn't actually
  // enforced (it downloaded whatever bookCount currently held).
  const SAMPLE_SUDOKU_COUNT = 10;
  const handleDownloadSample = async () => {
    setIsDownloading(true);
    try {
      const puzzles = generateSudokuBook(SAMPLE_SUDOKU_COUNT, difficulty);
      const { downloadSudokuPdf } = await import('../../lib/sudoku-pdf');
      await downloadSudokuPdf(
        {
          puzzles,
          difficulty,
          trimSize: "6x9",
          title: headerText || `Free Sample Sudoku Book`,
          headerText,
          footerText,
          borderThickness,
          fontFamily,
          includeSolutions: true,
          solutionsPerPage,
          includeCover: false,
          coverState: null,
          isPremium: true,
        },
        `sudoku-${difficulty}-free-sample.pdf`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: "generator", label: "Puzzle Creator", icon: Grid3x3 },
    { id: "solution", label: "Solution View", icon: Eye },
    { id: "guide", label: "KDP Guide", icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-slate-400 hover:text-amber-500 text-sm mb-4 transition-colors"
            >
              ← Back to Home
            </button>
            <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
              Sudoku Book Studio
            </h1>
            <p className="text-slate-400 text-sm font-semibold">
              Compile print-ready Sudoku puzzle collections for Amazon KDP. Customize difficulty levels and export standard trims.
            </p>
          </div>
          <GenericStudioTour tourKey="sudoku" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-900 pb-4 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === id
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Pro Active Status Card */}
        {isPro ? (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                  Pro Studio Active • Watermark-Free Mode
                </p>
                <p className="text-xs text-slate-400 font-semibold">
                  Full 300 DPI vector PDF manuscript export with zero watermarks is unlocked.
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 shrink-0">
              ✓ 50 Puzzles Batch Enabled
            </span>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">Free Tier Mode (Watermarked & 5 Puzzles)</p>
                <p className="text-[11px] text-slate-500">Have a subscription or trial? Click sync to refresh.</p>
              </div>
            </div>
            <button
              onClick={handleSyncStatus}
              disabled={isSyncing}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Subscription"}
            </button>
          </div>
        )}

        {/* ── GENERATOR TAB ──────────────────────────────────────── */}
        {activeTab === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Settings panel */}
            <div className="space-y-5">

              {/* Difficulty */}
              <div data-tour="difficulty-select" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900">
                <h2 className="text-lg font-bold mb-4 text-amber-300">Difficulty</h2>
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                    const isLocked =
                      premiumStatus.limits
                        ? !premiumStatus.limits.puzzles.includes(d)
                        : (d !== "easy");

                    return (
                      <button
                        key={d}
                        disabled={isLocked && premiumStatus.checked}
                        onClick={() => !isLocked && setDifficulty(d)}
                        className={`relative py-3 rounded-lg font-semibold capitalize transition flex items-center justify-center gap-1.5 ${difficulty === d
                            ? "bg-amber-500 text-slate-950"
                            : isLocked
                              ? "bg-slate-900/40 text-slate-600 border border-slate-900/30 cursor-not-allowed"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                      >
                        {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                        {d}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  {difficulty === "easy" && "~40 numbers shown — good for beginners"}
                  {difficulty === "medium" && "~32 numbers shown — balanced challenge"}
                  {difficulty === "hard" && "~26 numbers shown — for experienced solvers"}
                </p>
              </div>

              {/* Book settings */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900 space-y-4">
                <h2 className="text-lg font-bold text-amber-300">Book Settings</h2>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Number of puzzles
                    <span className="ml-2 text-xs text-slate-500">
                      {premiumStatus.plan === "free" ? "(Free limit: 5)" : premiumStatus.plan === "starter" ? "(Starter limit: 20)" : premiumStatus.plan === "pro" ? "(Pro limit: 50)" : "(Agency limit: 500)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={maxPuzzles}
                    value={bookCount}
                    onChange={(e) => handleBookCountChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Trim size</label>
                  <select
                    value={trimSize}
                    onChange={(e) => setTrimSize(e.target.value as typeof trimSize)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="6x9">6″ × 9″ (most popular)</option>
                    <option value="8.5x11">8.5″ × 11″ (large print)</option>
                    <option value="5x8">5″ × 8″ (compact)</option>
                  </select>
                </div>

                {/* Solution toggle */}
                <div data-tour="solution-layout" className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-bold text-slate-300">Include solution pages</p>
                    <p className="text-xs text-slate-500">Answer key appended after all puzzles</p>
                  </div>
                  <button
                    onClick={() => setIncludeSolutions(!includeSolutions)}
                    className={`relative w-12 h-6 rounded-full transition-all ${includeSolutions ? "bg-amber-500" : "bg-slate-700"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${includeSolutions ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {includeSolutions && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Solutions per page</label>
                    <select
                      value={solutionsPerPage}
                      onChange={(e) => setSolutionsPerPage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value={1}>1 solution per page (Large)</option>
                      <option value={2}>2 solutions per page (Compact)</option>
                      <option value={4}>4 solutions per page (Standard 2×2)</option>
                    </select>
                  </div>
                )}

                {/* Cover toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div>
                    <p className="text-sm font-bold text-slate-300">Include Cover Pages</p>
                    <p className="text-xs text-slate-500">Adds saved Front & Back cover to PDF</p>
                  </div>
                  <button
                    onClick={() => setIncludeCover(!includeCover)}
                    className={`relative w-12 h-6 rounded-full transition-all ${includeCover ? "bg-amber-500" : "bg-slate-700"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${includeCover ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Advanced Styling & Branding Presets Panel */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900 space-y-4">
                <h2 className="text-lg font-bold text-indigo-400">Styling & Brand Presets</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Grid Border Width</label>
                    <select
                      value={borderThickness}
                      onChange={(e) => setBorderThickness(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value={1}>1px (Thin)</option>
                      <option value={2}>2px (Standard)</option>
                      <option value={3}>3px (Medium)</option>
                      <option value={4}>4px (Thick)</option>
                      <option value={5}>5px (Bold)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="sans-serif">Sans-Serif (Clean)</option>
                      <option value="serif">Serif (Classic Book)</option>
                      <option value="monospace">Monospace (Technical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Header Title</label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. DAILY SUDOKU PUZZLE"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Footer Copyright Line</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g. Published by Acme Books • Page 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                {presets.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Apply Saved Preset</label>
                    <select
                      onChange={(e) => {
                        const found = presets.find((p) => p.id === e.target.value);
                        if (found) {
                          setHeaderText(found.headerText);
                          setFooterText(found.footerText);
                          setFontFamily(found.fontFamily);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-indigo-300"
                    >
                      <option value="">-- Choose Brand Preset --</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 border border-slate-700"
              >
                {isGenerating ? "Generating..." : "Preview Single Puzzle"}
              </button>

              <div data-tour="export-pdf">
                <DownloadButton
                  onClick={() => setIsExportModalOpen(true)}
                  label={
                    isDownloading
                      ? "Compiling PDF..."
                      : `Download ${bookCount} Puzzle${bookCount !== 1 ? "s" : ""} PDF`
                  }
                />
              </div>

              {/* Vector SVG Exporter Button */}
              <button
                onClick={handleDownloadSvgVector}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Download SVG Vector (For Canva & Illustrator)
              </button>

              <button
                onClick={handleDownloadSample}
                disabled={isDownloading}
                className="w-full bg-slate-900/80 hover:bg-slate-900 text-amber-400 font-bold py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download 10 Free Sample Puzzles PDF (Vector 300 DPI)
              </button>

              {/* Summary badge */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 text-xs text-slate-500 font-semibold">
                📄 PDF will contain <span className="text-amber-400 font-black">{bookCount}</span> puzzle page{bookCount !== 1 ? "s" : ""}
                {includeSolutions && (
                  <> + <span className="text-indigo-400 font-black">{bookCount}</span> solution page{bookCount !== 1 ? "s" : ""}</>
                )}
                {" "}= <span className="text-white font-black">{bookCount * (includeSolutions ? 2 : 1)}</span> total pages
              </div>

              <SaveToNotebookButton
                title={`Sudoku Collection (${bookCount} Puzzles)`}
                content={`Sudoku interior with ${bookCount} ${difficulty} puzzles, trim size ${trimSize}${includeSolutions ? `, solutions ${solutionsPerPage} per page` : ", no solutions"}.`}
                category="sudoku"
                data={{ difficulty, bookCount, trimSize, includeSolutions, solutionsPerPage, includeCover, borderThickness, fontFamily, headerText, footerText }}
                className="w-full justify-center"
              />

              <CoverStudioCTA trimSize={trimSize} />
            </div>

            {/* Preview panel */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-300">Live Preview — Puzzle</h2>
              {currentPuzzle ? (
                <SudokuPreview grid={currentPuzzle.puzzle} isSolution={false} borderThickness={borderThickness} fontFamily={fontFamily} />
              ) : (
                <div className="aspect-square flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl flex-1 min-h-[300px] flex-col gap-3">
                  <Grid3x3 className="w-10 h-10 text-slate-700" />
                  <span>Click "Preview Single Puzzle" to see a sample</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SOLUTION TAB ───────────────────────────────────────── */}
        {activeTab === "solution" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-indigo-300 mb-1">Solution Key Preview</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Preview the full answer grid for any generated puzzle. Solution pages are printed in indigo in the exported PDF.
                </p>
              </div>

              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate New Puzzle + Solution"}
              </button>

              {currentPuzzle && (
                <div className="bg-slate-950/40 border border-indigo-500/20 rounded-xl p-4 text-xs text-slate-400 space-y-1 font-semibold">
                  <p className="text-indigo-300 font-black uppercase tracking-wider text-[10px]">About this solution</p>
                  <p>✓ Mathematically unique — only one valid solution exists</p>
                  <p>✓ Generated with a backtracking constraint solver</p>
                  <p>✓ Indigo numbers in the PDF identify answer-key cells</p>
                </div>
              )}

              <div className="border-t border-slate-900 pt-4">
                <p className="text-xs text-slate-500 font-semibold mb-3">Solution pages in your PDF export:</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-bold">Include solution pages</span>
                  <button
                    onClick={() => setIncludeSolutions(!includeSolutions)}
                    className={`relative w-12 h-6 rounded-full transition-all ${includeSolutions ? "bg-amber-500" : "bg-slate-700"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${includeSolutions ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Solution grid preview */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-indigo-300">Solution Grid</h2>
              {currentPuzzle ? (
                <SudokuPreview grid={currentPuzzle.solution} isSolution={true} borderThickness={borderThickness} fontFamily={fontFamily} />
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-indigo-900/50 rounded-xl flex-1 min-h-[300px] gap-3">
                  <Eye className="w-10 h-10 text-indigo-900" />
                  <span>Generate a puzzle to see its solution</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── KDP GUIDE TAB ──────────────────────────────────────── */}
        {activeTab === "guide" && (
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-900 space-y-8 animate-fade-in text-slate-300 text-sm leading-relaxed font-semibold">

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> KDP Sudoku Trim Guidelines
              </h3>
              <p>When publishing puzzle books on Amazon KDP, layout sizes and spacing dictate your book rejection rate. Follow these standard specifications:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li><strong>8.5″ × 11″ (Large Print)</strong>: Best for senior citizens or younger children. Keeps grid squares large enough for comfortable writing.</li>
                <li><strong>6″ × 9″ (Standard Pocket)</strong>: Perfect for travel booklets and quick-solve challenge books. Highly popular.</li>
                <li><strong>5″ × 8″ (Compact)</strong>: Smaller purse/pocket size for on-the-go solvers.</li>
                <li><strong>Gutter Margin</strong>: Our Sudoku PDF generator leaves exactly 0.5″ of safety gutter so grids are not lost in the book fold.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Solution Page Strategy
              </h3>
              <p>Every professional Sudoku book includes an answer key. KDPage automatically appends all solution pages <strong>after</strong> the puzzle pages — exactly how Amazon reviewers and readers expect to find them. Toggle this on/off in the book settings.</p>
              <p className="text-slate-400">For a 100-puzzle book with solutions, your final PDF will be <strong>200 pages</strong> — factor this into your spine width calculation in the Cover Studio.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Print Quality Specs
              </h3>
              <p>All exported PDFs are constructed as high-resolution <strong>vector graphics</strong>. This guarantees that puzzle lines, numbers, and grid boundaries remain perfectly sharp without pixelation during commercial printing.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> How to Launch Your Sudoku Book
              </h3>
              <ol className="list-decimal list-inside pl-4 space-y-2 text-slate-400 font-bold">
                <li>Configure difficulty, puzzle count, and trim size. Toggle solution pages on. Click <strong>Download PDF</strong>.</li>
                <li>Note the total page count displayed in the summary badge below the download button.</li>
                <li>Open the <strong>KDPage Cover Canvas</strong>, insert your page count to auto-calculate spine width, then design your covers.</li>
                <li>Upload both files to Amazon KDP with niche keywords (e.g., "large print sudoku for seniors") and set your royalty price.</li>
              </ol>
            </section>

          </div>
        )}
      </div>

      <ExportInteriorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTrimSize={trimSize}
        onExport={handleDownloadPdf}
      />
    </div>
  );
}
