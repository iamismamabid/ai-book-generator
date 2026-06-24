import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import Header from '@/app/components/Header';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";

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
          <ThemeProvider>
            {/* Professional Floating Navbar */}
            <Header />

            {/* Main Content Area */}
            <div className="pt-20">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}