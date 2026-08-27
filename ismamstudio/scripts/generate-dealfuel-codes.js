const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function generateCodes() {
  const codes = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  for (let i = 0; i < 250; i++) {
    let rand1 = '';
    let rand2 = '';
    for (let j = 0; j < 4; j++) rand1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let j = 0; j < 4; j++) rand2 += chars.charAt(Math.floor(Math.random() * chars.length));
    codes.push('DEALFUEL-' + rand1 + '-' + rand2);
  }

  // Write CSV
  const csvContent = 'CouponCode\n' + codes.join('\n');
  fs.writeFileSync('c:/Projects/ai-book-generator/dealfuel_coupons.csv', csvContent);
  fs.writeFileSync('C:/Users/ismam/Desktop/dealfuel_coupons.csv', csvContent);
  fs.writeFileSync('C:/Users/ismam/Downloads/dealfuel_coupons.csv', csvContent);
  
  console.log('Generated 250 DealFuel coupon codes and saved to CSV!');

  // Upsert into AppSumoValidCode table so they are instantly redeemable on KDPage
  let inserted = 0;
  for (const c of codes) {
    await prisma.appSumoValidCode.upsert({
      where: { code: c },
      update: {},
      create: { code: c }
    });
    inserted++;
  }
  console.log('Successfully registered ' + inserted + ' codes in KDPage database!');
}

generateCodes().catch(console.error).finally(() => prisma.$disconnect());
