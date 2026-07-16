import type { Metadata } from "next";
import ExamplesPage from "./ExamplesClient";

export const metadata: Metadata = {
  title: "KDP Book Examples & Previews | KDPage Gallery",
  description: "Browse high-quality interior and cover design examples generated with KDPage. See sample PDFs for Sudoku, Mazes, and Word Search books.",
  alternates: {
    canonical: "https://www.kdpage.com/examples",
  },
  openGraph: {
    title: "KDP Book Examples & Previews | KDPage Gallery",
    description: "Browse high-quality interior and cover design examples generated with KDPage. See sample PDFs for Sudoku, Mazes, and Word Search books.",
    url: "https://www.kdpage.com/examples",
    type: "website",
  }
};

export default function Page() {
  return <ExamplesPage />;
}
