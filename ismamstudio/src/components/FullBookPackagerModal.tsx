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
  Upload,
  Image as ImageIcon,
  Brush,
  Trash2,
  ArrowRight
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
  KdpMetadataResult,
  KdpBookLanguage
} from "@/app/utils/bookMetadataGenerator";

export interface BookCoverSyncData {
  title: string;
  subtitle: string;
  author: string;
  trimSize: { label: string; w: number; h: number };
  pageCount: number;
  themeId?: CoverThemeId;
  language?: KdpBookLanguage;
}

interface FullBookPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookPages: any[];
  selectedTrim: { label: string; w: number; h: number };
  borderTheme?: BorderThemeId;
  isPremium?: boolean;
  onOpenCoverStudio?: (syncData?: BookCoverSyncData) => void;
  coverStudioCanvasDataUrl?: string;
  language?: KdpBookLanguage;
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

type CoverMode = "theme" | "upload" | "coverstudio";

export default function FullBookPackagerModal({
  isOpen,
  onClose,
  bookPages,
  selectedTrim,
  borderTheme,
  isPremium = true,
  onOpenCoverStudio,
  coverStudioCanvasDataUrl,
  language: initialLanguage = "en"
}: FullBookPackagerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "cover" | "metadata">("preview");
  const [bookLanguage, setBookLanguage] = useState<KdpBookLanguage>(initialLanguage || "en");

  // Cover design mode: theme, upload, or coverstudio
  const [coverMode, setCoverMode] = useState<CoverMode>(
    coverStudioCanvasDataUrl ? "coverstudio" : "theme"
  );
  const [uploadedCoverImage, setUploadedCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Book Customization State
  const initialMetadata = useMemo(() => {
    return generateKdpMetadata({
      bookPages,
      trimSize: selectedTrim,
      language: bookLanguage
    });
  }, [bookPages, selectedTrim, bookLanguage]);

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

  // Sync initial metadata when pages or language change
  useEffect(() => {
    const meta = generateKdpMetadata({
      bookPages,
      trimSize: selectedTrim,
      language: bookLanguage
    });
    setTitle(meta.title);
    setSubtitle(meta.subtitle);
    setAuthor(meta.author);
  }, [bookPages, selectedTrim, bookLanguage]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedCoverImage(dataUrl);
      setCoverMode("upload");
    };
    reader.readAsDataURL(file);
  };

  // Compute live metadata based on current title/subtitle/author
  const currentMetadata: KdpMetadataResult = useMemo(() => {
    return generateKdpMetadata({
      bookPages,
      title,
      subtitle,
      author,
      trimSize: selectedTrim,
      language: bookLanguage
    });
  }, [bookPages, title, subtitle, author, selectedTrim, bookLanguage]);

  // Generate real-time preview of cover and 3D mockup
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
          dpi: 150, // Faster preview
          frontCoverImageUrl: coverMode === "upload" ? (uploadedCoverImage || undefined) : undefined,
          customFullCoverDataUrl: coverMode === "coverstudio" ? (coverStudioCanvasDataUrl || undefined) : undefined,
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

    const timer = setTimeout(updatePreview, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    isOpen,
    title,
    subtitle,
    author,
    selectedTheme,
    selectedTrim,
    bookPages.length,
    coverMode,
    uploadedCoverImage,
    coverStudioCanvasDataUrl
  ]);

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
      await new Promise((r) => setTimeout(r, 200));

      // 2. Compile Interior PDF
      setStep("interior");
      let activeIsPremium = isPremium ?? true;
      try {
        const { getClientSafePremiumStatus } = await import("@/lib/clientAuth");
        const res = await getClientSafePremiumStatus();
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
        dpi: 300,
        frontCoverImageUrl: coverMode === "upload" ? (uploadedCoverImage || undefined) : undefined,
        customFullCoverDataUrl: coverMode === "coverstudio" ? (coverStudioCanvasDataUrl || undefined) : undefined,
      });

      // 4. Generate Metadata Cheatsheet
      setStep("metadata");
      const meta = generateKdpMetadata({
        bookPages,
        title,
        subtitle,
        author,
        trimSize: selectedTrim,
        language: bookLanguage,
      });

      // 5. Render 3D Mockup
      setStep("mockup");
      await new Promise((r) => setTimeout(r, 250));

      // 6. Zip into single package
      setStep("zipping");
      const zip = new JSZip();
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);

      zip.file(`Interior_Print_Ready_${selectedTrim.w}x${selectedTrim.h}.pdf`, interiorBlob);
      zip.file(`Cover_Print_Ready_300DPI_${selectedTrim.w}x${selectedTrim.h}.pdf`, fullCoverResult.coverPdfBlob);
      zip.file(`Amazon_KDP_Metadata_Cheatsheet.txt`, meta.cheatsheetText);
      zip.file(`3D_Marketing_Mockup.png`, fullCoverResult.mockupPngBlob);

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = `${safeTitle || "KDP_Book"}_Complete_Package.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      setStep("done");
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // decorative
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
        style={{ maxHeight: "94vh" }}
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Box className="w-3.5 h-3.5" /> 3D Mockup
              </button>
              <button
                onClick={() => setActiveTab("cover")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === "cover"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Full Cover (300 DPI)
              </button>
              <button
                onClick={() => setActiveTab("metadata")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      7 KDP Backend Keywords (Under 50 chars each)
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(currentMetadata.keywords.join(", "), "all_kw")
                      }
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
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

          {/* Right Column: Cover Design Source & Settings (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Cover Source Selector (Hybrid Solution) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Choose Cover Source
                </span>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  3 Design Modes
                </span>
              </div>

              {/* 3 Mode Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCoverMode("theme")}
                  className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition cursor-pointer ${
                    coverMode === "theme"
                      ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>10 Themes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverMode("upload")}
                  className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition cursor-pointer ${
                    coverMode === "upload"
                      ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Art</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverMode("coverstudio")}
                  className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition cursor-pointer ${
                    coverMode === "coverstudio"
                      ? "bg-white dark:bg-slate-800 text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Brush className="w-3.5 h-3.5" />
                  <span>Cover Studio</span>
                </button>
              </div>

              {/* Cover Mode A: 10 Designer Themes */}
              {coverMode === "theme" && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Select Designer Palette</span>
                    <span className="text-amber-500 font-semibold">{COVER_THEMES[selectedTheme]?.name} ({COVER_THEMES[selectedTheme]?.badge})</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto p-1">
                    {(Object.keys(COVER_THEMES) as CoverThemeId[]).map((themeKey) => {
                      const t = COVER_THEMES[themeKey];
                      const isSelected = selectedTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => setSelectedTheme(themeKey)}
                          className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/10 scale-105"
                              : "border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                          }`}
                          title={`${t.name} - ${t.badge}`}
                        >
                          <div
                            className="w-5 h-5 rounded-full shadow-sm mb-1 border border-white/20"
                            style={{
                              background: `linear-gradient(135deg, ${t.bgGradStart}, ${t.accentColor})`
                            }}
                          />
                          <span className="text-[7.5px] font-black uppercase tracking-tighter truncate w-full text-center text-slate-600 dark:text-slate-400">
                            {t.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cover Mode B: Upload Image / AI Art */}
              {coverMode === "upload" && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {uploadedCoverImage ? (
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <img
                        src={uploadedCoverImage}
                        alt="Front Cover"
                        className="w-12 h-14 object-cover rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          Custom Artwork Loaded
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold block">
                          ✓ Auto-wraps to 300 DPI Front Cover
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition cursor-pointer"
                        title="Change image"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadedCoverImage(null)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 px-4 border-2 border-dashed border-amber-500/40 hover:border-amber-500 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-center group"
                    >
                      <Upload className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Upload Front Cover / AI Artwork
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        PNG, JPG or WebP (Midjourney, KDPage AI, or Canva Art)
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Cover Mode C: Cover Studio Direct Integration */}
              {coverMode === "coverstudio" && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Brush className="w-4 h-4" />
                      <span>Fabric Canvas Studio Integration</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Design your front, spine, and back cover using Fabric Canvas tools (freeform text, layers, stickers, custom fonts, and photos).
                    </p>
                    {onOpenCoverStudio ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCoverStudio({
                            title,
                            subtitle,
                            author,
                            trimSize: selectedTrim,
                            pageCount: Math.max(24, bookPages.length),
                            themeId: selectedTheme,
                            language: bookLanguage,
                          });
                        }}
                        className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Open &amp; Edit in Cover Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <p className="text-[10px] text-amber-400 font-semibold">
                        Switch to the &quot;Cover Studio&quot; tab in the top navigation anytime to visually edit.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Book Info Form */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" /> Book Details &amp; Language
                </h3>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  KDP Marketplace
                </span>
              </div>

              {/* Language / Market Selector */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Book Language / Mercado
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { code: "en", flag: "🇺🇸", label: "English" },
                    { code: "es", flag: "🇪🇸", label: "Español" },
                    { code: "de", flag: "🇩🇪", label: "Deutsch" },
                    { code: "fr", flag: "🇫🇷", label: "Français" },
                  ].map((langItem) => {
                    const isSelected = bookLanguage === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          const newLang = langItem.code as KdpBookLanguage;
                          setBookLanguage(newLang);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-amber-400"
                        }`}
                      >
                        <span>{langItem.flag}</span>
                        <span className="text-[10px] uppercase tracking-tight">{langItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="The Ultimate Puzzle Book..."
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="Large Print Brain Games with Complete Solutions..."
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-sm"
                  placeholder="KDPage Press"
                />
              </div>
            </div>

            {/* KDP Specifications Calculator Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 space-y-2 shadow-lg">
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

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
