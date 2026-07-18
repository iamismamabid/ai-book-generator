"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Upload } from "lucide-react";

const DEFAULT_WORDS = [
  "AEROSPACE", "PROPULSION", "CONTAINMENT", "STABILIZATION",
  "ANTIGRAVITY", "FLIGHT", "PAYLOAD"
];

export function WordScrambleEditor({ page, updatePage }: any) {
  const [inputText, setInputText] = useState(() => {
    if (page.config.rawText) return page.config.rawText;
    const pools = [
      ["AEROSPACE", "PROPULSION", "CONTAINMENT", "STABILIZATION", "ANTIGRAVITY", "FLIGHT", "PAYLOAD"],
      ["GALAXY", "NEBULA", "SUPERNOVA", "TELESCOPE", "ASTRONAUT", "GRAVITY", "ORBIT"],
      ["ALGORITHM", "COMPILER", "DATABASE", "ENCRYPTION", "RECURSION", "VARIABLE", "FUNCTION"],
      ["HYDROGEN", "OXYGEN", "CARBON", "NITROGEN", "HELIUM", "URANIUM", "PLATINUM"],
      ["CARNIVORE", "HERBIVORE", "OMNIVORE", "PREDATOR", "MAMMAL", "REPTILE", "AMPHIBIAN"],
      ["METROPOLIS", "ARCHITECT", "SKYLINE", "SUBWAY", "BOULEVARD", "MONUMENT", "DISTRICT"],
      ["CHAMPION", "ATHLETE", "TOURNAMENT", "MARATHON", "STADIUM", "REFEREE", "VICTORY"]
    ];
    const selected = pools[Math.floor(Math.random() * pools.length)];
    return selected.join("\n");
  });
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    page.config.difficulty || "easy"
  );
  const [scrambledData, setScrambledData] = useState<any>(
    page.config.scrambledData || null
  );
  const csvInputRef = useRef<HTMLInputElement>(null);

  const isSolution = page.config.isSolution || false;

  // 📁 CSV / TXT import handler (one word per line, or comma-separated)
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      // If the file uses commas as delimiter, convert to newline
      const lines = text
        .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
        .split("\n")
        .flatMap((line) => line.split(","))
        .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
        .filter((w) => w.length > 0);
      setInputText(lines.join("\n"));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const scrambleWord = (word: string, diff: "easy" | "medium" | "hard"): string => {
    if (word.length <= 1) return word;

    if (diff === "easy" && word.length > 3) {
      const first = word[0];
      const last = word[word.length - 1];
      const middle = word.slice(1, -1).split("");

      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }

      const scrambled = first + middle.join("") + last;
      if (scrambled === word) return first + middle.reverse().join("") + last;
      return scrambled;
    }

    if (diff === "medium" && word.length > 2) {
      const first = word[0];
      const rest = word.slice(1).split("");

      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }

      const scrambled = first + rest.join("");
      if (scrambled === word) return first + rest.reverse().join("");
      return scrambled;
    }

    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    const scrambled = letters.join("");
    if (scrambled === word) return letters.reverse().join("");
    return scrambled;
  };

  const handleGenerate = () => {
    const parsed = inputText
      .split("\n")
      .map((w: string) => w.trim().toUpperCase())
      .filter((w: string) => w.length > 0 && /^[A-Z]+$/.test(w));

    if (parsed.length === 0) {
      alert("Please enter some words (letters only).");
      return;
    }

    const scrambledList = parsed.map((word: string) => scrambleWord(word, difficulty));
    const wordBank = [...parsed].sort((a, b) => a.localeCompare(b));

    const result = {
      original: parsed,
      scrambled: scrambledList,
      wordBank
    };

    setScrambledData(result);
    updatePage({
      rawText: inputText,
      difficulty,
      scrambledData: result,
      isSolution
    });
  };

  const handleToggleMode = (solMode: boolean) => {
    updatePage({
      rawText: inputText,
      difficulty,
      scrambledData,
      isSolution: solMode
    });
  };

  useEffect(() => {
    if (!scrambledData) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${!isSolution
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                Puzzle
              </button>
              <button
                onClick={() => handleToggleMode(true)}
                className={`py-2 rounded-lg font-bold text-xs uppercase transition ${isSolution
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
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg font-bold text-xs capitalize transition ${difficulty === d
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Words (One per line)</label>
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
            placeholder="Enter words (one per line) — or import a .csv/.txt file..."
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate Scramble
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white p-10 shadow-2xl border border-slate-200 min-h-[700px] flex flex-col items-center">
        <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-widest text-slate-800">
          Word Scramble {isSolution && <span className="text-indigo-600">(Solution)</span>}
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">
          Unscramble the letters below
        </p>

        {scrambledData ? (
          <div className="w-full max-w-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {scrambledData.scrambled.map((scrambled: string, wIdx: number) => {
                const solutionWord = scrambledData.original[wIdx];
                return (
                  <div key={wIdx} className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300">#{wIdx + 1}</span>
                      <span className="text-sm font-bold tracking-widest text-slate-800 font-mono">
                        {scrambled.split("").join(" ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSolution ? (
                        <span className="text-indigo-600 font-black font-mono border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-md text-xs">
                          {solutionWord}
                        </span>
                      ) : (
                        <span className="w-28 border-b-2 border-dashed border-slate-300 h-6"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Word Bank (Skip if Hard) */}
            {difficulty !== "hard" && !isSolution && (
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-2">Word Bank</h3>
                <div className="grid grid-cols-3 gap-2">
                  {scrambledData.wordBank.map((w: string, idx: number) => (
                    <span key={idx} className="text-xs font-semibold text-slate-600 text-center font-mono">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Click generate to load scramble.</div>
        )}
      </div>
    </div>
  );
}
