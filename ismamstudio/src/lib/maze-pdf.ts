import { jsPDF } from "jspdf";
import { MazeGrid, Shape, solveMaze } from "./maze";
import { drawCoverPagePart, drawWatermark, drawMarginGuides } from "../app/utils/pdfExportService";
import { drawPageBorderTheme } from "../app/utils/borderThemeDrawing";
import { BorderThemeId } from "./borderThemes";
import { calculateKdpMargins, drawKdpTitlePage, drawKdpCopyrightAndInstructionsPage } from "./kdpBookEngine";

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
  doc.setDrawColor(15, 23, 42); // Slate-900 bold black tone

  // 1. Draw Maze Walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.active) continue;

      const x = xOffset + c * cellSize;
      const y = yOffset + r * cellSize;

      if (cell.walls.top) doc.line(x, y, x + cellSize, y);
      if (cell.walls.bottom) doc.line(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.walls.left) doc.line(x, y, x, y + cellSize);
      if (cell.walls.right) doc.line(x + cellSize, y, x + cellSize, y + cellSize);
    }
  }

  // 2. Draw Start (S) and End (E) Markers in bold high-contrast tones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(Math.max(8, Math.floor(cellSize * 32)));
  doc.setTextColor(15, 23, 42);

  const startX = xOffset + start[1] * cellSize + cellSize / 2;
  const startY = yOffset + start[0] * cellSize + cellSize * 0.72;
  doc.text("S", startX, startY, { align: "center" });

  const endX = xOffset + end[1] * cellSize + cellSize / 2;
  const endY = yOffset + end[0] * cellSize + cellSize * 0.72;
  doc.text("E", endX, endY, { align: "center" });

  // 3. Draw Solution Path if provided (Solid rich black line with circular endpoints)
  if (solutionPath && solutionPath.length > 0) {
    doc.setLineWidth(Math.max(0.02, cellSize * 0.28));
    doc.setDrawColor(15, 23, 42);

    for (let i = 0; i < solutionPath.length - 1; i++) {
      const p1 = solutionPath[i];
      const p2 = solutionPath[i + 1];

      const x1 = xOffset + p1[1] * cellSize + cellSize / 2;
      const y1 = yOffset + p1[0] * cellSize + cellSize / 2;
      const x2 = xOffset + p2[1] * cellSize + cellSize / 2;
      const y2 = yOffset + p2[0] * cellSize + cellSize / 2;

      doc.line(x1, y1, x2, y2);
    }
  }
}

export async function generateMazePdf(options: PdfOptions): Promise<jsPDF> {
  const {
    mazes,
    shape,
    title = "Maze Puzzle Book",
    subtitle,
    authorName = "Ismam Abid",
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

  const frontMatterPages = (!includeCover && includeFrontMatter !== false) ? 2 : 0;
  const solPages = includeSolutions && mazes.length > 0 ? 1 + Math.ceil(mazes.length / 4) : 0;
  const totalExpectedPages = frontMatterPages + mazes.length + solPages;

  let standardBaseSize = 5.6;
  if (trimSize === "6x9") standardBaseSize = 4.2;
  else if (trimSize === "5x8") standardBaseSize = 3.5;

  const scaleFactor = Math.max(0.5, Math.min(1.4, (scale || 100) / 100));
  const targetSize = standardBaseSize * scaleFactor;
  const safeH = heightInches - 1.6;

  let firstPageAdded = false;
  let currentPage = 0;

  // 1. Draw Front Cover if integrated
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', widthInches, heightInches);
    firstPageAdded = true;
    currentPage++;
  }

  // 2. Standard KDP Front Matter (Title Page & Copyright/Instructions)
  if (!includeCover && includeFrontMatter !== false) {
    // Page 1: Title Page (Recto / Right page)
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
    firstPageAdded = true;
    currentPage = 1;

    // Page 2: Copyright & Rules Page (Verso / Left page)
    doc.addPage();
    currentPage = 2;
    drawKdpCopyrightAndInstructionsPage(doc, {
      authorName,
      puzzleType: "maze",
      width: widthInches,
      height: heightInches,
      totalPages: totalExpectedPages,
    });
  }

  // --------------------------------------------------
  // PAGES 3+: Interactive Puzzle Generation Loop
  // --------------------------------------------------
  mazes.forEach((maze, index) => {
    if (firstPageAdded) doc.addPage();
    firstPageAdded = true;
    currentPage++;

    // Alternating KDP Gutter Margins
    const margins = calculateKdpMargins(currentPage, totalExpectedPages, widthInches);
    const mazeSize = Math.min(targetSize, margins.contentW, safeH);
    const mazeX = margins.marginLeft + (margins.contentW - mazeSize) / 2;
    const mazeY = (heightInches - mazeSize) / 2 - 0.1;

    // Header Info (Framed to match maze width boundaries)
    const headerY = mazeY - 0.35;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`Maze #${index + 1}`, mazeX, headerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
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
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${currentPage}`, margins.contentCenterX, heightInches - 0.5, { align: "center" });
  });

  // --------------------------------------------------
  // SOLUTIONS SECTION (Compact 2x2 Grid Layout)
  // --------------------------------------------------
  if (includeSolutions && mazes.length > 0) {
    doc.addPage();
    currentPage++;

    const divMargins = calculateKdpMargins(currentPage, totalExpectedPages, widthInches);

    // Section Header Divider
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text("SOLUTIONS", divMargins.contentCenterX, heightInches / 2 - 0.3, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Complete Answer Keys for Mazes #1 to #${mazes.length}`, divMargins.contentCenterX, heightInches / 2 + 0.2, { align: "center" });

    let currentSolutionCount = 0;
    const solTopReserved = 1.0;
    const solBottomReserved = 0.7;
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
      const solSafeW = solMargins.contentW;

      const maxTileW = (solSafeW - gapX) / 2;
      const maxTileH = (solSafeH - gapY) / 2;
      const maxAllowedTileSize = trimSize === "5x8" ? 1.7 : trimSize === "6x9" ? 2.2 : 3.2;
      const solutionMazeSize = Math.min(maxTileW, maxTileH, maxAllowedTileSize);

      const totalGridW = solutionMazeSize * 2 + gapX;
      const totalGridH = solutionMazeSize * 2 + gapY;
      const solGridStartX = solMargins.marginLeft + (solSafeW - totalGridW) / 2;
      const solGridStartY = solTopReserved + (solSafeH - totalGridH) / 2;

      if (currentSolutionCount % 4 === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text("Answer Keys", solMargins.contentCenterX, 0.8, { align: "center" });
        if (showGuides) {
          drawMarginGuides(doc, solMargins.marginLeft, 0.75, solMargins.marginRight, 0.75, widthInches, heightInches);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${currentPage}`, solMargins.contentCenterX, heightInches - 0.4, { align: "center" });
      }

      // Compute row and column positions dynamically for the 2x2 grid
      const colIndex = currentSolutionCount % 2;
      const rowIndex = Math.floor((currentSolutionCount % 4) / 2);

      const x = solGridStartX + colIndex * (solutionMazeSize + gapX);
      const y = solGridStartY + rowIndex * (solutionMazeSize + gapY);

      // Label indicator over the micro-solution preview grid
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
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

  return doc;
}

export async function downloadMazePdf(options: PdfOptions, filename = "maze-book.pdf") {
  const doc = await generateMazePdf(options);
  doc.save(filename);
}