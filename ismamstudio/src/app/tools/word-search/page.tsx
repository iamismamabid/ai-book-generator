import type { Metadata } from "next";
import WordSearchStudio from "./WordSearchClient";

export const metadata: Metadata = {
  title: "Free KDP Word Search Generator | Create Themed Puzzle Books",
  description: "Create highly customizable themed word search puzzles. Set grid dimensions, compile word lists, layout clue boxes, and download KDP-ready PDFs.",
  alternates: {
    canonical: "https://www.ismamstudio.me/tools/word-search",
  },
  openGraph: {
    title: "Free KDP Word Search Generator | Create Themed Puzzle Books",
    description: "Create highly customizable themed word search puzzles. Set grid dimensions, compile word lists, layout clue boxes, and download KDP-ready PDFs.",
    url: "https://www.ismamstudio.me/tools/word-search",
    type: "website",
  }
};

export default function Page() {
  return <WordSearchStudio />;
}
