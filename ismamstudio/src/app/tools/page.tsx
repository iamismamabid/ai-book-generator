import type { Metadata } from "next";
import ToolsClient from "./ToolsClient";

export const metadata: Metadata = {
  title: "Free KDP Tools: Spine Calculator, ISBN Generator & Keyword Research | KDPage",
  description:
    "Free tools for Amazon KDP self-publishers: spine width calculator, ISBN barcode generator, keyword research, and more — no signup required to try them.",
  alternates: {
    canonical: "https://www.kdpage.com/tools",
  },
  openGraph: {
    title: "Free KDP Tools: Spine Calculator, ISBN Generator & Keyword Research | KDPage",
    description:
      "Free tools for Amazon KDP self-publishers: spine width calculator, ISBN barcode generator, keyword research, and more.",
    url: "https://www.kdpage.com/tools",
    type: "website",
  },
};

export default function ToolsPage() {
  return <ToolsClient />;
}
