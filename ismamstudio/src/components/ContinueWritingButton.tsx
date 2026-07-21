// src/components/ContinueWritingButton.tsx
"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface ContinueWritingButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function ContinueWritingButton({ onClick, isLoading = false }: ContinueWritingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/10 active:scale-98"
    >
      <Sparkles className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Drafting Chapter..." : "Continue Writing"}
    </button>
  );
}