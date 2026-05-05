import { Inter } from 'next/font/google';
import "./globals.css";
// 🚨 Added Clerk Auth UI components to your imports
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from "next/link";

// 🎨 গুগল ফন্ট লোড করা হচ্ছে
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "Ismam.AI | Write Masterpieces with AI",
  description: "Generate, edit, and publish AI-assisted books in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {/* 🎯 html ট্যাগে ফন্টের ভেরিয়েবল ইনজেক্ট করা হলো */}
      <html lang="en" className={`scroll-smooth ${inter.variable}`}>
        <body className="bg-[#F8FAFC] text-slate-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
          
          {/* Professional Floating Navbar */}
          <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between w-full">
              
              {/* Logo Segment */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.132.477-4.5 1.253" /></svg>
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">Ismam<span className="text-indigo-600">.AI</span></span>
              </Link>

              {/* Action Buttons & Authentication */}
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  My Library
                </Link>

                {/* 🔴 IF NOT LOGGED IN: Show Sign In Button */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 hover:shadow-lg transition-all active:scale-95">
                      Sign In to Write
                    </button>
                  </SignInButton>
                </SignedOut>

                {/* 🟢 IF LOGGED IN: Show "Start Writing" and Profile Picture */}
                <SignedIn>
                  <Link href="/generate" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 hover:shadow-lg transition-all active:scale-95">
                    Start Writing 
                    <span className="text-indigo-300">→</span>
                  </Link>
                  
                  {/* Clerk User Profile Picture dropdown */}
                  <div className="ml-2 pl-4 border-l border-slate-300 flex items-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>

              </div>
              
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="pt-20">
            {children}
          </div>

        </body>
      </html>
    </ClerkProvider>
  );
}