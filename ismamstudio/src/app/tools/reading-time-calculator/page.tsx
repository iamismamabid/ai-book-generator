import ReadingTimeCalculator from "./ReadingTimeCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Reading Time Calculator — Book & Audiobook Length | KDPage",
  description:
    "Calculate how long it takes to read your book based on word count and reading speed. Includes audiobook narration length and printed page estimates. 100% free, no signup.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/reading-time-calculator",
  },
  keywords: [
    "reading time calculator",
    "book reading time estimator",
    "audiobook length calculator",
    "words per minute reading",
    "word count to pages",
    "how long to read a book",
  ],
  openGraph: {
    title: "Free Reading Time Calculator | KDPage",
    description:
      "Estimate reading time, audiobook length, and page count for any manuscript from its word count.",
    url: "https://www.kdpage.com/tools/reading-time-calculator",
    type: "website",
  },
};

export default function Page() {
  return <ReadingTimeCalculator />;
}
