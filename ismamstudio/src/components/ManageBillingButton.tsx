"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { getBillingPortalUrl } from "@/app/actions";

const SUPPORT_FALLBACK_URL =
  "mailto:support@kdpage.com?subject=Cancel%20or%20Manage%20My%20Subscription";

export default function ManageBillingButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await getBillingPortalUrl();
      window.open(result.success ? result.url : SUPPORT_FALLBACK_URL, "_blank", "noopener,noreferrer");
    } catch {
      window.open(SUPPORT_FALLBACK_URL, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 font-bold text-xs transition-all disabled:opacity-60"
      }
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
      Manage Billing
    </button>
  );
}
