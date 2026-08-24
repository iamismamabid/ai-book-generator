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

    // 3. Handle activation events (subscriptions or completed 1-dollar trial transactions)
    if (
      eventType === "subscription.created" ||
      eventType === "subscription.updated" ||
      eventType === "subscription.activated" ||
      eventType === "subscription.trialing" ||
      eventType === "transaction.completed" ||
      eventType === "transaction.paid"
    ) {
      const status = data.status === "trialing" || eventType === "subscription.trialing" ? "trialing" : "active";
      console.log(`Upgrading Clerk User ${userId} to plan ${plan} (status: ${status})`);

      const customerId = data.customer_id;
      const subscriptionId = data.id || data.subscription_id;
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
    } else if (
      eventType === "subscription.canceled" ||
      eventType === "subscription.expired" ||
      eventType === "subscription.past_due"
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
