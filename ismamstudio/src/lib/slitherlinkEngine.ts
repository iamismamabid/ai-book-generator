/**
 * KDPage Slitherlink (Loop the Loop / Fences / Takegaki) Puzzle Engine
 * Generates valid single closed loop puzzles on dot grids with unique solutions.
 */

export type SlitherlinkDifficulty = "easy" | "medium" | "hard" | "expert";

export type EdgeState = "none" | "line" | "cross";

export interface SlitherlinkPuzzle {
  id: string;
  title: string;
  rows: number; // number of cells vertically
  cols: number; // number of cells horizontally
  difficulty: SlitherlinkDifficulty;
  // Clues in cells: null if blank, or 0, 1, 2, 3
  clues: (number | null)[][];
  // Solution edges: boolean flags whether edge is part of the loop
  solutionH: boolean[][]; // (rows + 1) x cols
  solutionV: boolean[][]; // rows x (cols + 1)
}

/**
 * Creates empty edge state matrices for interactive player solving
 */
export function createEmptyPlayerEdges(rows: number, cols: number): {
  hEdges: EdgeState[][];
  vEdges: EdgeState[][];
} {
  const hEdges: EdgeState[][] = Array.from({ length: rows + 1 }, () =>
    Array(cols).fill("none")
  );
  const vEdges: EdgeState[][] = Array.from({ length: rows }, () =>
    Array(cols + 1).fill("none")
  );
  return { hEdges, vEdges };
}

/**
 * Generates a random valid single closed loop on an R x C cell grid.
 */
function generateRandomClosedLoop(rows: number, cols: number): {
  hEdges: boolean[][];
  vEdges: boolean[][];
} {
  const H: boolean[][] = Array.from({ length: rows + 1 }, () =>
    Array(cols).fill(false)
  );
  const V: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols + 1).fill(false)
  );

  // Start with a small rectangle loop in the center
  const minR = Math.max(1, Math.floor(rows / 3));
  const minC = Math.max(1, Math.floor(cols / 3));
  const startR = Math.floor((rows - minR) / 2);
  const startC = Math.floor((cols - minC) / 2);

  // Initialize rectangle edges
  for (let c = startC; c < startC + minC; c++) {
    H[startR][c] = true;
    H[startR + minR][c] = true;
  }
  for (let r = startR; r < startR + minR; r++) {
    V[r][startC] = true;
    V[r][startC + minC] = true;
  }

  // Deform loop iteratively
  const iterations = rows * cols * 15;

  for (let iter = 0; iter < iterations; iter++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Current cell's edges
    const top = H[r][c];
    const bottom = H[r + 1][c];
    const left = V[r][c];
    const right = V[r][c + 1];

    const count = (top ? 1 : 0) + (bottom ? 1 : 0) + (left ? 1 : 0) + (right ? 1 : 0);

    // If a cell has exactly 1 edge, we can expand into it (flip all 4 edges of the cell)
    // ONLY if it preserves a single cycle and doesn't produce degree > 2 at any vertex
    if (count === 1) {
      // Test deformation
      H[r][c] = !top;
      H[r + 1][c] = !bottom;
      V[r][c] = !left;
      V[r][c + 1] = !right;

      if (!isValidSingleLoop(H, V, rows, cols)) {
        // Revert
        H[r][c] = top;
        H[r + 1][c] = bottom;
        V[r][c] = left;
        V[r][c + 1] = right;
      }
    } else if (count === 3) {
      // Retract bump (flip all 4 edges)
      H[r][c] = !top;
      H[r + 1][c] = !bottom;
      V[r][c] = !left;
      V[r][c + 1] = !right;

      if (!isValidSingleLoop(H, V, rows, cols)) {
        // Revert
        H[r][c] = top;
        H[r + 1][c] = bottom;
        V[r][c] = left;
        V[r][c + 1] = right;
      }
    }
  }

  return { hEdges: H, vEdges: V };
}

/**
 * Checks if the edge set forms exactly one single valid closed loop
 * without any self-intersections or branches (every active vertex has degree 2).
 */
export function isValidSingleLoop(
  H: boolean[][],
  V: boolean[][],
  rows: number,
  cols: number
): boolean {
  const numVertices = (rows + 1) * (cols + 1);
  const degree = new Array(numVertices).fill(0);
  const adj: number[][] = Array.from({ length: numVertices }, () => []);

  const vIndex = (r: number, c: number) => r * (cols + 1) + c;

  let totalEdges = 0;

  // Horizontal edges
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (H[r][c]) {
        const u = vIndex(r, c);
        const v = vIndex(r, c + 1);
        degree[u]++;
        degree[v]++;
        adj[u].push(v);
        adj[v].push(u);
        totalEdges++;
      }
    }
  }

  // Vertical edges
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      if (V[r][c]) {
        const u = vIndex(r, c);
        const v = vIndex(r + 1, c);
        degree[u]++;
        degree[v]++;
        adj[u].push(v);
        adj[v].push(u);
        totalEdges++;
      }
    }
  }

  if (totalEdges < 4) return false;

  // Vertex degree must be either 0 or 2
  let startVertex = -1;
  let activeVertices = 0;

  for (let i = 0; i < numVertices; i++) {
    if (degree[i] > 0) {
      if (degree[i] !== 2) return false;
      activeVertices++;
      if (startVertex === -1) startVertex = i;
    }
  }

  if (startVertex === -1 || activeVertices === 0) return false;

  // Traverse the single loop to check connectivity
  const visited = new Set<number>();
  let current = startVertex;
  let prev = -1;

  while (true) {
    visited.add(current);
    const neighbors = adj[current];
    const next = neighbors[0] === prev ? neighbors[1] : neighbors[0];

    if (next === startVertex) {
      // Loop closed!
      break;
    }
    if (visited.has(next) || next === undefined) {
      return false; // loop crossed itself prematurely
    }

    prev = current;
    current = next;
  }

  return visited.size === activeVertices;
}

/**
 * Counts how many loop edges surround cell (r, c)
 */
export function getCellEdgeCount(
  r: number,
  c: number,
  H: boolean[][] | EdgeState[][],
  V: boolean[][] | EdgeState[][]
): number {
  const top = typeof H[r][c] === "boolean" ? H[r][c] : H[r][c] === "line";
  const bottom = typeof H[r + 1][c] === "boolean" ? H[r + 1][c] : H[r + 1][c] === "line";
  const left = typeof V[r][c] === "boolean" ? V[r][c] : V[r][c] === "line";
  const right = typeof V[r][c + 1] === "boolean" ? V[r][c + 1] : V[r][c + 1] === "line";

  return (top ? 1 : 0) + (bottom ? 1 : 0) + (left ? 1 : 0) + (right ? 1 : 0);
}

/**
 * Generates a complete Slitherlink puzzle
 */
export function generateSlitherlink(
  rows: number = 7,
  cols: number = 7,
  difficulty: SlitherlinkDifficulty = "medium",
  title?: string
): SlitherlinkPuzzle {
  const { hEdges, vEdges } = generateRandomClosedLoop(rows, cols);

  // Full cell clues
  const fullClues: number[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => getCellEdgeCount(r, c, hEdges, vEdges))
  );

  // Clue reveal ratio based on difficulty
  const revealRatioMap: Record<SlitherlinkDifficulty, number> = {
    easy: 0.58,
    medium: 0.46,
    hard: 0.36,
    expert: 0.28,
  };

  const targetRatio = revealRatioMap[difficulty];
  const clues: (number | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  // Gather all cell coordinates and shuffle
  const coords: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      coords.push({ r, c });
    }
  }

  // Shuffle coordinates
  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }

  // Always reveal 0 clues to provide essential anchor points for human solvers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (fullClues[r][c] === 0 && Math.random() < 0.85) {
        clues[r][c] = 0;
      }
    }
  }

  // Reveal remaining clues up to target count
  const targetCount = Math.floor(rows * cols * targetRatio);
  let currentRevealed = clues.flat().filter((x) => x !== null).length;

  for (const { r, c } of coords) {
    if (currentRevealed >= targetCount) break;
    if (clues[r][c] === null) {
      clues[r][c] = fullClues[r][c];
      currentRevealed++;
    }
  }

  const id = `slitherlink-${rows}x${cols}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    title: title || `Slitherlink (${rows}×${cols})`,
    rows,
    cols,
    difficulty,
    clues,
    solutionH: hEdges,
    solutionV: vEdges,
  };
}

/**
 * Generates a batch of Slitherlink puzzles for a full book
 */
export function generateSlitherlinkBook(
  count: number = 20,
  rows: number = 7,
  cols: number = 7,
  difficulty: SlitherlinkDifficulty = "medium"
): SlitherlinkPuzzle[] {
  const puzzles: SlitherlinkPuzzle[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(
      generateSlitherlink(rows, cols, difficulty, `Slitherlink Puzzle #${i + 1}`)
    );
  }
  return puzzles;
}
