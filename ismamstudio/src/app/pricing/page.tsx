import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.kdpage.com/pricing" },
  title: "Pricing Plans | KDPage Book Creator",
  description: "Explore KDPage pricing options. Choose from our Free plan, Starter Creator, Pro Studio, or Publisher Agency monthly/annual subscription plans, or purchase our limited-time AppSumo Lifetime Deals.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <PricingSection />
      </div>
    </div>
  );
}
