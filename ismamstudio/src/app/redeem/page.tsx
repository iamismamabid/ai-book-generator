"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RedeemPageInner = dynamic(() => import("./RedeemPageInner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-slate-400 text-xs mt-3 font-semibold uppercase tracking-wider text-xs">Loading Redemption Panel...</p>
    </div>
  ),
});

export default function RedeemPage() {
  return <RedeemPageInner />;
}
