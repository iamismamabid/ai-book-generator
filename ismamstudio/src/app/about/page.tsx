import Link from "next/link";
import { ArrowLeft, Users, Shield, Cpu, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | KDPage — KDP Book Creator Mission",
  description: "Learn about the mission behind KDPage: empowering Amazon KDP self-publishers with mathematically precise puzzle builders and cover canvases.",
  alternates: {
    canonical: "https://www.kdpage.com/about",
  },
  openGraph: {
    title: "About Us | KDPage — KDP Book Creator Mission",
    description: "Learn about the mission behind KDPage: empowering Amazon KDP self-publishers with mathematically precise puzzle builders and cover canvases.",
    url: "https://www.kdpage.com/about",
    type: "website",
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/25">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">About KDPage</h1>
              <p className="text-slate-400 text-sm font-semibold mt-1">Our mission: Empower KDP authors to create without friction.</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          {/* Vision */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Why We Built This</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              Self-publishing on Amazon KDP offers immense passive income opportunities, but formatting interiors and designing wrap-around covers can be an absolute nightmare. Authors spend hours adjusting margins, calculating spine sizes, and wrestling with design tools just to have their uploads rejected by Amazon&apos;s review team.
            </p>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              We built <strong className="text-white">KDPage</strong> to simplify this entire workflow. By combining 8+ vector puzzle generators (Sudoku, Mazes, Word Search) with an intelligent cover canvas, 24/7 automated support, and AI story outlines, we allow creators to go from idea to publication-ready PDFs in less than 30 seconds.
            </p>
          </div>

          {/* Team & Infrastructure Grid */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h2 className="text-2xl font-black text-white">Our Team &amp; Infrastructure</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              KDPage is backed by an agile team of engineers, UI/UX designers, and KDP publishing specialists. Our platform is built on 100% serverless, auto-scaling cloud infrastructure to ensure 99.9% uptime during peak publishing seasons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-white font-bold text-sm text-indigo-400">Engineering &amp; Architecture</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Led by experienced software engineers specializing in vector graphics, mathematical solvers, and serverless cloud systems.
                </p>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-white font-bold text-sm text-purple-400">Design &amp; Documentation</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Dedicated UI/UX designers and technical writers updating our 14+ article Knowledge Base (/docs) for 24/7 self-service.
                </p>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-white font-bold text-sm text-emerald-400">QA &amp; Customer Support</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Round-the-clock support specialists providing under 12-hour response times at support@kdpage.com for all members.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/10 w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">Mathematical Precision</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Our puzzles are generated using advanced algorithms to guarantee single-solution uniqueness. No duplicates or broken boards.
              </p>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-amber-600/10 rounded-xl text-amber-400 border border-amber-500/10 w-fit">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">Bleed &amp; Gutter Compliant</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                PDF grids automatically conform to standard KDP safe zones, trim sizes, and binding offsets to avoid review rejection.
              </p>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 space-y-3">
              <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-400 border border-emerald-500/10 w-fit">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">All-In-One Assembly</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Seamlessly merge your custom puzzles, divider sheets, story chapters, and final back/front covers into one KDP bundle.
              </p>
            </div>
          </div>

          {/* Creator / Founder Note */}
          <div className="mt-8 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg">
                K
              </div>
              <div>
                <h3 className="text-white font-black text-lg">A Note from the Lead Creator</h3>
                <p className="text-indigo-400 text-xs font-semibold">Software Engineer &amp; KDP Publisher</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
              &quot;As a Software Engineer and active Amazon KDP publisher, I quickly realized how expensive and fragmented the book-creation process can be. Standard publishing tools were scattered across different clunky platforms, making it tedious to compile a single high-quality book. I knew there had to be a more integrated, high-performance way.&quot;
            </p>
            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
              &quot;That is why we built KDPage. Our goal was to create a single, automated, and genuinely premium workspace that empowers independent authors and publishers. We engineered our platform to generate mathematically verified puzzles, shape-masked labyrinths, and print-compliant cover layouts in under 30 seconds.&quot;
            </p>
            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
              &quot;Whether you are just starting your KDP publishing journey or scaling a commercial publishing agency, our team and platform are built to grow with you. With flexible access options — including monthly, annual, and lifetime access plans — we keep enterprise-grade tools accessible so you can retain 100% of your royalties and focus on what matters most: creating and scaling.&quot;
            </p>

            <div className="pt-2 text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Have feedback or feature requests? Contact our team anytime at <a href="mailto:support@kdpage.com" className="text-indigo-400 hover:underline">support@kdpage.com</a></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
