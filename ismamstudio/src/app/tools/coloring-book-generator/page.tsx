import { Metadata } from "next";
import ColoringBookClient from "./ColoringBookClient";

export const metadata: Metadata = {
  title: "Free KDP Coloring Book Generator & Color-by-Number Studio (300 DPI Print-Ready)",
  description:
    "Generate thousands of editable non-living coloring book pages & color-by-number templates for Amazon KDP — Mandalas, Botanical, Stained Glass, Landscapes, Citrus Slices, Architecture & Celestial Patterns. 100% 300 DPI vector PDF & PNG exports.",
  keywords: [
    "kdp coloring book generator",
    "color by number generator",
    "kdp coloring page templates",
    "mandala generator",
    "stained glass coloring book",
    "botanical coloring book generator",
    "non living coloring pages",
    "halal coloring book generator",
    "300 dpi print ready coloring book",
    "amazon kdp coloring book creator",
  ],
};

export default function ColoringBookGeneratorPage() {
  return <ColoringBookClient />;
}
