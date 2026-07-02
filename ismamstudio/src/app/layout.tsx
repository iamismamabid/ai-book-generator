import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from 'next/script';

// 🎨 গুগল ফন্ট লোড করা হচ্ছে
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', adjustFontFallback: false });

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

  verification: {
    google: "BxkWaFUAZ5Hu_euEr87tYkNVlw7iKrDKKl6ktdk2ihs",
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

          {/* PartneroJS Tracking Script */}
          <Script id="partnero-js" strategy="afterInteractive">
            {`
              (function(p,t,n,e,r,o){ p['__partnerObject']=r;function f(){
              var c={ a:arguments,q:[]};var r=this.push(c);return "number"!=typeof r?r:f.bind(c.q);}
              f.q=f.q||[];p[r]=p[r]||f.bind(f.q);p[r].q=p[r].q||f.q;o=t.createElement(n);
              var _=t.getElementsByTagName(n)[0];o.async=1;o.src=e+'?v'+(~~(new Date().getTime()/1e6));
              _.parentNode.insertBefore(o,_);})(window, document, 'script', 'https://app.partnero.com/js/universal.js', 'po');
              po('settings', 'assets_host', 'https://assets.partnero.com');
              po('program', 'CNPKWOED', 'load');

              // Backup Cookie Writer for Localhost and Cross-Domain Testing
              (function() {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  const aff = urlParams.get('aff');
                  if (aff) {
                    const date = new Date();
                    date.setTime(date.getTime() + (60 * 24 * 60 * 60 * 1000));
                    document.cookie = "partnero_partner=" + encodeURIComponent(aff) + "; expires=" + date.toUTCString() + "; path=/; SameSite=Lax";
                  }
                } catch(e) {
                  console.error("Partnero cookie fallback error:", e);
                }
              })();
            `}
          </Script>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
