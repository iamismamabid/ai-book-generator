"use client";

import React, { useState, useRef } from "react";
import { RefreshCw, Upload, Sparkles, Plus, Files, FileSpreadsheet, Check, X } from "lucide-react";
import { generateCrosswordGrid } from "@/app/utils/crosswordGenerator";

const CROSSWORD_POOLS = [
  "REACT, A popular UI library\nNEXTJS, A React framework\nVERCEL, Hosting platform\nCODING, Writing software\nSERVER, Backend computer",
  "BIRD, Can fly high in the sky\nFISH, Swims in the water\nLION, King of the jungle\nTIGER, Big striped cat\nEAGLE, Majestic bird of prey",
  "SUN, Center of the solar system\nMOON, Earth's natural satellite\nMARS, The Red Planet\nEARTH, Our home planet\nVENUS, Bright morning star",
  "PIZZA, Flatbread with cheese and tomato\nBURGER, Patty inside a bun\nSUSHI, Japanese raw fish dish\nPASTA, Italian noodle dish\nTACOS, Mexican folded tortilla",
  "GUITAR, String instrument with frets\nPIANO, Keyed musical instrument\nDRUMS, Percussion instrument\nVIOLIN, Bowed string instrument\nFLUTE, Wind instrument",
  "OCEAN, Vast body of saltwater\nRIVER, Flowing stream of water\nLAKE, Large inland water body\nGLACIER, Moving mass of ice\nISLAND, Land surrounded by water",
  "APPLE, Sweet red or green fruit\nBANANA, Long curved yellow fruit\nORANGE, Citrus fruit with peeling\nGRAPE, Small berry growing in clusters\nMANGO, Tropical stone fruit",
  "DOCTOR, Treats sick patients\nNURSE, Assists medical care\nTEACHER, Educates students in school\nARTIST, Creates visual paintings\nAUTHOR, Writes published books",
  "AUTUMN, Season of falling leaves\nWINTER, Coldest snowy season\nSPRING, Season of blooming flowers\nSUMMER, Warmest sunny season\nBREEZE, Gentle refreshing wind",
  "CASTLE, Fortified medieval residence\nPALACE, Grand royal residence\nTEMPLE, Sacred place of worship\nPYRAMID, Ancient monumental tomb\nBRIDGE, Structure spanning across water"
];

interface ParsedBatchCrossword {
  title: string;
  items: { word: string; clue: string }[];
}

export const CrosswordEditor = ({ page, updatePage, bulkAddPages }: any) => {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    return CROSSWORD_POOLS[Math.floor(Math.random() * CROSSWORD_POOLS.length)];
  });
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);
  const [customCount, setCustomCount] = useState<number>(10);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const batchCsvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // Multi-puzzle batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawInput, setBatchRawInput] = useState("");
  const [parsedPuzzles, setParsedPuzzles] = useState<ParsedBatchCrossword[]>([]);
  const [includeMatchingSolutions, setIncludeMatchingSolutions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Parse text or CSV into multiple crosswords
  const parseMultiCrosswordText = (rawText: string): ParsedBatchCrossword[] => {
    const text = rawText.trim();
    if (!text) return [];

    // 1. Check if separated by blank lines (blocks)
    const blocks = text.split(/\r?\n\s*\r?\n+/).map((b) => b.trim()).filter((b) => b.length > 0);

    if (blocks.length > 1) {
      const results: ParsedBatchCrossword[] = [];
      blocks.forEach((block, idx) => {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        let title = `Crossword #${idx + 1}`;
        const firstLine = lines[0];
        const isExplicitTitle =
          firstLine.toUpperCase().startsWith("THEME") ||
          firstLine.toUpperCase().startsWith("TOPIC") ||
          firstLine.toUpperCase().startsWith("TITLE") ||
          firstLine.toUpperCase().startsWith("CROSSWORD");

        let startIdx = 0;
        if (isExplicitTitle) {
          title = firstLine.replace(/^(THEME|TOPIC|TITLE|CROSSWORD)\s*:?/i, "").replace(/^[:\-–]/, "").trim() || title;
          startIdx = 1;
        }

        const items: { word: string; clue: string }[] = [];
        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const commaIdx = line.indexOf(",");
          if (commaIdx !== -1) {
            const w = line.slice(0, commaIdx).trim().toUpperCase().replace(/[^A-Z]/g, "");
            const c = line.slice(commaIdx + 1).trim() || `Clue for ${w}`;
            if (w.length >= 2) items.push({ word: w, clue: c });
          } else {
            const sepMatch = line.match(/[:\-–]/);
            if (sepMatch && sepMatch.index !== undefined) {
              const w = line.slice(0, sepMatch.index).trim().toUpperCase().replace(/[^A-Z]/g, "");
              const c = line.slice(sepMatch.index + 1).trim() || `Clue for ${w}`;
              if (w.length >= 2) items.push({ word: w, clue: c });
            } else {
              const w = line.trim().toUpperCase().replace(/[^A-Z]/g, "");
              if (w.length >= 2) items.push({ word: w, clue: `Word: ${w}` });
            }
          }
        }

        if (items.length >= 3) {
          results.push({ title, items });
        }
      });
      if (results.length > 0) return results;
    }

    // 2. Otherwise parse row by row
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const rowResults: ParsedBatchCrossword[] = [];

    lines.forEach((line, idx) => {
      let title = `Crossword #${idx + 1}`;
      let remainingLine = line;

      if (line.includes(":") && !line.startsWith("http")) {
        const parts = line.split(":");
        title = parts[0].trim();
        remainingLine = parts.slice(1).join(":");
      }

      const items: { word: string; clue: string }[] = [];
      if (remainingLine.includes(";")) {
        const pairs = remainingLine.split(";");
        pairs.forEach((p) => {
          const pParts = p.split(",");
          const w = pParts[0]?.trim().toUpperCase().replace(/[^A-Z]/g, "") || "";
          const c = pParts[1]?.trim() || `Clue for ${w}`;
          if (w.length >= 2) items.push({ word: w, clue: c });
        });
      } else {
        const words = remainingLine.split(/[,;\t]/).map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, "")).filter((w) => w.length >= 2);
        words.forEach((w) => {
          items.push({ word: w, clue: `Word: ${w}` });
        });
      }

      if (items.length >= 3) {
        rowResults.push({ title, items });
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
      const parsed = parseMultiCrosswordText(text);
      setParsedPuzzles(parsed);
      setIsBatchModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBatchInputChange = (val: string) => {
    setBatchRawInput(val);
    const parsed = parseMultiCrosswordText(val);
    setParsedPuzzles(parsed);
  };

  // 🚀 Execute Batch Creation
  const handleExecuteBatchCrosswordImport = () => {
    if (parsedPuzzles.length === 0) {
      alert("No valid crosswords detected. Please make sure each puzzle has at least 3 words.");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // 1. Update active page with Crossword #1
      const firstPuz = parsedPuzzles[0];
      const firstRaw = firstPuz.items.map((it) => `${it.word}, ${it.clue}`).join("\n");
      const firstGrid = generateCrosswordGrid(firstPuz.items, 15);

      setInputText(firstRaw);
      setGridData(firstGrid);
      updatePage({
        rawText: firstRaw,
        gridData: firstGrid,
        title: firstPuz.title,
        isSolution: false,
      });

      // 2. Prepare remaining pages
      const newConfigs: any[] = [];
      for (let i = 1; i < parsedPuzzles.length; i++) {
        const puz = parsedPuzzles[i];
        const raw = puz.items.map((it) => `${it.word}, ${it.clue}`).join("\n");
        const gData = generateCrosswordGrid(puz.items, 15);
        newConfigs.push({
          rawText: raw,
          gridData: gData,
          title: puz.title,
          isSolution: false,
        });
      }

      // 3. If solutions requested, append solution pages for all puzzles
      if (includeMatchingSolutions) {
        parsedPuzzles.forEach((puz, pIdx) => {
          const raw = puz.items.map((it) => `${it.word}, ${it.clue}`).join("\n");
          const gData = pIdx === 0 ? firstGrid : generateCrosswordGrid(puz.items, 15);
          newConfigs.push({
            rawText: raw,
            gridData: gData,
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

  // 📁 CSV / TXT import handler (format: WORD, Clue per line)
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      // Normalize line endings and set directly - crossword already parses WORD, Clue per line
      const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      setInputText(cleaned);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleGenerate = () => {
    const lines = inputText.split('\n').filter((l: string) => l.trim().length > 0);
    const wordList = lines.map((l: string) => {
      const parts = l.split(',');
      return { word: parts[0]?.trim() || '', clue: parts[1]?.trim() || '' };
    }).filter((item: any) => item.word.length > 0);

    if (wordList.length === 0) return alert("Please enter words and clues.");

    const result = generateCrosswordGrid(wordList, 15);
    setGridData(result);
    updatePage({ rawText: inputText, gridData: result, isSolution });
  };

  const handleQuickAddCrosswords = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const configs = [];
    for (let i = 0; i < num; i++) {
      const pool = CROSSWORD_POOLS[i % CROSSWORD_POOLS.length];
      const lines = pool.split('\n').filter((l: string) => l.trim().length > 0);
      const wordList = lines.map((l: string) => {
        const parts = l.split(',');
        return { word: parts[0]?.trim() || '', clue: parts[1]?.trim() || '' };
      }).filter((item: any) => item.word.length > 0);

      const gridResult = generateCrosswordGrid(wordList, 15);
      configs.push({
        rawText: pool,
        gridData: gridResult,
        isSolution: false,
      });
    }
    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Crossword puzzles to your book!`);
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
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Editor Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Page Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToggleMode(false)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                !isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Puzzle Grid
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                isSolution
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Solution Grid
            </button>
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
                    1 CSV = entire book of crosswords
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

        {/* Quick Add Crossword Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Crossword Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400">Themed</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleQuickAddCrosswords(cnt)}
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
                onClick={() => handleQuickAddCrosswords(customCount)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Words &amp; Clues</label>
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
          className="w-full h-72 p-4 border border-slate-200 rounded-xl text-sm font-mono shadow-inner bg-white outline-none focus:border-indigo-500"
          placeholder="WORD, Clue (one per line) — or import a .csv/.txt file"
        />
        <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
          <RefreshCw className="w-4 h-4 inline mr-2"/> Generate Puzzle
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 lg:p-10 shadow-2xl border border-slate-200 min-h-[500px] lg:min-h-[900px]">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-slate-800">
          {page?.config?.title || "Crossword"} {isSolution && <span className="text-indigo-600">(Solution)</span>}
        </h1>
        
        {gridData ? (
          <div className="flex flex-col items-center max-w-full overflow-x-auto">
            {/* একক এবং সঠিক গ্রিড রেন্ডারার */}
            <div className="grid border-4 border-slate-900 bg-slate-900 shadow-xl" 
                 style={{ gridTemplateColumns: `repeat(15, minmax(0, 1fr))` }}>
              {gridData.grid.map((row: any[], r: number) => 
                row.map((cell: string, c: number) => {
                  const isBlank = cell === '';
                  const wordStart = gridData.placedWords.find((w: any) => w.r === r && w.c === c);
                  return (
                    <div key={`${r}-${c}`} 
                         className={`w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center relative 
                         ${isBlank ? 'bg-slate-900' : 'bg-white border-[0.5px] border-slate-900'}`}>
                      {wordStart && <span className="absolute top-0 left-0.5 text-[8px] font-bold text-slate-800">{wordStart.num}</span>}
                      {isSolution && !isBlank && <span className="text-sm font-black text-slate-800">{cell}</span>}
                    </div>
                  );
                })
              )}
            </div>

            {/* Clues Section */}
            <div className="w-full mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 border-t border-slate-200 pt-6">
              <div>
                <h3 className="font-black text-lg mb-3 uppercase tracking-wider">Across</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {gridData.placedWords.filter((w: any) => w.dir === 'H').map((w: any) => (
                    <li key={w.num} className="flex gap-2"><span className="font-bold text-slate-900">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-black text-lg mb-3 uppercase tracking-wider">Down</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {gridData.placedWords.filter((w: any) => w.dir === 'V').map((w: any) => (
                    <li key={w.num} className="flex gap-2"><span className="font-bold text-slate-900">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Enter words to generate your crossword.</div>
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
                    Bulk CSV &amp; Multi-Crossword Importer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Generate an entire collection of crossword pages from a single CSV or text file
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
                    WORD, Clue per line OR empty line between puzzles
                  </span>
                </div>
                <textarea
                  value={batchRawInput}
                  onChange={(e) => handleBatchInputChange(e.target.value)}
                  className="w-full h-40 p-3.5 border border-slate-200 rounded-2xl text-xs font-mono bg-slate-50 text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="Format A (Crossword Blocks separated by blank lines):&#10;Theme: Solar System&#10;SUN, Center of the solar system&#10;MOON, Earth natural satellite&#10;MARS, The red planet&#10;&#10;Theme: Ocean Life&#10;SHARK, Ocean apex predator&#10;DOLPHIN, Intelligent marine mammal&#10;WHALE, Largest ocean creature&#10;&#10;Format B (Word rows):&#10;Space: ASTRONAUT, ROCKET, GALAXY, PLANET"
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
                          {puz.items.slice(0, 4).map((it) => it.word).join(", ")}{puz.items.length > 4 ? "..." : ""} ({puz.items.length} words)
                        </span>
                      </div>
                    ))}
                    {parsedPuzzles.length > 6 && (
                      <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                        + {parsedPuzzles.length - 6} more crosswords will be generated
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No valid crosswords found yet. Add words &amp; clues or paste CSV content above.</p>
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
                    Appends a complete solution crossword grid page for each created puzzle.
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
                onClick={handleExecuteBatchCrosswordImport}
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
};