const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function seed() {
  const content = fs.readFileSync('c:/Projects/ai-book-generator/dealfuel_coupons.csv', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && l !== 'CouponCode');
  
  console.log(`Batch inserting ${lines.length} DealFuel codes...`);
  const data = lines.map(code => ({ code }));
  
  const result = await prisma.appSumoValidCode.createMany({
    data,
    skipDuplicates: true
  });
  
  console.log(`Successfully batch inserted ${result.count} codes!`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
