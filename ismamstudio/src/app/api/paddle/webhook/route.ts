import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";

// Helper to clean environment variables
const cleanEnv = (val: string | undefined) => {
  if (!val) return "";
  return val.replace(/['"]/g, "").trim();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY) ||
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL)
    ) {
      plan = "starter";
    } else if (
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY) ||
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL)
    ) {
      plan = "pro";
    } else if (
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY) ||
      priceId === cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL)
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
