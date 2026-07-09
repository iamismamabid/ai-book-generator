import Link from "next/link";
import { ArrowLeft, Home, Search, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-lg w-full mx-auto px-6 text-center relative z-10">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-b from-slate-700 via-slate-800 to-transparent bg-clip-text text-transparent select-none">
            404
          </span>
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mx-auto mb-6">
            <Search className="w-7 h-7" />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/studio"
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Open Studio
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "Free Tools", href: "/tools" },
            { label: "FAQ", href: "/faq" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold text-slate-500 hover:text-indigo-400 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
