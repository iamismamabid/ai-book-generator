"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Scissors, Download, Upload, Pipette, Info, Loader2 } from "lucide-react";

const MAX_DIM = 2000;

type Mode = "auto" | "pick";

export default function BackgroundRemover() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ImageData | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [tolerance, setTolerance] = useState<number>(30);
  const [mode, setMode] = useState<Mode>("auto");
  const [contiguous, setContiguous] = useState<boolean>(true);
  const [pickedColor, setPickedColor] = useState<[number, number, number] | null>(null);
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
      setPickedColor(null);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
    };
    img.src = URL.createObjectURL(file);
  };

  const process = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    setProcessing(true);

    // Defer heavy work so the spinner can paint
    requestAnimationFrame(() => {
      const W = source.width;
      const H = source.height;
      const src = source.data;
      const out = new Uint8ClampedArray(src); // copy
      const maxDist = 8 + (tolerance / 100) * 160; // color distance threshold

      const dist = (i: number, r: number, g: number, b: number) => {
        const dr = src[i] - r;
        const dg = src[i + 1] - g;
        const db = src[i + 2] - b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      let refColor: [number, number, number];
      if (mode === "pick" && pickedColor) {
        refColor = pickedColor;
      } else {
        // Average color of the border pixels = assumed background
        let r = 0, g = 0, b = 0, n = 0;
        const sample = (x: number, y: number) => {
          const i = (y * W + x) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; n++;
        };
        for (let x = 0; x < W; x += 4) { sample(x, 0); sample(x, H - 1); }
        for (let y = 0; y < H; y += 4) { sample(0, y); sample(W - 1, y); }
        refColor = [r / n, g / n, b / n];
      }
      const [rr, rg, rb] = refColor;

      if (contiguous) {
        // BFS flood fill from all border pixels within tolerance
        const visited = new Uint8Array(W * H);
        const queue: number[] = [];
        const trySeed = (x: number, y: number) => {
          const p = y * W + x;
          if (!visited[p] && dist(p * 4, rr, rg, rb) <= maxDist) {
            visited[p] = 1;
            queue.push(p);
          }
        };
        for (let x = 0; x < W; x++) { trySeed(x, 0); trySeed(x, H - 1); }
        for (let y = 0; y < H; y++) { trySeed(0, y); trySeed(W - 1, y); }
        // If picking a color, also seed from every matching pixel edge-adjacent region:
        if (mode === "pick" && pickedColor) {
          for (let p = 0; p < W * H; p++) {
            if (!visited[p] && dist(p * 4, rr, rg, rb) <= maxDist * 0.35) {
              visited[p] = 1;
              queue.push(p);
            }
          }
        }
        while (queue.length > 0) {
          const p = queue.pop()!;
          out[p * 4 + 3] = 0;
          const x = p % W;
          const y = (p / W) | 0;
          const neighbors = [
            x > 0 ? p - 1 : -1,
            x < W - 1 ? p + 1 : -1,
            y > 0 ? p - W : -1,
            y < H - 1 ? p + W : -1,
          ];
          for (const np of neighbors) {
            if (np >= 0 && !visited[np] && dist(np * 4, rr, rg, rb) <= maxDist) {
              visited[np] = 1;
              queue.push(np);
            }
          }
        }
      } else {
        // Global removal of similar colors
        for (let p = 0; p < W * H; p++) {
          if (dist(p * 4, rr, rg, rb) <= maxDist) out[p * 4 + 3] = 0;
        }
      }

      const ctx = canvas.getContext("2d")!;
      ctx.putImageData(new ImageData(out, W, H), 0, 0);
      setProcessing(false);
    });
  }, [tolerance, mode, contiguous, pickedColor]);

  useEffect(() => {
    if (hasImage) process();
  }, [hasImage, process]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "pick") return;
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const i = (y * source.width + x) * 4;
    setPickedColor([source.data[i], source.data[i + 1], source.data[i + 2]]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${fileName || "image"}-transparent.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const faqs = [
    {
      q: "Will this work on any photo?",
      a: "It works best on solid or lightly textured backgrounds (product shots, logos, scans). Busy photographic backgrounds need a specialized background remover for clean results.",
    },
    {
      q: "Is my image uploaded anywhere?",
      a: "No — background removal runs entirely in your browser using canvas pixel analysis; your image is never sent to a server.",
    },
    {
      q: "What does 'Only remove connected regions' do?",
      a: "It limits removal to background pixels physically touching the edge of the image, so same-colored areas inside your subject (like a white shirt) stay intact.",
    },
  ];

  return (
    <ToolShell
      title="Background"
      highlight="Remover"
      subtitle="Remove solid and simple backgrounds from images and create transparent PNGs — perfect for cover elements and logos. Runs 100% in your browser."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-indigo-400" /> Settings
            </h3>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500 text-slate-300 font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" /> {hasImage ? "Change Image" : "Upload Image"}
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
                Detection Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("auto")}
                  className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                    mode === "auto"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  Auto (Edges)
                </button>
                <button
                  onClick={() => setMode("pick")}
                  className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                    mode === "pick"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <Pipette className="w-3 h-3" /> Pick Color
                </button>
              </div>
              {mode === "pick" && (
                <p className="text-[10px] font-bold text-slate-500 pt-1">
                  Click anywhere on the image to select the color to remove.
                  {pickedColor && (
                    <span
                      className="inline-block w-3 h-3 rounded ml-2 border border-slate-700 align-middle"
                      style={{ background: `rgb(${pickedColor.join(",")})` }}
                    />
                  )}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Tolerance — {tolerance}
              </label>
              <input
                type="range" min={0} max={100} value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] font-bold text-slate-500">
                Higher tolerance removes more shades. Lower it if parts of your subject disappear.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={contiguous}
                onChange={(e) => setContiguous(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">
                Only remove connected regions (protects same-color areas inside your subject)
              </span>
            </label>

            <button
              onClick={download}
              disabled={!hasImage}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Download Transparent PNG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-4 md:p-6 relative">
            <div
              className="rounded-2xl overflow-hidden flex items-center justify-center min-h-[420px]"
              style={{
                backgroundImage:
                  "linear-gradient(45deg,#334155 25%,transparent 25%),linear-gradient(-45deg,#334155 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#334155 75%),linear-gradient(-45deg,transparent 75%,#334155 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
                backgroundColor: "#1e293b",
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-w-full max-h-[560px] ${mode === "pick" ? "cursor-crosshair" : ""} ${hasImage ? "" : "hidden"}`}
              />
              {!hasImage && (
                <p className="text-sm font-bold text-slate-500 px-8 text-center">
                  Upload an image to remove its background. The checkerboard shows transparency.
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
              This tool uses color-based detection, which works best on solid or lightly textured
              backgrounds (product shots, logos, scans, clip-art). For busy photographic
              backgrounds, a dedicated background remover will give cleaner results. Your image never leaves
              your browser.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
