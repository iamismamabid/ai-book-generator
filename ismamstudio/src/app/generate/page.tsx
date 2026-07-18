import type { Metadata } from "next";
import GeneratePage from "./GenerateClient";

export const metadata: Metadata = {
  title: "AI Novel Writer (Llama 3.3) | Write & Outline Books on KDP",
  description: "Leverage advanced AI memory and context-management to generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing.",
  alternates: {
    canonical: "https://www.kdpage.com/generate",
  },
  openGraph: {
    title: "AI Novel Writer (Llama 3.3) | Write & Outline Books on KDP",
    description: "Leverage advanced AI memory and context-management to generate high-quality novel outlines, chapter descriptions, and drafts tailored for Amazon KDP publishing.",
    url: "https://www.kdpage.com/generate",
    type: "website",
  }
};

import { redirect } from "next/navigation";

export default function Page() {
  if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
    redirect("/dashboard");
  }
  return <GeneratePage />;
}
