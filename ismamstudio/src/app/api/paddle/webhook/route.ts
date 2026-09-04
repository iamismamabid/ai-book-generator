import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import crypto from "crypto";

// Helper to clean environment variables
const cleanEnv = (val: string | undefined) => {
  if (!val) return "";
  return val.replace(/['"]/g, "").trim();
};

function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const parts: Record<string, string> = {};
  for (const seg of signatureHeader.split(";")) {
    const [key, value] = seg.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  const { ts, h1 } = parts;
  if (!ts || !h1) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(h1, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookSecret = cleanEnv(process.env.PADDLE_WEBHOOK_SECRET);

    if (webhookSecret) {
      const signatureHeader = request.headers.get("paddle-signature");
      if (!verifyPaddleSignature(rawBody, signatureHeader, webhookSecret)) {
        console.error("Paddle Webhook: signature verification failed, rejecting request");
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("Paddle Webhook: PADDLE_WEBHOOK_SECRET is not set, proceeding in permissive mode.");
    }

    const body = JSON.parse(rawBody);
    console.log("Paddle Webhook received payload event_type:", body.event_type);

    const eventType = body.event_type;
    const data = body.data;

    if (!data) {
      return NextResponse.json({ success: false, error: "Missing data payload" }, { status: 400 });
    }

    const clerk = await clerkClient();

    // 1. Resolve Clerk User ID: from custom_data or customer email lookup
    let userId = data.custom_data?.userId || data.custom_data?.user_id;

    if (!userId) {
      const customerEmail = data.customer?.email || data.details?.customer?.email || data.billing_details?.email;
      if (customerEmail) {
        try {
          const userList = await clerk.users.getUserList({ emailAddress: [customerEmail] });
          if (userList.data && userList.data.length > 0) {
            userId = userList.data[0].id;
            console.log(`Resolved Clerk User ${userId} via customer email ${customerEmail}`);
          }
        } catch (e) {
          console.error("Failed to query Clerk users by email:", e);
        }
      }
    }

    if (!userId) {
      console.warn("Paddle Webhook: No Clerk userId or matching customer email found in payload");
      return NextResponse.json({ success: true, message: "Skipped: No userId or email resolved" }, { status: 200 });
    }

    const posthog = getPostHogClient();

    // 2. Map Price ID to Plan Tier
    const priceId = data.items?.[0]?.price?.id || data.price_id || data.details?.line_items?.[0]?.price?.id;
    
    let plan = "pro"; // Default paid tier is pro
    if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY) || "pri_01kwbgsarn24e1rn46dhadfcnx") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL) || "pri_01kwbh8envq2yez7j7hsd1y679") ||
      (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_DIRECT_MONTHLY) && priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_DIRECT_MONTHLY))
    ) {
      plan = "starter";
    } else if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY) || "pri_01kwbgyfhhq6h86av5qycv52fs") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL) || "pri_01kwbh4d3njs6ywbv9qr1wae79") ||
      (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_DIRECT_MONTHLY) && priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_DIRECT_MONTHLY))
    ) {
      plan = "pro";
    } else if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY) || "pri_01kwbwhfxnebsj6nds4m65jjrq") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL) || "pri_01kwbwkrk1w7tnc318ga4d6xt6") ||
      (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_DIRECT_MONTHLY) && priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_DIRECT_MONTHLY))
    ) {
      plan = "agency";
    }

    // 3. Handle Payment Declines, Past Due, Cancellations, or Expirations FIRST
    if (
      eventType === "transaction.payment_failed" ||
      eventType === "subscription.past_due" ||
      eventType === "subscription.canceled" ||
      eventType === "subscription.expired" ||
      eventType === "subscription.paused" ||
      (eventType === "subscription.updated" && (data.status === "past_due" || data.status === "canceled" || data.status === "paused"))
    ) {
      const declineReason = data.payments?.[0]?.error_code || data.payments?.[0]?.status || "payment_failed";
      console.log(`Paddle Webhook: Payment failed / subscription past_due for Clerk User ${userId} (event: ${eventType}, status: ${data.status}, reason: ${declineReason})`);

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPremium: false,
          isTrial: false,
          trialExpired: true,
          plan: "free",
          subscriptionStatus: data.status || "past_due",
          hasPaidTransaction: false,
          lastPaymentStatus: "failed",
          paymentFailedAt: new Date().toISOString(),
        },
      });

      posthog.capture({
        distinctId: userId,
        event: "server_paddle_payment_failed",
        properties: { plan, priceId, eventType, status: data.status, declineReason },
      });
    }
    // 4. Handle Confirmed Paid Transactions (Genuine payment collected from card)
    else if (
      eventType === "transaction.paid" ||
      (eventType === "transaction.completed" && (data.status === "paid" || data.payments?.[0]?.status === "captured"))
    ) {
      const txnTotal = Number(data.details?.totals?.total ?? data.payments?.[0]?.amount ?? 0);
      const isGenuinePayment = txnTotal > 0;

      if (isGenuinePayment) {
        console.log(`Paddle Webhook: Confirmed PAID transaction for Clerk User ${userId} (amount: ${txnTotal})`);

        const customerId = data.customer_id;
        const subscriptionId = data.subscription_id || data.id;

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPremium: true,
            hasPaidTransaction: true,
            isTrial: false,
            trialExpired: false,
            plan: plan,
            subscriptionStatus: "active",
            lastPaymentStatus: "paid",
            paidAt: new Date().toISOString(),
            trialEndsAt: null,
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
          },
        });

        posthog.capture({
          distinctId: userId,
          event: "server_paddle_subscription_activated",
          properties: { plan, priceId, txnTotal, customerId, subscriptionId },
        });
      } else {
        // $0 Trial Checkout transaction
        console.log(`Paddle Webhook: $0 trial transaction completed for Clerk User ${userId}`);
        const customerId = data.customer_id;
        const subscriptionId = data.subscription_id || data.id;
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPremium: false,
            isTrial: true,
            hasPaidTransaction: false,
            trialExpired: false,
            plan: plan,
            subscriptionStatus: "trialing",
            trialEndsAt,
            lastPaymentStatus: "trial",
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
          },
        });

        posthog.capture({
          distinctId: userId,
          event: "server_paddle_trial_started",
          properties: { plan, priceId, customerId, subscriptionId },
        });
      }
    }
    // 5. Handle Trial Subscription Creation / Trial State
    else if (
      eventType === "subscription.trialing" ||
      (eventType === "subscription.created" && (data.status === "trialing" || Boolean(data.trial_billing_period)))
    ) {
      const customerId = data.customer_id;
      const subscriptionId = data.id || data.subscription_id;
      const trialEndsAt =
        data.trial_billing_period?.ends_at ||
        data.current_billing_period?.ends_at ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      console.log(`Paddle Webhook: Trial subscription created for Clerk User ${userId}`);

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPremium: false,
          isTrial: true,
          hasPaidTransaction: false,
          trialExpired: false,
          plan: plan,
          subscriptionStatus: "trialing",
          trialEndsAt,
          lastPaymentStatus: "trial",
          ...(customerId ? { paddleCustomerId: customerId } : {}),
          ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
        },
      });

      posthog.capture({
        distinctId: userId,
        event: "server_paddle_trial_started",
        properties: { plan, priceId, customerId, subscriptionId },
      });
    }
    // 6. Handle Subscription Lifecycle Updates (subscription.updated / subscription.activated / subscription.created)
    else if (
      eventType === "subscription.updated" ||
      eventType === "subscription.activated" ||
      eventType === "subscription.created"
    ) {
      const customerId = data.customer_id;
      const subscriptionId = data.id || data.subscription_id;

      // 🔍 Fetch user's current metadata to verify whether payment was already verified
      let currentMetadata: any = {};
      try {
        const u = await clerk.users.getUser(userId);
        currentMetadata = u.publicMetadata || {};
      } catch (err) {
        console.error("Paddle Webhook: error fetching Clerk user for subscription update:", err);
      }

      const hasPaid = currentMetadata.hasPaidTransaction === true;
      const trialEndsAtMs = currentMetadata.trialEndsAt ? new Date(currentMetadata.trialEndsAt).getTime() : 0;
      const wasTrialUser = trialEndsAtMs > 0 || currentMetadata.isTrial === true;
      const trialHasPassed = trialEndsAtMs > 0 && Date.now() > trialEndsAtMs;

      if (data.status === "trialing") {
        const trialEndsAt =
          data.trial_billing_period?.ends_at ||
          data.current_billing_period?.ends_at ||
          currentMetadata.trialEndsAt ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            isPremium: false,
            isTrial: true,
            hasPaidTransaction: false,
            plan: plan,
            subscriptionStatus: "trialing",
            trialEndsAt,
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
          },
        });
      } else if (wasTrialUser && !hasPaid) {
        // 🛑 CRITICAL SECURITY GUARD:
        // User was on a trial and no transaction.paid has ever been recorded.
        // Even if Paddle sets data.status === "active" during the renewal/dunning attempt,
        // we MUST NOT grant isPremium: true until an actual transaction.paid arrives!
        console.warn(`Paddle Webhook: subscription.updated with status '${data.status}' for unpaid trial user ${userId}. Retaining isPremium: false.`);

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            isPremium: false,
            isTrial: !trialHasPassed,
            trialExpired: trialHasPassed,
            subscriptionStatus: trialHasPassed ? "past_due" : (data.status || "trialing"),
            hasPaidTransaction: false,
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
          },
        });
      } else {
        // Direct non-trial subscription or user who already completed a paid transaction
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            isPremium: hasPaid,
            isTrial: false,
            plan: plan,
            subscriptionStatus: data.status || "active",
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
          },
        });
      }
    }

    await posthog.flush();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Paddle Webhook handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
