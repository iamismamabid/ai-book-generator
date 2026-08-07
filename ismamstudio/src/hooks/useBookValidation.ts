import { useState, useCallback } from 'react';
import { getGutterMargin } from '@/lib/pdfFormatter';

export interface Page {
  id: string | number;
  type: string;
  config: {
    isSolution?: boolean;
    [key: string]: any;
  };
}

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationState {
  isValid: boolean;
  hasWarnings: boolean;
  errors: ValidationError[];
}

export function useBookValidation() {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    hasWarnings: false,
    errors: [],
  });

  const validateBook = useCallback((pages: Page[], opts?: { gutterMarginEnabled?: boolean }): ValidationState => {
    const errors: ValidationError[] = [];
    const puzzleTypes = [
      'crossword',
      'word_search',
      'sudoku',
      'maze',
      'word_scramble',
      'cryptogram',
      'math_puzzle'
    ];

    // ─── Rule 1: Page Count Check ──────────────────────────────────────────
    if (pages.length < 24) {
      errors.push({
        type: 'error',
        message: `KDP paperbacks require a minimum of 24 pages. Please add ${24 - pages.length} more pages to download.`
      });
    }

    // ─── Rule 2: Title Page Rule ───────────────────────────────────────────
    const titlePageIndices = pages
      .map((p, idx) => (p.type === 'title' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (titlePageIndices.length > 0) {
      if (titlePageIndices[0] !== 0) {
        errors.push({
          type: 'error',
          message: "The Title Page must be the first page of your book."
        });
      }
      if (titlePageIndices.length > 1) {
        errors.push({
          type: 'warning',
          message: "Your book contains multiple Title Pages. Typically, only one title page is needed."
        });
      }
    }

    // ─── Rule 3: Solution Matching Rule ────────────────────────────────────
    puzzleTypes.forEach((type) => {
      const puzzles = pages.filter((p) => p.type === type && !p.config.isSolution);
      const solutions = pages.filter((p) => p.type === type && p.config.isSolution);

      if (puzzles.length > solutions.length) {
        const diff = puzzles.length - solutions.length;
        const displayName = type.toUpperCase().replace('_', ' ');
        errors.push({
          type: 'warning',
          message: `Missing ${diff} solution page(s) for ${displayName}. You can auto-generate these or manually add them.`
        });
      }
    });

    // ─── Rule 4: Binding Gutter Margin Check ───────────────────────────────
    // KDP requires a wider inside margin as page count grows (0.375" up to
    // 150 pages, rising to 0.875" past 700) so text/puzzle content doesn't
    // get lost in the spine after binding.
    const requiredGutter = getGutterMargin(pages.length);
    if (requiredGutter > 0.375 && !opts?.gutterMarginEnabled) {
      errors.push({
        type: 'warning',
        message: `Your book has ${pages.length} pages, which requires at least a ${requiredGutter}" binding gutter per KDP guidelines. Enable "Double-Sided Gutter Margin" before exporting so content isn't lost in the spine.`
      });
    }

    const isValid = !errors.some((err) => err.type === 'error');
    const hasWarnings = errors.some((err) => err.type === 'warning');

    const result = { isValid, hasWarnings, errors };
    setValidation(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidation({ isValid: true, hasWarnings: false, errors: [] });
  }, []);

  return {
    ...validation,
    validateBook,
    clearValidation
  };
}
