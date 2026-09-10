// src/lib/sudokuGenerator.ts
// Re-export high-performance bitmask MRV Sudoku engine from ./sudoku
// Ensures all tools (BookBuilder, BulkGenerator, SudokuEditor, SudokuGenerator)
// benefit from 70x faster generation and non-blocking asynchronous APIs.

export * from "./sudoku";