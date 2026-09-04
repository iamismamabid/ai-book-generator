"use server";

import { prisma } from "../lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getTeamOwnerIdForMember, getWorkspaceUserIds, seatLimitForPlan } from "@/lib/team";
import { checkRateLimit } from "@/lib/rateLimit";
import { AI_FEATURES_ENABLED } from "@/lib/features";


// ২. বই ডিলিট করার ফাংশন
export async function deleteBook(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workspaceUserIds = await getWorkspaceUserIds(userId);
  await prisma.book.deleteMany({
    where: { id: id, userId: { in: workspaceUserIds } },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 🎯 ৪. চ্যাপ্টার আপডেট (এডিট) করার ফাংশন 
export async function updateChapter(chapterId: string, newContent: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workspaceUserIds = await getWorkspaceUserIds(userId);
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: true },
  });

  if (!chapter || !workspaceUserIds.includes(chapter.book.userId)) {
    throw new Error("Unauthorized or chapter not found");
  }

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

  const workspaceUserIds = await getWorkspaceUserIds(userId);
  await prisma.book.updateMany({
    where: { id: bookId, userId: { in: workspaceUserIds } },
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

    // Flat limit for every account tier -- this guards against someone
    // scripting their way through the code keyspace, not against generation
    // cost, so paid plans don't get an exemption here.
    const rateLimit = await checkRateLimit(userId, "redeemAppSumoCode", 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return { success: false, error: `Too many attempts. Please try again in ${Math.ceil((rateLimit.retryAfterSeconds || 60) / 60)} minute(s).` };
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, error: "Invalid code length." };
    }

    // ১. চেক করা কোডটি অলরেডি ডাটাবেসে রিডিম করা হয়েছে কিনা
    const alreadyRedeemed = await prisma.appSumoRedemption.findUnique({
      where: { code: cleanCode }
    });
    if (alreadyRedeemed) {
      return { success: false, error: "This license code has already been redeemed." };
    }

    // ২. চেক করা কোডটি ভ্যালিড কোডের তালিকায় আছে কিনা
    let validCode = await prisma.appSumoValidCode.findUnique({
      where: { code: cleanCode }
    });

    if (validCode && validCode.isRedeemed) {
      return { success: false, error: "This license code has already been redeemed." };
    }

    // ৩. যদি ডাটাবেসে না থাকে, তবে Gumroad License API-র মাধ্যমে লাইভ ভেরিফাই করা
    if (!validCode) {
      const isGumroadCandidate = cleanCode.includes("-") || cleanCode.startsWith("GR") || cleanCode.startsWith("GUMROAD") || cleanCode.length >= 8;
      if (isGumroadCandidate) {
        try {
          const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              product_id: "odapzw",
              license_key: code.trim(),
              increment_uses_count: "true"
            }),
            cache: "no-store"
          });
          const gumroadData = await gumroadRes.json().catch(() => ({}));

          if (gumroadData?.success && gumroadData?.purchase) {
            validCode = await prisma.appSumoValidCode.upsert({
              where: { code: cleanCode },
              update: { isRedeemed: false },
              create: {
                code: cleanCode,
                isRedeemed: false
              }
            });
          } else {
            // Permlink "kdpage" দিয়ে ফলব্যাক ট্রাই করা
            const permalinkRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                product_permalink: "kdpage",
                license_key: code.trim(),
                increment_uses_count: "true"
              }),
              cache: "no-store"
            });
            const permalinkData = await permalinkRes.json().catch(() => ({}));
            if (permalinkData?.success && permalinkData?.purchase) {
              validCode = await prisma.appSumoValidCode.upsert({
                where: { code: cleanCode },
                update: { isRedeemed: false },
                create: {
                  code: cleanCode,
                  isRedeemed: false
                }
              });
            }
          }
        } catch (gumroadErr) {
          console.error("Gumroad API verification error:", gumroadErr);
        }
      }
    }

    if (!validCode) {
      return { success: false, error: "This is not a valid license code. Please verify the code from your purchase receipt." };
    }

    // ৪. এই ব্যবহারকারী ইতিমধ্যে কয়টি কোড রিডিম করেছেন তা চেক করা
    const existingRedemptions = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });
    if (existingRedemptions >= 5) {
      return { success: false, error: "You have already stacked the maximum of 5 codes for this account." };
    }

    // ৫. ট্রানজেকশন এর মাধ্যমে রিডেম্পশন সেভ করা এবং ভ্যালিড কোডটি 'Redeemed' হিসেবে মার্ক করা
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

    // ৬. রিডেম্পশন শেষে মোট স্ট্যাকড কোডের সংখ্যা বের করা
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
  const { userId: signedInUserId } = await auth();
  const defaultFreeLimits = { tier: 0, brands: 1, aiChapters: 0, puzzles: ["easy"], maxBookCount: 5 };

  if (!signedInUserId) {
    return { checked: true, isPremium: false, reason: "unauthorized", plan: "free", limits: defaultFreeLimits };
  }

  // A team member's plan/seats/features are the team owner's, not their own --
  // that's the point of a paid seat. Resolve status against the owner's
  // account below; everything else in this function is unchanged.
  const teamOwnerId = await getTeamOwnerIdForMember(signedInUserId).catch(() => null);
  const userId = teamOwnerId ?? signedInUserId;

  // A transient Clerk/Prisma hiccup shouldn't silently downgrade a paying
  // customer to free tier -- retry once before giving up, and label the
  // eventual fallback distinctly ("status_check_failed") from a genuine
  // free-tier user ("free_tier") so callers can tell an outage apart from
  // someone who simply isn't premium, instead of treating both the same.
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    // ১. ডাটাবেসে AppSumo redemption কোড চেক করা
    const redemptionsCount = await prisma.appSumoRedemption.count({
      where: { clerkId: userId }
    });

    if (redemptionsCount > 0) {
      let plan = "pro";
      let limits = { tier: 1, brands: 10, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };

      if (redemptionsCount >= 2) {
        plan = "agency";
        limits = { tier: 2, brands: 25, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };
      }
      return { checked: true, isPremium: true, plan, limits, isLifetimeDeal: true };
    }

    // ২. Clerk publicMetadata চেক করা (সাবস্ক্রিপশনের জন্য)
    const user = await currentUser();
    if (user) {
      const publicMetadata = (user.publicMetadata || {}) as any;

      // 🛑 TRIAL RESTRICTION & EXPIRATION CHECK:
      const trialEndsAtMs = publicMetadata.trialEndsAt ? new Date(publicMetadata.trialEndsAt).getTime() : 0;
      const wasTrialUser = trialEndsAtMs > 0 || publicMetadata.isTrial === true || publicMetadata.subscriptionStatus === "trialing";
      const hasTrialExpired = trialEndsAtMs > 0 ? Date.now() > trialEndsAtMs : false;
      const hasVerifiedPayment = publicMetadata.hasPaidTransaction === true && publicMetadata.subscriptionStatus === "active";

      // Case A: User was on a trial and 7 days have expired without verified payment (card had no money / payment failed)
      if (wasTrialUser && hasTrialExpired && !hasVerifiedPayment) {
        // Auto-heal Clerk metadata if stale isPremium: true was accidentally granted
        if (publicMetadata.isPremium === true || publicMetadata.subscriptionStatus === "active") {
          clerkClient()
            .then((client) =>
              client.users.updateUserMetadata(userId, {
                publicMetadata: {
                  ...publicMetadata,
                  isPremium: false,
                  isTrial: false,
                  subscriptionStatus: "inactive",
                  plan: "free",
                  trialExpired: true,
                  lastPaymentStatus: "failed_or_expired",
                },
              })
            )
            .catch((err) => console.error("Auto-heal trial metadata error:", err));
        }

        return {
          checked: true,
          isPremium: false, // 🔒 Strictly blocked from watermark-free downloads
          isTrial: false,
          trialExpired: true,
          plan: "free",
          limits: defaultFreeLimits,
          reason: "trial_expired_unpaid",
        };
      }

      // Case B: User is currently inside active 7-day trial window
      if (wasTrialUser && !hasTrialExpired && !hasVerifiedPayment) {
        const userPlan = publicMetadata.plan || "pro";
        let limits = { tier: 2, brands: 10, aiChapters: 30, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };

        if (userPlan === "starter") {
          limits = { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium", "hard"], maxBookCount: 100 };
        } else if (userPlan === "agency") {
          limits = { tier: 3, brands: 25, aiChapters: 100, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };
        }

        let daysRemaining = 7;
        if (trialEndsAtMs > 0) {
          const msRemaining = trialEndsAtMs - Date.now();
          daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
        }

        return {
          checked: true,
          isPremium: false, // 🔒 Strictly false during trial to block 300 DPI watermark-free exports
          isTrial: true,
          plan: userPlan,
          daysRemaining,
          limits,
          reason: "trial_unpaid",
        };
      }

      // Case C: Explicitly failed, canceled, or past-due subscriptions
      if (
        publicMetadata.subscriptionStatus === "past_due" ||
        publicMetadata.subscriptionStatus === "canceled" ||
        publicMetadata.subscriptionStatus === "paused" ||
        publicMetadata.subscriptionStatus === "inactive" ||
        publicMetadata.lastPaymentStatus === "failed"
      ) {
        return {
          checked: true,
          isPremium: false,
          isTrial: false,
          plan: "free",
          limits: defaultFreeLimits,
          reason: "subscription_inactive_or_past_due",
        };
      }

      // Case D: Strictly grant premium only to active paid subscriptions
      const isPaidSubscribed =
        publicMetadata.subscriptionStatus === "active" &&
        (publicMetadata.plan === "starter" ||
          publicMetadata.plan === "pro" ||
          publicMetadata.plan === "agency" ||
          publicMetadata.isPremium === true) &&
        (!wasTrialUser || hasVerifiedPayment);

      if (isPaidSubscribed) {
        const userPlan = publicMetadata.plan || "pro";
        let limits = { tier: 2, brands: 10, aiChapters: 30, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };

        if (userPlan === "starter") {
          limits = { tier: 1, brands: 3, aiChapters: 10, puzzles: ["easy", "medium", "hard"], maxBookCount: 100 };
        } else if (userPlan === "agency") {
          limits = { tier: 3, brands: 25, aiChapters: 100, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 };
        }

        return {
          checked: true,
          isPremium: true,
          plan: userPlan,
          limits,
        };
      }
    }

    // No error and no premium signal found -- this is a genuine free-tier
    // user, not a failed check. Return immediately, don't retry.
    return { checked: true, isPremium: false, reason: "free_tier", plan: "free", limits: defaultFreeLimits };
  } catch (error) {
    console.error(`checkPremiumStatus attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);
    if (attempt === MAX_ATTEMPTS) {
      return { checked: true, isPremium: false, reason: "status_check_failed", plan: "free", limits: defaultFreeLimits };
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  }

  // Unreachable -- the loop above always returns -- but keeps TS satisfied
  // that every path returns a value.
  return { checked: true, isPremium: false, reason: "status_check_failed", plan: "free", limits: defaultFreeLimits };
}

// 🎯 Instant client-side upgrade verification right after Paddle checkout completes
export async function confirmPaddleCheckoutSuccess(checkoutData: any) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const priceId = checkoutData?.items?.[0]?.price?.id || checkoutData?.price_id || checkoutData?.details?.line_items?.[0]?.price?.id;
    const customerId = checkoutData?.customer_id || checkoutData?.customer?.id;
    const subscriptionId = checkoutData?.id || checkoutData?.subscription_id;

    let plan = "pro";
    const starterMonthly = process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY || "pri_01kwbgsarn24e1rn46dhadfcnx";
    const starterAnnual = process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL || "pri_01kwbh8envq2yez7j7hsd1y679";
    const proMonthly = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || "pri_01kwbgyfhhq6h86av5qycv52fs";
    const agencyMonthly = process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY || "pri_01kwbwhfxnebsj6nds4m65jjrq";
    const agencyAnnual = process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL || "pri_01kwbwkrk1w7tnc318ga4d6xt6";

    if (priceId === starterMonthly || priceId === starterAnnual) {
      plan = "starter";
    } else if (priceId === agencyMonthly || priceId === agencyAnnual) {
      plan = "agency";
    } else {
      plan = "pro";
    }

    // Determine if this is a trial checkout
    let isTrial = false;
    let trialEndsAt: string | null = null;
    let subscriptionStatus = "active";

    const apiKey = process.env.PADDLE_API_KEY;
    const apiBase =
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    // 1. If we have Paddle API key and a subscription ID, query Paddle directly for ground truth
    if (apiKey && subscriptionId && subscriptionId.startsWith("sub_")) {
      try {
        const pRes = await fetch(`${apiBase}/subscriptions/${subscriptionId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          const pStatus = pData?.data?.status;
          if (pStatus === "trialing") {
            isTrial = true;
            subscriptionStatus = "trialing";
            trialEndsAt = pData?.data?.current_billing_period?.ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          } else if (pStatus === "active") {
            subscriptionStatus = "active";
          }
        }
      } catch (e) {
        console.error("confirmPaddleCheckoutSuccess: Paddle API check failed:", e);
      }
    }

    // 2. Fallback inspection on checkoutData payload
    if (!isTrial) {
      const txnTotal = Number(checkoutData?.details?.totals?.total ?? checkoutData?.totals?.total ?? checkoutData?.details?.totals?.grand_total ?? 1);
      const isZeroCharge = txnTotal === 0;
      const isTrialStatus = checkoutData?.status === "trialing" || checkoutData?.subscription?.status === "trialing";
      const isStandardTrialPrice = priceId === starterMonthly || priceId === proMonthly || priceId === agencyMonthly;

      if (isTrialStatus || (isZeroCharge && (subscriptionId || isStandardTrialPrice))) {
        isTrial = true;
        subscriptionStatus = "trialing";
        trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        isPremium: !isTrial, // 🔒 Strictly false during trial
        isTrial: isTrial,
        hasPaidTransaction: !isTrial,
        trialExpired: false,
        plan: plan,
        subscriptionStatus: subscriptionStatus,
        lastPaymentStatus: isTrial ? "trial" : "paid",
        ...(customerId ? { paddleCustomerId: customerId } : {}),
        ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
        ...(trialEndsAt ? { trialEndsAt } : { trialEndsAt: null }),
      },
    });

    return { success: true, plan, isTrial };
  } catch (err: any) {
    console.error("Error in confirmPaddleCheckoutSuccess:", err);
    return { success: false, error: err.message };
  }
}

// 🎯 One-click subscription sync action for any user who completed a purchase
export async function syncMySubscription() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "unauthorized" };

  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "user_not_found" };

    const meta = (user.publicMetadata || {}) as any;

    // 1. Check database redemptions first (AppSumo / DealFuel lifetime licenses)
    const redemptionsCount = await prisma.appSumoRedemption.count({
      where: { clerkId: userId },
    });

    if (redemptionsCount > 0) {
      const clerk = await clerkClient();
      const plan = redemptionsCount >= 3 ? "agency" : redemptionsCount >= 2 ? "pro" : "starter";
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...meta,
          isPremium: true,
          isTrial: false,
          hasPaidTransaction: true,
          trialExpired: false,
          plan,
          tier: redemptionsCount,
          subscriptionStatus: "active",
        },
      });
      return { success: true, isPremium: true, plan };
    }

    // 2. If user has a Paddle subscription, query Paddle API for ground truth
    const apiKey = process.env.PADDLE_API_KEY;
    const apiBase =
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    if (meta.paddleSubscriptionId && apiKey) {
      try {
        const pRes = await fetch(`${apiBase}/subscriptions/${meta.paddleSubscriptionId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          const paddleStatus = pData?.data?.status; // "trialing", "active", "past_due", "canceled", "paused"
          const isTrial = paddleStatus === "trialing";
          const trialEndsAt = isTrial
            ? (pData?.data?.current_billing_period?.ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
            : (meta.trialEndsAt || null);

          // If past_due, paused, or canceled in Paddle, downgrade immediately
          if (paddleStatus === "past_due" || paddleStatus === "canceled" || paddleStatus === "paused") {
            const clerk = await clerkClient();
            await clerk.users.updateUserMetadata(userId, {
              publicMetadata: {
                ...meta,
                isPremium: false,
                isTrial: false,
                hasPaidTransaction: false,
                trialExpired: true,
                plan: "free",
                subscriptionStatus: paddleStatus,
                lastPaymentStatus: "failed",
              },
            });
            return {
              success: false,
              error: `Subscription is ${paddleStatus.replace("_", " ")}. Please update your payment method in billing.`
            };
          }

          // If Paddle status is active, verify that a genuine paid transaction occurred
          let hasVerifiedPaidTxn = meta.hasPaidTransaction === true;
          if (paddleStatus === "active" && !hasVerifiedPaidTxn) {
            try {
              const txRes = await fetch(`${apiBase}/transactions?subscription_id=${meta.paddleSubscriptionId}&status=paid`, {
                headers: { Authorization: `Bearer ${apiKey}` },
              });
              if (txRes.ok) {
                const txData = await txRes.json();
                const paidList = txData?.data || [];
                hasVerifiedPaidTxn = paidList.some((t: any) => {
                  const total = Number(t?.details?.totals?.total ?? t?.payments?.[0]?.amount ?? 0);
                  return total > 0;
                });
              }
            } catch (txErr) {
              console.error("Failed to verify paid transactions in syncMySubscription:", txErr);
            }
          }

          const trialEndsAtMs = trialEndsAt ? new Date(trialEndsAt).getTime() : 0;
          const isTrialOver = trialEndsAtMs > 0 && Date.now() > trialEndsAtMs;

          // 🔒 Security Guard: If trial expired and no paid transaction exists, DO NOT grant premium
          const isPaid = paddleStatus === "active" && hasVerifiedPaidTxn;

          const clerk = await clerkClient();
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...meta,
              isPremium: isPaid,
              isTrial: isTrial && !isTrialOver,
              trialExpired: isTrialOver && !isPaid,
              hasPaidTransaction: hasVerifiedPaidTxn,
              subscriptionStatus: isPaid ? "active" : (isTrialOver ? "past_due" : paddleStatus),
              trialEndsAt: isPaid ? null : trialEndsAt,
              lastPaymentStatus: isPaid ? "paid" : (isTrialOver ? "failed" : "trial"),
            },
          });

          if (isTrial && !isTrialOver) {
            return {
              success: true,
              isPremium: false,
              isTrial: true,
              plan: meta.plan || "pro",
              message: "Free trial active. Watermark-free 300 DPI exports unlock upon paid activation."
            };
          }

          if (isTrialOver && !isPaid) {
            return {
              success: false,
              error: "Your 7-day trial has ended and payment could not be processed. Please activate a paid plan to unlock Pro."
            };
          }

          if (isPaid) {
            return { success: true, isPremium: true, plan: meta.plan || "pro" };
          }
        }
      } catch (e) {
        console.error("Failed to query Paddle API in syncMySubscription:", e);
      }
    }

    // 3. Check existing metadata if no Paddle API or DB match
    const trialEndsAtMs = meta.trialEndsAt ? new Date(meta.trialEndsAt).getTime() : 0;
    const isTrialExpired = trialEndsAtMs > 0 && Date.now() > trialEndsAtMs;

    if (isTrialExpired && meta.hasPaidTransaction !== true) {
      return {
        success: false,
        error: "Your 7-day free trial has expired and payment could not be processed. Please activate your paid plan to unlock watermark-free downloads."
      };
    }

    if ((meta.subscriptionStatus === "trialing" || meta.isTrial) && !isTrialExpired) {
      return {
        success: true,
        isPremium: false,
        isTrial: true,
        plan: meta.plan || "pro",
        message: "Free trial active. Watermark-free 300 DPI exports unlock upon paid activation."
      };
    }

    if (
      meta.subscriptionStatus === "active" &&
      meta.isPremium &&
      (meta.plan === "starter" || meta.plan === "pro" || meta.plan === "agency") &&
      (meta.hasPaidTransaction === true || !meta.trialEndsAt)
    ) {
      return { success: true, isPremium: true, plan: meta.plan };
    }

    return { success: false, error: "No active subscription found. Please complete checkout to unlock Pro." };
  } catch (err: any) {
    console.error("Error syncing subscription:", err);
    return { success: false, error: err.message };
  }
}

// 👥 Team seats -- shared-workspace collaboration for Agency/Tier4/Tier5 plans.
// An invite is a copyable link (no transactional email service is wired up
// in this app), accepted by whoever is signed in with the matching email --
// that's the security boundary in place of email delivery.

const INVITE_TTL_DAYS = 7;

export async function getTeamData() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized." } as const;

  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: { members: true, invites: { where: { status: "pending" } } },
  });

  if (ownedTeam) {
    const premium = await checkPremiumStatus();
    const seatLimit = seatLimitForPlan(premium.plan);
    const memberIds = ownedTeam.members.map((m) => m.userId);
    const client = await clerkClient();
    const members = await Promise.all(
      memberIds.map(async (id) => {
        try {
          const u = await client.users.getUser(id);
          return { userId: id, email: u.emailAddresses[0]?.emailAddress || "", joinedAt: ownedTeam.members.find((m) => m.userId === id)!.joinedAt };
        } catch {
          return { userId: id, email: "(unknown)", joinedAt: new Date() };
        }
      })
    );

    return {
      success: true,
      role: "owner" as const,
      seatLimit,
      seatsUsed: 1 + members.length + ownedTeam.invites.length,
      members,
      pendingInvites: ownedTeam.invites.map((i) => ({ id: i.id, email: i.email, createdAt: i.createdAt, expiresAt: i.expiresAt, token: i.token })),
    };
  }

  const membership = await prisma.teamMember.findUnique({ where: { userId }, include: { team: true } });
  if (membership) {
    const client = await clerkClient();
    let ownerEmail = "(unknown)";
    try {
      const owner = await client.users.getUser(membership.team.ownerId);
      ownerEmail = owner.emailAddresses[0]?.emailAddress || ownerEmail;
    } catch {}
    return { success: true, role: "member" as const, ownerEmail };
  }

  const premium = await checkPremiumStatus();
  return { success: true, role: "solo" as const, seatLimit: seatLimitForPlan(premium.plan), plan: premium.plan };
}

export async function inviteTeamMember(email: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized." };

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Enter a valid email address." };
  }

  // A member of someone else's team can't also own one.
  const existingMembership = await prisma.teamMember.findUnique({ where: { userId } });
  if (existingMembership) {
    return { success: false, error: "You're already part of another team." };
  }

  const premium = await checkPremiumStatus();
  const seatLimit = seatLimitForPlan(premium.plan);
  if (seatLimit <= 1) {
    return { success: false, error: "Team seats aren't included on your current plan. Upgrade to Agency to invite collaborators." };
  }

  const team = await prisma.team.upsert({
    where: { ownerId: userId },
    create: { ownerId: userId },
    update: {},
    include: { members: true, invites: { where: { status: "pending" } } },
  });

  const currentUsage = 1 + team.members.length + team.invites.length;
  if (currentUsage >= seatLimit) {
    return { success: false, error: `You've used all ${seatLimit} seats on your plan.` };
  }

  const user = await currentUser();
  if (user?.emailAddresses.some((e) => e.emailAddress.toLowerCase() === cleanEmail)) {
    return { success: false, error: "You can't invite yourself." };
  }
  if (team.members.some((m) => m.userId === userId)) {
    return { success: false, error: "That person is already on your team." };
  }
  if (team.invites.some((i) => i.email === cleanEmail)) {
    return { success: false, error: "That person already has a pending invite." };
  }

  const token = randomUUID();
  await prisma.teamInvite.create({
    data: {
      teamId: team.id,
      email: cleanEmail,
      token,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/team");
  return { success: true, token };
}

export async function revokeTeamInvite(inviteId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized." };

  const invite = await prisma.teamInvite.findUnique({ where: { id: inviteId }, include: { team: true } });
  if (!invite || invite.team.ownerId !== userId) {
    return { success: false, error: "Invite not found." };
  }

  await prisma.teamInvite.delete({ where: { id: inviteId } });
  revalidatePath("/team");
  return { success: true };
}

export async function removeTeamMember(memberUserId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized." };

  const team = await prisma.team.findUnique({ where: { ownerId: userId } });
  if (!team) return { success: false, error: "You don't own a team." };

  await prisma.teamMember.deleteMany({ where: { teamId: team.id, userId: memberUserId } });
  revalidatePath("/team");
  return { success: true };
}

export async function leaveTeam() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized." };

  await prisma.teamMember.deleteMany({ where: { userId } });
  revalidatePath("/team");
  return { success: true };
}

export async function acceptTeamInvite(token: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Please sign in first." };

  const invite = await prisma.teamInvite.findUnique({ where: { token } });
  if (!invite || invite.status !== "pending") {
    return { success: false, error: "This invite is no longer valid." };
  }
  if (invite.expiresAt < new Date()) {
    return { success: false, error: "This invite has expired." };
  }

  const user = await currentUser();
  const signedInEmail = user?.emailAddresses.find((e) => e.emailAddress.toLowerCase() === invite.email)?.emailAddress;
  if (!signedInEmail) {
    return { success: false, error: `This invite was sent to ${invite.email}. Sign in with that email to accept it.` };
  }

  if (invite.teamId && (await prisma.team.findUnique({ where: { id: invite.teamId } }))?.ownerId === userId) {
    return { success: false, error: "You can't join your own team." };
  }

  const existingMembership = await prisma.teamMember.findUnique({ where: { userId } });
  if (existingMembership) {
    return { success: false, error: "You're already part of a team. Leave it first to accept a new invite." };
  }

  await prisma.$transaction([
    prisma.teamMember.create({ data: { teamId: invite.teamId, userId } }),
    prisma.teamInvite.update({ where: { id: invite.id }, data: { status: "accepted" } }),
  ]);

  revalidatePath("/team");
  return { success: true };
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

// One row per (user, preset) -- a signed-in user has independent Coloring
// Book progress per template, unlike the single CoverProject per user above.
// Mirrors the same "localStorage as instant cache, cloud as durable copy"
// split: this replaces nothing client-side, it just gives signed-in users a
// copy that survives a cleared cache or a different device/browser.
export async function saveColoringProject(presetId: string, data: unknown) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }
  if (!presetId) {
    return { success: false, error: "missing presetId" };
  }

  try {
    await prisma.coloringProject.upsert({
      where: { userId_presetId: { userId, presetId } },
      update: { data: data as any },
      create: { userId, presetId, data: data as any },
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving coloring project:", error);
    return { success: false, error: "Failed to save coloring project" };
  }
}

export async function loadColoringProject(presetId: string) {
  const { userId } = await auth();
  if (!userId || !presetId) {
    return { success: false, data: null };
  }

  try {
    const project = await prisma.coloringProject.findUnique({
      where: { userId_presetId: { userId, presetId } },
    });
    return { success: true, data: project?.data ?? null, updatedAt: project?.updatedAt ?? null };
  } catch (error) {
    console.error("Error loading coloring project:", error);
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

export async function generateNextChapter(bookId: string, outline: string, title: string) {
  if (!AI_FEATURES_ENABLED) {
    throw new Error("AI chapter writing is disabled. Please use KDPage Studio tools.");
  }
  return { success: false, error: "AI features disabled." };
}

export async function generateBulkKdpListings(bookConcepts: string[]): Promise<{ success: boolean; results?: KdpListingResult[]; error?: string }> {
  return { success: false, error: "The Bulk KDP Listing Generator is currently disabled." };
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
    const workspaceUserIds = await getWorkspaceUserIds(userId);
    const notebookDelegate = (prisma as any).notebook;
    let entry: any = null;

    if (notebookDelegate?.findFirst) {
      entry = await notebookDelegate.findFirst({
        where: { id, userId: { in: workspaceUserIds } },
      });
    } else {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "notebooks" WHERE "id" = $1 AND "userId" = ANY($2)`,
        id,
        workspaceUserIds
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
    const workspaceUserIds = await getWorkspaceUserIds(userId);
    const notebookDelegate = (prisma as any).notebook;
    if (notebookDelegate?.deleteMany) {
      // deleteMany (not delete-by-id) so ownership/workspace membership is
      // enforced as part of the query -- the Prisma-delegate path previously
      // used delete({ where: { id } }) with no owner check at all, which let
      // any signed-in user delete any entry by id via this branch (the raw
      // SQL fallback below was the only path that ever checked userId).
      await notebookDelegate.deleteMany({
        where: { id, userId: { in: workspaceUserIds } },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "notebooks" WHERE "id" = $1 AND "userId" = ANY($2)`,
        id,
        workspaceUserIds
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

/**
 * Saves a newsletter/lead subscriber email address.
 * Validates input email address and supports lead attribution tracking.
 */
export async function saveLeadEmail(email: string, source: string = "website"): Promise<{ success: boolean; message: string }> {
  try {
    if (!email || typeof email !== "string") {
      return { success: false, message: "Please enter a valid email address." };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    try {
      const db = prisma as any;
      if (db.lead) {
        await db.lead.upsert({
          where: { email: trimmedEmail },
          update: { source },
          create: { email: trimmedEmail, source },
        });
      } else {
        const existing = await db.user.findFirst({ where: { email: trimmedEmail } });
        if (!existing) {
          await db.user.create({
            data: {
              clerkId: `lead_${randomUUID()}`,
              email: trimmedEmail,
              appsumoCode: `lead:${source}`,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Save lead email DB warning:", dbErr);
    }

    return {
      success: true,
      message: "Thank you for subscribing! We'll notify you about new features & updates.",
    };
  } catch (err) {
    console.error("saveLeadEmail failed:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save email address.",
    };
  }
}

// Self-serve "Manage Billing" -- opens Paddle's hosted Customer Portal so a
// paying user can update payment details or cancel without emailing support.
// Only applies to regular Paddle subscribers (Starter/Pro/Agency checkout);
// AppSumo LTD redeemers have no recurring billing to manage, and free users
// have nothing to cancel. Requires PADDLE_API_KEY (server-side, distinct from
// the NEXT_PUBLIC_PADDLE_CLIENT_TOKEN used for checkout) -- returns
// needsSupportFallback: true whenever a real portal link can't be produced
// (no key configured, no Paddle customer on this account, or the Paddle API
// call itself fails) so the UI always has something useful to do instead of
// a dead end.
export async function getBillingPortalUrl(): Promise<
  { success: true; url: string } | { success: false; needsSupportFallback: true }
> {
  const { userId } = await auth();
  if (!userId) return { success: false, needsSupportFallback: true };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const paddleCustomerId = (user.publicMetadata as any)?.paddleCustomerId as string | undefined;

  if (!paddleCustomerId) {
    // No Paddle subscription on this account (free tier or AppSumo-only) --
    // nothing to open a billing portal for.
    return { success: false, needsSupportFallback: true };
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    console.error(
      "getBillingPortalUrl: PADDLE_API_KEY is not set -- falling back to support email. " +
      "Set it in Vercel (Paddle dashboard -> Developer Tools -> Authentication) to enable real self-serve billing management."
    );
    return { success: false, needsSupportFallback: true };
  }

  const apiBase =
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";

  try {
    const res = await fetch(`${apiBase}/customer-portal-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customer_id: paddleCustomerId }),
    });

    if (!res.ok) {
      console.error("getBillingPortalUrl: Paddle API error", res.status, await res.text().catch(() => ""));
      return { success: false, needsSupportFallback: true };
    }

    const json = await res.json();
    const url = json?.data?.urls?.general?.overview;
    if (!url) return { success: false, needsSupportFallback: true };

    return { success: true, url };
  } catch (err) {
    console.error("getBillingPortalUrl: failed to reach Paddle API", err);
    return { success: false, needsSupportFallback: true };
  }
}


