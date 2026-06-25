"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const DEFAULT_QUOTES = [
  "THE ONLY LIMIT TO OUR REALIZATION OF TOMORROW WILL BE OUR DOUBTS OF TODAY.",
  "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS.",
  "BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD.",
  "IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY."
];

export function CryptogramEditor({ page, updatePage }: any) {
  const [inputText, setInputText] = useState(
    page.config.rawText || DEFAULT_QUOTES.join("\n")
  );
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(
    page.config.selectedQuoteIndex !== undefined ? page.config.selectedQuoteIndex : 0
  );
  const [cryptogramData, setCryptogramData] = useState<any>(
    page.config.cryptogramData || null
  );

  const isSolution = page.config.isSolution || false;

  const generateCipher = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let shuffled = [...alphabet];
    
    let attempts = 0;
    while (attempts < 200) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      let hasSelfMap = false;
      for (let i = 0; i < alphabet.length; i++) {
        if (alphabet[i] === shuffled[i]) {
          hasSelfMap = true;
          break;
        }
      }
      
      if (!hasSelfMap) break;
      attempts++;
    }
    
    const mapping: Record<string, string> = {};
    alphabet.forEach((letter, idx) => {
      mapping[letter] = shuffled[idx];
    });
    
    return mapping;
  };

  const handleGenerate = () => {
    const parsed = inputText
      .split("\n")
      .map((q: string) => q.trim().toUpperCase())
      .filter((q: string) => q.length > 0);

    if (parsed.length === 0) {
      alert("Please enter at least one phrase/quote.");
      return;
    }

    // Wrap quote index if out of range
    const quoteIndex = selectedQuoteIndex >= parsed.length ? 0 : selectedQuoteIndex;
    const targetQuote = parsed[quoteIndex];

    const mapping = generateCipher();
    const encrypted = targetQuote
      .split("")
      .map((char: string) => {
        if (/[A-Z]/.test(char)) {
          return mapping[char] || char;
        }
        return char;
      })
      .join("");

    const result = {
      original: targetQuote,
      encrypted,
      cipherMap: mapping
    };

    setCryptogramData(result);
    updatePage({
      rawText: inputText,
      selectedQuoteIndex: quoteIndex,
      cryptogramData: result,
      isSolution
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      rawText: inputText,
      selectedQuoteIndex,
      cryptogramData,
      isSolution: solMode
    });
  };

  useEffect(() => {
    if (!cryptogramData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuoteIndex]);

  return (
    <div className="w-full flex gap-8 h-full p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div>
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
                Puzzle
              </button>
              <button
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${
                  isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Solution
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Active Quote Index</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={Math.max(0, inputText.split("\n").filter((q: string) => q.trim().length > 0).length - 1)}
                value={selectedQuoteIndex}
                onChange={(e) => setSelectedQuoteIndex(parseInt(e.target.value) || 0)}
                className="w-20 p-2 border rounded-lg text-xs font-bold text-slate-800"
              />
              <span className="text-slate-400 text-xs font-bold uppercase">of {inputText.split("\n").filter((q: string) => q.trim().length > 0).length} quotes</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Quotes Pool (One per line)</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 min-h-[200px] p-4 border border-slate-200 rounded-xl text-sm font-mono shadow-inner bg-white outline-none focus:border-indigo-500"
            placeholder="Enter quotes..."
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate Cryptogram
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-widest text-slate-800">
          Cryptogram {isSolution && <span className="text-indigo-600">(Solution)</span>}
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">
          Decode the cipher substitution mapping
        </p>

        {cryptogramData ? (
          <div className="w-full max-w-xl flex-1 flex flex-col justify-between">
            {/* Word-wrapped rendering of letters with boxes */}
            <div className="flex flex-wrap gap-y-8 gap-x-6 justify-center mt-6">
              {cryptogramData.encrypted.split(" ").map((word: string, wIdx: number) => {
                const originalWord = cryptogramData.original.split(" ")[wIdx] || "";
                return (
                  <div key={wIdx} className="flex">
                    {word.split("").map((char: string, cIdx: number) => {
                      const isLetter = /[A-Z]/.test(char);
                      const originalChar = originalWord[cIdx] || "";
                      return (
                        <div key={cIdx} className="flex flex-col items-center mx-0.5">
                          {isLetter ? (
                            <>
                              <div className="w-8 h-9 border-2 border-slate-350 bg-slate-50 flex items-center justify-center font-bold text-xs rounded-md shadow-sm transition-all">
                                {isSolution ? (
                                  <span className="text-indigo-600 font-extrabold">{originalChar}</span>
                                ) : (
                                  ""
                                )}
                              </div>
                              <span className="text-[10px] font-black text-slate-500 mt-1 uppercase font-mono">{char}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-9 flex items-end justify-center font-black text-slate-800 text-sm">
                                {char}
                              </div>
                              <span className="h-4"></span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Substitution Key (Solution only) */}
            {isSolution && (
              <div className="mt-12 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-2">Substitution Key</h3>
                <div className="grid grid-cols-26 gap-0.5 text-center font-mono text-[9px] font-bold text-slate-500 overflow-x-auto pb-2">
                  <div className="flex flex-col border border-slate-200 bg-white p-1 rounded">
                    <span>A-Z</span>
                    <span className="text-indigo-600 border-t border-slate-100 mt-1">Key</span>
                  </div>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                    <div key={l} className="flex flex-col border border-slate-200 bg-white p-1 rounded">
                      <span>{l}</span>
                      <span className="text-indigo-600 border-t border-slate-100 mt-1">
                        {cryptogramData.cipherMap[l] || "_"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load cryptogram.</div>
        )}
      </div>
    </div>
  );
}
