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
    throw new Error(`Your current plan tier is limited to ${maxOutlines} Outlines per month. Please upgrade your lifetime license.`);
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
    throw new Error("Chapter generation is not available on the Free Tier. Please upgrade.");
  }

  let maxChapters = 0;
  if (premium.plan === "starter") maxChapters = 10;
  else if (premium.plan === "pro") maxChapters = 30;
  else if (premium.plan === "agency") maxChapters = 100;
  else if (premium.plan === "tier4") maxChapters = 250;
  else if (premium.plan === "tier5") maxChapters = 999999;
  else maxChapters = 30; // default premium fallback

  if (usage.chaptersCount >= maxChapters) {
    throw new Error(`Your current plan tier is limited to ${maxChapters} Chapters per month. Please upgrade your lifetime license.`);
  }

  const currentChapterCount = await prisma.chapter.count({
    where: { bookId: bookId }
  });

  const nextOrder = currentChapterCount + 1;

  // ১.১. মেমোরির জন্য পূর্ববর্তী চ্যাপ্টারের তথ্য রিট্রিভ করা
  let previousChapterText = "";
  if (nextOrder > 1) {
    const prevChapter = await prisma.chapter.findFirst({
      where: { bookId: bookId, order: nextOrder - 1 }
    });
    if (prevChapter) {
      previousChapterText = prevChapter.content;
    }
  }

  let prompt = `You are a professional author writing a book titled "${title}".
  The book outline and plan is:
  ${outline}
  
  Your task: Write Chapter ${nextOrder} of this book. 
  Ensure the story flows naturally from previous events.`;

  if (previousChapterText) {
    prompt += `
  
  To maintain narrative consistency and style memory, here is the full text of the preceding chapter (Chapter ${nextOrder - 1}):
  ---
  ${previousChapterText}
  ---
  
  Ensure your new Chapter ${nextOrder} continues the exact character arcs, unresolved plot points, and writing style of the preceding chapter. Do not repeat the events of Chapter ${nextOrder - 1}, but start Chapter ${nextOrder} directly following them.`;
  }

  prompt += `
  
  Write only the chapter content in a creative, engaging, and publish-ready style. Do not add introductions, titles, or metadata. Write only the story text itself.`;

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

// 🎯 ৪.২. বইয়ের টাইটেল ও সাবটাইটেল আপডেট করার ফাংশন
export async function updateBookTitleAndSubtitle(bookId: string, title: string, subtitle: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.book.update({
    where: { id: bookId },
    data: { title, subtitle },
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath("/dashboard");
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

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, error: "Invalid code length." };
    }

    // ০. প্রোডাক্ট হান্ট প্রোমো কোড (PH10OFF) চেক করা
    if (cleanCode === "PH10OFF") {
      // চেক করা যে ইউজার ইতিমধ্যে এই প্রোমো কোড রিডিম করেছে কিনা
      const alreadyRedeemed = await prisma.appSumoRedemption.findFirst({
        where: {
          clerkId: userId,
          code: { startsWith: "PH10OFF" }
        }
      });

      if (alreadyRedeemed) {
        return { success: false, error: "You have already redeemed this Product Hunt promo code." };
      }

      await prisma.appSumoRedemption.create({
        data: {
          clerkId: userId,
          email: email,
          code: `PH10OFF-${userId}`
        }
      });

      revalidatePath("/dashboard");
      return { success: true };
    }

    // ১. চেক করা কোডটি ভ্যালিড কোডের তালিকায় আছে কিনা
    const validCode = await prisma.appSumoValidCode.findUnique({
      where: { code: cleanCode }
    });

    if (!validCode) {
      return { success: false, error: "This is not a valid AppSumo code. Please verify your code." };
    }

    if (validCode.isRedeemed) {
      return { success: false, error: "This AppSumo code has already been redeemed." };
    }

    // ২. এই ব্যবহারকারী ইতিমধ্যে কয়টি কোড রিডিম করেছেন তা চেক করা
    const existingRedemptions = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });
    if (existingRedemptions >= 5) {
      return { success: false, error: "You have already stacked the maximum of 5 codes for this account." };
    }

    // ৩. ট্রানজেকশন এর মাধ্যমে রিডেম্পশন সেভ করা এবং ভ্যালিড কোডটি 'Redeemed' হিসেবে মার্ক করা
    await prisma.$transaction([
      prisma.appSumoRedemption.create({
        data: {
          clerkId: userId,
          email: email,
          code: cleanCode
        }
      }),
      prisma.appSumoValidCode.update({
        where: { code: cleanCode },
        data: {
          isRedeemed: true,
          redeemedAt: new Date()
        }
      })
    ]);

    // ৪. রিডেম্পশন শেষে মোট স্ট্যাকড কোডের সংখ্যা বের করা
    const newRedemptionsCount = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });

    revalidatePath("/dashboard");
    return { success: true, count: newRedemptionsCount };
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
    return { checked: true, isPremium: false, reason: "unauthorized", plan: "free", limits: defaultFreeLimits };
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
      return { checked: true, isPremium: true, plan, limits };
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
        return { checked: true, isPremium: true, plan: userPlan, limits };
      }

      // ৩. ৭ দিনের ফ্রী ট্রায়াল পিরিয়ড চেক করা (অ্যাকাউন্ট বয়স ৭ দিনের কম হলে)
      const createdTime = user.createdAt; // Epoch milliseconds from Clerk
      const currentTime = Date.now();
      const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // ৭ দিন মিলি-সেকেন্ডে
      const elapsedMs = currentTime - createdTime;

      if (elapsedMs < trialDurationMs) {
        const daysRemaining = Math.max(0, Math.ceil((trialDurationMs - elapsedMs) / (24 * 60 * 60 * 1000)));
        return {
          checked: true,
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

  return { checked: true, isPremium: false, reason: "free_tier", plan: "free", limits: defaultFreeLimits };
}

// Persists the Cover Studio's current project to the signed-in user's account.
// One project per user for now (upsert) — this replaces the localStorage-only
// draft that was previously the sole copy of a user's cover work, with nothing
// backing it up if the browser cache was cleared or they switched devices.
export async function saveCoverProject(data: unknown) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  try {
    await prisma.coverProject.upsert({
      where: { userId },
      update: { data: data as any },
      create: { userId, data: data as any },
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving cover project:", error);
    return { success: false, error: "Failed to save cover project" };
  }
}

export async function loadCoverProject() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, data: null };
  }

  try {
    const project = await prisma.coverProject.findUnique({ where: { userId } });
    return { success: true, data: project?.data ?? null, updatedAt: project?.updatedAt ?? null };
  } catch (error) {
    console.error("Error loading cover project:", error);
    return { success: false, data: null };
  }
}