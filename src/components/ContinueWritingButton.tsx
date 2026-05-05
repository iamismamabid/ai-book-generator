"use client";

import { useState } from "react";
import { continueBookStory } from "../app/actions";
import { Sparkles } from "lucide-react";

export default function ContinueWritingButton({ bookId }: { bookId: string }) {
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    await continueBookStory(bookId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleContinue}
      disabled={loading}
      className="w-full h-32 bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center text-indigo-600 transition-all disabled:opacity-50"
    >
      <Sparkles className={`w-8 h-8 mb-2 ${loading ? "animate-spin" : "animate-bounce"}`} />
      <span className="font-sans font-bold text-lg">
        {loading ? "AI is writing the next page..." : "Write Next Page"}
      </span>
    </button>
  );
}