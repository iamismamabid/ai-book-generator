"use client";

import { useState, useEffect, useRef } from "react";
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
    link: "/studio",
    badge: "Essential"
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
    id: "bulk-generator",
    name: "KDP Bulk Book Batch Studio",
    category: "Formatting & Tools",
    description: "Queue dozens of puzzle book interiors, import CSV configs, and compile in bulk.",
    keywords: ["bulk", "bulk generator", "batch creator", "csv import", "mass generation"],
    link: "/tools/bulk-generator",
    badge: "Popular"
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
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
      {/* Search Trigger Button in Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold transition-all shadow-sm group hover:scale-[1.02] active:scale-95"
        title="Search all KDP tools & generators (Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
        <span className="hidden sm:inline">Search tools...</span>
        <span className="inline sm:hidden">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Fullscreen Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar Header */}
            <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <Search className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInInput}
                placeholder="Search any KDP tool (e.g., Sudoku, Spine, Barcode, Cover, Keyword)..."
                className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base font-semibold focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-850">
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.link)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 translate-x-1"
                          : "hover:bg-slate-50 dark:hover:bg-slate-850/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                              {item.name}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {item.category}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${
                        isSelected ? "text-indigo-600 dark:text-indigo-400 translate-x-1" : "text-slate-300 dark:text-slate-700"
                      }`} />
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No tools found matching "{query}"
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for "Sudoku", "Maze", "Spine", "Cover", or "Barcode"
                  </p>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 border rounded text-[9px]">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 border rounded text-[9px]">↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 border rounded text-[9px]">↵</kbd> Select</span>
              </div>
              <span>KDPage Search Studio</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
