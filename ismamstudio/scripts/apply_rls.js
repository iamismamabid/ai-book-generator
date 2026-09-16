const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  console.log("\nCurrent tables and RLS status:");
  console.table(tables);

  const targets = ["teams", "team_members", "coloring_projects", "team_invites"];
  for (const t of targets) {
    console.log(`Enabling RLS on public.${t}...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`);
  }

  console.log("\nRe-checking status after update:");
  const updatedTables = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  console.table(updatedTables);
}

main()
  .catch((e) => {
    console.error("Error executing RLS migration:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
