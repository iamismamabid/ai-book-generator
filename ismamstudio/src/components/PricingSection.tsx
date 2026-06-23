"use client";

import { useState } from "react";
import { Check, Sparkles, Shield, Zap, ChevronDown, HelpCircle, Star, Award, CreditCard } from "lucide-react";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: "Starter Creator",
      description: "Perfect for hobbyists & beginner publishers starting their KDP journey.",
      priceMonthly: 9,
      priceAnnual: 7,
      popular: false,
      features: [
        "10+ Standard KDP Layout Templates",
        "Generate up to 5 AI Novel Chapters / mo",
        "Easy & Medium Sudoku puzzle generator",
        "Square-masked maze layouts",
        "Standard vector PDF exports (6\"x9\", 8.5\"x11\")",
        "Basic interior layout adjustments",
        "Email support (24-48h response)",
      ],
      ctaText: "Start Designing",
      colorClass: "bg-slate-950/60 hover:border-slate-700",
      borderClass: "border-slate-800/80",
      icon: <Star className="w-6 h-6 text-slate-400" />,
    },
    {
      name: "Pro Studio",
      description: "Everything you need to compile, format, and sell low/medium content books.",
      priceMonthly: 19,
      priceAnnual: 15,
      popular: true,
      features: [
        "Unlimited Sudoku puzzles (Easy, Med, Hard)",
        "Unlimited Labyrinth designs (Circle, Heart shapes)",
        "Unlimited Word Search boards & CSV imports",
        "Unlimited AI Novel Story Chapters (Llama 3.3 Turbo)",
        "Premium Cover & Interior Canvas Studio",
        "100% Commercial-use rights (Keep all royalties)",
        "DPI-optimized PDF Merger & bleed calculators",
        "Priority Customer Support (under 12 hours)",
      ],
      ctaText: "Get Pro Access",
      // White background for maximum attention in dark theme, glowing yellow-rose-sky shadow!
      colorClass: "bg-white text-slate-900 shadow-[0_20px_50px_rgba(245,158,11,0.25),_0_0_30px_rgba(56,189,248,0.15)]",
      borderClass: "border-amber-400 border-2",
      icon: <Zap className="w-6 h-6 text-amber-500 animate-bounce" />,
    },
    {
      name: "Publisher Agency",
      description: "Scale your publishing business with multiple brands and API access.",
      priceMonthly: 39,
      priceAnnual: 31,
      popular: false,
      features: [
        "Everything in Pro Studio plan",
        "Unlimited Brand profiles & pen-names",
        "Priority AI generation queues (No limits)",
        "Vector SVG & source files exports",
        "Advanced custom shapes & interior styling",
        "Up to 3 team member account seats",
        "Beta access to upcoming KDP niche research tool",
        "API access for automated generation",
      ],
      ctaText: "Go Agency Pro",
      colorClass: "bg-slate-950/60 hover:border-slate-700",
      borderClass: "border-slate-800/80",
      icon: <Award className="w-6 h-6 text-slate-400" />,
    },
  ];

  const faqs = [
    {
      q: "Are the generated interiors ready to upload directly to Amazon KDP?",
      a: "Yes! All interior templates, mazes, word searches, and Sudokus automatically export as high-fidelity, print-ready vector PDFs that respect KDP guidelines, including precise trim sizes (6\"x9\", 8.5\"x11\"), interior bleed requirements, and gutter safety margins.",
    },
    {
      q: "Do I own the commercial copyrights for the books and puzzles I create?",
      a: "Absolutely. When subscribing to any of our plans (including Starter and Pro), you receive full commercial rights to publish and sell the generated books, interiors, covers, and puzzles anywhere, including Amazon KDP, Etsy, or your own site. You keep 100% of the royalties.",
    },
    {
      q: "Can I cancel, upgrade, or downgrade my subscription at any time?",
      a: "Yes, you can manage your subscription easily from your billing panel. You can cancel at any time, and you will retain access to your plan until the end of your billing cycle. There are no cancellation fees or hidden lock-ins.",
    },
    {
      q: "How does the AI Novel Writer generate chapters?",
      a: "We utilize advanced Llama-3 API nodes that run low-latency story outlines, character structures, and full text-chapter expansions based on your prompts. The exports are seamlessly integrated into the PDF compiler so you don't need to manually copy/paste text.",
    },
    {
      q: "Is there a money-back guarantee?",
      a: "Yes, we support a 30-day money-back guarantee for all new members. If KDP Master Studio doesn't fit your book-publishing workflow, just drop us an email within 30 days and we will issue a full refund—no questions asked.",
    },
  ];

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
      
      {/* 🔮 Glow highlights with a yellowish, red, and light blue blend */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        {/* Attracting marketing badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-sky-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Limited Time Launch Offer
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Create profitable books with ease. Choose a plan that matches your publishing scale.
        </p>

        {/* Toggle Switch with yellowish-white gradient styling */}
        <div className="mt-10 inline-flex items-center gap-2 bg-slate-950/80 p-2 rounded-full border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-3 rounded-full text-sm font-black transition-all ${
              !isAnnual
                ? "bg-gradient-to-r from-amber-400 via-white to-slate-100 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-3 rounded-full text-sm font-black transition-all relative flex items-center gap-2 ${
              isAnnual
                ? "bg-gradient-to-r from-amber-400 via-white to-slate-100 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24 relative">
        {plans.map((plan, index) => {
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
          const billingText = isAnnual ? "billed annually" : "billed monthly";
          
          return (
            <div
              key={index}
              className={`group relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 border backdrop-blur-md ${
                plan.colorClass
              } ${plan.borderClass}`}
            >
              {plan.popular && (
                /* Marketing Gradient Tag: Yellowish + Rose (Red) + Sky (Light Blue) */
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400 text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl border shadow-inner ${
                    plan.popular 
                      ? "bg-slate-50 border-slate-200" 
                      : "bg-slate-900/80 border-slate-800"
                  }`}>
                    {plan.icon}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    plan.popular
                      ? "text-amber-600 bg-amber-500/5 border-amber-500/10"
                      : "text-slate-500 bg-slate-950/50 border-slate-900"
                  }`}>
                    KDP Tier
                  </span>
                </div>

                <h3 className={`text-2xl font-black mb-2 ${plan.popular ? "text-slate-950" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm font-semibold mb-6 leading-relaxed min-h-[40px] ${
                  plan.popular ? "text-slate-600" : "text-slate-400"
                }`}>
                  {plan.description}
                </p>

                {/* Price Display - Stands out with white/dark contrast */}
                <div className="mb-8 flex items-baseline gap-1">
                  <span className={`text-6xl font-black tracking-tight ${
                    plan.popular ? "text-slate-950" : "text-white"
                  }`}>
                    ${price}
                  </span>
                  <span className={`font-bold text-sm ${plan.popular ? "text-slate-500" : "text-slate-400"}`}>
                    / month
                  </span>
                  <span className={`text-xs font-bold block ml-2 self-center px-2 py-1 rounded-md ${
                    plan.popular
                      ? "text-amber-700 bg-amber-500/10"
                      : "text-indigo-400 bg-indigo-500/10"
                  }`}>
                    {billingText}
                  </span>
                </div>

                {/* Divider */}
                <div className={`h-px mb-8 ${
                  plan.popular 
                    ? "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
                    : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
                }`} />

                {/* Features Checklist */}
                <ul className="space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className={`flex items-start gap-3 font-semibold text-sm leading-snug ${
                      plan.popular ? "text-slate-700" : "text-slate-300"
                    }`}>
                      <div className={`mt-0.5 p-0.5 rounded-full border shrink-0 ${
                        plan.popular
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button: Glowing Marketing Gradient for Popular Plan */}
              <div className="mt-8">
                <button
                  className={`w-full py-4.5 rounded-2xl font-black text-base transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 via-rose-500 to-sky-400 text-white hover:opacity-90 shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {plan.ctaText}
                  <Zap className="w-4 h-4 shrink-0 opacity-80" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛡️ Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        
        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1">Commercial Rights</h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Keep 100% of your Amazon royalties. All interiors are licensed for print-on-demand.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1">Instant Generation</h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Generate fully populated books and vector mazes in less than 30 seconds.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/10">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1">No Contract, Cancel Anytime</h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Pause or cancel your subscription directly from your billing panel with a single click.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/10">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1">30-Day Guarantee</h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Not satisfied? Drop us an email within 30 days and get an immediate 100% refund.
            </p>
          </div>
        </div>

      </div>

      {/* ❓ Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto border-t border-slate-900/60 pt-20">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-[0.25em] mb-3">
            <HelpCircle className="w-4 h-4" /> Got Questions?
          </div>
          <h3 className="text-3xl font-black text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-950/30 border border-slate-900 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-black text-white hover:text-amber-300 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

                {/* Pure CSS transition grid to avoid frame motion vendor chunk import errors */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-1 text-slate-400 text-sm font-semibold leading-relaxed border-t border-slate-900/30">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
