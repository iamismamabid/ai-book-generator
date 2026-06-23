import { jsPDF } from "jspdf";

export const exportBookToPDF = (bookPages: any[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [8.5, 11] });

  bookPages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    
    // Page Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    const title = `${page.type.replace('_', ' ').toUpperCase()}`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (8.5 - titleWidth) / 2, 0.8);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Page ${index + 1}`, 7.5, 10.5);

    // Render Logic based on type
    if (page.type === 'crossword' && page.config.gridData) {
      drawCrossword(doc, page.config.gridData);
    } else if (page.type === 'word_search' && page.config.gridData) {
      drawWordSearch(doc, page.config.gridData);
    } else if (page.type === 'sudoku' && page.config.gridData) {
      drawSudoku(doc, page.config.gridData);
    } else if (page.type === 'maze' && page.config.gridData) {
      drawMaze(doc, page.config.gridData, page.config.showSolution);
    }
  });

  doc.save("My_KDP_Puzzle_Book.pdf");
};

// Helper: Draw Crossword Grid
const drawCrossword = (doc: any, data: any) => {
  const gridSize = 15;
  const cellSize = 0.3;
  const startX = (8.5 - gridSize * cellSize) / 2;
  const startY = 1.3;

  doc.setLineWidth(0.01);
  doc.setDrawColor(30, 41, 59);

  // Draw grid
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((cell: string, c: number) => {
      const x = startX + (c * cellSize);
      const y = startY + (r * cellSize);
      
      if (cell === '') {
        // Black block
        doc.setFillColor(30, 41, 59);
        doc.rect(x, y, cellSize, cellSize, "F");
      } else {
        // White cell
        doc.rect(x, y, cellSize, cellSize);
        
        // Find if a word starts here
        const wordStart = data.placedWords.find((w: any) => w.r === r && w.c === c);
        if (wordStart) {
          doc.setFontSize(6);
          doc.setFont("Helvetica", "bold");
          doc.text(String(wordStart.num), x + 0.03, y + 0.09);
        }
      }
    });
  });

  // Clues
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  const clueY = startY + (gridSize * cellSize) + 0.5;
  
  // Across Clues
  doc.text("ACROSS", 1.0, clueY);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  let acrossOffset = 0.2;
  data.placedWords.filter((w: any) => w.dir === 'H').forEach((w: any) => {
    doc.text(`${w.num}. ${w.clue}`, 1.0, clueY + acrossOffset);
    acrossOffset += 0.18;
  });

  // Down Clues
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("DOWN", 4.8, clueY);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  let downOffset = 0.2;
  data.placedWords.filter((w: any) => w.dir === 'V').forEach((w: any) => {
    doc.text(`${w.num}. ${w.clue}`, 4.8, clueY + downOffset);
    downOffset += 0.18;
  });
};

// Helper: Draw Word Search Grid
const drawWordSearch = (doc: any, data: any) => {
  const size = 12;
  const cellSize = 0.35;
  const startX = (8.5 - size * cellSize) / 2;
  const startY = 1.4;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  
  // Draw Letters
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((letter: string, c: number) => {
      const x = startX + (c * cellSize);
      const y = startY + (r * cellSize);
      
      // Draw light box boundary
      doc.setDrawColor(241, 245, 249);
      doc.rect(x, y, cellSize, cellSize);
      
      // Draw centered letter
      doc.setDrawColor(0);
      const letterWidth = doc.getTextWidth(letter);
      doc.text(letter, x + (cellSize - letterWidth) / 2, y + 0.23);
    });
  });

  // Words list to find
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  const wordsY = startY + (size * cellSize) + 0.5;
  doc.text("WORDS TO FIND:", 1.5, wordsY);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  let wordOffset = 0.3;
  let col = 0;
  data.words.forEach((w: any, index: number) => {
    const xPos = 1.5 + col * 2.0;
    doc.text(w.text, xPos, wordsY + wordOffset);
    col++;
    if (col >= 3) {
      col = 0;
      wordOffset += 0.22;
    }
  });
};

// Helper: Draw Sudoku Grid
const drawSudoku = (doc: any, data: any) => {
  const cellSize = 0.45;
  const gridWidth = cellSize * 9;
  const startX = (8.5 - gridWidth) / 2;
  const startY = 1.6;

  // Draw cells and borders
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = startX + (c * cellSize);
      const y = startY + (r * cellSize);

      // Normal border
      doc.setLineWidth(0.005);
      doc.setDrawColor(148, 163, 184);
      doc.rect(x, y, cellSize, cellSize);

      // Value
      const val = data.puzzle[r][c];
      if (val !== 0) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        const valStr = String(val);
        const valWidth = doc.getTextWidth(valStr);
        doc.text(valStr, x + (cellSize - valWidth) / 2, y + 0.29);
      }
    }
  }

  // Draw thicker borders for 3x3 subdivisions
  doc.setLineWidth(0.02);
  doc.setDrawColor(15, 23, 42);
  for (let i = 0; i <= 9; i += 3) {
    // Vertical lines
    doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + gridWidth);
    // Horizontal lines
    doc.line(startX, startY + i * cellSize, startX + gridWidth, startY + i * cellSize);
  }
};

// Helper: Draw Maze Challenge
const drawMaze = (doc: any, data: any, showSolution: boolean) => {
  const gridSize = data.grid.length;
  const cellSize = 0.2;
  const mazeWidth = gridSize * cellSize;
  const startX = (8.5 - mazeWidth) / 2;
  const startY = 1.6;

  // Draw maze walls
  doc.setLineWidth(0.015);
  doc.setDrawColor(26, 26, 26);

  data.grid.forEach((row: any[], r: number) => {
    row.forEach((cell: any, c: number) => {
      if (!cell.active) return;
      const x1 = startX + (c * cellSize);
      const y1 = startY + (r * cellSize);
      const x2 = x1 + cellSize;
      const y2 = y1 + cellSize;

      if (cell.walls.top) doc.line(x1, y1, x2, y1);
      if (cell.walls.bottom) doc.line(x1, y2, x2, y2);
      if (cell.walls.right) doc.line(x2, y1, x2, y2);
      if (cell.walls.left) doc.line(x1, y1, x1, y2);
    });
  });

  // Start / Exit markers
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("START", startX + data.start[1] * cellSize + 0.02, startY + data.start[0] * cellSize - 0.05);
  doc.text("EXIT", startX + data.end[1] * cellSize + 0.02, startY + data.end[0] * cellSize + cellSize + 0.15);

  // Draw Solution Path if checked
  if (showSolution && data.solution && data.solution.length > 0) {
    doc.setLineWidth(0.02);
    doc.setDrawColor(239, 68, 68); // Red

    const path = data.solution;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const x1 = startX + p1[1] * cellSize + cellSize / 2;
      const y1 = startY + p1[0] * cellSize + cellSize / 2;
      const x2 = startX + p2[1] * cellSize + cellSize / 2;
      const y2 = startY + p2[0] * cellSize + cellSize / 2;
      doc.line(x1, y1, x2, y2);
    }
  }
};