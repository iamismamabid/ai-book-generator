import type { Metadata } from "next";
import BookMockupClient from "./BookMockupClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Free 3D Book Mockup Generator (300 DPI Transparent PNG) | KDPage",
  description:
    "Generate photorealistic 3D paperback and hardcover book mockups from your 2D cover artwork. Export 300 DPI transparent PNGs for Amazon A+ Content, social ads, and book marketing.",
  keywords: [
    "3d book mockup generator",
    "free book mockup generator",
    "kdp 3d mockup",
    "paperback 3d mockup",
    "hardcover 3d mockup",
    "amazon a+ content book mockup",
    "transparent book mockup",
    "300 dpi book mockup"
  ],
  alternates: {
    canonical: "https://www.kdpage.com/tools/3d-mockup",
  },
  openGraph: {
    title: "Free 3D Book Mockup Generator | KDPage",
    description: "Create realistic 3D paperback and hardcover book mockups in seconds. Free transparent PNG download.",
    url: "https://www.kdpage.com/tools/3d-mockup",
    type: "website",
  },
};

export default function BookMockupPage() {
  return <BookMockupClient />;
}
