"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import GlobalSearchModal from '@/app/components/GlobalSearchModal';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Menu, X, Sparkles, BookOpen, Wrench, CreditCard, LayoutGrid, Layers, Users } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col transition-all duration-300" suppressHydrationWarning>
      {/* 📣 Announcement Bar */}
      <Link 
        href="/tools/spine-calculator" 
        className="w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-slate-950 text-center py-2 px-4 text-xs font-black tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-2 group z-50 shadow-md"
      >
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/10 text-slate-950 text-[9px] font-black uppercase tracking-widest animate-pulse">
          Free Tool
        </span>
        <span className="truncate">New: Amazon KDP Spine & Cover Calculator is 100% free!</span>
        <span className="group-hover:translate-x-1 transition-transform inline-block shrink-0">→</span>
      </Link>

      <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50 glass-card transition-colors duration-300" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between" suppressHydrationWarning>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-28 sm:w-36 h-10 sm:h-12 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="KDPage Logo"
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Central Standard Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto">
            <Link href="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Pricing
            </Link>
            <Link href="/#examples" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Examples
            </Link>
            <Link href="/blog" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <Link href="/tools" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Free Tools
            </Link>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Global Search Modal */}
            <GlobalSearchModal />
            <ThemeToggle />

            <SignedIn>
              <Link href="/notebook" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mr-1">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>My Notebook</span>
              </Link>
              <Link href="/studio" className="hidden sm:flex items-center gap-1.5 bg-indigo-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                <Sparkles className="w-4 h-4" /> Creator Studio
              </Link>

              <div className="ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 flex items-center">
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Link label="Team Seats" labelIcon={<Users className="w-4 h-4" />} href="/team" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1.5 sm:px-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-slate-900 dark:bg-slate-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:shadow-lg transition-all active:scale-95">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* 📱 Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            <SignedIn>
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
            </SignedIn>

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
      </nav>
    </header>
  );
}
