import PhotoToLineArt from "./PhotoToLineArt";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Photo to Line Art Converter — Coloring Book Pages | KDPage",
  description:
    "Convert photos into clean line art for coloring books. Adjustable detail, line thickness, and smoothing with instant PNG download. Free, private, in-browser conversion.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/photo-to-line-art",
  },
  keywords: [
    "photo to line art",
    "photo to coloring page",
    "line art converter free",
    "coloring book page maker",
    "image to outline converter",
    "photo to sketch online",
  ],
  openGraph: {
    title: "Free Photo to Line Art Converter | KDPage",
    description:
      "Turn any photo into clean, printable line art for coloring books — free and instant.",
    url: "https://www.kdpage.com/tools/photo-to-line-art",
    type: "website",
  },
};

export default function Page() {
  return <PhotoToLineArt />;
}
