"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Trash2, 
  Eye, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Layers, 
  Calendar,
  Tag,
  Folder,
  FolderPlus,
  Edit2,
  FolderInput,
  Plus,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import { 
  deleteNotebookEntry, 
  moveNotebookEntryToFolder, 
  renameNotebookFolder, 
  deleteNotebookFolder 
} from "../actions";

interface NotebookItem {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  data?: any;
  createdAt: string | Date;
}

interface NotebookClientProps {
  items: NotebookItem[];
}

// Where each saved entry reopens, keyed by the category its save button set.
const OPEN_IN_DESTINATIONS: Record<string, { label: string; href: (id: string) => string }> = {
  cover: { label: "Open in Cover Studio", href: () => "/studio?tab=cover" },
  "puzzle-book": { label: "Open in Book Builder", href: (id) => `/studio?notebookId=${id}` },
  "coloring-book": { label: "Open in Coloring Page Studio", href: (id) => `/tools/coloring-book-generator?notebookId=${id}` },
  crossword: { label: "Open in Crossword Studio", href: (id) => `/studio/crossword?notebookId=${id}` },
  "math-puzzle": { label: "Open in Math Puzzle Studio", href: (id) => `/studio/math-puzzle?notebookId=${id}` },
  "word-scramble": { label: "Open in Word Scramble Studio", href: (id) => `/studio/word-scramble?notebookId=${id}` },
  kakuro: { label: "Open in Kakuro Studio", href: (id) => `/studio/kakuro?notebookId=${id}` },
  cryptogram: { label: "Open in Cryptogram Studio", href: (id) => `/studio/cryptogram?notebookId=${id}` },
  "word-search": { label: "Open in Word Search Studio", href: (id) => `/tools/word-search?notebookId=${id}` },
  sudoku: { label: "Open in Sudoku Generator", href: (id) => `/sudoku?notebookId=${id}` },
  maze: { label: "Open in Maze Generator", href: (id) => `/maze?notebookId=${id}` },
  "book-planner": { label: "Open in Book Planner", href: (id) => `/tools/book-planner?notebookId=${id}` },
  "copyright-page": { label: "Open in Copyright Page Generator", href: (id) => `/tools/copyright-page-generator?notebookId=${id}` },
  "bulk-generator": { label: "Open in Bulk Generator", href: (id) => `/tools/bulk-generator?notebookId=${id}` },
  "isbn-generator": { label: "Open in ISBN Generator", href: (id) => `/tools/isbn-generator?notebookId=${id}` },
  "word-cloud": { label: "Open in Word Cloud Generator", href: (id) => `/tools/word-cloud?notebookId=${id}` },
  "pattern-generator": { label: "Open in Pattern Generator", href: (id) => `/tools/pattern-generator?notebookId=${id}` },
  "qr-code-generator": { label: "Open in QR Code Generator", href: (id) => `/tools/qr-code-generator?notebookId=${id}` },
  "ai-book": { label: "Open in AI Generator", href: (id) => `/generate?notebookId=${id}` },
};

function resolveDestination(category?: string, id?: string) {
  const cat = (category || "").toLowerCase().trim();
  const dest = OPEN_IN_DESTINATIONS[cat] ||
    (cat.includes("color") ? OPEN_IN_DESTINATIONS["coloring-book"] : undefined) ||
    (cat.includes("crossword") ? OPEN_IN_DESTINATIONS["crossword"] : undefined) ||
    (cat.includes("cryptogram") ? OPEN_IN_DESTINATIONS["cryptogram"] : undefined) ||
    (cat.includes("scramble") ? OPEN_IN_DESTINATIONS["word-scramble"] : undefined) ||
    (cat.includes("kakuro") ? OPEN_IN_DESTINATIONS["kakuro"] : undefined) ||
    (cat.includes("math") ? OPEN_IN_DESTINATIONS["math-puzzle"] : undefined) ||
    (cat.includes("sudoku") ? OPEN_IN_DESTINATIONS["sudoku"] : undefined) ||
    (cat.includes("maze") ? OPEN_IN_DESTINATIONS["maze"] : undefined) ||
    (cat.includes("word-search") ? OPEN_IN_DESTINATIONS["word-search"] : undefined);

  if (dest) {
    return { label: dest.label, href: dest.href(id || "") };
  }
  return { label: "Open in Studio", href: "/studio" };
}

export default function NotebookClient({ items: initialItems }: NotebookClientProps) {
  const [items, setItems] = useState<NotebookItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<NotebookItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [renamedFolderTitle, setRenamedFolderTitle] = useState("");
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [folderActionFeedback, setFolderActionFeedback] = useState<string | null>(null);

  // Tally counts per folder
  const folderCounts: Record<string, number> = {};
  items.forEach((item) => {
    const f = item.data?.folder?.trim() || "Unfiled";
    folderCounts[f] = (folderCounts[f] || 0) + 1;
  });

  const customFolders = Object.keys(folderCounts).filter((f) => f !== "Unfiled").sort();
  const allFolderNames = ["Unfiled", ...customFolders];

  // Filter items by active folder tab
  const filteredItems = items.filter((item) => {
    if (activeFolder === "all") return true;
    const itemFolder = item.data?.folder?.trim() || "Unfiled";
    return itemFolder === activeFolder;
  });

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setActiveFolder(name);
    setIsCreatingFolder(false);
    setNewFolderName("");
    setFolderActionFeedback(`Folder "${name}" created!`);
    setTimeout(() => setFolderActionFeedback(null), 3000);
  };

  const handleMoveItem = async (itemId: string, targetFolder: string) => {
    setMovingItemId(null);
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, data: { ...(it.data || {}), folder: targetFolder } }
          : it
      )
    );
    if (selectedItem?.id === itemId) {
      setSelectedItem((prev) =>
        prev ? { ...prev, data: { ...(prev.data || {}), folder: targetFolder } } : null
      );
    }
    await moveNotebookEntryToFolder(itemId, targetFolder);
    setFolderActionFeedback(`Moved to "${targetFolder}"`);
    setTimeout(() => setFolderActionFeedback(null), 2500);
  };

  const handleRenameFolder = async (oldName: string) => {
    const newName = renamedFolderTitle.trim();
    if (!newName || newName === oldName) {
      setEditingFolder(null);
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.data?.folder === oldName
          ? { ...it, data: { ...(it.data || {}), folder: newName } }
          : it
      )
    );
    if (activeFolder === oldName) setActiveFolder(newName);
    setEditingFolder(null);
    await renameNotebookFolder(oldName, newName);
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (confirm(`Remove folder "${folderName}"? Items in this folder will be moved to Unfiled.`)) {
      setItems((prev) =>
        prev.map((it) =>
          it.data?.folder === folderName
            ? { ...it, data: { ...(it.data || {}), folder: "Unfiled" } }
            : it
        )
      );
      if (activeFolder === folderName) setActiveFolder("all");
      await deleteNotebookFolder(folderName);
    }
  };

  return (
    <>
      {/* ── CLOUD FOLDER NAVIGATION TABS ── */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Cloud Folders &amp; Organization
            </h2>
          </div>

          {folderActionFeedback && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              ✓ {folderActionFeedback}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* "All" tab */}
          <button
            type="button"
            onClick={() => setActiveFolder("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeFolder === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            All Items ({items.length})
          </button>

          {/* "Unfiled" tab */}
          <button
            type="button"
            onClick={() => setActiveFolder("Unfiled")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFolder === "Unfiled"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Unfiled ({folderCounts["Unfiled"] || 0})</span>
          </button>

          {/* Custom Folders */}
          {customFolders.map((folder) => {
            const isSelected = activeFolder === folder;
            const count = folderCounts[folder] || 0;
            return (
              <div
                key={folder}
                className={`inline-flex items-center rounded-2xl border transition-all shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFolder(folder)}
                  className="px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>{folder}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
                {isSelected && (
                  <div className="flex items-center pr-1.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRenamedFolderTitle(folder);
                        setEditingFolder(folder);
                      }}
                      className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
                      title="Rename Folder"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(folder)}
                      className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* New Folder Action Button */}
          {isCreatingFolder ? (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shrink-0">
              <input
                type="text"
                placeholder="e.g. Q4 Holiday Books"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="text-xs px-2.5 py-1 bg-transparent text-slate-900 dark:text-white outline-none w-36"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setIsCreatingFolder(false);
                }}
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-xl cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer shrink-0 transition"
            >
              <FolderPlus className="w-3.5 h-3.5" /> + New Folder
            </button>
          )}
        </div>

        {/* Rename Folder Dialog Modal */}
        {editingFolder && (
          <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Rename Folder</h3>
              <input
                type="text"
                value={renamedFolderTitle}
                onChange={(e) => setRenamedFolderTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRenameFolder(editingFolder)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Folder className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {activeFolder === "all" ? "Your Notebook is Empty" : `No items in "${activeFolder}"`}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md font-medium mb-6">
            {activeFolder === "all"
              ? "Use the 'Save to My Notebook' button on any studio page to permanently store your books in your account."
              : `You can move items into "${activeFolder}" using the folder menu on any saved item.`}
          </p>
          <Link
            href="/studio"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all"
          >
            Open Creator Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const currentFolder = item.data?.folder || "Unfiled";
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {(item.title?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Folder Badge / Quick Move Trigger */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setMovingItemId(movingItemId === item.id ? null : item.id)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition cursor-pointer"
                          title="Click to move to another folder"
                        >
                          <Folder className="w-3 h-3 text-indigo-500" />
                          <span className="truncate max-w-[100px]">{currentFolder}</span>
                        </button>

                        {/* Move To Folder Dropdown Menu */}
                        {movingItemId === item.id && (
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1 text-xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 px-2 py-1 block">
                              Move to folder:
                            </span>
                            {allFolderNames.map((f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => handleMoveItem(item.id, f)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                                  currentFolder === f
                                    ? "bg-indigo-600 text-white font-bold"
                                    : "text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                <span className="truncate">📁 {f}</span>
                                {currentFolder === f && <Check className="w-3 h-3 text-white" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6">
                    {item.subtitle || "Permanently saved in My Notebook"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    {(() => {
                      const { href } = resolveDestination(item.category, item.id);
                      return (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      );
                    })()}
                  </div>

                  <form action={async () => {
                    setItems(prev => prev.filter(it => it.id !== item.id));
                    await deleteNotebookEntry(item.id);
                  }}>
                    <button
                      title="Delete from My Notebook"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── INTERACTIVE VIEW ENTRY MODAL ── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                  <Tag className="w-3 h-3" /> Category: {selectedItem.category || "General"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">{selectedItem.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{selectedItem.subtitle}</p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Saved on {new Date(selectedItem.createdAt).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleCopyContent(selectedItem.content)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Content</span>
                    </>
                  )}
                </button>
              </div>

              {/* Content Text Viewer */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Entry Content</h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                  {selectedItem.content || "No text content stored for this entry."}
                </div>
              </div>

              {/* Image Preview for Coloring Pages & Canvases */}
              {selectedItem.data?.color && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Drawing & Coloring Preview</h4>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 p-3 flex items-center justify-center max-h-[350px]">
                    <img src={selectedItem.data.color} alt="Coloring Drawing Preview" className="max-h-[320px] object-contain rounded-xl shadow-sm" />
                  </div>
                </div>
              )}

              {/* JSON Metadata Details (if present) */}
              {selectedItem.data && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Project Configuration Data</h4>
                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-400 text-[11px] font-mono overflow-x-auto custom-scrollbar">
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(selectedItem.data).map(([k, v]) => [
                          k,
                          typeof v === "string" && v.startsWith("data:image")
                            ? `[Image Data URL: ${(v.length / 1024).toFixed(1)} KB]`
                            : v,
                        ])
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Permanent Account Cloud Item
              </span>

              <div className="flex items-center gap-3">
                {(() => {
                  const { label, href } = resolveDestination(selectedItem.category, selectedItem.id);
                  return (
                    <Link
                      href={href}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <span>{label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
