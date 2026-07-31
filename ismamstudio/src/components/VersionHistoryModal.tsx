"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, History, Save, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { CoverVersion, loadVersions, saveVersion, deleteVersion } from "@/lib/coverVersions";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Builds the snapshot payload for the current design */
  getSnapshot: () => Omit<CoverVersion, "id" | "createdAt" | "name">;
  onRestore: (version: CoverVersion) => void;
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

export default function VersionHistoryModal({
  isOpen,
  onClose,
  getSnapshot,
  onRestore,
}: VersionHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [versions, setVersions] = useState<CoverVersion[]>([]);
  const [name, setName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVersions(loadVersions());
      setWarning(null);
      setConfirmingId(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    const label = name.trim() || `Version ${versions.length + 1}`;
    const snapshot = getSnapshot();
    const { versions: next, ok } = saveVersion({ ...snapshot, name: label });
    setVersions(next);
    setName("");
    setWarning(
      ok
        ? null
        : "This design is too large to store locally. Try removing a large uploaded background image first."
    );
  };

  const handleDelete = (id: string) => {
    setVersions(deleteVersion(id));
    setConfirmingId(null);
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
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">Version History</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-5">
          Save named checkpoints of your cover and jump back to any of them later.
        </p>

        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Name this version..."
            className="flex-1 text-xs font-semibold px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>

        {warning && (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-900/60 rounded-xl p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-semibold text-amber-300">{warning}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {versions.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 text-center py-10">
              No saved versions yet. Save one before making big changes.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">{v.name}</p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {formatWhen(v.createdAt)} · {v.trimSize?.label} · {v.pageCount} pages
                    </p>
                  </div>

                  {confirmingId === v.id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-black uppercase rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onRestore(v);
                          onClose();
                        }}
                        title="Restore this version"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[9px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button
                        onClick={() => setConfirmingId(v.id)}
                        title="Delete this version"
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
