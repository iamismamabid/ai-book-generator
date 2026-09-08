const sharp = require('sharp');

const p1 = 'C:/Users/ismam/.gemini/antigravity-ide/brain/7874bcd5-acba-44c4-86e4-9fd37687d5aa/dealify_header_with_official_logo_1788862522151.jpg';
const p2 = 'C:/Users/ismam/.gemini/antigravity-ide/brain/7874bcd5-acba-44c4-86e4-9fd37687d5aa/dealify_header_with_logo_v2_1788862548469.jpg';

async function processImages() {
  await sharp(p1).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_assets/dealify_header_with_logo_1_2200x1162.png');
  await sharp(p2).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_assets/dealify_header_with_logo_2_2200x1162.png');
  // Set default header
  await sharp(p1).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_assets/dealify_header_2200x1162.png');
  await sharp(p1).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_header_2200x1162.png');
  await sharp(p1).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_header_with_logo_1_2200x1162.png');
  await sharp(p2).resize(2200, 1162, { fit: 'cover' }).png({ quality: 100 }).toFile('C:/Users/ismam/Desktop/dealify_header_with_logo_2_2200x1162.png');
  console.log('Saved both 2200x1162 PNG banners with official website logo!');
}

processImages().catch(console.error);
