const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'store-assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Screenshot 1: 1280x800
const svg1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bgGrad)" />
  
  <!-- Header Bar -->
  <rect x="40" y="30" width="1200" height="70" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
  <circle cx="80" cy="65" r="18" fill="#6366f1" />
  <text x="80" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
  <text x="115" y="72" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">KDPage</text>
  <text x="220" y="72" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8">| Amazon KDP Quick View &amp; BSR Estimator</text>

  <!-- Amazon Mock Search Page Container -->
  <rect x="40" y="125" width="1200" height="640" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Mock Amazon Search Bar -->
  <rect x="60" y="145" width="1160" height="50" rx="8" fill="#131921" />
  <text x="90" y="176" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f97316">amazon</text>
  <rect x="200" y="153" width="700" height="34" rx="6" fill="#ffffff" />
  <text x="215" y="175" font-family="Arial, sans-serif" font-size="14" fill="#334155">coloring books for kids ages 4-8</text>
  <rect x="850" y="153" width="50" height="34" rx="6" fill="#febd69" />
  
  <!-- Mock Book Listing 1 -->
  <rect x="70" y="220" width="560" height="510" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <!-- Book Cover Mock -->
  <rect x="90" y="240" width="150" height="200" rx="8" fill="#38bdf8" />
  <text x="165" y="345" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">COLORING BOOK</text>
  <!-- Book Info -->
  <text x="260" y="265" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">Magical Animals Coloring Book</text>
  <text x="260" y="290" font-family="Arial, sans-serif" font-size="14" fill="#64748b">by Creative Kids Press | Paperback</text>
  <text x="260" y="325" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#b12704">$6.99</text>
  <text x="260" y="350" font-family="Arial, sans-serif" font-size="13" fill="#16a34a">✓ Prime FREE Delivery</text>

  <!-- KDPage Quick View Box Overlaid -->
  <rect x="85" y="460" width="530" height="250" rx="12" fill="#0f172a" stroke="#6366f1" stroke-width="2" />
  <rect x="85" y="460" width="530" height="40" rx="12" fill="#1e293b" />
  <circle cx="105" cy="480" r="8" fill="#6366f1" />
  <text x="125" y="485" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#e2e8f0">KDPage Quick View — BSR &amp; Sales Intel</text>

  <!-- Metrics Grid -->
  <rect x="100" y="515" width="118" height="65" rx="8" fill="#1e293b" />
  <text x="110" y="535" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#94a3b8">BSR RANK</text>
  <text x="110" y="565" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">#1,420</text>

  <rect x="228" y="515" width="118" height="65" rx="8" fill="#1e293b" />
  <text x="238" y="535" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#94a3b8">MONTHLY SALES</text>
  <text x="238" y="565" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#4ade80">1,850 books</text>

  <rect x="356" y="515" width="118" height="65" rx="8" fill="#1e293b" />
  <text x="366" y="535" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#94a3b8">DAILY SALES</text>
  <text x="366" y="565" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#fbbf24">~62/day</text>

  <rect x="484" y="515" width="118" height="65" rx="8" fill="#1e293b" />
  <text x="494" y="535" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#94a3b8">EST. ROYALTIES</text>
  <text x="494" y="565" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#a855f7">$3,970/mo</text>

  <!-- Direct Link Button -->
  <rect x="100" y="650" width="500" height="42" rx="8" fill="url(#btnGrad)" />
  <text x="350" y="676" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">⚡ Open KDPage Studio &amp; Create Similar Book</text>

  <!-- Feature Highlights on the Right Side -->
  <rect x="660" y="220" width="550" height="510" rx="16" fill="#0f172a" />
  <text x="700" y="275" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff">Amazon Research Made Effortless</text>
  <text x="700" y="310" font-family="Arial, sans-serif" font-size="16" fill="#94a3b8">Instant insights injected directly into Amazon search &amp; product pages</text>

  <circle cx="720" cy="370" r="14" fill="#22c55e" />
  <text x="720" y="375" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="750" y="375" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#f1f5f9">Real-time BSR Extraction &amp; Tracking</text>

  <circle cx="720" cy="430" r="14" fill="#22c55e" />
  <text x="720" y="435" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="750" y="435" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#f1f5f9">Accurate Monthly &amp; Daily Sales Estimates</text>

  <circle cx="720" cy="490" r="14" fill="#22c55e" />
  <text x="720" y="495" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="750" y="495" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#f1f5f9">Estimated KDP 60% Royalties &amp; Profit Calculator</text>

  <circle cx="720" cy="550" r="14" fill="#22c55e" />
  <text x="720" y="555" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="750" y="555" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#f1f5f9">Instant 1-Click Bridge to KDPage Creator Studio</text>

  <rect x="700" y="610" width="470" height="80" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="725" y="645" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#38bdf8">100% Free for all Amazon KDP Self-Publishers</text>
  <text x="725" y="670" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">No subscription required. Works on amazon.com, co.uk, de, and more.</text>
</svg>`;

// Screenshot 2: 1280x800 - Popup
const svg2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bgGrad2)" />
  
  <text x="100" y="90" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">Popup BSR &amp; Royalties Calculator</text>
  <text x="100" y="125" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8">Calculate any book's potential sales and profit in 2 seconds right from your browser toolbar.</text>

  <!-- Extension Popup Mock -->
  <rect x="100" y="170" width="380" height="560" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2" />
  
  <!-- Popup Header -->
  <rect x="100" y="170" width="380" height="60" rx="16" fill="#1e293b" />
  <circle cx="135" cy="200" r="14" fill="#6366f1" />
  <text x="135" y="206" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
  <text x="160" y="206" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">KDPage BSR Tool</text>

  <!-- Input Field 1 -->
  <text x="130" y="265" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#94a3b8">ENTER AMAZON BSR (RANK):</text>
  <rect x="130" y="280" width="320" height="44" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="145" y="308" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">5,000</text>

  <!-- Input Field 2 -->
  <text x="130" y="355" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#94a3b8">BOOK RETAIL PRICE ($):</text>
  <rect x="130" y="370" width="320" height="44" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="145" y="398" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">$9.99</text>

  <!-- Result Cards -->
  <rect x="130" y="440" width="150" height="85" rx="10" fill="#1e293b" />
  <text x="145" y="465" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8">MONTHLY SALES</text>
  <text x="145" y="505" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#4ade80">640 units</text>

  <rect x="300" y="440" width="150" height="85" rx="10" fill="#1e293b" />
  <text x="315" y="465" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8">EST. MONTHLY PROFIT</text>
  <text x="315" y="505" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#38bdf8">$2,430</text>

  <!-- Direct Button in Popup -->
  <rect x="130" y="555" width="320" height="44" rx="8" fill="url(#accentGrad)" />
  <text x="290" y="582" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">🚀 Launch KDPage Studio (Free)</text>

  <!-- Right Side: Publishing Suite Infographic -->
  <rect x="530" y="170" width="650" height="560" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
  <text x="570" y="230" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">Integrated With KDPage Publishing Ecosystem</text>
  <text x="570" y="260" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8">Seamlessly transition from Amazon market analysis to creating publish-ready books.</text>

  <rect x="570" y="300" width="270" height="90" rx="12" fill="#0f172a" />
  <text x="590" y="335" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">🎨 Book Cover Studio</text>
  <text x="590" y="365" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Exact spine &amp; bleed calculator</text>

  <rect x="870" y="300" width="270" height="90" rx="12" fill="#0f172a" />
  <text x="890" y="335" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#a855f7">🧩 30+ Puzzle Generators</text>
  <text x="890" y="365" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Sudoku, Mazes, Crosswords &amp; more</text>

  <rect x="570" y="415" width="270" height="90" rx="12" fill="#0f172a" />
  <text x="590" y="450" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#4ade80">📐 Trim Size &amp; Margins</text>
  <text x="590" y="480" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Print-ready PDF export at 300 DPI</text>

  <rect x="870" y="415" width="270" height="90" rx="12" fill="#0f172a" />
  <text x="890" y="450" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f59e0b">⚡ Bulk Export</text>
  <text x="890" y="480" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">High-speed interior generation</text>

  <rect x="570" y="540" width="570" height="150" rx="12" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" />
  <text x="600" y="580" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">Designed specifically for Amazon KDP Authors &amp; Publishers</text>
  <text x="600" y="610" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">Stop guessing book sales or doing manual math. Find profitable niches in seconds directly while browsing Amazon.</text>
  <text x="600" y="645" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#38bdf8">Visit https://kdpage.com to access all tools.</text>
</svg>`;

// Small Promo Tile: 440x280
const svgPromo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="440" height="280" fill="url(#tileGrad)" />
  <circle cx="70" cy="55" r="22" fill="#6366f1" />
  <text x="70" y="63" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
  
  <text x="105" y="63" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">KDPage</text>
  <text x="40" y="110" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#38bdf8">Amazon KDP Quick View &amp; BSR</text>
  <text x="40" y="140" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Real-time BSR, Sales Estimator &amp; Royalty Calculator</text>
  
  <!-- Mini tags -->
  <rect x="40" y="170" width="100" height="30" rx="6" fill="#334155" />
  <text x="90" y="190" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4ade80" text-anchor="middle">BSR Tracker</text>

  <rect x="150" y="170" width="110" height="30" rx="6" fill="#334155" />
  <text x="205" y="190" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">Sales Estimator</text>

  <rect x="270" y="170" width="130" height="30" rx="6" fill="#334155" />
  <text x="335" y="190" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#fbbf24" text-anchor="middle">Royalty Calculator</text>

  <!-- Bottom CTA -->
  <rect x="40" y="220" width="360" height="36" rx="8" fill="url(#badgeGrad)" />
  <text x="220" y="243" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">Free for Amazon KDP Publishers</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(svg1)).png().toFile(path.join(outDir, 'screenshot-1-1280x800.png'));
  await sharp(Buffer.from(svg2)).png().toFile(path.join(outDir, 'screenshot-2-1280x800.png'));
  await sharp(Buffer.from(svgPromo)).png().toFile(path.join(outDir, 'small-promo-tile-440x280.png'));
  console.log('Successfully created store assets in ' + outDir);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
