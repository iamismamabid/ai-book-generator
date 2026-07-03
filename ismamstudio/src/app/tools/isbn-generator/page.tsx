import IsbnGenerator from "./IsbnGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ISBN Barcode Generator for Book Covers | Ismam Studio",
  description: "Create print-ready ISBN-13 barcodes for your book's back cover. 300 DPI export, EAN-5 price supplement codes, and check digit validation. 100% free tool.",
  keywords: [
    "isbn barcode generator",
    "free isbn generator",
    "book cover barcode",
    "ean-13 barcode creator",
    "kdp barcode tool",
    "300 dpi barcode",
    "ean-5 price code"
  ],
  openGraph: {
    title: "Free ISBN Barcode Generator for Book Covers | Ismam Studio",
    description: "Generate high-resolution print-ready EAN-13 ISBN barcodes with EAN-5 price supplements. 100% free.",
    url: "https://www.ismamstudio.me/tools/isbn-generator",
    type: "website",
  }
};

export default function Page() {
  return <IsbnGenerator />;
}
