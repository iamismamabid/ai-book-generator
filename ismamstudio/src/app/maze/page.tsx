import type { Metadata } from "next";
import MazeGeneratorPage from "./MazeClient";

export const metadata: Metadata = {
  title: "Free KDP Maze Generator | Design Shape-Masked Labyrinths",
  description: "Generate stunning custom shape-masked mazes for children and adults. Fully compliant with Amazon KDP print margin specifications. Download vector PDFs.",
  alternates: {
    canonical: "https://www.kdpage.com/maze",
  },
  openGraph: {
    title: "Free KDP Maze Generator | Design Shape-Masked Labyrinths",
    description: "Generate stunning custom shape-masked mazes for children and adults. Fully compliant with Amazon KDP print margin specifications. Download vector PDFs.",
    url: "https://www.kdpage.com/maze",
    type: "website",
  }
};

export default function Page() {
  return <MazeGeneratorPage />;
}
