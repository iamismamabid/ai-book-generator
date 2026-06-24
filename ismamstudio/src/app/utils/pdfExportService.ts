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

    // Render logic based on page type
    if (page.type === 'crossword' && page.config.gridData) {
      drawCrossword(doc, page, leftMarginShift, w);
    } else if (page.type === 'word_search' && page.config.gridData) {
      drawWordSearch(doc, page, leftMarginShift, w);
    } else if (page.type === 'sudoku' && page.config.gridData) {
      drawSudoku(doc, page, leftMarginShift, w);
    } else if (page.type === 'maze' && page.config.gridData) {
      drawMaze(doc, page, leftMarginShift, w);
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