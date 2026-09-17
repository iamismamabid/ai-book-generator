"use client";

import React, { useState, useRef } from "react";
import { RefreshCw, Upload, Sparkles, Plus } from "lucide-react";
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

export const CrosswordEditor = ({ page, updatePage, bulkAddPages }: any) => {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    return CROSSWORD_POOLS[Math.floor(Math.random() * CROSSWORD_POOLS.length)];
  });
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);
  const [customCount, setCustomCount] = useState<number>(10);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

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
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest">
          Crossword {isSolution && <span className="text-indigo-600">(Solution)</span>}
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
    </div>
  );
};