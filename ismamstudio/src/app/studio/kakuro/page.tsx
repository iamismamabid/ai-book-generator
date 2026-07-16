import KakuroGenerator from "@/components/tools/KakuroGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Kakuro Puzzle Generator | Create Bestselling Puzzle Books",
  description: "Generate unique, single-solution crossword-style Kakuro puzzles. Customize size from 4x4 to 9x17, difficulty levels, and export print-ready PDFs for Amazon KDP.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/kakuro",
  },
  openGraph: {
    title: "Free KDP Kakuro Puzzle Generator | Create Bestselling Puzzle Books",
    description: "Generate unique, single-solution crossword-style Kakuro puzzles. Customize size from 4x4 to 9x17, difficulty levels, and export print-ready PDFs for Amazon KDP.",
    url: "https://www.kdpage.com/studio/kakuro",
    type: "website",
  }
};

export default function KakuroPage() {
  return (
    <div className="bg-[#0b0f19]">
      <KakuroGenerator />
    </div>
  );
}
