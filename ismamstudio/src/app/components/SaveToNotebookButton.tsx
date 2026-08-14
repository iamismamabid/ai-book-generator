"use client";

import { useState } from "react";
import { BookOpen, Check, Loader2, Cloud, CloudCheck } from "lucide-react";
import { saveToNotebook } from "../actions";
import Link from "next/link";

interface SaveToNotebookButtonProps {
  title: string;
  content: string;
  subtitle?: string;
  category?: string;
  data?: any;
  className?: string;
  iconOnly?: boolean;
}

export default function SaveToNotebookButton({
  title,
  content,
  subtitle,
  category = "general",
  data,
  className = "",
  iconOnly = false,
}: SaveToNotebookButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await saveToNotebook(title, content, subtitle, category, data);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      } else {
        setError(res.error || "Failed to sync to Notebook");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleSave}
        disabled={saving}
        title={saved ? "Saved to My Notebook!" : saving ? "Saving to Notebook..." : "Save Design to My Notebook"}
        className={`p-2.5 mx-auto rounded-xl transition-all duration-200 ease-out active:scale-[0.94] cursor-pointer flex items-center justify-center ${
          saved
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
            : "text-slate-500 hover:text-white hover:bg-slate-900"
        } ${className}`}
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : saved ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <BookOpen className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleSave}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
          saved
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
        } ${className}`}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Syncing to Notebook...</span>
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>Saved to My Notebook!</span>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 text-white" />
            <span>Save to My Notebook</span>
          </>
        )}
      </button>

      {saved && (
        <Link
          href="/notebook"
          className="text-[10px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
        >
          Synced with Account — View in My Notebook →
        </Link>
      )}

      {error && <span className="text-[10px] font-bold text-rose-500">{error}</span>}
    </div>
  );
}
