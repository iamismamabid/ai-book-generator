"use client";

import { useState, useEffect } from "react";
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
  },
  {
    slug: "how-to-use-kdp-builder",
    title: "How to Use a KDP Builder to Create and Publish Books in Under 24 Hours",
    category: "Tutorial",
    date: "July 08, 2026",
    readTime: "7 min read",
    description: "Discover how a KDP builder can accelerate your self-publishing workflow. Learn formatting, cover design, and interior generation tips.",
    content: [
      "Self-publishing on Amazon Kindle Direct Publishing (KDP) has become one of the most popular ways to generate passive income. However, formatting interiors and calculating spine sizes manually can take hours. That is where an automated KDP Builder comes in. By using a specialized builder, you can design, compile, and publish a book in less than 24 hours. Here is how to do it.",
      "### Why Use a KDP Builder?",
      "Manually designing puzzle layouts, word searches, or sudoku grids in Adobe Illustrator or Canva is tedious. An online KDP interior builder automates the layout process entirely. It ensures that your pages fit standard Amazon trim sizes (such as 8.5\" x 11\" or 6\" x 9\"), maintains proper safety margins, and generates high-resolution, print-ready PDF files instantly. This allows you to focus on marketing and niches instead of pixel-pushing.",
      "### Step 1: Generate Your Book Interior",
      "Using a KDP builder like Ismam Studio, you can select from various interior types, such as Sudoku, Mazes, Cryptograms, and Word Searches. Adjust the difficulty levels, choose layout grids, and hit generate. The builder automatically formats pages, inserts page numbers, and compiles the entire book (with solutions pages at the back) into a single PDF document that is fully compliant with Amazon's specifications.",
      "### Step 2: Design the Perfect Cover",
      "A KDP cover creator is essential for designing high-converting book covers. It calculates the exact spine width of your book based on your page count and paper type (White, Cream, or Premium Color). By using the built-in Cover Studio, you can drag and drop vector shapes, align text boxes, customize color themes, and export a print-ready full-wrap cover PDF that fits KDP specifications perfectly without white margins or reject errors.",
      "### Step 3: Publish and Rank on Amazon",
      "Once you download your interior PDF and cover PDF from the KDP builder, upload them directly to your Amazon KDP dashboard. Write a description emphasizing keywords like 'brain training activity book' or 'large print puzzle book' to attract organic search traffic. Pair it with an attractive price point (such as $7.99 for a 120-page book) to secure your first reviews and sales."
    ]
  },
  {
    slug: "best-kdp-cover-creators-interior-builders",
    title: "Top 5 KDP Cover Creators & Interior Builders Compared (2026 Edition)",
    category: "Comparison",
    date: "July 07, 2026",
    readTime: "8 min read",
    description: "An honest comparison of the best self-publishing tools, interior generators, and cover builders for Amazon KDP success.",
    content: [
      "Building a self-publishing business requires the right tools. If you are still manually copy-pasting puzzles or struggling with cover template margins, you are losing valuable time. In this guide, we compare the top KDP cover creators and interior builders to help you choose the best platform for your workflow.",
      "### 1. Ismam Studio KDP Builder (Best All-in-One)",
      "Ismam Studio is the ultimate suite for KDP publishers. It combines a high-speed interior builder (supporting Sudoku, Mazes, Cryptograms, and Word Search) with an interactive Fabric-based Cover Studio. The Cover Studio calculates exact KDP spines, lets you design covers with vectors, and provides a 100% free KDP Spine & Cover Calculator and ISBN Barcode Generator. It is the perfect all-in-one platform for beginner and advanced publishers alike.",
      "### 2. Book Bolt (Best for Journals & Research)",
      "Book Bolt is a popular tool that focuses heavily on low-content journals and keyword research. While its interior options are standard, it has a robust database for spying on competitor sales and analyzing keywords. However, it lacks advanced puzzle engines and interactive vector cover builders compared to dedicated puzzle studio platforms.",
      "### 3. Canva (Best for Manual Design)",
      "Canva is a fantastic graphic design tool, but it is not optimized for KDP automation. You cannot automatically generate hundreds of unique Sudokus or Word Searches with solutions in Canva. Additionally, calculating KDP spine offsets and bleed margins must be done manually, which often leads to upload rejection errors on Amazon KDP.",
      "### 4. Tangent Templates (Best for Simple Interiors)",
      "Tangent Templates offers clean, ready-made low-content interior pages (like planners and logs). It is simple and easy to use, but it does not support dynamic puzzle generation or live vector cover styling. It is best suited for publishers who want static, ready-to-go templates.",
      "### Conclusion: Which Tool Should You Choose?",
      "If you want to publish simple lined journals, Canva or Tangent Templates are decent options. However, if you want to scale a profitable puzzle book business, you need automated builders that handle interior generation, formatting, cover spine calculation, and barcode generation. Ismam Studio offers the most integrated, high-speed builder with free KDP utilities to guarantee your books are print-compliant from day one."
    ]
  },
  {
    slug: "calculate-kdp-cover-size-spine-width",
    title: "How to Calculate KDP Cover Size & Spine Width (Free Calculator)",
    category: "Design",
    date: "July 08, 2026",
    readTime: "6 min read",
    description: "Formatting covers for paperback or hardcover can be tricky. Learn how to calculate cover size and spine thickness with standard KDP bleed margins.",
    content: [
      "Designing a book cover for Amazon KDP requires precise calculations. If your cover is even 0.05 inches off, the KDP upload system will reject your PDF with formatting errors. To ensure a seamless upload, you need to understand spine width, bleed, and folding margins. Here is the step-by-step calculation guide.",
      "### What is KDP Cover Bleed?",
      "Bleed refers to the background design extending past the final trim size of your book. Amazon KDP requires a standard bleed margin of 0.125 inches on all outer edges of your cover layout. This prevents white borders when the paper is cut. The formula for the total width of a paperback cover is: Total Width = Back Cover Width + Spine Width + Front Cover Width + (2 * Bleed).",
      "### How to Calculate Spine Width",
      "The spine thickness depends entirely on the page count and the thickness of the paper you choose. White paper has a thickness of 0.00225 inches per page, Cream paper is 0.0025 inches per page, and Premium Color paper is 0.002347 inches per page. The spine width formula is: Spine Width = Page Count * Paper Thickness.",
      "### Try the Free KDP Spine & Cover Calculator",
      "Instead of calculating these formulas manually, you can use our Free KDP Spine & Cover Calculator on Ismam Studio. Enter your trim size, page count, and paper type, and the tool immediately generates the exact layout dimensions in inches and pixels at 300 DPI. Access it for free at ismamstudio.me/tools."
    ]
  },
  {
    slug: "format-kdp-book-descriptions-html",
    title: "How to Format KDP Book Descriptions in HTML (Copy-Paste Templates)",
    category: "SEO",
    date: "July 08, 2026",
    readTime: "5 min read",
    description: "Amazon KDP doesn't support rich text editors for book descriptions, but you can use approved HTML tags. Learn formatting tags and copy-paste templates.",
    content: [
      "Your Amazon book description is a key factor in converting window shoppers into paying readers. A plain block of unformatted text looks unprofessional and is hard to scan. By using Amazon-approved HTML tags, you can add bold headings, bullet points, and text lists to create descriptions that command attention.",
      "### Approved KDP HTML Tags",
      "Amazon only supports a subset of HTML tags. If you use unapproved tags, your description might show raw HTML code or break the page layout. The safe tags to use are: <b>bold</b>, <i>italics</i>, <h1>heading 1</h1>, <h2>heading 2</h2>, <ul>bullet list</ul>, and <li>list item</li>. Avoid using advanced tags like colored text or divs, as KDP will strip them.",
      "### Copy-Paste KDP Description Structure",
      "A high-converting KDP description follows a simple formula: \n1. **Hook**: A bold heading (e.g. <h2>Supercharge Your Brain Today!</h2>)\n2. **Overview**: A brief paragraph detailing the book's value.\n3. **Features List**: A bulleted list outlining chapters, layouts, or puzzle sizes.\n4. **Call to Action**: A final bold line (e.g. <b>Click buy now to get your copy!</b>).",
      "### Use the Free Description Formatter",
      "Formatting raw HTML manually can lead to unclosed tags and rendering errors on Amazon. Use our Free Book Description Formatter to draft, format, and preview your description. It validates KDP compliance and lets you copy the raw HTML in one click. Try it now at ismamstudio.me/tools."
    ]
  },
  {
    slug: "calculate-amazon-kdp-printing-costs-royalties",
    title: "How to Calculate Your Amazon KDP Printing Costs & Royalty Profits",
    category: "Strategy",
    date: "July 08, 2026",
    readTime: "7 min read",
    description: "Unlock KDP royalty math. Learn how Amazon calculates printing costs for paperback and hardcover, and how to price your book for maximum profits.",
    content: [
      "Understanding book pricing, printing costs, and royalty payouts is crucial to running a profitable self-publishing business. Amazon takes a percentage of your sales, subtracts printing costs, and deposits the net royalties. Here is exactly how that math works.",
      "### Paperback Printing Cost Math",
      "For standard black & white paperbacks sold in the US, Amazon charges a flat rate of $0.85 per book plus a page rate of $0.012 per page. For example, a 150-page book costs: $0.85 + (150 * $0.012) = $2.65 to print. Color paperbacks cost more, with a flat rate of $0.85 and $0.07 per page.",
      "### Calculating Net Royalty",
      "Amazon pays a standard 60% royalty rate for paperbacks sold on their marketplace. The formula is: Royalty = (Retail Price * 0.60) - Printing Cost. If you sell a 150-page paperback for $9.99, your royalty is: ($9.99 * 0.60) - $2.65 = $3.34 per sale. Hardcover books follow a similar calculation but with a standard 60% royalty and higher flat printing costs ($5.65).",
      "### Try the Free KDP Royalty Calculator",
      "Want to run pricing scenarios instantly? Check out our Free KDP Royalty Calculator. Adjust sliders for page counts and retail price to see your printing costs and royalty margins across different marketplaces immediately. Access the calculator at ismamstudio.me/tools."
    ]
  },
  {
    slug: "generate-free-puzzle-book-interiors",
    title: "How to Generate Free Puzzle Book Interiors (Sudoku, Mazes & Word Search)",
    category: "Tutorial",
    date: "July 08, 2026",
    readTime: "7 min read",
    description: "Looking for free puzzle interiors for Amazon KDP? Learn how to generate print-ready Sudoku grid and maze PDFs with answer keys for free.",
    content: [
      "Puzzle books are some of the fastest-selling books on Amazon, but buying interior templates can get expensive. Fortunately, you do not have to pay for high-quality puzzle layouts. By using the right online generators, you can create and customize unlimited puzzle grids for free. Here is the best method to generate print-ready interiors.",
      "### Why Generate Your Puzzles Custom?",
      "Purchasing pre-made puzzle packs from stock websites means you risk publishing the exact same puzzles as hundreds of other creators. Amazon can flag duplicate interiors as spam, leading to account suspension. Generating your puzzles dynamically ensures that your word grids, mazes, and sudoku numbers are completely unique to your book.",
      "### Generating Free Interiors",
      "Using the Puzzle Book Generator on Ismam Studio, you can choose from Sudoku, Mazes, Cryptograms, and Word Searches. The tool lets you specify grid sizes, select difficulty tiers, and format page layouts automatically. It compiles the puzzles alongside their answer key solutions into a single high-resolution vector PDF that meets KDP margins.",
      "### Download Your Free Puzzle Templates",
      "Start generating your custom interior pages today. With unlimited exports, check digit validation, and automatic sizing, you can build a complete activity book for free. Try the generator at ismamstudio.me/tools."
    ]
  },
  {
    slug: "create-free-coloring-books-templates",
    title: "How to Create Free Coloring Books with Online Templates",
    category: "Design",
    date: "July 08, 2026",
    readTime: "6 min read",
    description: "Learn how to source free vector graphics and use online templates to build professional coloring books for kids and adults.",
    content: [
      "Coloring books represent a high-margin publishing niche. Sourcing custom illustrations from freelance designers can cost hundreds of dollars, but you can build beautiful coloring books for free by leveraging free vector assets and online styling tools. Here is our step-by-step layout guide.",
      "### Sourcing Free Vector Content",
      "To ensure your coloring book is legal to publish, you must source graphics with commercial-use licenses. Websites like Pixabay, Vecteezy, and Unsplash offer thousands of black-and-white outline drawings. Look for SVG or vector formats so they do not pixelate when resized to standard KDP dimensions.",
      "### Aligning Pages and Layouts",
      "When designing coloring pages, print them on single-sided sheets (meaning every right-hand page is blank). This prevents color marker bleed-through from ruining the next drawing. Leave at least 0.375 inches of safe margins on all sides so the outlines are not cut off during printing.",
      "### Compile for Free",
      "Use the KDP Interior PDF Formatter on Ismam Studio to drag-and-drop your coloring sheets, select your trim size (usually 8.5\" x 11\"), check margins, and compile them into a print-ready PDF book. Get started for free at ismamstudio.me/tools."
    ]
  },
  {
    slug: "kdp-upload-checklist-avoid-rejections",
    title: "The Ultimate KDP Upload Checklist: Avoid Common Rejections",
    category: "Marketing",
    date: "July 08, 2026",
    readTime: "5 min read",
    description: "Ensure a smooth Amazon publishing process. Read the checklist covering metadata, bleed settings, spine size, and account setup.",
    content: [
      "Preparing to upload your book to Amazon KDP is an exciting milestone. However, the review process can be stressful if your files are rejected due to formatting glitches. To save time and ensure your book goes live on the first try, use this interactive checklist before submitting.",
      "### 1. Metadata and Description Check",
      "Ensure your book title and author name match your front cover text exactly. Any discrepancy will result in immediate rejection. Ensure your description is formatted in clean, valid HTML to guarantee it renders correctly across mobile and desktop browsers.",
      "### 2. Spine and Bleed Calculations",
      "Double-check your spine calculations. The spine width depends on your exact page count and paper type. White paper has a thickness of 0.00225 inches. If your book page count is under 72 pages, do not place text on the spine as it is too thin.",
      "### 3. Interactive Compliance Checklist",
      "Use our Free KDP Upload Checklist tool on Ismam Studio to verify your files before uploading. It guides you through safe margin settings, bleed configurations, and metadata requirements, ensuring instant Amazon approval. Try it now at ismamstudio.me/tools."
    ]
  },
  {
    slug: "how-to-use-ismam-studio-free-kdp-tools",
    title: "How to Use Ismam Studio's Free KDP Publishing Tools (Complete Guide)",
    category: "Tutorial",
    date: "July 08, 2026",
    readTime: "8 min read",
    description: "Unleash the power of our free publishing toolkit. Learn how to use all 12 of our free calculators, formatters, and generators step-by-step.",
    content: [
      "Publishing books on Amazon Kindle Direct Publishing (KDP) requires juggling multiple tasks: formatting manuscript files, calculating cover template boundaries, writing marketing copy, and selecting keywords. To simplify this journey, Ismam Studio provides a comprehensive hub of 100% free publishing utilities. Here is a step-by-step guide on how to leverage these tools to publish professional-grade books without spending a dime.",
      "### How to Find and Filter the Free Tools",
      "To access the toolkit, click on the **'Free Tools'** link in the header navigation menu. This will take you to our centralized Free Tools Hub (ismamstudio.me/tools). You can browse all tools at once, or use the category buttons at the top to filter tools by **Design**, **Writing**, **Formatting**, or **Marketing** depending on your immediate task.",
      "### 1. Free eBook Formatter (EPUB)",
      "Convert raw Word (.docx) or text (.txt) manuscripts into professional Kindle-ready EPUB files. The tool structures your chapters, builds a dynamic table of contents, and packages it according to Amazon's reflowable ebook specifications automatically. Select your manuscript and click 'Upload manuscript' to format.",
      "### 2. KDP Interior PDF Formatter",
      "Upload your paperback manuscript, select your target trim size (6\"x9\", 8.5\"x11\", 5\"x8\"), and the formatter automatically checks margins, verifies gutter spacing, and exports a print-ready, KDP-compliant interior PDF. Select your document and click 'Select Document' to validate safety zones.",
      "### 3. Puzzle Book Generator",
      "Create unique puzzle content instantly. Select your puzzle category (Sudoku, Maze, Word Search), difficulty level, and download high-resolution vector interiors with compiled solutions at the back of the book. Click 'Open Tool' to launch the puzzle creation canvas.",
      "### 4. KDP Cover Size Calculator",
      "Calculate full-wrap cover dimensions (front, spine, back, and bleed) in inches and pixels at 300 DPI to avoid upload rejection warnings. Simply choose your paper type, trim size, and page count to generate templates.",
      "### 5. AI Book Title Generator",
      "Enter your book's genre and key topics to generate 10 unique, SEO-friendly, and highly clickable KDP titles per batch. Perfect for brainstorming keyword-rich subtitles.",
      "### 6. Book Description Generator",
      "Write conversion-focused descriptions using proven sales copywriting hooks and triggers, formatted with Amazon-approved HTML. Copy the output directly into KDP.",
      "### 7. KDP Royalty Calculator",
      "Input page count, retail price, paper color, and color type to estimate printing costs and net royalties across global Amazon marketplaces. Helps you calculate profitable pricing structures.",
      "### 8. Spine Width Calculator",
      "Determine the exact width of your paperback or hardcover spine using Amazon's official formulas based on page count and paper type. Fits covers perfectly to prevent folding offsets.",
      "### 9. Book Description Formatter",
      "Paste your book description, style it using headings, bold text, and bullet lists, and copy the validated KDP-compatible HTML code. Real-time visual rendering preview shows how it looks on Amazon.",
      "### 10. KDP Upload Checklist",
      "An interactive step-by-step checklist to ensure your manuscript, cover, metadata, and backend account configurations are fully verified. Tick off items before submitting to Amazon.",
      "### 11. KDP Keyword Research",
      "Plan your 7 backend keyword slots by brainstorming relevant search intent queries and identifying low-competition niches with high conversion volume.",
      "### 12. Cover Self-Assessment",
      "Score your book cover design on visual factors (contrast, thumbnail legibility, font harmony) and receive an automated readiness rating out of 100 before launching."
    ]
  }
];

export default function BlogPage() {
  const [activePost, setActivePost] = useState<Post | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const postSlug = params.get("post");
      if (postSlug) {
        const found = BLOG_POSTS.find((p) => p.slug === postSlug);
        if (found) {
          setActivePost(found);
        }
      }
    }
  }, []);

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
              href={`/blog?post=${post.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setActivePost(post);
                window.history.pushState(null, '', `/blog?post=${post.slug}`);
              }}
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

        {/* Interactive Article Reader Slide-Over */}
        {activePost && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div 
              className="absolute inset-0"
              onClick={() => { setActivePost(null); window.history.pushState(null, '', '/blog'); }}
            />
            
            <div className="relative w-full max-w-3xl bg-[#0b0f19] border-l border-slate-950/50 shadow-2xl h-full flex flex-col justify-between overflow-hidden animate-slide-over">
              
              {/* Close Button & Category Bar */}
              <div className="px-8 py-5 border-b border-slate-900 flex items-center justify-between bg-slate-950/50">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                  {activePost.category}
                </span>
                <button
                  onClick={() => { setActivePost(null); window.history.pushState(null, '', '/blog'); }}
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
