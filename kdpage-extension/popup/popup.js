// KDPage Extension Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const bsrInput = document.getElementById('bsrInput');
  const calcBtn = document.getElementById('calcBtn');
  const dailySalesVal = document.getElementById('dailySalesVal');
  const monthlySalesVal = document.getElementById('monthlySalesVal');
  const royaltiesVal = document.getElementById('royaltiesVal');

  function calculateSales(bsr) {
    if (!bsr || isNaN(bsr) || bsr <= 0) return { daily: 0, monthly: 0, royalty: 0 };
    
    let monthly = 0;
    if (bsr === 1) monthly = 7500;
    else if (bsr <= 10) monthly = Math.round(5000 - (bsr * 200));
    else if (bsr <= 50) monthly = Math.round(3000 - (bsr * 25));
    else if (bsr <= 100) monthly = Math.round(2000 - (bsr * 10));
    else if (bsr <= 500) monthly = Math.round(1200 - (bsr * 1.5));
    else if (bsr <= 1000) monthly = Math.round(600 - (bsr * 0.4));
    else if (bsr <= 5000) monthly = Math.round(400 - (bsr * 0.05));
    else if (bsr <= 10000) monthly = Math.round(200 - (bsr * 0.015));
    else if (bsr <= 50000) monthly = Math.round(75 - (bsr * 0.001));
    else if (bsr <= 100000) monthly = Math.round(25 - (bsr * 0.0002));
    else if (bsr <= 300000) monthly = Math.round(10 - (bsr * 0.00003));
    else monthly = Math.max(1, Math.round(1500 / Math.pow(bsr, 0.5)));

    const daily = Math.max(1, Math.round(monthly / 30));
    // Standard $9.99 paperback: 60% - $2.15 print cost = ~$3.84 royalty
    const royalty = Math.round(monthly * 3.84);

    return { daily, monthly, royalty };
  }

  function updateDisplay() {
    const bsr = parseInt(bsrInput.value, 10);
    const { daily, monthly, royalty } = calculateSales(bsr);
    
    dailySalesVal.textContent = `~${daily.toLocaleString()} books`;
    monthlySalesVal.textContent = `~${monthly.toLocaleString()} copies`;
    royaltiesVal.textContent = `~$${royalty.toLocaleString()} / mo`;
  }

  calcBtn.addEventListener('click', updateDisplay);
  bsrInput.addEventListener('input', updateDisplay);

  // Initial Calculation
  updateDisplay();
});
