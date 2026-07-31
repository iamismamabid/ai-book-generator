"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Scissors, Pipette, Loader2, Check, AlertTriangle } from "lucide-react";

const MAX_DIM = 2200;

type Mode = "auto" | "pick";

interface BackgroundRemoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Source (data: URL or hosted URL) of the currently selected cover image */
  imageSrc: string | null;
  /** Called with the resulting transparent PNG data URL when the user applies the result */
  onApply: (dataUrl: string) => void;
}

// Reuses the same browser-only color-distance flood-fill technique as the
// standalone /tools/background-remover page, but embedded as a modal that
// operates directly on the image currently selected in Cover Studio.
export default function BackgroundRemoverModal({
  isOpen,
  onClose,
  imageSrc,
  onApply,
}: BackgroundRemoverModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ImageData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [mode, setMode] = useState<Mode>("auto");
  const [contiguous, setContiguous] = useState(true);
  const [pickedColor, setPickedColor] = useState<[number, number, number] | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load the selected image into the working canvas whenever the modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setReady(false);
      return;
    }
    setReady(false);
    setLoadError(null);
    setPickedColor(null);
    setMode("auto");
    setTolerance(30);

    const img = new Image();
    if (!imageSrc.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        sourceRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setReady(true);
      } catch {
        setLoadError(
          "This image is hosted on a site that blocks cross-origin access, so it can't be edited here. Try uploading the file directly instead."
        );
      }
    };
    img.onerror = () => setLoadError("Couldn't load this image.");
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  const process = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    setProcessing(true);

    requestAnimationFrame(() => {
      const W = source.width;
      const H = source.height;
      const src = source.data;
      const out = new Uint8ClampedArray(src);
      const maxDist = 8 + (tolerance / 100) * 160;

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
    if (ready) process();
  }, [ready, process]);

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

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onApply(canvas.toDataURL("image/png"));
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-3xl w-full p-6 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Scissors className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">Remove Background</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-6">
          Works best on solid or lightly textured backgrounds. Runs entirely in your browser.
        </p>

        {loadError ? (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/60 rounded-2xl p-4 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-300">{loadError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center min-h-[320px] relative"
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
                  className={`max-w-full max-h-[420px] ${mode === "pick" ? "cursor-crosshair" : ""} ${ready ? "" : "hidden"}`}
                />
                {!ready && !loadError && (
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                )}
                {processing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Detection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("auto")}
                    className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      mode === "auto"
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    Auto (Edges)
                  </button>
                  <button
                    onClick={() => setMode("pick")}
                    className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                      mode === "pick"
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-200"
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tolerance — {tolerance}
                </label>
                <input
                  type="range" min={0} max={100} value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contiguous}
                  onChange={(e) => setContiguous(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-300">
                  Only remove connected regions
                </span>
              </label>
            </div>
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={!ready || processing || !!loadError}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Apply to Image
        </button>
      </div>
    </div>,
    document.body
  );
}
