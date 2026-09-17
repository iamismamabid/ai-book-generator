"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Hash,
  Grid,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Layers,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { PRESETS, PresetItem, drawColoringPattern } from "@/lib/coloringBookPatterns";

const CATEGORIES = [
  "All",
  "Botanical & Floral",
  "Mandalas & Sacred Geometry",
  "Stained Glass & Architecture",
  "Landscapes & Celestial",
  "Food, Drinks & Kitchen",
  "Cozy Objects & Still Life",
  "Abstract & Art Deco",
  "Single Object Clip-Art",
  "European Flags",
  "North American Flags",
  "Concept Cars",
];

// Helper to safely load and scale images (caps at max 1800px to maintain crisp 300 DPI without exploding memory)
const compressImageIfNeeded = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        const maxDimension = 1800;
        if (img.width <= maxDimension && img.height <= maxDimension) {
          resolve(rawDataUrl);
          return;
        }
        let w = img.width;
        let h = img.height;
        if (w > h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
        } else {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};

export function ColoringBookEditor({ page, updatePage, bulkAddPages }: any) {
  const [artSource, setArtSource] = useState<"preset" | "upload">(
    page.config.uploadedImageUrl ? "upload" : (page.config.artSource || "preset")
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    page.config.uploadedImageUrl || null
  );
  const [pageTitle, setPageTitle] = useState<string>(page.config.title || "");
  const [lineArtContrast, setLineArtContrast] = useState<number>(page.config.lineArtContrast ?? 100);

  // Preset states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [presetId, setPresetId] = useState<string>(page.config.presetId || "tropical_palms");
  const [complexity, setComplexity] = useState<number>(page.config.complexity ?? 12);
  const [lineWidth, setLineWidth] = useState<number>(page.config.lineWidth ?? 3);
  const [isColorByNumber, setIsColorByNumber] = useState<boolean>(page.config.isColorByNumber ?? true);
  const [isMidnightMode, setIsMidnightMode] = useState<boolean>(page.config.isMidnightMode ?? false);
  const [frameStyle, setFrameStyle] = useState<"ornamental" | "circle" | "minimal" | "none">(
    page.config.frameStyle || "ornamental"
  );
  const [seed, setSeed] = useState<number>(page.config.seed ?? Math.floor(Math.random() * 10000));

  // Batch upload states
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const activePreset: PresetItem = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const filteredPresets = PRESETS.filter((p) => selectedCategory === "All" || p.category === selectedCategory);

  // Canvas drawing handler
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (artSource === "upload" && uploadedImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Canvas Background: pure white or midnight dark
        ctx.fillStyle = isMidnightMode ? "#09090b" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Safe margins matching 8.5" x 11" KDP guidelines (0.65" margin)
        const marginX = canvas.width * 0.08;
        const marginTop = canvas.height * 0.09;
        const marginBottom = canvas.height * 0.07;
        const safeW = canvas.width - marginX * 2;
        const safeH = canvas.height - marginTop - marginBottom;

        // Maintain aspect ratio without stretching
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const boxAspect = safeW / safeH;
        let drawW = safeW;
        let drawH = safeH;
        let drawX = marginX;
        let drawY = marginTop;

        if (imgAspect > boxAspect) {
          drawW = safeW;
          drawH = safeW / imgAspect;
          drawY = marginTop + (safeH - drawH) / 2;
        } else {
          drawH = safeH;
          drawW = safeH * imgAspect;
          drawX = marginX + (safeW - drawW) / 2;
        }

        // Apply filters
        if (isMidnightMode) {
          ctx.filter = `invert(1) contrast(${Math.max(100, lineArtContrast)}%)`;
        } else if (lineArtContrast !== 100) {
          ctx.filter = `contrast(${lineArtContrast}%)`;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.filter = "none";
        ctx.restore();

        // Decorative Border Frames
        if (frameStyle === "ornamental") {
          ctx.save();
          ctx.strokeStyle = isMidnightMode ? "#ffffff" : "#111827";
          ctx.lineWidth = 4;
          ctx.strokeRect(marginX - 10, marginTop - 10, safeW + 20, safeH + 20);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(marginX - 18, marginTop - 18, safeW + 36, safeH + 36);

          const corners = [
            [marginX - 18, marginTop - 18],
            [marginX + safeW + 18, marginTop - 18],
            [marginX - 18, marginTop + safeH + 18],
            [marginX + safeW + 18, marginTop + safeH + 18],
          ];
          ctx.fillStyle = isMidnightMode ? "#ffffff" : "#111827";
          corners.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        } else if (frameStyle === "minimal") {
          ctx.save();
          ctx.strokeStyle = isMidnightMode ? "#ffffff" : "#111827";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(marginX - 10, marginTop - 10, safeW + 20, safeH + 20);
          ctx.restore();
        } else if (frameStyle === "circle") {
          ctx.save();
          ctx.strokeStyle = isMidnightMode ? "#ffffff" : "#111827";
          ctx.lineWidth = 3;
          const cx = canvas.width / 2;
          const cy = marginTop + safeH / 2;
          const radius = Math.min(safeW, safeH) / 2 + 10;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      };
      img.src = uploadedImageUrl;
      return;
    }

    // Procedural built-in pattern
    drawColoringPattern(ctx, canvas.width, canvas.height, {
      presetId,
      complexity,
      lineWidth,
      isColorByNumber,
      isMidnightMode,
      frameStyle,
      seed,
    });
  }, [presetId, complexity, lineWidth, isColorByNumber, isMidnightMode, frameStyle, seed, artSource, uploadedImageUrl, lineArtContrast]);

  // Sync to BookBuilder page state
  useEffect(() => {
    draw();
    updatePage({
      artSource,
      uploadedImageUrl,
      lineArtContrast,
      title: pageTitle,
      presetId,
      complexity,
      lineWidth,
      isColorByNumber,
      isMidnightMode,
      frameStyle,
      seed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  // Handle single image file upload
  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageIfNeeded(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setUploadedImageUrl(dataUrl);
      setPageTitle(cleanTitle);
      setArtSource("upload");
      updatePage({
        ...page.config,
        artSource: "upload",
        uploadedImageUrl: dataUrl,
        title: cleanTitle,
        lineArtContrast,
        isMidnightMode,
        frameStyle,
      });
    } catch (err) {
      console.error("Failed to read image file:", err);
      alert("Could not load image file. Please try another PNG, JPG, or WebP image.");
    }
    e.target.value = "";
  };

  // Handle batch / bulk image files upload
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingBatch(true);
    setBatchStatus(`Processing 0 / ${files.length} images...`);

    try {
      const dataUrls: { url: string; title: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBatchStatus(`Processing ${i + 1} / ${files.length}: ${file.name}...`);
        const url = await compressImageIfNeeded(file);
        const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        dataUrls.push({ url, title });
      }

      if (dataUrls.length > 0) {
        // First image updates the current page
        const first = dataUrls[0];
        setUploadedImageUrl(first.url);
        setPageTitle(first.title);
        setArtSource("upload");
        updatePage({
          ...page.config,
          artSource: "upload",
          uploadedImageUrl: first.url,
          title: first.title,
          lineArtContrast,
          isMidnightMode,
          frameStyle,
        });

        // Remaining images are bulk added as new coloring pages
        if (dataUrls.length > 1 && bulkAddPages) {
          const newConfigs = dataUrls.slice(1).map((item) => ({
            artSource: "upload",
            uploadedImageUrl: item.url,
            title: item.title,
            lineArtContrast,
            isMidnightMode,
            frameStyle,
            seed: Math.floor(Math.random() * 10000),
          }));
          bulkAddPages(newConfigs);
        }

        setBatchStatus(`✅ Successfully loaded ${files.length} coloring ${files.length === 1 ? 'page' : 'pages'}!`);
        setTimeout(() => setBatchStatus(null), 4000);
      }
    } catch (err) {
      console.error("Batch upload failed:", err);
      alert("An error occurred during batch upload. Some images could not be loaded.");
    } finally {
      setIsProcessingBatch(false);
      e.target.value = "";
    }
  };

  const handleRemoveUpload = () => {
    setUploadedImageUrl(null);
    setArtSource("preset");
    updatePage({
      ...page.config,
      artSource: "preset",
      uploadedImageUrl: null,
    });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-full p-2 sm:p-4 overflow-y-auto">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleSingleUpload}
        className="hidden"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        multiple
        onChange={handleBatchUpload}
        className="hidden"
      />

      {/* Options Panel */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4">
        {/* Source Mode Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => setArtSource("preset")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              artSource === "preset"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Built-in (67+)
          </button>
          <button
            type="button"
            onClick={() => setArtSource("upload")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
              artSource === "upload"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload Art
            {uploadedImageUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>

        {/* BATCH STATUS BANNER */}
        {batchStatus && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="truncate">{batchStatus}</span>
          </div>
        )}

        {/* MODE: UPLOAD CUSTOM ART */}
        {artSource === "upload" && (
          <div className="space-y-4">
            {/* Uploaded Image Active Card */}
            {uploadedImageUrl ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-500" /> Active Custom Art
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    Custom Image
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-16 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded art thumbnail"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {pageTitle || "Custom Coloring Page"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">300 DPI KDP Margins Ready</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => singleFileInputRef.current?.click()}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-500" /> Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveUpload}
                    className="py-2 px-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold text-red-600 dark:text-red-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Revert to Presets
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone / Single Upload */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-500" /> Upload Image
                </h3>
                <div
                  onClick={() => singleFileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Click to Upload Single Image
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, WebP, SVG line art
                  </span>
                </div>
              </div>
            )}

            {/* BATCH UPLOAD MULTIPLE PAGES */}
            <div className="bg-linear-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 p-4 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-200 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Batch Image Upload
                </h3>
                <span className="text-[10px] bg-indigo-200/60 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-200 font-bold px-2 py-0.5 rounded-full">
                  ⚡ Bulk Pages
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Upload 10, 20, or 50+ images at once. Each image automatically creates a separate coloring page in your book!
              </p>
              <button
                type="button"
                disabled={isProcessingBatch}
                onClick={() => batchFileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4" />
                {isProcessingBatch ? "Processing Images..." : "Choose Multiple Images (Batch)"}
              </button>
            </div>

            {/* Controls for uploaded image */}
            {uploadedImageUrl && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" /> Image Adjustments
                </h3>

                {/* Line Art Contrast Booster */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Line Art Contrast</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">{lineArtContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    step="5"
                    value={lineArtContrast}
                    onChange={(e) => setLineArtContrast(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Boosts faint lines into deep black for Amazon KDP print.
                  </span>
                </div>

                {/* Border Frame and Midnight Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                      Border Frame
                    </label>
                    <select
                      value={frameStyle}
                      onChange={(e) => setFrameStyle(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="ornamental">Ornamental</option>
                      <option value="circle">Circle Vignette</option>
                      <option value="minimal">Minimal Line</option>
                      <option value="none">Full Bleed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                      Style Mode
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMidnightMode(!isMidnightMode)}
                      className={`w-full py-2 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        isMidnightMode
                          ? "bg-slate-950 text-white border-slate-800 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isMidnightMode ? "🌙 Midnight" : "☀️ Standard"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE: PRESET TEMPLATES */}
        {artSource === "preset" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-indigo-500" /> Category
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">({filteredPresets.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat === "Mandalas & Sacred Geometry"
                      ? "Mandalas"
                      : cat === "Stained Glass & Architecture"
                      ? "Stained Glass"
                      : cat === "Landscapes & Celestial"
                      ? "Landscapes"
                      : cat === "Food, Drinks & Kitchen"
                      ? "Food & Kitchen"
                      : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
              <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Design Template
              </h3>
              <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPresetId(preset.id);
                      setComplexity(preset.defaultComplexity);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      presetId === preset.id
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/40 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="text-[11px] font-black">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-xs">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Color-by-Number
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Numbered regions + palette key
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isColorByNumber}
                  onChange={(e) => setIsColorByNumber(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Line Thickness</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Pattern Complexity</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{complexity}</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  value={complexity}
                  onChange={(e) => setComplexity(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Border Frame
                  </label>
                  <select
                    value={frameStyle}
                    onChange={(e) => setFrameStyle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="ornamental">Ornamental</option>
                    <option value="circle">Circle Vignette</option>
                    <option value="minimal">Minimal Line</option>
                    <option value="none">Full Bleed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Style Mode
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMidnightMode(!isMidnightMode)}
                    className={`w-full py-2 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                      isMidnightMode
                        ? "bg-slate-950 text-white border-slate-800"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isMidnightMode ? "🌙 Midnight" : "☀️ Standard"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Variation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Preview */}
      <div className="flex-1 min-w-0 bg-slate-200/50 dark:bg-slate-950 p-3 sm:p-5 lg:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 overflow-y-auto flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-[700px]">
        <div
          className="bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-sm border border-slate-300/80 dark:border-slate-700 overflow-hidden"
          style={{ width: "480px", height: `${480 * (11 / 8.5)}px` }}
        >
          <canvas ref={canvasRef} width={850} height={1100} className="w-full h-full object-contain" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          {artSource === "upload" && uploadedImageUrl ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Custom Art: <strong className="text-slate-900 dark:text-slate-100">{pageTitle || "Uploaded Page"}</strong> (KDP Margin Scaled)
              </span>
            </>
          ) : (
            <span>
              Preset: <strong className="text-slate-900 dark:text-slate-100">{activePreset.name}</strong> ({activePreset.category})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
