import OcrScanner from "./OcrScanner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free OCR Scanner — Extract Text From Images | KDPage",
  description:
    "Extract text from scanned pages, screenshots, and photos using free in-browser OCR. Supports English, Spanish, French, German, Italian, and Portuguese. Private — no uploads.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/ocr-scanner",
  },
  keywords: [
    "free ocr scanner",
    "image to text converter",
    "extract text from image",
    "ocr online free",
    "scanned page to text",
    "photo to text converter",
  ],
  openGraph: {
    title: "Free OCR Scanner | KDPage",
    description:
      "Extract text from scanned pages and screenshots — free, private, in-browser OCR in 6 languages.",
    url: "https://www.kdpage.com/tools/ocr-scanner",
    type: "website",
  },
};

export default function Page() {
  return <OcrScanner />;
}
