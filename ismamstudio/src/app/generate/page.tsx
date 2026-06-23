"use client";

import { useRouter } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { saveBookToDB } from "../actions";
import { useEffect, useRef, useState } from "react";

export default function GeneratePage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 Vercel AI SDK Magic Hook
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
    onError: (error) => {
      console.error("AI Generation Error:", error.message);
      alert(`Oops! Something went wrong: ${error.message}`);
      setIsSaving(false); 
    },
    onFinish: async (prompt, result) => {
      setIsSaving(true);
      const titleMatch = result.match(/\*\*Book Title:\*\*\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : "My AI Masterpiece";

      const savedBook = await saveBookToDB(title, result);
      if (savedBook?.id) {
        router.push(`/book/${savedBook.id}`);
      }
    }
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [completion]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-blue-100 flex items-center justify-center p-6 pt-24">
      <div className="max-w-3xl w-full bg-white/60 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] shadow-2xl border border-white/80 relative overflow-hidden transition-all duration-700">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {!isLoading && completion.length === 0 ? (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                  What's your <span className="text-indigo-600">next story?</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
                  Describe your idea in a few sentences, and our AI will outline your future masterpiece.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="group space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">
                    Story Prompt / Vision
                  </label>
                  <div className="relative">
                    <textarea 
                      name="prompt"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="e.g. A dystopian world where cats rule the cities..."
                      className="w-full h-56 p-8 bg-white/80 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-xl leading-relaxed resize-none shadow-inner"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 rounded-3xl font-black text-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  🚀 Start Generating
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col h-[60vh]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-slate-900">AI is drafting...</h2>
                    <p className="text-sm text-slate-500 font-medium">Please wait while the magic happens</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="prose prose-indigo prose-xl font-serif text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {completion}
                  {isLoading && <span className="inline-block w-2 h-6 bg-indigo-500 ml-1 animate-pulse translate-y-1"></span>}
                </div>
                <div ref={bottomRef} className="h-10" />
              </div>

              {isSaving && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center animate-pulse">
                  <p className="text-indigo-600 font-bold text-lg flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Saving your masterpiece to the database...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}