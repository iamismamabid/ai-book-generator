import { prisma } from "@/lib/prisma";
import { checkPremiumStatus } from "../actions";
import BookReader from "./BookReader";

export const dynamic = "force-dynamic";

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
    title: "The Creative Journey",
    subtitle: "A Creative Journey",
    content: "This is a placeholder book because the database record was not found. ".repeat(150),
    chapters: []
  };

  const words = (displayBook.content ?? "").split(" ");
  const wordsPerPage = 300;
  const pages = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(" "));
  }

  return (
    <BookReader book={displayBook} pages={pages} />
  );
}