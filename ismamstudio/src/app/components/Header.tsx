import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50 glass-card transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

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

