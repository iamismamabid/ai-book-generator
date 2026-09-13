"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  PackageCheck,
  FileDown,
  CheckCircle2,
  BookOpen,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Box,
  Palette,
  ExternalLink,
  Tag,
  DollarSign
} from "lucide-react";
import JSZip from "jszip";
import confetti from "canvas-confetti";
import { BorderThemeId } from "@/lib/borderThemes";
import {
  generateFullKdpCover,
  COVER_THEMES,
  CoverThemeId,
  GeneratedCoverPackage
} from "@/app/utils/autoCoverGenerator";
import {
  generateKdpMetadata,
  KdpMetadataResult
} from "@/app/utils/bookMetadataGenerator";

interface FullBookPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookPages: any[];
  selectedTrim: { label: string; w: number; h: number };
  borderTheme?: BorderThemeId;
  isPremium?: boolean;
}

type PackagingStep =
  | "idle"
  | "specs"
  | "interior"
  | "cover"
  | "metadata"
  | "mockup"
  | "zipping"
  | "done"
  | "error";

export default function FullBookPackagerModal({
  isOpen,
  onClose,
  bookPages,
  selectedTrim,
  borderTheme,
  isPremium = true
}: FullBookPackagerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "cover" | "metadata">("preview");

  // Book Customization State
  const initialMetadata = useMemo(() => {
    return generateKdpMetadata({
      bookPages,
      trimSize: selectedTrim
    });
  }, [bookPages, selectedTrim]);

  const [title, setTitle] = useState(initialMetadata.title);
  const [subtitle, setSubtitle] = useState(initialMetadata.subtitle);
  const [author, setAuthor] = useState(initialMetadata.author);
  const [selectedTheme, setSelectedTheme] = useState<CoverThemeId>("midnight_gold");

  // Live generated cover & mockup preview state
  const [coverPackage, setCoverPackage] = useState<GeneratedCoverPackage | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Packaging progress state
  const [step, setStep] = useState<PackagingStep>("idle");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update initial title/subtitle if bookPages changes
  useEffect(() => {
    const meta = generateKdpMetadata({
      bookPages,
      trimSize: selectedTrim
    });
    setTitle(meta.title);
    setSubtitle(meta.subtitle);
    setAuthor(meta.author);
  }, [bookPages, selectedTrim]);

  // Compute live metadata based on current title/subtitle/author
  const currentMetadata: KdpMetadataResult = useMemo(() => {
    return generateKdpMetadata({
      bookPages,
      title,
      subtitle,
      author,
      trimSize: selectedTrim
    });
  }, [bookPages, title, subtitle, author, selectedTrim]);

  // Generate real-time preview of cover and 3D mockup whenever title, theme, or author changes
  useEffect(() => {
    let cancelled = false;

    async function updatePreview() {
      if (!isOpen) return;
      setIsGeneratingPreview(true);
      try {
        const pkg = await generateFullKdpCover({
          title,
          subtitle,
          author,
          pageCount: Math.max(24, bookPages.length),
          trimWidth: selectedTrim.w,
          trimHeight: selectedTrim.h,
          themeId: selectedTheme,
          dpi: 150 // Faster preview rendering
        });
        if (!cancelled) {
          setCoverPackage(pkg);
        }
      } catch (err) {
        console.error("Preview generation failed:", err);
      } finally {
        if (!cancelled) setIsGeneratingPreview(false);
      }
    }

    const timer = setTimeout(updatePreview, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, title, subtitle, author, selectedTheme, selectedTrim, bookPages.length]);

  if (!isOpen || !mounted) return null;

  const pageCount = Math.max(24, bookPages.length);
  const spineWidth = Number((pageCount * 0.002252).toFixed(4));
  const fullCoverWidth = Number(((selectedTrim.w * 2) + spineWidth + 0.25).toFixed(4));
  const fullCoverHeight = Number((selectedTrim.h + 0.25).toFixed(4));

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Main 1-Click Packaging Orchestrator
  const handlePackageAndDownload = async () => {
    setErrorMessage(null);
    setStep("specs");

    try {
      // 1. Calculate KDP Specs
      await new Promise((r) => setTimeout(r, 200));

      // 2. Compile Interior PDF
      setStep("interior");
      let activeIsPremium = true;
      try {
        const { checkPremiumStatus } = await import("@/app/actions");
        const res = await checkPremiumStatus();
        activeIsPremium = !!res?.isPremium;
      } catch {
        // fallback
      }

      const { exportBookToPDF } = await import("@/app/utils/pdfExportService");
      const interiorBlob = (await exportBookToPDF(bookPages, {
        returnBlob: true,
        includeCover: false,
        includePageNumbers: true,
        gutterMargin: true,
        trimSize: selectedTrim,
        borderTheme,
        isPremium: activeIsPremium
      })) as Blob;

      if (!interiorBlob) {
        throw new Error("Failed to generate Interior PDF.");
      }

      // 3. Render 300 DPI Print-Ready Cover PDF & 3D Mockup
      setStep("cover");
      const fullCoverResult = await generateFullKdpCover({
        title,
        subtitle,
        author,
        pageCount,
        trimWidth: selectedTrim.w,
        trimHeight: selectedTrim.h,
        themeId: selectedTheme,
        dpi: 300 // Full 300 DPI for Amazon KDP
      });

      // 4. Generate Metadata Cheatsheet
      setStep("metadata");
      const meta = generateKdpMetadata({
        bookPages,
        title,
        subtitle,
        author,
        trimSize: selectedTrim
      });

      // 5. Render 3D Mockup
      setStep("mockup");
      await new Promise((r) => setTimeout(r, 250));

      // 6. Zip into single package
      setStep("zipping");
      const zip = new JSZip();

      // Clean file naming
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);

      // Add the 4 core deliverables
      zip.file(`Interior_Print_Ready_${selectedTrim.w}x${selectedTrim.h}.pdf`, interiorBlob);
      zip.file(`Cover_Print_Ready_300DPI_${selectedTrim.w}x${selectedTrim.h}.pdf`, fullCoverResult.coverPdfBlob);
      zip.file(`Amazon_KDP_Metadata_Cheatsheet.txt`, meta.cheatsheetText);
      zip.file(`3D_Marketing_Mockup.png`, fullCoverResult.mockupPngBlob);

      // Generate the final ZIP blob
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      // Trigger automatic download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = `${safeTitle || "KDP_Book"}_Complete_Package.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      // Finish & Celebrate
      setStep("done");
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti is purely decorative
      }
    } catch (err: any) {
      console.error("1-Click Packaging Failed:", err);
      setErrorMessage(err?.message || "An unexpected error occurred during packaging.");
      setStep("error");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  1-Click Full KDP Book Packager
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Ready to Publish
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculates spine, renders 300 DPI wraparound cover, compiles SEO metadata &amp; 3D mockup into 1 ZIP.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Visual Previews & Tabs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Box className="w-3.5 h-3.5" /> 3D Mockup
              </button>
              <button
                onClick={() => setActiveTab("cover")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeTab === "cover"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Full Cover (300 DPI)
              </button>
              <button
                onClick={() => setActiveTab("metadata")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeTab === "metadata"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> KDP Metadata &amp; Keywords
              </button>
            </div>

            {/* Tab Content 1: 3D Mockup */}
            {activeTab === "preview" && (
              <div className="flex-1 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden shadow-inner">
                {isGeneratingPreview && !coverPackage ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Rendering 3D book mockup...</span>
                  </div>
                ) : coverPackage?.mockupDataUrl ? (
                  <div className="w-full flex flex-col items-center justify-center">
                    <img
                      src={coverPackage.mockupDataUrl}
                      alt="3D Book Mockup"
                      className="max-h-[300px] w-auto object-contain filter drop-shadow-2xl transition-all duration-300"
                    />
                    <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
                      ★ Included in ZIP as 3D_Marketing_Mockup.png (Transparent HD)
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs font-bold">Generating cover preview...</p>
                )}
              </div>
            )}

            {/* Tab Content 2: Full Cover Sheet */}
            {activeTab === "cover" && (
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden">
                {coverPackage?.coverDataUrl ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative border-2 border-dashed border-amber-500/40 rounded-lg p-1 bg-slate-900/40">
                      <img
                        src={coverPackage.coverDataUrl}
                        alt="Full KDP Cover Sheet"
                        className="max-h-[260px] w-auto object-contain rounded shadow-lg"
                      />
                      <div className="absolute inset-x-0 bottom-2 text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-slate-950/90 px-2 py-0.5 rounded border border-amber-500/30">
                          Wraparound: Back + Spine ({spineWidth}&quot;) + Front
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between w-full px-2 text-[10px] text-slate-400 font-bold">
                      <span>Cover Width: {fullCoverWidth}&quot;</span>
                      <span className="text-amber-400">Includes 0.125&quot; KDP Bleed</span>
                      <span>Cover Height: {fullCoverHeight}&quot;</span>
                    </div>
                  </div>
                ) : (
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                )}
              </div>
            )}

            {/* Tab Content 3: Metadata Preview */}
            {activeTab === "metadata" && (
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col space-y-3 overflow-y-auto max-h-[360px]">
                {/* 7 Keywords Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      7 KDP Backend Keywords (Under 50 chars each)
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(currentMetadata.keywords.join(", "), "all_kw")
                      }
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === "all_kw" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentMetadata.keywords.map((kw, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between group"
                      >
                        <span className="truncate">
                          <strong className="text-amber-500 mr-1.5">#{i + 1}</strong>
                          {kw}
                        </span>
                        <button
                          onClick={() => copyToClipboard(kw, `kw_${i}`)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                          title="Copy keyword"
                        >
                          {copiedKey === `kw_${i}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                      Recommended Amazon Category
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {currentMetadata.categories[0]}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">
                        Suggested Retail Price
                      </span>
                      <span className="text-sm font-black text-emerald-500">
                        ${currentMetadata.suggestedPriceUsd.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">
                        Est. Royalty (60%)
                      </span>
                      <span className="text-xs font-bold text-indigo-400">
                        +${currentMetadata.estimatedRoyaltyUsd.toFixed(2)} / sale
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Included Assets Summary Box */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Package includes 4 ready-to-use files in 1 ZIP:
                </span>
              </div>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Interior + Cover + Metadata + 3D Mockup
              </span>
            </div>
          </div>

          {/* Right Column: Customization & 1-Click Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Book Info Form */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" /> Book &amp; Cover Settings
              </h3>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="The Ultimate Puzzle Book..."
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="Large Print Brain Games with Complete Solutions..."
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="KDPage Press"
                />
              </div>

              {/* Theme Palette Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Designer Cover Palette
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(COVER_THEMES) as CoverThemeId[]).map((themeKey) => {
                    const t = COVER_THEMES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setSelectedTheme(themeKey)}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/10 scale-105"
                            : "border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                        }`}
                        title={t.name}
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-md mb-1 border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${t.bgGradStart}, ${t.accentColor})`
                          }}
                        />
                        <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center text-slate-600 dark:text-slate-400">
                          {t.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KDP Specifications Calculator Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> KDP Exact Calculations
                </span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  Paperback 300 DPI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Total Pages</span>
                  <span className="font-black text-slate-100">{pageCount} Pages</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Trim Size</span>
                  <span className="font-black text-slate-100">{selectedTrim.w}&quot; × {selectedTrim.h}&quot;</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Calculated Spine</span>
                  <span className="font-black text-amber-300">{spineWidth}&quot; ({pageCount >= 70 ? "With Text" : "No Text"})</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Total Cover Size</span>
                  <span className="font-black text-emerald-300">{fullCoverWidth}&quot; × {fullCoverHeight}&quot;</span>
                </div>
              </div>

              {bookPages.length < 24 && (
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>KDP requires 24+ pages for paperback. We will output 24-page spine sizing.</span>
                </div>
              )}
            </div>

            {/* Packaging Progress Status */}
            {step !== "idle" && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    {step === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : step === "error" ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    )}
                    {step === "specs" && "Step 1/6: Verifying KDP spine & bleed margins..."}
                    {step === "interior" && "Step 2/6: Compiling print-ready interior PDF..."}
                    {step === "cover" && "Step 3/6: Rendering 300 DPI wraparound cover..."}
                    {step === "metadata" && "Step 4/6: Formulating 7 SEO keywords & HTML blurb..."}
                    {step === "mockup" && "Step 5/6: Generating 3D marketing book mockup..."}
                    {step === "zipping" && "Step 6/6: Compressing package into ZIP file..."}
                    {step === "done" && "Package Downloaded Successfully! 🎉"}
                    {step === "error" && "Error creating package"}
                  </span>
                  {step === "done" && (
                    <span className="text-[10px] font-black uppercase text-emerald-500">100%</span>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errorMessage}</p>
                )}
              </div>
            )}

            {/* Golden 1-Click Package & Download Button */}
            <button
              onClick={handlePackageAndDownload}
              disabled={step !== "idle" && step !== "done" && step !== "error"}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group border border-yellow-200/50 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #fef08a 50%, #d97706 100%)",
                boxShadow: "0 10px 30px -5px rgba(245, 158, 11, 0.4)"
              }}
            >
              {/* Glossy light effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />

              {step !== "idle" && step !== "done" && step !== "error" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Packaging Your Book...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-slate-950 shrink-0" />
                  <span>Package Full KDP Book (.ZIP)</span>
                  <FileDown className="w-5 h-5 shrink-0 ml-auto opacity-80" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
