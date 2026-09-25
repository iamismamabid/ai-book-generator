import type { Metadata } from "next";
import NurikabeGenerator from "@/components/tools/NurikabeGenerator";

export const metadata: Metadata = {
  title: "Nurikabe Studio — Free KDP Islands in the Stream Puzzle Book Generator | KDPage",
  description:
    "Generate custom Japanese Nurikabe (Islands in the Stream / Cell Structure) logic puzzles. 5x5 to 10x10 grids, verified island boundaries, 2x2 pool prevention, instant 300 DPI vector PDF export with KDP trim sizes.",
  keywords: [
    "nurikabe generator",
    "nurikabe puzzle book",
    "islands in the stream puzzle",
    "cell structure puzzle",
    "japanese logic puzzle",
    "kdp puzzle generator",
    "amazon kdp interior",
    "vector puzzle pdf",
  ],
  alternates: {
    canonical: "https://www.kdpage.com/studio/nurikabe",
  },
  openGraph: {
    title: "Nurikabe Studio — Free KDP Islands in the Stream Puzzle Book Generator | KDPage",
    description:
      "Generate custom Japanese Nurikabe logic puzzles. Single connected sea verification, 300 DPI vector PDF export with solution answer keys.",
    url: "https://www.kdpage.com/studio/nurikabe",
    type: "website",
  },
};

export default function NurikabePage() {
  return <NurikabeGenerator />;
}
