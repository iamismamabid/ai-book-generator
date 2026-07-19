import KdpFileValidator from "./KdpFileValidator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP File Validator — Check PDF Before Upload | KDPage",
  description:
    "Validate your interior PDF against Amazon KDP requirements before uploading — trim size, page count, page consistency, encryption, and file size limits. Free, private, in-browser.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/kdp-file-validator",
  },
  keywords: [
    "kdp file validator",
    "kdp pdf checker",
    "amazon kdp upload requirements",
    "kdp trim size checker",
    "pdf validation before kdp upload",
    "kdp manuscript checker",
  ],
  openGraph: {
    title: "Free KDP File Validator | KDPage",
    description:
      "Pre-flight your interior PDF against KDP's requirements before you upload — free and private.",
    url: "https://www.kdpage.com/tools/kdp-file-validator",
    type: "website",
  },
};

export default function Page() {
  return <KdpFileValidator />;
}
