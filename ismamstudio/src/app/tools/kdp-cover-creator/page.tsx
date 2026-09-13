import KdpCoverCreatorClient from "./KdpCoverCreatorClient";
import type { Metadata } from "next";

const SITE_URL = "https://www.kdpage.com";

export const metadata: Metadata = {
  title: "Automated KDP Cover Creator (Free 2026) — Wrap-Around Book Cover Generator | KDPage",
  description:
    "The #1 free automated KDP cover creator for Amazon self-publishers. Auto-calculate spine thickness, trim sizes (8.5x11, 6x9), 0.125\" bleed, barcode zone, and export 300 DPI print-ready PDF in seconds.",
  keywords: [
    "automated kdp cover creator",
    "automated kdp cover generator",
    "kdp cover creator",
    "amazon kdp cover creator",
    "free kdp cover maker",
    "automated wrap around cover creator",
    "kdp cover generator free",
    "kdp spine and cover calculator",
    "kdp paperback cover creator",
    "kdp hardcover cover creator",
    "kdp cover template generator",
    "book bolt alternative cover creator",
    "canva kdp cover generator",
    "kdp cover dimensions calculator 2026",
    "print ready kdp cover generator"
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kdp-cover-creator`,
  },
  openGraph: {
    title: "Automated KDP Cover Creator (Free 2026) — Wrap-Around Book Cover Generator | KDPage",
    description:
      "Automate your Amazon KDP wrap-around book cover design. Real-time spine calculation, official KDP bleed formulas, barcode safe zone, and 300 DPI print export.",
    url: `${SITE_URL}/tools/kdp-cover-creator`,
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Automated KDP Cover Creator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automated KDP Cover Creator (Free 2026) | KDPage",
    description:
      "Auto-calculate Amazon KDP spine thickness, full-wrap cover dimensions, and 0.125\" bleed margins. Free instant tool for paperback and hardcover.",
    images: ["/og-image.png"],
  },
};

export default function KdpCoverCreatorPage() {
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Automated KDP Cover Creator",
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
      "ratingCount": "184",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Cloud-based automated KDP cover creator that dynamically computes spine width, bleed margins, and full wrap-around dimensions for Amazon paperback and hardcover book printing.",
    "url": `${SITE_URL}/tools/kdp-cover-creator`,
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
        "name": "What is an Automated KDP Cover Creator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An Automated KDP Cover Creator is a web tool that calculates exact full wrap-around cover dimensions (front cover, back cover, spine width, and bleed margins) for Amazon Kindle Direct Publishing without manual math or template errors."
        }
      },
      {
        "@type": "Question",
        "name": "How does the automated spine width calculation work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon KDP calculates spine thickness by multiplying interior page count by paper thickness: White paper = 0.002252 inches/page, Cream paper = 0.0025 inches/page, Color paper = 0.002347 inches/page. The tool applies these formulas automatically in real time."
        }
      },
      {
        "@type": "Question",
        "name": "Can I print text on my book spine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon KDP strictly requires a minimum of 80 pages before you can place text on the spine. Books with 79 pages or fewer must have a blank spine to prevent mechanical print shifts."
        }
      },
      {
        "@type": "Question",
        "name": "What bleed margin does Amazon KDP require for covers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Paperback covers require exactly 0.125 inches (1/8 inch or 3.2 mm) of bleed added to all four outer edges. Hardcover case-laminate covers require 0.591 inches to wrap around the physical boards."
        }
      },
      {
        "@type": "Question",
        "name": "Where is the Amazon KDP barcode placed on the cover?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon prints a 2-inch by 1.2-inch barcode on the bottom-right corner of the back cover. The automated creator visually protects this safe zone so vital artwork and text are never covered."
        }
      }
    ]
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create an Automated KDP Book Cover in 3 Steps",
    "description": "Generate an Amazon KDP compliant wrap-around cover with exact spine math and bleed margins.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Book Trim Size & Page Count",
        "text": "Choose your book dimensions (such as 8.5x11 for puzzle books or 6x9 for novels), paper type (white, cream, or color), and exact page count.",
        "url": `${SITE_URL}/tools/kdp-cover-creator#step1`
      },
      {
        "@type": "HowToStep",
        "name": "Review Automated Wrap-Around Dimensions",
        "text": "The automated engine calculates total cover width, total height, spine thickness, and 0.125\" bleed margins in both inches and 300 DPI pixel values.",
        "url": `${SITE_URL}/tools/kdp-cover-creator#step2`
      },
      {
        "@type": "HowToStep",
        "name": "Launch Studio or Download SVG Template",
        "text": "Open directly in the KDPage Fabric Cover Studio to design your full wrap cover visually or export print-ready 300 DPI vector PDFs for direct Amazon KDP upload.",
        "url": `${SITE_URL}/tools/kdp-cover-creator#step3`
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
        "name": "Automated KDP Cover Creator",
        "item": `${SITE_URL}/tools/kdp-cover-creator`
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
      <KdpCoverCreatorClient />
    </>
  );
}
