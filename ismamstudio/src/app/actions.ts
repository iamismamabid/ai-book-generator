"use server";

import { prisma } from "../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// Look! No import line here anymore.

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

  const premium = await checkPremiumStatus();
  const usage = await getUserUsage();

  if (premium.plan === "free" && usage.outlinesCount >= 1) {
    throw new Error("Free Tier is limited to 1 AI Outline per month. Please upgrade.");
  }
  if (premium.plan === "starter" && usage.outlinesCount >= 5) {
    throw new Error("Starter Tier is limited to 5 AI Outlines per month. Please upgrade to Pro.");
  }

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

  const premium = await checkPremiumStatus();
  const usage = await getUserUsage();

  if (premium.plan === "free") {
    throw new Error("AI Chapter generation is not available on the Free Tier. Please upgrade.");
  }
  if (premium.plan === "starter" && usage.chaptersCount >= 5) {
    throw new Error("Starter Tier is limited to 5 AI Chapters per month. Please upgrade to Pro.");
  }

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

// 🎯 ৬. AppSumo কোড রিডিম করার ফাংশন
export async function redeemAppSumoCode(code: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized. Please sign in." };

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    if (!code || code.trim().length < 3) {
      return { success: false, error: "Invalid code length." };
    }

    // কোডটি ইতিমধ্যে ব্যবহার করা হয়েছে কিনা চেক করা
    const existingCode = await prisma.appSumoRedemption.findFirst({
      where: { code: code.trim() }
    });
    if (existingCode) {
      return { success: false, error: "This AppSumo code has already been redeemed." };
    }

    // এই ব্যবহারকারী ইতিমধ্যে কোড রিডিম করেছেন কিনা চেক করা
    const existingUser = await prisma.appSumoRedemption.findUnique({
      where: { clerkId: userId }
    });
    if (existingUser) {
      return { success: false, error: "You have already redeemed an AppSumo code for this account." };
    }

    // ডেটাবেজে রিডেম্পশন সেভ করা
    await prisma.appSumoRedemption.create({
      data: {
        clerkId: userId,
        email: email,
        code: code.trim()
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Redemption action error:", error);
    return { success: false, error: error.message || "Server error occurred. Please try again." };
  }
}

// 🎯 ৬.১. ইউজারের মাসিক আউটলাইন ও চ্যাপ্টার জেনারেট করার হিসাব
export async function getUserUsage() {
  const { userId } = await auth();
  if (!userId) return { outlinesCount: 0, chaptersCount: 0 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const outlinesCount = await prisma.book.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth }
    }
  });

  const chaptersCount = await prisma.chapter.count({
    where: {
      book: {
        userId
      },
      createdAt: { gte: startOfMonth }
    }
  });

  return { outlinesCount, chaptersCount };
}

// 🎯 ৭. ইউজারের প্রিমিয়াম স্ট্যাটাস চেক করার ফাংশন
export async function checkPremiumStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isPremium: false, reason: "unauthorized", plan: "free" };
  }

  try {
    // ১. ডাটাবেসে AppSumo redemption কোড চেক করা
    const redemption = await prisma.appSumoRedemption.findUnique({
      where: { clerkId: userId }
    });

    if (redemption) {
      return { isPremium: true, plan: "AppSumo LTD" };
    }

    // ২. Clerk publicMetadata চেক করা (সাবস্ক্রিপশনের জন্য)
    const user = await currentUser();
    if (user) {
      const publicMetadata = user.publicMetadata as any;
      if (
        publicMetadata.isPremium === true ||
        publicMetadata.plan === "starter" ||
        publicMetadata.plan === "pro" ||
        publicMetadata.plan === "agency" ||
        publicMetadata.subscriptionStatus === "active"
      ) {
        return { isPremium: true, plan: publicMetadata.plan || "pro" };
      }

      // ৩. ৭ দিনের ফ্রী ট্রায়াল পিরিয়ড চেক করা (অ্যাকাউন্ট বয়স ৭ দিনের কম হলে)
      const createdTime = user.createdAt; // Epoch milliseconds from Clerk
      const currentTime = Date.now();
      const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // ৭ দিন মিলি-সেকেন্ডে
      const elapsedMs = currentTime - createdTime;

      if (elapsedMs < trialDurationMs) {
        const daysRemaining = Math.max(0, Math.ceil((trialDurationMs - elapsedMs) / (24 * 60 * 60 * 1000)));
        return {
          isPremium: true,
          plan: "Free Trial",
          isTrial: true,
          daysRemaining
        };
      }
    }
  } catch (error) {
    console.error("Error in checkPremiumStatus:", error);
  }

  return { isPremium: false, reason: "free_tier", plan: "free" };
}