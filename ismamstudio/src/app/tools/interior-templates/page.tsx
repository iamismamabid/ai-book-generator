import InteriorTemplates from "./InteriorTemplates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Interior Templates PDF — Planners, Journals & Notebooks | KDPage",
  description:
    "Download 100% free, ready-to-publish interior templates for Amazon KDP — Lined Journals, Dot Grid, Graph Paper, Daily Planners, Cornell Notes, Habit Trackers & Logbooks. Sized to official KDP trims with bleed and no-bleed options.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/interior-templates",
  },
  keywords: [
    "kdp interior templates",
    "free kdp interior templates pdf",
    "journal template pdf",
    "planner template kdp",
    "notebook interior generator",
    "dot grid pdf download",
    "low content book templates",
    "no bleed kdp interior",
    "amazon kdp manuscript templates",
    "6x9 lined journal pdf download",
    "8.5x11 planner template"
  ],
  openGraph: {
    title: "Free KDP Interior Templates PDF — Planners, Journals & Notebooks | KDPage",
    description:
      "Generate journal, planner, and notebook interiors sized to standard KDP trims — free instant PDF downloads.",
    url: "https://www.kdpage.com/tools/interior-templates",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free KDP Interior Templates" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Interior Templates PDF (Print-Ready)",
    description: "Download lined journals, planners, dot grids, and Cornell notes formatted for Amazon KDP.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are these KDP interior templates free to use for commercial publishing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All interior templates (lined, dot grid, daily planners, habit trackers) are 100% free for commercial use on Amazon KDP, Etsy, and personal book sales.",
      },
    },
    {
      "@type": "Question",
      name: "What KDP trim sizes are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Templates are pre-formatted for all standard Amazon KDP trim sizes including 6x9 inches, 8.5x11 inches, 5.5x8.5 inches, 7x10 inches, and 8.25x11 inches with exact margin and bleed guidelines.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to select 'Bleed' on Amazon KDP when uploading these templates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you select No-Bleed templates where lines stay within the safety margins, select 'No Bleed' on KDP. If your pattern or lines touch the outer edge of the page, select 'Bleed (PDF only)'.",
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
      <InteriorTemplates />
    </>
  );
}
