/**
 * Basic Crossword Generator Algorithm
 * Takes a list of words with clues and maps them to intersecting grid coordinates.
 */
export function generateCrosswordGrid(wordList, gridSize = 20) {
  // 1. Initialize empty grid
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords = [];

  // Sort words by length (longest first makes generating easier)
  const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

  // 2. Place the first word horizontally in the middle of the board
  const firstWord = sortedWords[0].word.toUpperCase();
  const startR = Math.floor(gridSize / 2);
  const startC = Math.floor((gridSize - firstWord.length) / 2);

  for (let i = 0; i < firstWord.length; i++) {
    grid[startR][startC + i] = firstWord[i];
  }

  placedWords.push({
    word: firstWord,
    clue: sortedWords[0].clue,
    r: startR,
    c: startC,
    direction: 'horizontal',
    number: 1
  });

  // 3. Attempt to place remaining words
  let currentNumber = 2;

  for (let w = 1; w < sortedWords.length; w++) {
    const currentWord = sortedWords[w].word.toUpperCase();
    let placed = false;

    // Look for intersecting letters
    for (let l = 0; l < currentWord.length && !placed; l++) {
      const letter = currentWord[l];

      // Scan the board for this letter
      for (let r = 0; r < gridSize && !placed; r++) {
        for (let c = 0; c < gridSize && !placed; c++) {
          if (grid[r][c] === letter) {
            // Check if we can place vertically
            const canPlaceVertical = checkFit(grid, currentWord, r - l, c, 'vertical', gridSize);
            if (canPlaceVertical) {
              placeWord(grid, currentWord, r - l, c, 'vertical');
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: r - l, c: c, direction: 'vertical', number: currentNumber++ });
              placed = true;
              break;
            }

            // Check if we can place horizontally
            const canPlaceHorizontal = checkFit(grid, currentWord, r, c - l, 'horizontal', gridSize);
            if (canPlaceHorizontal) {
              placeWord(grid, currentWord, r, c - l, 'horizontal');
              placedWords.push({ word: currentWord, clue: sortedWords[w].clue, r: r, c: c - l, direction: 'horizontal', number: currentNumber++ });
              placed = true;
              break;
            }
          }
        }
      }
    }
  }

  return { grid, placedWords };
}

// Helper: Check if a word fits without colliding with non-intersecting words
function checkFit(grid, word, startR, startC, direction, size) {
  if (direction === 'horizontal') {
    if (startC < 0 || startC + word.length > size || startR < 0 || startR >= size) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[startR][startC + i] !== '' && grid[startR][startC + i] !== word[i]) return false;
    }
  } else {
    if (startR < 0 || startR + word.length > size || startC < 0 || startC >= size) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[startR + i][startC] !== '' && grid[startR + i][startC] !== word[i]) return false;
    }
  }
  return true;
}

// Helper: Place the word on the grid
function placeWord(grid, word, startR, startC, direction) {
  for (let i = 0; i < word.length; i++) {
    if (direction === 'horizontal') grid[startR][startC + i] = word[i];
    else grid[startR + i][startC] = word[i];
  }
}