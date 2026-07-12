import { prisma } from "@/lib/prisma"; // Adjusted to use clean alias
import Link from "next/link";
import { ArrowLeft, CreditCard, BookOpen } from "lucide-react";
import ExportButton from "@/components/ExportButton"; // Adjusted to use clean alias
import { SudokuGenerator } from "@/components/SudokuGenerator";

import ChapterButton from "./ChapterButton";
import EditableChapter from "./EditableChapter";

function ContinueWritingButton({ bookId }: { bookId: string }) {
  return (
    <Link
      href={`/generate?edit=${bookId}`}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg font-sans"
    >
      <BookOpen className="h-5 w-5" />
      Continue Writing
    </Link>
  );
}

export default async function ProfessionalBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let book: any = null;
  try {
    book = await prisma.book.findUnique({ 
      where: { id },
      include: { chapters: { orderBy: { order: "asc" } } }
    });
  } catch (error) {
    console.error("Database query failed, using fallback...", error);
  }

  const displayBook = book ?? {
    id,
    title: "The AI Generation Journey",
    content: "This is a placeholder book because the database record was not found. ".repeat(150),
    chapters: []
  };

  const words = (displayBook.content ?? "").split(" ");
  const wordsPerPage = 300;
  const pages = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(" "));
  }

  const fullContent = [
    displayBook.content,
    ...displayBook.chapters.map((c: any) => `\n\n${c.title}\n\n${c.content}`)
  ].join("\n");

  return (
    <main className="min-h-screen bg-slate-100 font-serif">
      <div className="pb-20">
        
        <nav className="print:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all">
            <ArrowLeft className="w-5 h-5" /> <span className="font-sans font-bold">Library</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ExportButton title={displayBook.title} content={fullContent} />
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-sans font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
              <CreditCard className="w-4 h-4" /> Publish & Sell
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto mt-12 space-y-12 px-4">
          
          <section className="aspect-[1/1.414] bg-white shadow-2xl rounded-sm flex flex-col items-center justify-center p-20 text-center border-l-[12px] border-indigo-600">
            <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight">{displayBook.title}</h1>
            <div className="w-20 h-1 bg-indigo-600 mb-6 mx-auto"></div>
            <p className="text-xl text-slate-500 font-sans tracking-widest uppercase">An AI Generated Journey</p>
          </section>

          {pages.map((pageContent, index) => (
            <section 
              key={index} 
              className="relative min-h-[1100px] pb-28 bg-white shadow-xl p-16 md:p-24 border border-slate-200"
              style={{ boxShadow: "5px 0 15px -5px rgba(0,0,0,0.1) inset" }} 
            >
              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 font-sans text-sm">
                — Page {index + 1} —
              </span>
              <div className="prose prose-slate max-w-none">
                <div className="text-lg md:text-xl leading-[1.8] text-slate-800 whitespace-pre-wrap first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                  {pageContent}
                </div>
              </div>
            </section>
          ))}

          {/* 📖 Render Generated Chapters */}
          {displayBook.chapters.map((chapter: any, idx: number) => (
            <section 
              key={chapter.id}
              className="relative min-h-[1100px] pb-28 bg-white shadow-xl p-16 md:p-24 border border-slate-200 mt-12"
              style={{ boxShadow: "5px 0 15px -5px rgba(0,0,0,0.1) inset" }}
            >
              <h2 className="text-3xl font-black mb-6 leading-tight text-slate-900 border-b pb-4">{chapter.title}</h2>
              <EditableChapter chapter={chapter} />
              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 font-sans text-sm">
                — Page {pages.length + idx + 1} —
              </span>
            </section>
          ))}

          <section className="h-64 bg-slate-200/50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <BookOpen className="w-10 h-10 mb-4 opacity-20" />
            <p className="font-sans font-bold italic">The End of {displayBook.title}</p>
          </section>
          
          <div className="print:hidden flex flex-col items-center justify-center w-full gap-6">
            <ChapterButton 
              bookId={displayBook.id} 
              outline={displayBook.content ?? ""} 
              title={displayBook.title} 
              currentCount={displayBook.chapters.length} 
            />
            <ContinueWritingButton bookId={displayBook.id} />
          </div>

          {/* This is where the Sudoku code you wanted combined appears! */}
          <div className="print:hidden mt-16 w-full font-sans">
             <SudokuGenerator />
          </div>

        </div>
      </div>
    </main>
  );
}