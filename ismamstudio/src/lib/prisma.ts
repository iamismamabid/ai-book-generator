import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // এটি থাকলে টার্মিনালে ডাটাবেস কোয়েরিগুলো দেখা যায়, যা শেখার জন্য খুব ভালো
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;