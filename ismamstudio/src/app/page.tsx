import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "KDPage | KDP Book Creator: Puzzle Interiors, Covers & Free Tools",
  description:
    "Create print-ready Amazon KDP books in minutes — Sudoku, mazes, word searches, crosswords, full manuscripts, and covers. Free KDP tools included: spine calculator, ISBN barcode generator, and keyword research.",
  alternates: {
    canonical: "https://www.kdpage.com",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
