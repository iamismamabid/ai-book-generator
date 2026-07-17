import { Metadata } from "next";
import ToolsClient from "@/app/tools/ToolsClient";

export const metadata: Metadata = {
  title: "Free KDP Tools — Spine Calculator, ISBN Generator, Royalty Estimator | KDPage",
  description:
    "Access 10+ 100% free KDP publishing tools: spine width calculator, ISBN barcode generator, royalty estimator, keyword research, word search builder, and more. No signup required.",
  keywords: [
    "free KDP tools",
    "free Amazon KDP tools",
    "KDP spine calculator free",
    "free ISBN barcode generator",
    "KDP royalty calculator free",
    "free keyword research tool KDP",
    "KDP word search generator free",
    "free self publishing tools",
    "low content book tools free",
  ],
  openGraph: {
    title: "Free KDP Publishing Tools | KDPage",
    description:
      "10+ free tools for Amazon KDP publishers — spine calculator, ISBN generator, royalty estimator, keyword research and more. No account required.",
    url: "https://kdpage.com/tools/free",
    siteName: "KDPage",
    type: "website",
  },
  alternates: {
    canonical: "https://kdpage.com/tools/free",
  },
};

export default function FreeToolsPage() {
  return <ToolsClient />;
}
