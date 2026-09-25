/**
 * KDPage Calcudoku (KenKen / Mathdoku / Newdoku) Puzzle Engine
 * Generates valid Latin Square grids, cage partitions, math operations & clues
 */

export type CalcudokuOp = "+" | "-" | "×" | "÷" | "";

export interface CalcudokuCage {
  id: number;
  cells: [number, number][]; // [row, col]
  op: CalcudokuOp;
  target: number;
}

export interface CalcudokuPuzzle {
  id: string;
  title: string;
  size: 4 | 5 | 6 | 8;
  grid: number[][]; // Latin square solution
  cages: CalcudokuCage[];
  difficulty: "easy" | "medium" | "hard";
  opsAllowed: "all" | "add_sub" | "add_only" | "mul_div";
}

/**
 * Generate a valid Latin square of size N (every row & column contains 1..N exactly once)
 */
export function generateLatinSquare(size: number, seed: number): number[][] {
  let s = Math.abs(seed) + 1;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  // Base cyclic Latin Square
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

  // Permute digits (1..N map to randomly shuffled 1..N)
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
 * Partition grid into contiguous cages (1 to 4 cells each)
 */
export function partitionCages(
  grid: number[][],
  opsAllowed: "all" | "add_sub" | "add_only" | "mul_div",
  seed: number
): CalcudokuCage[] {
  const size = grid.length;
  let s = Math.abs(seed) + 7;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const visited: boolean[][] = Array(size)
    .fill(false)
    .map(() => Array(size).fill(false));

  const cages: CalcudokuCage[] = [];
  let cageIdCounter = 1;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (visited[r][c]) continue;

      const cageCells: [number, number][] = [[r, c]];
      visited[r][c] = true;

      // Determine cage size: 1 (15%), 2 (55%), 3 (20%), 4 (10%)
      const roll = rnd();
      const targetSize = roll < 0.15 ? 1 : roll < 0.70 ? 2 : roll < 0.90 ? 3 : 4;

      while (cageCells.length < targetSize) {
        // Find unvisited orthogonal neighbors
        const neighbors: [number, number][] = [];
        for (const [cr, cc] of cageCells) {
          const dirs = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ];
          for (const [dr, dc] of dirs) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (
              nr >= 0 &&
              nr < size &&
              nc >= 0 &&
              nc < size &&
              !visited[nr][nc] &&
              !neighbors.some(([er, ec]) => er === nr && ec === nc)
            ) {
              neighbors.push([nr, nc]);
            }
          }
        }

        if (neighbors.length === 0) break;
        // Pick random neighbor
        const pick = neighbors[Math.floor(rnd() * neighbors.length)];
        visited[pick[0]][pick[1]] = true;
        cageCells.push(pick);
      }

      // Sort cells top-left first for neat clue placement
      cageCells.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

      // Calculate cage values and pick math operator
      const values = cageCells.map(([cr, cc]) => grid[cr][cc]);
      const { op, target } = assignOperation(values, opsAllowed, rnd);

      cages.push({
        id: cageIdCounter++,
        cells: cageCells,
        op,
        target,
      });
    }
  }

  return cages;
}

/**
 * Assign appropriate math operator and calculate target number
 */
function assignOperation(
  values: number[],
  opsAllowed: "all" | "add_sub" | "add_only" | "mul_div",
  rnd: () => number
): { op: CalcudokuOp; target: number } {
  // Single-cell cage has no operation, just the number
  if (values.length === 1) {
    return { op: "", target: values[0] };
  }

  // 2-cell cages can support +, -, ×, ÷
  if (values.length === 2) {
    const [v1, v2] = values;
    const maxVal = Math.max(v1, v2);
    const minVal = Math.min(v1, v2);

    const availableOps: CalcudokuOp[] = [];

    if (opsAllowed === "add_only") {
      availableOps.push("+");
    } else if (opsAllowed === "add_sub") {
      availableOps.push("+", "-");
    } else if (opsAllowed === "mul_div") {
      availableOps.push("×");
      if (maxVal % minVal === 0) availableOps.push("÷");
    } else {
      // "all"
      availableOps.push("+", "-");
      availableOps.push("×");
      if (maxVal % minVal === 0) availableOps.push("÷");
    }

    const chosenOp = availableOps[Math.floor(rnd() * availableOps.length)];

    if (chosenOp === "-") {
      return { op: "-", target: maxVal - minVal };
    }
    if (chosenOp === "÷") {
      return { op: "÷", target: maxVal / minVal };
    }
    if (chosenOp === "×") {
      return { op: "×", target: v1 * v2 };
    }
    return { op: "+", target: v1 + v2 };
  }

  // 3+ cell cages: standard Calcudoku conventions only use + or ×
  if (opsAllowed === "mul_div") {
    const product = values.reduce((acc, v) => acc * v, 1);
    return { op: "×", target: product };
  }

  if (opsAllowed === "all") {
    // 50% addition, 50% multiplication (if product <= 200 to keep it manageable)
    const product = values.reduce((acc, v) => acc * v, 1);
    if (rnd() > 0.5 && product <= 200) {
      return { op: "×", target: product };
    }
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  return { op: "+", target: sum };
}

/**
 * Generate a single complete Calcudoku puzzle
 */
export function generateCalcudoku(
  size: 4 | 5 | 6 | 8 = 6,
  seed: number = Date.now(),
  opsAllowed: "all" | "add_sub" | "add_only" | "mul_div" = "all",
  title?: string
): CalcudokuPuzzle {
  const grid = generateLatinSquare(size, seed);
  const cages = partitionCages(grid, opsAllowed, seed);
  const difficulty = size <= 4 ? "easy" : size <= 6 ? "medium" : "hard";

  return {
    id: `calcudoku-${size}x${size}-${seed}`,
    title: title || `Calcudoku #${seed % 1000 || 1}`,
    size,
    grid,
    cages,
    difficulty,
    opsAllowed,
  };
}

/**
 * Generate multiple puzzles for a complete KDP book
 */
export function generateCalcudokuBook(
  count: number,
  size: 4 | 5 | 6 | 8 = 6,
  opsAllowed: "all" | "add_sub" | "add_only" | "mul_div" = "all"
): CalcudokuPuzzle[] {
  const list: CalcudokuPuzzle[] = [];
  let baseSeed = 501;

  for (let i = 0; i < count; i++) {
    list.push(
      generateCalcudoku(
        size,
        baseSeed++,
        opsAllowed,
        `Calcudoku Puzzle #${i + 1}`
      )
    );
  }

  return list;
}
