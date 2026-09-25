"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Check, Loader2, Folder, FolderPlus, ChevronDown, Plus, X, Copy } from "lucide-react";
import { saveToNotebook, getUserNotebookFolders } from "../actions";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface SaveToNotebookButtonProps {
  title: string;
  content: string;
  subtitle?: string;
  category?: string;
  data?: any;
  getData?: () => any | Promise<any>;
  defaultFolder?: string;
  className?: string;
  iconOnly?: boolean;
  notebookId?: string;
  onSaved?: (id: string, isUpdate: boolean) => void;
  allowSaveAsCopy?: boolean;
}

export default function SaveToNotebookButton({
  title,
  content,
  subtitle,
  category = "general",
  data,
  getData,
  defaultFolder = "Unfiled",
  className = "",
  iconOnly = false,
  notebookId,
  onSaved,
  allowSaveAsCopy = true,
}: SaveToNotebookButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track active notebook entry ID (passed via prop, found in URL, or returned from initial save)
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(() => {
    if (notebookId) return notebookId;
    if (typeof window !== "undefined") {
      const urlId = new URLSearchParams(window.location.search).get("notebookId");
      if (urlId) return urlId;
    }
    return null;
  });

  useEffect(() => {
    if (notebookId) {
      setActiveNotebookId(notebookId);
    }
  }, [notebookId]);

  // Folder management states
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { userId: authUserId } = useAuth();
  const { user } = useUser();
  const getClientUserId = () => {
    return authUserId || user?.id || (typeof window !== "undefined" ? (window as any).Clerk?.user?.id : undefined);
  };

  useEffect(() => {
    getUserNotebookFolders(getClientUserId())
      .then((res) => {
        if (res.success && res.folders) {
          setFolders(res.folders);
        }
      })
      .catch(() => {});
  }, [authUserId, user?.id]);

  // Click outside and Escape key to close folder picker
  useEffect(() => {
    if (!isFolderPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFolderPickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFolderPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFolderPickerOpen]);

  const handleSave = async (overrideFolder?: string, forceNewCopy: boolean = false) => {
    setSaving(true);
    setError(null);
    const targetFolder = overrideFolder || selectedFolder;
    try {
      const payloadData = getData ? await getData() : data;
      const targetId = forceNewCopy ? undefined : (activeNotebookId || undefined);
      const res = await saveToNotebook(
        title,
        content,
        subtitle,
        category,
        payloadData,
        targetFolder,
        getClientUserId(),
        targetId
      );
      if (res.success && res.id) {
        setSaved(true);
        setIsFolderPickerOpen(false);
        setActiveNotebookId(res.id);

        if (typeof window !== "undefined") {
          try {
            const url = new URL(window.location.href);
            if (url.searchParams.get("notebookId") !== res.id) {
              url.searchParams.set("notebookId", res.id);
              window.history.replaceState({}, "", url.toString());
            }
            sessionStorage.setItem(`kdpage_notebook_entry_${res.id}`, JSON.stringify(payloadData));
          } catch (e) {}
        }

        if (onSaved) {
          onSaved(res.id, !!res.updated);
        }

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

  const handleAddNewFolderAndSave = () => {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    setSelectedFolder(name);
    setFolders((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setIsCreatingNewFolder(false);
    setNewFolderName("");
    handleSave(name);
  };

  if (iconOnly) {
    return (
      <button
        onClick={() => handleSave()}
        disabled={saving}
        title={
          saved
            ? `Saved to ${selectedFolder}!`
            : saving
            ? "Syncing to Notebook..."
            : activeNotebookId
            ? "Update Changes in My Notebook"
            : "Save Design to My Notebook"
        }
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
    <div ref={containerRef} className="relative inline-flex flex-col items-start gap-1 w-full">
      <div className="flex items-center w-full gap-1">
        {/* Main Save Action */}
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            saved
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:scale-[1.01]"
          } ${className}`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{activeNotebookId ? "Updating..." : "Syncing..."}</span>
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>{activeNotebookId ? "Updated in" : "Saved to"} {selectedFolder === "Unfiled" ? "Notebook" : selectedFolder}!</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-white" />
              <span>{activeNotebookId ? "Update in Notebook" : "Save to Notebook"}</span>
            </>
          )}
        </button>

        {/* Folder Select Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsFolderPickerOpen(!isFolderPickerOpen)}
          title="Choose or Create Cloud Folder"
          className={`p-2.5 rounded-xl text-white transition-all cursor-pointer shrink-0 ${
            isFolderPickerOpen
              ? "bg-indigo-500 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-300"
              : "bg-indigo-700 hover:bg-indigo-800"
          }`}
        >
          <Folder className="w-4 h-4" />
        </button>
      </div>

      {/* Target Folder Quick Indicator / Toggle */}
      <div className="flex items-center justify-between w-full px-1 pt-0.5">
        <button
          type="button"
          onClick={() => setIsFolderPickerOpen(!isFolderPickerOpen)}
          className="text-[10px] text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1 transition cursor-pointer"
          title="Click to switch or create notebook folder"
        >
          <Folder className="w-3 h-3 text-indigo-400" />
          <span>Folder: <span className="font-semibold text-slate-300">{selectedFolder}</span></span>
          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-150 ${isFolderPickerOpen ? "rotate-180 text-indigo-400" : ""}`} />
        </button>
      </div>

      {/* Folder Picker Modal Popover (Pops UPWARD to avoid being cut off below screen) */}
      {isFolderPickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-[100] w-full min-w-[280px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 text-slate-100 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-black text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" /> Save to Cloud Folder
            </span>
            <button
              type="button"
              onClick={() => setIsFolderPickerOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {/* Unfiled option */}
            <button
              type="button"
              onClick={() => {
                setSelectedFolder("Unfiled");
                handleSave("Unfiled");
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                selectedFolder === "Unfiled"
                  ? "bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <span>📁 Unfiled (Default)</span>
              {selectedFolder === "Unfiled" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {/* Custom Folders */}
            {folders.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setSelectedFolder(f);
                  handleSave(f);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                  selectedFolder === f
                    ? "bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <span className="truncate">📁 {f}</span>
                {selectedFolder === f && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>

          {/* Create New Folder Field */}
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            {isCreatingNewFolder ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Q4 Holiday Books"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewFolderAndSave();
                    }
                  }}
                  className="w-full text-xs py-1.5 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-400"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddNewFolderAndSave}
                    disabled={!newFolderName.trim()}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase transition cursor-pointer disabled:opacity-40"
                  >
                    Create &amp; Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewFolder(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingNewFolder(true)}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-indigo-400 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + New Folder
              </button>
            )}
          </div>

          {/* Option: Save as New Copy */}
          {activeNotebookId && allowSaveAsCopy !== false && (
            <div className="mt-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSave(selectedFolder, true)}
                disabled={saving}
                className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-amber-300 font-bold text-[11px] flex items-center justify-between transition cursor-pointer"
                title="Create a separate duplicate copy in My Notebook instead of updating this one"
              >
                <span className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-amber-400" /> Save as New Copy
                </span>
                <span className="text-[9px] uppercase tracking-wide bg-amber-400/10 text-amber-400 px-1 py-0.5 rounded font-black">Duplicate</span>
              </button>
            </div>
          )}

          {/* Bottom pointer arrow pointing down towards the trigger */}
          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-slate-900 border-b border-r border-slate-700/80 rotate-45 pointer-events-none" />
        </div>
      )}

      {saved && (
        <Link
          href="/notebook"
          className="text-[10px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
        >
          {activeNotebookId ? "Changes updated in" : "Synced to"} {selectedFolder === "Unfiled" ? "Notebook" : `"${selectedFolder}"`} — View in My Notebook →
        </Link>
      )}

      {error && <span className="text-[10px] font-bold text-rose-500">{error}</span>}
    </div>
  );
}

