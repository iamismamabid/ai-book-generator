"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateNextChapter } from "../../actions";

export default function ChapterButton({ bookId, outline, title, currentCount }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWrite = async () => {
    setLoading(true);
    try {
      await generateNextChapter(bookId, outline, title);
      router.refresh();
    } catch (error) {
      alert("AI is a bit tired. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-6 py-12 border-t border-slate-100 mt-16">
      
      {/* 🚀 লোডিং অবস্থায় ব্যাকগ্রাউন্ড ব্লার ইফেক্ট */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl transition-all">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-600 font-black animate-pulse">
            AI is crafting Chapter {currentCount + 1}... ✨
          </p>
        </div>
      )}

      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
        {currentCount === 0 ? "Begin the Legend" : `Current Progress: ${currentCount} Chapters`}
      </p>
      
      <button
        onClick={handleWrite}
        disabled={loading}
        className={`group relative px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
          loading 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95"
        }`}
      >
        <div className="flex items-center gap-3">
          <span>{loading ? "Writing Magic..." : `🚀 Write Chapter ${currentCount + 1}`}</span>
          {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
        </div>
      </button>

      <p className="text-slate-400 text-xs italic">
        Tip: Each chapter is logically connected to your outline.
      </p>
    </div>
  );
}