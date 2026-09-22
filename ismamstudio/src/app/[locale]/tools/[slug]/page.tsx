import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Sparkles, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  SUPPORTED_LOCALES,
  SupportedLocale,
  getToolTranslation,
  TOOLS_I18N,
} from "@/lib/i18n/tools-data";

// Tool Components
import SpineCalculator from "@/app/tools/spine-calculator/SpineCalculator";
import KdpCoverCreatorClient from "@/app/tools/kdp-cover-creator/KdpCoverCreatorClient";
import KdpFileValidator from "@/app/tools/kdp-file-validator/KdpFileValidator";
import PrintCostCalculator from "@/app/tools/print-cost-calculator/PrintCostCalculator";
import IsbnGenerator from "@/app/tools/isbn-generator/IsbnGenerator";
import KdpPuzzleGeneratorClient from "@/app/tools/kdp-puzzle-generator/KdpPuzzleGeneratorClient";
import WordSearchStudio from "@/app/tools/word-search/WordSearchClient";
import InteriorTemplates from "@/app/tools/interior-templates/InteriorTemplates";
import KeywordResearchPage from "@/app/tools/keyword-research/KeywordResearchClient";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

const TOP_10_SLUGS = [
  "spine-calculator",
  "kdp-cover-creator",
  "kdp-file-validator",
  "print-cost-calculator",
  "isbn-generator",
  "kdp-puzzle-generator",
  "word-search",
  "interior-templates",
  "keyword-research",
];

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const localeObj of SUPPORTED_LOCALES) {
    for (const slug of TOP_10_SLUGS) {
      params.push({
        locale: localeObj.code,
        slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const toolData = getToolTranslation(locale as SupportedLocale, slug);

  if (!toolData) {
    return {
      title: "KDPage Free KDP Tools",
    };
  }

  const baseUrl = "https://www.kdpage.com";
  const canonicalUrl = `${baseUrl}/${locale}/tools/${slug}`;

  // Build hreflang alternates across all languages
  const languageAlternates: Record<string, string> = {
    en: `${baseUrl}/tools/${slug}`,
    "x-default": `${baseUrl}/tools/${slug}`,
  };

  for (const loc of SUPPORTED_LOCALES) {
    languageAlternates[loc.code] = `${baseUrl}/${loc.code}/tools/${slug}`;
  }

  return {
    title: toolData.title,
    description: toolData.description,
    keywords: toolData.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: toolData.title,
      description: toolData.description,
      url: canonicalUrl,
      siteName: "KDPage",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: toolData.h1 }],
      type: "website",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: toolData.title,
      description: toolData.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function LocalizedToolPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const toolData = getToolTranslation(locale as SupportedLocale, slug);

  if (!toolData) {
    notFound();
  }

  // Generate Google Rich Results FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: toolData.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // Render correct interactive tool client component
  const renderToolComponent = () => {
    switch (slug) {
      case "spine-calculator":
        return <SpineCalculator />;
      case "kdp-cover-creator":
        return <KdpCoverCreatorClient />;
      case "kdp-file-validator":
        return <KdpFileValidator />;
      case "print-cost-calculator":
        return <PrintCostCalculator />;
      case "isbn-generator":
        return <IsbnGenerator />;
      case "kdp-puzzle-generator":
        return <KdpPuzzleGeneratorClient />;
      case "word-search":
        return <WordSearchStudio />;
      case "interior-templates":
        return <InteriorTemplates />;
      case "keyword-research":
        return <KeywordResearchPage />;
      default:
        return notFound();
    }
  };

  return (
    <>
      <Script
        id={`faq-schema-${locale}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
        {/* Breadcrumb Navigation */}
        <div className="w-full max-w-5xl mx-auto pt-6 px-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/tools" className="hover:text-white transition">
              Tools
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 truncate">{toolData.h1}</span>
          </nav>
        </div>

        {/* Language Switcher Bar */}
        <LanguageSwitcher currentLocale={locale as SupportedLocale} slug={slug} />

        {/* Localized Hero Header */}
        <header className="w-full max-w-4xl mx-auto text-center px-4 mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {toolData.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {toolData.h1}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {toolData.subtitle}
          </p>

          {/* Quick Value Highlights */}
          {toolData.features.length > 0 && (
            <div className="pt-2 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs text-slate-300">
              {toolData.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Interactive Tool Container */}
        <main className="w-full max-w-6xl mx-auto px-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-sm">
            {renderToolComponent()}
          </div>
        </main>

        {/* Localized FAQ Section with Rich Schema */}
        {toolData.faqs.length > 0 && (
          <section className="w-full max-w-4xl mx-auto px-4 mt-16 space-y-6">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Frequently Asked Questions ({locale.toUpperCase()})
              </h2>
            </div>

            <div className="space-y-3">
              {toolData.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-4 transition-all duration-200 hover:border-slate-700"
                >
                  <summary className="font-bold text-sm text-slate-200 cursor-pointer list-none flex items-center justify-between gap-4">
                    <span>{faq.q}</span>
                    <span className="text-slate-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action Banner */}
        <section className="w-full max-w-4xl mx-auto px-4 mt-16">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 text-center space-y-4 shadow-xl">
            <h3 className="text-2xl font-black text-white">
              Ready to Publish High-Converting Books on Amazon KDP?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Start your risk-free 7-day trial of KDPage Pro today. Get 2 free 300 DPI watermark-free book interior & cover downloads to test directly on Amazon.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-transform hover:scale-105"
              >
                ⚡ Start 7-Day Free Trial (Use Code LAUNCH25)
              </Link>
              <Link
                href="/tools"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
              >
                Browse All Free Tools →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
