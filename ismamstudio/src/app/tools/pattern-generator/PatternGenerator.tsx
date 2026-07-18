"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Palette, Download, Info } from "lucide-react";

type PatternName =
  | "Polka Dots" | "Diagonal Stripes" | "Horizontal Stripes" | "Grid"
  | "Checkerboard" | "Chevron" | "Waves" | "Crosshatch"
  | "Diamonds" | "Plus Signs" | "Triangles" | "Rings";

const PATTERNS: PatternName[] = [
  "Polka Dots", "Diagonal Stripes", "Horizontal Stripes", "Grid",
  "Checkerboard", "Chevron", "Waves", "Crosshatch",
  "Diamonds", "Plus Signs", "Triangles", "Rings",
];

const EXPORTS = [
  { label: "Seamless Tile", w: 0, h: 0 }, // tile size decided at runtime
  { label: '8.5"×11" Page @300DPI', w: 2550, h: 3300 },
  { label: '6"×9" Page @300DPI', w: 1800, h: 2700 },
  { label: "Square 2048×2048", w: 2048, h: 2048 },
];

function drawTile(tile: HTMLCanvasElement, name: PatternName, S: number, fg: string, bg: string, lw: number) {
  tile.width = S;
  tile.height = S;
  const ctx = tile.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = fg;
  ctx.strokeStyle = fg;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";

  const dot = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const ring = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  const diamond = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
  };
  const plus = (x: number, y: number, r: number) => {
    const a = r * 0.35;
    ctx.fillRect(x - a, y - r, a * 2, r * 2);
    ctx.fillRect(x - r, y - a, r * 2, a * 2);
  };

  switch (name) {
    case "Polka Dots":
      dot(S / 4, S / 4, S / 8);
      dot((3 * S) / 4, (3 * S) / 4, S / 8);
      break;
    case "Diagonal Stripes":
      ctx.beginPath();
      for (let i = -2; i <= 4; i++) {
        ctx.moveTo((i * S) / 2 - 2 * S, -2 * S);
        ctx.lineTo((i * S) / 2 + 2 * S, 2 * S);
      }
      ctx.stroke();
      break;
    case "Horizontal Stripes":
      ctx.fillRect(0, 0, S, S / 2);
      break;
    case "Grid":
      ctx.fillRect(0, 0, lw, S);
      ctx.fillRect(0, 0, S, lw);
      break;
    case "Checkerboard":
      ctx.fillRect(0, 0, S / 2, S / 2);
      ctx.fillRect(S / 2, S / 2, S / 2, S / 2);
      break;
    case "Chevron":
      ctx.beginPath();
      for (let k = -1; k <= 3; k++) {
        const y0 = (k * S) / 2;
        ctx.moveTo(0, y0 + S / 4);
        ctx.lineTo(S / 2, y0);
        ctx.lineTo(S, y0 + S / 4);
      }
      ctx.stroke();
      break;
    case "Waves":
      ctx.beginPath();
      for (let k = -1; k <= 3; k++) {
        const y0 = (k * S) / 2;
        ctx.moveTo(-2, y0);
        for (let x = -2; x <= S + 2; x += 2) {
          ctx.lineTo(x, y0 + Math.sin((x / S) * Math.PI * 2) * (S / 10));
        }
      }
      ctx.stroke();
      break;
    case "Crosshatch":
      ctx.beginPath();
      for (let i = -2; i <= 4; i++) {
        ctx.moveTo((i * S) / 2 - 2 * S, -2 * S);
        ctx.lineTo((i * S) / 2 + 2 * S, 2 * S);
        ctx.moveTo((i * S) / 2 + 2 * S, -2 * S);
        ctx.lineTo((i * S) / 2 - 2 * S, 2 * S);
      }
      ctx.stroke();
      break;
    case "Diamonds":
      diamond(S / 4, S / 4, S / 7);
      diamond((3 * S) / 4, (3 * S) / 4, S / 7);
      break;
    case "Plus Signs":
      plus(S / 4, S / 4, S / 8);
      plus((3 * S) / 4, (3 * S) / 4, S / 8);
      break;
    case "Triangles":
      ctx.beginPath();
      ctx.moveTo(0, S / 2);
      ctx.lineTo(S / 4, 0);
      ctx.lineTo(S / 2, S / 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(S / 2, S);
      ctx.lineTo((3 * S) / 4, S / 2);
      ctx.lineTo(S, S);
      ctx.closePath();
      ctx.fill();
      break;
    case "Rings":
      ring(S / 4, S / 4, S / 8);
      ring((3 * S) / 4, (3 * S) / 4, S / 8);
      break;
  }
}

export default function PatternGenerator() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const tileRef = useRef<HTMLCanvasElement | null>(null);
  const [pattern, setPattern] = useState<PatternName>("Polka Dots");
  const [fg, setFg] = useState<string>("#c7b9a2");
  const [bg, setBg] = useState<string>("#faf7f0");
  const [scale, setScale] = useState<number>(64);
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [exportIdx, setExportIdx] = useState<number>(0);

  const render = useCallback(() => {
    if (!tileRef.current) tileRef.current = document.createElement("canvas");
    const tile = tileRef.current;
    drawTile(tile, pattern, scale, fg, bg, lineWidth);

    const preview = previewRef.current;
    if (!preview) return;
    const ctx = preview.getContext("2d")!;
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, preview.width, preview.height);
  }, [pattern, fg, bg, scale, lineWidth]);

  useEffect(() => {
    render();
  }, [render]);

  const download = () => {
    const tile = tileRef.current;
    if (!tile) return;
    const exp = EXPORTS[exportIdx];
    const slug = pattern.toLowerCase().replace(/\s+/g, "-");
    if (exp.w === 0) {
      const a = document.createElement("a");
      a.download = `${slug}-tile-${scale}px.png`;
      a.href = tile.toDataURL("image/png");
      a.click();
      return;
    }
    const out = document.createElement("canvas");
    out.width = exp.w;
    out.height = exp.h;
    const ctx = out.getContext("2d")!;
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, exp.w, exp.h);
    const a = document.createElement("a");
    a.download = `${slug}-${exp.w}x${exp.h}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  return (
    <ToolShell
      title="Seamless Pattern"
      highlight="Generator"
      subtitle="Create seamless patterns for book covers, interiors, and endpapers. Twelve styles, custom colors, and print-ready 300 DPI exports."
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" /> Pattern Design
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(p)}
                  className={`py-2 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    pattern === p
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono font-bold text-slate-300">{fg}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Background
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono font-bold text-slate-300">{bg}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Pattern Scale — {scale}px tile
              </label>
              <input
                type="range" min={24} max={200} value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Line Weight — {lineWidth}px
              </label>
              <input
                type="range" min={1} max={16} value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Export Size
              </label>
              <select
                value={exportIdx}
                onChange={(e) => setExportIdx(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {EXPORTS.map((exp, i) => (
                  <option key={exp.label} value={i}>
                    {exp.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={download}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-4 md:p-6">
            <canvas
              ref={previewRef}
              width={1200}
              height={800}
              className="w-full h-auto rounded-2xl border border-slate-900"
            />
            <p className="text-[10px] font-bold text-slate-500 mt-3 text-center">
              Live tiled preview — the exported tile repeats seamlessly in every direction.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Use the 300 DPI page exports as journal backgrounds, notebook covers, or endpapers.
              The seamless tile export works in Canva, Photoshop, and book design software as a
              repeating fill.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
