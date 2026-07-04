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

  let maxOutlines = 1;
  if (premium.plan === "starter") maxOutlines = 5;
  else if (premium.plan === "pro") maxOutlines = 15;
  else if (premium.plan === "agency") maxOutlines = 50;
  else if (premium.plan === "tier4") maxOutlines = 100;
  else if (premium.plan === "tier5") maxOutlines = 999999;
  else if (premium.plan !== "free") maxOutlines = 15; // default premium fallback

  if (usage.outlinesCount >= maxOutlines) {
    throw new Error(`Your current plan tier is limited to ${maxOutlines} AI Outlines per month. Please upgrade your lifetime license.`);
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

  let maxChapters = 0;
  if (premium.plan === "starter") maxChapters = 10;
  else if (premium.plan === "pro") maxChapters = 30;
  else if (premium.plan === "agency") maxChapters = 100;
  else if (premium.plan === "tier4") maxChapters = 250;
  else if (premium.plan === "tier5") maxChapters = 999999;
  else maxChapters = 30; // default premium fallback

  if (usage.chaptersCount >= maxChapters) {
    throw new Error(`Your current plan tier is limited to ${maxChapters} AI Chapters per month. Please upgrade your lifetime license.`);
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

    // এই ব্যবহারকারী ইতিমধ্যে কয়টি কোড রিডিম করেছেন তা চেক করা
    const existingRedemptions = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });
    if (existingRedemptions >= 5) {
      return { success: false, error: "You have already stacked the maximum of 5 codes for this account." };
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
  const defaultFreeLimits = { tier: 0, brands: 1, aiChapters: 0, puzzles: ["easy"], maxBookCount: 5 };

  if (!userId) {
    return { isPremium: false, reason: "unauthorized", plan: "free", limits: defaultFreeLimits };
  }

  try {
    // ১. ডাটাবেসে AppSumo redemption কোড চেক করা
    const redemptionsCount = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });

    if (redemptionsCount > 0) {
      let plan = "starter";
      let limits = { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium"], maxBookCount: 20 };

      if (redemptionsCount === 2) {
        plan = "pro";
        limits = { tier: 2, brands: 10, aiChapters: 30, puzzles: ["easy", "medium", "hard"], maxBookCount: 50 };
      } else if (redemptionsCount === 3) {
        plan = "agency";
        limits = { tier: 3, brands: 25, aiChapters: 100, puzzles: ["easy", "medium", "hard"], maxBookCount: 500 };
      } else if (redemptionsCount === 4) {
        plan = "tier4";
        limits = { tier: 4, brands: 50, aiChapters: 250, puzzles: ["easy", "medium", "hard"], maxBookCount: 500 };
      } else if (redemptionsCount >= 5) {
        plan = "tier5";
        limits = { tier: 5, brands: 999999, aiChapters: 999999, puzzles: ["easy", "medium", "hard"], maxBookCount: 500 };
      }
      return { isPremium: true, plan, limits };
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
        const userPlan = publicMetadata.plan || "pro";
        let limits = { tier: 2, brands: 10, aiChapters: 30, puzzles: ["easy", "medium", "hard"], maxBookCount: 50 };
        
        if (userPlan === "starter") {
          limits = { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium"], maxBookCount: 20 };
        } else if (userPlan === "agency") {
          limits = { tier: 3, brands: 25, aiChapters: 100, puzzles: ["easy", "medium", "hard"], maxBookCount: 500 };
        }
        return { isPremium: true, plan: userPlan, limits };
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
          daysRemaining,
          limits: { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium"], maxBookCount: 20 }
        };
      }
    }
  } catch (error) {
    console.error("Error in checkPremiumStatus:", error);
  }

  return { isPremium: false, reason: "free_tier", plan: "free", limits: defaultFreeLimits };
}