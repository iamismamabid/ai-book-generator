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
    title: `${post.title} | KDPage Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://www.kdpage.com/blog/${post.slug}`,
    }
  };
}

// Map blog post slugs to relevant internal creator tools
function getCtaLink(slug: string) {
  if (slug.includes("sudoku")) {
    return { href: "/sudoku", label: "Open Sudoku Generator" };
  }
  if (slug.includes("word-search")) {
    return { href: "/tools/word-search", label: "Open Word Search Generator" };
  }
  if (slug.includes("maze") || slug.includes("dot-to-dot")) {
    return { href: "/maze", label: "Open Maze Generator" };
  }
  if (slug.includes("cryptogram")) {
    return { href: "/studio/cryptogram", label: "Open Cryptogram Studio" };
  }
  if (slug.includes("scramble")) {
    return { href: "/studio/word-scramble", label: "Open Word Scramble Studio" };
  }
  if (slug.includes("kakuro")) {
    return { href: "/studio/kakuro", label: "Open Kakuro Studio" };
  }
  if (slug.includes("math-puzzle")) {
    return { href: "/studio/math-puzzle", label: "Open Math Puzzle Studio" };
  }
  if (slug.includes("keyword") || slug.includes("niche")) {
    return { href: "/tools/keyword-research", label: "Open Keyword Research Tool" };
  }
  if (slug.includes("tool")) {
    return { href: "/tools", label: "Browse Free KDP Tools" };
  }
  return { href: "/studio", label: "Open Creator Studio" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const cta = getCtaLink(post.slug);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-24 px-6 relative overflow-hidden">
      {/* JSON-LD Article & Author Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.description,
            "author": {
              "@type": "Person",
              "name": "KDPage Editorial Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "KDPage",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.kdpage.com/logo.png"
              }
            },
            "datePublished": post.date,
            "url": `https://www.kdpage.com/blog/${post.slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.kdpage.com/blog/${post.slug}`
            }
          })
        }}
      />

      {/* 🔮 Background Mesh Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[160px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
          </Link>
        </div>

        <div className="bg-slate-950/40 backdrop-blur-2xl border border-slate-900/60 rounded-[2.5rem] p-8 md:p-16 shadow-2xl">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" /> {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8 tracking-tight font-sans">
            {post.title}
          </h1>

          <div className="h-px bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 mb-8" />

          {/* Main Text Content */}
          <div className="space-y-6 text-slate-300 text-base md:text-lg leading-relaxed font-semibold font-sans">
            {post.content.map((paragraph, index) => {
              if (paragraph.startsWith("###")) {
                return (
                  <h3 key={index} className="text-xl md:text-2xl font-black text-white pt-8 pb-2 mb-2 border-b border-slate-900/60 leading-tight">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <ul key={index} className="space-y-3 pl-2 py-2">
                    {paragraph.split("\n").map((li, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-3 text-slate-400 font-semibold text-sm leading-relaxed">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                        <span>{li.replace("- ", "")}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="whitespace-pre-wrap text-slate-300 font-medium">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Footer Call-To-Action inside the article */}
          <div className="mt-16 p-8 rounded-[2rem] bg-gradient-to-br from-indigo-950/20 to-purple-950/5 border border-indigo-500/10 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="space-y-2 relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
                <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" /> Ready to publish your book?
              </div>
              <h4 className="text-xl font-black text-white">Create Compliant Interiors in Minutes</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-md">KDPage handles margin safety, spine sizing, and mathematically verified puzzle generation automatically.</p>
            </div>
            <Link
              href={cta.href}
              className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 relative z-10 whitespace-nowrap"
            >
              {cta.label} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
