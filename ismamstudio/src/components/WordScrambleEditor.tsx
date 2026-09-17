"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Upload, Sparkles, Plus, Files, FileSpreadsheet, Check, X } from "lucide-react";

const SCRAMBLE_POOLS = [
  ["AEROSPACE", "PROPULSION", "CONTAINMENT", "STABILIZATION", "ANTIGRAVITY", "FLIGHT", "PAYLOAD"],
  ["GALAXY", "NEBULA", "SUPERNOVA", "TELESCOPE", "ASTRONAUT", "GRAVITY", "ORBIT"],
  ["ALGORITHM", "COMPILER", "DATABASE", "ENCRYPTION", "RECURSION", "VARIABLE", "FUNCTION"],
  ["HYDROGEN", "OXYGEN", "CARBON", "NITROGEN", "HELIUM", "URANIUM", "PLATINUM"],
  ["CARNIVORE", "HERBIVORE", "OMNIVORE", "PREDATOR", "MAMMAL", "REPTILE", "AMPHIBIAN"],
  ["METROPOLIS", "ARCHITECT", "SKYLINE", "SUBWAY", "BOULEVARD", "MONUMENT", "DISTRICT"],
  ["CHAMPION", "ATHLETE", "TOURNAMENT", "MARATHON", "STADIUM", "REFEREE", "VICTORY"],
  ["DIAMOND", "EMERALD", "SAPPHIRE", "AMETHYST", "TURQUOISE", "OBSIDIAN", "MALACHITE"],
  ["SYMPHONY", "ORCHESTRA", "HARMONY", "MELODY", "COMPOSER", "CRESCENDO", "SONATA"],
  ["EVEREST", "KILIMANJARO", "MATTERHORN", "VOLCANO", "AVALANCHE", "GLACIER", "PLATEAU"]
];

interface ParsedBatchScramble {
  title: string;
  words: string[];
}

function normalizeScrambledData(data: any): { original: string[]; scrambled: string[]; wordBank: string[] } | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    const original = data.map((item: any) => (typeof item === 'string' ? item : item.original || item.word || '')).filter(Boolean);
    const scrambled = data.map((item: any) => (typeof item === 'string' ? item : item.scrambled || item.original || '')).filter(Boolean);
    const wordBank = [...original].sort((a, b) => a.localeCompare(b));
    return { original, scrambled, wordBank };
  }
  if (typeof data === 'object') {
    const original = Array.isArray(data.original) ? data.original : [];
    const scrambled = Array.isArray(data.scrambled) ? data.scrambled : [];
    const wordBank = Array.isArray(data.wordBank)
      ? data.wordBank
      : [...original].sort((a, b) => a.localeCompare(b));
    return { original, scrambled, wordBank };
  }
  return null;
}

export function WordScrambleEditor({ page, updatePage, bulkAddPages }: any) {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    const selected = SCRAMBLE_POOLS[Math.floor(Math.random() * SCRAMBLE_POOLS.length)];
    return selected.join("\n");
  });
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    page.config.difficulty || "easy"
  );
  const [scrambledData, setScrambledData] = useState<any>(() =>
    normalizeScrambledData(page.config.scrambledData)
  );
  const [customCount, setCustomCount] = useState<number>(10);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const batchCsvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // Multi-puzzle batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawInput, setBatchRawInput] = useState("");
  const [parsedPuzzles, setParsedPuzzles] = useState<ParsedBatchScramble[]>([]);
  const [includeMatchingSolutions, setIncludeMatchingSolutions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Parse text or CSV into multiple scrambles
  const parseMultiScrambleText = (rawText: string): ParsedBatchScramble[] => {
    const text = rawText.trim();
    if (!text) return [];

    // 1. Check if separated by blank lines (blocks)
    const blocks = text.split(/\r?\n\s*\r?\n+/).map((b) => b.trim()).filter((b) => b.length > 0);

    if (blocks.length > 1) {
      const results: ParsedBatchScramble[] = [];
      blocks.forEach((block, idx) => {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        let title = `Word Scramble #${idx + 1}`;
        const firstLine = lines[0];
        const isExplicitTitle =
          firstLine.includes(":") ||
          firstLine.toUpperCase().startsWith("THEME") ||
          firstLine.toUpperCase().startsWith("TOPIC") ||
          firstLine.toUpperCase().startsWith("CATEGORY") ||
          firstLine.toUpperCase().startsWith("SCRAMBLE");

        let words: string[] = [];
        if (isExplicitTitle) {
          title = firstLine.replace(/^(THEME|TOPIC|CATEGORY|SCRAMBLE)\s*:?/i, "").replace(/^[:\-–]/, "").trim() || title;
          words = lines.slice(1).flatMap((l) => l.split(/[,;\t]/)).map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, "")).filter((w) => w.length > 1);
        } else {
          words = lines.flatMap((l) => l.split(/[,;\t]/)).map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, "")).filter((w) => w.length > 1);
        }

        if (words.length >= 3) {
          results.push({ title, words });
        }
      });
      if (results.length > 0) return results;
    }

    // 2. Otherwise parse row by row (each row is a scramble puzzle)
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const rowResults: ParsedBatchScramble[] = [];

    lines.forEach((line, idx) => {
      let title = `Word Scramble #${idx + 1}`;
      let remainingLine = line;

      // Check if row has "Title: Word1, Word2, ..."
      if (line.includes(":") && !line.startsWith("http")) {
        const parts = line.split(":");
        title = parts[0].trim();
        remainingLine = parts.slice(1).join(":");
      }

      const words = remainingLine
        .split(/[,;\t]/)
        .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
        .filter((w) => w.length > 1);

      if (words.length >= 3) {
        rowResults.push({ title, words });
      }
    });

    return rowResults;
  };

  // 📁 Multi-Puzzle CSV file upload handler
  const handleBatchCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setBatchRawInput(text);
      const parsed = parseMultiScrambleText(text);
      setParsedPuzzles(parsed);
      setIsBatchModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBatchInputChange = (val: string) => {
    setBatchRawInput(val);
    const parsed = parseMultiScrambleText(val);
    setParsedPuzzles(parsed);
  };

  // 🚀 Execute Batch Creation
  const handleExecuteBatchScrambleImport = () => {
    if (parsedPuzzles.length === 0) {
      alert("No valid scrambles detected. Please make sure each puzzle row or block has at least 3 words.");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // 1. Update active page with Scramble #1
      const firstPuz = parsedPuzzles[0];
      const scrambledList = firstPuz.words.map((w) => scrambleWord(w, difficulty));
      const wordBank = [...firstPuz.words].sort((a, b) => a.localeCompare(b));
      const firstResult = {
        original: firstPuz.words,
        scrambled: scrambledList,
        wordBank,
      };

      setInputText(firstPuz.words.join("\n"));
      setScrambledData(firstResult);
      updatePage({
        rawText: firstPuz.words.join("\n"),
        difficulty,
        scrambledData: firstResult,
        title: firstPuz.title,
        isSolution: false,
      });

      // 2. Prepare remaining pages
      const newConfigs: any[] = [];
      for (let i = 1; i < parsedPuzzles.length; i++) {
        const puz = parsedPuzzles[i];
        const sList = puz.words.map((w) => scrambleWord(w, difficulty));
        const wBank = [...puz.words].sort((a, b) => a.localeCompare(b));
        newConfigs.push({
          rawText: puz.words.join("\n"),
          difficulty,
          scrambledData: { original: puz.words, scrambled: sList, wordBank: wBank },
          title: puz.title,
          isSolution: false,
        });
      }

      // 3. If solutions requested, append solution pages for all puzzles
      if (includeMatchingSolutions) {
        parsedPuzzles.forEach((puz) => {
          const sList = puz.words.map((w) => scrambleWord(w, difficulty));
          const wBank = [...puz.words].sort((a, b) => a.localeCompare(b));
          newConfigs.push({
            rawText: puz.words.join("\n"),
            difficulty,
            scrambledData: { original: puz.words, scrambled: sList, wordBank: wBank },
            title: `${puz.title} (Solution)`,
            isSolution: true,
          });
        });
      }

      if (newConfigs.length > 0 && bulkAddPages) {
        bulkAddPages(newConfigs);
      }

      setIsImporting(false);
      setIsBatchModalOpen(false);
      const totalCreated = 1 + newConfigs.length;
      alert(`✅ Success! Created ${totalCreated} total pages from your CSV file (${parsedPuzzles.length} puzzle pages${includeMatchingSolutions ? ` + ${parsedPuzzles.length} solution pages` : ''}).`);
    }, 150);
  };

  // 📁 CSV / TXT import handler (one word per line, or comma-separated)
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      // If the file uses commas as delimiter, convert to newline
      const lines = text
        .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
        .split("\n")
        .flatMap((line) => line.split(","))
        .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
        .filter((w) => w.length > 0);
      setInputText(lines.join("\n"));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const scrambleWord = (word: string, diff: "easy" | "medium" | "hard"): string => {
    if (word.length <= 1) return word;

    if (diff === "easy" && word.length > 3) {
      const first = word[0];
      const last = word[word.length - 1];
      const middle = word.slice(1, -1).split("");

      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }

      const scrambled = first + middle.join("") + last;
      if (scrambled === word) return first + middle.reverse().join("") + last;
      return scrambled;
    }

    if (diff === "medium" && word.length > 2) {
      const first = word[0];
      const rest = word.slice(1).split("");

      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }

      const scrambled = first + rest.join("");
      if (scrambled === word) return first + rest.reverse().join("");
      return scrambled;
    }

    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    const scrambled = letters.join("");
    if (scrambled === word) return letters.reverse().join("");
    return scrambled;
  };

  const handleGenerate = () => {
    const parsed = inputText
      .split("\n")
      .map((w: string) => w.trim().toUpperCase())
      .filter((w: string) => w.length > 0 && /^[A-Z]+$/.test(w));

    if (parsed.length === 0) {
      alert("Please enter some words (letters only).");
      return;
    }

    const scrambledList = parsed.map((word: string) => scrambleWord(word, difficulty));
    const wordBank = [...parsed].sort((a, b) => a.localeCompare(b));

    const result = {
      original: parsed,
      scrambled: scrambledList,
      wordBank
    };

    setScrambledData(result);
    updatePage({
      rawText: inputText,
      difficulty,
      scrambledData: result,
      isSolution
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      rawText: inputText,
      difficulty,
      scrambledData,
      isSolution: solMode
    });
  };

  useEffect(() => {
    if (!scrambledData || !Array.isArray(scrambledData.scrambled) || scrambledData.scrambled.length === 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickAddScrambles = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const configs = [];
    for (let i = 0; i < num; i++) {
      const words = SCRAMBLE_POOLS[i % SCRAMBLE_POOLS.length];
      const scrambled = words.map((w) => scrambleWord(w, difficulty));
      const wordBank = [...words].sort((a, b) => a.localeCompare(b));
      configs.push({
        rawText: words.join("\n"),
        difficulty,
        scrambledData: { original: words, scrambled, wordBank },
        isSolution: false,
      });
    }
    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Word Scramble puzzles to your book!`);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Page Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggleMode(false)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${!isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                Puzzle
              </button>
              <button
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                Solution
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg font-bold text-xs capitalize transition ${difficulty === d
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Puzzle Batch CSV Button */}
        {bulkAddPages && (
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/60 border border-indigo-200 p-4 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Batch CSV Generator
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    1 CSV = entire book of scrambles
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => batchCsvInputRef.current?.click()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Full CSV (Multi-Page)
            </button>
            <input
              type="file"
              accept=".csv,.txt"
              ref={batchCsvInputRef}
              onChange={handleBatchCsvFile}
              className="hidden"
            />
          </div>
        )}

        {/* Quick Add Word Scramble Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Scramble Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400 capitalize">{difficulty}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleQuickAddScrambles(cnt)}
                  className="py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  +{cnt} Puzzles
                </button>
              ))}
            </div>

            {/* Custom Add Page Option */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
              <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-[11px] font-bold text-slate-500 mr-1.5 shrink-0">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full bg-transparent text-xs font-black text-slate-900 outline-none"
                  placeholder="20"
                />
                <span className="text-[10px] text-slate-400 font-bold ml-1 shrink-0">pages</span>
              </div>
              <button
                onClick={() => handleQuickAddScrambles(customCount)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Words (One per line)</label>
            <button
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition"
            >
              <Upload className="w-3 h-3" /> Import CSV / TXT
            </button>
            <input type="file" accept=".csv,.txt" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 min-h-[200px] p-4 border border-slate-200 rounded-xl text-sm font-mono shadow-inner bg-white outline-none focus:border-indigo-500"
            placeholder="Enter words (one per line) — or import a .csv/.txt file..."
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate Scramble
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 lg:p-10 shadow-2xl border border-slate-200 min-h-[400px] lg:min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-widest text-slate-800">
          Word Scramble {isSolution && <span className="text-indigo-600">(Solution)</span>}
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">
          Unscramble the letters below
        </p>

        {scrambledData && Array.isArray(scrambledData.scrambled) && scrambledData.scrambled.length > 0 ? (
          <div className="w-full max-w-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {scrambledData.scrambled.map((scrambled: string, wIdx: number) => {
                const solutionWord = scrambledData.original?.[wIdx] || "";
                return (
                  <div key={wIdx} className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300">#{wIdx + 1}</span>
                      <span className="text-sm font-bold tracking-widest text-slate-800 font-mono">
                        {(scrambled || "").split("").join(" ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSolution ? (
                        <span className="text-indigo-600 font-black font-mono border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-md text-xs">
                          {solutionWord}
                        </span>
                      ) : (
                        <span className="w-28 border-b-2 border-dashed border-slate-300 h-6"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Word Bank (Skip if Hard) */}
            {difficulty !== "hard" && !isSolution && Array.isArray(scrambledData.wordBank) && scrambledData.wordBank.length > 0 && (
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-2">Word Bank</h3>
                <div className="grid grid-cols-3 gap-2">
                  {scrambledData.wordBank.map((w: string, idx: number) => (
                    <span key={idx} className="text-xs font-semibold text-slate-600 text-center font-mono">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load scramble.</div>
        )}
      </div>

      {/* ⚡ Multi-Puzzle Batch Importer Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <Files className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Bulk CSV &amp; Multi-Scramble Importer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Generate an entire collection of word scramble pages from a single CSV or text file
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    CSV or Multi-Line Text Format
                  </label>
                  <span className="text-[11px] font-bold text-indigo-600">
                    1 row per puzzle OR empty line between puzzles
                  </span>
                </div>
                <textarea
                  value={batchRawInput}
                  onChange={(e) => handleBatchInputChange(e.target.value)}
                  className="w-full h-40 p-3.5 border border-slate-200 rounded-2xl text-xs font-mono bg-slate-50 text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="Format A (CSV Rows):&#10;Animals: Lion, Tiger, Elephant, Giraffe, Zebra&#10;Fruits: Apple, Banana, Orange, Mango, Peach&#10;&#10;Format B (Word Blocks separated by empty line):&#10;Theme: Solar System&#10;Mercury&#10;Venus&#10;Earth&#10;Mars"
                />
              </div>

              {/* Detected summary */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Detected Puzzles: <span className="text-indigo-600 font-bold">{parsedPuzzles.length}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Minimum 3 words per puzzle required)
                  </span>
                </div>

                {parsedPuzzles.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {parsedPuzzles.slice(0, 6).map((puz, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 p-2 rounded-xl text-xs flex items-center justify-between"
                      >
                        <span className="font-black text-slate-800 truncate max-w-[160px]">
                          {i + 1}. {puz.title}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {puz.words.slice(0, 5).join(", ")}{puz.words.length > 5 ? "..." : ""} ({puz.words.length} words)
                        </span>
                      </div>
                    ))}
                    {parsedPuzzles.length > 6 && (
                      <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                        + {parsedPuzzles.length - 6} more scrambles will be generated
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No valid scrambles found yet. Add words or paste CSV content above.</p>
                )}
              </div>

              {/* Matching Solutions Option */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeMatchingSolutions}
                  onChange={(e) => setIncludeMatchingSolutions(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Also generate matching Solution Pages
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Appends a complete solution unscrambled page for each created puzzle.
                  </div>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBatchScrambleImport}
                disabled={parsedPuzzles.length === 0 || isImporting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating {parsedPuzzles.length} Pages...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Generate &amp; Insert All {parsedPuzzles.length} Pages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
