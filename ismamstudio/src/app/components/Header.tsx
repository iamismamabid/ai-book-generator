import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50 glass-card transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.132.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Book<span className="text-indigo-600 dark:text-indigo-400 font-black">bolt</span>
          </span>
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
            <Link href="/generate" className="hidden lg:flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95">
              AI Writer
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

          <ThemeToggle />
        </div>

      </div>
    </nav>
  );
}

