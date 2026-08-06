import type { Metadata } from "next";
import GeneratePage from "./GenerateClient";

export const metadata: Metadata = {
  title: "Custom Outline & Layout Planner | KDPage",
  description: "Design custom outlines, structures, and layout plans for low-content book interiors.",
  alternates: {
    canonical: "https://www.kdpage.com/generate",
  },
  openGraph: {
    title: "Custom Outline & Layout Planner | KDPage",
    description: "Design custom outlines, structures, and layout plans for low-content book interiors.",
    url: "https://www.kdpage.com/generate",
    type: "website",
  }
};

import { redirect } from "next/navigation";
import { AI_FEATURES_ENABLED } from "@/lib/features";

export default function Page() {
  if (!AI_FEATURES_ENABLED) {
    redirect("/studio");
  }
  return <GeneratePage />;
}
