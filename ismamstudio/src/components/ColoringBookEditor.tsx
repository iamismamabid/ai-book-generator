"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { RefreshCw, Hash, Grid, Sparkles } from "lucide-react";
import { PRESETS, PresetItem, drawColoringPattern } from "@/lib/coloringBookPatterns";

const CATEGORIES = [
  "All",
  "Botanical & Floral",
  "Mandalas & Sacred Geometry",
  "Stained Glass & Architecture",
  "Landscapes & Celestial",
  "Food, Drinks & Kitchen",
  "Cozy Objects & Still Life",
  "Abstract & Art Deco",
];

export function ColoringBookEditor({ page, updatePage }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [presetId, setPresetId] = useState<string>(page.config.presetId || "citrus_slices");
  const [complexity, setComplexity] = useState<number>(page.config.complexity ?? 12);
  const [lineWidth, setLineWidth] = useState<number>(page.config.lineWidth ?? 3);
  const [isColorByNumber, setIsColorByNumber] = useState<boolean>(page.config.isColorByNumber ?? true);
  const [isMidnightMode, setIsMidnightMode] = useState<boolean>(page.config.isMidnightMode ?? false);
  const [frameStyle, setFrameStyle] = useState<"ornamental" | "circle" | "minimal" | "none">(page.config.frameStyle || "ornamental");
  const [seed, setSeed] = useState<number>(page.config.seed ?? Math.floor(Math.random() * 10000));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePreset: PresetItem = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const filteredPresets = PRESETS.filter((p) => selectedCategory === "All" || p.category === selectedCategory);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawColoringPattern(ctx, canvas.width, canvas.height, {
      presetId,
      complexity,
      lineWidth,
      isColorByNumber,
      isMidnightMode,
      frameStyle,
      seed,
    });
  }, [presetId, complexity, lineWidth, isColorByNumber, isMidnightMode, frameStyle, seed]);

  useEffect(() => {
    draw();
    updatePage({ presetId, complexity, lineWidth, isColorByNumber, isMidnightMode, frameStyle, seed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Options Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-indigo-500" /> Category
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Design Template
          </h3>
          <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setPresetId(preset.id);
                  setComplexity(preset.defaultComplexity);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  presetId === preset.id
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="text-[11px] font-black">{preset.name}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" /> Color-by-Number
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Numbered regions + palette key</div>
            </div>
            <input
              type="checkbox"
              checked={isColorByNumber}
              onChange={(e) => setIsColorByNumber(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Line Thickness</span>
              <span className="text-indigo-600 font-mono">{lineWidth}px</span>
            </div>
            <input type="range" min="1" max="8" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Pattern Complexity</span>
              <span className="text-indigo-600 font-mono">{complexity}</span>
            </div>
            <input type="range" min="6" max="24" value={complexity} onChange={(e) => setComplexity(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 mb-1 block">Border Frame</label>
              <select
                value={frameStyle}
                onChange={(e) => setFrameStyle(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold"
              >
                <option value="ornamental">Ornamental</option>
                <option value="circle">Circle Vignette</option>
                <option value="minimal">Minimal Line</option>
                <option value="none">Full Bleed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 mb-1 block">Style Mode</label>
              <button
                onClick={() => setIsMidnightMode(!isMidnightMode)}
                className={`w-full py-2 px-2 rounded-lg border text-[11px] font-bold transition ${
                  isMidnightMode ? "bg-slate-950 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isMidnightMode ? "🌙 Midnight" : "☀️ Standard"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Regenerate Variation
          </button>
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="flex-1 min-w-0 bg-slate-200/50 p-3 sm:p-5 lg:p-8 overflow-y-auto flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-[700px]">
        <div className="bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-sm border border-slate-300/80 overflow-hidden" style={{ width: "480px", height: `${480 * (11 / 8.5)}px` }}>
          <canvas ref={canvasRef} width={850} height={1100} className="w-full h-full object-contain" />
        </div>
        <span className="mt-4 text-xs font-bold text-slate-500">
          Preset: <strong className="text-slate-900">{activePreset.name}</strong> ({activePreset.category})
        </span>
      </div>
    </div>
  );
}
