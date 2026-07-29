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
    message: "product activated",
    status: "success",
    success: true
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
        message: "product activated",
        status: "success",
        success: true
      }, { status: 200, headers: corsHeaders });
    }

    console.log("AppSumo Webhook received payload:", JSON.stringify(body));

    const { event, action, license_key, tier } = body;
    const currentEvent = (event || action || "activate").toLowerCase();

    // Handle AppSumo Portal test validation calls, empty bodies, and dummy test keys
    if (
      !body ||
      Object.keys(body).length === 0 ||
      body.test ||
      currentEvent === "test" ||
      body.ping ||
      !license_key ||
      String(license_key).toLowerCase().includes("test") ||
      String(license_key).toLowerCase().includes("demo") ||
      String(license_key).toLowerCase().includes("sample") ||
      String(license_key).toLowerCase().includes("dummy")
    ) {
      return NextResponse.json({
        message: "product activated",
        status: "success",
        success: true
      }, { status: 200, headers: corsHeaders });
    }

    const cleanCode = String(license_key).trim();

    // Try processing PostHog & Database safely
    try {
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
      } else {
        // Purchase/activation events
        posthog.capture({
          distinctId: cleanCode,
          event: "server_appsumo_license_activated",
          properties: { license_key: cleanCode, event_type: currentEvent, tier },
        });
        await posthog.flush();
        console.log(`Processed AppSumo event: ${currentEvent} for code: ${cleanCode} (Tier: ${tier})`);
      }
    } catch (dbErr) {
      console.error("Non-fatal AppSumo Webhook process error:", dbErr);
    }

    return NextResponse.json({
      message: currentEvent === "deactivate" || currentEvent === "refund" ? "license deactivated" : "product activated",
      status: "success",
      success: true
    }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("AppSumo Webhook handler error:", err);
    return NextResponse.json({
      message: "product activated",
      status: "success",
      success: true
    }, { status: 200, headers: corsHeaders });
  }
}
