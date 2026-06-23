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

export function generatePuzzleGrid(wordList: string[], size: number, textCase: string) {
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const mask = Array(size).fill(null).map(() => Array(size).fill(false)); 
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const placedWords: any[] = [];

  wordList.forEach(word => {
    let placed = false; let attempts = 0;
    const targetWord = textCase === 'lowercase' ? word.toLowerCase() : word.toUpperCase();
    while (!placed && attempts < 200) { 
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const minRow = dir[0] === -1 ? targetWord.length - 1 : 0; const maxRow = dir[0] === 1 ? size - targetWord.length : size - 1;
      const minCol = 0; const maxCol = dir[1] === 1 ? size - targetWord.length : size - 1;
      const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
      const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

      let canPlace = true;
      for (let i = 0; i < targetWord.length; i++) {
        const r = row + (dir[0] * i); const c = col + (dir[1] * i);
        if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== targetWord[i])) { canPlace = false; break; }
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
  });
  
  const alphabet = textCase === 'lowercase' ? "abcdefghijklmnopqrstuvwxyz" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) { 
      if (grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]; 
    }
  }
  return { grid, words: placedWords, mask };
}