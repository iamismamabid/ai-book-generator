import LicenseGeneratorClient from "./LicenseGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Commercial License Certificate Generator | KDPage",
  description:
    "Generate an official, printable Commercial Use License Certificate for Amazon KDP copyright verification. Submit proof of publishing rights for puzzle interiors, covers, and graphics.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/license-generator",
  },
  keywords: [
    "kdp commercial license generator",
    "amazon kdp copyright proof",
    "commercial rights certificate",
    "kdp puzzle license",
    "self publishing copyright certificate",
    "kdpage commercial license",
  ],
  openGraph: {
    title: "Free Commercial License Certificate Generator | KDPage",
    description:
      "Generate official proof of commercial rights for your Amazon KDP books, puzzle interiors, and covers.",
    url: "https://www.kdpage.com/tools/license-generator",
    type: "website",
  },
};

export default function Page() {
  return <LicenseGeneratorClient />;
}
