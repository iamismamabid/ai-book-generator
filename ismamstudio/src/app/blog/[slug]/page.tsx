import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, HelpCircle, ChevronRight } from "lucide-react";
import { BLOG_POSTS } from "../posts";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | Ismam Studio Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://www.ismamstudio.me/blog/${post.slug}`,
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
              {post.category}
            </span>
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8">
            {post.title}
          </h1>

          <div className="h-px bg-slate-800 mb-8" />

          {/* Main Text Content */}
          <div className="space-y-6 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
            {post.content.map((paragraph, index) => {
              if (paragraph.startsWith("###")) {
                return (
                  <h3 key={index} className="text-xl md:text-2xl font-bold text-white pt-6 mb-2">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <ul key={index} className="list-disc list-inside pl-4 space-y-2 text-slate-450">
                    {paragraph.split("\n").map((li, lIdx) => (
                      <li key={lIdx}>{li.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Product Hunt Launch Card */}
          <div className="border border-slate-800 rounded-2xl p-6 bg-white shadow-md mt-12 text-slate-900 max-w-lg">
            <div className="flex items-center gap-4 mb-4">
              <img 
                alt="IsmamStudio Logo" 
                src="https://ph-files.imgix.net/86d2b216-a589-494f-a277-fb45cfeb325c.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80" 
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <h3 className="margin-0 text-lg font-bold text-slate-900 leading-snug">IsmamStudio</h3>
                <p className="margin-1 text-sm text-slate-500 leading-normal line-clamp-2">All-in-one AI toolkit for Amazon KDP self-publishers.</p>
              </div>
            </div>
            <a 
              href="https://www.producthunt.com/products/ismam-studio?embed=true&utm_source=embed&utm_medium=post_embed" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff6154] text-white hover:bg-[#e05246] rounded-lg text-sm font-semibold transition-colors"
            >
              Check it out on Product Hunt →
            </a>
          </div>

          {/* Footer Call-To-Action inside the article */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" /> Launching your own book soon?
            </div>
            <Link
              href="/studio"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
            >
              Open Creator Studio <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
