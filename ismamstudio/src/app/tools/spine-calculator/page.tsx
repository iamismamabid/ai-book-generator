import SpineCalculator from "./SpineCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Spine Width Calculator (2025) — Paperback & Hardcover Cover Size | KDPage",
  description:
    "Calculate your Amazon KDP book spine width, full cover size & bleed dimensions instantly. Uses official KDP formulas: 0.002252\" white, 0.0025\" cream, 0.002347\" color paper. Free — no signup.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/spine-calculator",
  },
  keywords: [
    "kdp spine calculator",
    "free kdp spine calculator",
    "kdp spine width calculator",
    "amazon kdp cover size calculator",
    "book spine width calculator",
    "kdp cover dimensions",
    "paperback spine calculator",
    "hardcover spine calculator",
    "kdp bleed calculator",
    "free kdp tools 2025",
    "book cover template dimensions",
    "self publishing spine calculator",
    "kdp specifications calculator",
    "amazon kdp paperback cover size",
  ],
  openGraph: {
    title: "Free KDP Spine Width Calculator (2025) | KDPage",
    description:
      "Instantly calculate spine width & full cover dimensions for Amazon KDP paperback and hardcover books. Uses official KDP paper thickness formulas.",
    url: "https://www.kdpage.com/tools/spine-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Spine Width Calculator (2025)",
    description:
      "Calculate exact KDP spine width using official Amazon formulas. White: 0.002252\"/page, Cream: 0.0025\"/page, Color: 0.002347\"/page.",
  },
};

// JSON-LD FAQ Schema for Google Rich Results
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I calculate KDP spine width?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Multiply your page count by the paper thickness multiplier: White paper = 0.002252 inches per page, Cream paper = 0.0025 inches per page, Color paper = 0.002347 inches per page. For example, a 300-page white paper book has a spine of 300 × 0.002252 = 0.6756 inches.",
      },
    },
    {
      "@type": "Question",
      name: "What is the KDP full cover width formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Full Cover Width = (Trim Width × 2) + Spine Width + 0.25 inches. The 0.25 inches accounts for 0.125 inch bleed on each side. Full Cover Height = Trim Height + 0.25 inches.",
      },
    },
    {
      "@type": "Question",
      name: "Can I put text on my KDP book spine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon KDP requires a minimum of 79 pages before spine text is allowed. Books under 79 pages have spines too thin (under ~0.17 inches) to reliably print text without it spilling onto the front or back cover.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between white, cream, and color paper for KDP spine calculation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each paper type has a different physical thickness per page: White paper (B&W) = 0.002252 in/page, Cream paper (B&W) = 0.0025 in/page (thicker), Color paper = 0.002347 in/page. Using the wrong type will produce an incorrectly sized cover file.",
      },
    },
    {
      "@type": "Question",
      name: "What bleed margin does KDP require for book covers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon KDP requires 0.125 inches (3.175 mm) of bleed on all outer edges. This adds 0.25 inches to cover width (left + right) and 0.25 inches to cover height (top + bottom).",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum and maximum page count for KDP paperback?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KDP paperback requires a minimum of 24 pages. Maximum is 828 pages for white paper (B&W), 776 for cream paper, and 828 for color paper.",
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
      <SpineCalculator />
    </>
  );
}
