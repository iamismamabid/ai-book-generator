// src/utils/crosswordGenerator.ts

export function generateCrosswordGrid(wordList: {word: string, clue: string}[], gridSize = 15) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords: any[] = [];
  const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

  if (sortedWords.length === 0) return { grid, placedWords };

  const firstWord = sortedWords[0].word.toUpperCase().replace(/[^A-Z]/g, '');
  const startR = Math.floor(gridSize / 2);
  const startC = Math.floor((gridSize - firstWord.length) / 2);

  for (let i = 0; i < firstWord.length; i++) {
    grid[startR][startC + i] = firstWord[i];
  }
  placedWords.push({ word: firstWord, clue: sortedWords[0].clue, r: startR, c: startC, dir: 'H', num: 1 });

  let currentNum = 2;

  for (let w = 1; w < sortedWords.length; w++) {
    const currentWord = sortedWords[w].word.toUpperCase().replace(/[^A-Z]/g, '');
    let placed = false;

    for (let l = 0; l < currentWord.length && !placed; l++) {
      const letter = currentWord[l];
      for (let r = 0; r < gridSize && !placed; r++) {
        for (let c = 0; c < gridSize && !placed; c++) {
          if (grid[r][c] === letter) {
            // Try Vertical
            let canPlaceV = true;
            const startRV = r - l;
            if (startRV < 0 || startRV + currentWord.length > gridSize) canPlaceV = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[startRV + i][c] !== '' && grid[startRV + i][c] !== currentWord[i]) canPlaceV = false;
              }
            }
            if (canPlaceV) {
              for (let i = 0; i < currentWord.length; i++) grid[startRV + i][c] = currentWord[i];
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: startRV, c: c, dir: 'V', num: currentNum++ });
              placed = true; break;
            }

            // Try Horizontal
            let canPlaceH = true;
            const startCH = c - l;
            if (startCH < 0 || startCH + currentWord.length > gridSize) canPlaceH = false;
            else {
              for (let i = 0; i < currentWord.length; i++) {
                if (grid[r][startCH + i] !== '' && grid[r][startCH + i] !== currentWord[i]) canPlaceH = false;
              }
            }
            if (canPlaceH) {
              for (let i = 0; i < currentWord.length; i++) grid[r][startCH + i] = currentWord[i];
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: r, c: startCH, dir: 'H', num: currentNum++ });
              placed = true; break;
            }
          }
        }
      }
    }
  }
  return { grid, placedWords };
}