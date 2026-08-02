"use client";

import Link from "next/link";
import { Star, MessageSquare, ArrowRight } from "lucide-react";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  date?: string;
  author?: string;
  useCase?: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    rating: 5,
    title: "Good website for KDP automation",
    comment: "Useful platform for creating activity books, puzzle interiors, and print-ready covers efficiently.",
    author: "KDP Publisher",
    useCase: "Puzzle & Activity Books",
  },
];

export default function UserReviewsSection() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-black uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              User Feedback
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              What Publishing Creators Say
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium mt-1">
              Feedback from authors using our KDP automation tools &amp; generators.
            </p>
          </div>

          <Link
            href="https://www.trustpilot.com/review/kdpage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-slate-900/10 shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Read &amp; Share Reviews on Trustpilot
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50/60 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-sm"
            >
              <div className="space-y-3">
                {/* 5-Star Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {rev.rating} / 5 Stars
                  </span>
                </div>

                {/* Review Headline & Body */}
                <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                  "{rev.title}"
                </h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Reviewer Meta */}
              {rev.author && (
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{rev.author}</span>
                  {rev.useCase && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {rev.useCase}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
