import Link from "next/link";
import { ArrowLeft, Map, CheckCircle2, PlayCircle, Calendar, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Roadmap | Ismam Studio",
  description: "Explore the development roadmap of Ismam Studio. See what KDP book creation tools are live, in progress, and planned for future releases.",
};

interface RoadmapItem {
  title: string;
  desc: string;
  badge?: string;
}

interface RoadmapColumn {
  phase: string;
  quarter: string;
  status: "live" | "progress" | "planned";
  items: RoadmapItem[];
}

const ROADMAP_DATA: RoadmapColumn[] = [
  {
    phase: "Phase 1: Foundation",
    quarter: "Q3 2026 (Released)",
    status: "live",
    items: [
      {
        title: "8 Specialized KDP Creation Engines",
        desc: "Interactive puzzle generators (Sudoku, Maze, Word Search, Word Scramble, Math Puzzles, Cryptograms) yielding mathematically unique single-solution grids.",
      },
      {
        title: "AI Novel Writer (Llama 3.3)",
        desc: "Automated outlining, novel story chapter formatting, and text expansions using advanced Groq AI model nodes.",
      },
      {
        title: "AI KDP Niche Hunter & Keyword Spy",
        desc: "Validate publishing niches instantly using Amazon autocomplete APIs, estimated BSR monthly sales counters, and royalty calculators.",
      },
      {
        title: "KDP Print-Ready Vector PDF Compiler",
        desc: "Merge multiple cover designs and custom puzzle sheets with bleed safety and binding gutter guards automatically adjusted.",
      },
    ],
  },
  {
    phase: "Phase 2: Expansion",
    quarter: "Q4 2026 (In Development)",
    status: "progress",
    items: [
      {
        title: "AI Coloring Page & Shape Vector Engine",
        desc: "Convert text prompts into vector line art outlines. Specially optimized for KDP coloring books and children's activity layouts.",
        badge: "In Progress",
      },
      {
        title: "Interactive Crossword Builder",
        desc: "Create professional crossword puzzles with custom clues, dictionary sync, and automatic symmetric grid compilers.",
        badge: "In Progress",
      },
      {
        title: "KDP Bulk Metadata & Listing Generator",
        desc: "Generate optimized titles, subtitles, description HTML, and KDP category suggestions in bulk using AI to speed up uploads.",
        badge: "Planned Next",
      },
    ],
  },
  {
    phase: "Phase 3: Ecosystem",
    quarter: "Q1 2027 (Future Pipeline)",
    status: "planned",
    items: [
      {
        title: "AI Children's Book Storyboard Studio",
        desc: "Maintains character, style, and scenery consistency across illustrated children's books using advanced image-to-image nodes.",
      },
      {
        title: "IngramSpark & Etsy API Integrations",
        desc: "Direct digital product syncing to Etsy store drafts and automated paperback PDF uploads straight to IngramSpark distribution.",
      },
      {
        title: "Team Workspaces & Brand Asset Libraries",
        desc: "Invite virtual assistants or co-authors to compile books. Shared libraries for pen-names, logos, and custom templates.",
      },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Map className="w-3.5 h-3.5" /> Product Journey
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Ismam Studio <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Roadmap</span>
          </h1>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed">
            See what we've built, what we are currently developing, and our vision for the future of KDP self-publishing.
          </p>
        </div>

        {/* Kanban Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {ROADMAP_DATA.map((col, cIdx) => (
            <div 
              key={cIdx} 
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-6 flex flex-col space-y-6 shadow-2xl relative"
            >
              {/* Header block */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    {col.phase}
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {col.quarter}
                  </h3>
                </div>
                {col.status === "live" && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-450 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/10 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Now
                  </span>
                )}
                {col.status === "progress" && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/10 shrink-0 animate-pulse">
                    <PlayCircle className="w-3.5 h-3.5" /> In Dev
                  </span>
                )}
                {col.status === "planned" && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/10 shrink-0">
                    <Calendar className="w-3.5 h-3.5" /> Pipeline
                  </span>
                )}
              </div>

              {/* List of items */}
              <div className="flex-1 space-y-5">
                {col.items.map((item, iIdx) => (
                  <div 
                    key={iIdx} 
                    className="bg-slate-950/40 border border-slate-855/80 rounded-2xl p-5 space-y-2 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-white font-bold text-sm leading-snug">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-950/30 via-slate-900/40 to-purple-950/30 backdrop-blur-md rounded-3xl border border-indigo-900/20 p-8 text-center max-w-4xl mx-auto space-y-4">
          <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-black text-white">Have a Feature Suggestion?</h3>
          <p className="text-slate-400 text-xs font-semibold max-w-lg mx-auto leading-relaxed">
            We are building Ismam Studio based on feedback from our self-publishing community. If you have an idea for a tool, generator, or design asset, send it directly to our developer team.
          </p>
          <a
            href="mailto:support@ismamstudio.me?subject=Feature%20Request%20for%20Ismam%20Studio"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            Submit Feature Request
          </a>
        </div>

      </div>
    </div>
  );
}
