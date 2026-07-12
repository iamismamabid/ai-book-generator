import type { Metadata } from "next";
import KeywordResearchPage from "./KeywordResearchClient";

export const metadata: Metadata = {
  title: "KDP Keyword Research & Niche Hunter Tool | Ismam Studio",
  description: "Find high-volume, low-competition keywords for Amazon KDP. Calculate book BSR to estimated monthly sales, search volumes, and validate niches.",
  openGraph: {
    title: "KDP Keyword Research & Niche Hunter Tool | Ismam Studio",
    description: "Find high-volume, low-competition keywords for Amazon KDP. Calculate book BSR to estimated monthly sales, search volumes, and validate niches.",
    url: "https://www.ismamstudio.me/tools/keyword-research",
    type: "website",
  }
};

export default function Page() {
  return <KeywordResearchPage />;
}
