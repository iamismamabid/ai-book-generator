"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Key, Eye, EyeOff, Loader2, Download, Trash2,
  Wand2, BookOpen, Lock, ExternalLink, Plus, FileDown,
  X, Check, AlertCircle, Image as ImageIcon, ZoomIn,
  Settings2, CheckCircle2, ChevronRight, Layers,
} from "lucide-react";
import {
  ByokProvider, loadByokKeys, saveByokKey, removeByokKey,
  getProviderInfo, loadActiveProvider, saveActiveProvider, maskApiKey,
} from "@/lib/byokStorage";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ArtbookPage {
  id: string; imageUrl: string; prompt: string;
  provider: ByokProvider; createdAt: number;
}
interface AiArtbookStudioProps {
  isPremium: boolean;
  isSignedIn: boolean;
  isActive: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PROVIDERS: { id: ByokProvider; name: string; model: string; cost: string; tip: string }[] = [
  { id: "openai",    name: "OpenAI",    model: "DALL·E 3",         cost: "~$0.04/img", tip: "Best clean 2D line art for KDP" },
  { id: "gemini",    name: "Gemini",    model: "Imagen 3",         cost: "~$0.03/img", tip: "Great for detail & varied styles" },
  { id: "stability", name: "Stability", model: "Stable Diffusion", cost: "~$0.01/img", tip: "Most affordable option available" },
];

const STYLE_PRESETS = [
  { label: "Clean KDP Vector",     value: "clean crisp vector line art, solid black outlines, flat white background, no shading, no gray tones" },
  { label: "Bold Kids / Toddlers", value: "thick bold cartoon outlines, simple closed shapes, large easy-to-color areas, cute vector style, zero fine lines" },
  { label: "Intricate Adult",      value: "ultra-detailed delicate black linework, ornate patterns, high complexity botanical and geometric, adult coloring book" },
  { label: "Stained Glass",        value: "stained glass segmented thick leading lines, mosaic panes, bold high-contrast graphic outlines" },
  { label: "Whimsical Storybook",  value: "charming children book illustration lines, playful characters, expressive clean black contours" },
  { label: "Kawaii / Chibi Anime", value: "cute Japanese kawaii anime style, thick smooth ink lines, simple adorable shapes, big sparkling eyes" },
  { label: "Botanical / Floral",   value: "delicate botanical illustration, fine ink pen strokes, intricate leaves petals and stems, zero fill" },
  { label: "Mandala / Sacred Geo", value: "intricate circular mandala, sacred geometry, radial symmetry, ultra-fine vector lines, black on white" },
];

const PROMPT_PRESETS = [
  { label: "Jungle Animals", prompt: "Cute baby elephant and playful lion cub sitting together in a lush tropical jungle with palm leaves, clean thick outlines, coloring book page" },
  { label: "Botanical",      prompt: "Graceful bouquet of blooming wild roses, peonies, eucalyptus leaves and butterflies, crisp clean line art, no grayscale" },
  { label: "Mandala",        prompt: "Intricate circular mandala pattern, sacred geometry, floral symmetry, elegant black vector outlines, clean white background, zero shading" },
  { label: "Stained Glass",  prompt: "Stained glass style illustration of a majestic owl perched on a branch under a crescent moon, thick segmented bold leading lines" },
  { label: "Fairytale",      prompt: "Charming whimsical cottage house with cobblestone chimney, rustic wooden door, picket fence and climbing rose garden, coloring sheet" },
  { label: "Under the Sea",  prompt: "Enchanting underwater coral reef with a friendly sea turtle, clownfish, starfish and bubbles, clean defined outlines, coloring book" },
  { label: "Kawaii Chibi",   prompt: "Adorable kawaii baby kitten wearing a wizard hat next to a magic potion bottle and tiny stars, simple cute bold outlines" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AiArtbookStudio({ isPremium, isSignedIn, isActive }: AiArtbookStudioProps) {
  const isActiveRef = useRef(false);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // BYOK
  const [activeProvider, setActiveProvider] = useState<ByokProvider>("gemini");
  const [keys, setKeys]     = useState({ openai: "", gemini: "", stability: "" });
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<Record<ByokProvider, boolean>>({ openai: false, gemini: false, stability: false });
  const [serverGemini, setServerGemini]     = useState(false);
  const [serverGeminiHint, setServerGeminiHint] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Generation
  const [prompt, setPrompt]           = useState("");
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].value);
  const [bulkCount, setBulkCount]     = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genIndex, setGenIndex]         = useState(0);
  const [genError, setGenError]         = useState<string | null>(null);

  // Pages
  const [pages, setPages]           = useState<ArtbookPage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Book meta
  const [bookTitle,  setBookTitle]  = useState("My Coloring Artbook");
  const [bookAuthor, setBookAuthor] = useState("");

  // Export
  const [isExporting,    setIsExporting]    = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadByokKeys();
    setKeys(loaded);
    const p = loadActiveProvider();
    if (p) setActiveProvider(p);
    setKeyStatus({
      openai:    loaded.openai.length    > 4,
      gemini:    loaded.gemini.length    > 4,
      stability: loaded.stability.length > 4,
    });
    fetch("/api/byok/generate")
      .then(r => r.json())
      .then(d => { if (d.hasServerGeminiKey) { setServerGemini(true); setServerGeminiHint(d.geminiKeyHint); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setKeyInput(keys[activeProvider] || "");
    setShowKey(false);
    setIsEditingKey(false);
  }, [activeProvider, keys]);

  const isKeySaved  = keyStatus[activeProvider] || (activeProvider === "gemini" && serverGemini);
  const provInfo    = PROVIDERS.find(p => p.id === activeProvider)!;
  const effectiveKey = (activeProvider === "gemini" && serverGemini) ? (keys.gemini || "env") : keys[activeProvider];
  const hasAccess   = isPremium || keyStatus.openai || keyStatus.gemini || keyStatus.stability || serverGemini;

  // ── Key helpers ───────────────────────────────────────────────────────────
  const showFeedback = (msg: string) => { setActionFeedback(msg); setTimeout(() => setActionFeedback(null), 3000); };

  const handleSaveKey = () => {
    const v = keyInput.trim();
    if (v.length < 5) return;
    const updated = saveByokKey(activeProvider, v);
    setKeys(updated);
    saveActiveProvider(activeProvider);
    setKeyStatus(prev => ({ ...prev, [activeProvider]: true }));
    setIsEditingKey(false);
    showFeedback("API key saved securely ✓");
  };

  const handleUseEnvKey = () => {
    const updated = saveByokKey("gemini", "env");
    setKeys(updated);
    setKeyInput("env");
    setKeyStatus(prev => ({ ...prev, gemini: true }));
    setIsEditingKey(false);
    showFeedback("Platform Gemini key activated!");
  };

  const handleClearKey = () => {
    const updated = removeByokKey(activeProvider);
    setKeys(updated);
    setKeyInput("");
    setKeyStatus(prev => ({ ...prev, [activeProvider]: false }));
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const generatePages = useCallback(async () => {
    if (!prompt.trim()) { setGenError("Please enter a prompt first."); return; }
    if (!effectiveKey && !serverGemini) { setGenError("Please save an API key first."); return; }
    setIsGenerating(true);
    setGenError(null);
    const newPages: ArtbookPage[] = [];

    for (let i = 0; i < bulkCount; i++) {
      if (!isActiveRef.current) break;
      setGenIndex(i + 1);
      try {
        const res  = await fetch("/api/byok/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: activeProvider,
            apiKey: effectiveKey || "env",
            prompt: prompt.trim(),
            studioType: "coloring",
            stylePreset,
            size: "1024x1024",
          }),
        });
        const data = await res.json();
        if (!data.success || !data.imageUrl) {
          setGenError(data.error || "Generation failed. Check your API key.");
          break;
        }
        newPages.push({ id: `${Date.now()}-${i}`, imageUrl: data.imageUrl, prompt: prompt.trim(), provider: activeProvider, createdAt: Date.now() });
      } catch (err: any) {
        setGenError(`Network error: ${err.message}`);
        break;
      }
    }

    setIsGenerating(false);
    setGenIndex(0);
    if (newPages.length > 0) {
      setPages(prev => {
        const updated = [...prev, ...newPages];
        setSelectedIdx(updated.length - newPages.length);
        return updated;
      });
    }
  }, [prompt, stylePreset, bulkCount, activeProvider, effectiveKey, serverGemini]);

  const deletePage  = (id: string) => setPages(prev => { const u = prev.filter(p => p.id !== id); setSelectedIdx(i => Math.min(i, Math.max(0, u.length - 1))); return u; });
  const downloadPage = (p: ArtbookPage) => { const a = document.createElement("a"); a.href = p.imageUrl; a.download = `coloring-page-${Date.now()}.png`; a.click(); };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const exportPDF = useCallback(async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const { jsPDF } = await import("jspdf");
      const W = 612, H = 792, M = 36;
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [W, H] });

      // Title page
      pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, W, H, "F");
      pdf.setFillColor(99, 102, 241);  pdf.rect(0, 0, W, 8, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(36); pdf.setTextColor(15, 15, 35);
      pdf.text(pdf.splitTextToSize(bookTitle || "My Coloring Artbook", W - M * 2), W / 2, H / 2 - 72, { align: "center" });
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(14); pdf.setTextColor(100, 100, 130);
      pdf.text("AI-Generated Coloring Artbook", W / 2, H / 2 - 12, { align: "center" });
      pdf.setFontSize(11);
      pdf.text(`${pages.length} Unique Coloring Pages`, W / 2, H / 2 + 18, { align: "center" });
      if (bookAuthor) {
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.setTextColor(50, 50, 80);
        pdf.text(`by ${bookAuthor}`, W / 2, H / 2 + 62, { align: "center" });
      }
      pdf.setFillColor(99, 102, 241); pdf.rect(0, H - 8, W, 8, "F");
      setExportProgress(5);

      // Content pages
      for (let i = 0; i < pages.length; i++) {
        pdf.addPage([W, H], "portrait");
        pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, W, H, "F");
        await new Promise<void>(resolve => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const avW = W - M * 2, avH = H - M * 2 - 24;
            const ratio = Math.min(avW / img.naturalWidth, avH / img.naturalHeight);
            const dW = img.naturalWidth * ratio, dH = img.naturalHeight * ratio;
            pdf.addImage(img, "PNG", (W - dW) / 2, M + (avH - dH) / 2, dW, dH);
            pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(180, 180, 190);
            pdf.text(`${i + 1}`, W / 2, H - 14, { align: "center" });
            resolve();
          };
          img.onerror = resolve;
          img.src = pages[i].imageUrl;
        });
        setExportProgress(5 + Math.round(((i + 1) / pages.length) * 90));
      }

      // Copyright page
      pdf.addPage([W, H], "portrait");
      pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, W, H, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(14); pdf.setTextColor(30, 30, 50);
      pdf.text("Copyright Notice", W / 2, H / 2 - 52, { align: "center" });
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(100, 100, 120);
      [
        `\u00A9 ${new Date().getFullYear()} ${bookAuthor || "The Author"}. All rights reserved.`,
        "No part of this publication may be reproduced without written permission.",
        "",
        "Generated with KDPage AI Artbook Studio \u2014 kdpage.com",
      ].forEach((l, idx) => pdf.text(l, W / 2, H / 2 - 8 + idx * 16, { align: "center" }));

      setExportProgress(100);
      pdf.save(`${(bookTitle || "coloring-artbook").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`);
    } catch (err: any) {
      alert("PDF export failed: " + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [pages, bookTitle, bookAuthor]);

  const selectedPage = pages[selectedIdx] ?? null;

  // ── Access gate ───────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-900/10 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">AI Coloring Artbook Studio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Generate 300 DPI KDP-ready coloring pages from text prompts using your own AI key — at direct raw API cost with zero platform markup.</p>
          <div className="flex items-center justify-center gap-5 my-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Unlimited pages</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />KDP PDF export</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />0% markup</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a href="/pricing" className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-500/30 text-center">
              Upgrade to Pro →
            </a>
            <button
              onClick={() => setIsEditingKey(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" /> Use My API Key (Free)
            </button>
          </div>
          {isEditingKey && (
            <div className="text-left space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter your API key to unlock</p>
              {PROVIDERS.map(p => (
                <div key={p.id} className="flex gap-2">
                  <input
                    type="password"
                    placeholder={`${p.name} API Key`}
                    onChange={e => { setActiveProvider(p.id); setKeyInput(e.target.value); }}
                    onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-amber-400 font-mono"
                  />
                  <button onClick={handleSaveKey} className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer hover:opacity-90 transition-all">Save</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* ── Top Ribbon ─────────────────────────────────────────────────── */}
      <div className="h-9 min-h-[36px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 select-none">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">AI Coloring Artbook Studio</span>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:block">• Generate 300 DPI KDP-ready coloring pages from any text prompt</span>
        {isPremium && (
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />Pro
          </span>
        )}
      </div>

      {/* ── 3-Column Workspace ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* LEFT SIDEBAR */}
        <div className="w-72 min-w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto shrink-0">

          {/* Book details */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Book Details</span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Book Title</label>
              <input
                type="text" value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-amber-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Author Name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* AI Provider */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Provider</span>
            </div>

            {/* 3-tab grid */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {PROVIDERS.map(p => {
                const hasKey = keyStatus[p.id] || (p.id === "gemini" && serverGemini);
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProvider(p.id); saveActiveProvider(p.id); }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeProvider === p.id
                        ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p.name}
                    {hasKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Model / cost strip */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-0.5">
              <span>Model: <strong className="text-slate-700 dark:text-slate-300">{provInfo.model}</strong></span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{provInfo.cost}</span>
            </div>

            {/* Pro tip */}
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Tip:</strong> {provInfo.tip}</span>
            </div>

            {/* Key card or input */}
            {!isEditingKey && isKeySaved ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{provInfo.name} Connected</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {maskApiKey(keys[activeProvider] || (serverGemini ? "env" : ""))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setIsEditingKey(true)} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
                      <Settings2 className="w-3 h-3" />Change
                    </button>
                    {keyStatus[activeProvider] && (
                      <button onClick={handleClearKey} className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer transition-colors" title="Remove Key">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                  <span>Model: {provInfo.model}</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{provInfo.cost}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                {activeProvider === "gemini" && serverGemini && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                    <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 text-[11px] font-medium">
                      <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>Platform key ({serverGeminiHint || "Available"})</span>
                    </div>
                    <button onClick={handleUseEnvKey} className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer transition-all">
                      Use Key
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />{provInfo.name} API Key
                  </span>
                  <a href={getProviderInfo(activeProvider).keyUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    Get Free Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      onBlur={() => { if (keyInput.trim().length > 5 && keyInput.trim() !== keys[activeProvider]) handleSaveKey(); }}
                      placeholder={getProviderInfo(activeProvider).keyPlaceholder}
                      className="w-full text-xs font-mono py-2 px-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={handleSaveKey} className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer shrink-0">
                    Save
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">🔒 Stored in your browser only. Never sent to our servers.</p>
              </div>
            )}

            {actionFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />{actionFeedback}
              </div>
            )}
          </div>

          {/* Art Style */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Artistic Style Preset</span>
            </div>
            <select
              value={stylePreset}
              onChange={e => setStylePreset(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
            >
              {STYLE_PRESETS.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* CENTER: Prompt + Preview */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* Prompt area */}
          <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Concept / Prompt Description</label>
              {prompt.trim() && <button onClick={() => setPrompt("")} className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer">Clear</button>}
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Cute baby dragon resting on a treasure chest, detailed clean outlines, pure white background..."
              rows={3}
              className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none leading-relaxed shadow-xs transition-all text-slate-800 dark:text-slate-100"
            />
            {/* Quick ideas */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Inspo Ideas:</span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPrompt(preset.prompt)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pages:</span>
                {[1, 5, 10, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setBulkCount(n)}
                    className={`w-9 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      bulkCount === n
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={generatePages}
                disabled={isGenerating || !prompt.trim()}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating
                  ? (<><Loader2 className="w-4 h-4 animate-spin text-slate-950" />Generating {genIndex}/{bulkCount}…</>)
                  : (<><Wand2 className="w-4 h-4 text-slate-950" />Generate {bulkCount > 1 ? `${bulkCount} Pages` : "Coloring Page"}</>)
                }
              </button>
            </div>

            {genError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-relaxed flex-1">{genError}</span>
                <button onClick={() => setGenError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          {/* Canvas / Preview */}
          <div className="flex-1 min-h-0 flex items-center justify-center p-8 bg-slate-100 dark:bg-[#0a0a14] relative overflow-hidden">
            {/* Dot-grid pattern */}
            <div
              className="absolute inset-0 opacity-40 dark:opacity-5 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />

            {selectedPage ? (
              <div className="relative group max-h-full flex items-center justify-center">
                {/* Paper drop-shadow */}
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-slate-300 dark:bg-slate-700 rounded-2xl -z-10 opacity-50" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPage.imageUrl}
                  alt={selectedPage.prompt}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-xl bg-white border border-slate-200/80 dark:border-slate-700/50 cursor-zoom-in"
                  style={{ maxHeight: "calc(100vh - 360px)" }}
                  onClick={() => setLightboxOpen(true)}
                />
                {/* Hover action strip */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setLightboxOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-md hover:bg-slate-50 cursor-pointer">
                    <ZoomIn className="w-3.5 h-3.5" />Fullscreen
                  </button>
                  <button onClick={() => downloadPage(selectedPage)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-md hover:bg-slate-50 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />Save PNG
                  </button>
                  <button onClick={() => deletePage(selectedPage.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-md hover:bg-rose-100 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-xs">
                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                  <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No pages generated yet</p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Enter a prompt above and click Generate</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight className="w-3 h-3" /><span>Try: &ldquo;Intricate mandala with lotus flowers&rdquo;</span>
                </div>
              </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/80 dark:bg-slate-950/85 z-20 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900 dark:text-white">Generating with {provInfo.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Page {genIndex} of {bulkCount} • Please wait ~15–30s</p>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${(genIndex / bulkCount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info bar */}
          {selectedPage && (
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-white dark:bg-slate-900 flex items-center gap-3">
              <span className="text-[10px] text-slate-400 truncate flex-1">
                <strong className="text-slate-600 dark:text-slate-300">Prompt:</strong> {selectedPage.prompt}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {selectedPage.provider}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Queue + Export */}
        <div className="w-56 min-w-[200px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0">

          {/* Header */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page Queue</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {pages.length} <span className="text-xs font-semibold text-slate-400">{pages.length === 1 ? "page" : "pages"}</span>
              </p>
            </div>
            {pages.length > 0 && (
              <button
                onClick={() => { if (confirm("Clear all pages?")) { setPages([]); setSelectedIdx(0); } }}
                className="text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />Clear
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-3">
                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold text-center leading-relaxed">Generate pages to build your coloring book</p>
              </div>
            ) : (
              pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                    idx === selectedIdx
                      ? "border-amber-400 shadow-amber-400/20 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.imageUrl} alt={page.prompt} className="w-full aspect-square object-cover bg-white" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-white/90 text-slate-800 px-1.5 py-0.5 rounded-md shadow-sm">
                    {idx + 1}
                  </div>
                  {idx === selectedIdx && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-slate-950" />
                    </div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 border border-rose-400 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer shadow-sm"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-amber-300 dark:border-amber-700 flex items-center justify-center animate-pulse">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Export */}
          <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {isExporting && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>Exporting PDF…</span><span>{exportProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                </div>
              </div>
            )}
            <button
              onClick={exportPDF}
              disabled={pages.length === 0 || isExporting}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
            >
              <FileDown className="w-3.5 h-3.5" />Export KDP PDF
            </button>
            <p className="text-[9px] text-slate-400 text-center leading-snug">
              8.5&times;11&quot; · Title + {pages.length} page{pages.length !== 1 ? "s" : ""} + copyright
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedPage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPage.imageUrl}
            alt={selectedPage.prompt}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-6 flex gap-3">
            <button
              onClick={() => downloadPage(selectedPage)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black uppercase tracking-wider hover:bg-slate-100 cursor-pointer shadow-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
