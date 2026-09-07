const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function generateCodes() {
  const codesSet = new Set();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  // Generate exactly 1000 unique codes
  while (codesSet.size < 1000) {
    let rand1 = '';
    let rand2 = '';
    for (let j = 0; j < 4; j++) rand1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let j = 0; j < 4; j++) rand2 += chars.charAt(Math.floor(Math.random() * chars.length));
    codesSet.add('DEALIFY-' + rand1 + '-' + rand2);
  }

  const codes = Array.from(codesSet);

  // Write CSV
  const csvContent = 'CouponCode\n' + codes.join('\n');
  fs.writeFileSync('c:/Projects/ai-book-generator/dealify_coupons.csv', csvContent);
  
  try {
    fs.writeFileSync('C:/Users/ismam/Desktop/dealify_coupons.csv', csvContent);
  } catch (e) {
    console.warn('Could not write to Desktop:', e.message);
  }
  
  try {
    fs.writeFileSync('C:/Users/ismam/Downloads/dealify_coupons.csv', csvContent);
  } catch (e) {
    console.warn('Could not write to Downloads:', e.message);
  }
  
  console.log(`Generated ${codes.length} Dealify coupon codes and saved to CSV!`);

  // Batch insert into appsumo_valid_codes table so they are instantly redeemable on KDPage
  console.log('Inserting into database in batches...');
  const batchSize = 250;
  let inserted = 0;
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize).map(c => ({ code: c }));
    const result = await prisma.appSumoValidCode.createMany({
      data: batch,
      skipDuplicates: true
    });
    inserted += result.count;
    console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${result.count} codes.`);
  }

  console.log(`Successfully registered ${inserted} Dealify codes in KDPage database!`);
}

generateCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
