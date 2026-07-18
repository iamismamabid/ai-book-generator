import ReadabilityCalculator from "./ReadabilityCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Readability Calculator — Flesch-Kincaid, Gunning Fog & SMOG | KDPage",
  description:
    "Check the readability of your book or description with Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG, Coleman-Liau, and ARI scores. Free and private — runs in your browser.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/readability-calculator",
  },
  keywords: [
    "readability calculator",
    "flesch kincaid calculator",
    "gunning fog index",
    "smog readability",
    "reading level checker",
    "book readability score",
  ],
  openGraph: {
    title: "Free Readability Calculator | KDPage",
    description:
      "Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, and ARI scores for any text — instantly and privately.",
    url: "https://www.kdpage.com/tools/readability-calculator",
    type: "website",
  },
};

export default function Page() {
  return <ReadabilityCalculator />;
}
