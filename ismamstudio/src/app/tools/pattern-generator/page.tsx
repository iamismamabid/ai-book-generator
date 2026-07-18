import PatternGenerator from "./PatternGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Seamless Pattern Generator — Book Covers & Interiors | KDPage",
  description:
    "Create seamless patterns for book covers, journals, and endpapers. 12 styles — polka dots, stripes, chevron, waves, and more — with custom colors and 300 DPI print exports. Free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/pattern-generator",
  },
  keywords: [
    "seamless pattern generator",
    "free pattern maker",
    "book cover pattern",
    "journal background pattern",
    "300 dpi pattern download",
    "polka dot pattern generator",
  ],
  openGraph: {
    title: "Free Seamless Pattern Generator | KDPage",
    description:
      "12 seamless pattern styles with custom colors — export as tiles or 300 DPI print pages.",
    url: "https://www.kdpage.com/tools/pattern-generator",
    type: "website",
  },
};

export default function Page() {
  return <PatternGenerator />;
}
