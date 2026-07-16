import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("AppSumo Webhook received payload:", JSON.stringify(body));

    // Handle AppSumo Portal integration test validation check
    if (body.test || body.event === "test" || body.action === "test") {
      return NextResponse.json({
        event: body.event || "test",
        success: true,
        message: "Webhook URL test successful."
      }, { status: 200 });
    }

    const { event, license_key, tier } = body;

    if (!license_key) {
      return NextResponse.json({
        success: false,
        error: "Missing license_key parameter"
      }, { status: 400 });
    }

    const cleanCode = license_key.trim();

    // Process events
    const posthog = getPostHogClient();
    if (event === "deactivate" || event === "refund") {
      // User has refunded or cancelled, remove their lifetime deal
      await prisma.appSumoRedemption.deleteMany({
        where: { code: cleanCode }
      });
      posthog.capture({
        distinctId: cleanCode,
        event: "server_appsumo_license_deactivated",
        properties: { license_key: cleanCode, event_type: event, tier },
      });
      await posthog.flush();
      console.log(`Deactivated AppSumo license: ${cleanCode}`);
    } else if (event === "purchase" || event === "activate" || event === "upgrade" || event === "downgrade") {
      // Purchase/activation events
      posthog.capture({
        distinctId: cleanCode,
        event: "server_appsumo_license_activated",
        properties: { license_key: cleanCode, event_type: event, tier },
      });
      await posthog.flush();
      console.log(`Processed AppSumo event: ${event} for code: ${cleanCode} (Tier: ${tier})`);
    }

    return NextResponse.json({
      event: event || "purchase",
      success: true
    }, { status: 200 });
  } catch (err: any) {
    console.error("AppSumo Webhook handler error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}
