"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getNotebookEntryData } from "@/app/actions";
import { 
  Palette, Download, Printer, FileText, Check, 
  Layers, CheckCircle2
} from "lucide-react";

export type PatternName =
  | "Polka Dots"
  | "Diagonal Stripes"
  | "Horizontal Stripes"
  | "Vertical Pinstripes"
  | "Grid"
  | "Dot Grid"
  | "Checkerboard"
  | "Gingham Plaid"
  | "Chevron"
  | "Herringbone"
  | "Waves"
  | "Japanese Scales"
  | "Crosshatch"
  | "Diamonds"
  | "Moroccan Trellis"
  | "Honeycomb"
  | "Plus Signs"
  | "Triangles"
  | "Isometric Cubes"
  | "Stars"
  | "Hearts"
  | "Lined Notebook";

const PATTERNS: { name: PatternName; category: "Geometric" | "Lines & Grids" | "Organic & Decorative" | "Journals" }[] = [
  { name: "Polka Dots", category: "Geometric" },
  { name: "Checkerboard", category: "Geometric" },
  { name: "Diamonds", category: "Geometric" },
  { name: "Triangles", category: "Geometric" },
  { name: "Honeycomb", category: "Geometric" },
  { name: "Isometric Cubes", category: "Geometric" },
  { name: "Grid", category: "Lines & Grids" },
  { name: "Dot Grid", category: "Lines & Grids" },
  { name: "Horizontal Stripes", category: "Lines & Grids" },
  { name: "Vertical Pinstripes", category: "Lines & Grids" },
  { name: "Diagonal Stripes", category: "Lines & Grids" },
  { name: "Chevron", category: "Lines & Grids" },
  { name: "Herringbone", category: "Lines & Grids" },
  { name: "Crosshatch", category: "Lines & Grids" },
  { name: "Gingham Plaid", category: "Lines & Grids" },
  { name: "Lined Notebook", category: "Journals" },
  { name: "Waves", category: "Organic & Decorative" },
  { name: "Japanese Scales", category: "Organic & Decorative" },
  { name: "Moroccan Trellis", category: "Organic & Decorative" },
  { name: "Plus Signs", category: "Organic & Decorative" },
  { name: "Stars", category: "Organic & Decorative" },
  { name: "Hearts", category: "Organic & Decorative" },
];

const COLOR_PALETTES = [
  { name: "Warm Linen", fg: "#c7b9a2", bg: "#faf7f0" },
  { name: "Midnight Gold", fg: "#eab308", bg: "#0f172a" },
  { name: "Vintage Botanical", fg: "#3f6212", bg: "#f7fee7" },
  { name: "Rose & Blush", fg: "#be185d", bg: "#fff1f2" },
  { name: "Nordic Slate", fg: "#475569", bg: "#f8fafc" },
  { name: "Ocean Indigo", fg: "#38bdf8", bg: "#0c4a6e" },
  { name: "Terracotta Earth", fg: "#9a3412", bg: "#fff7ed" },
  { name: "Classic Monochrome", fg: "#1e293b", bg: "#ffffff" },
];

const EXPORTS = [
  { label: '8.5" × 11" US Letter (300 DPI)', w: 2550, h: 3300, widthIn: 8.5, heightIn: 11, desc: "Standard KDP Workbook / Journal" },
  { label: '6" × 9" Trade Paperback (300 DPI)', w: 1800, h: 2700, widthIn: 6.0, heightIn: 9.0, desc: "Most Popular Amazon KDP Novel / Planner" },
  { label: '8.25" × 11" Children\'s Book (300 DPI)', w: 2475, h: 3300, widthIn: 8.25, heightIn: 11, desc: "Activity & Coloring Books" },
  { label: '7" × 10" Executive Journal (300 DPI)', w: 2100, h: 3000, widthIn: 7.0, heightIn: 10.0, desc: "Medium Content Logs & Planners" },
  { label: '5.5" × 8.5" Pocket Diary (300 DPI)', w: 1650, h: 2550, widthIn: 5.5, heightIn: 8.5, desc: "Compact Pocket Notebooks" },
  { label: "Seamless Tile Only (PNG & SVG)", w: 0, h: 0, widthIn: 0, heightIn: 0, desc: "Repeats infinitely in Photoshop, Canva & Illustrator" },
  { label: "Square 2048 × 2048 (Digital Asset)", w: 2048, h: 2048, widthIn: 6.82, heightIn: 6.82, desc: "Etsy / Gumroad Digital Paper Pack" },
];

/**
 * Mathematically seamless tile generator
 */
function drawTile(tile: HTMLCanvasElement, name: PatternName, S: number, fg: string, bg: string, lw: number) {
  tile.width = S;
  tile.height = S;
  const ctx = tile.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = fg;
  ctx.strokeStyle = fg;
  ctx.lineWidth = Math.max(1, lw);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const dot = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fill();
  };

  const diamond = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
  };

  const plus = (x: number, y: number, r: number) => {
    const a = Math.max(1, r * 0.35);
    ctx.fillRect(x - a, y - r, a * 2, r * 2);
    ctx.fillRect(x - r, y - a, r * 2, a * 2);
  };

  const heart = (x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const s = size / 16;
    ctx.moveTo(0, s * 4);
    ctx.bezierCurveTo(0, 0, -s * 8, -s * 4, -s * 8, -s * 10);
    ctx.bezierCurveTo(-s * 8, -s * 16, 0, -s * 14, 0, -s * 6);
    ctx.bezierCurveTo(0, -s * 14, s * 8, -s * 16, s * 8, -s * 10);
    ctx.bezierCurveTo(s * 8, -s * 4, 0, 0, 0, s * 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const star = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  switch (name) {
    case "Polka Dots":
      dot(0, 0, S / 8);
      dot(S, 0, S / 8);
      dot(0, S, S / 8);
      dot(S, S, S / 8);
      dot(S / 2, S / 2, S / 8);
      break;

    case "Dot Grid":
      dot(0, 0, Math.max(1.5, lw));
      dot(S, 0, Math.max(1.5, lw));
      dot(0, S, Math.max(1.5, lw));
      dot(S, S, Math.max(1.5, lw));
      dot(S / 2, 0, Math.max(1.5, lw));
      dot(S / 2, S, Math.max(1.5, lw));
      dot(0, S / 2, Math.max(1.5, lw));
      dot(S, S / 2, Math.max(1.5, lw));
      dot(S / 2, S / 2, Math.max(1.5, lw));
      break;

    case "Diagonal Stripes":
      ctx.beginPath();
      for (let i = -4; i <= 6; i++) {
        const offset = (i * S) / 2;
        ctx.moveTo(offset - S, -S);
        ctx.lineTo(offset + S * 2, S * 2);
      }
      ctx.stroke();
      break;

    case "Horizontal Stripes":
      ctx.fillRect(0, 0, S, S / 2);
      break;

    case "Vertical Pinstripes":
      ctx.fillRect(0, 0, Math.max(1, lw * 1.5), S);
      ctx.fillRect(S / 2, 0, Math.max(1, lw * 1.5), S);
      break;

    case "Grid":
      ctx.fillRect(0, 0, Math.max(1, lw), S);
      ctx.fillRect(0, 0, S, Math.max(1, lw));
      break;

    case "Checkerboard":
      ctx.fillRect(0, 0, S / 2, S / 2);
      ctx.fillRect(S / 2, S / 2, S / 2, S / 2);
      break;

    case "Gingham Plaid":
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, S / 2, S);
      ctx.fillRect(0, 0, S, S / 2);
      ctx.restore();
      break;

    case "Chevron":
      ctx.beginPath();
      for (let k = -2; k <= 4; k++) {
        const y0 = (k * S) / 2;
        ctx.moveTo(0, y0 + S / 4);
        ctx.lineTo(S / 2, y0);
        ctx.lineTo(S, y0 + S / 4);
      }
      ctx.stroke();
      break;

    case "Herringbone":
      ctx.beginPath();
      const hbCols = 2;
      const hbRows = 4;
      const cw = S / hbCols;
      const ch = S / hbRows;
      for (let c = 0; c < hbCols; c++) {
        for (let r = 0; r < hbRows; r++) {
          const x0 = c * cw;
          const y0 = r * ch;
          if ((c + r) % 2 === 0) {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + cw, y0 + ch);
          } else {
            ctx.moveTo(x0 + cw, y0);
            ctx.lineTo(x0, y0 + ch);
          }
        }
      }
      ctx.stroke();
      break;

    case "Waves":
      ctx.beginPath();
      for (let k = -1; k <= 4; k++) {
        const y0 = (k * S) / 2;
        ctx.moveTo(-2, y0);
        for (let x = -2; x <= S + 2; x += 2) {
          ctx.lineTo(x, y0 + Math.sin((x / S) * Math.PI * 2) * (S / 8));
        }
      }
      ctx.stroke();
      break;

    case "Japanese Scales":
      ctx.beginPath();
      const rScale = S / 2;
      const drawScaleGroup = (cx: number, cy: number) => {
        for (let ringStep = 1; ringStep <= 4; ringStep++) {
          ctx.beginPath();
          ctx.arc(cx, cy, (rScale * ringStep) / 4, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      };
      drawScaleGroup(0, S / 2);
      drawScaleGroup(S, S / 2);
      drawScaleGroup(S / 2, S);
      drawScaleGroup(S / 2, 0);
      break;

    case "Crosshatch":
      ctx.beginPath();
      for (let i = -4; i <= 6; i++) {
        const offset = (i * S) / 2;
        ctx.moveTo(offset - S, -S);
        ctx.lineTo(offset + S * 2, S * 2);
        ctx.moveTo(offset + S * 2, -S);
        ctx.lineTo(offset - S, S * 2);
      }
      ctx.stroke();
      break;

    case "Diamonds":
      diamond(0, 0, S / 5);
      diamond(S, 0, S / 5);
      diamond(0, S, S / 5);
      diamond(S, S, S / 5);
      diamond(S / 2, S / 2, S / 5);
      break;

    case "Moroccan Trellis":
      ctx.beginPath();
      const rad = S / 4;
      ctx.arc(0, 0, rad, 0, Math.PI / 2);
      ctx.arc(S, 0, rad, Math.PI / 2, Math.PI);
      ctx.arc(S, S, rad, Math.PI, Math.PI * 1.5);
      ctx.arc(0, S, rad, Math.PI * 1.5, Math.PI * 2);
      ctx.arc(S / 2, S / 2, rad, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "Honeycomb":
      ctx.beginPath();
      const hexR = S / 3;
      const drawHex = (cx: number, cy: number) => {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const hx = cx + hexR * Math.cos(angle);
          const hy = cy + hexR * Math.sin(angle);
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      };
      drawHex(0, 0);
      drawHex(S, 0);
      drawHex(0, S);
      drawHex(S, S);
      drawHex(S / 2, S / 2);
      break;

    case "Plus Signs":
      plus(0, 0, S / 7);
      plus(S, 0, S / 7);
      plus(0, S, S / 7);
      plus(S, S, S / 7);
      plus(S / 2, S / 2, S / 7);
      break;

    case "Triangles":
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(S / 2, 0);
      ctx.lineTo(S / 4, S / 2);
      ctx.closePath();
      ctx.moveTo(S / 2, 0);
      ctx.lineTo(S, 0);
      ctx.lineTo((3 * S) / 4, S / 2);
      ctx.closePath();
      ctx.moveTo(S / 4, S / 2);
      ctx.lineTo((3 * S) / 4, S / 2);
      ctx.lineTo(S / 2, S);
      ctx.closePath();
      ctx.moveTo(0, S);
      ctx.lineTo(S / 4, S / 2);
      ctx.lineTo(0, S / 2);
      ctx.closePath();
      ctx.moveTo(S, S);
      ctx.lineTo((3 * S) / 4, S / 2);
      ctx.lineTo(S, S / 2);
      ctx.closePath();
      ctx.fill();
      break;

    case "Isometric Cubes":
      ctx.beginPath();
      const midX = S / 2;
      const midY = S / 2;
      ctx.moveTo(midX, 0);
      ctx.lineTo(S, S / 4);
      ctx.lineTo(S, (3 * S) / 4);
      ctx.lineTo(midX, S);
      ctx.lineTo(0, (3 * S) / 4);
      ctx.lineTo(0, S / 4);
      ctx.closePath();
      ctx.stroke();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX, 0);
      ctx.moveTo(midX, midY);
      ctx.lineTo(S, (3 * S) / 4);
      ctx.moveTo(midX, midY);
      ctx.lineTo(0, (3 * S) / 4);
      ctx.stroke();
      break;

    case "Stars":
      star(0, 0, 5, S / 7, S / 15);
      star(S, 0, 5, S / 7, S / 15);
      star(0, S, 5, S / 7, S / 15);
      star(S, S, 5, S / 7, S / 15);
      star(S / 2, S / 2, 5, S / 6, S / 14);
      break;

    case "Hearts":
      heart(0, 0, S / 6);
      heart(S, 0, S / 6);
      heart(0, S, S / 6);
      heart(S, S, S / 6);
      heart(S / 2, S / 2, S / 5);
      break;

    case "Lined Notebook":
      ctx.beginPath();
      const numLines = 4;
      const lineStep = S / numLines;
      for (let i = 0; i < numLines; i++) {
        const y = i * lineStep;
        ctx.moveTo(0, y);
        ctx.lineTo(S, y);
      }
      ctx.stroke();
      break;
  }
}

export default function PatternGenerator() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const tileRef = useRef<HTMLCanvasElement | null>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const [pattern, setPattern] = useState<PatternName>("Polka Dots");
  const [fg, setFg] = useState<string>("#c7b9a2");
  const [bg, setBg] = useState<string>("#faf7f0");
  const [scale, setScale] = useState<number>(64);
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [exportIdx, setExportIdx] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [previewMode, setPreviewMode] = useState<"page" | "tile" | "cover">("page");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const notebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (!notebookId) return;

    getNotebookEntryData(notebookId)
      .then((res) => {
        if (!res.success || !res.data) return;
        const d: any = res.data;
        if (d.pattern) setPattern(d.pattern);
        if (typeof d.fg === "string") setFg(d.fg);
        if (typeof d.bg === "string") setBg(d.bg);
        if (typeof d.scale === "number") setScale(d.scale);
        if (typeof d.lineWidth === "number") setLineWidth(d.lineWidth);
      })
      .catch((err) => console.error("Failed to load notebook entry:", err));
  }, []);

  const render = useCallback(() => {
    if (!tileRef.current) tileRef.current = document.createElement("canvas");
    const tile = tileRef.current;
    drawTile(tile, pattern, scale, fg, bg, lineWidth);

    const preview = previewRef.current;
    if (!preview) return;
    const ctx = preview.getContext("2d")!;
    ctx.clearRect(0, 0, preview.width, preview.height);

    if (previewMode === "tile") {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, preview.width, preview.height);
      const cx = (preview.width - scale * 2) / 2;
      const cy = (preview.height - scale * 2) / 2;
      ctx.drawImage(tile, 0, 0, scale, scale, cx, cy, scale * 2, scale * 2);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx, cy, scale * 2, scale * 2);
      return;
    }

    if (previewMode === "cover") {
      const pat = ctx.createPattern(tile, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, preview.width, preview.height);
      }
      const spineW = 60;
      const spineX = (preview.width - spineW) / 2;
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(spineX, 0, spineW, preview.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(spineX, 0);
      ctx.lineTo(spineX, preview.height);
      ctx.moveTo(spineX + spineW, 0);
      ctx.lineTo(spineX + spineW, preview.height);
      ctx.stroke();
      ctx.setLineDash([]);
      const frontX = spineX + spineW + 80;
      const frontY = preview.height / 3;
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.roundRect(frontX, frontY, preview.width - frontX - 80, 160, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NOTEBOOK", frontX + (preview.width - frontX - 80) / 2, frontY + 70);
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("KDP JOURNAL COVER MOCKUP", frontX + (preview.width - frontX - 80) / 2, frontY + 110);
      return;
    }

    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, preview.width, preview.height);
  }, [pattern, fg, bg, scale, lineWidth, previewMode]);

  useEffect(() => {
    render();
  }, [render]);

  const handlePrint = () => {
    const tile = tileRef.current;
    if (!tile) return;
    const tileDataUrl = tile.toDataURL("image/png");
    const exp = EXPORTS[exportIdx];

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KDPage Seamless Pattern Print - ${pattern}</title>
          <style>
            @page {
              size: ${exp.widthIn ? `${exp.widthIn}in ${exp.heightIn}in` : "letter portrait"};
              margin: 0;
            }
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: ${bg};
              background-image: url('${tileDataUrl}');
              background-repeat: repeat;
              background-size: ${scale}px ${scale}px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    let iframe = printIframeRef.current;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const tile = tileRef.current;
      if (!tile) return;
      const exp = EXPORTS[exportIdx];
      const widthIn = exp.widthIn || 8.5;
      const heightIn = exp.heightIn || 11.0;
      const targetW = exp.w || 2550;
      const targetH = exp.h || 3300;

      const highResCanvas = document.createElement("canvas");
      highResCanvas.width = targetW;
      highResCanvas.height = targetH;
      const ctx = highResCanvas.getContext("2d")!;
      const pat = ctx.createPattern(tile, "repeat");
      if (!pat) throw new Error("Could not create pattern");
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, targetW, targetH);

      const imgData = highResCanvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: heightIn >= widthIn ? "portrait" : "landscape",
        unit: "in",
        format: [widthIn, heightIn],
      });

      doc.addImage(imgData, "JPEG", 0, 0, widthIn, heightIn);
      const slug = pattern.toLowerCase().replace(/\s+/g, "-");
      doc.save(`kdpage-${slug}-${widthIn}x${heightIn}-300dpi.pdf`);
      
      setExportSuccessMsg("300 DPI KDP PDF downloaded successfully!");
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPng = () => {
    const tile = tileRef.current;
    if (!tile) return;
    const exp = EXPORTS[exportIdx];
    const slug = pattern.toLowerCase().replace(/\s+/g, "-");

    if (exp.w === 0) {
      const a = document.createElement("a");
      a.download = `kdpage-seamless-tile-${slug}-${scale}px.png`;
      a.href = tile.toDataURL("image/png");
      a.click();
      setExportSuccessMsg("Seamless PNG Tile downloaded!");
      setTimeout(() => setExportSuccessMsg(null), 3000);
      return;
    }

    const out = document.createElement("canvas");
    out.width = exp.w;
    out.height = exp.h;
    const ctx = out.getContext("2d")!;
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, exp.w, exp.h);

    const a = document.createElement("a");
    a.download = `kdpage-pattern-${slug}-${exp.w}x${exp.h}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
    setExportSuccessMsg("High-Res 300 DPI PNG downloaded!");
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  const filteredPatterns = activeCategory === "All" 
    ? PATTERNS 
    : PATTERNS.filter(p => p.category === activeCategory);

  const faqs = [
    {
      q: "How do I print this pattern on physical paper or upload to Amazon KDP?",
      a: "Click 'Print Pattern Page' for immediate full-bleed printing to your printer, or click 'Download 300 DPI PDF' for an exact print file calibrated for Amazon KDP bleed specifications.",
    },
    {
      q: "What makes these patterns mathematically seamless?",
      a: "Every vector shape crossing a tile edge has its exact matching counterpart mirrored on the opposing edge, guaranteeing zero visible seam gaps when tiled infinitely across book covers and pages.",
    },
    {
      q: "Can I use these patterns on commercial Amazon KDP and Etsy books?",
      a: "Yes — all generated patterns include 100% commercial use rights. Use them for journal endpapers, notebook covers, planner backgrounds, and activity book pages with zero licensing royalties.",
    },
  ];

  return (
    <ToolShell
      title="Free Seamless Pattern"
      highlight="Generator"
      subtitle="Create mathematically seamless patterns for Amazon KDP book covers, journal endpapers, and stationery. 22 vector styles, curated color palettes, direct printing, and 300 DPI PDF exports."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 backdrop-blur-xl shadow-xl">
            
            {/* Header & Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" /> Pattern Styles
                </h3>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {PATTERNS.length} Seamless Presets
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["All", "Geometric", "Lines & Grids", "Organic & Decorative", "Journals"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredPatterns.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setPattern(p.name)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                    pattern === p.name
                      ? "bg-indigo-600/25 border-indigo-500 text-white shadow-xs"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {pattern === p.name && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            {/* Curated Color Palettes */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span>Curated Palettes</span>
                <span className="text-[10px] text-slate-500">1-Click Apply</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      setFg(pal.fg);
                      setBg(pal.bg);
                    }}
                    title={pal.name}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-center gap-1 cursor-pointer group"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0" style={{ backgroundColor: pal.bg }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0" style={{ backgroundColor: pal.fg }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500">
                  <input
                    type="color"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    className="w-full bg-transparent text-[11px] font-mono font-bold text-slate-200 uppercase focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Background
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500">
                  <input
                    type="color"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-full bg-transparent text-[11px] font-mono font-bold text-slate-200 uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sliders: Scale & Line Width */}
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pattern Tile Scale</span>
                  <span className="text-indigo-400 font-mono">{scale}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={240}
                  step={2}
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stroke Weight</span>
                  <span className="text-indigo-400 font-mono">{lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Print & Export Format Selector */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Target Print &amp; Page Size
              </label>
              <select
                value={exportIdx}
                onChange={(e) => setExportIdx(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {EXPORTS.map((exp, i) => (
                  <option key={exp.label} value={i}>
                    {exp.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-medium">
                {EXPORTS[exportIdx].desc}
              </p>
            </div>

            {/* Feedback notification */}
            {exportSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                {exportSuccessMsg}
              </div>
            )}

            {/* Action Buttons: Print, PDF, PNG */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Pattern Page (Full Bleed)
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> 
                {isExportingPdf ? "Compiling 300 DPI PDF..." : "Download 300 DPI PDF (KDP)"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Download PNG
                </button>

                <SaveToNotebookButton
                  title={`Pattern: ${pattern}`}
                  content={`${pattern} seamless pattern, ${fg} on ${bg}, ${scale}px scale.`}
                  category="pattern-generator"
                  data={{ pattern, fg, bg, scale, lineWidth }}
                  className="w-full justify-center text-xs py-2.5"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Live Preview Canvas Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
            
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Live View:
                </span>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("page")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewMode === "page" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Page Tiling
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("tile")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewMode === "tile" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Single Tile (1×)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("cover")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewMode === "cover" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Book Cover 3D
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Seamless 300 DPI Vector Sync</span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[420px] max-h-[580px]">
              <canvas
                ref={previewRef}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[580px] object-contain"
              />
            </div>

            {/* Quick Helper Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" /> 1-Click Physical Print
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Prints directly to any connected printer with zero margins and true background color fill.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> 300 DPI KDP PDF
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Export ready-to-upload Amazon KDP interior manuscript pages and journal endpapers.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Infinite Repeat
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  PNG tiles repeat with zero seams in Photoshop, Canva, Procreate, and BookBuilder.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ToolShell>
  );
}

