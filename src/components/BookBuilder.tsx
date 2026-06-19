"use client";

import React, { useState } from "react";
import { Plus, Trash2, FileDown, Settings, Type, LayoutGrid } from "lucide-react";

interface BookPage {
  id: string;
  // 👇 ADDED 'crossword' TO THE TYPES HERE
  type: 'word_search' | 'crossword' | 'maze' | 'sudoku' | 'blank_journal'; 
  config: any;
}

export default function BookBuilder() {
  const [bookPages, setBookPages] = useState<BookPage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

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

  const compileFinalKDPBook = () => {
    if (bookPages.length === 0) {
      alert("Your book is empty! Add some pages first.");
      return;
    }
    alert(`Ready to compile ${bookPages.length} pages into a PDF!`);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      
      {/* LEFT SIDEBAR: Puzzles */}
      <div className="w-1/4 bg-slate-50 p-4 border-r border-slate-200 overflow-y-auto">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Add to Book</h3>
        <div className="space-y-2 flex flex-col">
          
          <button onClick={() => addPageToBook('word_search')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4"/> Word Search
          </button>

          {/* 👇 NEW CROSSWORD BUTTON ADDED HERE 👇 */}
          <button onClick={() => addPageToBook('crossword')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4"/> Crossword
          </button>
          
          <button onClick={() => addPageToBook('maze')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4"/> Shaped Maze
          </button>
          
          <button onClick={() => addPageToBook('sudoku')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4"/> Sudoku
          </button>
          
          <button onClick={() => addPageToBook('blank_journal')} className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4"/> Lined Journal Page
          </button>

        </div>
      </div>

      {/* MIDDLE: Active Canvas */}
      <div className="w-2/4 bg-slate-100 p-8 flex flex-col items-center overflow-y-auto">
        {bookPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Select a puzzle type from the left to begin.</p>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white shadow-xl rounded-sm aspect-[8.5/11] p-6 border border-slate-200 flex items-center justify-center relative">
            <div className="text-center">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">Page {activeIndex + 1}</span>
              
              {/* Show an icon based on the puzzle type */}
              <div className="flex justify-center mb-4 text-indigo-300">
                  {bookPages[activeIndex]?.type === 'crossword' && <LayoutGrid className="w-16 h-16" />}
                  {bookPages[activeIndex]?.type === 'word_search' && <Type className="w-16 h-16" />}
              </div>

              <h2 className="text-2xl font-black text-slate-800 capitalize">{bookPages[activeIndex]?.type.replace('_', ' ')} Editor</h2>
              <p className="text-sm text-slate-500 mt-2">Settings for this puzzle will appear here.</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: Page Manager */}
      <div className="w-1/4 bg-white p-4 border-l border-slate-200 flex flex-col">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">My Book ({bookPages.length} Pages)</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {bookPages.map((page, index) => (
            <div key={page.id} onClick={() => setActiveIndex(index)} className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-all ${activeIndex === index ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase">Page {index + 1}</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">{page.type.replace('_', ' ')}</span>
              </div>
              <button onClick={(e) => removePage(e, page.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete Page"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 mt-4">
          <button onClick={compileFinalKDPBook} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-black hover:bg-indigo-700 shadow-md">
            <FileDown className="w-4 h-4" /> MERGE & DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}