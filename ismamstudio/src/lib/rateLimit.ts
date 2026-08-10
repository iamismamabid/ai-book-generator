import { clerkClient } from "@clerk/nextjs/server";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// Sliding-window rate limiter backed by each user's Clerk private metadata,
// so abuse-prevention doesn't need its own database table/migration. Not
// perfectly atomic under true concurrent bursts from the same user (a rare
// race could let one extra request slip through), which is an acceptable
// tradeoff here since this guards against scripted abuse, not hard billing
// caps -- the real per-plan quotas (chapters/outlines) are still enforced
// separately in the database.
export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const rateLimits = ((user.privateMetadata as any)?.rateLimits as Record<string, number[]>) || {};
  const now = Date.now();
  const windowStart = now - windowMs;
  const recentHits = (rateLimits[action] || []).filter((t) => t > windowStart);

  if (recentHits.length >= limit) {
    const oldestHit = Math.min(...recentHits);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldestHit + windowMs - now) / 1000)) };
  }

  recentHits.push(now);
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ...user.privateMetadata, rateLimits: { ...rateLimits, [action]: recentHits } },
  });

  return { allowed: true };
}
