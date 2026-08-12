// SVG Vector Exporter for KDPage Studio Puzzle Generators
// Generates clean, resolution-independent vector .svg XML markup for Canva & Illustrator

export interface SvgStyleOptions {
  borderThickness?: number; // 1 to 5
  fontSize?: number; // e.g. 16, 20, 24
  fontFamily?: string; // 'sans-serif' | 'serif' | 'monospace'
  headerText?: string;
  footerText?: string;
  pageNumber?: number;
}

/**
 * Converts a 9x9 Sudoku grid into a scalable SVG vector string
 */
export function exportSudokuToSvg(
  grid: number[][],
  options: SvgStyleOptions = {}
): string {
  const {
    borderThickness = 2,
    fontSize = 20,
    fontFamily = "sans-serif",
    headerText = "",
    footerText = "",
    pageNumber,
  } = options;

  const width = 500;
  const height = headerText || footerText ? 580 : 500;
  const gridOffsetY = headerText ? 50 : 0;
  const cellSize = 50;
  const gridWidth = 450;
  const gridOffsetX = (width - gridWidth) / 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `<style>
    .grid-cell { fill: #ffffff; stroke: #334155; stroke-width: 1px; }
    .grid-thick-border { fill: none; stroke: #0f172a; stroke-width: ${borderThickness * 1.5}px; }
    .grid-outer-border { fill: none; stroke: #0f172a; stroke-width: ${borderThickness * 2}px; }
    .puzzle-text { font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: central; }
    .header-text { font-family: ${fontFamily}; font-size: 18px; font-weight: font-bold; fill: #0f172a; text-anchor: middle; }
    .footer-text { font-family: ${fontFamily}; font-size: 12px; fill: #64748b; text-anchor: middle; }
  </style>\n`;

  // Background
  svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>\n`;

  // Header
  if (headerText) {
    svg += `<text x="${width / 2}" y="30" class="header-text">${escapeSvgXml(headerText)}</text>\n`;
  }

  // Draw 9x9 Grid Cells
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = gridOffsetX + c * cellSize;
      const y = gridOffsetY + r * cellSize;
      const val = grid[r]?.[c] || 0;

      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" class="grid-cell" />\n`;

      if (val > 0) {
        svg += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2}" class="puzzle-text">${val}</text>\n`;
      }
    }
  }

  // Draw 3x3 Thick Subgrid Lines
  for (let i = 0; i <= 9; i += 3) {
    const pos = i * cellSize;
    // Vertical 3x3 line
    svg += `<line x1="${gridOffsetX + pos}" y1="${gridOffsetY}" x2="${gridOffsetX + pos}" y2="${gridOffsetY + gridWidth}" class="grid-thick-border" />\n`;
    // Horizontal 3x3 line
    svg += `<line x1="${gridOffsetX}" y1="${gridOffsetY + pos}" x2="${gridOffsetX + gridWidth}" y2="${gridOffsetY + pos}" class="grid-thick-border" />\n`;
  }

  // Outer Border
  svg += `<rect x="${gridOffsetX}" y="${gridOffsetY}" width="${gridWidth}" height="${gridWidth}" class="grid-outer-border" />\n`;

  // Footer & Page Number
  if (footerText || pageNumber !== undefined) {
    const footerY = gridOffsetY + gridWidth + 35;
    const label = [footerText, pageNumber !== undefined ? `Page ${pageNumber}` : ""]
      .filter(Boolean)
      .join(" - ");
    svg += `<text x="${width / 2}" y="${footerY}" class="footer-text">${escapeSvgXml(label)}</text>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Converts a Word Search grid and word list into an SVG vector string
 */
export function exportWordSearchToSvg(
  grid: string[][],
  words: string[],
  options: SvgStyleOptions = {}
): string {
  const {
    borderThickness = 1,
    fontSize = 16,
    fontFamily = "sans-serif",
    headerText = "WORD SEARCH",
    footerText = "",
    pageNumber,
  } = options;

  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;
  const cellSize = 30;
  const gridW = numCols * cellSize;
  const gridH = numRows * cellSize;
  const width = Math.max(500, gridW + 60);
  const height = gridH + 180;
  const gridOffsetX = (width - gridW) / 2;
  const gridOffsetY = 60;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `<style>
    .grid-cell { fill: #ffffff; stroke: #cbd5e1; stroke-width: ${borderThickness}px; }
    .grid-outer-border { fill: none; stroke: #0f172a; stroke-width: ${borderThickness * 2}px; }
    .word-letter { font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: central; }
    .header-title { font-family: ${fontFamily}; font-size: 20px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
    .word-list-item { font-family: ${fontFamily}; font-size: 13px; font-weight: 500; fill: #334155; }
    .footer-text { font-family: ${fontFamily}; font-size: 12px; fill: #64748b; text-anchor: middle; }
  </style>\n`;

  // Background
  svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>\n`;

  // Header
  if (headerText) {
    svg += `<text x="${width / 2}" y="35" class="header-title">${escapeSvgXml(headerText)}</text>\n`;
  }

  // Draw Grid
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const x = gridOffsetX + c * cellSize;
      const y = gridOffsetY + r * cellSize;
      const char = grid[r][c] || "";

      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" class="grid-cell" />\n`;
      if (char) {
        svg += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2}" class="word-letter">${escapeSvgXml(char)}</text>\n`;
      }
    }
  }

  // Outer Border
  svg += `<rect x="${gridOffsetX}" y="${gridOffsetY}" width="${gridW}" height="${gridH}" class="grid-outer-border" />\n`;

  // Draw Word List below grid
  const wordsStartY = gridOffsetY + gridH + 40;
  const cols = 3;
  const colWidth = width / cols;

  words.forEach((word, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const x = 40 + colIdx * colWidth;
    const y = wordsStartY + rowIdx * 20;
    svg += `<text x="${x}" y="${y}" class="word-list-item">• ${escapeSvgXml(word)}</text>\n`;
  });

  // Footer & Page Number
  if (footerText || pageNumber !== undefined) {
    const footerY = height - 20;
    const label = [footerText, pageNumber !== undefined ? `Page ${pageNumber}` : ""]
      .filter(Boolean)
      .join(" - ");
    svg += `<text x="${width / 2}" y="${footerY}" class="footer-text">${escapeSvgXml(label)}</text>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Triggers browser download of an SVG string as a file
 */
export function downloadSvgFile(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeSvgXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
