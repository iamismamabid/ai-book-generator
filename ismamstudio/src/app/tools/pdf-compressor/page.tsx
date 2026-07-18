import PdfCompressor from "./PdfCompressor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF Compressor — Reduce File Size for KDP | KDPage",
  description:
    "Compress PDF files in your browser — lossless optimization or aggressive image compression to meet Amazon KDP upload limits. Free, private, no file uploads to any server.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/pdf-compressor",
  },
  keywords: [
    "pdf compressor free",
    "reduce pdf file size",
    "compress pdf for kdp",
    "kdp upload limit pdf",
    "shrink pdf online private",
    "pdf optimizer browser",
  ],
  openGraph: {
    title: "Free PDF Compressor | KDPage",
    description:
      "Reduce PDF file sizes in your browser — lossless or image-based compression for KDP uploads.",
    url: "https://www.kdpage.com/tools/pdf-compressor",
    type: "website",
  },
};

export default function Page() {
  return <PdfCompressor />;
}
