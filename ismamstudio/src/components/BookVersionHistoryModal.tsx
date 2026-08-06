"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, History, Save, RotateCcw, Trash2, AlertTriangle, BookOpen } from "lucide-react";
import { BookVersion, loadBookVersions, saveBookVersion, deleteBookVersion } from "@/lib/bookVersions";

interface BookVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  getSnapshot: () => Omit<BookVersion, "id" | "createdAt" | "name">;
  onRestore: (version: BookVersion) => void;
}

function formatWhen(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookVersionHistoryModal({
  isOpen,
  onClose,
  getSnapshot,
  onRestore,
}: BookVersionHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [versions, setVersions] = useState<BookVersion[]>([]);
  const [name, setName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVersions(loadBookVersions());
      setWarning(null);
      setConfirmingId(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    const label = name.trim() || `Book Version ${versions.length + 1}`;
    const snapshot = getSnapshot();
    const { versions: next, ok } = saveBookVersion({ ...snapshot, name: label });
    setVersions(next);
    setName("");
    setWarning(
      ok
        ? null
        : "This outline is too large to store locally. Try reducing large embedded images first."
    );
  };

  const handleRestore = (ver: BookVersion) => {
    onRestore(ver);
    onClose();
  };

  const handleDelete = (id: string) => {
    const next = deleteBookVersion(id);
    setVersions(next);
    setConfirmingId(null);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                Book Version History
              </h3>
              <p className="text-xs text-slate-400">
                Save named outline checkpoints and restore past book drafts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Save new version */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Save Current Book Version
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 50-Page Sudoku Outline v1"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Version
              </button>
            </div>
            {warning && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {warning}
              </p>
            )}
          </div>

          {/* List versions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Checkpoints ({versions.length})
            </h4>

            {versions.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">No saved versions yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Name your current outline above to create a version snapshot.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition group"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm truncate">{ver.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {formatWhen(ver.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {ver.pageCount} Pages
                        </span>
                        <span>•</span>
                        <span>{ver.trimSize}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestore(ver)}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Restore this version into Book Builder"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>

                      {confirmingId === ver.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(ver.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                          >
                            Delete?
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(ver.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                          title="Delete version"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
