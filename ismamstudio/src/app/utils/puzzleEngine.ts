// --- SUDOKU GENERATOR ALGORITHM ---
export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  const BLANK = 0;
  const board = Array(9).fill(null).map(() => Array(9).fill(BLANK));

  // Helper: Check if safe to place a number
  const isSafe = (board: number[][], row: number, col: number, num: number) => {
    for (let x = 0; x <= 8; x++) if (board[row][x] === num) return false;
    for (let x = 0; x <= 8; x++) if (board[x][col] === num) return false;
    const startRow = row - (row % 3), startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  // Helper: Fill the board fully
  const fillBoard = (board: number[][]) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === BLANK) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (let num of numbers) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = BLANK;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  // Generate complete solution
  fillBoard(board);
  const solution = board.map(row => [...row]);

  // Remove elements to create the puzzle
  let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
  const puzzle = board.map(row => [...row]);

  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (puzzle[row][col] === BLANK) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    puzzle[row][col] = BLANK;
    attempts--;
  }

  return { puzzle, solution };
}

export interface PlacedWord {
  text: string;
  startR: number;
  startC: number;
  endR: number;
  endC: number;
}

export interface HiddenMessageResult {
  text: string;
  cells: { r: number; c: number }[];
}

export type WordSearchShape = "square" | "circle" | "heart" | "diamond" | "star";

export interface WordSearchGridData {
  grid: string[][];
  words: PlacedWord[];
  mask: boolean[][];
  /** true = inside the shape and part of the rendered puzzle; false = outside, not drawn */
  active: boolean[][];
  shape?: WordSearchShape;
  /** Words from the input list that couldn't be placed (grid/shape too small) */
  skippedWords?: string[];
  /** Present only when a hidden message was requested and successfully laid out */
  hiddenMessage?: HiddenMessageResult;
}

// Same normalized-coordinate implicit-shape test used by the maze generator
// (src/lib/maze.ts), kept independent here since word search grids are
// always square (rows === cols) and don't need the maze's rectangular case.
function isInsideWordSearchShape(row: number, col: number, size: number, shape: WordSearchShape): boolean {
  if (shape === "square") return true;

  const x = (col - (size - 1) / 2) / ((size - 1) / 2);
  const y = (row - (size - 1) / 2) / ((size - 1) / 2);

  if (shape === "circle") {
    return x * x + y * y <= 1;
  }

  if (shape === "diamond") {
    return Math.abs(x) + Math.abs(y) <= 1;
  }

  if (shape === "heart") {
    // Classic implicit heart curve, scaled/flipped to match this grid's
    // row-down orientation (see src/lib/maze.ts for the same technique).
    const xs = x * 1.3;
    const ys = -y * 1.3;
    const a = xs * xs + ys * ys - 1;
    return a * a * a - xs * xs * ys * ys * ys <= 0;
  }

  if (shape === "star") {
    // 5-point star as a polar radius test: the boundary alternates between
    // an outer and inner radius every 1/10th of a turn (outer at the point
    // tips, inner at the notches between them).
    const r = Math.sqrt(x * x + y * y);
    let theta = Math.atan2(-y, x) - Math.PI / 2; // point straight up
    if (theta < 0) theta += Math.PI * 2;
    const points = 5;
    const segment = (Math.PI * 2) / (points * 2);
    const seg = Math.floor(theta / segment);
    const tInSeg = (theta - seg * segment) / segment; // 0..1 within this segment
    const outer = 1.0;
    const inner = 0.42;
    // Segments alternate: point (outer at 0, inner at 1) / notch (inner at 0, outer at 1)
    const boundary = seg % 2 === 0
      ? outer + (inner - outer) * tInSeg
      : inner + (outer - inner) * tInSeg;
    return r <= boundary;
  }

  return true;
}

function buildActiveMask(size: number, shape: WordSearchShape): boolean[][] {
  const active = Array(size).fill(null).map(() => Array(size).fill(false));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      active[r][c] = isInsideWordSearchShape(r, c, size, shape);
    }
  }
  return active;
}

export function generatePuzzleGrid(
  wordList: string[],
  size: number,
  textCase: string,
  options?: {
    shape?: WordSearchShape;
    hiddenMessage?: string;
  }
): WordSearchGridData {
  const shape = options?.shape ?? "square";
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const mask = Array(size).fill(null).map(() => Array(size).fill(false));
  const active = buildActiveMask(size, shape);
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const placedWords: PlacedWord[] = [];
  const skippedWords: string[] = [];

  // Longest word first — placing big words while the mask is still mostly
  // empty means later, shorter words have an easier time finding room.
  const sortedWords = [...wordList].sort((a, b) => b.length - a.length);

  sortedWords.forEach(word => {
    let placed = false; let attempts = 0;
    const targetWord = textCase === 'lowercase' ? word.toLowerCase() : word.toUpperCase();
    while (!placed && attempts < 400) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const minRow = dir[0] === -1 ? targetWord.length - 1 : 0; const maxRow = dir[0] === 1 ? size - targetWord.length : size - 1;
      const minCol = 0; const maxCol = dir[1] === 1 ? size - targetWord.length : size - 1;
      if (maxRow < minRow || maxCol < minCol) { attempts++; continue; }
      const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
      const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

      let canPlace = true;
      for (let i = 0; i < targetWord.length; i++) {
        const r = row + (dir[0] * i); const c = col + (dir[1] * i);
        if (r < 0 || r >= size || c < 0 || c >= size || !active[r][c] || (grid[r][c] !== '' && grid[r][c] !== targetWord[i])) { canPlace = false; break; }
      }
      if (canPlace) {
        for (let i = 0; i < targetWord.length; i++) {
          const r = row + (dir[0] * i); const c = col + (dir[1] * i);
          grid[r][c] = targetWord[i]; mask[r][c] = true;
        }
        placed = true;
        placedWords.push({ text: targetWord, startR: row, startC: col, endR: row + (dir[0] * (targetWord.length - 1)), endC: col + (dir[1] * (targetWord.length - 1)) });
      }
      attempts++;
    }
    if (!placed) skippedWords.push(word);
  });

  // Hidden message: walk the remaining active, empty cells in reading order
  // and spell the message into them (skipping spaces — a space just moves
  // to the next cell without consuming a letter there), so that once the
  // solver has crossed off every word, the leftover letters read the message.
  let hiddenMessage: HiddenMessageResult | undefined;
  const rawMessage = options?.hiddenMessage?.trim();
  if (rawMessage) {
    const messageChars = (textCase === 'lowercase' ? rawMessage.toLowerCase() : rawMessage.toUpperCase())
      .replace(/\s+/g, '');
    const cells: { r: number; c: number }[] = [];
    let idx = 0;
    for (let r = 0; r < size && idx < messageChars.length; r++) {
      for (let c = 0; c < size && idx < messageChars.length; c++) {
        if (active[r][c] && grid[r][c] === '') {
          grid[r][c] = messageChars[idx];
          cells.push({ r, c });
          idx++;
        }
      }
    }
    if (cells.length > 0) {
      hiddenMessage = { text: rawMessage, cells };
    }
  }

  const alphabet = textCase === 'lowercase' ? "abcdefghijklmnopqrstuvwxyz" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (active[r][c] && grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return { grid, words: placedWords, mask, active, shape, skippedWords: skippedWords.length ? skippedWords : undefined, hiddenMessage };
}

// --- CRISS-CROSS (INTERLOCKING FILL-IN) GENERATOR ---
// Unlike a word search, there's no letter grid to scan — words interlock
// directly like a crossword, and the solver places the whole word list into
// the frame using word length and shared letters as the only clues.
export interface CrissCrossPlacement {
  text: string;
  row: number;
  col: number;
  dir: "across" | "down";
}

export interface CrissCrossGridData {
  words: CrissCrossPlacement[];
  /** Bounding box of the arrangement, 0-indexed, inclusive */
  rows: number;
  cols: number;
  /** cell -> letter, for building the solution key; blank frame has no grid to show the solver */
  solutionGrid: string[][];
  skippedWords?: string[];
}

export function generateCrissCrossPuzzle(wordList: string[], textCase: string = "uppercase"): CrissCrossGridData {
  const words = [...wordList]
    .map(w => (textCase === 'lowercase' ? w.toLowerCase() : w.toUpperCase()))
    .filter(w => w.length > 0)
    .sort((a, b) => b.length - a.length);

  if (words.length === 0) {
    return { words: [], rows: 0, cols: 0, solutionGrid: [] };
  }

  // Sparse cell map while placing; converted to a bounded 2D grid at the end.
  const cellMap = new Map<string, string>(); // "r,c" -> letter
  const key = (r: number, c: number) => `${r},${c}`;
  const placements: CrissCrossPlacement[] = [];
  const skipped: string[] = [];

  const fits = (word: string, row: number, col: number, dir: "across" | "down"): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "down" ? row + i : row;
      const c = dir === "across" ? col + i : col;
      const existing = cellMap.get(key(r, c));
      if (existing && existing !== word[i]) return false;
    }
    // Cell immediately before the start and right after the end must be empty,
    // so words don't run into each other end-to-end.
    const beforeR = dir === "down" ? row - 1 : row;
    const beforeC = dir === "across" ? col - 1 : col;
    const afterR = dir === "down" ? row + word.length : row;
    const afterC = dir === "across" ? col + word.length : col;
    if (cellMap.has(key(beforeR, beforeC)) || cellMap.has(key(afterR, afterC))) return false;
    return true;
  };

  // First word: place horizontally through the origin.
  const first = words[0];
  for (let i = 0; i < first.length; i++) cellMap.set(key(0, i), first[i]);
  placements.push({ text: first, row: 0, col: 0, dir: "across" });

  for (let w = 1; w < words.length; w++) {
    const word = words[w];
    let bestPlacement: CrissCrossPlacement | null = null;

    // Try to intersect this word with a letter already on the board.
    outer:
    for (const [posKey, letter] of cellMap.entries()) {
      const [pr, pc] = posKey.split(",").map(Number);
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== letter) continue;
        // Try placing so word[i] lands on (pr, pc), in the perpendicular
        // direction to whatever's already there (approximated: try both).
        for (const dir of ["across", "down"] as const) {
          const row = dir === "down" ? pr - i : pr;
          const col = dir === "across" ? pc - i : pc;
          if (fits(word, row, col, dir)) {
            bestPlacement = { text: word, row, col, dir };
            break outer;
          }
        }
      }
    }

    if (bestPlacement) {
      for (let i = 0; i < word.length; i++) {
        const r = bestPlacement.dir === "down" ? bestPlacement.row + i : bestPlacement.row;
        const c = bestPlacement.dir === "across" ? bestPlacement.col + i : bestPlacement.col;
        cellMap.set(key(r, c), word[i]);
      }
      placements.push(bestPlacement);
    } else {
      skipped.push(wordList[w] ?? word);
    }
  }

  // Normalize to a 0-indexed bounding box.
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for (const k of cellMap.keys()) {
    const [r, c] = k.split(",").map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const solutionGrid = Array.from({ length: rows }, () => Array(cols).fill(''));
  for (const [k, letter] of cellMap.entries()) {
    const [r, c] = k.split(",").map(Number);
    solutionGrid[r - minR][c - minC] = letter;
  }
  const normalizedPlacements = placements.map(p => ({ ...p, row: p.row - minR, col: p.col - minC }));

  return { words: normalizedPlacements, rows, cols, solutionGrid, skippedWords: skipped.length ? skipped : undefined };
}

// --- WORD SEARCH BOOK BATCH GENERATOR ---
// Used when no custom word list is supplied (e.g. bulk/batch generation),
// mirroring how generateSudoku() fills a book without external input.
const DEFAULT_WORD_SEARCH_BANK = [
  "APPLE", "BEACH", "CASTLE", "DESERT", "EAGLE", "FOREST", "GARDEN", "HARBOR",
  "ISLAND", "JUNGLE", "KITTEN", "LANTERN", "MOUNTAIN", "NOODLE", "OCEAN", "PUZZLE",
  "QUARTZ", "RIVER", "SUNSET", "TURTLE", "UMBRELLA", "VALLEY", "WINTER", "ZEBRA",
  "BRIDGE", "CANDLE", "DOLPHIN", "ENGINE", "FEATHER", "GALAXY", "HORIZON", "IGLOO",
  "JACKET", "KOALA", "LEMON", "MELODY", "NEBULA", "ORCHID", "PLANET", "QUILT",
];

export function getWordSearchDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard') {
  if (difficulty === 'easy') return { gridSize: 10, wordsPerPuzzle: 8 };
  if (difficulty === 'hard') return { gridSize: 15, wordsPerPuzzle: 16 };
  return { gridSize: 12, wordsPerPuzzle: 12 };
}

export function generateWordSearchBook(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  wordBank: string[] = DEFAULT_WORD_SEARCH_BANK
): WordSearchGridData[] {
  const { gridSize, wordsPerPuzzle } = getWordSearchDifficultyConfig(difficulty);

  return Array.from({ length: count }, () => {
    const words = [...wordBank].sort(() => 0.5 - Math.random()).slice(0, wordsPerPuzzle);
    return generatePuzzleGrid(words, gridSize, 'uppercase');
  });
}
