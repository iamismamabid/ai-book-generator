import type { Metadata } from "next";
import KdpListingSheetClient from "./KdpListingSheetClient";

export const metadata: Metadata = {
  title: "Free Amazon KDP 7-Backend-Keywords & Copy Sheet Helper | KDPage",
  description:
    "Generate and format Amazon KDP title, subtitle, 7 backend search keywords (<50 chars, no commas), BISAC categories, and KDP-compliant HTML description in one click.",
  keywords: [
    "kdp 7 backend keywords",
    "kdp backend keywords generator",
    "amazon kdp keyword tool",
    "kdp listing copy sheet",
    "kdp html description generator",
    "kdp categories helper",
    "kdp publishing cheatsheet",
    "amazon bookshelf keywords"
  ],
  alternates: {
    canonical: "https://www.kdpage.com/tools/kdp-listing-sheet",
  },
  openGraph: {
    title: "Amazon KDP 7-Backend-Keywords & Copy Sheet Helper | KDPage",
    description: "Format KDP title, subtitle, 7 backend keywords (<50 chars), categories, and HTML description in seconds.",
    url: "https://www.kdpage.com/tools/kdp-listing-sheet",
    type: "website",
  },
};

export default function KdpListingSheetPage() {
  return <KdpListingSheetClient />;
}
