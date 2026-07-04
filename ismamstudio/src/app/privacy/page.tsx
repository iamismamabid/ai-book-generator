import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ismam Studio Help Center",
  description: "Read the Privacy Policy of Ismam Studio. Learn how we collect, use, and protect your personal data when you use our KDP publishing tool.",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Privacy Policy</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-8 text-slate-300 text-sm font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on our platform, subscribe to our services, or interact with our tools. This includes:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>Account credentials (email address, name, profile image) managed via Clerk.</li>
                <li>Billing and transaction data (processed securely through Stripe or Paddle).</li>
                <li>Generated files, including book outlines, covers, and puzzle interiors.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>To provide, maintain, and optimize the book creation tools.</li>
                <li>To manage your account, authentication states, and billing subscriptions.</li>
                <li>To send periodic newsletters, updates, and promotional materials (with a one-click unsubscribe option).</li>
                <li>To protect our platform and users from fraud or malicious activities.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. GDPR Legal Bases for Processing</h2>
              <p>If you reside in the European Economic Area (EEA), our legal basis for collecting and using your personal data depends on the data concerned and the context in which we collect it:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li><strong>Performance of a Contract:</strong> To fulfill our service agreement and provide you with studio tools.</li>
                <li><strong>Consent:</strong> When you opt-in to marketing updates or cookies.</li>
                <li><strong>Legitimate Interests:</strong> To improve our platform security and service quality.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Third-Party Data Processors (Subprocessors)</h2>
              <p>To deliver our services, we share data securely with the following GDPR-compliant subprocessors:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li><strong>Clerk Inc.:</strong> User identity management, authentication, and security services.</li>
                <li><strong>Supabase / Prisma:</strong> Secure hosting and management of our user databases.</li>
                <li><strong>Vercel Inc.:</strong> Hosting of our web applications and serverless backend instances.</li>
                <li><strong>Stripe / Paddle:</strong> Processing transactions and invoice billing securely (PCI-DSS compliant).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. International Data Transfers</h2>
              <p>
                Our infrastructure resides primarily on secure cloud databases in Singapore, the United States, and the European Union. By using our platform, you acknowledge that your information may be transferred and processed in these locations. We protect all transfers using standard contractual clauses (SCCs) to maintain the safety of your personal data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">6. Your Rights under GDPR / CCPA</h2>
              <p>
                As a user, you have complete control over your personal data. Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li><strong>Right of Access & Rectification:</strong> You can view and update your details inside your account profile.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request to delete your account and all associated books by contacting us at support@ismamstudio.me.</li>
                <li><strong>Right to Data Portability:</strong> You can request a copy of all your generated data.</li>
                <li><strong>Right to Restrict Processing:</strong> You can object to processing based on legitimate interests.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">7. Changes to This Privacy Policy</h2>
              <p>
                We reserve the right to modify this privacy policy at any time. Changes will be posted immediately on this page, and the "Last Updated" date will reflect the revision.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
