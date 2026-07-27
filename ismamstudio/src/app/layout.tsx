import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CustomCursor from '@/app/components/CustomCursor';
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';
import type { Metadata } from 'next';

// 🎨 গুগল ফন্ট লোড করা হচ্ছে
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', adjustFontFallback: false });

export const metadata: Metadata = {
  title: "KDPage | All-in-One KDP Book Creation Toolkit",
  description: "Create puzzle interiors, shape-masked mazes, word searches, crosswords, and gorgeous covers for Amazon KDP — in minutes. No design software needed.",
  metadataBase: new URL("https://www.kdpage.com"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "KDPage — Create & Publish KDP Books in Minutes",
    description: "The ultimate all-in-one toolkit for Amazon KDP self-publishers. Sudoku, mazes, word searches, crosswords, and full cover design — all in one place.",
    url: "https://www.kdpage.com",
    siteName: "KDPage",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KDPage — KDP Book Creation Toolkit",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPage — KDP Book Creation Toolkit",
    description: "Create professional puzzle books, custom activity interiors & covers for Amazon KDP in minutes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "BxkWaFUAZ5Hu_euEr87tYkNVlw7iKrDKKl6ktdk2ihs",
    other: {
      "p:domain_verify": "a8a1ae0bc29b03f4045275105afd56c7",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Trigger Vercel redeploy with correct Root Directory settings
  return (
    <ClerkProvider
      captchaWidgetType="invisible"
    >
      {/* 🎯 html ট্যাগে suppressHydrationWarning যুক্ত করা হয়েছে */}
      <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
        {/* 🎯 body ট্যাগে suppressHydrationWarning যুক্ত করা হয়েছে */}
        <body
          className="bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300"
          suppressHydrationWarning
        >
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-TX4P8W8X"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>

          <ThemeProvider>
            <CustomCursor />
            {/* Professional Floating Navbar */}
            <Header />

            {/* Main Content Area */}
            <div className="pt-[116px] min-h-[calc(100vh-116px)] flex flex-col justify-between">
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>

            {/* JSON-LD Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "SoftwareApplication",
                      "name": "KDPage",
                      "description": "All-in-one KDP book creation toolkit. Generate puzzle interiors, shape-masked mazes, word searches, crosswords, and gorgeous covers for Amazon KDP.",
                      "url": "https://www.kdpage.com",
                      "applicationCategory": "DesignApplication",
                      "operatingSystem": "Web",
                      "offers": [
                        {
                          "@type": "Offer",
                          "price": "0",
                          "priceCurrency": "USD",
                          "name": "Free Tier"
                        },
                        {
                          "@type": "Offer",
                          "price": "11.99",
                          "priceCurrency": "USD",
                          "name": "Starter Creator",
                          "billingIncrement": 1,
                          "unitCode": "MON"
                        },
                        {
                          "@type": "Offer",
                          "price": "21",
                          "priceCurrency": "USD",
                          "name": "Pro Studio",
                          "billingIncrement": 1,
                          "unitCode": "MON"
                        },
                        {
                          "@type": "Offer",
                          "price": "39",
                          "priceCurrency": "USD",
                          "name": "Publisher Agency",
                          "billingIncrement": 1,
                          "unitCode": "MON"
                        }
                      ],
                      "screenshot": "https://www.kdpage.com/og-image.png",
                      "featureList": "Sudoku Generator, Shape-Masked Maze Designer, Word Search Builder, Cryptogram Studio, Math Puzzle Builder, Word Scramble Studio, Layout & Outline Planner, Cover & Interior Canvas Studio, KDP Niche Hunter & Keyword Spy, Spine & Cover Calculator, ISBN Barcode Generator"
                    },
                    {
                      "@type": "Organization",
                      "name": "KDPage",
                      "url": "https://www.kdpage.com",
                      "logo": "https://www.kdpage.com/logo.png",
                      "email": "support@kdpage.com"
                    }
                  ]
                })
              }}
            />
            {/* Google Tag Manager */}
            <Script id="google-tag-manager" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TX4P8W8X');`}
            </Script>

            {/* Google Analytics & Google Ads (gtag.js) */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "G-B08V9NL031"}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-B08V9NL031');
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18328569670"}');

                window.gtagSendEvent = function(url) {
                  var callback = function () {
                    if (typeof url === 'string' && url) {
                      window.location = url;
                    }
                  };
                  gtag('event', 'conversion_event_purchase_2', {
                    'event_callback': callback,
                    'event_timeout': 2000
                  });
                  return false;
                };
              `}
            </Script>

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

              // Backup Referral Writer across Cookies, localStorage, and sessionStorage
              (function() {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  const aff = urlParams.get('aff') || urlParams.get('via') || urlParams.get('ref') || urlParams.get('partner') || urlParams.get('am_id');
                  if (aff) {
                    const date = new Date();
                    date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
                    document.cookie = "partnero_partner=" + encodeURIComponent(aff) + "; expires=" + date.toUTCString() + "; path=/; SameSite=Lax";
                    try {
                      localStorage.setItem('partnero_partner', aff);
                      localStorage.setItem('aff_ref', aff);
                      sessionStorage.setItem('partnero_partner', aff);
                    } catch(e) {}
                  }
                } catch(e) {
                  console.error("Partnero tracking fallback error:", e);
                }
              })();
            `}
          </Script>
          <SpeedInsights />
          <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}