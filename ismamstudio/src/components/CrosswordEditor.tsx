"use client";

import React, { useState, useRef } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { generateCrosswordGrid } from "@/app/utils/crosswordGenerator";

export const CrosswordEditor = ({ page, updatePage }: any) => {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    const pools = [
      "REACT, A popular UI library\nNEXTJS, A React framework\nVERCEL, Hosting platform\nCODING, Writing software",
      "BIRD, Can fly high in the sky\nFISH, Swims in the water",
      "SUN, Center of the solar system\nMOON, Earth's natural satellite\nMARS, The Red Planet\nEARTH, Our home planet",
      "PIZZA, Flatbread with cheese and tomato\nBURGER, Patty inside a bun\nSUSHI, Japanese raw fish dish\nPASTA, Italian noodle dish",
      "GUITAR, String instrument with frets\nPIANO, Keyed musical instrument\nDRUMS, Percussion instrument\nVIOLIN, Bowed string instrument"
    ];
    return pools[Math.floor(Math.random() * pools.length)];
  });
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);
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