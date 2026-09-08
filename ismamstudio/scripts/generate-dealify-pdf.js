const { jsPDF } = require('jspdf');
const fs = require('fs');

const doc = new jsPDF();

// Header / Title
doc.setFontSize(22);
doc.setTextColor(30, 41, 59);
doc.text('KDPage - Dealify Redemption Instructions', 14, 22);

doc.setFontSize(11);
doc.setTextColor(71, 85, 105);
doc.text('Thank you for purchasing the KDPage Lifetime Deal on Dealify!', 14, 32);
doc.text('Follow these simple steps to activate your lifetime access in under 60 seconds.', 14, 38);

// NO CREDIT CARD NOTICE BOX
doc.setFillColor(240, 253, 244);
doc.setDrawColor(34, 197, 94);
doc.roundedRect(14, 44, 182, 22, 3, 3, 'FD');

doc.setFontSize(11);
doc.setTextColor(22, 101, 52);
doc.setFont('helvetica', 'bold');
doc.text('100% FREE ACTIVATION - NO CREDIT CARD REQUIRED', 20, 53);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.text('You will NEVER be asked for credit card or payment details during license activation.', 20, 60);

// Divider
doc.setDrawColor(226, 232, 240);
doc.line(14, 73, 196, 73);

// Step 1
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(79, 70, 229);
doc.text('Step 1: Go to the Official Dealify Redemption Page', 14, 84);
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(51, 65, 85);
doc.text('Open your browser and navigate directly to:', 14, 91);
doc.setFont('helvetica', 'bold');
doc.setTextColor(37, 99, 235);
doc.text('https://www.kdpage.com/redeem?partner=dealify', 14, 98);

// Step 2
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(79, 70, 229);
doc.text('Step 2: Sign In or Create Your Free Account', 14, 112);
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(51, 65, 85);
doc.text('Sign in with your Google account, email address, or GitHub.', 14, 119);
doc.text('If you are new, an account will be created instantly for free.', 14, 125);

// Step 3
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(79, 70, 229);
doc.text('Step 3: Enter Your Dealify Coupon Code', 14, 139);
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(51, 65, 85);
doc.text('Paste your unique Dealify code (format: DEALIFY-XXXX-XXXX) into the redemption box.', 14, 146);
doc.text('Click the "Activate Access" button.', 14, 152);

// Step 4
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(79, 70, 229);
doc.text('Step 4: Instant Lifetime Access Unlocked!', 14, 166);
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(51, 65, 85);
doc.text('Your account will be instantly upgraded to Lifetime Access.', 14, 173);
doc.text('Enjoy watermark-free 300 DPI vector PDF exports, Cover Studio, Puzzle Studios,', 14, 179);
doc.text('and all commercial publishing rights forever with zero recurring fees.', 14, 185);

// Divider
doc.setDrawColor(226, 232, 240);
doc.line(14, 196, 196, 196);

// Help & Support
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(30, 41, 59);
doc.text('Need Help or Have Questions?', 14, 208);

doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(100, 116, 139);
doc.text('Our support team is always here for you:', 14, 216);
doc.text('• Knowledge Base & Guides: https://www.kdpage.com/docs', 14, 223);
doc.text('• Direct Email Support: support@kdpage.com', 14, 230);
doc.text('• Live Support Chat: Available directly inside https://www.kdpage.com', 14, 237);

// Output
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync('c:/Projects/ai-book-generator/dealify_redemption_instructions.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('C:/Users/ismam/Desktop/dealify_redemption_instructions.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('C:/Users/ismam/Downloads/dealify_redemption_instructions.pdf', Buffer.from(pdfBytes));

// Also copy to dealify_assets folder if it exists
if (fs.existsSync('C:/Users/ismam/Desktop/dealify_assets')) {
  fs.writeFileSync('C:/Users/ismam/Desktop/dealify_assets/dealify_redemption_instructions.pdf', Buffer.from(pdfBytes));
}

console.log('Dealify Redemption PDF created successfully in all locations!');
