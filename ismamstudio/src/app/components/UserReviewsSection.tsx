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
  avatar?: string; // Image path (e.g. "/reviews/ajmain.jpg") or external URL
  avatarBg?: string; // Fallback background color class for initial avatars
}

const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    rating: 5,
    title: "As a KDP website i think it can bring a lot of opportunities",
    comment: "As a KDP website i think it can bring a lot of opportunities. So many awesome tools in a all in one studio.",
    author: "Meher Nayeem",
    date: "Aug 12, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-purple-600",
  },
  {
    id: "rev-2",
    rating: 5,
    title: "Smooth and satisfying",
    comment: "The whole experience feel really well and smooth enough. Also the page itself is very responsive and user friendly. Definitely a must-try!",
    author: "Ajmain Rahman Ifti",
    date: "Aug 11, 2026",
    useCase: "Verified Trustpilot Review",
    avatar: "/reviews/ajmain.png",
    avatarBg: "bg-slate-700",
  },
  {
    id: "rev-3",
    rating: 5,
    title: "Hmm it is good initiative kdp tool",
    comment: "Hmm it is good initiative kdp tool. Constantly improving and adding value for KDP creators.",
    author: "Saqib",
    date: "Aug 11, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-pink-500",
  },
  {
    id: "rev-4",
    rating: 4,
    title: "Pretty good website for amazon KDP creators",
    comment: "Pretty good website for amazon KDP creators.",
    author: "Taspia",
    date: "Aug 5, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-emerald-600",
  },
  {
    id: "rev-5",
    rating: 5,
    title: "All in one KDP creation service",
    comment: "I would like to create KDP tools with this website because it provides me all in one service.",
    author: "Tofajjal Hossain Emon",
    date: "Aug 3, 2026",
    useCase: "Verified Trustpilot Review",
    avatar: "/reviews/tofajjal.png",
    avatarBg: "bg-blue-600",
  },
  {
    id: "rev-6",
    rating: 5,
    title: "One of the best tools for KDP puzzles",
    comment: "In the field of KDP puzzle, it is one of the best tools.",
    author: "Tarequl Islam Mahin",
    date: "Aug 2, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-indigo-600",
  },
  {
    id: "rev-7",
    rating: 5,
    title: "Very impressive website",
    comment: "It is really a very impressive website. Well done and keep it up.",
    author: "Imad Surjo",
    date: "Aug 2, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-amber-600",
  },
  {
    id: "rev-8",
    rating: 5,
    title: "Good website for KDP automation",
    comment: "Useful platform for creating activity books, puzzle interiors, and print-ready covers efficiently.",
    author: "Sedi Moulay",
    date: "Aug 1, 2026",
    useCase: "Verified Trustpilot Review",
    avatarBg: "bg-teal-600",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function UserReviewsSection() {
  return (
    <section id="reviews" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
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
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {rev.avatar ? (
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        width={32}
                        height={32}
                        loading="lazy"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black uppercase shrink-0 shadow-xs ${
                          rev.avatarBg || "bg-indigo-600"
                        }`}
                      >
                        {getInitials(rev.author)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-900 font-bold truncate">{rev.author}</span>
                      {rev.date && <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>}
                    </div>
                  </div>
                  {rev.useCase && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0">
                      ★ {rev.useCase}
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
