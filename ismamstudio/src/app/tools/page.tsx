import type { Metadata } from "next";
import ToolsClient from "./ToolsClient";

const SITE_URL = "https://www.kdpage.com";

export const metadata: Metadata = {
  title: "Best Free KDP Tools (2026) — 30+ Amazon Publishing Calculators & Generators | KDPage",
  description:
    "Over 30 free tools for Amazon KDP self-publishers: spine & cover bleed calculators, royalty estimators, word search & puzzle generators, ISBN barcodes, and KDP file validator. 100% free, no signup required.",
  keywords: [
    "kdp tools",
    "best kdp tools",
    "free kdp tools 2026",
    "amazon kdp tools",
    "kdp publishing tools",
    "kdp tools free",
    "free kdp calculator",
    "kdp royalty calculator free",
    "kdp print cost calculator",
    "free ebook royalty calculator",
    "kdp spine calculator free",
    "free isbn barcode generator",
    "kdp keyword research free",
    "free qr code generator",
    "free pdf compressor",
    "free background remover",
    "self publishing tools free",
    "amazon kdp free tools",
    "kdp pdf validator",
  ],
  alternates: {
    canonical: `${SITE_URL}/tools`,
  },
  openGraph: {
    title: "Best Free KDP Tools (2026) — 30+ Amazon Publishing Calculators & Generators | KDPage",
    description:
      "Royalty & print cost calculators, cover and interior design generators, SEO analyzers, PDF utilities, and print-ready templates for Amazon KDP publishers — 100% free, no signup.",
    url: `${SITE_URL}/tools`,
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDPage Free KDP Tools" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Free KDP Tools (2026) | KDPage",
    description: "30+ free Amazon KDP calculators, generators & PDF utilities for self-publishers — 100% free.",
    images: ["/og-image.png"],
  },
};

// Real, individually-linked tools shown on this hub page — used to build
// ItemList schema so Google can understand this page as a tool directory,
// not just a wall of cards. (Duplicate spine-calculator entry deliberately
// collapsed to one canonical URL.)
const TOOL_ITEMS: { name: string; path: string }[] = [
  { name: "Free Puzzle Book Generator", path: "/studio" },
  { name: "Free KDP Spine & Cover Calculator", path: "/tools/spine-calculator" },
  { name: "KDP Royalty & Market Viability Estimator", path: "/tools/royalty-estimator" },
  { name: "Free KDP Keyword Research", path: "/tools/keyword-research" },
  { name: "Free Print Cost Calculator", path: "/tools/print-cost-calculator" },
  { name: "Free KENP Royalty Calculator", path: "/tools/kenp-calculator" },
  { name: "Free eBook Royalty Calculator", path: "/tools/ebook-royalty-calculator" },
  { name: "Free Book Ads ROI Calculator", path: "/tools/ads-roi-calculator" },
  { name: "Free Reading Time Calculator", path: "/tools/reading-time-calculator" },
  { name: "Free Readability Calculator", path: "/tools/readability-calculator" },
  { name: "Free Keyword Density Analyzer", path: "/tools/keyword-density" },
  { name: "Free Grammar Checker", path: "/tools/grammar-checker" },
  { name: "Free Copyright Page Generator", path: "/tools/copyright-page-generator" },
  { name: "Free Trademark Checker", path: "/tools/trademark-checker" },
  { name: "Free Book Planner", path: "/tools/book-planner" },
  { name: "Free Word Cloud Generator", path: "/tools/word-cloud" },
  { name: "Free QR Code Generator", path: "/tools/qr-code-generator" },
  { name: "Free Mass Image Resizer", path: "/tools/image-resizer" },
  { name: "Free Background Remover", path: "/tools/background-remover" },
  { name: "Free Photo to Line Art", path: "/tools/photo-to-line-art" },
  { name: "Free Pattern Generator", path: "/tools/pattern-generator" },
  { name: "Free Stock Images", path: "/tools/stock-images" },
  { name: "Free PDF Compressor", path: "/tools/pdf-compressor" },
  { name: "Free KDP File Validator", path: "/tools/kdp-file-validator" },
  { name: "Free OCR Scanner", path: "/tools/ocr-scanner" },
  { name: "Free Interior Templates", path: "/tools/interior-templates" },
];

const FAQS = [
  {
    q: "Are these KDP tools really free forever?",
    a: "Yes — every tool on this page is 100% free with no account, credit card, or trial limit. They're built to support the same self-publishers who use KDPage's paid book-creation studio.",
  },
  {
    q: "Do I need to create an account to use them?",
    a: 'No signup is required for any tool here — click "Open Tool" or "Launch Interactive Tool" and start immediately.',
  },
  {
    q: "Is my data private when I use these tools?",
    a: "Most tools — calculators, image editors, PDF utilities, OCR — run entirely in your browser and never upload your files or text to a server. A few that need external data, like Stock Images or Keyword Research, only send the specific search query you type.",
  },
  {
    q: "How many free KDP tools are on this page?",
    a: "Over 30, spanning royalty and print cost calculators, cover and interior design generators, SEO and readability analyzers, PDF utilities, and print-ready templates — all built specifically for Amazon KDP self-publishers.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Free KDP Tools",
        description:
          "A directory of 30+ free tools for Amazon KDP self-publishers: calculators, generators, analyzers, and PDF utilities.",
        url: `${SITE_URL}/tools`,
        isPartOf: { "@type": "WebSite", name: "KDPage", url: SITE_URL },
      },
      {
        "@type": "ItemList",
        name: "Free KDP Publishing Tools",
        numberOfItems: TOOL_ITEMS.length,
        itemListElement: TOOL_ITEMS.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${SITE_URL}${t.path}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Free Tools", item: `${SITE_URL}/tools` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <ToolsClient />
    </>
  );
}
