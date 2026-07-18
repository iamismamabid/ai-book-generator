import GrammarChecker from "./GrammarChecker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Grammar & Style Checker for Authors | KDPage",
  description:
    "Check your book descriptions and chapters for repeated words, passive voice, filler words, clichés, long sentences, and readability issues. Free, private, in-browser checker.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/grammar-checker",
  },
  keywords: [
    "free grammar checker",
    "style checker for writers",
    "passive voice checker",
    "book description checker",
    "writing clarity tool",
    "filler word checker",
  ],
  openGraph: {
    title: "Free Grammar & Style Checker | KDPage",
    description:
      "Catch repeated words, passive voice, fillers, and clichés in your writing — instantly and privately.",
    url: "https://www.kdpage.com/tools/grammar-checker",
    type: "website",
  },
};

export default function Page() {
  return <GrammarChecker />;
}
