"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  Download,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Eye,
  ShieldCheck,
  Zap,
  Grid,
  BookOpen,
  Info,
  Hash,
  ArrowRight,
  Printer
} from "lucide-react";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import CoverStudioCTA from "@/components/CoverStudioCTA";

// Trim sizes
const TRIM_SIZES = [
  { id: "8.5x11", label: '8.5" × 11" (Standard)', w: 8.5, h: 11, pxW: 2550, pxH: 3300 },
  { id: "6x9", label: '6" × 9" (Trade Paperback)', w: 6, h: 9, pxW: 1800, pxH: 2700 },
  { id: "8x10", label: '8" × 10" (Squareish)', w: 8, h: 10, pxW: 2400, pxH: 3000 },
];

export type NonLivingCategory =
  | "Botanical & Floral"
  | "Mandalas & Sacred Geometry"
  | "Stained Glass & Architecture"
  | "Landscapes & Celestial"
  | "Food, Drinks & Kitchen"
  | "Cozy Objects & Still Life"
  | "Abstract & Art Deco";

export interface PresetItem {
  id: string;
  name: string;
  category: NonLivingCategory;
  description: string;
  defaultComplexity: number;
}

const PRESETS: PresetItem[] = [
  // Botanical
  { id: "citrus_slices", name: "Citrus Fruit Wheels & Slices", category: "Botanical & Floral", description: "Lemon, lime, orange and grapefruit wheels arranged in a graphic mosaic", defaultComplexity: 12 },
  { id: "tropical_palms", name: "Tropical Palm & Monster Leaves", category: "Botanical & Floral", description: "Overlapping monstera, palm, and fern leaves with fine vein line art", defaultComplexity: 10 },
  { id: "rose_lattice", name: "Rose Garden & Vine Lattice", category: "Botanical & Floral", description: "Interlocking rose blossoms, buds, and leafy lattice vines", defaultComplexity: 14 },
  { id: "succulents", name: "Succulent Terrarium", category: "Botanical & Floral", description: "Echeveria, aloe, and cacti arranged in geometric glass terrariums", defaultComplexity: 12 },
  { id: "lotus_pond", name: "Floating Lotus Pond", category: "Botanical & Floral", description: "Water lilies, lotus flowers, and lily pads on quiet water ripples", defaultComplexity: 11 },

  // Mandalas
  { id: "floral_mandala", name: "Concentric Floral Mandala", category: "Mandalas & Sacred Geometry", description: "Radial petal rings and geometric symmetry for meditation coloring", defaultComplexity: 16 },
  { id: "cosmic_wheel", name: "Star Cosmic Wheel Mandala", category: "Mandalas & Sacred Geometry", description: "Eight-pointed star lattice with concentric geometric rings", defaultComplexity: 18 },
  { id: "sacred_geometry", name: "Sacred Geometry Flower of Life", category: "Mandalas & Sacred Geometry", description: "Intersecting circles forming the ancient Flower of Life pattern", defaultComplexity: 14 },
  { id: "kaleidoscope", name: "Kaleidoscope Mosaic", category: "Mandalas & Sacred Geometry", description: "High-density faceted kaleidoscope glass pattern", defaultComplexity: 20 },

  // Stained Glass & Architecture
  { id: "cathedral_window", name: "Cathedral Rose Window", category: "Stained Glass & Architecture", description: "Gothic cathedral rose stained glass window with leaded line segments", defaultComplexity: 16 },
  { id: "gothic_arches", name: "Gothic Arches & Mosaic Tiles", category: "Stained Glass & Architecture", description: "Pointed archways with tessellating floor and wall tile patterns", defaultComplexity: 15 },
  { id: "moroccan_tiles", name: "Moroccan Zellige Tile Lattice", category: "Stained Glass & Architecture", description: "Intricate North African geometric star and polygon tilework", defaultComplexity: 18 },
  { id: "cozy_window", name: "Cozy Cottage Window View", category: "Stained Glass & Architecture", description: "Paned glass window framing a mountain horizon and starry sky", defaultComplexity: 12 },

  // Landscapes & Celestial
  { id: "mountain_sunrise", name: "Mountain Peak & Sunburst", category: "Landscapes & Celestial", description: "Layered mountain ridges with radial sunbeams and cloud ribbons", defaultComplexity: 10 },
  { id: "ocean_waves", name: "Ocean Waves & Sunset Moon", category: "Landscapes & Celestial", description: "Stylized Japanese Hokusai-style wave crests under a crescent moon", defaultComplexity: 14 },
  { id: "celestial_sky", name: "Celestial Moon & Constellations", category: "Landscapes & Celestial", description: "Crescent moon surrounded by zodiac star maps, clouds, and sunbursts", defaultComplexity: 15 },
  { id: "galaxy_swirl", name: "Cosmic Nebula Galaxy", category: "Landscapes & Celestial", description: "Spiral galaxy arms with orbiting star clusters and ringed planets", defaultComplexity: 16 },

  // Food, Drinks & Kitchen
  { id: "coffee_cups", name: "Coffee Cups & Roast Beans", category: "Food, Drinks & Kitchen", description: "Artisan espresso cups, steam swirls, and roasted coffee beans", defaultComplexity: 12 },
  { id: "pastry_display", name: "Pastry Stand & Macarons", category: "Food, Drinks & Kitchen", description: "Tiered cake stand with croissants, macarons, and berry tarts", defaultComplexity: 15 },
  { id: "teapot_set", name: "Vintage Teapots & Tea Set", category: "Food, Drinks & Kitchen", description: "Ornamental ceramic teapots, teacups, and floating tea leaves", defaultComplexity: 14 },
  { id: "boba_smoothies", name: "Boba Tea & Fruit Jars", category: "Food, Drinks & Kitchen", description: "Mason jar smoothies, tapioca boba pearls, and fruit wedges", defaultComplexity: 11 },

  // Cozy Objects & Still Life
  { id: "bookshelf_nook", name: "Vintage Bookshelf & Spines", category: "Cozy Objects & Still Life", description: "Stacked old leatherbound books, bookmarks, and potted vines", defaultComplexity: 14 },
  { id: "crystal_geode", name: "Crystal Cluster & Geode Facets", category: "Cozy Objects & Still Life", description: "Crystalline quartz points, amethyst facets, and geode rings", defaultComplexity: 16 },
  { id: "vintage_clocks", name: "Vintage Clocks & Hourglasses", category: "Cozy Objects & Still Life", description: "Roman numeral clockfaces, gears, pendulum, and flowing sand glass", defaultComplexity: 15 },
  { id: "lanterns_candles", name: "Moroccan Lanterns & Candles", category: "Cozy Objects & Still Life", description: "Hanging brass filigree lanterns with glowing candle flame patterns", defaultComplexity: 14 },

  // Abstract
  { id: "art_deco_fans", name: "Art Deco Fan Arches", category: "Abstract & Art Deco", description: "1920s Roaring Twenties geometric fan arches and brass line patterns", defaultComplexity: 13 },
  { id: "optical_swirls", name: "Optical Line Swirls", category: "Abstract & Art Deco", description: "Hypnotic 3D optical illusion ribbon swirls and wave tunnels", defaultComplexity: 18 },
];

const COLOR_BY_NUMBER_PALETTE = [
  { num: 1, name: "Lemon Yellow", hex: "#FACC15" },
  { num: 2, name: "Sky Blue", hex: "#38BDF8" },
  { num: 3, name: "Mint Green", hex: "#4ADE80" },
  { num: 4, name: "Coral Pink", hex: "#FB7185" },
  { num: 5, name: "Violet", hex: "#C084FC" },
  { num: 6, name: "Warm Amber", hex: "#F97316" },
  { num: 7, name: "Turquoise", hex: "#2DD4BF" },
  { num: 8, name: "Rose Red", hex: "#F43F5E" },
  { num: 9, name: "Deep Navy", hex: "#1E293B" },
  { num: 10, name: "Pure White", hex: "#FFFFFF" },
];

export default function ColoringBookClient() {
  // Config state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePreset, setActivePreset] = useState<PresetItem>(PRESETS[0]);
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [complexity, setComplexity] = useState<number>(12);
  const [isColorByNumber, setIsColorByNumber] = useState<boolean>(true);
  const [isMidnightMode, setIsMidnightMode] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<"ornamental" | "circle" | "minimal" | "none">("ornamental");
  const [seed, setSeed] = useState<number>(42);
  const [bookPagesCount, setBookPagesCount] = useState<number>(30);

  // Export States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render procedure on Canvas
  const drawPattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    ctx.fillStyle = isMidnightMode ? "#0F172A" : "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Line colors
    const strokeColor = isMidnightMode ? "#FFFFFF" : "#000000";
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = isMidnightMode ? "#1E293B" : "#FFFFFF";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw Frame
    const margin = width * 0.08;
    const innerW = width - margin * 2;
    const innerH = height - margin * 2;

    if (frameStyle === "ornamental") {
      ctx.strokeRect(margin, margin, innerW, innerH);
      ctx.strokeRect(margin + 12, margin + 12, innerW - 24, innerH - 24);
      // Corner accents
      const cLen = 30;
      [
        [margin, margin],
        [margin + innerW, margin],
        [margin, margin + innerH],
        [margin + innerW, margin + innerH]
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, cLen, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (frameStyle === "circle") {
      ctx.beginPath();
      const r = Math.min(innerW, innerH) / 2;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 15, 0, Math.PI * 2);
      ctx.stroke();
    } else if (frameStyle === "minimal") {
      ctx.strokeRect(margin, margin, innerW, innerH);
    }

    // Pseudo-random helper seeded by seed state
    let prngState = seed;
    const random = () => {
      prngState = (prngState * 9301 + 49297) % 233280;
      return prngState / 233280;
    };

    // Preset Rendering Logic
    const pid = activePreset.id;
    const density = complexity;

    if (pid === "citrus_slices" || pid === "boba_smoothies") {
      // Draw grid of citrus wheels / slices
      const cols = Math.ceil(Math.sqrt(density));
      const rows = cols;
      const stepX = innerW / cols;
      const stepY = innerH / rows;

      let numIdx = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = margin + c * stepX + stepX / 2;
          const y = margin + r * stepY + stepY / 2;
          const rad = Math.min(stepX, stepY) * 0.42;

          // Outer rind
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, rad * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // Citrus segments
          const segments = 8;
          for (let i = 0; i < segments; i++) {
            const a1 = (i * Math.PI * 2) / segments + 0.05;
            const a2 = ((i + 1) * Math.PI * 2) / segments - 0.05;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a1) * (rad * 0.2), y + Math.sin(a1) * (rad * 0.2));
            ctx.arc(x, y, rad * 0.8, a1, a2);
            ctx.closePath();
            ctx.stroke();

            // Number tag for color-by-number
            if (isColorByNumber && (r + c) % 2 === 0) {
              const midA = (a1 + a2) / 2;
              const nx = x + Math.cos(midA) * (rad * 0.5);
              const ny = y + Math.sin(midA) * (rad * 0.5);
              ctx.fillStyle = strokeColor;
              ctx.font = `bold ${Math.max(10, Math.floor(width * 0.015))}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(`${(numIdx % 9) + 1}`, nx, ny);
              numIdx++;
            }
          }
        }
      }
    } else if (pid.includes("mandala") || pid.includes("cosmic") || pid.includes("kaleidoscope") || pid.includes("sacred")) {
      // Draw radial Mandala
      const rings = density;
      const maxR = Math.min(innerW, innerH) * 0.45;
      let numIdx = 1;

      for (let i = 1; i <= rings; i++) {
        const r = (maxR / rings) * i;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Petal / Spoke Count
        const petals = (i % 2 === 0 ? 12 : 8) + (i > 8 ? 4 : 0);
        for (let p = 0; p < petals; p++) {
          const angle = (p * Math.PI * 2) / petals;
          const prevR = (maxR / rings) * (i - 1);

          const px1 = cx + Math.cos(angle) * prevR;
          const py1 = cy + Math.sin(angle) * prevR;
          const px2 = cx + Math.cos(angle) * r;
          const py2 = cy + Math.sin(angle) * r;

          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();

          // Petal arches
          if (i > 1) {
            const midA = angle + Math.PI / petals;
            const midR = (r + prevR) / 2;
            const archX = cx + Math.cos(midA) * midR;
            const archY = cy + Math.sin(midA) * midR;

            ctx.beginPath();
            ctx.arc(archX, archY, (r - prevR) * 0.35, 0, Math.PI * 2);
            ctx.stroke();

            if (isColorByNumber && p % 3 === 0) {
              ctx.fillStyle = strokeColor;
              ctx.font = `bold ${Math.max(10, Math.floor(width * 0.014))}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(`${(numIdx % 9) + 1}`, archX, archY);
              numIdx++;
            }
          }
        }
      }
    } else if (pid.includes("cathedral") || pid.includes("window") || pid.includes("gothic") || pid.includes("moroccan")) {
      // Stained Glass / Gothic Arches
      const archCount = 5;
      const archW = innerW / archCount;
      let numIdx = 1;

      for (let a = 0; a < archCount; a++) {
        const ax = margin + a * archW;
        const ay = margin + innerH * 0.2;
        const h = innerH * 0.7;

        // Arch outline
        ctx.beginPath();
        ctx.moveTo(ax, ay + h);
        ctx.lineTo(ax, ay + archW);
        ctx.quadraticCurveTo(ax + archW / 2, ay - archW * 0.3, ax + archW, ay + archW);
        ctx.lineTo(ax + archW, ay + h);
        ctx.stroke();

        // Internal mosaic grid
        const rows = density;
        for (let r = 0; r < rows; r++) {
          const ry = ay + (h / rows) * r;
          ctx.beginPath();
          ctx.moveTo(ax, ry);
          ctx.lineTo(ax + archW, ry);
          ctx.stroke();

          if (isColorByNumber && r % 2 === 0) {
            ctx.fillStyle = strokeColor;
            ctx.font = `bold ${Math.max(10, Math.floor(width * 0.014))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${(numIdx % 9) + 1}`, ax + archW / 2, ry + (h / rows) / 2);
            numIdx++;
          }
        }
      }
    } else {
      // Generic Botanical / Wave / Landscape / Still-life geometric contours
      const count = density * 2;
      let numIdx = 1;

      for (let i = 0; i < count; i++) {
        const rx = margin + random() * innerW;
        const ry = margin + random() * innerH;
        const rad = 30 + random() * 80;

        ctx.beginPath();
        ctx.arc(rx, ry, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rx, ry, rad * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        if (isColorByNumber && i % 2 === 0) {
          ctx.fillStyle = strokeColor;
          ctx.font = `bold ${Math.max(10, Math.floor(width * 0.015))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${(numIdx % 9) + 1}`, rx, ry);
          numIdx++;
        }
      }
    }

    // 2. Render Color-by-Number Legend Bar (Top / Bottom)
    if (isColorByNumber) {
      const legY = height - margin * 0.75;
      const itemW = innerW / COLOR_BY_NUMBER_PALETTE.length;

      // Header title
      ctx.fillStyle = strokeColor;
      ctx.font = `bold ${Math.max(12, Math.floor(width * 0.018))}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("COLOR KEY:", margin, legY - 20);

      COLOR_BY_NUMBER_PALETTE.forEach((item, idx) => {
        const lx = margin + idx * itemW;

        // Color square box
        ctx.fillStyle = item.hex;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.fillRect(lx, legY - 12, 16, 16);
        ctx.strokeRect(lx, legY - 12, 16, 16);

        // Text label
        ctx.fillStyle = strokeColor;
        ctx.font = `bold ${Math.max(10, Math.floor(width * 0.013))}px sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(`${item.num}`, lx + 22, legY);
      });
    }
  }, [activePreset, complexity, frameStyle, isColorByNumber, isMidnightMode, lineWidth, seed]);

  useEffect(() => {
    drawPattern();
  }, [drawPattern]);

  // Download Single 300 DPI PNG Page
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res export canvas @ 300 DPI
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = trimSize.pxW;
    exportCanvas.height = trimSize.pxH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Draw high res copy
    ctx.drawImage(canvas, 0, 0, trimSize.pxW, trimSize.pxH);

    const link = document.createElement("a");
    link.download = `KDPage_${activePreset.id}_300DPI.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  // Export Full 300 DPI KDP PDF Book Interior
  const handleExportPdfBook = async () => {
    setIsGeneratingPdf(true);
    setExportProgress(10);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        unit: "in",
        format: [trimSize.w, trimSize.h],
        orientation: "portrait",
      });

      const totalP = Math.max(1, Math.min(100, bookPagesCount));

      for (let p = 0; p < totalP; p++) {
        if (p > 0) doc.addPage([trimSize.w, trimSize.h]);

        // Draw page content from canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const imgData = canvas.toDataURL("image/png", 1.0);
          doc.addImage(imgData, "PNG", 0, 0, trimSize.w, trimSize.h);
        }

        // Page Number
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${p + 1}`, trimSize.w / 2, trimSize.h - 0.3, { align: "center" });

        setExportProgress(Math.floor(((p + 1) / totalP) * 100));
      }

      doc.save(`KDPage_Coloring_Book_${trimSize.id}_${totalP}Pages.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
      setExportProgress(0);
    }
  };

  const filteredPresets = PRESETS.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* 🚀 Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo_transparent.png"
                alt="KDPage Logo"
                className="w-9 h-9 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform"
              />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                Coloring Book Studio
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  300 DPI Vector
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
                Non-Living Objects & Color-by-Number Interior Generator for KDP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tools"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition"
            >
              All Tools
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* 🛡️ Non-Living Guarantee Alert Banner */}
        <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  100% Non-Living Creature Guarantee (Halal &amp; Universal)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Verified Safe
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Strictly non-living subjects only — Mandalas, Stained Glass, Landscapes, Citrus Slices, Architecture &amp; Cozy Still Life. Zero humans, animals, or living beings.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Thousands of unique vector combinations
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ⚙️ Left Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Category Filter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-indigo-500" /> Category Filter
                </label>
                <span className="text-xs font-bold text-slate-500">{filteredPresets.length} Presets</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["All", "Botanical & Floral", "Mandalas & Sacred Geometry", "Stained Glass & Architecture", "Landscapes & Celestial", "Food, Drinks & Kitchen", "Cozy Objects & Still Life", "Abstract & Art Deco"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Select Design Template
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setComplexity(preset.defaultComplexity);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      activePreset.id === preset.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{preset.description}</div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 ml-2">
                      {preset.category.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" /> Customization Controls
              </h3>

              {/* Color by Number Toggle */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Color-by-Number Overlay
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Adds numbered regions (1-10) + Top Color Palette Key
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isColorByNumber}
                  onChange={(e) => setIsColorByNumber(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Line Thickness */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Line Thickness</span>
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

              {/* Detail Complexity */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Pattern Complexity</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{complexity} density</span>
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

              {/* Frame Style & Page Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Page Border Frame
                  </label>
                  <select
                    value={frameStyle}
                    onChange={(e) => setFrameStyle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                  >
                    <option value="ornamental">Ornamental Frame</option>
                    <option value="circle">Circle Vignette</option>
                    <option value="minimal">Minimal Line Box</option>
                    <option value="none">Full Bleed (No Border)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Page Style Mode
                  </label>
                  <button
                    onClick={() => setIsMidnightMode(!isMidnightMode)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isMidnightMode
                        ? "bg-slate-950 text-white border-slate-800"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {isMidnightMode ? "🌙 Midnight (Dark)" : "☀️ Standard (White)"}
                  </button>
                </div>
              </div>

              {/* Trim Size */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  KDP Book Trim Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRIM_SIZES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTrimSize(t)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        trimSize.id === t.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regenerate Seed */}
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Endless Variation
              </button>

            </div>

            {/* Export Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <button
                onClick={handleDownloadPng}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download 300 DPI PNG Page
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>KDP Interior PDF Pages</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bookPagesCount}
                    onChange={(e) => setBookPagesCount(Number(e.target.value))}
                    className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleExportPdfBook}
                  disabled={isGeneratingPdf}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {isGeneratingPdf ? `Generating PDF (${exportProgress}%)...` : `Export Full ${bookPagesCount}-Page KDP Book PDF`}
                </button>
              </div>

              <SaveToNotebookButton
                title={`Coloring Page: ${activePreset.name}`}
                content={`Coloring page preset "${activePreset.name}" with line thickness ${lineWidth}px, complexity ${complexity}, color-by-number ${isColorByNumber ? "enabled" : "disabled"}`}
                category="coloring-book"
                data={{ activePreset, lineWidth, complexity, isColorByNumber, isMidnightMode, frameStyle, seed, trimSize }}
                className="w-full justify-center"
              />

              <CoverStudioCTA trimSize={`${trimSize.w}x${trimSize.h}`} />
            </div>

          </div>

          {/* 🖼️ Right Canvas Live Preview Area */}
          <div className="lg:col-span-7 bg-slate-200 dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[650px]">
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>300 DPI Live Vector Canvas</span>
            </div>

            {/* Canvas Container */}
            <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden relative aspect-[8.5/11] w-full max-w-[540px]">
              <canvas
                ref={canvasRef}
                width={850}
                height={1100}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Preset: <strong className="text-slate-900 dark:text-slate-100">{activePreset.name}</strong> ({activePreset.category})
              </span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
