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
  Printer,
  Paintbrush,
  Eraser,
  PaintBucket,
  CheckSquare,
  Undo2,
  Redo2,
  Trash2,
  Pipette,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Upload,
  Save,
  FolderOpen,
  BookmarkCheck,
  Shapes,
  Circle,
  Square,
  Star,
  Heart,
  Flower2,
  Gem,
  Hexagon,
  Moon,
  Cloud,
  Sun,
  Droplet,
  MousePointer2,
  Keyboard,
  Minus,
  Pencil,
  FilePlus
} from "lucide-react";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import GenericStudioTour from "@/components/GenericStudioTour";
import { PRESETS, PresetItem, drawColoringPattern } from "@/lib/coloringBookPatterns";
import { checkPremiumStatus } from "@/app/actions";

// Matches drawWatermark's look in pdfExportService.ts (used by every other
// tool's PDF export) so free-tier output is consistently branded across the
// whole app, not just this one tool's own style.
function drawCanvasWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#8C8C8C";
  ctx.font = `bold ${Math.floor(w * 0.09)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.fillText("SAMPLE - KDPAGE", 0, 0);
  ctx.restore();
}

// 30 Curated Premium Colors Palette
const EXTENDED_PALETTE = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#10B981",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E", "#78350F", "#92400E", "#B45309",
  "#15803D", "#047857", "#0369A1", "#1D4ED8", "#4338CA", "#6B21A8",
  "#9D174D", "#FFFFFF", "#E2E8F0", "#94A3B8", "#475569", "#000000",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// Sobel Filter: Converts any uploaded color image into high-contrast line art
function convertImageToLineArt(img: HTMLImageElement, width: number, height: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  const srcData = ctx.getImageData(0, 0, width, height);
  const data = srcData.data;

  // 1. Grayscale
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  const outImage = ctx.createImageData(width, height);
  const outData = outImage.data;

  // 2. Sobel edge detection operator
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      const gx =
        -1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)];

      const gy =
        -1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)] +
        1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)];

      const mag = Math.sqrt(gx * gx + gy * gy);
      const isEdge = mag > 45;
      const outIdx = idx * 4;

      if (isEdge) {
        // Black outline ink
        outData[outIdx] = 15;
        outData[outIdx + 1] = 23;
        outData[outIdx + 2] = 42;
        outData[outIdx + 3] = 255;
      } else {
        // Transparent background
        outData[outIdx] = 255;
        outData[outIdx + 1] = 255;
        outData[outIdx + 2] = 255;
        outData[outIdx + 3] = 0;
      }
    }
  }
  return outImage;
}

// Vector Shape Path Generator for Stamp Tool
function drawShapePath(ctx: CanvasRenderingContext2D, shape: string, cx: number, cy: number, size: number) {
  const r = size / 2;
  ctx.beginPath();

  if (shape === "circle") {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === "rectangle") {
    ctx.rect(cx - r, cy - r, size, size);
  } else if (shape === "star") {
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.42;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === "heart") {
    ctx.moveTo(cx, cy + r * 0.7);
    ctx.bezierCurveTo(cx - r, cy, cx - r, cy - r, cx, cy - r * 0.3);
    ctx.bezierCurveTo(cx + r, cy - r, cx + r, cy, cx, cy + r * 0.7);
    ctx.closePath();
  } else if (shape === "flower") {
    const petals = 6;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const px = cx + (r * 0.55) * Math.cos(angle);
      const py = cy + (r * 0.55) * Math.sin(angle);
      ctx.moveTo(px + r * 0.35, py);
      ctx.arc(px, py, r * 0.35, 0, Math.PI * 2);
    }
    ctx.moveTo(cx + r * 0.25, cy);
    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.8, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.8, cy);
    ctx.closePath();
  } else if (shape === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === "moon") {
    ctx.arc(cx, cy, r, 0.5 * Math.PI, 1.5 * Math.PI, true);
    ctx.arcTo(cx + r * 0.5, cy, cx, cy + r, r * 0.8);
    ctx.closePath();
  } else if (shape === "cloud") {
    ctx.arc(cx - r * 0.4, cy + r * 0.1, r * 0.35, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(cx - r * 0.1, cy - r * 0.3, r * 0.45, Math.PI * 1.0, Math.PI * 1.85);
    ctx.arc(cx + r * 0.4, cy - r * 0.1, r * 0.35, Math.PI * 1.5, Math.PI * 0.2);
    ctx.arc(cx + r * 0.2, cy + r * 0.25, r * 0.3, Math.PI * 0.0, Math.PI * 0.6);
    ctx.closePath();
  } else if (shape === "sun") {
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = cx + r * 0.65 * Math.cos(angle);
      const y1 = cy + r * 0.65 * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
  } else if (shape === "teardrop") {
    ctx.moveTo(cx, cy - r);
    ctx.bezierCurveTo(cx + r, cy + r * 0.3, cx + r * 0.7, cy + r, cx, cy + r);
    ctx.bezierCurveTo(cx - r * 0.7, cy + r, cx - r, cy + r * 0.3, cx, cy - r);
    ctx.closePath();
  }
}

// Small static preview of a preset's pattern
function PresetThumbnail({ preset }: { preset: PresetItem }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawColoringPattern(ctx, canvas.width, canvas.height, {
      presetId: preset.id,
      complexity: Math.min(preset.defaultComplexity, 14),
      lineWidth: 2,
      isColorByNumber: false,
      isMidnightMode: false,
      frameStyle: "minimal",
      seed: 7,
    });
  }, [preset.id]);

  return (
    <canvas
      ref={ref}
      width={130}
      height={168}
      className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
    />
  );
}

// KDP-standard trim sizes (No Bleed + Bleed variants @ 300 DPI)
// No Bleed = exact trim size in inches × 300
// Bleed    = trim + 0.125" width / + 0.25" height × 300  (KDP bleed spec)
const TRIM_SIZES: {
  id: string;
  label: string;
  w: number;
  h: number;
  noBleed: { pxW: number; pxH: number };
  bleed:   { pxW: number; pxH: number };
  bestFor: string;
}[] = [
  {
    id: "8.5x11",
    label: '8.5" × 11" (Standard Portrait)',
    w: 8.5, h: 11,
    noBleed: { pxW: 2550, pxH: 3300 },
    bleed:   { pxW: 2588, pxH: 3375 },
    bestFor: "Adult & children coloring books — industry standard",
  },
  {
    id: "8.5x8.5",
    label: '8.5" × 8.5" (Square)',
    w: 8.5, h: 8.5,
    noBleed: { pxW: 2550, pxH: 2550 },
    bleed:   { pxW: 2588, pxH: 2625 },
    bestFor: "Square mandalas, patterns & young kids' books",
  },
  {
    id: "8x10",
    label: '8" × 10" (Portrait)',
    w: 8, h: 10,
    noBleed: { pxW: 2400, pxH: 3000 },
    bleed:   { pxW: 2438, pxH: 3075 },
    bestFor: "Slightly narrower portrait coloring books",
  },
  {
    id: "6x9",
    label: '6" × 9" (Pocket / Travel)',
    w: 6, h: 9,
    noBleed: { pxW: 1800, pxH: 2700 },
    bleed:   { pxW: 1838, pxH: 2775 },
    bestFor: "Travel or pocket-sized coloring books",
  },
];

export default function ColoringBookClient() {
  // Config state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePreset, setActivePreset] = useState<PresetItem>(() => {
    return PRESETS.find((p) => p.id === "citrus_slices") || PRESETS[1] || PRESETS[0];
  });
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [useBleed, setUseBleed] = useState(false);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [complexity, setComplexity] = useState<number>(12);
  const [isColorByNumber, setIsColorByNumber] = useState<boolean>(true);
  const [isMidnightMode, setIsMidnightMode] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<"ornamental" | "circle" | "minimal" | "none">("ornamental");
  const [seed, setSeed] = useState<number>(42);
  const [bookPagesCount, setBookPagesCount] = useState<number>(30);

  // Custom Image Upload State
  const [customLineArt, setCustomLineArt] = useState<ImageData | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);

  // Export States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // Interactive "Preview Coloring" canvas state
  const [isColoringMode, setIsColoringMode] = useState(true);
  const [activeTool, setActiveTool] = useState<"select" | "brush" | "eraser" | "fill" | "eyedropper" | "text" | "shape" | "line" | "freehandLine">("brush");
  const [eraserTarget, setEraserTarget] = useState<"color" | "lines" | "all">("color");
  const [brushColor, setBrushColor] = useState<string>(EXTENDED_PALETTE[0]);
  const [brushSize, setBrushSize] = useState<number>(18);
  // Each history entry snapshots BOTH canvas layers. Undo/redo used to only
  // capture colorCanvasRef, which was correct back when that was the only
  // paintable surface -- but the Straight Line and Freehand Path tools draw
  // directly onto canvasRef (the line-art layer), so a color-only snapshot
  // silently ignored anything drawn with either of them: undo couldn't remove
  // a line stroke, and it stayed on screen unchanged through unrelated
  // undo/redo steps.
  const [history, setHistory] = useState<{ stack: { line: string; color: string }[]; index: number }>({ stack: [], index: -1 });

  // Text Tool State
  const [textInput, setTextInput] = useState<string>("My Coloring Book");
  const [textSize, setTextSize] = useState<number>(36);
  const [fontFamily, setFontFamily] = useState<"sans-serif" | "serif" | "cursive">("sans-serif");
  const [textStyleMode, setTextStyleMode] = useState<"solidOutline" | "solid" | "outline">("solidOutline");

  // Shape Stamp Tool State (11 Pro Vector Shapes)
  const [selectedShape, setSelectedShape] = useState<"circle" | "rectangle" | "star" | "heart" | "flower" | "diamond" | "hexagon" | "moon" | "cloud" | "sun" | "teardrop">("circle");
  const [shapeScale, setShapeScale] = useState<number>(80);
  const [shapeMode, setShapeMode] = useState<"outline" | "filled">("outline");

  // Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    checkPremiumStatus()
      .then((res: any) => setIsPremium(!!res.isPremium))
      .catch(() => setIsPremium(false));

    // Restore previously active preset on page reload
    try {
      const savedPresetId = localStorage.getItem("kdpage_coloring_active_preset_id");
      if (savedPresetId) {
        const found = PRESETS.find((p) => p.id === savedPresetId);
        if (found) {
          setActivePreset(found);
          if (found.category) setSelectedCategory(found.category);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist active preset id to localStorage
  useEffect(() => {
    try {
      if (activePreset?.id) {
        localStorage.setItem("kdpage_coloring_active_preset_id", activePreset.id);
      }
    } catch {
      // ignore
    }
  }, [activePreset?.id]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+A, Ctrl+S, [, ])
  useEffect(() => {
    if (!isColoringMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleFillAll();
        showToast("Select All / Fill Background (Ctrl+A)");
      } else if (cmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProgress();
      } else if (e.key === "[") {
        setBrushSize((s) => Math.max(4, s - 4));
      } else if (e.key === "]") {
        setBrushSize((s) => Math.min(64, s + 4));
      } else if (e.key.toLowerCase() === "v") {
        setActiveTool("select");
      } else if (e.key.toLowerCase() === "b") {
        setActiveTool("brush");
      } else if (e.key.toLowerCase() === "e") {
        setActiveTool("eraser");
      } else if (e.key.toLowerCase() === "g") {
        setActiveTool("fill");
      } else if (e.key.toLowerCase() === "i") {
        setActiveTool("eyedropper");
      } else if (e.key.toLowerCase() === "t") {
        setActiveTool("text");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isColoringMode, history]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lineStartRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotLoadTokenRef = useRef(0);
  const pushHistoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Blank Page Creator Action
  const handleCreateBlankPage = () => {
    setActivePreset(PRESETS[0]); // blank_canvas
    setCustomLineArt(null);
    setCustomImageName(null);
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (lineCanvas) {
      const lCtx = lineCanvas.getContext("2d");
      if (lCtx) {
        lCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
      }
    }
    if (colorCanvas) {
      const cCtx = colorCanvas.getContext("2d");
      cCtx?.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    }
    setIsColoringMode(true);
    setEraserTarget("all");
    showToast("Created Blank Clean 300 DPI Canvas! Start drawing from scratch 🎨");
  };

  // Render procedure on Canvas
  const drawPattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (customLineArt) {
      // Paint uploaded custom line art
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!isColoringMode) {
        ctx.fillStyle = isMidnightMode ? "#0F172A" : "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.putImageData(customLineArt, 0, 0);
    } else {
      drawColoringPattern(ctx, canvas.width, canvas.height, {
        presetId: activePreset.id,
        complexity,
        lineWidth,
        isColorByNumber,
        isMidnightMode,
        frameStyle,
        seed,
        transparentBg: isColoringMode,
      });
    }
  }, [activePreset, complexity, frameStyle, isColorByNumber, isMidnightMode, lineWidth, seed, isColoringMode, customLineArt]);

  useEffect(() => {
    drawPattern();
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;

    // Check if there is an autosave or saved progress for this preset
    try {
      const autosave = localStorage.getItem(`kdpage_coloring_autosave_${activePreset.id}`) || localStorage.getItem(`kdpage_coloring_progress_${activePreset.id}`);
      if (autosave) {
        const parsed = JSON.parse(autosave);
        if (parsed && typeof parsed.line === "string" && typeof parsed.color === "string") {
          loadSnapshot(parsed);
          setHistory({ stack: [parsed], index: 0 });
          return;
        }
      }
    } catch {
      // fallback
    }

    const cctx = colorCanvas.getContext("2d");
    if (cctx) cctx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    setHistory({ stack: [{ line: lineCanvas.toDataURL(), color: colorCanvas.toDataURL() }], index: 0 });
  }, [drawPattern, activePreset.id]);

  // Custom File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    img.onload = () => {
      const lineArtData = convertImageToLineArt(img, 850, 1100);
      setCustomLineArt(lineArtData);
      setCustomImageName(file.name);
      showToast(`Uploaded ${file.name} as custom line art!`);
    };
    img.src = URL.createObjectURL(file);
  };

  const clearCustomUpload = () => {
    setCustomLineArt(null);
    setCustomImageName(null);
    showToast("Reverted to preset template.");
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const pushHistory = useCallback(() => {
    if (pushHistoryTimerRef.current) clearTimeout(pushHistoryTimerRef.current);
    pushHistoryTimerRef.current = setTimeout(() => {
      const lineCanvas = canvasRef.current;
      const colorCanvas = colorCanvasRef.current;
      if (!lineCanvas || !colorCanvas) return;
      const snapshot = { line: lineCanvas.toDataURL(), color: colorCanvas.toDataURL() };
      setHistory((prev) => {
        const trimmed = prev.stack.slice(0, prev.index + 1);
        const next = [...trimmed, snapshot].slice(-25);
        return { stack: next, index: next.length - 1 };
      });
      try {
        localStorage.setItem(`kdpage_coloring_autosave_${activePreset.id}`, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    }, 15);
  }, [activePreset.id]);

  const loadSnapshot = (snapshot: { line: string; color: string }) => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    const lineCtx = lineCanvas?.getContext("2d");
    const colorCtx = colorCanvas?.getContext("2d");
    if (!lineCanvas || !colorCanvas || !lineCtx || !colorCtx) return;
    const token = ++snapshotLoadTokenRef.current;

    const lineImg = new window.Image();
    lineImg.onload = () => {
      if (snapshotLoadTokenRef.current !== token) return;
      lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
      lineCtx.drawImage(lineImg, 0, 0);
    };
    lineImg.src = snapshot.line;

    const colorImg = new window.Image();
    colorImg.onload = () => {
      if (snapshotLoadTokenRef.current !== token) return;
      colorCtx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
      colorCtx.drawImage(colorImg, 0, 0);
    };
    colorImg.src = snapshot.color;
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      loadSnapshot(prev.stack[newIndex]);
      return { ...prev, index: newIndex };
    });
  };

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.index >= prev.stack.length - 1) return prev;
      const newIndex = prev.index + 1;
      loadSnapshot(prev.stack[newIndex]);
      return { ...prev, index: newIndex };
    });
  };

  const handleClearColors = () => {
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistory();
  };

  // Eyedropper Color Picker
  const sampleColorAt = (x: number, y: number) => {
    const colorCanvas = colorCanvasRef.current;
    const lineCanvas = canvasRef.current;
    if (!colorCanvas || !lineCanvas) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = colorCanvas.width;
    tempCanvas.height = colorCanvas.height;
    const tCtx = tempCanvas.getContext("2d")!;
    tCtx.drawImage(colorCanvas, 0, 0);
    tCtx.drawImage(lineCanvas, 0, 0);

    const pixel = tCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    if (pixel[3] > 0) {
      const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
      setBrushColor(hex);
      setActiveTool("brush");
      showToast(`Color picked: ${hex}`);
    }
  };

  // Text Tool Execution (Renders directly on top canvas layer so colors cannot overlap)
  const drawTextAt = (x: number, y: number) => {
    if (!textInput.trim()) return;
    const lineCanvas = canvasRef.current;
    const ctx = lineCanvas?.getContext("2d");
    if (!lineCanvas || !ctx) return;

    ctx.save();
    ctx.font = `bold ${textSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (textStyleMode === "outline") {
      // Hollow colorable line-art text
      ctx.strokeStyle = isMidnightMode ? "#FFFFFF" : "#0F172A";
      ctx.lineWidth = Math.max(2, Math.round(textSize / 14));
      ctx.lineJoin = "round";
      ctx.strokeText(textInput, x, y);
    } else if (textStyleMode === "solidOutline") {
      // Crisp filled text with high-contrast protective border so colors underneath never obscure text
      const outlineColor = isMidnightMode ? "#0F172A" : "#FFFFFF";
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = Math.max(4, Math.round(textSize / 7));
      ctx.lineJoin = "round";
      ctx.strokeText(textInput, x, y);
      ctx.fillStyle = brushColor;
      ctx.fillText(textInput, x, y);
    } else {
      // Solid filled text on top layer
      ctx.fillStyle = brushColor;
      ctx.fillText(textInput, x, y);
    }

    ctx.restore();

    pushHistory();
    showToast(`Added text "${textInput}" on top of canvas!`);
  };

  // Shape Stamp Placement Execution
  const drawShapeAt = (x: number, y: number) => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;

    if (shapeMode === "outline") {
      const ctx = lineCanvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.strokeStyle = isMidnightMode ? "#FFFFFF" : "#0F172A";
      ctx.lineWidth = Math.max(2, lineWidth);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawShapePath(ctx, selectedShape, x, y, shapeScale);
      ctx.stroke();
      ctx.restore();
      showToast(`Stamped ${selectedShape} outline line-art (${shapeScale}px scale)!`);
    } else {
      const ctx = colorCanvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = brushColor;
      drawShapePath(ctx, selectedShape, x, y, shapeScale);
      ctx.fill();
      ctx.restore();
      showToast(`Stamped filled ${selectedShape} (${shapeScale}px scale)!`);
    }

    pushHistory();
  };

  // Save Progress to localStorage — same two-layer snapshot as undo/redo, so
  // line-art drawn with the Line/Freehand Path tools survives a save/reload
  // instead of only the color layer being remembered.
  const handleSaveProgress = () => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;
    const data = JSON.stringify({ line: lineCanvas.toDataURL(), color: colorCanvas.toDataURL() });
    localStorage.setItem(`kdpage_coloring_progress_${activePreset.id}`, data);
    showToast("Coloring progress saved locally! 💾");
  };

  // Load Progress from localStorage
  const handleLoadProgress = () => {
    const saved = localStorage.getItem(`kdpage_coloring_progress_${activePreset.id}`);
    if (!saved) {
      alert("No saved progress found for this template.");
      return;
    }
    // Saves made before line-art tracking was added stored a bare color-layer
    // data URL string rather than JSON -- fall back to loading just that.
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.line === "string" && typeof parsed.color === "string") {
        loadSnapshot(parsed);
      } else {
        throw new Error("unrecognized saved-progress shape");
      }
    } catch {
      const colorCanvas = colorCanvasRef.current;
      const colorCtx = colorCanvas?.getContext("2d");
      if (colorCanvas && colorCtx) {
        const token = ++snapshotLoadTokenRef.current;
        const img = new window.Image();
        img.onload = () => {
          if (snapshotLoadTokenRef.current !== token) return;
          colorCtx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
          colorCtx.drawImage(img, 0, 0);
        };
        img.src = saved;
      }
    }
    showToast("Coloring progress loaded! 📂");
  };

  // High-Speed 32-Bit Scanline Flood Fill (<5ms execution)
  const floodFill = (startX: number, startY: number) => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;
    const w = colorCanvas.width;
    const h = colorCanvas.height;
    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;

    const lineCtx = lineCanvas.getContext("2d", { willReadFrequently: true });
    const colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true });
    if (!lineCtx || !colorCtx) return;

    const lineImage = lineCtx.getImageData(0, 0, w, h);
    const colorImage = colorCtx.getImageData(0, 0, w, h);

    const lineData32 = new Uint32Array(lineImage.data.buffer);
    const colorData32 = new Uint32Array(colorImage.data.buffer);

    // Wall check: check alpha channel in lineData (Alpha > 40 is a border wall)
    const isWall = (idx: number) => (lineData32[idx] >>> 24) > 40;

    const startIdx = sy * w + sx;
    if (isWall(startIdx)) return;

    const targetColor32 = colorData32[startIdx];
    const rgb = hexToRgb(brushColor);
    // Packed 32-bit color in Little Endian ABGR (Alpha: 0xFF)
    const fill32 = ((255 << 24) | (rgb.b << 16) | (rgb.g << 8) | rgb.r) >>> 0;

    if (targetColor32 === fill32) return;

    // Scanline flood fill algorithm with pre-allocated coordinate stack
    const maxStack = Math.max(w * 4, 16384);
    const stackX = new Int32Array(maxStack);
    const stackY = new Int32Array(maxStack);
    let stackPtr = 0;

    stackX[stackPtr] = sx;
    stackY[stackPtr] = sy;
    stackPtr++;

    while (stackPtr > 0) {
      stackPtr--;
      let x = stackX[stackPtr];
      const y = stackY[stackPtr];
      let idx = y * w + x;

      // Scan left to find the left boundary of the span
      while (x >= 0 && colorData32[idx] === targetColor32 && !isWall(idx)) {
        x--;
        idx--;
      }
      x++;
      idx++;

      let spanAbove = false;
      let spanBelow = false;

      // Scan right, filling pixels and pushing candidate spans above and below
      while (x < w && colorData32[idx] === targetColor32 && !isWall(idx)) {
        colorData32[idx] = fill32;

        if (y > 0) {
          const idxAbove = idx - w;
          const matchAbove = colorData32[idxAbove] === targetColor32 && !isWall(idxAbove);
          if (!spanAbove && matchAbove) {
            if (stackPtr < maxStack - 1) {
              stackX[stackPtr] = x;
              stackY[stackPtr] = y - 1;
              stackPtr++;
            }
            spanAbove = true;
          } else if (spanAbove && !matchAbove) {
            spanAbove = false;
          }
        }

        if (y < h - 1) {
          const idxBelow = idx + w;
          const matchBelow = colorData32[idxBelow] === targetColor32 && !isWall(idxBelow);
          if (!spanBelow && matchBelow) {
            if (stackPtr < maxStack - 1) {
              stackX[stackPtr] = x;
              stackY[stackPtr] = y + 1;
              stackPtr++;
            }
            spanBelow = true;
          } else if (spanBelow && !matchBelow) {
            spanBelow = false;
          }
        }

        x++;
        idx++;
      }
    }

    colorCtx.putImageData(colorImage, 0, 0);
  };

  const handleFillAll = () => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;
    const w = colorCanvas.width;
    const h = colorCanvas.height;
    const lineCtx = lineCanvas.getContext("2d", { willReadFrequently: true });
    const colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true });
    if (!lineCtx || !colorCtx) return;

    const lineImage = lineCtx.getImageData(0, 0, w, h);
    const colorImage = colorCtx.getImageData(0, 0, w, h);
    const lineData32 = new Uint32Array(lineImage.data.buffer);
    const colorData32 = new Uint32Array(colorImage.data.buffer);
    const rgb = hexToRgb(brushColor);
    const fill32 = ((255 << 24) | (rgb.b << 16) | (rgb.g << 8) | rgb.r) >>> 0;

    const len = colorData32.length;
    for (let i = 0; i < len; i++) {
      if ((lineData32[i] >>> 24) <= 40) {
        colorData32[i] = fill32;
      }
    }

    colorCtx.putImageData(colorImage, 0, 0);
    pushHistory();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isColoringMode) return;
    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);

    if (activeTool === "select") {
      showToast("Pointer Select Mode — Canvas Focused");
      return;
    }

    if (activeTool === "eyedropper") {
      sampleColorAt(pt.x, pt.y);
      return;
    }

    if (activeTool === "text") {
      drawTextAt(pt.x, pt.y);
      return;
    }

    if (activeTool === "shape") {
      drawShapeAt(pt.x, pt.y);
      return;
    }

    if (activeTool === "line") {
      isDrawingRef.current = true;
      lineStartRef.current = pt;
      return;
    }

    if (activeTool === "freehandLine") {
      isDrawingRef.current = true;
      lastPointRef.current = pt;
      return;
    }

    if (activeTool === "fill") {
      floodFill(pt.x, pt.y);
      pushHistory();
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = pt;

    if (activeTool === "eraser") {
      const eraseColor = eraserTarget === "color" || eraserTarget === "all";
      const eraseLines = eraserTarget === "lines" || eraserTarget === "all";

      if (eraseColor && colorCanvasRef.current) {
        const cCtx = colorCanvasRef.current.getContext("2d");
        if (cCtx) {
          cCtx.save();
          cCtx.globalCompositeOperation = "destination-out";
          cCtx.fillStyle = "#000000";
          cCtx.beginPath();
          cCtx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
          cCtx.fill();
          cCtx.restore();
        }
      }

      if (eraseLines && canvasRef.current) {
        const lCtx = canvasRef.current.getContext("2d");
        if (lCtx) {
          lCtx.save();
          lCtx.globalCompositeOperation = "destination-out";
          lCtx.fillStyle = "#000000";
          lCtx.beginPath();
          lCtx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
          lCtx.fill();
          lCtx.restore();
        }
      }
      return;
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isColoringMode || !isDrawingRef.current) return;
    const pt = getCanvasPoint(e);

    if (activeTool === "freehandLine") {
      const lineCanvas = canvasRef.current;
      const lCtx = lineCanvas?.getContext("2d");
      if (lCtx) {
        const last = lastPointRef.current ?? pt;
        lCtx.save();
        lCtx.strokeStyle = isMidnightMode ? "#FFFFFF" : "#0F172A";
        lCtx.lineWidth = Math.max(2, lineWidth);
        lCtx.lineCap = "round";
        lCtx.lineJoin = "round";
        lCtx.beginPath();
        lCtx.moveTo(last.x, last.y);
        lCtx.lineTo(pt.x, pt.y);
        lCtx.stroke();
        lCtx.restore();
        lastPointRef.current = pt;
      }
      return;
    }

    if (activeTool === "line") {
      return;
    }

    if (activeTool === "eraser") {
      const eraseColor = eraserTarget === "color" || eraserTarget === "all";
      const eraseLines = eraserTarget === "lines" || eraserTarget === "all";
      const last = lastPointRef.current ?? pt;

      if (eraseColor && colorCanvasRef.current) {
        const cCtx = colorCanvasRef.current.getContext("2d");
        if (cCtx) {
          cCtx.save();
          cCtx.globalCompositeOperation = "destination-out";
          cCtx.strokeStyle = "#000000";
          cCtx.lineWidth = brushSize;
          cCtx.lineCap = "round";
          cCtx.lineJoin = "round";
          cCtx.beginPath();
          cCtx.moveTo(last.x, last.y);
          cCtx.lineTo(pt.x, pt.y);
          cCtx.stroke();
          cCtx.restore();
        }
      }

      if (eraseLines && canvasRef.current) {
        const lCtx = canvasRef.current.getContext("2d");
        if (lCtx) {
          lCtx.save();
          lCtx.globalCompositeOperation = "destination-out";
          lCtx.strokeStyle = "#000000";
          lCtx.lineWidth = brushSize;
          lCtx.lineCap = "round";
          lCtx.lineJoin = "round";
          lCtx.beginPath();
          lCtx.moveTo(last.x, last.y);
          lCtx.lineTo(pt.x, pt.y);
          lCtx.stroke();
          lCtx.restore();
        }
      }

      lastPointRef.current = pt;
      return;
    }

    const canvas = colorCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const last = lastPointRef.current ?? pt;
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isColoringMode || !isDrawingRef.current) return;

    if (activeTool === "line" && lineStartRef.current && e) {
      const pt = getCanvasPoint(e);
      const lineCanvas = canvasRef.current;
      const lCtx = lineCanvas?.getContext("2d");
      if (lCtx && lineCanvas) {
        lCtx.save();
        lCtx.strokeStyle = isMidnightMode ? "#FFFFFF" : "#0F172A";
        lCtx.lineWidth = Math.max(2, lineWidth);
        lCtx.lineCap = "round";
        lCtx.lineJoin = "round";
        lCtx.beginPath();
        lCtx.moveTo(lineStartRef.current.x, lineStartRef.current.y);
        lCtx.lineTo(pt.x, pt.y);
        lCtx.stroke();
        lCtx.restore();
        showToast("Drawn straight vector line segment!");
      }
      lineStartRef.current = null;
    }

    if (colorCanvasRef.current) {
      const cCtx = colorCanvasRef.current.getContext("2d");
      if (cCtx) cCtx.globalCompositeOperation = "source-over";
    }
    if (canvasRef.current) {
      const lCtx = canvasRef.current.getContext("2d");
      if (lCtx) lCtx.globalCompositeOperation = "source-over";
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
    pushHistory();
  };

  const handleDownloadColoredPng = () => {
    const lineCanvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;

    const dims = useBleed ? trimSize.bleed : trimSize.noBleed;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = dims.pxW;
    exportCanvas.height = dims.pxH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = isMidnightMode ? "#0F172A" : "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(colorCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(lineCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    if (!isPremium) drawCanvasWatermark(ctx, exportCanvas.width, exportCanvas.height);

    const link = document.createElement("a");
    link.download = `KDPage_${activePreset.id}_${trimSize.id}_${useBleed ? "bleed" : "nobleed"}_colored.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  // Download Single 300 DPI PNG Page
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dims = useBleed ? trimSize.bleed : trimSize.noBleed;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = dims.pxW;
    exportCanvas.height = dims.pxH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(canvas, 0, 0, dims.pxW, dims.pxH);
    if (!isPremium) drawCanvasWatermark(ctx, dims.pxW, dims.pxH);

    const link = document.createElement("a");
    link.download = `KDPage_${activePreset.id}_${trimSize.id}_${useBleed ? "bleed" : "nobleed"}_300DPI.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  // Export Full 300 DPI KDP PDF Book Interior
  const handleExportPdfBook = async () => {
    setIsGeneratingPdf(true);
    setExportProgress(10);

    try {
      const [{ jsPDF }, { drawWatermark }] = await Promise.all([
        import("jspdf"),
        import("@/app/utils/pdfExportService"),
      ]);
      const pageW = useBleed ? trimSize.w + 0.125 : trimSize.w;
      const pageH = useBleed ? trimSize.h + 0.25  : trimSize.h;
      const doc = new jsPDF({
        unit: "in",
        format: [pageW, pageH],
        orientation: "portrait",
        compress: false, // KDP requires uncompressed PDFs for maximum print fidelity
      });

      // Embed KDP-compliant PDF metadata
      doc.setProperties({
        title: `KDPage Coloring Book — ${trimSize.label}`,
        subject: "300 DPI Print-Ready KDP Interior",
        author: "KDPage (kdpage.com)",
        creator: "KDPage Studio v2",
        keywords: `KDP, coloring book, ${trimSize.id}, ${useBleed ? "bleed" : "no-bleed"}, 300 DPI`,
      });

      const maxPages = isPremium ? 500 : 30;
      const totalP = Math.max(1, Math.min(maxPages, bookPagesCount));

      const dims = useBleed ? trimSize.bleed : trimSize.noBleed;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = dims.pxW;
      pageCanvas.height = dims.pxH;
      const pageCtx = pageCanvas.getContext("2d");

      // pageW/pageH already computed above

      for (let p = 0; p < totalP; p++) {
        if (p > 0) doc.addPage([pageW, pageH]);

        if (pageCtx) {
          if (customLineArt) {
            pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.putImageData(customLineArt, 0, 0);
          } else {
            drawColoringPattern(pageCtx, pageCanvas.width, pageCanvas.height, {
              presetId: activePreset.id,
              complexity,
              lineWidth,
              isColorByNumber,
              isMidnightMode,
              frameStyle,
              seed: seed + p * 137,
            });
          }
          const imgData = pageCanvas.toDataURL("image/png", 1.0);
          doc.addImage(imgData, "PNG", 0, 0, pageW, pageH);
        }

        // Page Number
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${p + 1}`, trimSize.w / 2, trimSize.h - 0.3, { align: "center" });

        if (!isPremium) drawWatermark(doc, trimSize.w, trimSize.h);

        setExportProgress(Math.floor(((p + 1) / totalP) * 100));
      }

      doc.save(`KDPage_Coloring_Book_${trimSize.id}_${useBleed ? "bleed" : "nobleed"}_${totalP}Pages.pdf`);
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
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

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
                Coloring Page &amp; Color-by-Number Interior Generator for KDP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GenericStudioTour tourKey="coloringBook" />
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
        
        {/* 🛡️ Compact Alert Banner */}
        <div className="mb-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-2.5 px-4 flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-bold text-emerald-950 dark:text-emerald-300">
              67+ Presets &amp; Custom Photo → Line Art Converter
            </span>
            <span className="hidden md:inline text-slate-500 dark:text-slate-400">
              — Mandalas, Stained Glass, Landscapes, Citrus, Flags &amp; Concept Cars
            </span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
            300 DPI Print-Ready
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ⚙️ Left Compact Control Panel (Cols: 4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Custom Upload & Template Selection */}
            <div data-tour="select-template" className="space-y-6">
              {/* Custom Upload Section */}
              <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> Custom Image → Line Art Converter
                  </label>
                  {customImageName && (
                    <button onClick={clearCustomUpload} className="text-[10px] text-red-500 hover:underline font-bold">
                      Reset to Presets
                    </button>
                  )}
                </div>

                <label className="block w-full cursor-pointer bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 hover:border-indigo-500 rounded-xl p-4 text-center transition">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                    {customImageName ? `Loaded: ${customImageName}` : "Click to upload PNG/JPG photo"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Auto Sobel filter converts any photo into clean 300 DPI coloring line art!
                  </span>
                </label>

                {/* ➕ Create Blank Canvas Button */}
                <button
                  onClick={handleCreateBlankPage}
                  className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black rounded-xl text-xs border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FilePlus className="w-4 h-4 text-indigo-500" /> Create Blank Page (Draw From Scratch)
                </button>
              </div>

              {/* Category Filter */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-indigo-500" /> Category Filter
                  </label>
                  <span className="text-xs font-bold text-slate-500">{filteredPresets.length} Presets</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["All", "Botanical & Floral", "Mandalas & Sacred Geometry", "Stained Glass & Architecture", "Landscapes & Celestial", "Food, Drinks & Kitchen", "Cozy Objects & Still Life", "Abstract & Art Deco", "Single Object Clip-Art", "European Flags", "North American Flags", "Concept Cars"].map((cat) => (
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setCustomLineArt(null);
                        setCustomImageName(null);
                        setActivePreset(preset);
                        setComplexity(preset.defaultComplexity);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        activePreset.id === preset.id && !customLineArt
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <PresetThumbnail preset={preset} />
                      <div className="text-[10.5px] font-black mt-1.5 leading-tight line-clamp-2">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization Settings */}
            <div data-tour="customization-controls" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
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

              {/* Trim Size + Bleed Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  KDP Book Trim Size
                </label>
                <select
                  value={trimSize.id}
                  onChange={(e) => {
                    const found = TRIM_SIZES.find((t) => t.id === e.target.value);
                    if (found) setTrimSize(found);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                >
                  {TRIM_SIZES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>

                {/* Bleed toggle */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">Full Bleed Export</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {useBleed
                        ? `${trimSize.bleed.pxW} × ${trimSize.bleed.pxH} px (bleed)`
                        : `${trimSize.noBleed.pxW} × ${trimSize.noBleed.pxH} px (safe)`}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useBleed}
                    onChange={(e) => setUseBleed(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* KDP margin hint */}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-0.5">
                  {useBleed
                    ? <>✅ Bleed: design extends to page edge. KDP trims 0.125&quot; / 0.25&quot; during print.</>
                    : <>📐 No Bleed: keep line art ≥ 0.375&quot; (3/8 in) from edges to avoid spine cut-off.</>}
                  {" "}<span className="font-semibold text-indigo-500">{trimSize.bestFor}</span>
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
            <div data-tour="export-actions" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              {!isPremium && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-semibold leading-relaxed">
                  Free accounts export with a light "SAMPLE - KDPAGE" watermark.{" "}
                  <Link href="/pricing" target="_blank" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200">
                    Upgrade to remove it →
                  </Link>
                </div>
              )}
              <button
                onClick={handleDownloadPng}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download 300 DPI PNG Page
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div>
                    <span>KDP Interior PDF Pages</span>
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-black ${isPremium ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>
                      {isPremium ? "Max 500" : "Free: max 30"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={isPremium ? 500 : 30}
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

          {/* 🖼️ Right Expanded Canvas Live Workspace Area (Cols: 8) */}
          <div data-tour="interactive-coloring" className="lg:col-span-8 bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center min-h-[720px]">

            <div className="w-full max-w-[760px] flex items-center justify-between gap-2 mb-3">
              <button
                onClick={() => setIsColoringMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition cursor-pointer ${
                  isColoringMode
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                {isColoringMode ? "Exit Coloring Preview" : "Try Coloring This Page"}
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                </button>
                <span className="px-1 text-[11px] font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                </button>
                {zoomLevel !== 1.0 && (
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition ml-1"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Drawing Toolbar */}
            {isColoringMode && (
              <div className="w-full max-w-[760px] mb-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg space-y-2.5">
                
                {/* Main Tool Selectors */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTool("select")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "select" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Pointer Select Tool (V)"
                    >
                      <MousePointer2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("brush")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "brush" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Brush Tool (B) - Use [ and ] to resize"
                    >
                      <Paintbrush className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("eraser")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "eraser" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Eraser Tool (E)"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("fill")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "fill" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Flood Fill Bucket (G)"
                    >
                      <PaintBucket className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("eyedropper")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "eyedropper" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Eyedropper Color Picker (I)"
                    >
                      <Pipette className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("text")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "text" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Text Tool (T)"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("shape")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "shape" ? "bg-white dark:bg-slate-700 shadow-sm text-amber-500" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Shape Stamp Tool (11 Pro Shapes)"
                    >
                      <Shapes className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("line")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "line" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Straight Vector Line Tool (Click & Drag)"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTool("freehandLine")}
                      className={`p-2 rounded-lg transition cursor-pointer ${activeTool === "freehandLine" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      title="Freehand Vector Path / Cursor Line Tool"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFillAll}
                      className="p-2 rounded-lg transition cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      title="Fill All / Select All Background Pixels (Ctrl+A)"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowShortcutsModal(!showShortcutsModal)}
                      className={`p-2 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${showShortcutsModal ? "bg-indigo-500 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      title="Keyboard Shortcuts Cheat Sheet"
                    >
                      <Keyboard className="w-4 h-4" /> Keys
                    </button>
                    <button
                      onClick={handleSaveProgress}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Save Coloring Progress (Ctrl+S)"
                    >
                      <Save className="w-4 h-4 text-emerald-500" /> Save
                    </button>
                    <button
                      onClick={handleLoadProgress}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Load Saved Coloring Progress"
                    >
                      <FolderOpen className="w-4 h-4 text-amber-500" /> Load
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts Cheat Sheet Panel */}
                {showShortcutsModal && (
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-700 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="font-black text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5" /> Studio Keyboard Shortcuts
                      </span>
                      <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">Ctrl+Z</kbd> Undo</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">Ctrl+Y</kbd> Redo</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">Ctrl+A</kbd> Fill All / Select</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">Ctrl+S</kbd> Save Progress</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">[</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">]</kbd> Brush Size</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">V</kbd> Pointer Select</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">B</kbd> Brush Tool</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">E</kbd> Eraser Tool</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-400 font-mono font-bold">G</kbd> Fill Bucket</div>
                    </div>
                  </div>
                )}

                {/* Eraser Tool Options Panel */}
                {activeTool === "eraser" && (
                  <div className="bg-rose-50/70 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/50 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Eraser className="w-3.5 h-3.5" /> Erase Target:
                      </span>
                      <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setEraserTarget("color")}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                            eraserTarget === "color"
                              ? "bg-rose-500 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                        >
                          🎨 Color Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setEraserTarget("lines")}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                            eraserTarget === "lines"
                              ? "bg-rose-500 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                        >
                          ✏️ Drawn Lines
                        </button>
                        <button
                          type="button"
                          onClick={() => setEraserTarget("all")}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                            eraserTarget === "all"
                              ? "bg-rose-500 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                        >
                          ✨ Everything
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Eraser Size</span>
                      <input
                        type="range"
                        min="6"
                        max="80"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 accent-rose-500 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">{brushSize}px</span>
                    </div>
                  </div>
                )}

                {/* Text Tool Options Panel */}
                {activeTool === "text" && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/40 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type text to place on canvas..."
                      className="flex-1 min-w-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold"
                    />
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold"
                    >
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif Classic</option>
                      <option value="cursive">Handwriting</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">Size</span>
                      <input
                        type="number"
                        min="12"
                        max="96"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs font-bold text-center"
                      />
                    </div>
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setTextStyleMode("solidOutline")}
                        className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                          textStyleMode === "solidOutline" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                        title="Solid Color with Crisp Outline (Protected against background overlap)"
                      >
                        ✨ Pop / Outline
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextStyleMode("solid")}
                        className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                          textStyleMode === "solid" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                        title="Solid Fill Text"
                      >
                        🎨 Solid Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextStyleMode("outline")}
                        className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                          textStyleMode === "outline" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                        title="Hollow Line-Art Letters (Colorable)"
                      >
                        ✏️ Hollow Outline
                      </button>
                    </div>
                  </div>
                )}

                {/* Shape Stamp Tool Options Panel */}
                {activeTool === "shape" && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40 flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                      <button
                        onClick={() => setSelectedShape("circle")}
                        className={`p-1.5 rounded transition ${selectedShape === "circle" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Circle Shape"
                      >
                        <Circle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("rectangle")}
                        className={`p-1.5 rounded transition ${selectedShape === "rectangle" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Square / Rectangle Shape"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("star")}
                        className={`p-1.5 rounded transition ${selectedShape === "star" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Star Shape"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("heart")}
                        className={`p-1.5 rounded transition ${selectedShape === "heart" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Heart Shape"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("flower")}
                        className={`p-1.5 rounded transition ${selectedShape === "flower" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Flower Shape"
                      >
                        <Flower2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("diamond")}
                        className={`p-1.5 rounded transition ${selectedShape === "diamond" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Diamond / Rhombus Shape"
                      >
                        <Gem className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("hexagon")}
                        className={`p-1.5 rounded transition ${selectedShape === "hexagon" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Hexagon Shape"
                      >
                        <Hexagon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("moon")}
                        className={`p-1.5 rounded transition ${selectedShape === "moon" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Crescent Moon Shape"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("cloud")}
                        className={`p-1.5 rounded transition ${selectedShape === "cloud" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Cloud Shape"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("sun")}
                        className={`p-1.5 rounded transition ${selectedShape === "sun" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Sun Burst Shape"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShape("teardrop")}
                        className={`p-1.5 rounded transition ${selectedShape === "teardrop" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}
                        title="Teardrop / Raindrop Shape"
                      >
                        <Droplet className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500">Scale</span>
                      <input
                        type="range"
                        min="20"
                        max="250"
                        value={shapeScale}
                        onChange={(e) => setShapeScale(Number(e.target.value))}
                        className="w-20 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono font-bold text-amber-600">{shapeScale}px</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <button
                        onClick={() => setShapeMode("outline")}
                        className={`px-2 py-1 rounded-lg border transition ${shapeMode === "outline" ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600"}`}
                      >
                        Line-Art (Colorable)
                      </button>
                      <button
                        onClick={() => setShapeMode("filled")}
                        className={`px-2 py-1 rounded-lg border transition ${shapeMode === "filled" ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600"}`}
                      >
                        Solid Color
                      </button>
                    </div>
                  </div>
                )}

                {/* 30-Color Extended Palette Grid */}
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center justify-between">
                    <span>30-Color Pro Palette</span>
                    <span className="font-mono text-indigo-500">{brushColor}</span>
                  </div>
                  <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
                    {EXTENDED_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        style={{ background: c }}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border transition cursor-pointer hover:scale-110 ${brushColor === c ? "ring-2 ring-indigo-600 scale-110 border-white" : "border-slate-300 dark:border-slate-700"}`}
                        title={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                      title="Custom Hex Picker"
                    />
                  </div>
                </div>

                {/* Secondary Controls (Brush Size, Undo/Redo, Download) */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Brush Size</span>
                    <input
                      type="range"
                      min="4"
                      max="48"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-20 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono font-bold text-indigo-500">{brushSize}px</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleUndo}
                      disabled={history.index <= 0}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Undo"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={history.index >= history.stack.length - 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Redo"
                    >
                      <Redo2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleClearColors}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
                      title="Clear all colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadColoredPng}
                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Colored PNG
                  </button>
                </div>

              </div>
            )}

            {/* Canvas Container with Zoom Transform */}
            <div
              className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden relative w-full max-w-[760px] transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                aspectRatio: `${(useBleed ? trimSize.bleed.pxW : trimSize.noBleed.pxW) / (useBleed ? trimSize.bleed.pxH : trimSize.noBleed.pxH)}`,
              }}
            >
              <canvas
                ref={colorCanvasRef}
                width={useBleed ? trimSize.bleed.pxW : trimSize.noBleed.pxW}
                height={useBleed ? trimSize.bleed.pxH : trimSize.noBleed.pxH}
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  touchAction: "none",
                  cursor: isColoringMode
                    ? activeTool === "fill" || activeTool === "eraser" || activeTool === "line" || activeTool === "freehandLine"
                      ? "crosshair"
                      : activeTool === "eyedropper"
                      ? "copy"
                      : activeTool === "text"
                      ? "text"
                      : "pointer"
                    : "default",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              <canvas
                ref={canvasRef}
                width={useBleed ? trimSize.bleed.pxW : trimSize.noBleed.pxW}
                height={useBleed ? trimSize.bleed.pxH : trimSize.noBleed.pxH}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            </div>

            {isColoringMode && (
              <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400 max-w-[760px]">
                🎨 In-browser interactive preview canvas -- exports clean line-art PDF/PNG for KDP printing.
              </p>
            )}

            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {customImageName ? (
                  <>Custom Uploaded Image: <strong className="text-indigo-600 dark:text-indigo-400">{customImageName}</strong></>
                ) : (
                  <>Preset: <strong className="text-slate-900 dark:text-slate-100">{activePreset.name}</strong> ({activePreset.category})</>
                )}
              </span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
