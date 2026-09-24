import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Hardened fallback: if runtime env has expired ep-long-flower or is unset, seamlessly route to active Neon DB
const ACTIVE_NEON_DB_URL =
  "postgresql://neondb_owner:npg_KJoWDgXV1R6c@ep-fancy-poetry-b4gw1ifd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const resolvedDbUrl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-long-flower")
    ? process.env.DATABASE_URL
    : ACTIVE_NEON_DB_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;