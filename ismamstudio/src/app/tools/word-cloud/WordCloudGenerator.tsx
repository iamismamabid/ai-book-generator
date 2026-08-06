"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { splitWords, STOPWORDS } from "@/components/tools/textStats";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getNotebookEntryData } from "@/app/actions";
import { Cloud, Download, RefreshCw, Info } from "lucide-react";

const SCHEMES: Record<string, { bg: string; colors: string[] }> = {
  "Indigo Night": { bg: "#0b0f19", colors: ["#818cf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#e2e8f0"] },
  "Paper White": { bg: "#ffffff", colors: ["#1e293b", "#4338ca", "#b45309", "#0f766e", "#be123c", "#334155"] },
  "Sunset": { bg: "#1c1917", colors: ["#fb923c", "#f87171", "#facc15", "#fda4af", "#fdba74", "#fef3c7"] },
  "Ocean": { bg: "#082f49", colors: ["#38bdf8", "#22d3ee", "#a5f3fc", "#818cf8", "#e0f2fe", "#7dd3fc"] },
  "Forest": { bg: "#f0fdf4", colors: ["#166534", "#15803d", "#4d7c0f", "#a16207", "#14532d", "#3f6212"] },
  "Mono Ink": { bg: "#ffffff", colors: ["#0f172a", "#334155", "#475569", "#64748b", "#1e293b", "#020617"] },
};

interface PlacedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function collides(box: PlacedBox, placed: PlacedBox[], pad = 4): boolean {
  return placed.some(
    (p) =>
      box.x - pad < p.x + p.w &&
      box.x + box.w + pad > p.x &&
      box.y - pad < p.y + p.h &&
      box.y + box.h + pad > p.y
  );
}

export default function WordCloudGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState<string>("");
  const [maxWords, setMaxWords] = useState<number>(60);
  const [scheme, setScheme] = useState<string>("Indigo Night");
  const [allowRotate, setAllowRotate] = useState<boolean>(true);
  const [filterStops, setFilterStops] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(1);
  const [wordCount, setWordCount] = useState<number>(0);

  // Restore a saved My Notebook entry (via ?notebookId=...).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const notebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (!notebookId) return;

    getNotebookEntryData(notebookId)
      .then((res) => {
        if (!res.success || !res.data) return;
        const d: any = res.data;
        if (typeof d.text === "string") setText(d.text);
        if (typeof d.maxWords === "number") setMaxWords(d.maxWords);
        if (typeof d.scheme === "string") setScheme(d.scheme);
        if (typeof d.allowRotate === "boolean") setAllowRotate(d.allowRotate);
        if (typeof d.filterStops === "boolean") setFilterStops(d.filterStops);
      })
      .catch((err) => console.error("Failed to load notebook entry:", err));
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const { bg, colors } = SCHEMES[scheme];

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Frequency map
    const words = splitWords(text).filter(
      (w) => w.length >= 3 && (!filterStops || !STOPWORDS.has(w))
    );
    const freq = new Map<string, number>();
    words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxWords);
    setWordCount(top.length);
    if (top.length === 0) {
      ctx.fillStyle = bg === "#ffffff" || bg === "#f0fdf4" ? "#94a3b8" : "#475569";
      ctx.font = "bold 40px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Paste text to generate your word cloud", W / 2, H / 2);
      return;
    }

    const maxCount = top[0][1];
    const minCount = top[top.length - 1][1];
    const range = Math.max(1, maxCount - minCount);

    // Simple seeded pseudo-random
    let rnd = seed * 9301 + 49297;
    const random = () => {
      rnd = (rnd * 9301 + 49297) % 233280;
      return rnd / 233280;
    };

    const placed: PlacedBox[] = [];

    top.forEach(([word, count], i) => {
      const scale = Math.pow((count - minCount) / range, 0.65);
      const fontSize = Math.round(18 + scale * 92);
      const rotated = allowRotate && i > 0 && random() < 0.25;
      ctx.font = `${i < 5 ? "900" : "700"} ${fontSize}px Georgia, 'Times New Roman', serif`;
      const metrics = ctx.measureText(word);
      const tw = metrics.width;
      const th = fontSize * 1.05;
      const boxW = rotated ? th : tw;
      const boxH = rotated ? tw : th;

      // Archimedean spiral placement from center
      const startAngle = random() * Math.PI * 2;
      let placedOk = false;
      for (let t = 0; t < 3000; t += 4) {
        const angle = startAngle + t * 0.05;
        const radius = t * 0.28;
        const cx = W / 2 + Math.cos(angle) * radius * 1.4;
        const cy = H / 2 + Math.sin(angle) * radius * 0.85;
        const box: PlacedBox = { x: cx - boxW / 2, y: cy - boxH / 2, w: boxW, h: boxH };
        if (box.x < 8 || box.y < 8 || box.x + box.w > W - 8 || box.y + box.h > H - 8) continue;
        if (!collides(box, placed)) {
          placed.push(box);
          ctx.save();
          ctx.fillStyle = colors[i % colors.length];
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.translate(cx, cy);
          if (rotated) ctx.rotate(-Math.PI / 2);
          ctx.fillText(word, 0, 0);
          ctx.restore();
          placedOk = true;
          break;
        }
      }
      if (!placedOk) {
        // couldn't fit — skip word
      }
    });
  }, [text, maxWords, scheme, allowRotate, filterStops, seed]);

  useEffect(() => {
    render();
  }, [render]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "word-cloud.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const faqs = [
    {
      q: "Can I use the exported image commercially?",
      a: "Yes — the PNG you download is generated entirely from your own text with no watermark or usage restriction.",
    },
    {
      q: "Why do some words get skipped?",
      a: "At high word counts the layout algorithm occasionally can't fit every word without excessive overlap — reduce max words or click Shuffle Layout to try a different arrangement.",
    },
    {
      q: "Does my pasted text get uploaded?",
      a: "No — the whole word cloud renders on an in-browser canvas; nothing leaves your device.",
    },
  ];

  return (
    <ToolShell
      title="Word Cloud"
      highlight="Generator"
      subtitle="Turn any text or keyword list into a beautiful word cloud — perfect for research visualization, cover concepts, and social media graphics."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-400" /> Source Text
            </h3>
            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any text — a chapter, reviews, research notes, or a comma-separated keyword list. Bigger words = more frequent."
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Max Words — {maxWords}
              </label>
              <input
                type="range"
                min={10}
                max={120}
                value={maxWords}
                onChange={(e) => setMaxWords(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Color Scheme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(SCHEMES).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScheme(s)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                      scheme === s
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className="flex -space-x-1">
                      {SCHEMES[s].colors.slice(0, 3).map((c) => (
                        <span key={c} className="w-3 h-3 rounded-full border border-slate-900" style={{ background: c }} />
                      ))}
                    </span>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={allowRotate} onChange={(e) => setAllowRotate(e.target.checked)} className="w-4 h-4 accent-indigo-500 cursor-pointer" />
              <span className="text-xs font-bold text-slate-300">Rotate some words vertically</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={filterStops} onChange={(e) => setFilterStops(e.target.checked)} className="w-4 h-4 accent-indigo-500 cursor-pointer" />
              <span className="text-xs font-bold text-slate-300">Filter common words (the, and, of…)</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Shuffle Layout
              </button>
              <button
                onClick={download}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
            </div>

            <SaveToNotebookButton
              title={`Word Cloud (${wordCount} words, ${scheme})`}
              content={text.slice(0, 500)}
              category="word-cloud"
              data={{ text, maxWords, scheme, allowRotate, filterStops }}
              className="w-full justify-center"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-4 md:p-6">
            <canvas
              ref={canvasRef}
              width={1600}
              height={1000}
              className="w-full h-auto rounded-2xl border border-slate-900"
            />
            <p className="text-[10px] font-bold text-slate-500 mt-3 text-center">
              {wordCount > 0 ? `${wordCount} words placed — exported at 1600×1000px` : "1600×1000px canvas — high enough resolution for social media and print mockups"}
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Tip: paste your book&apos;s reviews to visualize what readers mention most, or paste
              competitor descriptions to spot the language your niche expects. Everything renders
              locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
