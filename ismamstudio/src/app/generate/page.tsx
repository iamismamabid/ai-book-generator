"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const GeneratePageInner = dynamic(() => import("./GeneratePageInner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
      <p className="text-xs font-semibold uppercase tracking-wider">Loading AI Writer...</p>
    </div>
  ),
});

export default function GeneratePage() {
  return <GeneratePageInner />;
}
