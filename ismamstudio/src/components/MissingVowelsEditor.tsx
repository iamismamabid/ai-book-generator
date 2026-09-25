"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Sparkles, BookOpen, Layers } from "lucide-react";
import {
  MissingVowelsWorksheet,
  MISSING_VOWELS_THEMES,
  generateMissingVowelsBook,
} from "../lib/missingVowelsEngine";

export function MissingVowelsEditor({ page, updatePage, bulkAddPages }: any) {
  const [themeIndex, setThemeIndex] = useState<number>(page.config?.themeIndex ?? -1);
  const [mode, setMode] = useState<"guided_blanks" | "pure_consonants" | "partial_blanks">(
    page.config?.mode || "guided_blanks"
  );
  const [wordsCount, setWordsCount] = useState<number>(page.config?.wordsCount || 8);
  const [worksheetData, setWorksheetData] = useState<MissingVowelsWorksheet | null>(
    page.config?.worksheetData || null
  );
  const [customCount, setCustomCount] = useState<number>(10);

  const isSolution = page.config?.isSolution || false;

  const handleGenerate = (curTheme = themeIndex, curMode = mode, curCount = wordsCount) => {
    let customList: string[] | undefined = undefined;
    if (curTheme >= 0 && MISSING_VOWELS_THEMES[curTheme]) {
      customList = MISSING_VOWELS_THEMES[curTheme].words;
    }

    const book = generateMissingVowelsBook(1, curCount, curMode, customList);
    const ws = book[0] || null;

    setWorksheetData(ws);
    updatePage({
      themeIndex: curTheme,
      mode: curMode,
      wordsCount: curCount,
      worksheetData: ws,
      isSolution,
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      themeIndex,
      mode,
      wordsCount,
      worksheetData,
      isSolution: solMode,
    });
  };

  useEffect(() => {
    if (!worksheetData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickAddWorksheets = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    let customList: string[] | undefined = undefined;
    if (themeIndex >= 0 && MISSING_VOWELS_THEMES[themeIndex]) {
      customList = MISSING_VOWELS_THEMES[themeIndex].words;
    }

    const newPages = generateMissingVowelsBook(num, wordsCount, mode, customList);
    const configs = newPages.map((ws) => ({
      themeIndex,
      mode,
      wordsCount,
      worksheetData: ws,
      isSolution: false,
    }));

    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Missing Vowels worksheets to your book!`);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Editor Controls Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Page Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                  !isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                Worksheet
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                  isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                Solution
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Theme Select */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Word Theme</h3>
            <select
              value={themeIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setThemeIndex(idx);
                handleGenerate(idx, mode, wordsCount);
              }}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none shadow-sm"
            >
              <option value={-1}>Mixed Themes (Universal Vocabulary)</option>
              {MISSING_VOWELS_THEMES.map((t, idx) => (
                <option key={t.id} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Masking Style */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Masking Style</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: "guided_blanks", label: "Guided Blanks (_ for each vowel)" },
                { id: "pure_consonants", label: "Pure Consonants (Only consonants)" },
                { id: "partial_blanks", label: "Partial Mask (Subtle word hints)" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id as any);
                    handleGenerate(themeIndex, m.id as any, wordsCount);
                  }}
                  className={`py-2 px-3 text-left rounded-lg font-bold text-xs transition ${
                    mode === m.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Words Per Page */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Words Per Page</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 8, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setWordsCount(cnt);
                    handleGenerate(themeIndex, mode, cnt);
                  }}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    wordsCount === cnt
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Randomize Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Generate Another
          </button>
        </div>

        {/* Quick Add Missing Vowels Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400 capitalize">{wordsCount} Words • {mode}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleQuickAddWorksheets(cnt)}
                  className="py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  +{cnt}
                </button>
              ))}
            </div>

            {/* Custom Add Page Option */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-[11px] font-bold text-slate-500 mr-1.5 shrink-0">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 bg-transparent outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleQuickAddWorksheets(customCount)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0"
              >
                Add Pages
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidelines Card */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-900 dark:text-indigo-200 leading-normal font-semibold">
            <strong>Missing Vowels Rules:</strong> All the vowels (A, E, I, O, U) have been removed from these words or phrases. Use the clue and consonants to restore the original word!
          </p>
        </div>
      </div>

      {/* Canvas Rendering Area */}
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[400px] lg:min-h-[700px] flex flex-col items-center justify-between text-slate-800 dark:text-slate-100">
        <div className="text-center w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            {worksheetData?.theme || "Vocabulary Challenge"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-1 uppercase tracking-widest text-slate-800 dark:text-slate-100">
            Missing Vowels {isSolution && <span className="text-indigo-600 dark:text-indigo-400">(Answer Key)</span>}
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-6">
            Theme: {worksheetData?.theme || "Mixed Words"} | Count: {worksheetData?.items?.length || wordsCount}
          </p>
        </div>

        {worksheetData && worksheetData.items ? (
          <div className="w-full max-w-xl space-y-3 p-2">
            {(worksheetData.items || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-base sm:text-lg font-black tracking-widest font-mono text-slate-900 dark:text-slate-100">
                      {isSolution ? (
                        <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 underline-offset-4 font-bold">
                          {item.original}
                        </span>
                      ) : (
                        item.masked
                      )}
                    </div>
                    {item.hint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                        Clue: {item.hint}
                      </p>
                    )}
                  </div>
                </div>

                {!isSolution && (
                  <div className="hidden sm:block w-36 h-6 border-b-2 border-dashed border-slate-300 dark:border-slate-700 self-end mb-1" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Generating Worksheet...</div>
        )}

        <div className="w-full text-center mt-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
          Formatted for Amazon KDP Paperback interiors with automatic bleed &amp; gutter margins.
        </div>
      </div>
    </div>
  );
}
