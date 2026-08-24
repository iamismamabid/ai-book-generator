/**
 * IndexNow Batch Submission Script for KDPage
 * 
 * Usage:
 *   node scripts/submit-indexnow.mjs
 */

const INDEXNOW_KEY = "25d697359fb94ffa977080427e56a753";
const HOST = "www.kdpage.com";
const BASE_URL = `https://${HOST}`;

const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

// Core routes & tools across KDPage
const URLS = [
  `${BASE_URL}`,
  `${BASE_URL}/pricing`,
  `${BASE_URL}/about`,
  `${BASE_URL}/blog`,
  `${BASE_URL}/studio`,
  `${BASE_URL}/sudoku`,
  `${BASE_URL}/maze`,
  `${BASE_URL}/studio/crossword`,
  `${BASE_URL}/studio/cryptogram`,
  `${BASE_URL}/studio/math-puzzle`,
  `${BASE_URL}/studio/word-scramble`,
  `${BASE_URL}/studio/kakuro`,
  `${BASE_URL}/tools`,
  `${BASE_URL}/tools/spine-calculator`,
  `${BASE_URL}/tools/coloring-book-generator`,
  `${BASE_URL}/tools/bulk-generator`,
  `${BASE_URL}/tools/isbn-generator`,
  `${BASE_URL}/tools/word-search`,
  `${BASE_URL}/tools/royalty-estimator`,
  `${BASE_URL}/tools/ebook-royalty-calculator`,
  `${BASE_URL}/tools/print-cost-calculator`,
  `${BASE_URL}/tools/kenp-calculator`,
  `${BASE_URL}/tools/ads-roi-calculator`,
  `${BASE_URL}/tools/reading-time-calculator`,
  `${BASE_URL}/tools/readability-calculator`,
  `${BASE_URL}/tools/kdp-file-validator`,
  `${BASE_URL}/tools/pattern-generator`,
  `${BASE_URL}/tools/interior-templates`,
  `${BASE_URL}/tools/keyword-research`,
  `${BASE_URL}/tools/keyword-density`,
  `${BASE_URL}/tools/grammar-checker`,
  `${BASE_URL}/tools/copyright-page-generator`,
  `${BASE_URL}/tools/license-generator`,
  `${BASE_URL}/tools/trademark-checker`,
  `${BASE_URL}/tools/book-planner`,
  `${BASE_URL}/tools/word-cloud`,
  `${BASE_URL}/tools/qr-code-generator`,
  `${BASE_URL}/tools/image-resizer`,
  `${BASE_URL}/tools/background-remover`,
  `${BASE_URL}/tools/photo-to-line-art`,
  `${BASE_URL}/tools/stock-images`,
  `${BASE_URL}/tools/pdf-compressor`,
  `${BASE_URL}/tools/ocr-scanner`,
  `${BASE_URL}/kdp-checklist`,
  `${BASE_URL}/compare`,
  `${BASE_URL}/compare/book-bolt`,
  `${BASE_URL}/compare/canva`,
  `${BASE_URL}/compare/tangent-templates`,
  `${BASE_URL}/faq`,
  `${BASE_URL}/docs`,
  `${BASE_URL}/help`,
  `${BASE_URL}/examples`,
  `${BASE_URL}/redeem`,
  `${BASE_URL}/affiliate`,
  `${BASE_URL}/privacy`,
  `${BASE_URL}/terms`,
  `${BASE_URL}/refund`,
  `${BASE_URL}/cookies`
];

async function submitIndexNow() {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS
  };

  console.log(`[IndexNow] Submitting ${URLS.length} URLs to api.indexnow.org...`);

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Successfully submitted ${URLS.length} URLs! (Status: ${response.status})`);
    } else {
      const errorText = await response.text();
      console.warn(`[IndexNow] Response status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("[IndexNow] Failed to submit to IndexNow:", error);
  }
}

submitIndexNow();
