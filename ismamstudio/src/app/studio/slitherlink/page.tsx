import type { Metadata } from "next";
import SlitherlinkGenerator from "@/components/tools/SlitherlinkGenerator";

export const metadata: Metadata = {
  title: "Slitherlink Studio — Free KDP Loop the Loop & Fences Puzzle Book Generator | KDPage",
  description:
    "Generate custom Japanese Slitherlink (Loop the Loop / Fences / Takegaki) logic puzzles. 5x5 to 10x10 grids, verified single closed loops, instant 300 DPI vector PDF export with KDP trim sizes.",
  keywords: [
    "slitherlink generator",
    "slitherlink puzzle book",
    "loop the loop puzzle",
    "fences puzzle",
    "takegaki puzzle",
    "japanese logic puzzle",
    "kdp puzzle generator",
    "amazon kdp interior",
    "vector puzzle pdf",
  ],
  alternates: {
    canonical: "https://www.kdpage.com/studio/slitherlink",
  },
  openGraph: {
    title: "Slitherlink Studio — Free KDP Loop the Loop Puzzle Book Generator | KDPage",
    description:
      "Generate custom Japanese Slitherlink logic puzzles. Single closed loop verification, 300 DPI vector PDF export with solution answer keys.",
    url: "https://www.kdpage.com/studio/slitherlink",
    type: "website",
  },
};

export default function SlitherlinkPage() {
  return <SlitherlinkGenerator />;
}
