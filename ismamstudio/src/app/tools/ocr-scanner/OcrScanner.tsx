"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { ScanText, Upload, Copy, Check, Download, Info, Loader2, ImageIcon } from "lucide-react";

const LANGS = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
];

type ScanType = "page" | "auto" | "line" | "sparse";
// Names of tesseract.js's PSM enum members — resolved to the real runtime
// enum after tesseract.js is dynamically imported (keeps the heavy OCR
// engine out of the initial page bundle).
type PsmKey = "SINGLE_BLOCK" | "AUTO" | "SINGLE_LINE" | "SPARSE_TEXT";

// PSM (page segmentation mode) drives how Tesseract splits the image into
// text regions before reading it — the wrong mode is a common cause of
// scrambled or missing text, independent of image quality.
const SCAN_TYPES: { key: ScanType; label: string; hint: string; psmKey: PsmKey }[] = [
  { key: "page", label: "Photo of a Page", hint: "Best for book pages & paragraphs", psmKey: "SINGLE_BLOCK" },
  { key: "auto", label: "Auto Layout", hint: "Multi-column or mixed layouts", psmKey: "AUTO" },
  { key: "line", label: "Single Line", hint: "One quote or caption", psmKey: "SINGLE_LINE" },
  { key: "sparse", label: "Sparse Text", hint: "Screenshots, scattered UI text", psmKey: "SPARSE_TEXT" },
];

const MIN_WIDTH = 1800; // upscale below this so small text has enough pixels to resolve
const MAX_DIM = 3000; // cap upscaling/downscaling so huge photos don't blow up memory

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not read ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Grayscale + contrast-stretch + upscale before handing off to Tesseract.
 * Raw phone-camera photos usually have low, uneven contrast and text that's
 * too small in pixel terms — both are the #1 cause of garbled OCR output.
 * Normalizing the dynamic range and ensuring a minimum resolution fixes the
 * majority of accuracy complaints without any manual cropping/rotation.
 */
async function preprocessForOcr(file: File): Promise<HTMLCanvasElement> {
  const img = await loadImage(file);
  URL.revokeObjectURL(img.src);

  let scale = 1;
  const largestSide = Math.max(img.width, img.height);
  if (largestSide > MAX_DIM) {
    scale = MAX_DIM / largestSide;
  } else if (img.width < MIN_WIDTH) {
    scale = MIN_WIDTH / img.width;
  }

  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const pixelCount = w * h;
  const gray = new Uint8ClampedArray(pixelCount);

  let min = 255;
  let max = 0;
  for (let i = 0, p = 0; p < pixelCount; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }

  const range = Math.max(1, max - min);
  for (let i = 0, p = 0; p < pixelCount; i += 4, p++) {
    const stretched = ((gray[p] - min) / range) * 255;
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

export default function OcrScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [lang, setLang] = useState("eng");
  const [scanType, setScanType] = useState<ScanType>("page");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const runOcr = async (file: File) => {
    setWorking(true);
    setError("");
    setText("");
    setProgress(0);
    setStage("Preparing image…");
    setPreview(URL.createObjectURL(file));
    try {
      const canvas = await preprocessForOcr(file);
      const { createWorker, PSM } = await import("tesseract.js");

      setStage("Loading language data…");
      const worker = await createWorker(lang, undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStage("Recognizing text…");
            setProgress(Math.round(m.progress * 100));
          } else if (m.status) {
            setStage(m.status.replace(/^\w/, (c) => c.toUpperCase()) + "…");
          }
        },
      });

      const psmKey = SCAN_TYPES.find((s) => s.key === scanType)?.psmKey ?? "SINGLE_BLOCK";
      await worker.setParameters({
        tessedit_pageseg_mode: PSM[psmKey],
        preserve_interword_spaces: "1",
      });

      const { data } = await worker.recognize(canvas);
      await worker.terminate();
      setText(data.text.trim());
    } catch {
      setError("Could not extract text from this image. Try a clearer photo, better lighting, or a different Scan Type.");
    } finally {
      setWorking(false);
      setStage("");
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const wordCount = text ? text.trim().split(/\s+/).length : 0;

  const faqs = [
    {
      q: "Is my image uploaded to a server?",
      a: "No — text recognition runs entirely in your browser using a local OCR model; your image is never uploaded.",
    },
    {
      q: "Why is the extracted text inaccurate?",
      a: "OCR accuracy depends heavily on scan quality — flat, well-lit, high-contrast images with horizontal text produce the best results. Try the 'Photo of a Page' scan type for book pages, or 'Sparse Text' for screenshots, and make sure the photo isn't blurry or at an angle.",
    },
    {
      q: "Can I scan handwriting?",
      a: "This tool is optimized for printed text; handwritten text recognition is far less reliable and not specifically supported.",
    },
  ];

  return (
    <ToolShell
      title="OCR"
      highlight="Scanner"
      subtitle="Extract text from scanned pages, screenshots, and image-based PDFs using in-browser OCR. Six languages supported — completely free."
      maxWidth="max-w-6xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ScanText className="w-5 h-5 text-indigo-400" /> Scan Setup
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Scan Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SCAN_TYPES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setScanType(s.key)}
                    className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      scanType === s.key
                        ? "bg-indigo-600/20 border-indigo-500"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <span className={`text-[11px] font-black block ${scanType === s.key ? "text-white" : "text-slate-300"}`}>
                      {s.label}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500">{s.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Document Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/30 cursor-pointer transition-all"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Upload preview" className="max-h-40 mx-auto rounded-lg mb-3 object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              )}
              <span className="text-xs text-slate-200 font-bold block">
                {preview ? "Click to scan a different image" : "Click to select an image"}
              </span>
              <span className="text-[9px] text-slate-600 block mt-1">
                JPG, PNG, or screenshot — processed locally in your browser
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && runOcr(e.target.files[0])}
              />
            </div>

            {working && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {stage || "Working…"}
                  </span>
                  {progress > 0 && <span className="text-yellow-500">{progress}%</span>}
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div className="h-full bg-yellow-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white">
                Extracted Text {text && <span className="text-slate-500 font-bold">— {wordCount} words</span>}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyText}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={downloadTxt}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> .TXT
                </button>
              </div>
            </div>
            <textarea
              rows={16}
              readOnly
              value={text || (working ? "" : "Extracted text will appear here after scanning an image…")}
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed focus:outline-none"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Images are automatically upscaled and contrast-corrected before scanning to improve
              accuracy — for best results, use a flat, well-lit, in-focus photo and pick the Scan
              Type that matches your source (a single book page vs. a screenshot behave very
              differently). Everything runs locally in your browser; nothing is uploaded.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
