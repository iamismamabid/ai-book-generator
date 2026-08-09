"use client";

import { useState, useEffect } from "react";
import BookVersionHistoryModal from "./BookVersionHistoryModal";
import { BookVersion } from "@/lib/bookVersions";
import { History, Plus, Trash2, FileDown, Copy, BookOpen, Settings2, Sparkles, X, Loader2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, GripVertical, Info } from "lucide-react";
import { motion } from "framer-motion";
import { CrosswordEditor } from "./CrosswordEditor";
import { WordSearchEditor } from "./WordSearchEditor";
import { SudokuEditor } from "./SudokuEditor";
import { MazeEditor } from "./MazeEditor";
import { WordScrambleEditor } from "./WordScrambleEditor";
import { CryptogramEditor } from "./CryptogramEditor";
import { MathPuzzleEditor } from "./MathPuzzleEditor";
import { KakuroEditor } from "./KakuroEditor";
import LowContentEditor from "./LowContentEditor";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import BookBuilderTour from "./BookBuilderTour";
import { exportBookToPDF } from "@/app/utils/pdfExportService";
import { useBookValidation } from "@/hooks/useBookValidation";
import { checkCoverImageResolution, ImageResolutionCheck } from "@/lib/pdfValidator";
import DesktopRecommendedBanner from "@/components/DesktopRecommendedBanner";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';



// Every puzzle editor auto-generates fresh content on mount if this config key
// is missing (see each Editor's `useEffect(() => { if (!x) handleGenerate() }, [])`).
// Duplicate relies on that: it clears the generated field but keeps everything
// else (word list, difficulty, size...), so the new page — mounted fresh under
// a new key — regenerates a genuinely new puzzle with the same settings instead
// of an exact copy. Types not listed (title, low_content) have no randomness to
// regenerate, so they duplicate as-is.
const GENERATED_CONTENT_KEY: Record<string, string> = {
  crossword: 'gridData',
  word_search: 'gridData',
  sudoku: 'gridData',
  maze: 'gridData',
  word_scramble: 'scrambledData',
  cryptogram: 'cryptogramData',
  math_puzzle: 'puzzleData',
  kakuro: 'gridData',
};

const TRIM_SIZES = [
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

export default function BookBuilder({ coverState, initialPages }: { coverState?: any; initialPages?: any[] }) {
  const [bookPages, setBookPages] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Collapsible Sidebars States
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Template Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);


  // Premium Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [includeCover, setIncludeCover] = useState(false);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [gutterMargin, setGutterMargin] = useState(false);
  const [selectedTrim, setSelectedTrim] = useState(TRIM_SIZES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [solutionsStatus, setSolutionsStatus] = useState<'idle' | 'success'>('idle');
  // All puzzle types support N-per-page solution packing
  const [wordSearchSolutionsPerPage, setWordSearchSolutionsPerPage] = useState<1 | 2 | 4>(1);
  const [sudokuSolutionsPerPage, setSudokuSolutionsPerPage] = useState<1 | 2 | 4>(4);
  const [crosswordSolutionsPerPage, setCrosswordSolutionsPerPage] = useState<1 | 2 | 4>(2);
  const [mazeSolutionsPerPage, setMazeSolutionsPerPage] = useState<1 | 2 | 4>(1);
  const [kakuroSolutionsPerPage, setKakuroSolutionsPerPage] = useState<1 | 2 | 4>(2);
  const [wordScrambleSolutionsPerPage, setWordScrambleSolutionsPerPage] = useState<1 | 2 | 4>(2);
  const [cryptogramSolutionsPerPage, setCryptogramSolutionsPerPage] = useState<1 | 2 | 4>(2);
  const [mathPuzzleSolutionsPerPage, setMathPuzzleSolutionsPerPage] = useState<1 | 2 | 4>(4);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, []);

  const getBookSnapshot = () => ({
    pageCount: bookPages.length,
    trimSize: selectedTrim.label,
    bookPages: JSON.parse(JSON.stringify(bookPages)),
  });

  const handleRestoreBookVersion = (ver: BookVersion) => {
    if (ver.bookPages && ver.bookPages.length > 0) {
      setBookPages(ver.bookPages);
      setActiveIndex(0);
    }
  };

  const { isValid, errors, validateBook, clearValidation } = useBookValidation();

  // Validate book whenever pages or export modal state changes
  useEffect(() => {
    if (isExportModalOpen) {
      validateBook(bookPages, { gutterMarginEnabled: gutterMargin });
    } else {
      clearValidation();
    }
  }, [isExportModalOpen, bookPages, gutterMargin, validateBook, clearValidation]);

  // KDP Compliance: check raster cover image resolution whenever the export
  // modal is open with a cover included. Puzzle grids are pure vector so they
  // never need this -- only user-uploaded cover images can be under 300 DPI.
  const [coverDpiChecks, setCoverDpiChecks] = useState<ImageResolutionCheck[]>([]);
  useEffect(() => {
    if (!isExportModalOpen || !includeCover || !coverState) {
      setCoverDpiChecks([]);
      return;
    }
    let cancelled = false;
    checkCoverImageResolution(coverState, selectedTrim.w, selectedTrim.h).then((results) => {
      if (!cancelled) setCoverDpiChecks(results);
    });
    return () => { cancelled = true; };
  }, [isExportModalOpen, includeCover, coverState, selectedTrim]);



  useEffect(() => {
    // Restoring a saved My Notebook entry (via /studio?notebookId=...) takes
    // priority over whatever draft happens to be sitting in localStorage.
    if (initialPages && initialPages.length > 0) {
      setBookPages(initialPages);
      return;
    }
    const saved = localStorage.getItem("kdp-book-draft");
    if (saved) {
      try {
        setBookPages(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved draft", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bookPages.length > 0) {
      localStorage.setItem("kdp-book-draft", JSON.stringify(bookPages));
    }
  }, [bookPages]);

  const addPage = (type: string, initialConfig: any = {}) => {
    const clonedConfig = JSON.parse(JSON.stringify(initialConfig));
    setBookPages([...bookPages, { id: Date.now() + Math.random(), type, config: clonedConfig }]);
    setActiveIndex(bookPages.length);
  };

  // Bulk variant of addPage -- used by editors (e.g. Math Puzzle Builder)
  // that can generate a whole batch of pages at once instead of one at a
  // time. Returns the created page objects (with their real ids) so the
  // calling editor can navigate/edit them individually right after.
  const addMultiplePages = (type: string, configs: any[]) => {
    const newPages = configs.map((cfg) => ({
      id: Date.now() + Math.random(),
      type,
      config: JSON.parse(JSON.stringify(cfg)),
    }));
    setBookPages((prev) => [...prev, ...newPages]);
    return newPages;
  };

  const removePage = (indexToRemove: number) => {
    const updated = bookPages.filter((_, idx) => idx !== indexToRemove);
    setBookPages(updated);
    if (activeIndex >= updated.length && updated.length > 0) {
      setActiveIndex(updated.length - 1);
    }
  };

  const updatePageConfig = (id: number, newConfig: any) => {
    setBookPages(bookPages.map(page =>
      page.id === id ? { ...page, config: newConfig } : page
    ));
  };

  const duplicatePage = (indexToDuplicate: number) => {
    if (indexToDuplicate < 0 || indexToDuplicate >= bookPages.length) return;
    const target = bookPages[indexToDuplicate];
    const clonedConfig = JSON.parse(JSON.stringify(target.config || {}));

    // Strip the generated puzzle content (keeping settings) so the new page
    // regenerates a fresh puzzle instead of an exact copy of this one.
    const contentKey = GENERATED_CONTENT_KEY[target.type];
    if (contentKey) delete clonedConfig[contentKey];

    const newPage = {
      id: Date.now() + Math.random(),
      type: target.type,
      config: clonedConfig
    };
    const updated = [...bookPages];
    updated.splice(indexToDuplicate + 1, 0, newPage);
    setBookPages(updated);
    setActiveIndex(indexToDuplicate + 1);
  };

  const movePageUp = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...bookPages];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setBookPages(updated);
    if (activeIndex === idx) setActiveIndex(idx - 1);
    else if (activeIndex === idx - 1) setActiveIndex(idx);
  };

  const movePageDown = (idx: number) => {
    if (idx >= bookPages.length - 1) return;
    const updated = [...bookPages];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setBookPages(updated);
    if (activeIndex === idx) setActiveIndex(idx + 1);
    else if (activeIndex === idx + 1) setActiveIndex(idx);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = bookPages.findIndex((p) => p.id === active.id);
      const newIndex = bookPages.findIndex((p) => p.id === over.id);

      const updated = arrayMove(bookPages, oldIndex, newIndex);
      setBookPages(updated);

      const activePageId = bookPages[activeIndex]?.id;
      if (activePageId !== undefined) {
        const newActiveIndex = updated.findIndex((p) => p.id === activePageId);
        if (newActiveIndex !== -1) {
          setActiveIndex(newActiveIndex);
        }
      }
    }
  };

  const autoGenerateAllSolutions = () => {
    const newSolPages: any[] = [];
    const puzzleTypes = ['crossword', 'word_search', 'sudoku', 'maze', 'word_scramble', 'cryptogram', 'math_puzzle', 'kakuro'];
    const puzzlePages = bookPages.filter((page) => puzzleTypes.includes(page.type) && !page.config.isSolution);

    const configMap: Record<string, { perPage: 1 | 2 | 4; dataKey: string; extraKeys?: string[] }> = {
      crossword: { perPage: crosswordSolutionsPerPage, dataKey: 'gridData' },
      word_search: { perPage: wordSearchSolutionsPerPage, dataKey: 'gridData' },
      sudoku: { perPage: sudokuSolutionsPerPage, dataKey: 'gridData' },
      kakuro: { perPage: kakuroSolutionsPerPage, dataKey: 'gridData' },
      maze: { perPage: mazeSolutionsPerPage, dataKey: 'gridData' },
      word_scramble: { perPage: wordScrambleSolutionsPerPage, dataKey: 'scrambledData' },
      cryptogram: { perPage: cryptogramSolutionsPerPage, dataKey: 'cryptogramData' },
      math_puzzle: { perPage: mathPuzzleSolutionsPerPage, dataKey: 'puzzleData', extraKeys: ['puzzleType'] },
    };

    const makeSinglePage = (p: any, pageNum: number) => ({
      id: Date.now() + Math.random(),
      type: p.type,
      config: {
        ...JSON.parse(JSON.stringify(p.config)),
        isSolution: true,
        showSolution: true,
        pageNumber: pageNum,
      }
    });

    const makeGroupPage = (type: string, dataKey: string, extraKeys: string[], batch: { p: any; pageNum: number }[]) => ({
      id: Date.now() + Math.random(),
      type,
      config: {
        isSolution: true,
        isMultiSolution: true,
        solutionGroup: batch.map(({ p, pageNum }) => {
          const entry: any = {
            puzzleIndex: pageNum,
            pageNumber: pageNum,
            [dataKey]: JSON.parse(JSON.stringify(p.config[dataKey]))
          };
          extraKeys.forEach(k => { if (p.config[k] !== undefined) entry[k] = p.config[k]; });
          return entry;
        }),
      }
    });

    // Walk the book once and only pack puzzles into a shared solution page
    // when they're the same type AND back-to-back in the book. A puzzle of
    // another type sitting in between breaks the run, so its solution never
    // ends up bundled with (and mislabeled next to) an unrelated page.
    let i = 0;
    while (i < puzzlePages.length) {
      const type = puzzlePages[i].type;
      const spec = configMap[type];
      if (!spec) { i++; continue; }

      const run: { p: any; pageNum: number }[] = [];
      let j = i;
      while (j < puzzlePages.length && puzzlePages[j].type === type) {
        const origIndex = bookPages.findIndex(bPage => bPage.id === puzzlePages[j].id);
        run.push({ p: puzzlePages[j], pageNum: origIndex >= 0 ? origIndex + 1 : j + 1 });
        j++;
      }

      for (let k = 0; k < run.length; k += spec.perPage) {
        const batch = run.slice(k, k + spec.perPage);
        if (spec.perPage === 1) {
          newSolPages.push(makeSinglePage(batch[0].p, batch[0].pageNum));
        } else {
          newSolPages.push(makeGroupPage(type, spec.dataKey, spec.extraKeys || [], batch));
        }
      }

      i = j;
    }

    if (newSolPages.length === 0) {
      alert("No puzzle pages found to generate solutions for.");
      return;
    }

    // Strip out any pre-existing solution pages and append fresh solutions in correct order
    const cleanPages = bookPages.filter(p => !p.config?.isSolution);
    setBookPages([...cleanPages, ...newSolPages]);
    setSolutionsStatus('success');
    setTimeout(() => {
      setSolutionsStatus('idle');
    }, 2000);
  };

  const triggerExport = async () => {
    setIsExporting(true);
    try {
      await exportBookToPDF(bookPages, {
        includeCover,
        coverState,
        includePageNumbers,
        gutterMargin,
        trimSize: selectedTrim
      });
    } catch (e) {
      console.error("Failed to export PDF", e);
      alert("Error compiling PDF: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }
  };

  const toggleLeftSidebar = () => {
    const nextState = !leftOpen;
    setLeftOpen(nextState);
    if (nextState && typeof window !== "undefined" && window.innerWidth < 768) {
      setRightOpen(false);
    }
  };

  const toggleRightSidebar = () => {
    const nextState = !rightOpen;
    setRightOpen(nextState);
    if (nextState && typeof window !== "undefined" && window.innerWidth < 768) {
      setLeftOpen(false);
    }
  };

  const closeSidebarsOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-140px)] bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden relative rounded-3xl border border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300" style={{ boxShadow: "var(--shadow-soft-lg)" }}>

      <div className="absolute top-0 inset-x-0 z-40 rounded-t-3xl overflow-hidden">
        <DesktopRecommendedBanner message="For the best puzzle building experience, we recommend using a laptop or desktop screen." />
      </div>

      {/* Mobile Backdrop Overlay */}
      {(leftOpen || rightOpen) && (
        <div
          onClick={closeSidebarsOnMobile}
          className="md:hidden absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-20 animate-in fade-in-0 duration-200 cursor-pointer"
        />
      )}

      {/* Sidebar Left: Asset Tool buttons */}
      <motion.div
        animate={{ 
          width: leftOpen ? 288 : 0,
          opacity: leftOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between overflow-hidden shrink-0 ${
          leftOpen ? "absolute md:relative left-0 top-0 h-full z-30 shadow-2xl" : "relative"
        }`}
      >
        <div className="w-72 p-5 space-y-6 flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">Content Creator</h2>
                <BookBuilderTour />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                data-tour="add-page-btn"
                className="btn-premium-primary w-full py-4 rounded-2xl normal-case text-sm"
              >
                <Plus className="w-4 h-4" /> Add New Page
              </button>
            </div>
            
            <div className="pt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Autosave & Cloud Sync</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-2.5 h-2.5 text-indigo-400 animate-pulse" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"></circle></svg>
                    <span>Draft Autosaved</span>
                  </div>
                  <button
                    onClick={() => setIsVersionHistoryOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-600/60 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer active:scale-95"
                    title="View named version checkpoints"
                  >
                    <History className="w-3 h-3" /> Versions
                  </button>
                </div>
                <SaveToNotebookButton
                  title={`All-in-One KDP Puzzle Book (${bookPages.length} Pages)`}
                  content={`Complete KDP Activity Book with ${bookPages.length} pages generated in All-in-One Studio.`}
                  subtitle={`Trim: ${selectedTrim} | Total Pages: ${bookPages.length}`}
                  category="puzzle-book"
                  data={{ pagesCount: bookPages.length, pages: bookPages }}
                  className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Bulk Utility Section */}
          <div className="pt-4 border-t border-slate-800 space-y-2" data-tour="solutions-settings">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Solutions Per Page</span>
            {([
              ['Word Search', wordSearchSolutionsPerPage, setWordSearchSolutionsPerPage],
              ['Sudoku', sudokuSolutionsPerPage, setSudokuSolutionsPerPage],
              ['Crossword', crosswordSolutionsPerPage, setCrosswordSolutionsPerPage],
              ['Maze', mazeSolutionsPerPage, setMazeSolutionsPerPage],
              ['Kakuro', kakuroSolutionsPerPage, setKakuroSolutionsPerPage],
              ['Word Scramble', wordScrambleSolutionsPerPage, setWordScrambleSolutionsPerPage],
              ['Cryptogram', cryptogramSolutionsPerPage, setCryptogramSolutionsPerPage],
              ['Math Puzzle', mathPuzzleSolutionsPerPage, setMathPuzzleSolutionsPerPage],
            ] as const).map(([label, val, setter]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <select
                  value={val}
                  onChange={(e) => (setter as (v: 1|2|4) => void)(Number(e.target.value) as 1 | 2 | 4)}
                  className="bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 px-2 py-1 cursor-pointer"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                </select>
              </div>
            ))}
            <button
              onClick={autoGenerateAllSolutions}
              data-tour="auto-solutions-btn"
              className={`w-full py-3 border rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                solutionsStatus === 'success'
                  ? "bg-emerald-500/20 border-emerald-500/35 text-emerald-400"
                  : "bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {solutionsStatus === 'success' ? "✓ Solutions Added!" : "Auto-Build Solutions"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Page Workspace */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative min-w-0">
        
        {/* Sidebar Toggle & Mobile Add Page Buttons */}
        <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between pointer-events-none">
          <button
            onClick={toggleLeftSidebar}
            className="pointer-events-auto p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md cursor-pointer transition text-slate-500 dark:text-slate-400 active:scale-95 flex items-center gap-1.5"
            title={leftOpen ? "Collapse Side Panel" : "Expand Side Panel"}
          >
            {leftOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="md:hidden text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Tools</span>
          </button>

          {/* Mobile Quick Add Page Button in Header */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="pointer-events-auto md:hidden px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition active:scale-95 flex items-center gap-1.5 border border-white/20"
            title="Add New Page"
          >
            <Plus className="w-4 h-4" />
            <span>Add Page</span>
          </button>

          <button
            onClick={toggleRightSidebar}
            className="pointer-events-auto p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md cursor-pointer transition text-slate-500 dark:text-slate-400 active:scale-95 flex items-center gap-1.5"
            title={rightOpen ? "Collapse Outline Panel" : "Expand Outline Panel"}
          >
            <span className="md:hidden text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Pages ({bookPages.length})</span>
            {rightOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {bookPages.length > 0 && bookPages[activeIndex] ? (
          <div className="h-full pt-8">
            {bookPages[activeIndex].config.isMultiSolution && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Combined Answer Key Page
                </p>
                <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                  This page packs {bookPages[activeIndex].config.solutionGroup?.length || 0} answer keys
                  (Page{(bookPages[activeIndex].config.solutionGroup?.length || 0) > 1 ? 's' : ''} {bookPages[activeIndex].config.solutionGroup?.map((s: any) => s.pageNumber ?? s.puzzleIndex).join(', ')})
                  onto one page — generated automatically by "Auto-Build Solutions". Edit the individual
                  puzzle pages instead; this page regenerates from them.
                </p>
              </div>
            )}
            {bookPages[activeIndex].type === 'crossword' && !bookPages[activeIndex].config.isMultiSolution && (
              <CrosswordEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'word_search' && !bookPages[activeIndex].config.isMultiSolution && (
              <WordSearchEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'sudoku' && !bookPages[activeIndex].config.isMultiSolution && (
              <SudokuEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'maze' && !bookPages[activeIndex].config.isMultiSolution && (
              <MazeEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'word_scramble' && !bookPages[activeIndex].config.isMultiSolution && (
              <WordScrambleEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'cryptogram' && !bookPages[activeIndex].config.isMultiSolution && (
              <CryptogramEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'math_puzzle' && !bookPages[activeIndex].config.isMultiSolution && (
              <MathPuzzleEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
                updatePageById={updatePageConfig}
                bulkAddPages={(configs: any[]) => addMultiplePages('math_puzzle', configs)}
                trimSize={selectedTrim}
                trimSizeOptions={TRIM_SIZES}
                onTrimSizeChange={setSelectedTrim}
              />
            )}
            {bookPages[activeIndex].type === 'kakuro' && !bookPages[activeIndex].config.isMultiSolution && (
              <KakuroEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}

            {bookPages[activeIndex].type === 'low_content' && (
              <LowContentEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'title' && (
              <TitlePageEditor
                key={bookPages[activeIndex].id}
                page={bookPages[activeIndex]}
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)}
              />
            )}
            {bookPages[activeIndex].type === 'blank' && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 surface-card p-10 min-h-[500px]">
                <h3 className="text-xl font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Blank Spacer Page</h3>
                <p className="text-xs">This page will export as a blank page in your KDP Interior PDF.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl m-4 transition-colors duration-300">
            <span className="text-4xl">📚</span>
            <p className="font-bold">No pages added to your book yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Click the add button to insert pages.</p>
          </div>
        )}
      </div>

      {/* Sidebar Right: Book Pages & Merge Export */}
      <motion.div
        animate={{ 
          width: rightOpen ? 304 : 0,
          opacity: rightOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 transition-colors duration-300 ${
          rightOpen ? "absolute md:relative right-0 top-0 h-full z-30 shadow-2xl" : "relative"
        }`}
      >
        <div className="w-[304px] p-5 flex flex-col h-full justify-between" data-tour="outline-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-wider">Book Outline ({bookPages.length} Pages)</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-all duration-200 active:scale-95 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center cursor-pointer"
              title="Add New Page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={bookPages.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {bookPages.map((p, i) => (
                  <SortablePageItem
                    key={p.id}
                    page={p}
                    index={i}
                    totalCount={bookPages.length}
                    isActive={activeIndex === i}
                    onSelect={() => setActiveIndex(i)}
                    onMoveUp={() => movePageUp(i)}
                    onMoveDown={() => movePageDown(i)}
                    onDuplicate={() => duplicatePage(i)}
                    onRemove={() => removePage(i)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* PDF Export Button */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800" data-tour="export-section">
            {bookPages.length > 0 ? (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="btn-premium-primary w-full py-3.5 normal-case text-sm"
              >
                <FileDown className="w-4 h-4" /> Configure &amp; Export PDF →
              </button>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center py-2">
                Add a page to unlock PDF export
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Mobile Floating Action Button (FAB) to Add Page */}
    <button
      onClick={() => setIsAddModalOpen(true)}
      className="md:hidden fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider active:scale-95 transition-all duration-200 border-2 border-white/20"
      style={{ boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)' }}
    >
      <Plus className="w-5 h-5" />
      <span>Add Page</span>
    </button>

    {mounted && isAddModalOpen && createPortal(
      <div
        className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setIsAddModalOpen(false)}
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 relative animate-in zoom-in-95 duration-200"
          style={{ boxShadow: "var(--shadow-soft-lg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Plus className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase">Insert Book Page</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Choose a template style to generate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {[
              { type: 'title', config: {}, label: 'Title Page', desc: 'Starting title and author credits', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
              { type: 'blank', config: {}, label: 'Blank Spacer', desc: 'Adds gutter and spacing padding', icon: '🔲', color: 'bg-slate-50 border-slate-200 text-slate-600' },
              { type: 'crossword', config: {}, label: 'Crossword Puzzle', desc: 'Vocabulary grids with clues', icon: '🧩', color: 'bg-amber-50 border-amber-200 text-amber-600' },
              { type: 'word_search', config: {}, label: 'Word Search', desc: 'Hidden word grids with banks', icon: '🔍', color: 'bg-pink-50 border-pink-200 text-pink-600' },
              { type: 'sudoku', config: {}, label: 'Sudoku Grid', desc: 'Easy, medium, and hard math logic', icon: '🔢', color: 'bg-cyan-50 border-cyan-200 text-cyan-600' },
              { type: 'maze', config: {}, label: 'Labyrinth Maze', desc: 'Square, circle, and heart shapes', icon: '🌀', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
              { type: 'word_scramble', config: {}, label: 'Word Scramble', desc: 'Shuffled letter challenges', icon: '🔤', color: 'bg-purple-50 border-purple-200 text-purple-600' },
              { type: 'cryptogram', config: {}, label: 'Cryptogram Quote', desc: 'Decrypted quote line puzzles', icon: '🔐', color: 'bg-teal-50 border-teal-200 text-teal-600' },
              { type: 'math_puzzle', config: {}, label: 'Math Arithmetic', desc: 'Sums, factors, and grid fill games', icon: '➕', color: 'bg-rose-50 border-rose-200 text-rose-600' },
              { type: 'kakuro', config: { sizeId: '6x6', difficulty: 'medium' }, label: 'Kakuro Puzzle', desc: 'Crossword-style number sums logic grids', icon: '🔢', color: 'bg-orange-50 border-orange-200 text-orange-600' },
              
              // Low-Content journal/planner templates
              { type: 'low_content', config: { template: 'lined_journal' }, label: 'Lined Journal', desc: 'Horizontal writing lines', icon: '📖', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
              { type: 'low_content', config: { template: 'dot_grid' }, label: 'Dot Grid Journal', desc: 'Subtle bullet journal grid', icon: '🔲', color: 'bg-slate-50 border-slate-200 text-slate-600' },
              { type: 'low_content', config: { template: 'weekly_planner' }, label: 'Weekly Planner', desc: '7-day list + notes block', icon: '📅', color: 'bg-amber-50 border-amber-200 text-amber-600' },
              { type: 'low_content', config: { template: 'daily_planner' }, label: 'Daily Planner', desc: 'Task lists + hourly logs', icon: '☀️', color: 'bg-rose-50 border-rose-200 text-rose-600' },
              { type: 'low_content', config: { template: 'habit_tracker' }, label: 'Habit Tracker', desc: 'Monthly tracking check grid', icon: '📈', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
              { type: 'low_content', config: { template: 'password_keeper' }, label: 'Password Keeper', desc: 'Clean table for site details', icon: '🔐', color: 'bg-teal-50 border-teal-200 text-teal-600' },
              { type: 'low_content', config: { template: 'budget_log' }, label: 'Budget Log', desc: 'Income & expenses balance list', icon: '💵', color: 'bg-cyan-50 border-cyan-200 text-cyan-600' },
              { type: 'low_content', config: { template: 'recipe_journal' }, label: 'Recipe Sheet', desc: 'Prep metrics & steps outline', icon: '🍳', color: 'bg-purple-50 border-purple-200 text-purple-600' },
              { type: 'low_content', config: { template: 'gratitude_journal' }, label: 'Gratitude Book', desc: 'Mindful writing text prompts', icon: '✨', color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
              { type: 'low_content', config: { template: 'guest_book' }, label: 'Guest Book Page', desc: 'Fields for signature & thoughts', icon: '✍️', color: 'bg-pink-50 border-pink-200 text-pink-600' }
            ].map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addPage(tmpl.type, tmpl.config);
                  setIsAddModalOpen(false);
                }}
                className="interactive-tile p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl text-left flex flex-col justify-between h-32 group cursor-pointer"
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${tmpl.color}`}>
                    Select
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 uppercase">{tmpl.label}</h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{tmpl.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    )}

    {mounted && isExportModalOpen && createPortal(
      <div
        className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setIsExportModalOpen(false)}
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200"
          style={{ boxShadow: "var(--shadow-soft-lg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Settings2 className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase">Export Book interior</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Configure layouts and covers</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Cover Integration */}
            <div className="space-y-2 p-3.5 surface-panel">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">Include Front & Back Cover</label>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Compile designs from Cover Studio</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeCover}
                  disabled={!coverState || coverState.coverElements?.length === 0}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
              </div>
              {includeCover && (
                <div className="flex gap-2 items-start bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-300 p-2.5 rounded-xl text-[10px] font-semibold leading-normal mt-2">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>KDP Notice:</strong> Amazon KDP requires uploading the <strong>Interior</strong> and <strong>Cover</strong> as two separate PDF files. Including the cover here is only for digital reading/e-book layout. For KDP paperback publishing, export your cover separately from the All-In-One Studio.
                  </span>
                </div>
              )}
            </div>

            {/* Page Numbers */}
            <div className="flex justify-between items-center p-3.5 surface-panel">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">Include Page Numbers</label>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Add index footers to puzzle pages</span>
              </div>
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Double-Sided Gutter margin */}
            <div className="flex justify-between items-center p-3.5 surface-panel">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">Double-Sided Gutter Margin</label>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Adds extra padding for binding</span>
              </div>
              <input
                type="checkbox"
                checked={gutterMargin}
                onChange={(e) => setGutterMargin(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* KDP Trim Size */}
            <div className="p-3.5 surface-panel flex justify-between items-center">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">KDP Book Trim Size</label>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Target paperback print size</span>
              </div>
              <select
                value={selectedTrim.label}
                onChange={(e) => {
                  const found = TRIM_SIZES.find(t => t.label === e.target.value);
                  if (found) setSelectedTrim(found);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                {TRIM_SIZES.map((t, idx) => (
                  <option key={idx} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Book Validation Checklist */}
            {errors.length > 0 && (
              <div className="p-4 surface-panel space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">KDP Requirements Checklist</span>
                <div className="space-y-1.5">
                  {errors.map((err, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 items-center p-2 rounded-lg text-[9px] font-semibold ${
                        err.type === 'error'
                          ? 'bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {err.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KDP Cover Image Resolution Check (auto-runs when a cover is included) */}
            {includeCover && coverDpiChecks.length > 0 && (
              <div className="p-4 surface-panel space-y-2">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Cover Print Resolution</span>
                <div className="space-y-1.5">
                  {coverDpiChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 items-center p-2 rounded-lg text-[9px] font-semibold ${
                        check.isLowRes
                          ? 'bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {check.isLowRes ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span>
                        {check.label}: ~{check.effectiveDpi} DPI
                        {check.isLowRes ? ' — below KDP\'s 300 DPI minimum, may print blurry. Use a higher-resolution image.' : ' — meets KDP\'s 300 DPI minimum.'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="btn-premium flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 normal-case"
            >
              Cancel
            </button>
            <button
              onClick={triggerExport}
              disabled={isExporting || !isValid}
              className="btn-premium-primary flex-1 normal-case"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                "Export Now"
              )}
            </button>
          </div>

        </div>
      </div>,
      document.body
    )}
    {isVersionHistoryOpen && (
      <BookVersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        getSnapshot={getBookSnapshot}
        onRestore={handleRestoreBookVersion}
      />
    )}
  </>
  );
}

// Title Page Configuration Component
function TitlePageEditor({ page, updatePage }: any) {
  const [title, setTitle] = useState(page.config.title || "My Masterpiece Book");
  const [subtitle, setSubtitle] = useState(page.config.subtitle || "A Collection of Puzzles");
  const [author, setAuthor] = useState(page.config.author || "KDPage");

  const handleChange = (field: string, val: string) => {
    const newConfig = { ...page.config, [field]: val };
    if (field === 'title') setTitle(val);
    if (field === 'subtitle') setSubtitle(val);
    if (field === 'author') setAuthor(val);
    updatePage(newConfig);
  };

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      <div className="w-80 flex flex-col gap-4 surface-panel p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Title Page Editor</h3>
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Book Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Author Name</label>
          <input
            type="text"
            value={author}
            onChange={(e) => handleChange('author', e.target.value)}
            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 surface-card p-10 min-h-[600px] flex flex-col justify-between items-center text-slate-800 dark:text-slate-100">
        <div className="w-full mt-24 text-center">
          <h1 className="text-4xl font-extrabold uppercase tracking-widest text-slate-900 dark:text-slate-50 mb-4">{title}</h1>
          <p className="text-md text-slate-500 dark:text-slate-400 font-semibold italic">{subtitle}</p>
        </div>
        <div className="mb-24 text-center font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-xs">
          By {author}
        </div>
      </div>
    </div>
  );
}

interface SortablePageItemProps {
  page: any;
  index: number;
  totalCount: number;
  isActive: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

function SortablePageItem({
  page,
  index,
  totalCount,
  isActive,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: SortablePageItemProps) {
  const isTitlePage = index === 0 && page.type === 'title';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: page.id,
    disabled: isTitlePage,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isSol = page.config?.isSolution || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group p-2.5 rounded-xl border flex justify-between items-center transition-all duration-200 select-none ${
        isDragging ? 'opacity-50 border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md' : ''
      } ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors duration-200"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-black">Page {index + 1}</span>
          <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
            {page.type === 'math_puzzle'
              ? (page.config?.puzzleType === 'number_fill'
                  ? 'Kakuro Sums'
                  : page.config?.puzzleType === 'multiplication'
                    ? 'Multiplication'
                    : 'Math Puzzle')
              : page.type.replace('_', ' ')} {isSol && <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">(SOL)</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move Page Up"
          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-20 disabled:pointer-events-none transition-colors duration-200 cursor-pointer"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
          title="Move Page Down"
          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-20 disabled:pointer-events-none transition-colors duration-200 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDuplicate}
          title="Duplicate Page"
          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors duration-200 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {!isTitlePage && (
          <button
            onClick={onRemove}
            title="Delete Page"
            className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
