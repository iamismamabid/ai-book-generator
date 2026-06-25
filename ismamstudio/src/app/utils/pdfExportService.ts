import { jsPDF } from "jspdf";

export interface ExportOptions {
  includeCover?: boolean;
  coverState?: any;
  includePageNumbers?: boolean;
  gutterMargin?: boolean;
  trimSize?: { label: string; w: number; h: number };
}

export const exportBookToPDF = (bookPages: any[], options: ExportOptions = {}) => {
  const {
    includeCover = false,
    coverState = null,
    includePageNumbers = true,
    gutterMargin = false,
    trimSize = { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 }
  } = options;

  const w = trimSize.w;
  const h = trimSize.h;
  
  // Initialize portrait PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [w, h] });

  // 1. Add Front Cover if integrated
  let firstPageAdded = false;
  if (includeCover && coverState) {
    drawCoverPagePart(doc, coverState, 'front', w, h);
    firstPageAdded = true;
  }

  // 2. Add Interior Pages
  bookPages.forEach((page, index) => {
    if (firstPageAdded || index > 0) {
      doc.addPage();
    }
    firstPageAdded = true;

    // Apply gutter margin if requested
    const leftMarginShift = gutterMargin ? (index % 2 === 0 ? 0.375 : 0) : 0;

    // Page Title (except for title/blank pages)
    if (page.type !== 'title' && page.type !== 'blank') {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      const isSol = page.config.isSolution || false;
      const title = `${page.type.replace('_', ' ').toUpperCase()}${isSol ? ' (SOLUTION)' : ''}`;
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (w - titleWidth) / 2 + leftMarginShift, 0.8);

      // Render Page Number
      if (includePageNumbers) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Page ${index + 1}`, w - 1.0 + leftMarginShift, h - 0.6);
      }
    }

    if (page.type === 'crossword' && page.config.gridData) {
      drawCrossword(doc, page, leftMarginShift, w);
    } else if (page.type === 'word_search' && page.config.gridData) {
      drawWordSearch(doc, page, leftMarginShift, w);
    } else if (page.type === 'sudoku' && page.config.gridData) {
      drawSudoku(doc, page, leftMarginShift, w);
    } else if (page.type === 'maze' && page.config.gridData) {
      drawMaze(doc, page, leftMarginShift, w);
    } else if (page.type === 'word_scramble' && page.config.scrambledData) {
      drawWordScramble(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'cryptogram' && page.config.cryptogramData) {
      drawCryptogram(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'math_puzzle' && page.config.puzzleData) {
      drawMathPuzzle(doc, page, leftMarginShift, w, h);
    } else if (page.type === 'title') {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(32);
      const titleText = page.config.title || "Book Title";
      const titleW = doc.getTextWidth(titleText);
      doc.text(titleText, (w - titleW) / 2 + leftMarginShift, h * 0.3);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(16);
      const subtitleText = page.config.subtitle || "Book Subtitle";
      const subtitleW = doc.getTextWidth(subtitleText);
      doc.text(subtitleText, (w - subtitleW) / 2 + leftMarginShift, h * 0.38);

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(14);
      const authorText = page.config.author ? `By ${page.config.author}` : "Author Name";
      const authorW = doc.getTextWidth(authorText);
      doc.text(authorText, (w - authorW) / 2 + leftMarginShift, h * 0.68);
    }
  });

  // 3. Add Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    drawCoverPagePart(doc, coverState, 'back', w, h);
  }

  doc.save("My_KDP_Puzzle_Book.pdf");
};

// Helper: Draw Crossword Grid & Clues
const drawCrossword = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;
  const gridSize = 15;
  const cellSize = 0.3;
  const startX = (pageWidth - gridSize * cellSize) / 2 + xShift;
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
          doc.setTextColor(30, 41, 59);
          doc.text(String(wordStart.num), x + 0.03, y + 0.09);
        }

        // Draw solved letter if it is solution mode
        if (isSolution) {
          doc.setFontSize(12);
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          const letterWidth = doc.getTextWidth(cell);
          doc.text(cell, x + (cellSize - letterWidth) / 2, y + 0.22);
        }
      }
    });
  });

  // Reset text color
  doc.setTextColor(0);

  // Clues (only draw clues on the puzzle page, skip on solution pages to save space)
  if (!isSolution) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    const clueY = startY + (gridSize * cellSize) + 0.4;
    
    // Across Clues
    doc.text("ACROSS", startX + 0.2, clueY);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    let acrossOffset = 0.2;
    data.placedWords.filter((w: any) => w.dir === 'H').forEach((w: any) => {
      doc.text(`${w.num}. ${w.clue}`, startX + 0.2, clueY + acrossOffset);
      acrossOffset += 0.17;
    });

    // Down Clues
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DOWN", startX + 2.5, clueY);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    let downOffset = 0.2;
    data.placedWords.filter((w: any) => w.dir === 'V').forEach((w: any) => {
      doc.text(`${w.num}. ${w.clue}`, startX + 2.5, clueY + downOffset);
      downOffset += 0.17;
    });
  }
};

// Helper: Draw Word Search Grid
const drawWordSearch = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;
  const size = 12;
  const cellSize = 0.35;
  const startX = (pageWidth - size * cellSize) / 2 + xShift;
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
      
      const isWordLetter = isSolution && data.mask && data.mask[r][c];

      if (isWordLetter) {
        doc.setFillColor(224, 231, 255); // Indigo 100
        doc.roundedRect(x + 0.02, y + 0.02, cellSize - 0.04, cellSize - 0.04, 0.04, 0.04, "F");
        doc.setTextColor(79, 70, 229); // Indigo 600
      } else {
        doc.setTextColor(30, 41, 59);
      }

      // Draw centered letter
      const letterWidth = doc.getTextWidth(letter);
      doc.text(letter, x + (cellSize - letterWidth) / 2, y + 0.23);
    });
  });

  // Reset colors
  doc.setTextColor(0);

  // Words list to find
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  const wordsY = startY + (size * cellSize) + 0.4;
  doc.text("WORDS TO FIND:", startX + 0.5, wordsY);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  let wordOffset = 0.25;
  let col = 0;
  data.words.forEach((w: any) => {
    const xPos = startX + 0.5 + col * 1.5;
    if (isSolution) {
      doc.setTextColor(148, 163, 184); // Slate 400
    }
    doc.text(w.text, xPos, wordsY + wordOffset);
    col++;
    if (col >= 3) {
      col = 0;
      wordOffset += 0.2;
    }
  });

  // Reset text color
  doc.setTextColor(0);
};

// Helper: Draw Sudoku Grid
const drawSudoku = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const data = page.config.gridData;
  const isSolution = page.config.isSolution || false;
  const cellSize = 0.45;
  const gridWidth = cellSize * 9;
  const startX = (pageWidth - gridWidth) / 2 + xShift;
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
      const initialVal = data.puzzle[r][c];
      const displayedVal = isSolution ? data.solution[r][c] : initialVal;
      const isAnswer = isSolution && initialVal === 0;

      if (displayedVal !== 0) {
        if (isAnswer) {
          doc.setTextColor(79, 70, 229); // Indigo 600
          doc.setFont("Helvetica", "bold");
        } else {
          doc.setTextColor(15, 23, 42); // slate-900
          doc.setFont("Helvetica", "bold");
        }
        doc.setFontSize(14);
        const valStr = String(displayedVal);
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

  // Reset text color
  doc.setTextColor(0);
};

// Helper: Draw Maze Challenge
const drawMaze = (doc: any, page: any, xShift: number, pageWidth: number) => {
  const data = page.config.gridData;
  const showSolution = page.config.showSolution || page.config.isSolution || false;
  const gridSize = data.grid.length;
  const cellSize = 0.2;
  const mazeWidth = gridSize * cellSize;
  const startX = (pageWidth - mazeWidth) / 2 + xShift;
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
  doc.setTextColor(16, 185, 129); // Green
  doc.text("START", startX + data.start[1] * cellSize + 0.02, startY + data.start[0] * cellSize - 0.05);
  doc.setTextColor(239, 104, 104); // Red
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

  // Reset text color
  doc.setTextColor(0);
};

// Helper: Draw Front Cover or Back Cover page
const drawCoverPagePart = (doc: any, coverState: any, side: 'front' | 'back', pageWidth: number, pageHeight: number) => {
  const { 
    coverElements = [], 
    frontCoverColor = '#1E293B', 
    backCoverColor = '#0F172A',
    frontCoverType = 'solid', 
    backCoverType = 'solid',
    frontCoverGradientStart = '#1E293B',
    frontCoverGradientEnd = '#0F172A',
    backCoverGradientStart = '#0F172A',
    backCoverGradientEnd = '#020617',
    spineWidth = 0.22,
    trimSize = { w: 8.5, h: 11 }
  } = coverState;

  // 1. Draw Page Background
  const isFront = side === 'front';
  const bgColor = isFront ? frontCoverColor : backCoverColor;
  const isGradient = isFront ? frontCoverType === 'gradient' : backCoverType === 'gradient';
  const gradStart = isFront ? frontCoverGradientStart : backCoverGradientStart;
  const gradEnd = isFront ? frontCoverGradientEnd : backCoverGradientEnd;

  doc.setFillColor(bgColor);
  // Approximation of gradient with a fallback solid or thin color step rectangles
  if (isGradient) {
    const steps = 15;
    const stepHeight = pageHeight / steps;
    const startRGB = hexToRgb(gradStart);
    const endRGB = hexToRgb(gradEnd);

    if (startRGB && endRGB) {
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.round(startRGB.r + ratio * (endRGB.r - startRGB.r));
        const g = Math.round(startRGB.g + ratio * (endRGB.g - startRGB.g));
        const b = Math.round(startRGB.b + ratio * (endRGB.b - startRGB.b));
        doc.setFillColor(r, g, b);
        doc.rect(0, i * stepHeight, pageWidth, stepHeight + 0.02, "F");
      }
    } else {
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    }
  } else {
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  // 2. Draw Vector Elements belonging to this side
  const CANVAS_WIDTH = 800;
  const bleed = 0.125;
  const coverTotalWidthInches = (trimSize.w * 2) + spineWidth + (bleed * 2);
  const scale = CANVAS_WIDTH / coverTotalWidthInches;
  const bleedPx = bleed * scale;
  const spineWidthPx = spineWidth * scale;
  
  // Split region
  const spineLeftPx = bleedPx + trimSize.w * scale;
  const spineRightPx = spineLeftPx + spineWidthPx;

  // Filter elements on the correct side
  const elements = coverElements.filter((el: any) => {
    if (isFront) {
      // Front cover is on the right side of the spine
      return el.x >= spineRightPx;
    } else {
      // Back cover is on the left side of the spine
      return el.x <= spineLeftPx;
    }
  });

  // Dimensions of one cover page on the canvas
  const canvasCoverWidth = trimSize.w * scale;
  const canvasCoverHeight = trimSize.h * scale;

  elements.forEach((el: any) => {
    // Map canvas coordinates relative to side boundary
    const sideOffsetLeft = isFront ? spineRightPx : bleedPx;
    const rx = (el.x - sideOffsetLeft) / canvasCoverWidth;
    const ry = (el.y - bleedPx) / canvasCoverHeight;

    // Convert to target page coordinates (in inches)
    const px = rx * pageWidth;
    const py = ry * pageHeight;

    // Width/height scaling
    const wScale = pageWidth / pageWidth; // Aspect ratio check if needed, standard linear scaling
    const scaleFactor = pageHeight / (canvasCoverHeight / scale); // inch per canvas inch
    
    // Draw text
    if (el.type === 'text') {
      const fontSizePt = el.fontSize * (pageHeight * 72 / (canvasCoverHeight));
      doc.setFont(el.fontFamily || "Helvetica", el.fontStyle || "normal");
      doc.setFontSize(fontSizePt);
      doc.setTextColor(el.fill || "#FFFFFF");
      doc.text(el.text, px, py);
    } 
    // Draw shapes
    else if (el.type === 'rect') {
      const rw = (el.width / canvasCoverWidth) * pageWidth;
      const rh = (el.height / canvasCoverHeight) * pageHeight;
      doc.setFillColor(el.fill || "#F59E0B");
      doc.setDrawColor(el.stroke || "#FFFFFF");
      doc.setLineWidth(el.strokeWidth ? el.strokeWidth / 72 : 0);
      doc.rect(px, py, rw, rh, el.strokeWidth > 0 ? "FD" : "F");
    } 
    else if (el.type === 'circle') {
      const rRad = (el.radius / canvasCoverWidth) * pageWidth;
      doc.setFillColor(el.fill || "#3B82F6");
      doc.setDrawColor(el.stroke || "#FFFFFF");
      doc.setLineWidth(el.strokeWidth ? el.strokeWidth / 72 : 0);
      doc.circle(px, py, rRad, el.strokeWidth > 0 ? "FD" : "F");
    } 
    else if (el.type === 'line') {
      doc.setDrawColor(el.stroke || "#FFFFFF");
      doc.setLineWidth(el.strokeWidth ? el.strokeWidth / 72 : 0.05);
      const points = el.points || [0, 0, 100, 0];
      const lx2 = px + (points[2] / canvasCoverWidth) * pageWidth;
      const ly2 = py + (points[3] / canvasCoverHeight) * pageHeight;
      doc.line(px, py, lx2, ly2);
    }
  });

  // Reset text color to default
  doc.setTextColor(0);
};

// Helper: Hex color parser
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper: Draw Word Scramble
const drawWordScramble = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const data = page.config.scrambledData;
  const difficulty = page.config.difficulty || "easy";
  const isSolution = page.config.isSolution || false;

  const marginL = 0.75 + xShift;
  const marginR = 0.5;
  const marginT = 1.3;
  const marginB = 0.75;

  const contentW = pageWidth - (0.75 + marginR);
  const contentH = pageHeight - marginT - marginB;

  // Draw Words list
  const listStartY = marginT + 0.3;
  const availableHeight = contentH - 1.5;
  const stepY = Math.min(0.5, availableHeight / data.scrambled.length);

  data.scrambled.forEach((scrambled: string, wIdx: number) => {
    const y = listStartY + wIdx * stepY;

    // Number indicator
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text(`${wIdx + 1}.`, marginL + 0.2, y);

    // Scrambled letters
    const displayScrambled = scrambled.split("").join(" ");
    doc.setFont("Courier", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(displayScrambled, marginL + 0.6, y);

    // Answer representation
    if (isSolution) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text(data.original[wIdx], marginL + contentW - 2.0, y);
    } else {
      // Underline
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.008);
      doc.line(marginL + contentW - 2.2, y + 0.05, marginL + contentW - 0.2, y + 0.05);
    }
  });

  // Reset colors
  doc.setTextColor(0);

  // Word Bank (if easy/medium and not solution)
  if (difficulty !== "hard" && !isSolution) {
    const bankStartY = pageHeight - marginB - 1.2;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.setLineWidth(0.008);
    doc.roundedRect(marginL + 0.1, bankStartY, contentW - 0.2, 0.9, 0.08, 0.08, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("WORD BANK", marginL + 0.3, bankStartY + 0.2);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const colW = (contentW - 0.6) / 3;
    let row = 0;
    let col = 0;

    data.wordBank.forEach((w: string) => {
      const wx = marginL + 0.3 + col * colW;
      const wy = bankStartY + 0.42 + row * 0.2;
      doc.text(w, wx, wy);
      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }
    });
  }

  doc.setTextColor(0);
};

// Helper: Draw Cryptogram
const drawCryptogram = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const data = page.config.cryptogramData;
  const isSolution = page.config.isSolution || false;

  const marginL = 0.75 + xShift;
  const marginR = 0.5;
  const marginT = 1.4;
  const marginB = 0.75;

  const contentW = pageWidth - (0.75 + marginR);

  // Box sizing
  const charBoxW = 0.24;
  const charBoxH = 0.28;
  const charSpacing = 0.06;
  const wordSpacing = 0.26;
  const lineStepY = 0.75;

  let curX = marginL + 0.2;
  let curY = marginT + 0.4;

  const wordsList = data.encrypted.split(" ");
  const originalWordsList = data.original.split(" ");

  wordsList.forEach((word: string, wIdx: number) => {
    const originalWord = originalWordsList[wIdx] || "";
    const wordLen = word.length;
    const wordWidthInches = wordLen * charBoxW + (wordLen - 1) * charSpacing;

    if (curX + wordWidthInches > marginL + contentW - 0.2) {
      curX = marginL + 0.2;
      curY += lineStepY;
    }

    for (let i = 0; i < wordLen; i++) {
      const char = word[i];
      const isLetter = /[A-Z]/.test(char);
      const originalChar = originalWord[i] || "";

      if (isLetter) {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.008);
        doc.rect(curX, curY, charBoxW, charBoxH);

        if (isSolution) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(originalChar, curX + charBoxW / 2, curY + charBoxH - 0.08, { align: "center" });
        }

        // Bottom Cipher letter
        doc.setFont("Courier", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(char, curX + charBoxW / 2, curY + charBoxH + 0.16, { align: "center" });
      } else {
        doc.setFont("Courier", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(char, curX + charBoxW / 2, curY + charBoxH - 0.05, { align: "center" });
      }

      curX += charBoxW + charSpacing;
    }

    curX += wordSpacing;
  });

  // Substitution Key (Solution only)
  if (isSolution && data.cipherMap) {
    const keyStartY = pageHeight - marginB - 1.2;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("SUBSTITUTION KEY:", marginL + 0.2, keyStartY);

    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const alpha1 = "A B C D E F G H I J K L M";
    const alpha2 = "N O P Q R S T U V W X Y Z";

    const getCipherStr = (alpha: string) =>
      alpha
        .split(" ")
        .map((l) => data.cipherMap[l] || "_")
        .join(" ");

    doc.text(`ALPHABET: ${alpha1}`, marginL + 0.2, keyStartY + 0.25);
    doc.text(`CIPHER:   ${getCipherStr(alpha1)}`, marginL + 0.2, keyStartY + 0.4);

    doc.text(`ALPHABET: ${alpha2}`, marginL + 0.2, keyStartY + 0.65);
    doc.text(`CIPHER:   ${getCipherStr(alpha2)}`, marginL + 0.2, keyStartY + 0.8);
  }

  doc.setTextColor(0);
};

// Helper: Draw Math Puzzle Grid
const drawMathPuzzle = (doc: any, page: any, xShift: number, pageWidth: number, pageHeight: number) => {
  const puzzleType = page.config.puzzleType || "addition";
  const puzzle = page.config.puzzleData;
  const isSolution = page.config.isSolution || false;

  const contentW = pageWidth - 1.25;

  if (puzzleType === "addition") {
    // 3x3 Addition Grid
    const size = 3;
    const boxW = 0.55;
    const boxH = 0.55;
    const cellSpacing = 0.45;
    const startX = (pageWidth - (size * boxW + (size - 1) * cellSpacing)) / 2 + xShift;
    const startY = 1.6;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = r * 3 + c;
        const cx = startX + c * (boxW + cellSpacing);
        const cy = startY + r * (boxH + cellSpacing);

        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.015);
        doc.rect(cx, cy, boxW, boxH);

        const val = puzzle.grid[idx];
        const isHidden = puzzle.hiddenIndices.includes(idx) && !isSolution;
        const isAnswer = isSolution && puzzle.hiddenIndices.includes(idx);

        if (!isHidden) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          if (isAnswer) {
            doc.setTextColor(79, 70, 229);
          } else {
            doc.setTextColor(30, 41, 59);
          }
          doc.text(val.toString(), cx + boxW / 2, cy + boxH / 2 + 0.05, { align: "center" });
        }

        // Operators
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);

        if (c < size - 1) {
          const char = c === 1 ? "=" : "+";
          doc.text(char, cx + boxW + cellSpacing / 2, cy + boxH / 2 + 0.05, { align: "center" });
        }

        if (r < size - 1) {
          const char = r === 1 ? "=" : "+";
          doc.text(char, cx + boxW / 2, cy + boxH + cellSpacing / 2 + 0.05, { align: "center" });
        }
      }
    }
  } else if (puzzleType === "multiplication") {
    // 5x5 Grid (headers and values)
    const size = 5;
    const cellW = 0.55;
    const cellH = 0.55;
    const startX = (pageWidth - size * cellW) / 2 + xShift;
    const startY = 1.6;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = startY + r * cellH;
        const isHeader = r === 0 || c === 0;

        if (isHeader) {
          doc.setFillColor(241, 245, 249);
          doc.rect(cx, cy, cellW, cellH, "FD");
        } else {
          doc.rect(cx, cy, cellW, cellH);
        }

        if (r === 0 && c === 0) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(79, 70, 229);
          doc.text("x", cx + cellW / 2, cy + cellH / 2 + 0.05, { align: "center" });
        } else if (r === 0) {
          const val = puzzle.colFactors[c - 1];
          const isHidden = puzzle.hiddenCols.includes(c - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenCols.includes(c - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } else if (c === 0) {
          const val = puzzle.rowFactors[r - 1];
          const isHidden = puzzle.hiddenRows.includes(r - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenRows.includes(r - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        } else {
          const val = puzzle.grid[r - 1][c - 1];
          const isHidden = puzzle.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenProducts.some((p: any) => p[0] === r - 1 && p[1] === c - 1);

          if (!isHidden) {
            doc.setFont("Helvetica", isAnswer ? "bold" : "normal");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  } else if (puzzleType === "number_fill") {
    // 5x5 Number Sums Fill Grid
    const size = 5;
    const cellW = 0.55;
    const cellH = 0.55;
    const startX = (pageWidth - size * cellW) / 2 + xShift;
    const startY = 1.6;

    doc.setLineWidth(0.012);
    doc.setDrawColor(30, 41, 59);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cx = startX + c * cellW;
        const cy = startY + r * cellH;
        const isSumHeader = r === 4 || c === 4;

        if (r === 4 && c === 4) continue;

        if (isSumHeader) {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(148, 163, 184);
          doc.rect(cx, cy, cellW, cellH, "FD");

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          const sumVal = r === 4 ? puzzle.colSums[c] : puzzle.rowSums[r];
          doc.text(sumVal.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
        } else {
          doc.setDrawColor(30, 41, 59);
          doc.rect(cx, cy, cellW, cellH);

          const val = puzzle.grid[r][c];
          const isHidden = puzzle.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c) && !isSolution;
          const isAnswer = isSolution && puzzle.hiddenCells.some((cell: any) => cell[0] === r && cell[1] === c);

          if (!isHidden) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(isAnswer ? 79 : 30, isAnswer ? 70 : 41, isAnswer ? 229 : 59);
            doc.text(val.toString(), cx + cellW / 2, cy + cellH / 2 + 0.04, { align: "center" });
          }
        }
      }
    }
  }

  doc.setTextColor(0);
};