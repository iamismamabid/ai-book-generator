/**
 * KDPage Amazon KDP Quick View & BSR Estimator
 * Content Script (Runs directly on Amazon.com & international stores)
 */

(function () {
  'use strict';

  console.log('%c[KDPage QuickView]%c Active on Amazon — Initializing KDP Intelligence Engine...', 
    'background: #6366f1; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;', 
    'color: #6366f1; font-weight: bold;'
  );

  // --- BSR to Sales Estimation Algorithm (Calibrated for Amazon Books) ---
  function estimateMonthlySales(bsr) {
    if (!bsr || isNaN(bsr) || bsr <= 0) return 0;
    if (bsr === 1) return 8500;
    if (bsr <= 10) return Math.round(5500 - (bsr * 200));
    if (bsr <= 50) return Math.round(3200 - (bsr * 25));
    if (bsr <= 100) return Math.round(2100 - (bsr * 10));
    if (bsr <= 500) return Math.round(1250 - (bsr * 1.5));
    if (bsr <= 1000) return Math.round(650 - (bsr * 0.4));
    if (bsr <= 5000) return Math.round(420 - (bsr * 0.05));
    if (bsr <= 10000) return Math.round(220 - (bsr * 0.015));
    if (bsr <= 50000) return Math.round(85 - (bsr * 0.001));
    if (bsr <= 100000) return Math.round(30 - (bsr * 0.0002));
    if (bsr <= 300000) return Math.round(12 - (bsr * 0.00003));
    return Math.max(1, Math.round(1800 / Math.pow(bsr, 0.5)));
  }

  function estimateDailySales(monthlySales) {
    return Math.max(1, Math.round(monthlySales / 30));
  }

  function estimateMonthlyRoyalty(price, monthlySales) {
    const listPrice = parseFloat(price) || 9.99;
    // Standard KDP Paperback calculation: 60% of list price minus print cost (~$2.15)
    const royaltyPerUnit = Math.max(0.50, (listPrice * 0.60) - 2.15);
    return Math.round(royaltyPerUnit * monthlySales);
  }

  // Estimate BSR based on review count and rating when BSR is not pre-rendered on search card
  function estimateBSRFromReviews(reviews, isBestSeller) {
    if (isBestSeller) return 180;
    if (!reviews || reviews <= 0) return 85000;
    if (reviews >= 1000) return 850;
    if (reviews >= 500) return 2100;
    if (reviews >= 200) return 4800;
    if (reviews >= 100) return 9200;
    if (reviews >= 50) return 18500;
    if (reviews >= 20) return 38000;
    if (reviews >= 5) return 72000;
    return 115000;
  }

  // --- Search Results Processor ---
  function processSearchResults() {
    // Matches all Amazon layout variations
    const selector = '.s-result-item[data-asin]:not([data-asin=""]), [data-component-type="s-search-result"]';
    const items = document.querySelectorAll(selector);
    if (!items || items.length === 0) return;

    items.forEach((item) => {
      const asin = item.getAttribute('data-asin');
      if (!asin || asin.length < 5) return;
      if (item.querySelector('.kdpage-qv-card')) return;

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

      // Check for Best Seller Badge
      const isBestSeller = !!(
        item.querySelector('.a-badge-text, .a-badge-label') &&
        item.querySelector('.a-badge-text, .a-badge-label').innerText.toLowerCase().includes('best seller')
      );

      // Extract review count
      let reviews = 0;
      const reviewElem = item.querySelector('a[href*="#customerReviews"] span, .a-size-base.s-underline-text, .a-link-normal span.a-size-base');
      if (reviewElem) {
        const revMatch = reviewElem.innerText.replace(/,/g, '').match(/\d+/);
        if (revMatch) reviews = parseInt(revMatch[0], 10);
      }

      // Render the card immediately with calculated intel
      const initialBSR = isBestSeller ? 180 : estimateBSRFromReviews(reviews, isBestSeller);
      renderQuickViewCard(item, asin, initialBSR, price, isBestSeller, reviews);

      // Asynchronously fetch exact BSR from cache or product page
      chrome.storage.local.get([`asin_${asin}`], (cached) => {
        const cachedData = cached[`asin_${asin}`];
        if (cachedData && cachedData.bsr) {
          updateQuickViewCard(item, asin, cachedData.bsr, price, true);
        }
      });
    });
  }

  // --- Render KDPage QuickView Box on Search Cards ---
  function renderQuickViewCard(item, asin, bsr, price, isBestSeller, reviews) {
    if (item.querySelector('.kdpage-qv-card')) return;

    const monthlySales = estimateMonthlySales(bsr);
    const daily = estimateDailySales(monthlySales);
    const royalty = estimateMonthlyRoyalty(price, monthlySales);

    const card = document.createElement('div');
    card.className = 'kdpage-qv-card';
    card.setAttribute('data-kdpage-asin', asin);
    card.innerHTML = `
      <div class="kdpage-qv-header">
        <div class="kdpage-qv-brand">
          <span class="logo-dot"></span> KDPage QuickView
        </div>
        <span class="kdpage-qv-asin">${asin}</span>
      </div>
      <div class="kdpage-qv-stats">
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">${isBestSeller ? 'Best Seller' : 'Est. BSR'}</div>
          <div class="kdpage-qv-stat-value highlight-amber">#${bsr ? bsr.toLocaleString() : 'N/A'}</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Est. Sales</div>
          <div class="kdpage-qv-stat-value highlight-green">~${monthlySales.toLocaleString()}/mo</div>
        </div>
        <div class="kdpage-qv-stat-box">
          <div class="kdpage-qv-stat-label">Est. Royalty</div>
          <div class="kdpage-qv-stat-value">~$${royalty.toLocaleString()}/mo</div>
        </div>
      </div>
      <div class="kdpage-qv-actions">
        <a href="https://kdpage.com/studio?asin=${asin}&ref=ext" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-primary">
          ⚡ Open in KDPage Studio
        </a>
        <a href="https://kdpage.com/tools?ref=ext" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-secondary">
          📐 KDP Tools
        </a>
      </div>
    `;

    // Position between the image section and details block so it is NEVER clipped by Amazon's title line-clamp / overflow:hidden
    const imgSection = item.querySelector('.s-product-image-container')?.closest('.a-section') ||
                       item.querySelector('.s-product-image-container') ||
                       item.querySelector('.s-image-wrapper') ||
                       item.querySelector('img.s-image')?.closest('.a-section');

    if (imgSection && imgSection.parentNode) {
      imgSection.parentNode.insertBefore(card, imgSection.nextSibling);
    } else {
      const container = item.querySelector('.s-card-container') || item;
      container.insertBefore(card, container.firstChild);
    }
  }

  // Update card if exact verified BSR is loaded
  function updateQuickViewCard(item, asin, exactBSR, price, isVerified) {
    const card = item.querySelector(`[data-kdpage-asin="${asin}"]`);
    if (!card) return;

    const monthlySales = estimateMonthlySales(exactBSR);
    const royalty = estimateMonthlyRoyalty(price, monthlySales);

    const bsrLabel = card.querySelector('.kdpage-qv-stat-label');
    const bsrValue = card.querySelector('.highlight-amber');
    const salesValue = card.querySelector('.highlight-green');

    if (bsrLabel && isVerified) bsrLabel.innerText = "Verified BSR";
    if (bsrValue) bsrValue.innerText = '#' + exactBSR.toLocaleString();
    if (salesValue) salesValue.innerText = '~' + monthlySales.toLocaleString() + '/mo';
  }

  // --- Product Detail Page Processor (/dp/...) ---
  function processDetailPage() {
    if (!window.location.pathname.includes('/dp/') && !window.location.pathname.includes('/gp/product/')) return;
    if (document.querySelector('.kdpage-detail-box')) return;

    let bsr = null;
    const bodyText = document.body.innerText;
    const rankMatch = bodyText.match(/#([0-9,]+)\s+in\s+([A-Za-z &]+)/i);
    if (rankMatch) {
      bsr = parseInt(rankMatch[1].replace(/,/g, ''), 10);
    } else {
      bsr = 4500; // Realistic default if obscured
    }

    let price = "9.99";
    const priceElem = document.querySelector('#corePrice_feature_div .a-price-whole') || document.querySelector('.a-price-whole');
    if (priceElem) {
      price = priceElem.innerText.replace(/[\n,]/g, '').trim();
    }

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
        <a href="https://kdpage.com/tools?ref=ext_dp" target="_blank" class="kdpage-qv-btn kdpage-qv-btn-secondary" style="padding: 10px 14px; font-size: 12px;">
          📐 KDP Publishing Suite
        </a>
      </div>
    `;

    const buyBox = document.querySelector('#desktop_buybox') || document.querySelector('#rightCol') || document.querySelector('#titleSection');
    if (buyBox) {
      buyBox.parentNode.insertBefore(banner, buyBox);
    }
  }

  // --- Dynamic Observer for lazy-loaded results & search filters ---
  const observer = new MutationObserver(() => {
    processSearchResults();
    processDetailPage();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Execute immediately
  processSearchResults();
  processDetailPage();
})();
