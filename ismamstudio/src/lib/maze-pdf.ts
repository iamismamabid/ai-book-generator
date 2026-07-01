import { jsPDF } from "jspdf";
import { MazeGrid, Shape, solveMaze } from "./maze";
import { drawCoverPagePart } from "../app/utils/pdfExportService";

interface PdfOptions {
  mazes: {
    grid: MazeGrid;
    start: [number, number];
    end: [number, number];
  }[];
  shape: Shape;
  title?: string;
  trimSize?: "6x9" | "8.5x11" | "5x8";
  includeSolutions?: boolean;
  includeCover?: boolean;
  coverState?: any;
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

  doc.setLineWidth(0.015); // Clear, crisp lines for printing
  doc.setDrawColor(30, 41, 59); // Slate-800 color tone for premium feel

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

  // 2. Draw Start (S) and End (E) Markers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cellSize * 25); // Scales dynamically with cell size
  doc.setTextColor(37, 99, 235); // Blue-600 for start

  const startX = xOffset + start[1] * cellSize + cellSize / 2;
  const startY = yOffset + start[0] * cellSize + cellSize / 1.35;
  doc.text("S", startX, startY, { align: "center" });

  doc.setTextColor(220, 38, 38); // Red-600 for end
  const endX = xOffset + end[1] * cellSize + cellSize / 2;
  const endY = yOffset + end[0] * cellSize + cellSize / 1.35;
  doc.text("E", endX, endY, { align: "center" });

  // 3. Draw Solution Path (if provided for the solutions section)
  if (solutionPath && solutionPath.length > 0) {
    doc.setDrawColor(245, 158, 11); // Amber-500 line
    doc.setLineWidth(0.025);
    
    // Setting up dotted/dashed line for standard KDP print layouts
    doc.setLineDashPattern([cellSize * 0.2, cellSize * 0.15], 0);

    for (let i = 0; i < solutionPath.length - 1; i++) {
      const current = solutionPath[i];
      const next = solutionPath[i + 1];

      const x1 = xOffset + current[1] * cellSize + cellSize / 2;
      const y1 = yOffset + current[0] * cellSize + cellSize / 2;
      const x2 = xOffset + next[1] * cellSize + cellSize / 2;
      const y2 = yOffset + next[0] * cellSize + cellSize / 2;

      doc.line(x1, y1, x2, y2);
    }
    doc.setLineDashPattern([], 0); // Reset dash pattern
  }
}

export async function generateMazePdf(options: PdfOptions): Promise<jsPDF> {
  const {
    mazes,
    shape,
    title = "Maze Puzzle Book",
    trimSize = "8.5x11",
    includeSolutions = true,
    includeCover = false,
    coverState = null,
  } = options;

  const [widthInches, heightInches] = TRIM_SIZES[trimSize] || TRIM_SIZES["8.5x11"];

  // Initialize jsPDF with inches context
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [widthInches, heightInches],
  });

  const margin = 0.75;
  const contentWidth = widthInches - margin * 2;
  const contentHeight = heightInches - margin * 2;

  // 1. Draw Front Cover if integrated
  let firstPageAdded = false;
  if (includeCover && coverState) {
    await drawCoverPagePart(doc, coverState, 'front', widthInches, heightInches);
    firstPageAdded = true;
  }

  // --------------------------------------------------
  // Welcome & Cover Title Page
  // --------------------------------------------------
  if (firstPageAdded) {
    doc.addPage();
  }
  firstPageAdded = true;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text(title, widthInches / 2, heightInches / 3, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Featuring Premium ${shape.charAt(0).toUpperCase() + shape.slice(1)} Shaped Mazes`,
    widthInches / 2,
    heightInches / 2.6,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.text(`Total Puzzles: ${mazes.length}`, widthInches / 2, heightInches / 2.2, {
    align: "center",
  });

  // --------------------------------------------------
  // PAGES 2+: Interactive Puzzle Generation Loop
  // --------------------------------------------------
  mazes.forEach((maze, index) => {
    doc.addPage();
    
    // Header Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(`Maze #${index + 1}`, margin, margin + 0.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Shape: ${shape}`, widthInches - margin, margin + 0.18, { align: "right" });

    // Center layout structure calculation
    const mazeSize = Math.min(contentWidth, contentHeight - 1.2);
    const mazeX = margin + (contentWidth - mazeSize) / 2;
    const mazeY = margin + 0.6 + (contentHeight - 1.2 - mazeSize) / 2;

    // Draw the clean template puzzle without solution
    drawMaze(doc, maze.grid, maze.start, maze.end, mazeX, mazeY, mazeSize);

    // Footer info
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${index + 2}`, widthInches / 2, heightInches - 0.4, { align: "center" });
  });

  // --------------------------------------------------
  // SOLUTIONS SECTION (Compact 2x2 Grid Layout)
  // --------------------------------------------------
  if (includeSolutions && mazes.length > 0) {
    doc.addPage();

    // Section Header Divider
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text("Solutions", widthInches / 2, heightInches / 2, { align: "center" });
    
    let currentSolutionCount = 0;
    const solutionMazeSize = (contentWidth - 0.5) / 2; // Split into 2 columns with spacing

    mazes.forEach((maze, index) => {
      // Every 4 solutions require a clean new page break
      if (currentSolutionCount % 4 === 0) {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text("Answer Keys", margin, margin + 0.2);
      }

      // Compute row and column positions dynamically for the 2x2 grid
      const colIndex = currentSolutionCount % 2;
      const rowIndex = Math.floor((currentSolutionCount % 4) / 2);

      const x = margin + colIndex * (solutionMazeSize + 0.5);
      const y = margin + 0.7 + rowIndex * (solutionMazeSize + 0.9);

      // Label indicator over the micro-solution preview grid
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(`Solution #${index + 1}`, x, y - 0.15);

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

  return doc;
}

export async function downloadMazePdf(options: PdfOptions, filename = "maze-book.pdf") {
  const doc = await generateMazePdf(options);
  doc.save(filename);
}