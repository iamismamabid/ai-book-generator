import PrintCostCalculator from "./PrintCostCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Amazon KDP Print Cost & Minimum List Price Calculator (2026) | KDPage",
  description:
    "Calculate exact Amazon KDP printing costs, minimum retail list prices, and author royalties for paperbacks and hardcovers across US, UK, DE, FR, IT, ES, and CA marketplaces. 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/print-cost-calculator",
  },
  keywords: [
    "kdp print cost calculator",
    "amazon kdp printing cost calculator",
    "paperback printing cost calculator",
    "hardcover printing cost kdp",
    "kdp minimum list price calculator",
    "self publishing cost calculator",
    "kdp royalty printing formula",
    "amazon book printing cost 2026"
  ],
  openGraph: {
    title: "Free Amazon KDP Print Cost & Minimum List Price Calculator | KDPage",
    description:
      "Instant Amazon KDP printing cost estimates and author royalty calculations across all major global marketplaces.",
    url: "https://www.kdpage.com/tools/print-cost-calculator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Print Cost Calculator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP Print Cost Calculator (2026)",
    description: "Calculate KDP printing costs, minimum list prices, and author royalties instantly.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is Amazon KDP print cost calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KDP print cost consists of a Fixed Cost (e.g. $1.00 - $2.30 depending on trim size and marketplace) plus a Per-Page Cost (e.g. $0.012 per page for B&W white paper). Hardcovers include an additional binding fee.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate my author royalty on Amazon KDP paperback books?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Royalty = (List Price × 60% Royalty Rate) − Printing Cost. For example, on a $9.99 book with $2.40 print cost: ($9.99 × 0.60) − $2.40 = $3.59 author royalty per sale.",
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
      <PrintCostCalculator />
    </>
  );
}
