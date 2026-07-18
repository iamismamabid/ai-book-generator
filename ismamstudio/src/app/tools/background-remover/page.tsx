import BackgroundRemover from "./BackgroundRemover";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Background Remover — Transparent PNG Maker | KDPage",
  description:
    "Remove backgrounds from images and create transparent PNGs for book covers, logos, and graphics. Auto edge detection or click-to-pick color removal — free and 100% in-browser.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/background-remover",
  },
  keywords: [
    "free background remover",
    "transparent png maker",
    "remove white background",
    "background eraser online",
    "transparent background tool",
    "book cover graphics transparent",
  ],
  openGraph: {
    title: "Free Background Remover | KDPage",
    description:
      "Create transparent PNGs from images with solid backgrounds — private, in-browser, free.",
    url: "https://www.kdpage.com/tools/background-remover",
    type: "website",
  },
};

export default function Page() {
  return <BackgroundRemover />;
}
