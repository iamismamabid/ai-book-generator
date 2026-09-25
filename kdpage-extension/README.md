# KDPage — Amazon KDP Quick View & BSR Estimator (Chrome Extension)

Official Chrome Extension for **KDPage** (https://kdpage.com).

## 🚀 Key Features
1. **Live Amazon QuickView Badges:**
   - Automatically overlays BSR (Best Sellers Rank) directly on Amazon.com search results.
   - Calculates **Estimated Monthly Sales** and **Daily Sales** using calibrated KDP curves.
   - Calculates **Estimated Monthly Royalties** (accounting for standard Amazon 60% royalty and print costs).
2. **1-Click Publisher Workflows:**
   - **Open in Studio:** Instantly open KDPage Studio to design competitor books.
   - **Spine Calculator:** 1-click jump to KDPage Spine & Cover Calculator.
3. **Product Detail Page Analyzer:**
   - Displays full niche rank, daily sales velocity, and revenue benchmarks above the Amazon Buy Box.
4. **Standalone Popup Calculator:**
   - Click the extension icon in Chrome toolbar to calculate sales for any custom BSR in seconds.

---

## 🛠️ How to Install & Test Locally (Developer Mode)

1. Open Google Chrome.
2. In the URL bar, go to:
   ```text
   chrome://extensions/
   ```
3. In the top right corner, toggle on **"Developer mode"**.
4. Click the button **"Load unpacked"** (top left).
5. Select this folder:
   ```text
   C:\Projects\ai-book-generator\kdpage-extension
   ```
6. The extension is now active!
7. Open **https://www.amazon.com** and search for:
   `sudoku puzzle book for adults` or `coloring book`
8. You will see the sleek **KDPage QuickView** boxes appear directly under each book!

---

## 📦 How to Publish on the Chrome Web Store

1. Zip the contents of the `kdpage-extension` folder (excluding git files).
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Pay the $5 one-time Google developer fee (if not already done).
4. Click **"New Item"** $\rightarrow$ Upload the zip file.
5. Add screenshots and description.
6. Click **"Submit for Review"** (typically approved within 24-72 hours).
