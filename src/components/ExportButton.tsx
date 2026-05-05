"use client";

import { Download } from "lucide-react";

export default function ExportButton({ title, content }: { title: string; content: string }) {
  const handleExport = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Formats the title to a URL/file safe string
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="text-slate-600 hover:text-indigo-600 font-sans font-bold flex items-center gap-2 transition-all"
    >
      <Download className="w-4 h-4" /> Export TXT
    </button>
  );
}