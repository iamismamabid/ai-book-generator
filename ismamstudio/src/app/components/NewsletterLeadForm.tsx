"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { saveLeadEmail } from "@/app/actions";

export default function NewsletterLeadForm({ source = "footer_newsletter" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await saveLeadEmail(email.trim(), source);
      if (res.success) {
        setStatus({ type: "success", message: res.message });
        setEmail("");
      } else {
        setStatus({ type: "error", message: res.message });
      }
    } catch (err) {
      console.error("Failed to submit lead email:", err);
      setStatus({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for updates..."
            required
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Subscribe"}
          </button>
        </div>

        {status && (
          <div
            className={`flex items-center gap-1.5 text-[11px] font-bold mt-1.5 animate-in fade-in duration-200 ${
              status.type === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
