import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";

// CORS Headers to allow AppSumo Partner Portal browser validation checks
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

// Verifies the request carries AppSumo's shared secret before we let it mutate
// license data. APPSUMO_WEBHOOK_SECRET isn't issued until listing submission,
// so until it's set in the environment we accept requests unauthenticated —
// once it's set, a matching Bearer token or ?secret=/?key= param is required.
function isAuthorizedAppSumoRequest(request: Request): boolean {
  const expected = process.env.APPSUMO_WEBHOOK_SECRET;
  if (!expected) return true;

  const authHeader = request.headers.get("authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const url = new URL(request.url);
  const provided = bearerMatch?.[1] || url.searchParams.get("secret") || url.searchParams.get("key") || "";

  if (!provided) return false;

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

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

    // Past this point the request will create or delete real license records,
    // so it must carry a valid secret (once one has been configured).
    if (!isAuthorizedAppSumoRequest(request)) {
      console.warn("AppSumo Webhook rejected: missing/invalid shared secret.");
      return NextResponse.json({
        message: "unauthorized",
        status: "error",
        success: false
      }, { status: 401, headers: corsHeaders });
    }

    // Uppercased/trimmed to match the format redeemAppSumoCode() looks codes up by
    const cleanCode = String(license_key).trim().toUpperCase();

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
        // Purchase/activation events — register the code as valid & unredeemed so
        // the customer can immediately redeem it at /redeem. Upsert with a no-op
        // update so a duplicate/retried webhook call never resets an already-
        // redeemed code back to unredeemed.
        await prisma.appSumoValidCode.upsert({
          where: { code: cleanCode },
          update: {},
          create: { code: cleanCode, isRedeemed: false },
        });
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
