"use client";

import { useRouter } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { saveBookToDB } from "../actions";
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
  Clock
} from "lucide-react";

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
    label: "Self-Help Motivation",
    text: "A practical guide for young professionals looking to build high-performance morning routines, overcome creative block, and maintain consistent passive income."
  },
  {
    label: "Kids Animal Fable",
    text: "An adventurous little squirrel named Barnaby who forgets where he hid his winter acorns, leading him on a journey of friendship across the whispering forest."
  }
];

export default function GeneratePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [genre, setGenre] = useState("fantasy");
  const [tone, setTone] = useState("mysterious");
  const [audience, setAudience] = useState("young-adult");

  // 🚀 Vercel AI SDK Hook with extra body settings support
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
          router.push(`/book/${savedBook.id}`);
        }
      } catch (e) {
        console.error("Failed to save book:", e);
      } finally {
        setIsSaving(false);
      }
    }
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [completion]);

  const handleExampleClick = (text: string) => {
    setInput(text);
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-105 p-6 pt-24 relative overflow-hidden flex items-center justify-center">
      {/* 🔮 Background Glow Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl w-full relative z-10">
        
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Llama 3.3 Turbo Writer
          </div>
        </div>

        {!isLoading && completion.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Settings Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-slate-850 p-6 flex flex-col justify-between h-full">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-4 mb-4">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-black text-white">Writer Parameters</h2>
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Genre Category</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="fantasy">Fantasy & Magic</option>
                      <option value="sci-fi">Science Fiction / Space</option>
                      <option value="mystery">Mystery & Suspense</option>
                      <option value="thriller">Action / Thriller</option>
                      <option value="romance">Cozy Romance</option>
                      <option value="non-fiction">Self-Help & Guide</option>
                    </select>
                  </div>

                  {/* Tone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Narrative Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="mysterious">Mysterious & Dark</option>
                      <option value="adventurous">Adventurous & Epic</option>
                      <option value="humorous">Lighthearted & Funny</option>
                      <option value="inspiring">Inspiring & Direct</option>
                      <option value="educational">Educational & Analytical</option>
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="kids">Children (Ages 6-12)</option>
                      <option value="young-adult">Young Adult (Ages 13-18)</option>
                      <option value="adults">Adult Readers</option>
                    </select>
                  </div>
                </div>

                {/* Timeline / Steps Guide */}
                <div className="mt-8 border-t border-slate-850 pt-6 space-y-4 text-xs font-semibold text-slate-450">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">1</div>
                    <span className="text-slate-350">Describe story concept & settings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">2</div>
                    <span className="text-slate-350">AI compiles 12-chapter outline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</div>
                    <span className="text-slate-350">Import directly into Cover Studio</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Prompt Input Area */}
            <div className="lg:col-span-8">
              <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-850 p-8 md:p-12 shadow-2xl h-full flex flex-col justify-between">
                
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                      What's your <span className="text-indigo-400">next masterpiece?</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-semibold">
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
                        placeholder="e.g. A dystopian world where cats rule the cities..."
                        className="w-full h-48 p-6 bg-slate-950 border border-slate-850 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-white leading-relaxed resize-none shadow-inner"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 rounded-2xl font-black text-base bg-gradient-to-r from-indigo-500 to-purple-650 text-white hover:from-indigo-650 hover:to-purple-750 transition-all shadow-xl hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5"
                    >
                      🚀 Generate Chapter Outline
                    </button>
                  </form>
                </div>

                {/* Example Quick Prompts */}
                <div className="mt-8 pt-6 border-t border-slate-850">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-3">
                    Click to Try a Sample Outline Prompt:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_EXAMPLES.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => handleExampleClick(example.text)}
                        className="text-[11px] font-bold text-slate-350 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 px-3.5 py-2 rounded-xl transition"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Streaming generation box */
          <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-850 p-8 md:p-12 shadow-2xl animate-fade-in flex flex-col h-[70vh] justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-white">AI Studio drafting...</h2>
                    <p className="text-xs text-slate-400 font-semibold">Please wait while the outline parameters compile</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                  <Clock className="w-4 h-4 text-indigo-400" /> Auto-Saving
                </div>
              </div>

              <div className="overflow-y-auto pr-4 custom-scrollbar h-[40vh]">
                <div className="prose prose-indigo prose-invert font-serif text-slate-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {completion}
                  {isLoading && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse translate-y-0.5"></span>}
                </div>
                <div ref={bottomRef} className="h-6" />
              </div>
            </div>

            {isSaving && (
              <div className="mt-6 pt-6 border-t border-slate-850 text-center animate-pulse">
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
              <h3 className="text-xl font-black text-white">Save Your Masterpiece</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Your AI story outline has been successfully generated! Sign up for a free account to save it, edit chapters, and download KDP-ready PDFs.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-550 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/15">
                Create Free Account / Sign In
              </Link>
              <button onClick={() => setIsAuthModalOpen(false)} className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 font-black text-xs rounded-xl">
                Keep Reading Outline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  </main>
);
}