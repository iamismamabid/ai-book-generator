import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface ToolShellProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: string;
}

/**
 * Shared dark-theme page shell for all free /tools/* pages.
 * Matches the design language of SpineCalculator and the Free Tools hub.
 */
export default function ToolShell({
  badge = "100% Free Tool — No Signup",
  title,
  highlight,
  subtitle,
  children,
  maxWidth = "max-w-6xl",
}: ToolShellProps) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden font-sans">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className={`${maxWidth} mx-auto relative z-10 space-y-10`}>
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> {badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </>
              )}
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1 max-w-2xl">{subtitle}</p>
          </div>
          <Link
            href="/tools/free"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" /> All Free Tools
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
