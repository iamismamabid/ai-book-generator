const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = path.join(__dirname, '../public/dealify_assets');
const desktopDir = 'C:\\Users\\ismam\\Desktop\\dealify_assets';

[targetDir, desktopDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const pagesToCapture = [
  { url: 'https://www.kdpage.com/studio', name: 'screenshot_1_cover_studio.png' },
  { url: 'https://www.kdpage.com/sudoku', name: 'screenshot_2_sudoku_studio.png' },
  { url: 'https://www.kdpage.com/maze', name: 'screenshot_3_maze_designer.png' },
  { url: 'https://www.kdpage.com/studio/kakuro', name: 'screenshot_4_kakuro_studio.png' },
  { url: 'https://www.kdpage.com/tools/word-search', name: 'screenshot_5_word_search.png' },
  { url: 'https://www.kdpage.com/tools/coloring-book-generator', name: 'screenshot_6_coloring_book_studio.png' },
  { url: 'https://www.kdpage.com/tools/book-planner', name: 'screenshot_7_book_planner.png' },
];

function generateHeaderHTML(coverImgBase64) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
    body {
      width: 2200px;
      height: 1162px;
      background: #080C14;
      background-image: 
        radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.28) 0%, transparent 50%),
        radial-gradient(circle at 85% 75%, rgba(245, 158, 11, 0.22) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 60%),
        linear-gradient(145deg, #0B0F19 0%, #05080F 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 90px 110px;
      position: relative;
      overflow: hidden;
    }
    
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    .content-left {
      width: 960px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .brand-logo-icon {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      background: linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.35);
      font-size: 30px;
    }

    .brand-name {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(to right, #FFFFFF, #E2E8F0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(129, 140, 248, 0.35);
      color: #A5B4FC;
      padding: 10px 24px;
      border-radius: 9999px;
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      width: fit-content;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
    }

    .headline {
      font-size: 68px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.03em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #FCD34D 0%, #F43F5E 50%, #A78BFA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subheadline {
      font-size: 26px;
      color: #94A3B8;
      line-height: 1.45;
      font-weight: 450;
      max-width: 860px;
    }

    .tags-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 10px;
    }

    .tag-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 22px;
      border-radius: 14px;
      font-size: 19px;
      font-weight: 700;
      color: #E2E8F0;
      backdrop-filter: blur(8px);
    }

    .content-right {
      width: 980px;
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: flex-end;
    }

    .mockup-wrapper {
      width: 960px;
      height: 600px;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(99, 102, 241, 0.25);
      display: flex;
      flex-direction: column;
    }

    .window-header {
      height: 48px;
      background: #0F172A;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 10px;
    }

    .circle { width: 14px; height: 14px; border-radius: 50%; }
    .c-red { background: #EF4444; }
    .c-yellow { background: #F59E0B; }
    .c-green { background: #10B981; }

    .window-title {
      font-size: 14px;
      font-weight: 700;
      color: #64748B;
      margin-left: 12px;
      letter-spacing: 0.05em;
    }

    .mockup-img {
      width: 100%;
      height: calc(100% - 48px);
      object-fit: cover;
      object-position: top center;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>

  <div class="content-left">
    <div class="brand-row">
      <div class="brand-logo-icon">📖</div>
      <div class="brand-name">KDPage Studio</div>
    </div>

    <div class="badge">
      ⚡ All-in-One KDP Self-Publishing Suite
    </div>

    <h1 class="headline">
      Create High-Converting <br/>
      <span class="gradient-text">KDP Books in Minutes.</span>
    </h1>

    <p class="subheadline">
      Complete self-publishing workstation with native Sudoku, maze, crossword, coloring book generators, and automated 300 DPI full-bleed cover designer.
    </p>

    <div class="tags-grid">
      <div class="tag-item">🎨 KDP Cover Studio + Spine Calculator</div>
      <div class="tag-item">🧩 8+ Native Puzzle Engines</div>
      <div class="tag-item">📐 100% Bleed & Trim Safe</div>
      <div class="tag-item">📄 Print-Ready 300 DPI Vector PDF</div>
      <div class="tag-item">💼 Full Commercial Resale Rights</div>
      <div class="tag-item">🔒 Zero Monthly Fees • Lifetime Deal</div>
    </div>
  </div>

  <div class="content-right">
    <div class="mockup-wrapper">
      <div class="window-header">
        <div class="circle c-red"></div>
        <div class="circle c-yellow"></div>
        <div class="circle c-green"></div>
        <span class="window-title">kdpage.com/studio — Fabric Cover Studio (300 DPI Vector)</span>
      </div>
      <img src="${coverImgBase64}" class="mockup-img" alt="KDPage Cover Studio" />
    </div>
  </div>
</body>
</html>
`;
}

async function run() {
  console.log('Launching headless Chrome to generate Dealify assets...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  let firstScreenshotBase64 = '';

  for (let i = 0; i < pagesToCapture.length; i++) {
    const item = pagesToCapture[i];
    console.log(`[${i + 1}/${pagesToCapture.length}] Capturing: ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Allow extra time for canvas, CSS, and interactive state to settle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const targetFilePath = path.join(targetDir, item.name);
      const desktopFilePath = path.join(desktopDir, item.name);
      
      const buffer = await page.screenshot({ type: 'png' });
      fs.writeFileSync(targetFilePath, buffer);
      fs.writeFileSync(desktopFilePath, buffer);
      
      if (i === 0) {
        firstScreenshotBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
      }
      
      console.log(`✓ Saved: ${item.name}`);
    } catch (e) {
      console.error(`Error capturing ${item.url}:`, e.message);
    }
  }

  // Generate the 2200x1162 Header Banner
  console.log('Generating official Dealify Header Banner (2200x1162px)...');
  await page.setViewport({ width: 2200, height: 1162, deviceScaleFactor: 1 });
  const headerHtml = generateHeaderHTML(firstScreenshotBase64);
  await page.setContent(headerHtml, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const headerTarget = path.join(targetDir, 'dealify_header_2200x1162.png');
  const headerDesktop = path.join(desktopDir, 'dealify_header_2200x1162.png');
  const headerBuffer = await page.screenshot({ type: 'png' });
  fs.writeFileSync(headerTarget, headerBuffer);
  fs.writeFileSync(headerDesktop, headerBuffer);
  console.log('✓ Saved Dealify Header Banner: dealify_header_2200x1162.png');

  await browser.close();
  console.log('\n=======================================');
  console.log('ALL DEALIFY ASSETS READY ON YOUR DESKTOP:');
  console.log(desktopDir);
  console.log('=======================================\n');
}

run().catch(console.error);
