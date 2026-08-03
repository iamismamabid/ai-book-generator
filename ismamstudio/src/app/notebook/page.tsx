import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkPremiumStatus, deleteNotebookEntry } from "../actions";
import { BookOpen, Sparkles, Trash2, ArrowRight, ShieldCheck, Cloud, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Notebook — Permanent Account Storage | KDPage",
  description: "View and manage all your permanently saved puzzle books, covers, and interior designs synced to your account.",
};

export default async function NotebookPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen pt-36 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Sign in to Access My Notebook</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm mb-8">
          Save your puzzle books, interiors, and cover designs permanently to your account and access them from any device.
        </p>
        <Link
          href="/sign-in"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 text-sm transition-all"
        >
          Sign In to Your Account
        </Link>
      </div>
    );
  }

  // Fetch account status & notebook entries (completely separate from Book model)
  const premiumStatus = await checkPremiumStatus();
  let notebookItems: any[] = [];
  try {
    notebookItems = await (prisma as any).notebook.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch notebook entries:", error);
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 pt-32 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
            <Cloud className="w-3.5 h-3.5" /> Permanent Account Cloud Storage
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">My Notebook</h1>
          <p className="text-slate-300 font-medium text-sm sm:text-base max-w-xl">
            All your saved books, puzzle layouts, and cover designs permanently synced with your user account.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3 rounded-2xl text-left">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 block mb-0.5">Notebook Items</span>
            <span className="text-2xl font-black">{notebookItems.length} Saved</span>
          </div>

          <Link
            href="/studio"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Design
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      {notebookItems.length === 0 ? (
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
          {notebookItems.map((item: any) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {(item.title?.[0] || "?").toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6">
                  {item.subtitle || "Permanently saved in My Notebook"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                  ✓ Account Synced
                </span>

                <form action={deleteNotebookEntry.bind(null, item.id)}>
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
    </main>
  );
}
