import type { Metadata } from "next";
import SudokuGeneratorPage from "./SudokuClient";

export const metadata: Metadata = {
  title: "Free KDP Sudoku Generator | Create Bestselling Puzzle Books",
  description: "Generate unique, single-solution Sudoku puzzles for Amazon KDP. Customize difficulty levels, download print-ready PDFs with solutions, and build activity books in seconds.",
  alternates: {
    canonical: "https://www.ismamstudio.me/sudoku",
  },
  openGraph: {
    title: "Free KDP Sudoku Generator | Create Bestsening Puzzle Books",
    description: "Generate unique, single-solution Sudoku puzzles for Amazon KDP. Customize difficulty levels, download print-ready PDFs with solutions, and build activity books in seconds.",
    url: "https://www.ismamstudio.me/sudoku",
    type: "website",
  }
};

export default function Page() {
  return <SudokuGeneratorPage />;
}
