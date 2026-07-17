import type { Metadata } from "next";
import GeneratePage from "./GenerateClient";

export const metadata: Metadata = {
  title: "Chapter Writer & Outliner | Write & Outline Books on KDP",
  description: "Generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing with our advanced Chapter Writer tool.",
  alternates: {
    canonical: "https://www.kdpage.com/generate",
  },
  openGraph: {
    title: "Chapter Writer & Outliner | Write & Outline Books on KDP",
    description: "Generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing with our advanced Chapter Writer tool.",
    url: "https://www.kdpage.com/generate",
    type: "website",
  }
};

export default function Page() {
  return <GeneratePage />;
}
