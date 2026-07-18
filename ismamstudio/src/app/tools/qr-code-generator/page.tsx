import QrCodeGenerator from "./QrCodeGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator — High-Res PNG for Print & Books | KDPage",
  description:
    "Generate custom QR codes for author websites, Amazon pages, and book marketing. Custom colors, print-safe error correction, and up to 2048px PNG export. Free, no signup.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/qr-code-generator",
  },
  keywords: [
    "free qr code generator",
    "qr code for books",
    "author qr code",
    "qr code png download",
    "custom color qr code",
    "print qr code generator",
  ],
  openGraph: {
    title: "Free QR Code Generator | KDPage",
    description:
      "High-resolution QR codes with custom colors for book marketing — free and instant.",
    url: "https://www.kdpage.com/tools/qr-code-generator",
    type: "website",
  },
};

export default function Page() {
  return <QrCodeGenerator />;
}
