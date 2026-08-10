import { BorderThemeId, getBorderTheme } from "@/lib/borderThemes";

// Decorative page-border band. Lives entirely inside the same 0.5in margin
// that every puzzle tool already treats as dead/blank space (see
// drawMarginGuides), so no tool's grid-sizing math needs to change to make
// room for it -- the puzzle content area is completely unaffected.
const OUTER_GAP = 0.12; // gap from the true page/trim edge (print safety)
const BAND_INNER = 0.5; // matches the app-wide content margin convention
const CORNER_RESERVE = 0.55; // keep edge motifs clear of the corner accent

function fillBandFrame(doc: any, x0: number, y0: number, x1: number, y1: number, ix0: number, iy0: number, ix1: number, iy1: number, color: string) {
  doc.setFillColor(color);
  doc.rect(x0, y0, x1 - x0, iy0 - y0, "F");
  doc.rect(x0, iy1, x1 - x0, y1 - iy1, "F");
  doc.rect(x0, iy0, ix0 - x0, iy1 - iy0, "F");
  doc.rect(ix1, iy0, x1 - ix1, iy1 - iy0, "F");
}

type Edge = "top" | "bottom" | "left" | "right";

function walkEdges(
  x0: number, y0: number, x1: number, y1: number,
  centerlineInset: number, spacing: number,
  cb: (x: number, y: number, edge: Edge, i: number) => void
) {
  const cx0 = x0 + CORNER_RESERVE, cx1 = x1 - CORNER_RESERVE;
  const cy0 = y0 + CORNER_RESERVE, cy1 = y1 - CORNER_RESERVE;
  const topY = y0 + centerlineInset;
  const bottomY = y1 - centerlineInset;
  const leftX = x0 + centerlineInset;
  const rightX = x1 - centerlineInset;

  let i = 0;
  for (let x = cx0; x <= cx1; x += spacing) cb(x, topY, "top", i++);
  i = 0;
  for (let y = cy0; y <= cy1; y += spacing) cb(rightX, y, "right", i++);
  i = 0;
  for (let x = cx1; x >= cx0; x -= spacing) cb(x, bottomY, "bottom", i++);
  i = 0;
  for (let y = cy1; y >= cy0; y -= spacing) cb(leftX, y, "left", i++);
}

function drawDiamond(doc: any, cx: number, cy: number, r: number, color: string) {
  doc.setFillColor(color);
  doc.triangle(cx, cy - r, cx + r, cy, cx, cy + r, "F");
  doc.triangle(cx, cy - r, cx - r, cy, cx, cy + r, "F");
}

function drawBackToSchool(doc: any, x0: number, y0: number, x1: number, y1: number, colors: string[]) {
  const centerline = (BAND_INNER - OUTER_GAP) / 2 + OUTER_GAP;
  walkEdges(x0, y0, x1, y1, centerline, 0.34, (x, y, _edge, i) => {
    doc.setFillColor(colors[i % colors.length]);
    doc.circle(x, y, 0.062, "F");
  });

  const corners: [number, number][] = [
    [x0 + centerline, y0 + centerline],
    [x1 - centerline, y0 + centerline],
    [x0 + centerline, y1 - centerline],
    [x1 - centerline, y1 - centerline],
  ];
  corners.forEach(([cx, cy], idx) => {
    const c = colors[idx % colors.length];
    doc.setFillColor(c);
    doc.rect(cx - 0.16, cy - 0.035, 0.32, 0.07, "F");
    doc.rect(cx - 0.035, cy - 0.16, 0.07, 0.32, "F");
    doc.setFillColor(colors[(idx + 2) % colors.length]);
    doc.circle(cx, cy, 0.055, "F");
  });
}

function drawBotanical(doc: any, x0: number, y0: number, x1: number, y1: number, colors: string[]) {
  const [leaf, berry1, berry2] = [colors[0], colors[1], colors[2]];
  const centerline = (BAND_INNER - OUTER_GAP) / 2 + OUTER_GAP;
  walkEdges(x0, y0, x1, y1, centerline, 0.3, (x, y, edge, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(leaf);
      if (edge === "top" || edge === "bottom") doc.ellipse(x, y, 0.075, 0.032, "F");
      else doc.ellipse(x, y, 0.032, 0.075, "F");
    } else {
      doc.setFillColor(i % 4 === 1 ? berry1 : berry2);
      doc.circle(x, y, 0.045, "F");
    }
  });

  const corners: [number, number][] = [
    [x0 + centerline, y0 + centerline],
    [x1 - centerline, y0 + centerline],
    [x0 + centerline, y1 - centerline],
    [x1 - centerline, y1 - centerline],
  ];
  corners.forEach(([cx, cy]) => {
    doc.setFillColor(berry1);
    const petalR = 0.1;
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      doc.circle(cx + Math.cos(angle) * petalR, cy + Math.sin(angle) * petalR, 0.075, "F");
    }
    doc.setFillColor(colors[3]);
    doc.circle(cx, cy, 0.06, "F");
  });
}

function drawNeonRetro(doc: any, x0: number, y0: number, x1: number, y1: number, colors: string[], bandBg: string) {
  const ix0 = x0 + (BAND_INNER - OUTER_GAP), iy0 = y0 + (BAND_INNER - OUTER_GAP);
  const ix1 = x1 - (BAND_INNER - OUTER_GAP), iy1 = y1 - (BAND_INNER - OUTER_GAP);
  fillBandFrame(doc, x0, y0, x1, y1, ix0, iy0, ix1, iy1, bandBg);

  const centerline = (BAND_INNER - OUTER_GAP) / 2 + OUTER_GAP;
  walkEdges(x0, y0, x1, y1, centerline, 0.26, (x, y, _edge, i) => {
    doc.setFillColor(colors[i % colors.length]);
    doc.rect(x - 0.045, y - 0.045, 0.09, 0.09, "F");
  });

  const corners: [number, number][] = [
    [x0 + centerline, y0 + centerline],
    [x1 - centerline, y0 + centerline],
    [x0 + centerline, y1 - centerline],
    [x1 - centerline, y1 - centerline],
  ];
  corners.forEach(([cx, cy], idx) => {
    drawDiamond(doc, cx, cy, 0.19, colors[idx % colors.length]);
    drawDiamond(doc, cx, cy, 0.09, colors[(idx + 2) % colors.length]);
  });
}

function drawGeometric(doc: any, x0: number, y0: number, x1: number, y1: number, colors: string[]) {
  const centerline = (BAND_INNER - OUTER_GAP) / 2 + OUTER_GAP;
  walkEdges(x0, y0, x1, y1, centerline, 0.32, (x, y, _edge, i) => {
    const color = colors[i % colors.length];
    doc.setFillColor(color);
    const shape = i % 3;
    if (shape === 0) doc.circle(x, y, 0.06, "F");
    else if (shape === 1) doc.rect(x - 0.055, y - 0.055, 0.11, 0.11, "F");
    else doc.triangle(x, y - 0.07, x + 0.065, y + 0.05, x - 0.065, y + 0.05, "F");
  });

  const corners: [number, number][] = [
    [x0 + centerline, y0 + centerline],
    [x1 - centerline, y0 + centerline],
    [x0 + centerline, y1 - centerline],
    [x1 - centerline, y1 - centerline],
  ];
  corners.forEach(([cx, cy], idx) => {
    doc.setFillColor(colors[idx % colors.length]);
    doc.triangle(cx, cy - 0.2, cx + 0.19, cy + 0.13, cx - 0.19, cy + 0.13, "F");
    doc.setFillColor(colors[(idx + 1) % colors.length]);
    doc.circle(cx, cy + 0.02, 0.075, "F");
  });
}

/**
 * Draws a decorative themed border band inside the page's existing 0.5in
 * margin (the space every puzzle tool already leaves blank), leaving the
 * puzzle content area untouched. No-op for "none"/unset.
 */
export function drawPageBorderTheme(doc: any, themeId: BorderThemeId | undefined | null, pageWidth: number, pageHeight: number, xShift: number = 0) {
  if (!themeId || themeId === "none") return;
  const theme = getBorderTheme(themeId);
  if (theme.id === "none") return;

  const x0 = xShift + OUTER_GAP;
  const y0 = OUTER_GAP;
  const x1 = xShift + pageWidth - OUTER_GAP;
  const y1 = pageHeight - OUTER_GAP;

  doc.saveGraphicsState();
  switch (theme.id) {
    case "back-to-school":
      drawBackToSchool(doc, x0, y0, x1, y1, theme.colors);
      break;
    case "botanical":
      drawBotanical(doc, x0, y0, x1, y1, theme.colors);
      break;
    case "neon-retro":
      drawNeonRetro(doc, x0, y0, x1, y1, theme.colors, theme.bandBg);
      break;
    case "geometric":
      drawGeometric(doc, x0, y0, x1, y1, theme.colors);
      break;
  }
  doc.restoreGraphicsState();
  doc.setFillColor(0, 0, 0);
}
