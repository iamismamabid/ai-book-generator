"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  Ticket,
  BookOpen,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  HelpCircle,
  Globe,
} from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "License Code / Redemption",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ismamabid.islet@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Trigger mailto fallback with pre-filled content
    const mailtoSubject = encodeURIComponent(`[KDPage Support - ${formData.inquiryType}] ${formData.subject || "Inquiry"}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nInquiry Category: ${formData.inquiryType}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:ismamabid.islet@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 md:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            24/7 Dedicated Support
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            We&apos;re here to help you publish &amp; succeed.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Have questions about your lifetime license, coupon redemption, KDP formatting, or partnerships? Reach out directly—we typically respond within a few hours.
          </p>
        </div>

        {/* Grid: Direct Contact Channels (Left) & Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fast Help & Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Email Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Direct Email Support</h2>
                  <p className="text-xs text-slate-400 font-medium">Fast, direct human response</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold text-slate-200 truncate select-all">
                  ismamabid.islet@gmail.com
                </span>
                <button
                  onClick={handleCopyEmail}
                  type="button"
                  aria-label="Copy email address"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                  title="Copy Email"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Typical response time: Under 4 hours</span>
              </div>
            </div>

            {/* Quick Links / Self Service */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Quick Self-Service
              </h2>

              <div className="space-y-3">
                <Link
                  href="/redeem"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-indigo-300 transition">
                        Redeem License Code
                      </div>
                      <div className="text-[11px] text-slate-400">Activate DealFuel, Dealify, or partner codes</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">Go →</span>
                </Link>

                <Link
                  href="/docs"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-purple-300 transition">
                        Knowledge Base &amp; Docs
                      </div>
                      <div className="text-[11px] text-slate-400">KDP trim sizes, bleed math, &amp; guides</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400">Go →</span>
                </Link>

                <Link
                  href="/faq"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-amber-300 transition">
                        Frequently Asked Questions
                      </div>
                      <div className="text-[11px] text-slate-400">Commercial rights, exports &amp; formats</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Go →</span>
                </Link>
              </div>
            </div>

            {/* Founder & Trust Card */}
            <div className="p-5 rounded-3xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm">
                  IA
                </div>
                <div>
                  <div className="text-xs font-black text-white">Ismam Abid</div>
                  <div className="text-[11px] text-slate-400">Founder &amp; Lead Engineer, KDPage</div>
                </div>
              </div>
              <a
                href="https://www.linkedin.com/in/ismam-abid-edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 text-slate-300 hover:text-white transition"
                title="Connect on LinkedIn"
              >
                <svg className="w-4 h-4 fill-current text-indigo-400" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66a1.66 1.66 0 0 0-1.66-1.66 1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-black text-white">Send Us a Message</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Fill in your details below and we will get back to you promptly.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              {submitted ? (
                <div className="py-12 px-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Message Prepared!</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you! Your email client has been launched with your message. If it did not open automatically, you can always email us directly at <span className="text-indigo-400 font-mono">ismamabid.islet@gmail.com</span>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    >
                      <option value="License Code / Redemption">License Code / Coupon Redemption</option>
                      <option value="Billing & Subscription">Billing &amp; Subscription Inquiry</option>
                      <option value="Bug Report / Technical Issue">Bug Report / Technical Support</option>
                      <option value="Feature Request">Feature Request / Suggestion</option>
                      <option value="Partnership & Marketplace">Partnership &amp; Marketplace Inquiry</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of your question"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe how we can assist you..."
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
