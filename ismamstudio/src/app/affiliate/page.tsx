import Link from "next/link";
import { ArrowLeft, Sparkles, DollarSign, Award, Target, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program | Earn with Ismam Studio",
  description: "Join the Ismam Studio Affiliate Program. Promote our KDP book-creation platform and earn a recurring 30% lifetime commission on every referral.",
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Affiliate Console */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10">

          <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Affiliate Program
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Earn 30% Lifetime Commission
              </h1>
              <p className="text-slate-400 text-sm font-semibold mt-1">
                Partner with Ismam Studio and promote the most complete KDP publishing toolkit.
              </p>
            </div>
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/25 shrink-0">
              <DollarSign className="w-10 h-10" />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          {/* Core Perks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/10 w-fit">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">30% Lifetime Cut</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Earn 30% of every monthly or annual payment made by users you refer. Recurring every single month.
              </p>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-purple-600/10 rounded-xl text-purple-400 border border-purple-500/10 w-fit">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">60-Day Cookies</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Our tracking cookies last 60 days. If your referral signs up within 60 days of their click, you get credited.
              </p>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-400 border border-emerald-500/10 w-fit">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">Partner Support</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Access banners, custom copy, outline templates, and visual screenshots to make promotion effortless.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-black text-white">How It Works</h2>
            <ol className="list-decimal list-inside pl-2 space-y-3 text-slate-300 text-xs md:text-sm font-semibold">
              <li>
                <strong>Apply:</strong> Sign up for our affiliate partner console using your email. Application reviews take &lt; 24 hours.
              </li>
              <li>
                <strong>Share:</strong> Place your unique referral link in YouTube video descriptions, blog posts, or social media.
              </li>
              <li>
                <strong>Earn:</strong> Track clicks, signups, and commission payouts in real time from your partner dashboard.
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="pt-4 flex justify-center">
            <a
              href="https://ismamstudio.partneroapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-xl text-center shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 hover:opacity-90 transition"
            >
              Apply to Partner Program <Zap className="w-4 h-4" />
            </a>

          </div>

        </div>
      </div>
    </div>
  );
}
