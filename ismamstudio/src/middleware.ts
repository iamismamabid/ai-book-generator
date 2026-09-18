import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerkKeys =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      const { userId } = await auth();
      const res = NextResponse.next();
      if (userId) {
        res.cookies.set("kdpage_authed", "1", { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
      } else {
        res.cookies.set("kdpage_authed", "0", { path: "/", httpOnly: false, sameSite: "lax", maxAge: 0 });
      }
      return res;
    })
  : () => NextResponse.next();

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals, PostHog analytics ingest, and all static files, unless found in search params
    '/((?!_next|ingest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
