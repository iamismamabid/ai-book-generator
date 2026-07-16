import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | KDPage Help Center",
  description: "Read the Refund Policy of KDPage. Learn about our 7-day money-back guarantee for SaaS subscriptions and 60-day refund policy for AppSumo lifetime deals.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Refund Policy</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-8 text-slate-300 text-sm font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">1. Refund & Cancellation Policy</h2>
              <p>
                We stand behind the quality of our Creator Studio and want you to feel confident in your purchase. To protect both our users and our platform, we offer a **7-day conditional money-back guarantee** based on fair use.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">2. Eligibility for Refund</h2>
              <p>
                You are eligible for a full refund within **7 days** of your initial subscription purchase, provided you have downloaded or exported **fewer than 5 complete puzzle books, interiors, or manuscript PDFs**.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">3. When Refunds Are Not Applicable</h2>
              <ul className="space-y-4">
                <li>
                  <strong className="text-white block mb-1">A. Usage Limit Exceeded</strong>
                  If you have successfully generated and downloaded **5 or more complete books or manuscripts**, you are no longer eligible for a refund. Generating and exporting this volume of print-ready assets indicates that the core commercial value of the platform has been utilized.
                </li>
                <li>
                  <strong className="text-white block mb-1">B. Subscription Renewals</strong>
                  The 7-day guarantee applies only to your first, initial purchase. Subsequent monthly or annual subscription renewals are non-refundable.
                </li>
                <li>
                  <strong className="text-white block mb-1">C. Third-Party Marketplaces</strong>
                  If you purchased a lifetime deal or subscription through a third-party partner (e.g., AppSumo), your purchase is governed entirely by that specific platform’s refund policy (e.g., the standard 60-day AppSumo guarantee). Please process those specific refunds directly through their respective user portals.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">4. How to Request a Refund</h2>
              <p>
                If you meet the criteria above and wish to request a refund, please contact our support team at **support@kdpage.com** within 7 days of your original transaction.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
