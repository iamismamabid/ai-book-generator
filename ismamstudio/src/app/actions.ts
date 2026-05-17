"use server";

import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }
  return new Groq({ apiKey });
}

// ১. নতুন বই তৈরি করার ফাংশন
export async function createBook(formData: FormData) {
  const groq = getGroqClient();
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
  });

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
  const groq = getGroqClient();
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

// 🎯 ৪. চ্যাপ্টার আপডেট (এডিট) করার ফাংশন [এটি আপনার মিসিং ছিল!]
export async function updateChapter(chapterId: string, newContent: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { content: newContent },
  });

  revalidatePath("/");
  return { success: true };
}

// 🎯 ৫. স্ট্রিমিং শেষে বই সেভ করার ফাংশন
export async function saveBookToDB(title: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const book = await prisma.book.create({
    data: {
      userId: userId,
      title: title,
      content: content,
    },
  });

  revalidatePath("/dashboard");
  return { id: book.id };
}
