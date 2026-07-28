"use client";

import posthog from "posthog-js";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { ArrowLeft, Gift, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { redeemAppSumoCode, checkPremiumStatus } from "../actions";
import { useAuth } from "@clerk/nextjs";

interface RedeemPageInnerProps {
  initialCode?: string;
}

export default function RedeemPageInner({ initialCode = "" }: RedeemPageInnerProps) {
  const { isLoaded, userId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });
  const [redeemedTier, setRedeemedTier] = useState<{ name: string; limits: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activePlan, setActivePlan] = useState<{ isPremium: boolean; plan: string; limits?: any } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      checkPremiumStatus()
        .then((res) => {
          setActivePlan(res);
        })
        .catch((err) => {
          console.error("Failed to fetch premium status:", err);
        });
    }
  }, [userId]);

  const getTierDetails = (redeemedCode: string, stackedCount?: number) => {
    const cleanCode = redeemedCode.toUpperCase();
    if (cleanCode.includes("PH10OFF")) {
      return {
        name: "Product Hunt Starter Lifetime Access",
        limits: [
          "1 User Seat",
          "Up to 3 Brand profiles & pen-names",
          "Standard trim sizes (6\"x9\", 8.5\"x11\")",
          "Easy & Medium Sudoku puzzle generator",
          "Square-masked maze layouts",
          "Generate up to 10 Chapters / month",
          "Standard vector PDF exports",
          "Email support (24-48h response)",
        ],
      };
    }

    // Determine tier based on explicit code string or stacked redemption count
    let tierNumber = stackedCount || 1;
    if (cleanCode.includes("-T3-") || cleanCode.includes("TIER3") || cleanCode.includes("-TIER-3-") || cleanCode.includes("-T3")) {
      tierNumber = Math.max(tierNumber, 3);
    } else if (cleanCode.includes("-T2-") || cleanCode.includes("TIER2") || cleanCode.includes("-TIER-2-") || cleanCode.includes("-T2")) {
      tierNumber = Math.max(tierNumber, 2);
    }

    if (tierNumber >= 5) {
      return {
        name: "Tier 5: Agency Max Lifetime Access",
        limits: [
          "Unlimited team seats & brand profiles",
          "Unlimited Sudoku, Maze, Word Search, and Story Generations",
          "Vector SVG & source file exports",
          "Advanced Custom Shapes & Custom Masking",
          "Full access to KDP Niche Hunter & Keyword Spy",
          "Dedicated 1-on-1 account manager",
        ],
      };
    } else if (tierNumber === 4) {
      return {
        name: "Tier 4: Agency Plus Lifetime Access",
        limits: [
          "Up to 5 team seats (shared account access)",
          "Unlimited Sudoku, Maze, Word Search, and Story Generations",
          "Vector SVG & source file exports",
          "Advanced Custom Shapes & Custom Masking",
          "Full access to KDP Niche Hunter & Keyword Spy",
          "Priority customer support",
        ],
      };
    } else if (tierNumber === 3) {
      return {
        name: "Tier 3: Agency Lifetime Access",
        limits: [
          "Up to 3 team seats (shared account access)",
          "Unlimited Sudoku, Maze, Word Search, and Story Generations",
          "Vector SVG & source file exports",
          "Advanced Custom Shapes & Custom Masking",
          "Full access to KDP Niche Hunter & Keyword Spy",
          "Dedicated support manager",
        ],
      };
    } else if (tierNumber === 2) {
      return {
        name: "Tier 2: Professional Lifetime Access",
        limits: [
          "1 User Seat",
          "Unlimited Brand profiles & pen-names",
          "Unlimited Sudoku (Easy, Med, Hard) and Circle/Heart Mazes",
          "Unlimited Word Search boards & CSV imports",
          "Unlimited Chapter Writing",
          "Premium Cover & Interior Canvas Studio",
          "Priority support (under 12 hours)",
        ],
      };
    } else {
      return {
        name: "Tier 1: Starter Lifetime Access",
        limits: [
          "1 User Seat",
          "Up to 3 Brand profiles & pen-names",
          "Standard trim sizes (6\"x9\", 8.5\"x11\")",
          "Easy & Medium Sudoku puzzle generator",
          "Square-masked maze layouts",
          "Generate up to 10 Chapters / month",
          "Standard vector PDF exports",
          "Email support (24-48h response)",
        ],
      };
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setStatus({ type: "error", message: "Please enter your redemption code." });
      return;
    }

    setStatus({ type: null, message: "" });

    startTransition(async () => {
      try {
        const res = await redeemAppSumoCode(code);
        if (res.success) {
          try {
            const updatedPlan = await checkPremiumStatus();
            setActivePlan(updatedPlan);
            const activeTierCount = res.count || (updatedPlan.limits as any)?.tier || 1;
            const tier = getTierDetails(code, activeTierCount);
            setRedeemedTier(tier);

            posthog.capture("appsumo_code_redeemed", {
              tier_name: tier.name,
              new_plan: updatedPlan.plan,
              stacked_count: activeTierCount,
            });
          } catch (planErr) {
            console.error("Failed to refresh plan status:", planErr);
            const fallbackTier = getTierDetails(code, res.count);
            setRedeemedTier(fallbackTier);
          }

          setStatus({
            type: "success",
            message: "AppSumo Lifetime Deal activated successfully!"
          });
          setCode("");
        } else {
          setStatus({
            type: "error",
            message: res.error || "Failed to redeem code. Please try again."
          });
        }
      } catch (err: any) {
        setStatus({
          type: "error",
          message: err.message || "An unexpected error occurred. Please try again."
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl">
          {status.type === "success" && redeemedTier ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">Deal Activated!</h1>
                <p className="text-emerald-400 text-sm font-bold mt-1 uppercase tracking-wider">{redeemedTier.name}</p>
                <p className="text-slate-400 text-xs mt-1">Your license key has been successfully registered to your account.</p>
              </div>

              <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Your Activated Limits:</h3>
                <ul className="space-y-2">
                  {redeemedTier.limits.map((limit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-center text-sm shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/studio"
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 rounded-xl text-center text-sm transition-all"
                >
                  Open Creator Studio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4">
                  <Gift className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">Redeem AppSumo Code</h1>
                <p className="text-slate-400 text-sm mt-2">Activate your lifetime access to KDPage</p>
              </div>

              <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-6" />

              {!(mounted && isLoaded && userId) ? (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-900 text-slate-300 text-xs leading-relaxed space-y-3">
                    <h3 className="font-black text-white text-sm">Required Steps First:</h3>
                    <ul className="space-y-2 list-decimal list-inside text-slate-400 font-semibold">
                      <li>Create a free account or sign in to your existing account first.</li>
                      <li>Enter your AppSumo lifetime code on this page after signing in.</li>
                      <li>Your lifetime deal access will activate immediately.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/sign-up?redirect_url=/redeem"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-lg shadow-indigo-600/15 transition-all"
                    >
                      Create Account
                    </Link>
                    <Link
                      href="/sign-in?redirect_url=/redeem"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Active Deal Card */}
                  {activePlan && activePlan.isPremium && !(activePlan as any).isTrial && (
                    <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                          Current Active Deal
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                          Activated
                        </span>
                      </div>
                      <div className="text-sm font-black text-white">
                        {planTitles[activePlan.plan] || activePlan.plan}
                      </div>
                      {getUpgradeInstruction(activePlan.plan) && (
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed mt-1">
                          {getUpgradeInstruction(activePlan.plan)}
                        </p>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleRedeem} className="space-y-6">
                    {status.type === "error" && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl border bg-rose-500/10 border-rose-500/20 text-rose-400">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-normal">{status.message}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="code" className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                        AppSumo Purchase Code
                      </label>
                      <input
                        id="code"
                        type="text"
                        placeholder="e.g. AS-ISMA-T2-C9DSG-8O3LJ"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isPending}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 transition-all text-sm uppercase tracking-wider"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Activating Deal...
                        </>
                      ) : (
                        "Activate Lifetime Deal"
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const planTitles: Record<string, string> = {
  starter: "Lifetime Tier 1: Starter",
  pro: "Lifetime Tier 2: Pro",
  agency: "Lifetime Tier 3: Agency",
  tier4: "Lifetime Tier 4: Pro Plus",
  tier5: "Lifetime Tier 5: Agency Max",
};

const getUpgradeInstruction = (rawPlan: string) => {
  if (rawPlan === "starter") {
    return "To upgrade your account to Tier 2 (Pro), please purchase another AppSumo code and redeem it below. Tier 2 unlocks unlimited brand profiles, hard Sudoku difficulty, and advanced maze shapes.";
  }
  if (rawPlan === "pro") {
    return "To upgrade your account to Tier 3 (Agency), please purchase another AppSumo code and redeem it below. Tier 3 unlocks multi-user team seats and agency-level limits.";
  }
  if (rawPlan === "agency") {
    return "You have unlocked the maximum recommended stack (Tier 3)! All core features and limits are fully active.";
  }
  if (rawPlan === "tier4") {
    return "To upgrade your account to Tier 5 (Agency Max), please purchase another AppSumo code and redeem it below.";
  }
  if (rawPlan === "tier5") {
    return "You have unlocked the absolute maximum stack (Tier 5)! All limits are fully maximized.";
  }
  return "";
};
