"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("kdpage_cookie_consent");
      if (!consent) {
        // Slight delay for smooth non-intrusive entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In private browsing / SSR fallback
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("kdpage_cookie_consent", "all");
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("kdpage_cookie_consent", "essential");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[99990] max-w-md w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/50 text-white space-y-3.5 relative">
        <button
          onClick={handleEssentialOnly}
          title="Dismiss"
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              We value your privacy
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed mt-1">
              We use cookies to enhance your browsing experience, save your
              studio preferences, and analyze our traffic. By clicking &quot;Accept
              All&quot;, you consent to our use of cookies in accordance with our{" "}
              <Link
                href="/cookies"
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all duration-150 active:scale-[0.97] cursor-pointer shadow-md shadow-indigo-600/30 text-center"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all duration-150 active:scale-[0.97] cursor-pointer text-center"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
