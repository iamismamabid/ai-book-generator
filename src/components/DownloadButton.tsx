"use client";

import React from "react";

interface DownloadButtonProps {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

export default function DownloadButton({
  onClick,
  label = "Download Sudoku PDF",
  disabled = false,
}: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-md 
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
    >
      {disabled ? "Processing..." : label}
    </button>
  );
}