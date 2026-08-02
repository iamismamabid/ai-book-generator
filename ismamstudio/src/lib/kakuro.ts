export interface KakuroCell {
  type: "black" | "white";
  value?: number; // The solution value (1-9)
  displayValue?: string; // Revealed value for user (or empty)
  rowClue?: number; // Clue for row run starting here
  colClue?: number; // Clue for col run starting here
}

export type KakuroGrid = KakuroCell[][];

export interface KakuroPuzzle {
  grid: KakuroGrid;
  rows: number;
  cols: number;
}

// 🗺️ Predefined Layout Templates
const LAYOUTS: Record<string, string[]> = {
  "4x4": [
    "# # # # #",
    "# . . # #",
    "# . . . .",
    "# # . . .",
    "# # # . ."
  ],
  "6x6": [
    "# # # # # # #",
    "# . . . # . .",
    "# . . . # . .",
    "# . . . . . #",
    "# # . . . . .",
    "# . . # . . .",
    "# . . # . . ."
  ],
  "8x8": [
    "# # # # # # # # #",
    "# . . # . . # . .",
    "# . . . . . . . .",
    "# . . . . # . . .",
    "# # . . . . . # #",
    "# . . . # . . . .",
    "# . . . . . . . .",
    "# . . # . . # . .",
    "# # # # # # # # #"
  ],
  // Rows 2 and 8 of both templates below were originally a single unbroken
  // run of 11 (9x11) / 17 (9x17) white cells — mathematically impossible to
  // fill, since a Kakuro run needs that many *distinct* digits from a pool
  // of only 1-9. That's what was actually hanging generation for these two
  // sizes (a search for a solution that can't exist), not a solver
  // performance problem. One "#" divider midway through each of those rows
  // splits them into two valid (<=9-cell) runs; verified against every run
  // in both templates being <=9 cells long.
  "9x11": [
    "# # # # # # # # # # # #",
    "# . . # . . . # . . . #",
    "# . . . . . # . . . . .",
    "# . . . . # . . . . # .",
    "# # . . . . . # . . . .",
    "# . . . # . . . . # # #",
    "# . . . . # . . . . . #",
    "# # . . . . # . . . . .",
    "# . . . . . # . . . . .",
    "# # # # # # # # # # # #"
  ],
  "9x17": [
    "# # # # # # # # # # # # # # # # # #",
    "# . . # . . . # . . . # . . . # . .",
    "# . . . . . . . . # . . . . . . . .",
    "# . . . . # . . . . # . . . . # . .",
    "# # . . . . . # . . . . . # . . . .",
    "# . . . # . . . . # . . . . # # # #",
    "# . . . . # . . . . . # . . . . . #",
    "# # . . . . # . . . . . # . . . . .",
    "# . . . . . . . . # . . . . . . . .",
    "# # # # # # # # # # # # # # # # # #"
  ]
};

interface Run {
  r: number;
  c: number;
  cells: { r: number; c: number }[];
  targetSum?: number; // set once the grid is filled; read back by the solver
}

// 🧠 Parse layout into Runs
function getRuns(matrix: string[][]) {
  const R = matrix.length;
  const C = matrix[0].length;
  const hRuns: Run[] = [];
  const vRuns: Run[] = [];

  // Horizontal runs
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      if (matrix[r][c] === "#") {
        // Look to the right
        const runCells: { r: number; c: number }[] = [];
        let nextC = c + 1;
        while (nextC < C && matrix[r][nextC] === ".") {
          runCells.push({ r: r, c: nextC });
          nextC++;
        }
        if (runCells.length > 0) {
          hRuns.push({ r, c, cells: runCells });
        }
        c = nextC;
      } else {
        c++;
      }
    }
  }

  // Vertical runs
  for (let c = 0; c < C; c++) {
    let r = 0;
    while (r < R) {
      if (matrix[r][c] === "#") {
        // Look below
        const runCells: { r: number; c: number }[] = [];
        let nextR = r + 1;
        while (nextR < R && matrix[nextR][c] === ".") {
          runCells.push({ r: nextR, c: c });
          nextR++;
        }
        if (runCells.length > 0) {
          vRuns.push({ r, c, cells: runCells });
        }
        r = nextR;
      } else {
        r++;
      }
    }
  }

  return { hRuns, vRuns };
}

// 🎲 Generate Kakuro Grid Values & Clues
export function generateKakuro(sizeId: string, difficulty: string): KakuroPuzzle {
  const template = LAYOUTS[sizeId] || LAYOUTS["4x4"];
  const matrix = template.map(row => row.split(" "));
  const R = matrix.length;
  const C = matrix[0].length;

  const { hRuns, vRuns } = getRuns(matrix);

  // Initialize values
  const gridValues: number[][] = Array(R).fill(null).map(() => Array(C).fill(0));

  // Find a valid filling
  const fillSuccess = backtrackFill(gridValues, matrix, hRuns, vRuns);

  if (!fillSuccess) {
    // Fallback if backtracking fails to find layout
    return generateFallbackKakuro(R, C);
  }

  // Calculate clues based on filled values
  const grid: KakuroGrid = Array(R).fill(null).map(() => Array(C).fill(null));

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (matrix[r][c] === ".") {
        grid[r][c] = {
          type: "white",
          value: gridValues[r][c],
          displayValue: ""
        };
      } else {
        grid[r][c] = {
          type: "black"
        };
      }
    }
  }

  // Set sum clues
  hRuns.forEach(run => {
    const sum = run.cells.reduce((acc, cell) => acc + gridValues[cell.r][cell.c], 0);
    run.targetSum = sum;
    grid[run.r][run.c].rowClue = sum;
  });

  vRuns.forEach(run => {
    const sum = run.cells.reduce((acc, cell) => acc + gridValues[cell.r][cell.c], 0);
    run.targetSum = sum;
    grid[run.r][run.c].colClue = sum;
  });

  // Reveal helper cells based on difficulty — verifying uniqueness as we go,
  // since knowing only the sum clues (not the filled grid) can admit more
  // than one valid digit assignment even though the run-duplicate rule holds.
  revealHelperCells(grid, matrix, hRuns, vRuns, gridValues, difficulty);

  return { grid, rows: R, cols: C };
}

// 🧠 Fills the grid with any valid assignment (no run may repeat a digit).
// The original version walked cells in a fixed row-major, run-by-run order,
// trying digits 1-9 blindly at each one. That's fine for small grids, but a
// 9-cell run has to use all nine digits exactly once — a very tight
// constraint — and on the largest layouts (9x11, 9x17) an unlucky fixed
// order regularly went dozens of cells deep before discovering a conflict,
// then had to unwind all of it. Measured: didn't finish within 15s on 9x11.
// Same fix as the solver below: always branch on whichever open cell has the
// fewest legal digits left (MRV), so dead ends are hit almost immediately
// instead of after exploring mostly-doomed branches.
function backtrackFill(
  gridValues: number[][],
  matrix: string[][],
  hRuns: Run[],
  vRuns: Run[]
): boolean {
  const cellHRun = new Map<string, Run>();
  const cellVRun = new Map<string, Run>();
  hRuns.forEach(run => run.cells.forEach(cell => cellHRun.set(`${cell.r},${cell.c}`, run)));
  vRuns.forEach(run => run.cells.forEach(cell => cellVRun.set(`${cell.r},${cell.c}`, run)));

  const allCells: { r: number; c: number }[] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[0].length; c++) {
      if (matrix[r][c] === ".") allCells.push({ r, c });
    }
  }

  const candidatesFor = (r: number, c: number): number[] => {
    const used = new Set<number>();
    const hRun = cellHRun.get(`${r},${c}`);
    if (hRun) for (const cell of hRun.cells) if (gridValues[cell.r][cell.c] !== 0) used.add(gridValues[cell.r][cell.c]);
    const vRun = cellVRun.get(`${r},${c}`);
    if (vRun) for (const cell of vRun.cells) if (gridValues[cell.r][cell.c] !== 0) used.add(gridValues[cell.r][cell.c]);
    const candidates: number[] = [];
    for (let d = 1; d <= 9; d++) if (!used.has(d)) candidates.push(d);
    return candidates;
  };

  function backtrack(remaining: { r: number; c: number }[]): boolean {
    if (remaining.length === 0) return true;

    // MRV: branch on the open cell with the fewest legal digits left.
    let bestIdx = -1;
    let bestCandidates: number[] | null = null;
    for (let i = 0; i < remaining.length; i++) {
      const { r, c } = remaining[i];
      const candidates = candidatesFor(r, c);
      if (candidates.length === 0) return false; // dead end — backtrack immediately
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestIdx = i;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestIdx === -1 || !bestCandidates) return false;

    const { r, c } = remaining[bestIdx];
    const rest = remaining.slice(0, bestIdx).concat(remaining.slice(bestIdx + 1));
    shuffleArray(bestCandidates); // keep grids varied run to run, not just the first-found fill

    for (const val of bestCandidates) {
      gridValues[r][c] = val;
      if (backtrack(rest)) return true;
      gridValues[r][c] = 0;
    }
    return false;
  }

  return backtrack(allCells);
}

// Counts solutions to the puzzle as currently defined by its sum clues plus
// whichever cells are pre-revealed (fixed), stopping as soon as `limit` are
// found. Knowing a run's sum and that its digits don't repeat isn't enough
// to pin down a single digit assignment on its own — this is the actual
// solver that proves a puzzle is (or isn't) uniquely solvable.
//
// Naively trying 1-9 at each cell in a fixed order is exponential and was
// measured taking 95+ seconds on an 8x8 grid — unusable for on-demand
// generation. Two standard CSP techniques bring that down to milliseconds:
// per-cell candidate lists pruned by each run's remaining achievable-sum
// bounds (not just "not a duplicate"), and always branching on whichever
// open cell currently has the fewest candidates (MRV) so contradictions are
// hit almost immediately instead of after exploring mostly-dead branches.
function countKakuroSolutions(
  matrix: string[][],
  hRuns: Run[],
  vRuns: Run[],
  fixed: Map<string, number>,
  limit = 2
): number {
  const R = matrix.length;
  const C = matrix[0].length;
  const values: number[][] = Array(R).fill(null).map(() => Array(C).fill(0));
  fixed.forEach((val, key) => {
    const [r, c] = key.split(",").map(Number);
    values[r][c] = val;
  });

  const cellHRun = new Map<string, Run>();
  const cellVRun = new Map<string, Run>();
  hRuns.forEach(run => run.cells.forEach(cell => cellHRun.set(`${cell.r},${cell.c}`, run)));
  vRuns.forEach(run => run.cells.forEach(cell => cellVRun.set(`${cell.r},${cell.c}`, run)));

  let openCells: { r: number; c: number; key: string }[] = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (matrix[r][c] === "." && !fixed.has(`${r},${c}`)) {
        openCells.push({ r, c, key: `${r},${c}` });
      }
    }
  }

  // Digits still usable in a run (not already placed there), plus how much
  // sum and how many cells are left to fill.
  const runOpenState = (run: Run) => {
    const used = new Set<number>();
    let sum = 0;
    let filledCount = 0;
    for (const cell of run.cells) {
      const v = values[cell.r][cell.c];
      if (v === 0) continue;
      used.add(v);
      sum += v;
      filledCount++;
    }
    return { used, remainingSum: (run.targetSum || 0) - sum, remainingCells: run.cells.length - filledCount };
  };

  // Which digits could legally go in this run's next open cell, given the
  // sum still needed and how many cells remain to carry it (bounded by the
  // min/max sum achievable with that many distinct still-available digits).
  const candidatesForRun = (run: Run): Set<number> => {
    const { used, remainingSum, remainingCells } = runOpenState(run);
    const available: number[] = [];
    for (let d = 1; d <= 9; d++) if (!used.has(d)) available.push(d);

    const valid = new Set<number>();
    for (const d of available) {
      const afterSum = remainingSum - d;
      const afterCells = remainingCells - 1;
      if (afterCells === 0) {
        if (afterSum === 0) valid.add(d);
        continue;
      }
      const rest = available.filter(x => x !== d);
      if (rest.length < afterCells) continue;
      rest.sort((a, b) => a - b);
      const minSum = rest.slice(0, afterCells).reduce((s, x) => s + x, 0);
      const maxSum = rest.slice(-afterCells).reduce((s, x) => s + x, 0);
      if (afterSum >= minSum && afterSum <= maxSum) valid.add(d);
    }
    return valid;
  };

  const candidatesForCell = (r: number, c: number): number[] => {
    const hRun = cellHRun.get(`${r},${c}`);
    const vRun = cellVRun.get(`${r},${c}`);
    let candidates: Set<number> = hRun ? candidatesForRun(hRun) : new Set([1,2,3,4,5,6,7,8,9]);
    if (vRun) {
      const vCandidates = candidatesForRun(vRun);
      candidates = new Set([...candidates].filter(d => vCandidates.has(d)));
    }
    return [...candidates];
  };

  let count = 0;
  let nodesVisited = 0;
  // MRV + bounds pruning makes typical puzzles fast, but a puzzle whose
  // structure happens to defer contradictions late in the search can still
  // blow up (measured 40s on one 8x8 case). A pure node-count budget isn't
  // enough to bound that either — MRV selection cost at each node scales
  // with how many cells are still open, so the same node count costs far
  // more wall-clock time on a 9x17 grid than a 6x6 one (measured minutes,
  // not seconds, on the largest grid before switching to this). Checking
  // the clock directly is what actually caps real time regardless of grid
  // size. "Ran out of budget without reaching `limit`" is treated as
  // inconclusive — revealHelperCells below responds to that the same way as
  // "not yet unique" (reveals another clue), which is always safe: more
  // clues can only narrow the solution space, never widen it.
  const DEADLINE = Date.now() + 800;
  let budgetExceeded = false;

  function backtrack(remaining: { r: number; c: number; key: string }[]) {
    if (count >= limit || budgetExceeded) return;
    nodesVisited++;
    // Checked every node rather than batched: a single node's own MRV-selection
    // cost already scales with grid size, so batching the clock check risks
    // overshooting the deadline by many nodes' worth of work on a large grid.
    if (Date.now() > DEADLINE) {
      budgetExceeded = true;
      return;
    }
    if (remaining.length === 0) {
      count++;
      return;
    }

    // MRV: branch on the open cell with the fewest legal candidates.
    let bestIdx = -1;
    let bestCandidates: number[] | null = null;
    for (let i = 0; i < remaining.length; i++) {
      const { r, c } = remaining[i];
      const candidates = candidatesForCell(r, c);
      if (candidates.length === 0) return; // dead branch
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestIdx = i;
        bestCandidates = candidates;
        if (candidates.length === 1) break; // can't find fewer than 1
      }
    }
    if (bestIdx === -1 || !bestCandidates) return;

    const { r, c } = remaining[bestIdx];
    const rest = remaining.slice(0, bestIdx).concat(remaining.slice(bestIdx + 1));

    for (const val of bestCandidates) {
      values[r][c] = val;
      backtrack(rest);
      values[r][c] = 0;
      if (count >= limit || budgetExceeded) return;
    }
  }

  backtrack(openCells);
  // -1 (rather than the possibly-incomplete `count`) signals "inconclusive"
  // so callers never mistake a search that was cut short for a proof of
  // uniqueness.
  return budgetExceeded ? -1 : count;
}

// Reveal cells based on difficulty, then keep revealing more (in random
// order) until the puzzle — judged only by its sum clues and whatever is
// currently revealed, the same information the solver has — has exactly one
// solution. A difficulty target that happens to already be unique stops
// there; one that isn't gets extra clues added until it is.
function revealHelperCells(
  grid: KakuroGrid,
  matrix: string[][],
  hRuns: Run[],
  vRuns: Run[],
  gridValues: number[][],
  difficulty: string
) {
  const whiteCells: { r: number; c: number }[] = [];
  const R = matrix.length;
  const C = matrix[0].length;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (matrix[r][c] === ".") {
        whiteCells.push({ r, c });
      }
    }
  }

  shuffleArray(whiteCells);

  let targetRevealCount = 0;
  if (difficulty === "easy") {
    targetRevealCount = Math.floor(whiteCells.length * 0.4); // 40%
  } else if (difficulty === "intermediate") {
    targetRevealCount = Math.floor(whiteCells.length * 0.25); // 25%
  } else if (difficulty === "hard") {
    targetRevealCount = Math.floor(whiteCells.length * 0.1); // 10%
  } else if (difficulty === "challenging") {
    targetRevealCount = Math.floor(whiteCells.length * 0.05); // 5%
  } else {
    targetRevealCount = 0; // Expert has 0 starting clues
  }

  const fixed = new Map<string, number>();
  let revealed = 0;
  // Each solve attempt below is itself capped (~800ms), but a grid that
  // needs many attempts before reaching uniqueness could still chain enough
  // of them to feel stuck. Past this overall cap, stop calling the solver
  // and just reveal every remaining cell — trivially unique (it's the full
  // solution), so correctness never depends on finishing the search.
  const overallDeadline = Date.now() + 3000;

  for (const { r, c } of whiteCells) {
    const alreadyMinimumMet = revealed >= targetRevealCount;
    const outOfTime = Date.now() > overallDeadline;
    const isUniqueSoFar =
      !outOfTime && alreadyMinimumMet && countKakuroSolutions(matrix, hRuns, vRuns, fixed, 2) === 1;
    if (isUniqueSoFar) break;

    fixed.set(`${r},${c}`, gridValues[r][c]);
    grid[r][c].displayValue = String(grid[r][c].value);
    revealed++;

    if (outOfTime && alreadyMinimumMet) {
      // Already past the minimum reveal count and out of time to keep
      // proving uniqueness one clue at a time — reveal everything else in
      // one shot rather than continuing to pay the per-cell solver cost.
      for (const rest of whiteCells) {
        const key = `${rest.r},${rest.c}`;
        if (!fixed.has(key)) {
          fixed.set(key, gridValues[rest.r][rest.c]);
          grid[rest.r][rest.c].displayValue = String(grid[rest.r][rest.c].value);
        }
      }
      break;
    }
  }
}

// Fallback logic generator
function generateFallbackKakuro(R: number, C: number): KakuroPuzzle {
  const grid: KakuroGrid = Array(R).fill(null).map(() => Array(C).fill(null));
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (r === 0 || c === 0) {
        grid[r][c] = {
          type: "black",
          rowClue: r > 0 ? 10 : undefined,
          colClue: c > 0 ? 10 : undefined
        };
      } else {
        grid[r][c] = {
          type: "white",
          value: 5,
          displayValue: ""
        };
      }
    }
  }
  return { grid, rows: R, cols: C };
}

// Utilities
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
