"use client";

import posthog from "posthog-js";
import { useRouter } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { saveBookToDB, checkPremiumStatus, getUserUsage } from "../actions";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Settings, 
  HelpCircle,
  Clock,
  Lock,
  AlertTriangle
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";

const PROMPT_EXAMPLES = [
  {
    label: "Dystopian Sci-Fi",
    text: "A dystopian world where cats rule the cities and humans are kept as pampered pets, but a secret rebel organization tries to reclaim freedom."
  },
  {
    label: "Cozy Murder Mystery",
    text: "A small-town baker discovers a secret recipe book belonging to a local historian who went missing 50 years ago, leading to a series of bakery break-ins."
  },
  {
    label: "Magical Fantasy Quest",
    text: "A young apprentice clockmaker discovers that some antique pocket watches can pause time for exactly three minutes, drawing the attention of a rogue guild."
  },
  {
    label: "Self-Help Morning Routine",
    text: "A practical guide for young professionals looking to build high-performance morning routines, overcome creative block, and maintain consistent passive income."
  }
];

export default function GeneratePage() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [genre, setGenre] = useState("fantasy");
  const [tone, setTone] = useState("mysterious");
  const [audience, setAudience] = useState("young-adult");

  const [usage, setUsage] = useState({ outlinesCount: 0, chaptersCount: 0 });
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    async function loadLimits() {
      if (!userId) return;
      try {
        const pStatus = await checkPremiumStatus();
        const uStatus = await getUserUsage();
        setPremiumStatus(pStatus as any);
        setUsage(uStatus);

        if (pStatus.plan === "free" && uStatus.outlinesCount >= 1) {
          setLimitReached(true);
        } else if (pStatus.plan === "starter" && uStatus.outlinesCount >= 5) {
          setLimitReached(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadLimits();
  }, [userId]);

  const { completion, input, setInput, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
    body: {
      genre,
      tone,
      audience
    },
    onError: (error) => {
      console.error("AI Generation Error:", error.message);
      alert(`Oops! Something went wrong: ${error.message}`);
      setIsSaving(false); 
    },
    onFinish: async (prompt, result) => {
      if (!isSignedIn) {
        setIsAuthModalOpen(true);
        return;
      }
      setIsSaving(true);
      try {
        const titleMatch = result.match(/\*\*Book Title:\*\*\s*"([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "My AI Masterpiece";
        const savedBook = await saveBookToDB(title, result);
        if (savedBook?.id) {
          posthog.capture("book_outline_generated", {
            book_id: savedBook.id,
            genre,
            tone,
            audience,
            plan: premiumStatus.plan,
          });
          router.push(`/book/${savedBook.id}`);
        }
      } catch (e) {
        posthog.captureException(e);
        console.error("Failed to save book:", e);
      } finally {
        setIsSaving(false);
      }
    }
  });

  const handleExampleClick = (text: string) => {
    setInput(text);
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (limitReached) {
      alert("Monthly limit reached. Please upgrade your plan.");
      return;
    }
    posthog.capture("book_outline_generation_started", {
      genre,
      tone,
      audience,
      plan: premiumStatus.plan,
    });
    handleSubmit(e);
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [completion]);

  const activeCompletion = completion || "";
  const activeLoading = isLoading;

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-10 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-indigo-400 text-sm font-semibold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-900">
            Monthly Usage: <span className="text-white">{usage.outlinesCount}</span> / {premiumStatus.plan === "free" ? "1 Outline" : premiumStatus.plan === "starter" ? "5 Outlines" : "Unlimited"}
          </div>
        </div>

        {/* Limit Warning Banner */}
        {limitReached && (
          <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl text-amber-300 text-sm font-bold flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p>Monthly Generation Limit Reached</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Your plan ({premiumStatus.plan === "free" ? "Free Tier" : "Starter Tier"}) allows {premiumStatus.plan === "free" ? "1" : "5"} outline generation per month.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              onClick={() => posthog.capture("upgrade_plan_clicked", { source: "generation_limit_banner", plan: premiumStatus.plan })}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs px-5 py-2.5 rounded-xl transition font-black uppercase tracking-wider"
            >
              Upgrade Plan
            </Link>
          </div>
        )}

        {!activeCompletion && !activeLoading ? (
          /* Normal State: Config Panels */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column: Vision Settings */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-3xl space-y-4">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" /> Story Parameters
                  </h3>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="fantasy">Magical Fantasy</option>
                      <option value="sci-fi">Space Opera Sci-Fi</option>
                      <option value="mystery">Cozy Murder Mystery</option>
                      <option value="thriller">Action Thriller</option>
                      <option value="self-help">Self-Help / Non-Fiction</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Narrative Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="mysterious">Mysterious & Cryptic</option>
                      <option value="inspiring">Inspiring & Thoughtful</option>
                      <option value="dark">Dark & Cinematic</option>
                      <option value="playful">Lighthearted & Playful</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="young-adult">Young Adult (YA)</option>
                      <option value="adults">Adult General Fiction</option>
                      <option value="kids">Children / Middle Grade</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-3 text-xs text-slate-400">
                  <h4 className="font-bold text-white mb-2">How it works:</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">1</div>
                    <span className="text-slate-300">Describe story concept & settings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">2</div>
                    <span className="text-slate-300">AI compiles 12-chapter outline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</div>
                    <span className="text-slate-300">Generate chapters or download PDF</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Prompt Input Area */}
            <div className="lg:col-span-8">
              <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-900 p-8 md:p-12 shadow-2xl h-full flex flex-col justify-between">
                
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                      What's your <span className="text-indigo-400">next masterpiece?</span>
                    </h1>
                    <p className="text-slate-200 text-sm font-bold leading-relaxed">
                      Describe your book idea in 2-3 sentences. Our AI will outline your KDP-compliant novel outline instantly.
                    </p>
                  </div>

                  <form onSubmit={handleCustomSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">
                        Story Vision / Outline Prompt
                      </label>
                      <textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder={limitReached ? "Monthly outline quota reached. Please upgrade to unlock." : "e.g. A dystopian world where cats rule the cities..."}
                        disabled={limitReached}
                        className="w-full h-48 p-6 bg-slate-950 border border-slate-900 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-white leading-relaxed resize-none shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={limitReached}
                      className="w-full py-5 rounded-2xl font-black text-base bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {limitReached ? <Lock className="w-5 h-5" /> : "🚀"} Compile Chapter Outline
                    </button>
                  </form>
                </div>

                {/* Example Quick Prompts */}
                <div className="mt-8 pt-6 border-t border-slate-900">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-3">
                    Click to Try a Sample Outline Prompt:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_EXAMPLES.map((example, i) => (
                      <button
                        key={i}
                        disabled={limitReached}
                        onClick={() => handleExampleClick(example.text)}
                        className="text-[11px] font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-700 px-3.5 py-2 rounded-xl transition disabled:opacity-40"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>

                <CoverStudioCTA variant="banner" />

              </div>
            </div>

          </div>
        ) : (
          /* Streaming generation box */
          <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-900 p-8 md:p-12 shadow-2xl animate-fade-in flex flex-col h-[70vh] justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-white">Compiler drafting outline...</h2>
                    <p className="text-xs text-slate-400 font-semibold">Please wait while the outline parameters compile</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                  <Clock className="w-4 h-4 text-indigo-400" /> Auto-Saving
                </div>
              </div>

              <div className="overflow-y-auto pr-4 custom-scrollbar h-[40vh]">
                <div className="prose prose-indigo prose-invert font-serif text-slate-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {activeCompletion}
                  {activeLoading && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse translate-y-0.5 animate-bounce"></span>}
                </div>
                <div ref={bottomRef} className="h-6" />
              </div>
            </div>

            {isSaving && (
              <div className="mt-6 pt-6 border-t border-slate-900 text-center animate-pulse">
                <p className="text-indigo-400 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  Saving outline chapters to database...
                </p>
              </div>
            )}
          </div>
        )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                {activeCompletion.length > 0 ? "Save Your Masterpiece" : "Sign In to Compile"}
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                {activeCompletion.length > 0
                  ? "Your story outline has been successfully compiled! Sign up for a free account to save it, edit chapters, and download KDP-ready PDFs."
                  : "Create a free KDPage account to unlock the Novel Chapter Planner and compile unlimited outlines."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/15">
                Create Free Account / Sign In
              </Link>
              <button onClick={() => setIsAuthModalOpen(false)} className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-900 font-black text-xs rounded-xl">
                {activeCompletion.length > 0 ? "Keep Reading Outline" : "Maybe Later"}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </main>
  );
}
