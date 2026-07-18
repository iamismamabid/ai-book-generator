"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { ImageIcon, Download, Trash2, Package, Info, Loader2 } from "lucide-react";

type FitMode = "contain" | "cover" | "stretch";
type OutFormat = "image/jpeg" | "image/png" | "image/webp";

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: "KDP eBook Cover (1600×2560)", w: 1600, h: 2560 },
  { label: "Audiobook Cover (3000×3000)", w: 3000, h: 3000 },
  { label: "Instagram Post (1080×1080)", w: 1080, h: 1080 },
  { label: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
  { label: "Facebook Post (1200×630)", w: 1200, h: 630 },
  { label: "Pinterest Pin (1000×1500)", w: 1000, h: 1500 },
  { label: "X / Twitter Header (1500×500)", w: 1500, h: 500 },
  { label: "A+ Content Banner (1464×600)", w: 1464, h: 600 },
];

interface ResizedResult {
  name: string;
  url: string;
  blob: Blob;
  width: number;
  height: number;
  sizeKb: number;
}

const MAX_FILES = 50;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not read ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageResizer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [customW, setCustomW] = useState<number>(1600);
  const [customH, setCustomH] = useState<number>(2560);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [fit, setFit] = useState<FitMode>("cover");
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(0.9);
  const [results, setResults] = useState<ResizedResult[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [zipping, setZipping] = useState<boolean>(false);

  const targetW = useCustom ? customW : PRESETS[presetIdx].w;
  const targetH = useCustom ? customH : PRESETS[presetIdx].h;

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = [...list].filter((f) => f.type.startsWith("image/")).slice(0, MAX_FILES);
    setFiles(imgs);
    setResults([]);
  };

  const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";

  const processAll = async () => {
    if (files.length === 0 || targetW < 1 || targetH < 1) return;
    setProcessing(true);
    const out: ResizedResult[] = [];
    for (const file of files) {
      try {
        const img = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";

        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
        }

        if (fit === "stretch") {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        } else {
          const scale =
            fit === "cover"
              ? Math.max(targetW / img.width, targetH / img.height)
              : Math.min(targetW / img.width, targetH / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
        }
        URL.revokeObjectURL(img.src);

        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), format, quality)
        );
        const base = file.name.replace(/\.[^/.]+$/, "");
        out.push({
          name: `${base}-${targetW}x${targetH}.${ext}`,
          url: URL.createObjectURL(blob),
          blob,
          width: targetW,
          height: targetH,
          sizeKb: Math.round(blob.size / 1024),
        });
      } catch {
        // skip unreadable file
      }
    }
    setResults(out);
    setProcessing(false);
  };

  const downloadZip = async () => {
    if (results.length === 0) return;
    setZipping(true);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `resized-images-${targetW}x${targetH}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    setZipping(false);
  };

  return (
    <ToolShell
      title="Mass Image"
      highlight="Resizer"
      subtitle="Bulk resize up to 50 images at once with KDP cover and social media presets. Download individually or grab everything as a ZIP — all in your browser."
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" /> Images & Output Size
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/30 cursor-pointer transition-all"
            >
              <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-200 font-bold block">
                {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "Click to select up to 50 images"}
              </span>
              <span className="text-[9px] text-slate-600 block mt-1">JPG, PNG, WebP — processed locally, never uploaded</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Preset / custom */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Target Size
              </label>
              <select
                value={useCustom ? -1 : presetIdx}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v === -1) setUseCustom(true);
                  else {
                    setUseCustom(false);
                    setPresetIdx(v);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {PRESETS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
                <option value={-1}>Custom dimensions…</option>
              </select>
              {useCustom && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" min={1} max={10000} value={customW}
                    onChange={(e) => setCustomW(parseInt(e.target.value) || 1)}
                    placeholder="Width px"
                    className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="number" min={1} max={10000} value={customH}
                    onChange={(e) => setCustomH(parseInt(e.target.value) || 1)}
                    placeholder="Height px"
                    className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Fit mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Resize Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["cover", "Crop to Fill"],
                  ["contain", "Fit Inside"],
                  ["stretch", "Stretch"],
                ] as [FitMode, string][]).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setFit(v)}
                    className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      fit === v
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & quality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutFormat)}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Quality — {Math.round(quality * 100)}%
                </label>
                <input
                  type="range" min={0.4} max={1} step={0.05} value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  disabled={format === "image/png"}
                  className="w-full accent-indigo-500 mt-3 disabled:opacity-30"
                />
              </div>
            </div>

            <button
              onClick={processAll}
              disabled={files.length === 0 || processing}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {processing ? "Resizing…" : `Resize ${files.length || ""} Image${files.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {results.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-white">
                  {results.length} image{results.length > 1 ? "s" : ""} ready
                </span>
                <button
                  onClick={downloadZip}
                  disabled={zipping}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                  Download All (ZIP)
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto pr-1">
                {results.map((r) => (
                  <div key={r.name} className="bg-slate-900/35 border border-slate-900 rounded-2xl p-3 space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={r.name} className="w-full h-32 object-contain bg-slate-950 rounded-xl" />
                    <div className="text-[10px] font-bold text-slate-400 truncate">{r.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-600">
                        {r.width}×{r.height} · {r.sizeKb} KB
                      </span>
                      <a
                        href={r.url}
                        download={r.name}
                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-12 text-center">
              <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                Resized images will appear here with individual download links and a bulk ZIP
                option.
              </p>
            </div>
          )}

          {files.length > 0 && results.length === 0 && !processing && (
            <button
              onClick={() => {
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear selection
            </button>
          )}

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              All resizing happens locally in your browser — nothing is uploaded to any server.
              &quot;Crop to Fill&quot; keeps proportions and crops overflow; &quot;Fit Inside&quot;
              letterboxes the image; &quot;Stretch&quot; distorts to exact dimensions.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
