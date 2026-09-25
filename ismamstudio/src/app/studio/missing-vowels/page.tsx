import MissingVowelsGenerator from "@/components/tools/MissingVowelsGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Missing Vowels Studio | KDPage",
  description:
    "Generate professional Missing Vowels vocabulary, spelling, and brain-teaser puzzle worksheets and books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/missing-vowels",
  },
  openGraph: {
    title: "Missing Vowels Studio | KDPage",
    description:
      "Generate professional Missing Vowels vocabulary, spelling, and brain-teaser puzzle books with 300 DPI print-ready interiors and solutions for Amazon KDP.",
    url: "https://www.kdpage.com/studio/missing-vowels",
    type: "website",
  },
};

export default function MissingVowelsPage() {
  return (
    <div className="bg-[#090d16] min-h-screen">
      <h1 className="sr-only">Amazon KDP Missing Vowels Word Puzzle Book Generator Studio</h1>
      <MissingVowelsGenerator />
    </div>
  );
}
