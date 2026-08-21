import KdpFileValidator from "./KdpFileValidator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Amazon KDP PDF File Validator & Pre-Flight Checker | KDPage",
  description:
    "Pre-flight and validate your interior PDF against Amazon KDP print requirements before uploading — trim size compliance, exact page count, page dimensions consistency, font embedding, encryption check, and file size limits. 100% free, runs privately in your browser.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/kdp-file-validator",
  },
  keywords: [
    "kdp file validator",
    "free kdp pdf checker",
    "amazon kdp upload requirements",
    "kdp trim size checker",
    "pdf validation before kdp upload",
    "kdp manuscript checker",
    "amazon kdp pdf preflight tool",
    "fix kdp pdf upload errors"
  ],
  openGraph: {
    title: "Free Amazon KDP PDF File Validator & Pre-Flight Checker | KDPage",
    description:
      "Pre-flight your interior PDF against KDP print requirements before you upload — free and 100% private.",
    url: "https://www.kdpage.com/tools/kdp-file-validator",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP File Validator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon KDP PDF File Validator",
    description: "Check your PDF for KDP trim size, page count, and margin errors before uploading.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why does Amazon KDP reject my PDF upload?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common reasons for KDP PDF rejection include mismatched page dimensions (e.g. some pages are 6x9 while others are 8.5x11), unflattened transparencies, missing font embeddings, or page counts below 24 pages.",
      },
    },
    {
      "@type": "Question",
      name: "Does KDPage upload my book files to a server during validation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The KDP File Validator runs 100% client-side in your web browser using WebAssembly. Your manuscript and PDF files never leave your computer.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <KdpFileValidator />
    </>
  );
}
