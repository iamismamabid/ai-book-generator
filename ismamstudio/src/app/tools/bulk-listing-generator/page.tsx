import type { Metadata } from "next";
import BulkListingGeneratorClient from "./BulkListingGeneratorClient";

export const metadata: Metadata = {
  title: "Bulk KDP Listing Generator | KDPage",
  description: "Turn a list of book titles or concepts into ready-to-paste Amazon KDP listings — title, subtitle, description, 7 backend keywords, and category suggestions — in one batch.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/bulk-listing-generator",
  },
  openGraph: {
    title: "Bulk KDP Listing Generator | KDPage",
    description: "Turn a list of book titles or concepts into ready-to-paste Amazon KDP listings in one batch.",
    url: "https://www.kdpage.com/tools/bulk-listing-generator",
    type: "website",
  }
};

export default function Page() {
  return <BulkListingGeneratorClient />;
}
