import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BulkListingGeneratorClient from "./BulkListingGeneratorClient";
import { AI_FEATURES_ENABLED } from "@/lib/features";

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
  // This tool writes listings with a language model, so it's gated with the
  // rest of the AI features.
  if (!AI_FEATURES_ENABLED) {
    redirect("/tools");
  }
  return <BulkListingGeneratorClient />;
}
