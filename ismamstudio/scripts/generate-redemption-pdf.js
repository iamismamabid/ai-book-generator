const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function createRedemptionPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.1, 0.12, 0.18), // Dark sleek
  });

  // Title
  page.drawText('KDPage - DealFuel Redemption & Stacking Guide', {
    x: 40,
    y: height - 52,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('How to activate Pro (1 Code) & Agency (2 Codes Stacked)', {
    x: 40,
    y: height - 76,
    size: 11,
    font: fontRegular,
    color: rgb(0.75, 0.85, 0.98),
  });

  let y = height - 130;

  // Plan Tier Breakdown Box
  page.drawRectangle({
    x: 40,
    y: y - 75,
    width: width - 80,
    height: 75,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });

  page.drawText('Plan Tiers & Code Stacking Structure:', {
    x: 55,
    y: y - 20,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.45),
  });

  page.drawText('• Tier 1 (1 Code): Pro Lifetime - 1 User, 10 Brands, 50 Books, All Puzzle & Cover Tools', {
    x: 55,
    y: y - 40,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.35),
  });

  page.drawText('• Tier 2 (2 Codes): Agency Lifetime - 3 Team Seats, 25 Brands, 500 Books, Agency License', {
    x: 55,
    y: y - 58,
    size: 9.5,
    font: fontBold,
    color: rgb(0.12, 0.45, 0.25),
  });

  y -= 95;

  page.drawText('Step-by-Step Activation Instructions:', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const steps = [
    {
      title: 'Step 1: Visit KDPage',
      desc: 'Go to https://kdpage.com and click on "Sign In" or "Get Started".',
    },
    {
      title: 'Step 2: Create or Log in to Your Account',
      desc: 'Sign up with your email address or continue with Google.',
    },
    {
      title: 'Step 3: Navigate to Redeem / Upgrade',
      desc: 'Once logged in, open your account dashboard and click on "Redeem Code".',
    },
    {
      title: 'Step 4: Enter Your DealFuel Coupon Code',
      desc: 'Enter your 1st coupon code (e.g. DEALFUEL-XXXX-XXXX) to unlock Pro Lifetime access.',
    },
    {
      title: 'Step 5: Stacking 2nd Code for Agency Tier (Optional)',
      desc: 'If you bought 2 codes, enter your 2nd code in the same box to instantly unlock the 3-Seat Agency Plan!',
    },
  ];

  y -= 20;
  for (const step of steps) {
    page.drawRectangle({
      x: 40,
      y: y - 36,
      width: width - 80,
      height: 48,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.86, 0.89, 0.93),
      borderWidth: 1,
    });

    page.drawText(step.title, {
      x: 55,
      y: y - 5,
      size: 10.5,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.35),
    });

    page.drawText(step.desc, {
      x: 55,
      y: y - 22,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.45),
    });

    y -= 58;
  }

  y -= 8;
  // Support Box
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: width - 80,
    height: 60,
    color: rgb(0.93, 0.97, 0.95),
    borderColor: rgb(0.7, 0.88, 0.78),
    borderWidth: 1,
  });

  page.drawText('Need Help or Have Questions?', {
    x: 55,
    y: y - 18,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.25),
  });

  page.drawText('Our support team is available 24/7 to assist with redemption and account setup:', {
    x: 55,
    y: y - 32,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.2, 0.3, 0.25),
  });

  page.drawText('Email: ismamabid.islet@gmail.com   |   Website: https://kdpage.com/contact', {
    x: 55,
    y: y - 46,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.2),
  });

  const pdfBytes = await pdfDoc.save();
  
  fs.writeFileSync('c:/Projects/ai-book-generator/KDPage_Redemption_Instructions.pdf', pdfBytes);
  fs.writeFileSync('C:/Users/ismam/Desktop/KDPage_Redemption_Instructions.pdf', pdfBytes);
  fs.writeFileSync('C:/Users/ismam/Downloads/KDPage_Redemption_Instructions.pdf', pdfBytes);

  console.log('Successfully generated Updated 2-Tier KDPage_Redemption_Instructions.pdf in Project, Desktop, and Downloads!');
}

createRedemptionPDF().catch(console.error);
