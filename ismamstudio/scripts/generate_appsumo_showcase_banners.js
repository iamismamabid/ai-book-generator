const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = path.join(__dirname, '../public/appsumo_showcase_banners');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function getBase64Image(filename) {
  const filePath = path.join(__dirname, '../public/appsumo_screenshots', filename);
  if (!fs.existsSync(filePath)) return '';
  const fileData = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileData.toString('base64')}`;
}

const slides = [
  {
    name: 'slide_1_primary_showcase.png',
    badge: '✨ ALL-IN-ONE KDP PUBLISHING SUITE',
    title: 'Create & Publish KDP Books in Minutes.',
    subtitle: 'Generate Sudoku, mazes, word search, crosswords & 3D book covers all in one place.',
    tags: ['🧩 8+ Puzzle Types', '🎨 Cover Studio', '📐 Spine Calculator', '📄 300 DPI Print-Ready'],
    screenshot: getBase64Image('kdpage_4_all_in_one_studio.png'),
  },
  {
    name: 'slide_2_puzzle_builder.png',
    badge: '🧩 MULTI-PUZZLE INTERIOR BUILDER',
    title: 'Ultra-Large 7.8" Grids & Auto Solutions.',
    subtitle: 'Compile 100+ page KDP interiors with 1, 2, or 4 solution keys per page automatically.',
    tags: ['⚡ 30pt Giant Numbers', '📏 Safe Margin Guides', '🔄 Solution Packer', '📁 Instant PDF'],
    screenshot: getBase64Image('kdpage_1_sudoku_studio.png'),
  },
  {
    name: 'slide_3_cover_studio.png',
    badge: '🎨 FABRIC COVER STUDIO',
    title: 'Full-Bleed KDP Covers & Spine Calculator.',
    subtitle: 'Design front, spine & back covers with exact page-count spine width calculations & 3D preview.',
    tags: ['📐 Spine Calculator', '📦 3D Book Mockups', '🔍 Client Review Links', '✨ Fabric Canvas'],
    screenshot: getBase64Image('kdpage_0_cover_studio_3d.png'),
  },
  {
    name: 'slide_4_shape_mazes.png',
    badge: '🌀 ADVANCED SHAPE-MASKED MAZES',
    title: 'Create Custom Image & Geometry Mazes.',
    subtitle: 'Generate heart, star, geometric, and custom image-masked mazes with high-contrast paths.',
    tags: ['❤️ Custom Shape Masks', '🚩 Bold Start/Exit', '🔴 High-Contrast Paths', '🎯 Easy-Hard Modes'],
    screenshot: getBase64Image('kdpage_2_maze_studio.png'),
  },
  {
    name: 'slide_5_commercial_license.png',
    badge: '🚀 KDP PUBLISHER TOOLKIT',
    title: 'Commercial Rights & Unlimited Exports.',
    subtitle: 'Zero royalties or monthly subscriptions. Publish unlimited books on Amazon KDP.',
    tags: ['💼 Commercial License', '♾️ Unlimited Exports', '🔒 Lifetime Access', '⚡ Instant Downloads'],
    screenshot: getBase64Image('kdpage_11_bulk_generator.png'),
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
        radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.3) 0%, transparent 45%),
        radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.25) 0%, transparent 45%),
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
        <div class="browser-address">https://www.kdpage.com</div>
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

async function renderShowcaseBanners() {
  console.log('Generating 5 Ultra-Premium AppSumo Marketing Showcase Banners (1280x720)...');
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
    console.log(`Rendering ${slide.name}...`);
    const html = generateHTML(slide);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const filePath = path.join(targetDir, slide.name);
    await page.screenshot({ path: filePath, type: 'png' });
    const stats = fs.statSync(filePath);
    console.log(`Generated (${(stats.size / 1024).toFixed(1)} KB): ${filePath}`);
  }

  await browser.close();
  console.log('All 5 AppSumo Showcase Banners generated successfully!');
}

renderShowcaseBanners();
