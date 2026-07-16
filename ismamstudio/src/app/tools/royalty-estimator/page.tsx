import type { Metadata } from "next";
import RoyaltyEstimatorPage from "./RoyaltyEstimatorClient";

export const metadata: Metadata = {
  title: "KDP Royalty & Market Viability Estimator | Ismam Studio",
  description: "Factor in printing costs, Amazon advertising PPC campaigns, Kindle Unlimited reads, promo runs, and category competition to evaluate your book profitability.",
  alternates: {
    canonical: "https://www.ismamstudio.tech/tools/royalty-estimator",
  },
  openGraph: {
    title: "KDP Royalty & Market Viability Estimator | Ismam Studio",
    description: "Factor in printing costs, Amazon advertising PPC campaigns, Kindle Unlimited reads, promo runs, and category competition to evaluate your book profitability.",
    url: "https://www.ismamstudio.tech/tools/royalty-estimator",
    type: "website",
  }
};

export default function Page() {
  return <RoyaltyEstimatorPage />;
}
