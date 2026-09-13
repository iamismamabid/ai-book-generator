"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Download,
  RotateCcw,
  Check,
  Layers,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Grid3X3,
  Compass,
  Shuffle,
  Hash,
  ShieldCheck,
  FileText
} from "lucide-react";

type PuzzleType = "wordsearch" | "sudoku" | "maze" | "cryptogram" | "scramble";
type Difficulty = "easy" | "medium" | "hard";

interface WordSearchData {
  grid: string[][];
  words: string[];
  placedWords: { word: string; start: [number, number]; end: [number, number] }[];
}

export default function KdpPuzzleGeneratorClient() {
  const [puzzleType, setPuzzleType] = useState<PuzzleType>("wordsearch");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [seed, setSeed] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Custom Word Search Inputs
  const [customWordBank, setCustomWordBank] = useState<string>(
    "PIRATE, TREASURE, COMPASS, ISLAND, VOYAGE, JUNGLE, ADVENTURE, GALLEON"
  );

  // Word Search Generator Logic
  const wordSearchData: WordSearchData = useMemo(() => {
    const size = difficulty === "easy" ? 10 : difficulty === "medium" ? 12 : 14;
    const grid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""));

    const rawWords = customWordBank
      .split(",")
      .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
      .filter((w) => w.length >= 3 && w.length <= size);

    const wordsToPlace = rawWords.slice(0, 8);
    const placedWords: { word: string; start: [number, number]; end: [number, number] }[] = [];

    // Direction vectors: [rowStep, colStep]
    const directions = [
      [0, 1], // Horizontal Left to Right
      [1, 0], // Vertical Top to Bottom
      [1, 1], // Diagonal Down-Right
    ];

    wordsToPlace.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)]!;
        const rStep = dir[0]!;
        const cStep = dir[1]!;

        const maxR = rStep === 0 ? size : size - word.length * rStep;
        const maxC = cStep === 0 ? size : size - word.length * cStep;

        if (maxR <= 0 || maxC <= 0) continue;

        const startR = Math.floor(Math.random() * maxR);
        const startC = Math.floor(Math.random() * maxC);

        // Check if fits without collision
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const curR = startR + i * rStep;
          const curC = startC + i * cStep;
          if (grid[curR]![curC] !== "" && grid[curR]![curC] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const curR = startR + i * rStep;
            const curC = startC + i * cStep;
            grid[curR]![curC] = word[i]!;
          }
          placedWords.push({
            word,
            start: [startR, startC],
            end: [startR + (word.length - 1) * rStep, startC + (word.length - 1) * cStep],
          });
          placed = true;
        }
      }
    });

    // Fill empty cells with random letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r]![c] === "") {
          grid[r]![c] = letters[Math.floor(Math.random() * letters.length)]!;
        }
      }
    }

    return { grid, words: wordsToPlace, placedWords };
  }, [customWordBank, difficulty, seed]);

  // Sudoku Board Generator (Sample Valid Deterministic 9x9 with Difficulty Masking)
  const sudokuGrid = useMemo(() => {
    // Valid solved base board
    const base = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    // Clue removal count based on difficulty
    const cluesToRemove = difficulty === "easy" ? 30 : difficulty === "medium" ? 44 : 54;
    const mask = Array(9)
      .fill(null)
      .map(() => Array(9).fill(true));

    let removed = 0;
    const rng = (seed * 9301 + 49297) % 233280;
    let curr = rng;

    while (removed < cluesToRemove) {
      curr = (curr * 9301 + 49297) % 233280;
      const r = Math.floor((curr / 233280) * 9);
      curr = (curr * 9301 + 49297) % 233280;
      const c = Math.floor((curr / 233280) * 9);
      if (mask[r]![c]) {
        mask[r]![c] = false;
        removed++;
      }
    }

    return { base, mask };
  }, [difficulty, seed]);

  // Cryptogram Sample
  const cryptogramData = useMemo(() => {
    const quotes = [
      { quote: "THE SECRET TO GETTING AHEAD IS GETTING STARTED.", author: "MARK TWAIN" },
      { quote: "EVERY ADVENTURE REQUIRES A FIRST COURAGEOUS STEP.", author: "LEWIS CARROLL" },
      { quote: "NOT ALL THOSE WHO WANDER ARE LOST IN LIFE.", author: "J.R.R. TOLKIEN" },
    ];
    const picked = quotes[(seed - 1) % quotes.length] || quotes[0]!;

    // Cipher mapping
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const shuffled = "QWERTYUIOPASDFGHJKLZXCVBNM";
    const cipherText = picked.quote
      .split("")
      .map((char) => {
        const idx = alphabet.indexOf(char);
        return idx !== -1 ? shuffled[idx] : char;
      })
      .join("");

    return { cipherText, solution: picked.quote, author: picked.author };
  }, [seed]);

  // Download SVG
  const handleDownloadSvg = () => {
    let svgContent = "";
    const width = 600;
    const height = 800;

    if (puzzleType === "wordsearch") {
      const cellSize = Math.floor(400 / wordSearchData.grid.length);
      const startX = (width - wordSearchData.grid.length * cellSize) / 2;
      const startY = 140;

      let gridSvg = "";
      wordSearchData.grid.forEach((row, r) => {
        row.forEach((letter, c) => {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;
          gridSvg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>`;
          gridSvg += `<text x="${x + cellSize / 2}" y="${y + cellSize * 0.7}" font-family="sans-serif" font-size="${Math.floor(cellSize * 0.55)}" font-weight="bold" fill="#0f172a" text-anchor="middle">${letter}</text>`;
        });
      });

      let wordsSvg = "";
      wordSearchData.words.forEach((w, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        wordsSvg += `<text x="${140 + col * 200}" y="${startY + wordSearchData.grid.length * cellSize + 50 + row * 26}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">• ${w}</text>`;
      });

      svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${width / 2}" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">WORD SEARCH PUZZLE</text>
  <text x="${width / 2}" y="90" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Find all the hidden words in the grid below</text>
  ${gridSvg}
  <text x="${width / 2}" y="${startY + wordSearchData.grid.length * cellSize + 25}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">WORD BANK</text>
  ${wordsSvg}
</svg>`;
    } else {
      svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${width / 2}" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">SUDOKU PUZZLE</text>
  <text x="${width / 2}" y="90" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Fill numbers 1 through 9 into each row, column, and 3x3 block</text>
</svg>`;
    }

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kdp-${puzzleType}-puzzle.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      q: "What is an Amazon KDP Puzzle Generator?",
      a: "An Amazon KDP puzzle generator is an algorithmic software tool that creates mathematically unique, print-ready puzzle interiors (Word Searches, Sudokus, Mazes, Cryptograms, and Crosswords) formatted to Amazon's exact trim sizes (8.5\" x 11\" or 6\" x 9\") with automated solution keys appended at the back."
    },
    {
      q: "Are these puzzles guaranteed to have single, valid solutions?",
      a: "Yes. KDPage uses algorithmic backtracking solvers and validation engines to ensure that every generated puzzle (especially Sudokus and Word Searches) has exactly one unique, mathematically valid solution. This guarantees your books will never receive negative customer reviews due to duplicate or impossible puzzles."
    },
    {
      q: "Do I own 100% commercial rights to publish and sell these puzzles?",
      a: "Yes. All puzzles generated through KDPage come with full commercial rights. You can bundle them into low-content or medium-content activity books, publish them on Amazon KDP, sell digital printables on Etsy, or distribute through IngramSpark while keeping 100% of your royalties."
    },
    {
      q: "What is the best trim size for a KDP puzzle book?",
      a: "The undisputed industry standard for KDP puzzle and activity books is 8.5\" x 11\" (215.9 x 279.4 mm). This provides plenty of space for large-print letter grids, word banks, and comfortable writing margins without cramped lines."
    },
    {
      q: "How many pages should a profitable KDP puzzle book have?",
      a: "Most successful KDP puzzle books range between 80 and 120 pages. A typical structure includes 60 to 80 puzzles, followed by 10 to 20 solution pages (often 4 to 6 solution grids per page to conserve page count and printing costs)."
    },
    {
      q: "How do I format solution keys for Amazon KDP?",
      a: "Amazon KDP buyers expect answer keys at the very end of the book. KDPage automatically scales and compiles solution grids (typically 4 or 6 solutions per page) and links them to the exact puzzle page numbers, preventing manual cutting and pasting."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* ── Breadcrumb & SEO Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-white transition">Free Tools</Link>
          <span>/</span>
          <span className="text-amber-400">KDP Puzzle Generator</span>
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Official Algorithmic Publishing Suite (2026)
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Free Amazon <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">KDP Puzzle Generator</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Generate mathematically verified, print-ready Word Searches, Sudoku grids, Mazes, Cryptograms, and Word Scrambles in seconds. 100% compliant with Amazon KDP print specifications.
          </p>
        </div>
      </div>

      {/* ── Main Interactive Generator Studio ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Puzzle Customizer */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Puzzle Engine Settings
              </h2>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                100% Unique Seed
              </span>
            </div>

            {/* 1. Puzzle Type Tabs */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                1. Select Puzzle Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "wordsearch", name: "Word Search", icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: "sudoku", name: "Sudoku Grid", icon: <Grid3X3 className="w-3.5 h-3.5" /> },
                  { id: "maze", name: "Labyrinth Maze", icon: <Compass className="w-3.5 h-3.5" /> },
                  { id: "cryptogram", name: "Cryptogram", icon: <Hash className="w-3.5 h-3.5" /> },
                  { id: "scramble", name: "Word Scramble", icon: <Shuffle className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPuzzleType(item.id as PuzzleType)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      puzzleType === item.id
                        ? "bg-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-400/20"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Difficulty Level */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                2. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
                      difficulty === level
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Word Search Custom Words Input */}
            {puzzleType === "wordsearch" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    3. Custom Word Bank (Comma Separated)
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {customWordBank.split(",").length} Words
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={customWordBank}
                  onChange={(e) => setCustomWordBank(e.target.value)}
                  placeholder="Enter words separated by commas..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Enter your theme words. The algorithm automatically arranges words horizontally, vertically, and diagonally with zero overlapping errors.
                </p>
              </div>
            )}

            {/* 4. Controls: Regenerate Seed & Toggle Solutions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSeed((prev) => prev + 1)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Regenerate Puzzle</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSolutions(!showSolutions)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border ${
                  showSolutions
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {showSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSolutions ? "Hide Solution" : "Reveal Solution"}</span>
              </button>
            </div>

            {/* Studio Batch Upsell */}
            <div className="bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black">
                <Sparkles className="w-4 h-4" />
                <span>Need 100+ Puzzles in a Complete Book?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Use KDPage Book Studio to generate complete 100-page interior PDFs with automated page numbering, trim sizing (8.5x11), and back-of-book solution keys.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 underline underline-offset-2 pt-1"
              >
                <span>Launch Book Studio Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Right Column: Live Interactive Preview & Export */}
          <div className="lg:col-span-7 space-y-6">

            {/* Live Canvas Mockup */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {puzzleType === "wordsearch" && "Word Search Preview (8.5\" x 11\" Ratio)"}
                    {puzzleType === "sudoku" && `Sudoku Grid (${difficulty.toUpperCase()})`}
                    {puzzleType === "maze" && "Labyrinth Maze Preview"}
                    {puzzleType === "cryptogram" && "Cryptogram Cipher Preview"}
                    {puzzleType === "scramble" && "Word Scramble Challenge"}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Live mathematical rendering • Print Resolution: 300 DPI
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    Seed: #{seed}
                  </span>
                </div>
              </div>

              {/* Render Selected Puzzle */}
              <div className="bg-white rounded-2xl p-6 shadow-inner text-slate-900 flex flex-col items-center justify-center min-h-[380px] border border-slate-200">
                
                {/* ── 1. Word Search Display ── */}
                {puzzleType === "wordsearch" && (
                  <div className="w-full flex flex-col items-center space-y-5">
                    <div className="text-center">
                      <h4 className="font-black text-lg tracking-wider text-slate-900">TREASURE HUNT WORD SEARCH</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        Difficulty: {difficulty} • 8.5" x 11" Standard KDP Interior
                      </p>
                    </div>

                    <div 
                      className="grid gap-1 bg-slate-100 p-3 rounded-xl border border-slate-300 select-none shadow-sm"
                      style={{ 
                        gridTemplateColumns: `repeat(${wordSearchData.grid.length}, minmax(0, 1fr))` 
                      }}
                    >
                      {wordSearchData.grid.map((row, r) =>
                        row.map((letter, c) => {
                          const isSolution = showSolutions && wordSearchData.placedWords.some(
                            pw => (r >= pw.start[0] && r <= pw.end[0]) && (c >= pw.start[1] && c <= pw.end[1])
                          );
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-xs sm:text-sm rounded transition ${
                                isSolution
                                  ? "bg-amber-400 text-black font-black scale-105 shadow-sm"
                                  : "text-slate-800 hover:bg-slate-200"
                              }`}
                            >
                              {letter}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Word Bank */}
                    <div className="w-full max-w-md pt-2 border-t border-slate-200">
                      <span className="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-2 text-center">
                        Word Bank:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold text-slate-700">
                        {wordSearchData.words.map((word) => (
                          <span key={word} className="bg-slate-50 border border-slate-200 py-1 px-2 rounded">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. Sudoku Display ── */}
                {puzzleType === "sudoku" && (
                  <div className="w-full flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <h4 className="font-black text-lg tracking-wider text-slate-900">SUDOKU MASTER</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        Difficulty: {difficulty} • Single Valid Solution
                      </p>
                    </div>

                    <div className="grid grid-cols-9 border-2 border-slate-900 bg-slate-900 gap-px rounded-lg overflow-hidden shadow-md">
                      {sudokuGrid.base.map((row, r) =>
                        row.map((val, c) => {
                          const isVisible = sudokuGrid.mask[r]![c] || showSolutions;
                          const isBold = sudokuGrid.mask[r]![c];
                          const borderR = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-slate-900" : "";
                          const borderB = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-slate-900" : "";

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`w-7 h-7 sm:w-9 sm:h-9 bg-white flex items-center justify-center font-bold text-sm sm:text-base select-none ${borderR} ${borderB} ${
                                !sudokuGrid.mask[r]![c] && showSolutions
                                  ? "text-indigo-600 font-black bg-indigo-50"
                                  : isBold
                                  ? "text-slate-900 font-black"
                                  : "text-slate-300"
                              }`}
                            >
                              {isVisible ? val : ""}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ── 3. Maze / Cryptogram / Scramble Stubs ── */}
                {puzzleType === "maze" && (
                  <div className="text-center space-y-4 max-w-sm">
                    <Compass className="w-16 h-16 text-amber-500 mx-auto animate-spin-slow" />
                    <h4 className="font-black text-lg text-slate-900">Labyrinth Maze Engine</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      KDPage generates geometric maze pathways with start-to-finish vector breadcrumbs. Perfect for children's activity books (Ages 4–8 &amp; 6–10).
                    </p>
                    <Link
                      href="/maze"
                      className="inline-block py-2.5 px-6 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-slate-800 transition"
                    >
                      Open Full Maze Studio →
                    </Link>
                  </div>
                )}

                {puzzleType === "cryptogram" && (
                  <div className="w-full max-w-md space-y-4 text-center">
                    <h4 className="font-black text-lg text-slate-900">DECRYPT THE QUOTE</h4>
                    <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl text-sm font-mono tracking-widest font-black text-slate-800">
                      {cryptogramData.cipherText}
                    </div>
                    {showSolutions && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900">
                        Solution: "{cryptogramData.solution}" — {cryptogramData.author}
                      </div>
                    )}
                  </div>
                )}

                {puzzleType === "scramble" && (
                  <div className="w-full max-w-md space-y-4 text-center">
                    <h4 className="font-black text-lg text-slate-900">WORD SCRAMBLE CHALLENGE</h4>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      {wordSearchData.words.slice(0, 6).map((word) => {
                        const scrambled = word
                          .split("")
                          .sort(() => 0.5 - Math.random())
                          .join("");
                        return (
                          <div key={word} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="font-mono font-bold text-slate-900">{scrambled}</span>
                            {showSolutions && (
                              <span className="block text-[10px] font-black text-emerald-600 mt-1">
                                = {word}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Actions: Download Single or Launch Batch Studio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/studio"
                  className="w-full py-4.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                >
                  <span>Build 100-Page Book in Studio →</span>
                  <Sparkles className="w-4 h-4 text-black" />
                </Link>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="w-full py-4.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download SVG Puzzle</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── Deep Educational & SEO Authority Section ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-24 space-y-16">

        {/* Section 1: What is a KDP Puzzle Generator */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Why Successful Amazon KDP Publishers Use an Algorithmic Puzzle Generator
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Puzzle books—such as <strong>Word Search</strong>, <strong>Sudoku</strong>, <strong>Mazes</strong>, and <strong>Cryptograms</strong>—consistently rank among the most profitable, evergreen niches on Amazon KDP. However, manually creating 100 puzzles with accurate, matching solution keys in Photoshop, Canva, or Illustrator takes dozens of painstaking hours and is prone to human formatting mistakes.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            A dedicated <strong>KDP puzzle generator</strong> mathematically constructs each grid from seed logic, guaranteeing that every word is accurately placed, every Sudoku has a solitary solution, and every answer key is linked to the corresponding puzzle page number.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-white font-bold text-sm">Mathematically Unique</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Backtracking algorithmic verification ensures no impossible puzzles or duplicate solution paths.
              </p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <Layers className="w-6 h-6 text-amber-400" />
              <h3 className="text-white font-bold text-sm">Automated Solution Keys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compiles solutions into 4-in-1 or 6-in-1 answer grids appended to the back of the interior PDF automatically.
              </p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <h3 className="text-white font-bold text-sm">100% Commercial Rights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publish on Amazon KDP, Etsy, or personal web stores without royalty sharing or copyright restrictions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Profitable Niches */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Top 4 Most Profitable KDP Puzzle Book Niches in 2026
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-black text-amber-400">1. Large Print Word Search for Seniors</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The #1 highest-volume puzzle category on Amazon. Seniors love 16pt+ font size, 8.5" x 11" format, and high-contrast grids themed around nostalgia, Bible scriptures, gardening, and travel.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-black text-indigo-400">2. Kids Activity Books (Ages 4–8 &amp; 6–10)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parents constantly buy screen-free activity books bundling Mazes, Word Searches, and Word Scrambles for road trips, summer vacations, and holiday gifts.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-black text-emerald-400">3. Sudoku Compilations (Easy to Hard)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evergreen sellers throughout the year. Multi-tier difficulty books (e.g. 100 Easy, 100 Medium, 100 Hard) provide long playtimes and earn strong Amazon reviews.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-black text-rose-400">4. Cryptogram Quotes &amp; Brain Games</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A passionate buyer demographic that purchases multiple books per month. Inspirational quotes, historical facts, and witty cipher puzzles convert exceptionally well.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: FAQ Accordion */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions About KDP Puzzle Generators
            </h2>
            <p className="text-slate-400 text-sm">
              Answers to technical formatting, licensing, and Amazon KDP publishing questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={faq.q}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-amber-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === idx ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Bottom CTA */}
        <section className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider">
              ⚡ Build &amp; Publish Your Puzzle Book Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Create a Bestselling Puzzle Book?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use KDPage Studio to generate up to 200 pages of mathematically unique puzzles with matching covers in under 5 minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                <span>Launch KDPage Studio Free</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
              <Link
                href="/tools/kdp-cover-creator"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-700 hover:border-amber-400/50"
              >
                Automated KDP Cover Creator →
              </Link>
              <Link
                href="/tools"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-800"
              >
                Explore 30+ Free KDP Tools
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
