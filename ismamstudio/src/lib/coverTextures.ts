// Procedurally generated cover textures. These are drawn on a throwaway canvas
// and handed to Cover Studio as data URLs, so they plug straight into the
// existing background-image pipeline (paintCoverBackground / export compositing)
// with no new render path, no asset hosting, and no licensing questions.

export interface CoverTexture {
  id: string;
  name: string;
  category: string;
  /** Swatch color shown in the picker before the full texture is generated */
  swatch: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

// Deterministic PRNG so the same texture id always produces the same result —
// a user who re-applies "Oak" after undoing gets the identical cover back.
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Per-pixel noise is generated on a small tile and scaled up — doing it at full
// export resolution would mean millions of iterations per texture.
function overlayGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
  seed: number,
  tileSize = 256
) {
  const rand = makeRandom(seed);
  const tile = document.createElement("canvas");
  tile.width = tileSize;
  tile.height = tileSize;
  const tctx = tile.getContext("2d")!;
  const imageData = tctx.createImageData(tileSize, tileSize);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (rand() - 0.5) * 255;
    d[i] = d[i + 1] = d[i + 2] = 128 + v;
    d[i + 3] = intensity;
  }
  tctx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const pattern = ctx.createPattern(tile, "repeat");
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function fillBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function drawWood(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  grainDark: string,
  grainLight: string,
  seed: number
) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);
  const ringCount = Math.round(h / 14);
  ctx.lineWidth = Math.max(1, w / 900);

  for (let i = 0; i < ringCount; i++) {
    const y = (i / ringCount) * h + (rand() - 0.5) * (h / ringCount);
    ctx.strokeStyle = rand() > 0.65 ? grainLight : grainDark;
    ctx.globalAlpha = 0.12 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const waves = 4 + Math.floor(rand() * 4);
    for (let s = 1; s <= waves; s++) {
      const x = (s / waves) * w;
      const prevX = ((s - 1) / waves) * w;
      const ctrlY = y + (rand() - 0.5) * (h / ringCount) * 3;
      ctx.quadraticCurveTo((prevX + x) / 2, ctrlY, x, y + (rand() - 0.5) * (h / ringCount));
    }
    ctx.stroke();
  }

  // Occasional knots
  ctx.globalAlpha = 1;
  const knots = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < knots; k++) {
    const kx = rand() * w;
    const ky = rand() * h;
    const kr = (h / 40) * (0.6 + rand());
    const grad = ctx.createRadialGradient(kx, ky, kr * 0.15, kx, ky, kr);
    grad.addColorStop(0, grainDark);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr * 0.7, kr, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  overlayGrain(ctx, w, h, 22, seed + 7);
}

function drawMarble(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  veinColor: string,
  seed: number
) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);

  // Soft tonal blotching under the veins
  for (let i = 0; i < 24; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (Math.min(w, h) / 4) * (0.4 + rand());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, veinColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.05 + rand() * 0.06;
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Branching veins
  const drawVein = (x: number, y: number, angle: number, len: number, width: number, depth: number) => {
    if (depth > 3 || len < Math.min(w, h) / 30) return;
    ctx.globalAlpha = 0.1 + rand() * 0.25;
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    let cx = x;
    let cy = y;
    let a = angle;
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      a += (rand() - 0.5) * 0.7;
      cx += Math.cos(a) * (len / steps);
      cy += Math.sin(a) * (len / steps);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    if (rand() > 0.35) drawVein(cx, cy, a + (rand() - 0.5) * 1.4, len * 0.6, width * 0.6, depth + 1);
    if (rand() > 0.7) drawVein(cx, cy, a + (rand() - 0.5) * 1.4, len * 0.5, width * 0.5, depth + 1);
  };

  const mainVeins = 5 + Math.floor(rand() * 3);
  const maxWidth = Math.max(1.5, w / 350);
  for (let i = 0; i < mainVeins; i++) {
    drawVein(rand() * w, rand() * h, rand() * Math.PI * 2, Math.min(w, h) * (0.5 + rand()), maxWidth, 0);
  }
  ctx.globalAlpha = 1;
  overlayGrain(ctx, w, h, 10, seed + 3);
}

function drawPaper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  blotch: string,
  seed: number,
  vignette: boolean
) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);

  for (let i = 0; i < 60; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (Math.min(w, h) / 6) * (0.2 + rand());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, blotch);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.03 + rand() * 0.05;
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;

  if (vignette) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(90,60,20,0.28)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  overlayGrain(ctx, w, h, 26, seed + 11);
}

function drawFabric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  thread: string,
  seed: number
) {
  fillBase(ctx, w, h, base);
  const spacing = Math.max(3, Math.round(w / 320));
  ctx.strokeStyle = thread;
  ctx.lineWidth = 1;

  ctx.globalAlpha = 0.16;
  for (let x = 0; x < w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.1;
  for (let y = 0; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  overlayGrain(ctx, w, h, 18, seed);
}

function drawLeather(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, seed: number) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);

  // Pebbled cell structure
  const cells = Math.round((w * h) / 2600);
  for (let i = 0; i < cells; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = Math.max(2, (w / 260) * (0.5 + rand()));
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(255,255,255,0.16)");
    grad.addColorStop(0.6, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  overlayGrain(ctx, w, h, 16, seed + 5);
}

function drawConcrete(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, seed: number) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);
  for (let i = 0; i < 90; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (Math.min(w, h) / 5) * (0.15 + rand());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, rand() > 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.05 + rand() * 0.05;
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  overlayGrain(ctx, w, h, 34, seed + 2);
}

function drawWatercolor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  colors: string[],
  seed: number
) {
  fillBase(ctx, w, h, base);
  const rand = makeRandom(seed);
  for (let i = 0; i < 30; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (Math.min(w, h) / 2.5) * (0.3 + rand());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, colors[Math.floor(rand() * colors.length)]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.14 + rand() * 0.16;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * (0.7 + rand() * 0.5), r * (0.7 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  overlayGrain(ctx, w, h, 14, seed + 9);
}

export const COVER_TEXTURES: CoverTexture[] = [
  {
    id: "wood-oak",
    name: "Light Oak",
    category: "Wood",
    swatch: "#c8a06a",
    draw: (ctx, w, h) => drawWood(ctx, w, h, "#c8a06a", "#8a6538", "#e0c193", 101),
  },
  {
    id: "wood-walnut",
    name: "Dark Walnut",
    category: "Wood",
    swatch: "#5b3d26",
    draw: (ctx, w, h) => drawWood(ctx, w, h, "#5b3d26", "#2e1c0f", "#8a6141", 202),
  },
  {
    id: "wood-driftwood",
    name: "Grey Driftwood",
    category: "Wood",
    swatch: "#9a9287",
    draw: (ctx, w, h) => drawWood(ctx, w, h, "#9a9287", "#66605a", "#c2bcb2", 303),
  },
  {
    id: "marble-white",
    name: "White Marble",
    category: "Marble & Stone",
    swatch: "#f2f0ec",
    draw: (ctx, w, h) => drawMarble(ctx, w, h, "#f2f0ec", "#8d8a85", 404),
  },
  {
    id: "marble-black",
    name: "Black Marble",
    category: "Marble & Stone",
    swatch: "#1e1e22",
    draw: (ctx, w, h) => drawMarble(ctx, w, h, "#1e1e22", "#b9b6ad", 505),
  },
  {
    id: "marble-rose",
    name: "Rose Marble",
    category: "Marble & Stone",
    swatch: "#e8d7d2",
    draw: (ctx, w, h) => drawMarble(ctx, w, h, "#e8d7d2", "#a3766c", 606),
  },
  {
    id: "stone-concrete",
    name: "Concrete",
    category: "Marble & Stone",
    swatch: "#9d9d9b",
    draw: (ctx, w, h) => drawConcrete(ctx, w, h, "#9d9d9b", 707),
  },
  {
    id: "paper-kraft",
    name: "Kraft Paper",
    category: "Paper",
    swatch: "#c2a175",
    draw: (ctx, w, h) => drawPaper(ctx, w, h, "#c2a175", "#8a6a42", 808, false),
  },
  {
    id: "paper-vintage",
    name: "Aged Parchment",
    category: "Paper",
    swatch: "#e6d7b8",
    draw: (ctx, w, h) => drawPaper(ctx, w, h, "#e6d7b8", "#a98d5c", 909, true),
  },
  {
    id: "paper-clean",
    name: "Soft White Paper",
    category: "Paper",
    swatch: "#f7f5f0",
    draw: (ctx, w, h) => drawPaper(ctx, w, h, "#f7f5f0", "#cfc9bb", 1010, false),
  },
  {
    id: "paper-chalkboard",
    name: "Chalkboard",
    category: "Paper",
    swatch: "#2f3a37",
    draw: (ctx, w, h) => drawPaper(ctx, w, h, "#2f3a37", "#7c8b86", 1111, true),
  },
  {
    id: "fabric-linen",
    name: "Natural Linen",
    category: "Fabric & Leather",
    swatch: "#ded5c4",
    draw: (ctx, w, h) => drawFabric(ctx, w, h, "#ded5c4", "#a89b83", 1212),
  },
  {
    id: "fabric-canvas",
    name: "Navy Canvas",
    category: "Fabric & Leather",
    swatch: "#2c3d55",
    draw: (ctx, w, h) => drawFabric(ctx, w, h, "#2c3d55", "#7d90ab", 1313),
  },
  {
    id: "leather-brown",
    name: "Brown Leather",
    category: "Fabric & Leather",
    swatch: "#6b4530",
    draw: (ctx, w, h) => drawLeather(ctx, w, h, "#6b4530", 1414),
  },
  {
    id: "leather-black",
    name: "Black Leather",
    category: "Fabric & Leather",
    swatch: "#26242a",
    draw: (ctx, w, h) => drawLeather(ctx, w, h, "#26242a", 1515),
  },
  {
    id: "watercolor-pastel",
    name: "Pastel Wash",
    category: "Watercolor",
    swatch: "#f3e3ef",
    draw: (ctx, w, h) =>
      drawWatercolor(ctx, w, h, "#fdfaf8", ["#f7c9dd", "#c9dcf7", "#d9f2e4", "#f7e9c9"], 1616),
  },
  {
    id: "watercolor-sunset",
    name: "Sunset Wash",
    category: "Watercolor",
    swatch: "#f6c8a0",
    draw: (ctx, w, h) =>
      drawWatercolor(ctx, w, h, "#fff6ee", ["#f79b6b", "#f2c14e", "#e0637a", "#8d5fa8"], 1717),
  },
  {
    id: "watercolor-ocean",
    name: "Ocean Wash",
    category: "Watercolor",
    swatch: "#a8cfe0",
    draw: (ctx, w, h) =>
      drawWatercolor(ctx, w, h, "#f2fafd", ["#5aa7c4", "#3f7ea8", "#8fd4c8", "#2c5f7a"], 1818),
  },
];

export const TEXTURE_CATEGORIES = Array.from(new Set(COVER_TEXTURES.map((t) => t.category)));

/** Renders a texture to a PNG data URL at the given pixel size. */
export function renderTexture(texture: CoverTexture, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d")!;
  texture.draw(ctx, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
