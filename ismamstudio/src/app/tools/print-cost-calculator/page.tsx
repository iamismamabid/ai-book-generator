import PrintCostCalculator from "./PrintCostCalculator";
import type { Metadata } from "next";

const SITE_URL = "https://www.kdpage.com";

export const metadata: Metadata = {
  title: "[2026] Amazon KDP Print Cost Calculator — Exact Royalty & Minimum Price Formula | KDPage",
  description:
    "Calculate exact Amazon KDP printing costs, minimum retail list prices, and author royalties for paperbacks and hardcovers across US, UK, DE, FR, IT, ES, CA, and AU marketplaces. Updated with official 2026 Amazon formulas. 100% free.",
  keywords: [
    "kdp print cost calculator",
    "amazon kdp printing cost calculator",
    "kdp printing cost formula 2026",
    "paperback printing cost calculator",
    "hardcover printing cost kdp",
    "kdp minimum list price calculator",
    "self publishing cost calculator",
    "kdp royalty printing formula",
    "amazon book printing cost 2026",
    "kdp standard color vs premium color cost",
    "amazon kdp royalty calculator"
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/print-cost-calculator`,
  },
  openGraph: {
    title: "[2026] Amazon KDP Print Cost Calculator — Exact Royalty & Price Formula | KDPage",
    description:
      "Instant Amazon KDP printing cost estimates and author royalty calculations across all major global marketplaces (US, UK, EU, CA, AU).",
    url: `${SITE_URL}/tools/print-cost-calculator`,
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Amazon KDP Print Cost Calculator 2026" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "[2026] Amazon KDP Print Cost Calculator | KDPage",
    description: "Calculate Amazon KDP printing costs, minimum list prices, and 60% royalties instantly.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <PrintCostCalculator />;
}
