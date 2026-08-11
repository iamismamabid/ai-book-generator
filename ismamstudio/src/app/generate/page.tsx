import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "KDP Creator Studio | KDPage",
  description: "Design custom outlines, structures, and layout plans for low-content book interiors.",
  alternates: {
    canonical: "https://www.kdpage.com/studio",
  },
  openGraph: {
    title: "KDP Creator Studio | KDPage",
    description: "Design custom outlines, structures, and layout plans for low-content book interiors.",
    url: "https://www.kdpage.com/studio",
    type: "website",
  }
};

export default function Page() {
  redirect("/studio");
}
