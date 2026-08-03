"use client";

import { useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { saveProjectToLibrary } from "../actions";
import Link from "next/link";

interface SaveToLibraryButtonProps {
  title: string;
  content: string;
  subtitle?: string;
  className?: string;
}

export default function SaveToLibraryButton({
  title,
  content,
  subtitle,
  className = "",
}: SaveToLibraryButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await saveProjectToLibrary(title, content, subtitle);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      } else {
        setError(res.error || "Failed to save");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

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
            <span>Saving to Library...</span>
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>Saved to My Library!</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 text-white" />
            <span>Save to My Library</span>
          </>
        )}
      </button>

      {saved && (
        <Link
          href="/notebook"
          className="text-[10px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
        >
          View in My Notebook →
        </Link>
      )}

      {error && <span className="text-[10px] font-bold text-rose-500">{error}</span>}
    </div>
  );
}
