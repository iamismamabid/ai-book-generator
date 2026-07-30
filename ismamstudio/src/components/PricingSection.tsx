"use client";

import posthog from "posthog-js";
import { useState, useEffect, Suspense } from "react";
import { Check, Sparkles, Shield, Zap, ChevronDown, HelpCircle, Star, Award, CreditCard, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

function PricingSectionInner() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to clean environment variables from quotes at runtime
  const cleanEnv = (val: string | undefined) => {
    if (!val) return "";
    return val.replace(/['"]/g, "").trim();
  };

  // Load Paddle script dynamically and initialize
  useEffect(() => {
    const initPaddle = () => {
      if ((window as any).Paddle) {
        const env = cleanEnv(process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT) || "live";
        if (env === "sandbox") {
          (window as any).Paddle.Environment.set("sandbox");
        }
        
        const token = cleanEnv(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
        if (!token) {
          console.warn("Paddle Warning: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing.");
          return;
        }

        const paddleCustomerId = (user?.publicMetadata?.paddleCustomerId as string) || (user?.unsafeMetadata?.paddleCustomerId as string);
        const initOptions: Record<string, any> = {
          token,
          eventCallback: (event: any) => {
            if (event?.name === "checkout.completed") {
              if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                const grandTotal = event?.data?.details?.totals?.grand_total ? event.data.details.totals.grand_total / 100 : 0;
                const currency = event?.data?.currency_code || 'USD';
                const txnId = event?.data?.id;

                (window as any).gtag('event', 'purchase', {
                  transaction_id: txnId,
                  value: grandTotal,
                  currency: currency
                });

                (window as any).gtag('event', 'conversion_event_purchase', {
                  transaction_id: txnId,
                  value: grandTotal,
                  currency: currency
                });

                (window as any).gtag('event', 'conversion_event_purchase_2', {
                  transaction_id: txnId,
                  value: grandTotal,
                  currency: currency
                });

                (window as any).gtag('event', 'conversion', {
                  send_to: (process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || 'AW-18328569670'),
                  value: grandTotal,
                  currency: currency,
                  transaction_id: txnId
                });
              }
              posthog.capture("paddle_checkout_completed", event?.data);

              // Trustpilot JavaScript Review Invitation Trigger (Method 1)
              const customerEmail = event?.data?.customer?.email || (user?.primaryEmailAddress?.emailAddress ?? "");
              const customerName = event?.data?.customer?.name || user?.fullName || "Customer";
              const txnId = event?.data?.id || `PADDLE_${Date.now()}`;

              if (typeof window !== "undefined" && (window as any).tp && customerEmail) {
                try {
                  (window as any).tp("createInvitation", {
                    recipientEmail: customerEmail,
                    recipientName: customerName,
                    referenceId: txnId,
                    source: "PaddleCheckout"
                  });
                  console.log("Trustpilot review invitation queued for:", customerEmail);
                } catch (tpErr) {
                  console.error("Trustpilot Invitation Error:", tpErr);
                }
              }
            }
          }
        };

        if (paddleCustomerId && paddleCustomerId.startsWith("ctm_")) {
          initOptions.pwCustomer = { id: paddleCustomerId };
        }

        try {
          (window as any).Paddle.Initialize(initOptions);
          console.log("Paddle V2 initialized successfully.");
        } catch (err) {
          console.error("Paddle Initialization Error:", err);
        }
      }
    };

    if ((window as any).Paddle) {
      initPaddle();
    } else {
      const existingScript = document.querySelector('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        script.async = true;
        script.onload = initPaddle;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initPaddle);
      }
    }
  }, [user]);

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

    // Multi-source affiliate key lookup (URL params, localStorage, sessionStorage, cookies)
    let customerKey: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        customerKey = urlParams.get('aff') || urlParams.get('via') || urlParams.get('ref') || urlParams.get('partner') || urlParams.get('am_id');

        if (!customerKey) {
          customerKey = localStorage.getItem('partnero_partner') || localStorage.getItem('aff_ref') || sessionStorage.getItem('partnero_partner');
        }

        if (!customerKey) {
          const cookieArr = document.cookie.split(";").map(c => c.trim());
          for (const c of cookieArr) {
            const [cName, cVal] = c.split("=");
            if (cName === 'partnero_partner' || cName === 'aff' || cName === 'via') {
              customerKey = decodeURIComponent(cVal);
              break;
            }
          }
        }
      } catch (e) {
        console.error("Error retrieving affiliate key:", e);
      }
    }

    if (!userId) {
      // Preserve affiliate tracking key during signup redirect
      const affParam = customerKey ? `&aff=${encodeURIComponent(customerKey)}` : "";
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/pricing?checkout=${planKey}&billing=${isAnnualBilling ? "annual" : "monthly"}${affParam}`)}`);
      return;
    }

    if (selectedPriceId && (window as any).Paddle) {
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
        ],
        customData: {
          userId: userId,
          ...(customerKey ? {
            customer_key: customerKey,
            partnero_partner: customerKey,
            aff: customerKey,
            via: customerKey
          } : {})
        }
      };

      try {
        (window as any).Paddle.Checkout.open(checkoutOptions);
      } catch (err) {
        console.error("Paddle Checkout Open Error:", err);
        alert("Could not open checkout. Please check browser console for details.");
      }
    } else {
      console.error("Paddle Checkout Failed:", {
        selectedPriceId,
        paddleLoaded: !!(window as any).Paddle,
        planKey,
        planIdKey,
        configuredPriceIds: priceIds
      });
      if (!selectedPriceId) {
        alert(`Checkout Error: Price ID for '${planIdKey}' is missing in environment variables.`);
      } else {
        alert("Checkout Error: Paddle SDK failed to load. Please refresh the page.");
      }
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
        "1 Creative Outline / mo",
        "Personal use only (No KDP sales)",
        "Community support forum",
      ],
      ctaText: "Start Designing Free",
      colorClass: "bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-800",
      borderClass: "border-slate-200 dark:border-slate-900",
      icon: <HelpCircle className="w-6 h-6 text-slate-500" />,
      ctaLink: "/sign-up",
      planKey: "free"
    },
    {
      name: "Starter Creator",
      description: "Perfect for hobbyists & beginner publishers starting their KDP journey.",
      priceMonthly: 11.99,
      priceMonthlyOriginal: 14.99,
      priceAnnual: 10.75,
      priceAnnualOriginal: 11.99,
      priceAnnualTotal: 129,
      popular: false,
      features: [
        "7-Day Free Trial (Cancel Anytime)",
        "Full Commercial Rights (Keep 100% royalties)",
        "Watermark-free vector PDF exports",
        "Up to 3 brand & pen-name profiles",
        "Standard trim sizes (6\"x9\", 8.5\"x11\")",
        "Easy & Medium Sudoku & Word Search",
        "Square mazes, Kakuros & Cryptograms",
        "25 Vector Line Art Credits / mo",
        "Generate up to 5 Chapters / mo",
        "Email support (24-48h response)",
      ],
      ctaText: "Start 7-Day Free Trial",
      colorClass: "bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700",
      borderClass: "border-slate-200 dark:border-slate-800/80",
      icon: <Star className="w-6 h-6 text-slate-400" />,
      ctaLink: "/sign-up?plan=starter",
      planKey: "starter"
    },
    {
      name: "Pro Studio",
      description: "Everything you need to compile, format, and sell low/medium content books.",
      priceMonthly: 21,
      priceMonthlyOriginal: 26,
      priceAnnual: 18.33,
      priceAnnualOriginal: 21,
      priceAnnualTotal: 220,
      popular: true,
      features: [
        "7-Day Free Trial (Cancel Anytime)",
        "Watermark-free PDF exports (All sizes + Custom)",
        "100% Commercial-use rights (Keep all royalties)",
        "100 Vector Line Art Credits / mo",
        "Unlimited Brand profiles & pen-names",
        "Unlimited Sudoku puzzles (Easy, Med, Hard)",
        "Unlimited Labyrinth designs (Circle, Heart shapes)",
        "Unlimited Word Search, Cryptogram & Scramble",
        "Unlimited Math Puzzles, Kakuro & outline tools",
        "Premium Cover & Interior Canvas Studio",
        "Priority Customer Support (under 12 hours)",
      ],
      ctaText: "Start 7-Day Free Trial",
      colorClass: "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-[0_20px_50px_rgba(245,158,11,0.15),_0_0_30px_rgba(56,189,248,0.1)]",
      borderClass: "border-amber-500 dark:border-amber-400 border-2",
      icon: <Zap className="w-6 h-6 text-amber-500 animate-bounce" />,
      ctaLink: "/sign-up?plan=pro",
      planKey: "pro"
    },
    {
      name: "Publisher Agency",
      description: "Scale your publishing business with multiple brands and API access.",
      priceMonthly: 39,
      priceMonthlyOriginal: 49,
      priceAnnual: 34,
      priceAnnualOriginal: 39,
      priceAnnualTotal: 408,
      popular: false,
      features: [
        "7-Day Free Trial (Cancel Anytime)",
        "Everything in Pro Studio plan",
        "300 Vector Line Art Credits / mo",
        "Up to 3 team member account seats",
        "Vector SVG & source file exports",
        "Advanced custom shapes & interior styling",
        "KDP Niche Hunter & Keyword Spy",
        "Priority generation queues (No limits)",
        "API access for automated generation",
        "Dedicated customer support manager",
      ],
      ctaText: "Start 7-Day Free Trial",
      colorClass: "bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700",
      borderClass: "border-slate-200 dark:border-slate-800/80",
      icon: <Award className="w-6 h-6 text-slate-400" />,
      ctaLink: "/sign-up?plan=agency",
      planKey: "agency"
    },
  ];



  const faqs = [
    {
      q: "How does the 7-Day Free Trial work?",
      a: "When you choose Starter Creator, Pro Studio, or Publisher Agency, you get full unlocked commercial access to all tools for 7 full days without paying anything today. Your card is validated at checkout ($0 charge), and you can cancel anytime within 7 days from your billing dashboard if you decide not to continue.",
    },
    {
      q: "Are the generated interiors ready to upload directly to Amazon KDP?",
      a: "Yes! All interior templates, mazes, word searches, and Sudokus export as high-fidelity, print-ready vector PDFs that respect KDP guidelines, including precise trim sizes (6\"x9\", 8.5\"x11\"), interior bleed requirements, and gutter safety margins.",
    },
    {
      q: "Do I own the commercial copyrights for the books and puzzles I create?",
      a: "Absolutely. When subscribing to any of our paid plans (Starter, Pro, Agency), you receive full commercial rights and a royalty-free license to publish and sell the generated books, interiors, covers, vector art, and puzzles anywhere—including Amazon KDP, Etsy, IngramSpark, or your own website. You keep 100% of your earnings and royalties. The Free Tier is for personal testing only.",
    },
    {
      q: "Can I cancel, upgrade, or downgrade my subscription at any time?",
      a: "Yes, you can manage your recurring SaaS subscription easily from your billing panel. You can upgrade, downgrade, or cancel at any time with a single click, and you will retain access to your plan features until the end of your active billing cycle.",
    },
    {
      q: "Is there a money-back guarantee?",
      a: "We offer a 14-day money-back guarantee for direct SaaS subscription plans. For purchases made via AppSumo, refunds are governed by AppSumo's standard 60-day refund policy via your AppSumo portal.",
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

          <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">
            {plan.name}
          </h3>
          <p className="text-sm font-semibold mb-6 leading-relaxed min-h-[40px] text-slate-600 dark:text-slate-300">
            {plan.description}
          </p>

          {/* Price Display */}
          <div className="mb-8 flex items-baseline gap-2 flex-wrap">
            {originalPrice && (
              <span className="text-2xl font-black line-through self-end pb-1.5 opacity-55 text-slate-500 dark:text-slate-500">
                ${originalPrice}
              </span>
            )}
            <span className="text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              ${price}
            </span>
            {!isLtd && (
              <span className="font-bold text-sm text-slate-500 dark:text-slate-300">
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
            {plan.features
              .filter((f: string) => !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || (!f.toLowerCase().includes("ai chapter") && !f.toLowerCase().includes("ai writer")))
              .map((feature: any, fIndex: number) => (
                <li key={fIndex} className="flex items-start gap-3 font-semibold text-sm leading-snug text-slate-700 dark:text-slate-300">
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
            <>
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
              <p className="text-[11px] text-center font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
                🔒 7 Days Free • $0 Charged Today • Cancel Anytime
              </p>
            </>
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

      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-sky-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Limited Time Launch Offer
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h1>
        <p className="text-slate-650 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
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
              7-day money-back guarantee for complete confidence.
            </p>
          </div>
        </div>
      </div>

      {/* 🔒 Secure Payment trust badges */}
      <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-20 bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-[2rem] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">🔒 Guaranteed Safe &amp; Secure Checkout</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-8">
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
      <div className="mb-24 overflow-x-auto rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
        <div className="min-w-[650px]">
          {/* Table header */}
          <div className="grid grid-cols-5 border-b border-slate-800">
            <div className="p-5 md:p-6">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Core Capabilities</span>
            </div>
            {/* Free */}
            <div className="p-5 md:p-6 text-center border-l border-slate-800">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Free Tier</span>
              <span className="block text-xl font-black text-slate-300">$0</span>
            </div>
            {/* Starter */}
            <div className="p-5 md:p-6 text-center border-l border-slate-800 bg-indigo-950/40">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Starter</span>
              <span className="block text-xl font-black text-indigo-300">$11.99<span className="text-xs font-semibold text-slate-400">/mo</span></span>
            </div>
            {/* Pro */}
            <div className="p-5 md:p-6 text-center border-l border-amber-500/30 bg-amber-950/30 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <span className="block text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Pro Studio ⭐</span>
              <span className="block text-xl font-black text-amber-300">$21<span className="text-xs font-semibold text-slate-400">/mo</span></span>
            </div>
            {/* Agency */}
            <div className="p-5 md:p-6 text-center border-l border-slate-800 bg-emerald-950/30">
              <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Agency</span>
              <span className="block text-xl font-black text-emerald-300">$39<span className="text-xs font-semibold text-slate-400">/mo</span></span>
            </div>
          </div>

          {/* Rows */}
          {[
            {
              label: "Commercial Rights",
              free: false, starter: true, pro: true, agency: true,
            },
            {
              label: "Watermark-Free Exports",
              free: false, starter: true, pro: true, agency: true,
            },
            {
              label: "Trim Size Adjustments",
              free: "Basic (8.5×11)", starter: "Standard sizes", pro: "All sizes + Custom", agency: "All + Custom + SVGs",
            },
            {
              label: "Sudoku Puzzle Difficulty",
              free: "Easy Only", starter: "Easy & Medium", pro: "All (Easy, Med, Hard)", agency: "All + Custom",
            },
            {
              label: "Maze Layout Shapes",
              free: "Square Only", starter: "Square Only", pro: "Square, Circle, Heart", agency: "All + Custom masking",
            },
            {
              label: "Word Search / Cryptogram / Scramble",
              free: "Basic only", starter: "Std. grids", pro: "Unlimited", agency: "Unlimited",
            },
            {
              label: "Math Puzzles & Kakuro",
              free: false, starter: true, pro: "Unlimited", agency: "Unlimited",
            },
            {
              label: "Chapter Limits",
              free: "1 Outline/mo", starter: "5 Chapters/mo", pro: "Unlimited", agency: "Unlimited (Priority)",
            },
            {
              label: "Pen-names / Brands",
              free: "1", starter: "3", pro: "Unlimited", agency: "Unlimited",
            },
            {
              label: "Team Seats",
              free: "1 Seat", starter: "1 Seat", pro: "1 Seat", agency: "Up to 3 Seats",
            },
            {
              label: "Customer Support",
              free: "Community", starter: "Email (48h)", pro: "Priority (< 12h)", agency: "Dedicated manager",
            },
          ].map((row, i) => {
            const isLast = i === 10;
            const rowBg = i % 2 === 0 ? "bg-slate-900" : "bg-slate-950/60";

            const renderCell = (val: boolean | string, tierColor: string) => {
              if (val === true) return <Check className={`w-5 h-5 mx-auto ${tierColor}`} />;
              if (val === false) return <X className="w-4 h-4 mx-auto text-rose-600 opacity-70" />;
              return (
                <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-black ${tierColor} bg-current/10 bg-slate-800`}>
                  {val}
                </span>
              );
            };

            return (
              <div key={row.label} className={`grid grid-cols-5 ${rowBg} ${!isLast ? "border-b border-slate-800/70" : ""} hover:brightness-110 transition-all`}>
                <div className="py-4 px-4 md:px-6 flex items-center">
                  <span className="text-xs md:text-sm font-bold text-white">{row.label}</span>
                </div>
                <div className="py-4 px-2 md:px-4 flex items-center justify-center border-l border-slate-800 text-slate-400">
                  {renderCell(row.free, "text-slate-400")}
                </div>
                <div className="py-4 px-2 md:px-4 flex items-center justify-center border-l border-slate-800 bg-indigo-950/20 text-indigo-300">
                  {renderCell(row.starter, "text-indigo-400")}
                </div>
                <div className="py-4 px-2 md:px-4 flex items-center justify-center border-l border-amber-500/20 bg-amber-950/20 text-amber-300">
                  {renderCell(row.pro, "text-amber-400")}
                </div>
                <div className="py-4 px-2 md:px-4 flex items-center justify-center border-l border-slate-800 bg-emerald-950/20 text-emerald-300">
                  {renderCell(row.agency, "text-emerald-400")}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ❓ Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto border-t border-slate-800/60 pt-20">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs font-black uppercase tracking-[0.25em] mb-3">
            <HelpCircle className="w-4 h-4" /> Got Questions?
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-black text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <span className="text-base font-black text-slate-950 dark:text-slate-100">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-700 dark:text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-amber-600 dark:text-amber-400" : ""
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 text-slate-900 dark:text-slate-200 text-sm font-bold leading-relaxed border-t border-slate-300 dark:border-slate-800/60">
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
    { name: "Free Tier", price: "$0", period: "forever free", features: ["Access to basic puzzle generators", "Watermarked PDF exports (Sample only)", "Easy Sudoku generator", "Square-masked maze layouts", "1 Chapter Outline / mo", "Community support forum"] },
    { name: "Starter Creator", price: "$11.99", period: "/ month", features: ["Full Commercial Rights (Keep 100% royalties)", "Watermark-free vector PDF exports", "Up to 3 brand & pen-name profiles", "Standard trim sizes (6\"x9\", 8.5\"x11\")", "Easy & Medium Sudoku puzzle generator", "Generate up to 5 Chapters / mo", "Email support (24-48h response)"] },
    { name: "Pro Studio", price: "$21", period: "/ month", popular: true, features: ["Watermark-free PDF exports (All sizes + Custom)", "100% Commercial-use rights", "Unlimited Brand profiles & pen-names", "Unlimited Sudoku puzzles (Easy, Med, Hard)", "Unlimited Labyrinth designs (Circle, Heart shapes)", "Unlimited Word Search boards & CSV imports", "Unlimited Chapter Writing", "Premium Cover & Interior Canvas Studio", "Priority Customer Support (under 12 hours)"] },
    { name: "Publisher Agency", price: "$39", period: "/ month", features: ["Everything in Pro Studio plan", "Up to 3 team member account seats", "Vector SVG & source file exports", "Advanced custom shapes & interior styling", "KDP Niche Hunter & Keyword Spy", "API access for automated generation", "Dedicated customer support manager"] },
  ];

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-900">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-sky-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />Limited Time Launch Offer
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Simple, <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-sky-300 bg-clip-text text-transparent">Value-Packed</span> Pricing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Create profitable books with ease. Choose a plan that matches your publishing scale.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch mb-24">
        {staticPlans.map((plan) => (
          <div key={plan.name} className={`group relative rounded-[2.5rem] p-8 flex flex-col justify-between border backdrop-blur-md ${plan.popular ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-[0_20px_50px_rgba(245,158,11,0.15)] border-amber-500 dark:border-amber-400 border-2' : 'bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white border-slate-200 dark:border-slate-900'}`}>
            {plan.popular && (
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                <Sparkles className="w-3.5 h-3.5" />Most Popular
              </div>
            )}
            <div>
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
                <span className="font-bold text-sm text-slate-500 dark:text-slate-300">{plan.period}</span>
              </div>
              <div className={`h-px mb-8 ${plan.popular ? 'bg-slate-200 dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-900'}`} />
              <ul className="space-y-3">
                {plan.features
                  .filter((f: string) => !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || (!f.toLowerCase().includes("ai chapter") && !f.toLowerCase().includes("ai writer")))
                  .map((f, i) => (
                    <li key={i} className="flex items-start gap-3 font-semibold text-sm leading-snug text-slate-700 dark:text-slate-300">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-amber-600' : 'text-teal-400'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/sign-up" className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 ${plan.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800 text-white dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>
                Get Started <Zap className="w-4 h-4 shrink-0 opacity-80" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
