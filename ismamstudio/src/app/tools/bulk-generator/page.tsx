import type { Metadata } from "next";
import BulkGeneratorPage from "./BulkGeneratorClient";

export const metadata: Metadata = {
  title: "KDP Bulk Book Batch Studio | KDPage",
  description: "Queue dozens of puzzle book ideas, import configs via CSV, and download ready-to-upload interiors in batch.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/bulk-generator",
  },
  openGraph: {
    title: "KDP Bulk Book Batch Studio | KDPage",
    description: "Queue dozens of puzzle book ideas, import configs via CSV, and download ready-to-upload interiors in batch.",
    url: "https://www.kdpage.com/tools/bulk-generator",
    type: "website",
  }
};

export default function Page() {
  return <BulkGeneratorPage />;
}
