import type { Metadata } from "next";
import KdpChecklistPage from "./KdpChecklistClient";

export const metadata: Metadata = {
  title: "The Ultimate KDP Bestseller Checklist | KDPage Guide",
  description: "Check off crucial publishing tasks before uploading. Verify your interior margins, spine dimensions, barcode spacing, and metadata keywords.",
  alternates: {
    canonical: "https://www.kdpage.com/kdp-checklist",
  },
  openGraph: {
    title: "The Ultimate KDP Bestseller Checklist | KDPage Guide",
    description: "Check off crucial publishing tasks before uploading. Verify your interior margins, spine dimensions, barcode spacing, and metadata keywords.",
    url: "https://www.kdpage.com/kdp-checklist",
    type: "website",
  }
};

export default function Page() {
  return <KdpChecklistPage />;
}
