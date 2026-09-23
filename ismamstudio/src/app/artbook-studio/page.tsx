import type { Metadata } from "next";
import ArtbookStudioClient from "./ArtbookStudioClient";

export const metadata: Metadata = {
  title: "AI Coloring Artbook Studio | Generate KDP-Ready Coloring Books | KDPage",
  description: "Generate stunning 300 DPI KDP-ready coloring book pages from text prompts using your own OpenAI, Gemini, or Stability AI key. Export print-ready PDFs with title page and copyright.",
  alternates: {
    canonical: "https://www.kdpage.com/artbook-studio",
  },
  openGraph: {
    title: "AI Coloring Artbook Studio | KDPage",
    description: "Generate KDP-ready coloring book pages from text prompts with BYOK AI. No markup — pay direct API cost only.",
    url: "https://www.kdpage.com/artbook-studio",
    type: "website",
  },
};

export default function Page() {
  return <ArtbookStudioClient />;
}
