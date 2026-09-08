const fs = require('fs');
const { jsPDF } = require('jspdf');

const videoUrl = 'https://www.youtube.com/watch?v=OCrO925cK1c&t=330s';

const markdownContent = `# KDPage Dealify Launch Package: Marketing Copy, Video Walkthrough & Trustpilot Reviews

---

## 📺 Official Product Demo & Walkthrough Video
* **Live YouTube Walkthrough:** [${videoUrl}](${videoUrl})
* **Live Web Studio:** [https://www.kdpage.com](https://www.kdpage.com)
* **Dedicated Redemption Portal:** [https://www.kdpage.com/redeem?partner=dealify](https://www.kdpage.com/redeem?partner=dealify)

---

## 1. Verified Customer Reviews from Trustpilot (ট্রাস্টপাইলটের আসল রিভিউ)

Official Trustpilot Page: [https://www.trustpilot.com/review/kdpage.com](https://www.trustpilot.com/review/kdpage.com)

### Review 1:
> ⭐⭐⭐⭐⭐ **"As a KDP website i think it can bring a lot of opportunities"**  
> *"As a KDP website i think it can bring a lot of opportunities. So many awesome tools in a all in one studio."*  
> **— Meher Nayeem** (Verified Trustpilot Review • Aug 12, 2026)

### Review 2:
> ⭐⭐⭐⭐⭐ **"Smooth and satisfying"**  
> *"The whole experience feel really well and smooth enough. Also the page itself is very responsive and user friendly. Definitely a must-try!"*  
> **— Ajmain Rahman Ifti** (Verified Trustpilot Review • Aug 11, 2026)

### Review 3:
> ⭐⭐⭐⭐⭐ **"Hmm it is good initiative kdp tool"**  
> *"Hmm it is good initiative kdp tool. Constantly improving and adding value for KDP creators."*  
> **— Saqib** (Verified Trustpilot Review • Aug 11, 2026)

### Review 4:
> ⭐⭐⭐⭐ **"Pretty good website for amazon KDP creators"**  
> *"Pretty good website for amazon KDP creators."*  
> **— Taspia** (Verified Trustpilot Review • Aug 5, 2026)

### Review 5:
> ⭐⭐⭐⭐⭐ **"All in one KDP creation service"**  
> *"I would like to create KDP tools with this website because it provides me all in one service."*  
> **— Tofajjal Hossain Emon** (Verified Trustpilot Review • Aug 3, 2026)

### Review 6:
> ⭐⭐⭐⭐⭐ **"One of the best tools for KDP puzzles"**  
> *"In the field of KDP puzzle, it is one of the best tools."*  
> **— Tarequl Islam Mahin** (Verified Trustpilot Review • Aug 2, 2026)

### Review 7:
> ⭐⭐⭐⭐⭐ **"Very impressive website"**  
> *"It is really a very impressive website. Well done and keep it up."*  
> **— Imad Surjo** (Verified Trustpilot Review • Aug 2, 2026)

### Review 8:
> ⭐⭐⭐⭐⭐ **"Good website for KDP automation"**  
> *"Useful platform for creating activity books, puzzle interiors, and print-ready covers efficiently."*  
> **— Sedi Moulay** (Verified Trustpilot Review • Aug 1, 2026)

---

## 2. Competitor Comparison Table (তুলনামূলক চার্ট)

| Feature / Metric | **KDPage (Dealify LTD)** | **Book Bolt ($89–$239/yr)** | **Canva Pro ($120/yr)** | **Tangent Templates ($59)** |
| :--- | :--- | :--- | :--- | :--- |
| **Pricing Model** | **Pay Once Forever ($79 / $129)**| $19.99/mo or $89+/yr | $12.99/mo ($120/yr) | $59 one-time (limited) |
| **300 DPI KDP Vector Bleed** | **Instant 1-Click Auto-Fit** | Yes | Tricky / Manual | Static PDF exports only |
| **Algorithmic Unique Puzzles** | **100% Unique Seed Algorithms** | Static / semi-static | None | Basic pre-rendered |
| **Automated Solution Keys** | **Built-in Auto Formatter** | Manual setup required | Not available | Basic |
| **KDP Spine Width Calculator** | **Built into Cover Studio** | Basic external tool | Manual calculations | Template download only |
| **Shape-Masked Mazes** | **Hearts, Stars, Circles, Custom SVGs**| Rectangular grids only| None | None |
| **AI Coloring & Line Art** | **Photo-to-Vector Generator** | None | Limited generic AI | None |
| **Cloud Project Folders** | **Cross-device Cloud Sync** | Basic web library | Yes | Download to PC only |
| **30+ Free KDP Tools Suite** | **Included** | No | No | No |
| **Commercial Rights** | **100% Included Forever** | Included with subscription | Included with subscription | Limited |

---

## 3. Product Headlines & Sales Copy (ডিল পেজের সেলস কপি)

### Main Headline:
> **KDPage – The All-in-One Amazon KDP Book Creator & Puzzle Publishing Studio**

### Subheadline:
> **Create, format, and publish high-converting low-content books, custom puzzle interiors, and print-ready covers in minutes — with zero formatting headaches.**

### Core Value Highlights:
* 🖨️ **1-Click 300 DPI Vector PDF Exports:** Automatically embeds exact Amazon KDP bleeds, margins, and gutter widths. Guaranteed zero upload rejections.
* 🧩 **8+ Algorithmic Puzzle Studios:** Sudoku, Word Search, Shape-Masked Mazes (heart, star, circle), Kakuro, Cryptograms, and Crosswords with mathematically unique seeds.
* ⚡ **Instant Solution Keys at the Back:** Automatically compiles answers and formats solution pages at the back of the book with zero manual effort.
* 🎨 **Full-Wrap Cover Studio (Hardcover & Paperback):** Real-time automatic spine calculation based on exact page count and paper type (white, cream, or color).
* 🖍️ **AI Coloring Book Studio & Photo-to-Line-Art:** Convert prompts and photos into 300 DPI vector line art ready for coloring books.
* 📁 **Cloud Project Sync & Folders:** Organize entire series (e.g. "Q4 Holiday Books", "Sudoku Vol 1-5") across devices.
* 🔒 **Commercial Rights Included:** Publish and sell unlimited books on Amazon KDP, Etsy, or IngramSpark and keep 100% of your royalties.

---

## 4. Dealify Tiered Pricing Structure (ডিল টিয়ার ও অফার)

Compared to our website's standard retail pricing ($199–$399), we propose the following high-value tiered structure for Dealify:

### • Tier 1 (Pro Starter Lifetime Deal - 1 Code): $79 (Retail Value: $199 — 60% OFF)
* **1 User / Lifetime Access** to all Pro features
* **Unlimited Puzzle & Activity Book Generation** (Sudoku, Mazes, Crosswords, Word Searches, Kakuro)
* **Full Fabric Cover Studio** with automatic spine/bleed calculator
* **300 DPI Print-Ready PDF & EPUB exports**
* **100% Commercial Rights with 0% royalty cuts**

### • Tier 2 (Agency / Enterprise Lifetime Deal - 2 Codes / Stackable): $129 (Retail Value: $399 — 68% OFF)
* **Everything in Tier 1** for multiple users / agency usage
* **BYOK Unlimited AI Manuscript & Cover Art Engine** (OpenAI DALL-E 3, Google Gemini, Stability AI)
* **Advanced Coloring Book Generator & Batch Interior Exports**
* **Priority Feature Updates & Premium Customer Support**
`;

// Write Markdown file to Desktop and Assets
fs.writeFileSync('C:/Users/ismam/Desktop/dealify_assets/dealify_marketing_materials.md', markdownContent);
fs.writeFileSync('C:/Users/ismam/Desktop/dealify_marketing_materials.md', markdownContent);
fs.writeFileSync('c:/Projects/ai-book-generator/dealify_marketing_materials.md', markdownContent);

// Generate clean, formatted 2-page PDF
const doc = new jsPDF();

// ================= PAGE 1 =================
doc.setFontSize(20);
doc.setTextColor(30, 41, 59);
doc.text('KDPage - Dealify Launch Marketing Package', 14, 20);

doc.setFontSize(10);
doc.setTextColor(100, 116, 139);
doc.text('Authentic Trustpilot Reviews, Competitor Comparison Table, and Video Walkthrough', 14, 27);

doc.setDrawColor(226, 232, 240);
doc.line(14, 31, 196, 31);

// VIDEO WALKTHROUGH BOX
doc.setFillColor(239, 246, 255);
doc.setDrawColor(59, 130, 246);
doc.roundedRect(14, 36, 182, 23, 3, 3, 'FD');

doc.setFontSize(11);
doc.setTextColor(29, 78, 216);
doc.setFont('helvetica', 'bold');
doc.text('OFFICIAL PRODUCT DEMO & VIDEO WALKTHROUGH', 20, 44);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(37, 99, 235);
doc.textWithLink(videoUrl, 20, 52, { url: videoUrl });

// Section 1: Real Trustpilot Reviews
doc.setFontSize(12.5);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('1. Verified Reviews from Trustpilot (trustpilot.com/review/kdpage.com)', 14, 69);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(51, 65, 85);
doc.text('1. "As a KDP website i think it can bring a lot of opportunities. So many awesome tools." - Meher Nayeem (5/5)', 14, 77);
doc.text('2. "Smooth and satisfying. Very responsive and user friendly. Definitely a must-try!" - Ajmain Rahman Ifti (5/5)', 14, 84);
doc.text('3. "Hmm it is good initiative kdp tool. Constantly improving and adding value." - Saqib (5/5)', 14, 91);
doc.text('4. "Pretty good website for amazon KDP creators." - Taspia (4/5)', 14, 98);
doc.text('5. "All in one KDP creation service. Provides me all in one service." - Tofajjal Hossain Emon (5/5)', 14, 105);
doc.text('6. "In the field of KDP puzzle, it is one of the best tools." - Tarequl Islam Mahin (5/5)', 14, 112);
doc.text('7. "It is really a very impressive website. Well done and keep it up." - Imad Surjo (5/5)', 14, 119);
doc.text('8. "Useful platform for creating activity books, puzzles, and covers efficiently." - Sedi Moulay (5/5)', 14, 126);

// Section 2: Comparison
doc.setFontSize(12.5);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('2. Competitor Comparison Table', 14, 142);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(51, 65, 85);
doc.text('• Pricing: KDPage ($79/$129 Lifetime) vs Book Bolt ($89-$239/yr) vs Canva Pro ($120/yr).', 14, 150);
doc.text('• Puzzles: KDPage features deterministic unique algorithms; competitors use static recycled templates.', 14, 157);
doc.text('• Solution Keys: KDPage formats solutions automatically at the back; competitors require manual setup.', 14, 164);
doc.text('• Spine Calculation: KDPage integrates live spine auto-fit; Canva requires tricky third-party math.', 14, 171);
doc.text('• Print Quality: Pure vector 300 DPI PDFs on KDPage prevent Amazon upload rejections.', 14, 178);

doc.setDrawColor(226, 232, 240);
doc.line(14, 192, 196, 192);

doc.setFontSize(10);
doc.setTextColor(148, 163, 184);
doc.text('Page 1 of 2 - Continued on next page...', 14, 200);


// ================= PAGE 2 =================
doc.addPage();

doc.setFontSize(14);
doc.setTextColor(30, 41, 59);
doc.setFont('helvetica', 'bold');
doc.text('KDPage - Feature Highlights & Tiered Pricing', 14, 22);

doc.setDrawColor(226, 232, 240);
doc.line(14, 28, 196, 28);

// Section 3: Highlights
doc.setFontSize(12.5);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('3. Core Feature Highlights', 14, 38);

doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.setTextColor(71, 85, 105);
doc.text('• 1-Click 300 DPI Vector PDF Exports with automatic KDP bleed and gutter compliance.', 14, 46);
doc.text('• 8+ Dedicated Puzzle Engines (Sudoku, Mazes, Word Search, Kakuro) with instant answer keys.', 14, 53);
doc.text('• Full-Wrap Cover Studio (Paperback & Hardcover) with live spine width calculation.', 14, 60);
doc.text('• AI Coloring Book Studio & photo-to-line-art vectorizer.', 14, 67);
doc.text('• Cloud Project Sync & Folders for multi-device publishing workflows.', 14, 74);
doc.text('• Full Commercial Rights included with zero ongoing monthly fees.', 14, 81);

// Section 4: Proposed Dealify Tiers
doc.setFontSize(12.5);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('4. Proposed Dealify Tiered Structure (Standard Retail: $199 - $399)', 14, 98);

doc.setFontSize(9.5);
doc.setFont('helvetica', 'bold');
doc.setTextColor(30, 41, 59);
doc.text('• Tier 1 (Pro Starter LTD - 1 Code): $79 (Retail Value: $199 - 60% OFF)', 14, 107);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(71, 85, 105);
doc.text('  1 User / Lifetime Access to all Pro features', 18, 114);
doc.text('  Unlimited Puzzle & Activity Book Generation (Sudoku, Mazes, Crosswords, Word Searches, Kakuro)', 18, 120);
doc.text('  Full Fabric Cover Studio with automatic spine/bleed calculator', 18, 126);
doc.text('  300 DPI Print-Ready PDF & EPUB exports', 18, 132);
doc.text('  100% Commercial Rights with 0% royalty cuts', 18, 138);

doc.setFontSize(9.5);
doc.setFont('helvetica', 'bold');
doc.setTextColor(30, 41, 59);
doc.text('• Tier 2 (Agency / Enterprise LTD - 2 Codes / Stackable): $129 (Retail Value: $399 - 68% OFF)', 14, 150);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(71, 85, 105);
doc.text('  Everything in Tier 1 for multiple users / agency usage', 18, 157);
doc.text('  BYOK Unlimited AI Manuscript & Cover Art Engine (OpenAI DALL-E 3, Google Gemini, Stability AI)', 18, 163);
doc.text('  Advanced coloring book generator & batch interior exports', 18, 169);
doc.text('  Priority feature updates & premium customer support', 18, 175);

doc.setDrawColor(226, 232, 240);
doc.line(14, 190, 196, 190);

doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text('For questions or listing revisions: support@kdpage.com | https://www.kdpage.com', 14, 200);

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync('C:/Users/ismam/Desktop/dealify_assets/dealify_marketing_materials.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('C:/Users/ismam/Desktop/dealify_marketing_materials.pdf', Buffer.from(pdfBytes));
fs.writeFileSync('c:/Projects/ai-book-generator/dealify_marketing_materials.pdf', Buffer.from(pdfBytes));

console.log('Marketing materials PDF with clickable YouTube walkthrough link generated successfully!');
