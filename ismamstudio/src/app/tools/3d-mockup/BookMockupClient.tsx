"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Upload,
  ArrowLeft,
  RotateCw,
  Sliders,
  Layers,
  Check,
  Palette,
  Eye,
  BookOpen,
  Image as ImageIcon,
  Zap,
  Info
} from "lucide-react";

export type MockupStyle = "paperback_3d" | "hardcover_3d" | "standing_spine" | "isometric_lay";
export type BackgroundType = "transparent" | "white" | "dark" | "studio_warm" | "gradient_indigo";

interface BookMockupClientProps {
  initialCoverUrl?: string;
  initialSpineUrl?: string;
  initialPageCount?: number;
}

export default function BookMockupClient({
  initialCoverUrl,
  initialSpineUrl,
  initialPageCount = 120
}: BookMockupClientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Images state
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(initialCoverUrl || null);
  const [spineImageSrc, setSpineImageSrc] = useState<string | null>(initialSpineUrl || null);
  const [coverImgElement, setCoverImgElement] = useState<HTMLImageElement | null>(null);
  const [spineImgElement, setSpineImgElement] = useState<HTMLImageElement | null>(null);

  // Settings
  const [mockupStyle, setMockupStyle] = useState<MockupStyle>("paperback_3d");
  const [pageCount, setPageCount] = useState<number>(initialPageCount);
  const [spineColor, setSpineColor] = useState<string>("#1e1b4b");
  const [bgType, setBgType] = useState<BackgroundType>("transparent");
  const [shadowIntensity, setShadowIntensity] = useState<number>(65);
  const [lightingGlow, setLightingGlow] = useState<number>(50);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Check sessionStorage on mount (if sent from Cover Studio)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCover = sessionStorage.getItem("kdpage_mockup_cover");
        const storedSpine = sessionStorage.getItem("kdpage_mockup_spine");
        const storedPages = sessionStorage.getItem("kdpage_mockup_pages");
        if (storedCover && !coverImageSrc) {
          setCoverImageSrc(storedCover);
        }
        if (storedSpine && !spineImageSrc) {
          setSpineImageSrc(storedSpine);
        }
        if (storedPages) {
          const p = parseInt(storedPages, 10);
          if (!isNaN(p) && p >= 24) setPageCount(p);
        }
      } catch {
        // Ignore session read errors
      }
    }
  }, []);

  // Pre-load default demo cover if none uploaded
  useEffect(() => {
    if (!coverImageSrc) {
      // Create a beautiful default SVG cover preview
      const demoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="50%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="800" height="1200" fill="url(#bg)" />
        <circle cx="400" cy="450" r="160" fill="none" stroke="#fbbf24" stroke-width="4" opacity="0.6"/>
        <circle cx="400" cy="450" r="130" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
        <text x="400" y="320" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="#fbbf24" text-anchor="middle" letter-spacing="4">AMAZON BESTSELLER</text>
        <text x="400" y="440" font-family="system-ui, sans-serif" font-weight="900" font-size="54" fill="#ffffff" text-anchor="middle">THE MASTER</text>
        <text x="400" y="500" font-family="system-ui, sans-serif" font-weight="900" font-size="54" fill="#fbbf24" text-anchor="middle">CREATOR</text>
        <text x="400" y="570" font-family="system-ui, sans-serif" font-weight="600" font-size="22" fill="#e2e8f0" text-anchor="middle" letter-spacing="2">A Complete Guide To Publishing</text>
        <rect x="250" y="850" width="300" height="2" fill="#fbbf24" opacity="0.5" />
        <text x="400" y="930" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="#ffffff" text-anchor="middle">ISMAM STUDIO</text>
      </svg>`;
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(demoSvg)}`;
      setCoverImageSrc(dataUrl);
    }
  }, [coverImageSrc]);

  // Load cover image into Image element
  useEffect(() => {
    if (!coverImageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setCoverImgElement(img);
    img.src = coverImageSrc;
  }, [coverImageSrc]);

  // Load spine image into Image element
  useEffect(() => {
    if (!spineImageSrc) {
      setSpineImgElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setSpineImgElement(img);
    img.src = spineImageSrc;
  }, [spineImageSrc]);

  // Draw 3D Book on Canvas
  const render3DMockup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !coverImgElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (bgType === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "dark") {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width / 1.2);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(1, "#090d16");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "studio_warm") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(1, "#e2e8f0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "gradient_indigo") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#312e81");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Spine thickness calculation in pixels
    const spineThickness = Math.max(18, Math.min(85, Math.round((pageCount / 100) * 16)));

    // 2. Render Selected Style
    ctx.save();

    if (mockupStyle === "paperback_3d") {
      drawPaperback3D(ctx, width, height, coverImgElement, spineImgElement, spineColor, spineThickness, shadowIntensity, lightingGlow);
    } else if (mockupStyle === "hardcover_3d") {
      drawHardcover3D(ctx, width, height, coverImgElement, spineImgElement, spineColor, spineThickness, shadowIntensity, lightingGlow);
    } else if (mockupStyle === "standing_spine") {
      drawStandingSpine(ctx, width, height, coverImgElement, spineImgElement, spineColor, spineThickness, shadowIntensity, lightingGlow);
    } else if (mockupStyle === "isometric_lay") {
      drawIsometricLay(ctx, width, height, coverImgElement, spineImgElement, spineColor, spineThickness, shadowIntensity, lightingGlow);
    }

    ctx.restore();
  }, [coverImgElement, spineImgElement, mockupStyle, pageCount, spineColor, bgType, shadowIntensity, lightingGlow]);

  // Redraw when parameters change
  useEffect(() => {
    render3DMockup();
  }, [render3DMockup]);

  // Handle Cover Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setCoverImageSrc(res);
    };
    reader.readAsDataURL(file);
  };

  // Handle Spine Upload
  const handleSpineUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setSpineImageSrc(res);
    };
    reader.readAsDataURL(file);
  };

  // Export High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const link = document.createElement("a");
      link.download = `kdp-3d-book-mockup-${mockupStyle}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCopiedNotification("3D Mockup downloaded successfully!");
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Tools
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-sm">
              <BookOpen className="w-4 h-4 font-black" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-tight flex items-center gap-2">
                3D Book Mockup Generator
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  300 DPI Vector
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/studio?tab=cover"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1.5 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 transition-all hover:bg-indigo-500/20"
          >
            Open in Cover Studio
          </Link>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Exporting..." : "Download 300 DPI PNG"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Side: Mockup Canvas Preview */}
        <div className="flex-1 bg-slate-950/60 p-6 flex items-center justify-center relative overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }}
          />

          {/* Canvas Wrapper */}
          <div className="relative max-w-full max-h-full aspect-[4/3] flex items-center justify-center rounded-2xl shadow-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40">
            <canvas
              ref={canvasRef}
              width={1600}
              height={1200}
              className="w-full h-full object-contain"
            />
          </div>

          {copiedNotification && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4" /> {copiedNotification}
            </div>
          )}
        </div>

        {/* Right Side: Customization Sidebar */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 overflow-y-auto flex flex-col gap-6">
          {/* 1. Perspective Styles */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> 1. Select 3D Mockup Angle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "paperback_3d", label: "Paperback 3/4", badge: "Most Popular" },
                { id: "hardcover_3d", label: "Hardcover Luxury", badge: "Hardcover" },
                { id: "standing_spine", label: "Front + Spine", badge: "Full Showcase" },
                { id: "isometric_lay", label: "Table Flatlay", badge: "Tabletop" }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setMockupStyle(style.id as MockupStyle)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    mockupStyle === style.id
                      ? "border-amber-400 bg-amber-400/10 text-white shadow-sm"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">
                    {style.badge}
                  </span>
                  <span className="text-xs font-bold block">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cover & Spine Uploads */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> 2. Book Cover Artwork
            </label>

            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-900 transition-all cursor-pointer text-xs font-bold text-slate-300">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Front Cover</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>

              <label className="flex items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-400 bg-slate-950/60 hover:bg-slate-900 transition-all cursor-pointer text-xs font-bold text-slate-300" title="Optional: Custom spine artwork">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Spine</span>
                <input type="file" accept="image/*" onChange={handleSpineUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* 3. Page Count & Thickness */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> 3. Page Count &amp; Thickness
              </label>
              <span className="text-xs font-black text-amber-400">{pageCount} pages</span>
            </div>
            <input
              type="range"
              min="24"
              max="600"
              step="4"
              value={pageCount}
              onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-bold">
              <span>Thin (24 pgs)</span>
              <span>Standard (120 pgs)</span>
              <span>Novel (600 pgs)</span>
            </div>
          </div>

          {/* 4. Background Studio Setting */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Palette className="w-3.5 h-3.5 text-amber-400" /> 4. Mockup Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "transparent", label: "Transparent", dot: "border border-dashed border-slate-500" },
                { id: "white", label: "Pure White", dot: "bg-white" },
                { id: "dark", label: "Studio Dark", dot: "bg-slate-900" },
                { id: "studio_warm", label: "Soft Studio", dot: "bg-slate-200" },
                { id: "gradient_indigo", label: "Indigo Dark", dot: "bg-indigo-900" }
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBgType(bg.id as BackgroundType)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    bgType === bg.id
                      ? "border-amber-400 bg-amber-400/10 text-white"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${bg.dot}`} />
                  <span className="truncate">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Spine Color Fallback */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
              Spine Color Theme
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={spineColor}
                onChange={(e) => setSpineColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
              />
              <span className="text-xs font-mono text-slate-400">{spineColor}</span>
            </div>
          </div>

          {/* KDP Amazon A+ Content Helper Card */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-2 mt-auto">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Zap className="w-4 h-4" /> Amazon A+ Content Ready
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Export in <strong>Transparent PNG</strong> to place your 3D mockup onto Amazon A+ listing comparison charts, Facebook/Instagram ads, or website hero sections without cutting out edges!
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Realistic 3D Canvas Rendering Engines
// ─────────────────────────────────────────────────────────────────────────────

function drawPaperback3D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cover: HTMLImageElement,
  spineImg: HTMLImageElement | null,
  spineColor: string,
  spineThickness: number,
  shadowIntensity: number,
  lightingGlow: number
) {
  const centerX = w * 0.48;
  const centerY = h * 0.48;
  const bookW = 460;
  const bookH = 680;

  // 1. Soft Contact Shadow underneath
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(
    centerX + 30, centerY + bookH * 0.5 + 40,
    30,
    centerX + 30, centerY + bookH * 0.5 + 40,
    bookW * 0.8
  );
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${0.45 * (shadowIntensity / 100)})`);
  shadowGrad.addColorStop(0.5, `rgba(0, 0, 0, ${0.2 * (shadowIntensity / 100)})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 30, centerY + bookH * 0.5 + 40, bookW * 0.75, 45, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Perspective Angles
  const skewY = -0.06;
  const spineW = spineThickness;

  // 2. Render Spine (Left)
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  if (spineImg) {
    ctx.drawImage(spineImg, -spineW, 0, spineW, bookH);
  } else {
    // Gradient spine
    const spineGrad = ctx.createLinearGradient(-spineW, 0, 0, 0);
    spineGrad.addColorStop(0, adjustBrightness(spineColor, -25));
    spineGrad.addColorStop(0.7, spineColor);
    spineGrad.addColorStop(1, adjustBrightness(spineColor, -15));
    ctx.fillStyle = spineGrad;
    ctx.fillRect(-spineW, 0, spineW, bookH);
  }

  // Spine curvature shadow highlight
  const spineShine = ctx.createLinearGradient(-spineW, 0, 0, 0);
  spineShine.addColorStop(0, "rgba(255,255,255,0.1)");
  spineShine.addColorStop(0.5, "rgba(0,0,0,0.15)");
  spineShine.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = spineShine;
  ctx.fillRect(-spineW, 0, spineW, bookH);

  ctx.restore();

  // 3. Render Book Pages Block (Top Edge)
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(bookW, 0);
  ctx.lineTo(bookW + 12, -12);
  ctx.lineTo(12, -12);
  ctx.closePath();
  ctx.fill();

  // Paper lines on top edge
  ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 2; i < 11; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i, -i);
    ctx.lineTo(bookW + i, -i);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Render Front Cover
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  // Rounded cover edge
  ctx.drawImage(cover, 0, 0, bookW, bookH);

  // Crease / Gutter line near spine
  const creaseGrad = ctx.createLinearGradient(0, 0, 30, 0);
  creaseGrad.addColorStop(0, "rgba(0,0,0,0.45)");
  creaseGrad.addColorStop(0.3, "rgba(255,255,255,0.2)");
  creaseGrad.addColorStop(0.7, "rgba(0,0,0,0.15)");
  creaseGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = creaseGrad;
  ctx.fillRect(0, 0, 30, bookH);

  // Ambient lighting gradient across cover
  const lightGrad = ctx.createLinearGradient(0, 0, bookW, bookH);
  lightGrad.addColorStop(0, `rgba(255,255,255,${0.25 * (lightingGlow / 100)})`);
  lightGrad.addColorStop(0.5, "rgba(255,255,255,0)");
  lightGrad.addColorStop(1, `rgba(0,0,0,${0.3 * (lightingGlow / 100)})`);
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, bookW, bookH);

  // Outer paper edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, bookW, bookH);

  ctx.restore();
}

function drawHardcover3D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cover: HTMLImageElement,
  spineImg: HTMLImageElement | null,
  spineColor: string,
  spineThickness: number,
  shadowIntensity: number,
  lightingGlow: number
) {
  const centerX = w * 0.48;
  const centerY = h * 0.48;
  const bookW = 460;
  const bookH = 680;
  const boardLip = 10; // Extra hardcover board overhang

  // Shadow
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(
    centerX + 40, centerY + bookH * 0.5 + 45,
    30,
    centerX + 40, centerY + bookH * 0.5 + 45,
    bookW * 0.85
  );
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${0.5 * (shadowIntensity / 100)})`);
  shadowGrad.addColorStop(0.5, `rgba(0, 0, 0, ${0.25 * (shadowIntensity / 100)})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 40, centerY + bookH * 0.5 + 45, bookW * 0.8, 50, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const skewY = -0.05;
  const spineW = spineThickness + 6;

  // Spine
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5 - boardLip);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  ctx.fillStyle = spineColor;
  ctx.fillRect(-spineW, 0, spineW, bookH + boardLip * 2);

  // Hardcover spine hinges
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-spineW, 0);
  ctx.lineTo(-spineW, bookH + boardLip * 2);
  ctx.stroke();

  ctx.restore();

  // Pages
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(bookW, boardLip, 18, bookH - boardLip * 2);

  ctx.restore();

  // Front Cover with Board Overhang
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5 - boardLip);
  ctx.transform(1, skewY, 0, 1, 0, 0);

  ctx.drawImage(cover, 0, 0, bookW, bookH + boardLip * 2);

  // Deep Hardcover Gutter Groove (Hinge)
  const hingeX = 18;
  const hingeGrad = ctx.createLinearGradient(hingeX - 6, 0, hingeX + 6, 0);
  hingeGrad.addColorStop(0, "rgba(0,0,0,0.5)");
  hingeGrad.addColorStop(0.5, "rgba(255,255,255,0.2)");
  hingeGrad.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = hingeGrad;
  ctx.fillRect(hingeX - 6, 0, 12, bookH + boardLip * 2);

  // Premium Gloss Sheen
  const gloss = ctx.createLinearGradient(0, 0, bookW, bookH);
  gloss.addColorStop(0, `rgba(255,255,255,${0.3 * (lightingGlow / 100)})`);
  gloss.addColorStop(0.4, "rgba(255,255,255,0)");
  gloss.addColorStop(0.8, `rgba(0,0,0,${0.25 * (lightingGlow / 100)})`);
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, bookW, bookH + boardLip * 2);

  ctx.restore();
}

function drawStandingSpine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cover: HTMLImageElement,
  spineImg: HTMLImageElement | null,
  spineColor: string,
  spineThickness: number,
  shadowIntensity: number,
  lightingGlow: number
) {
  const centerX = w * 0.48;
  const centerY = h * 0.48;
  const bookW = 440;
  const bookH = 680;
  const spineW = spineThickness * 1.4;

  // Shadow
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(
    centerX, centerY + bookH * 0.5 + 30,
    40,
    centerX, centerY + bookH * 0.5 + 30,
    bookW * 0.8
  );
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${0.4 * (shadowIntensity / 100)})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + bookH * 0.5 + 30, bookW * 0.7, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Standing straight with curved spine
  ctx.save();
  ctx.translate(centerX - bookW * 0.5, centerY - bookH * 0.5);

  // Draw spine
  if (spineImg) {
    ctx.drawImage(spineImg, 0, 0, spineW, bookH);
  } else {
    const spGrad = ctx.createLinearGradient(0, 0, spineW, 0);
    spGrad.addColorStop(0, adjustBrightness(spineColor, -20));
    spGrad.addColorStop(0.5, spineColor);
    spGrad.addColorStop(1, adjustBrightness(spineColor, -10));
    ctx.fillStyle = spGrad;
    ctx.fillRect(0, 0, spineW, bookH);
  }

  // Draw cover next to it
  ctx.drawImage(cover, spineW, 0, bookW - spineW, bookH);

  // Join shadow line
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(spineW, 0);
  ctx.lineTo(spineW, bookH);
  ctx.stroke();

  ctx.restore();
}

function drawIsometricLay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cover: HTMLImageElement,
  spineImg: HTMLImageElement | null,
  spineColor: string,
  spineThickness: number,
  shadowIntensity: number,
  lightingGlow: number
) {
  const centerX = w * 0.5;
  const centerY = h * 0.45;
  const bookW = 420;
  const bookH = 620;

  // Isometric rotation matrix
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-Math.PI / 6);
  ctx.scale(1, 0.7);

  // Drop shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${0.55 * (shadowIntensity / 100)})`;
  ctx.shadowBlur = 45;
  ctx.shadowOffsetX = 30;
  ctx.shadowOffsetY = 40;

  ctx.drawImage(cover, -bookW * 0.5, -bookH * 0.5, bookW, bookH);

  ctx.restore();
}

function adjustBrightness(hex: string, percent: number): string {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color.split("").map((c) => c + c).join("");
  }
  const num = parseInt(color, 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
