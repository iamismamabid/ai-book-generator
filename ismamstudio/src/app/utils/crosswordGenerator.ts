// src/app/utils/crosswordGenerator.ts

export function generateCrosswordGrid(wordList: { word: string; clue: string }[], gridSize = 15) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords: any[] = [];
  const sortedWords = [...wordList]
    .map(w => ({ ...w, word: w.word.toUpperCase().replace(/[^A-Z]/g, '') }))
    .filter(w => w.word.length > 0)
    .sort((a, b) => b.word.length - a.word.length);

  if (sortedWords.length === 0) return { grid, placedWords };

  // Place first word in the middle horizontally
  const firstItem = sortedWords[0];
  const startR = Math.floor(gridSize / 2);
  const startC = Math.floor((gridSize - firstItem.word.length) / 2);

  for (let i = 0; i < firstItem.word.length; i++) {
    grid[startR][startC + i] = firstItem.word[i];
  }
  placedWords.push({
    word: firstItem.word,
    clue: firstItem.clue,
    r: startR,
    c: startC,
    dir: 'H',
    num: 1
  });

  let currentNum = 2;

  // Try placing subsequent words
  for (let w = 1; w < sortedWords.length; w++) {
    const wordItem = sortedWords[w];
    const targetWord = wordItem.word;
    let bestPlacement: any = null;
    let maxOverlaps = -1;

    // Search for all possible intersections
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const gridChar = grid[r][c];
        if (gridChar === '') continue;

        // Find matches in the word
        for (let i = 0; i < targetWord.length; i++) {
          if (targetWord[i] === gridChar) {
            // Try Vertical Placement (intersection at targetWord[i] and grid[r][c])
            // Word starts at startR = r - i, col = c
            const startRV = r - i;
            if (isValidPlacement(grid, targetWord, startRV, c, 'V', gridSize)) {
              const overlaps = countOverlaps(grid, targetWord, startRV, c, 'V');
              if (overlaps > maxOverlaps) {
                maxOverlaps = overlaps;
                bestPlacement = { r: startRV, c: c, dir: 'V' };
              }
            }

            // Try Horizontal Placement
            // Word starts at row = r, startC = c - i
            const startCH = c - i;
            if (isValidPlacement(grid, targetWord, r, startCH, 'H', gridSize)) {
              const overlaps = countOverlaps(grid, targetWord, r, startCH, 'H');
              if (overlaps > maxOverlaps) {
                maxOverlaps = overlaps;
                bestPlacement = { r: r, c: startCH, dir: 'H' };
              }
            }
          }
        }
      }
    }

    // Apply the best placement found
    if (bestPlacement) {
      const { r, c, dir } = bestPlacement;
      for (let i = 0; i < targetWord.length; i++) {
        if (dir === 'H') {
          grid[r][c + i] = targetWord[i];
        } else {
          grid[r + i][c] = targetWord[i];
        }
      }
      placedWords.push({
        word: targetWord,
        clue: wordItem.clue,
        r,
        c,
        dir,
        num: currentNum++
      });
    }
  }

  return { grid, placedWords };
}

// Check if placing a word creates any illegal collisions
function isValidPlacement(grid: string[][], word: string, startR: number, startC: number, dir: 'H' | 'V', gridSize: number): boolean {
  const len = word.length;

  // 1. Boundary check
  if (dir === 'H') {
    if (startC < 0 || startC + len > gridSize || startR < 0 || startR >= gridSize) return false;
  } else {
    if (startR < 0 || startR + len > gridSize || startC < 0 || startC >= gridSize) return false;
  }

  // 2. Preceding cell must be empty
  if (dir === 'H') {
    if (startC > 0 && grid[startR][startC - 1] !== '') return false;
    if (startC + len < gridSize && grid[startR][startC + len] !== '') return false;
  } else {
    if (startR > 0 && grid[startR - 1][startC] !== '') return false;
    if (startR + len < gridSize && grid[startR + len][startC] !== '') return false;
  }

  let hasIntersection = false;

  // 3. Check each cell of the word
  for (let i = 0; i < len; i++) {
    const r = dir === 'H' ? startR : startR + i;
    const c = dir === 'H' ? startC + i : startC;

    const currentGridVal = grid[r][c];

    if (currentGridVal !== '') {
      // Must match letter
      if (currentGridVal !== word[i]) return false;
      hasIntersection = true;
    } else {
      // If cell is empty, the adjacent cells parallel to the word must be empty
      if (dir === 'H') {
        // Check above and below
        if (r > 0 && grid[r - 1][c] !== '') return false;
        if (r < gridSize - 1 && grid[r + 1][c] !== '') return false;
      } else {
        // Check left and right
        if (c > 0 && grid[r][c - 1] !== '') return false;
        if (c < gridSize - 1 && grid[r][c + 1] !== '') return false;
      }
    }
  }

  // A crossword puzzle should connect all placed words
  return hasIntersection;
}

function countOverlaps(grid: string[][], word: string, startR: number, startC: number, dir: 'H' | 'V'): number {
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'H' ? startR : startR + i;
    const c = dir === 'H' ? startC + i : startC;
    if (grid[r][c] === word[i]) {
      overlaps++;
    }
  }
  return overlaps;
}