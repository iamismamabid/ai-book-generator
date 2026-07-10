import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Ismam Studio Help Center",
  description: "Read the Refund Policy of Ismam Studio. Learn about our 7-day money-back guarantee for SaaS subscriptions and 60-day refund policy for AppSumo lifetime deals.",
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

          <div className="space-y-8 text-slate-350 text-sm font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">1. 7-Day Money-Back Guarantee</h2>
              <p>
                We believe in the quality of **Ismam Studio** and want you to be fully satisfied. We support a **7-day money-back guarantee** for all new subscriptions. If our tool does not fit your book publishing workflow, you can request a full refund within 7 days of your initial purchase.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">2. Eligibility for Refunds</h2>
              <p>To request a refund, please ensure:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>Your request is made within exactly 7 days of the subscription payment date.</li>
                <li>This is your first time subscribing to the Platform. Repeat subscriptions are not eligible for the 7-day refund guarantee.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">3. How to Request a Refund</h2>
              <p>
                To request a refund, please send an email to **support@ismamstudio.me** with the subject "Refund Request - [Your Account Email]". Please include your transaction receipt or invoice ID. 
              </p>
              <p>
                Our billing team will review your request and process eligible refunds within 3–5 business days. Once processed, the funds will be returned to your original payment method.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">4. AppSumo Lifetime Deals (LTD)</h2>
              <p>
                For lifetime deal licenses purchased through AppSumo, **AppSumo's standard 60-day money-back guarantee** applies instead of our standard 7-day recurring subscription policy. 
              </p>
              <p>
                All refund requests for AppSumo promotional licenses must be initiated and processed directly through your AppSumo customer portal. Ismam Studio support staff cannot process, issue, or adjust refunds for checkout transactions processed externally by AppSumo.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-white">5. Abuse and Fair Play</h2>
              <p>
                We monitor refund requests to prevent abuse. If we detect that a user is downloading massive quantities of high-resolution PDF interiors and requesting refunds repeatedly, we reserve the right to deny the request and terminate the account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
