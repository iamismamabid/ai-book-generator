import TrademarkChecker from "./TrademarkChecker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Trademark Checker for Book Titles & KDP Keywords | KDPage",
  description:
    "Screen your book title, subtitle, and backend keywords against commonly trademarked terms that trigger Amazon KDP takedowns — plus direct links to official USPTO and TMview searches.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/trademark-checker",
  },
  keywords: [
    "trademark checker book title",
    "kdp trademark check",
    "amazon kdp trademarked keywords",
    "book title trademark search",
    "kdp content violation trademark",
    "uspto trademark search books",
  ],
  openGraph: {
    title: "Free Trademark Checker for Book Titles | KDPage",
    description:
      "Screen titles and keywords against commonly trademarked terms before Amazon flags your book.",
    url: "https://www.kdpage.com/tools/trademark-checker",
    type: "website",
  },
};

export default function Page() {
  return <TrademarkChecker />;
}
