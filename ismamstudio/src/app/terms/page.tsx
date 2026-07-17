import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | KDPage Help Center",
  description: "Read the Terms of Service of KDPage. Learn about commercial rights, user responsibilities, and licensing terms for generated books and puzzles.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Terms of Service</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-8 text-slate-300 text-sm font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
              <p>
                By registering, accessing, or using the services provided by **KDPage** (referred to as "the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. Account Responsibility</h2>
              <p>
                You are responsible for safeguarding your account details. Any activity performed under your account is your sole responsibility. You agree to notify us immediately of any unauthorized use or security breaches.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. Commercial Licensing & Rights</h2>
              <p>
                We grant active paid subscribers (Starter Creator, Pro Studio, Publisher Agency) a perpetual, non-exclusive, worldwide, royalty-free license to sell and distribute the interiors, covers, and compile books generated using our engines on marketplaces like Amazon KDP, Etsy, or personal storefronts.
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>You own 100% of the royalties for the books you publish.</li>
                <li>Free Tier users are strictly prohibited from selling or commercially distributing generated files. All Free Tier exports are for personal testing only.</li>
                <li>You may not resell the raw SVGs or template source codes directly. Only final compiled books may be sold.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. User Content and Conduct</h2>
              <p>
                You represent that all text inputs, prompts, custom CSV uploads, or images uploaded to our canvas do not violate third-party copyrights, trademarks, or privacy rights. You may not use the Platform to generate offensive, illegal, or harassing material.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. Service Limitations & Modifications</h2>
              <p>
                We strive to maintain high availability but reserve the right to temporarily suspend, modify, or update parts of the system without prior notice for server maintenance or feature deployment. We are not liable for any losses due to temporary service disruptions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">6. Chapter Writer Content & Ownership Disclosure</h2>
              <p>
                Our Chapter Writer tool utilizes third-party writing engines to outline novel structures, outlines, and chapter texts.
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>**Ownership**: You retain 100% intellectual property ownership and commercial usage rights over all outlines and chapters generated under your account, subject to third-party service license conditions.</li>
                <li>**Content Guidelines**: Generated content is provided on an "as-is" basis. We do not guarantee the absolute accuracy, originality, or quality of the generated outlines, and recommend reviewing all outputs prior to commercial publication.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
