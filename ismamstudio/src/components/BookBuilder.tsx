"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileDown } from "lucide-react"; // FileDown ইম্পোর্ট করা হয়েছে
import { CrosswordEditor } from "./CrosswordEditor";
import { exportBookToPDF } from "@/app/utils/pdfExportService"; // PDF সার্ভিস ইম্পোর্ট করা হয়েছে
import { WordSearchEditor } from "./WordSearchEditor";
export default function BookBuilder() {
  const [bookPages, setBookPages] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("kdp-book-draft");
    if (saved) setBookPages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("kdp-book-draft", JSON.stringify(bookPages));
  }, [bookPages]);

  const addPage = (type: string) => {
    setBookPages([...bookPages, { id: Date.now(), type, config: {} }]);
    setActiveIndex(bookPages.length);
  };

  const updatePageConfig = (id: number, newConfig: any) => {
    setBookPages(bookPages.map(page => 
      page.id === id ? { ...page, config: newConfig } : page
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Left */}
      <div className="w-64 bg-white p-4 border-r">
        <button onClick={() => addPage('crossword')} className="w-full p-2 bg-indigo-600 text-white rounded mb-2">+ Crossword</button>
        <button onClick={() => addPage('word_search')} className="w-full p-2 bg-indigo-600 text-white rounded">+ Word Search</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {bookPages.length > 0 && bookPages[activeIndex] ? (
          <>
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
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20">Please add a page to start editing.</div>
        )}
      </div>

      {/* Sidebar Right (Pages & Export) */}
      <div className="w-64 bg-white p-4 border-l flex flex-col">
        <h2 className="font-bold mb-4">Pages</h2>
        <div className="flex-1 overflow-y-auto">
          {bookPages.map((p, i) => (
            <div 
              key={p.id} 
              onClick={() => setActiveIndex(i)} 
              className={`p-2 border-b cursor-pointer flex justify-between items-center ${activeIndex === i ? 'bg-indigo-50' : ''}`}
            >
              <span>Page {i + 1}: {p.type}</span>
            </div>
          ))}
        </div>

        {/* PDF Export Button */}
        <div className="mt-4 pt-4 border-t">
          <button 
            onClick={() => exportBookToPDF(bookPages)} 
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-black hover:bg-indigo-700 shadow-md transition"
          >
            <FileDown className="w-4 h-4" /> MERGE & DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}