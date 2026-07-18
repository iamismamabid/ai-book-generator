import BookPlanner from "./BookPlanner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Book Planner — Chapters, Characters & Progress Tracker | KDPage",
  description:
    "Plan your book with chapter outlines, character sheets, and word-count progress tracking. Includes novel, non-fiction, and picture book templates. Autosaves in your browser — free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/book-planner",
  },
  keywords: [
    "book planner online free",
    "novel outline template",
    "chapter planner",
    "character sheet tool",
    "writing progress tracker",
    "book outline generator",
  ],
  openGraph: {
    title: "Free Book Planner | KDPage",
    description:
      "Outline chapters, track characters, and monitor writing progress — with templates for novels, non-fiction, and picture books.",
    url: "https://www.kdpage.com/tools/book-planner",
    type: "website",
  },
};

export default function Page() {
  return <BookPlanner />;
}
