import EbookRoyaltyCalculator from "./EbookRoyaltyCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Amazon Kindle eBook Royalty Calculator (2026) — 35% vs 70% Plans | KDPage",
  description:
    "Calculate your exact Kindle eBook royalties, delivery file size fees ($0.15/MB), and pricing band eligibility ($2.99 to $9.99) across US, UK, DE, CA, and global Amazon marketplaces. 100% Free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/ebook-royalty-calculator",
  },
  keywords: [
    "kindle royalty calculator",
    "free kindle ebook royalty calculator",
    "kdp 70 percent royalty calculator",
    "kdp 35 percent vs 70 percent",
    "kindle delivery fee calculator",
    "amazon ebook pricing calculator 2026",
    "kdp ebook royalties",
    "how much does amazon pay per kindle book",
    "kindle direct publishing profit calculator"
  ],
  openGraph: {
    title: "Free Amazon Kindle eBook Royalty Calculator (2026) — 35% vs 70% Plans | KDPage",
    description:
      "Compare 35% vs 70% Kindle royalty plans with delivery fees factored in across all Amazon marketplaces.",
    url: "https://www.kdpage.com/tools/ebook-royalty-calculator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free Kindle eBook Royalty Calculator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Kindle eBook Royalty Calculator (2026)",
    description: "Compare 35% vs 70% Kindle royalty options with delivery fees calculated instantly.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the requirement for Amazon's 70% Kindle royalty plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To qualify for the 70% royalty plan, your eBook must be priced between $2.99 and $9.99 USD in the United States (or local equivalent in UK, DE, CA, etc.). Amazon also deducts a small digital delivery fee based on file size ($0.15 per megabyte in the US).",
      },
    },
    {
      "@type": "Question",
      name: "When should I choose the 35% Kindle royalty option?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 35% royalty plan is required for eBooks priced below $2.99 (such as $0.99 promo titles) or above $9.99. On the 35% plan, Amazon does NOT charge any digital delivery fees, which can be advantageous for image-heavy eBooks with large MB file sizes.",
      },
    },
    {
      "@type": "Question",
      name: "How are Kindle delivery fees calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Under the 70% royalty option, Amazon charges a delivery fee of $0.15 per MB in the US, £0.10/MB in the UK, and €0.12/MB in Europe. A 3 MB eBook in the US incurs a $0.45 delivery deduction per sale.",
      },
    },
  ],
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Amazon Kindle eBook Royalty Calculator",
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
      <EbookRoyaltyCalculator />
    </>
  );
}

