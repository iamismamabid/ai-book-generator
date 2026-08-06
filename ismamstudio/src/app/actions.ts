"use server";

import { prisma } from "../lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { AI_FEATURES_ENABLED } from "@/lib/features";


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
  if (!AI_FEATURES_ENABLED) throw new Error("This feature is unavailable.");
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
  if (!AI_FEATURES_ENABLED) throw new Error("This feature is unavailable.");
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
      return { checked: true, isPremium: true, plan, limits, isLifetimeDeal: true };
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
        publicMetadata.subscriptionStatus === "active" ||
        publicMetadata.subscriptionStatus === "trialing"
      ) {
        const userPlan = publicMetadata.plan || "pro";
        let limits = { tier: 2, brands: 10, aiChapters: 30, puzzles: ["easy", "medium", "hard"], maxBookCount: 50 };

        if (userPlan === "starter") {
          limits = { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium"], maxBookCount: 20 };
        } else if (userPlan === "agency") {
          limits = { tier: 3, brands: 25, aiChapters: 100, puzzles: ["easy", "medium", "hard"], maxBookCount: 500 };
        }

        // ৭ দিনের ট্রায়াল শুধু আসল Paddle "trialing" সাবস্ক্রিপশনের ক্ষেত্রেই সত্যি (কার্ড ভেরিফাইড checkout-এর পরে)
        const isTrial = publicMetadata.subscriptionStatus === "trialing";
        let daysRemaining;
        if (isTrial && publicMetadata.trialEndsAt) {
          const msRemaining = new Date(publicMetadata.trialEndsAt).getTime() - Date.now();
          daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
        }

        return {
          checked: true,
          isPremium: true,
          plan: userPlan,
          limits,
          ...(isTrial ? { isTrial: true, daysRemaining } : {}),
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

// ---- Cover review links (read-only sharing) ----

const MAX_PREVIEW_BYTES = 4_000_000; // ~4MB of base64; well past a 1x JPEG preview

export interface CoverShareInput {
  title: string;
  previewUrl: string;
  trimLabel?: string;
  pageCount?: number;
  spineWidth?: number;
}

export async function createCoverShare(input: CoverShareInput) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "unauthorized" as const };

  // Only ever accept an inline image the sharer's browser rendered — never a
  // remote URL, which would let this be used to make the server fetch anything.
  if (!input.previewUrl?.startsWith("data:image/")) {
    return { success: false, error: "Invalid preview image" };
  }
  if (input.previewUrl.length > MAX_PREVIEW_BYTES) {
    return { success: false, error: "Preview image is too large to share" };
  }

  try {
    const token = randomUUID().replace(/-/g, "");
    await prisma.coverShare.create({
      data: {
        token,
        userId,
        title: (input.title || "Untitled Cover").slice(0, 120),
        previewUrl: input.previewUrl,
        trimLabel: input.trimLabel?.slice(0, 60) ?? null,
        pageCount: input.pageCount ?? null,
        spineWidth: input.spineWidth ?? null,
      },
    });
    return { success: true, token };
  } catch (error) {
    console.error("Error creating cover share:", error);
    return { success: false, error: "Failed to create review link" };
  }
}

export async function listCoverShares() {
  const { userId } = await auth();
  if (!userId) return { success: false, shares: [] };

  try {
    const shares = await prisma.coverShare.findMany({
      where: { userId, revoked: false },
      orderBy: { createdAt: "desc" },
      take: 25,
      // Deliberately omit previewUrl — the list only needs metadata, and each
      // preview is megabytes.
      select: { token: true, title: true, createdAt: true, trimLabel: true },
    });
    return { success: true, shares };
  } catch (error) {
    console.error("Error listing cover shares:", error);
    return { success: false, shares: [] };
  }
}

export async function revokeCoverShare(token: string) {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    // Scoped to userId so a token alone can't be used to revoke someone else's link.
    const result = await prisma.coverShare.updateMany({
      where: { token, userId },
      data: { revoked: true },
    });
    return { success: result.count > 0 };
  } catch (error) {
    console.error("Error revoking cover share:", error);
    return { success: false };
  }
}

/** Public — no auth. Used by the /review/[token] page. */
export async function getCoverShare(token: string) {
  try {
    const share = await prisma.coverShare.findUnique({ where: { token } });
    if (!share || share.revoked) return null;
    return {
      title: share.title,
      previewUrl: share.previewUrl,
      trimLabel: share.trimLabel,
      pageCount: share.pageCount,
      spineWidth: share.spineWidth,
      createdAt: share.createdAt,
    };
  } catch (error) {
    console.error("Error loading cover share:", error);
    return null;
  }
}

export interface KdpListingResult {
  input: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  categories: string[];
  error?: string;
}

// AI-generated Amazon KDP listing metadata (title/subtitle/description/keywords/
// categories) for a batch of book concepts at once — the "bulk listing helper".
export async function generateBulkKdpListings(bookConcepts: string[]): Promise<{ success: boolean; results?: KdpListingResult[]; error?: string }> {
  if (!AI_FEATURES_ENABLED) return { success: false, error: "This feature is unavailable." };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized. Please sign in." };

  const premium = await checkPremiumStatus();
  if (!premium.isPremium) {
    return { success: false, error: "The Bulk KDP Listing Generator is a premium feature. Please upgrade your plan to use it." };
  }

  const maxBatch = premium.plan === "starter" ? 5 : premium.plan === "pro" ? 15 : 50;
  const concepts = bookConcepts.map(c => c.trim()).filter(Boolean).slice(0, maxBatch);
  if (concepts.length === 0) {
    return { success: false, error: "Please provide at least one book title or concept, one per line." };
  }

  const groq = getGroqClient();
  const results: KdpListingResult[] = [];

  for (const input of concepts) {
    try {
      const prompt = `You are an expert Amazon KDP listing copywriter. Given a book concept, produce ONLY a single valid JSON object (no markdown fences, no commentary) in exactly this shape:
{"title": "...", "subtitle": "...", "description": "...", "keywords": ["...", "...", "...", "...", "...", "...", "..."], "categories": ["...", "..."]}

Rules:
- title: a catchy, search-friendly Amazon book title under 200 characters. Never include the word "Kindle".
- subtitle: a benefit-driven subtitle under 200 characters.
- description: a persuasive 150-250 word Amazon product page description, plain text (no HTML tags), 3-4 short paragraphs.
- keywords: exactly 7 backend search keyword phrases (multi-word phrases, not single words), each under 50 characters, no two keywords repeating the same words, no trademarked terms.
- categories: exactly 2 realistic Amazon KDP browse category paths relevant to this concept (e.g. "Crafts, Hobbies & Home > Games & Activities > Puzzles & Games > Logic & Brain Teasers").

Book concept: "${input}"`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

      results.push({
        input,
        title: typeof parsed.title === "string" ? parsed.title : input,
        subtitle: typeof parsed.subtitle === "string" ? parsed.subtitle : "",
        description: typeof parsed.description === "string" ? parsed.description : "",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 7).map(String) : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories.slice(0, 2).map(String) : [],
      });
    } catch (err) {
      console.error(`Bulk KDP listing generation failed for "${input}":`, err);
      results.push({
        input,
        title: input,
        subtitle: "",
        description: "",
        keywords: [],
        categories: [],
        error: "Failed to generate metadata for this item. Try again or rephrase the concept.",
      });
    }
  }

  return { success: true, results };
}

// 🎯 🎯 🎯 Universal "Save to My Library" Action for all user tiers
export async function saveProjectToLibrary(title: string, content: string, subtitle?: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in to save projects to your library." };
  }

  try {
    const book = await prisma.book.create({
      data: {
        userId: userId,
        title: title.trim() || "Untitled KDP Project",
        subtitle: subtitle || "Saved from KDPage Toolkit",
        content: content || "Project contents saved to Library",
      },
    });

    revalidatePath("/dashboard");
    return { success: true, id: book.id };
  } catch (err: any) {
    console.error("Save to library failed:", err);
    return { success: false, error: err?.message || "Failed to save to Library." };
  }
}

// 📓 📓 📓 Dedicated "Save to My Notebook" Action for permanent account storage (Separate from Book model)
export async function saveToNotebook(title: string, content: string, subtitle?: string, category?: string, data?: any) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in to save to your Notebook." };
  }

  try {
    const notebookDelegate = (prisma as any).notebook;
    let entryId = "";

    if (notebookDelegate?.create) {
      const entry = await notebookDelegate.create({
        data: {
          userId: userId,
          title: title.trim() || "Untitled Notebook Entry",
          subtitle: subtitle || "Permanent Cloud Storage Entry",
          content: content || "",
          category: category || "general",
          data: data || null,
        },
      });
      entryId = entry.id;
    } else {
      // Safe Raw SQL fallback if Prisma client delegate is not yet initialized
      entryId = crypto.randomUUID();
      const now = new Date();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "notebooks" ("id", "userId", "title", "subtitle", "content", "category", "data", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
        entryId,
        userId,
        title.trim() || "Untitled Notebook Entry",
        subtitle || "Permanent Cloud Storage Entry",
        content || "",
        category || "general",
        JSON.stringify(data || {}),
        now,
        now
      );
    }

    revalidatePath("/notebook");
    return { success: true, id: entryId };
  } catch (err: any) {
    console.error("Save to notebook failed:", err);
    return { success: false, error: err?.message || "Failed to save to Notebook." };
  }
}

// 📖 Fetch a single Notebook entry's saved data (used to restore it back into
// the editor it was saved from — e.g. Book Builder reloading a saved bookPages array).
export async function getNotebookEntryData(id: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const notebookDelegate = (prisma as any).notebook;
    let entry: any = null;

    if (notebookDelegate?.findFirst) {
      entry = await notebookDelegate.findFirst({
        where: { id, userId },
      });
    } else {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "notebooks" WHERE "id" = $1 AND "userId" = $2 LIMIT 1`,
        id,
        userId
      );
      entry = Array.isArray(rows) ? rows[0] : null;
    }

    if (!entry) {
      return { success: false, error: "Notebook entry not found." };
    }

    return { success: true, title: entry.title, category: entry.category, data: entry.data };
  } catch (err: any) {
    console.error("Fetch notebook entry failed:", err);
    return { success: false, error: err?.message || "Failed to load Notebook entry." };
  }
}

// 🗑️ Delete Notebook Entry Action
export async function deleteNotebookEntry(id: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const notebookDelegate = (prisma as any).notebook;
    if (notebookDelegate?.delete) {
      await notebookDelegate.delete({
        where: { id },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "notebooks" WHERE "id" = $1 AND "userId" = $2`,
        id,
        userId
      );
    }
    revalidatePath("/notebook");
    return { success: true };
  } catch (err: any) {
    console.error("Delete notebook entry failed:", err);
    return { success: false, error: err?.message || "Failed to delete item." };
  }
}

// 🎓 Mark a first-run interactive tour as seen, so it doesn't replay on
// every visit. Stored on Clerk publicMetadata (already how plan/premium
// status is read elsewhere) rather than a new DB table, since it's a small
// per-user flag with no query/reporting need of its own.
export async function markTourSeen(tourKey: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const seenTours = { ...((user.publicMetadata as any)?.seenTours || {}), [tourKey]: true };

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, seenTours },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Mark tour seen failed:", err);
    return { success: false, error: err?.message || "Failed to update tour status." };
  }
}

