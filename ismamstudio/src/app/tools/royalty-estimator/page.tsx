import type { Metadata } from "next";
import RoyaltyEstimatorPage from "./RoyaltyEstimatorClient";

export const metadata: Metadata = {
  title: "KDP Royalty & Market Viability Estimator | KDPage",
  description: "Factor in printing costs, Amazon advertising PPC campaigns, Kindle Unlimited reads, promo runs, and category competition to evaluate your book profitability.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/royalty-estimator",
  },
  openGraph: {
    title: "KDP Royalty & Market Viability Estimator | KDPage",
    description: "Factor in printing costs, Amazon advertising PPC campaigns, Kindle Unlimited reads, promo runs, and category competition to evaluate your book profitability.",
    url: "https://www.kdpage.com/tools/royalty-estimator",
    type: "website",
  }
};

export default function Page() {
  return <RoyaltyEstimatorPage />;
}
