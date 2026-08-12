import { auth } from "@clerk/nextjs/server";

// AI book outline generation has been permanently removed.
// This route previously used Groq (llama-3.3-70b-versatile) to stream
// book chapter outlines. It is disabled to comply with AppSumo Radar's
// no-user-facing-AI policy. Return 410 Gone so any stale client-side
// callers receive a clear, cacheable signal rather than a 404.

export const dynamic = "force-dynamic";

export async function POST(_req: Request) {
  // Keep auth check so we don't leak info about endpoint existence
  // to unauthenticated callers.
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(
    "The AI book outline generator has been removed. Please use the Studio puzzle generators instead.",
    { status: 410 }
  );
}
