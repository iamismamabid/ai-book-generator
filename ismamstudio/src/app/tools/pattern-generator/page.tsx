import PatternGenerator from "./PatternGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Amazon KDP Seamless Pattern & Book Cover Generator (300 DPI) | KDPage",
  description:
    "Generate 100% mathematically seamless patterns for Amazon KDP book covers, journal endpapers, and paperback interiors. 22 vector styles, custom monogram initials, mysterious letter plaques, 1-click full-bleed printing, and 300 DPI PDF exports.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/pattern-generator",
  },
  keywords: [
    "seamless pattern generator",
    "free kdp seamless pattern generator",
    "amazon kdp pattern maker",
    "book cover background pattern generator",
    "kdp journal endpaper generator",
    "300 dpi pattern pdf download",
    "monogram pattern maker",
    "mysterious letter generator",
    "kdp notebook pattern maker free",
    "geometric seamless pattern generator",
    "print ready kdp patterns"
  ],
  openGraph: {
    title: "Free Amazon KDP Seamless Pattern & Book Cover Generator (300 DPI) | KDPage",
    description:
      "22 seamless vector pattern presets, custom monograms, mysterious letter plaques, and instant 300 DPI Amazon KDP PDF downloads.",
    url: "https://www.kdpage.com/tools/pattern-generator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free KDP Seamless Pattern Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP Seamless Pattern Generator (300 DPI)",
    description: "Generate seamless repeating vector patterns for KDP book covers and journal interiors.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are the generated patterns 100% mathematically seamless?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every pattern uses boundary reflection algorithms where vector shapes crossing any tile border are mirrored on the opposite border, guaranteeing zero seam lines when repeated infinitely.",
      },
    },
    {
      "@type": "Question",
      name: "Can I download 300 DPI print-ready PDFs for Amazon KDP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can export print-ready 300 DPI PDF files calibrated to standard Amazon KDP trim sizes (8.5x11 US Letter, 6x9 Trade Paperback, 8.25x11 Children's Books, 7x10 Executive, and 5.5x8.5 Pocket Diaries).",
      },
    },
    {
      "@type": "Question",
      name: "Can I add my book title or custom name plaque to the pattern?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Use the built-in Name / Mysterious Letter Plaque toggle to add customizable titles, subtitles, and ornate frames (Mysterious Gothic, Vintage Plaque, Royal Filigree, Circular Wax Seal) directly onto your print page.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use these patterns for commercial Amazon KDP and Etsy books?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All patterns generated on KDPage include 100% unrestricted commercial use rights with zero royalties.",
      },
    },
  ],
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Amazon KDP Seamless Pattern & Book Cover Generator",
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
      <PatternGenerator />
    </>
  );
}

