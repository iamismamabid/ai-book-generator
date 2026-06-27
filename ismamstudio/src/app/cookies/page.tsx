"use client";

import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicyPage() {
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
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Cookie Policy</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-8 text-slate-300 text-sm font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently, improve user experience, and provide information to site owners.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. How We Use Cookies</h2>
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-400">
                <li>**Essential/Strictly Necessary Cookies**: These cookies are required for the core operations of the site, including Clerk session authentication and theme settings.</li>
                <li>**Performance & Analytics Cookies**: These help us understand how users interact with our puzzle builders so we can optimize tool responsiveness and layout speed.</li>
                <li>**Preference Cookies**: Used to store user settings on the canvas (e.g., last-used trim sizes or page counts).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. Managing and Disabling Cookies</h2>
              <p>
                Most web browsers allow you to manage cookie preferences through their settings. You can choose to block or delete cookies, but doing so may prevent you from logging in or using the canvas tools correctly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Contact Us</h2>
              <p>
                If you have any questions regarding our use of cookies, please reach out to us at **support@ismamstudio.me**.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
