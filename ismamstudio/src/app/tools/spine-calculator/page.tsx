import SpineCalculator from "./SpineCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Amazon KDP Spine Width & Cover Size Calculator (2026) | KDPage",
  description:
    "Calculate your exact Amazon KDP book spine width, wrap-around cover dimensions, and 0.125\" bleed margins instantly. Official KDP formulas for White, Cream, and Color paper (Paperback & Hardcover). 100% free tool.",
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
    "free kdp tools 2026",
    "book cover template dimensions",
    "self publishing spine calculator",
    "kdp specifications calculator",
    "amazon kdp paperback cover size",
    "kdp wrap around cover generator",
    "amazon kdp spine thickness formula"
  ],
  openGraph: {
    title: "Free Amazon KDP Spine Width & Cover Size Calculator (2026) | KDPage",
    description:
      "Instantly calculate spine width & full wrap-around cover dimensions for Amazon KDP paperback and hardcover books. Uses official Amazon KDP formulas.",
    url: "https://www.kdpage.com/tools/spine-calculator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free KDP Spine Calculator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP Spine Width Calculator (2026)",
    description:
      "Calculate exact KDP spine width using official Amazon formulas. White: 0.002252\"/page, Cream: 0.0025\"/page, Color: 0.002347\"/page.",
    images: ["/og-image.png"],
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
      name: "What are the exact 8.5 x 11 KDP cover dimensions in inches and pixels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For an 8.5\" × 11\" KDP workbook with 100 pages on white paper, the spine is 0.225\". Total wrap cover width is 17.475\" (17.25\" + 0.225\" spine) and height is 11.25\" with 0.125\" bleed included. At 300 DPI print resolution, canvas dimensions are exactly 5243 × 3375 pixels.",
      },
    },
    {
      "@type": "Question",
      name: "What are the exact 6 x 9 KDP cover dimensions in inches and pixels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For a standard 6\" × 9\" KDP novel with 120 pages on white paper, the spine width is 0.270\". Total wrap cover width is 12.520\" and height is 9.25\" with 0.125\" bleed included. At 300 DPI print resolution, canvas dimensions are exactly 3756 × 2775 pixels.",
      },
    },
  ],
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Amazon KDP Spine Width & Cover Size Calculator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "KDPage",
    url: "https://www.kdpage.com",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <SpineCalculator />
    </>
  );
}
