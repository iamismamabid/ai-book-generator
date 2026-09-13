import KdpPuzzleGeneratorClient from "./KdpPuzzleGeneratorClient";
import type { Metadata } from "next";

const SITE_URL = "https://www.kdpage.com";

export const metadata: Metadata = {
  title: "KDP Puzzle Generator (Free 2026) — Word Search, Sudoku & Mazes | KDPage",
  description:
    "The #1 free online KDP puzzle generator for Amazon self-publishers. Create mathematically verified Word Searches, Sudokus, Mazes & Cryptograms with automated solutions. Export 300 DPI vector PDFs.",
  keywords: [
    "kdp puzzle generator",
    "amazon kdp puzzle generator",
    "free kdp puzzle generator",
    "kdp puzzle book generator",
    "kdp puzzle maker",
    "word search generator for kdp",
    "sudoku generator kdp",
    "maze generator kdp",
    "kdp activity book generator",
    "book bolt alternative puzzle generator",
    "free puzzle maker for amazon kdp",
    "puzzle book creator software",
    "kdp puzzle generator free online 2026"
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kdp-puzzle-generator`,
  },
  openGraph: {
    title: "KDP Puzzle Generator (Free 2026) — Word Search, Sudoku & Mazes | KDPage",
    description:
      "Algorithmic puzzle generation for Amazon KDP publishers. Mathematically unique Word Searches, Sudokus, and Mazes with automated answer keys.",
    url: `${SITE_URL}/tools/kdp-puzzle-generator`,
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Puzzle Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDP Puzzle Generator (Free 2026) | KDPage",
    description:
      "Generate print-ready Word Searches, Sudokus, and Mazes for Amazon KDP in seconds. 100% free with automated solution keys.",
    images: ["/og-image.png"],
  },
};

export default function KdpPuzzleGeneratorPage() {
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KDP Puzzle Generator",
    "operatingSystem": "All modern browsers (Windows, macOS, Linux, ChromeOS)",
    "applicationCategory": "DesignApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "210",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Algorithmic KDP puzzle generator for creating mathematically verified Word Searches, Sudokus, Mazes, Cryptograms, and complete 300 DPI interior book PDFs with automated solution keys.",
    "url": `${SITE_URL}/tools/kdp-puzzle-generator`,
    "author": {
      "@type": "Organization",
      "name": "KDPage",
      "url": SITE_URL
    }
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an Amazon KDP Puzzle Generator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An Amazon KDP puzzle generator is an algorithmic software tool that creates mathematically unique, print-ready puzzle interiors (Word Searches, Sudokus, Mazes, Cryptograms, and Crosswords) formatted to Amazon's exact trim sizes (8.5x11 or 6x9) with automated solution keys appended at the back."
        }
      },
      {
        "@type": "Question",
        "name": "Are these puzzles guaranteed to have single, valid solutions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. KDPage uses algorithmic backtracking solvers to ensure that every generated puzzle (especially Sudokus and Word Searches) has exactly one unique, mathematically valid solution to prevent customer complaints."
        }
      },
      {
        "@type": "Question",
        "name": "Do I own 100% commercial rights to publish and sell these puzzles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All puzzles generated through KDPage come with full commercial rights. You can bundle them into low-content or medium-content activity books, publish them on Amazon KDP, sell digital printables on Etsy, or distribute through IngramSpark while keeping 100% of your royalties."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best trim size for a KDP puzzle book?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The standard industry size for KDP puzzle and activity books is 8.5x11 inches (215.9 x 279.4 mm). It provides comfortable spacing for large-print letter grids and writing margins."
        }
      },
      {
        "@type": "Question",
        "name": "How do I format solution keys for Amazon KDP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon KDP buyers expect answer keys at the very end of the book. KDPage automatically compiles solution grids (typically 4 or 6 solutions per page) and links them to the exact puzzle page numbers."
        }
      }
    ]
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Generate a KDP Puzzle Book in 3 Steps",
    "description": "Create a print-ready Amazon KDP puzzle book with solutions using an algorithmic generator.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Puzzle Type & Custom Theme",
        "text": "Choose Word Search, Sudoku, Maze, or Cryptogram, and input your theme words or difficulty level.",
        "url": `${SITE_URL}/tools/kdp-puzzle-generator#step1`
      },
      {
        "@type": "HowToStep",
        "name": "Algorithmic Generation & Verification",
        "text": "The generator mathematically arranges the puzzle and compiles the corresponding solution key.",
        "url": `${SITE_URL}/tools/kdp-puzzle-generator#step2`
      },
      {
        "@type": "HowToStep",
        "name": "Export 300 DPI Vector PDF",
        "text": "Download the vector SVG puzzle or compile a complete 100-page book in KDPage Studio for direct Amazon KDP upload.",
        "url": `${SITE_URL}/tools/kdp-puzzle-generator#step3`
      }
    ]
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Free KDP Tools",
        "item": `${SITE_URL}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "KDP Puzzle Generator",
        "item": `${SITE_URL}/tools/kdp-puzzle-generator`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <KdpPuzzleGeneratorClient />
    </>
  );
}
