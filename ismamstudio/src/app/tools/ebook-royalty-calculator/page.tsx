import EbookRoyaltyCalculator from "./EbookRoyaltyCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Kindle eBook Royalty Calculator — 35% vs 70% Plans | KDPage",
  description:
    "Calculate your Kindle eBook royalties on the 35% and 70% plans, including delivery fees and price band eligibility, across US, UK, DE, CA, and AU marketplaces. Free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/ebook-royalty-calculator",
  },
  keywords: [
    "kindle royalty calculator",
    "ebook royalty calculator",
    "kdp 70 percent royalty",
    "kindle delivery fee calculator",
    "amazon ebook pricing calculator",
    "kdp ebook royalties",
  ],
  openGraph: {
    title: "Free Kindle eBook Royalty Calculator | KDPage",
    description:
      "Compare 35% vs 70% Kindle royalty plans with delivery fees factored in — across all major marketplaces.",
    url: "https://www.kdpage.com/tools/ebook-royalty-calculator",
    type: "website",
  },
};

export default function Page() {
  return <EbookRoyaltyCalculator />;
}
