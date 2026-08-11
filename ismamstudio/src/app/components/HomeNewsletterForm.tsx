"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeNewsletterForm() {
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  return (
    <div className="w-full md:w-auto relative z-10 shrink-0">
      {leadSubmitted ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200 max-w-sm">
          <p className="text-emerald-700 font-black text-sm">🎉 Successfully Registered!</p>
          <Link
            href="/kdp-checklist"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all duration-300 ease-in-out hover:-translate-y-0.5"
          >
            Download / Print Checklist
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (leadEmail) setLeadSubmitted(true);
          }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-md"
        >
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={leadEmail}
            onChange={(e) => setLeadEmail(e.target.value)}
            className="px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-500 font-semibold text-sm focus:border-indigo-500 focus:outline-none w-full min-w-[260px] shadow-inner"
            aria-label="Email address for KDP Bestseller Checklist"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/15 transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer"
          >
            Send Me the Checklist
          </button>
        </form>
      )}
    </div>
  );
}
