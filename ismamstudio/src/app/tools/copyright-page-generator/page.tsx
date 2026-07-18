import CopyrightPageGenerator from "./CopyrightPageGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Copyright Page Generator for Books | KDPage",
  description:
    "Create a professional copyright page for your book in seconds — with all-rights-reserved text, fiction and non-fiction disclaimers, ISBN, and edition lines. Copy, download as TXT, or export a 6×9 PDF.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/copyright-page-generator",
  },
  keywords: [
    "copyright page generator",
    "book copyright page template",
    "fiction disclaimer template",
    "all rights reserved page",
    "kdp copyright page",
    "self publishing copyright",
  ],
  openGraph: {
    title: "Free Copyright Page Generator | KDPage",
    description:
      "Generate a professional copyright page with the correct legal wording for fiction, non-fiction, or low-content books.",
    url: "https://www.kdpage.com/tools/copyright-page-generator",
    type: "website",
  },
};

export default function Page() {
  return <CopyrightPageGenerator />;
}
