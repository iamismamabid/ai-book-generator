const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const targetDir = path.join(__dirname, '../public/appsumo_screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const pages = [
  { url: 'http://localhost:3000/studio', name: 'kdpage_1_cover_studio.png' },
  { url: 'http://localhost:3000/generate', name: 'kdpage_2_all_in_one_studio.png' },
  { url: 'http://localhost:3000/sudoku', name: 'kdpage_3_sudoku_studio.png' },
  { url: 'http://localhost:3000/maze', name: 'kdpage_4_maze_studio.png' },
];

async function captureScreenshots() {
  console.log('Launching Chrome to capture high-res AppSumo screenshots...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 2, // 2x Retina quality for crisp presentation
    },
  });

  const page = await browser.newPage();

  for (const item of pages) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000)); // wait 2s for canvases & fonts to render
      const filePath = path.join(targetDir, item.name);
      await page.screenshot({ path: filePath, type: 'png' });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture ${item.url}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureScreenshots();
