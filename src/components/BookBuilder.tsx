import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, FileDown, Settings, Type, LayoutGrid, 
  RefreshCw, BookOpen, Eye, EyeOff, LayoutTemplate, Palette, 
  Image as ImageIcon, Search, MousePointer2, Layers, Move, Square
} from "lucide-react";
import { Stage, Layer, Rect, Text as KonvaText, Image as KonvaImage, Transformer } from 'react-konva';

// ==========================================
// 🛠️ CUSTOM HOOKS
// ==========================================
const useImage = (url: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);
  return [image];
};

// ==========================================
// 🧩 1. STANDARDIZED DATA MODELS
// ==========================================
export interface PuzzleOutput {
  grid: string[][];
  placedWords: any[];
  mask: boolean[][];
}

export interface BookPage {
  id: string;
  type: 'word_search' | 'crossword';
  config: {
    rawText?: string;
    gridData?: PuzzleOutput;
    gridSize?: number;
    showSolution?: boolean;
    solutionStyle?: 'apple' | 'fade' | 'fill';
    statusMsg?: string;
  };
}

// ==========================================
// 🧠 2. PUZZLE GENERATOR ALGORITHMS
// ==========================================
function generateWordSearchGrid(wordList: string[], size = 15): PuzzleOutput {
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const mask = Array(size).fill(null).map(() => Array(size).fill(false)); 
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]]; 
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

function generateCrosswordGrid(wordList: {word: string, clue: string}[], gridSize = 15): PuzzleOutput {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const mask = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  const placedWords: any[] = [];
  const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

  if (sortedWords.length === 0) return { grid, placedWords, mask };

  const firstWord = sortedWords[0].word.toUpperCase().replace(/[^A-Z]/g, '');
  const startR = Math.floor(gridSize / 2);
  const startC = Math.floor((gridSize - firstWord.length) / 2);

  for (let i = 0; i < firstWord.length; i++) {
    grid[startR][startC + i] = firstWord[i];
    mask[startR][startC + i] = true;
  }
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
            let canPlaceV = true;
            const startRV = r - l;
            if (startRV < 0 || startRV + currentWord.length > gridSize) canPlaceV = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[startRV + i][c] !== '' && grid[startRV + i][c] !== currentWord[i]) canPlaceV = false;
              }
            }
            if (canPlaceV) {
              for (let i = 0; i < currentWord.length; i++) {
                grid[startRV + i][c] = currentWord[i];
                mask[startRV + i][c] = true;
              }
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: startRV, c: c, dir: 'V', num: currentNum++ });
              placed = true; break;
            }

            let canPlaceH = true;
            const startCH = c - l;
            if (startCH < 0 || startCH + currentWord.length > gridSize) canPlaceH = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[r][startCH + i] !== '' && grid[r][startCH + i] !== currentWord[i]) canPlaceH = false;
              }
            }
            if (canPlaceH) {
              for (let i = 0; i < currentWord.length; i++) {
                grid[r][startCH + i] = currentWord[i];
                mask[r][startCH + i] = true;
              }
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: r, c: startCH, dir: 'H', num: currentNum++ });
              placed = true; break;
            }
          }
        }
      }
    }
  }
  return { grid, placedWords, mask };
}


// ==========================================
// 🖼️ 3. KONVA COVER STUDIO COMPONENTS
// ==========================================
const URLImage = ({ imageInfo, isSelected, onSelect, onChange }: any) => {
  const [img] = useImage(imageInfo.src);
  return (
    <KonvaImage
      image={img || undefined}
      id={imageInfo.id}
      x={imageInfo.x} y={imageInfo.y}
      width={imageInfo.width} height={imageInfo.height}
      rotation={imageInfo.rotation || 0}
      scaleX={imageInfo.scaleX || 1} scaleY={imageInfo.scaleY || 1}
      draggable={isSelected}
      onClick={onSelect} onTap={onSelect}
      onDragEnd={(e) => onChange({ ...imageInfo, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange({ ...imageInfo, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
      }}
    />
  );
};

const CoverStudio = () => {
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  
  const [activePanel, setActivePanel] = useState<'elements' | 'unsplash' | 'layers'>('unsplash');
  const [elements, setElements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState<any[]>([]);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 800;

  useEffect(() => {
    simulateUnsplashFetch("abstract");
  }, []);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = trRef.current.getStage().findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  const simulateUnsplashFetch = (query: string) => {
    const seed = Math.floor(Math.random() * 100);
    const mock = Array.from({ length: 12 }).map((_, i) => ({
      id: `img-${seed}-${i}`,
      thumb: `https://picsum.photos/seed/${query}${seed}${i}/150/150`,
      full: `https://picsum.photos/seed/${query}${seed}${i}/600/800`
    }));
    setUnsplashImages(mock);
  };

  const addUnsplashImageToCanvas = (url: string) => {
    const id = `unsplash-${Date.now()}`;
    setElements([...elements, { id, type: 'image', src: url, x: 100, y: 100, width: 200, height: 300 }]);
    setSelectedId(id);
  };

  const addText = () => {
    const id = `text-${Date.now()}`;
    setElements([...elements, { id, type: 'text', text: 'BOOK TITLE', x: 200, y: 100, fontSize: 40, fill: '#1E293B' }]);
    setSelectedId(id);
  };

  const addShape = () => {
    const id = `rect-${Date.now()}`;
    setElements([...elements, { id, type: 'rect', x: 250, y: 350, width: 100, height: 100, fill: '#4F46E5' }]);
    setSelectedId(id);
  };

  const updateElement = (newAttrs: any) => {
    setElements(elements.map(el => el.id === newAttrs.id ? newAttrs : el));
  };

  return (
    <div className="flex h-full w-full bg-slate-200/50">
      {/* 1. Leftmost Toolbar */}
      <div className="w-14 bg-slate-900 flex flex-col items-center py-4 border-r border-slate-800 z-20">
        <button onClick={() => setActivePanel('unsplash')} className={`w-10 h-10 mb-2 flex items-center justify-center rounded-sm transition-colors ${activePanel === 'unsplash' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`} title="Stock Images"><ImageIcon className="w-5 h-5"/></button>
        <button onClick={() => setActivePanel('elements')} className={`w-10 h-10 mb-2 flex items-center justify-center rounded-sm transition-colors ${activePanel === 'elements' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`} title="Elements"><Square className="w-5 h-5"/></button>
        <button onClick={() => setActivePanel('layers')} className={`w-10 h-10 mb-2 flex items-center justify-center rounded-sm transition-colors ${activePanel === 'layers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`} title="Layers"><Layers className="w-5 h-5"/></button>
      </div>

      {/* 2. Secondary Context Panel */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        {activePanel === 'unsplash' && (
          <div className="flex flex-col h-full p-4">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 mb-4">Stock Library</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Search Unsplash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && simulateUnsplashFetch(searchQuery)} className="flex-1 p-2 text-sm border border-slate-300 rounded-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
              <button onClick={() => simulateUnsplashFetch(searchQuery)} className="p-2 bg-slate-900 text-white rounded-sm hover:bg-slate-800"><Search className="w-4 h-4"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {unsplashImages.map((img) => (
                  <div key={img.id} onClick={() => addUnsplashImageToCanvas(img.full)} className="group relative cursor-pointer overflow-hidden rounded-sm border border-slate-200 bg-slate-100 aspect-[3/4]">
                     <img src={img.thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="stock" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <Plus className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md w-8 h-8" />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePanel === 'elements' && (
          <div className="p-4">
             <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 mb-4">Add Elements</h3>
             <button onClick={addText} className="w-full p-3 mb-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-semibold flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"><Type className="w-4 h-4 text-slate-500"/> Add Text Box</button>
             <button onClick={addShape} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-semibold flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"><Square className="w-4 h-4 text-slate-500"/> Add Rectangle</button>
          </div>
        )}
      </div>

      {/* 3. Konva Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto relative">
         <div className="shadow-2xl bg-white border border-slate-300" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <Stage 
              width={CANVAS_WIDTH} height={CANVAS_HEIGHT} 
              onMouseDown={(e) => { if(e.target === e.target.getStage() || e.target.name() === 'bg') setSelectedId(null); }}
              ref={stageRef}
            >
               <Layer>
                 <Rect name="bg" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" />
                 {elements.map((el) => {
                   const isSelected = selectedId === el.id;
                   if (el.type === 'text') return <KonvaText key={el.id} {...el} draggable={isSelected} onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} onTransformEnd={(e) => { const node = e.target; updateElement({...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation()}); }} />;
                   if (el.type === 'rect') return <Rect key={el.id} {...el} draggable={isSelected} onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} onTransformEnd={(e) => { const node = e.target; updateElement({...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation()}); }} />;
                   if (el.type === 'image') return <URLImage key={el.id} imageInfo={el} isSelected={isSelected} onSelect={() => setSelectedId(el.id)} onChange={updateElement} />;
                   return null;
                 })}
                 {selectedId && <Transformer ref={trRef} keepRatio={true} />}
               </Layer>
            </Stage>
         </div>
      </div>
    </div>
  );
};

// ==========================================
// 🧩 4. INTERIOR STUDIO COMPONENTS
// ==========================================

const WordSearchEditor = ({ page, updatePage }: { page: BookPage, updatePage: any }) => {
  const [inputText, setInputText] = useState(page.config.rawText || "NEXTJS\nREACT\nPRISMA\nTAILWIND\nCODING\nJAVASCRIPT");
  const gridSize = page.config.gridSize || 12;
  const gridData = page.config.gridData;
  const showSolution = page.config.showSolution || false;
  const solutionStyle = page.config.solutionStyle || 'apple';

  const handleGenerate = () => {
    const wordList = inputText.split('\n').map(w => w.trim()).filter(w => w.length > 2);
    if (wordList.length === 0) return alert("Enter valid words.");
    const result = generateWordSearchGrid(wordList, gridSize);
    updatePage({ rawText: inputText, gridData: result, gridSize, showSolution: false, solutionStyle });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-full p-4">
      {/* Editor Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Word List (One per line)</label>
          <textarea 
            value={inputText} onChange={(e) => setInputText(e.target.value)}
            className="w-full h-64 p-3 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="One word per line..."
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Highlighter Style</label>
          <select 
            value={solutionStyle} 
            onChange={(e) => updatePage({ ...page.config, solutionStyle: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="apple">Apple Squircle (iOS Style)</option>
            <option value="fade">Watermark (Fade background)</option>
            <option value="fill">Fill Color Blocks</option>
          </select>
        </div>

        <button onClick={handleGenerate} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm transition">
          <RefreshCw className="w-4 h-4"/> Generate Puzzle
        </button>
      </div>

      {/* Preview Area */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-xl rounded-sm flex flex-col items-center p-6 relative aspect-[8.5/11] overflow-y-auto custom-scrollbar">
        {gridData && (
           <button 
            onClick={() => updatePage({ ...page.config, showSolution: !showSolution })} 
            className={`absolute top-4 right-4 p-2 rounded-full z-30 transition-colors ${showSolution ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
            title="Toggle Solution"
          >
            {showSolution ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
          </button>
        )}

        <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-center text-slate-900">Word Search</h2>
        
        {gridData ? (
          <div className="flex flex-col items-center w-full max-w-md relative">
            <div className="grid w-full aspect-square relative z-10" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              {gridData.grid.map((row, r) => 
                row.map((cell, c) => {
                  const isAnswer = gridData.mask[r][c];
                  
                  let cellBg = 'transparent';
                  let cellText = 'text-slate-800';
                  
                  if (showSolution) {
                    if (solutionStyle === 'fill' && isAnswer) cellBg = 'bg-indigo-100';
                    if (solutionStyle === 'fade' && !isAnswer) cellText = 'text-slate-200';
                  }

                  return (
                    <div key={`${r}-${c}`} className={`flex items-center justify-center text-sm sm:text-lg font-bold border border-slate-100 ${cellBg} ${cellText} transition-all duration-300 z-10`}>
                      {cell}
                    </div>
                  );
                })
              )}
            </div>

            {/* 🔥 FLAWLESS SQUIRCLE / APPLE HIGHLIGHTER 🔥 */}
            {showSolution && solutionStyle === 'apple' && (
              <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="absolute top-0 left-0 w-full aspect-square pointer-events-none z-20">
                {gridData.placedWords.map((w, i) => {
                  const len = Math.hypot(w.endC - w.startC, w.endR - w.startR);
                  const ang = Math.atan2(w.endR - w.startR, w.endC - w.startC) * (180 / Math.PI);
                  return (
                    <rect 
                      key={i} 
                      x={w.startC + 0.15}  // Pivot perfectly off the center
                      y={w.startR + 0.15} 
                      width={len + 0.70}   // Exact length + padding to wrap letters
                      height={0.70} 
                      rx="0.30"            // The "Squircle" Corner Radius
                      ry="0.30"
                      transform={`rotate(${ang}, ${w.startC + 0.5}, ${w.startR + 0.5})`} 
                      fill="rgba(79, 70, 229, 0.20)" // Indigo 600 with 20% opacity
                      stroke="#4F46E5" 
                      strokeWidth="0.04" 
                    />
                  );
                })}
              </svg>
            )}

            <div className="w-full mt-10 pt-6 border-t border-slate-100">
              <h3 className="font-bold text-xs mb-3 uppercase text-slate-400 tracking-tighter text-center">Words to Find</h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs font-semibold text-slate-700 text-center">
                {gridData.placedWords.map((w, i) => (
                  <span key={i} className={showSolution ? "line-through opacity-40 transition-opacity" : ""}>{w.word}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-300 flex flex-col items-center justify-center h-full">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p>Generate puzzle to preview print layout.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const CrosswordEditor = ({ page, updatePage }: { page: BookPage, updatePage: any }) => {
  const [inputText, setInputText] = useState(
    page.config.rawText || "REACT, A popular UI library\nNEXTJS, A React framework\nVERCEL, Hosting platform\nCODING, Writing software"
  );
  
  const gridSize = page.config.gridSize || 15;
  const gridData = page.config.gridData;
  const showSolution = page.config.showSolution || false;
  const statusMsg = page.config.statusMsg || "";

  const handleGenerate = () => {
    const lines = inputText.split('\n').filter(l => l.trim().length > 0);
    const wordList = lines.map(l => {
      const parts = l.split(',');
      return { word: parts[0]?.trim() || '', clue: parts[1]?.trim() || '' };
    }).filter(item => item.word.length > 0);

    if (wordList.length === 0) return alert("Please enter at least one word and clue.");

    const result = generateCrosswordGrid(wordList, gridSize);
    const status = `Successfully placed ${result.placedWords.length} out of ${wordList.length} words.`;
    updatePage({ rawText: inputText, gridData: result, gridSize, showSolution, statusMsg: status });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-full p-4">
      {/* Editor Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Words & Clues (Format: Word, Clue)</label>
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 h-64 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none whitespace-nowrap overflow-auto"
            placeholder="APPLE, A red fruit&#10;BANANA, A yellow fruit"
          />
        </div>
        <button onClick={handleGenerate} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm">
          <RefreshCw className="w-4 h-4"/> Generate Crossword
        </button>
        {statusMsg && (
          <p className="text-xs text-center font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
            {statusMsg}
          </p>
        )}
      </div>

      {/* Preview Area */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-xl rounded-sm flex flex-col items-center p-6 relative aspect-[8.5/11] overflow-y-auto custom-scrollbar">
         {gridData && (
           <button 
            onClick={() => updatePage({ ...page.config, showSolution: !showSolution })} 
            className={`absolute top-4 right-4 p-2 rounded-full z-30 transition-colors ${showSolution ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
            title="Toggle Solution"
          >
            {showSolution ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
          </button>
        )}

        <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-slate-900">Crossword Puzzle</h2>
        
        {gridData ? (
          <div className="flex flex-col items-center w-full max-w-lg">
            <div className="grid gap-0 border-2 border-slate-900 bg-slate-900 w-full aspect-square" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              {gridData.grid.map((row, r) => 
                row.map((cell, c) => {
                  const isBlank = cell === '';
                  const startWord = gridData.placedWords.find(w => w.r === r && w.c === c);
                  return (
                    <div key={`${r}-${c}`} className={`aspect-square flex items-center justify-center relative ${isBlank ? 'bg-slate-900' : 'bg-white border border-slate-900'}`}>
                      {startWord && <span className="absolute top-0.5 left-1 text-[8px] sm:text-[10px] font-bold text-slate-600 leading-none z-10">{startWord.num}</span>}
                      {/* 🔥 CROSSWORD SOLUTION TOGGLE 🔥 */}
                      {showSolution && !isBlank && (
                         <span className="text-sm sm:text-lg font-bold text-slate-900">{cell}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="w-full mt-10 grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div>
                <h3 className="font-black border-b-2 border-slate-200 pb-2 mb-3 uppercase tracking-wider">Across</h3>
                <ul className="space-y-2">
                  {gridData.placedWords.filter(w => w.dir === 'H').sort((a,b)=>a.num-b.num).map(w => (
                    <li key={w.num} className="leading-relaxed"><span className="font-bold mr-1">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-black border-b-2 border-slate-200 pb-2 mb-3 uppercase tracking-wider">Down</h3>
                <ul className="space-y-2">
                  {gridData.placedWords.filter(w => w.dir === 'V').sort((a,b)=>a.num-b.num).map(w => (
                    <li key={w.num} className="leading-relaxed"><span className="font-bold mr-1">{w.num}.</span> {w.clue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-300 flex flex-col items-center justify-center h-full">
            <LayoutGrid className="w-16 h-16 mb-4 opacity-20" />
            <p>Add words and click Generate to see your Crossword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN APPLICATION ENTRY
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('cover');
  const [bookPages, setBookPages] = useState<BookPage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kdp_studio_pages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) setBookPages(parsed);
      } catch (e) {
        console.error("Failed to parse saved pages", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("kdp_studio_pages", JSON.stringify(bookPages));
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
    if (activeIndex >= filteredPages.length) setActiveIndex(Math.max(0, filteredPages.length - 1));
  };

  const updatePageConfig = (id: string, newConfig: any) => {
    setBookPages(bookPages.map(page => page.id === id ? { ...page, config: newConfig } : page));
  };

  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading Studio...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="h-14 border-b border-slate-200 flex justify-between items-center px-4 bg-white shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-black text-xs shadow-inner">KDP</div>
          <h1 className="text-sm font-black tracking-widest uppercase text-slate-800">Master Studio</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
          <button onClick={() => setActiveTab('interior')} className={`px-4 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'interior' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><LayoutGrid className="w-3.5 h-3.5"/> Interior Pages</button>
          <button onClick={() => setActiveTab('cover')} className={`px-4 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'cover' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Palette className="w-3.5 h-3.5"/> Cover Canvas</button>
        </div>
        <div className="w-24"></div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden p-4">
        <div className="flex w-full h-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xl">
          
          {activeTab === 'cover' && <CoverStudio />}

          {activeTab === 'interior' && (
            <>
              {/* Left Page Sequence Panel */}
              <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-20">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 mb-4">Add Pages</h3>
                <div className="space-y-2 mb-6">
                  <button onClick={() => addPageToBook('word_search')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm"><Plus className="w-4 h-4 text-slate-400"/> Word Search</button>
                  <button onClick={() => addPageToBook('crossword')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm"><Plus className="w-4 h-4 text-slate-400"/> Crossword</button>
                </div>
              </div>

              {/* Active Interior Editor */}
              <div className="flex-1 overflow-hidden relative bg-slate-100">
                {bookPages.length > 0 ? (
                  <>
                    {bookPages[activeIndex]?.type === 'word_search' && <WordSearchEditor page={bookPages[activeIndex]} updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} />}
                    {bookPages[activeIndex]?.type === 'crossword' && <CrosswordEditor page={bookPages[activeIndex]} updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} />}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium text-sm">Select a page type from the left to begin formatting your interior.</p>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR: Page Manager */}
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
            </>
          )}
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