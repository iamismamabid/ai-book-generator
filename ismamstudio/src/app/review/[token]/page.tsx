import { getCoverShare } from "@/app/actions";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cover Review | KDPage",
  // A review link is meant for the people it was sent to, not search engines.
  robots: { index: false, follow: false },
};

export default async function CoverReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getCoverShare(token);

  if (!share) {
    return (
      <main className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 text-center space-y-3">
          <h1 className="text-xl font-black">This review link isn&apos;t available</h1>
          <p className="text-sm font-semibold text-slate-400">
            It may have been revoked by its owner, or the link may be incorrect.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            Cover Review
          </p>
          <h1 className="text-2xl sm:text-3xl font-black">{share.title}</h1>
          <p className="text-xs font-semibold text-slate-400">
            {[
              share.trimLabel,
              share.pageCount ? `${share.pageCount} pages` : null,
              share.spineWidth ? `${share.spineWidth.toFixed(3)}" spine` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </header>

        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-3 sm:p-6 overflow-x-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={share.previewUrl}
            alt={`${share.title} — full wraparound cover`}
            className="w-full h-auto rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/40 border border-slate-800 py-3 px-5 rounded-2xl">
          <span>Left: Back Cover</span>
          <span className="text-amber-500">Center: Spine</span>
          <span>Right: Front Cover</span>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 text-center">
          This is a read-only preview shared for feedback. Made with{" "}
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
            KDPage
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
