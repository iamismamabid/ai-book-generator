// Most puzzle types (Sudoku, word search, mazes at typical sizes) draw from
// a value space so large that independent random generation essentially
// never repeats. A few don't: Math Puzzle at easy difficulty and small
// Maze/Kakuro grids have a small enough space of possible puzzles that a
// large book can plausibly contain exact duplicates -- something KDP treats
// as duplicate content. This wraps a generator so a "book" of many puzzles
// retries (capped) whenever a freshly generated puzzle's signature has
// already been seen earlier in the same book.
export function generateUniquePuzzle<T>(
  generate: () => T,
  signature: (item: T) => string,
  seen: Set<string>,
  maxAttempts: number = 25
): T {
  let result = generate();
  let key = signature(result);
  let attempts = 1;
  while (seen.has(key) && attempts < maxAttempts) {
    result = generate();
    key = signature(result);
    attempts++;
  }
  seen.add(key);
  return result;
}
