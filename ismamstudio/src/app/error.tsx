"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-lg w-full mx-auto px-6 text-center relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/20 mx-auto mb-6">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
            Something Went Wrong
          </h1>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-8">
            An unexpected error occurred. You can try again, or head back to a safe page. If this keeps happening, please contact support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              href="/"
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
