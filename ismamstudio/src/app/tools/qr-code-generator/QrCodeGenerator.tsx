"use client";

import { useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import QRCode from "qrcode";
import { QrCode, Download, Info, Link2, Mail, Phone, Type } from "lucide-react";

type Mode = "url" | "text" | "email" | "phone";

const MODES: { key: Mode; label: string; icon: typeof Link2; placeholder: string }[] = [
  { key: "url", label: "URL", icon: Link2, placeholder: "https://www.amazon.com/author/yourname" },
  { key: "text", label: "Text", icon: Type, placeholder: "Any text — a coupon code, a message…" },
  { key: "email", label: "Email", icon: Mail, placeholder: "author@example.com" },
  { key: "phone", label: "Phone", icon: Phone, placeholder: "+1 555 123 4567" },
];

export default function QrCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("url");
  const [value, setValue] = useState<string>("");
  const [size, setSize] = useState<number>(512);
  const [fg, setFg] = useState<string>("#0f172a");
  const [bg, setBg] = useState<string>("#ffffff");
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState<string>("");

  const payload = (() => {
    const v = value.trim();
    if (!v) return "";
    if (mode === "email") return `mailto:${v}`;
    if (mode === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
    if (mode === "url" && !/^https?:\/\//i.test(v)) return `https://${v}`;
    return v;
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const content = payload || "https://www.kdpage.com";
    QRCode.toCanvas(canvas, content, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecLevel,
      color: { dark: fg, light: bg },
    })
      .then(() => setError(""))
      .catch((e: Error) => setError(e.message));
  }, [payload, size, fg, bg, ecLevel]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "qr-code.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const faqs = [
    {
      q: "Do these QR codes expire or stop working?",
      a: "No — codes generated here encode your content directly (a static QR code), so they never expire and don't rely on any tracking service that could shut down.",
    },
    {
      q: "What error correction level should I use for print?",
      a: "Use Q or H — they stay scannable even with minor print blur, ink bleed, or a logo overlay.",
    },
    {
      q: "Can I use a custom color QR code in a printed book?",
      a: "Yes, as long as there's strong contrast between the foreground and background colors — low-contrast combinations can fail to scan.",
    },
  ];

  return (
    <ToolShell
      title="QR Code"
      highlight="Generator"
      subtitle="Generate high-resolution QR codes for your author website, Amazon page, review links, and book marketing — free forever."
      maxWidth="max-w-5xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" /> QR Content
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    mode === m.key
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={MODES.find((m) => m.key === mode)?.placeholder}
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Export Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={256}>256 × 256 px (web)</option>
                  <option value={512}>512 × 512 px (standard)</option>
                  <option value={1024}>1024 × 1024 px (print)</option>
                  <option value={2048}>2048 × 2048 px (large print)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Error Correction
                </label>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as "L" | "M" | "Q" | "H")}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="L">L — 7% (densest data)</option>
                  <option value="M">M — 15% (standard)</option>
                  <option value="Q">Q — 25% (robust)</option>
                  <option value="H">H — 30% (print-safe)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Foreground
                </label>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                  <span className="text-xs font-mono font-bold text-slate-300">{fg}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Background
                </label>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                  <span className="text-xs font-mono font-bold text-slate-300">{bg}</span>
                </div>
              </div>
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 flex flex-col items-center gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <canvas ref={canvasRef} className="w-64 h-64 md:w-72 md:h-72 rounded-lg" style={{ imageRendering: "pixelated" }} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 text-center">
              {payload ? "Live preview — scan it with your phone to test." : "Enter content to generate your QR code."}
            </p>
            <button
              onClick={download}
              disabled={!payload}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Download PNG ({size}×{size})
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              For QR codes printed inside books or on back covers, use 1024px+ exports and error
              correction level Q or H — they stay scannable even with slight print blur. Keep
              strong contrast between foreground and background colors.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
