import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkspaceUserIds } from "@/lib/team";
import BookReader from "./BookReader";

export const dynamic = "force-dynamic";

export default async function ProfessionalBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/book/${id}`)}`);
  }

  const workspaceUserIds = await getWorkspaceUserIds(userId);
  let book: any = null;
  try {
    book = await prisma.book.findFirst({ 
      where: { id, userId: { in: workspaceUserIds } },
      include: { chapters: { orderBy: { order: "asc" } } }
    });
  } catch (error) {
    console.error("Database query failed:", error);
  }

  if (!book) {
    redirect("/dashboard");
  }

  const displayBook = book;
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