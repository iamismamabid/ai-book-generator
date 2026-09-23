import ArtbookStudioClient from "@/app/artbook-studio/ArtbookStudioClient";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "AI Coloring Artbook Studio | KDPage",
  description: "AI-powered coloring book page generator. Turn ideas and photos into printable coloring pages.",
  alternates: {
    canonical: "https://www.kdpage.com/studio/artbook",
  },
};

export default function StudioArtbookPage() {
  return <ArtbookStudioClient />;
}
