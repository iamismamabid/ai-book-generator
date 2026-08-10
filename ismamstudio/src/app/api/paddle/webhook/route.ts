import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import crypto from "crypto";

// Helper to clean environment variables
const cleanEnv = (val: string | undefined) => {
  if (!val) return "";
  return val.replace(/['"]/g, "").trim();
};

// Paddle Billing signs webhooks as `Paddle-Signature: ts=<unix>;h1=<hex hmac>`,
// computed over `${ts}:${rawBody}` with the notification destination's secret
// key (Paddle dashboard -> Developer Tools -> Notifications). Without this
// check, anyone who learns/guesses a Clerk userId can POST a forged
// subscription.created payload here and grant themselves premium for free --
// there is no other gate on this endpoint. Verification only activates once
// PADDLE_WEBHOOK_SECRET is set so it can ship without breaking currently
// working (unverified) webhook processing.
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
      // No secret configured yet -- log loudly so this doesn't stay silent
      // in production, but don't break currently-working billing by
      // rejecting every request until it's set.
      console.error(
        "SECURITY WARNING: PADDLE_WEBHOOK_SECRET is not set. Paddle webhook signatures are NOT being verified, " +
        "meaning anyone can forge a premium-grant request. Set PADDLE_WEBHOOK_SECRET from the Paddle dashboard immediately."
      );
    }

    const body = JSON.parse(rawBody);
    console.log("Paddle Webhook received payload type:", body.event_type);

    const eventType = body.event_type;
    const data = body.data;

    if (!data) {
      return NextResponse.json({ success: false, error: "Missing data payload" }, { status: 400 });
    }

    const userId = data.custom_data?.userId;
    if (!userId) {
      console.warn("Paddle Webhook received payment without Clerk userId in custom_data");
      return NextResponse.json({ success: true, message: "Skipped: No userId in custom data" }, { status: 200 });
    }

    const posthog = getPostHogClient();

    // Map Price ID to Plan Tier
    const priceId = data.items?.[0]?.price?.id || data.price_id;
    
    let plan = "free";
    if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY) || "pri_01kwbgsarn24e1rn46dhadfcnx") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL) || "pri_01kwbh8envq2yez7j7hsd1y679")
    ) {
      plan = "starter";
    } else if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY) || "pri_01kwbgyfhhq6h86av5qycv52fs") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL) || "pri_01kwbh4d3njs6ywbv9qr1wae79")
    ) {
      plan = "pro";
    } else if (
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY) || "pri_01kwbwhfxnebsj6nds4m65jjrq") ||
      priceId === (cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL) || "pri_01kwbwkrk1w7tnc318ga4d6xt6")
    ) {
      plan = "agency";
    }

    const clerk = await clerkClient();

    if (
      eventType === "subscription.created" ||
      eventType === "subscription.updated" ||
      eventType === "subscription.activated"
    ) {
      const status = data.status;
      if (status === "active" || status === "trialing") {
        console.log(`Upgrading Clerk User ${userId} to plan ${plan} (status: ${status})`);

        const customerId = data.customer_id;
        const subscriptionId = data.id;
        const trialEndsAt = status === "trialing"
          ? (data.current_billing_period?.ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          : null;

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPremium: true,
            plan: plan,
            subscriptionStatus: status,
            ...(customerId ? { paddleCustomerId: customerId } : {}),
            ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
            ...(trialEndsAt ? { trialEndsAt } : { trialEndsAt: null }),
          },
        });

        posthog.capture({
          distinctId: userId,
          event: "server_paddle_subscription_activated",
          properties: { plan, priceId, status, customerId, subscriptionId },
        });
      } else {
        console.log(`Subscription status is ${status} for user ${userId}, not upgrading.`);
      }
    } else if (
      eventType === "subscription.canceled" ||
      eventType === "subscription.expired"
    ) {
      console.log(`Downgrading Clerk User ${userId} due to cancel/expiry`);

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPremium: false,
          plan: "free",
          subscriptionStatus: "inactive",
        },
      });

      posthog.capture({
        distinctId: userId,
        event: "server_paddle_subscription_deactivated",
        properties: { priceId },
      });
    }

    await posthog.flush();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Paddle Webhook handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
