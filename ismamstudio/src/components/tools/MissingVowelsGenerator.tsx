"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Type,
  ListPlus,
  HelpCircle,
  FileText,
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getClientSafePremiumStatus } from "@/lib/clientAuth";
import { KDP_TRIM_SIZES, KdpTrimSize } from "@/lib/kdpTrimSizes";
import {
  MissingVowelsWorksheet,
  MISSING_VOWELS_THEMES,
  generateMissingVowelsBook,
  maskVowels,
} from "@/lib/missingVowelsEngine";
import { exportMissingVowelsBookPdf } from "@/lib/missingVowelsPdfExporter";

export default function MissingVowelsGenerator() {
  const router = useRouter();

  // Premium status
  const [premiumStatus, setPremiumStatus] = useState({
    checked: false,
    isPremium: false,
    plan: "free",
  });
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getClientSafePremiumStatus();
        setPremiumStatus(res as any);
      } catch (e) {
        console.error("Auth check error:", e);
      }
    }
    checkAuth();
  }, []);

  // Settings
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(-1); // -1 = Mixed Themes
  const [maskMode, setMaskMode] = useState<"guided_blanks" | "pure_consonants" | "partial_blanks">(
    "guided_blanks"
  );
  const [wordsPerPage, setWordsPerPage] = useState<number>(8);
  const [useCustomWords, setUseCustomWords] = useState<boolean>(false);
  const [customWordsText, setCustomWordsText] = useState<string>(
    "ASTRONOMY\nBUTTERFLY\nCHOCOLATE\nDICTIONARY\nEVERGREEN\nFLAMINGO\nGLADIATOR\nHURRICANE"
  );

  // Book Options
  const [trimSize, setTrimSize] = useState<KdpTrimSize>(KDP_TRIM_SIZES[0]);
  const [bookPageCount, setBookPageCount] = useState<number>(20);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [bookTitle, setBookTitle] = useState<string>("Missing Vowels Puzzle Book");
  const [authorName, setAuthorName] = useState<string>("");
  const [facingPages, setFacingPages] = useState<boolean>(true);

  // Worksheets list
  const [worksheets, setWorksheets] = useState<MissingVowelsWorksheet[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

  // Interactive Play: solver guesses
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Regenerate book worksheets
  const handleRegenerate = () => {
    let customList: string[] | undefined = undefined;
    if (useCustomWords && customWordsText.trim()) {
      customList = customWordsText
        .split(/[\n,;]+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);
    }

    if (!useCustomWords && selectedThemeIndex >= 0) {
      // Single specific theme selected
      const theme = MISSING_VOWELS_THEMES[selectedThemeIndex];
      const pages = Math.max(1, Math.min(bookPageCount, Math.ceil(theme.words.length / wordsPerPage)));
      const customPicks = theme.words.map((item) => item.word);
      const list = generateMissingVowelsBook(pages, wordsPerPage, maskMode, customPicks);
      // Retain the theme name
      list.forEach((ws, i) => {
        ws.title = `${theme.name} #${i + 1}`;
        ws.category = theme.category;
      });
      setWorksheets(list);
    } else {
      const list = generateMissingVowelsBook(bookPageCount, wordsPerPage, maskMode, customList);
      setWorksheets(list);
    }

    setActivePageIndex(0);
    setUserAnswers({});
    setShowSolutions(false);
  };

  useEffect(() => {
    handleRegenerate();
  }, [selectedThemeIndex, maskMode, wordsPerPage, useCustomWords]);

  const currentWorksheet = useMemo(() => {
    return worksheets[activePageIndex] || worksheets[0];
  }, [worksheets, activePageIndex]);

  // Answer change handler
  const handleAnswerChange = (itemId: string, val: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [itemId]: val.toUpperCase(),
    }));
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (worksheets.length === 0) return;
    setIsExporting(true);
    setExportProgress(5);

    try {
      const pdf = await exportMissingVowelsBookPdf(
        worksheets,
        {
          trimSize,
          includeSolutions,
          bookTitle,
          authorName: authorName.trim() || undefined,
          showPageNumbers: true,
          facingPages,
        },
        (progress) => setExportProgress(progress)
      );

      const fileName = `${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(trimSize.id || "8.5x11").replace(
        /\s+/g,
        ""
      )}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF. Please check settings and try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <Type className="w-5 h-5 text-indigo-400" />
                  Missing Vowels Studio
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  Vocabulary & Brain Teasers
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Create & export professional KDP missing vowels activity books with solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SaveToNotebookButton
              category="missing-vowels"
              title={bookTitle}
              content={`${worksheets.length} missing vowels worksheets - ${currentWorksheet?.category || "Vocabulary"}`}
              data={{
                bookTitle,
                authorName,
                pageCount: worksheets.length,
                trimSize: trimSize.id,
              }}
            />
            <button
              onClick={handleExportPdf}
              disabled={isExporting || worksheets.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Exporting ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export 300 DPI PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Controls & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Worksheets & Mode Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Puzzle Configuration
            </h2>

            {/* Custom Words Toggle */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs font-medium text-slate-300">Custom Word Bank</span>
              <button
                onClick={() => setUseCustomWords(!useCustomWords)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  useCustomWords
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {useCustomWords ? "Enabled" : "Themes"}
              </button>
            </div>

            {useCustomWords ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>Enter Words / Phrases (comma or newline separated):</span>
                  <span className="text-indigo-400 text-[10px]">Auto-masked</span>
                </label>
                <textarea
                  value={customWordsText}
                  onChange={(e) => setCustomWordsText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="ELEPHANT&#10;GIRAFFE&#10;KANGAROO"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Curated KDP Theme Niche:</label>
                <select
                  value={selectedThemeIndex}
                  onChange={(e) => setSelectedThemeIndex(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={-1}>🌟 All Themes Mixed (Recommended for Variety)</option>
                  {MISSING_VOWELS_THEMES.map((thm, idx) => (
                    <option key={thm.name} value={idx}>
                      {thm.name} ({thm.category}) - {thm.words.length} words
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Masking Style */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Vowel Masking Mode:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMaskMode("guided_blanks")}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    maskMode === "guided_blanks"
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold">_ L _ P H _ N T</div>
                  <div className="text-[10px] text-slate-400">Guided Blanks</div>
                </button>
                <button
                  onClick={() => setMaskMode("pure_consonants")}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    maskMode === "pure_consonants"
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold">L P H N T</div>
                  <div className="text-[10px] text-slate-400">Pure Consonants</div>
                </button>
                <button
                  onClick={() => setMaskMode("partial_blanks")}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    maskMode === "partial_blanks"
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold">E L _ P H A N _</div>
                  <div className="text-[10px] text-slate-400">Kids / Partial</div>
                </button>
              </div>
            </div>

            {/* Words Per Page */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Words Per Page:</label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 8, 10, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setWordsPerPage(num)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      wordsPerPage === num
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {num} Words
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRegenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Worksheets
            </button>
          </div>

          {/* Book & Print Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              KDP Book Publishing Options
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">KDP Trim Size:</label>
              <select
                value={trimSize.label}
                onChange={(e) => {
                  const found = KDP_TRIM_SIZES.find((t) => t.label === e.target.value);
                  if (found) setTrimSize(found);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {KDP_TRIM_SIZES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label} ({t.width} x {t.height} in)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Total Worksheets Count:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 50, 100].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setBookPageCount(cnt);
                      const list = generateMissingVowelsBook(cnt, wordsPerPage, maskMode);
                      setWorksheets(list);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bookPageCount === cnt
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">Include Solutions Section (Answer Keys)</span>
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div className="text-xs text-slate-300 font-medium">Right & Left Page Layout</div>
                <div className="text-[10px] text-slate-500">Alternating KDP gutter margins for spine binding (Facing Pages)</div>
              </div>
              <input
                type="checkbox"
                checked={facingPages}
                onChange={(e) => setFacingPages(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Book Title (Title Page):</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Author Name (Optional):</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Clever Minds Press"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* KDP Cover Studio CTA */}
          <CoverStudioCTA
            title="Design Matching KDP Cover"
            subtitle="Create a 300 DPI wrap-around paperback cover with custom spine calculations."
          />
        </div>

        {/* Right Main Column: Interactive Worksheet Preview */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Worksheet Navigation Toolbar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activePageIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-slate-300 px-2">
                  Worksheet {activePageIndex + 1} of {worksheets.length || 1}
                </span>
                <button
                  onClick={() =>
                    setActivePageIndex((prev) => Math.min(worksheets.length - 1, prev + 1))
                  }
                  disabled={activePageIndex >= worksheets.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                {currentWorksheet?.category || "Vocabulary"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  showSolutions
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                {showSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSolutions ? "Hide Solutions" : "Reveal Solutions"}</span>
              </button>
              <button
                onClick={() => setUserAnswers({})}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Printable Worksheet Preview Card */}
          <div className="flex-1 bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[640px]">
            {/* Worksheet Header */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {currentWorksheet?.title || "Missing Vowels Puzzle"}
                  </h3>
                  <div className="text-xs font-bold text-indigo-600 tracking-wide uppercase mt-0.5">
                    Category: {currentWorksheet?.category}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-300">
                    Page {activePageIndex + 1}
                  </span>
                </div>
              </div>

              {/* Instructions Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-4 flex items-center gap-2 text-xs text-slate-600">
                <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  {currentWorksheet?.mode === "pure_consonants"
                    ? "All vowels (A, E, I, O, U) have been stripped. Write the complete restored word on the line:"
                    : "Fill in the missing vowels (A, E, I, O, U) to solve each word puzzle:"}
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-4 sm:space-y-5 mt-4">
                {currentWorksheet?.items.map((item, idx) => {
                  const guess = userAnswers[item.id] || "";
                  const isCorrect = guess.trim().toUpperCase() === item.original;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Number & Puzzle Word */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <div className="font-mono text-lg sm:text-xl font-black tracking-wider text-slate-900">
                            {item.puzzle}
                          </div>
                          {item.hint && (
                            <div className="text-xs text-slate-500 italic mt-0.5">
                              Hint: {item.hint}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Interactive Input & Answer Line */}
                      <div className="flex items-center gap-2 sm:w-64">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={showSolutions ? item.original : guess}
                            onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                            disabled={showSolutions}
                            placeholder="Type answer..."
                            className={`w-full font-mono font-bold text-sm tracking-widest px-3 py-1.5 border-b-2 rounded-t transition-colors bg-white focus:outline-none uppercase ${
                              showSolutions
                                ? "border-amber-500 bg-amber-50 text-amber-900"
                                : isCorrect
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : guess.length > 0
                                ? "border-indigo-400 text-slate-800"
                                : "border-slate-300 text-slate-800 focus:border-indigo-600"
                            }`}
                          />
                        </div>
                        {isCorrect && !showSolutions && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Worksheet Footer */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>KDPage Publishing Studio • 300 DPI Print-Ready</span>
              <span>www.kdpage.com</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
