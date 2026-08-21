import { Metadata } from "next";
import ColoringBookClient from "./ColoringBookClient";

export const metadata: Metadata = {
  title: "Free KDP Coloring Book Generator & Color-by-Number Studio (300 DPI Vector) | KDPage",
  description:
    "Generate print-ready coloring book pages & color-by-number templates for Amazon KDP — Mandalas, Botanical Florals, Stained Glass, Landscapes, Architecture & Geometric Patterns. Free 300 DPI vector PDF & PNG exports.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/coloring-book-generator",
  },
  keywords: [
    "kdp coloring book generator",
    "free coloring book generator",
    "color by number generator",
    "kdp coloring page templates",
    "mandala generator for kdp",
    "stained glass coloring book",
    "botanical coloring book generator",
    "non living coloring pages",
    "300 dpi print ready coloring book",
    "amazon kdp coloring book creator",
    "adult coloring book generator",
    "kids coloring book maker"
  ],
  openGraph: {
    title: "Free KDP Coloring Book Generator & Color-by-Number Studio | KDPage",
    description:
      "Generate editable, print-ready coloring book pages for Amazon KDP in 300 DPI vector PDF & PNG formats.",
    url: "https://www.kdpage.com/tools/coloring-book-generator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Coloring Book Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Coloring Book Generator (300 DPI Print-Ready)",
    description: "Generate Mandalas, Botanical, Stained Glass & Color-by-Number pages for Amazon KDP.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are the generated coloring book pages 300 DPI print-ready for Amazon KDP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All coloring pages export in native 300 DPI vector PDF and high-resolution PNG formats, perfectly formatted for standard KDP trim sizes like 8.5x11 inches.",
      },
    },
    {
      "@type": "Question",
      name: "Can I sell coloring books created with this tool on Amazon KDP and Etsy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You have full commercial rights to publish and sell any coloring book pages and color-by-number templates generated on KDPage with no royalty fees.",
      },
    },
    {
      "@type": "Question",
      name: "What coloring page styles are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KDPage offers Mandalas, Stained Glass, Botanical Florals, Geometric Patterns, Architecture, Landscape Vistas, Concept Vehicles, and Color-by-Number grids with color palettes and solution keys.",
      },
    },
  ],
};

export default function ColoringBookGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ColoringBookClient />
    </>
  );
}
