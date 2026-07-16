import type { Metadata } from "next";
import BulkGeneratorPage from "./BulkGeneratorClient";

export const metadata: Metadata = {
  title: "KDP Bulk Book Batch Studio | Ismam Studio",
  description: "Queue dozens of puzzle book ideas, import configs via CSV, and download ready-to-upload interiors in batch.",
  alternates: {
    canonical: "https://www.ismamstudio.tech/tools/bulk-generator",
  },
  openGraph: {
    title: "KDP Bulk Book Batch Studio | Ismam Studio",
    description: "Queue dozens of puzzle book ideas, import configs via CSV, and download ready-to-upload interiors in batch.",
    url: "https://www.ismamstudio.tech/tools/bulk-generator",
    type: "website",
  }
};

export default function Page() {
  return <BulkGeneratorPage />;
}
