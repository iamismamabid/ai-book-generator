import IsbnGenerator from "./IsbnGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ISBN Barcode Generator for Amazon KDP Book Covers (300 DPI) | KDPage",
  description:
    "Create print-ready ISBN-13 barcodes with EAN-5 price extension supplements for your Amazon KDP paperback or hardcover back cover. 300 DPI PNG & SVG vector download, automated check digit validation. 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/isbn-generator",
  },
  keywords: [
    "isbn barcode generator",
    "free isbn generator for kdp",
    "book cover barcode generator",
    "ean-13 barcode creator",
    "kdp barcode tool",
    "300 dpi barcode generator",
    "ean-5 price code barcode",
    "kdp isbn generator free",
    "amazon kdp back cover barcode"
  ],
  openGraph: {
    title: "Free ISBN Barcode Generator for Amazon KDP Book Covers | KDPage",
    description:
      "Generate high-resolution print-ready EAN-13 ISBN barcodes with EAN-5 price supplements for KDP covers.",
    url: "https://www.kdpage.com/tools/isbn-generator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free ISBN Barcode Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ISBN Barcode Generator for Amazon KDP",
    description: "Generate 300 DPI EAN-13 ISBN barcodes with check digit validation for book covers.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where should I place the ISBN barcode on my Amazon KDP book cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The ISBN barcode must be placed in the lower-right corner of your back cover. It should be positioned at least 0.25 inches (6.35 mm) away from the spine and outer trim edges.",
      },
    },
    {
      "@type": "Question",
      name: "Does Amazon KDP assign a free ISBN or should I use my own?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon KDP provides a free ISBN for paperback and hardcover books. Alternatively, you can purchase and use your own custom ISBN from Bowker (US) or your country's official ISBN agency.",
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
      <IsbnGenerator />
    </>
  );
}
