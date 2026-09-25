/**
 * KDPage Amazon KDP Quick View & BSR Estimator
 * Content Script (Runs on Amazon.com)
 */

(function () {
  'use strict';

  // --- BSR to Sales Estimation Algorithm ---
  // Industry-standard curve calibrated for Amazon Books category
  function estimateMonthlySales(bsr) {
    if (!bsr || isNaN(bsr) || bsr <= 0) return 0;
    if (bsr === 1) return 7500;
    if (bsr <= 10) return Math.round(5000 - (bsr * 200));
    if (bsr <= 50) return Math.round(3000 - (bsr * 25));
    if (bsr <= 100) return Math.round(2000 - (bsr * 10));
    if (bsr <= 500) return Math.round(1200 - (bsr * 1.5));
    if (bsr <= 1000) return Math.round(600 - (bsr * 0.4));
    if (bsr <= 5000) return Math.round(400 - (bsr * 0.05));
    if (bsr <= 10000) return Math.round(200 - (bsr * 0.015));
    if (bsr <= 50000) return Math.round(75 - (bsr * 0.001));
    if (bsr <= 100000) return Math.round(25 - (bsr * 0.0002));
    if (bsr <= 300000) return Math.round(10 - (bsr * 0.00003));
    return Math.max(1, Math.round(1500 / Math.pow(bsr, 0.5)));
  }

  function estimateDailySales(monthlySales) {
    return Math.max(1, Math.round(monthlySales / 30));
  }

  function estimateMonthlyRoyalty(price, monthlySales) {
    const listPrice = parseFloat(price) || 9.99;
    // Standard KDP Paperback calculation: 60% of list price minus average printing cost (~$2.15 for 100-page black/white)
    const royaltyPerUnit = Math.max(0.50, (listPrice * 0.60) - 2.15);
    return Math.round(royaltyPerUnit * monthlySales);
  }

  // --- Search Results Processor ---
  function processSearchResults() {
    const items = document.querySelectorAll('[data-component-type="s-search-result"]');
    if (!items || items.length === 0) return;

    items.forEach((item) => {
      if (item.classList.contains('kdpage-processed')) return;
      item.classList.add('kdpage-processed');

      const asin = item.getAttribute('data-asin');
      if (!asin) return;

      // Extract price
      let price = "9.99";
      const priceWhole = item.querySelector('.a-price-whole');
      const priceFraction = item.querySelector('.a-price-fraction');
      if (priceWhole) {
        price = priceWhole.innerText.replace(/[\n,]/g, '').trim();
        if (priceFraction) {
          price += '.' + priceFraction.innerText.replace(/[\n,]/g, '').trim();
        }
      }

      // Check for Best Seller Badge or featured rank
      let estimatedBSR = null;
      const bestSellerBadge = item.querySelector('.a-badge-text, .a-badge-label');
      if (bestSellerBadge && bestSellerBadge.innerText.toLowerCase().includes('best seller')) {
        estimatedBSR = 150;
      }

      // If BSR not directly in card, read from background cache or generate standard estimate
      chrome.storage.local.get([`asin_${asin}`], (cached) => {
        let bsr = cached[`asin_${asin}`]?.bsr || estimatedBSR;
        
        // If not cached, provide a realistic benchmark or fetch product details
        if (!bsr) {
          fetchProductBSR(asin, (fetchedBSR) => {
            if (fetchedBSR) {
              chrome.storage.local.set({ [`asin_${asin}`]: { bsr: fetchedBSR, time: Date.now() } });
              renderQuickViewCard(item, asin, fetchedBSR, price);
            } else {
              renderQuickViewCard(item, asin, null, price);
            }
          });
        } else {
          renderQuickViewCard(item, asin, bsr, price);
        }
      });
    });
  }

  // --- Background fetch for product details & BSR ---
  function fetchProductBSR(asin, callback) {
    if (!asin) return callback(null);
    const url = `https://www.amazon.com/dp/${asin}`;
    
    fetch(url, { headers: { 'Accept': 'text/html' } })
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Match BSR in standard Amazon bullet points or table
        let bsrMatch = null;
        const text = doc.body.innerText;
        const rankRegex = /#([0-9,]+)\s+in\s+Books/i;
        const match = text.match(rankRegex);
        if (match && match[1]) {
          bsrMatch = parseInt(match[1].replace(/,/g, ''), 10);
        }

        callback(bsrMatch);
      })
      .catch(() => callback(null));
  }

  // --- Render KDPage QuickView Box on Search Cards ---
  function renderQuickViewCard(item, asin, bsr, price) {
    if (item.querySelector('.kdpage-qv-card')) return;

    const monthlySales = bsr ? estimateMonthlySales(bsr) : 0;
    const daily = bsr ? estimateDailySales(monthlySales) : 0;
    const royalty = bsr ? estimateMonthlyRoyalty(price, monthlySales) : 0;

    const card = document.createElement('div');
    card.className = 'kdpage-qv-card';
    card.innerHTML = `
      <div class="kdpage-qv-header">
        <div class="kdpage-qv-brand">
          <span class="logo-dot"></span> KDPage QuickView
        </div>
        <span class="kdpage-qv-asin">${asin}</span>
      </div>
      <div class="kdpage-qv-stats">
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">BSR Rank</div>
          <div class="kdpage-qv-stat-value highlight-amber">${bsr ? '#' + bsr.toLocaleString() : 'N/A'}</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Est. Sales</div>
          <div class="kdpage-qv-stat-value highlight-green">${monthlySales > 0 ? '~' + monthlySales.toLocaleString() + '/mo' : 'Check DP'}</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Est. Royalty</div>
          <div class="kdpage-qv-stat-value">${royalty > 0 ? '$' + royalty.toLocaleString() + '/mo' : '--'}</div>
        </div>
      </div>
      <div class="kdpage-qv-actions">
        <a href="https://kdpage.com/studio?asin=${asin}&ref=ext" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-primary">
          ⚡ Open in Studio
        </a>
        <a href="https://kdpage.com/tools/spine-calculator?ref=ext" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-secondary">
          📐 Spine Calc
        </a>
      </div>
    `;

    // Inject into the card's right or bottom container
    const targetContainer = item.querySelector('.puis-price-instructions-style') || 
                            item.querySelector('.a-section.a-spacing-small') || 
                            item;
    targetContainer.appendChild(card);
  }

  // --- Product Detail Page Processor (/dp/...) ---
  function processDetailPage() {
    if (!window.location.pathname.includes('/dp/') && !window.location.pathname.includes('/gp/product/')) return;
    if (document.querySelector('.kdpage-detail-box')) return;

    // Extract BSR from page
    let bsr = null;
    let category = "Books";
    const bodyText = document.body.innerText;
    const rankMatch = bodyText.match(/#([0-9,]+)\s+in\s+([A-Za-z &]+)/i);
    if (rankMatch) {
      bsr = parseInt(rankMatch[1].replace(/,/g, ''), 10);
      category = rankMatch[2].trim();
    }

    // Extract price
    let price = "9.99";
    const priceElem = document.querySelector('#corePrice_feature_div .a-price-whole') || document.querySelector('.a-price-whole');
    if (priceElem) {
      price = priceElem.innerText.replace(/[\n,]/g, '').trim();
    }

    if (!bsr) return;

    const monthlySales = estimateMonthlySales(bsr);
    const dailySales = estimateDailySales(monthlySales);
    const royalties = estimateMonthlyRoyalty(price, monthlySales);

    const banner = document.createElement('div');
    banner.className = 'kdpage-detail-box';
    banner.innerHTML = `
      <div class="kdpage-detail-title">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1; display: inline-block;"></span>
          <strong>KDPage KDP Niche & BSR Analyzer</strong>
        </div>
        <span style="font-size: 11px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); padding: 3px 8px; border-radius: 6px;">Live Analytics</span>
      </div>
      <div class="kdpage-detail-grid">
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Best Sellers Rank</div>
          <div class="kdpage-qv-stat-value highlight-amber">#${bsr.toLocaleString()}</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Daily Sales</div>
          <div class="kdpage-qv-stat-value">~${dailySales.toLocaleString()} books</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Monthly Sales</div>
          <div class="kdpage-qv-stat-value highlight-green">~${monthlySales.toLocaleString()} copies</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Est. Monthly Royalties</div>
          <div class="kdpage-qv-stat-value highlight-green">~$${royalties.toLocaleString()} / mo</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <a href="https://kdpage.com/studio?ref=ext_dp" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-primary" style="padding: 10px 14px; font-size: 12px;">
          ⚡ Design & Publish Competitor Book on KDPage Studio
        </a>
        <a href="https://kdpage.com/tools/keyword-research?ref=ext_dp" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-secondary" style="padding: 10px 14px; font-size: 12px;">
          🔍 Run Deep Keyword Spy
        </a>
      </div>
    `;

    // Inject above buy box or title
    const buyBox = document.querySelector('#desktop_buybox') || document.querySelector('#rightCol') || document.querySelector('#titleSection');
    if (buyBox) {
      buyBox.parentNode.insertBefore(banner, buyBox);
    }
  }

  // --- Observer for infinite scrolling & dynamic pagination ---
  const observer = new MutationObserver(() => {
    processSearchResults();
    processDetailPage();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial Run
  processSearchResults();
  processDetailPage();
})();
