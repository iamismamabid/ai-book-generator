import type { Metadata } from "next";
import KeywordResearchPage from "./KeywordResearchClient";

export const metadata: Metadata = {
  title: "Free Amazon KDP Keyword Research & Niche Hunter Tool | KDPage",
  description:
    "Find high-volume, low-competition keywords for Amazon KDP. Real-time Amazon search suggestion scraper, competitor BSR to monthly sales calculator, keyword competition analyzer, and niche profitability validator. 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/keyword-research",
  },
  keywords: [
    "kdp keyword research tool free",
    "amazon kdp keyword finder",
    "kdp niche hunter",
    "amazon bsr to sales calculator",
    "low competition kdp keywords",
    "kdp 7 backend keywords finder",
    "kindle keyword research tool",
    "kdp keyword generator"
  ],
  openGraph: {
    title: "Free Amazon KDP Keyword Research & Niche Hunter Tool | KDPage",
    description:
      "Find profitable, low-competition keywords and estimate Amazon book sales in real-time.",
    url: "https://www.kdpage.com/tools/keyword-research",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Keyword Research Tool" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP Keyword Research Tool",
    description: "Discover high-volume, low-competition search phrases for your Amazon KDP books.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does KDPage find low-competition Amazon KDP keywords?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool queries Amazon's real-time customer search suggestion API, uncovering long-tail buyer keywords that real shoppers are typing into the search bar, alongside competitor sales estimations from BSR.",
      },
    },
    {
      "@type": "Question",
      name: "How do I choose the best 7 backend keywords for KDP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Choose multi-word search phrases that have low competitor density (under 3,000 results on Amazon) and active buyer demand. Do not repeat words already in your title or subtitle.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <KeywordResearchPage />
    </>
  );
}
