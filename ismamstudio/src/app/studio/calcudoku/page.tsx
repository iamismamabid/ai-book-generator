import CalcudokuGenerator from "@/components/tools/CalcudokuGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcudoku (KenKen) Studio | KDPage",
  description:
    "Generate professional Calcudoku (KenKen / Mathdoku) math logic puzzle books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/calcudoku",
  },
  openGraph: {
    title: "Calcudoku (KenKen) Studio | KDPage",
    description:
      "Generate professional Calcudoku math logic puzzle books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
    url: "https://www.kdpage.com/studio/calcudoku",
    type: "website",
  },
};

export default function CalcudokuPage() {
  return (
    <div className="bg-[#090d16] min-h-screen">
      <h1 className="sr-only">Amazon KDP Calcudoku (KenKen) Puzzle Book Generator Studio</h1>
      <CalcudokuGenerator />
    </div>
  );
}
