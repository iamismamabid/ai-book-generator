import { jsPDF } from "jspdf";
import { calculateKdpLayout } from "./kdpLayout";

export type CoverThemeId =
  | "midnight_gold"
  | "cyber_indigo"
  | "royal_emerald"
  | "crimson_sunset"
  | "clean_slate"
  | "vintage_kraft"
  | "botanical_sage"
  | "bold_bestseller"
  | "playful_family"
  | "dark_mystery";

export interface CoverThemeConfig {
  id: CoverThemeId;
  name: string;
  badge: string;
  bgGradStart: string;
  bgGradEnd: string;
  accentColor: string;
  accentLight: string;
  textColor: string;
  subtitleColor: string;
  borderColor: string;
  pillBg: string;
  pillText: string;
  patternType?: "diamonds" | "stripes" | "dots" | "circles" | "vintage";
}

export const COVER_THEMES: Record<CoverThemeId, CoverThemeConfig> = {
  midnight_gold: {
    id: "midnight_gold",
    name: "Midnight Gold",
    badge: "Luxury",
    bgGradStart: "#090d16",
    bgGradEnd: "#1e293b",
    accentColor: "#f59e0b",
    accentLight: "#fef08a",
    textColor: "#ffffff",
    subtitleColor: "#cbd5e1",
    borderColor: "#d97706",
    pillBg: "rgba(245, 158, 11, 0.15)",
    pillText: "#fbbf24",
    patternType: "diamonds",
  },
  cyber_indigo: {
    id: "cyber_indigo",
    name: "Cyber Indigo",
    badge: "Brain Games",
    bgGradStart: "#09090b",
    bgGradEnd: "#312e81",
    accentColor: "#6366f1",
    accentLight: "#a5b4fc",
    textColor: "#ffffff",
    subtitleColor: "#e0e7ff",
    borderColor: "#4f46e5",
    pillBg: "rgba(99, 102, 241, 0.2)",
    pillText: "#818cf8",
    patternType: "diamonds",
  },
  royal_emerald: {
    id: "royal_emerald",
    name: "Royal Emerald",
    badge: "Mindfulness",
    bgGradStart: "#022c22",
    bgGradEnd: "#064e3b",
    accentColor: "#10b981",
    accentLight: "#a7f3d0",
    textColor: "#ffffff",
    subtitleColor: "#d1fae5",
    borderColor: "#059669",
    pillBg: "rgba(16, 185, 129, 0.2)",
    pillText: "#34d399",
    patternType: "dots",
  },
  crimson_sunset: {
    id: "crimson_sunset",
    name: "Crimson Sunset",
    badge: "High Energy",
    bgGradStart: "#450a0a",
    bgGradEnd: "#7c2d12",
    accentColor: "#f97316",
    accentLight: "#fed7aa",
    textColor: "#ffffff",
    subtitleColor: "#ffedd5",
    borderColor: "#ea580c",
    pillBg: "rgba(249, 115, 22, 0.2)",
    pillText: "#fb923c",
    patternType: "stripes",
  },
  clean_slate: {
    id: "clean_slate",
    name: "Clean Slate",
    badge: "Minimalist",
    bgGradStart: "#18181b",
    bgGradEnd: "#27272a",
    accentColor: "#38bdf8",
    accentLight: "#bae6fd",
    textColor: "#ffffff",
    subtitleColor: "#94a3b8",
    borderColor: "#52525b",
    pillBg: "rgba(56, 189, 248, 0.15)",
    pillText: "#7dd3fc",
    patternType: "dots",
  },
  vintage_kraft: {
    id: "vintage_kraft",
    name: "Vintage Kraft",
    badge: "Classic Paper",
    bgGradStart: "#292524",
    bgGradEnd: "#44403c",
    accentColor: "#d97706",
    accentLight: "#fef3c7",
    textColor: "#fafaf9",
    subtitleColor: "#e7e5e4",
    borderColor: "#b45309",
    pillBg: "rgba(217, 119, 6, 0.18)",
    pillText: "#fcd34d",
    patternType: "vintage",
  },
  botanical_sage: {
    id: "botanical_sage",
    name: "Botanical Sage",
    badge: "Nature Calm",
    bgGradStart: "#064e3b",
    bgGradEnd: "#14532d",
    accentColor: "#86efac",
    accentLight: "#f0fdf4",
    textColor: "#ffffff",
    subtitleColor: "#bbf7d0",
    borderColor: "#22c55e",
    pillBg: "rgba(134, 239, 172, 0.18)",
    pillText: "#86efac",
    patternType: "dots",
  },
  bold_bestseller: {
    id: "bold_bestseller",
    name: "Bold Bestseller",
    badge: "Top Seller",
    bgGradStart: "#000000",
    bgGradEnd: "#171717",
    accentColor: "#facc15",
    accentLight: "#fef08a",
    textColor: "#ffffff",
    subtitleColor: "#fde047",
    borderColor: "#eab308",
    pillBg: "rgba(250, 204, 21, 0.22)",
    pillText: "#fde047",
    patternType: "stripes",
  },
  playful_family: {
    id: "playful_family",
    name: "Playful Activity",
    badge: "Kids & Family",
    bgGradStart: "#0369a1",
    bgGradEnd: "#0284c7",
    accentColor: "#facc15",
    accentLight: "#ffffff",
    textColor: "#ffffff",
    subtitleColor: "#e0f2fe",
    borderColor: "#38bdf8",
    pillBg: "rgba(250, 204, 21, 0.25)",
    pillText: "#fef08a",
    patternType: "circles",
  },
  dark_mystery: {
    id: "dark_mystery",
    name: "Dark Academia",
    badge: "Crosswords",
    bgGradStart: "#1c1917",
    bgGradEnd: "#292524",
    accentColor: "#fbbf24",
    accentLight: "#fef3c7",
    textColor: "#ffffff",
    subtitleColor: "#d6d3d1",
    borderColor: "#d97706",
    pillBg: "rgba(251, 191, 36, 0.15)",
    pillText: "#fcd34d",
    patternType: "vintage",
  },
};

export interface AutoCoverOptions {
  title: string;
  subtitle: string;
  author: string;
  pageCount: number;
  trimWidth: number;
  trimHeight: number;
  themeId?: CoverThemeId;
  paperType?: "white" | "cream" | "color";
  dpi?: number;
  frontCoverImageUrl?: string; // Optional uploaded image or AI artwork for front cover
  customFullCoverDataUrl?: string; // Optional full wraparound cover exported from Fabric Cover Studio
  colorSpace?: "cmyk" | "srgb"; // Default to CMYK for 100% Amazon KDP compliance
}

export interface GeneratedCoverPackage {
  coverPdfBlob: Blob;
  mockupPngBlob: Blob;
  coverDataUrl: string;
  frontCoverDataUrl: string;
  spineCoverDataUrl: string;
  mockupDataUrl: string;
  layoutSpecs: {
    coverWidthInches: number;
    coverHeightInches: number;
    spineWidthInches: number;
    bleedInches: number;
    pageCount: number;
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Helper to wrap text into multiple lines for Canvas 2D
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Generates a Print-Ready 300 DPI KDP Cover PDF and 3D Angled Mockup
 */
export async function generateFullKdpCover(
  options: AutoCoverOptions
): Promise<GeneratedCoverPackage> {
  const {
    title,
    subtitle,
    author,
    pageCount,
    trimWidth = 8.5,
    trimHeight = 11,
    themeId = "midnight_gold",
    paperType = "white",
    dpi = 300,
    frontCoverImageUrl,
    customFullCoverDataUrl,
  } = options;

  const theme = COVER_THEMES[themeId] || COVER_THEMES.midnight_gold;
  const actualPages = Math.max(24, pageCount);

  // KDP calculation formulas
  let multiplier = 0.002252;
  if (paperType === "cream") multiplier = 0.0025;
  else if (paperType === "color") multiplier = 0.002347;

  const spineWidthInches = actualPages * multiplier;
  const bleed = 0.125;
  const coverWidthInches = trimWidth * 2 + spineWidthInches + bleed * 2;
  const coverHeightInches = trimHeight + bleed * 2;

  // Create High-Res Canvas
  const scale = dpi;
  const canvasWidth = Math.round(coverWidthInches * scale);
  const canvasHeight = Math.round(coverHeightInches * scale);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  // Pixel guide markers
  const bleedPx = bleed * scale;
  const trimTopPx = bleedPx;
  const trimBottomPx = canvasHeight - bleedPx;

  const backCoverLeft = bleedPx;
  const backCoverWidth = trimWidth * scale;
  const backCoverRight = backCoverLeft + backCoverWidth;

  const spineLeft = backCoverRight;
  const spineWidth = spineWidthInches * scale;
  const spineRight = spineLeft + spineWidth;
  const spineCenter = spineLeft + spineWidth / 2;

  const frontCoverLeft = spineRight;
  const frontCoverWidth = trimWidth * scale;
  const frontCoverRight = frontCoverLeft + frontCoverWidth;

  // -------------------------------------------------------------
  // BRANCH A: CUSTOM COVER FROM COVER STUDIO
  // -------------------------------------------------------------
  if (customFullCoverDataUrl) {
    try {
      const fullImg = await loadImage(customFullCoverDataUrl);
      ctx.drawImage(fullImg, 0, 0, canvasWidth, canvasHeight);
    } catch (e) {
      console.warn("Failed to load custom full cover image, falling back to generator:", e);
    }
  } else {
    // -------------------------------------------------------------
    // BRANCH B: PROCEDURAL DESIGNER COVER (with optional front image)
    // -------------------------------------------------------------
    // 1. Draw Background Gradient across the entire wraparound sheet
    const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    bgGrad.addColorStop(0, theme.bgGradStart);
    bgGrad.addColorStop(0.5, theme.bgGradEnd);
    bgGrad.addColorStop(1, theme.bgGradStart);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Decorative texture pattern
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 2;

    if (theme.patternType === "dots") {
      const step = 60;
      for (let x = 0; x < canvasWidth; x += step) {
        for (let y = 0; y < canvasHeight; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
          ctx.fill();
        }
      }
    } else if (theme.patternType === "stripes") {
      const step = 80;
      for (let x = -canvasHeight; x < canvasWidth; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvasHeight, canvasHeight);
        ctx.stroke();
      }
    } else if (theme.patternType === "circles") {
      for (let i = 0; i < 15; i++) {
        const cx = (i * 270) % canvasWidth;
        const cy = (i * 350) % canvasHeight;
        ctx.beginPath();
        ctx.arc(cx, cy, 90 + (i % 3) * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Default: Diamond trellis
      const step = 80;
      for (let x = -canvasHeight; x < canvasWidth + canvasHeight; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvasHeight, canvasHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + canvasHeight, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
    }
    ctx.restore();

    // -------------------------------------------------------------
    // BACK COVER (Left Page)
    // -------------------------------------------------------------
    const backCenter = backCoverLeft + backCoverWidth / 2;
    const backLiveLeft = backCoverLeft + 0.375 * scale;
    const backLiveRight = backCoverRight - 0.375 * scale;
    const backLiveWidth = backLiveRight - backLiveLeft;

    // Back decorative border
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      backLiveLeft,
      trimTopPx + 0.375 * scale,
      backLiveWidth,
      trimHeight * scale - 0.75 * scale
    );
    ctx.restore();

    // Back Header Tag
    ctx.font = `bold ${Math.round(28 * (scale / 300))}px sans-serif`;
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = "center";
    ctx.fillText(
      "WHY YOU WILL LOVE THIS BOOK",
      backCenter,
      trimTopPx + 1.2 * scale
    );

    // Back Subtitle
    ctx.font = `${Math.round(20 * (scale / 300))}px sans-serif`;
    ctx.fillStyle = theme.subtitleColor;
    ctx.fillText(
      "Designed for Hours of Screen-Free Entertainment & Brain Agility",
      backCenter,
      trimTopPx + 1.5 * scale
    );

    // Bullet points
    const bullets = [
      "Large Print Format: Easy on the eyes, perfect for adults and seniors",
      "Handcrafted Layout: Clear grids with ample margin room to solve comfortably",
      "Complete Solutions Included: Full answer keys provided at the back",
      "Mind Sharpening: Boosts memory, deductive logic, and cognitive focus",
      "Thoughtful Gift: Ideal for daily relaxation, vacations, and travel",
    ];

    ctx.textAlign = "left";
    let bulletY = trimTopPx + 2.2 * scale;
    const bulletStartX = backLiveLeft + 0.5 * scale;
    const bulletMaxWidth = backLiveWidth - 1.0 * scale;

    bullets.forEach((b) => {
      // Bullet check badge
      ctx.beginPath();
      ctx.arc(bulletStartX, bulletY - 6, 12, 0, Math.PI * 2);
      ctx.fillStyle = theme.accentColor;
      ctx.fill();

      ctx.font = `bold ${Math.round(14 * (scale / 300))}px sans-serif`;
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText("✓", bulletStartX, bulletY - 2);

      // Bullet text
      ctx.font = `${Math.round(20 * (scale / 300))}px sans-serif`;
      ctx.fillStyle = "#f8fafc";
      ctx.textAlign = "left";
      const lines = wrapText(ctx, b, bulletMaxWidth);
      lines.forEach((line, idx) => {
        ctx.fillText(line, bulletStartX + 26, bulletY + idx * 30);
      });
      bulletY += lines.length * 30 + 35;
    });

    // Amazon KDP Barcode Box on Back Cover (Bottom Right)
    const barcodeW = 2.0 * scale;
    const barcodeH = 1.2 * scale;
    const barcodeX = backCoverRight - 0.4 * scale - barcodeW;
    const barcodeY = trimBottomPx - 0.4 * scale - barcodeH;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(barcodeX, barcodeY, barcodeW, barcodeH);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(barcodeX, barcodeY, barcodeW, barcodeH);

    // Barcode mock stripes
    ctx.fillStyle = "#1e293b";
    const numStripes = 28;
    const stripeStep = barcodeW / numStripes;
    for (let s = 2; s < numStripes - 2; s += 2) {
      const sWidth = (s % 3 === 0 ? 4 : 2) * (scale / 300);
      ctx.fillRect(barcodeX + s * stripeStep, barcodeY + 16, sWidth, barcodeH - 45);
    }
    ctx.font = `bold ${Math.round(12 * (scale / 300))}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("AMAZON KDP BARCODE ZONE", barcodeX + barcodeW / 2, barcodeY + barcodeH - 12);
    ctx.restore();

    // Publisher Branding (Bottom Left)
    ctx.font = `bold ${Math.round(15 * (scale / 300))}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "left";
    ctx.fillText("PUBLISHED BY KDPAGE STUDIO", backLiveLeft + 0.5 * scale, trimBottomPx - 0.8 * scale);

    // -------------------------------------------------------------
    // SPINE (Center Strip)
    // -------------------------------------------------------------
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(spineLeft, 0);
    ctx.lineTo(spineLeft, canvasHeight);
    ctx.moveTo(spineRight, 0);
    ctx.lineTo(spineRight, canvasHeight);
    ctx.stroke();

    // Spine shading
    const spineShade = ctx.createLinearGradient(spineLeft, 0, spineRight, 0);
    spineShade.addColorStop(0, "rgba(0,0,0,0.35)");
    spineShade.addColorStop(0.5, "rgba(255,255,255,0.05)");
    spineShade.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = spineShade;
    ctx.fillRect(spineLeft, 0, spineWidth, canvasHeight);

    // Vertical spine text
    if (spineWidthInches >= 0.14) {
      ctx.save();
      ctx.translate(spineCenter, canvasHeight / 2);
      ctx.rotate(Math.PI / 2);

      const spineFontSize = Math.min(
        Math.max(12, Math.round(spineWidth * 0.45)),
        Math.round(24 * (scale / 300))
      );
      ctx.font = `bold ${spineFontSize}px sans-serif`;
      ctx.fillStyle = theme.textColor;
      ctx.textAlign = "center";

      const spineText = `${title.toUpperCase()}  —  ${author.toUpperCase()}`;
      ctx.fillText(spineText, 0, spineFontSize * 0.35);
      ctx.restore();
    }
    ctx.restore();

    // -------------------------------------------------------------
    // FRONT COVER (Right Page)
    // -------------------------------------------------------------
    const frontCenter = frontCoverLeft + frontCoverWidth / 2;
    const frontLiveLeft = frontCoverLeft + 0.375 * scale;
    const frontLiveRight = frontCoverRight - 0.375 * scale;
    const frontLiveWidth = frontLiveRight - frontLiveLeft;

    // Optional Uploaded Front Cover Image / AI Art
    if (frontCoverImageUrl) {
      try {
        const frontImg = await loadImage(frontCoverImageUrl);
        ctx.save();
        ctx.beginPath();
        ctx.rect(frontCoverLeft, 0, canvasWidth - frontCoverLeft, canvasHeight);
        ctx.clip();

        // Aspect-fill
        const imgAspect = frontImg.width / frontImg.height;
        const targetW = canvasWidth - frontCoverLeft;
        const targetH = canvasHeight;
        const targetAspect = targetW / targetH;
        let drawW = targetW;
        let drawH = targetH;
        let drawX = frontCoverLeft;
        let drawY = 0;

        if (imgAspect > targetAspect) {
          drawW = targetH * imgAspect;
          drawX = frontCoverLeft - (drawW - targetW) / 2;
        } else {
          drawH = targetW / imgAspect;
          drawY = -(drawH - targetH) / 2;
        }

        ctx.drawImage(frontImg, drawX, drawY, drawW, drawH);

        // Readability gradient scrim
        const overlayGrad = ctx.createLinearGradient(frontCoverLeft, 0, frontCoverLeft, canvasHeight);
        overlayGrad.addColorStop(0, "rgba(0,0,0,0.72)");
        overlayGrad.addColorStop(0.3, "rgba(0,0,0,0.1)");
        overlayGrad.addColorStop(0.7, "rgba(0,0,0,0.2)");
        overlayGrad.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(frontCoverLeft, 0, canvasWidth - frontCoverLeft, canvasHeight);
        ctx.restore();
      } catch (err) {
        console.warn("Failed to draw uploaded front cover image:", err);
      }
    }

    // Front Double Accent Border
    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(
      frontLiveLeft,
      trimTopPx + 0.375 * scale,
      frontLiveWidth,
      trimHeight * scale - 0.75 * scale
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      frontLiveLeft + 16,
      trimTopPx + 0.375 * scale + 16,
      frontLiveWidth - 32,
      trimHeight * scale - 0.75 * scale - 32
    );
    ctx.restore();

    // Top Badge
    const badgeY = trimTopPx + 1.2 * scale;
    ctx.save();
    ctx.font = `bold ${Math.round(20 * (scale / 300))}px sans-serif`;
    const badgeText = "★ ALL-IN-ONE LARGE PRINT EDITION ★";
    const badgeW = ctx.measureText(badgeText).width + 50;
    const badgeH = 44;
    ctx.fillStyle = theme.pillBg;
    ctx.fillRect(frontCenter - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(frontCenter - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

    ctx.fillStyle = theme.pillText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, frontCenter, badgeY);
    ctx.restore();

    // Main Book Title
    ctx.save();
    let titleFontSize = Math.round(62 * (scale / 300));
    ctx.font = `900 ${titleFontSize}px sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";

    const titleMaxWidth = frontLiveWidth - 1.2 * scale;
    let titleLines = wrapText(ctx, title.toUpperCase(), titleMaxWidth);
    if (titleLines.length > 3) {
      titleFontSize = Math.round(48 * (scale / 300));
      ctx.font = `900 ${titleFontSize}px sans-serif`;
      titleLines = wrapText(ctx, title.toUpperCase(), titleMaxWidth);
    }

    const titleStartY = trimTopPx + 2.5 * scale;
    const titleLineHeight = titleFontSize * 1.15;

    titleLines.forEach((line, idx) => {
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillText(line, frontCenter, titleStartY + idx * titleLineHeight);
    });
    ctx.restore();

    // Divider Line
    const dividerY = titleStartY + titleLines.length * titleLineHeight + 20;
    ctx.save();
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(frontCenter - 140, dividerY);
    ctx.lineTo(frontCenter + 140, dividerY);
    ctx.stroke();

    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.moveTo(frontCenter, dividerY - 10);
    ctx.lineTo(frontCenter + 10, dividerY);
    ctx.lineTo(frontCenter, dividerY + 10);
    ctx.lineTo(frontCenter - 10, dividerY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Subtitle
    ctx.save();
    const subtitleFontSize = Math.round(24 * (scale / 300));
    ctx.font = `bold ${subtitleFontSize}px sans-serif`;
    ctx.fillStyle = theme.subtitleColor;
    ctx.textAlign = "center";
    const subtitleLines = wrapText(ctx, subtitle, frontLiveWidth - 1.4 * scale);
    const subtitleStartY = dividerY + 55;
    subtitleLines.forEach((line, idx) => {
      ctx.fillText(line, frontCenter, subtitleStartY + idx * (subtitleFontSize * 1.3));
    });
    ctx.restore();

    // Central Visual Puzzle Motif (only if no front image is uploaded)
    if (!frontCoverImageUrl) {
      const motifCenterY = (trimTopPx + trimHeight * scale) * 0.65;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.strokeRect(frontCenter - 160, motifCenterY - 110, 320, 220);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let gx = frontCenter - 160; gx <= frontCenter + 160; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, motifCenterY - 110);
        ctx.lineTo(gx, motifCenterY + 110);
        ctx.stroke();
      }
      for (let gy = motifCenterY - 110; gy <= motifCenterY + 110; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(frontCenter - 160, gy);
        ctx.lineTo(frontCenter + 160, gy);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(frontCenter - 120, motifCenterY - 35, 240, 70);
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(frontCenter - 120, motifCenterY - 35, 240, 70);

      ctx.font = `900 ${Math.round(28 * (scale / 300))}px sans-serif`;
      ctx.fillStyle = theme.accentLight;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${actualPages} PAGES`, frontCenter, motifCenterY);
      ctx.restore();
    }

    // Feature Badges at Bottom
    const badgesY = trimBottomPx - 1.8 * scale;
    const featureBadges = ["SOLUTIONS INCLUDED", "300 DPI VECTOR HD", "PREMIUM PAPER"];
    const totalBadgesW = 3 * 180 + 2 * 20;
    let currentBadgeX = frontCenter - totalBadgesW / 2 + 90;

    featureBadges.forEach((b) => {
      ctx.save();
      ctx.fillStyle = theme.pillBg;
      ctx.fillRect(currentBadgeX - 85, badgesY - 20, 170, 40);
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(currentBadgeX - 85, badgesY - 20, 170, 40);

      ctx.font = `bold ${Math.round(12 * (scale / 300))}px sans-serif`;
      ctx.fillStyle = theme.pillText;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b, currentBadgeX, badgesY);
      ctx.restore();
      currentBadgeX += 190;
    });

    // Author Name (Bottom)
    ctx.save();
    ctx.font = `bold ${Math.round(22 * (scale / 300))}px sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(author.toUpperCase(), frontCenter, trimBottomPx - 0.8 * scale);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // Extract Front Cover and Spine for 3D Mockup
  // -------------------------------------------------------------
  const frontCanvas = document.createElement("canvas");
  frontCanvas.width = frontCoverWidth;
  frontCanvas.height = trimHeight * scale;
  const fctx = frontCanvas.getContext("2d")!;
  fctx.drawImage(
    canvas,
    frontCoverLeft,
    trimTopPx,
    frontCoverWidth,
    trimHeight * scale,
    0,
    0,
    frontCoverWidth,
    trimHeight * scale
  );
  const frontCoverDataUrl = frontCanvas.toDataURL("image/jpeg", 0.92);

  const spineCanvas = document.createElement("canvas");
  spineCanvas.width = Math.max(20, spineWidth);
  spineCanvas.height = trimHeight * scale;
  const sctx = spineCanvas.getContext("2d")!;
  sctx.drawImage(
    canvas,
    spineLeft,
    trimTopPx,
    spineWidth,
    trimHeight * scale,
    0,
    0,
    Math.max(20, spineWidth),
    trimHeight * scale
  );
  const spineCoverDataUrl = spineCanvas.toDataURL("image/jpeg", 0.92);

  // Full Cover Data URL
  const coverDataUrl = canvas.toDataURL("image/jpeg", 0.92);

  // -------------------------------------------------------------
  // BUILD PRINT-READY COVER PDF (DeviceCMYK or sRGB)
  // -------------------------------------------------------------
  let coverPdfBlob: Blob;
  if (options.colorSpace !== "srgb") {
    const { exportCanvasToCmykPdf } = await import("@/lib/cmykPdfExport");
    coverPdfBlob = await exportCanvasToCmykPdf(canvas, {
      widthInches: coverWidthInches,
      heightInches: coverHeightInches,
      returnBlob: true,
    });
  } else {
    const coverDoc = new jsPDF({
      orientation: "landscape",
      unit: "in",
      format: [coverWidthInches, coverHeightInches],
    });

    coverDoc.addImage(
      coverDataUrl,
      "JPEG",
      0,
      0,
      coverWidthInches,
      coverHeightInches,
      undefined,
      "FAST"
    );

    coverPdfBlob = coverDoc.output("blob");
  }

  // -------------------------------------------------------------
  // BUILD PHOTOREALISTIC 3D ANGLED BOOK MOCKUP PNG
  // -------------------------------------------------------------
  const mockupCanvas = document.createElement("canvas");
  const mWidth = 1400;
  const mHeight = 1100;
  mockupCanvas.width = mWidth;
  mockupCanvas.height = mHeight;
  const mctx = mockupCanvas.getContext("2d")!;

  mctx.clearRect(0, 0, mWidth, mHeight);

  // Ground Drop Shadow
  mctx.save();
  mctx.beginPath();
  mctx.ellipse(mWidth * 0.52, mHeight * 0.88, 380, 55, -0.05, 0, Math.PI * 2);
  const shadowGrad = mctx.createRadialGradient(
    mWidth * 0.52,
    mHeight * 0.88,
    20,
    mWidth * 0.52,
    mHeight * 0.88,
    380
  );
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  mctx.fillStyle = shadowGrad;
  mctx.fill();
  mctx.restore();

  // Book Coordinates for 3D Angled Perspective
  const bookH = 680;
  const spineW = Math.max(35, Math.min(85, spineWidthInches * 150));
  const frontW = 460;

  const spineTopLeft = { x: 340, y: 220 };
  const spineTopRight = { x: 340 + spineW, y: 190 };
  const spineBottomLeft = { x: 340, y: 220 + bookH };
  const spineBottomRight = { x: 340 + spineW, y: 190 + bookH };

  const frontTopLeft = spineTopRight;
  const frontTopRight = { x: frontTopLeft.x + frontW, y: 270 };
  const frontBottomLeft = spineBottomRight;
  const frontBottomRight = { x: frontBottomLeft.x + frontW, y: 270 + bookH };

  // Page Block (White pages sliver behind right edge)
  mctx.save();
  mctx.fillStyle = "#e2e8f0";
  mctx.beginPath();
  mctx.moveTo(frontTopRight.x, frontTopRight.y);
  mctx.lineTo(frontTopRight.x + 22, frontTopRight.y - 12);
  mctx.lineTo(frontBottomRight.x + 22, frontBottomRight.y - 12);
  mctx.lineTo(frontBottomRight.x, frontBottomRight.y);
  mctx.closePath();
  mctx.fill();

  mctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
  mctx.lineWidth = 1;
  for (let py = frontTopRight.y - 10; py < frontBottomRight.y - 12; py += 4) {
    mctx.beginPath();
    mctx.moveTo(frontTopRight.x, py);
    mctx.lineTo(frontTopRight.x + 22, py - 12);
    mctx.stroke();
  }
  mctx.restore();

  // Draw Spine Face
  mctx.save();
  mctx.beginPath();
  mctx.moveTo(spineTopLeft.x, spineTopLeft.y);
  mctx.lineTo(spineTopRight.x, spineTopRight.y);
  mctx.lineTo(spineBottomRight.x, spineBottomRight.y);
  mctx.lineTo(spineBottomLeft.x, spineBottomLeft.y);
  mctx.closePath();
  mctx.clip();

  mctx.drawImage(
    spineCanvas,
    spineTopLeft.x,
    spineTopRight.y,
    spineW + 10,
    bookH + 40
  );

  const spineGrad = mctx.createLinearGradient(
    spineTopLeft.x,
    0,
    spineTopRight.x,
    0
  );
  spineGrad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  spineGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.1)");
  spineGrad.addColorStop(1, "rgba(255, 255, 255, 0.15)");
  mctx.fillStyle = spineGrad;
  mctx.fillRect(spineTopLeft.x, spineTopRight.y, spineW + 10, bookH + 50);
  mctx.restore();

  // Draw Front Cover Face
  mctx.save();
  mctx.beginPath();
  mctx.moveTo(frontTopLeft.x, frontTopLeft.y);
  mctx.lineTo(frontTopRight.x, frontTopRight.y);
  mctx.lineTo(frontBottomRight.x, frontBottomRight.y);
  mctx.lineTo(frontBottomLeft.x, frontBottomLeft.y);
  mctx.closePath();
  mctx.clip();

  mctx.drawImage(
    frontCanvas,
    frontTopLeft.x - 20,
    frontTopLeft.y,
    frontW + 40,
    bookH + 90
  );

  const glossGrad = mctx.createLinearGradient(
    frontTopLeft.x,
    frontTopLeft.y,
    frontBottomRight.x,
    frontBottomRight.y
  );
  glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
  glossGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.02)");
  glossGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.15)");
  glossGrad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
  mctx.fillStyle = glossGrad;
  mctx.fillRect(frontTopLeft.x - 20, frontTopLeft.y, frontW + 40, bookH + 90);

  const creaseGrad = mctx.createLinearGradient(
    frontTopLeft.x,
    0,
    frontTopLeft.x + 18,
    0
  );
  creaseGrad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  creaseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  mctx.fillStyle = creaseGrad;
  mctx.fillRect(frontTopLeft.x, frontTopLeft.y, 18, bookH + 90);
  mctx.restore();

  const mockupDataUrl = mockupCanvas.toDataURL("image/png");
  const mockupPngBlob = await new Promise<Blob>((resolve) => {
    mockupCanvas.toBlob((blob) => {
      resolve(blob || new Blob([]));
    }, "image/png");
  });

  return {
    coverPdfBlob,
    mockupPngBlob,
    coverDataUrl,
    frontCoverDataUrl,
    spineCoverDataUrl,
    mockupDataUrl,
    layoutSpecs: {
      coverWidthInches: Number(coverWidthInches.toFixed(4)),
      coverHeightInches: Number(coverHeightInches.toFixed(4)),
      spineWidthInches: Number(spineWidthInches.toFixed(4)),
      bleedInches: bleed,
      pageCount: actualPages,
    },
  };
}
