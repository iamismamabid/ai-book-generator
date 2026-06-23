"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileDown } from "lucide-react";
import { CrosswordEditor } from "./CrosswordEditor";
import { WordSearchEditor } from "./WordSearchEditor";
import { SudokuEditor } from "./SudokuEditor";
import { MazeEditor } from "./MazeEditor";
import { exportBookToPDF } from "@/app/utils/pdfExportService";

export default function BookBuilder() {
  const [bookPages, setBookPages] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("kdp-book-draft");
    if (saved) {
      try {
        setBookPages(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved draft", e);
      }
    }
  }, []);

  useEffect(() => {
    if (bookPages.length > 0) {
      localStorage.setItem("kdp-book-draft", JSON.stringify(bookPages));
    }
  }, [bookPages]);

  const addPage = (type: string) => {
    setBookPages([...bookPages, { id: Date.now(), type, config: {} }]);
    setActiveIndex(bookPages.length);
  };

  const removePage = (indexToRemove: number) => {
    const updated = bookPages.filter((_, idx) => idx !== indexToRemove);
    setBookPages(updated);
    if (activeIndex >= updated.length && updated.length > 0) {
      setActiveIndex(updated.length - 1);
    }
  };

  const updatePageConfig = (id: number, newConfig: any) => {
    setBookPages(bookPages.map(page => 
      page.id === id ? { ...page, config: newConfig } : page
    ));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar Left: Asset Tool buttons */}
      <div className="w-68 bg-slate-900 text-slate-100 p-5 border-r border-slate-800 flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Add Puzzle Page</h2>
          <div className="space-y-2.5">
            <button 
              onClick={() => addPage('crossword')} 
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center justify-between group"
            >
              <span>+ Crossword</span>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button 
              onClick={() => addPage('word_search')} 
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center justify-between group"
            >
              <span>+ Word Search</span>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button 
              onClick={() => addPage('sudoku')} 
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center justify-between group"
            >
              <span>+ Sudoku</span>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button 
              onClick={() => addPage('maze')} 
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center justify-between group"
            >
              <span>+ Maze Challenge</span>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Workspace */}
      <div className="flex-1 p-8 overflow-y-auto">
        {bookPages.length > 0 && bookPages[activeIndex] ? (
          <div className="h-full">
            {bookPages[activeIndex].type === 'crossword' && (
              <CrosswordEditor 
                page={bookPages[activeIndex]} 
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
              />
            )}
            {bookPages[activeIndex].type === 'word_search' && (
              <WordSearchEditor 
                page={bookPages[activeIndex]} 
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
              />
            )}
            {bookPages[activeIndex].type === 'sudoku' && (
              <SudokuEditor 
                page={bookPages[activeIndex]} 
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
              />
            )}
            {bookPages[activeIndex].type === 'maze' && (
              <MazeEditor 
                page={bookPages[activeIndex]} 
                updatePage={(config: any) => updatePageConfig(bookPages[activeIndex].id, config)} 
              />
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <p className="font-bold">No pages added to your book yet.</p>
            <p className="text-xs">Click one of the buttons on the left to add your first puzzle page.</p>
          </div>
        )}
      </div>

      {/* Sidebar Right: Book Pages & Merge Export */}
      <div className="w-72 bg-white p-5 border-l border-slate-200 flex flex-col">
        <h2 className="font-black text-xs uppercase text-slate-400 tracking-wider mb-4">Book Outline Pages</h2>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {bookPages.map((p, i) => (
            <div 
              key={p.id} 
              onClick={() => setActiveIndex(i)} 
              className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition ${
                activeIndex === i 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-black">Page {i + 1}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{p.type.replace('_', ' ')}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removePage(i);
                }} 
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* PDF Export Button */}
        {bookPages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button 
              onClick={() => exportBookToPDF(bookPages)} 
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition active:scale-95"
            >
              <FileDown className="w-4 h-4" /> MERGE & DOWNLOAD PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}