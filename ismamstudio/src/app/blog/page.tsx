"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { BLOG_POSTS } from "./posts";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-900 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Publisher Academy
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Ismam Studio <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">KDP Blog</span>
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-2">
              Expert guides, design trends, and SEO strategies to help you launch profitable self-publishing books.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group dark-glow-card rounded-[2.5rem] p-8 border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 block text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors font-sans">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 font-sans">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-black uppercase tracking-wider group-hover:text-indigo-300">
                Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
