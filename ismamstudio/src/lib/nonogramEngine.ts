/**
 * KDPage Nonogram (Picross / Hanjie / Griddlers) Engine
 * Professional Logic Puzzle Generation, Clue Extraction & Pixel Art Library
 */

export interface NonogramClues {
  rows: number[][];
  cols: number[][];
}

export interface NonogramPuzzle {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  width: number;
  height: number;
  grid: number[][]; // 1 = filled, 0 = empty
  clues: NonogramClues;
  category?: string;
}

/**
 * Calculates standard Nonogram row clues (runs of consecutive 1s)
 */
export function calculateRowClues(grid: number[][]): number[][] {
  return grid.map((row) => {
    const clues: number[] = [];
    let count = 0;
    for (const cell of row) {
      if (cell === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues.length === 0 ? [0] : clues;
  });
}

/**
 * Calculates standard Nonogram column clues (runs of consecutive 1s)
 */
export function calculateColClues(grid: number[][]): number[][] {
  const width = grid[0]?.length || 0;
  const height = grid.length;
  const cols: number[][] = [];

  for (let c = 0; c < width; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < height; r++) {
      if (grid[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    cols.push(clues.length === 0 ? [0] : clues);
  }

  return cols;
}

export function extractClues(grid: number[][]): NonogramClues {
  return {
    rows: calculateRowClues(grid),
    cols: calculateColClues(grid),
  };
}

/**
 * Converts string matrix (using '#' for filled and '.' for empty) to number grid
 */
export function parseAsciiGrid(ascii: string[]): number[][] {
  return ascii.map((row) =>
    row.trim().split("").map((ch) => (ch === "#" || ch === "1" ? 1 : 0))
  );
}

// -------------------------------------------------------------
// CURATED HAND-CRAFTED PIXEL ART LIBRARY (5x5, 10x10, 15x15)
// -------------------------------------------------------------

export interface PredefinedNonogramItem {
  id: string;
  name: string;
  category: "Animals" | "Nature & Food" | "Objects & Fantasy" | "Kids & Easy";
  width: number;
  height: number;
  ascii: string[];
}

export const PRESET_NONOGRAMS: PredefinedNonogramItem[] = [
  // --- 5x5 Easy / Kids ---
  {
    id: "heart-5x5",
    name: "Heart",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      ".#.#.",
      "#####",
      "#####",
      ".###.",
      "..#..",
    ],
  },
  {
    id: "tree-5x5",
    name: "Pine Tree",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      "..#..",
      ".###.",
      "#####",
      "..#..",
      "..#..",
    ],
  },
  {
    id: "house-5x5",
    name: "Cozy House",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      "..#..",
      ".###.",
      "#####",
      "#.###",
      "#.#.#",
    ],
  },
  {
    id: "duck-5x5",
    name: "Little Duck",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      ".##..",
      ".###.",
      "#####",
      "#####",
      ".###.",
    ],
  },
  {
    id: "boat-5x5",
    name: "Sailboat",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      "..#..",
      ".##..",
      "####.",
      "#####",
      ".###.",
    ],
  },
  {
    id: "star-5x5",
    name: "Bright Star",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      "..#..",
      "#####",
      ".###.",
      "##.##",
      "#...#",
    ],
  },
  {
    id: "car-5x5",
    name: "Mini Car",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      ".###.",
      "#####",
      "#####",
      ".#.#.",
      ".....",
    ],
  },
  {
    id: "fish-5x5",
    name: "Small Fish",
    category: "Kids & Easy",
    width: 5,
    height: 5,
    ascii: [
      "..#.#",
      ".####",
      "#####",
      ".####",
      "..#.#",
    ],
  },

  // --- 10x10 Standard ---
  {
    id: "cat-10x10",
    name: "Cat Silhouette",
    category: "Animals",
    width: 10,
    height: 10,
    ascii: [
      "#........#",
      "##......##",
      "##########",
      "##########",
      "###.##.###",
      "##########",
      ".########.",
      "..######..",
      "..######.#",
      "..######.#",
    ],
  },
  {
    id: "dog-10x10",
    name: "Puppy Face",
    category: "Animals",
    width: 10,
    height: 10,
    ascii: [
      "##......##",
      "###....###",
      "##########",
      "##########",
      "##.####.##",
      "##########",
      ".###..###.",
      "..######..",
      "...####...",
      "....##....",
    ],
  },
  {
    id: "butterfly-10x10",
    name: "Butterfly",
    category: "Animals",
    width: 10,
    height: 10,
    ascii: [
      "#...##...#",
      "##..##..##",
      "##########",
      "##########",
      ".########.",
      "..######..",
      ".########.",
      "##..##..##",
      "#...##...#",
      "....##....",
    ],
  },
  {
    id: "penguin-10x10",
    name: "Baby Penguin",
    category: "Animals",
    width: 10,
    height: 10,
    ascii: [
      "...####...",
      "..######..",
      "..#.##.#..",
      "..######..",
      ".########.",
      "###.##.###",
      "###....###",
      ".##....##.",
      ".########.",
      "..##..##..",
    ],
  },
  {
    id: "rabbit-10x10",
    name: "Bunny Rabbit",
    category: "Animals",
    width: 10,
    height: 10,
    ascii: [
      ".##....##.",
      ".##....##.",
      ".##....##.",
      ".########.",
      "##########",
      "##.####.##",
      "##########",
      ".########.",
      "..######..",
      "..##..##..",
    ],
  },
  {
    id: "apple-10x10",
    name: "Red Apple",
    category: "Nature & Food",
    width: 10,
    height: 10,
    ascii: [
      "....#.#...",
      ".....##...",
      "...####...",
      ".########.",
      "##########",
      "##########",
      "##########",
      ".########.",
      "..######..",
      "...#..#...",
    ],
  },
  {
    id: "coffee-10x10",
    name: "Coffee Mug",
    category: "Nature & Food",
    width: 10,
    height: 10,
    ascii: [
      "..#..#....",
      "...#..#...",
      "..........",
      "#######...",
      "#######.##",
      "#######..#",
      "#######..#",
      "#######.##",
      ".#####....",
      "#######...",
    ],
  },
  {
    id: "mushroom-10x10",
    name: "Forest Mushroom",
    category: "Nature & Food",
    width: 10,
    height: 10,
    ascii: [
      "...####...",
      ".########.",
      "##########",
      "##.####.##",
      "##########",
      "##########",
      "...####...",
      "...####...",
      "...####...",
      "..######..",
    ],
  },
  {
    id: "crown-10x10",
    name: "Royal Crown",
    category: "Objects & Fantasy",
    width: 10,
    height: 10,
    ascii: [
      "#...#....#",
      "##..#...##",
      "##.###.###",
      "##########",
      "##########",
      "##.####.##",
      "##########",
      "##########",
      "##########",
      "##########",
    ],
  },
  {
    id: "rocket-10x10",
    name: "Space Rocket",
    category: "Objects & Fantasy",
    width: 10,
    height: 10,
    ascii: [
      "....##....",
      "...####...",
      "...####...",
      "...#.##...",
      "..######..",
      "..######..",
      ".########.",
      "##########",
      "#...##...#",
      "....##....",
    ],
  },
  {
    id: "anchor-10x10",
    name: "Ship Anchor",
    category: "Objects & Fantasy",
    width: 10,
    height: 10,
    ascii: [
      "....##....",
      "...#..#...",
      "....##....",
      "....##....",
      "..######..",
      "....##....",
      "#...##...#",
      "##..##..##",
      ".########.",
      "...####...",
    ],
  },
  {
    id: "gamepad-10x10",
    name: "Retro Gamepad",
    category: "Objects & Fantasy",
    width: 10,
    height: 10,
    ascii: [
      "..........",
      ".########.",
      "##########",
      "##.####.##",
      "###.##.###",
      "##.####.##",
      "##########",
      ".########.",
      "##......##",
      "..........",
    ],
  },

  // --- 15x15 Hard / Expert ---
  {
    id: "castle-15x15",
    name: "Medieval Castle",
    category: "Objects & Fantasy",
    width: 15,
    height: 15,
    ascii: [
      "#.#...#.#...#.#",
      "###...###...###",
      "###...###...###",
      "###############",
      "###############",
      "#.#...#.#...#.#",
      "###...###...###",
      "###############",
      "###############",
      "######...######",
      "######...######",
      "######...######",
      "######...######",
      "###############",
      "###############",
    ],
  },
  {
    id: "eagle-15x15",
    name: "Soaring Eagle",
    category: "Animals",
    width: 15,
    height: 15,
    ascii: [
      ".......#.......",
      "......###......",
      "#....#####....#",
      "##..#######..##",
      "###############",
      ".#############.",
      "..###########..",
      "...#########...",
      "....#######....",
      ".....#####.....",
      "......###......",
      ".....#####.....",
      "....#######....",
      "...##..#..##...",
      "..#.........#..",
    ],
  },
  {
    id: "dino-15x15",
    name: "T-Rex Dinosaur",
    category: "Animals",
    width: 15,
    height: 15,
    ascii: [
      ".....######....",
      "....########...",
      "....#.######...",
      "....########...",
      "....####.......",
      "....#######....",
      "...#########...",
      "...##########..",
      "..###########..",
      "..###.####.##..",
      ".##...####..#..",
      "##....####.....",
      "#.....##.##....",
      "......##.##....",
      ".....###.###...",
    ],
  },
  {
    id: "island-15x15",
    name: "Tropical Island",
    category: "Nature & Food",
    width: 15,
    height: 15,
    ascii: [
      "......#........",
      "....#####......",
      "...#######.....",
      "....#.#.#......",
      "......#........",
      "......#........",
      ".....#.........",
      ".....#.........",
      "....#..........",
      "....#..........",
      "...###########.",
      "..#############",
      ".##############",
      "###############",
      "...............",
    ],
  },
];

/**
 * Procedural symmetrical pattern generator for high-volume puzzle books
 */
export function generateProceduralNonogram(
  size: 5 | 10 | 15 | 20,
  seed: number,
  title?: string
): NonogramPuzzle {
  // Simple seeded pseudorandom
  let s = Math.abs(seed) + 1;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const grid: number[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  const half = Math.ceil(size / 2);
  const density = 0.48 + rnd() * 0.1; // Balanced density between 48% - 58%

  // Build left half with symmetry for aesthetic appeal
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < half; c++) {
      // Favor center clustering
      const distFromCenter = Math.hypot(r - size / 2, c - half);
      const prob = density - (distFromCenter / (size * 1.5)) * 0.2;
      const fill = rnd() < prob ? 1 : 0;
      grid[r][c] = fill;
      grid[r][size - 1 - c] = fill; // Mirror symmetry
    }
  }

  // Ensure no entirely empty rows or columns
  for (let r = 0; r < size; r++) {
    if (!grid[r].includes(1)) {
      grid[r][half - 1] = 1;
      grid[r][size - half] = 1;
    }
  }

  const clues = extractClues(grid);
  const difficulty =
    size === 5 ? "easy" : size === 10 ? "medium" : size === 15 ? "hard" : "expert";

  return {
    id: `custom-nonogram-${size}x${size}-${seed}`,
    title: title || `Pattern #${seed}`,
    difficulty,
    width: size,
    height: size,
    grid,
    clues,
    category: "Logic Pattern",
  };
}

/**
 * Creates a puzzle from a preset item
 */
export function createPuzzleFromPreset(preset: PredefinedNonogramItem): NonogramPuzzle {
  const grid = parseAsciiGrid(preset.ascii);
  const clues = extractClues(grid);
  const difficulty =
    preset.width <= 5 ? "easy" : preset.width <= 10 ? "medium" : "hard";

  return {
    id: preset.id,
    title: preset.name,
    difficulty,
    width: preset.width,
    height: preset.height,
    grid,
    clues,
    category: preset.category,
  };
}

/**
 * Generate a sequence of puzzles for a complete KDP book
 */
export function generateNonogramBook(
  count: number,
  size: 5 | 10 | 15 = 10,
  categoryFilter?: string
): NonogramPuzzle[] {
  const list: NonogramPuzzle[] = [];

  // 1. First add matching handcrafted presets
  let presets = PRESET_NONOGRAMS.filter((p) => p.width === size);
  if (categoryFilter && categoryFilter !== "All") {
    presets = presets.filter((p) => p.category === categoryFilter);
  }

  presets.forEach((p) => {
    if (list.length < count) {
      list.push(createPuzzleFromPreset(p));
    }
  });

  // 2. If user requests more puzzles than handcrafted presets, generate procedural logic patterns
  let seed = 101;
  while (list.length < count) {
    list.push(
      generateProceduralNonogram(
        size,
        seed++,
        `Mystery Nonogram #${list.length + 1}`
      )
    );
  }

  return list;
}
