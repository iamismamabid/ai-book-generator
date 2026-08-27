const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function seed() {
  const content = fs.readFileSync('c:/Projects/ai-book-generator/dealfuel_coupons.csv', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && l !== 'CouponCode');
  
  console.log(`Seeding ${lines.length} DealFuel codes to database...`);
  let count = 0;
  for (const code of lines) {
    await prisma.appSumoValidCode.upsert({
      where: { code },
      update: {},
      create: { code }
    });
    count++;
  }
  console.log(`Successfully seeded ${count} codes!`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
