"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Wand2, ImageIcon, Download, Trash2, X, Plus, Minus,
  Upload, Key, Loader2, Check, AlertCircle, Eye, EyeOff,
  ExternalLink, FileDown, ZoomIn, Settings2, ChevronRight,
  ArrowLeft, LayoutDashboard, Paintbrush, BookOpen,
} from "lucide-react";
import Link from "next/link";
import {
  ByokProvider, loadByokKeys, saveByokKey, removeByokKey,
  getProviderInfo, loadActiveProvider, saveActiveProvider, maskApiKey,
} from "@/lib/byokStorage";
import {
  saveArtbookPageAction,
  getArtbookPagesAction,
  deleteArtbookPageAction,
  clearArtbookPagesAction,
} from "@/app/actions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColoringPage {
  id: string; imageUrl: string; prompt: string;
  style: string; provider: ByokProvider; createdAt: number;
}
interface AiArtbookStudioProps {
  isPremium: boolean; isSignedIn: boolean; isActive: boolean;
}

// ─── Styles with mini SVG swatch ────────────────────────────────────────────
const STYLES = [
  {
    id: "standard", label: "Standard",
    promptSuffix: "clean crisp vector line art, solid black outlines, flat white background, no shading, no gray tones, KDP-ready coloring page",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#f8fafc"/>
        <circle cx="20" cy="20" r="10" fill="none" stroke="#1e293b" strokeWidth="2"/>
        <line x1="8" y1="14" x2="32" y2="14" stroke="#1e293b" strokeWidth="1.5"/>
        <line x1="5" y1="20" x2="35" y2="20" stroke="#1e293b" strokeWidth="1.5"/>
        <line x1="8" y1="26" x2="32" y2="26" stroke="#1e293b" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "cartoon", label: "Cartoon",
    promptSuffix: "thick bold cartoon outlines, simple closed shapes, large easy-to-color areas, cute vector style, zero fine lines, bold black strokes",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#fffbeb"/>
        <circle cx="20" cy="18" r="10" fill="none" stroke="#1e293b" strokeWidth="3"/>
        <circle cx="16" cy="16" r="2" fill="#1e293b"/>
        <circle cx="24" cy="16" r="2" fill="#1e293b"/>
        <path d="M15 23 Q20 28 25 23" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "anime", label: "Anime",
    promptSuffix: "cute Japanese kawaii anime style, thick smooth ink lines, simple adorable shapes, big sparkling eyes, chibi proportions",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#fdf4ff"/>
        <ellipse cx="20" cy="18" rx="9" ry="11" fill="none" stroke="#1e293b" strokeWidth="2"/>
        <ellipse cx="16" cy="16" rx="3" ry="4" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
        <ellipse cx="24" cy="16" rx="3" ry="4" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
        <path d="M16 26 Q20 29 24 26" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 10 Q16 7 20 9 Q24 7 27 10" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "intricate", label: "Intricate",
    promptSuffix: "ultra-detailed delicate black linework, ornate patterns, high complexity, adult coloring book, fine pen strokes, zero fill",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#f0fdf4"/>
        <circle cx="20" cy="20" r="15" fill="none" stroke="#1e293b" strokeWidth="0.8"/>
        <circle cx="20" cy="20" r="10" fill="none" stroke="#1e293b" strokeWidth="0.8"/>
        <circle cx="20" cy="20" r="5" fill="none" stroke="#1e293b" strokeWidth="0.8"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i} x1="20" y1="20"
            x2={20+15*Math.cos(a*Math.PI/180)} y2={20+15*Math.sin(a*Math.PI/180)}
            stroke="#1e293b" strokeWidth="0.6"/>
        ))}
      </svg>
    ),
  },
  {
    id: "stained", label: "Stained Glass",
    promptSuffix: "stained glass segmented thick leading lines, mosaic panes, bold high-contrast graphic outlines, geometric sections",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#eff6ff"/>
        <polygon points="20,5 35,35 5,35" fill="none" stroke="#1e293b" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="35" stroke="#1e293b" strokeWidth="1.5"/>
        <line x1="5" y1="35" x2="35" y2="35" stroke="#1e293b" strokeWidth="1.5"/>
        <line x1="12" y1="20" x2="28" y2="20" stroke="#1e293b" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "botanical", label: "Botanical",
    promptSuffix: "delicate botanical illustration, fine ink pen strokes, intricate leaves petals and stems, zero fill, black on white, naturalistic",
    swatch: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#f0fdf4"/>
        <path d="M20 35 Q20 20 20 10" stroke="#1e293b" strokeWidth="1.5" fill="none"/>
        <path d="M20 20 Q10 15 8 8" stroke="#1e293b" strokeWidth="1" fill="none"/>
        <path d="M20 24 Q30 18 32 12" stroke="#1e293b" strokeWidth="1" fill="none"/>
        <ellipse cx="14" cy="12" rx="6" ry="4" transform="rotate(-30 14 12)" fill="none" stroke="#1e293b" strokeWidth="1"/>
        <ellipse cx="26" cy="16" rx="6" ry="4" transform="rotate(30 26 16)" fill="none" stroke="#1e293b" strokeWidth="1"/>
        <circle cx="20" cy="10" r="2.5" fill="none" stroke="#1e293b" strokeWidth="1"/>
      </svg>
    ),
  },
];

const SURPRISE_PROMPTS = [
  "Cute baby dragon resting on a treasure chest overflowing with gems, clean thick outlines, white background",
  "Enchanting fairy sitting on a giant mushroom in a moonlit forest, detailed coloring book art",
  "Majestic lion with intricate mane patterns, zentangle-style, black outlines on white",
  "Underwater scene with a mermaid and colorful sea creatures, clean line art",
  "Fantasy castle on a floating island with clouds and rainbows, detailed coloring page",
  "Adorable family of foxes in an autumn forest with falling leaves, cute cartoon outlines",
  "Intricate butterfly with mandala wing patterns, adult coloring book style",
  "Cozy little bakery storefront with croissants and flower pots, whimsical illustration",
  "Ancient tree with a hidden treehouse and rope bridge, storybook style outlines",
  "Galaxy-themed wolf howling at a crescent moon surrounded by stars and nebulae",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AiArtbookStudio({ isPremium, isSignedIn }: AiArtbookStudioProps) {
  // Mode
  const [mode, setMode] = useState<"text" | "photo">("text");

  // Generation state
  const [prompt, setPrompt]             = useState("");
  const [styleId, setStyleId]           = useState("standard");
  const [useProMode, setUseProMode]     = useState(false);
  const [batch, setBatch]               = useState(1);
  const [enhancedBg, setEnhancedBg]     = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genIndex, setGenIndex]         = useState(0);
  const [genError, setGenError]         = useState<string | null>(null);

  // Pages
  const [pages, setPages]                 = useState<ColoringPage[]>([]);
  const [previewPage, setPreviewPage]     = useState<ColoringPage | null>(null);
  const [lightboxOpen, setLightboxOpen]   = useState(false);

  // Photo upload
  const [photoFile, setPhotoFile]         = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // BYOK
  const [keys, setKeys]         = useState({ openai: "", gemini: "", stability: "" });
  const [serverGemini, setServerGemini]   = useState(false);
  const [serverGeminiHint, setServerGeminiHint] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState({ openai: false, gemini: false, stability: false });
  const [keyModalOpen, setKeyModalOpen]   = useState(false);
  const [modalKeyInput, setModalKeyInput] = useState("");
  const [modalProvider, setModalProvider] = useState<ByokProvider>("gemini");
  const [showModalKey, setShowModalKey]   = useState(false);
  const [keySaved, setKeySaved]           = useState(false);

  // Export
  const [isExporting, setIsExporting]     = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadByokKeys();
    setKeys(loaded);
    const p = loadActiveProvider();
    if (p === "openai") setUseProMode(true);
    setKeyStatus({
      openai:    loaded.openai.length > 4,
      gemini:    loaded.gemini.length > 4,
      stability: loaded.stability.length > 4,
    });
    fetch("/api/byok/generate")
      .then(r => r.json())
      .then(d => { if (d.hasServerGeminiKey) { setServerGemini(true); setServerGeminiHint(d.geminiKeyHint); } })
      .catch(() => {});

    // 1. First load instant local cache
    try {
      const raw = localStorage.getItem("kdpage_coloring_pages");
      if (raw) {
        const local = JSON.parse(raw);
        if (Array.isArray(local) && local.length > 0) {
          setPages(local);
          setPreviewPage(local[0]);
        }
      }
    } catch {}

    // 2. If signed in, sync latest from Neon Cloud Storage
    if (isSignedIn) {
      getArtbookPagesAction().then(res => {
        if (res.success && res.pages && res.pages.length > 0) {
          setPages(res.pages as any);
          setPreviewPage(res.pages[0] as any);
          try { localStorage.setItem("kdpage_coloring_pages", JSON.stringify(res.pages)); } catch {}
        }
      }).catch(console.error);
    }
  }, [isSignedIn]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeProvider: ByokProvider = useProMode ? "openai" : "gemini";
  const activeKey = (activeProvider === "gemini" && serverGemini) ? "env" : keys[activeProvider];
  const hasKey = keyStatus[activeProvider] || (activeProvider === "gemini" && serverGemini);
  const selectedStyle = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  // ── Surprise Me ───────────────────────────────────────────────────────────
  const surpriseMe = () => {
    const p = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(p);
  };

  // ── Photo upload ─────────────────────────────────────────────────────────
  const handlePhotoUpload = (file: File) => {
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  // ── Generate ─────────────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (mode === "text" && !prompt.trim()) { setGenError("Please describe your coloring page."); return; }
    if (mode === "photo" && !photoFile) { setGenError("Please upload a photo first."); return; }
    if (!hasKey) { setKeyModalOpen(true); return; }

    setIsGenerating(true);
    setGenError(null);
    const newPages: ColoringPage[] = [];
    const fullPrompt = mode === "text"
      ? `${prompt.trim()}. ${selectedStyle.promptSuffix}${enhancedBg ? ", with a detailed colorable background scene" : ", pure white background"}`
      : `Convert this photo to a clean black line art coloring page for printing. ${selectedStyle.promptSuffix}, pure white background`;

    for (let i = 0; i < batch; i++) {
      setGenIndex(i + 1);
      try {
        const body: Record<string, string> = {
          provider: activeProvider,
          apiKey: activeKey || "env",
          prompt: fullPrompt,
          studioType: "coloring",
          stylePreset: selectedStyle.promptSuffix,
          size: "1024x1024",
        };
        const res  = await fetch("/api/byok/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!data.success || !data.imageUrl) { setGenError(data.error || "Generation failed. Check your API key."); break; }
        newPages.push({ id: `${Date.now()}-${i}`, imageUrl: data.imageUrl, prompt: fullPrompt, style: styleId, provider: activeProvider, createdAt: Date.now() });
      } catch (err: any) {
        setGenError(`Network error: ${err.message}`);
        break;
      }
    }

    setIsGenerating(false);
    setGenIndex(0);
    if (newPages.length > 0) {
      setPages(prev => {
        const u = [...newPages, ...prev];
        setPreviewPage(newPages[0]);
        try { localStorage.setItem("kdpage_coloring_pages", JSON.stringify(u)); } catch {}
        return u;
      });

      // ── Neon Cloud Storage: Persist newly generated pages ───────────────
      if (isSignedIn) {
        for (const np of newPages) {
          saveArtbookPageAction({
            imageUrl: np.imageUrl,
            prompt: np.prompt,
            style: np.style,
            provider: np.provider,
          }).then(res => {
            if (res.success && res.page) {
              setPages(curr => curr.map(p => p.id === np.id ? { ...p, id: res.page!.id } : p));
            }
          }).catch(console.error);
        }
      }
    }
  }, [mode, prompt, photoFile, hasKey, batch, activeProvider, activeKey, selectedStyle, styleId, enhancedBg, isSignedIn]);

  // ── Key save ──────────────────────────────────────────────────────────────
  const saveKey = () => {
    const v = modalKeyInput.trim();
    if (v.length < 5) return;
    const updated = saveByokKey(modalProvider, v);
    setKeys(updated);
    saveActiveProvider(modalProvider);
    setKeyStatus(prev => ({ ...prev, [modalProvider]: true }));
    setModalKeyInput("");
    setKeySaved(true);
    setTimeout(() => { setKeySaved(false); setKeyModalOpen(false); }, 1500);
  };

  // ── PDF export ────────────────────────────────────────────────────────────
  const exportPDF = useCallback(async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const W = 612, H = 792, M = 36;
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [W, H] });
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage([W, H], "portrait");
        await new Promise<void>(resolve => {
          const img = new Image(); img.crossOrigin = "anonymous";
          img.onload = () => {
            const ratio = Math.min((W - M * 2) / img.naturalWidth, (H - M * 2) / img.naturalHeight);
            const dW = img.naturalWidth * ratio, dH = img.naturalHeight * ratio;
            pdf.addImage(img, "PNG", (W - dW) / 2, M + ((H - M * 2) - dH) / 2, dW, dH);
            pdf.setFont("helvetica","normal"); pdf.setFontSize(8); pdf.setTextColor(180,180,190);
            pdf.text(`${i+1}`, W / 2, H - 14, { align: "center" }); resolve();
          };
          img.onerror = resolve;
          img.src = pages[i].imageUrl;
        });
      }
      pdf.save("coloring-pages.pdf");
    } catch (err: any) { alert("PDF export failed: " + err.message); }
    finally { setIsExporting(false); }
  }, [pages]);

  const deletePage = (id: string) => {
    setPages(prev => {
      const u = prev.filter(p => p.id !== id);
      try { localStorage.setItem("kdpage_coloring_pages", JSON.stringify(u)); } catch {}
      if (previewPage?.id === id) setPreviewPage(u[0] ?? null);
      return u;
    });
    if (isSignedIn) {
      deleteArtbookPageAction(id).catch(console.error);
    }
  };

  const clearAllPages = () => {
    if (!confirm("Clear all pages? This will also remove them from your Neon cloud storage.")) return;
    setPages([]);
    setPreviewPage(null);
    try { localStorage.removeItem("kdpage_coloring_pages"); } catch {}
    if (isSignedIn) {
      clearArtbookPagesAction().catch(console.error);
    }
  };

  const downloadPage = (p: ColoringPage) => { const a = document.createElement("a"); a.href = p.imageUrl; a.download = `coloring-page-${Date.now()}.png`; a.click(); };

  // ── Open in Creator Studio (1-Click Bridge to Book Builder) ───────────────
  const handleOpenInCreatorStudio = (targetPages?: ColoringPage[]) => {
    const pagesToExport = targetPages && targetPages.length > 0 ? targetPages : pages;
    if (!pagesToExport || pagesToExport.length === 0) return;

    // 1. Mandatory Front-matter: Title Page
    const titlePage = {
      id: `title_${Date.now()}`,
      type: "title",
      config: {
        title: "AI Coloring Masterpiece",
        subtitle: "A Collection of AI-Generated Coloring Pages",
        author: "KDPage Creator",
        puzzleType: "coloring_book",
        puzzleCount: pagesToExport.length,
      }
    };

    // 2. Mandatory Front-matter: Copyright Page
    const copyrightPage = {
      id: `copyright_${Date.now()}`,
      type: "copyright",
      config: {
        title: "AI Coloring Masterpiece",
        author: "KDPage Creator",
        year: new Date().getFullYear().toString(),
        edition: "First Edition",
        puzzleType: "coloring_book",
      }
    };

    // 3. Content Pages for each coloring page
    const contentPages = pagesToExport.map((p, idx) => ({
      id: `coloring_${p.id || idx}_${Date.now()}`,
      type: "coloring_book",
      config: {
        artSource: "upload",
        uploadedImageUrl: p.imageUrl,
        title: p.prompt ? (p.prompt.slice(0, 45) + (p.prompt.length > 45 ? "..." : "")) : `Coloring Page ${idx + 1}`,
        lineArtContrast: 100,
        isMidnightMode: false,
        frameStyle: "ornamental",
        isColorByNumber: false,
      }
    }));

    const fullBookPages = [titlePage, copyrightPage, ...contentPages];

    const payload = {
      timestamp: Date.now(),
      title: "AI Coloring Masterpiece",
      pages: fullBookPages,
      count: fullBookPages.length,
    };

    try {
      sessionStorage.setItem("kdpage_artbook_import", JSON.stringify(payload));
    } catch {
      try {
        localStorage.setItem("kdpage_artbook_import", JSON.stringify(payload));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }
    }

    // Direct redirection to Creator Studio Book Builder
    window.location.href = "/studio?import=artbook&tab=interior";
  };

  const canGenerate = mode === "text" ? prompt.trim().length > 0 : !!photoFile;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF9F5" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100" style={{ borderColor: "#F5E8DC" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-200 group-hover:shadow-md transition-shadow">
              <Paintbrush className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900 text-base tracking-tight">KDPage</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-500">
            <Link href="/tools" className="hover:text-slate-900 transition-colors">Coloring Tools</Link>
            <Link href="/studio" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3 h-3" />Creator Studio
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => setKeyModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
            >
              <Key className="w-3 h-3" />API Keys
              {(keyStatus.gemini || keyStatus.openai || serverGemini) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>
            {pages.length > 0 && (
              <>
                <button
                  onClick={() => handleOpenInCreatorStudio()}
                  className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 cursor-pointer active:scale-95"
                  title="Send all coloring pages to Creator Studio Book Builder and calculate cover spine"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open in Creator Studio ({pages.length})</span>
                </button>
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm shadow-emerald-200 cursor-pointer disabled:opacity-50"
                  title="Quick PDF download"
                >
                  <FileDown className="w-3 h-3" />{isExporting ? "Exporting…" : "Quick PDF"}
                </button>
              </>
            )}
            {isSignedIn ? (
              <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200 hover:shadow-md hover:from-amber-400 hover:to-orange-400 transition-all">
                <LayoutDashboard className="w-3 h-3" />Dashboard
              </Link>
            ) : (
              <Link href="/sign-up" className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200 hover:shadow-md transition-all">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="text-center px-4 pt-12 pb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-3">
          Turn Any Idea Into a{" "}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Coloring Page
          </span>{" "}
          in Seconds
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed mb-7">
          Free AI coloring page generator. Turn any idea into a printable coloring page — quick, easy, and ready to print.
        </p>

        {/* Mode tabs */}
        <div className="inline-flex items-center bg-white border border-orange-100 rounded-full p-1 shadow-sm gap-1" style={{ borderColor: "#F5E8DC" }}>
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              mode === "text"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wand2 className="w-4 h-4" />Text to Coloring Page
          </button>
          <button
            onClick={() => setMode("photo")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              mode === "photo"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" />Photo to Coloring Page
          </button>
        </div>
      </section>

      {/* ── Main Tool Area ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-16 flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT: Preview */}
        <div className="w-full lg:w-[45%] shrink-0">
          <div
            className="rounded-3xl overflow-hidden border-2 flex items-center justify-center relative"
            style={{ background: "#FFF5EE", borderColor: "#F5E0CC", minHeight: 420 }}
          >
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/70 backdrop-blur-sm z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-200 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800">Generating your coloring page…</p>
                  <p className="text-sm text-slate-500 mt-1">Page {genIndex} of {batch} • ~15–30 seconds</p>
                </div>
                <div className="w-48 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${(genIndex / batch) * 100}%` }} />
                </div>
              </div>
            ) : previewPage ? (
              <div className="relative w-full group">
                {/* Paper shadow */}
                <div className="absolute inset-4 translate-x-3 translate-y-3 bg-orange-100 rounded-2xl -z-10 opacity-60" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPage.imageUrl}
                  alt={previewPage.prompt}
                  className="w-full object-contain rounded-2xl shadow-lg bg-white cursor-zoom-in"
                  style={{ maxHeight: 520 }}
                  onClick={() => setLightboxOpen(true)}
                />
                {/* Hover actions */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setLightboxOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-md hover:bg-slate-50 cursor-pointer">
                    <ZoomIn className="w-3.5 h-3.5" />View
                  </button>
                  <button onClick={() => handleOpenInCreatorStudio([previewPage])} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:from-indigo-500 hover:to-purple-500 cursor-pointer" title="Send to Creator Studio Book Builder">
                    <BookOpen className="w-3.5 h-3.5" />To Studio
                  </button>
                  <button onClick={() => downloadPage(previewPage)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-md hover:bg-slate-50 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />Save
                  </button>
                  <button onClick={() => deletePage(previewPage.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 shadow-md hover:bg-rose-100 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </div>
              </div>
            ) : mode === "photo" && photoPreviewUrl ? (
              <div className="relative w-full p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreviewUrl} alt="Uploaded photo" className="w-full object-contain rounded-2xl shadow-md max-h-80" />
                <p className="text-center text-sm text-slate-500 mt-3 font-medium">Photo ready — click Generate to convert</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
                <div className="w-24 h-24 rounded-3xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: "#F5CBA0", background: "#FFF5EE" }}>
                  <ImageIcon className="w-10 h-10" style={{ color: "#F5CBA0" }} />
                </div>
                <div>
                  <p className="font-bold text-slate-400 text-base">Your Coloring Page Appears Here</p>
                  <p className="text-slate-300 text-sm mt-1">
                    {mode === "text" ? "Describe your idea and click Generate 🎨" : "Upload your photo and click Convert"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="w-full lg:flex-1 bg-white rounded-3xl border shadow-lg shadow-orange-100/50 overflow-hidden" style={{ borderColor: "#F5E8DC" }}>

          {/* Mode: Text */}
          {mode === "text" && (
            <div className="p-5 space-y-5">
              {/* Describe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center">①</span>
                    Describe It
                  </span>
                  <button
                    onClick={surpriseMe}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-500 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 transition-all cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />Surprise Me
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="What should the coloring page be about? e.g. sleeping astronaut in forest"
                  rows={3}
                  className="w-full text-sm p-3.5 rounded-2xl border outline-none resize-none leading-relaxed transition-all text-slate-800 placeholder:text-slate-300"
                  style={{ borderColor: prompt ? "#F5A623" : "#F5E8DC", background: "#FFFDF9", boxShadow: prompt ? "0 0 0 3px rgba(245,166,35,0.08)" : "none" }}
                />
              </div>

              {/* Choose Mode */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center">②</span>
                  <span className="text-sm font-black text-slate-700">Choose Mode</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUseProMode(false)}
                    className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      !useProMode
                        ? "border-amber-400 bg-amber-50 shadow-sm shadow-amber-100"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1">
                      <span>⚡</span>Quick
                    </span>
                    <span className="text-sm font-black text-slate-800">Fast</span>
                    <span className="text-[11px] text-slate-400 font-medium">Gemini · Free</span>
                    {!useProMode && <Check className="absolute top-3 right-3 w-4 h-4 text-amber-500" />}
                  </button>
                  <button
                    onClick={() => { if (!isPremium && !keyStatus.openai) { setModalProvider("openai"); setKeyModalOpen(true); } else setUseProMode(true); }}
                    className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      useProMode
                        ? "border-pink-400 bg-pink-50 shadow-sm shadow-pink-100"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-500 mb-1 flex items-center gap-1">
                      <span>✦</span>Pro
                    </span>
                    <span className="text-sm font-black text-slate-800">Ultra Detail</span>
                    <span className="text-[11px] text-slate-400 font-medium">DALL·E 3 · OpenAI key</span>
                    {useProMode && <Check className="absolute top-3 right-3 w-4 h-4 text-pink-500" />}
                    {!isPremium && !keyStatus.openai && (
                      <span className="absolute top-3 right-3 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-600 uppercase">Key</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Style */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center">③</span>
                  <span className="text-sm font-black text-slate-700">Style</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyleId(s.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 border-2 transition-all cursor-pointer ${
                        styleId === s.id
                          ? "border-amber-400 shadow-sm shadow-amber-100"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-50">
                        {s.swatch}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 leading-tight text-center">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch + Enhanced Bg */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-600">Batch Size</span>
                  <div className="flex items-center gap-1 bg-slate-50 rounded-full border border-slate-100 p-1">
                    <button onClick={() => setBatch(b => Math.max(1, b - 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all cursor-pointer">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-black text-slate-800">{batch}</span>
                    <button onClick={() => setBatch(b => Math.min(8, b + 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all cursor-pointer">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <span className="text-sm font-bold text-slate-600">Enhanced Background</span>
                  <button
                    onClick={() => setEnhancedBg(!enhancedBg)}
                    className={`relative w-12 h-6 rounded-full transition-all cursor-pointer border-2 ${
                      enhancedBg ? "bg-amber-500 border-amber-500" : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${enhancedBg ? "left-6" : "left-0.5"}`} />
                  </button>
                  {!enhancedBg && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">No credit</span>
                  )}
                </div>
              </div>

              {genError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="flex-1">{genError}</span>
                  <button onClick={() => setGenError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* Generate */}
              <button
                onClick={generate}
                disabled={isGenerating || !canGenerate}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                  canGenerate
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-md shadow-amber-200 hover:shadow-lg hover:from-amber-400 hover:to-orange-400"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating {genIndex}/{batch}…</>
                  : <><Sparkles className="w-4 h-4" />Generate {batch > 1 ? `${batch} Pages` : "Coloring Page"}</>
                }
              </button>
            </div>
          )}

          {/* Mode: Photo */}
          {mode === "photo" && (
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black flex items-center justify-center">①</span>
                  <span className="text-sm font-black text-slate-700">Upload Photo</span>
                </div>
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-pink-300 hover:bg-pink-50/30"
                  style={{ borderColor: photoFile ? "#F472B6" : "#F5E8DC" }}
                  onClick={() => photoInputRef.current?.click()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handlePhotoUpload(f); }}
                  onDragOver={e => e.preventDefault()}
                >
                  <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
                  {photoFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-pink-600">
                      <Check className="w-5 h-5" />{photoFile.name}
                      <button onClick={e => { e.stopPropagation(); setPhotoFile(null); setPhotoPreviewUrl(null); }} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: "#F5CBA0" }} />
                      <p className="text-sm font-bold text-slate-500">Drop your photo here (click)</p>
                      <p className="text-xs text-slate-300 mt-1">JPG, PNG, WebP — up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Choose Mode */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black flex items-center justify-center">②</span>
                  <span className="text-sm font-black text-slate-700">Choose Model</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ pro: false, label: "Quick", sub: "Gemini · Fast" }, { pro: true, label: "Pro", sub: "DALL·E 3 · Detail" }].map(m => (
                    <button key={String(m.pro)} onClick={() => setUseProMode(m.pro)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${m.pro === useProMode ? (m.pro ? "border-pink-400 bg-pink-50" : "border-amber-400 bg-amber-50") : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
                      <p className="text-sm font-black text-slate-800">{m.label}</p>
                      <p className="text-[11px] text-slate-400">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black flex items-center justify-center">③</span>
                  <span className="text-sm font-black text-slate-700">Line Art Style</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={() => setStyleId(s.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 border-2 transition-all cursor-pointer ${styleId === s.id ? "border-pink-400 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}>
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-50">{s.swatch}</div>
                      <span className="text-[10px] font-bold text-slate-600 leading-tight text-center">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span className="flex-1">{genError}</span>
                  <button onClick={() => setGenError(null)} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              <button
                onClick={generate}
                disabled={isGenerating || !canGenerate}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                  canGenerate ? "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white shadow-md shadow-pink-200 hover:shadow-lg" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Converting…</> : <><Sparkles className="w-4 h-4" />Convert to Coloring Page</>}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Recent Creations ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-black text-slate-700">Recent Creations</span>
            {pages.length > 0 && <span className="text-xs font-bold text-slate-400">({pages.length})</span>}
            {isSignedIn && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Neon Cloud Synced
              </span>
            )}
          </div>
          {pages.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleOpenInCreatorStudio()}
                className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-sm shadow-indigo-200 transition-all cursor-pointer active:scale-95"
                title="Send all coloring pages to Creator Studio Book Builder & calculate cover spine"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open in Creator Studio ({pages.length})</span>
              </button>
              <button onClick={clearAllPages} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1.5">
                <Trash2 className="w-3 h-3" />Clear all
              </button>
            </div>
          )}
        </div>

        {pages.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed py-12 flex flex-col items-center gap-3 text-center" style={{ borderColor: "#F5E8DC" }}>
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: "#F5CBA0" }}>
              <ImageIcon className="w-6 h-6" style={{ color: "#F5CBA0" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Nothing yet</p>
              <p className="text-xs text-slate-300 mt-0.5">Your pages will show up here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map(page => (
              <div
                key={page.id}
                className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  previewPage?.id === page.id ? "border-amber-400 shadow-amber-100" : "border-transparent hover:border-slate-200"
                }`}
                onClick={() => setPreviewPage(page)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.imageUrl} alt={page.prompt} className="w-full aspect-square object-cover bg-white" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); downloadPage(page); }} className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                    <Download className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deletePage(page.id); }} className="w-7 h-7 rounded-full bg-rose-500 shadow flex items-center justify-center hover:bg-rose-600 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                {previewPage?.id === page.id && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── API Key Modal ────────────────────────────────────────────────── */}
      {keyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setKeyModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">API Key Setup</h3>
                  <p className="text-xs text-slate-400">Keys stored in browser only · never sent to our servers</p>
                </div>
              </div>
              <button onClick={() => setKeyModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Provider tabs */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl mb-4">
              {(["gemini","openai","stability"] as ByokProvider[]).map(p => (
                <button key={p} onClick={() => { setModalProvider(p); setModalKeyInput(""); setShowModalKey(false); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${modalProvider === p ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
                  {p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Stability"}
                  {(keyStatus[p] || (p === "gemini" && serverGemini)) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1.5" />}
                </button>
              ))}
            </div>

            {/* Status */}
            {(keyStatus[modalProvider] || (modalProvider === "gemini" && serverGemini)) && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Connected</span>
                <span className="font-mono text-xs text-emerald-500">{maskApiKey(keys[modalProvider] || (serverGemini && modalProvider === "gemini" ? "env" : ""))}</span>
              </div>
            )}

            {/* Platform Gemini key */}
            {modalProvider === "gemini" && serverGemini && (
              <div className="mb-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Platform Gemini key available {serverGeminiHint ? `(${serverGeminiHint})` : ""}</span>
                <button onClick={() => { const u = saveByokKey("gemini","env"); setKeys(u); setKeyStatus(p => ({...p, gemini: true})); setKeySaved(true); setTimeout(() => setKeySaved(false), 1500); }}
                  className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-500 transition-all">Use</button>
              </div>
            )}

            {/* Key input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{modalProvider === "openai" ? "OpenAI" : modalProvider === "gemini" ? "Gemini" : "Stability AI"} API Key</span>
                <a href={getProviderInfo(modalProvider).keyUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-amber-600 hover:underline flex items-center gap-1">
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showModalKey ? "text" : "password"}
                    value={modalKeyInput}
                    onChange={e => setModalKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveKey()}
                    placeholder={getProviderInfo(modalProvider).keyPlaceholder}
                    className="w-full text-xs font-mono py-3 px-3 pr-9 rounded-2xl border outline-none focus:border-amber-400 transition-all"
                    style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
                  />
                  <button type="button" onClick={() => setShowModalKey(!showModalKey)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showModalKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={saveKey}
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                  {keySaved ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Saved!</> : "Save"}
                </button>
              </div>
              {keys[modalProvider] && keyStatus[modalProvider] && (
                <button onClick={() => { const u = removeByokKey(modalProvider); setKeys(u); setKeyStatus(p => ({...p, [modalProvider]: false})); }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer">
                  <Trash2 className="w-3 h-3" />Remove saved key
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxOpen && previewPage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all">
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewPage.imageUrl} alt={previewPage.prompt} className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-6 flex gap-3">
            <button
              onClick={() => {
                setLightboxOpen(false);
                handleOpenInCreatorStudio([previewPage]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-wider hover:from-indigo-500 hover:to-purple-500 cursor-pointer shadow-xl active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />Open in Creator Studio
            </button>
            <button onClick={() => downloadPage(previewPage)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black uppercase tracking-wider hover:bg-slate-100 cursor-pointer shadow-xl">
              <Download className="w-3.5 h-3.5" />Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
