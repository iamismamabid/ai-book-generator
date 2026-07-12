import type { Metadata } from "next";
import GeneratePage from "./GenerateClient";

export const metadata: Metadata = {
  title: "AI Novel Writer (Llama 3.3) | Write & Outline Books on KDP",
  description: "Leverage advanced AI memory and context-management to generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing.",
  alternates: {
    canonical: "https://www.ismamstudio.me/generate",
  },
  openGraph: {
    title: "AI Novel Writer (Llama 3.3) | Write & Outline Books on KDP",
    description: "Leverage advanced AI memory and context-management to generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing.",
    url: "https://www.ismamstudio.me/generate",
    type: "website",
  }
};

export default function Page() {
  return <GeneratePage />;
}
