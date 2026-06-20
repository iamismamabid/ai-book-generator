import { jsPDF } from "jspdf";

export const exportBookToPDF = (bookPages: any[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [8.5, 11] });

  bookPages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    
    // Page Title
    doc.setFontSize(18);
    doc.text(`${page.type.replace('_', ' ').toUpperCase()} - Page ${index + 1}`, 0.5, 0.5);

    // Render Logic based on type
    if (page.type === 'crossword' && page.config.gridData) {
      drawCrossword(doc, page.config.gridData);
    } else if (page.type === 'word_search' && page.config.gridData) {
      drawWordSearch(doc, page.config.gridData);
    }
  });

  doc.save("My_Puzzle_Book.pdf");
};

// Helper: Draw Crossword Grid
const drawCrossword = (doc: any, data: any) => {
  const cellSize = 0.35;
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((cell: string, c: number) => {
      const x = 1 + (c * cellSize);
      const y = 1.2 + (r * cellSize);
      if (cell !== '') {
        doc.rect(x, y, cellSize, cellSize);
        doc.setFontSize(10);
        doc.text(cell, x + 0.1, y + 0.25);
      }
    });
  });
};

// Helper: Draw Word Search Grid
const drawWordSearch = (doc: any, data: any) => {
  const cellSize = 0.3;
  data.grid.forEach((row: string[], r: number) => {
    row.forEach((cell: string, c: number) => {
      const x = 1.5 + (c * cellSize);
      const y = 1.2 + (r * cellSize);
      doc.setFontSize(10);
      doc.text(cell, x + 0.1, y + 0.2);
    });
  });
};