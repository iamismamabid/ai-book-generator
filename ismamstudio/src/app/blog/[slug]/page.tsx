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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
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
              "name": "Ismam Studio Editorial Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Ismam Studio",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.ismamstudio.me/logo.png"
              }
            },
            "datePublished": post.date,
            "url": `https://www.ismamstudio.me/blog/${post.slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.ismamstudio.me/blog/${post.slug}`
            }
          })
        }}
      />

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

          {/* Footer Call-To-Action inside the article */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" /> Ready to publish your puzzle book?
            </div>
            <Link
              href={cta.href}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
            >
              {cta.label} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
