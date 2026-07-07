import { Metadata } from "next";

export const metadata: Metadata = {
  title: "100% Free KDP Publishing Tools & Generators | Ismam Studio",
  description: "Free tools for Amazon KDP publishers. Calculate spine sizes, format book descriptions in HTML, generate puzzle interiors, valid EPUB formatting, and estimate royalties.",
  keywords: [
    "free kdp tools",
    "kdp book builder",
    "kdp spine width calculator",
    "isbn barcode generator",
    "epub formatter",
    "kdp royalty calculator",
    "book description formatter"
  ],
  openGraph: {
    title: "100% Free KDP Publishing Tools & Generators | Ismam Studio",
    description: "Instant KDP tools including spine calculator, barcode generator, EPUB formatter, royalty estimator, and description formatter.",
    url: "https://www.ismamstudio.me/tools",
    type: "website"
  }
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
