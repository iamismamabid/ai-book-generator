"use server";

import { prisma } from "../lib/prisma"; // Make sure this path is the correct one for your app
import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ১. নতুন বই তৈরি করার ফাংশন
export async function createBook(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = formData.get("prompt") as string;

  const aiPrompt = `Generate a book outline based on this idea: "${prompt}".
  Provide the output in this exact format:
  **Book Title:** "Title Name"
  **Book Blurb:** A short description.
  **Chapter Outline:**
  **Chapter 1:** Brief description.
  **Chapter 2:** Brief description.
  **Chapter 3:** Brief description.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: aiPrompt }],
    model: "llama-3.3-70b-versatile",
  }); // 👈 FIXED: This is where the missing brackets were!

  const response = completion.choices[0]?.message?.content || "No content generated";

  const book = await prisma.book.create({
    data: {
      userId: userId,
      title: response.match(/\*\*Book Title:\*\*\s*"([^"]+)"/)?.[1] || "My New Adventure",
      content: response,
    },
  });

  revalidatePath("/dashboard");
  return { id: book.id };
}

// ২. বই ডিলিট করার ফাংশন
export async function deleteBook(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.book.delete({
    where: { id: id },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ৩. নেক্সট চ্যাপ্টার জেনারেট করার ফাংশন
export async function generateNextChapter(bookId: string, outline: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentChapterCount = await prisma.chapter.count({
    where: { bookId: bookId }
  });

  const nextOrder = currentChapterCount + 1;

  const prompt = `You are a professional author writing a book titled "${title}".
  The book outline is: ${outline}.
  
  Your task: Write Chapter ${nextOrder} of this book. 
  Ensure the story flows naturally from previous events. 
  Write only the chapter content in a creative and engaging style.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });

  const content = completion.choices[0]?.message?.content || "Generation failed.";

  await prisma.chapter.create({
    data: {
      title: `Chapter ${nextOrder}: The Journey Continues`,
      content: content,
      bookId: bookId,
      order: nextOrder,
    },
  });

  revalidatePath(`/book/${bookId}`);
  return { success: true };
}

// 🎯 ৪. চ্যাপ্টার আপডেট (এডিট) করার ফাংশন
export async function updateChapter(chapterId: string, oldContent: string, newContent: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get the current FULL book from the database
  const book = await prisma.book.findUnique({ where: { id: chapterId } });
  if (!book) throw new Error("Book not found");

  // 2. MAGIC FIX: Replace ONLY the specific edited text, keep the rest of the book safe!
  const updatedFullContent = book.content.replace(oldContent, newContent);

  // 3. Save the repaired book back to the database
  await prisma.book.update({
    where: { id: chapterId },
    data: { content: updatedFullContent },
  });

  revalidatePath(`/book/${chapterId}`);
  return { success: true };
}
// 🎯 ৫. স্ট্রিমিং শেষে বই সেভ করার ফাংশন (TEMPORARY BYPASS)
export async function saveBookToDB(title: string, content: string) {
  // ⚠️ 1. Temporarily bypassing Clerk auth check for testing
  // const { userId } = await auth();
  // if (!userId) throw new Error("Unauthorized");

  // ⚠️ 2. Create a fake dummy user ID so Prisma doesn't crash
  const userId = "fake_test_user_123"; 

  try {
    const book = await prisma.book.create({
      data: {
        title,
        content,
        userId, // Prisma uses the fake ID here
      }
    });
    
    revalidatePath("/dashboard");
    return { id: book.id };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to save book to the database.");
  }
}

// 🎯 ৬. Continue Story (Add Next Page)
export async function continueBookStory(bookId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get the current book
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found");

  // 2. Ask AI to continue the story
  const prompt = `You are a professional author. Here is the story so far:
  "${book.content.slice(-2000)}" // We send the last 2000 characters for context
  
  Write the next 300 words of the story. Make it flow naturally from the last sentence. Do not include titles, just the story text.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });

  const newContent = completion.choices[0]?.message?.content || "";

  // 3. Append the new text to the old text
  await prisma.book.update({
    where: { id: bookId },
    data: { content: book.content + "\n\n" + newContent.trim() },
  });

  // 4. Refresh the page to show the new pages
  revalidatePath(`/book/${bookId}`);
  return { success: true };
}