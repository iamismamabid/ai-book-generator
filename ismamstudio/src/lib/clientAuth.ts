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
export async function getClientSafePremiumStatus(explicitTokenOrUserId?: string): Promise<SafePremiumStatus> {
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

  // Fast-check client metadata from Clerk user object in browser
  const clientMeta = (clientUser?.publicMetadata || {}) as any;
  const clientIsPaid = Boolean(
    clientMeta.isPremium === true ||
    clientMeta.hasPaidTransaction === true ||
    ["pro", "agency", "starter"].includes(clientMeta.plan)
  );
  const clientPlan = clientMeta.plan || (clientIsPaid ? "agency" : "free");

  try {
    const res = await serverCheckPremiumStatus(token || undefined);
    if (res?.isPremium) {
      return res as SafePremiumStatus;
    }

    // If server action returned unauthorized/free due to cookie partitioning
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
      };
    }
    return { checked: true, isPremium: false, plan: "free", reason: "status_check_failed" };
  }
}
