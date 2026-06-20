"use client";
import React, { useState } from "react";
import { RefreshCw, Search } from "lucide-react";

// Use your existing grid generation function
// Ensure this is imported correctly from your utils file
import { generatePuzzleGrid } from "../utils/puzzleEngine"; 

export const WordSearchEditor = ({ page, updatePage }: any) => {
  const [inputText, setInputText] = useState(page.config.rawText || "NEXTJS, REACT, PRISMA, TAILWIND, CODING, JAVASCRIPT");
  const [gridData, setGridData] = useState<any>(page.config.gridData || null);

  const handleGenerate = () => {
    const wordList = inputText.split(',').map((w: string) => w.trim()).filter(w => w.length > 0);
    if (wordList.length === 0) return alert("Please enter some words.");

    // Assuming size 12 for the grid
    const result = generatePuzzleGrid(wordList, 12, 'uppercase');
    setGridData(result);
    updatePage({ rawText: inputText, gridData: result });
  };

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      <div className="w-80 flex flex-col gap-4">
        <textarea 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-80 p-4 border border-slate-200 rounded-xl text-sm font-mono shadow-inner"
          placeholder="Enter words separated by commas..."
        />
        <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
          <RefreshCw className="w-4 h-4 inline mr-2"/> Generate Word Search
        </button>
      </div>

      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 aspect-[8.5/11]">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest">Word Search</h1>
        
        {gridData ? (
          <div className="flex flex-col items-center">
            <div className="grid border-2 border-slate-900 bg-white" style={{ gridTemplateColumns: `repeat(12, minmax(0, 1fr))` }}>
              {gridData.grid.map((row: string[], r: number) => row.map((letter: string, c: number) => (
                  <div key={`${r}-${c}`} className="w-8 h-8 flex items-center justify-center border border-slate-200 text-sm font-bold">
                    {letter}
                  </div>
              )))}
            </div>

            <div className="w-full mt-10">
              <h3 className="font-black text-lg mb-4 uppercase tracking-wider">Words to Find</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                {gridData.words.map((w: any, i: number) => (
                  <span key={i} className="font-medium">{w.text}</span>
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