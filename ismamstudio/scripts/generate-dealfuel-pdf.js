const { jsPDF } = require('jspdf');
const fs = require('fs');

const doc = new jsPDF();
doc.setFontSize(22);
doc.setTextColor(30, 41, 59);
doc.text('KDPage - DealFuel Redemption Instructions', 14, 25);

doc.setFontSize(12);
doc.setTextColor(71, 85, 105);
doc.text('Thank you for purchasing the KDPage Pro Studio Lifetime Deal on DealFuel!', 14, 38);
doc.text('Follow these simple steps to activate your lifetime access in under 60 seconds:', 14, 46);

doc.setDrawColor(226, 232, 240);
doc.line(14, 52, 196, 52);

doc.setFontSize(14);
doc.setTextColor(99, 102, 241);
doc.text('Step 1: Go to the Official Redemption Page', 14, 65);
doc.setFontSize(11);
doc.setTextColor(51, 65, 85);
doc.text('Navigate to: https://www.kdpage.com/redeem?partner=dealfuel', 14, 73);

doc.setFontSize(14);
doc.setTextColor(99, 102, 241);
doc.text('Step 2: Sign In or Create a Free Account', 14, 88);
doc.setFontSize(11);
doc.setTextColor(51, 65, 85);
doc.text('Click Sign In or Sign Up using Google, Email, or GitHub.', 14, 96);

doc.setFontSize(14);
doc.setTextColor(99, 102, 241);
doc.text('Step 3: Enter Your DealFuel License Code', 14, 111);
doc.setFontSize(11);
doc.setTextColor(51, 65, 85);
doc.text('Paste your unique DealFuel coupon code (e.g. DEALFUEL-XXXX-XXXX) into the box.', 14, 119);
doc.text('Click Activate Access.', 14, 126);

doc.setFontSize(14);
doc.setTextColor(99, 102, 241);
doc.text('Step 4: Instant High-Resolution 300 DPI Exports Unlocked!', 14, 141);
doc.setFontSize(11);
doc.setTextColor(51, 65, 85);
doc.text('Your account is immediately upgraded to Pro Studio Lifetime Access with watermark-free', 14, 149);
doc.text('300 DPI vector PDF exports, Cover Studio, and all puzzle generators fully active.', 14, 156);

doc.setDrawColor(226, 232, 240);
doc.line(14, 168, 196, 168);

doc.setFontSize(12);
doc.setTextColor(30, 41, 59);
doc.text('Need Assistance?', 14, 180);
doc.setFontSize(10);
doc.setTextColor(100, 116, 139);
doc.text('Visit our Help Center at https://www.kdpage.com/help or email support@kdpage.com', 14, 188);

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync('c:/Projects/ai-book-generator/dealfuel_redemption_instructions.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('C:/Users/ismam/Desktop/dealfuel_redemption_instructions.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('C:/Users/ismam/Downloads/dealfuel_redemption_instructions.pdf', Buffer.from(pdfBytes));
console.log('PDF Generated Successfully!');
