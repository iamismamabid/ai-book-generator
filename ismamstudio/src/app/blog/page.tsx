"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Calendar, ChevronRight, X, HelpCircle, Sparkles } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  description: string;
  content: string[];
}

const BLOG_POSTS: Post[] = [
  {
    slug: "kdp-puzzle-publishing-guide",
    title: "KDP Puzzle Book Publishing Guide: From Creation to First Sale",
    category: "Tutorial",
    date: "June 24, 2026",
    readTime: "8 min read",
    description: "Learn how to target profitable puzzle niches, generate compliant PDF files, and successfully launch your book on Amazon.",
    content: [
      "Activity and puzzle books represent one of the most lucrative and consistent sub-niches within Amazon KDP (Kindle Direct Publishing). Unlike fiction novels that require months of writing, puzzle books can be constructed and compiled in hours if you use the right toolkit. Here is a step-by-step blueprint to go from generation to royalties.",
      "### Step 1: Target the Right Niche",
      "Do not just publish a generic 'Sudoku Book.' Instead, narrow your audience down to specific demographics: 'Sudoku for Seniors (Large Print)', 'Math Puzzles for Kids Age 8-10', or 'Pocket-Sized Mazes for Travel.' Niched books face far less competition and enjoy higher conversion rates.",
      "### Step 2: Ensure KDP Formatting Compliance",
      "Amazon is highly strict about book sizes and margins. When generating puzzle interiors: \n- Use standard KDP trim sizes like 8.5\" x 11\" for large activity books and 6\" x 9\" for standard novels.\n- Leave at least 0.375 inches of gutter safety margins so the puzzles do not disappear into the book binding.\n- Ensure bleed settings are checked if your patterns touch the edges of the page.",
      "### Step 3: Craft a High-Contrast Cover",
      "Your cover is the billboard for your book. Use clean, bold typography for the title, and visually demonstrate what is inside. If your book contains mazes, show a small maze snippet on the front or back cover. Use modern color schemes (high contrast dark/light combinations) to stand out in search results.",
      "### Step 4: Maximize Search Visibility",
      "Utilize all 7 backend keywords in KDP. Instead of repeating the title, use search terms like: 'boredom busters for adults', 'brain training activity sheets', or 'large print logic games.' This helps Amazon index your book for diverse customer queries."
    ]
  },
  {
    slug: "low-content-vs-medium-content",
    title: "Low-Content vs. Medium-Content Books: Which is More Profitable?",
    category: "Strategy",
    date: "June 18, 2026",
    readTime: "6 min read",
    description: "Discover the difference between journals and complex puzzle collections, and which one delivers the highest KDP margins.",
    content: [
      "If you are new to self-publishing on Amazon, you have probably heard the terms 'low-content' and 'medium-content' thrown around. Understanding the difference is crucial to building a sustainable passive income stream.",
      "### What are Low-Content Books?",
      "Low-content books have minimal or repetitive interior pages. Examples include lined journals, blank diaries, and simple logbooks. Because they are easy to make, the Amazon marketplace is highly saturated with them. As a result, profit margins are thin, and organic visibility is difficult to achieve without heavy advertising budgets.",
      "### What are Medium-Content Books?",
      "Medium-content books contain unique, engaging interiors customized for the reader. This category includes Sudoku collections, word search booklets, shaped labyrinth books, coloring pages, and guided workbooks. Because they require specialized layout design, the barrier to entry is higher, resulting in less competition and higher pricing power.",
      "### Which is More Profitable?",
      "Medium-content books are significantly more profitable. A standard 120-page Sudoku puzzle book can easily retail for $7.99 to $9.99, generating a royalty of $2.50 to $3.50 per sale. In contrast, a simple lined journal retails for $5.99, generating less than $1.50 in royalties. By utilizing automated builders like Ismam Studio, you can compile medium-content books in the same amount of time it takes to save a blank journal, maximizing your return on time invested."
    ]
  },
  {
    slug: "rules-for-high-converting-covers",
    title: "5 Golden Rules for Designing High-Converting Book Covers",
    category: "Design",
    date: "June 10, 2026",
    readTime: "5 min read",
    description: "A design guide covering typography hierarchy, bleed margins, color contrast, and creating covers that command sales.",
    content: [
      "Your book interior might be masterpiece-quality, but if your cover looks amateurish, nobody will click on it. On Amazon, search results are scanned in seconds. Here are 5 design rules to make your covers click-worthy.",
      "### 1. Establish Visual Hierarchy",
      "Choose one hero element: either a massive, stylized title or a central preview graphic. Do not crowd the space. The title must be legible even when shrunk to a small search thumbnail. Use clean fonts like Inter, Outfit, or Montserrat.",
      "### 2. High Contrast is Key",
      "Avoid muddy color palettes. If you use a dark background (such as deep indigo or midnight space), pair it with vibrant gold, neon sky blue, or clean white text. High contrast catches the eye during rapid scrolling.",
      "### 3. Mind the Spine and Bleeds",
      "Amazon KDP requires precise calculations for full-wrap covers. The spine width depends on your book page count. If your design wraps around the spine, keep text away from the folding edges (at least 0.25 inches safety margin) to avoid reject errors during review.",
      "### 4. Provide a Visual Promise",
      "For activity books, show—don't just tell. Embed a mini-sudoku grid or a beautifully rendered heart-shaped maze directly on the cover. This builds instant trust and visually promises what the reader will receive.",
      "### 5. Leverage Color Psychology",
      "Choose colors that match the book's purpose. Use soothing greens and cream tones for relaxation puzzle books, bright and energetic yellows/oranges for children's mazes, and high-tech neon/cyberpunk shades for competitive brain training books."
    ]
  },
  {
    slug: "target-low-competition-kdp-keywords",
    title: "How to Target High-Traffic, Low-Competition KDP Keywords",
    category: "SEO",
    date: "June 05, 2026",
    readTime: "7 min read",
    description: "Unlock Amazon search box autocomplete secrets and learn how to construct metadata to rank organically without ads.",
    content: [
      "Organic search traffic is the holy grail of KDP self-publishing. Ranking on page 1 for a popular search term guarantees passive sales without spending a dime on Amazon Ads. Here is how to find hidden keyword gems.",
      "### The Autocomplete Hack",
      "Go to Amazon.com in an Incognito window, select 'Books' from the dropdown, and type in a root keyword like 'word search for.' Do not press Enter. Observe the autocomplete recommendations: 'word search for seniors large print', 'word search for kids 9-12', 'word search for dementia patients.' These are search queries that customers are actively typing.",
      "### Analyze Competitor Density",
      "For each autocomplete phrase, check the number of search results (indicated at the top left). \n- Over 10,000 results: High competition. Avoid unless you have a strong launch plan.\n- 3,000 to 10,000 results: Moderate. Good target for high-quality designs.\n- Under 3,000 results: Low competition sweet spot. A well-formatted book with a great cover can rank on page 1 easily here.",
      "### Crafting Your Title and Subtitle",
      "Do not stuff keywords randomly. Combine your primary search phrase naturally into your subtitle. For example: \n- *Title*: Ultimate Senior Word Search\n- *Subtitle*: 100 Large Print Puzzles with Solutions for Adults, Elderly & Brain Exercise\nThis informs both the Amazon search algorithm and human buyers exactly what the book is."
    ]
  },
  {
    slug: "kdp-niche-validation-secrets",
    title: "KDP Niche Validation: How to Find Profitable Niches with High Search Volume",
    category: "Research",
    date: "June 02, 2026",
    readTime: "7 min read",
    description: "Learn how to validate self-publishing niches, estimate monthly book sales, and choose search terms that guarantee conversions.",
    content: [
      "Before creating any book interior or cover, you must first validate that there is actual customer demand for your topic. Sinking hours into a beautiful Sudoku or Word Search book that nobody is searching for is the most common mistake made by new publishers. Here is the framework for validating profitable KDP niches.",
      "### Step 1: Find the Best Seller Rank (BSR)",
      "Look at the top 3-5 organic books in your target niche. Scroll down to their Product Details section and write down their Amazon Best Seller Rank (BSR). A BSR under 100,000 indicates the book sells multiple copies every day. A BSR under 10,000 indicates a highly profitable niche with dozens of daily sales.",
      "### Step 2: Calculate Niche Profitability",
      "Use online calculator tools to translate BSR to estimated monthly sales. For example, a paperback book with a BSR of 50,000 sells approximately 3-5 copies per day (90-150 copies per month). If the royalty per sale is $2.50, a single validated book can bring in $225 to $375 in passive monthly royalties.",
      "### Step 3: Spotting Market Saturation",
      "Type your target keyword in Amazon's search bar and analyze the first page results. If all top ranking books have 500+ reviews and are sponsored ads, the niche is highly competitive. Look for niches where top books have fewer than 100 reviews and were published recently (within the last 6 months)—this indicates a gap you can fill.",
      "### Step 4: Use the Ismam Studio Niche Spy (Now Live!)",
      "Ismam Studio's AI KDP Niche Hunter & Keyword Spy is now fully live inside your dashboard. Simply enter any keyword and the tool fetches real-time Amazon search volumes, analyzes competitor BSR data, and estimates potential monthly royalties — all in seconds. No spreadsheets required. Access it directly from the Research Console on your dashboard or at ismamstudio.me/tools/keyword-research."
    ]
  }
];

export default function BlogPage() {
  const [activePost, setActivePost] = useState<Post | null>(null);

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
            <article 
              key={post.slug}
              onClick={() => setActivePost(post)}
              className="group dark-glow-card rounded-[2.5rem] p-8 border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
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

                <h2 className="text-xl md:text-2xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-black uppercase tracking-wider group-hover:text-indigo-300">
                Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Article Reader Slide-Over */}
        {activePost && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div 
              className="absolute inset-0"
              onClick={() => setActivePost(null)}
            />
            
            <div className="relative w-full max-w-3xl bg-[#0b0f19] border-l border-slate-950/50 shadow-2xl h-full flex flex-col justify-between overflow-hidden animate-slide-over">
              
              {/* Close Button & Category Bar */}
              <div className="px-8 py-5 border-b border-slate-900 flex items-center justify-between bg-slate-950/50">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                  {activePost.category}
                </span>
                <button
                  onClick={() => setActivePost(null)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Document Content */}
              <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 custom-scrollbar">
                
                {/* Meta details */}
                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activePost.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activePost.readTime}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
                  {activePost.title}
                </h1>

                {/* Main Text Content */}
                <div className="space-y-6 text-slate-300 text-base leading-relaxed font-medium">
                  {activePost.content.map((paragraph, index) => {
                    if (paragraph.startsWith("###")) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-white pt-4">
                          {paragraph.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith("- ")) {
                      return (
                        <ul key={index} className="list-disc list-inside pl-4 space-y-2 text-slate-400">
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

                {/* 🚀 Detailed Product Hunt Launch Card */}
                <div style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  border: '1px solid rgb(30, 41, 59)',
                  borderRadius: '12px',
                  padding: '20px',
                  maxWidth: '500px',
                  background: 'rgb(255, 255, 255)',
                  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 8px',
                  marginTop: '32px',
                  color: 'rgb(26, 26, 26)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img 
                      alt="IsmamStudio" 
                      src="https://ph-files.imgix.net/86d2b216-a589-494f-a277-fb45cfeb325c.png?auto=compress,format&amp;codec=mozjpeg&amp;cs=strip&amp;fit=crop&amp;h=80&amp;w=80" 
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: '1 1 0%', minWidth: '0px' }}>
                      <h3 style={{ margin: '0px', fontSize: '18px', fontWeight: '600', color: 'rgb(26, 26, 26)', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>IsmamStudio</h3>
                      <p style={{ margin: '4px 0px 0px', fontSize: '14px', color: 'rgb(102, 102, 102)', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>All-in-one AI toolkit for Amazon KDP self-publishers.</p>
                    </div>
                  </div>
                  <a 
                    href="https://www.producthunt.com/products/ismam-studio?embed=true&amp;utm_source=embed&amp;utm_medium=post_embed" 
                    target="_blank" 
                    rel="noopener" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', padding: '8px 16px', background: 'rgb(255, 97, 84)', color: 'rgb(255, 255, 255)', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                  >
                    Check it out on Product Hunt →
                  </a>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-slate-900 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" /> Launching your own book soon?
                </div>
                <Link
                  href="/studio"
                  onClick={() => setActivePost(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                >
                  Open Creator Studio <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
