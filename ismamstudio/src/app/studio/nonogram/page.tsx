import NonogramGenerator from "@/components/tools/NonogramGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nonogram (Picross) Studio | KDPage",
  description:
    "Generate professional Japanese Nonogram (Picross / Hanjie / Griddlers) logic puzzle books with print-ready 300 DPI interiors for Amazon KDP.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/nonogram",
  },
  openGraph: {
    title: "Nonogram (Picross) Studio | KDPage",
    description:
      "Generate professional Japanese Nonogram logic puzzle books with print-ready 300 DPI interiors for Amazon KDP.",
    url: "https://www.kdpage.com/studio/nonogram",
    type: "website",
  },
};

export default function NonogramPage() {
  return (
    <div className="bg-[#090d16] min-h-screen">
      <h1 className="sr-only">Amazon KDP Nonogram (Picross) Puzzle Book Generator Studio</h1>
      <NonogramGenerator />
    </div>
  );
}
