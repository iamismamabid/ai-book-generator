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

// Helper to count how many solutions exist for a given board layout (up to limit)
function countSolutions(board: Grid, limit: number = 2): number {
  let count = 0;

  // Clone the board to avoid mutation during evaluation
  const tempBoard = board.map(row => [...row]);

  function checkCell(row: number, col: number): boolean {
    if (row === 9) {
      count++;
      return count >= limit; // Stop searching if we reach the limit
    }

    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    if (tempBoard[row][col] !== 0) {
      return checkCell(nextRow, nextCol);
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(tempBoard, row, col, num)) {
        tempBoard[row][col] = num;
        if (checkCell(nextRow, nextCol)) return true;
        tempBoard[row][col] = 0;
      }
    }
    return false;
  }

  checkCell(0, 0);
  return count;
}

// Removes numbers based on chosen difficulty layer while guaranteeing a unique solution
function removeNumbers(board: Grid, difficulty: Difficulty): Grid {
  const cloned = board.map(row => [...row]);
  
  // Set target number of cell removals based on difficulty.
  // Standard Sudoku has 81 cells. 
  // Easy: ~38 removals (leaving 43 clues)
  // Medium: ~46 removals (leaving 35 clues)
  // Hard: ~52 removals (leaving 29 clues)
  let targetRemovals = 38;
  if (difficulty === 'medium') targetRemovals = 46;
  if (difficulty === 'hard') targetRemovals = 52;

  // Create a randomized order of all 81 cells to attempt removals
  const cells = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);

  let removals = 0;
  for (const index of cells) {
    if (removals >= targetRemovals) break;

    const row = Math.floor(index / 9);
    const col = index % 9;

    const temp = cloned[row][col];
    if (temp !== 0) {
      cloned[row][col] = 0;

      // Verify that removing this cell leaves a unique solution
      if (countSolutions(cloned, 2) === 1) {
        removals++;
      } else {
        // If not unique, restore the value and keep trying
        cloned[row][col] = temp;
      }
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