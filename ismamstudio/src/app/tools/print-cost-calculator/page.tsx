import PrintCostCalculator from "./PrintCostCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Print Cost Calculator — Paperback & Hardcover | KDPage",
  description:
    "Calculate Amazon KDP printing costs for paperbacks and hardcovers across US, UK, EU, and Canada marketplaces. See royalties and minimum list prices instantly — 100% free.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/print-cost-calculator",
  },
  keywords: [
    "kdp print cost calculator",
    "amazon kdp printing cost",
    "paperback printing cost calculator",
    "hardcover printing cost kdp",
    "kdp minimum list price",
    "self publishing cost calculator",
  ],
  openGraph: {
    title: "Free KDP Print Cost Calculator | KDPage",
    description:
      "Instant Amazon KDP printing cost estimates for paperbacks and hardcovers across all major marketplaces.",
    url: "https://www.kdpage.com/tools/print-cost-calculator",
    type: "website",
  },
};

export default function Page() {
  return <PrintCostCalculator />;
}
