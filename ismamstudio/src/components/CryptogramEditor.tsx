"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Upload } from "lucide-react";

const DEFAULT_QUOTES = [
  "THE ONLY LIMIT TO OUR REALIZATION OF TOMORROW WILL BE OUR DOUBTS OF TODAY.",
  "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS.",
  "BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD.",
  "IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY.",
  "IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE.",
  "THE JOURNEY OF A THOUSAND MILES BEGINS WITH ONE STEP.",
  "TO BE YOURSELF IN A WORLD THAT IS CONSTANTLY TRYING TO MAKE YOU SOMETHING ELSE IS THE GREATEST ACCOMPLISHMENT.",
  "IT ALWAYS SEEMS IMPOSSIBLE UNTIL IT IS DONE.",
  "DO NOT GO WHERE THE PATH MAY LEAD, GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL.",
  "WHAT YOU GET BY ACHIEVING YOUR GOALS IS NOT AS IMPORTANT AS WHAT YOU BECOME BY ACHIEVING YOUR GOALS.",
  "BELIEVE YOU CAN AND YOU ARE HALFWAY THERE.",
  "IN THE END, WE WILL REMEMBER NOT THE WORDS OF OUR ENEMIES, BUT THE SILENCE OF OUR FRIENDS.",
  "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO.",
  "IF YOU WANT TO LIVE A HAPPY LIFE, TIE IT TO A GOAL, NOT TO PEOPLE OR THINGS.",
  "LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS."
];

export function CryptogramEditor({ page, updatePage }: any) {
  const [inputText, setInputText] = useState(
    page.config.rawText || DEFAULT_QUOTES.join("\n")
  );
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(() => {
    if (page.config.selectedQuoteIndex !== undefined) return page.config.selectedQuoteIndex;
    return Math.floor(Math.random() * DEFAULT_QUOTES.length);
  });
  const [cryptogramData, setCryptogramData] = useState<any>(
    page.config.cryptogramData || null
  );
  const csvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // 📁 CSV / TXT import handler (one quote per line)
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      const lines = text
        .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
        .split("\n")
        .map((q) => q.trim().toUpperCase())
        .filter((q) => q.length > 0);
      if (lines.length === 0) return;
      setInputText(lines.join("\n"));
      setSelectedQuoteIndex(0);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

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
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Quotes Pool (One per line)</label>
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
      <div className="flex-1 min-w-0 bg-slate-200/50 p-3 sm:p-5 lg:p-8 overflow-y-auto flex items-center justify-center relative min-h-[400px] lg:min-h-[700px]">
        {cryptogramData ? (
          <div 
            className="relative bg-white shadow-[0_15px_40px_rgba(0,0,0,0.06)] rounded-sm border border-slate-300/80 flex flex-col p-12 overflow-hidden cursor-default transition-all duration-300"
            style={{
              width: "480px", // proportional scaling for viewing
              height: `${480 * (11 / 8.5)}px`, // standard 8.5x11 aspect ratio
              paddingTop: "40px",
              paddingBottom: "40px",
              paddingLeft: "45px",
              paddingRight: "30px"
            }}
          >
            {/* Preview Layout content wrapper */}
            <div className="flex flex-col h-full justify-between">
              
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                  Cryptogram Puzzles
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Substitution Puzzle Preview
                </p>
                <div className="h-px bg-slate-100 my-3" />
              </div>

              {/* Encrypted Puzzle block */}
              <div className="flex-1 flex flex-col justify-start pt-4 space-y-4">
                <h4 className="text-xs font-black text-indigo-600 uppercase">
                  Puzzle #{selectedQuoteIndex + 1}
                </h4>
                
                {/* Grid wrap simulation */}
                <div className="flex flex-wrap gap-x-2 gap-y-4 items-start select-none w-full">
                  {cryptogramData.encrypted.split(" ").map((word: string, wIdx: number) => {
                    const originalWord = cryptogramData.original.split(" ")[wIdx] || "";
                    return (
                      <div key={wIdx} className="flex gap-x-[3px] items-center mb-1">
                        {word.split("").map((char: string, cIdx: number) => {
                          const isLetter = /[A-Z]/.test(char);
                          const originalChar = originalWord[cIdx] || "";
                          return (
                            <div key={cIdx} className="flex flex-col items-center">
                              {isLetter ? (
                                <>
                                  {/* Empty top write-in grid slot or filled if it is solution */}
                                  <div className="w-[15px] h-[17px] border border-slate-300 bg-slate-50/50 rounded flex items-center justify-center text-[9px] font-bold text-slate-700">
                                    {isSolution ? (
                                      <span className="text-indigo-600 font-extrabold">{originalChar}</span>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                  {/* Cipher bottom letter */}
                                  <span className="font-mono text-[9px] font-bold text-slate-900 mt-1">{char}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-[15px] h-[17px] flex items-end justify-center">
                                    <span className="font-mono text-[9px] font-black text-slate-900">{char}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Substitution Key (Solution only) */}
              {isSolution && (
                <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <h3 className="text-[8px] font-black uppercase tracking-wider text-indigo-600 mb-1">Substitution Key</h3>
                  <div className="flex flex-wrap gap-1 text-center font-mono text-[8px] font-bold text-slate-500 pb-1">
                    <div className="flex flex-col border border-slate-200 bg-white p-0.5 rounded min-w-[20px]">
                      <span>A-Z</span>
                      <span className="text-indigo-600 border-t border-slate-100 mt-0.5">Key</span>
                    </div>
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                      <div key={l} className="flex flex-col border border-slate-200 bg-white p-0.5 rounded min-w-[12px] flex-1">
                        <span>{l}</span>
                        <span className="text-indigo-600 border-t border-slate-100 mt-0.5">
                          {cryptogramData.cipherMap[l] || "_"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-[9px] text-slate-300 font-bold tracking-widest pt-2 border-t border-slate-100">
                PAGE PREVIEW ONLY
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load cryptogram.</div>
        )}
      </div>
    </div>
  );
}
