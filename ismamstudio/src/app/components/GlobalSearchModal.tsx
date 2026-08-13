"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Command, ArrowRight, ChevronRight, BookOpen, Calculator, PenTool, Hash, Shield } from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  category: "Puzzles & Interiors" | "Covers & Specs" | "Marketing & Keywords" | "Formatting & Tools";
  description: string;
  keywords: string[];
  link: string;
  badge?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Puzzles & Interiors
  {
    id: "sudoku",
    name: "KDP Sudoku Generator",
    category: "Puzzles & Interiors",
    description: "Generate 100% single-solution guaranteed Sudoku puzzle grids (Easy to Hard).",
    keywords: ["sudoku", "sudokus", "sudokos", "number puzzle", "logic grid", "puzzle", "interior"],
    link: "/sudoku",
    badge: "Popular"
  },
  {
    id: "maze",
    name: "Shape-Masked Maze Studio",
    category: "Puzzles & Interiors",
    description: "Create labyrinths and shape-masked mazes (hearts, stars, circles) with bleed safety.",
    keywords: ["maze", "mazes", "labyrinth", "shaped maze", "heart maze", "puzzle", "interior"],
    link: "/maze",
    badge: "Popular"
  },
  {
    id: "word-search",
    name: "Word Search Builder",
    category: "Puzzles & Interiors",
    description: "Build custom word search puzzle books using your own CSV word lists.",
    keywords: ["word search", "wordsearch", "find words", "word puzzle", "puzzle", "interior"],
    link: "/tools/word-search",
    badge: "Popular"
  },
  {
    id: "crossword",
    name: "Crossword Generator",
    category: "Puzzles & Interiors",
    description: "Design custom crossword puzzle grids and compile vector PDF worksheets.",
    keywords: ["crossword", "crosswords", "word puzzle", "grid puzzle", "clues", "puzzle"],
    link: "/studio/crossword",
    badge: "New"
  },
  {
    id: "cryptogram",
    name: "Cryptogram & Cipher Studio",
    category: "Puzzles & Interiors",
    description: "Create crypto-quote and encrypted text cipher puzzle interiors.",
    keywords: ["cryptogram", "cryptograms", "crypto quote", "cipher", "secret code", "puzzle"],
    link: "/studio/cryptogram"
  },
  {
    id: "word-scramble",
    name: "Word Scramble Studio",
    category: "Puzzles & Interiors",
    description: "Generate word jumble and anagram puzzle worksheets with solution keys.",
    keywords: ["word scramble", "scramble", "anagram", "jumble", "scrambled words", "puzzle"],
    link: "/studio/word-scramble"
  },
  {
    id: "kakuro",
    name: "Kakuro Cross-Sums Generator",
    category: "Puzzles & Interiors",
    description: "Generate Kakuro (number cross-sum) math logic puzzles.",
    keywords: ["kakuro", "cross sums", "math grid", "number puzzle", "logic puzzle", "puzzle"],
    link: "/studio/kakuro"
  },
  {
    id: "math-puzzle",
    name: "Math Puzzle Builder",
    category: "Puzzles & Interiors",
    description: "Create arithmetic equation grids, number searches, and math workbooks.",
    keywords: ["math", "math puzzle", "arithmetic grid", "equation puzzle", "number search", "workbook", "puzzle"],
    link: "/studio/math-puzzle"
  },
  // Covers & Specs
  {
    id: "cover-studio",
    name: "Full Cover & Canvas Studio",
    category: "Covers & Specs",
    description: "Interactive canvas editor to design front, spine, and back covers with KDP safety guides.",
    keywords: ["cover", "covers", "cover studio", "cover designer", "full wrap cover", "canvas", "front cover", "back cover"],
    link: "/studio?tab=cover",
    badge: "Pro"
  },
  {
    id: "spine-calculator",
    name: "Spine Width & Cover Calculator",
    category: "Covers & Specs",
    description: "Calculate exact spine thickness and full cover dimensions for paperback & hardcover.",
    keywords: ["spine", "spine calculator", "cover calculator", "spine width", "bleed", "page count", "dimensions"],
    link: "/tools/spine-calculator",
    badge: "Essential"
  },
  {
    id: "isbn-generator",
    name: "ISBN Barcode Generator",
    category: "Covers & Specs",
    description: "Generate 300 DPI vector EAN-13 ISBN barcodes for Amazon KDP covers.",
    keywords: ["isbn", "barcode", "barcodes", "ean-13", "book barcode", "barcode generator"],
    link: "/tools/isbn-generator",
    badge: "Essential"
  },
  // Marketing & Keywords
  {
    id: "keyword-research",
    name: "KDP Keyword & Niche Spy",
    category: "Marketing & Keywords",
    description: "Research low-competition KDP keywords, search volume, and 7 backend keyword slots.",
    keywords: ["keyword", "keywords", "keyword research", "niche hunter", "amazon keywords", "seo", "search volume", "niche"],
    link: "/tools/keyword-research",
    badge: "Popular"
  },
  {
    id: "royalty-estimator",
    name: "KDP Royalty & Market Viability Estimator",
    category: "Marketing & Keywords",
    description: "Analyze printing costs, promo discounts, Kindle Unlimited reads, and PPC ads.",
    keywords: ["royalty", "royalty calculator", "printing cost", "kdp calculator", "profit", "earnings"],
    link: "/tools/royalty-estimator"
  },
  {
    id: "background-remover",
    name: "Background Remover",
    category: "Formatting & Tools",
    description: "Remove solid or simple backgrounds from images instantly to create transparent PNGs.",
    keywords: ["background", "bg remover", "transparent png", "cutout", "image edit"],
    link: "/tools/background-remover"
  },
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    category: "Formatting & Tools",
    description: "Reduce PDF file size while maintaining print resolution for KDP upload limits.",
    keywords: ["pdf compress", "pdf compressor", "reduce pdf size", "shrink pdf", "kdp upload limit"],
    link: "/tools/pdf-compressor"
  },
  {
    id: "kdp-file-validator",
    name: "KDP File & Margin Validator",
    category: "Formatting & Tools",
    description: "Validate your PDF files for KDP compliance, dimensions, and bleed margins.",
    keywords: ["validator", "pdf validator", "margin checker", "bleed validator", "kdp error fix"],
    link: "/tools/kdp-file-validator"
  },
  {
    id: "photo-to-line-art",
    name: "Photo to Line Art Converter",
    category: "Formatting & Tools",
    description: "Convert photos into clean line art perfect for coloring books.",
    keywords: ["coloring book", "line art", "photo to sketch", "coloring page", "outline art"],
    link: "/tools/photo-to-line-art"
  },
  {
    id: "book-planner",
    name: "Book Planner & Outline Studio",
    category: "Formatting & Tools",
    description: "Plan your book with chapters, characters, and outlines.",
    keywords: ["book planner", "outline", "chapter planner", "character sheet", "writing progress"],
    link: "/tools/book-planner"
  },
  {
    id: "trademark-checker",
    name: "Trademark Checker",
    category: "Marketing & Keywords",
    description: "Check if your book title or keywords contain trademarked terms.",
    keywords: ["trademark", "tm check", "brand safety", "title check"],
    link: "/tools/trademark-checker"
  },
  {
    id: "copyright-page",
    name: "Copyright Page Generator",
    category: "Formatting & Tools",
    description: "Create professional copyright pages for your books with legal text.",
    keywords: ["copyright", "legal page", "disclaimer", "front matter"],
    link: "/tools/copyright-page-generator"
  },
  {
    id: "qr-code",
    name: "QR Code Generator",
    category: "Marketing & Keywords",
    description: "Generate QR codes for author websites and book promotional pages.",
    keywords: ["qr code", "qr generator", "author link", "marketing qr"],
    link: "/tools/qr-code-generator"
  }
];

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Cmd+K / Ctrl+K keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = SEARCH_ITEMS.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (link: string) => {
    setIsOpen(false);
    router.push(link);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].link);
    }
  };

  return (
    <>
      {/* ✨ Search Trigger Button — Premium Animated Navbar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-full border transition-all duration-300 group
          bg-slate-900/90
          border-slate-800
          hover:border-indigo-500/60
          hover:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
          active:scale-95 shadow-sm"
        title="Search all KDP tools & generators (Cmd+K)"
        aria-label="Open search"
      >
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-center gap-2">
          {/* Animated search icon */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-indigo-500/30 group-hover:scale-110 transition-all duration-300">
            <Search className="w-3.5 h-3.5 text-white" />
          </div>

          <span className="hidden sm:block text-sm font-bold text-slate-300 group-hover:text-white transition-colors duration-200 whitespace-nowrap">
            Search tools...
          </span>

          {/* Keyboard shortcut badge */}
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 ml-1 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-all duration-200">
            ⌘K
          </kbd>
        </div>
      </button>

      {/* 🔍 Fullscreen Search Modal Overlay -- portaled to document.body since
          this component is nested inside the fixed Header, and a non-portaled
          fixed-position overlay there doesn't reliably capture clicks across
          the full viewport (its own stacking context stays scoped to the
          Header's, so clicks on outside content beyond the Header's own DOM
          boundary can land on that content instead of this overlay). */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-24 px-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" />

          {/* Modal card */}
          <div
            className="relative w-full max-w-2xl flex flex-col overflow-hidden max-h-[82vh]
              rounded-[2rem] border border-white/10
              bg-gradient-to-b from-slate-900/95 to-slate-950/98
              shadow-[0_32px_80px_rgba(0,0,0,0.7),_0_0_0_1px_rgba(99,102,241,0.15),_inset_0_1px_0_rgba(255,255,255,0.07)]
              animate-in fade-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient glow top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute top-0 left-1/4 w-1/2 h-16 bg-indigo-500/5 blur-2xl pointer-events-none" />

            {/* ——— INPUT HEADER ——— */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              {/* Search icon with glow */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <Search className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInInput}
                placeholder="Search tools… e.g. Sudoku, Spine, Barcode, Cover, Royalty"
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-[15px] font-semibold focus:outline-none caret-indigo-400"
              />

              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* ——— CATEGORY CHIPS (shown when empty) ——— */}
            {!query && (
              <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
                {["Puzzles & Interiors", "Covers & Specs", "Marketing & Keywords", "Formatting & Tools"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setQuery(cat.split(" ")[0])}
                    className="px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider
                      bg-white/[0.05] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40
                      text-slate-400 hover:text-indigo-300 transition-all duration-200 cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* ——— RESULTS LIST ——— */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scroll-smooth
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-white/10
              [&::-webkit-scrollbar-thumb]:rounded-full">

              {filtered.length > 0 ? (
                <>
                  {/* Section label when searching */}
                  {query && (
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">
                      {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
                    </p>
                  )}
                  {/* Result rows */}
                  {filtered.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    // Category accent colors
                    const catColor =
                      item.category === "Puzzles & Interiors" ? "from-violet-500 to-indigo-600" :
                      item.category === "Covers & Specs" ? "from-amber-400 to-orange-500" :
                      item.category === "Marketing & Keywords" ? "from-emerald-400 to-teal-500" :
                      "from-sky-400 to-blue-500";

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.link)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-white/[0.08] border border-indigo-500/25 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]"
                            : "hover:bg-white/[0.04] border border-transparent"
                        }`}
                      >
                        {/* Category gradient icon */}
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${catColor} flex items-center justify-center shrink-0 shadow-md ${isSelected ? "scale-110" : ""} transition-transform duration-150`}>
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>

                        {/* Text block */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[13px] font-black ${isSelected ? "text-white" : "text-slate-200"} transition-colors`}>
                              {item.name}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.07] text-slate-500">
                              {item.category}
                            </span>
                            {item.badge && (
                              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                item.badge === "Popular" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                                item.badge === "Essential" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                                "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-150 ${
                          isSelected ? "text-indigo-400 translate-x-0.5" : "text-slate-700"
                        }`} />
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                    <Search className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="text-sm font-black text-slate-300 mb-1">
                    No results for "{query}"
                  </p>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Try "Sudoku", "Spine", "Cover", "Maze", or "Royalty"
                  </p>
                </div>
              )}
            </div>

            {/* ——— FOOTER SHORTCUTS ——— */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between
              bg-gradient-to-r from-slate-950/50 to-slate-900/50">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-[9px] text-slate-500">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-[9px] text-slate-500">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-[9px] text-slate-500">↵</kbd>
                  Open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-[9px] text-slate-500">ESC</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Search className="w-2.5 h-2.5 text-white" />
                </div>
                KDPage Search Studio
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
