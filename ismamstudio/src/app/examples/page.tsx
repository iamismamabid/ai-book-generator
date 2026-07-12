import type { Metadata } from "next";
import ExamplesPage from "./ExamplesClient";

export const metadata: Metadata = {
  title: "KDP Book Examples & Previews | Ismam Studio Gallery",
  description: "Browse high-quality interior and cover design examples generated with Ismam Studio. See sample PDFs for Sudoku, Mazes, and Word Search books.",
  alternates: {
    canonical: "https://www.ismamstudio.me/examples",
  },
  openGraph: {
    title: "KDP Book Examples & Previews | Ismam Studio Gallery",
    description: "Browse high-quality interior and cover design examples generated with Ismam Studio. See sample PDFs for Sudoku, Mazes, and Word Search books.",
    url: "https://www.ismamstudio.me/examples",
    type: "website",
  }
};

export default function Page() {
  return <ExamplesPage />;
}
