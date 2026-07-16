"use client";

import posthog from "posthog-js";
import { useState, useEffect, Suspense } from "react";
import { Check, Sparkles, Shield, Zap, ChevronDown, HelpCircle, Star, Award, CreditCard, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

function PricingSectionInner() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to clean environment variables from quotes at runtime
  const cleanEnv = (val: string | undefined) => {
    if (!val) return "";
    return val.replace(/['"]/g, "").trim();
  };

  // Load Paddle script dynamically and initialize
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Paddle) {
        const env = cleanEnv(process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT) || "sandbox";
        if (env === "sandbox") {
          (window as any).Paddle.Environment.set("sandbox");
        }
        (window as any).Paddle.Initialize({
          token: cleanEnv(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) || "test_token_placeholder",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = (planKey: string) => {
    const isAnnualBilling = billingCycle === 'annual';
    posthog.capture("checkout_initiated", {
      plan: planKey,
      billing_cycle: isAnnualBilling ? "annual" : "monthly",
    });
    const planIdKey = `${planKey}_${isAnnualBilling ? "annual" : "monthly"}`;

    const priceIds: Record<string, string | undefined> = {
      "starter_monthly": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY),
      "starter_annual": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL),
      "pro_monthly": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY),
      "pro_annual": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL),
      "agency_monthly": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY),
      "agency_annual": cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL),
    };

    const selectedPriceId = priceIds[planIdKey];

    if (!userId) {
      // Redirect to signup and pass callback checkout parameter
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/pricing?checkout=${planKey}&billing=${isAnnualBilling ? "annual" : "monthly"}`)}`);
      return;
    }

    if (selectedPriceId && (window as any).Paddle) {


      // Get Partnero referral / partner ID
      let customerKey = null;
      if (typeof window !== "undefined") {
        const partneroQueryParam = 'aff';
        const partneroCookieName = 'partnero_partner';

        // 1. Check URL query params
        customerKey = new URLSearchParams(window.location.search).get(partneroQueryParam);

        // 2. Fallback to cookies
        if (!customerKey) {
          const cookieArr = document.cookie.split(";").map(cookie => cookie.trim());
          for (const cookie of cookieArr) {
            const [cookieName, cookieValue] = cookie.split("=");
            if (partneroCookieName === cookieName) {
              customerKey = decodeURIComponent(cookieValue);
              break;
            }
          }
        }
      }

      const checkoutOptions: any = {
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en"
        },
        items: [
          {
            priceId: selectedPriceId,
            quantity: 1
          }
        ]
      };

      checkoutOptions.customData = {
        userId: userId,
        ...(customerKey ? { customer_key: customerKey } : {})
      };



      (window as any).Paddle.Checkout.open(checkoutOptions);
    } else {
      // Fallback
      router.push("/studio");
    }
  };

  // Trigger auto-checkout if redirected from signup page with credentials
  useEffect(() => {
    const checkoutParam = searchParams.get("checkout");
    const billingParam = searchParams.get("billing");
    if (checkoutParam && userId) {
      const timer = setTimeout(() => {
        const isAnnualBilling = billingParam === "annual";
        setBillingCycle(isAnnualBilling ? 'annual' : 'monthly');
        handleCheckout(checkoutParam);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, userId]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: "Free Tier",
      description: "Test drive our creation engines and explore the workspace parameters.",
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        "Access to 8+ KDP creation tools",
        "Watermarked PDF exports (Sample only)",
        "Easy Sudoku & basic Word Search tools",
        "Square maze & basic outline tools",
        "1 AI Writer Outline / mo",
        "Personal use only (No KDP sales)",
        "Community support forum",
      ],
      ctaText: "Start Designing Free",
      colorClass: "bg-slate-950/40 hover:border-slate-800",
      borderClass: "border-slate-900",
      icon: <HelpCircle className="w-6 h-6 text-slate-500" />,
      ctaLink: "/sign-up",
      planKey: "free"
    },
    {
      name: "Starter Creator",
      description: "Perfect for hobbyists & beginner publishers starting their KDP journey.",
      priceMonthly: 9,
      priceMonthlyOriginal: 11,
      priceAnnual: 7,
      priceAnnualOriginal: 9,
      popular: false,
      features: [
        "Full Commercial Rights (Keep 100% royalties)",
        "Watermark-free vector PDF exports",
        "Up to 3 brand & pen-name profiles",
        "Standard trim sizes (6\"x9\", 8.5\"x11\")",
        "Easy & Medium Sudoku & Word Search",
        "Square mazes, Kakuros & Cryptograms",
        "Generate up to 5 AI Chapters / mo",
        "Email support (24-48h response)",
      ],
      ctaText: "Start Designing",
      colorClass: "bg-slate-950/60 hover:border-slate-700",
      borderClass: "border-slate-800/80",
      icon: <Star className="w-6 h-6 text-slate-400" />,
      ctaLink: "/sign-up?plan=starter",
      planKey: "starter"
    },
    {
      name: "Pro Studio",
      description: "Everything you need to compile, format, and sell low/medium content books.",
      priceMonthly: 19,
      priceMonthlyOriginal: 24,
      priceAnnual: 15,
      priceAnnualOriginal: 19,
      popular: true,
      features: [
        "Watermark-free PDF exports (All sizes + Custom)",
        "100% Commercial-use rights (Keep all royalties)",
        "Unlimited Brand profiles & pen-names",
        "Unlimited Sudoku puzzles (Easy, Med, Hard)",
        "Unlimited Labyrinth designs (Circle, Heart shapes)",
        "Unlimited Word Search, Cryptogram & Scramble",
        "Unlimited Math Puzzles, Kakuro & outline tools",
        "Premium Cover & Interior Canvas Studio",
        "Priority Customer Support (under 12 hours)",
      ],
      ctaText: "Get Pro Access",
      colorClass: "bg-white text-slate-900 shadow-[0_20px_50px_rgba(245,158,11,0.25),_0_0_30px_rgba(56,189,248,0.15)]",
      borderClass: "border-amber-400 border-2",
      icon: <Zap className="w-6 h-6 text-amber-500 animate-bounce" />,
      ctaLink: "/sign-up?plan=pro",
      planKey: "pro"
    },
    {
      name: "Publisher Agency",
      description: "Scale your publishing business with multiple brands and API access.",
      priceMonthly: 39,
      priceMonthlyOriginal: 49,
      priceAnnual: 31,
      priceAnnualOriginal: 39,
      popular: false,
      features: [
        "Everything in Pro Studio plan",
        "Up to 3 team member account seats",
        "Vector SVG & source file exports",
        "Advanced custom shapes & interior styling",
        "AI KDP Niche Hunter & Keyword Spy",
        "Priority AI generation queues (No limits)",
        "API access for automated generation",
        "Dedicated customer support manager",
      ],
      ctaText: "Go Agency Pro",
      colorClass: "bg-slate-950/60 hover:border-slate-700",
      borderClass: "border-slate-800/80",
      icon: <Award className="w-6 h-6 text-slate-400" />,
      ctaLink: "/sign-up?plan=agency",
      planKey: "agency"
    },
  ];



  const faqs = [
    {
      q: "Are the generated interiors ready to upload directly to Amazon KDP?",
      a: "Yes! All interior templates, mazes, word searches, and Sudokus export as high-fidelity, print-ready vector PDFs that respect KDP guidelines, including precise trim sizes (6\"x9\", 8.5\"x11\"), interior bleed requirements, and gutter safety margins.",
    },
    {
      q: "Do I own the commercial copyrights for the books and puzzles I create?",
      a: "Absolutely. When subscribing to any of our paid plans (Starter, Pro, Agency) or AppSumo Lifetime Deals, you receive full commercial rights to publish and sell the generated books, interiors, covers, and puzzles anywhere, including Amazon KDP, Etsy, or your own site. You keep 100% of the royalties. The Free Tier is for personal testing only.",
    },
    {
      q: "Can I cancel, upgrade, or downgrade my subscription at any time?",
      a: "Yes, you can manage your recurring SaaS subscription easily from your billing panel. You can cancel at any time, and you will retain access to your plan until the end of your billing cycle. For AppSumo lifetime deals, tier upgrades and license management are handled directly via your AppSumo portal.",
    },
    {
      q: "How does the AppSumo deal work? Is there a monthly subscription?",
      a: "By purchasing the AppSumo Lifetime Deal (LTD), you pay a one-time fee with absolutely no recurring charges or monthly subscription costs. You get lifetime access to all core generators, editors, and future updates. AppSumo buyers are covered by AppSumo's standard 60-day money-back guarantee, which overrides our standard 7-day SaaS refund policy for these promotional licenses.",
    },
    {
      q: "Is there a money-back guarantee?",
      a: "Yes, we support a 7-day money-back guarantee for all direct recurring monthly/annual subscription plans. For AppSumo lifetime deal buyers, the refund window is extended to AppSumo's standard 60-day refund policy, managed directly through your AppSumo billing dashboard.",
    },
    {
      q: "Do the puzzle books include solution keys?",
      a: "Yes. All our puzzle engines (Sudoku, Maze, Word Search) automatically compile solutions. Our Sudokus are generated with a backtracking solver that mathematically guarantees a single unique solution per grid. Solution keys are neatly appended to the back of the exported PDF.",
    },
    {
      q: "Do you have an ISBN Barcode Generator for book covers?",
      a: "Yes! We provide a 100% free, print-ready ISBN Barcode Generator that creates EAN-13 barcodes with optional EAN-5 price supplements, check digit validation, and custom color settings. You can download these as high-resolution 300 DPI PNGs or vector SVGs to place directly on your cover.",
    },
    {
      q: "What trim sizes does KDPage support?",
      a: "We support all major industry standards: 6\"x9\" (most popular for novels & standard books), 8.5\"x11\" (standard for large print puzzles, coloring sheets, and children's activity books), and 5\"x8\" (standard pocket size). Our canvas editor also allows custom dimension adjustments.",
    },
    {
      q: "What is the difference between bleed and no-bleed pages?",
      a: "Bleed refers to page elements (backgrounds, lines, illustrations) that stretch beyond the trim edge of the page, ensuring no white spaces remain after cutting. Our generators calculate the safety bleed (usually adding 0.125\" to the outer edges) automatically depending on your selection.",
    },
    {
      q: "Can I upload custom word lists for the Word Search generator?",
      a: "Yes! You can upload custom word lists via CSV files or type them in manually. Our engine will dynamically check character counts, fit them inside the selected grid dimensions, and generate the final puzzles.",
    },
    {
      q: "Can I use KDPage on a tablet or mobile device?",
      a: "Yes, our studio layout features a responsive viewport canvas. While desktop screens are recommended for complex drag-and-drop cover alignments, you can easily generate puzzles, draft stories, and check your dashboard library from any iPad, tablet, or phone.",
    },
  ];

  const renderPricingCard = (plan: any, isLtd: boolean) => {
    const price = isLtd ? plan.price : (billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly);
    const billingText = isLtd ? "one-time payment" : plan.priceMonthly === 0 ? "forever free" : billingCycle === 'annual' ? "billed annually" : "billed monthly";
    const billingParam = billingCycle === 'annual' && plan.priceMonthly !== 0 ? "&billing=annual" : "";
    const ctaHref = isLtd ? plan.ctaLink : plan.priceMonthly === 0 ? plan.ctaLink : `${plan.ctaLink}${billingParam}`;
    const originalPrice = isLtd ? plan.originalPrice : (billingCycle === 'annual' ? plan.priceAnnualOriginal : undefined);

    return (
      <div
        key={plan.name}
        className={`group relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 border backdrop-blur-md ${plan.colorClass
          } ${plan.borderClass} ${!plan.popular ? "hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),_inset_0_0_12px_rgba(99,102,241,0.2)]" : ""
          }`}
      >
        {plan.popular && (
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg border border-amber-400/25 flex items-center gap-1.5 z-10 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            Most Popular
          </div>
        )}

        <div>
          {/* Plan Header */}
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl border shadow-inner ${plan.popular
                ? "bg-slate-55 border-slate-200"
                : "bg-slate-900/80 border-slate-800"
              }`}>
              {plan.icon}
            </div>
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${plan.popular
                ? "text-slate-500 bg-slate-100 border-slate-200"
                : "text-slate-500 bg-slate-950/50 border-slate-900"
              }`}>
              {isLtd ? "Lifetime Deal" : "KDP Tier"}
            </span>
          </div>

          <h3 className={`text-2xl font-black mb-2 ${plan.popular ? "text-slate-950" : "text-white"}`}>
            {plan.name}
          </h3>
          <p className={`text-sm font-semibold mb-6 leading-relaxed min-h-[40px] ${plan.popular ? "text-slate-600" : "text-slate-300"
            }`}>
            {plan.description}
          </p>

          {/* Price Display */}
          <div className="mb-8 flex items-baseline gap-2 flex-wrap">
            {originalPrice && (
              <span className={`text-2xl font-black line-through self-end pb-1.5 opacity-55 ${plan.popular ? "text-slate-600" : "text-slate-500"}`}>
                ${originalPrice}
              </span>
            )}
            <span className={`text-6xl font-black tracking-tight ${plan.popular ? "text-slate-950" : "text-white"
              }`}>
              ${price}
            </span>
            {!isLtd && (
              <span className={`font-bold text-sm ${plan.popular ? "text-slate-500" : "text-slate-300"}`}>
                / month
              </span>
            )}
            <span className={`text-[10px] font-bold block ml-2 self-center px-2 py-1 rounded-md uppercase tracking-wider ${plan.popular
                ? "text-amber-700 bg-amber-500/10"
                : "text-teal-400 bg-teal-500/10"
              }`}>
              {billingText}
            </span>
          </div>

          {/* Divider */}
          <div className={`h-px mb-8 ${plan.popular
              ? "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
              : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
            }`} />

          {/* Features Checklist */}
          <ul className="space-y-4">
            {plan.features.map((feature: any, fIndex: number) => (
              <li key={fIndex} className={`flex items-start gap-3 font-semibold text-sm leading-snug ${plan.popular ? "text-slate-700" : "text-slate-300"
                }`}>
                <div className={`mt-0.5 p-0.5 rounded-full border shrink-0 ${plan.popular
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {isLtd ? (
            <Link
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${plan.popular
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 dark:text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
            >
              {plan.ctaText}
              <Zap className="w-4 h-4 shrink-0 opacity-80" />
            </Link>
          ) : plan.planKey === "free" ? (
            <Link
              href={ctaHref}
              className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${plan.popular
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 dark:text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
            >
              {plan.ctaText}
              <Zap className="w-4 h-4 shrink-0 opacity-80" />
            </Link>
          ) : (
            <button
              onClick={() => handleCheckout(plan.planKey)}
              className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${plan.popular
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 dark:text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
            >
              {plan.ctaText}
              <Zap className="w-4 h-4 shrink-0 opacity-80" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">

      {/* 🔮 Glow highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-sky-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Limited Time Launch Offer
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Create profitable books with ease. Choose a plan that matches your publishing scale.
        </p>

        {/* Toggle Switch */}
        <div className="mt-10 inline-flex items-center gap-2 bg-slate-950/80 p-2 rounded-full border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-black transition-all ${billingCycle === 'monthly'
                ? "bg-gradient-to-r from-amber-400 via-white to-slate-100 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-black transition-all relative flex items-center gap-1.5 ${billingCycle === 'annual'
                ? "bg-gradient-to-r from-amber-400 via-white to-slate-100 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
              }`}
          >
            <span>Annual</span>
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[8px] uppercase px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div 
        style={{ display: billingCycle === 'monthly' ? 'grid' : 'none' }}
        className="grid grid-cols-1 items-stretch mb-24 relative md:grid-cols-2 xl:grid-cols-4 gap-8"
      >
        {plans.map((plan) => renderPricingCard(plan, false))}
      </div>

      {/* Annual Grid */}
      <div 
        style={{ display: billingCycle === 'annual' ? 'grid' : 'none' }}
        className="grid grid-cols-1 items-stretch mb-24 relative md:grid-cols-2 xl:grid-cols-4 gap-8"
      >
        {plans.map((plan) => renderPricingCard(plan, false))}
      </div>

      {/* 🛡️ Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border-t-2 border-amber-500 border-x border-b border-x-slate-800 border-b-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-xl shadow-black/40">
          <div className="p-3 bg-amber-500/15 rounded-2xl text-amber-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1.5 tracking-tight">Commercial Rights</h4>
            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Keep 100% of your Amazon royalties. All interiors are licensed for commercial sales.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border-t-2 border-rose-500 border-x border-b border-x-slate-800 border-b-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-xl shadow-black/40">
          <div className="p-3 bg-rose-500/15 rounded-2xl text-rose-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1.5 tracking-tight">Instant Generation</h4>
            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Generate fully populated books and vector mazes in less than 30 seconds.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border-t-2 border-sky-500 border-x border-b border-x-slate-800 border-b-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-xl shadow-black/40">
          <div className="p-3 bg-sky-500/15 rounded-2xl text-sky-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1.5 tracking-tight">No Contract, Cancel</h4>
            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Pause or cancel direct SaaS subscriptions in one click. No hidden lock-ins.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border-t-2 border-emerald-500 border-x border-b border-x-slate-800 border-b-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-xl shadow-black/40">
          <div className="p-3 bg-emerald-500/15 rounded-2xl text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-black text-base mb-1.5 tracking-tight">Reconciled Guarantee</h4>
            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              7-day SaaS guarantee / 60-day AppSumo money-back policy for complete confidence.
            </p>
          </div>
        </div>
      </div>

      {/* 🔒 Secure Payment trust badges */}
      <div className="max-w-2xl mx-auto text-center mb-20 bg-slate-900 border border-slate-700 p-6 rounded-[2rem] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] whitespace-nowrap">🔒 Guaranteed Safe &amp; Secure Checkout</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">Paddle</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-sm">🍎</span>
            <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">Apple Pay</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-sm">🔵</span>
            <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">Google Pay</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-sm">💳</span>
            <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">Visa / MC / Amex</span>
          </div>
        </div>
      </div>

      {/* 📊 Feature Comparison Table */}
      <div className="mb-24 overflow-x-auto rounded-[2rem] border border-slate-900 bg-slate-950/20 backdrop-blur-md p-4 md:p-8">
        <h3 className="text-2xl font-black text-white text-center mb-8">Detailed Feature Comparison</h3>

        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-4 px-4">Core Capabilities</th>
              <th className="py-4 px-4 text-center">Free Tier</th>
              <th className="py-4 px-4 text-center">Starter</th>
              <th className="py-4 px-4 text-center">Pro Studio</th>
              <th className="py-4 px-4 text-center">Agency</th>
            </tr>
          </thead>
          <tbody className="text-slate-300 font-semibold">
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Commercial Rights</td>
              <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-indigo-400 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-amber-500 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Watermark-Free Exports</td>
              <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-indigo-400 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-amber-500 mx-auto" /></td>
              <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Trim Size Adjustments</td>
              <td className="py-4 px-4 text-center">Basic (8.5x11)</td>
              <td className="py-4 px-4 text-center">Standard sizes</td>
              <td className="py-4 px-4 text-center">All sizes + Custom</td>
              <td className="py-4 px-4 text-center">All + Custom + SVGs</td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Sudoku Puzzle Difficulty</td>
              <td className="py-4 px-4 text-center">Easy Only</td>
              <td className="py-4 px-4 text-center">Easy & Medium</td>
              <td className="py-4 px-4 text-center">All (Easy, Med, Hard)</td>
              <td className="py-4 px-4 text-center">All + Custom solutions</td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Maze Layout Shapes</td>
              <td className="py-4 px-4 text-center">Square Only</td>
              <td className="py-4 px-4 text-center">Square Only</td>
              <td className="py-4 px-4 text-center">Square, Circle, Heart</td>
              <td className="py-4 px-4 text-center">All + custom masking</td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">AI Writer Chapter Limits</td>
              <td className="py-4 px-4 text-center">1 Outline/mo</td>
              <td className="py-4 px-4 text-center">5 Chapters/mo</td>
              <td className="py-4 px-4 text-center">Unlimited</td>
              <td className="py-4 px-4 text-center">Unlimited (Priority)</td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Pen-names / Brands</td>
              <td className="py-4 px-4 text-center">1</td>
              <td className="py-4 px-4 text-center">3</td>
              <td className="py-4 px-4 text-center">Unlimited</td>
              <td className="py-4 px-4 text-center">Unlimited</td>
            </tr>
            <tr className="border-b border-slate-900/50 hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Team seats</td>
              <td className="py-4 px-4 text-center">1 Seat</td>
              <td className="py-4 px-4 text-center">1 Seat</td>
              <td className="py-4 px-4 text-center">1 Seat</td>
              <td className="py-4 px-4 text-center">Up to 3 Seats</td>
            </tr>
            <tr className="hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4 font-bold text-white">Customer Support</td>
              <td className="py-4 px-4 text-center">Community</td>
              <td className="py-4 px-4 text-center">Email (48h)</td>
              <td className="py-4 px-4 text-center">Priority (&lt; 12h)</td>
              <td className="py-4 px-4 text-center">Dedicated manager</td>
            </tr>
          </tbody>
        </table>
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
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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

export default function PricingSection() {
  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingSectionInner />
    </Suspense>
  );
}

function PricingSkeleton() {
  const staticPlans = [
    { name: "Free Tier", price: "$0", period: "forever free", features: ["Access to basic puzzle generators", "Watermarked PDF exports (Sample only)", "Easy Sudoku generator", "Square-masked maze layouts", "1 AI Writer Outline / mo", "Community support forum"] },
    { name: "Starter Creator", price: "$9", period: "/ month", features: ["Full Commercial Rights (Keep 100% royalties)", "Watermark-free vector PDF exports", "Up to 3 brand & pen-name profiles", "Standard trim sizes (6\"x9\", 8.5\"x11\")", "Easy & Medium Sudoku puzzle generator", "Generate up to 5 AI Chapters / mo", "Email support (24-48h response)"] },
    { name: "Pro Studio", price: "$19", period: "/ month", popular: true, features: ["Watermark-free PDF exports (All sizes + Custom)", "100% Commercial-use rights", "Unlimited Brand profiles & pen-names", "Unlimited Sudoku puzzles (Easy, Med, Hard)", "Unlimited Labyrinth designs (Circle, Heart shapes)", "Unlimited Word Search boards & CSV imports", "Unlimited AI Chapters (Llama 3.3)", "Premium Cover & Interior Canvas Studio", "Priority Customer Support (under 12 hours)"] },
    { name: "Publisher Agency", price: "$39", period: "/ month", features: ["Everything in Pro Studio plan", "Up to 3 team member account seats", "Vector SVG & source file exports", "Advanced custom shapes & interior styling", "AI KDP Niche Hunter & Keyword Spy", "API access for automated generation", "Dedicated customer support manager"] },
  ];

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-sky-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />Limited Time Launch Offer
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Create profitable books with ease. Choose a plan that matches your publishing scale.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch mb-24">
        {staticPlans.map((plan) => (
          <div key={plan.name} className={`group relative rounded-[2.5rem] p-8 flex flex-col justify-between border backdrop-blur-md ${plan.popular ? 'bg-white text-slate-900 shadow-[0_20px_50px_rgba(245,158,11,0.25)] border-amber-400 border-2' : 'bg-slate-950/40 border-slate-900'}`}>
            {plan.popular && (
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                <Sparkles className="w-3.5 h-3.5" />Most Popular
              </div>
            )}
            <div>
              <h3 className={`text-2xl font-black mb-2 ${plan.popular ? 'text-slate-950' : 'text-white'}`}>{plan.name}</h3>
              <div className="mb-8 flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tight ${plan.popular ? 'text-slate-950' : 'text-white'}`}>{plan.price}</span>
                <span className={`font-bold text-sm ${plan.popular ? 'text-slate-500' : 'text-slate-300'}`}>{plan.period}</span>
              </div>
              <div className={`h-px mb-8 ${plan.popular ? 'bg-slate-200' : 'bg-slate-800'}`} />
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-3 font-semibold text-sm leading-snug ${plan.popular ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-amber-600' : 'text-teal-400'}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/sign-up" className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 ${plan.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}`}>
                Get Started <Zap className="w-4 h-4 shrink-0 opacity-80" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
