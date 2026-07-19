import InteriorTemplates from "./InteriorTemplates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Interior Templates — Journals, Planners & Notebooks | KDPage",
  description:
    "Download ready-to-use interior templates for journals, planners, and notebooks — lined, dot grid, graph paper, Cornell notes, habit trackers, and more. Sized to standard KDP trims.",
  alternates: {
    canonical: "https://www.kdpage.com/tools/interior-templates",
  },
  keywords: [
    "kdp interior templates",
    "journal template pdf",
    "planner template kdp",
    "notebook interior generator",
    "dot grid pdf download",
    "low content book templates",
  ],
  openGraph: {
    title: "Free KDP Interior Templates | KDPage",
    description:
      "Generate journal, planner, and notebook interiors sized to standard KDP trims — free instant PDF downloads.",
    url: "https://www.kdpage.com/tools/interior-templates",
    type: "website",
  },
};

export default function Page() {
  return <InteriorTemplates />;
}
