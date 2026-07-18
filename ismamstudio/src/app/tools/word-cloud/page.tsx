import WordCloudGenerator from "./WordCloudGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Word Cloud Generator — Custom Colors & PNG Export | KDPage",
  description:
    "Create beautiful word clouds from any text or keyword list. Six color schemes, rotation, stopword filtering, and high-resolution PNG export. Free, no signup, runs in your browser.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/word-cloud",
  },
  keywords: [
    "word cloud generator",
    "free word cloud maker",
    "word cloud from text",
    "keyword cloud generator",
    "word cloud png download",
    "tag cloud creator",
  ],
  openGraph: {
    title: "Free Word Cloud Generator | KDPage",
    description:
      "Turn any text into a beautiful, downloadable word cloud with custom color schemes.",
    url: "https://www.kdpage.com/tools/word-cloud",
    type: "website",
  },
};

export default function Page() {
  return <WordCloudGenerator />;
}
