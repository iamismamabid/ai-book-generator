"use client";

import { checkPremiumStatus as serverCheckPremiumStatus } from "@/app/actions";

export interface SafePremiumStatus {
  checked: boolean;
  isPremium: boolean;
  plan: string;
  isLifetimeDeal?: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  daysRemaining?: number;
  trialDownloadsRemaining?: number;
  trialDownloadsLimit?: number;
  limits?: any;
  reason?: string;
  [key: string]: any;
}

/**
 * Universal client-side premium status retriever.
 * Works seamlessly even when Clerk third-party cookies are partitioned or blocked
 * on custom domains (e.g. Chrome privacy sandbox on kdpage.com).
 */
export async function getClientSafePremiumStatus(
  explicitTokenOrUserId?: string,
  fallbackUserMetadata?: any
): Promise<SafePremiumStatus> {
  let token = explicitTokenOrUserId;
  let clientUser: any = null;

  if (typeof window !== "undefined") {
    try {
      const clerk = (window as any).Clerk;
      if (clerk) {
        clientUser = clerk.user;
        if (!token) {
          if (clerk.session) {
            token = await clerk.session.getToken();
          }
          if (!token && clerk.user?.id) {
            token = clerk.user.id;
          }
        }
      }
    } catch (e) {
      console.warn("Clerk client inspection warning:", e);
    }
  }

  // Combine metadata from explicit caller, Clerk window object, and local storage cache
  const clientMeta = (fallbackUserMetadata || clientUser?.publicMetadata || {}) as any;

  let cachedPlan: any = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("kdpage_cached_plan");
      if (raw) {
        cachedPlan = JSON.parse(raw);
      }
    } catch {}
  }

  const clientIsPaid = Boolean(
    clientMeta.isPremium === true ||
    clientMeta.hasPaidTransaction === true ||
    ["pro", "agency", "starter"].includes(clientMeta.plan) ||
    cachedPlan?.isPremium === true
  );
  const clientPlan = clientMeta.plan || cachedPlan?.plan || (clientIsPaid ? "agency" : "free");

  try {
    const res = await serverCheckPremiumStatus(token || undefined);
    if (res?.isPremium) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("kdpage_cached_plan", JSON.stringify({ isPremium: true, plan: res.plan, ts: Date.now() }));
        } catch {}
      }
      return res as SafePremiumStatus;
    }

    // If server action returned unauthorized/free/failed due to cookie partitioning
    // but the client has confirmed Clerk publicMetadata with active plan:
    if (clientIsPaid) {
      return {
        checked: true,
        isPremium: true,
        plan: clientPlan,
        isLifetimeDeal: true,
        limits: clientPlan === "agency"
          ? { tier: 2, brands: 25, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 }
          : { tier: 1, brands: 10, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 },
      };
    }

    return (res as SafePremiumStatus) || { checked: true, isPremium: false, plan: "free" };
  } catch (err) {
    console.error("Failed to query checkPremiumStatus on server:", err);
    if (clientIsPaid) {
      return {
        checked: true,
        isPremium: true,
        plan: clientPlan,
        isLifetimeDeal: true,
        limits: clientPlan === "agency"
          ? { tier: 2, brands: 25, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 }
          : { tier: 1, brands: 10, puzzles: ["easy", "medium", "hard"], maxBookCount: 1000 },
      };
    }
    return { checked: true, isPremium: false, plan: "free", reason: "status_check_failed" };
  }
}
