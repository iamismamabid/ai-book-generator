"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getNotebookEntryData } from "@/app/actions";
import { 
  Palette, Download, Printer, FileText, Check, 
  Layers, CheckCircle2, Type, Sparkles, Sliders, Shield, BookOpen
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
  | "Lined Notebook"
  | "Mysterious Runes"
  | "Custom Monogram"
  | "Vintage Letters";

const PATTERNS: { name: PatternName; category: "Geometric" | "Lines & Grids" | "Organic & Decorative" | "Journals" | "Mysterious & Letters" }[] = [
  { name: "Mysterious Runes", category: "Mysterious & Letters" },
  { name: "Custom Monogram", category: "Mysterious & Letters" },
  { name: "Vintage Letters", category: "Mysterious & Letters" },
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
  { name: "Mysterious Noir", fg: "#d4af37", bg: "#090d16" },
  { name: "Vintage Parchment", fg: "#4a3525", bg: "#f4eedb" },
  { name: "Midnight Gold", fg: "#eab308", bg: "#0f172a" },
  { name: "Gothic Crimson", fg: "#e11d48", bg: "#180206" },
  { name: "Warm Linen", fg: "#c7b9a2", bg: "#faf7f0" },
  { name: "Vintage Botanical", fg: "#3f6212", bg: "#f7fee7" },
  { name: "Rose & Blush", fg: "#be185d", bg: "#fff1f2" },
  { name: "Ocean Indigo", fg: "#38bdf8", bg: "#0c4a6e" },
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

interface PlaqueOptions {
  enabled: boolean;
  title: string;
  subtitle: string;
  style: "mysterious" | "vintage" | "royal" | "minimal" | "seal";
  theme: "match" | "dark" | "light" | "gold";
}

/**
 * Mathematically seamless tile generator
 */
function drawTile(tile: HTMLCanvasElement, name: PatternName, S: number, fg: string, bg: string, lw: number, customLetter: string) {
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

  const drawRune = (x: number, y: number, rSize: number, variant: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const s = rSize / 2;
    if (variant === 0) {
      // Algiz / Elhaz protection rune
      ctx.moveTo(0, s);
      ctx.lineTo(0, -s);
      ctx.moveTo(-s * 0.7, -s * 0.6);
      ctx.lineTo(0, -s * 0.1);
      ctx.lineTo(s * 0.7, -s * 0.6);
    } else if (variant === 1) {
      // Othala / Heritage rune
      ctx.moveTo(-s * 0.5, s);
      ctx.lineTo(s * 0.5, -s * 0.2);
      ctx.lineTo(0, -s);
      ctx.lineTo(-s * 0.5, -s * 0.2);
      ctx.lineTo(s * 0.5, s);
    } else if (variant === 2) {
      // Fehu wealth rune
      ctx.moveTo(-s * 0.3, s);
      ctx.lineTo(-s * 0.3, -s);
      ctx.moveTo(-s * 0.3, -s * 0.6);
      ctx.lineTo(s * 0.4, -s * 0.8);
      ctx.moveTo(-s * 0.3, -s * 0.1);
      ctx.lineTo(s * 0.4, -s * 0.3);
    } else {
      // Dagaz dawn rune
      ctx.moveTo(-s * 0.6, -s * 0.6);
      ctx.lineTo(s * 0.6, s * 0.6);
      ctx.lineTo(s * 0.6, -s * 0.6);
      ctx.lineTo(-s * 0.6, s * 0.6);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.restore();
  };

  switch (name) {
    case "Mysterious Runes":
      // Ancient mystical runes & cipher letter matrix
      const runeSize = S / 3.5;
      drawRune(0, 0, runeSize, 0);
      drawRune(S, 0, runeSize, 0);
      drawRune(0, S, runeSize, 0);
      drawRune(S, S, runeSize, 0);
      drawRune(S / 2, S / 2, runeSize, 1);
      drawRune(S / 2, 0, runeSize * 0.7, 2);
      drawRune(S / 2, S, runeSize * 0.7, 2);
      drawRune(0, S / 2, runeSize * 0.7, 3);
      drawRune(S, S / 2, runeSize * 0.7, 3);
      break;

    case "Custom Monogram":
      // Custom monogram letters repeating seamlessly (e.g. KD, initials, secret code)
      const letter = (customLetter || "KD").toUpperCase().slice(0, 3);
      ctx.font = `bold ${Math.round(S * 0.3)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const drawLetter = (cx: number, cy: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        // Small decorative diamond behind letter
        ctx.strokeStyle = fg;
        ctx.lineWidth = Math.max(1, lw * 0.6);
        const dr = S * 0.22;
        ctx.beginPath();
        ctx.moveTo(0, -dr);
        ctx.lineTo(dr, 0);
        ctx.lineTo(0, dr);
        ctx.lineTo(-dr, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fillText(letter, 0, 1);
        ctx.restore();
      };

      drawLetter(0, 0);
      drawLetter(S, 0);
      drawLetter(0, S);
      drawLetter(S, S);
      drawLetter(S / 2, S / 2);
      break;

    case "Vintage Letters":
      // Seamless typewriter letterpress columns
      ctx.font = `${Math.round(S * 0.16)}px 'Courier New', monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const sampleLetters = [
        "A B C D E F G H I",
        "J K L M N O P Q R",
        "S T U V W X Y Z 0",
        "1 2 3 4 5 6 7 8 9"
      ];
      const rowHeight = S / 4;
      for (let r = 0; r < 4; r++) {
        ctx.fillText(sampleLetters[r], S * 0.05, r * rowHeight + S * 0.08);
      }
      break;

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

/**
 * Draws high-resolution title badge / mysterious letter plaque on the page
 */
function drawTitlePlaque(ctx: CanvasRenderingContext2D, width: number, height: number, plaque: PlaqueOptions, fg: string, bg: string) {
  if (!plaque.enabled) return;

  const scale = width / 1200;
  const pw = Math.min(width * 0.72, 700 * scale);
  const ph = Math.min(height * 0.32, 240 * scale);
  const px = (width - pw) / 2;
  const py = (height - ph) / 2;

  ctx.save();

  let boxBg = "#090d16";
  let boxBorder = "#d4af37";
  let textMain = "#ffffff";
  let textSub = "#cbd5e1";

  if (plaque.theme === "light") {
    boxBg = "#ffffff";
    boxBorder = "#1e293b";
    textMain = "#0f172a";
    textSub = "#64748b";
  } else if (plaque.theme === "match") {
    boxBg = bg;
    boxBorder = fg;
    textMain = fg;
    textSub = fg;
  } else if (plaque.theme === "gold") {
    boxBg = "#1c1917";
    boxBorder = "#eab308";
    textMain = "#fef08a";
    textSub = "#ca8a04";
  }

  // Draw shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 30 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10 * scale;

  if (plaque.style === "seal") {
    // Circular royal seal
    const r = ph * 0.7;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = boxBg;
    ctx.fill();
    ctx.shadowColor = "transparent";
    // Double gold ring
    ctx.strokeStyle = boxBorder;
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, r - 12 * scale, 0, Math.PI * 2);
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text in circle
    ctx.fillStyle = textMain;
    ctx.font = `bold ${Math.round(28 * scale)}px 'Cinzel', serif, Georgia`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(plaque.title || "MYSTERIOUS LETTER", width / 2, height / 2 - 12 * scale);
    ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillStyle = textSub;
    ctx.fillText(plaque.subtitle || "OFFICIAL ARCHIVE", width / 2, height / 2 + 24 * scale);
    ctx.restore();
    return;
  }

  // Main Plaque Box
  ctx.beginPath();
  const radius = plaque.style === "minimal" ? 40 * scale : 16 * scale;
  ctx.roundRect(px, py, pw, ph, radius);
  ctx.fillStyle = boxBg;
  ctx.fill();

  ctx.shadowColor = "transparent";

  // Double Border & Ornaments
  ctx.strokeStyle = boxBorder;
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  if (plaque.style === "mysterious" || plaque.style === "vintage" || plaque.style === "royal") {
    // Inner border frame
    const inset = 10 * scale;
    ctx.beginPath();
    ctx.roundRect(px + inset, py + inset, pw - inset * 2, ph - inset * 2, radius * 0.7);
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Corner Ornaments
    const cSize = 14 * scale;
    const drawCorner = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, cSize * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = boxBorder;
      ctx.fill();
    };
    drawCorner(px + inset + 8 * scale, py + inset + 8 * scale);
    drawCorner(px + pw - inset - 8 * scale, py + inset + 8 * scale);
    drawCorner(px + inset + 8 * scale, py + ph - inset - 8 * scale);
    drawCorner(px + pw - inset - 8 * scale, py + ph - inset - 8 * scale);
  }

  // Typography Rendering
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const mainFontSize = Math.round(36 * scale);
  const subFontSize = Math.round(15 * scale);

  ctx.fillStyle = textMain;
  ctx.font = plaque.style === "mysterious"
    ? `bold ${mainFontSize}px 'Cinzel', serif, Georgia`
    : `bold ${mainFontSize}px 'Cinzel', serif, Georgia`;

  const titleY = plaque.subtitle ? py + ph * 0.42 : py + ph * 0.5;
  ctx.fillText(plaque.title || "MYSTERIOUS LETTER", width / 2, titleY);

  if (plaque.subtitle) {
    ctx.fillStyle = textSub;
    ctx.font = `bold ${subFontSize}px 'Courier New', monospace, sans-serif`;
    ctx.fillText(plaque.subtitle.toUpperCase(), width / 2, py + ph * 0.68);
  }

  ctx.restore();
}

export default function PatternGenerator() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const tileRef = useRef<HTMLCanvasElement | null>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const [pattern, setPattern] = useState<PatternName>("Mysterious Runes");
  const [fg, setFg] = useState<string>("#d4af37");
  const [bg, setBg] = useState<string>("#090d16");
  const [scale, setScale] = useState<number>(72);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [customMonogram, setCustomMonogram] = useState<string>("KD");
  const [exportIdx, setExportIdx] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [previewMode, setPreviewMode] = useState<"page" | "tile" | "cover">("page");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Plaque & Name Print State
  const [plaque, setPlaque] = useState<PlaqueOptions>({
    enabled: true,
    title: "MYSTERIOUS LETTERS",
    subtitle: "CONFIDENTIAL JOURNAL & LOGBOOK",
    style: "mysterious",
    theme: "gold",
  });

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
        if (d.plaque) setPlaque(d.plaque);
      })
      .catch((err) => console.error("Failed to load notebook entry:", err));
  }, []);

  const render = useCallback(() => {
    if (!tileRef.current) tileRef.current = document.createElement("canvas");
    const tile = tileRef.current;
    drawTile(tile, pattern, scale, fg, bg, lineWidth, customMonogram);

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
      
      // Draw Title Plaque on Front Cover
      const frontW = preview.width - (spineX + spineW);
      const frontX = spineX + spineW;
      ctx.save();
      ctx.translate(frontX, 0);
      drawTitlePlaque(ctx, frontW, preview.height, plaque, fg, bg);
      ctx.restore();
      return;
    }

    // Standard Page Tiling
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, preview.width, preview.height);

    // Draw Title Plaque overlay if enabled
    if (plaque.enabled) {
      drawTitlePlaque(ctx, preview.width, preview.height, plaque, fg, bg);
    }
  }, [pattern, fg, bg, scale, lineWidth, customMonogram, previewMode, plaque]);

  useEffect(() => {
    render();
  }, [render]);

  const handlePrint = () => {
    const tile = tileRef.current;
    if (!tile) return;
    const exp = EXPORTS[exportIdx];
    const targetW = exp.w || 2550;
    const targetH = exp.h || 3300;

    // Render full page with plaque for print
    const printCanvas = document.createElement("canvas");
    printCanvas.width = targetW;
    printCanvas.height = targetH;
    const ctx = printCanvas.getContext("2d")!;
    const pat = ctx.createPattern(tile, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    if (plaque.enabled) {
      drawTitlePlaque(ctx, targetW, targetH, plaque, fg, bg);
    }
    const pageDataUrl = printCanvas.toDataURL("image/png");

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KDPage Print - ${plaque.enabled ? plaque.title : pattern}</title>
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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${pageDataUrl}" />
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

      // Render high-res 300 DPI canvas
      const highResCanvas = document.createElement("canvas");
      highResCanvas.width = targetW;
      highResCanvas.height = targetH;
      const ctx = highResCanvas.getContext("2d")!;
      const pat = ctx.createPattern(tile, "repeat");
      if (!pat) throw new Error("Could not create pattern");
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw Name/Mysterious Letter Plaque on High-Res 300 DPI canvas
      if (plaque.enabled) {
        drawTitlePlaque(ctx, targetW, targetH, plaque, fg, bg);
      }

      const imgData = highResCanvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: heightIn >= widthIn ? "portrait" : "landscape",
        unit: "in",
        format: [widthIn, heightIn],
      });

      doc.addImage(imgData, "JPEG", 0, 0, widthIn, heightIn);
      const slug = (plaque.enabled && plaque.title ? plaque.title : pattern)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30);
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
    const slug = (plaque.enabled && plaque.title ? plaque.title : pattern)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);

    if (exp.w === 0 && !plaque.enabled) {
      const a = document.createElement("a");
      a.download = `kdpage-seamless-tile-${slug}-${scale}px.png`;
      a.href = tile.toDataURL("image/png");
      a.click();
      setExportSuccessMsg("Seamless PNG Tile downloaded!");
      setTimeout(() => setExportSuccessMsg(null), 3000);
      return;
    }

    const targetW = exp.w || 2550;
    const targetH = exp.h || 3300;
    const out = document.createElement("canvas");
    out.width = targetW;
    out.height = targetH;
    const ctx = out.getContext("2d")!;
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, targetW, targetH);

    if (plaque.enabled) {
      drawTitlePlaque(ctx, targetW, targetH, plaque, fg, bg);
    }

    const a = document.createElement("a");
    a.download = `kdpage-${slug}-${targetW}x${targetH}.png`;
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
      q: "Can I generate patterns with my custom name or mysterious letter titles?",
      a: "Yes! Use the 'Name & Mysterious Title Plaque' section to customize your book title, secret agent letters, author name, or subtitle with ornate gothic, vintage parchment, and royal seal styles.",
    },
    {
      q: "How does the custom monogram pattern work?",
      a: "Select the 'Custom Monogram' pattern and type 1-3 initials (e.g. 'KD', 'A', 'S'). The engine mathematically repeats your custom letters across a luxury designer geometric grid.",
    },
    {
      q: "What DPI are the page exports?",
      a: "All page presets export at true 300 DPI with zero raster compression, fully calibrated for Amazon KDP interior bleed and paperback cover specifications.",
    },
  ];

  return (
    <ToolShell
      title="Free Seamless Pattern & Name"
      highlight="Generator"
      subtitle="Create seamless patterns for Amazon KDP book covers, journal endpapers, and personalized stationery. Featuring Mysterious Letter Plaques, custom monograms, and 300 DPI PDF prints."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 backdrop-blur-xl shadow-xl">
            
            {/* 🏷️ Custom Name / Mysterious Letter Plaque Section */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Name / Mysterious Letter Plaque
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plaque.enabled}
                    onChange={(e) => setPlaque({ ...plaque, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {plaque.enabled && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">
                      Main Title / Mysterious Letter Name
                    </label>
                    <input
                      type="text"
                      value={plaque.title}
                      onChange={(e) => setPlaque({ ...plaque, title: e.target.value })}
                      placeholder="e.g. MYSTERIOUS LETTERS"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">
                      Subtitle / Secret Code
                    </label>
                    <input
                      type="text"
                      value={plaque.subtitle}
                      onChange={(e) => setPlaque({ ...plaque, subtitle: e.target.value })}
                      placeholder="e.g. CONFIDENTIAL JOURNAL"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400">
                        Frame Style
                      </label>
                      <select
                        value={plaque.style}
                        onChange={(e) => setPlaque({ ...plaque, style: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                      >
                        <option value="mysterious">Mysterious Gothic</option>
                        <option value="vintage">Vintage Plaque</option>
                        <option value="royal">Royal Filigree</option>
                        <option value="seal">Circular Seal</option>
                        <option value="minimal">Minimalist Pill</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400">
                        Plaque Theme
                      </label>
                      <select
                        value={plaque.theme}
                        onChange={(e) => setPlaque({ ...plaque, theme: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                      >
                        <option value="gold">Gold &amp; Noir</option>
                        <option value="dark">Midnight Dark</option>
                        <option value="light">Parchment Light</option>
                        <option value="match">Match Palette</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Monogram Letters Input (When Custom Monogram is selected) */}
            {pattern === "Custom Monogram" && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-2 animate-fade-in">
                <label className="block text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Monogram Initials / Letters (1-3 chars)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customMonogram}
                  onChange={(e) => setCustomMonogram(e.target.value)}
                  placeholder="e.g. KD or A"
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-black text-sm uppercase rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Header & Categories */}
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
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
                {["All", "Mysterious & Letters", "Geometric", "Lines & Grids", "Organic & Decorative", "Journals"].map((cat) => (
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
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
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
                  min={24}
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
                  title={`Pattern: ${plaque.enabled ? plaque.title : pattern}`}
                  content={`${pattern} pattern with ${plaque.enabled ? plaque.title : 'no'} title, ${fg} on ${bg}.`}
                  category="pattern-generator"
                  data={{ pattern, fg, bg, scale, lineWidth, plaque, customMonogram }}
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
                <span>300 DPI Vector Print Sync</span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[440px] max-h-[600px]">
              <canvas
                ref={previewRef}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[600px] object-contain shadow-2xl"
              />
            </div>

            {/* Quick Helper Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Mysterious Letter Plaque
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Custom name and mystery titles with gothic, vintage, and royal gold frames.
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
                  <Sparkles className="w-3.5 h-3.5" /> Custom Monogram Matrix
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Type your initials or cipher runes to generate infinite luxury designer patterns.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ToolShell>
  );
}

