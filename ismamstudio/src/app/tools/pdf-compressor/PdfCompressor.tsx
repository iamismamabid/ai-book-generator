"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Package, Upload, Download, Info, Loader2, FileText, AlertTriangle } from "lucide-react";

type Mode = "lossless" | "high" | "balanced" | "extreme";

const MODES: { key: Mode; label: string; desc: string; dpi?: number; quality?: number }[] = [
  { key: "lossless", label: "Lossless Optimize", desc: "Restructures the PDF without touching quality. Text stays selectable. Modest savings." },
  { key: "high", label: "High Quality", desc: "Re-renders pages at 150 DPI JPEG. Great for review copies and email.", dpi: 150, quality: 0.85 },
  { key: "balanced", label: "Balanced", desc: "110 DPI — strong compression for screen reading and proofs.", dpi: 110, quality: 0.75 },
  { key: "extreme", label: "Extreme", desc: "72 DPI — smallest file, screen-only quality.", dpi: 72, quality: 0.6 },
];

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function PdfCompressor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("balanced");
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<{ blob: Blob; before: number; after: number } | null>(null);

  const compress = async () => {
    if (!file) return;
    setWorking(true);
    setError("");
    setResult(null);
    try {
      const bytes = await file.arrayBuffer();
      let outBlob: Blob;

      if (mode === "lossless") {
        setProgress("Optimizing structure…");
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        doc.setProducer("KDPage PDF Compressor");
        const saved = await doc.save({ useObjectStreams: true });
        outBlob = new Blob([saved as unknown as BlobPart], { type: "application/pdf" });
      } else {
        const cfg = MODES.find((m) => m.key === mode)!;
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

        const { jsPDF } = await import("jspdf");
        let doc: InstanceType<typeof jsPDF> | null = null;

        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(`Compressing page ${i} of ${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const scale = (cfg.dpi || 110) / 72;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const base = page.getViewport({ scale: 1 });
          const wPt = base.width;
          const hPt = base.height;
          const orientation = wPt > hPt ? "l" : "p";
          if (!doc) {
            doc = new jsPDF({ unit: "pt", format: [wPt, hPt], orientation });
          } else {
            doc.addPage([wPt, hPt], orientation);
          }
          const img = canvas.toDataURL("image/jpeg", cfg.quality || 0.75);
          doc.addImage(img, "JPEG", 0, 0, wPt, hPt);
        }
        outBlob = doc!.output("blob");
      }

      setResult({ blob: outBlob, before: file.size, after: outBlob.size });
    } catch (e) {
      setError(
        e instanceof Error && /encrypt/i.test(e.message)
          ? "This PDF is password-protected — remove the password first."
          : "Could not process this PDF. It may be corrupted or use unsupported features."
      );
    } finally {
      setWorking(false);
      setProgress("");
    }
  };

  const download = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(result.blob);
    a.download = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const savings = result ? Math.max(0, (1 - result.after / result.before) * 100) : 0;

  const faqs = [
    {
      q: "Is my PDF uploaded to a server?",
      a: "No — compression runs entirely in your browser; your file never leaves your device.",
    },
    {
      q: "Which mode should I use for a KDP print interior?",
      a: "Use Lossless Optimize — it keeps your text sharp and selectable. The image-based modes rasterize every page, which hurts print quality and removes selectable text.",
    },
    {
      q: "Why didn't my file get smaller?",
      a: "Some PDFs are already well-optimized (for example, exported cleanly from InDesign) — try an image compression mode for further reduction, understanding it will rasterize the pages.",
    },
  ];

  return (
    <ToolShell
      title="PDF"
      highlight="Compressor"
      subtitle="Shrink PDF file sizes to meet KDP's upload limits — lossless optimization or aggressive image compression, all in your browser."
      maxWidth="max-w-5xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" /> Compression Setup
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/30 cursor-pointer transition-all"
            >
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-200 font-bold block">
                {file ? `${file.name} (${fmtSize(file.size)})` : "Click to select a PDF"}
              </span>
              <span className="text-[9px] text-slate-600 block mt-1">
                Processed locally — your PDF never leaves your browser
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setResult(null);
                  setError("");
                }}
              />
            </div>

            <div className="space-y-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    mode === m.key
                      ? "bg-indigo-600/20 border-indigo-500"
                      : "bg-slate-950/40 border-slate-900 hover:border-slate-700"
                  }`}
                >
                  <span className={`text-xs font-black block ${mode === m.key ? "text-white" : "text-slate-300"}`}>
                    {m.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{m.desc}</span>
                </button>
              ))}
            </div>

            {mode !== "lossless" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-200">
                  Image modes re-render each page as a picture: text becomes non-selectable and
                  print sharpness drops. For KDP print interiors, prefer Lossless Optimize.
                </p>
              </div>
            )}

            <button
              onClick={compress}
              disabled={!file || working}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              {working ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {working ? progress || "Compressing…" : "Compress PDF"}
            </button>
            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-[2rem] p-8 space-y-5">
              <h3 className="text-lg font-black text-white">Compression Complete</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/50 rounded-2xl p-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Before</span>
                  <span className="text-lg font-black text-slate-300">{fmtSize(result.before)}</span>
                </div>
                <div className="bg-slate-950/50 rounded-2xl p-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">After</span>
                  <span className="text-lg font-black text-emerald-400">{fmtSize(result.after)}</span>
                </div>
                <div className="bg-slate-950/50 rounded-2xl p-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Saved</span>
                  <span className="text-lg font-black text-yellow-500">{savings.toFixed(0)}%</span>
                </div>
              </div>
              {result.after >= result.before && (
                <p className="text-[11px] font-bold text-amber-300">
                  This PDF was already well-optimized — the output isn&apos;t smaller. Try an image
                  compression mode for bigger savings.
                </p>
              )}
              <button
                onClick={download}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" /> Download Compressed PDF
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-12 text-center">
              <Upload className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                Select a PDF and a compression mode. Results appear here with before/after sizes.
              </p>
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              KDP&apos;s manuscript upload limit is 650&nbsp;MB, but files under 400&nbsp;MB convert
              much faster. Large files are usually caused by high-resolution images — for print
              interiors, 300 DPI is all you need.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
