"use client";
import React, { useState, useRef } from "react";
import { RefreshCw, Upload, Files, Plus, ExternalLink, X, Check, FileSpreadsheet, Sparkles } from "lucide-react";
import { generatePuzzleGrid } from "@/app/utils/puzzleEngine"; 

const PRESET_CATEGORIES = [
  { name: "Wild Animals", words: ["LION", "TIGER", "ELEPHANT", "GIRAFFE", "ZEBRA", "MONKEY", "BEAR", "CHEETAH", "PANDA", "WOLF"] },
  { name: "Fresh Fruits", words: ["APPLE", "BANANA", "CHERRY", "ORANGE", "GRAPE", "MANGO", "PEACH", "PAPAYA", "BERRY", "LEMON"] },
  { name: "World Oceans", words: ["PACIFIC", "ATLANTIC", "INDIAN", "ARCTIC", "SOUTHERN", "CORAL", "TRENCH", "CURRENTS", "COAST", "REEF"] },
  { name: "Solar System", words: ["MERCURY", "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "COMET"] },
  { name: "Popular Sports", words: ["SOCCER", "TENNIS", "BASKETBALL", "GOLF", "CRICKET", "RUGBY", "HOCKEY", "BASEBALL", "BOXING", "SWIMMING"] },
  { name: "Programming", words: ["JAVASCRIPT", "PYTHON", "TYPESCRIPT", "RUST", "GOLANG", "KOTLIN", "REACT", "NEXTJS", "DOCKER", "PRISMA"] },
  { name: "World Capitals", words: ["LONDON", "PARIS", "TOKYO", "ROME", "BERLIN", "MADRID", "OTTAWA", "CAIRO", "BEIJING", "CANBERRA"] },
  { name: "Beverages", words: ["COFFEE", "TEA", "JUICE", "WATER", "SMOOTHIE", "ESPRESSO", "LATTE", "MATCHA", "CIDER", "SHAKE"] },
  { name: "World Cuisine", words: ["PIZZA", "BURGER", "PASTA", "SUSHI", "TACOS", "BURRITO", "CURRY", "FALAFEL", "RAMEN", "PAELLA"] },
  { name: "Musical Instruments", words: ["GUITAR", "PIANO", "DRUMS", "VIOLIN", "FLUTE", "TRUMPET", "SAXOPHONE", "CELLO", "HARP", "CLARINET"] },
  { name: "Gemstones", words: ["DIAMOND", "RUBY", "SAPPHIRE", "EMERALD", "AMETHYST", "TOPAZ", "OPAL", "JADE", "GARNET", "QUARTZ"] },
  { name: "Weather Wonders", words: ["THUNDER", "LIGHTNING", "BLIZZARD", "HURRICANE", "RAINBOW", "MONSOON", "TORNADO", "DRIZZLE", "SUNSHINE", "BREEZE"] },
  { name: "Forest Trees", words: ["OAK", "PINE", "MAPLE", "CEDAR", "BIRCH", "REDWOOD", "WILLOW", "SPRUCE", "CHESTNUT", "CYPRESS"] },
  { name: "Garden Flowers", words: ["ROSE", "TULIP", "ORCHID", "LILY", "DAISY", "SUNFLOWER", "JASMINE", "LAVENDER", "MARIGOLD", "LOTUS"] },
  { name: "Kitchen Utensils", words: ["SPATULA", "WHISK", "BLENDER", "TOASTER", "SKILLET", "CLEAVER", "GRATER", "COLANDER", "SAUCEPAN", "LADLE"] }
];

interface ParsedBatchPuzzle {
  title: string;
  words: string[];
}

export const WordSearchEditor = ({ page, updatePage, bulkAddPages }: any) => {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    const cat = PRESET_CATEGORIES[Math.floor(Math.random() * PRESET_CATEGORIES.length)];
    return cat.words.join(", ");
  });
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const batchCsvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // Multi-puzzle batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawInput, setBatchRawInput] = useState("");
  const [parsedPuzzles, setParsedPuzzles] = useState<ParsedBatchPuzzle[]>([]);
  const [includeMatchingSolutions, setIncludeMatchingSolutions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [quickAddCount, setQuickAddCount] = useState(5);

  // Parse text or CSV into multiple puzzles
  const parseMultiPuzzleText = (rawText: string): ParsedBatchPuzzle[] => {
    const text = rawText.trim();
    if (!text) return [];

    // 1. Check if text is separated into blocks by blank lines (e.g. 10 words per block)
    const blocks = text.split(/\r?\n\s*\r?\n+/).map((b) => b.trim()).filter((b) => b.length > 0);

    if (blocks.length > 1) {
      const results: ParsedBatchPuzzle[] = [];
      blocks.forEach((block, idx) => {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        let title = `Word Search #${idx + 1}`;

        const firstLine = lines[0];
        const isExplicitTitle =
          firstLine.includes(":") ||
          firstLine.startsWith("#") ||
          firstLine.toLowerCase().startsWith("puzzle") ||
          firstLine.toLowerCase().startsWith("theme") ||
          (firstLine.split(/\s+/).length >= 2 && lines.length > 4 && lines.slice(1).every((l) => l.split(/\s+/).length === 1));

        let contentLines = lines;
        if (isExplicitTitle) {
          if (firstLine.includes(":")) {
            const parts = firstLine.split(":");
            title = (parts[0] || parts[1]).trim() || title;
            const afterColon = parts.slice(1).join(":").trim();
            contentLines = afterColon ? [afterColon, ...lines.slice(1)] : lines.slice(1);
          } else {
            title = firstLine.replace(/^#+\s*/, "").trim() || title;
            contentLines = lines.slice(1);
          }
        }

        // Extract all words from content lines
        const rawWords = contentLines
          .flatMap((line) => line.split(/[,;\t\r\n]/))
          .map((w) => w.trim().replace(/^["']|["']$/g, "").toUpperCase())
          .filter((w) => w.length > 1 && !w.includes(":"));

        if (rawWords.length >= 3) {
          results.push({ title, words: rawWords });
        }
      });

      if (results.length > 0) return results;
    }

    // 2. Row-based / CSV parsing (1 line = 1 puzzle, separated by comma/tab/semicolon)
    const singleLines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const rowResults: ParsedBatchPuzzle[] = [];

    singleLines.forEach((line, idx) => {
      let title = `Word Search #${idx + 1}`;
      let wordsPart = line;

      if (line.includes(":") && line.indexOf(":") < 40) {
        const colonIdx = line.indexOf(":");
        title = line.substring(0, colonIdx).trim();
        wordsPart = line.substring(colonIdx + 1);
      }

      const rawWords = wordsPart
        .split(/[,;\t]/)
        .map((w) => w.trim().replace(/^["']|["']$/g, "").toUpperCase())
        .filter((w) => w.length > 1 && !w.includes(":"));

      if (rawWords.length >= 3) {
        rowResults.push({
          title,
          words: rawWords,
        });
      }
    });

    if (rowResults.length > 0) {
      return rowResults;
    }

    // 3. Fallback: If no lines had >= 3 words, treat all lines as a single puzzle (1 word per line)
    const allWords = singleLines
      .flatMap((l) => l.split(/[,;\t]/))
      .map((w) => w.trim().replace(/^["']|["']$/g, "").toUpperCase())
      .filter((w) => w.length > 1 && !w.includes(":"));

    if (allWords.length >= 3) {
      return [{
        title: "Word Search #1",
        words: allWords,
      }];
    }

    return [];
  };


  // 📁 Single-Page CSV / TXT import handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      const cleaned = text.replace(/[\r\n\t]+/g, ", ").replace(/,\s*,/g, ",").trim();
      setInputText(cleaned);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 📁 Multi-Puzzle CSV file upload handler
  const handleBatchCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setBatchRawInput(text);
      const parsed = parseMultiPuzzleText(text);
      setParsedPuzzles(parsed);
      setIsBatchModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBatchInputChange = (val: string) => {
    setBatchRawInput(val);
    const parsed = parseMultiPuzzleText(val);
    setParsedPuzzles(parsed);
  };

  // 🚀 Execute Batch Creation
  const handleExecuteBatchImport = () => {
    if (parsedPuzzles.length === 0) {
      alert("No valid puzzles detected. Please make sure each puzzle row has at least 3 words.");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // 1. Update active page with Puzzle #1
      const firstPuz = parsedPuzzles[0];
      const firstGrid = generatePuzzleGrid(firstPuz.words, 12, "uppercase");
      setInputText(firstPuz.words.join(", "));
      setGridData(firstGrid);
      updatePage({
        rawText: firstPuz.words.join(", "),
        gridData: firstGrid,
        title: firstPuz.title,
        isSolution: false,
      });

      // 2. Prepare remaining pages
      const newConfigs: any[] = [];

      for (let i = 1; i < parsedPuzzles.length; i++) {
        const puz = parsedPuzzles[i];
        const gData = generatePuzzleGrid(puz.words, 12, "uppercase");
        newConfigs.push({
          rawText: puz.words.join(", "),
          gridData: gData,
          title: puz.title,
          isSolution: false,
        });
      }

      // 3. If solutions requested, append solution pages for all puzzles
      if (includeMatchingSolutions) {
        parsedPuzzles.forEach((puz, pIdx) => {
          const gData = pIdx === 0 ? firstGrid : generatePuzzleGrid(puz.words, 12, "uppercase");
          newConfigs.push({
            rawText: puz.words.join(", "),
            gridData: gData,
            title: `${puz.title} (Solution)`,
            isSolution: true,
          });
        });
      }

      if (bulkAddPages && newConfigs.length > 0) {
        bulkAddPages(newConfigs);
      }

      setIsImporting(false);
      setIsBatchModalOpen(false);
      alert(`🎉 Successfully generated and added ${parsedPuzzles.length} Word Search pages to your book!`);
    }, 50);
  };

  // 🎲 Quick Add Random Themed Puzzles
  const handleQuickAddRandomPuzzles = (count: number) => {
    if (!bulkAddPages) return;
    const shuffled = [...PRESET_CATEGORIES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    const configs = selected.map((cat) => ({
      rawText: cat.words.join(", "),
      gridData: generatePuzzleGrid(cat.words, 12, "uppercase"),
      title: cat.name,
      isSolution: false,
    }));

    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} themed Word Search puzzles to your book!`);
  };

  const handleGenerate = () => {
    const wordList = inputText.split(",").map((w: string) => w.trim()).filter((w: string) => w.length > 0);
    if (wordList.length === 0) return alert("Please enter some words.");

    const result = generatePuzzleGrid(wordList, 12, "uppercase");
    setGridData(result);
    updatePage({ rawText: inputText, gridData: result, isSolution });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({ rawText: inputText, gridData, isSolution: solMode });
  };

  React.useEffect(() => {
    if (!gridData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* 💡 Top Banner pointing to standalone 50-100 page Word Search Studio */}
      <div className="px-4 pt-3 pb-1">
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 dark:border-indigo-800/60 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                Need an entire 50–100 Page Word Search Book in 1 Click?
              </h4>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Use our standalone Word Search Studio with automated answer keys, custom shapes, and bulk 1-click downloads.
              </p>
            </div>
          </div>
          <a
            href="/tools/word-search"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shrink-0 inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            Open Studio <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 p-2 sm:p-4 overflow-y-auto">
        {/* Left Settings Console */}
        <div className="w-full lg:w-84 lg:shrink-0 flex flex-col gap-4">
          
          {/* Multi-Puzzle Batch Importer Button (High Priority) */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-1.5">
              <Files className="w-4 h-4 text-indigo-200" />
              <h3 className="text-xs font-black uppercase tracking-wider">Bulk CSV & Multi-Page Import</h3>
            </div>
            <p className="text-[11px] text-indigo-100/90 leading-relaxed mb-3">
              Upload 1 CSV file with all your word categories to generate 10, 20, or 50+ puzzle pages all at once!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => batchCsvInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-white text-indigo-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" /> Upload CSV File
              </button>
              <button
                onClick={() => {
                  setIsBatchModalOpen(true);
                  if (parsedPuzzles.length === 0) {
                    const sample = "Wild Animals: Lion, Tiger, Elephant, Giraffe, Zebra\nFresh Fruits: Apple, Banana, Orange, Mango, Peach\nSolar System: Mercury, Venus, Earth, Mars, Jupiter";
                    setBatchRawInput(sample);
                    setParsedPuzzles(parseMultiPuzzleText(sample));
                  }
                }}
                className="py-2 px-3 bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-indigo-300/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Paste Text
              </button>
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              ref={batchCsvInputRef}
              onChange={handleBatchCsvFile}
              className="hidden"
            />
          </div>

          {/* Quick Themed Batch Adder */}
          {bulkAddPages && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Themed Pages
                </span>
                <span className="text-[10px] font-bold text-slate-400">Instant</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleQuickAddRandomPuzzles(cnt)}
                    className="py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    +{cnt} Puzzles
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Page Mode */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">Current Page View</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggleMode(false)}
                className={`py-2 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                  !isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                Puzzle Grid
              </button>
              <button
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                  isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                Solution Grid
              </button>
            </div>
          </div>

          {/* Active Page Word Editor */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Current Page Words
              </label>
              <button
                onClick={() => csvInputRef.current?.click()}
                className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <Upload className="w-3 h-3" /> Replace Page CSV
              </button>
              <input
                type="file"
                accept=".csv,.txt"
                ref={csvInputRef}
                onChange={handleCsvUpload}
                className="hidden"
              />
            </div>
            <textarea 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono shadow-inner bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
              placeholder="Enter words separated by commas..."
            />
            <button 
              onClick={handleGenerate} 
              className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl hover:bg-indigo-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Generate Current Grid
            </button>
          </div>
        </div>

        {/* Right Preview Display */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl min-h-[450px] lg:min-h-[650px] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-black text-center mb-6 uppercase tracking-widest text-slate-900 dark:text-slate-100">
            {page?.config?.title || "Word Search"} {isSolution && <span className="text-indigo-600 dark:text-indigo-400">(Solution)</span>}
          </h2>
          
          {gridData ? (
            <div className="flex flex-col items-center max-w-full overflow-x-auto">
              <div className="grid border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-950 shadow-md" style={{ gridTemplateColumns: `repeat(12, minmax(0, 1fr))` }}>
                {gridData.grid.map((row: string[], r: number) => row.map((letter: string, c: number) => {
                  const isKeyWord = isSolution && gridData.mask && gridData.mask[r][c];
                  return (
                    <div 
                      key={`${r}-${c}`} 
                      className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold transition-all duration-200
                        ${isKeyWord ? 'bg-indigo-600 text-white border-indigo-700 font-black' : 'text-slate-900 dark:text-slate-100'}`}
                    >
                      {letter}
                    </div>
                  );
                }))}
              </div>

              <div className="w-full max-w-md mt-8">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-3 text-center">
                  Words to Find ({gridData.words?.length || 0})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {gridData.words.map((w: any, i: number) => (
                    <div key={i} className={`px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-bold text-center ${isSolution ? 'line-through text-slate-400' : ''}`}>
                      {w.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">Enter words to generate your Word Search.</div>
          )}
        </div>
      </div>

      {/* ⚡ Multi-Puzzle Batch Importer Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <Files className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Bulk CSV & Multi-Puzzle Importer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Generate an entire collection of word search pages from a single CSV or text file
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    CSV or Multi-Line Text Format
                  </label>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    1 row per puzzle OR empty line between puzzles
                  </span>
                </div>
                <textarea
                  value={batchRawInput}
                  onChange={(e) => handleBatchInputChange(e.target.value)}
                  className="w-full h-40 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  placeholder="Format A (CSV Rows):&#10;Fruits: Apple, Banana, Orange, Mango&#10;Countries: Italy, France, Spain, Germany&#10;&#10;Format B (Word Blocks separated by empty line):&#10;Gold&#10;Map&#10;Chest&#10;&#10;Jewel&#10;Ruby&#10;Emerald"
                />
              </div>

              {/* Detected summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Detected Puzzles: <span className="text-indigo-600 dark:text-indigo-400">{parsedPuzzles.length}</span>
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
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs flex items-center justify-between"
                      >
                        <span className="font-black text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                          {i + 1}. {puz.title}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {puz.words.slice(0, 5).join(", ")}{puz.words.length > 5 ? "..." : ""} ({puz.words.length} words)
                        </span>
                      </div>
                    ))}
                    {parsedPuzzles.length > 6 && (
                      <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                        + {parsedPuzzles.length - 6} more puzzles will be generated
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No valid puzzles found yet. Add words or paste CSV content above.</p>
                )}
              </div>

              {/* Matching Solutions Option */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeMatchingSolutions}
                  onChange={(e) => setIncludeMatchingSolutions(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Also generate matching Solution Pages
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Appends a complete solution grid page for each created puzzle.
                  </div>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBatchImport}
                disabled={parsedPuzzles.length === 0 || isImporting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating {parsedPuzzles.length} Pages...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Generate & Insert All {parsedPuzzles.length} Pages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};