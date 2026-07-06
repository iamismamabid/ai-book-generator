import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col transition-all duration-300" suppressHydrationWarning>
      {/* 📣 Announcement Bar */}
      <Link 
        href="/tools/spine-calculator" 
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-center py-2 px-4 text-xs font-black tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-2 group z-50 shadow-md"
      >
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
          Free Tool
        </span>
        <span>New: Amazon KDP Spine & Cover Calculator is now 100% free! Calculate print specs instantly.</span>
        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
      </Link>

      <nav className="bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50 glass-card transition-colors duration-300" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" suppressHydrationWarning>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-36 h-12 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Ismam Studio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Central Standard Navigation Links */}
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
            <Link href="/redeem" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Redeem
            </Link>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mr-2">
                My Library
              </Link>
              <Link href="/studio" className="hidden sm:flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                Creator Studio
              </Link>

              <div className="ml-2 pl-3 border-l border-slate-200 dark:border-slate-800 flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-650 hover:shadow-lg transition-all active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>

        </div>
      </nav>
    </header>
  );
}

