import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import GlobalSearchModal from '@/app/components/GlobalSearchModal';
import MobileNavMenu from '@/app/components/MobileNavMenu';
import { Sparkles, BookOpen, Users } from 'lucide-react';

export default async function Header() {
  const { userId } = await auth();

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
              <span className="text-xl sm:text-2xl font-black tracking-tight flex items-center leading-none transition-transform group-hover:scale-[1.02]">
                <span className="text-[#DC2626]">KD</span>
                <span className="text-white">P</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">age</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">
                All-In-One
              </span>
            </div>
          </Link>

          {/* Central Standard Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto">
            <Link href="/" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link href="/about" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              About
            </Link>
            <Link href="/#features" className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <Link href="/tools" prefetch={true} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
              Free Tools
            </Link>
          </div>

          {/* Action Buttons & Auth (Server-Side Rendered via auth()) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-10">
            {/* Global Search Modal */}
            <div className="shrink-0">
              <GlobalSearchModal />
            </div>

            {/* Auth Buttons: Sent directly in initial server HTML (0ms delay) */}
            <div className={`flex items-center justify-end shrink-0 h-10 ${userId ? "min-w-[44px] sm:min-w-[270px] md:min-w-[340px]" : "min-w-[130px] sm:min-w-[165px]"}`}>
              {userId ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link href="/notebook" prefetch={true} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors mr-1 shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>My Notebook</span>
                  </Link>
                  <Link href="/studio" prefetch={true} className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0">
                    <Sparkles className="w-4 h-4" /> Creator Studio
                  </Link>

                  <div className="ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-800 flex items-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                      <UserButton afterSignOutUrl="/">
                        <UserButton.MenuItems>
                          <UserButton.Link label="Team Seats" labelIcon={<Users className="w-4 h-4" />} href="/team" />
                        </UserButton.MenuItems>
                      </UserButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <SignInButton mode="modal" initialValues={{ emailAddress: "" }}>
                    <button className="text-xs sm:text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors px-1.5 sm:px-2 cursor-pointer whitespace-nowrap">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" initialValues={{ emailAddress: "" }}>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle & Drawer */}
            <MobileNavMenu userId={userId} />
          </div>

        </div>
      </nav>
    </header>
  );
}
