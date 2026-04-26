import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Edit3, Share2, Sparkles } from "lucide-react";
import ExportButton from "../../../components/ExportButton";
export default async function BookReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const bookId = resolvedParams.id;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 font-serif pb-32">
      
      {/* 🌟 Sticky Floating Navbar */}
      <div className="sticky top-0 z-50 w-full pt-6 px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
          <Link 
            href="/dashboard" 
            className="w-12 h-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:shadow-lg hover:-translate-x-1 transition-all"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
           <ExportButton title={book.title} content={book.content}/>
          </div>
        </div>
      </div>

      {/* 📖 The Book Canvas */}
      <article className="max-w-3xl mx-auto px-8 pt-16 md:pt-24 relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 blur-3xl pointer-events-none"></div>

        <header className="mb-16 md:mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles className="w-3 h-3" /> AI Generated Masterpiece
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 font-sans">
            {book.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 font-sans text-sm font-medium">
            <span>Created on {new Date(book.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>•</span>
            <span>{book.content.split(' ').length} Words</span>
          </div>
        </header>

        {/* The Story Content */}
        <div className="prose prose-lg md:prose-xl prose-slate mx-auto">
          <div className="text-xl md:text-2xl leading-relaxed md:leading-[2] text-slate-700 whitespace-pre-wrap font-serif">
            {book.content}
          </div>
        </div>

      </article>

      {/* 🏁 End of Book Marker */}
      <div className="max-w-3xl mx-auto px-8 mt-24 text-center">
        <div className="flex items-center justify-center gap-4 text-slate-300">
          <div className="w-16 h-[1px] bg-slate-200"></div>
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <div className="w-16 h-[1px] bg-slate-200"></div>
        </div>
        <p className="mt-6 text-sm font-sans text-slate-400 font-bold tracking-widest uppercase">The End</p>
      </div>

    </main>
  );
}