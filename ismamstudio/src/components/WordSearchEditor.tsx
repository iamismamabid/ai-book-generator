"use client";
import React, { useState, useRef } from "react";
import { RefreshCw, Upload } from "lucide-react";

// Use your existing grid generation function
// Ensure this is imported correctly from your utils file
import { generatePuzzleGrid } from "@/app/utils/puzzleEngine"; 

export const WordSearchEditor = ({ page, updatePage }: any) => {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    const categories = [
      "LION, TIGER, ELEPHANT, GIRAFFE, ZEBRA, MONKEY, BEAR",
      "APPLE, BANANA, CHERRY, ORANGE, GRAPE, MANGO, PEACH",
      "PACIFIC, ATLANTIC, INDIAN, ARCTIC, SOUTHERN, OCEAN",
      "MARS, VENUS, JUPITER, SATURN, URANUS, NEPTUNE, PLUTO",
      "SOCCER, TENNIS, BASKETBALL, GOLF, CRICKET, RUGBY",
      "JAVA, RUST, KOTLIN, SWIFT, TYPESCRIPT, GOLANG",
      "LONDON, PARIS, TOKYO, SYDNEY, CAIRO, ROME, BERLIN",
      "COFFEE, TEA, JUICE, WATER, SODA, MILK, SHAKE",
      "PIZZA, BURGER, PASTA, SALAD, SUSHI, TACO, STEAK",
      "GUITAR, PIANO, DRUMS, VIOLIN, FLUTE, TRUMPET, HARP"
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  });
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // 📁 CSV / TXT import handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      // Convert any newlines or tabs into commas, then clean up extra commas
      const cleaned = text.replace(/[\r\n\t]+/g, ", ").replace(/,\s*,/g, ",").trim();
      setInputText(cleaned);
    };
    reader.readAsText(file);
    // Reset so same file can be re-uploaded
    e.target.value = "";
  };

  const handleGenerate = () => {
    const wordList = inputText.split(',').map((w: string) => w.trim()).filter((w: string) => w.length > 0);
    if (wordList.length === 0) return alert("Please enter some words.");

    // Assuming size 12 for the grid
    const result = generatePuzzleGrid(wordList, 12, 'uppercase');
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
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Words (comma separated)</label>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition"
          >
            <Upload className="w-3 h-3" /> Import CSV / TXT
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
          className="w-full h-72 p-4 border border-slate-200 rounded-xl text-sm font-mono shadow-inner bg-white outline-none focus:border-indigo-500"
          placeholder="Enter words separated by commas, or import a .csv/.txt file..."
        />
        <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
          <RefreshCw className="w-4 h-4 inline mr-2"/> Generate Word Search
        </button>
      </div>

      <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 lg:p-10 shadow-2xl border border-slate-200 min-h-[400px] lg:min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-slate-800">
          Word Search {isSolution && <span className="text-indigo-600">(Solution)</span>}
        </h1>
        
        {gridData ? (
          <div className="flex flex-col items-center max-w-full overflow-x-auto">
            <div className="grid border-2 border-slate-900 bg-white shadow-lg" style={{ gridTemplateColumns: `repeat(12, minmax(0, 1fr))` }}>
              {gridData.grid.map((row: string[], r: number) => row.map((letter: string, c: number) => {
                const isKeyWord = isSolution && gridData.mask && gridData.mask[r][c];
                return (
                  <div 
                    key={`${r}-${c}`} 
                    className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center border border-slate-200 text-xs sm:text-sm font-bold transition-all duration-300
                      ${isKeyWord ? 'bg-indigo-600 text-white border-indigo-700 rounded-md scale-105 shadow-sm' : 'text-slate-800'}`}
                  >
                    {letter}
                  </div>
                );
              }))}
            </div>

            <div className="w-full mt-10">
              <h3 className="font-black text-lg mb-4 uppercase tracking-wider">Words to Find</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                {gridData.words.map((w: any, i: number) => (
                  <span key={i} className={`font-medium ${isSolution ? 'line-through text-slate-400' : ''}`}>{w.text}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Enter words to generate your Word Search.</div>
        )}
      </div>
    </div>
  );
};