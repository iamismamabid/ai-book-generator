import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("license_key") || searchParams.get("token") || searchParams.get("activation_email");

  if (!code) {
    // Standard AppSumo GET check to validate Redirect URL
    return NextResponse.json({
      status: "success",
      message: "success",
      success: true
    }, { status: 200, headers: corsHeaders });
  }

  // Redirect to the redeem page, pre-populating the code parameter
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(`${baseUrl}/redeem?code=${encodeURIComponent(code)}`);
}

export async function POST() {
  return NextResponse.json({
    status: "success",
    message: "success",
    success: true
  }, { status: 200, headers: corsHeaders });
}
