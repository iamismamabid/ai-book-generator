// src/components/DownloadButton.tsx
"use client";

import React from "react";
import { FileDown } from "lucide-react";

interface DownloadButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export default function DownloadButton({ onClick, label = "Download PDF", disabled = false }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition disabled:opacity-50 shadow-md transform active:scale-95"
    >
      <FileDown className="w-5 h-5" />
      {label}
    </button>
  );
}