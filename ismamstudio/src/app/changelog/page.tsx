import Link from "next/link";
import { ArrowLeft, Zap, Shield, Palette, BookOpen, Star, Wrench, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog | KDPage — Product Updates & Release History",
  description: "Track every new feature, improvement, and bug fix in KDPage. We ship fast and listen to our users — see what's new in our KDP puzzle book creator.",
  alternates: { canonical: "https://www.kdpage.com/changelog" },
  openGraph: {
    title: "Changelog | KDPage — Product Updates & Release History",
    description: "Track every new feature, improvement, and bug fix in KDPage.",
    url: "https://www.kdpage.com/changelog",
    type: "website",
  },
};

type BadgeColor = "indigo" | "emerald" | "amber" | "rose" | "violet" | "sky" | "slate";
interface ChangeEntry { type: "new" | "improved" | "fixed" | "security" | "removed"; text: string; }
interface Release { version: string; date: string; badge: string; badgeColor: BadgeColor; icon: string; summary: string; changes: ChangeEntry[]; }

const BADGE_COLORS: Record<BadgeColor, string> = {
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};
const TYPE_STYLES: Record<ChangeEntry["type"], string> = {
  new:      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  improved: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  fixed:    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  security: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  removed:  "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};
const TYPE_LABELS: Record<ChangeEntry["type"], string> = { new: "New", improved: "Improved", fixed: "Fixed", security: "Security", removed: "Removed" };

const RELEASES: Release[] = [
  {
    version: "v2.8.0", date: "August 2025", badge: "Latest", badgeColor: "emerald", icon: "✨",
    summary: "Font library expansion to 120+ fonts, 15 Cover Studio gradient presets & AppSumo webhook hardening.",
    changes: [
      { type: "new",      text: "120+ curated Google & System fonts across 7 categories in Cover Studio." },
      { type: "new",      text: "15 ready-made 1-click background color gradient & designer palette presets in Cover Studio canvas." },
      { type: "improved", text: "AppSumo webhook response messages fully aligned with Partner API specification (enhance_tier, reduce_tier, refund, deactivate)." },
      { type: "improved", text: "FontPicker now searches 1,350+ Google Fonts catalog with real-time live previews." },
      { type: "fixed",    text: "Studio sidebar header button/badge overlap fixed across Crossword, Cryptogram, Math Puzzle, and Word Scramble generators." },
    ],
  },
  {
    version: "v2.7.0", date: "July 2025", badge: "AppSumo Ready", badgeColor: "amber", icon: "🛡️",
    summary: "AppSumo 3-Tier alignment, complete AI removal, and team workspace improvements.",
    changes: [
      { type: "new",      text: "AppSumo 3-Tier structure: Tier 1 ($49), Tier 2 ($79), Tier 3 ($149 Max Stack)." },
      { type: "removed",  text: "Removed all Groq AI SDK references and AI routes to comply with AppSumo Radar non-AI policy." },
      { type: "improved", text: "Rate limiting (10 attempts / 10 min) enforced on AppSumo redeem action." },
      { type: "security", text: "AppSumo webhook hardened with timing-safe HMAC secret verification." },
      { type: "fixed",    text: "/generate and /tools/bulk-listing-generator now redirect cleanly to /studio and /tools." },
    ],
  },
  {
    version: "v2.6.0", date: "June 2025", badge: "Major Release", badgeColor: "indigo", icon: "🎨",
    summary: "KDP Cover Studio overhaul with Brand Kit, Fabric.js canvas, and Canva-style smart guides.",
    changes: [
      { type: "new",      text: "Full Fabric.js canvas Cover Studio with front cover, spine, and back cover editing in one workspace." },
      { type: "new",      text: "Brand Kit: save custom colors and font presets per user account." },
      { type: "new",      text: "Canva-style smart snapping alignment guides for precise object positioning." },
      { type: "new",      text: "Curved text tool and Photoshop-style layer blend modes for cover elements." },
      { type: "improved", text: "300 DPI vector-accurate PDF export for both cover and puzzle interiors." },
      { type: "improved", text: "Template Gallery Modal with 14 professionally designed cover templates." },
    ],
  },
  {
    version: "v2.5.0", date: "May 2025", badge: "Puzzle Engine", badgeColor: "violet", icon: "⚡",
    summary: "Shape-masked mazes, Kakuro puzzles, Cryptogram studio, and CSV bulk word import.",
    changes: [
      { type: "new",      text: "Shape-masked Maze generator: Heart, Star, Diamond, Circle, and Square masks." },
      { type: "new",      text: "Kakuro puzzle generator with adjustable difficulty and grid sizes." },
      { type: "new",      text: "Cryptogram Studio with custom quote import via CSV/TXT and cipher modes." },
      { type: "new",      text: "CSV/TXT bulk word list import across all puzzle engines." },
      { type: "new",      text: "Guided 1-click onboarding tour for all studio generators." },
    ],
  },
  {
    version: "v2.4.0", date: "April 2025", badge: "Tools Update", badgeColor: "sky", icon: "🔧",
    summary: "30+ free KDP tools launched with no signup required.",
    changes: [
      { type: "new",      text: "Spine Calculator: automatic spine width computation by page count and paper type." },
      { type: "new",      text: "Royalty Estimator: real-time Amazon KDP royalty calculation." },
      { type: "new",      text: "ISBN Generator, QR Code Generator, Keyword Research, and 25+ additional KDP utility tools." },
      { type: "new",      text: "Coloring Book Generator, Word Cloud, Grammar Checker, OCR Scanner, and PDF Compressor." },
      { type: "improved", text: "All 30+ tools accessible without login — completely free tier, no account required." },
    ],
  },
  {
    version: "v2.3.0", date: "March 2025", badge: "Core Engine", badgeColor: "rose", icon: "📚",
    summary: "Bulk Puzzle Book Generator, Sudoku engine, and Notebook save system.",
    changes: [
      { type: "new",      text: "Bulk Puzzle Book Generator: 10–200 page puzzle interiors in one click with solution keys." },
      { type: "new",      text: "Sudoku engine with Easy, Medium, Hard, and Expert difficulty." },
      { type: "new",      text: "Notebook system: save and reload any generated puzzle book project." },
      { type: "new",      text: "Team Workspace: invite members and share Notebook projects across accounts." },
      { type: "fixed",    text: "Word Search grid sometimes missing words at hard difficulty — backtracking algorithm improved." },
    ],
  },
  {
    version: "v2.0.0", date: "January 2025", badge: "Public Launch", badgeColor: "slate", icon: "🚀",
    summary: "KDPage public launch — Word Search, Crossword, and Math Puzzle generators.",
    changes: [
      { type: "new",      text: "Word Search Generator with 10x10, 12x12, and 15x15 grid sizes and 8-directional word placement." },
      { type: "new",      text: "Crossword Puzzle Generator with custom word + clue pairs and auto-layout engine." },
      { type: "new",      text: "Math Puzzle Generator with addition, subtraction, multiplication, and division modes." },
      { type: "new",      text: "User authentication via Clerk with Google OAuth and email/password." },
      { type: "new",      text: "Paddle payment integration and KDPage public website with pricing, blog, FAQ, docs." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3 h-3" /> Product Updates
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Changelog</h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Every feature we ship, every bug we squash. KDPage is actively developed and updated weekly based on publisher feedback.
          </p>
          <div className="flex flex-wrap gap-8 mt-8">
            {[
              { label: "Releases", value: "7" },
              { label: "Features Shipped", value: "40+" },
              { label: "Tools Available", value: "30+" },
              { label: "Active Since", value: "Jan 2025" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-slate-700/40 to-transparent" />
          <div className="space-y-10">
            {RELEASES.map((release) => (
              <div key={release.version} className="relative pl-14">
                <div className="absolute left-0 top-3 w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-lg shadow-lg">
                  {release.icon}
                </div>
                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-200">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xl font-black text-white font-mono">{release.version}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${BADGE_COLORS[release.badgeColor]}`}>
                      {release.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 ml-auto">{release.date}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-5 leading-relaxed">{release.summary}</p>
                  <ul className="space-y-2.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`shrink-0 mt-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap ${TYPE_STYLES[change.type]}`}>
                          {TYPE_LABELS[change.type]}
                        </span>
                        <span className="text-sm text-slate-300 leading-relaxed">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl text-center">
          <div className="text-2xl font-black text-white mb-2">We ship every week 🚀</div>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Have a feature request? We read every message and prioritize based on user votes. Join our community of KDP publishers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/docs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
              <BookOpen className="w-4 h-4" /> Read Docs
            </Link>
            <Link href="/faq" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-700 transition-colors">
              <Star className="w-4 h-4" /> FAQ
            </Link>
            <Link href="/studio" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-700 transition-colors">
              <Sparkles className="w-4 h-4" /> Try Studio
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
