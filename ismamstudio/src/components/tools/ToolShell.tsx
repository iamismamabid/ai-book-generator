"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, HelpCircle } from "lucide-react";
import { ReactNode } from "react";

interface Faq {
  q: string;
  a: string;
}

interface ToolShellProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: string;
  /** schema.org applicationCategory — defaults to a generic free web utility */
  appCategory?: string;
  /** Optional FAQ list — rendered visibly at the bottom AND emitted as FAQPage JSON-LD */
  faqs?: Faq[];
}

const SITE_URL = "https://www.kdpage.com";

/**
 * Shared dark-theme page shell for all free /tools/* pages.
 * Also handles the SEO plumbing every tool page needs: a real "Free …" H1,
 * a visible + structured breadcrumb trail, and SoftwareApplication/FAQPage
 * JSON-LD — so every page gets consistent, correct schema without each
 * tool having to hand-roll it.
 */
export default function ToolShell({
  badge = "100% Free Tool — No Signup",
  title,
  highlight,
  subtitle,
  children,
  maxWidth = "max-w-6xl",
  appCategory = "UtilitiesApplication",
  faqs,
}: ToolShellProps) {
  const pathname = usePathname() || "";
  const pageUrl = `${SITE_URL}${pathname}`;

  const rawName = [title, highlight].filter(Boolean).join(" ").trim();
  const alreadySaysFree = /^free\b/i.test(rawName);
  const displayName = alreadySaysFree ? rawName : `Free ${rawName}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: displayName,
        description: subtitle,
        url: pageUrl,
        applicationCategory: appCategory,
        operatingSystem: "Any (Web Browser)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: "KDPage", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Free Tools", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: rawName, item: pageUrl },
        ],
      },
      ...(faqs && faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className={`${maxWidth} mx-auto relative z-10 space-y-10`}>
        {/* Visible breadcrumb — mirrors the BreadcrumbList JSON-LD above */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <Link href="/" className="hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/tools" className="hover:text-indigo-400 transition-colors">
            Free Tools
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-slate-300 truncate">{rawName}</span>
        </nav>

        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> {badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {!alreadySaysFree && "Free "}
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </>
              )}
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1 max-w-2xl">{subtitle}</p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" /> All Free Tools
          </Link>
        </div>

        {children}

        {/* Visible FAQ — mirrors the FAQPage JSON-LD above */}
        {faqs && faqs.length > 0 && (
          <div className="border-t border-slate-900 pt-10 space-y-5">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="bg-slate-900/35 border border-slate-900 rounded-2xl p-5">
                  <h3 className="text-sm font-black text-white mb-1.5">{f.q}</h3>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
