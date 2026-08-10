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
  | "North American Flags";

export interface PresetItem {
  id: string;
  name: string;
  category: NonLivingCategory;
  description: string;
  defaultComplexity: number;
}

export const PRESETS: PresetItem[] = [
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

// ── Food, Drinks & Kitchen pattern icons ────────────────────────────────
// Small stroke-only icons tiled in a grid by drawFoodIconGrid() below,
// following the same grid-of-repeated-motifs approach as citrus_slices.

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
  const { presetId, complexity, lineWidth, isColorByNumber, isMidnightMode, frameStyle, seed } = opts;
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

  if (pid === "citrus_slices") {
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
}
