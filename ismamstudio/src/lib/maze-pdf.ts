import { jsPDF } from "jspdf";
import { MazeGrid, Shape, solveMaze } from "./maze";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";
import { calculateKdpMargins, drawKdpTitlePage, drawKdpCopyrightAndInstructionsPage, drawKdpSolutionsDividerPage, ensureEvenPageCount } from "./kdpBookEngine";

interface PdfOptions {
  mazes: {
    grid: MazeGrid;
    start: [number, number];
    end: [number, number];
  }[];
  shape: Shape;
  title?: string;
  subtitle?: string;
  authorName?: string;
  trimSize?: "6x9" | "8.5x11" | "5x8";
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
  includeFrontMatter?: boolean;
  isPremium?: boolean;
  hasBleed?: boolean;
  showGuides?: boolean;
  borderTheme?: BorderThemeId;
  scale?: number;
}

const TRIM_SIZES: Record<string, [number, number]> = {
  "6x9": [6, 9],
  "8.5x11": [8.5, 11],
  "5x8": [5, 8],
};

// Helper to merge continuous segments: given boolean flags for indices 0..n-1, returns [start, end][] intervals
function getActiveSegments(flags: boolean[]): [number, number][] {
  const segments: [number, number][] = [];
  let inSeg = false;
  let start = 0;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) {
      if (!inSeg) {
        inSeg = true;
        start = i;
      }
    } else {
      if (inSeg) {
        segments.push([start, i]);
        inSeg = false;
      }
    }
  }
  if (inSeg) {
    segments.push([start, flags.length]);
  }
  return segments;
}

// Helper to draw a single maze on a given jsPDF document instance
function drawMaze(
  doc: jsPDF,
  grid: MazeGrid,
  start: [number, number],
  end: [number, number],
  xOffset: number,
  yOffset: number,
  size: number,
  solutionPath?: [number, number][]
) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = size / Math.max(rows, cols);

  doc.setLineWidth(Math.max(0.015, cellSize * 0.08)); // Clear, crisp bold lines for printing
  doc.setDrawColor(0); // Pure black for KDP B&W compliance

  // 1. Draw Optimized Horizontal Wall Segments (Deduplicated & Merged)
  for (let r = 0; r <= rows; r++) {
    const rowFlags: boolean[] = new Array(cols).fill(false);
    for (let c = 0; c < cols; c++) {
      if (r === 0) {
        rowFlags[c] = !!grid[0]?.[c]?.active && !!grid[0][c].walls.top;
      } else if (r === rows) {
        rowFlags[c] = !!grid[rows - 1]?.[c]?.active && !!grid[rows - 1][c].walls.bottom;
      } else {
        const topCell = grid[r - 1]?.[c];
        const bottomCell = grid[r]?.[c];
        rowFlags[c] =
          (!!topCell?.active && !!topCell.walls.bottom) ||
          (!!bottomCell?.active && !!bottomCell.walls.top);
      }
    }

    const segments = getActiveSegments(rowFlags);
    const y = yOffset + r * cellSize;
    for (const [cStart, cEnd] of segments) {
      doc.line(xOffset + cStart * cellSize, y, xOffset + cEnd * cellSize, y);
    }
  }

  // 2. Draw Optimized Vertical Wall Segments (Deduplicated & Merged)
  for (let c = 0; c <= cols; c++) {
    const colFlags: boolean[] = new Array(rows).fill(false);
    for (let r = 0; r < rows; r++) {
      if (c === 0) {
        colFlags[r] = !!grid[r]?.[0]?.active && !!grid[r][0].walls.left;
      } else if (c === cols) {
        colFlags[r] = !!grid[r]?.[cols - 1]?.active && !!grid[r][cols - 1].walls.right;
      } else {
        const leftCell = grid[r]?.[c - 1];
        const rightCell = grid[r]?.[c];
        colFlags[r] =
          (!!leftCell?.active && !!leftCell.walls.right) ||
          (!!rightCell?.active && !!rightCell.walls.left);
      }
    }

    const segments = getActiveSegments(colFlags);
    const x = xOffset + c * cellSize;
    for (const [rStart, rEnd] of segments) {
      doc.line(x, yOffset + rStart * cellSize, x, yOffset + rEnd * cellSize);
    }
  }

  // 3. Draw Start (S) and End (E) Markers in bold high-contrast tones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(Math.max(7, Math.floor(cellSize * 30)));
  doc.setTextColor(0);

  const startX = xOffset + start[1] * cellSize + cellSize / 2;
  const startY = yOffset + start[0] * cellSize + cellSize * 0.72;
  doc.text("S", startX, startY, { align: "center" });

  const endX = xOffset + end[1] * cellSize + cellSize / 2;
  const endY = yOffset + end[0] * cellSize + cellSize * 0.72;
  doc.text("E", endX, endY, { align: "center" });

  // 4. Draw Solution Path if provided (Collinear line segments merged)
  if (solutionPath && solutionPath.length > 1) {
    doc.setLineWidth(Math.max(0.02, cellSize * 0.28));
    doc.setDrawColor(0);

    let segStart = solutionPath[0];
    let prevPoint = solutionPath[0];
    let prevDx = 0;
    let prevDy = 0;

    for (let i = 1; i < solutionPath.length; i++) {
      const cur = solutionPath[i];
      const dx = cur[1] - prevPoint[1];
      const dy = cur[0] - prevPoint[0];

      if (i === 1) {
        prevDx = dx;
        prevDy = dy;
      } else if (dx !== prevDx || dy !== prevDy) {
        const x1 = xOffset + segStart[1] * cellSize + cellSize / 2;
        const y1 = yOffset + segStart[0] * cellSize + cellSize / 2;
        const x2 = xOffset + prevPoint[1] * cellSize + cellSize / 2;
        const y2 = yOffset + prevPoint[0] * cellSize + cellSize / 2;
        doc.line(x1, y1, x2, y2);

        segStart = prevPoint;
        prevDx = dx;
        prevDy = dy;
      }
      prevPoint = cur;
    }

    const x1 = xOffset + segStart[1] * cellSize + cellSize / 2;
    const y1 = yOffset + segStart[0] * cellSize + cellSize / 2;
    const x2 = xOffset + prevPoint[1] * cellSize + cellSize / 2;
    const y2 = yOffset + prevPoint[0] * cellSize + cellSize / 2;
    doc.line(x1, y1, x2, y2);
  }
}

export async function generateMazePdf(options: PdfOptions): Promise<jsPDF> {
  const {
    mazes,
    shape,
    title = "Maze Puzzle Book",
    subtitle,
    authorName = "Independent Publisher",
    trimSize = "8.5x11",
    includeSolutions = true,
    includeCover = false,
    coverState = null,
    includeFrontMatter = true,
    hasBleed = false,
    showGuides = false,
    scale = 100,
  } = options;

  const [baseWidthInches, baseHeightInches] = TRIM_SIZES[trimSize] || TRIM_SIZES["8.5x11"];
  const bleed = hasBleed ? 0.125 : 0;
  const widthInches = baseWidthInches + bleed;
  const heightInches = baseHeightInches + bleed * 2;

  // Initialize jsPDF with inches context
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [widthInches, heightInches],
  });

  const frontMatterPages = 2;
  const solPages = includeSolutions && mazes.length > 0 ? 1 + Math.ceil(mazes.length / 4) : 0;
  const totalExpectedPages = frontMatterPages + mazes.length + solPages;

  let standardBaseSize = 5.6;
  if (trimSize === "6x9") standardBaseSize = 4.2;
  else if (trimSize === "5x8") standardBaseSize = 3.5;

  const scaleFactor = Math.max(0.5, Math.min(1.4, (scale || 100) / 100));
  const targetSize = standardBaseSize * scaleFactor;

  let firstPageAdded = false;
  let currentPage = 0;

  // 1. Draw Front Cover if integrated
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', widthInches, heightInches);
    firstPageAdded = true;
    currentPage++;
  }

  // 2. Standard KDP Front Matter (Title Page & Copyright/Instructions) - Mandatory
  if (firstPageAdded) doc.addPage();
  firstPageAdded = true;
  currentPage++;
  drawKdpTitlePage(doc, {
    title,
    subtitle: subtitle || `Featuring Premium ${shape.charAt(0).toUpperCase() + shape.slice(1)} Shaped Mazes with Solutions`,
    authorName,
    puzzleType: "maze",
    puzzleCount: mazes.length,
    width: widthInches,
    height: heightInches,
    totalPages: totalExpectedPages,
  });

  // Page 2: Copyright & Rules Page (Verso / Left page)
  doc.addPage();
  currentPage++;
  drawKdpCopyrightAndInstructionsPage(doc, {
    authorName,
    puzzleType: "maze",
    width: widthInches,
    height: heightInches,
    totalPages: totalExpectedPages,
  });

  // --------------------------------------------------
  // PAGES 3+: Interactive Puzzle Generation Loop
  // --------------------------------------------------
  mazes.forEach((maze, index) => {
    if (firstPageAdded) doc.addPage();
    firstPageAdded = true;
    currentPage++;

    // Alternating KDP Gutter Margins with safety padding
    const margins = calculateKdpMargins(currentPage, totalExpectedPages, widthInches);
    const maxSafeW = margins.contentW - 0.4;
    const maxSafeH = heightInches - 2.8;
    const mazeSize = Math.min(targetSize, maxSafeW, maxSafeH);
    const mazeX = margins.marginLeft + (margins.contentW - mazeSize) / 2;
    const mazeY = (heightInches - mazeSize) / 2 - 0.1;

    // Header Info (Framed to match maze width boundaries)
    const headerY = mazeY - 0.35;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(`Maze #${index + 1}`, mazeX, headerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(
      `Shape: ${shape.charAt(0).toUpperCase() + shape.slice(1)}`,
      mazeX + mazeSize,
      headerY - 0.02,
      { align: "right" }
    );

    // Draw the clean template puzzle without solution
    drawMaze(doc, maze.grid, maze.start, maze.end, mazeX, mazeY, mazeSize);

    if (showGuides) {
      drawMarginGuides(doc, margins.marginLeft, 0.75, margins.marginRight, 0.75, widthInches, heightInches);
    }

    // Footer info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(`Page ${currentPage}`, margins.contentCenterX, heightInches - 0.5, { align: "center" });
  });

  // --------------------------------------------------
  // SOLUTIONS SECTION (Compact 2x2 Grid Layout)
  // --------------------------------------------------
  if (includeSolutions && mazes.length > 0) {
    doc.addPage();
    currentPage++;

    // Section Header Divider with High-Contrast KDP Layout
    drawKdpSolutionsDividerPage(doc, {
      puzzleCount: mazes.length,
      puzzleType: "maze",
      width: widthInches,
      height: heightInches,
      pageNumber: currentPage,
      totalPages: totalExpectedPages,
      customSubtitle: `Complete Answer Keys for Mazes #1 to #${mazes.length}`,
    });

    let currentSolutionCount = 0;
    const solTopReserved = 1.1;
    const solBottomReserved = 0.8;
    const solSafeH = heightInches - solTopReserved - solBottomReserved;
    const gapX = 0.35;
    const gapY = 0.45;

    mazes.forEach((maze, index) => {
      // Every 4 solutions require a clean new page break
      if (currentSolutionCount % 4 === 0) {
        doc.addPage();
        currentPage++;
      }

      const solMargins = calculateKdpMargins(currentPage, totalExpectedPages, widthInches);
      const solSafeW = solMargins.contentW - 0.35; // Safe padding inside KDP margins

      const maxTileW = (solSafeW - gapX) / 2;
      const maxTileH = (solSafeH - gapY) / 2;
      const maxAllowedTileSize = trimSize === "5x8" ? 1.45 : trimSize === "6x9" ? 1.95 : 2.7;
      const solutionMazeSize = Math.min(maxTileW, maxTileH, maxAllowedTileSize);

      const totalGridW = solutionMazeSize * 2 + gapX;
      const totalGridH = solutionMazeSize * 2 + gapY;
      const solGridStartX = solMargins.marginLeft + (solMargins.contentW - totalGridW) / 2;
      const solGridStartY = solTopReserved + (solSafeH - totalGridH) / 2;

      if (currentSolutionCount % 4 === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Answer Keys", solMargins.contentCenterX, 0.85, { align: "center" });
        if (showGuides) {
          drawMarginGuides(doc, solMargins.marginLeft, 0.75, solMargins.marginRight, 0.75, widthInches, heightInches);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text(`Page ${currentPage}`, solMargins.contentCenterX, heightInches - 0.45, { align: "center" });
      }

      // Compute row and column positions dynamically for the 2x2 grid
      const colIndex = currentSolutionCount % 2;
      const rowIndex = Math.floor((currentSolutionCount % 4) / 2);

      const x = solGridStartX + colIndex * (solutionMazeSize + gapX);
      const y = solGridStartY + rowIndex * (solutionMazeSize + gapY);

      // Label indicator over the micro-solution preview grid
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Solution #${index + 1}`, x + solutionMazeSize / 2, y - 0.12, { align: "center" });

      // Execute optimal path calculations (BFS algorithm)
      const solvedPath = solveMaze(maze.grid, maze.start, maze.end);

      // Render miniature grid along with solution path trace line overlays
      drawMaze(doc, maze.grid, maze.start, maze.end, x, y, solutionMazeSize, solvedPath);

      currentSolutionCount++;
    });
  }

  // 3. Draw Back Cover if integrated
  if (includeCover && coverState) {
    doc.addPage();
    await drawCoverPagePart(doc, coverState, 'back', widthInches, heightInches);
  }

  // Apply watermark (free tier) and the decorative border theme to every
  // interior page, skipping the front/back cover pages.
  const { borderTheme } = options;
  if (!options.isPremium || (borderTheme && borderTheme !== "none")) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      const isFrontCover = includeCover && coverState && i === 1;
      const isBackCover = includeCover && coverState && i === totalPages;
      if (!isFrontCover && !isBackCover) {
        doc.setPage(i);
        if (borderTheme && borderTheme !== "none") drawPageBorderTheme(doc, borderTheme, widthInches, heightInches);
        if (!options.isPremium) drawWatermark(doc, widthInches, heightInches);
      }
    }
  }

  ensureEvenPageCount(doc);
  return doc;
}

export async function downloadMazePdf(options: PdfOptions, filename = "maze-book.pdf") {
  const doc = await generateMazePdf(options);
  doc.save(filename);
}