import KakuroGenerator from "@/components/tools/KakuroGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Kakuro Puzzle Generator (2026) — Print-Ready Vector PDFs | KDPage",
  description:
    "Generate unique, single-solution crossword-style Kakuro (Cross Sums) puzzle books for Amazon KDP. Custom grid dimensions (4x4 to 9x17), progressive difficulty levels, and 300 DPI vector PDF exports with solutions.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/kakuro",
  },
  keywords: [
    "kdp kakuro generator",
    "free kdp kakuro puzzle generator",
    "cross sums puzzle maker",
    "kakuro book generator for amazon kdp",
    "kdp puzzle generator 2026",
    "print ready kakuro pdf",
    "amazon kdp low content book tools",
    "kakuro with solutions"
  ],
  openGraph: {
    title: "Free KDP Kakuro Puzzle Generator (2026) — Print-Ready Vector PDFs | KDPage",
    description:
      "Generate unique, single-solution crossword-style Kakuro puzzles with solutions. 100% compliant for Amazon KDP paperback interiors.",
    url: "https://www.kdpage.com/studio/kakuro",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free KDP Kakuro Puzzle Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Kakuro Puzzle Generator (2026)",
    description: "Generate single-solution Kakuro puzzle interiors with solutions for Amazon KDP.",
    images: ["/og-image.png"],
  },
};

const kakuroFaqSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "KDPage KDP Kakuro Puzzle Generator",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Automated algorithmic Kakuro (Cross Sums) puzzle generator producing print-ready vector interiors for Amazon KDP publishers.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does this Kakuro generator guarantee a single unique solution per puzzle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. KDPage uses a deterministic backtracking algorithm to synthesize and solve each Kakuro grid, mathematically verifying that there is exactly one valid solution before compiling it.",
          },
        },
        {
          "@type": "Question",
          name: "Can I export 300 DPI vector PDFs for Amazon KDP printing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All puzzle interiors and compiled solution keys export in pure vector PDF format at 300 DPI, ensuring crisp lines and zero Amazon KDP print quality rejections.",
          },
        },
        {
          "@type": "Question",
          name: "Can I sell the generated Kakuro books commercially on Amazon KDP?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All books, interiors, and puzzle grids created with KDPage include full commercial publishing rights for Amazon KDP, Etsy, and IngramSpark.",
          },
        },
      ],
    },
  ],
};

export default function KakuroPage() {
  return (
    <div className="bg-[#0b0f19]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kakuroFaqSchema) }}
      />
      <KakuroGenerator />
    </div>
  );
}

