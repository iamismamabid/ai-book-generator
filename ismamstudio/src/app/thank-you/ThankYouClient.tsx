"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, BookOpen, Clock } from "lucide-react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";
import { checkPremiumStatus } from "../actions";

export default function ThankYouClient() {
  const { user } = useUser();
  const [status, setStatus] = useState<{ isPremium: boolean; plan: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track conversion event on mount
    posthog.capture("checkout_success_page_loaded");
    if (typeof window !== "undefined") {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag('event', 'purchase', {
          event_category: 'ecommerce',
          event_label: 'purchase_completed'
        });
        (window as any).gtag('event', 'conversion_event_purchase', {
          event_category: 'ecommerce',
          event_label: 'purchase_completed'
        });
        (window as any).gtag('event', 'conversion_event_purchase_2', {
          event_category: 'ecommerce',
          event_label: 'purchase_completed'
        });
        (window as any).gtag('event', 'conversion', {
          send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || 'AW-18328569670'
        });
      }

      // Trustpilot JS Review Invitation Trigger (Method 1)
      const email = user?.primaryEmailAddress?.emailAddress;
      const name = user?.fullName || user?.firstName || "Customer";
      if ((window as any).tp && email) {
        try {
          (window as any).tp("createInvitation", {
            recipientEmail: email,
            recipientName: name,
            referenceId: `TY_${Date.now()}`,
            source: "ThankYouPage"
          });
          console.log("Trustpilot review invitation queued on ThankYou page for:", email);
        } catch (tpErr) {
          console.error("Trustpilot Invitation Error:", tpErr);
        }
      }
    }

    // Check plan status
    async function verifyStatus() {
      try {
        const res = await checkPremiumStatus();
        setStatus(res);
      } catch (err) {
        console.error("Error verifying active subscription:", err);
      } finally {
        setLoading(false);
      }
    }
    
    // Poll status a few times since webhook might take a second to update Clerk metadata
    verifyStatus();
    const interval = setInterval(verifyStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "-2s" }} />

      <div className="max-w-xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center space-y-8"
        >
          {/* Animated Success Badge */}
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              className="w-full h-full bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>
            
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -top-1 -right-1 text-amber-400"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-black tracking-tight text-white"
            >
              Payment Successful!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-sm font-medium leading-relaxed"
            >
              Thank you for subscribing to KDPage. We're setting up your workspace options and activating your premium access benefits.
            </motion.p>
          </div>

          {/* Subscription State Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 text-left flex items-start gap-4"
          >
            {loading ? (
              <div className="flex items-center gap-3 w-full py-1 text-slate-400">
                <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
                <div className="text-xs font-bold uppercase tracking-wider">Activating Premium Status...</div>
              </div>
            ) : status?.isPremium ? (
              <>
                <BookOpen className="w-6 h-6 text-indigo-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Subscription Active</div>
                  <div className="text-sm font-bold text-white capitalize">
                    {status.plan} License Plan
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                    Your account has been successfully upgraded. All tools on your subscription tier are now active.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full py-1 text-slate-400">
                <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
                <div className="text-xs font-bold uppercase tracking-wider">Finalizing account parameters...</div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-2 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-600/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              Go to My Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white font-black text-xs uppercase tracking-wider transition hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
            >
              Return Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
