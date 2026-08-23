export type NonLivingCategory =
  | "Botanical & Floral"
  | "Mandalas & Sacred Geometry"
  | "Stained Glass & Architecture"
  | "Landscapes & Celestial"
  | "Food, Drinks & Kitchen"
  | "Cozy Objects & Still Life"
  | "Abstract & Art Deco"
  | "Single Object Clip-Art"
  | "European Flags"
  | "North American Flags"
  | "Concept Cars";

export interface PresetItem {
  id: string;
  name: string;
  category: NonLivingCategory;
  description: string;
  defaultComplexity: number;
}

export const PRESETS: PresetItem[] = [
  { id: "blank_canvas", name: "➕ Blank Canvas (Draw From Scratch)", category: "Single Object Clip-Art", description: "Clean white 300 DPI page for custom drawing, shapes, lines & coloring from scratch", defaultComplexity: 1 },
  // Botanical
  { id: "tropical_palms", name: "Tropical Palm & Monster Leaves", category: "Botanical & Floral", description: "Overlapping monstera, palm, and fern leaves with fine vein line art", defaultComplexity: 10 },
  { id: "citrus_slices", name: "Citrus Fruit Wheels & Slices", category: "Botanical & Floral", description: "Fresh lemon, lime, and orange wheels with pulp wedges, rind slices and mint leaves", defaultComplexity: 12 },
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

  // Single Object Clip-Art -- bold single-subject line art with a title
  // label underneath, matching classic single-page coloring sheets
  // (fruit/veggie flashcards, food & vehicle coloring books).
  { id: "obj_banana", name: "Banana Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline banana with a title label", defaultComplexity: 12 },
  { id: "obj_apple", name: "Apple Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline apple with stem and leaf", defaultComplexity: 12 },
  { id: "obj_carrot", name: "Carrot Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline carrot with leafy top", defaultComplexity: 12 },
  { id: "obj_tomato", name: "Tomato Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline tomato with a leafy calyx", defaultComplexity: 12 },
  { id: "obj_broccoli", name: "Broccoli Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline broccoli floret cluster", defaultComplexity: 12 },
  { id: "obj_strawberry", name: "Strawberry Clip-Art", category: "Single Object Clip-Art", description: "Single bold-outline strawberry with seeds and leaves", defaultComplexity: 12 },
  { id: "obj_hamburger", name: "Hamburger Clip-Art", category: "Single Object Clip-Art", description: "Stacked bun, lettuce, patty and cheese layers", defaultComplexity: 12 },
  { id: "obj_cupcake", name: "Cupcake Clip-Art", category: "Single Object Clip-Art", description: "Fluted wrapper, frosting swirl and cherry on top", defaultComplexity: 12 },
  { id: "obj_teapot", name: "Teapot Clip-Art", category: "Single Object Clip-Art", description: "Round teapot with spout, handle and lid", defaultComplexity: 12 },
  { id: "obj_hot_air_balloon", name: "Hot Air Balloon Clip-Art", category: "Single Object Clip-Art", description: "Balloon envelope, basket and connecting ropes", defaultComplexity: 12 },

  // Concept Cars -- automotive design sketches: low, wide silhouettes with
  // exotic-car styling cues (flared wheel arches, big wings, wedge noses).
  // Generic archetypes only, no badges or exact proportions copied from any
  // specific trademarked production car.
  { id: "obj_supercar", name: "Wedge Hypercar Clip-Art", category: "Concept Cars", description: "Low wedge supercar with a rear spoiler and alloy wheels", defaultComplexity: 12 },
  { id: "obj_classic_car", name: "Classic Car Clip-Art", category: "Concept Cars", description: "Vintage car with round fenders, headlamp and bumper", defaultComplexity: 12 },
  { id: "obj_gt_coupe", name: "GT Coupe Clip-Art", category: "Concept Cars", description: "Flowing grand-tourer coupe with a long hood and fastback roof", defaultComplexity: 12 },
  { id: "obj_track_car", name: "Wide-Body Track Car Clip-Art", category: "Concept Cars", description: "Flared fenders, front splitter and a tall rear wing", defaultComplexity: 12 },
  { id: "obj_shooting_brake", name: "Shooting Brake Clip-Art", category: "Concept Cars", description: "Low sporty wagon with an elongated glass roofline", defaultComplexity: 12 },
  { id: "obj_roadster", name: "Roadster Clip-Art", category: "Concept Cars", description: "Open-top convertible with a low windshield and headrest fairings", defaultComplexity: 12 },
  { id: "obj_muscle_coupe", name: "Retro Muscle Coupe Clip-Art", category: "Concept Cars", description: "Long-hood muscle car with a hood scoop and fastback roof", defaultComplexity: 12 },

  // European Flags -- outline-only (this is a coloring page, not a filled
  // reference image), so each is just the flag border plus the dividing
  // lines a colorist needs to know where each region starts/stops.
  { id: "flag_france", name: "France Flag Outline", category: "European Flags", description: "Vertical tricolor -- blue, white, red", defaultComplexity: 12 },
  { id: "flag_italy", name: "Italy Flag Outline", category: "European Flags", description: "Vertical tricolor -- green, white, red", defaultComplexity: 12 },
  { id: "flag_belgium", name: "Belgium Flag Outline", category: "European Flags", description: "Vertical tricolor -- black, yellow, red", defaultComplexity: 12 },
  { id: "flag_ireland", name: "Ireland Flag Outline", category: "European Flags", description: "Vertical tricolor -- green, white, orange", defaultComplexity: 12 },
  { id: "flag_germany", name: "Germany Flag Outline", category: "European Flags", description: "Horizontal tricolor -- black, red, gold", defaultComplexity: 12 },
  { id: "flag_netherlands", name: "Netherlands Flag Outline", category: "European Flags", description: "Horizontal tricolor -- red, white, blue", defaultComplexity: 12 },
  { id: "flag_austria", name: "Austria Flag Outline", category: "European Flags", description: "Horizontal tribar -- red, white, red", defaultComplexity: 12 },
  { id: "flag_poland", name: "Poland Flag Outline", category: "European Flags", description: "Horizontal bicolor -- white over red", defaultComplexity: 12 },
  { id: "flag_sweden", name: "Sweden Flag Outline", category: "European Flags", description: "Nordic cross flag", defaultComplexity: 12 },
  { id: "flag_finland", name: "Finland Flag Outline", category: "European Flags", description: "Nordic cross flag", defaultComplexity: 12 },
  { id: "flag_switzerland", name: "Switzerland Flag Outline", category: "European Flags", description: "Square flag with centered cross", defaultComplexity: 12 },
  { id: "flag_uk", name: "United Kingdom Flag Outline", category: "European Flags", description: "Union Jack -- diagonal and straight crosses", defaultComplexity: 12 },

  // North American Flags -- same outline-only approach as European Flags.
  { id: "flag_usa", name: "United States Flag Outline", category: "North American Flags", description: "13 stripes with a starred canton", defaultComplexity: 12 },
  { id: "flag_canada", name: "Canada Flag Outline", category: "North American Flags", description: "Vertical tribar with a center maple leaf", defaultComplexity: 12 },
  { id: "flag_panama", name: "Panama Flag Outline", category: "North American Flags", description: "Quartered flag with two stars", defaultComplexity: 12 },
  { id: "flag_guatemala", name: "Guatemala Flag Outline", category: "North American Flags", description: "Vertical tricolor -- blue, white, blue", defaultComplexity: 12 },
  { id: "flag_costarica", name: "Costa Rica Flag Outline", category: "North American Flags", description: "Horizontal five-stripe flag", defaultComplexity: 12 },
  { id: "flag_cuba", name: "Cuba Flag Outline", category: "North American Flags", description: "Five stripes with a starred triangle hoist", defaultComplexity: 12 },
  { id: "flag_bahamas", name: "Bahamas Flag Outline", category: "North American Flags", description: "Three stripes with a triangle hoist", defaultComplexity: 12 },
  { id: "flag_jamaica", name: "Jamaica Flag Outline", category: "North American Flags", description: "Diagonal cross (saltire) flag", defaultComplexity: 12 },
  { id: "flag_dominican", name: "Dominican Republic Flag Outline", category: "North American Flags", description: "Centered cross with an emblem circle", defaultComplexity: 12 },
  { id: "flag_honduras", name: "Honduras Flag Outline", category: "North American Flags", description: "Horizontal tricolor with five center stars", defaultComplexity: 12 },
  { id: "flag_elsalvador", name: "El Salvador Flag Outline", category: "North American Flags", description: "Horizontal tricolor -- blue, white, blue", defaultComplexity: 12 },
];

export const COLOR_BY_NUMBER_PALETTE = [
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

export interface ColoringPatternOptions {
  presetId: string;
  complexity: number;
  lineWidth: number;
  isColorByNumber: boolean;
  isMidnightMode: boolean;
  frameStyle: "ornamental" | "circle" | "minimal" | "none";
  seed: number;
  // When true, skips the opaque page-color fill so only the line strokes are
  // drawn on a transparent background. Used by the interactive coloring
  // canvas to layer this output over a separate user-paintable layer; every
  // existing caller omits this and keeps the normal opaque page.
  transparentBg?: boolean;
  lineArtScale?: number;
  lineArtOffsetX?: number;
  lineArtOffsetY?: number;
}

// ── Single Object Clip-Art ─────────────────────────────────────────────────
// Each drawer renders one bold-outline non-living subject centered at
// (cx, cy), sized relative to `s` (roughly the icon's half-width). These are
// plain outline coloring pages (no color-by-number numbering), matching
// classic single-subject coloring sheets rather than the abstract/geometric
// presets above.

function drawBanana(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  // Thick curved body with blunt rounded ends (not tapered points) so it
  // reads as a banana rather than a leaf.
  const p0 = { x: cx + s * 0.15, y: cy - s * 1.0 };
  const pc = { x: cx + s * 0.95, y: cy - s * 0.05 };
  const p1 = { x: cx - s * 0.55, y: cy + s * 0.95 };
  const w = s * 0.42;

  ctx.beginPath();
  ctx.moveTo(p0.x + w * 0.3, p0.y - w * 0.1);
  ctx.quadraticCurveTo(pc.x + w, pc.y, p1.x + w * 0.5, p1.y + w * 0.3);
  ctx.quadraticCurveTo(p1.x, p1.y + w * 0.9, p1.x - w * 0.5, p1.y + w * 0.3);
  ctx.quadraticCurveTo(pc.x - w * 0.4, pc.y + w * 0.3, p0.x - w * 0.3, p0.y + w * 0.15);
  ctx.quadraticCurveTo(p0.x, p0.y - w * 0.5, p0.x + w * 0.3, p0.y - w * 0.1);
  ctx.stroke();
  // stem
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y - w * 0.3);
  ctx.lineTo(p0.x + s * 0.2, p0.y - s * 0.28);
  ctx.stroke();
  // ridge line
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.25, cy - s * 0.5);
  ctx.quadraticCurveTo(cx + s * 0.65, cy, cx + s * 0.05, cy + s * 0.55);
  ctx.stroke();
}

function drawLeafCrown(ctx: CanvasRenderingContext2D, cx: number, capY: number, s: number, points: number, spread: number) {
  for (let i = 0; i < points; i++) {
    const t = points === 1 ? 0.5 : i / (points - 1);
    const bx = cx - spread + t * spread * 2;
    const outward = (t - 0.5) * 2;
    const tipX = bx + outward * s * 0.15;
    const tipY = capY - s * (0.55 - Math.abs(outward) * 0.15);
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.06, capY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(bx + s * 0.06, capY);
    ctx.stroke();
  }
}

function drawApple(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx - s * 0.15, cy - s * 0.95, cx - s * 0.85, cy - s * 0.85, cx - s * 0.9, cy - s * 0.15);
  ctx.bezierCurveTo(cx - s * 0.95, cy + s * 0.65, cx - s * 0.35, cy + s * 1.05, cx, cy + s * 1.0);
  ctx.bezierCurveTo(cx + s * 0.35, cy + s * 1.05, cx + s * 0.95, cy + s * 0.65, cx + s * 0.9, cy - s * 0.15);
  ctx.bezierCurveTo(cx + s * 0.85, cy - s * 0.85, cx + s * 0.15, cy - s * 0.95, cx, cy - s * 0.4);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.75);
  ctx.quadraticCurveTo(cx + s * 0.05, cy - s * 1.05, cx - s * 0.05, cy - s * 1.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 1.05);
  ctx.quadraticCurveTo(cx + s * 0.5, cy - s * 1.2, cx + s * 0.45, cy - s * 0.85);
  ctx.quadraticCurveTo(cx + s * 0.15, cy - s * 0.85, cx, cy - s * 1.05);
  ctx.stroke();
}

function drawCarrot(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const topW = s * 0.55;
  const topY = cy - s * 0.6;
  const tipY = cy + s * 1.1;
  ctx.beginPath();
  ctx.moveTo(cx - topW, topY);
  ctx.quadraticCurveTo(cx - topW * 0.6, cy + s * 0.3, cx, tipY);
  ctx.quadraticCurveTo(cx + topW * 0.6, cy + s * 0.3, cx + topW, topY);
  ctx.quadraticCurveTo(cx, topY - s * 0.12, cx - topW, topY);
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    const ty = topY + ((tipY - topY) * i) / 4.2;
    const tw = topW * (1 - i / 5) * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - tw, ty);
    ctx.lineTo(cx + tw * 0.4, ty - s * 0.05);
    ctx.stroke();
  }
  [-0.35, 0, 0.35].forEach((off) => {
    ctx.beginPath();
    const baseX = cx + off * topW * 0.6;
    ctx.moveTo(baseX, topY - s * 0.05);
    ctx.quadraticCurveTo(baseX + off * s * 0.3, topY - s * 0.9, baseX + off * s * 0.15, topY - s * 1.15);
    ctx.quadraticCurveTo(baseX - off * s * 0.1, topY - s * 0.8, baseX, topY - s * 0.05);
    ctx.stroke();
  });
}

function drawTomato(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyCy = cy + s * 0.15;
  ctx.beginPath();
  ctx.arc(cx, bodyCy, s * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  drawLeafCrown(ctx, cx, bodyCy - s * 0.72, s, 5, s * 0.35);
}

function drawBroccoli(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.22, cy + s * 1.05);
  ctx.lineTo(cx - s * 0.32, cy + s * 0.15);
  ctx.lineTo(cx + s * 0.32, cy + s * 0.15);
  ctx.lineTo(cx + s * 0.22, cy + s * 1.05);
  ctx.stroke();
  const bumps: [number, number, number][] = [
    [-0.4, -0.35, 0.42], [0.0, -0.55, 0.48], [0.42, -0.35, 0.42],
    [-0.62, 0.0, 0.34], [0.62, 0.0, 0.34], [-0.15, -0.05, 0.4], [0.2, -0.1, 0.4],
  ];
  bumps.forEach(([ox, oy, r]) => {
    ctx.beginPath();
    ctx.arc(cx + ox * s, cy + oy * s, r * s * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawStrawberry(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const topY = cy - s * 0.55;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 1.1);
  ctx.bezierCurveTo(cx - s * 0.9, cy + s * 0.55, cx - s * 0.85, cy - s * 0.35, cx - s * 0.35, topY);
  ctx.quadraticCurveTo(cx, topY - s * 0.15, cx + s * 0.35, topY);
  ctx.bezierCurveTo(cx + s * 0.85, cy - s * 0.35, cx + s * 0.9, cy + s * 0.55, cx, cy + s * 1.1);
  ctx.stroke();
  [-0.1, 0.25, 0.6].forEach((ry, ri) => {
    const count = 3 + ri;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const rowW = s * (0.55 - ri * 0.08);
      const sx = cx - rowW + t * rowW * 2;
      const sy = cy + ry * s;
      ctx.beginPath();
      ctx.ellipse(sx, sy, s * 0.045, s * 0.07, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  drawLeafCrown(ctx, cx, topY + s * 0.05, s, 5, s * 0.32);
}

function drawHamburger(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const w = s * 1.1;
  let y = cy - s * 1.0;
  ctx.beginPath();
  ctx.moveTo(cx - w, y + s * 0.35);
  ctx.quadraticCurveTo(cx - w, y - s * 0.35, cx, y - s * 0.4);
  ctx.quadraticCurveTo(cx + w, y - s * 0.35, cx + w, y + s * 0.35);
  ctx.stroke();
  [[-0.5, -0.05], [-0.15, -0.2], [0.2, -0.15], [0.5, 0]].forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.ellipse(cx + ox * w, y + oy * s + s * 0.1, s * 0.05, s * 0.08, 0.2, 0, Math.PI * 2);
    ctx.stroke();
  });
  y += s * 0.35;
  ctx.beginPath();
  ctx.moveTo(cx - w, y);
  for (let i = 0; i < 6; i++) {
    const x1 = cx - w + ((w * 2) / 6) * (i + 0.5);
    ctx.quadraticCurveTo(x1, y + (i % 2 === 0 ? -s * 0.18 : s * 0.18), cx - w + ((w * 2) / 6) * (i + 1), y);
  }
  ctx.stroke();
  y += s * 0.22;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.95, y);
  ctx.quadraticCurveTo(cx, y + s * 0.12, cx + w * 0.95, y);
  ctx.lineTo(cx + w * 0.95, y + s * 0.28);
  ctx.quadraticCurveTo(cx, y + s * 0.4, cx - w * 0.95, y + s * 0.28);
  ctx.closePath();
  ctx.stroke();
  y += s * 0.3;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.6, y);
  ctx.lineTo(cx + w * 1.05, y + s * 0.05);
  ctx.lineTo(cx + w * 0.65, y + s * 0.25);
  ctx.stroke();
  y += s * 0.15;
  ctx.beginPath();
  ctx.moveTo(cx - w, y);
  ctx.quadraticCurveTo(cx, y + s * 0.55, cx + w, y);
  ctx.lineTo(cx + w, y + s * 0.02);
  ctx.quadraticCurveTo(cx, y + s * 0.15, cx - w, y + s * 0.02);
  ctx.closePath();
  ctx.stroke();
}

function drawCupcake(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const wrapTopY = cy + s * 0.15;
  const wrapBotY = cy + s * 1.05;
  const topW = s * 0.75, botW = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - topW, wrapTopY);
  ctx.lineTo(cx - botW, wrapBotY);
  ctx.quadraticCurveTo(cx, wrapBotY + s * 0.08, cx + botW, wrapBotY);
  ctx.lineTo(cx + topW, wrapTopY);
  ctx.stroke();
  const flutes = 5;
  for (let i = 0; i <= flutes; i++) {
    const t = i / flutes;
    const xTop = cx - topW + t * topW * 2;
    const xBot = cx - botW + t * botW * 2;
    ctx.beginPath();
    ctx.moveTo(xTop, wrapTopY);
    ctx.quadraticCurveTo((xTop + xBot) / 2 + (i % 2 === 0 ? s * 0.05 : -s * 0.05), (wrapTopY + wrapBotY) / 2, xBot, wrapBotY);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - topW * 0.95, wrapTopY);
  ctx.bezierCurveTo(cx - topW * 0.7, cy - s * 0.55, cx - s * 0.25, cy - s * 0.15, cx, cy - s * 0.5);
  ctx.bezierCurveTo(cx + s * 0.25, cy - s * 0.85, cx + topW * 0.7, cy - s * 0.6, cx + topW * 0.95, wrapTopY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - topW * 0.7, wrapTopY - s * 0.02);
  ctx.quadraticCurveTo(cx, cy - s * 0.05, cx + topW * 0.7, wrapTopY - s * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.85, s * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.98);
  ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 1.15, cx + s * 0.02, cy - s * 1.2);
  ctx.stroke();
}

function drawTeapot(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.15, s * 0.85, s * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 0.5, s * 0.32, s * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy - s * 0.55);
  ctx.quadraticCurveTo(cx, cy - s * 0.85, cx + s * 0.12, cy - s * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.68, s * 0.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.75, cy - s * 0.05);
  ctx.quadraticCurveTo(cx + s * 1.25, cy - s * 0.15, cx + s * 1.3, cy - s * 0.45);
  ctx.moveTo(cx + s * 0.65, cy + s * 0.2);
  ctx.quadraticCurveTo(cx + s * 1.05, cy + s * 0.1, cx + s * 1.12, cy - s * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.8, cy - s * 0.05);
  ctx.bezierCurveTo(cx - s * 1.35, cy - s * 0.1, cx - s * 1.35, cy + s * 0.55, cx - s * 0.75, cy + s * 0.5);
  ctx.stroke();
}

function drawHotAirBalloon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const topY = cy - s * 1.1;
  const neckY = cy + s * 0.25;
  const balW = s * 0.95;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.bezierCurveTo(cx + balW, topY + s * 0.1, cx + balW * 0.75, cy + s * 0.05, cx + s * 0.25, neckY);
  ctx.lineTo(cx - s * 0.25, neckY);
  ctx.bezierCurveTo(cx - balW * 0.75, cy + s * 0.05, cx - balW, topY + s * 0.1, cx, topY);
  ctx.stroke();
  [-0.55, -0.28, 0, 0.28, 0.55].forEach((off) => {
    ctx.beginPath();
    ctx.moveTo(cx + off * balW * 0.05, topY + s * 0.02);
    ctx.quadraticCurveTo(cx + off * balW * 1.1, cy, cx + off * s * 0.4, neckY);
    ctx.stroke();
  });
  const bx = s * 0.35, byTop = cy + s * 0.55, byBot = cy + s * 0.95;
  ctx.beginPath();
  ctx.moveTo(cx - bx, byTop);
  ctx.lineTo(cx - bx * 0.8, byBot);
  ctx.lineTo(cx + bx * 0.8, byBot);
  ctx.lineTo(cx + bx, byTop);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - bx * 0.4, byTop);
  ctx.lineTo(cx - bx * 0.3, byBot);
  ctx.moveTo(cx + bx * 0.4, byTop);
  ctx.lineTo(cx + bx * 0.3, byBot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.25, neckY);
  ctx.lineTo(cx - bx, byTop);
  ctx.moveTo(cx + s * 0.25, neckY);
  ctx.lineTo(cx + bx, byTop);
  ctx.stroke();
}

function drawSupercarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.2;

  // Main wedge silhouette (low pointed nose, flat roof, fastback tail)
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.3, bodyY + s * 0.15);
  ctx.lineTo(cx - s * 1.3, bodyY - s * 0.08);
  ctx.lineTo(cx - s * 1.05, bodyY - s * 0.2);
  ctx.lineTo(cx - s * 0.55, bodyY - s * 0.62);
  ctx.lineTo(cx - s * 0.2, bodyY - s * 0.7);
  ctx.lineTo(cx + s * 0.15, bodyY - s * 0.68);
  ctx.lineTo(cx + s * 0.5, bodyY - s * 0.36);
  ctx.lineTo(cx + s * 1.0, bodyY - s * 0.2);
  ctx.lineTo(cx + s * 1.38, bodyY - s * 0.06);
  ctx.lineTo(cx + s * 1.3, bodyY + s * 0.15);
  ctx.lineTo(cx - s * 1.25, bodyY + s * 0.2);
  ctx.closePath();
  ctx.stroke();

  // Windshield + side glass panel
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, bodyY - s * 0.58);
  ctx.lineTo(cx - s * 0.18, bodyY - s * 0.63);
  ctx.lineTo(cx + s * 0.12, bodyY - s * 0.61);
  ctx.lineTo(cx + s * 0.4, bodyY - s * 0.36);
  ctx.lineTo(cx - s * 0.1, bodyY - s * 0.32);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.02, bodyY - s * 0.62);
  ctx.lineTo(cx - s * 0.08, bodyY - s * 0.33);
  ctx.stroke();

  // Side air intake scoop just ahead of the rear wheel
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, bodyY - s * 0.02);
  ctx.lineTo(cx - s * 0.28, bodyY);
  ctx.lineTo(cx - s * 0.34, bodyY + s * 0.13);
  ctx.lineTo(cx - s * 0.56, bodyY + s * 0.11);
  ctx.closePath();
  ctx.stroke();

  // Beltline crease
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.95, bodyY - s * 0.1);
  ctx.lineTo(cx + s * 0.65, bodyY - s * 0.22);
  ctx.stroke();

  // Rear wing on struts, mounted flush on the trunk deck edge
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.15, bodyY - s * 0.152);
  ctx.lineTo(cx - s * 1.15, bodyY - s * 0.48);
  ctx.moveTo(cx - s * 0.95, bodyY - s * 0.284);
  ctx.lineTo(cx - s * 0.95, bodyY - s * 0.48);
  ctx.moveTo(cx - s * 1.2, bodyY - s * 0.5);
  ctx.lineTo(cx - s * 0.9, bodyY - s * 0.5);
  ctx.stroke();

  // Angular headlight slit
  ctx.beginPath();
  ctx.moveTo(cx + s * 1.14, bodyY - s * 0.1);
  ctx.lineTo(cx + s * 1.29, bodyY - s * 0.02);
  ctx.stroke();

  // Wheels
  ([-0.78, 0.78] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.22, s * 0.27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.22, s * 0.11, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawClassicCarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.15, bodyY - s * 0.02);
  ctx.bezierCurveTo(cx - s * 1.2, bodyY - s * 0.32, cx - s * 1.0, bodyY - s * 0.5, cx - s * 0.72, bodyY - s * 0.5);
  ctx.lineTo(cx - s * 0.6, bodyY - s * 0.78);
  ctx.lineTo(cx + s * 0.32, bodyY - s * 0.78);
  ctx.lineTo(cx + s * 0.48, bodyY - s * 0.5);
  ctx.bezierCurveTo(cx + s * 0.72, bodyY - s * 0.5, cx + s * 0.95, bodyY - s * 0.35, cx + s * 1.02, bodyY - s * 0.08);
  ctx.bezierCurveTo(cx + s * 1.22, bodyY - s * 0.1, cx + s * 1.35, bodyY + s * 0.05, cx + s * 1.3, bodyY + s * 0.22);
  ctx.lineTo(cx + s * 1.05, bodyY + s * 0.22);
  ctx.bezierCurveTo(cx + s * 1.02, bodyY + s * 0.02, cx + s * 0.85, bodyY - s * 0.05, cx + s * 0.68, bodyY - s * 0.02);
  ctx.bezierCurveTo(cx + s * 0.52, bodyY + s * 0.02, cx + s * 0.45, bodyY + s * 0.1, cx + s * 0.42, bodyY + s * 0.22);
  ctx.lineTo(cx - s * 0.42, bodyY + s * 0.22);
  ctx.bezierCurveTo(cx - s * 0.45, bodyY + s * 0.1, cx - s * 0.52, bodyY + s * 0.02, cx - s * 0.68, bodyY - s * 0.02);
  ctx.bezierCurveTo(cx - s * 0.85, bodyY - s * 0.05, cx - s * 1.0, bodyY + s * 0.02, cx - s * 1.05, bodyY + s * 0.22);
  ctx.lineTo(cx - s * 1.28, bodyY + s * 0.22);
  ctx.bezierCurveTo(cx - s * 1.35, bodyY + s * 0.05, cx - s * 1.25, bodyY - s * 0.05, cx - s * 1.15, bodyY - s * 0.02);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.58, bodyY - s * 0.48);
  ctx.lineTo(cx - s * 0.44, bodyY - s * 0.74);
  ctx.moveTo(cx - s * 0.1, bodyY - s * 0.48);
  ctx.lineTo(cx - s * 0.1, bodyY - s * 0.75);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + s * 0.62, bodyY - s * 0.22, s * 0.09, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 1.3, bodyY + s * 0.28);
  ctx.lineTo(cx + s * 1.28, bodyY + s * 0.28);
  ctx.stroke();

  ([-0.72, 0.72] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.24, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.24, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawGTCoupeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.18;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.15, bodyY + s * 0.15);
  ctx.lineTo(cx - s * 1.18, bodyY - s * 0.02);
  ctx.quadraticCurveTo(cx - s * 1.1, bodyY - s * 0.18, cx - s * 0.9, bodyY - s * 0.2);
  ctx.bezierCurveTo(cx - s * 0.75, bodyY - s * 0.55, cx - s * 0.55, bodyY - s * 0.68, cx - s * 0.25, bodyY - s * 0.66);
  ctx.bezierCurveTo(cx - s * 0.02, bodyY - s * 0.65, cx + s * 0.12, bodyY - s * 0.58, cx + s * 0.22, bodyY - s * 0.42);
  ctx.bezierCurveTo(cx + s * 0.4, bodyY - s * 0.32, cx + s * 0.65, bodyY - s * 0.28, cx + s * 0.85, bodyY - s * 0.2);
  ctx.bezierCurveTo(cx + s * 1.05, bodyY - s * 0.14, cx + s * 1.25, bodyY - s * 0.08, cx + s * 1.32, bodyY + s * 0.08);
  ctx.lineTo(cx + s * 1.28, bodyY + s * 0.2);
  ctx.lineTo(cx - s * 1.12, bodyY + s * 0.2);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.62, bodyY - s * 0.4);
  ctx.bezierCurveTo(cx - s * 0.5, bodyY - s * 0.58, cx - s * 0.15, bodyY - s * 0.6, cx + s * 0.08, bodyY - s * 0.5);
  ctx.bezierCurveTo(cx + s * 0.16, bodyY - s * 0.46, cx + s * 0.2, bodyY - s * 0.4, cx + s * 0.2, bodyY - s * 0.32);
  ctx.lineTo(cx - s * 0.62, bodyY - s * 0.32);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.15, bodyY - s * 0.32);
  ctx.lineTo(cx - s * 0.2, bodyY + s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.95, bodyY - s * 0.02);
  ctx.lineTo(cx + s * 0.85, bodyY - s * 0.15);
  ctx.stroke();

  ([-0.68, 0.78] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawTrackCarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.22;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.32, bodyY + s * 0.1);
  ctx.lineTo(cx - s * 1.34, bodyY - s * 0.05);
  ctx.lineTo(cx - s * 1.15, bodyY - s * 0.15);
  ctx.quadraticCurveTo(cx - s * 0.95, bodyY - s * 0.42, cx - s * 0.72, bodyY - s * 0.3);
  ctx.lineTo(cx - s * 0.5, bodyY - s * 0.6);
  ctx.lineTo(cx - s * 0.1, bodyY - s * 0.65);
  ctx.lineTo(cx + s * 0.25, bodyY - s * 0.58);
  ctx.lineTo(cx + s * 0.5, bodyY - s * 0.32);
  ctx.quadraticCurveTo(cx + s * 0.75, bodyY - s * 0.42, cx + s * 0.98, bodyY - s * 0.28);
  ctx.lineTo(cx + s * 1.15, bodyY - s * 0.14);
  ctx.lineTo(cx + s * 1.42, bodyY - s * 0.02);
  ctx.lineTo(cx + s * 1.32, bodyY + s * 0.14);
  ctx.lineTo(cx - s * 1.26, bodyY + s * 0.16);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, bodyY - s * 0.56);
  ctx.lineTo(cx - s * 0.08, bodyY - s * 0.59);
  ctx.lineTo(cx + s * 0.2, bodyY - s * 0.5);
  ctx.lineTo(cx + s * 0.35, bodyY - s * 0.3);
  ctx.lineTo(cx - s * 0.42, bodyY - s * 0.28);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.38, bodyY - s * 0.02);
  ctx.lineTo(cx - s * 0.16, bodyY);
  ctx.lineTo(cx - s * 0.22, bodyY + s * 0.1);
  ctx.lineTo(cx - s * 0.44, bodyY + s * 0.08);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 1.05, bodyY - s * 0.1);
  ctx.lineTo(cx - s * 1.05, bodyY - s * 0.55);
  ctx.moveTo(cx - s * 0.85, bodyY - s * 0.15);
  ctx.lineTo(cx - s * 0.85, bodyY - s * 0.55);
  ctx.moveTo(cx - s * 1.12, bodyY - s * 0.58);
  ctx.lineTo(cx - s * 0.78, bodyY - s * 0.58);
  ctx.stroke();

  ([-0.85, 0.88] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.18, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.18, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawShootingBrakeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.15, bodyY + s * 0.16);
  ctx.lineTo(cx - s * 1.2, bodyY - s * 0.15);
  ctx.lineTo(cx - s * 1.0, bodyY - s * 0.35);
  ctx.lineTo(cx - s * 0.2, bodyY - s * 0.42);
  ctx.lineTo(cx + s * 0.3, bodyY - s * 0.38);
  ctx.lineTo(cx + s * 0.55, bodyY - s * 0.22);
  ctx.lineTo(cx + s * 1.0, bodyY - s * 0.14);
  ctx.lineTo(cx + s * 1.35, bodyY);
  ctx.lineTo(cx + s * 1.28, bodyY + s * 0.18);
  ctx.lineTo(cx - s * 1.1, bodyY + s * 0.18);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.88, bodyY - s * 0.3);
  ctx.lineTo(cx - s * 0.2, bodyY - s * 0.35);
  ctx.lineTo(cx + s * 0.25, bodyY - s * 0.31);
  ctx.lineTo(cx + s * 0.42, bodyY - s * 0.16);
  ctx.lineTo(cx - s * 0.92, bodyY - s * 0.1);
  ctx.closePath();
  ctx.stroke();
  ([-0.55, -0.05] as const).forEach((px) => {
    ctx.beginPath();
    ctx.moveTo(cx + px * s, bodyY - s * 0.33);
    ctx.lineTo(cx + px * s - s * 0.02, bodyY - s * 0.11);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.95, bodyY - s * 0.04);
  ctx.lineTo(cx + s * 0.9, bodyY - s * 0.11);
  ctx.stroke();

  ([-0.68, 0.82] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawRoadsterIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.15, bodyY + s * 0.15);
  ctx.lineTo(cx - s * 1.18, bodyY - s * 0.02);
  ctx.lineTo(cx - s * 0.95, bodyY - s * 0.12);
  ctx.quadraticCurveTo(cx - s * 0.75, bodyY - s * 0.28, cx - s * 0.55, bodyY - s * 0.22);
  ctx.quadraticCurveTo(cx - s * 0.45, bodyY - s * 0.16, cx - s * 0.4, bodyY - s * 0.24);
  ctx.quadraticCurveTo(cx - s * 0.3, bodyY - s * 0.3, cx - s * 0.15, bodyY - s * 0.22);
  ctx.lineTo(cx - s * 0.05, bodyY - s * 0.14);
  ctx.lineTo(cx + s * 0.05, bodyY - s * 0.42);
  ctx.lineTo(cx + s * 0.18, bodyY - s * 0.4);
  ctx.lineTo(cx + s * 0.35, bodyY - s * 0.2);
  ctx.lineTo(cx + s * 0.95, bodyY - s * 0.15);
  ctx.lineTo(cx + s * 1.3, bodyY - s * 0.02);
  ctx.lineTo(cx + s * 1.25, bodyY + s * 0.18);
  ctx.lineTo(cx - s * 1.1, bodyY + s * 0.18);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.05, bodyY - s * 0.05);
  ctx.lineTo(cx - s * 0.1, bodyY + s * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.9, bodyY - s * 0.02);
  ctx.lineTo(cx + s * 0.7, bodyY - s * 0.1);
  ctx.stroke();

  ([-0.7, 0.78] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawMuscleCoupeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const bodyY = cy + s * 0.18;
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.2, bodyY + s * 0.18);
  ctx.lineTo(cx - s * 1.22, bodyY - s * 0.05);
  ctx.lineTo(cx - s * 1.0, bodyY - s * 0.15);
  ctx.lineTo(cx - s * 0.85, bodyY - s * 0.4);
  ctx.lineTo(cx - s * 0.68, bodyY - s * 0.3);
  ctx.lineTo(cx - s * 0.45, bodyY - s * 0.58);
  ctx.lineTo(cx - s * 0.1, bodyY - s * 0.63);
  ctx.lineTo(cx + s * 0.2, bodyY - s * 0.58);
  ctx.lineTo(cx + s * 0.35, bodyY - s * 0.4);
  ctx.lineTo(cx + s * 1.15, bodyY - s * 0.32);
  ctx.lineTo(cx + s * 1.35, bodyY - s * 0.15);
  ctx.lineTo(cx + s * 1.28, bodyY + s * 0.15);
  ctx.lineTo(cx - s * 1.15, bodyY + s * 0.18);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + s * 0.55, bodyY - s * 0.36);
  ctx.lineTo(cx + s * 0.72, bodyY - s * 0.42);
  ctx.lineTo(cx + s * 0.92, bodyY - s * 0.4);
  ctx.lineTo(cx + s * 0.85, bodyY - s * 0.33);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.6, bodyY - s * 0.36);
  ctx.lineTo(cx - s * 0.3, bodyY - s * 0.53);
  ctx.lineTo(cx + s * 0.05, bodyY - s * 0.55);
  ctx.lineTo(cx + s * 0.22, bodyY - s * 0.4);
  ctx.lineTo(cx - s * 0.6, bodyY - s * 0.32);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.95, bodyY - s * 0.05);
  ctx.lineTo(cx + s * 1.0, bodyY - s * 0.2);
  ctx.stroke();

  ([-0.72, 0.85] as const).forEach((wx) => {
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + wx * s, bodyY + s * 0.2, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  });
}

// ── Food, Drinks & Kitchen pattern icons ────────────────────────────────
// Food & Drink pattern icons (drawn repeatedly in a grid via drawFoodIconGrid).

function drawCoffeeCupIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy - r * 0.35);
  ctx.lineTo(cx - r * 0.45, cy + r * 0.55);
  ctx.quadraticCurveTo(cx, cy + r * 0.75, cx + r * 0.45, cy + r * 0.55);
  ctx.lineTo(cx + r * 0.55, cy - r * 0.35);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.35, r * 0.55, r * 0.12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.75, cy + r * 0.05, r * 0.22, r * 0.28, 0, -0.6, 2.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.8, r * 0.72, r * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();
  [-0.22, 0.22].forEach((off) => {
    ctx.beginPath();
    ctx.moveTo(cx + off * r, cy - r * 0.45);
    ctx.bezierCurveTo(
      cx + off * r - r * 0.18, cy - r * 0.75,
      cx + off * r + r * 0.18, cy - r * 0.9,
      cx + off * r, cy - r * 1.15
    );
    ctx.stroke();
  });
}

function drawCoffeeBeanIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.5, r * 0.75, Math.PI / 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.22, cy - r * 0.55);
  ctx.quadraticCurveTo(cx, cy, cx + r * 0.22, cy + r * 0.55);
  ctx.stroke();
}

function drawMacaronIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.02, r * 0.62, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.18, r * 0.62, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.62, cy - r * 0.02);
  ctx.lineTo(cx - r * 0.62, cy + r * 0.18);
  ctx.moveTo(cx + r * 0.62, cy - r * 0.02);
  ctx.lineTo(cx + r * 0.62, cy + r * 0.18);
  ctx.stroke();
  ctx.beginPath();
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const x = cx - r * 0.55 + (r * 1.1 / steps) * i;
    const y = cy + r * 0.08 + (i % 2 === 0 ? -r * 0.05 : r * 0.05);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  [[-0.22, -0.28], [0.08, -0.32], [0.3, -0.18]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(cx + dx * r, cy + dy * r, r * 0.05, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawCroissantIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.65, cy + r * 0.15);
  ctx.quadraticCurveTo(cx - r * 0.55, cy - r * 0.7, cx + r * 0.1, cy - r * 0.55);
  ctx.quadraticCurveTo(cx + r * 0.6, cy - r * 0.4, cx + r * 0.65, cy - r * 0.02);
  ctx.quadraticCurveTo(cx + r * 0.25, cy - r * 0.12, cx - r * 0.05, cy + r * 0.18);
  ctx.quadraticCurveTo(cx - r * 0.3, cy + r * 0.42, cx - r * 0.65, cy + r * 0.15);
  ctx.closePath();
  ctx.stroke();
  ([
    [-0.38, -0.28, -0.12, 0.02],
    [-0.1, -0.48, 0.18, -0.18],
    [0.15, -0.45, 0.4, -0.05],
  ] as const).forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(cx + x1 * r, cy + y1 * r);
    ctx.lineTo(cx + x2 * r, cy + y2 * r);
    ctx.stroke();
  });
}

function drawTartIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const scallops = 10;
  ctx.beginPath();
  for (let i = 0; i < scallops; i++) {
    const a1 = (i / scallops) * Math.PI * 2;
    const mx = cx + Math.cos(a1) * r * 0.68;
    const my = cy + Math.sin(a1) * r * 0.68;
    if (i === 0) ctx.moveTo(mx, my);
    const a2 = ((i + 1) / scallops) * Math.PI * 2;
    const ex = cx + Math.cos(a2) * r * 0.68;
    const ey = cy + Math.sin(a2) * r * 0.68;
    const bulgeA = (a1 + a2) / 2;
    const bx = cx + Math.cos(bulgeA) * r * 0.82;
    const by = cy + Math.sin(bulgeA) * r * 0.82;
    ctx.quadraticCurveTo(bx, by, ex, ey);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  [[-0.15, -0.1], [0.15, 0.05], [0, 0.22]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(cx + dx * r, cy + dy * r, r * 0.09, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawTeacupIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.3);
  ctx.lineTo(cx - r * 0.4, cy + r * 0.45);
  ctx.quadraticCurveTo(cx, cy + r * 0.62, cx + r * 0.4, cy + r * 0.45);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.3);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.3, r * 0.5, r * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.66, cy - r * 0.02, r * 0.18, r * 0.22, 0, -0.6, 2.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.68, r * 0.68, r * 0.13, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.4);
  ctx.bezierCurveTo(cx - r * 0.15, cy - r * 0.65, cx + r * 0.15, cy - r * 0.8, cx, cy - r * 1.0);
  ctx.stroke();
}

function drawTeaLeafIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.7);
  ctx.quadraticCurveTo(cx + r * 0.65, cy - r * 0.3, cx, cy + r * 0.7);
  ctx.quadraticCurveTo(cx - r * 0.65, cy - r * 0.3, cx, cy - r * 0.7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.6);
  ctx.lineTo(cx, cy + r * 0.6);
  [-0.3, 0, 0.3].forEach((t) => {
    const vy = cy + t * r;
    ctx.moveTo(cx, vy);
    ctx.lineTo(cx + r * 0.3, vy - r * 0.12);
    ctx.moveTo(cx, vy);
    ctx.lineTo(cx - r * 0.3, vy - r * 0.12);
  });
  ctx.stroke();
}

function drawMasonJarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const top = cy - r * 0.85, bot = cy + r * 0.75;
  const wTop = r * 0.55, wBot = r * 0.68;
  ctx.beginPath();
  ctx.moveTo(cx - wTop, top + r * 0.18);
  ctx.lineTo(cx - wTop, top + r * 0.35);
  ctx.lineTo(cx - wBot, top + r * 0.65);
  ctx.lineTo(cx - wBot, bot - r * 0.15);
  ctx.quadraticCurveTo(cx - wBot, bot, cx - wBot + r * 0.15, bot);
  ctx.lineTo(cx + wBot - r * 0.15, bot);
  ctx.quadraticCurveTo(cx + wBot, bot, cx + wBot, bot - r * 0.15);
  ctx.lineTo(cx + wBot, top + r * 0.65);
  ctx.lineTo(cx + wTop, top + r * 0.35);
  ctx.lineTo(cx + wTop, top + r * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(cx - wTop, top, wTop * 2, r * 0.18);
  ctx.stroke();
  [0.06, 0.11].forEach((off) => {
    ctx.beginPath();
    ctx.moveTo(cx - wTop, top + r * off);
    ctx.lineTo(cx + wTop, top + r * off);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.1, top - r * 0.05);
  ctx.lineTo(cx + r * 0.35, top - r * 0.55);
  ctx.stroke();
  const pearlY = bot - r * 0.28;
  [-0.32, -0.08, 0.16, 0.4].forEach((px, i) => {
    ctx.beginPath();
    ctx.arc(cx + px * r, pearlY - (i % 2) * r * 0.12, r * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawFruitWedgeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.75);
  ctx.lineTo(cx - r * 0.05, cy - r * 0.7);
  ctx.arc(cx, cy - r * 0.7, r * 0.05, Math.PI, 0, false);
  ctx.lineTo(cx + r * 0.65, cy + r * 0.6);
  ctx.quadraticCurveTo(cx + r * 0.55, cy + r * 0.78, cx + r * 0.35, cy + r * 0.75);
  ctx.closePath();
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.7 * (1 - t) + r * -0.7 * t);
    ctx.lineTo(cx + r * 0.6 * t, cy + r * 0.7 * (1 - t) * 0.6 + r * 0.1);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.7);
  ctx.lineTo(cx, cy + r * 0.7);
  ctx.stroke();
}

function drawFoodIconGrid(
  ctx: CanvasRenderingContext2D,
  icons: Array<(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void>,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean
) {
  const cols = Math.ceil(Math.sqrt(density));
  const rows = cols;
  const stepX = innerW / cols;
  const stepY = innerH / rows;
  let numIdx = 1;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * stepX + stepX / 2;
      const y = margin + r * stepY + stepY / 2;
      const rad = Math.min(stepX, stepY) * 0.4;
      icons[idx % icons.length](ctx, x, y, rad);
      idx++;
      if (isColorByNumber && (r + c) % 2 === 0) {
        ctx.fillStyle = strokeColor;
        ctx.font = `bold ${Math.max(10, Math.floor(width * 0.014))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${(numIdx % 9) + 1}`, x, y + rad + 14);
        numIdx++;
      }
    }
  }
}

// ── Shared scene accents (moon, sparkle) ─────────────────────────────────

function drawCrescentMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.arc(cx + r * 0.55, cy, r * 0.78, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.closePath();
  ctx.stroke();
}function drawSparkleStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const rad = Math.max(2, r);
  ctx.beginPath();
  ctx.moveTo(cx, cy - rad); ctx.lineTo(cx, cy + rad);
  ctx.moveTo(cx - rad, cy); ctx.lineTo(cx + rad, cy);
  ctx.stroke();
}

// ── Botanical & Floral Full-Page Patterns ─────────────────────────────────

function drawTropicalPalmsPattern(
  ctx: CanvasRenderingContext2D,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean
) {
  let numIdx = 1;
  const cx = margin + innerW / 2;
  const cy = margin + innerH / 2;

  const palmCorners = [
    { x: margin, y: margin, angle: Math.PI / 4, r: innerW * 0.44 },
    { x: margin + innerW, y: margin, angle: (3 * Math.PI) / 4, r: innerW * 0.44 },
    { x: margin, y: margin + innerH, angle: -Math.PI / 4, r: innerW * 0.44 },
    { x: margin + innerW, y: margin + innerH, angle: (-3 * Math.PI) / 4, r: innerW * 0.44 },
  ];

  palmCorners.forEach(({ x, y, angle, r }) => {
    const endX = x + Math.cos(angle) * r;
    const endY = y + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(angle) * r * 0.5, y + Math.sin(angle) * r * 0.3, endX, endY);
    ctx.stroke();

    const leaflets = 10;
    for (let i = 2; i <= leaflets; i++) {
      const t = i / leaflets;
      const lx = x + (endX - x) * t;
      const ly = y + (endY - y) * t;
      const leafLen = r * 0.3 * (1 - t * 0.35);
      [-1, 1].forEach((side) => {
        const leafA = angle + side * 0.65;
        const tipX = lx + Math.cos(leafA) * leafLen;
        const tipY = ly + Math.sin(leafA) * leafLen;
        const nx = -Math.sin(leafA) * leafLen * 0.18;
        const ny = Math.cos(leafA) * leafLen * 0.18;

        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.quadraticCurveTo(lx + (tipX - lx) * 0.5 + nx, ly + (tipY - ly) * 0.5 + ny, tipX, tipY);
        ctx.quadraticCurveTo(lx + (tipX - lx) * 0.5 - nx, ly + (tipY - ly) * 0.5 - ny, lx, ly);
        ctx.closePath();
        ctx.stroke();

        if (isColorByNumber && i % 3 === 0 && side === 1) {
          ctx.fillStyle = strokeColor;
          ctx.font = `bold ${Math.max(9, Math.floor(width * 0.012))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${(numIdx % 9) + 1}`, lx + (tipX - lx) * 0.5, ly + (tipY - ly) * 0.5);
          numIdx++;
        }
      });
    }
  });

  const monsteraPositions = [
    { x: cx - innerW * 0.18, y: cy - innerH * 0.12, r: innerW * 0.24, rot: -0.2 },
    { x: cx + innerW * 0.18, y: cy + innerH * 0.12, r: innerW * 0.24, rot: 0.3 },
    { x: cx, y: cy, r: innerW * 0.22, rot: -0.1 },
  ];

  monsteraPositions.forEach(({ x, y, r, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.bezierCurveTo(r * 0.8, -r * 0.7, r * 0.7, r * 0.6, 0, r * 0.95);
    ctx.bezierCurveTo(-r * 0.7, r * 0.6, -r * 0.8, -r * 0.7, 0, -r * 0.85);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.75);
    ctx.lineTo(0, r * 0.85);
    ctx.stroke();

    const slits = [
      { side: -1, dy: -0.4, w: 0.11, h: 0.25, a: -0.4 },
      { side: -1, dy: -0.1, w: 0.13, h: 0.3, a: -0.3 },
      { side: -1, dy: 0.25, w: 0.11, h: 0.22, a: -0.2 },
      { side: 1, dy: -0.4, w: 0.11, h: 0.25, a: 0.4 },
      { side: 1, dy: -0.1, w: 0.13, h: 0.3, a: 0.3 },
      { side: 1, dy: 0.25, w: 0.11, h: 0.22, a: 0.2 },
    ];

    slits.forEach(({ side, dy, w, h, a }) => {
      const sx = side * r * 0.35;
      const sy = dy * r;
      const rx = Math.max(2, w * r);
      const ry = Math.max(3, h * r);
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx, ry, a, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(side * r * 0.65, sy + dy * r * 0.3);
      ctx.stroke();
    });

    ctx.restore();
  });
}

function drawRoseLatticePattern(
  ctx: CanvasRenderingContext2D,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean
) {
  let numIdx = 1;

  const latticeSpacing = innerW / 8;
  ctx.save();
  ctx.lineWidth = Math.max(1, width * 0.002);
  for (let x = margin - innerH; x <= margin + innerW + innerH; x += latticeSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x + innerH, margin + innerH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, margin + innerH);
    ctx.lineTo(x + innerH, margin);
    ctx.stroke();
  }
  ctx.restore();

  const roseSpots = [
    { x: margin + innerW * 0.22, y: margin + innerH * 0.22, r: innerW * 0.13 },
    { x: margin + innerW * 0.78, y: margin + innerH * 0.25, r: innerW * 0.14 },
    { x: margin + innerW * 0.5, y: margin + innerH * 0.5, r: innerW * 0.16 },
    { x: margin + innerW * 0.2, y: margin + innerH * 0.78, r: innerW * 0.14 },
    { x: margin + innerW * 0.78, y: margin + innerH * 0.78, r: innerW * 0.13 },
    { x: margin + innerW * 0.35, y: margin + innerH * 0.38, r: innerW * 0.08 },
    { x: margin + innerW * 0.65, y: margin + innerH * 0.65, r: innerW * 0.08 },
  ];

  ctx.beginPath();
  ctx.moveTo(margin + innerW * 0.1, margin + innerH * 0.1);
  ctx.bezierCurveTo(margin + innerW * 0.4, margin + innerH * 0.2, margin + innerW * 0.3, margin + innerH * 0.6, margin + innerW * 0.8, margin + innerH * 0.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin + innerW * 0.9, margin + innerH * 0.1);
  ctx.bezierCurveTo(margin + innerW * 0.6, margin + innerH * 0.4, margin + innerW * 0.7, margin + innerH * 0.8, margin + innerW * 0.2, margin + innerH * 0.9);
  ctx.stroke();

  roseSpots.forEach(({ x, y, r }) => {
    const leafAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    leafAngles.forEach((la) => {
      const lx = x + Math.cos(la) * (r * 1.25);
      const ly = y + Math.sin(la) * (r * 1.25);
      const lr = r * 0.45;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lr, lr * 0.5, la, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(la) * r * 0.8, y + Math.sin(la) * r * 0.8);
      ctx.lineTo(x + Math.cos(la) * (r * 1.6), y + Math.sin(la) * (r * 1.6));
      ctx.stroke();
    });

    const layers = [
      { petals: 7, scale: 0.95 },
      { petals: 6, scale: 0.72 },
      { petals: 5, scale: 0.5 },
      { petals: 4, scale: 0.3 },
    ];

    layers.forEach(({ petals, scale }, layerIdx) => {
      const pr = r * scale;
      for (let p = 0; p < petals; p++) {
        const a1 = (p * Math.PI * 2) / petals + layerIdx * 0.4;
        const a2 = ((p + 1) * Math.PI * 2) / petals + layerIdx * 0.4;
        const midA = (a1 + a2) / 2;

        const p1x = x + Math.cos(a1) * (pr * 0.6);
        const p1y = y + Math.sin(a1) * (pr * 0.6);
        const p2x = x + Math.cos(a2) * (pr * 0.6);
        const p2y = y + Math.sin(a2) * (pr * 0.6);
        const tipX = x + Math.cos(midA) * pr;
        const tipY = y + Math.sin(midA) * pr;

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(tipX + Math.sin(midA) * (pr * 0.2), tipY - Math.cos(midA) * (pr * 0.2), tipX, tipY);
        ctx.quadraticCurveTo(tipX - Math.sin(midA) * (pr * 0.2), tipY + Math.cos(midA) * (pr * 0.2), p2x, p2y);
        ctx.closePath();
        ctx.stroke();

        if (isColorByNumber && layerIdx === 0 && p % 2 === 0) {
          ctx.fillStyle = strokeColor;
          ctx.font = `bold ${Math.max(9, Math.floor(width * 0.012))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${(numIdx % 9) + 1}`, tipX * 0.9 + x * 0.1, tipY * 0.9 + y * 0.1);
          numIdx++;
        }
      }
    });

    ctx.beginPath();
    ctx.arc(x, y, r * 0.15, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawSucculentTerrariumPattern(
  ctx: CanvasRenderingContext2D,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean,
  cx: number,
  cy: number
) {
  let numIdx = 1;

  const tw = innerW * 0.44;
  const th = innerH * 0.42;
  const topY = cy - th;
  const midY = cy + th * 0.1;
  const botY = cy + th * 0.95;

  const points = {
    top: [cx, topY],
    topL: [cx - tw * 0.6, cy - th * 0.4],
    topR: [cx + tw * 0.6, cy - th * 0.4],
    midL: [cx - tw, midY],
    midML: [cx - tw * 0.35, midY + th * 0.1],
    midMR: [cx + tw * 0.35, midY + th * 0.1],
    midR: [cx + tw, midY],
    botL: [cx - tw * 0.6, botY],
    botM: [cx, botY + th * 0.08],
    botR: [cx + tw * 0.6, botY],
  };

  ctx.beginPath();
  ctx.moveTo(points.top[0], points.top[1]);
  ctx.lineTo(points.topR[0], points.topR[1]);
  ctx.lineTo(points.midR[0], points.midR[1]);
  ctx.lineTo(points.botR[0], points.botR[1]);
  ctx.lineTo(points.botM[0], points.botM[1]);
  ctx.lineTo(points.botL[0], points.botL[1]);
  ctx.lineTo(points.midL[0], points.midL[1]);
  ctx.lineTo(points.topL[0], points.topL[1]);
  ctx.closePath();
  ctx.stroke();

  const facetLines = [
    [points.top, points.topL],
    [points.top, points.topR],
    [points.top, points.midML],
    [points.top, points.midMR],
    [points.topL, points.midL],
    [points.topL, points.midML],
    [points.topR, points.midR],
    [points.topR, points.midMR],
    [points.midL, points.botL],
    [points.midML, points.botL],
    [points.midML, points.botM],
    [points.midMR, points.botM],
    [points.midMR, points.botR],
    [points.midR, points.botR],
    [points.midML, points.midMR],
  ];

  facetLines.forEach(([p1, p2]) => {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(cx, margin);
  ctx.lineTo(cx, topY);
  ctx.stroke();
  const chainStep = Math.max(8, (topY - margin) / 8);
  for (let y = margin; y < topY; y += chainStep) {
    ctx.beginPath();
    ctx.ellipse(cx, y + chainStep / 2, Math.max(2, width * 0.005), Math.max(3, chainStep * 0.4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let layer = 0; layer < 3; layer++) {
    const pebbleY = botY - (layer + 1) * (th * 0.08);
    const pebbleCount = 8 - layer * 2;
    const pStep = (tw * 1.1) / pebbleCount;
    for (let p = 0; p < pebbleCount; p++) {
      const px = cx - (tw * 0.55) + p * pStep + pStep / 2;
      ctx.beginPath();
      ctx.ellipse(px, pebbleY, Math.max(3, pStep * 0.45), Math.max(2, th * 0.035), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const sx = cx;
  const sy = midY + th * 0.06;
  const sRad = tw * 0.42;

  const rings = [
    { petals: 8, r: sRad },
    { petals: 7, r: sRad * 0.72 },
    { petals: 6, r: sRad * 0.46 },
    { petals: 4, r: sRad * 0.24 },
  ];

  rings.forEach(({ petals, r: ringR }, ringIdx) => {
    for (let p = 0; p < petals; p++) {
      const a = (p * Math.PI * 2) / petals + ringIdx * 0.35;
      const tipX = sx + Math.cos(a) * ringR;
      const tipY = sy + Math.sin(a) * ringR;
      const w = ringR * 0.3;
      const nx = -Math.sin(a) * w;
      const ny = Math.cos(a) * w;
      const baseR = ringR * 0.3;
      const bx = sx + Math.cos(a) * baseR;
      const by = sy + Math.sin(a) * baseR;

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + (tipX - bx) * 0.5 + nx, by + (tipY - by) * 0.5 + ny, tipX, tipY);
      ctx.quadraticCurveTo(bx + (tipX - bx) * 0.5 - nx, by + (tipY - by) * 0.5 - ny, bx, by);
      ctx.closePath();
      ctx.stroke();

      if (isColorByNumber && ringIdx === 0 && p % 2 === 0) {
        ctx.fillStyle = strokeColor;
        ctx.font = `bold ${Math.max(9, Math.floor(width * 0.012))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${(numIdx % 9) + 1}`, tipX * 0.8 + sx * 0.2, tipY * 0.8 + sy * 0.2);
        numIdx++;
      }
    }
  });

  const lCactusX = cx - tw * 0.48;
  const lCactusY = midY - th * 0.08;
  ctx.beginPath();
  ctx.ellipse(lCactusX, lCactusY, Math.max(3, tw * 0.14), Math.max(6, th * 0.16), 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let rib = -1; rib <= 1; rib++) {
    ctx.beginPath();
    ctx.moveTo(lCactusX + rib * (tw * 0.06), lCactusY - th * 0.15);
    ctx.lineTo(lCactusX + rib * (tw * 0.06), lCactusY + th * 0.15);
    ctx.stroke();
  }

  const rCactusX = cx + tw * 0.48;
  const rCactusY = midY - th * 0.04;
  ctx.beginPath();
  ctx.ellipse(rCactusX, rCactusY, Math.max(3, tw * 0.16), Math.max(4, th * 0.12), 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(rCactusX + tw * 0.07, rCactusY - th * 0.12, Math.max(2, tw * 0.1), Math.max(3, th * 0.08), -0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rCactusX + tw * 0.07, rCactusY - th * 0.19, Math.max(2, tw * 0.04), 0, Math.PI * 2);
  ctx.stroke();

  [-tw * 0.7, tw * 0.7].forEach((sideX) => {
    let beadY = midY + th * 0.08;
    for (let b = 0; b < 7; b++) {
      ctx.beginPath();
      ctx.arc(cx + sideX + Math.sin(b * 0.8) * (tw * 0.05), beadY, Math.max(2, tw * 0.035 + (b % 2) * (tw * 0.01)), 0, Math.PI * 2);
      ctx.stroke();
      beadY += th * 0.06;
    }
  });
}

function drawLotusPondPattern(
  ctx: CanvasRenderingContext2D,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean,
  cx: number,
  cy: number
) {
  let numIdx = 1;

  const waveCount = 7;
  for (let w = 0; w < waveCount; w++) {
    const wy = margin + (innerH / (waveCount + 1)) * (w + 1);
    ctx.beginPath();
    ctx.moveTo(margin, wy);
    ctx.bezierCurveTo(
      margin + innerW * 0.25, wy + Math.sin(w * 1.5) * 18,
      margin + innerW * 0.75, wy - Math.sin(w * 1.5) * 18,
      margin + innerW, wy
    );
    ctx.stroke();
  }

  const koiFish = [
    { x: cx - innerW * 0.25, y: cy + innerH * 0.18, rot: -0.4, scale: innerW * 0.16 },
    { x: cx + innerW * 0.28, y: cy - innerH * 0.18, rot: 2.8, scale: innerW * 0.15 },
  ];

  koiFish.forEach(({ x, y, rot, scale }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(0, -scale * 0.6);
    ctx.bezierCurveTo(scale * 0.35, -scale * 0.3, scale * 0.35, scale * 0.4, 0, scale * 0.7);
    ctx.bezierCurveTo(-scale * 0.35, scale * 0.4, -scale * 0.35, -scale * 0.3, 0, -scale * 0.6);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, scale * 0.65);
    ctx.bezierCurveTo(scale * 0.35, scale * 1.1, scale * 0.1, scale * 1.25, 0, scale * 1.1);
    ctx.bezierCurveTo(-scale * 0.1, scale * 1.25, -scale * 0.35, scale * 1.1, 0, scale * 0.65);
    ctx.closePath();
    ctx.stroke();

    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(side * scale * 0.2, -scale * 0.1);
      ctx.quadraticCurveTo(side * scale * 0.55, 0, side * scale * 0.45, scale * 0.25);
      ctx.quadraticCurveTo(side * scale * 0.25, scale * 0.15, side * scale * 0.2, scale * 0.05);
      ctx.closePath();
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(0, -scale * 0.1, scale * 0.12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });

  const lilyPads = [
    { x: margin + innerW * 0.18, y: margin + innerH * 0.25, r: innerW * 0.14, rot: 0.6 },
    { x: margin + innerW * 0.82, y: margin + innerH * 0.32, r: innerW * 0.15, rot: -1.2 },
    { x: margin + innerW * 0.22, y: margin + innerH * 0.75, r: innerW * 0.16, rot: 2.1 },
    { x: margin + innerW * 0.78, y: margin + innerH * 0.78, r: innerW * 0.14, rot: 0.3 },
  ];

  lilyPads.forEach(({ x, y, r, rot }) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 1.22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0.35, Math.PI * 2 - 0.35);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();

    for (let i = 1; i <= 6; i++) {
      const va = 0.5 + (i / 7) * (Math.PI * 2 - 1.0);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(va) * r * 0.88, Math.sin(va) * r * 0.88);
      ctx.stroke();
    }
    ctx.restore();
  });

  const lotusBlooms = [
    { x: cx, y: cy, r: innerW * 0.18 },
    { x: cx + innerW * 0.24, y: cy + innerH * 0.28, r: innerW * 0.12 },
    { x: cx - innerW * 0.24, y: cy - innerH * 0.28, r: innerW * 0.12 },
  ];

  lotusBlooms.forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.45, r * 1.1, r * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    const petalTiers = [
      { count: 7, scale: 1.0, yOffset: 0 },
      { count: 6, scale: 0.78, yOffset: -r * 0.1 },
      { count: 5, scale: 0.55, yOffset: -r * 0.2 },
    ];

    petalTiers.forEach(({ count, scale, yOffset }, tierIdx) => {
      const pr = r * scale;
      for (let p = 0; p < count; p++) {
        const span = Math.PI * 0.85;
        const angle = -Math.PI / 2 + (p - (count - 1) / 2) * (span / count);
        const tipX = x + Math.cos(angle) * pr;
        const tipY = y + yOffset + Math.sin(angle) * pr;
        const w = pr * 0.28;
        const nx = -Math.sin(angle) * w;
        const ny = Math.cos(angle) * w;
        const bx = x + (p - (count - 1) / 2) * (pr * 0.08);
        const by = y + yOffset + pr * 0.3;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + (tipX - bx) * 0.5 + nx, by + (tipY - by) * 0.5 + ny, tipX, tipY);
        ctx.quadraticCurveTo(bx + (tipX - bx) * 0.5 - nx, by + (tipY - by) * 0.5 - ny, bx, by);
        ctx.closePath();
        ctx.stroke();

        if (isColorByNumber && tierIdx === 0 && p % 2 === 0) {
          ctx.fillStyle = strokeColor;
          ctx.font = `bold ${Math.max(9, Math.floor(width * 0.013))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${(numIdx % 9) + 1}`, tipX * 0.7 + bx * 0.3, tipY * 0.7 + by * 0.3);
          numIdx++;
        }
      }
    });

    ctx.beginPath();
    ctx.arc(x, y - r * 0.08, r * 0.14, 0, Math.PI * 2);
    ctx.stroke();
    for (let dot = 0; dot < 5; dot++) {
      const da = (dot * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(da) * r * 0.07, y - r * 0.08 + Math.sin(da) * r * 0.07, r * 0.02, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

// ── Citrus Fruit Wheels & Slices pattern ─────────────────────────────────

function drawCitrusWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rot: number,
  segments: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean,
  numIdxRef: { val: number }
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // 1. Outer Rind Circle
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Inner Pith Circle
  const pithR = r * 0.88;
  ctx.beginPath();
  ctx.arc(0, 0, pithR, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Center Core
  const coreR = r * 0.14;
  ctx.beginPath();
  ctx.arc(0, 0, coreR, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Triangular Pulp Segments
  const segAngle = (Math.PI * 2) / segments;
  const gap = 0.08;

  for (let s = 0; s < segments; s++) {
    const a1 = s * segAngle + gap;
    const a2 = (s + 1) * segAngle - gap;
    const midA = (a1 + a2) / 2;

    const rInner = coreR + r * 0.04;
    const rOuter = pithR - r * 0.04;

    ctx.beginPath();
    ctx.arc(0, 0, rInner, a1, a2);
    ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
    ctx.arc(0, 0, rOuter, a2, a1, true);
    ctx.closePath();
    ctx.stroke();

    // Pulp vesicle detail
    const vesR = (rInner + rOuter) * 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(midA) * vesR, Math.sin(midA) * vesR, Math.max(1.5, r * 0.035), 0, Math.PI * 2);
    ctx.stroke();

    // Optional seed in alternate segments
    if (s % 2 === 0) {
      const seedDist = rInner + (rOuter - rInner) * 0.28;
      const sx = Math.cos(midA) * seedDist;
      const sy = Math.sin(midA) * seedDist;
      ctx.beginPath();
      ctx.ellipse(sx, sy, Math.max(1.5, r * 0.04), Math.max(2.5, r * 0.07), midA, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (isColorByNumber) {
      const numDist = (rInner + rOuter) * 0.65;
      const nx = Math.cos(midA) * numDist;
      const ny = Math.sin(midA) * numDist;
      ctx.fillStyle = strokeColor;
      ctx.font = `bold ${Math.max(9, Math.floor(width * 0.013))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${(numIdxRef.val % 9) + 1}`, nx, ny);
      numIdxRef.val++;
    }
  }

  ctx.restore();
}

function drawCitrusWedge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rot: number,
  segments: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean,
  numIdxRef: { val: number }
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // Half-circle wedge outer
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI);
  ctx.closePath();
  ctx.stroke();

  // Inner pith
  const pithR = r * 0.88;
  ctx.beginPath();
  ctx.arc(0, 0, pithR, 0.06, Math.PI - 0.06);
  ctx.lineTo(-pithR, 0);
  ctx.lineTo(pithR, 0);
  ctx.closePath();
  ctx.stroke();

  const halfSegments = Math.max(3, Math.floor(segments / 2));
  const segAngle = Math.PI / halfSegments;
  const gap = 0.08;

  for (let s = 0; s < halfSegments; s++) {
    const a1 = s * segAngle + gap;
    const a2 = (s + 1) * segAngle - gap;
    const midA = (a1 + a2) / 2;

    const rInner = r * 0.16;
    const rOuter = pithR - r * 0.04;

    ctx.beginPath();
    ctx.arc(0, 0, rInner, a1, a2);
    ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
    ctx.arc(0, 0, rOuter, a2, a1, true);
    ctx.closePath();
    ctx.stroke();

    if (isColorByNumber) {
      const numDist = (rInner + rOuter) * 0.55;
      const nx = Math.cos(midA) * numDist;
      const ny = Math.sin(midA) * numDist;
      ctx.fillStyle = strokeColor;
      ctx.font = `bold ${Math.max(9, Math.floor(width * 0.013))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${(numIdxRef.val % 9) + 1}`, nx, ny);
      numIdxRef.val++;
    }
  }

  ctx.restore();
}

function drawCitrusLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  len: number,
  rot: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  const w = len * 0.42;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w, -len * 0.5, 0, -len);
  ctx.quadraticCurveTo(-w, -len * 0.5, 0, 0);
  ctx.closePath();
  ctx.stroke();

  // Central vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len * 0.95);
  ctx.stroke();

  // Side veins
  for (let i = 1; i <= 3; i++) {
    const vy = -len * (i / 4.2);
    const vw = w * (1 - i / 5) * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, vy);
    ctx.lineTo(vw, vy - len * 0.08);
    ctx.moveTo(0, vy);
    ctx.lineTo(-vw, vy - len * 0.08);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCitrusPattern(
  ctx: CanvasRenderingContext2D,
  margin: number,
  innerW: number,
  innerH: number,
  density: number,
  strokeColor: string,
  width: number,
  isColorByNumber: boolean,
  cx: number,
  cy: number
) {
  const numIdxRef = { val: 1 };

  // 1. Center Large Wheel
  const mainR = Math.min(innerW, innerH) * 0.22;
  drawCitrusWheel(ctx, cx, cy, mainR, 0.2, 9, strokeColor, width, isColorByNumber, numIdxRef);

  // 2. Medium Wheels Around Center
  const wheels = [
    { x: cx - innerW * 0.28, y: cy - innerH * 0.26, r: mainR * 0.75, rot: -0.4, seg: 8 },
    { x: cx + innerW * 0.29, y: cy - innerH * 0.24, r: mainR * 0.8, rot: 0.7, seg: 8 },
    { x: cx - innerW * 0.26, y: cy + innerH * 0.28, r: mainR * 0.82, rot: 1.1, seg: 9 },
    { x: cx + innerW * 0.27, y: cy + innerH * 0.27, r: mainR * 0.78, rot: -0.8, seg: 8 },
  ];

  wheels.forEach((w) => {
    drawCitrusWheel(ctx, w.x, w.y, w.r, w.rot, w.seg, strokeColor, width, isColorByNumber, numIdxRef);
  });

  // 3. Half-slice Citrus Wedges in Corners & Gaps
  const wedges = [
    { x: margin + innerW * 0.12, y: margin + innerH * 0.12, r: mainR * 0.65, rot: 0.8, seg: 8 },
    { x: margin + innerW * 0.88, y: margin + innerH * 0.12, r: mainR * 0.68, rot: -0.7, seg: 8 },
    { x: margin + innerW * 0.12, y: margin + innerH * 0.88, r: mainR * 0.7, rot: -2.3, seg: 8 },
    { x: margin + innerW * 0.88, y: margin + innerH * 0.88, r: mainR * 0.66, rot: 2.2, seg: 8 },
    { x: cx, y: margin + innerH * 0.1, r: mainR * 0.55, rot: Math.PI, seg: 6 },
    { x: cx, y: margin + innerH * 0.9, r: mainR * 0.55, rot: 0, seg: 6 },
  ];

  wedges.forEach((w) => {
    drawCitrusWedge(ctx, w.x, w.y, w.r, w.rot, w.seg, strokeColor, width, isColorByNumber, numIdxRef);
  });

  // 4. Botanical Citrus / Mint Leaves Filling Negative Space
  const leaves = [
    { x: cx - innerW * 0.12, y: cy - innerH * 0.18, len: mainR * 0.55, rot: -0.9 },
    { x: cx + innerW * 0.14, y: cy - innerH * 0.16, len: mainR * 0.52, rot: 0.8 },
    { x: cx - innerW * 0.15, y: cy + innerH * 0.15, len: mainR * 0.58, rot: -2.2 },
    { x: cx + innerW * 0.13, y: cy + innerH * 0.18, len: mainR * 0.54, rot: 2.3 },
    { x: margin + innerW * 0.28, y: margin + innerH * 0.08, len: mainR * 0.48, rot: 0.3 },
    { x: margin + innerW * 0.72, y: margin + innerH * 0.08, len: mainR * 0.48, rot: -0.3 },
    { x: margin + innerW * 0.28, y: margin + innerH * 0.92, len: mainR * 0.48, rot: 2.8 },
    { x: margin + innerW * 0.72, y: margin + innerH * 0.92, len: mainR * 0.48, rot: -2.8 },
  ];

  leaves.forEach((lf) => {
    drawCitrusLeaf(ctx, lf.x, lf.y, lf.len, lf.rot);
  });
}

// ── Cozy Objects & Still Life pattern icons ──────────────────────────────

function drawCrystalClusterIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const shards: Array<readonly [number, number]> = [[-0.5, 1.1], [-0.15, 0.9], [0.2, 1.15], [0.5, 0.95]];
  shards.forEach(([sx, sh]) => {
    const bx = cx + sx * r, tipY = cy + r * 0.85 - sh * r * 0.95;
    ctx.beginPath();
    ctx.moveTo(bx - r * 0.14, cy + r * 0.85);
    ctx.lineTo(bx - r * 0.08, tipY + r * 0.15);
    ctx.lineTo(bx, tipY);
    ctx.lineTo(bx + r * 0.08, tipY + r * 0.15);
    ctx.lineTo(bx + r * 0.14, cy + r * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, tipY);
    ctx.lineTo(bx, cy + r * 0.85);
    ctx.stroke();
  });
}

function drawVintageClockIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = r * 0.7, r2 = r * 0.82;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.1, cy - r * 0.4);
  ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.45, cy + r * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.95, r * 0.08, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHourglassIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.85); ctx.lineTo(cx + r * 0.5, cy - r * 0.85);
  ctx.lineTo(cx + r * 0.08, cy); ctx.lineTo(cx + r * 0.5, cy + r * 0.85);
  ctx.lineTo(cx - r * 0.5, cy + r * 0.85); ctx.lineTo(cx - r * 0.08, cy);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, cy - r * 0.85); ctx.lineTo(cx + r * 0.6, cy - r * 0.85);
  ctx.moveTo(cx - r * 0.6, cy + r * 0.85); ctx.lineTo(cx + r * 0.6, cy + r * 0.85);
  ctx.stroke();
  ([0.4, 0.55, 0.7] as const).forEach((t) => {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.22 * (1 - t), cy + r * 0.85 * t);
    ctx.lineTo(cx + r * 0.22 * (1 - t), cy + r * 0.85 * t);
    ctx.stroke();
  });
}

function drawLanternIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.0); ctx.lineTo(cx, cy - r * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.72, r * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy - r * 0.62); ctx.lineTo(cx + r * 0.3, cy - r * 0.62);
  ctx.lineTo(cx + r * 0.42, cy + r * 0.5); ctx.lineTo(cx - r * 0.42, cy + r * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy - r * 0.15); ctx.lineTo(cx + r * 0.42, cy - r * 0.15);
  ctx.moveTo(cx - r * 0.42, cy + r * 0.15); ctx.lineTo(cx + r * 0.42, cy + r * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.05);
  ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.15, cx, cy + r * 0.3);
  ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.15, cx, cy - r * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.5); ctx.lineTo(cx + r * 0.5, cy + r * 0.5);
  ctx.lineTo(cx + r * 0.3, cy + r * 0.68); ctx.lineTo(cx - r * 0.3, cy + r * 0.68);
  ctx.closePath();
  ctx.stroke();
}

function drawCandleIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.rect(cx - r * 0.22, cy - r * 0.2, r * 0.44, r * 1.05);
  ctx.stroke();
  ([0.15, 0.4, 0.65] as const).forEach((t) => {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.22, cy - r * 0.2 + r * 1.05 * t);
    ctx.quadraticCurveTo(cx, cy - r * 0.2 + r * 1.05 * t + r * 0.05, cx + r * 0.22, cy - r * 0.2 + r * 1.05 * t);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.2); ctx.lineTo(cx, cy - r * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.4);
  ctx.quadraticCurveTo(cx + r * 0.16, cy - r * 0.62, cx, cy - r * 0.85);
  ctx.quadraticCurveTo(cx - r * 0.16, cy - r * 0.62, cx, cy - r * 0.4);
  ctx.stroke();
}

function drawBookshelfPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number, density: number) {
  const shelves = Math.max(3, Math.min(5, Math.floor(density / 3)));
  const shelfH = innerH / shelves;
  for (let s = 0; s < shelves; s++) {
    const y0 = margin + s * shelfH;
    ctx.beginPath();
    ctx.moveTo(margin, y0 + shelfH * 0.88);
    ctx.lineTo(margin + innerW, y0 + shelfH * 0.88);
    ctx.stroke();
    let x = margin + 6;
    let bookIdx = 0;
    while (x < margin + innerW - 6) {
      const bw = 14 + (bookIdx * 7) % 22;
      const bh = shelfH * 0.7 + ((bookIdx * 13) % 10 - 5);
      ctx.strokeRect(x, y0 + shelfH * 0.86 - bh, bw, bh);
      ctx.beginPath();
      ctx.moveTo(x + bw * 0.5, y0 + shelfH * 0.86 - bh + 4);
      ctx.lineTo(x + bw * 0.5, y0 + shelfH * 0.86 - 6);
      ctx.stroke();
      x += bw + 4;
      bookIdx++;
    }
  }
}

// ── Stained Glass & Architecture full-canvas patterns ────────────────────

function drawMoroccanTilesPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number, density: number) {
  const cols = Math.max(4, Math.min(7, Math.floor(density / 2.5)));
  const cellW = innerW / cols;
  const rows = Math.ceil(innerH / cellW);
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : cellW / 2;
    for (let c = -1; c <= cols; c++) {
      const x = margin + c * cellW + cellW / 2 + offset;
      const y = margin + r * cellW + cellW / 2;
      if (x < margin - 1 || x > margin + innerW + 1) continue;
      if (y > margin + innerH + cellW / 2) continue;
      drawStar(ctx, x, y, cellW * 0.42, cellW * 0.18, 8);
    }
  }
}

function drawCozyWindowPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number) {
  const wx = margin + innerW * 0.1, wy = margin + innerH * 0.08;
  const ww = innerW * 0.8, wh = innerH * 0.75;
  ctx.strokeRect(wx - 10, wy - 10, ww + 20, wh + 20);
  ctx.strokeRect(wx, wy, ww, wh);
  ([1 / 3, 2 / 3] as const).forEach((t) => {
    ctx.beginPath(); ctx.moveTo(wx + ww * t, wy); ctx.lineTo(wx + ww * t, wy + wh); ctx.stroke();
  });
  ctx.beginPath(); ctx.moveTo(wx, wy + wh * 0.62); ctx.lineTo(wx + ww, wy + wh * 0.62); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh);
  ctx.lineTo(wx + ww * 0.18, wy + wh * 0.72);
  ctx.lineTo(wx + ww * 0.34, wy + wh * 0.88);
  ctx.lineTo(wx + ww * 0.52, wy + wh * 0.68);
  ctx.lineTo(wx + ww * 0.7, wy + wh * 0.86);
  ctx.lineTo(wx + ww * 0.86, wy + wh * 0.74);
  ctx.lineTo(wx + ww, wy + wh);
  ctx.stroke();
  drawCrescentMoon(ctx, wx + ww * 0.76, wy + wh * 0.26, ww * 0.09);
  ([[0.15, 0.15], [0.28, 0.35], [0.45, 0.12]] as const).forEach(([px, py]) => drawSparkleStar(ctx, wx + ww * px, wy + wh * py, 6));
}

// ── Abstract & Art Deco full-canvas patterns ──────────────────────────────

function drawArtDecoFansPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number, cx: number, cy: number, density: number) {
  const fanR = Math.min(innerW, innerH) * 0.42;
  const corners: Array<readonly [number, number, number, number]> = [
    [margin, margin, 0, Math.PI / 2],
    [margin + innerW, margin, Math.PI / 2, Math.PI],
    [margin, margin + innerH, -Math.PI / 2, 0],
    [margin + innerW, margin + innerH, Math.PI, Math.PI * 1.5],
  ];
  const rings = Math.max(4, Math.min(8, Math.floor(density / 2)));
  corners.forEach(([fx, fy, a0, a1]) => {
    for (let i = 1; i <= rings; i++) {
      const r = (fanR / rings) * i;
      ctx.beginPath();
      ctx.arc(fx, fy, r, a0, a1);
      ctx.stroke();
    }
    const spokes = 6;
    for (let s = 0; s <= spokes; s++) {
      const a = a0 + (a1 - a0) * (s / spokes);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * fanR, fy + Math.sin(a) * fanR);
      ctx.stroke();
    }
  });
  const dr = Math.min(innerW, innerH) * 0.1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - dr); ctx.lineTo(cx + dr, cy); ctx.lineTo(cx, cy + dr); ctx.lineTo(cx - dr, cy);
  ctx.closePath();
  ctx.stroke();
}

function drawOpticalSwirlsPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerW: number, innerH: number, density: number) {
  const maxR = Math.min(innerW, innerH) * 0.48;
  const rings = Math.max(8, Math.min(18, density));
  for (let i = 1; i <= rings; i++) {
    const baseR = (maxR / rings) * i;
    const amp = maxR * 0.02;
    const waves = 8 + (i % 3) * 2;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
      const rr = baseR + Math.sin(a * waves + i) * amp;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

// ── Landscapes & Celestial full-canvas patterns ───────────────────────────

function drawMountainSunrisePattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number, cx: number) {
  const sunY = margin + innerH * 0.32;
  for (let i = 0; i < 16; i++) {
    const a = Math.PI + (i / 15) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, sunY);
    ctx.lineTo(cx + Math.cos(a) * innerW * 0.55, sunY + Math.sin(a) * innerW * 0.55);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, sunY, innerH * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ([0.85, 0.72, 0.6] as const).forEach((baseT, ridgeI) => {
    const y0 = margin + innerH * baseT;
    ctx.beginPath();
    ctx.moveTo(margin, margin + innerH);
    const peaks = 5 - ridgeI;
    for (let i = 0; i <= peaks; i++) {
      const x = margin + (innerW / peaks) * i;
      const y = y0 - (i % 2 === 0 ? innerH * 0.08 : 0);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(margin + innerW, margin + innerH);
    ctx.stroke();
  });
  ([0.2, 0.15] as const).forEach((t, i) => {
    const y = margin + innerH * (0.15 + i * 0.1);
    ctx.beginPath();
    for (let x = margin + innerW * 0.1; x <= margin + innerW * 0.45; x += 8) {
      const yy = y + Math.sin(x * 0.1) * 4;
      if (x === margin + innerW * 0.1) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  });
}

function drawOceanWavesPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number) {
  drawCrescentMoon(ctx, margin + innerW * 0.82, margin + innerH * 0.18, innerH * 0.08);
  const rows = 3;
  for (let row = 0; row < rows; row++) {
    const y0 = margin + innerH * (0.45 + row * 0.18);
    const crests = 4;
    ctx.beginPath();
    for (let i = 0; i <= crests; i++) {
      const x = margin + (innerW / crests) * i;
      const y = y0 + (i % 2 === 0 ? 0 : -innerH * 0.06);
      if (i === 0) ctx.moveTo(x, y); else ctx.quadraticCurveTo(x - innerW / crests / 2, y - innerH * 0.05, x, y);
    }
    ctx.stroke();
    for (let i = 0; i < crests; i += 2) {
      const x = margin + (innerW / crests) * (i + 0.5);
      ctx.beginPath();
      ctx.arc(x, y0 - innerH * 0.09, innerH * 0.025, Math.PI * 0.2, Math.PI * 1.3);
      ctx.stroke();
    }
  }
}

function drawCelestialSkyPattern(ctx: CanvasRenderingContext2D, margin: number, innerW: number, innerH: number, cx: number) {
  drawCrescentMoon(ctx, cx, margin + innerH * 0.32, innerH * 0.14);
  const stars: Array<readonly [number, number]> = [[0.2, 0.15], [0.75, 0.2], [0.15, 0.45], [0.82, 0.5], [0.35, 0.65], [0.65, 0.7], [0.5, 0.85]];
  stars.forEach(([px, py]) => drawSparkleStar(ctx, margin + innerW * px, margin + innerH * py, 8));
  ctx.beginPath();
  ctx.moveTo(margin + innerW * 0.2, margin + innerH * 0.15);
  ctx.lineTo(margin + innerW * 0.15, margin + innerH * 0.45);
  ctx.lineTo(margin + innerW * 0.35, margin + innerH * 0.65);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 1.1 + (i / 9) * Math.PI * 0.6;
    ctx.beginPath();
    ctx.moveTo(cx, margin + innerH * 0.32);
    ctx.lineTo(cx + Math.cos(a) * innerH * 0.22, margin + innerH * 0.32 + Math.sin(a) * innerH * 0.22);
    ctx.stroke();
  }
}

function drawGalaxySwirlPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerW: number, innerH: number) {
  const maxR = Math.min(innerW, innerH) * 0.42;
  ([0, Math.PI] as const).forEach((offset) => {
    ctx.beginPath();
    let a = 0.3;
    let first = true;
    while (a < Math.PI * 2.6) {
      const rr = maxR * 0.08 + maxR * 0.85 * (a / (Math.PI * 2.6));
      const x = cx + Math.cos(a + offset) * rr, y = cy + Math.sin(a + offset) * rr;
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      a += 0.15;
    }
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + maxR * 0.65, cy - maxR * 0.55, maxR * 0.14, maxR * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + maxR * 0.65, cy - maxR * 0.55, maxR * 0.24, maxR * 0.07, 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ([[0.15, 0.75], [0.85, 0.2], [0.75, 0.85], [0.1, 0.25]] as const).forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(cx - maxR + px * maxR * 2, cy - maxR + py * maxR * 2, maxR * 0.02, 0, Math.PI * 2);
    ctx.stroke();
  });
}

// ── European Flags ──────────────────────────────────────────────────────
// Outline-only, same reasoning as the object clip-art above: this is a
// coloring page, so a flag is just its border plus the dividing lines that
// mark where each colored region starts, not the actual colors.

function drawFlagBorder(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
}

function drawStripedFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, count: number, orientation: "horizontal" | "vertical") {
  drawFlagBorder(ctx, cx, cy, w, h);
  const x0 = cx - w / 2, y0 = cy - h / 2;
  for (let i = 1; i < count; i++) {
    ctx.beginPath();
    if (orientation === "vertical") {
      const x = x0 + (w / count) * i;
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + h);
    } else {
      const y = y0 + (h / count) * i;
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
    }
    ctx.stroke();
  }
}

function drawNordicCrossFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const x0 = cx - w / 2, y0 = cy - h / 2;
  const vX = x0 + w * 0.36;
  const vHalf = w * 0.065, hHalf = h * 0.11;
  ctx.beginPath(); ctx.moveTo(vX - vHalf, y0); ctx.lineTo(vX - vHalf, y0 + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(vX + vHalf, y0); ctx.lineTo(vX + vHalf, y0 + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, cy - hHalf); ctx.lineTo(x0 + w, cy - hHalf); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, cy + hHalf); ctx.lineTo(x0 + w, cy + hHalf); ctx.stroke();
}

function drawSwissCrossFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const armW = w * 0.22, armLen = h * 0.5;
  ctx.strokeRect(cx - armW / 2, cy - armLen / 2, armW, armLen);
  ctx.strokeRect(cx - armLen / 2, cy - armW / 2, armLen, armW);
}

function drawUnionJackFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); ctx.stroke();
  const vx0 = cx - w * 0.09, vx1 = cx + w * 0.09;
  ctx.beginPath(); ctx.moveTo(vx0, y0); ctx.lineTo(vx0, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(vx1, y0); ctx.lineTo(vx1, y1); ctx.stroke();
  const hy0 = cy - h * 0.13, hy1 = cy + h * 0.13;
  ctx.beginPath(); ctx.moveTo(x0, hy0); ctx.lineTo(x1, hy0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, hy1); ctx.lineTo(x1, hy1); ctx.stroke();
}

// ── North American Flags -- extra pattern drawers ─────────────────────────

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawUsaFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const x0 = cx - w / 2, y0 = cy - h / 2;
  const stripeCount = 13;
  const stripeH = h / stripeCount;
  const cantonW = w * 0.42;
  const cantonH = stripeH * 7;
  for (let i = 1; i < stripeCount; i++) {
    const y = y0 + stripeH * i;
    ctx.beginPath();
    if (i <= 6) {
      ctx.moveTo(x0 + cantonW, y);
    } else {
      ctx.moveTo(x0, y);
    }
    ctx.lineTo(x0 + w, y);
    ctx.stroke();
  }
  ctx.strokeRect(x0, y0, cantonW, cantonH);
  const rows = 5, cols = 6;
  const starR = Math.min(cantonW / cols, cantonH / rows) * 0.32;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = x0 + (cantonW * (c + 0.5)) / cols;
      const sy = y0 + (cantonH * (r + 0.5)) / rows;
      drawStar(ctx, sx, sy, starR, starR * 0.42);
    }
  }
}

function drawMapleLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const pts: [number, number][] = [
    [0, -1.0], [0.15, -0.55], [0.5, -0.62], [0.38, -0.32],
    [0.75, -0.28], [0.55, -0.05], [0.68, 0.05], [0.4, 0.12],
    [0.46, 0.42], [0.2, 0.28], [0.12, 0.5], [0, 0.3],
    [-0.12, 0.5], [-0.2, 0.28], [-0.46, 0.42], [-0.4, 0.12],
    [-0.68, 0.05], [-0.55, -0.05], [-0.75, -0.28], [-0.38, -0.32],
    [-0.5, -0.62], [-0.15, -0.55],
  ];
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = cx + px * s, y = cy + py * s;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + 0.3 * s);
  ctx.lineTo(cx, cy + 0.55 * s);
  ctx.stroke();
}

function drawCanadaFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawStripedFlag(ctx, cx, cy, w, h, 3, "vertical");
  drawMapleLeaf(ctx, cx, cy, Math.min(w, h) * 0.32);
}

function drawSaltireFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); ctx.stroke();
}

function drawTriangleHoistFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, stripeCount: number, withStar: boolean) {
  drawStripedFlag(ctx, cx, cy, w, h, stripeCount, "horizontal");
  const x0 = cx - w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const triTipX = x0 + w * 0.38;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(triTipX, cy);
  ctx.lineTo(x0, y1);
  ctx.stroke();
  if (withStar) drawStar(ctx, x0 + w * 0.14, cy, h * 0.13, h * 0.055);
}

function drawQuarteredFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  ctx.beginPath(); ctx.moveTo(cx, cy - h / 2); ctx.lineTo(cx, cy + h / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx + w / 2, cy); ctx.stroke();
  drawStar(ctx, cx - w * 0.25, cy - h * 0.25, h * 0.12, h * 0.05);
  drawStar(ctx, cx + w * 0.25, cy + h * 0.25, h * 0.12, h * 0.05);
}

function drawCenteredCrossFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawFlagBorder(ctx, cx, cy, w, h);
  const armW = Math.min(w, h) * 0.16;
  ctx.strokeRect(cx - armW / 2, cy - h / 2, armW, h);
  ctx.strokeRect(cx - w / 2, cy - armW / 2, w, armW);
  ctx.beginPath();
  ctx.arc(cx, cy, armW * 0.35, 0, Math.PI * 2);
  ctx.stroke();
}

function drawStripesWithCenterStars(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  drawStripedFlag(ctx, cx, cy, w, h, 3, "horizontal");
  const r = h * 0.045;
  const positions: [number, number][] = [[0, 0], [-0.18, -0.12], [0.18, -0.12], [-0.18, 0.12], [0.18, 0.12]];
  positions.forEach(([dx, dy]) => drawStar(ctx, cx + dx * w, cy + dy * h, r, r * 0.45));
}

const OBJECT_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => void> = {
  obj_banana: drawBanana,
  obj_apple: drawApple,
  obj_carrot: drawCarrot,
  obj_tomato: drawTomato,
  obj_broccoli: drawBroccoli,
  obj_strawberry: drawStrawberry,
  obj_hamburger: drawHamburger,
  obj_cupcake: drawCupcake,
  obj_teapot: drawTeapot,
  obj_hot_air_balloon: drawHotAirBalloon,
  obj_supercar: drawSupercarIcon,
  obj_classic_car: drawClassicCarIcon,
  obj_gt_coupe: drawGTCoupeIcon,
  obj_track_car: drawTrackCarIcon,
  obj_shooting_brake: drawShootingBrakeIcon,
  obj_roadster: drawRoadsterIcon,
  obj_muscle_coupe: drawMuscleCoupeIcon,
  flag_france: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "vertical"),
  flag_italy: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "vertical"),
  flag_belgium: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "vertical"),
  flag_ireland: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "vertical"),
  flag_germany: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "horizontal"),
  flag_netherlands: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "horizontal"),
  flag_austria: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "horizontal"),
  flag_poland: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 2, "horizontal"),
  flag_sweden: (ctx, cx, cy, s) => drawNordicCrossFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_finland: (ctx, cx, cy, s) => drawNordicCrossFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_switzerland: (ctx, cx, cy, s) => drawSwissCrossFlag(ctx, cx, cy, s * 1.3, s * 1.3),
  flag_uk: (ctx, cx, cy, s) => drawUnionJackFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_usa: (ctx, cx, cy, s) => drawUsaFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_canada: (ctx, cx, cy, s) => drawCanadaFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_panama: (ctx, cx, cy, s) => drawQuarteredFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_guatemala: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "vertical"),
  flag_costarica: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 5, "horizontal"),
  flag_cuba: (ctx, cx, cy, s) => drawTriangleHoistFlag(ctx, cx, cy, s * 1.7, s * 1.1, 5, true),
  flag_bahamas: (ctx, cx, cy, s) => drawTriangleHoistFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, false),
  flag_jamaica: (ctx, cx, cy, s) => drawSaltireFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_dominican: (ctx, cx, cy, s) => drawCenteredCrossFlag(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_honduras: (ctx, cx, cy, s) => drawStripesWithCenterStars(ctx, cx, cy, s * 1.7, s * 1.1),
  flag_elsalvador: (ctx, cx, cy, s) => drawStripedFlag(ctx, cx, cy, s * 1.7, s * 1.1, 3, "horizontal"),
};

const OBJECT_LABELS: Record<string, string> = {
  obj_banana: "Banana",
  obj_apple: "Apple",
  obj_carrot: "Carrot",
  obj_tomato: "Tomato",
  obj_broccoli: "Broccoli",
  obj_strawberry: "Strawberry",
  obj_hamburger: "Hamburger",
  obj_cupcake: "Cupcake",
  obj_teapot: "Teapot",
  obj_hot_air_balloon: "Hot Air Balloon",
  obj_supercar: "Wedge Hypercar",
  obj_classic_car: "Classic Car",
  obj_gt_coupe: "GT Coupe",
  obj_track_car: "Track Car",
  obj_shooting_brake: "Shooting Brake",
  obj_roadster: "Roadster",
  obj_muscle_coupe: "Muscle Coupe",
  flag_france: "France",
  flag_italy: "Italy",
  flag_belgium: "Belgium",
  flag_ireland: "Ireland",
  flag_germany: "Germany",
  flag_netherlands: "Netherlands",
  flag_austria: "Austria",
  flag_poland: "Poland",
  flag_sweden: "Sweden",
  flag_finland: "Finland",
  flag_switzerland: "Switzerland",
  flag_uk: "United Kingdom",
  flag_usa: "United States",
  flag_canada: "Canada",
  flag_panama: "Panama",
  flag_guatemala: "Guatemala",
  flag_costarica: "Costa Rica",
  flag_cuba: "Cuba",
  flag_bahamas: "Bahamas",
  flag_jamaica: "Jamaica",
  flag_dominican: "Dominican Republic",
  flag_honduras: "Honduras",
  flag_elsalvador: "El Salvador",
};

function drawObjectLabel(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, width: number, strokeColor: string, lineWidth: number) {
  const fontSize = Math.max(24, Math.floor(width * 0.11));
  ctx.font = `900 ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(2, lineWidth * 0.9);
  ctx.strokeStyle = strokeColor;
  ctx.strokeText(text.toUpperCase(), cx, y);
}

/**
 * Renders one non-living coloring/color-by-number page onto a 2D canvas
 * context. Shared by the standalone Coloring Book Studio tool, its Book
 * Builder page-type editor, and the Book Builder PDF export -- one drawing
 * implementation instead of three copies that could drift out of sync.
 */
export function drawColoringPattern(ctx: CanvasRenderingContext2D, width: number, height: number, opts: ColoringPatternOptions) {
  try {
    const {
      presetId,
      complexity,
      lineWidth,
      isColorByNumber,
      isMidnightMode,
      frameStyle,
      seed,
      transparentBg,
      lineArtScale = 1.0,
      lineArtOffsetX = 0,
      lineArtOffsetY = 0,
    } = opts;
    const cx = width / 2;
    const cy = height / 2;

  // Background
  if (transparentBg) {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = isMidnightMode ? "#0F172A" : "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

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

  if (presetId === "blank_canvas") {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  // Apply Subject / Line Art Scaling and Positioning Transform
  ctx.save();
  if (lineArtScale !== 1.0 || lineArtOffsetX !== 0 || lineArtOffsetY !== 0) {
    ctx.translate(cx + lineArtOffsetX, cy + lineArtOffsetY);
    ctx.scale(lineArtScale, lineArtScale);
    ctx.translate(-cx, -cy);
  }

  // Single Object Clip-Art presets bypass the abstract pattern generator
  // entirely: one bold centered subject + a big outlined title label, no
  // color-by-number numbering (these are traditional single-page coloring
  // sheets, not color-by-number grids).
  if (OBJECT_DRAWERS[presetId]) {
    const objCx = width / 2;
    const objCy = margin + innerH * 0.42;
    const objSize = Math.min(innerW, innerH) * 0.28;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    OBJECT_DRAWERS[presetId](ctx, objCx, objCy, objSize);
    drawObjectLabel(ctx, OBJECT_LABELS[presetId] || presetId, objCx, margin + innerH * 0.82, innerW, strokeColor, lineWidth);
    ctx.restore();
    return;
  }

  // Pseudo-random helper seeded by seed state
  let prngState = seed;
  const random = () => {
    prngState = (prngState * 9301 + 49297) % 233280;
    return prngState / 233280;
  };

  // Preset Rendering Logic
  const pid = presetId;
  const density = complexity;

  if (pid === "tropical_palms") {
    drawTropicalPalmsPattern(ctx, margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "citrus_slices") {
    drawCitrusPattern(ctx, margin, innerW, innerH, density, strokeColor, width, isColorByNumber, cx, cy);
  } else if (pid === "rose_lattice") {
    drawRoseLatticePattern(ctx, margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "succulents") {
    drawSucculentTerrariumPattern(ctx, margin, innerW, innerH, density, strokeColor, width, isColorByNumber, cx, cy);
  } else if (pid === "lotus_pond") {
    drawLotusPondPattern(ctx, margin, innerW, innerH, density, strokeColor, width, isColorByNumber, cx, cy);
  } else if (pid === "coffee_cups") {
    drawFoodIconGrid(ctx, [drawCoffeeCupIcon, drawCoffeeBeanIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "pastry_display") {
    drawFoodIconGrid(ctx, [drawMacaronIcon, drawCroissantIcon, drawTartIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "teapot_set") {
    drawFoodIconGrid(
      ctx,
      [(c, x, y, r) => drawTeapot(c, x, y, r * 0.85), drawTeacupIcon, drawTeaLeafIcon],
      margin, innerW, innerH, density, strokeColor, width, isColorByNumber
    );
  } else if (pid === "boba_smoothies") {
    drawFoodIconGrid(ctx, [drawMasonJarIcon, drawFruitWedgeIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "crystal_geode") {
    drawFoodIconGrid(ctx, [drawCrystalClusterIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "vintage_clocks") {
    drawFoodIconGrid(ctx, [drawVintageClockIcon, drawHourglassIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "lanterns_candles") {
    drawFoodIconGrid(ctx, [drawLanternIcon, drawCandleIcon], margin, innerW, innerH, density, strokeColor, width, isColorByNumber);
  } else if (pid === "bookshelf_nook") {
    drawBookshelfPattern(ctx, margin, innerW, innerH, density);
  } else if (pid === "moroccan_tiles") {
    drawMoroccanTilesPattern(ctx, margin, innerW, innerH, density);
  } else if (pid === "cozy_window") {
    drawCozyWindowPattern(ctx, margin, innerW, innerH);
  } else if (pid === "art_deco_fans") {
    drawArtDecoFansPattern(ctx, margin, innerW, innerH, cx, cy, density);
  } else if (pid === "optical_swirls") {
    drawOpticalSwirlsPattern(ctx, cx, cy, innerW, innerH, density);
  } else if (pid === "mountain_sunrise") {
    drawMountainSunrisePattern(ctx, margin, innerW, innerH, cx);
  } else if (pid === "ocean_waves") {
    drawOceanWavesPattern(ctx, margin, innerW, innerH);
  } else if (pid === "celestial_sky") {
    drawCelestialSkyPattern(ctx, margin, innerW, innerH, cx);
  } else if (pid === "galaxy_swirl") {
    drawGalaxySwirlPattern(ctx, cx, cy, innerW, innerH);
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

  // Restore the subject scale transform
  ctx.restore();

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

  ctx.restore();
  } catch (err) {
    console.error("Error rendering coloring pattern:", err);
  }
}
