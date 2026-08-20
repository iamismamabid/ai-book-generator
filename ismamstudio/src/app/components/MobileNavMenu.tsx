"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, BookOpen, Wrench, CreditCard, LayoutGrid } from "lucide-react";

interface MobileNavMenuProps {
  userId: string | null;
}

export default function MobileNavMenu({ userId }: MobileNavMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-xl text-slate-200 hover:bg-slate-900 transition-colors"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 📱 Mobile Navigation Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200 z-50">
          {userId && (
            <>
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Sparkles className="w-4 h-4" /> Open Creator Studio
              </Link>

              <Link
                href="/notebook"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-800"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" /> My Notebook (Saved Data)
              </Link>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-amber-500" /> Free Tools
            </Link>

            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-500" /> Features
            </Link>

            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-500" /> Pricing
            </Link>

            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-purple-500" /> Blog &amp; Guides
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
