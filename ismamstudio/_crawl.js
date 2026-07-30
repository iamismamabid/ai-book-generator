const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const shotDir = path.join(__dirname, '_crawl_shots');
fs.mkdirSync(shotDir, { recursive: true });

const results = [];

function isRealError(text) {
  return !text.includes('Content Security Policy')
    && !text.includes('googletagmanager')
    && !text.includes('partnero');
}

async function checkRoute(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error' && isRealError(msg.text())) errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
  page.on('response', (res) => { if (res.status() >= 500) errors.push(`HTTP ${res.status()} on ${res.url()}`); });

  let status = 'OK';
  try {
    const resp = await page.goto(`http://localhost:3001${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    if (!resp || resp.status() >= 400) status = `HTTP ${resp ? resp.status() : 'no-response'}`;
    await page.waitForTimeout(2000);
    const fname = route.replace(/\//g, '_') || '_root';
    await page.screenshot({ path: path.join(shotDir, `${fname}.png`) });
  } catch (e) {
    status = 'NAV_FAILED: ' + e.message;
  }

  results.push({ route, status, errors: [...errors] });
  await context.close();
  return { context: null };
}

(async () => {
  const browser = await chromium.launch();

  for (const route of ['/studio', '/tools/word-search', '/tools/keyword-research', '/tools/kdp-file-validator']) {
    console.log('--- checking', route, '---');
    await checkRoute(browser, route);
  }

  // /sudoku: full generate -> export -> download flow
  console.log('--- /sudoku: full export flow ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error' && isRealError(msg.text())) errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

    let status = 'OK';
    let pdfPath = null;
    try {
      await page.goto('http://localhost:3001/sudoku', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(shotDir, '_sudoku_loaded.png') });

      const openBtn = page.locator('button:has-text("Download")').first();
      if (await openBtn.count() > 0) {
        await openBtn.click({ timeout: 5000 });
        await page.waitForTimeout(800);
        const exportBtn = page.locator('button:has-text("Export Interior PDF"), button:has-text("Download Watermarked PDF")').first();
        if (await exportBtn.count() > 0) {
          const downloadPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
          await exportBtn.click({ timeout: 5000 });
          const download = await downloadPromise;
          if (download) {
            pdfPath = path.join(shotDir, 'sudoku-export.pdf');
            await download.saveAs(pdfPath);
            const stat = fs.statSync(pdfPath);
            status = `DOWNLOAD OK (${stat.size} bytes)`;
          } else {
            status = 'DOWNLOAD DID NOT FIRE';
          }
        } else {
          status = 'export button not found in modal';
        }
      } else {
        status = 'download-opener button not found';
      }
    } catch (e) {
      status = 'FLOW_FAILED: ' + e.message;
    }
    results.push({ route: '/sudoku (full export)', status, errors: [...errors] });
    await context.close();

    // Feed the generated sudoku PDF into the KDP File Validator
    if (pdfPath) {
      console.log('--- /tools/kdp-file-validator: uploading real generated PDF ---');
      const vcontext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const vpage = await vcontext.newPage();
      const verrors = [];
      vpage.on('console', (msg) => { if (msg.type() === 'error' && isRealError(msg.text())) verrors.push(msg.text()); });
      vpage.on('pageerror', (err) => verrors.push('pageerror: ' + err.message));

      let vstatus = 'OK';
      try {
        await vpage.goto('http://localhost:3001/tools/kdp-file-validator', { waitUntil: 'networkidle', timeout: 30000 });
        await vpage.waitForTimeout(1000);
        const fileInput = vpage.locator('input[type="file"]').first();
        await fileInput.setInputFiles(pdfPath);
        await vpage.waitForTimeout(3000);
        await vpage.screenshot({ path: path.join(shotDir, '_kdp-validator-result.png') });
        const bodyText = await vpage.locator('body').innerText();
        vstatus = bodyText.match(/error|warning|ready|pass|fail/i) ? 'Produced a result (see screenshot)' : 'No obvious result text found';
      } catch (e) {
        vstatus = 'VALIDATOR_FAILED: ' + e.message;
      }
      results.push({ route: '/tools/kdp-file-validator (uploaded real sudoku PDF)', status: vstatus, errors: [...verrors] });
      await vcontext.close();
    }
  }

  await browser.close();

  console.log('\n\n========== CRAWL REPORT ==========');
  for (const r of results) {
    console.log(`\n${r.route}\n  status: ${r.status}`);
    if (r.errors.length) {
      console.log('  errors:');
      r.errors.forEach(e => console.log('    - ' + e));
    } else {
      console.log('  errors: none');
    }
  }
})().catch(e => { console.error('CRAWL SCRIPT FAILED:', e); process.exit(1); });
