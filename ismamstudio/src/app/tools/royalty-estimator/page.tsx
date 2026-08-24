import type { Metadata } from "next";
import RoyaltyEstimatorPage from "./RoyaltyEstimatorClient";

export const metadata: Metadata = {
  title: "Free Amazon KDP Royalty Calculator (2026) — Calculate Book Profits & Printing Costs | KDPage",
  description:
    "Calculate your exact Amazon KDP paperback, hardcover, and Kindle royalties. Factoring in Amazon 60%/40% royalty splits, page print costs ($0.85 + $0.012/page), expanded distribution, and Amazon PPC ad budgets. 100% Free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/royalty-estimator",
  },
  keywords: [
    "kdp royalty calculator",
    "free kdp royalty calculator",
    "amazon kdp royalty calculator 2026",
    "kdp printing cost calculator",
    "amazon book profit calculator",
    "kdp earnings calculator",
    "paperback royalty calculator kdp",
    "hardcover royalty calculator amazon",
    "kdp expanded distribution calculator",
    "kindle unlimited kenp royalty calculator",
    "kdp ppc ad profit calculator",
    "self publishing profit margin calculator"
  ],
  openGraph: {
    title: "Free Amazon KDP Royalty Calculator (2026) — Calculate Book Profits & Printing Costs | KDPage",
    description:
      "Calculate your exact Amazon KDP book royalties, printing costs, and net advertising profit margins with official Amazon KDP formulas.",
    url: "https://www.kdpage.com/tools/royalty-estimator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free Amazon KDP Royalty Calculator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP Royalty Calculator (2026)",
    description: "Calculate your exact paperback & hardcover KDP royalties, printing costs, and advertising margins.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does Amazon calculate KDP paperback royalties?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon KDP pays a 60% royalty rate on paperback sales in standard distribution (or 40% on Expanded Distribution). The formula is: Royalty = (List Price × 60%) - Printing Costs. Printing costs consist of a fixed charge ($0.85 for regular paperback) plus a per-page cost ($0.012 per black & white page or $0.07 per color page).",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Amazon Standard vs Expanded Distribution royalties?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Standard Distribution applies to sales directly on Amazon.com and pays 60% royalty minus printing costs. Expanded Distribution allows bookstores, libraries, and universities to order your book and pays a 40% royalty rate minus printing costs.",
      },
    },
    {
      "@type": "Question",
      name: "How does Kindle Unlimited (KU) KENP payouts work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kindle Unlimited authors are paid from the KDP Select Global Fund for each Kindle Edition Normalized Page (KENP) read by subscribers. The average payout is roughly $0.0040 to $0.0050 per page read.",
      },
    },
    {
      "@type": "Question",
      name: "How do Amazon Ads (PPC) affect net KDP book profits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Net profit per sale equals your gross royalty minus your advertising cost per order (ACOS). If your cost-per-click (CPC) is $0.35 and your conversion rate is 10%, you spend $3.50 in ads to make 1 sale. If your book royalty is $5.00, your net take-home profit is $1.50 per book.",
      },
    },
  ],
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Amazon KDP Royalty & Book Profit Calculator",
  applicationCategory: "BusinessApplication",
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
      <RoyaltyEstimatorPage />
    </>
  );
}

