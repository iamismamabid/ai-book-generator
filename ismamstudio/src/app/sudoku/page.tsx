import type { Metadata } from "next";
import SudokuClient from "./SudokuClient";

export const metadata: Metadata = {
  title: "Free Sudoku Puzzle Generator for KDP Books | KDPage",
  description:
    "Generate print-ready Sudoku puzzle books for Amazon KDP in minutes. Pick difficulty and trim size, then export a compliant PDF with solution pages — free to try.",
  alternates: {
    canonical: "https://www.kdpage.com/sudoku",
  },
  openGraph: {
    title: "Free Sudoku Puzzle Generator for KDP Books | KDPage",
    description:
      "Create print-ready Sudoku puzzle book interiors for Amazon KDP — pick difficulty, trim size, and download a compliant PDF.",
    url: "https://www.kdpage.com/sudoku",
    type: "website",
  },
};

export default function SudokuPage() {
  return <SudokuClient />;
}
