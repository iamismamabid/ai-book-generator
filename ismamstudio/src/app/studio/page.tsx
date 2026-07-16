import type { Metadata } from "next";
import MasterStudioApp from "./StudioClient";

export const metadata: Metadata = {
  title: "KDP Creator Studio | Design Professional Wraparound Book Covers",
  description: "Access the ultimate Creator Studio. Design KDP-compliant full-wrap book covers with precise spine widths, align layers, and export print-ready PDFs.",
  alternates: {
    canonical: "https://www.kdpage.com/studio",
  },
  openGraph: {
    title: "KDP Creator Studio | Design Professional Wraparound Book Covers",
    description: "Access the ultimate Creator Studio. Design KDP-compliant full-wrap book covers with precise spine widths, align layers, and export print-ready PDFs.",
    url: "https://www.kdpage.com/studio",
    type: "website",
  }
};

export default function Page() {
  return <MasterStudioApp />;
}
