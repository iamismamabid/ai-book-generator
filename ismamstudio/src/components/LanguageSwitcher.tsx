"use client";

import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/lib/i18n/tools-data";

interface LanguageSwitcherProps {
  currentLocale?: SupportedLocale | "en";
  slug: string;
}

export default function LanguageSwitcher({
  currentLocale = "en",
  slug,
}: LanguageSwitcherProps) {
  const languages: { code: SupportedLocale | "en"; label: string; flag: string; path: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸", path: `/tools/${slug}` },
    ...SUPPORTED_LOCALES.map((l) => ({
      code: l.code,
      label: l.nativeName,
      flag: l.flag,
      path: `/${l.code}/tools/${slug}`,
    })),
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-2 sm:p-2.5">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pl-2">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden sm:inline">Available in:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {languages.map((lang) => {
            const isActive = currentLocale === lang.code;
            return (
              <Link
                key={lang.code}
                href={lang.path}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
