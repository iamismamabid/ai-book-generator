import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";

// 🎨 গুগল ফন্ট লোড করা হচ্ছে
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "Ismam Studio | Your All-in-One KDP Publishing Toolkit",
  description: "Create, format, and publish professional puzzle interiors, word searches, mazes, and gorgeous covers for Amazon KDP in minutes.",
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