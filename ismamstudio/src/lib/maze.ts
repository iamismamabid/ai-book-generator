// lib/maze.ts
// Maze generator using recursive backtracking (depth-first search) on a
// rectangular grid, with optional shape masking (circle, heart) that
// removes cells outside the shape boundary. Produces a perfect maze
// (exactly one path between any two cells, no loops) restricted to the
// chosen shape.

import { generateUniquePuzzle } from "./puzzleDedup";

export type Shape = "square" | "circle" | "heart";

export interface Cell {
  row: number;
  col: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
  active: boolean; // false = outside the shape mask, not part of the maze
}

export type MazeGrid = Cell[][];

interface GenerateOptions {
  rows: number;
  cols: number;
  shape: Shape;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns true if the cell at (row, col) should be part of the maze,
 * based on the chosen shape. Uses normalized coordinates (-1..1) centered
 * on the grid to test against shape boundary equations.
 */
function isInsideShape(row: number, col: number, rows: number, cols: number, shape: Shape): boolean {
  if (shape === "square") return true;

  // Normalize to -1..1 range, centered
  const x = (col - (cols - 1) / 2) / ((cols - 1) / 2);
  const y = (row - (rows - 1) / 2) / ((rows - 1) / 2);

  if (shape === "circle") {
    return x * x + y * y <= 1;
  }

  if (shape === "heart") {
    // Classic implicit heart curve: (x^2 + y^2 - 1)^3 - x^2*y^3 <= 0
    // Scaled by 1.3x so the two lobes and bottom point render clearly
    // even on small grids. Flip y because grid row 0 is at the top,
    // while the heart equation expects the dip at the top with
    // positive-y-up math coordinates.
    const xs = x * 1.3;
    const ys = y * 1.3;
    const yy = -ys;
    const a = xs * xs + yy * yy - 1;
    return a * a * a - xs * xs * yy * yy * yy <= 0;
  }

  return true;
}

function createGrid(rows: number, cols: number, shape: Shape): MazeGrid {
  const grid: MazeGrid = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        active: isInsideShape(r, c, rows, cols, shape),
      });
    }
    grid.push(row);
  }
  return grid;
}

function getActiveNeighbors(grid: MazeGrid, row: number, col: number, rows: number, cols: number): Cell[] {
  const neighbors: Cell[] = [];
  const deltas = [
    [-1, 0], // top
    [0, 1], // right
    [1, 0], // bottom
    [0, -1], // left
  ];

  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      const cell = grid[nr][nc];
      if (cell.active && !cell.visited) {
        neighbors.push(cell);
      }
    }
  }
  return neighbors;
}

function removeWallBetween(a: Cell, b: Cell) {
  const dr = b.row - a.row;
  const dc = b.col - a.col;

  if (dr === 1) {
    a.walls.bottom = false;
    b.walls.top = false;
  } else if (dr === -1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (dc === 1) {
    a.walls.right = false;
    b.walls.left = false;
  } else if (dc === -1) {
    a.walls.left = false;
    b.walls.right = false;
  }
}

/**
 * Finds the first active cell, scanning row by row — used as the maze's
 * starting point so it's guaranteed to be inside the shape.
 */
function findFirstActiveCell(grid: MazeGrid, rows: number, cols: number): [number, number] | null {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].active) return [r, c];
    }
  }
  return null;
}

function findLastActiveCell(grid: MazeGrid, rows: number, cols: number): [number, number] | null {
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      if (grid[r][c].active) return [r, c];
    }
  }
  return null;
}

/**
 * Generates a perfect maze using iterative recursive backtracking
 * (stack-based, to avoid call-stack overflow on large grids).
 */
export function generateMaze({ rows, cols, shape }: GenerateOptions): {
  grid: MazeGrid;
  start: [number, number];
  end: [number, number];
} {
  const grid = createGrid(rows, cols, shape);

  const startPos = findFirstActiveCell(grid, rows, cols);
  if (!startPos) {
    throw new Error("Shape mask leaves no active cells — grid too small for this shape");
  }

  const [startRow, startCol] = startPos;
  const stack: Cell[] = [];
  let current = grid[startRow][startCol];
  current.visited = true;
  stack.push(current);

  while (stack.length > 0) {
    const neighbors = getActiveNeighbors(grid, current.row, current.col, rows, cols);

    if (neighbors.length > 0) {
      const next = shuffle(neighbors)[0];
      removeWallBetween(current, next);
      next.visited = true;
      stack.push(next);
      current = next;
    } else {
      stack.pop();
      if (stack.length > 0) {
        current = stack[stack.length - 1];
      }
    }
  }

  const endPos = findLastActiveCell(grid, rows, cols) ?? startPos;

  return { grid, start: startPos, end: endPos };
}

/**
 * Solves a maze using BFS, returning the path from start to end as a
 * list of [row, col] coordinates. Used to render the solution page.
 */
export function solveMaze(
  grid: MazeGrid,
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const queue: { pos: [number, number]; path: [number, number][] }[] = [
    { pos: start, path: [start] },
  ];
  visited.add(`${start[0]},${start[1]}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    const [row, col] = pos;

    if (row === end[0] && col === end[1]) {
      return path;
    }

    const cell = grid[row][col];
    const moves: [number, number, keyof Cell["walls"]][] = [
      [row - 1, col, "top"],
      [row + 1, col, "bottom"],
      [row, col - 1, "left"],
      [row, col + 1, "right"],
    ];

    for (const [nr, nc, wall] of moves) {
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !cell.walls[wall] &&
        grid[nr][nc].active &&
        !visited.has(`${nr},${nc}`)
      ) {
        visited.add(`${nr},${nc}`);
        queue.push({ pos: [nr, nc], path: [...path, [nr, nc]] });
      }
    }
  }

  return []; // no path found (shouldn't happen for a connected maze)
}

// Serializes a maze's wall layout + start/end into a compact signature.
// Small grids (common at "easy" difficulty) have a limited enough number of
// distinct perfect mazes that a large book can plausibly repeat one exactly.
function mazeSignature(m: { grid: MazeGrid; start: [number, number]; end: [number, number] }): string {
  const walls = m.grid
    .map((row) =>
      row
        .map((cell) =>
          cell.active ? `${+cell.walls.top}${+cell.walls.right}${+cell.walls.bottom}${+cell.walls.left}` : "x"
        )
        .join("")
    )
    .join("|");
  return `${walls}#${m.start.join(",")}#${m.end.join(",")}`;
}

export function generateMazeBook(
  count: number,
  rows: number,
  cols: number,
  shape: Shape
): { grid: MazeGrid; start: [number, number]; end: [number, number] }[] {
  const mazes = [];
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    mazes.push(generateUniquePuzzle(() => generateMaze({ rows, cols, shape }), mazeSignature, seen));
  }
  return mazes;
}