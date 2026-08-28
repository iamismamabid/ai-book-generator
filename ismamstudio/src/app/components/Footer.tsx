import Link from "next/link";
import Image from "next/image";
import { Mail, Shield, BookOpen } from "lucide-react";
import GlowSettingToggle from "@/app/components/GlowSettingToggle";
import CursorSettingToggle from "@/app/components/CursorSettingToggle";
import NewsletterLeadForm from "@/app/components/NewsletterLeadForm";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-950/80 border-t border-slate-900 backdrop-blur-md" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-6 py-16" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-amber-500/10 bg-white/95 p-1 group-hover:scale-105 transition-transform flex items-center justify-center border border-slate-700/60">
                <Image
                  src="/logo_icon.png"
                  alt="KDPage Logo"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-xl font-black tracking-tight leading-none transition-transform group-hover:scale-[1.02] bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #00E5FF 0%, #3B82F6 25%, #A855F7 50%, #FF007A 75%, #FF3366 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  KDPage
                </span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  All-In-One
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Your all-in-one KDP publishing toolkit. Create puzzles, write story chapters, and compile custom book designs in minutes.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://smollaunch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-85 transition-opacity"
                title="KDPage — Launching on Smol Launch"
              >
                <img
                  src="/smollaunch-launching.png"
                  alt="KDPage — Launching on Smol Launch"
                  loading="lazy"
                  width={200}
                  height={48}
                  className="h-9 w-auto rounded-lg shadow-sm"
                />
              </a>
              {/* SourceForge Review Badge */}
              <a
                href="https://sourceforge.net/software/product/KDPage/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-85 transition-opacity"
                title="Write a Review for KDPage on SourceForge"
              >
                <img
                  src="/sourceforge-badge.png"
                  alt="SourceForge - Write a Review for KDPage"
                  loading="lazy"
                  width={110}
                  height={125}
                  className="h-11 w-auto object-contain drop-shadow-sm"
                />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/" className="text-slate-400 hover:text-indigo-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-indigo-400 transition-colors">About Us &amp; Founder Story</Link>
              </li>
              <li>
                <Link href="/#features" className="text-slate-400 hover:text-indigo-400 transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/examples" className="text-slate-400 hover:text-indigo-400 transition-colors">Examples</Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-indigo-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Browse Free Tools</Link>
              </li>
              <li>
                <Link href="/tools/keyword-research" className="text-slate-400 hover:text-indigo-400 transition-colors">KDP Keyword Explorer</Link>
              </li>
              <li>
                <Link href="/tools/spine-calculator" className="text-slate-400 hover:text-indigo-400 transition-colors">KDP Spine Calculator</Link>
              </li>
              <li>
                <Link href="/tools/isbn-generator" className="text-slate-400 hover:text-indigo-400 transition-colors">ISBN Barcode Generator</Link>
              </li>
              <li>
                <Link href="/docs" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Documentation &amp; Help Center</Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-indigo-400 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-indigo-400 transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-slate-400 hover:text-indigo-400 transition-colors">Affiliate Program</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" /> Policies
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund" className="text-slate-400 hover:text-indigo-400 transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-indigo-400 transition-colors">Cookie Policy</Link>
              </li>
            </ul>
          </div>

          {/* Support & Newsletter */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" /> Newsletter &amp; Support
            </h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-3">
              Subscribe for free KDP tool updates, interior templates, and publishing tips.
            </p>
            <div className="mb-4">
              <NewsletterLeadForm source="footer_newsletter" />
            </div>
            <div className="space-y-3 flex flex-col items-start pt-1">
              <a
                href="mailto:support@kdpage.com"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Mail className="w-4 h-4" /> support@kdpage.com
              </a>
            </div>
          </div>

        </div>

        <div className="h-px bg-slate-900 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-center">
          <div>
            © {new Date().getFullYear()} KDPage. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <GlowSettingToggle />
            <CursorSettingToggle />
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10 shrink-0">
              100% KDP spec compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
