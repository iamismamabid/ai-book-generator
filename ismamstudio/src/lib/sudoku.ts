// lib/sudoku.ts
// Sudoku generator: creates a valid solved 9x9 grid, then removes numbers
// based on difficulty to create the puzzle. Uses backtracking for generation
// and a uniqueness check so removed puzzles always have exactly one solution.

export type Grid = number[][]; // 0 = empty cell

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40, // ~40 numbers shown (easier)
  medium: 32,
  hard: 26, // ~26 numbers shown (harder)
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  // Row check
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  // Column check
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  // 3x3 box check
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function findEmptyCell(grid: Grid): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function solve(grid: Grid): boolean {
  const empty = findEmptyCell(grid);
  if (!empty) return true; // solved

  const [row, col] = empty;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solve(grid)) return true;
      grid[row][col] = 0; // backtrack
    }
  }

  return false;
}

// Counts solutions up to `limit` (we only need to know if it's >1)
function countSolutions(grid: Grid, limit = 2): number {
  const empty = findEmptyCell(grid);
  if (!empty) return 1;

  const [row, col] = empty;
  let count = 0;

  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      count += countSolutions(grid, limit);
      grid[row][col] = 0;
      if (count >= limit) break; // early exit once we know it's not unique
    }
  }

  return count;
}

function generateSolvedGrid(): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(grid);
  return grid;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

/**
 * Generates a Sudoku puzzle + its solution.
 * Removes cells one at a time (in random order), checking after each
 * removal that the puzzle still has a unique solution. Stops once the
 * target clue count for the difficulty is reached, or removal would
 * break uniqueness.
 */
export function generateSudoku(difficulty: Difficulty = "medium"): {
  puzzle: Grid;
  solution: Grid;
} {
  const solution = generateSolvedGrid();
  const puzzle = cloneGrid(solution);

  const targetClues = DIFFICULTY_CLUES[difficulty];
  const totalCells = 81;
  let cellsToRemove = totalCells - targetClues;

  // All cell positions, shuffled
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  for (const [row, col] of positions) {
    if (cellsToRemove <= 0) break;

    const backup = puzzle[row][col];
    if (backup === 0) continue;

    puzzle[row][col] = 0;

    // Check uniqueness on a clone (countSolutions mutates the grid)
    const testGrid = cloneGrid(puzzle);
    const solutions = countSolutions(testGrid, 2);

    if (solutions !== 1) {
      // Removing this cell created multiple solutions — put it back
      puzzle[row][col] = backup;
    } else {
      cellsToRemove--;
    }
  }

  return { puzzle, solution };
}

/**
 * Generates multiple unique puzzles for a book (e.g. 50 puzzles).
 * Each call produces an independent puzzle/solution pair.
 */
export function generateSudokuBook(
  count: number,
  difficulty: Difficulty = "medium"
): { puzzle: Grid; solution: Grid }[] {
  const puzzles: { puzzle: Grid; solution: Grid }[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generateSudoku(difficulty));
  }
  return puzzles;
}