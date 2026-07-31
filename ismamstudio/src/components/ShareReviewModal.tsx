"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share2, Loader2, Copy, Check, Trash2, AlertTriangle } from "lucide-react";
import { createCoverShare, listCoverShares, revokeCoverShare } from "@/app/actions";

interface ShareRow {
  token: string;
  title: string;
  createdAt: Date | string;
  trimLabel: string | null;
}

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Renders the current cover to a compact preview data URL */
  buildPreview: () => Promise<string>;
  meta: { trimLabel: string; pageCount: number; spineWidth: number };
}

export default function ShareReviewModal({
  isOpen,
  onClose,
  buildPreview,
  meta,
}: ShareReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setCopied(null);
    setLoading(true);
    listCoverShares()
      .then((res) => setShares((res.shares as ShareRow[]) || []))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const linkFor = (token: string) =>
    typeof window === "undefined" ? "" : `${window.location.origin}/review/${token}`;

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const previewUrl = await buildPreview();
      const res = await createCoverShare({
        title: title.trim() || "Untitled Cover",
        previewUrl,
        trimLabel: meta.trimLabel,
        pageCount: meta.pageCount,
        spineWidth: meta.spineWidth,
      });
      if (!res.success || !res.token) {
        setError(
          res.error === "unauthorized"
            ? "Sign in to create a review link."
            : res.error || "Couldn't create the review link."
        );
        return;
      }
      setTitle("");
      const refreshed = await listCoverShares();
      setShares((refreshed.shares as ShareRow[]) || []);
      // Surface the new link immediately by copying it.
      await navigator.clipboard?.writeText(linkFor(res.token)).catch(() => {});
      setCopied(res.token);
    } catch (err) {
      console.error(err);
      setError("Couldn't render the cover preview. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(linkFor(token));
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 2000);
    } catch {
      setError("Couldn't copy — select the link manually.");
    }
  };

  const handleRevoke = async (token: string) => {
    await revokeCoverShare(token);
    setShares((prev) => prev.filter((s) => s.token !== token));
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-lg w-full p-6 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Share2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">Share for Review</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-5">
          Create a read-only link your client or co-author can open without an account.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !creating && handleCreate()}
            placeholder="Name this review link..."
            className="flex-1 text-xs font-semibold px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            {creating ? "Creating" : "Create"}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/60 rounded-xl p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-semibold text-red-300">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 text-center py-8">
              No review links yet.
            </p>
          ) : (
            <div className="space-y-2">
              {shares.map((s) => (
                <div
                  key={s.token}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{s.title}</p>
                      <p className="text-[10px] font-semibold text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                        {s.trimLabel ? ` · ${s.trimLabel}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(s.token)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[9px] font-black uppercase rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {copied === s.token ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === s.token ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleRevoke(s.token)}
                      title="Revoke this link"
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 truncate bg-slate-900/80 rounded-lg px-2 py-1.5">
                    {linkFor(s.token)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
