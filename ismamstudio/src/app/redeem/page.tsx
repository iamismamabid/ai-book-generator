"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Gift, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { redeemAppSumoCode } from "../actions";

export default function RedeemPage() {
  const { isLoaded, userId } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });
  const [isPending, startTransition] = useTransition();

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
          setStatus({
            type: "success",
            message: "AppSumo Lifetime Deal activated successfully! Redirecting..."
          });
          setCode("");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
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
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

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
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4">
              <Gift className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Redeem AppSumo Code</h1>
            <p className="text-slate-400 text-sm mt-2">Activate your lifetime access to Ismam Studio</p>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-slate-400 text-xs mt-3">Loading credentials...</p>
            </div>
          ) : !userId ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
                You need to create a free account or sign in to your existing account before you can redeem your lifetime deal code.
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
            <form onSubmit={handleRedeem} className="space-y-6">
              {status.type && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${
                    status.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
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
                  placeholder="e.g. AS-ISMA-C9DSG-8O3LJ"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isPending || status.type === "success"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || status.type === "success"}
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
          )}
        </div>
      </div>
    </div>
  );
}
