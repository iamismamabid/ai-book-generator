import type { Metadata } from "next";
import KeywordResearchPage from "./KeywordResearchClient";

export const metadata: Metadata = {
  title: "KDP Keyword Research & Niche Hunter Tool | KDPage",
  description: "Find high-volume, low-competition keywords for Amazon KDP. Calculate book BSR to estimated monthly sales, search volumes, and validate niches.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/keyword-research",
  },
  openGraph: {
    title: "KDP Keyword Research & Niche Hunter Tool | KDPage",
    description: "Find high-volume, low-competition keywords for Amazon KDP. Calculate book BSR to estimated monthly sales, search volumes, and validate niches.",
    url: "https://www.kdpage.com/tools/keyword-research",
    type: "website",
  }
};

export default function Page() {
  return <KeywordResearchPage />;
}
