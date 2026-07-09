"use client";

import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle2, ChevronRight, Vote, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  category: "Design" | "Writing" | "Marketing" | "Interiors";
}

export default function RoadmapPage() {
  const [votedItems, setVotedItems] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [suggestStatus, setSuggestStatus] = useState<"idle" | "success" | "error">("idle");

  // Load voted items from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ismam_roadmap_votes");
      if (stored) {
        setVotedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Pre-populated roadmap data
  const [planned, setPlanned] = useState<RoadmapItem[]>([
    {
      id: "rm_svg_export",
      title: "SVG Vector Exports (Tier 3 Only)",
      description: "Allow downloading canvas drawings and custom layouts as fully editable SVG vector paths.",
      votes: 184,
      category: "Design"
    },
    {
      id: "rm_multilang",
      title: "Multi-Language Puzzle Boards",
      description: "Support grid clues, instructions, and labels in Spanish, German, French, and Italian.",
      votes: 142,
      category: "Interiors"
    },
    {
      id: "rm_niche_trends",
      title: "Weekly KDP Niche Trend Reports",
      description: "Deliver high-value, rising KDP keywords directly to your dashboard twice a week.",
      votes: 98,
      category: "Marketing"
    },
    {
      id: "rm_custom_fonts",
      title: "Custom Font Uploads (OTF/TTF)",
      description: "Upload your personal font library files directly to use inside the Cover & Interior Canvas Studio.",
      votes: 165,
      category: "Design"
    }
  ]);

  const [inProgress, setInProgress] = useState<RoadmapItem[]>([
    {
      id: "rm_pdf_merge",
      title: "KDP Interior PDF Merge Tool",
      description: "Drag, drop, reorder, and merge multiple puzzle interior sheets with bleed & gutters directly inside your dashboard.",
      votes: 211,
      category: "Interiors"
    },
    {
      id: "rm_novel_llama",
      title: "Llama 3.3 Novel Outline Generator",
      description: "Upgrade chapter assistant to the latest high-context Llama models for complex character and scene structuring.",
      votes: 119,
      category: "Writing"
    },
    {
      id: "rm_royalty_calc",
      title: "KDP Royalty & Profit Calculator",
      description: "Real-time pricing margins estimator across all international Amazon marketplaces.",
      votes: 89,
      category: "Marketing"
    }
  ]);

  const [released, setReleased] = useState<RoadmapItem[]>([
    {
      id: "rm_sidebar_edit",
      title: "Sidebar Unified Contextual Editor",
      description: "Consolidated all canvas element formatting (colors, fonts, opacity, layers) into the Left Control Panel.",
      votes: 310,
      category: "Design"
    },
    {
      id: "rm_100_shapes",
      title: "100+ Vector KDP Graphics Library",
      description: "Added 104 vectors across Planners, Marketing badges, and Educational guides (no animal designs).",
      votes: 276,
      category: "Design"
    },
    {
      id: "rm_maze_designer",
      title: "Labyrinth Shaped Maze Compiler",
      description: "Generate Circular, Square, and Heart shaped mazes with mathematically verified single-solutions.",
      votes: 421,
      category: "Interiors"
    },
    {
      id: "rm_sudoku_bulk",
      title: "Sudoku Grid Studio",
      description: "Bulk compile easy, medium, and hard sudoku grids with matching solution keys.",
      votes: 388,
      category: "Interiors"
    }
  ]);

  const handleVote = (id: string, column: "planned" | "inProgress") => {
    if (votedItems.includes(id)) return; // Already voted

    const updatedVotes = [...votedItems, id];
    setVotedItems(updatedVotes);
    localStorage.setItem("ismam_roadmap_votes", JSON.stringify(updatedVotes));

    const updater = (prev: RoadmapItem[]) =>
      prev.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item));

    if (column === "planned") {
      setPlanned(updater);
    } else {
      setInProgress(updater);
    }
  };

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    // Send suggestions via founder's email template
    const subject = encodeURIComponent("Feature Suggestion - Ismam Studio");
    const body = encodeURIComponent(`Hi Ismam,\n\nI would love to see this feature added to Ismam Studio:\n\n${suggestion}\n\nCheers!`);
    
    setSuggestStatus("success");
    setSuggestion("");
    
    // Fallback/direct link trigger
    setTimeout(() => {
      window.location.href = `mailto:support@ismamstudio.me?subject=${subject}&body=${body}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
            Product Roadmap &amp; Upvoting
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            We are building Ismam Studio publicly. Upvote features you need or suggest custom puzzle engines directly to the founders.
          </p>
        </div>

        {/* Interactive Kanban Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
          
          {/* COLUMN 1: PLANNED */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> Planned
              </h2>
              <span className="text-xs bg-slate-800/60 text-slate-400 font-bold px-2.5 py-1 rounded-full border border-slate-800">
                {planned.length} Ideas
              </span>
            </div>

            <div className="space-y-4">
              {planned.map((item) => {
                const voted = votedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-950/60 border border-slate-850 hover:border-slate-755 rounded-2xl transition-all space-y-3 group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleVote(item.id, "planned")}
                        disabled={voted}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          voted
                            ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-350 border-slate-800 group-hover:border-slate-700"
                        }`}
                      >
                        <Vote className={`w-3.5 h-3.5 ${voted ? "fill-indigo-400" : ""}`} />
                        <span>{item.votes}</span>
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-450 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> In Progress
              </h2>
              <span className="text-xs bg-slate-800/60 text-slate-400 font-bold px-2.5 py-1 rounded-full border border-slate-800">
                {inProgress.length} Tasks
              </span>
            </div>

            <div className="space-y-4">
              {inProgress.map((item) => {
                const voted = votedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-950/60 border border-slate-850 hover:border-slate-755 rounded-2xl transition-all space-y-3 group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleVote(item.id, "inProgress")}
                        disabled={voted}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          voted
                            ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-355 border-slate-800 group-hover:border-slate-700"
                        }`}
                      >
                        <Vote className={`w-3.5 h-3.5 ${voted ? "fill-indigo-400" : ""}`} />
                        <span>{item.votes}</span>
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-450 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: RELEASED */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Released
              </h2>
              <span className="text-xs bg-slate-800/60 text-slate-400 font-bold px-2.5 py-1 rounded-full border border-slate-800">
                {released.length} Live
              </span>
            </div>

            <div className="space-y-4">
              {released.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all space-y-3 group opacity-85 hover:opacity-100"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Suggest a Feature Section */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Suggest a New Feature
              </h2>
              <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
                Need a specific puzzle model, template size, or design option? Suggest it here. We review every single request and prioritize high-demand features.
              </p>
            </div>

            <form onSubmit={handleSuggest} className="md:col-span-6 space-y-4">
              {suggestStatus === "success" && (
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-normal">
                    Setting up your email suggestion directly to support@ismamstudio.me...
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  placeholder="e.g. Add a Word Search grid builder that supports CSV file imports for quick upload..."
                  rows={4}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 transition-all text-sm"
              >
                Send Suggestion <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
