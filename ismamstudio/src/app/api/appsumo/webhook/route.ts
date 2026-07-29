import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";

// Handle GET validation pings from AppSumo platform crawler
export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    message: "AppSumo Webhook Endpoint active and validated."
  }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseErr) {
      // Return 200 OK for empty or non-JSON validation pings
      return NextResponse.json({
        success: true,
        message: "AppSumo Webhook connection validated."
      }, { status: 200 });
    }

    console.log("AppSumo Webhook received payload:", JSON.stringify(body));

    // Handle AppSumo Portal integration test validation check & ping events
    if (
      !body ||
      Object.keys(body).length === 0 ||
      body.test ||
      body.event === "test" ||
      body.action === "test" ||
      body.ping ||
      body.type === "ping"
    ) {
      return NextResponse.json({
        event: body?.event || "test",
        success: true,
        message: "Webhook URL test successful."
      }, { status: 200 });
    }

    const { event, license_key, tier } = body;

    // If no license_key (e.g. test validation call without parameters), pass validation cleanly
    if (!license_key) {
      return NextResponse.json({
        success: true,
        message: "Webhook URL validated (No license_key provided in test payload)."
      }, { status: 200 });
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
      success: true,
      message: "AppSumo Webhook endpoint active."
    }, { status: 200 });
  }
}
