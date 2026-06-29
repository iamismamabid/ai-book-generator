import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";

// 🎨 গুগল ফন্ট লোড করা হচ্ছে
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ismam Studio | All-in-One KDP Book Creation Toolkit",
  description: "Create puzzle interiors, AI-assisted novel chapters, shape-masked mazes, word searches, and gorgeous covers for Amazon KDP — in minutes. No design software needed.",
  metadataBase: new URL("https://www.ismamstudio.me"),
  openGraph: {
    title: "Ismam Studio — Create & Publish KDP Books in Minutes",
    description: "The ultimate all-in-one toolkit for Amazon KDP self-publishers. Sudoku, mazes, word searches, AI novel outlines, and full cover design — all in one place.",
    url: "https://www.ismamstudio.me",
    siteName: "Ismam Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ismam Studio — KDP Book Creation Toolkit",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ismam Studio — KDP Book Creation Toolkit",
    description: "Create professional puzzle books, AI chapters & covers for Amazon KDP in minutes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {/* 🎯 html ট্যাগে ফন্টের ভেরিয়েবল ইনজেক্ট করা হলো */}
      <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
        <body className="bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
          <ThemeProvider>
            {/* Professional Floating Navbar */}
            <Header />

            {/* Main Content Area */}
            <div className="pt-20 min-h-[calc(100vh-80px)] flex flex-col justify-between">
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}