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
  Tag
} from "lucide-react";
import Link from "next/link";
import { deleteNotebookEntry } from "../actions";

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

export default function NotebookClient({ items }: NotebookClientProps) {
  const [selectedItem, setSelectedItem] = useState<NotebookItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Your Notebook is Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md font-medium mb-6">
            Use the "Save to My Notebook" button on any studio page or tool to permanently store your items separately from AI books.
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
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {(item.title?.[0] || "?").toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6">
                  {item.subtitle || "Permanently saved in My Notebook"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Entry</span>
                </button>

                <form action={async () => { await deleteNotebookEntry(item.id); }}>
                  <button
                    title="Delete from My Notebook"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INTERACTIVE VIEW ENTRY MODAL ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
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

              {/* JSON Metadata Details (if present) */}
              {selectedItem.data && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Project Configuration Data</h4>
                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-400 text-[11px] font-mono overflow-x-auto custom-scrollbar">
                    {JSON.stringify(selectedItem.data, null, 2)}
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
                {selectedItem.category === "cover" ? (
                  <Link
                    href="/studio?tab=cover"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md"
                  >
                    <span>Open in Cover Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : selectedItem.category === "puzzle-book" ? (
                  <Link
                    href={`/studio?notebookId=${selectedItem.id}`}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md"
                  >
                    <span>Open in Book Builder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/generate"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md"
                  >
                    <span>Open in Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
