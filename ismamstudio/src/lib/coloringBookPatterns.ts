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

  // Pseudo-random helper seeded by seed state
  let prngState = seed;
  const random = () => {
    prngState = (prngState * 9301 + 49297) % 233280;
    return prngState / 233280;
  };

  // Preset Rendering Logic
  const pid = presetId;
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
}
