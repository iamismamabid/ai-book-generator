import { generatePuzzleGrid } from './puzzleEngine';

export interface ParsedBatch {
  theme?: string;
  words: string[];
}

export function parseBulkText(rawText: string, wordsPerPuzzle: number = 15): ParsedBatch[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const batches: ParsedBatch[] = [];
  
  let currentTheme: string | undefined = undefined;
  let currentWords: string[] = [];

  for (const line of lines) {
    // Detect theme headers like "Theme: Animals" or "# Animals" or "[Animals]"
    const themeMatch = line.match(/^(?:Theme:\s*|#\s*|\[)(.+?)(?:\])?$/i);
    
    if (themeMatch) {
      if (currentWords.length > 0) {
        batches.push({ theme: currentTheme, words: currentWords });
        currentWords = [];
      }
      currentTheme = themeMatch[1].trim();
      continue;
    }

    // Split words by commas, and handle spaces around words
    const words = line.split(',').map(w => w.trim()).filter(w => w.length > 0);
    
    // If no commas, assume space-separated or just one word per line
    if (words.length === 1 && line.includes(' ') && !line.includes(',')) {
      const spaceWords = line.split(' ').map(w => w.trim()).filter(w => w.length > 0);
      words.splice(0, words.length, ...spaceWords);
    }
    
    for (const word of words) {
      currentWords.push(word);
      if (currentWords.length >= wordsPerPuzzle) {
        batches.push({ theme: currentTheme, words: currentWords });
        currentWords = [];
      }
    }
  }

  if (currentWords.length > 0) {
    batches.push({ theme: currentTheme, words: currentWords });
  }

  return batches;
}

export function processBulkToPages(rawText: string, wordsPerPuzzle: number = 15, gridSize: number = 12, textCase: string = 'uppercase') {
  const batches = parseBulkText(rawText, wordsPerPuzzle);
  
  return batches.map(batch => {
    const rawTextValue = batch.words.join(', ');
    const gridData = generatePuzzleGrid(batch.words, gridSize, textCase);
    
    return {
      type: 'word_search',
      config: {
        rawText: rawTextValue,
        theme: batch.theme,
        gridData
      }
    };
  });
}
