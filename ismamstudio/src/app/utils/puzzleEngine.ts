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