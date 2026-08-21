import type { Metadata } from "next";
import WordSearchStudio from "./WordSearchClient";

export const metadata: Metadata = {
  title: "Free KDP Word Search Generator — Create Themed Puzzle Books (300 DPI) | KDPage",
  description:
    "Generate print-ready, themed word search puzzle books for Amazon KDP with solution keys. Custom grid dimensions, multi-directional word placement (horizontal, vertical, diagonal, reverse), CSV word list upload, and 300 DPI vector PDF exports.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/word-search",
  },
  keywords: [
    "kdp word search generator",
    "free word search maker for kdp",
    "word search puzzle book creator",
    "word search generator with answers",
    "amazon kdp puzzle book maker",
    "large print word search generator",
    "word search csv import",
    "print ready word search pdf"
  ],
  openGraph: {
    title: "Free KDP Word Search Generator — Create Themed Puzzle Books | KDPage",
    description:
      "Generate custom word search puzzle books with solution keys for Amazon KDP in 300 DPI vector PDF format.",
    url: "https://www.kdpage.com/tools/word-search",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Word Search Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Word Search Generator with Solution Keys",
    description: "Generate customized word search puzzle books for Amazon KDP — 100% free with vector PDF export.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does the word search generator automatically create solution answer keys?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every puzzle generated produces a corresponding solution key showing exact word locations and coordinate highlights, formatted for the back section of your KDP book.",
      },
    },
    {
      "@type": "Question",
      name: "Can I upload my own themed word list via CSV or TXT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can paste custom words or upload bulk CSV/text files. The engine automatically places words horizontally, vertically, diagonally, and in reverse according to your chosen difficulty level.",
      },
    },
    {
      "@type": "Question",
      name: "Can I create Large Print word search books for seniors on KDP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can adjust grid cell sizes, font sizing, and row spacing to meet Amazon's Large Print guidelines (16pt+ font size).",
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
      <WordSearchStudio />
    </>
  );
}
