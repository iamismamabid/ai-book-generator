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
  "9x11": [
    "# # # # # # # # # # # #",
    "# . . # . . . # . . . #",
    "# . . . . . . . . . . .",
    "# . . . . # . . . . # .",
    "# # . . . . . # . . . .",
    "# . . . # . . . . # # #",
    "# . . . . # . . . . . #",
    "# # . . . . # . . . . .",
    "# . . . . . . . . . . .",
    "# # # # # # # # # # # #"
  ],
  "9x17": [
    "# # # # # # # # # # # # # # # # # #",
    "# . . # . . . # . . . # . . . # . .",
    "# . . . . . . . . . . . . . . . . .",
    "# . . . . # . . . . # . . . . # . .",
    "# # . . . . . # . . . . . # . . . .",
    "# . . . # . . . . # . . . . # # # #",
    "# . . . . # . . . . . # . . . . . #",
    "# # . . . . # . . . . . # . . . . .",
    "# . . . . . . . . . . . . . . . . .",
    "# # # # # # # # # # # # # # # # # #"
  ]
};

interface Run {
  r: number;
  c: number;
  cells: { r: number; c: number }[];
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
  const fillSuccess = backtrackFill(gridValues, matrix, hRuns, vRuns, 0, 0);

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
    grid[run.r][run.c].rowClue = sum;
  });

  vRuns.forEach(run => {
    const sum = run.cells.reduce((acc, cell) => acc + gridValues[cell.r][cell.c], 0);
    grid[run.r][run.c].colClue = sum;
  });

  // Reveal helper cells based on difficulty
  revealHelperCells(grid, matrix, difficulty);

  return { grid, rows: R, cols: C };
}

// 🧠 Backtracking assignment helper
function backtrackFill(
  gridValues: number[][],
  matrix: string[][],
  hRuns: Run[],
  vRuns: Run[],
  runIdx: number,
  cellIdx: number
): boolean {
  if (runIdx >= hRuns.length) {
    return true; // All horizontal runs satisfied
  }

  const run = hRuns[runIdx];
  if (cellIdx >= run.cells.length) {
    return backtrackFill(gridValues, matrix, hRuns, vRuns, runIdx + 1, 0);
  }

  const cell = run.cells[cellIdx];
  const { r, c } = cell;

  // Numbers available
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  for (const num of numbers) {
    if (isValidPlacement(gridValues, hRuns, vRuns, r, c, num)) {
      gridValues[r][c] = num;
      if (backtrackFill(gridValues, matrix, hRuns, vRuns, runIdx, cellIdx + 1)) {
        return true;
      }
      gridValues[r][c] = 0; // Backtrack
    }
  }

  return false;
}

// Validate unique numbers in overlapping runs
function isValidPlacement(
  gridValues: number[][],
  hRuns: Run[],
  vRuns: Run[],
  r: number,
  c: number,
  val: number
): boolean {
  // Check horizontal run
  const hRun = hRuns.find(run => run.cells.some(cell => cell.r === r && cell.c === c));
  if (hRun) {
    for (const cell of hRun.cells) {
      if (gridValues[cell.r][cell.c] === val) return false;
    }
  }

  // Check vertical run
  const vRun = vRuns.find(run => run.cells.some(cell => cell.r === r && cell.c === c));
  if (vRun) {
    for (const cell of vRun.cells) {
      if (gridValues[cell.r][cell.c] === val) return false;
    }
  }

  return true;
}

// Reveal cells based on difficulty
function revealHelperCells(grid: KakuroGrid, matrix: string[][], difficulty: string) {
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

  let revealCount = 0;
  if (difficulty === "easy") {
    revealCount = Math.floor(whiteCells.length * 0.4); // 40%
  } else if (difficulty === "intermediate") {
    revealCount = Math.floor(whiteCells.length * 0.25); // 25%
  } else if (difficulty === "hard") {
    revealCount = Math.floor(whiteCells.length * 0.1); // 10%
  } else if (difficulty === "challenging") {
    revealCount = Math.floor(whiteCells.length * 0.05); // 5%
  } else {
    revealCount = 0; // Expert has 0 starting clues
  }

  for (let i = 0; i < revealCount; i++) {
    const { r, c } = whiteCells[i];
    grid[r][c].displayValue = String(grid[r][c].value);
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
