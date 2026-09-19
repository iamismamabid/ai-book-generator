"use client";

import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import CountdownBanner from '@/app/components/CountdownBanner';
import GlobalSearchModal from '@/app/components/GlobalSearchModal';
import MobileNavMenu from '@/app/components/MobileNavMenu';
import { Sparkles, BookOpen, Users } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col transition-all duration-300" suppressHydrationWarning>
      {/* 📣 Golden Yellow Lifetime 50% Off Countdown Banner */}
      <CountdownBanner />

      <nav className="bg-[#0b0f19]/95 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 shadow-xl transition-colors duration-300" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between" suppressHydrationWarning>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 select-none">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-lg shadow-amber-500/10 bg-white/95 p-1 group-hover:scale-105 transition-transform flex items-center justify-center border border-slate-700/60">
              <Image
                src="/logo_icon.png"
                alt="KDPage Logo"
                fill
                sizes="(max-width: 640px) 44px, 56px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-xl sm:text-2xl font-black tracking-tight leading-none transition-transform group-hover:scale-[1.02] bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #00E5FF 0%, #3B82F6 25%, #A855F7 50%, #FF007A 75%, #FF3366 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                KDPage
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">
                All-In-One
              </span>
            </div>
          </Link>

          {/* Central Standard Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-5 lg:gap-8 ml-6 lg:ml-10 mr-auto">
            <Link href="/" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link href="/about" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              About
            </Link>
            <Link href="/#features" className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Features
            </Link>
            <Link href="/pricing" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <Link href="/tools" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Free Tools
            </Link>
          </div>

          {/* Action Buttons & Navigation (100% Solid Frame-0 Layout - Zero Width Shifts) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-10">
            {/* Global Search Modal */}
            <div className="shrink-0">
              <GlobalSearchModal />
            </div>

            {/* My Notebook (Permanent static link) */}
            <Link 
              href="/notebook" 
              prefetch={true} 
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors px-1 shrink-0"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>My Notebook</span>
            </Link>

            {/* Creator Studio (Core Product CTA - Always visible on Frame 0 for everyone) */}
            <Link 
              href="/studio" 
              prefetch={true} 
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Creator Studio
            </Link>

            {/* Account / User Avatar Slot (Fixed 32px circle, zero shift) */}
            <div className="ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-800 flex items-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                <SignedIn>
                  <UserButton afterSignOutUrl="/">
                    <UserButton.MenuItems>
                      <UserButton.Link label="My Notebook" labelIcon={<BookOpen className="w-4 h-4" />} href="/notebook" />
                      <UserButton.Link label="Team Seats" labelIcon={<Users className="w-4 h-4" />} href="/team" />
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" initialValues={{ emailAddress: "" }}>
                    <button 
                      className="w-full h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Sign In"
                      aria-label="Sign In"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>

            {/* Mobile Hamburger Toggle & Drawer */}
            <MobileNavMenu />
          </div>

        </div>
      </nav>
    </header>
  );
}
