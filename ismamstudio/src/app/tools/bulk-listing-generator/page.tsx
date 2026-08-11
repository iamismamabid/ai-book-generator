import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bulk KDP Listing Generator | KDPage",
  description: "Turn a list of book titles or concepts into ready-to-paste Amazon KDP listings — title, subtitle, description, 7 backend keywords, and category suggestions — in one batch.",
  alternates: {
    canonical: "https://www.kdpage.com/tools",
  },
  openGraph: {
    title: "Bulk KDP Listing Generator | KDPage",
    description: "Turn a list of book titles or concepts into ready-to-paste Amazon KDP listings in one batch.",
    url: "https://www.kdpage.com/tools",
    type: "website",
  }
};

export default function Page() {
  redirect("/tools");
}
