// src/lib/kdpTrimSizes.ts

export interface KdpTrimSize {
  id: string;
  label: string;
  name: string;
  w: number;
  h: number;
  width: number;
  height: number;
  description?: string;
  category?: 'popular' | 'standard' | 'specialty';
}

/**
 * The 16 Official Amazon KDP Paperback & Hardcover Trim Sizes
 * Sourced directly from Amazon KDP Cover Calculator & Interior Specifications.
 */
export const KDP_TRIM_SIZES: KdpTrimSize[] = [
  // 1. Most Popular for Puzzles, Activity Books & Workbooks
  {
    id: "8.5x11",
    label: '8.5" x 11" (Standard Letter / Workbook)',
    name: '8.5" x 11"',
    w: 8.5,
    h: 11,
    width: 8.5,
    height: 11,
    description: "Industry standard for puzzle books, coloring books, workbooks, and large print",
    category: 'popular'
  },
  {
    id: "8x10",
    label: '8" x 10" (Workbook / Children\'s Book)',
    name: '8" x 10"',
    w: 8,
    h: 10,
    width: 8,
    height: 10,
    description: "Popular for activity books, workbooks, and children's literature",
    category: 'popular'
  },
  {
    id: "6x9",
    label: '6" x 9" (Standard Novel / Pocket Puzzle)',
    name: '6" x 9"',
    w: 6,
    h: 9,
    width: 6,
    height: 9,
    description: "Most popular trim size on Amazon for fiction, memoirs, and travel puzzles",
    category: 'popular'
  },
  {
    id: "5.5x8.5",
    label: '5.5" x 8.5" (Compact Trade Paperback)',
    name: '5.5" x 8.5"',
    w: 5.5,
    h: 8.5,
    width: 5.5,
    height: 8.5,
    description: "Standard US trade paperback for compact fiction and non-fiction",
    category: 'popular'
  },
  {
    id: "5x8",
    label: '5" x 8" (Pocket / Small Journal)',
    name: '5" x 8"',
    w: 5,
    h: 8,
    width: 5,
    height: 8,
    description: "Handy pocket size for journals, mini sudoku, and travel guides",
    category: 'standard'
  },

  // 2. Standard KDP Sizes
  {
    id: "5.25x8",
    label: '5.25" x 8" (Digest)',
    name: '5.25" x 8"',
    w: 5.25,
    h: 8,
    width: 5.25,
    height: 8,
    description: "Digest format for short fiction and novellas",
    category: 'standard'
  },
  {
    id: "5.06x7.81",
    label: '5.06" x 7.81" (B-Format)',
    name: '5.06" x 7.81"',
    w: 5.06,
    h: 7.81,
    width: 5.06,
    height: 7.81,
    description: "UK & Commonwealth standard B-format paperback",
    category: 'standard'
  },
  {
    id: "6.14x9.21",
    label: '6.14" x 9.21" (Crown Quarto)',
    name: '6.14" x 9.21"',
    w: 6.14,
    h: 9.21,
    width: 6.14,
    height: 9.21,
    description: "UK & international standard trade and academic books",
    category: 'standard'
  },
  {
    id: "6.69x9.61",
    label: '6.69" x 9.61" (Royal)',
    name: '6.69" x 9.61"',
    w: 6.69,
    h: 9.61,
    width: 6.69,
    height: 9.61,
    description: "Royal format for hardcovers and luxury editions",
    category: 'standard'
  },
  {
    id: "7x10",
    label: '7" x 10" (Executive / Manual)',
    name: '7" x 10"',
    w: 7,
    h: 10,
    width: 7,
    height: 10,
    description: "Great for textbooks, music books, and technical manuals",
    category: 'standard'
  },
  {
    id: "7.44x9.69",
    label: '7.44" x 9.69" (Composition)',
    name: '7.44" x 9.69"',
    w: 7.44,
    h: 9.69,
    width: 7.44,
    height: 9.69,
    description: "Classic American school composition notebook format",
    category: 'standard'
  },
  {
    id: "7.5x9.25",
    label: '7.5" x 9.25" (Custom Textbook)',
    name: '7.5" x 9.25"',
    w: 7.5,
    h: 9.25,
    width: 7.5,
    height: 9.25,
    description: "Specialty journals, planners, and college workbooks",
    category: 'standard'
  },

  // 3. Specialty / Square / Landscape Formats
  {
    id: "8.25x6",
    label: '8.25" x 6" (Landscape Children\'s Book)',
    name: '8.25" x 6"',
    w: 8.25,
    h: 6,
    width: 8.25,
    height: 6,
    description: "Horizontal landscape format for children's picture books and wide puzzles",
    category: 'specialty'
  },
  {
    id: "8.25x8.25",
    label: '8.25" x 8.25" (Square Activity Book)',
    name: '8.25" x 8.25"',
    w: 8.25,
    h: 8.25,
    width: 8.25,
    height: 8.25,
    description: "Square format for children's activity books and games",
    category: 'specialty'
  },
  {
    id: "8.5x8.5",
    label: '8.5" x 8.5" (Square Coloring / Mandalas)',
    name: '8.5" x 8.5"',
    w: 8.5,
    h: 8.5,
    width: 8.5,
    height: 8.5,
    description: "Square format for mandalas, adult coloring, and Instagram-styled books",
    category: 'specialty'
  },
  {
    id: "8.27x11.69",
    label: '8.27" x 11.69" (A4 International)',
    name: '8.27" x 11.69"',
    w: 8.27,
    h: 11.69,
    width: 8.27,
    height: 11.69,
    description: "International ISO A4 format used widely in Europe and Asia",
    category: 'specialty'
  }
];

/**
 * Resolves a trim size from various input types:
 * - String ID (e.g. "8.5x11", "6x9")
 * - Dimension string (e.g. '8.5" x 11"')
 * - Partial object (e.g. { w: 8.5, h: 11 } or { width: 8.5, height: 11 } or { label: '...' })
 */
export function resolveTrimSize(input: any): KdpTrimSize {
  if (!input) return KDP_TRIM_SIZES[0];

  if (typeof input === 'string') {
    const clean = input.trim();
    // 1. Direct ID match (e.g. "8.5x11")
    const byId = KDP_TRIM_SIZES.find(t => t.id === clean);
    if (byId) return byId;

    // 2. Name or label match
    const byName = KDP_TRIM_SIZES.find(t => t.name === clean || t.label === clean || t.label.startsWith(clean));
    if (byName) return byName;

    // 3. Dimensions inside string (e.g. "8.5 x 11" or "8.5x11")
    const match = clean.match(/([\d.]+)\s*["x×]\s*([\d.]+)/i);
    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      const byDim = KDP_TRIM_SIZES.find(t => Math.abs(t.w - w) < 0.05 && Math.abs(t.h - h) < 0.05);
      if (byDim) return byDim;
      return {
        id: `${w}x${h}`,
        label: `${w}" x ${h}" (Custom)`,
        name: `${w}" x ${h}"`,
        w,
        h,
        width: w,
        height: h,
        category: 'standard'
      };
    }
  }

  if (typeof input === 'object') {
    if (input.id) {
      const byId = KDP_TRIM_SIZES.find(t => t.id === input.id);
      if (byId) return byId;
    }
    const w = typeof input.w === 'number' ? input.w : (typeof input.width === 'number' ? input.width : null);
    const h = typeof input.h === 'number' ? input.h : (typeof input.height === 'number' ? input.height : null);
    if (w !== null && h !== null) {
      const byDim = KDP_TRIM_SIZES.find(t => Math.abs(t.w - w) < 0.05 && Math.abs(t.h - h) < 0.05);
      if (byDim) return byDim;
      return {
        id: `${w}x${h}`,
        label: input.label || `${w}" x ${h}" (Custom)`,
        name: `${w}" x ${h}"`,
        w,
        h,
        width: w,
        height: h,
        category: 'standard'
      };
    }
    if (input.label) {
      return resolveTrimSize(input.label);
    }
  }

  return KDP_TRIM_SIZES[0];
}

/**
 * Returns exact width and height in inches.
 */
export function getTrimDimensions(input: any): { width: number; height: number; w: number; h: number; widthInches: number; heightInches: number } {
  const resolved = resolveTrimSize(input);
  return {
    width: resolved.w,
    height: resolved.h,
    w: resolved.w,
    h: resolved.h,
    widthInches: resolved.w,
    heightInches: resolved.h,
  };
}
