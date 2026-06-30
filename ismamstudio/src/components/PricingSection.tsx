import { useState, useEffect, Suspense } from "react";
import { Check, Sparkles, Shield, Zap, ChevronDown, HelpCircle, Star, Award, CreditCard, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

function PricingSectionInner() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load Paddle script dynamically and initialize
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Paddle) {
        const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox";
        if (env === "sandbox") {
          (window as any).Paddle.Environment.set("sandbox");
        }
        (window as any).Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "test_token_placeholder",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = (planKey: string) => {
    const isAnnualBilling = isAnnual;
    const planIdKey = `${planKey}_${isAnnualBilling ? "annual" : "monthly"}`;

    const priceIds: Record<string, string | undefined> = {
      "starter_monthly": process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY,
      "starter_annual": process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL,
      "pro_monthly": process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY,
      "pro_annual": process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL,
      "agency_monthly": process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY,
      "agency_annual": process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL,
    };

    const selectedPriceId = priceIds[planIdKey];

    if (!userId) {
      // Redirect to signup and pass callback checkout parameter
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/pricing?checkout=${planKey}&billing=${isAnnualBilling ? "annual" : "monthly"}`)}`);
      return;
    }

    if (selectedPriceId && (window as any).Paddle) {
      (window as any).Paddle.Checkout.open({
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
      });
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
        setIsAnnual(isAnnualBilling);
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
        "Access to basic puzzle generators",
        "Watermarked PDF exports (Sample only)",
        "Easy Sudoku generator",
        "Square-masked maze layouts",
        "1 AI Writer Novel Outline / mo",
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
      ctaLink: "/sign-up?plan=starter",
      planKey: "starter"
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
      priceAnnual: 31,
      popular: false,
      features: [
        "Everything in Pro Studio plan",
        "Unlimited Brand profiles & pen-names",
        "Priority AI generation queues (No limits)",
        "Vector SVG & source files exports",
        "Advanced custom shapes & interior styling",
        "Up to 3 team member account seats",
        "Full access to AI KDP Niche Hunter & Keyword Spy with priority data updates",
        "API access for automated generation",
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
      a: "Yes! All interior templates, mazes, word searches, and Sudokus automatically export as high-fidelity, print-ready vector PDFs that respect KDP guidelines, including precise trim sizes (6\"x9\", 8.5\"x11\"), interior bleed requirements, and gutter safety margins.",
    },
    {
      q: "Do I own the commercial copyrights for the books and puzzles I create?",
      a: "Absolutely. When subscribing to any of our paid plans (Starter, Pro, Agency), you receive full commercial rights to publish and sell the generated books, interiors, covers, and puzzles anywhere, including Amazon KDP, Etsy, or your own site. You keep 100% of the royalties. The Free Tier is for personal testing only.",
    },
    {
      q: "Can I cancel, upgrade, or downgrade my subscription at any time?",
      a: "Yes, you can manage your subscription easily from your billing panel. You can cancel at any time, and you will retain access to your plan until the end of your billing cycle. There are no cancellation fees or hidden lock-ins.",
    },
    {
      q: "How does the AI Novel Writer generate chapters?",
      a: "We utilize advanced Llama-3 API nodes that run low-latency story outlines, character structures, and full text-chapter expansions based on your prompts. The outlines and text outputs are saved directly to your library so you can edit and compile them into your final book layout.",
    },
    {
      q: "Is there a money-back guarantee?",
      a: "Yes, we support a 30-day money-back guarantee for all new members. If Ismam Studio doesn't fit your book-publishing workflow, just drop us an email within 30 days and we will issue a full refund—no questions asked.",
    },
    {
      q: "Do the puzzle books include solution keys?",
      a: "Yes. All our puzzle engines (Sudoku, Maze, Word Search) automatically compile solutions. For example, mazes generate solution maps, Sudokus output standard 9x9 resolved grids, and word searches include highlight coordinate answers. These are neatly appended to the back of the exported PDF.",
    },
    {
      q: "What trim sizes does Ismam Studio support?",
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
      q: "Can I use Ismam Studio on a tablet or mobile device?",
      a: "Yes, our studio layout features a responsive viewport canvas. While desktop screens are recommended for complex drag-and-drop cover alignments, you can easily generate puzzles, draft stories, and check your dashboard library from any iPad, tablet, or phone.",
    },
  ];

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

        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Create profitable books with ease. Choose a plan that matches your publishing scale.
        </p>

        {/* Toggle Switch */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch mb-24 relative">
        {plans.map((plan, index) => {
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
          const billingText = plan.priceMonthly === 0 ? "forever free" : isAnnual ? "billed annually" : "billed monthly";
          const billingParam = isAnnual && plan.priceMonthly !== 0 ? "&billing=annual" : "";
          const ctaHref = plan.priceMonthly === 0 ? plan.ctaLink : `${plan.ctaLink}${billingParam}`;
          
          return (
            <div
              key={index}
              className={`group relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 border backdrop-blur-md ${
                plan.colorClass
              } ${plan.borderClass}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400 text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 z-10 shrink-0">
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

                {/* Price Display */}
                <div className="mb-8 flex items-baseline gap-1">
                  <span className={`text-6xl font-black tracking-tight ${
                    plan.popular ? "text-slate-950" : "text-white"
                  }`}>
                    ${price}
                  </span>
                  <span className={`font-bold text-sm ${plan.popular ? "text-slate-500" : "text-slate-400"}`}>
                    / month
                  </span>
                  <span className={`text-[10px] font-bold block ml-2 self-center px-2 py-1 rounded-md uppercase tracking-wider ${
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

              {/* Action Button */}
              <div className="mt-8">
                {plan.planKey === "free" ? (
                  <Link
                    href={ctaHref}
                    className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 via-rose-500 to-sky-400 text-white hover:opacity-90 shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-350 dark:text-slate-300 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {plan.ctaText}
                    <Zap className="w-4 h-4 shrink-0 opacity-80" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey)}
                    className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-98 shadow-md flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 via-rose-500 to-sky-400 text-white hover:opacity-90 shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-350 dark:text-slate-300 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {plan.ctaText}
                    <Zap className="w-4 h-4 shrink-0 opacity-80" />
                  </button>
                )}
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
            <h4 className="text-white font-black text-base mb-1">No Contract, Cancel</h4>
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

      {/* 🔒 Secure Payment trust badges */}
      <div className="max-w-2xl mx-auto text-center mb-20 -mt-12 bg-slate-900/30 border border-slate-900/65 p-5 rounded-[2rem] backdrop-blur-sm">
        <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.25em] block mb-3.5">Guaranteed Safe & Secure Checkout</span>
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-400" /> Paddle Checkout</div>
          <div className="w-1 h-1 rounded-full bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">📱 Apple Pay & Google Pay</div>
          <div className="w-1 h-1 rounded-full bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">✨ Visa / Mastercard / Amex</div>
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
          <tbody className="text-slate-350 font-semibold">
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
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

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

export default function PricingSection() {
  return (
    <Suspense fallback={
      <div className="min-h-[500px] flex items-center justify-center text-slate-400 font-semibold uppercase tracking-wider text-xs">
        Loading Pricing Panel...
      </div>
    }>
      <PricingSectionInner />
    </Suspense>
  );
}
