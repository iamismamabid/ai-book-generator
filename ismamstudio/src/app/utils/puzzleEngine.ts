export function generateCrosswordGrid(wordList: {word: string, clue: string}[], gridSize = 15) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords: any[] = [];
  const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

  // Helper: Check if word fits at specific position
  const canPlace = (word: string, r: number, c: number, dir: 'H' | 'V') => {
    if (dir === 'H') {
      if (c + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r][c + i];
        if (cell !== '' && cell !== word[i]) return false;
      }
    } else {
      if (r + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + i][c];
        if (cell !== '' && cell !== word[i]) return false;
      }
    }
    return true;
  };

  // Place first word
  const first = sortedWords[0].word.toUpperCase().replace(/[^A-Z]/g, '');
  for (let i = 0; i < first.length; i++) grid[Math.floor(gridSize/2)][Math.floor((gridSize-first.length)/2) + i] = first[i];
  placedWords.push({ word: first, clue: sortedWords[0].clue, r: Math.floor(gridSize/2), c: Math.floor((gridSize-first.length)/2), dir: 'H', num: 1 });

  let currentNum = 2;

  for (let w = 1; w < sortedWords.length; w++) {
    const word = sortedWords[w].word.toUpperCase().replace(/[^A-Z]/g, '');
    let placed = false;

    // Scan grid for intersection
    for (let r = 0; r < gridSize && !placed; r++) {
      for (let c = 0; c < gridSize && !placed; c++) {
        for (let i = 0; i < word.length; i++) {
          if (grid[r][c] === word[i]) {
            // Check Vertical
            if (canPlace(word, r - i, c, 'V')) {
              for (let k = 0; k < word.length; k++) grid[r - i + k][c] = word[k];
              placedWords.push({ word, clue: sortedWords[w].clue, r: r - i, c, dir: 'V', num: currentNum++ });
              placed = true; break;
            }
            // Check Horizontal
            if (canPlace(word, r, c - i, 'H')) {
              for (let k = 0; k < word.length; k++) grid[r][c - i + k] = word[k];
              placedWords.push({ word, clue: sortedWords[w].clue, r, c: c - i, dir: 'H', num: currentNum++ });
              placed = true; break;
            }
          }
        }
      }
    }
  }
  return { grid, placedWords };
}