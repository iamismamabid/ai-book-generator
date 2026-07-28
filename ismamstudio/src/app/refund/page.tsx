import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | KDPage Help Center",
  description: "Read the comprehensive Refund Policy of KDPage. Learn about our 7-day money-back guarantee, fair usage terms, AppSumo policy, and Paddle Merchant of Record terms.",
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
              <h1 className="text-3xl font-black tracking-tight text-white">Refund & Cancellation Policy</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-8 text-slate-300 text-sm font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">1. Overview & 7-Day Money-Back Guarantee</h2>
              <p>
                We stand behind the quality of KDPage and want you to feel confident in your purchase. We offer a **7-day conditional money-back guarantee** for all direct SaaS subscription plans purchased via our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">2. Eligibility & Usage-Based Limitations</h2>
              <p>
                Refunds under the 7-day guarantee apply to **first-time purchases only**. Subscription renewals, repeat purchases of a previously refunded plan, and plan upgrades from an existing paid plan are non-refundable.
              </p>
              <p className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                <strong className="text-amber-400 block mb-1">Usage-Based Credit Limitation:</strong>
                Where a plan includes usage-based resources (AI line art generation credits, book exports, or AI-assisted content features), refund requests may be declined if **more than 20%** of the plan's monthly resource allowance has been consumed at the time of the request.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">3. Annual Subscription Plans</h2>
              <p>
                Annual plans are covered by the same **7-day money-back guarantee** from the date of purchase. After 7 days, annual plans are non-refundable, but you may cancel auto-renewal at any time to prevent future billing cycles.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">4. Cancellation vs. Refund</h2>
              <p>
                Cancelling a subscription stops future recurring billing but does not automatically trigger a refund. Upon cancellation, you retain full access to your account features until the end of your current billing period. We do not provide prorated refunds for partial billing periods.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">5. Third-Party Purchases (AppSumo Deals)</h2>
              <p>
                AppSumo lifetime purchases are handled entirely through AppSumo under their **standard 60-day refund policy**. We cannot issue refunds for AppSumo purchases directly from our dashboard. When an AppSumo code is refunded on AppSumo's portal, the code and corresponding tier access are automatically deactivated on our platform. Tier upgrades and code stacking are managed directly through your AppSumo user portal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">6. Merchant of Record & EU/UK Consumer Notice</h2>
              <p>
                Direct website payments are processed by **Paddle** as Merchant of Record. Their terms of sale and refund policies apply to all direct transactions.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong className="text-white block mb-1">EU/UK Consumers Right of Withdrawal:</strong>
                For EU and UK consumers accessing digital goods, by initiating immediate access and downloading digital exports, you acknowledge and agree that your right of withdrawal is satisfied upon consumption of digital assets beyond our fair usage thresholds.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">7. Chargebacks & Abuse Prevention</h2>
              <p>
                Please contact our support team at **support@kdpage.com** before initiating a chargeback with your card provider. Accounts subject to a chargeback may be suspended pending investigation. We reserve the right to decline refunds where we detect fraud, abuse, automated account creation, or repeated refund requests across multiple accounts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">8. How to Request a Refund</h2>
              <p>
                To request a refund for a direct website subscription, please send an email to **support@kdpage.com** from the email address associated with your account within 7 days of purchase. Approved refunds are issued to the original payment method and typically process within **5 to 10 business days**.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
