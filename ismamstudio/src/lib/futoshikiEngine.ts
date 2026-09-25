/**
 * KDPage Futoshiki (不等式 / More or Less / Unequal) Puzzle Engine
 * Generates valid Latin Square grids with unique solution guarantee and inequality clues
 */

export type FutoshikiSize = 4 | 5 | 6 | 7 | 8 | 9;
export type FutoshikiDifficulty = "easy" | "medium" | "hard" | "expert";

export interface FutoshikiInequalityH {
  row: number;
  col: number; // inequality between [row, col] and [row, col + 1]
  sign: "<" | ">"; // true relation: solution[row][col] < solution[row][col+1] or >
}

export interface FutoshikiInequalityV {
  row: number; // inequality between [row, col] and [row + 1, col]
  col: number;
  sign: "^" | "v"; // '^' means [row][col] < [row+1][col], 'v' means [row][col] > [row+1][col]
}

export interface FutoshikiPuzzle {
  id: string;
  title: string;
  size: FutoshikiSize;
  solution: number[][]; // N x N Latin Square numbers (1..N)
  initialGrid: (number | null)[][]; // starting puzzle numbers
  hInequalities: FutoshikiInequalityH[]; // horizontal inequalities
  vInequalities: FutoshikiInequalityV[]; // vertical inequalities
  difficulty: FutoshikiDifficulty;
}

/**
 * Generate a valid Latin Square of size N (every row & column contains 1..N exactly once)
 */
export function generateLatinSquare(size: number, seed: number): number[][] {
  let s = Math.abs(seed) + 1;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  // Base cyclic Latin Square: cell (r, c) = ((r + c) % size) + 1
  const grid: number[][] = Array(size)
    .fill(0)
    .map((_, r) =>
      Array(size)
        .fill(0)
        .map((_, c) => ((r + c) % size) + 1)
    );

  // Shuffle rows
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const temp = grid[i];
    grid[i] = grid[j];
    grid[j] = temp;
  }

  // Shuffle columns
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    for (let r = 0; r < size; r++) {
      const temp = grid[r][i];
      grid[r][i] = grid[r][j];
      grid[r][j] = temp;
    }
  }

  // Permute digits randomly (1..N)
  const digits = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const temp = digits[i];
    digits[i] = digits[j];
    digits[j] = temp;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c] = digits[grid[r][c] - 1];
    }
  }

  return grid;
}

/**
 * Backtracking solver to count solutions for a Futoshiki puzzle setup.
 * Caps at maxSolutions (default 2) to quickly test uniqueness.
 */
export function countFutoshikiSolutions(
  size: number,
  initialGrid: (number | null)[][],
  hInequalities: FutoshikiInequalityH[],
  vInequalities: FutoshikiInequalityV[],
  maxSolutions: number = 2
): number {
  const current: number[][] = Array(size)
    .fill(0)
    .map((_, r) =>
      Array(size)
        .fill(0)
        .map((_, c) => initialGrid[r][c] || 0)
    );

  // Quick lookup maps for horizontal & vertical inequalities
  const hMap: Record<string, "<" | ">"> = {};
  hInequalities.forEach((h) => {
    hMap[`${h.row},${h.col}`] = h.sign;
  });

  const vMap: Record<string, "^" | "v"> = {};
  vInequalities.forEach((v) => {
    vMap[`${v.row},${v.col}`] = v.sign;
  });

  let solutionCount = 0;

  function isValid(r: number, c: number, num: number): boolean {
    // Row check
    for (let col = 0; col < size; col++) {
      if (col !== c && current[r][col] === num) return false;
    }
    // Column check
    for (let row = 0; row < size; row++) {
      if (row !== r && current[row][c] === num) return false;
    }

    // Horizontal inequality with left neighbor (c - 1)
    if (c > 0 && current[r][c - 1] !== 0) {
      const sign = hMap[`${r},${c - 1}`];
      if (sign === "<" && !(current[r][c - 1] < num)) return false;
      if (sign === ">" && !(current[r][c - 1] > num)) return false;
    }

    // Horizontal inequality with right neighbor (c + 1)
    if (c < size - 1 && current[r][c + 1] !== 0) {
      const sign = hMap[`${r},${c}`];
      if (sign === "<" && !(num < current[r][c + 1])) return false;
      if (sign === ">" && !(num > current[r][c + 1])) return false;
    }

    // Vertical inequality with top neighbor (r - 1)
    if (r > 0 && current[r - 1][c] !== 0) {
      const sign = vMap[`${r - 1},${c}`];
      if (sign === "^" && !(current[r - 1][c] < num)) return false;
      if (sign === "v" && !(current[r - 1][c] > num)) return false;
    }

    // Vertical inequality with bottom neighbor (r + 1)
    if (r < size - 1 && current[r + 1][c] !== 0) {
      const sign = vMap[`${r},${c}`];
      if (sign === "^" && !(num < current[r + 1][c])) return false;
      if (sign === "v" && !(num > current[r + 1][c])) return false;
    }

    return true;
  }

  function solve(index: number): boolean {
    if (index === size * size) {
      solutionCount++;
      return solutionCount >= maxSolutions;
    }

    const r = Math.floor(index / size);
    const c = index % size;

    if (current[r][c] !== 0) {
      return solve(index + 1);
    }

    for (let num = 1; num <= size; num++) {
      if (isValid(r, c, num)) {
        current[r][c] = num;
        if (solve(index + 1)) return true;
        current[r][c] = 0;
      }
    }

    return false;
  }

  solve(0);
  return solutionCount;
}

/**
 * Generate a complete, verified solvable Futoshiki puzzle
 */
export function generateFutoshiki(
  size: FutoshikiSize = 5,
  difficulty: FutoshikiDifficulty = "medium",
  seed: number = Date.now(),
  title?: string
): FutoshikiPuzzle {
  let s = Math.abs(seed) + 17;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const solution = generateLatinSquare(size, seed);

  // 1. Collect all true inequalities in the solution
  const allH: FutoshikiInequalityH[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      allH.push({
        row: r,
        col: c,
        sign: solution[r][c] < solution[r][c + 1] ? "<" : ">",
      });
    }
  }

  const allV: FutoshikiInequalityV[] = [];
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      allV.push({
        row: r,
        col: c,
        sign: solution[r][c] < solution[r + 1][c] ? "^" : "v",
      });
    }
  }

  // Shuffle inequalities using seed
  for (let i = allH.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const temp = allH[i];
    allH[i] = allH[j];
    allH[j] = temp;
  }
  for (let i = allV.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const temp = allV[i];
    allV[i] = allV[j];
    allV[j] = temp;
  }

  // Inequality ratios based on difficulty
  const ineqRatio =
    difficulty === "easy"
      ? 0.55
      : difficulty === "medium"
      ? 0.42
      : difficulty === "hard"
      ? 0.30
      : 0.22;

  const targetHCount = Math.max(1, Math.round(allH.length * ineqRatio));
  const targetVCount = Math.max(1, Math.round(allV.length * ineqRatio));

  const selectedH = allH.slice(0, targetHCount);
  const selectedV = allV.slice(0, targetVCount);

  // 2. Pre-fill initial numbers based on difficulty & size
  // Easy: ~35% revealed, Medium: ~22%, Hard: ~12%, Expert: ~6%
  const numRatio =
    difficulty === "easy"
      ? 0.36
      : difficulty === "medium"
      ? 0.24
      : difficulty === "hard"
      ? 0.14
      : 0.08;

  const targetNumClues = Math.max(
    1,
    Math.min(size * size - 2, Math.round(size * size * numRatio))
  );

  const initialGrid: (number | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  // Random cell coordinates list
  const allCoords: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      allCoords.push([r, c]);
    }
  }
  for (let i = allCoords.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const temp = allCoords[i];
    allCoords[i] = allCoords[j];
    allCoords[j] = temp;
  }

  for (let i = 0; i < targetNumClues; i++) {
    const [r, c] = allCoords[i];
    initialGrid[r][c] = solution[r][c];
  }

  // 3. Ensure uniqueness: if multiple solutions, add numbers until unique
  let clueIndex = targetNumClues;
  while (clueIndex < allCoords.length) {
    const count = countFutoshikiSolutions(size, initialGrid, selectedH, selectedV, 2);
    if (count <= 1) break; // Unique solution verified!
    const [r, c] = allCoords[clueIndex];
    initialGrid[r][c] = solution[r][c];
    clueIndex++;
  }

  return {
    id: `futoshiki-${size}x${size}-${seed}`,
    title: title || `Futoshiki #${seed % 1000 || 1}`,
    size,
    solution,
    initialGrid,
    hInequalities: selectedH,
    vInequalities: selectedV,
    difficulty,
  };
}

/**
 * Generate multiple verified Futoshiki puzzles for a complete KDP book
 */
export function generateFutoshikiBook(
  count: number,
  size: FutoshikiSize = 5,
  difficulty: FutoshikiDifficulty = "medium",
  startSeed: number = 701
): FutoshikiPuzzle[] {
  const puzzles: FutoshikiPuzzle[] = [];
  let curSeed = startSeed;

  for (let i = 0; i < count; i++) {
    puzzles.push(
      generateFutoshiki(
        size,
        difficulty,
        curSeed++,
        `Futoshiki Puzzle #${i + 1}`
      )
    );
  }

  return puzzles;
}
