import SpineCalculator from "./SpineCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Spine Calculator & Cover Dimensions Generator | Ismam Studio",
  description: "Calculate your book's spine thickness and full cover dimensions with bleed margins for Amazon KDP printing. 100% free specification calculator.",
  keywords: [
    "kdp spine calculator", 
    "free kdp calculator", 
    "amazon kdp cover size", 
    "book cover template", 
    "bleed margins calculator", 
    "self publishing tools",
    "kdp specifications"
  ],
  openGraph: {
    title: "Free KDP Spine & Cover Calculator | Ismam Studio",
    description: "Instant KDP book cover dimensions and spine thickness generator with interactive SVG layouts. 100% free tool.",
    url: "https://www.ismamstudio.me/tools/spine-calculator",
    type: "website",
  }
};

export default function Page() {
  return <SpineCalculator />;
}
