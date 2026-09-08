const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/ismam/.gemini/antigravity-ide/brain/7874bcd5-acba-44c4-86e4-9fd37687d5aa/';
const outDir = 'C:/Users/ismam/Desktop/dealify_headers_pack_10/';
const assetsDir = 'C:/Users/ismam/Desktop/dealify_assets/';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const images = [
  {
    src: brainDir + 'dealify_hdr_1_bestseller_1788862940531.jpg',
    name: '01_Bestseller_In_5_Minutes_2200x1162.png',
    title: 'Create Best-Selling KDP Books in 5 Minutes'
  },
  {
    src: brainDir + 'dealify_hdr_2_studio_canvas_1788862966723.jpg',
    name: '02_Studio_Canvas_Puzzle_Builder_2200x1162.png',
    title: 'Studio Canvas & 300 DPI Vector PDF'
  },
  {
    src: brainDir + 'dealify_hdr_3_cover_studio_1788863018217.jpg',
    name: '03_Cover_Studio_Hardcover_Gold_2200x1162.png',
    title: 'The Gold Standard in KDP Print Cover Design'
  },
  {
    src: brainDir + 'dealify_hdr_4_puzzles_1788863051727.jpg',
    name: '04_Publish_In_2_Clicks_Solution_Keys_2200x1162.png',
    title: 'Publish 100-Page Puzzle Books in 2 Clicks'
  },
  {
    src: brainDir + 'dealify_hdr_5_coloring_1788863179831.jpg',
    name: '05_AI_Coloring_Book_Line_Art_2200x1162.png',
    title: 'AI Coloring Book & Line Art Studio (100% Commercial)'
  },
  {
    src: brainDir + 'dealify_hdr_6_comparison_1788863209609.jpg',
    name: '06_Canva_BookBolt_Killer_Zero_Fees_2200x1162.png',
    title: '#1 Canva & Book Bolt Alternative - Zero Monthly Fees'
  },
  {
    src: brainDir + 'dealify_hdr_7_batch_1788863242739.jpg',
    name: '07_Mass_Batch_Book_Generator_2200x1162.png',
    title: 'Mass Batch Book Generator & Queues'
  },
  {
    src: brainDir + 'dealify_header_with_official_logo_1788862522151.jpg',
    name: '08_Plasfy_Classic_Official_Logo_2200x1162.png',
    title: 'Classic Plasfy Style with Official Shield Logo'
  },
  {
    src: brainDir + 'dealify_header_with_logo_v2_1788862548469.jpg',
    name: '09_Automate_Creation_Paperback_2200x1162.png',
    title: 'Automate Low-Content Book Creation'
  },
  {
    src: brainDir + 'dealify_header_banner_1788860317934.jpg',
    name: '10_Luxury_Dark_Gold_3D_Masterpiece_2200x1162.png',
    title: 'KDPage Ultimate Luxury 3D Suite'
  }
];

async function exportAll() {
  console.log('Starting export of 10 high-converting Dealify header banners...');
  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const target1 = path.join(outDir, item.name);
    const target2 = path.join(assetsDir, item.name);

    await sharp(item.src)
      .resize(2200, 1162, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(target1);

    // Also copy to dealify_assets
    fs.copyFileSync(target1, target2);

    console.log(`[${i + 1}/10] Exported: ${item.name} (${item.title})`);
  }

  // Set the #1 Bestseller as the default primary header in dealify_assets and Desktop
  const primaryHeader = path.join(outDir, images[0].name);
  fs.copyFileSync(primaryHeader, path.join(assetsDir, 'dealify_header_2200x1162.png'));
  fs.copyFileSync(primaryHeader, 'C:/Users/ismam/Desktop/dealify_header_2200x1162.png');

  console.log('\nAll 10 Dealify header images successfully exported at exact 2200x1162px PNG!');
}

exportAll().catch(console.error);
