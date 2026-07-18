import KeywordDensityAnalyzer from "./KeywordDensityAnalyzer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Keyword Density Analyzer — Book Descriptions & SEO | KDPage",
  description:
    "Analyze keyword density in your book descriptions and listing content. See top single keywords and two/three-word phrases, spot keyword stuffing, and optimize for Amazon SEO — free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/keyword-density",
  },
  keywords: [
    "keyword density analyzer",
    "keyword density checker",
    "book description seo",
    "amazon listing keywords",
    "kdp keyword optimization",
    "keyword stuffing checker",
  ],
  openGraph: {
    title: "Free Keyword Density Analyzer | KDPage",
    description:
      "Check keyword density and top phrases in your book descriptions — spot over-optimization instantly.",
    url: "https://www.kdpage.com/tools/keyword-density",
    type: "website",
  },
};

export default function Page() {
  return <KeywordDensityAnalyzer />;
}
