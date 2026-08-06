import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkPremiumStatus, deleteNotebookEntry } from "../actions";
import { getWorkspaceUserIds } from "@/lib/team";
import { BookOpen, Sparkles, Trash2, ArrowRight, ShieldCheck, Cloud, Plus } from "lucide-react";

import NotebookClient from "./NotebookClient";

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

  // Fetch account status & notebook entries (completely separate from Book model).
  // Scoped to the whole workspace, not just this exact userId, so a team
  // shares one Notebook rather than each member seeing only their own saves.
  const premiumStatus = await checkPremiumStatus();
  const workspaceUserIds = await getWorkspaceUserIds(userId);
  let notebookItems: any[] = [];
  try {
    const notebookDelegate = (prisma as any).notebook;
    if (notebookDelegate?.findMany) {
      notebookItems = await notebookDelegate.findMany({
        where: { userId: { in: workspaceUserIds } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      notebookItems = await prisma.$queryRawUnsafe(
        `SELECT * FROM "notebooks" WHERE "userId" = ANY($1) ORDER BY "createdAt" DESC`,
        workspaceUserIds
      );
    }
  } catch (error) {
    console.error("Failed to fetch notebook entries:", error);
  }

  // Serialize Date objects to ISO strings for Client Component
  const serializedItems = notebookItems.map((item: any) => ({
    ...item,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  }));

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
            <span className="text-2xl font-black">{serializedItems.length} Saved</span>
          </div>

          <Link
            href="/studio"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Design
          </Link>
        </div>
      </div>

      {/* Content Grid via NotebookClient */}
      <NotebookClient items={serializedItems} />
    </main>
  );
}
