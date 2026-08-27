import ContactClient from "./ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Support | KDPage",
  description: "Get in touch with the KDPage support team. Contact us for lifetime license redemption, KDP publishing assistance, technical support, and partnership inquiries.",
  openGraph: {
    title: "Contact Us & Support | KDPage",
    description: "Get in touch with the KDPage support team. Fast 24/7 support for Amazon KDP authors and self-publishers.",
    url: "https://kdpage.com/contact",
    siteName: "KDPage",
    type: "website",
  },
  alternates: {
    canonical: "https://kdpage.com/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
