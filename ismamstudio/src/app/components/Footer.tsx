import Link from "next/link";
import Image from "next/image";
import { Mail, Shield, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-950/80 border-t border-slate-900 backdrop-blur-md" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-6 py-16" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-36 h-12 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Ismam Studio Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Your all-in-one KDP publishing toolkit. Create puzzles, write story chapters, and compile custom book designs in minutes.
            </p>
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
                <Link href="/#features" className="text-slate-400 hover:text-indigo-400 transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/#examples" className="text-slate-400 hover:text-indigo-400 transition-colors">Examples</Link>
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
                <Link href="/faq" className="text-slate-400 hover:text-indigo-400 transition-colors">FAQ Help Center</Link>
              </li>
              <li>
                <Link href="/redeem" className="text-slate-400 hover:text-indigo-400 transition-colors">Redeem AppSumo Code</Link>
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

          {/* Support / Contact */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" /> Contact Support
            </h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-3">
              Need help? Feel free to contact our support team.
            </p>
            <div className="space-y-3 flex flex-col items-start">
              <a
                href="mailto:support@ismamstudio.me"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Mail className="w-4 h-4" /> support@ismamstudio.me
              </a>
            </div>
          </div>

        </div>

        <div className="h-px bg-slate-900 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-center">
          <div>
            © {new Date().getFullYear()} Ismam Studio. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Product Hunt Launch Badge */}
            <a 
              href="https://www.producthunt.com/products/ismam-studio?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ismamstudio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1187333&theme=light&t=1783111930255" 
                alt="IsmamStudio - All-in-one AI toolkit for Amazon KDP self-publishers. | Product Hunt" 
                width="180" 
                height="39" 
                style={{ width: '180px', height: '39px' }}
              />
            </a>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10 shrink-0">
              100% KDP spec compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
