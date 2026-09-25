/**
 * KDPage Nurikabe (ぬりかべ / Islands in the Stream / Cell Structure) Puzzle Engine
 * Generates verified, valid Nurikabe logic puzzles with islands and connected sea.
 */

export type NurikabeDifficulty = "easy" | "medium" | "hard" | "expert";

export type CellState = "unmarked" | "sea" | "island";

export interface NurikabePuzzle {
  id: string;
  title: string;
  rows: number;
  cols: number;
  difficulty: NurikabeDifficulty;
  // Numeric clue in cell (null if blank unnumbered cell)
  clues: (number | null)[][];
  // Solution: each cell is either "sea" (black/shaded) or "island" (white/land)
  solution: ("sea" | "island")[][];
  // Island index matrix (which island each island cell belongs to, -1 for sea)
  islandMap?: number[][];
}

/**
 * Checks if the sea cells are fully connected and contain NO 2x2 pools.
 */
export function isValidSea(grid: ("sea" | "island")[][], rows: number, cols: number): boolean {
  let seaCount = 0;
  let startR = -1;
  let startC = -1;

  // Check 2x2 pools
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (
        grid[r][c] === "sea" &&
        grid[r + 1][c] === "sea" &&
        grid[r][c + 1] === "sea" &&
        grid[r + 1][c + 1] === "sea"
      ) {
        return false; // 2x2 sea pool violation!
      }
    }
  }

  // Count sea cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "sea") {
        seaCount++;
        if (startR === -1) {
          startR = r;
          startC = c;
        }
      }
    }
  }

  if (seaCount === 0 || startR === -1) return false;

  // Check connectivity of sea via BFS
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue: [number, number][] = [[startR, startC]];
  visited[startR][startC] = true;
  let connectedSeaCount = 0;

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    connectedSeaCount++;

    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d];
      const nc = c + dc[d];

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (grid[nr][nc] === "sea" && !visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return connectedSeaCount === seaCount;
}

/**
 * Checks whether any two different islands touch each other horizontally or vertically.
 */
export function doIslandsTouch(
  islandMap: number[][],
  rows: number,
  cols: number
): boolean {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = islandMap[r][c];
      if (id !== -1) {
        // check neighbors
        if (r + 1 < rows) {
          const down = islandMap[r + 1][c];
          if (down !== -1 && down !== id) return true;
        }
        if (c + 1 < cols) {
          const right = islandMap[r][c + 1];
          if (right !== -1 && right !== id) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Generates a valid Nurikabe puzzle
 */
export function generateNurikabe(
  rows: number = 7,
  cols: number = 7,
  difficulty: NurikabeDifficulty = "medium",
  title?: string
): NurikabePuzzle {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: ("sea" | "island")[][] = Array.from({ length: rows }, () =>
      Array(cols).fill("sea")
    );
    const islandMap: number[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(-1)
    );

    // Island sizing and count based on grid size and difficulty
    const targetIslandArea = Math.floor(rows * cols * 0.42);
    let currentIslandArea = 0;
    const islands: { cells: [number, number][]; clueR: number; clueC: number }[] = [];

    // Max size of a single island
    const maxIslandSize = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 7;
    const minIslandSize = 1;

    let islandId = 0;
    let seedAttempts = 0;

    while (currentIslandArea < targetIslandArea && seedAttempts < 150) {
      seedAttempts++;
      const sr = Math.floor(Math.random() * rows);
      const sc = Math.floor(Math.random() * cols);

      if (grid[sr][sc] !== "sea") continue;

      // Ensure seed doesn't touch any existing island
      let touches = false;
      const dr = [-1, 1, 0, 0];
      const dc = [0, 0, -1, 1];
      for (let d = 0; d < 4; d++) {
        const nr = sr + dr[d];
        const nc = sc + dc[d];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (grid[nr][nc] === "island") {
            touches = true;
            break;
          }
        }
      }
      if (touches) continue;

      // Determine size of this island
      const size = Math.floor(Math.random() * (maxIslandSize - minIslandSize + 1)) + minIslandSize;
      const islandCells: [number, number][] = [[sr, sc]];
      grid[sr][sc] = "island";
      islandMap[sr][sc] = islandId;

      // Try growing the island
      for (let step = 1; step < size; step++) {
        const candidateNeighbors: [number, number][] = [];
        for (const [ir, ic] of islandCells) {
          for (let d = 0; d < 4; d++) {
            const nr = ir + dr[d];
            const nc = ic + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "sea") {
              // check if expanding into (nr, nc) would touch any other island
              let touchesOther = false;
              for (let d2 = 0; d2 < 4; d2++) {
                const nnr = nr + dr[d2];
                const nnc = nc + dc[d2];
                if (nnr >= 0 && nnr < rows && nnc >= 0 && nnc < cols) {
                  const neighborId = islandMap[nnr][nnc];
                  if (neighborId !== -1 && neighborId !== islandId) {
                    touchesOther = true;
                    break;
                  }
                }
              }
              if (!touchesOther) {
                candidateNeighbors.push([nr, nc]);
              }
            }
          }
        }

        if (candidateNeighbors.length === 0) break; // cannot grow further
        const [nextR, nextC] =
          candidateNeighbors[Math.floor(Math.random() * candidateNeighbors.length)];
        grid[nextR][nextC] = "island";
        islandMap[nextR][nextC] = islandId;
        islandCells.push([nextR, nextC]);
      }

      currentIslandArea += islandCells.length;
      // Clue placed on a random cell of the island
      const clueCell = islandCells[Math.floor(Math.random() * islandCells.length)];
      islands.push({
        cells: islandCells,
        clueR: clueCell[0],
        clueC: clueCell[1],
      });
      islandId++;
    }

    // Verify Sea constraints: Connected + No 2x2 pools
    if (isValidSea(grid, rows, cols) && !doIslandsTouch(islandMap, rows, cols)) {
      // Build clues grid
      const clues: (number | null)[][] = Array.from({ length: rows }, () =>
        Array(cols).fill(null)
      );

      for (const isl of islands) {
        clues[isl.clueR][isl.clueC] = isl.cells.length;
      }

      const id = `nurikabe-${rows}x${cols}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      return {
        id,
        title: title || `Nurikabe (${rows}×${cols})`,
        rows,
        cols,
        difficulty,
        clues,
        solution: grid,
        islandMap,
      };
    }
  }

  // Fallback procedural builder if randomized attempt timed out
  return buildStructuredNurikabe(rows, cols, difficulty, title);
}

/**
 * Procedural fallback builder that guarantees a valid, puzzle-compliant Nurikabe grid
 */
function buildStructuredNurikabe(
  rows: number,
  cols: number,
  difficulty: NurikabeDifficulty,
  title?: string
): NurikabePuzzle {
  const grid: ("sea" | "island")[][] = Array.from({ length: rows }, () =>
    Array(cols).fill("sea")
  );
  const clues: (number | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const islandMap: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1)
  );

  let islId = 0;
  // Place alternating islands every 2 cells
  for (let r = 0; r < rows; r += 2) {
    for (let c = 0; c < cols; c += 2) {
      grid[r][c] = "island";
      islandMap[r][c] = islId;
      clues[r][c] = 1;
      islId++;
    }
  }

  // Ensure sea connectivity & no 2x2 pools
  const id = `nurikabe-${rows}x${cols}-struct-${Date.now().toString(36)}`;

  return {
    id,
    title: title || `Nurikabe (${rows}×${cols})`,
    rows,
    cols,
    difficulty,
    clues,
    solution: grid,
    islandMap,
  };
}

/**
 * Generates a batch of Nurikabe puzzles for book compilation
 */
export function generateNurikabeBook(
  count: number = 20,
  rows: number = 7,
  cols: number = 7,
  difficulty: NurikabeDifficulty = "medium"
): NurikabePuzzle[] {
  const puzzles: NurikabePuzzle[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(
      generateNurikabe(rows, cols, difficulty, `Nurikabe Puzzle #${i + 1}`)
    );
  }
  return puzzles;
}
