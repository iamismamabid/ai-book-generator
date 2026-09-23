"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Key, Eye, EyeOff, Loader2, Download, Trash2,
  Wand2, BookOpen, Lock, ExternalLink, Plus,
  FileDown, X, Check, AlertCircle, Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import {
  ByokProvider,
  loadByokKeys,
  saveByokKey,
  removeByokKey,
  hasActiveKeyForProvider,
  getProviderInfo,
  loadActiveProvider,
  saveActiveProvider,
} from "@/lib/byokStorage";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ArtbookPage {
  id: string;
  imageUrl: string;
  prompt: string;
  provider: ByokProvider;
  createdAt: number;
}

interface AiArtbookStudioProps {
  isPremium: boolean;
  isSignedIn: boolean;
  isActive: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STYLE_PRESETS = [
  { label: "Clean KDP Vector",        value: "clean crisp vector line art, solid black outlines, flat white background, no shading, no gray tones" },
  { label: "Bold Kids / Toddlers",    value: "thick bold cartoon outlines, simple closed shapes, large easy-to-color areas, cute vector style, zero fine lines" },
  { label: "Intricate Adult",         value: "ultra-detailed delicate black linework, ornate patterns, high complexity botanical and geometric details, adult coloring book" },
  { label: "Stained Glass",           value: "stained glass segmented thick leading lines, mosaic panes, bold high-contrast graphic outlines" },
  { label: "Whimsical Storybook",     value: "charming children book illustration lines, playful characters, expressive clean black contours" },
  { label: "Kawaii / Chibi Anime",    value: "cute Japanese kawaii anime style, thick smooth ink lines, simple adorable shapes, big sparkling eyes" },
  { label: "Botanical / Floral",      value: "delicate botanical illustration, fine ink pen strokes, intricate leaves petals and stems, zero fill" },
  { label: "Mandala / Sacred Geo",    value: "intricate circular mandala, sacred geometry, radial symmetry, ultra-fine vector lines, black on white" },
];

const PROMPT_IDEAS = [
  "A majestic lion surrounded by tropical flowers",
  "Enchanting fairy on a giant mushroom in a forest",
  "Intricate mandala with lotus and geometric patterns",
  "Baby elephant with butterflies in a meadow",
  "Underwater coral reef with fish and seahorses",
  "Cozy cottage with rose garden and picket fence",
  "Dragon on a mountain peak under starry sky",
];

const PROVIDERS: { id: ByokProvider; label: string }[] = [
  { id: "gemini",    label: "Google Gemini" },
  { id: "openai",    label: "OpenAI DALL-E" },
  { id: "stability", label: "Stability AI" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AiArtbookStudio({ isPremium, isSignedIn, isActive }: AiArtbookStudioProps) {
  const isActiveRef = useRef(false);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // BYOK
  const [activeProvider, setActiveProvider] = useState<ByokProvider>("gemini");
  const [keys, setKeys]   = useState({ openai: "", gemini: "", stability: "" });
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [keyStatus, setKeyStatus] = useState<Record<ByokProvider, boolean>>({ openai: false, gemini: false, stability: false });
  const [serverGemini, setServerGemini] = useState(false);

  // Generation
  const [prompt, setPrompt]           = useState("");
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].value);
  const [bulkCount, setBulkCount]     = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genIndex, setGenIndex]         = useState(0);
  const [genError, setGenError]         = useState<string | null>(null);

  // Pages
  const [pages, setPages]         = useState<ArtbookPage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoom, setZoom]           = useState(false);

  // Book meta
  const [bookTitle,  setBookTitle]  = useState("My Coloring Artbook");
  const [bookAuthor, setBookAuthor] = useState("");

  // Export
  const [isExporting,     setIsExporting]     = useState(false);
  const [exportProgress,  setExportProgress]  = useState(0);

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
      .then(d => { if (d.hasServerGeminiKey) setServerGemini(true); })
      .catch(() => {});
  }, []);

  useEffect(() => { setKeyInput(keys[activeProvider] || ""); setShowKey(false); }, [activeProvider, keys]);

  // ── Key management ────────────────────────────────────────────────────────
  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed.length < 5) return;
    const updated = saveByokKey(activeProvider, trimmed);
    setKeys(updated);
    saveActiveProvider(activeProvider);
    setKeyStatus(prev => ({ ...prev, [activeProvider]: true }));
  };

  const handleRemoveKey = () => {
    const updated = removeByokKey(activeProvider);
    setKeys(updated);
    setKeyInput("");
    setKeyStatus(prev => ({ ...prev, [activeProvider]: false }));
  };

  const effectiveKey = activeProvider === "gemini" && serverGemini
    ? (keys.gemini || "env")
    : keys[activeProvider];

  const hasAccess = isPremium || keyStatus.openai || keyStatus.gemini || keyStatus.stability || serverGemini;

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
            provider:    activeProvider,
            apiKey:      effectiveKey || "env",
            prompt:      prompt.trim(),
            studioType:  "coloring",
            stylePreset,
            size:        "1024x1024",
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

  const deletePage = (id: string) => {
    setPages(prev => {
      const updated = prev.filter(p => p.id !== id);
      setSelectedIdx(idx => Math.min(idx, Math.max(0, updated.length - 1)));
      return updated;
    });
  };

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
      pdf.setFillColor(255,255,255); pdf.rect(0,0,W,H,"F");
      pdf.setFillColor(99,102,241); pdf.rect(0,0,W,6,"F");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(34); pdf.setTextColor(20,20,40);
      pdf.text(pdf.splitTextToSize(bookTitle||"My Coloring Artbook",W-M*2), W/2, H/2-70, { align:"center" });
      pdf.setFont("helvetica","normal"); pdf.setFontSize(13); pdf.setTextColor(100,100,120);
      pdf.text("AI-Generated Coloring Artbook", W/2, H/2, { align:"center" });
      pdf.text(`${pages.length} Unique Coloring Pages · KDPage AI Artbook Studio`, W/2, H/2+22, { align:"center" });
      if (bookAuthor) {
        pdf.setFont("helvetica","bold"); pdf.setFontSize(12); pdf.setTextColor(50,50,70);
        pdf.text(`by ${bookAuthor}`, W/2, H/2+60, { align:"center" });
      }
      pdf.setFillColor(99,102,241); pdf.rect(0,H-6,W,6,"F");
      setExportProgress(5);

      // Content pages
      for (let i = 0; i < pages.length; i++) {
        pdf.addPage([W,H],"portrait");
        pdf.setFillColor(255,255,255); pdf.rect(0,0,W,H,"F");
        await new Promise<void>(resolve => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const avW = W-M*2, avH = H-M*2-24;
            const ratio = Math.min(avW/img.naturalWidth, avH/img.naturalHeight);
            const dW = img.naturalWidth*ratio, dH = img.naturalHeight*ratio;
            pdf.addImage(img, "PNG", (W-dW)/2, M+(avH-dH)/2, dW, dH);
            pdf.setFont("helvetica","normal"); pdf.setFontSize(8); pdf.setTextColor(160,160,170);
            pdf.text(`${i+1}`, W/2, H-M/2, { align:"center" });
            resolve();
          };
          img.onerror = resolve;
          img.src = pages[i].imageUrl;
        });
        setExportProgress(5 + Math.round(((i+1)/pages.length)*90));
      }

      // Copyright page
      pdf.addPage([W,H],"portrait");
      pdf.setFillColor(255,255,255); pdf.rect(0,0,W,H,"F");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(13); pdf.setTextColor(30,30,50);
      pdf.text("Copyright Notice", W/2, H/2-50, { align:"center" });
      pdf.setFont("helvetica","normal"); pdf.setFontSize(9); pdf.setTextColor(100,100,120);
      [`\u00A9 ${new Date().getFullYear()} ${bookAuthor||"The Author"}. All rights reserved.`,
       "No part of this publication may be reproduced without written permission.",
       "","Generated with KDPage AI Artbook Studio \u2014 kdpage.com"
      ].forEach((line,idx) => pdf.text(line, W/2, H/2-10+idx*16, { align:"center" }));

      setExportProgress(100);
      pdf.save(`${(bookTitle||"coloring-artbook").replace(/[^a-z0-9]/gi,"-").toLowerCase()}.pdf`);
    } catch(err:any) {
      alert("PDF export failed: " + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [pages, bookTitle, bookAuthor]);

  const downloadPage = (p: ArtbookPage) => {
    const a = document.createElement("a");
    a.href = p.imageUrl; a.download = `coloring-page-${Date.now()}.png`; a.click();
  };

  const selectedPage = pages[selectedIdx] ?? null;

  // ── Access Gate ───────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 p-8">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Premium or BYOK Required</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Generate 300 DPI coloring book pages from any text prompt using your own OpenAI, Gemini, or Stability AI key — at direct raw API cost with no platform markup.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/pricing" className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all">
              Upgrade to Pro →
            </a>
            <p className="text-xs text-slate-500">— or enter your own API key for free BYOK access —</p>
            <div className="flex flex-col gap-2">
              {PROVIDERS.map(p => (
                <div key={p.id} className="flex gap-2">
                  <input
                    type="password"
                    placeholder={`${p.label} API Key`}
                    onChange={e => { setActiveProvider(p.id); setKeyInput(e.target.value); }}
                    onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 font-mono"
                  />
                  <button onClick={handleSaveKey} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer">Save</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Top ribbon */}
      <div className="h-9 min-h-[36px] w-full bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border-b border-indigo-500/20 flex items-center px-4 gap-3 shrink-0 select-none">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-2.5 h-2.5 animate-pulse" /> AI MAGIC
        </span>
        <span className="text-[11px] text-slate-300 font-medium truncate">
          <strong className="text-white">AI Coloring Artbook Studio</strong> — Generate 300 DPI KDP-ready coloring pages from any text prompt
        </span>
        {isPremium && <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider shrink-0">Pro</span>}
      </div>

      {/* 3-column workspace */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── LEFT: Keys + Style ─────────────────────────────────────────── */}
        <div className="w-60 min-w-[200px] bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0 p-3 gap-3">
          {/* Book details */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><BookOpen className="w-3 h-3"/>Book Details</p>
            <input type="text" value={bookTitle} onChange={e=>setBookTitle(e.target.value)} placeholder="Book Title" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 mb-1.5"/>
            <input type="text" value={bookAuthor} onChange={e=>setBookAuthor(e.target.value)} placeholder="Author (optional)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"/>
          </div>
          <hr className="border-slate-800"/>

          {/* Provider */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Key className="w-3 h-3"/>AI Provider</p>
            <div className="flex flex-col gap-1">
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={()=>{ setActiveProvider(p.id); saveActiveProvider(p.id); }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${activeProvider===p.id?"bg-indigo-600 text-white shadow-md":"bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"}`}>
                  <span>{p.label}</span>
                  {(keyStatus[p.id]||(p.id==="gemini"&&serverGemini)) && <Check className="w-3 h-3 text-emerald-400"/>}
                </button>
              ))}
            </div>
          </div>

          {/* Key input */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">API Key</p>
            {activeProvider==="gemini"&&serverGemini ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-[10px] font-bold"><Check className="w-3 h-3"/>Platform key active</div>
            ) : (
              <>
                <div className="relative">
                  <input id="artbook-key-input" type={showKey?"text":"password"} value={keyInput} onChange={e=>setKeyInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSaveKey()}
                    placeholder="Paste your API key…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-[10px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500 font-mono"/>
                  <button onClick={()=>setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showKey?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}
                  </button>
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={handleSaveKey} className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer">Save Key</button>
                  {keyStatus[activeProvider]&&<button onClick={handleRemoveKey} className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"><Trash2 className="w-3 h-3"/></button>}
                </div>
                <a href={getProviderInfo(activeProvider).keyUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline">
                  <ExternalLink className="w-2.5 h-2.5"/>Get free API key
                </a>
              </>
            )}
          </div>
          <hr className="border-slate-800"/>

          {/* Style presets */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Art Style</p>
            <div className="flex flex-col gap-1">
              {STYLE_PRESETS.map(s=>(
                <button key={s.value} onClick={()=>setStylePreset(s.value)}
                  className={`text-left px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${stylePreset===s.value?"bg-fuchsia-700/50 text-fuchsia-200 border border-fuchsia-500/50":"bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: Prompt + Preview ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-950">
          {/* Prompt controls */}
          <div className="shrink-0 border-b border-slate-800 p-4 space-y-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Describe Your Coloring Page</label>
              <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A majestic lion surrounded by tropical flowers and leaves…" rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500 resize-none leading-relaxed"/>
            </div>
            {/* Quick ideas */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider self-center">Ideas:</span>
              {PROMPT_IDEAS.slice(0,4).map(idea=>(
                <button key={idea} onClick={()=>setPrompt(idea)}
                  className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all cursor-pointer">
                  {idea.length>32?idea.slice(0,30)+"…":idea}
                </button>
              ))}
            </div>
            {/* Controls row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pages:</span>
                {[1,5,10,20].map(n=>(
                  <button key={n} onClick={()=>setBulkCount(n)}
                    className={`w-8 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${bulkCount===n?"bg-indigo-600 text-white shadow-sm":"bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={generatePages} disabled={isGenerating||!prompt.trim()}
                className="ml-auto flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/40 cursor-pointer active:scale-95">
                {isGenerating?(<><Loader2 className="w-4 h-4 animate-spin"/>Generating {genIndex}/{bulkCount}…</>):(<><Wand2 className="w-4 h-4"/>Generate {bulkCount>1?`${bulkCount} Pages`:"Page"}</>)}
              </button>
            </div>
            {genError&&(
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-900/30 border border-rose-700/40 text-rose-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0"/><span>{genError}</span>
                <button onClick={()=>setGenError(null)} className="ml-auto text-rose-400 hover:text-rose-200"><X className="w-3 h-3"/></button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-[#0a0a14] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(0deg,#6366f1 0,#6366f1 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#6366f1 0,#6366f1 1px,transparent 1px,transparent 40px)"}}/>
            {selectedPage?(
              <div className="relative group max-h-full max-w-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedPage.imageUrl} alt={selectedPage.prompt}
                  className={`max-h-full max-w-full object-contain rounded-2xl shadow-2xl shadow-indigo-950/80 transition-all duration-300 ${zoom?"scale-110":""}`}
                  style={{maxHeight:"calc(100vh - 340px)"}}/>
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-2xl">
                  <button onClick={()=>setZoom(!zoom)} className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800"><ZoomIn className="w-4 h-4"/></button>
                  <button onClick={()=>downloadPage(selectedPage)} className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800"><Download className="w-4 h-4"/></button>
                  <button onClick={()=>deletePage(selectedPage.id)} className="p-2 rounded-full bg-rose-900/60 border border-rose-700/50 text-rose-300 hover:bg-rose-900"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ):(
              <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-xs">
                <div className="w-20 h-20 rounded-3xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-indigo-500/60"/>
                </div>
                <div><p className="text-slate-400 font-bold text-sm">No pages yet</p><p className="text-slate-600 text-xs mt-1">Enter a prompt above and click Generate</p></div>
              </div>
            )}
            {isGenerating&&!selectedPage&&(
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 z-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400"/>
                <p className="text-sm font-bold text-indigo-300">Generating page {genIndex} of {bulkCount}…</p>
                <p className="text-xs text-slate-500">This may take 15–30 seconds per page</p>
              </div>
            )}
          </div>

          {/* Info bar */}
          {selectedPage&&(
            <div className="shrink-0 border-t border-slate-800 px-4 py-2 flex items-center gap-3 bg-slate-900/50">
              <span className="text-[10px] text-slate-500 truncate flex-1"><strong className="text-slate-300">Prompt:</strong> {selectedPage.prompt}</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase">{selectedPage.provider}</span>
              <button onClick={()=>downloadPage(selectedPage)} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"><Download className="w-3 h-3"/>Save PNG</button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Queue + Export ───────────────────────────────────────── */}
        <div className="w-52 min-w-[180px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden shrink-0">
          <div className="shrink-0 px-3 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Page Queue</p><p className="text-xs font-bold text-white">{pages.length} {pages.length===1?"page":"pages"}</p></div>
            {pages.length>0&&<button onClick={()=>{if(confirm("Clear all pages?")){setPages([]);setSelectedIdx(0);}}} className="text-[9px] text-slate-500 hover:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"><Trash2 className="w-2.5 h-2.5"/>Clear</button>}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
            {pages.length===0?(
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                <Plus className="w-5 h-5 text-slate-600"/><p className="text-[10px] text-slate-600 font-semibold">Generate pages to fill your book</p>
              </div>
            ):pages.map((page,idx)=>(
              <div key={page.id} onClick={()=>setSelectedIdx(idx)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${idx===selectedIdx?"border-indigo-500 shadow-lg shadow-indigo-900/50":"border-slate-700 hover:border-slate-600"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.imageUrl} alt={page.prompt} className="w-full aspect-square object-cover"/>
                <div className="absolute bottom-1 left-1 text-[8px] font-black bg-slate-900/80 text-slate-300 px-1.5 py-0.5 rounded-md">{idx+1}</div>
                <button onClick={e=>{e.stopPropagation();deletePage(page.id);}} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-900/80 border border-rose-700/50 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"><X className="w-2.5 h-2.5"/></button>
              </div>
            ))}
            {isGenerating&&<div className="w-full aspect-square rounded-xl bg-slate-800 border-2 border-indigo-500/40 flex items-center justify-center animate-pulse"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin"/></div>}
          </div>

          <div className="shrink-0 p-3 border-t border-slate-800 space-y-2">
            {isExporting&&<div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full" style={{width:`${exportProgress}%`}}/></div>}
            <button onClick={exportPDF} disabled={pages.length===0||isExporting}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95">
              {isExporting?(<><Loader2 className="w-3.5 h-3.5 animate-spin"/>Exporting {exportProgress}%</>):(<><FileDown className="w-3.5 h-3.5"/>Export KDP PDF</>)}
            </button>
            <p className="text-[8px] text-slate-600 text-center leading-relaxed">8.5&times;11&quot; PDF · title page + {pages.length} coloring page{pages.length!==1?"s":""} + copyright</p>
          </div>
        </div>
      </div>
    </div>
  );
}
