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

export default function Page() {
  if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
    redirect("/dashboard");
  }
  return <GeneratePage />;
}
