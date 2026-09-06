import BookPlanner from "./BookPlanner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Book Planner (2026) — Chapter Outlines & Writing Tracker | KDPage",
  description:
    "Plan your Amazon KDP books with chapter outlines, character sheets, and word-count progress tracking. Includes novel, non-fiction, and activity book templates. Autosaves in your browser — 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/book-planner",
  },
  keywords: [
    "free kdp book planner 2026",
    "kdp book planning tool",
    "book planner online free",
    "novel outline template",
    "chapter planner",
    "character sheet tool",
    "writing progress tracker",
    "amazon kdp outline generator",
  ],
  openGraph: {
    title: "Free KDP Book Planner (2026) — Chapter Outlines & Tracker | KDPage",
    description:
      "Outline chapters, track characters, and monitor writing progress — with templates for novels, non-fiction, and picture books.",
    url: "https://www.kdpage.com/tools/book-planner",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free KDP Book Planner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free KDP Book Planner (2026)",
    description: "Organize chapters, character development, and word count goals with browser autosave.",
    images: ["/og-image.png"],
  },
};

const bookPlannerSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KDPage Free Book Planner",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: "Free online book planner for authors and Amazon KDP publishers. Organize chapters, character sheets, and track writing word count progress.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookPlannerSchema) }}
      />
      <BookPlanner />
    </>
  );
}
