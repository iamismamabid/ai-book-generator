import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("license_key") || searchParams.get("token") || searchParams.get("activation_email");

  if (!code) {
    // Standard AppSumo GET check to validate Redirect URL
    return NextResponse.json({
      status: "ok",
      success: true,
      message: "AppSumo OAuth Redirect Endpoint active and validated."
    }, { status: 200 });
  }

  // Redirect to the redeem page, pre-populating the code parameter
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(`${baseUrl}/redeem?code=${encodeURIComponent(code)}`);
}

export async function POST() {
  return NextResponse.json({
    status: "ok",
    success: true,
    message: "AppSumo OAuth Redirect Endpoint active and validated."
  }, { status: 200 });
}
