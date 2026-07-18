"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { PenTool, Download, Upload, Info, Loader2 } from "lucide-react";

const MAX_DIM = 1600;

export default function PhotoToLineArt() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ImageData | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [detail, setDetail] = useState<number>(40); // edge threshold (lower = more lines)
  const [thickness, setThickness] = useState<number>(1); // dilation passes
  const [smoothing, setSmoothing] = useState<number>(1); // blur passes
  const [invert, setInvert] = useState<boolean>(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState("");

  const loadFile = (file: File) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      sourceRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      setHasImage(true);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
    };
    img.src = URL.createObjectURL(file);
  };

  const process = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    setProcessing(true);

    requestAnimationFrame(() => {
      const W = source.width;
      const H = source.height;
      const src = source.data;

      // 1. Grayscale
      let gray = new Float32Array(W * H);
      for (let p = 0; p < W * H; p++) {
        const i = p * 4;
        gray[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
      }

      // 2. Box blur passes (noise reduction)
      for (let pass = 0; pass < smoothing; pass++) {
        const blurred = new Float32Array(W * H);
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            let sum = 0, n = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                  sum += gray[ny * W + nx];
                  n++;
                }
              }
            }
            blurred[y * W + x] = sum / n;
          }
        }
        gray = blurred;
      }

      // 3. Sobel edge detection
      const threshold = 20 + (100 - detail) * 1.4; // detail slider: higher = more sensitive
      const edges = new Uint8Array(W * H);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const p = y * W + x;
          const gx =
            -gray[p - W - 1] - 2 * gray[p - 1] - gray[p + W - 1] +
            gray[p - W + 1] + 2 * gray[p + 1] + gray[p + W + 1];
          const gy =
            -gray[p - W - 1] - 2 * gray[p - W] - gray[p - W + 1] +
            gray[p + W - 1] + 2 * gray[p + W] + gray[p + W + 1];
          const mag = Math.sqrt(gx * gx + gy * gy);
          if (mag > threshold) edges[p] = 1;
        }
      }

      // 4. Dilation for line thickness
      let lines = edges;
      for (let pass = 1; pass < thickness; pass++) {
        const dilated = new Uint8Array(lines);
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const p = y * W + x;
            if (lines[p - 1] || lines[p + 1] || lines[p - W] || lines[p + W]) dilated[p] = 1;
          }
        }
        lines = dilated;
      }

      // 5. Render black lines on white (or inverted)
      const out = new Uint8ClampedArray(W * H * 4);
      const [lineV, bgV] = invert ? [255, 0] : [0, 255];
      for (let p = 0; p < W * H; p++) {
        const v = lines[p] ? lineV : bgV;
        const i = p * 4;
        out[i] = out[i + 1] = out[i + 2] = v;
        out[i + 3] = 255;
      }

      const ctx = canvas.getContext("2d")!;
      ctx.putImageData(new ImageData(out, W, H), 0, 0);
      setProcessing(false);
    });
  }, [detail, thickness, smoothing, invert]);

  useEffect(() => {
    if (hasImage) process();
  }, [hasImage, process]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${fileName || "photo"}-line-art.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <ToolShell
      title="Photo to"
      highlight="Line Art"
      subtitle="Convert any photo into clean line art for coloring books and illustrations. Adjust detail, line thickness, and smoothing — all in your browser."
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-400" /> Conversion Settings
            </h3>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500 text-slate-300 font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" /> {hasImage ? "Change Photo" : "Upload Photo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Detail Level — {detail}
              </label>
              <input
                type="range" min={0} max={100} value={detail}
                onChange={(e) => setDetail(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] font-bold text-slate-500">
                Higher = more edges captured. Lower for cleaner, simpler outlines.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Line Thickness — {thickness}
              </label>
              <input
                type="range" min={1} max={4} value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] font-bold text-slate-500">
                Thicker lines print better in coloring books for kids.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Smoothing — {smoothing}
              </label>
              <input
                type="range" min={0} max={3} value={smoothing}
                onChange={(e) => setSmoothing(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] font-bold text-slate-500">
                Reduces noise and speckles in photos before edge detection.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={invert}
                onChange={(e) => setInvert(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">
                Invert (white lines on black)
              </span>
            </label>

            <button
              onClick={download}
              disabled={!hasImage}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Download Line Art PNG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-4 md:p-6 relative">
            <div className="rounded-2xl overflow-hidden flex items-center justify-center min-h-[420px] bg-white">
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[560px] ${hasImage ? "" : "hidden"}`}
              />
              {!hasImage && (
                <p className="text-sm font-bold text-slate-400 px-8 text-center">
                  Upload a photo to convert it into line art. Portraits, pets, flowers, and
                  landmarks work great.
                </p>
              )}
            </div>
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 rounded-[2rem]">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              For KDP coloring books: use high-contrast photos, keep detail moderate, and choose
              thickness 2–3 so lines survive printing. Images are processed locally and never
              uploaded. Only convert photos you have rights to use.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
