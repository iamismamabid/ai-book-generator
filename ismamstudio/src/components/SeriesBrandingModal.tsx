"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Layers, Download, AlertCircle } from "lucide-react";

interface SeriesBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Preview text of whichever text object will be swapped per title */
  targetPreviewText: string | null;
  onGenerate: (titles: string[]) => Promise<void>;
}

// Batch-exports the current cover design as a ZIP of separate, KDP-ready
// cover PDFs — one per line of title text — with everything else (colors,
// fonts, decorations, layout) held identical, so a whole series shares
// consistent branding. Each book still needs its own upload-ready file,
// so this deliberately produces a ZIP of individual PDFs, not one combined
// multi-page file.
export default function SeriesBrandingModal({ isOpen, onClose, targetPreviewText, onGenerate }: SeriesBrandingModalProps) {
  const [titlesText, setTitlesText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const titles = titlesText.split("\n").map(t => t.trim()).filter(Boolean);

  const handleGenerateClick = async () => {
    if (titles.length === 0) {
      setError("Add at least one book title, one per line.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      await onGenerate(titles);
    } catch (err) {
      console.error("Series generation failed:", err);
      setError("Something went wrong generating the series. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">Series Branding — Batch Cover Export</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-4">
          Keep this exact design — colors, fonts, decorations, layout — and swap only the title for each book in your series. Produces one ready-to-upload cover PDF per title, zipped together.
        </p>

        {targetPreviewText ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-4 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Text that will be swapped per book</span>
            <span className="font-bold text-indigo-300">&ldquo;{targetPreviewText}&rdquo;</span>
            <p className="text-slate-500 mt-1">Select a different text box on the canvas first if this isn&apos;t the right one.</p>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            No text found on this cover yet — add a title text box first, then reopen this tool.
          </div>
        )}

        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">Book Titles (one per line)</label>
        <textarea
          value={titlesText}
          onChange={(e) => setTitlesText(e.target.value)}
          rows={6}
          disabled={isGenerating}
          className="w-full border border-slate-800 bg-slate-950 text-white rounded-xl p-3 text-sm font-mono resize-none outline-none focus:border-indigo-500 disabled:opacity-50"
          placeholder={"Ocean Animals Word Search\nJungle Animals Word Search\nFarm Animals Word Search"}
        />
        <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">{titles.length} book{titles.length === 1 ? "" : "s"} in this batch</p>

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold p-3 rounded-xl mt-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button
          onClick={handleGenerateClick}
          disabled={isGenerating || !targetPreviewText || titles.length === 0}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGenerating ? "Generating covers..." : `Generate ${titles.length || ""} Cover${titles.length === 1 ? "" : "s"} (.zip)`}
        </button>
      </div>
    </div>,
    document.body
  );
}
