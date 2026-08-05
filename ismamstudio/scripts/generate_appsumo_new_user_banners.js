const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = path.join(__dirname, '../public/appsumo_new_user_banners');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function getBase64Image(filename) {
  const filePath = path.join(__dirname, '../public/user_new_uploads', filename);
  if (!fs.existsSync(filePath)) return '';
  const fileData = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileData.toString('base64')}`;
}

const slides = [
  {
    name: 'banner_1_primary_sudoku.png',
    badge: '✨ ALL-IN-ONE KDP PUBLISHING SUITE',
    title: 'Create 70+ Page KDP Books in Minutes.',
    subtitle: 'Sudoku, Mazes, Word Search, Kakuro & Cover Design in One Creator Studio.',
    tags: ['🧩 8+ Puzzle Studios', '📄 30pt Giant Numbers', '📏 Safe Margin Guides', '📁 KDP Ready PDF'],
    screenshot: getBase64Image('new_img_5_sudoku.png'),
  },
  {
    name: 'banner_2_kakuro_studio.png',
    badge: '🧩 KAKURO PUZZLE CREATOR',
    title: 'High-Density Kakuro Sums & Multi-Page Books.',
    subtitle: 'Generate 6x6 & 8x8 Kakuro sum puzzles with auto-building solution keys.',
    tags: ['🔢 Sum Clues', '🎯 Easy to Expert', '📚 71-Page Outlines', '📁 KDP Print Ready'],
    screenshot: getBase64Image('new_img_1_kakuro.png'),
  },
  {
    name: 'banner_3_word_scramble.png',
    badge: '🔤 WORD SCRAMBLE STUDIO',
    title: 'Instant Word Scrambles & Word Bank Layouts.',
    subtitle: 'Auto-unscramble clues, word bank placement & drag-and-drop page organizer.',
    tags: ['📝 Custom Word Lists', '💡 Word Banks', '🔄 Solution Keys', '⚡ Instant Export'],
    screenshot: getBase64Image('new_img_2_word_scramble.png'),
  },
  {
    name: 'banner_4_heart_maze.png',
    badge: '🌀 SHAPE-MASKED MAZES',
    title: 'Custom Heart, Geometry & Image Mazes.',
    subtitle: 'Generate high-contrast heart mazes with bold start/exit markers & red solution paths.',
    tags: ['❤️ Heart Shape Mask', '🚩 Red Solution Path', '🔴 Bold Start/Exit', '🎯 Easy to Hard'],
    screenshot: getBase64Image('new_img_3_heart_maze.png'),
  },
  {
    name: 'banner_5_word_search.png',
    badge: '🔍 WORD SEARCH CREATOR',
    title: 'Custom KDP Word Search & Grid Scaling.',
    subtitle: 'Build 10x10 to 20x20 word search grids with CSV clue imports & print margins.',
    tags: ['💡 CSV Clue Import', '🎯 Solution Grids', '📐 Gutter Margins', '🚀 Commercial Rights'],
    screenshot: getBase64Image('new_img_4_word_search.png'),
  },
];

function generateHTML(slide) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      width: 1280px;
      height: 720px;
      background: #0B0F19;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.35) 0%, transparent 45%),
        radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.28) 0%, transparent 45%),
        linear-gradient(135deg, #0F172A 0%, #090D16 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 60px 70px;
      position: relative;
      overflow: hidden;
    }
    
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .content-left {
      width: 510px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.18);
      border: 1px solid rgba(129, 140, 248, 0.35);
      color: #A5B4FC;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      width: fit-content;
    }

    .title {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -1px;
      background: linear-gradient(to right, #FFFFFF, #F1F5F9, #C7D2FE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 17px;
      color: #94A3B8;
      line-height: 1.5;
      font-weight: 500;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .tag-pill {
      padding: 8px 14px;
      border-radius: 12px;
      background: rgba(30, 41, 59, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F8FAFC;
      font-size: 13px;
      font-weight: 700;
    }

    .showcase-right {
      width: 600px;
      height: 430px;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .browser-window {
      width: 100%;
      height: 100%;
      background: #1E293B;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 18px 36px -18px rgba(79, 70, 229, 0.4);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: perspective(1000px) rotateY(-6deg) rotateX(2deg);
    }

    .browser-header {
      height: 36px;
      background: #0F172A;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 8px;
    }

    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }

    .browser-address {
      margin-left: 12px;
      background: rgba(255, 255, 255, 0.06);
      padding: 3px 14px;
      border-radius: 6px;
      font-size: 11px;
      color: #94A3B8;
      font-family: monospace;
    }

    .browser-body {
      flex: 1;
      overflow: hidden;
      position: relative;
      background: #020617;
    }

    .screenshot-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .brand-footer {
      position: absolute;
      bottom: 24px;
      left: 70px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #6366F1;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>

  <div class="content-left">
    <div class="badge">${slide.badge}</div>
    <h1 class="title">${slide.title}</h1>
    <p class="subtitle">${slide.subtitle}</p>
    <div class="tags-container">
      ${slide.tags.map(t => `<div class="tag-pill">${t}</div>`).join('')}
    </div>
  </div>

  <div class="showcase-right">
    <div class="browser-window">
      <div class="browser-header">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-address">https://www.kdpage.com/studio</div>
      </div>
      <div class="browser-body">
        <img class="screenshot-img" src="${slide.screenshot}" alt="KDPage Studio" />
      </div>
    </div>
  </div>

  <div class="brand-footer">
    <span>KDPage Studio • Self-Publishing Suite</span>
  </div>
</body>
</html>
  `;
}

async function renderNewUserShowcaseBanners() {
  console.log('Generating 5 Custom AppSumo Banners from NEW User Screenshots...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();

  for (const slide of slides) {
    console.log(`Rendering custom banner: ${slide.name}...`);
    const html = generateHTML(slide);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const filePath = path.join(targetDir, slide.name);
    await page.screenshot({ path: filePath, type: 'png' });
    const stats = fs.statSync(filePath);
    console.log(`Generated (${(stats.size / 1024).toFixed(1)} KB): ${filePath}`);
  }

  await browser.close();
  console.log('All 5 New Custom AppSumo Banners generated successfully!');
}

renderNewUserShowcaseBanners();
