import AdsRoiCalculator from "./AdsRoiCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Book Ads ROI Calculator — ACOS, ROAS & Break-Even | KDPage",
  description:
    "Track and optimize Amazon Ads, Facebook, and BookBub book campaigns. Calculate ACOS, ROAS, break-even ACOS, cost per order, and your maximum profitable bid — 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/ads-roi-calculator",
  },
  keywords: [
    "book ads roi calculator",
    "amazon ads acos calculator",
    "break even acos books",
    "kdp advertising calculator",
    "author ads roi",
    "bookbub ads calculator",
  ],
  openGraph: {
    title: "Free Book Ads ROI Calculator | KDPage",
    description:
      "Calculate ACOS, ROAS, break-even points, and max profitable bids for your book advertising campaigns.",
    url: "https://www.kdpage.com/tools/ads-roi-calculator",
    type: "website",
  },
};

export default function Page() {
  return <AdsRoiCalculator />;
}
