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

export default function OcrScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const runOcr = async (file: File) => {
    setWorking(true);
    setError("");
    setText("");
    setProgress(0);
    setPreview(URL.createObjectURL(file));
    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, lang, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(data.text.trim());
    } catch {
      setError("Could not extract text from this image. Try a clearer scan or a different file.");
    } finally {
      setWorking(false);
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
      a: "OCR accuracy depends heavily on scan quality — flat, well-lit, high-contrast images with horizontal text produce the best results.",
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
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recognizing text…
                  </span>
                  <span className="text-yellow-500">{progress}%</span>
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
              Great for digitizing scanned manuscripts, extracting quotes from photographed book
              pages, or pulling text from screenshots. Accuracy depends on scan quality — flat,
              well-lit, high-contrast images work best. The OCR model runs entirely in your
              browser; nothing is uploaded.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
