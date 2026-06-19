import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, FileDown, Settings, Type, LayoutGrid, 
  RefreshCw, BookOpen, Eye, EyeOff, LayoutTemplate 
} from "lucide-react";

// ==========================================
// 🧩 1. STANDARDIZED DATA MODELS
// ==========================================

export interface PuzzleOutput {
  grid: string[][];
  placedWords: any[];
  mask?: boolean[][]; 
}

export interface BookPage {
  id: string;
  type: 'word_search' | 'crossword' | 'maze' | 'sudoku' | 'blank_journal';
  config: {
    rawText?: string;
    gridData?: PuzzleOutput;
    gridSize?: number;
    showSolution?: boolean;
    solutionStyle?: 'apple' | 'fill' | 'fade'; // NEW: Highlighter mode
  };
}

// ==========================================
// 🧠 2. PUZZLE GENERATOR ALGORITHMS
// ==========================================

function generateCrosswordGrid(wordList: {word: string, clue: string}[], gridSize = 15): PuzzleOutput {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords: any[] = [];
  const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

  if (sortedWords.length === 0) return { grid, placedWords };

  const firstWord = sortedWords[0].word.toUpperCase().replace(/[^A-Z]/g, '');
  const startR = Math.floor(gridSize / 2);
  const startC = Math.floor((gridSize - firstWord.length) / 2);

  for (let i = 0; i < firstWord.length; i++) grid[startR][startC + i] = firstWord[i];
  placedWords.push({ word: firstWord, clue: sortedWords[0].clue, r: startR, c: startC, dir: 'H', num: 1 });

  let currentNum = 2;

  for (let w = 1; w < sortedWords.length; w++) {
    const currentWord = sortedWords[w].word.toUpperCase().replace(/[^A-Z]/g, '');
    let placed = false;

    for (let l = 0; l < currentWord.length && !placed; l++) {
      const letter = currentWord[l];
      for (let r = 0; r < gridSize && !placed; r++) {
        for (let c = 0; c < gridSize && !placed; c++) {
          if (grid[r][c] === letter) {
            // Try Vertical
            let canPlaceV = true;
            const startRV = r - l;
            if (startRV < 0 || startRV + currentWord.length > gridSize) canPlaceV = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[startRV + i][c] !== '' && grid[startRV + i][c] !== currentWord[i]) canPlaceV = false;
              }
            }
            if (canPlaceV) {
              for (let i = 0; i < currentWord.length; i++) grid[startRV + i][c] = currentWord[i];
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: startRV, c: c, dir: 'V', num: currentNum++ });
              placed = true; break;
            }

            // Try Horizontal
            let canPlaceH = true;
            const startCH = c - l;
            if (startCH < 0 || startCH + currentWord.length > gridSize) canPlaceH = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[r][startCH + i] !== '' && grid[r][startCH + i] !== currentWord[i]) canPlaceH = false;
              }
            }
            if (canPlaceH) {
              for (let i = 0; i < currentWord.length; i++) grid[r][startCH + i] = currentWord[i];
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: r, c: startCH, dir: 'H', num: currentNum++ });
              placed = true; break;
            }
          }
        }
      }
    }
  }
  return { grid, placedWords };
}

function generateWordSearchGrid(wordList: string[], size = 15): PuzzleOutput {
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const mask = Array(size).fill(null).map(() => Array(size).fill(false)); 
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]]; // E, S, SE, NE
  const placedWords: any[] = [];
  
  const cleanWords = wordList.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length > 0);

  cleanWords.forEach(word => {
    let placed = false; 
    let attempts = 0;
    while (!placed && attempts < 200) { 
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const minRow = dir[0] === -1 ? word.length - 1 : 0; 
      const maxRow = dir[0] === 1 ? size - word.length : size - 1;
      const minCol = 0; 
      const maxCol = dir[1] === 1 ? size - word.length : size - 1;
      
      const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
      const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + (dir[0] * i); 
        const c = col + (dir[1] * i);
        if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== word[i])) { 
          canPlace = false; break; 
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = row + (dir[0] * i); 
          const c = col + (dir[1] * i);
          grid[r][c] = word[i]; 
          mask[r][c] = true; 
        }
        placed = true;
        placedWords.push({ word, startR: row, startC: col, endR: row + (dir[0] * (word.length - 1)), endC: col + (dir[1] * (word.length - 1)) });
      }
      attempts++;
    }
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]; 
    }
  }
  return { grid, placedWords, mask };
}


// ==========================================
// 🎨 3. EDITOR COMPONENTS
// ==========================================

const CrosswordEditor = ({ page, updatePage }: { page: BookPage, updatePage: any }) => {
  const [inputText, setInputText] = useState(
    page.config.rawText || "REACT, A popular UI library\nNEXTJS, A React framework\nVERCEL, Hosting platform\nCODING, Writing software"
  );
  
  const gridSize = page.config.gridSize || 15;
  const gridData = page.config.gridData;

  const handleGenerate = () => {
    const lines = inputText.split('\n').filter(l => l.trim().length > 0);
    const wordList = lines.map(l => {
      const parts = l.split(',');
      return { word: parts[0]?.trim() || '', clue: parts[1]?.trim() || '' };
    }).filter(item => item.word.length > 0);

    if (wordList.length === 0) return alert("Please enter at least one word and clue.");

    const result = generateCrosswordGrid(wordList, gridSize);
    updatePage({ rawText: inputText, gridData: result, gridSize });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-full p-4">
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Words & Clues (Word, Clue)</label>
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-64 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="APPLE, A red fruit&#10;BANANA, A yellow fruit"
          />
        </div>
        <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-sm">
          <RefreshCw className="w-4 h-4"/> Generate Crossword
        </button>
      </div>

      <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-xl rounded-sm flex flex-col items-center p-6 relative aspect-[8.5/11] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-slate-800">Crossword Puzzle</h2>
        {gridData ? (
          <div className="flex flex-col items-center w-full max-w-lg">
            <div className="grid gap-0 border-2 border-slate-800 bg-slate-800 w-full" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              {gridData.grid.map((row, r) => 
                row.map((cell, c) => {
                  const isBlank = cell === '';
                  const startWord = gridData.placedWords.find(w => w.r === r && w.c === c);
                  return (
                    <div key={`${r}-${c}`} className={`aspect-square flex items-center justify-center relative ${isBlank ? 'bg-slate-800' : 'bg-white border border-slate-800'}`}>
                      {startWord && <span className="absolute top-0.5 left-1 text-[8px] sm:text-[10px] font-bold text-slate-600 leading-none">{startWord.num}</span>}
                    </div>
                  );
                })
              )}
            </div>

            <div className="w-full mt-8 grid grid-cols-2 gap-6 text-xs text-slate-700">
              <div>
                <h3 className="font-black border-b-2 border-slate-200 pb-1 mb-3 uppercase tracking-wider text-slate-800">Across</h3>
                <ul className="space-y-2">
                  {gridData.placedWords.filter(w => w.dir === 'H').sort((a,b)=>a.num-b.num).map(w => (
                    <li key={w.num} className="leading-relaxed"><span className="font-bold mr-1 text-slate-900">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-black border-b-2 border-slate-200 pb-1 mb-3 uppercase tracking-wider text-slate-800">Down</h3>
                <ul className="space-y-2">
                  {gridData.placedWords.filter(w => w.dir === 'V').sort((a,b)=>a.num-b.num).map(w => (
                    <li key={w.num} className="leading-relaxed"><span className="font-bold mr-1 text-slate-900">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center text-center h-full justify-center">
            <LayoutGrid className="w-16 h-16 mb-4 opacity-20" />
            <p>Add words and click Generate to see your Crossword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WordSearchEditor = ({ page, updatePage }: { page: BookPage, updatePage: any }) => {
  const [inputText, setInputText] = useState(
    page.config.rawText || "NEXTJS\nREACT\nPRISMA\nTAILWIND\nCODING\nJAVASCRIPT\nTYPESCRIPT\nDATABASE"
  );
  
  const gridSize = page.config.gridSize || 12;
  const gridData = page.config.gridData;
  const showSolution = page.config.showSolution || false;
  const solutionStyle = page.config.solutionStyle || 'apple';

  const handleGenerate = () => {
    const wordList = inputText.split('\n').map(w => w.trim()).filter(w => w.length > 2);
    if (wordList.length === 0) return alert("Please enter at least one valid word.");
    
    const result = generateWordSearchGrid(wordList, gridSize);
    updatePage({ rawText: inputText, gridData: result, gridSize, showSolution: false, solutionStyle });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-full p-4">
      {/* Editor Settings */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Word List (One per line)</label>
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 p-3 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="APPLE&#10;BANANA&#10;CHERRY"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Solution Highlighter</label>
          <select 
            value={solutionStyle}
            onChange={(e) => updatePage({ ...page.config, solutionStyle: e.target.value as any })}
            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
          >
            <option value="apple">Apple Style (Rounded Pill)</option>
            <option value="fade">Fade Style (Watermark)</option>
            <option value="fill">Fill Style (Blocks)</option>
          </select>
        </div>

        <button onClick={handleGenerate} className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition shadow-sm mt-auto">
          <RefreshCw className="w-4 h-4"/> Generate Word Search
        </button>
      </div>

      {/* Live Preview Canvas */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-xl rounded-sm flex flex-col items-center p-6 relative aspect-[8.5/11] overflow-y-auto custom-scrollbar">
        {gridData && (
           <button 
            onClick={() => updatePage({ ...page.config, showSolution: !showSolution })} 
            className={`absolute top-4 right-4 p-2 rounded-full z-20 transition-colors shadow-sm ${showSolution ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Toggle Solution"
          >
            {showSolution ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
          </button>
        )}

        <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-slate-800">Word Search</h2>
        
        {gridData ? (
          <div className="flex flex-col items-center w-full max-w-md">
            <div className="grid w-full aspect-square relative" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              
              {/* --- 🎨 NEW: APPLE STYLE SVG OVERLAY --- */}
              {showSolution && solutionStyle === 'apple' && (
                  <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {gridData.placedWords.map((w, i) => {
                          const len = Math.hypot(w.endC - w.startC, w.endR - w.startR); 
                          const ang = Math.atan2(w.endR - w.startR, w.endC - w.startC) * (180 / Math.PI);
                          return (
                            <rect 
                              key={i} 
                              x={w.startC + 0.15} 
                              y={w.startR + 0.15} 
                              width={len + 0.70} 
                              height={0.70} 
                              rx="0.35" 
                              transform={`rotate(${ang}, ${w.startC + 0.5}, ${w.startR + 0.5})`} 
                              fill="rgba(79, 70, 229, 0.15)" 
                              stroke="#4F46E5" 
                              strokeWidth="0.08" 
                            />
                          );
                      })}
                  </svg>
              )}

              {/* Grid Cells */}
              {gridData.grid.map((row, r) => 
                row.map((cell, c) => {
                  const isAnswer = gridData.mask?.[r][c];
                  
                  // Dynamic Styles based on Highlighter selection
                  let cellClasses = 'text-slate-800 bg-transparent';
                  
                  if (showSolution) {
                    if (solutionStyle === 'fill') {
                      cellClasses = isAnswer ? 'bg-indigo-100 text-indigo-800' : 'text-slate-800';
                    } 
                    else if (solutionStyle === 'fade') {
                      cellClasses = isAnswer ? 'text-slate-900 font-black' : 'text-slate-200';
                    }
                    else if (solutionStyle === 'apple') {
                       // The SVG handles the shape, we just fade non-answers slightly for clarity
                      cellClasses = isAnswer ? 'text-indigo-900' : 'text-slate-300';
                    }
                  }

                  return (
                    <div 
                      key={`${r}-${c}`} 
                      className={`flex items-center justify-center text-sm sm:text-lg font-bold border border-slate-50 transition-colors duration-300 z-0 ${cellClasses}`}
                    >
                      {cell}
                    </div>
                  );
                })
              )}
            </div>

            {/* Word List */}
            <div className="w-full mt-8 pt-6 border-t border-slate-100">
              <h3 className="font-bold text-xs mb-3 uppercase text-slate-400 tracking-tighter text-center">Words to Find</h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs font-semibold text-slate-700 text-center">
                {gridData.placedWords.map((w, i) => (
                  <span key={i} className={showSolution ? "line-through opacity-50 text-indigo-600" : ""}>{w.word}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center text-center h-full justify-center">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p>Add words and click Generate to see your Word Search.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// 📖 4. MAIN BOOK BUILDER ORCHESTRATOR
// ==========================================

export default function App() {
  const [bookPages, setBookPages] = useState<BookPage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kdp_studio_pages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setBookPages(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved pages", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("kdp_studio_pages", JSON.stringify(bookPages));
    }
  }, [bookPages, isLoaded]);

  const addPageToBook = (type: BookPage['type']) => {
    const newPage: BookPage = { id: `page-${Date.now()}`, type: type, config: {} };
    const updatedPages = [...bookPages, newPage];
    setBookPages(updatedPages);
    setActiveIndex(updatedPages.length - 1);
  };

  const removePage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filteredPages = bookPages.filter((p) => p.id !== id);
    setBookPages(filteredPages);
    if (activeIndex >= filteredPages.length) {
      setActiveIndex(Math.max(0, filteredPages.length - 1));
    }
  };

  const updatePageConfig = (id: string, newConfig: any) => {
    setBookPages(bookPages.map(page => page.id === id ? { ...page, config: newConfig } : page));
  };

  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading Studio...</div>;

  return (
    <div className="flex h-screen bg-slate-200/50 p-4 font-sans">
      <div className="flex w-full h-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xl">
        {/* LEFT SIDEBAR: Puzzles */}
        <div className="w-64 bg-slate-50 p-4 border-r border-slate-200 overflow-y-auto flex flex-col">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Add to Book</h3>
          <div className="space-y-2 flex flex-col">
            <button onClick={() => addPageToBook('word_search')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-colors"><Plus className="w-4 h-4"/> Word Search</button>
            <button onClick={() => addPageToBook('crossword')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-colors"><Plus className="w-4 h-4"/> Crossword</button>
            <div className="relative mt-2">
              <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 rounded-lg flex items-center justify-center">
                <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest shadow-md">Coming Next</span>
              </div>
              <button disabled className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 opacity-50"><Plus className="w-4 h-4"/> Sudoku</button>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-xs border border-indigo-100 leading-relaxed">
              <strong className="block mb-1">Architecture Note:</strong>
              Data is automatically saved to Local Storage. Add pages, change settings, and test previews dynamically!
            </div>
          </div>
        </div>

        {/* MIDDLE: Active Canvas Editor */}
        <div className="flex-1 bg-slate-100 p-4 flex flex-col items-center overflow-y-auto relative shadow-inner">
          {bookPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg text-slate-500">Your book is empty.</p>
              <p className="text-sm mt-2">Select a puzzle type from the left to start building.</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {bookPages[activeIndex]?.type === 'crossword' && (
                <CrosswordEditor 
                  page={bookPages[activeIndex]} 
                  updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
                />
              )}
              
              {bookPages[activeIndex]?.type === 'word_search' && (
                <WordSearchEditor 
                  page={bookPages[activeIndex]} 
                  updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
                />
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Page Sequence Manager */}
        <div className="w-72 bg-white p-4 border-l border-slate-200 flex flex-col z-10">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 flex justify-between items-center">
            My Book <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{bookPages.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {bookPages.map((page, index) => (
              <div 
                key={page.id} 
                onClick={() => setActiveIndex(index)} 
                className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-all group
                  ${activeIndex === index ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Page {index + 1}</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{page.type.replace('_', ' ')}</span>
                </div>
                <button 
                  onClick={(e) => removePage(e, page.id)} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all" 
                  title="Delete Page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-4 bg-white">
            <button 
              disabled={bookPages.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-black hover:bg-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => alert("Book pages are sequenced in memory! Next step: Pass the `bookPages` array to the pdf-lib compiler service.")}
            >
              <FileDown className="w-4 h-4" /> EXPORT TO PDF
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}