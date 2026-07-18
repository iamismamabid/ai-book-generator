import KenpCalculator from "./KenpCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KENP Royalty Calculator — Kindle Unlimited Earnings | KDPage",
  description:
    "Estimate your Kindle Unlimited earnings from KENP page reads. Model different KDP Select fund rates, estimate your KENP count from word count, and project monthly income — free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/kenp-calculator",
  },
  keywords: [
    "kenp calculator",
    "kindle unlimited royalty calculator",
    "kenp royalty rate",
    "kdp select earnings calculator",
    "kindle page reads calculator",
    "kenpc estimator",
  ],
  openGraph: {
    title: "Free KENP Royalty Calculator | KDPage",
    description:
      "Estimate Kindle Unlimited page-read earnings based on your KENP count and current fund rates.",
    url: "https://www.kdpage.com/tools/kenp-calculator",
    type: "website",
  },
};

export default function Page() {
  return <KenpCalculator />;
}
