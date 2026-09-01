import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { Package } from "lucide-react";
import { checkPremiumStatus, deleteBook } from "../actions";
import ManageBillingButton from "@/components/ManageBillingButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="pt-40 text-center">
        <p className="text-slate-500 font-bold text-xl">Please sign in to access your library.</p>
      </div>
    );
  }


  // Fetch Premium / AppSumo status
  const premiumStatus = await checkPremiumStatus();
  const isLtd = (premiumStatus as any).isLifetimeDeal === true;

  // AppSumo lifetime-deal tiers vs regular Paddle SaaS subscription plans share the
  // same "starter"/"pro"/"agency" plan keys, so the display label must branch on isLtd.
  const ltdPlanNames: Record<string, string> = {
    starter: "Lifetime Tier 1 ($199): Pro Studio",
    pro: "Lifetime Tier 1 ($199): Pro Studio",
    agency: "Lifetime Tier 2 ($399): Agency Max",
  };
  const saasPlanNames: Record<string, string> = {
    free: "Free Tier",
    starter: "Starter Creator",
    pro: "Pro Studio",
    agency: "Publisher Agency",
  };

  const rawPlan = premiumStatus.plan || "free";
  const planName = rawPlan === "free" ? "Free Tier" : (isLtd ? ltdPlanNames[rawPlan] : saasPlanNames[rawPlan]) || rawPlan;
  const isPremium = premiumStatus.isPremium;
  const isTrial = (premiumStatus as any).isTrial === true;
  const isActivated = isPremium && !isTrial;

  // Stacking guidance hints
  let upgradeHint = null;
  if (rawPlan === "starter" || rawPlan === "pro") {
    upgradeHint = (
      <Link href="/redeem" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline block mt-0.5">
        Stack AppSumo Code to Upgrade →
      </Link>
    );
  } else if (rawPlan === "agency") {
    upgradeHint = (
      <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
        Max Tier Unlocked! ✨ (3 Codes Stacked)
      </span>
    );
  } else {
    // If free, Free Trial, or other standard plans
    upgradeHint = (
      <Link href="/#pricing" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline block mt-0.5">
        Upgrade Plan to unlock Premium →
      </Link>
    );
  }

  // ১. ডাটাবেস থেকে ইউজারের সব বই নিয়ে আসা
  let books: any[] = [];
  try {
    books = await prisma.book.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch books from database:", error);
  }

  // 🎯 ২. Empty State: যদি কোনো বই না থাকে
  if (books.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-indigo-50 rounded-full mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.132.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your library is empty</h2>
          <p className="text-slate-500 font-medium mb-4">Start your writing journey today by creating your first book.</p>
          
          {/* Plan badge for empty state */}
          <div className="flex flex-col items-center gap-1.5 px-6 py-3.5 rounded-3xl bg-white border border-slate-100 shadow-sm mb-8">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isActivated ? "bg-emerald-500 animate-pulse" : isTrial ? "bg-amber-500 animate-pulse" : "bg-slate-300"}`} />
              <span className="text-xs font-bold text-slate-500">Account Status: </span>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isActivated ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : isTrial ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {isActivated ? "Activated" : isTrial ? "Trial" : "Free"}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Active Plan: <span className="font-black text-slate-800 uppercase tracking-wide">{planName}</span>
            </div>
            {upgradeHint}
            <div className="flex items-center gap-2 mt-3">
              {isPremium && !isLtd && <ManageBillingButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 font-bold text-[10px] uppercase tracking-wider transition-all" />}
              {isPremium && (
                <Link
                  href="/tools/bulk-generator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider transition-all"
                >
                  <Package className="w-3 h-3" /> Bulk Book Batch Studio
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ৩. Main Dashboard: যদি বই থাকে
  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">My Library</h1>
          <p className="text-slate-500 font-medium text-lg">You have {books.length} masterpieces in your collection</p>
        </div>
        
        {/* Actions & Plan badge */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isActivated ? "bg-emerald-500 animate-pulse" : isTrial ? "bg-amber-500 animate-pulse" : "bg-slate-300"}`} />
            <div className="text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-slate-400 font-black uppercase tracking-wider text-[8px] leading-none">Account Status:</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border leading-none ${isActivated ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : isTrial ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {isActivated ? "Activated" : isTrial ? "Trial" : "Free"}
                </span>
              </div>
              <span className="text-slate-900 font-black uppercase tracking-wide text-xs">{planName}</span>
              {upgradeHint}
            </div>
          </div>
          {isPremium && !isLtd && <ManageBillingButton />}

          {isPremium && (
            <Link
              href="/tools/bulk-generator"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <Package className="w-3.5 h-3.5" /> Bulk Book Batch Studio
            </Link>
          )}

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {books.map((book) => (
          <div 
            key={book.id} 
            className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.1)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 text-xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {(book.title?.[0] || "?").toUpperCase()}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-slate-400 font-medium mb-8">
                Created {new Date(book.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <Link 
                  href={`/book/${book.id}`}
                  className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 group-hover:gap-3 transition-all"
                >
                  Read & Edit <span>→</span>
                </Link>
                
                <form action={deleteBook.bind(null, book.id)}>
                  <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}