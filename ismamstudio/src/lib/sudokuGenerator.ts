// src/lib/sudokuGenerator.ts

export type Grid = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

// Helper to check if a number can be placed in a cell
function isValid(board: Grid, row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}

// Backtracking solver to fill the board recursively
function fillBoard(board: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Removes numbers based on chosen difficulty layer
function removeNumbers(board: Grid, difficulty: Difficulty): Grid {
  const cloned = board.map(row => [...row]);
  let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 40 : 50;

  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (cloned[row][col] !== 0) {
      cloned[row][col] = 0;
      attempts--;
    }
  }
  return cloned;
}

/**
 * Generates a single Sudoku puzzle grid paired with its solution
 */
export function generateSudoku(difficulty: Difficulty = 'medium') {
  const solution: Grid = Array(9).fill(null).map(() => Array(9).fill(0));
  fillBoard(solution);
  const puzzle = removeNumbers(solution, difficulty);
  return { puzzle, solution };
}

/**
 * Generates an array of Sudoku puzzles for bulk KDP book compiling
 */
export function generateSudokuBook(count: number, difficulty: Difficulty = 'medium') {
  const books = [];
  for (let i = 0; i < count; i++) {
    books.push(generateSudoku(difficulty));
  }
  return books;
}