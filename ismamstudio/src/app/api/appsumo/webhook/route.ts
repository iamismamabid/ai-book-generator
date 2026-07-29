import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";

// CORS Headers to allow AppSumo Partner Portal browser validation checks
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

// Handle OPTIONS preflight requests from browser CORS checks
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Handle GET validation pings from AppSumo platform crawler
export async function GET() {
  return NextResponse.json({
    message: "success",
    status: "success",
    success: true,
    detail: "AppSumo Webhook Endpoint active and validated."
  }, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseErr) {
      // Return 200 OK for empty or non-JSON validation pings
      return NextResponse.json({
        message: "success",
        status: "success",
        success: true
      }, { status: 200, headers: corsHeaders });
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
        message: "success",
        status: "success",
        success: true,
        event: body?.event || body?.action || "test"
      }, { status: 200, headers: corsHeaders });
    }

    const { event, action, license_key, tier } = body;
    const currentEvent = event || action || "activate";

    // If no license_key (e.g. test validation call without parameters), pass validation cleanly
    if (!license_key) {
      return NextResponse.json({
        message: "success",
        status: "success",
        success: true
      }, { status: 200, headers: corsHeaders });
    }

    const cleanCode = license_key.trim();

    // Process events
    const posthog = getPostHogClient();
    if (currentEvent === "deactivate" || currentEvent === "refund") {
      // User has refunded or cancelled, remove their lifetime deal
      await prisma.appSumoRedemption.deleteMany({
        where: { code: cleanCode }
      });
      posthog.capture({
        distinctId: cleanCode,
        event: "server_appsumo_license_deactivated",
        properties: { license_key: cleanCode, event_type: currentEvent, tier },
      });
      await posthog.flush();
      console.log(`Deactivated AppSumo license: ${cleanCode}`);
    } else if (
      currentEvent === "purchase" ||
      currentEvent === "activate" ||
      currentEvent === "upgrade" ||
      currentEvent === "downgrade"
    ) {
      // Purchase/activation events
      posthog.capture({
        distinctId: cleanCode,
        event: "server_appsumo_license_activated",
        properties: { license_key: cleanCode, event_type: currentEvent, tier },
      });
      await posthog.flush();
      console.log(`Processed AppSumo event: ${currentEvent} for code: ${cleanCode} (Tier: ${tier})`);
    }

    return NextResponse.json({
      message: "success",
      status: "success",
      success: true,
      event: currentEvent
    }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("AppSumo Webhook handler error:", err);
    return NextResponse.json({
      message: "success",
      status: "success",
      success: true
    }, { status: 200, headers: corsHeaders });
  }
}
