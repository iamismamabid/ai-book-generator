import ImageResizer from "./ImageResizer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Mass Image Resizer — Bulk Resize with KDP Presets | KDPage",
  description:
    "Bulk resize up to 50 images at once with KDP cover presets, social media sizes, and custom dimensions. Crop, fit, or stretch — then download all as a ZIP. Free and private.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/image-resizer",
  },
  keywords: [
    "bulk image resizer",
    "mass image resizer free",
    "kdp cover size resizer",
    "resize images to 1600x2560",
    "batch photo resizer online",
    "image resizer zip download",
  ],
  openGraph: {
    title: "Free Mass Image Resizer | KDPage",
    description:
      "Bulk resize up to 50 images with KDP and social presets — download everything as a ZIP.",
    url: "https://www.kdpage.com/tools/image-resizer",
    type: "website",
  },
};

export default function Page() {
  return <ImageResizer />;
}
