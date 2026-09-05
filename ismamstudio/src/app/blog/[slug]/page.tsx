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
  if (slug.includes("coloring")) {
    return { href: "/tools/coloring-book-generator", label: "Open Coloring Book Generator" };
  }
  if (slug.includes("book-bolt") || slug.includes("alternative")) {
    return { href: "/compare/book-bolt", label: "Compare KDPage vs Book Bolt" };
  }
  if (slug.includes("royalty") || slug.includes("profit")) {
    return { href: "/tools/royalty-estimator", label: "Open KDP Royalty Calculator" };
  }
  if (slug.includes("spine") || slug.includes("cover-size")) {
    return { href: "/tools/spine-calculator", label: "Open KDP Spine Calculator" };
  }
  if (slug.includes("cover") || slug.includes("design")) {
    return { href: "/studio", label: "Open Cover Studio" };
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
        <div className="bg-[#fbfaf7] border border-[#e6e2d8] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-[0_1px_1px_rgba(0,0,0,0.15),_0_10px_0_-5px_#fbfaf7,_0_10px_1px_-4px_rgba(0,0,0,0.15),_0_20px_0_-10px_#f5f2eb,_0_20px_1px_-9px_rgba(0,0,0,0.15),_0_30px_60px_rgba(0,0,0,0.45)] relative overflow-hidden">
          {/* 📖 Left-side Crease/Binding Shadow */}
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/8 via-black/3 to-transparent pointer-events-none z-10" />

          {/* 📄 Top-Right Folded Page Corner */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#030712] z-10" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#ebdcb9] to-[#faf6ee] shadow-[-3px_3px_10px_rgba(0,0,0,0.15)] border-l border-b border-[#c8bfa0]/60 rounded-bl-xl z-20 pointer-events-none" />

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-stone-500 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-stone-900 leading-tight mb-8 tracking-tight font-serif">
            {post.title}
          </h1>

          <div className="h-px bg-gradient-to-r from-[#e6e2d8] via-[#d4cfc3] to-[#e6e2d8] mb-8" />

          {/* Main Text Content */}
          <div className="space-y-6 text-[#292524] text-base md:text-lg leading-relaxed font-semibold font-serif">
            {post.content.map((paragraph, index) => {
              if (paragraph.startsWith("###")) {
                return (
                  <h3 key={index} className="text-xl md:text-2xl font-black text-stone-900 pt-8 pb-2 mb-2 border-b border-[#e6e2d8] leading-tight">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <ul key={index} className="space-y-3 pl-2 py-2">
                    {paragraph.split("\n").map((li, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-3 text-stone-600 font-semibold text-sm leading-relaxed">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#b45309] shrink-0" />
                        <span>{li.replace("- ", "")}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="whitespace-pre-wrap text-[#292524] font-medium">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Footer Call-To-Action inside the article */}
          <div className="mt-16 p-8 rounded-[2rem] bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="space-y-2 relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse" /> Ready to publish your book?
              </div>
              <h4 className="text-xl font-black text-white font-serif">Create Compliant Interiors in Minutes</h4>
              <p className="text-stone-400 text-xs font-semibold leading-relaxed max-w-md font-serif">KDPage handles margin safety, spine sizing, and mathematically verified puzzle generation automatically.</p>
            </div>
            <Link
              href={cta.href}
              className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-black text-sm rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg shadow-amber-600/10 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 relative z-10 whitespace-nowrap font-serif"
            >
              {cta.label} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
