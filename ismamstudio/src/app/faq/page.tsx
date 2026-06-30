import FAQPageInner from "./FAQPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Ismam Studio Help Center",
  description: "Have questions about Ismam Studio? Read our FAQs about puzzle creation, trim size compliance, commercial rights, licensing, and our AppSumo lifetime deals.",
};

export default function FAQPage() {
  return <FAQPageInner />;
}
