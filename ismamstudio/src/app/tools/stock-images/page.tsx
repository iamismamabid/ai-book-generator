import StockImages from "./StockImages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Stock Images for Book Covers — Royalty-Free Search | KDPage",
  description:
    "Search and download royalty-free stock photos for book covers and marketing materials. Powered by Unsplash — free for commercial use, no attribution required.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/stock-images",
  },
  keywords: [
    "free stock images book cover",
    "royalty free images for books",
    "unsplash book cover photos",
    "free commercial use images",
    "stock photos self publishing",
    "book marketing images free",
  ],
  openGraph: {
    title: "Free Stock Images for Book Covers | KDPage",
    description:
      "Search millions of royalty-free photos for your covers and marketing — free for commercial use.",
    url: "https://www.kdpage.com/tools/stock-images",
    type: "website",
  },
};

export default function Page() {
  return <StockImages />;
}
