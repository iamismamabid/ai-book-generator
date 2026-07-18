"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { BLOG_POSTS } from "./posts";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-24 px-6 relative overflow-hidden">
      {/* 🔮 Background Mesh Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[160px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-16 border-b border-slate-900/60 pb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/5 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Publisher Academy
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              KDPage <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400 bg-clip-text text-transparent">KDP Blog</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl font-semibold leading-relaxed">
              Expert guides, design trends, and SEO strategies to help you launch profitable self-publishing books.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative rounded-[2.5rem] p-8 border border-slate-900/80 bg-slate-950/40 hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-between cursor-pointer hover:-translate-y-1 block text-left shadow-2xl hover:shadow-[0_20px_50px_rgba(99,102,241,0.1),_inset_0_0_15px_rgba(99,102,241,0.05)] backdrop-blur-md"
            >
              {/* Card Gradient Glow on Hover */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-600" /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-600" /> {post.readTime}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-3 group-hover:text-amber-300 transition-colors font-sans leading-tight">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-8 font-sans">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-black uppercase tracking-wider group-hover:text-indigo-300 relative z-10">
                Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
