"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Upload, Sparkles, Plus, Files, FileSpreadsheet, Check, X } from "lucide-react";

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

interface ParsedBatchCryptogram {
  title: string;
  quote: string;
}

export function CryptogramEditor({ page, updatePage, bulkAddPages }: any) {
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
  const [customCount, setCustomCount] = useState<number>(10);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const batchCsvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // Multi-puzzle batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawInput, setBatchRawInput] = useState("");
  const [parsedPuzzles, setParsedPuzzles] = useState<ParsedBatchCryptogram[]>([]);
  const [includeMatchingSolutions, setIncludeMatchingSolutions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Parse text or CSV into multiple cryptograms
  const parseMultiCryptogramText = (rawText: string): ParsedBatchCryptogram[] => {
    const text = rawText.trim();
    if (!text) return [];

    // Check if separated by blank lines (blocks)
    const blocks = text.split(/\r?\n\s*\r?\n+/).map((b) => b.trim()).filter((b) => b.length > 0);

    if (blocks.length > 1) {
      const results: ParsedBatchCryptogram[] = [];
      blocks.forEach((block, idx) => {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        let title = `Cryptogram #${idx + 1}`;
        let quote = "";

        const firstLine = lines[0];
        const isExplicitTitle =
          firstLine.toUpperCase().startsWith("THEME") ||
          firstLine.toUpperCase().startsWith("TITLE") ||
          firstLine.toUpperCase().startsWith("AUTHOR") ||
          firstLine.toUpperCase().startsWith("CATEGORY");

        if (isExplicitTitle) {
          title = firstLine.replace(/^(THEME|TITLE|AUTHOR|CATEGORY)\s*:?/i, "").replace(/^[:\-–]/, "").trim() || title;
          quote = lines.slice(1).join(" ").trim().toUpperCase();
        } else {
          quote = lines.join(" ").trim().toUpperCase();
        }

        quote = quote.replace(/^["']|["']$/g, "").trim();

        if (quote.length >= 8) {
          results.push({ title, quote });
        }
      });
      if (results.length > 0) return results;
    }

    // Otherwise line-by-line (each line is a quote / cryptogram)
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const rowResults: ParsedBatchCryptogram[] = [];

    lines.forEach((line, idx) => {
      let title = `Cryptogram #${idx + 1}`;
      let quote = line;

      // Check if line is CSV formatted e.g. "Category/Author","Quote..."
      if (line.includes(",") && (line.startsWith('"') || line.includes('","') || !line.endsWith('.'))) {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 2) {
          const col1 = matches[0].replace(/^["']|["']$/g, "").trim();
          const col2 = matches[1].replace(/^["']|["']$/g, "").trim();
          if (col1.length < col2.length && col2.length >= 8) {
            title = col1;
            quote = col2;
          } else {
            quote = col1;
          }
        }
      } else if (line.includes(":") && !line.startsWith("http")) {
        const parts = line.split(":");
        if (parts[0].length < 30 && parts.slice(1).join(":").trim().length >= 8) {
          title = parts[0].trim();
          quote = parts.slice(1).join(":").trim();
        }
      }

      quote = quote.replace(/^["']|["']$/g, "").trim().toUpperCase();
      if (quote.length >= 8) {
        rowResults.push({ title, quote });
      }
    });

    return rowResults;
  };

  // 📁 Multi-Puzzle CSV file upload handler
  const handleBatchCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setBatchRawInput(text);
      const parsed = parseMultiCryptogramText(text);
      setParsedPuzzles(parsed);
      setIsBatchModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBatchInputChange = (val: string) => {
    setBatchRawInput(val);
    const parsed = parseMultiCryptogramText(val);
    setParsedPuzzles(parsed);
  };

  // 🚀 Execute Batch Creation
  const handleExecuteBatchCryptogramImport = () => {
    if (parsedPuzzles.length === 0) {
      alert("No valid quotes detected. Please make sure quotes are at least 8 characters.");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // 1. First puzzle updates the active page
      const firstPuz = parsedPuzzles[0];
      const mapping = generateCipher();
      const encrypted = firstPuz.quote
        .split("")
        .map((c: string) => (/[A-Z]/.test(c) ? mapping[c] || c : c))
        .join("");
      const firstResult = {
        original: firstPuz.quote,
        encrypted,
        cipherMap: mapping,
      };

      setInputText(parsedPuzzles.map((p) => p.quote).join("\n"));
      setSelectedQuoteIndex(0);
      setCryptogramData(firstResult);
      updatePage({
        rawText: parsedPuzzles.map((p) => p.quote).join("\n"),
        selectedQuoteIndex: 0,
        cryptogramData: firstResult,
        title: firstPuz.title,
        isSolution: false,
      });

      // 2. Prepare remaining puzzle pages
      const newConfigs: any[] = [];
      for (let i = 1; i < parsedPuzzles.length; i++) {
        const puz = parsedPuzzles[i];
        const map = generateCipher();
        const enc = puz.quote
          .split("")
          .map((c: string) => (/[A-Z]/.test(c) ? map[c] || c : c))
          .join("");
        newConfigs.push({
          rawText: puz.quote,
          selectedQuoteIndex: i,
          cryptogramData: { original: puz.quote, encrypted: enc, cipherMap: map },
          title: puz.title,
          isSolution: false,
        });
      }

      // 3. If matching solutions requested, append solution pages
      if (includeMatchingSolutions) {
        parsedPuzzles.forEach((puz, pIdx) => {
          const map = pIdx === 0 ? mapping : generateCipher();
          const enc = puz.quote
            .split("")
            .map((c: string) => (/[A-Z]/.test(c) ? map[c] || c : c))
            .join("");
          newConfigs.push({
            rawText: puz.quote,
            selectedQuoteIndex: pIdx,
            cryptogramData: { original: puz.quote, encrypted: enc, cipherMap: map },
            title: `${puz.title} (Solution)`,
            isSolution: true,
          });
        });
      }

      if (newConfigs.length > 0 && bulkAddPages) {
        bulkAddPages(newConfigs);
      }

      setIsImporting(false);
      setIsBatchModalOpen(false);
      const totalCreated = 1 + newConfigs.length;
      alert(`✅ Success! Created ${totalCreated} total pages from your CSV file (${parsedPuzzles.length} puzzle pages${includeMatchingSolutions ? ` + ${parsedPuzzles.length} solution pages` : ''}).`);
    }, 150);
  };

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

  const handleQuickAddCryptograms = (count: number) => {
    if (!bulkAddPages) return;
    const num = Math.max(1, Math.min(100, count));
    const parsed = inputText
      .split("\n")
      .map((q: string) => q.trim().toUpperCase())
      .filter((q: string) => q.length > 0);
    const quotes = parsed.length > 0 ? parsed : DEFAULT_QUOTES;

    const configs = [];
    for (let i = 0; i < num; i++) {
      const qIdx = i % quotes.length;
      const targetQuote = quotes[qIdx];
      const mapping = generateCipher();
      const encrypted = targetQuote
        .split("")
        .map((c: string) => (/[A-Z]/.test(c) ? mapping[c] || c : c))
        .join("");
      configs.push({
        rawText: inputText,
        selectedQuoteIndex: qIdx,
        cryptogramData: { original: targetQuote, encrypted, cipherMap: mapping },
        isSolution: false,
      });
    }
    bulkAddPages(configs);
    alert(`✅ Successfully added ${configs.length} Cryptogram puzzles to your book!`);
  };

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

        {/* Multi-Puzzle Batch CSV Button */}
        {bulkAddPages && (
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/60 border border-indigo-200 p-4 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Batch CSV Generator
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    1 CSV = entire book of cryptograms
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => batchCsvInputRef.current?.click()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Full CSV (Multi-Page)
            </button>
            <input
              type="file"
              accept=".csv,.txt"
              ref={batchCsvInputRef}
              onChange={handleBatchCsvFile}
              className="hidden"
            />
          </div>
        )}

        {/* Quick Add Cryptogram Pages */}
        {bulkAddPages && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add Cryptogram Pages
              </span>
              <span className="text-[10px] font-bold text-slate-400">Quotes Pool</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleQuickAddCryptograms(cnt)}
                  className="py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  +{cnt} Puzzles
                </button>
              ))}
            </div>

            {/* Custom Add Page Option */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
              <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-[11px] font-bold text-slate-500 mr-1.5 shrink-0">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full bg-transparent text-xs font-black text-slate-900 outline-none"
                  placeholder="20"
                />
                <span className="text-[11px] font-medium text-slate-400 ml-1 shrink-0">pages</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAddCryptograms(customCount)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

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
            {/* Safe Area Guides (Canvas Preview) */}
            <div className="absolute top-0 bottom-0 left-0 border-r border-dashed border-rose-400/40 pointer-events-none" style={{ width: "45px" }} />
            <div className="absolute top-0 bottom-0 right-0 border-l border-dashed border-rose-400/40 pointer-events-none" style={{ width: "30px" }} />
            <div className="absolute left-0 right-0 top-0 border-b border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
            <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
            <span className="absolute bottom-1 right-2 text-[8px] font-black text-rose-500 opacity-60">SAFE PRINT AREA</span>

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
                  {page?.config?.title || `Puzzle #${selectedQuoteIndex + 1}`}
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
                          {cryptogramData?.cipherMap?.[l] || cryptogramData?.mapping?.[l] || "_"}
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

      {/* ⚡ Multi-Puzzle Batch Importer Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <Files className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Bulk CSV &amp; Multi-Cryptogram Importer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Generate an entire collection of cryptogram pages from a single CSV or text file
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    CSV or Multi-Line Text Format
                  </label>
                  <span className="text-[11px] font-bold text-indigo-600">
                    1 quote per line OR empty line between quotes
                  </span>
                </div>
                <textarea
                  value={batchRawInput}
                  onChange={(e) => handleBatchInputChange(e.target.value)}
                  className="w-full h-40 p-3.5 border border-slate-200 rounded-2xl text-xs font-mono bg-slate-50 text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="Format A (CSV Rows with Category/Author and Quote):&#10;&quot;Inspiration&quot;,&quot;The only limit to our realization of tomorrow will be our doubts of today.&quot;&#10;&quot;Albert Einstein&quot;,&quot;In the middle of difficulty lies opportunity.&quot;&#10;&#10;Format B (Plain Quotes, one per line):&#10;SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL.&#10;BELIEVE YOU CAN AND YOU ARE HALFWAY THERE."
                />
              </div>

              {/* Detected summary */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Detected Puzzles: <span className="text-indigo-600 font-bold">{parsedPuzzles.length}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Minimum 8 characters per quote required)
                  </span>
                </div>

                {parsedPuzzles.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {parsedPuzzles.slice(0, 6).map((puz, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 p-2 rounded-xl text-xs flex items-center justify-between"
                      >
                        <span className="font-black text-slate-800 truncate max-w-[160px]">
                          {i + 1}. {puz.title}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {puz.quote}
                        </span>
                      </div>
                    ))}
                    {parsedPuzzles.length > 6 && (
                      <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                        + {parsedPuzzles.length - 6} more cryptograms will be generated
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No valid quotes found yet. Add quotes or paste CSV content above.</p>
                )}
              </div>

              {/* Matching Solutions Option */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeMatchingSolutions}
                  onChange={(e) => setIncludeMatchingSolutions(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Also generate matching Solution Pages
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Appends a decoded solution page with complete substitution cipher key for each created puzzle.
                  </div>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBatchCryptogramImport}
                disabled={parsedPuzzles.length === 0 || isImporting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating {parsedPuzzles.length} Pages...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Generate &amp; Insert All {parsedPuzzles.length} Pages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
