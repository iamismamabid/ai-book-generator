import { prisma } from "./prisma";

// Team seats promised in pricing/redeem copy: Free/Starter/Pro plans are
// solo (1 seat = the account itself, no invites). Agency and the AppSumo
// tiers built on top of it (tier4/tier5) are the only plans that actually
// advertise "team member account seats" anywhere in the app, and the only
// concrete number ever promised is 3 -- so that's the floor applied to all
// three rather than inventing higher numbers tier4/tier5 never promised.
export const SEAT_LIMITS: Record<string, number> = {
  free: 1,
  starter: 1,
  pro: 1,
  agency: 3,
};

export function seatLimitForPlan(plan: string): number {
  return SEAT_LIMITS[plan] ?? 1;
}

// If `userId` is a member (not owner) of a team, returns that team's owner's
// Clerk userId -- the account whose plan/seats/workspace they should inherit.
// Returns null for a solo user or a team owner (who resolves against their
// own userId already).
export async function getTeamOwnerIdForMember(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: true },
  });
  return membership?.team.ownerId ?? null;
}

// All Clerk userIds that share this user's workspace (Notebook-saved
// projects): the team owner plus every accepted member. A solo user (no
// team, not a member of one) just gets back their own id.
export async function getWorkspaceUserIds(userId: string): Promise<string[]> {
  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: { members: true },
  });
  if (ownedTeam) {
    return [ownedTeam.ownerId, ...ownedTeam.members.map((m) => m.userId)];
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: { include: { members: true } } },
  });
  if (membership) {
    return [membership.team.ownerId, ...membership.team.members.map((m) => m.userId)];
  }

  return [userId];
}
