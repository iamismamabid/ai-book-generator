import FutoshikiGenerator from "@/components/tools/FutoshikiGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Futoshiki (More or Less) Studio | KDPage",
  description:
    "Generate professional Futoshiki (不等式 / More or Less / Unequal) Japanese logic puzzle books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/futoshiki",
  },
  openGraph: {
    title: "Futoshiki (More or Less) Studio | KDPage",
    description:
      "Generate professional Futoshiki Japanese logic puzzle books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
    url: "https://www.kdpage.com/studio/futoshiki",
    type: "website",
  },
};

export default function FutoshikiPage() {
  return (
    <div className="bg-[#090d16] min-h-screen">
      <h1 className="sr-only">Amazon KDP Futoshiki (More or Less) Puzzle Book Generator Studio</h1>
      <FutoshikiGenerator />
    </div>
  );
}
