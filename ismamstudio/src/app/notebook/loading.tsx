import { Cloud, Plus, BookOpen } from "lucide-react";

export default function NotebookLoading() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 pt-32 pb-24 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
            <Cloud className="w-3.5 h-3.5" /> Permanent Account Cloud Storage
          </div>
          <div className="h-10 w-64 bg-white/10 rounded-2xl" />
          <div className="h-4 w-96 max-w-full bg-white/10 rounded-xl" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/10 border border-white/15 px-5 py-3 rounded-2xl w-36 h-16" />
          <div className="bg-indigo-600/40 rounded-2xl w-44 h-12" />
        </div>
      </div>

      {/* Folder Tabs Skeleton */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
      </div>

      {/* Items Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="w-24 h-6 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
