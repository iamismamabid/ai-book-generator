"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  BookOpen, 
  Sparkles, 
  Download,
  CheckCircle2,
  HelpCircle,
  Shield,
  Zap,
  Sliders,
  Printer
} from "lucide-react";

// Parity pattern mappings for EAN-13 (left 6 digits, based on 1st digit)
const EAN13_PARITY = [
  ["L", "L", "L", "L", "L", "L"], // 0
  ["L", "L", "G", "L", "G", "G"], // 1
  ["L", "L", "G", "G", "L", "G"], // 2
  ["L", "L", "G", "G", "G", "L"], // 3
  ["L", "G", "L", "L", "G", "G"], // 4
  ["L", "G", "G", "L", "L", "G"], // 5
  ["L", "G", "G", "G", "L", "L"], // 6
  ["L", "G", "L", "G", "L", "G"], // 7
  ["L", "G", "L", "G", "G", "L"], // 8
  ["L", "G", "G", "L", "G", "G"], // 9
];

// Binary digit encoding patterns
const L_CODE = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"
];

const G_CODE = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"
];

const R_CODE = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"
];

// EAN-5 price supplement parity pattern (based on checksum d1..d5)
const EAN5_PARITY = [
  ["G", "G", "L", "L", "L"], // 0
  ["G", "L", "G", "L", "L"], // 1
  ["G", "L", "L", "G", "L"], // 2
  ["G", "L", "L", "L", "G"], // 3
  ["L", "G", "G", "L", "L"], // 4
  ["L", "L", "G", "G", "L"], // 5
  ["L", "L", "L", "G", "G"], // 6
  ["L", "G", "L", "G", "L"], // 7
  ["L", "G", "L", "L", "G"], // 8
  ["L", "L", "G", "L", "G"], // 9
];

interface BarcodeMetadata {
  isbn: string;
  ean13Digits: string;
  ean5Digits: string;
  isValid: boolean;
  error: string;
  conversionMsg: string;
}

export default function IsbnGenerator() {
  // Input settings state
  const [rawIsbnInput, setRawIsbnInput] = useState("978-1-86197-876-9");
  const [addPriceCode, setAddPriceCode] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [priceInput, setPriceInput] = useState("14.99");
  
  // Customization state
  const [barcodeSize, setBarcodeSize] = useState<"standard" | "large" | "small">("standard");
  const [barColor, setBarColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showTextBelow, setShowTextBelow] = useState(true);

  // Output details
  const [meta, setMeta] = useState<BarcodeMetadata>({
    isbn: "978-1-86197-876-9",
    ean13Digits: "9781861978769",
    ean5Digits: "",
    isValid: true,
    error: "",
    conversionMsg: "",
  });

  const [copiedText, setCopiedText] = useState(false);

  // Trigger barcode math when inputs change
  useEffect(() => {
    validateAndCompute();
  }, [rawIsbnInput, addPriceCode, currency, priceInput]);

  const validateAndCompute = () => {
    let clean = rawIsbnInput.replace(/[- ]/g, "").toUpperCase();
    let isbnOut = rawIsbnInput;
    let ean13 = "";
    let ean5 = "";
    let errorMsg = "";
    let conversionMsg = "";
    let isValid = false;

    // 1. Check for ISBN-10 conversion
    if (clean.length === 10) {
      const first9 = clean.substring(0, 9);
      if (/^\d{9}$/.test(first9)) {
        // Calculate modulo-10 check digit for "978" + first9
        const combined = "978" + first9;
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          const val = parseInt(combined[i]);
          sum += (i % 2 === 0) ? val : val * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        clean = combined + checkDigit;
        
        // Format ISBN-13
        isbnOut = `978-${first9.substring(0, 1)}-${first9.substring(1, 4)}-${first9.substring(4, 9)}-${checkDigit}`;
        conversionMsg = `Converted from ISBN-10: ${rawIsbnInput} to ISBN-13`;
      }
    }

    // 2. Validate clean ISBN-13 format
    if (clean.length !== 13) {
      errorMsg = "ISBN must be 10 or 13 digits (excluding dashes)";
    } else if (!/^\d{13}$/.test(clean)) {
      errorMsg = "ISBN must contain numbers only";
    } else {
      // Validate Modulo-10 checksum
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const val = parseInt(clean[i]);
        sum += (i % 2 === 0) ? val : val * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      const actualCheckDigit = parseInt(clean[12]);

      if (checkDigit !== actualCheckDigit) {
        errorMsg = `Invalid checksum digit. Calculated check digit should be ${checkDigit}`;
      } else {
        isValid = true;
        ean13 = clean;
      }
    }

    // 3. Compute Price supplement (EAN-5)
    if (addPriceCode) {
      const priceVal = parseFloat(priceInput);
      if (isNaN(priceVal) || priceVal < 0 || priceVal > 99.99) {
        errorMsg = errorMsg || "Invalid price. Enter a value like 14.99 (Max 99.99)";
      } else {
        let currencyPrefix = "5"; // USD
        if (currency === "GBP") currencyPrefix = "4";
        if (currency === "EUR") currencyPrefix = "1";
        if (currency === "CAD") currencyPrefix = "6";
        if (currency === "AUD") currencyPrefix = "3";

        // Convert to cents string, e.g. 14.99 -> 1499
        const cents = Math.round(priceVal * 100).toString().padStart(4, "0");
        ean5 = currencyPrefix + cents;
      }
    }

    setMeta({
      isbn: isbnOut,
      ean13Digits: ean13,
      ean5Digits: ean5,
      isValid: isValid && (!addPriceCode || ean5.length === 5),
      error: errorMsg,
      conversionMsg,
    });
  };

  // Binary sequence compilers
  const getEan13Binary = (digits: string): string[] => {
    if (digits.length !== 13) return [];
    const firstDigit = parseInt(digits[0]);
    const parity = EAN13_PARITY[firstDigit];

    let bits: string[] = [];
    
    // Start guard: 101
    bits.push("1", "0", "1");

    // Left 6 digits
    for (let i = 0; i < 6; i++) {
      const val = parseInt(digits[i + 1]);
      const codeType = parity[i];
      if (codeType === "L") {
        bits.push(...L_CODE[val].split(""));
      } else {
        bits.push(...G_CODE[val].split(""));
      }
    }

    // Center guard: 01010
    bits.push("0", "1", "0", "1", "0");

    // Right 6 digits
    for (let i = 0; i < 6; i++) {
      const val = parseInt(digits[i + 7]);
      bits.push(...R_CODE[val].split(""));
    }

    // End guard: 101
    bits.push("1", "0", "1");

    return bits;
  };

  const getEan5Binary = (digits: string): string[] => {
    if (digits.length !== 5) return [];
    
    // Calculate parity
    const d1 = parseInt(digits[0]);
    const d2 = parseInt(digits[1]);
    const d3 = parseInt(digits[2]);
    const d4 = parseInt(digits[3]);
    const d5 = parseInt(digits[4]);
    
    const sum = (d1 * 3) + (d2 * 9) + (d3 * 3) + (d4 * 9) + (d5 * 3);
    const parityVal = sum % 10;
    const parityPattern = EAN5_PARITY[parityVal];

    let bits: string[] = [];

    // Start guard: 01011
    bits.push("0", "1", "0", "1", "1");

    for (let i = 0; i < 5; i++) {
      const val = parseInt(digits[i]);
      const codeType = parityPattern[i];
      
      if (codeType === "L") {
        bits.push(...L_CODE[val].split(""));
      } else {
        bits.push(...G_CODE[val].split(""));
      }

      // Delimiter after d1..d4, not d5
      if (i < 4) {
        bits.push("0", "1");
      }
    }

    return bits;
  };

  // Dimensions based on sizes
  const getScaleMultiplier = () => {
    switch (barcodeSize) {
      case "small":
        return 0.8;
      case "large":
        return 1.25;
      case "standard":
      default:
        return 1.0;
    }
  };

  const scale = getScaleMultiplier();
  const moduleW = 1.4 * scale; 
  const ean13Width = 95 * moduleW;
  const ean5Width = 48 * moduleW;
  
  // Layout spacing
  const startX = 25 * scale;
  const gap = 12 * scale; // gap between EAN-13 and EAN-5
  const ean5StartX = startX + ean13Width + gap;
  
  // Total canvas dims
  const svgWidth = addPriceCode 
    ? startX + ean13Width + gap + ean5Width + 25 * scale
    : startX + ean13Width + 25 * scale;

  const svgHeight = 150 * scale;

  // Compile Barcode Paths for rendering
  const ean13Binary = getEan13Binary(meta.ean13Digits);
  const ean5Binary = getEan5Binary(meta.ean5Digits);

  // Generate SVG Element directly for rendering and downloads
  const renderSvgContent = () => {
    if (!meta.isValid || ean13Binary.length === 0) {
      return (
        <g>
          <rect width="100%" height="100%" fill="#111827" rx="10" />
          <text x="50%" y="50%" fill="#9ca3af" fontSize="12" fontWeight="bold" textAnchor="middle">
            Enter valid ISBN to preview
          </text>
        </g>
      );
    }

    const elements: React.JSX.Element[] = [];

    // Background
    elements.push(
      <rect key="bg" width="100%" height="100%" fill={bgColor} />
    );

    // Human Readable ISBN Text at the very top (EAN-13 standard is above the bars)
    elements.push(
      <text
        key="isbn-top-text"
        x={addPriceCode ? startX : startX + ean13Width / 2}
        y={22 * scale}
        fill={barColor}
        fontSize={11 * scale}
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
        textAnchor={addPriceCode ? "start" : "middle"}
      >
        ISBN {meta.isbn}
      </text>
    );

    // Draw EAN-13 Bars
    // Normal data bars run from y=28 to y=115
    // Extended guard bars (start, center, end guards) run from y=28 to y=125
    const barTop = 28 * scale;
    const barHeightNormal = 87 * scale;
    const barHeightGuard = 97 * scale;

    for (let i = 0; i < ean13Binary.length; i++) {
      if (ean13Binary[i] === "1") {
        const xPos = startX + i * moduleW;
        
        // Check if extended guard bar
        const isGuard = 
          i < 3 || // Start guard
          (i >= 45 && i < 50) || // Center guard
          i >= 92; // End guard
        
        const h = isGuard ? barHeightGuard : barHeightNormal;

        elements.push(
          <rect
            key={`ean13-bar-${i}`}
            x={xPos}
            y={barTop}
            width={moduleW}
            height={h}
            fill={barColor}
          />
        );
      }
    }

    // Human Readable Digits below EAN-13 bars (in gaps of extended guards)
    if (showTextBelow) {
      // 1st digit d1 (to the left of start guard)
      elements.push(
        <text
          key="ean13-d1"
          x={startX - 8 * scale}
          y={125 * scale}
          fill={barColor}
          fontSize={12 * scale}
          fontWeight="bold"
          fontFamily="Courier New, monospace"
        >
          {meta.ean13Digits[0]}
        </text>
      );

      // Left 6 digits (d2..d7) spaced under the left half
      for (let i = 0; i < 6; i++) {
        const xPos = startX + (3 + i * 7 + 3.5) * moduleW;
        elements.push(
          <text
            key={`ean13-left-digit-${i}`}
            x={xPos}
            y={125 * scale}
            fill={barColor}
            fontSize={12 * scale}
            fontWeight="bold"
            fontFamily="Courier New, monospace"
            textAnchor="middle"
          >
            {meta.ean13Digits[i + 1]}
          </text>
        );
      }

      // Right 6 digits (d8..d13) spaced under the right half
      for (let i = 0; i < 6; i++) {
        const xPos = startX + (50 + i * 7 + 3.5) * moduleW;
        elements.push(
          <text
            key={`ean13-right-digit-${i}`}
            x={xPos}
            y={125 * scale}
            fill={barColor}
            fontSize={12 * scale}
            fontWeight="bold"
            fontFamily="Courier New, monospace"
            textAnchor="middle"
          >
            {meta.ean13Digits[i + 7]}
          </text>
        );
      }
    }

    // Draw EAN-5 Price Supplement (if active)
    if (addPriceCode && ean5Binary.length > 0) {
      // EAN-5 supplement text (printed above the bars, at y=20)
      elements.push(
        <text
          key="ean5-price-text"
          x={ean5StartX + ean5Width}
          y={22 * scale}
          fill={barColor}
          fontSize={10 * scale}
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="end"
        >
          {currency} {priceInput}
        </text>
      );

      // EAN-5 bars run from y=32 to y=115 (all same height, no extended guard bars)
      const ean5BarTop = 32 * scale;
      const ean5BarHeight = 83 * scale;

      for (let i = 0; i < ean5Binary.length; i++) {
        if (ean5Binary[i] === "1") {
          const xPos = ean5StartX + i * moduleW;
          elements.push(
            <rect
              key={`ean5-bar-${i}`}
              x={xPos}
              y={ean5BarTop}
              width={moduleW}
              height={ean5BarHeight}
              fill={barColor}
            />
          );
        }
      }

      // Raw EAN-5 digits printed below the supplement bars
      if (showTextBelow) {
        for (let i = 0; i < 5; i++) {
          const xPos = ean5StartX + (5 + i * 9 + 3.5) * moduleW;
          elements.push(
            <text
              key={`ean5-digit-${i}`}
              x={xPos}
              y={125 * scale}
              fill={barColor}
              fontSize={10 * scale}
              fontWeight="bold"
              fontFamily="Courier New, monospace"
              textAnchor="middle"
            >
              {meta.ean5Digits[i]}
            </text>
          );
        }
      }
    }

    return elements;
  };

  // Compile full XML SVG string
  const compileSvgString = (): string => {
    const contentHtml = React.JSX.Element ? "" : ""; // placeholder
    // We construct a raw string to ensure clean downloads
    let barsContent = "";
    
    // Background rect
    barsContent += `<rect width="100%" height="100%" fill="${bgColor}" />`;
    
    // Top ISBN text
    barsContent += `<text x="${addPriceCode ? startX : startX + ean13Width / 2}" y="${22 * scale}" fill="${barColor}" font-size="${11 * scale}" font-weight="bold" font-family="Arial, Helvetica, sans-serif" text-anchor="${addPriceCode ? "start" : "middle"}">ISBN ${meta.isbn}</text>`;

    // EAN-13 bars
    const barTop = 28 * scale;
    const barHeightNormal = 87 * scale;
    const barHeightGuard = 97 * scale;

    for (let i = 0; i < ean13Binary.length; i++) {
      if (ean13Binary[i] === "1") {
        const xPos = startX + i * moduleW;
        const isGuard = i < 3 || (i >= 45 && i < 50) || i >= 92;
        const h = isGuard ? barHeightGuard : barHeightNormal;
        barsContent += `<rect x="${xPos}" y="${barTop}" width="${moduleW}" height="${h}" fill="${barColor}" />`;
      }
    }

    // EAN-13 digits below
    if (showTextBelow) {
      barsContent += `<text x="${startX - 8 * scale}" y="${125 * scale}" fill="${barColor}" font-size="${12 * scale}" font-weight="bold" font-family="Courier New, monospace">${meta.ean13Digits[0]}</text>`;
      
      for (let i = 0; i < 6; i++) {
        const xPos = startX + (3 + i * 7 + 3.5) * moduleW;
        barsContent += `<text x="${xPos}" y="${125 * scale}" fill="${barColor}" font-size="${12 * scale}" font-weight="bold" font-family="Courier New, monospace" text-anchor="middle">${meta.ean13Digits[i + 1]}</text>`;
      }

      for (let i = 0; i < 6; i++) {
        const xPos = startX + (50 + i * 7 + 3.5) * moduleW;
        barsContent += `<text x="${xPos}" y="${125 * scale}" fill="${barColor}" font-size="${12 * scale}" font-weight="bold" font-family="Courier New, monospace" text-anchor="middle">${meta.ean13Digits[i + 7]}</text>`;
      }
    }

    // EAN-5 Price supplement
    if (addPriceCode && ean5Binary.length > 0) {
      barsContent += `<text x="${ean5StartX + ean5Width}" y="${22 * scale}" fill="${barColor}" font-size="${10 * scale}" font-weight="bold" font-family="Arial, Helvetica, sans-serif" text-anchor="end">${currency} ${priceInput}</text>`;
      
      const ean5BarTop = 32 * scale;
      const ean5BarHeight = 83 * scale;

      for (let i = 0; i < ean5Binary.length; i++) {
        if (ean5Binary[i] === "1") {
          const xPos = ean5StartX + i * moduleW;
          barsContent += `<rect x="${xPos}" y="${ean5BarTop}" width="${moduleW}" height="${ean5BarHeight}" fill="${barColor}" />`;
        }
      }

      if (showTextBelow) {
        for (let i = 0; i < 5; i++) {
          const xPos = ean5StartX + (5 + i * 9 + 3.5) * moduleW;
          barsContent += `<text x="${xPos}" y="${125 * scale}" fill="${barColor}" font-size="${10 * scale}" font-weight="bold" font-family="Courier New, monospace" text-anchor="middle">${meta.ean5Digits[i]}</text>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">${barsContent}</svg>`;
  };

  // Download SVG Action
  const downloadSvg = () => {
    const svgStr = compileSvgString();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `isbn-barcode-${meta.ean13Digits}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download PNG Action (300 DPI high resolution via Canvas scale)
  const downloadPng = () => {
    const svgStr = compileSvgString();
    
    // We scale the canvas by 4.16x to output at 300 DPI relative to screen CSS resolution
    const dpiScale = 4.16;
    const canvas = document.createElement("canvas");
    canvas.width = svgWidth * dpiScale;
    canvas.height = svgHeight * dpiScale;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Load SVG blob
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    img.src = url;
    img.onload = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image scaled
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const pngUrl = canvas.toDataURL("image/png");
      
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `isbn-barcode-${meta.ean13Digits}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    };
  };

  // Copy EAN-13 digits to clipboard
  const handleCopyDigits = () => {
    navigator.clipboard.writeText(meta.ean13Digits);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Pixel dimensions computation at 300 DPI
  const pixelWidth = Math.round(svgWidth * 4.16);
  const pixelHeight = Math.round(svgHeight * 4.16);
  const inchWidth = (pixelWidth / 300).toFixed(2);
  const inchHeight = (pixelHeight / 300).toFixed(2);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 100% Free Tool
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Free ISBN Barcode Generator for Book Covers
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Generate print-ready ISBN-13 barcodes for your book's back cover. 300 DPI export, check digit validation, optional price supplement.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            "300 DPI print-ready",
            "ISBN-13 validated",
            "EAN-5 price code",
            "Free forever",
            "No watermark"
          ].map((badge) => (
            <div 
              key={badge} 
              className="bg-slate-900/40 border border-slate-900 px-4 py-3 rounded-2xl text-center text-xs font-bold text-slate-300 flex items-center justify-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {badge}
            </div>
          ))}
        </div>

        {/* Main interactive panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-6 backdrop-blur-md">
              
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" /> Generator Settings
              </h3>

              {/* ISBN Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  ISBN-13 Number
                </label>
                <input
                  type="text"
                  value={rawIsbnInput}
                  onChange={(e) => setRawIsbnInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g., 978-9-78987-985-4"
                />
                
                {meta.conversionMsg && (
                  <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {meta.conversionMsg}
                  </div>
                )}

                {meta.error && (
                  <div className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    {meta.error}
                  </div>
                )}
              </div>

              {/* Price Code Supplement Toggle */}
              <div className="space-y-4 pt-2 border-t border-slate-900">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addPriceCode}
                    onChange={(e) => setAddPriceCode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-900 focus:ring-indigo-500 focus:ring-offset-slate-950"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 select-none">
                    Add price barcode (EAN-5 supplement)
                  </span>
                </label>

                {addPriceCode && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Currency
                      </span>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Price
                      </span>
                      <input
                        type="text"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="e.g. 14.99"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode Size */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Barcode Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "standard", "large"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setBarcodeSize(sz)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        barcodeSize === sz
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customizer */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Bar color
                  </span>
                  <div className="flex gap-2 items-center bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                    <input
                      type="color"
                      value={barColor}
                      onChange={(e) => setBarColor(e.target.value)}
                      className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">{barColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Background
                  </span>
                  <div className="flex gap-2 items-center bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Extra toggles */}
              <div className="pt-2 border-t border-slate-900">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTextBelow}
                    onChange={(e) => setShowTextBelow(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-900 focus:ring-indigo-500 focus:ring-offset-slate-950"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 select-none">
                    Show ISBN text below barcode
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* Render/Output Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/40 rounded-[2rem] border border-indigo-900/30 p-8 space-y-6 relative overflow-hidden backdrop-blur-md flex flex-col">
              
              <h3 className="text-lg font-black text-white">Generated Barcode</h3>

              {/* Visual render area */}
              <div 
                className="w-full flex items-center justify-center p-8 rounded-2xl border border-slate-900 bg-slate-950/60 min-h-[220px]"
                style={{ backgroundColor: bgColor }}
              >
                <div className="max-w-full overflow-auto p-4 flex items-center justify-center">
                  <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="block"
                    style={{ minWidth: svgWidth, height: svgHeight }}
                  >
                    {renderSvgContent()}
                  </svg>
                </div>
              </div>

              {/* Export details */}
              {meta.isValid && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-900 p-5 rounded-2xl text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block">Target Dimensions</span>
                    <span className="font-mono text-white font-bold block text-sm">
                      {pixelWidth} x {pixelHeight} px | {inchWidth}" x {inchHeight}" at 300 DPI
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyDigits}
                      className="px-3.5 py-2 border border-slate-800 text-slate-300 font-bold hover:text-white rounded-xl transition flex items-center gap-1.5"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </>
                      )}
                    </button>

                    <button
                      onClick={downloadSvg}
                      className="px-3.5 py-2 border border-slate-800 text-slate-300 font-bold hover:text-white rounded-xl transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download SVG
                    </button>

                    <button
                      onClick={downloadPng}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Download PNG (300 DPI)
                    </button>
                  </div>
                </div>
              )}

              {/* Help tip */}
              <div className="flex items-start gap-2.5 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-2xl text-xs leading-relaxed font-semibold">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The supplement barcode (EAN-5) contains pricing information used by scanners in large bookstores. 
                  If you are publishing on Amazon KDP, pricing supplement barcodes are fully optional but recommended for bookstore distribution.
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Content Section: How it works */}
        <section className="border-t border-slate-900 pt-16">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              ★ Blueprints
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-300 text-sm font-semibold max-w-md mx-auto">
              Three simple steps to a print-ready book barcode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all text-center">
              <div className="w-12 h-12 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-black text-lg mx-auto">1</div>
              <h3 className="text-white font-bold text-lg">Enter your ISBN</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Type or paste your ISBN-13 number. Our generator validates the modulo-10 check digit automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all text-center">
              <div className="w-12 h-12 bg-purple-500/15 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 font-black text-lg mx-auto">2</div>
              <h3 className="text-white font-bold text-lg">Customize Layout</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Adjust sizing scale, pick color schemes matching your cover, and optionally add a currency pricing supplement.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 hover:border-slate-800 transition-all text-center">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-black text-lg mx-auto">3</div>
              <h3 className="text-white font-bold text-lg">Download Barcode</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Export as 300 DPI vector SVG or print-ready PNG. Place it directly onto your back cover design and publish.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section: ISBN vs UPC */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-900 pt-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">ISBN vs UPC — Which Do You Need?</h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Publishing a book requires specific barcode formats. While general retail items use UPC codes, books require Bookland EAN barcodes mapped from their unique International Standard Book Number (ISBN).
            </p>

            <div className="bg-slate-900/25 border border-slate-900 p-6 rounded-2xl space-y-3">
              <h4 className="font-bold text-indigo-400 text-sm">ISBN-13 (Bookland EAN)</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                The international standard for book products. A 13-digit number prefixed with 978 or 979, which is translated directly into a Bookland EAN-13 barcode block. Perfect for Amazon KDP, IngramSpark, and global distribution.
              </p>
            </div>
          </div>

          <div className="space-y-6 bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Comparison Quick Sheet
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="border-b border-slate-900 pb-3">
                <span className="text-white font-bold block mb-1">EAN-13 (Bookland)</span>
                <span className="text-slate-400 leading-relaxed block">
                  Mandatory for all books. Starts with 978/979. Allows price code supplement.
                </span>
              </div>

              <div className="border-b border-slate-900 pb-3">
                <span className="text-white font-bold block mb-1">UPC-A Codes</span>
                <span className="text-slate-400 leading-relaxed block">
                  For retail items (toys, apparel, groceries). 12 digits, no book metadata integration.
                </span>
              </div>

              <div>
                <span className="text-white font-bold block mb-1">EAN-5 Supplement</span>
                <span className="text-slate-400 leading-relaxed block">
                  Optional 5-digit code encoding price. Standardized currency prefixes (5=USD, 4=GBP, etc.).
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section: Where to get ISBN */}
        <section className="bg-slate-900/20 border border-slate-900/50 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-black text-white">Where to Get an ISBN</h2>
            <p className="text-slate-500 text-sm font-semibold">
              ISBNs are distributed by official national agencies. Each country has its own authorized provider.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { country: "United States", provider: "Bowker", url: "myidentifiers.com" },
              { country: "United Kingdom", provider: "Nielsen BookData", url: "nielsenisbnstore.com" },
              { country: "Canada", provider: "Library & Archives Canada", url: "bac-lac.gc.ca (Free)" },
              { country: "Australia", provider: "Thorpe-Bowker", url: "myidentifiers.com.au" },
              { country: "Germany", provider: "MVB / VLB", url: "german-isbn.de" },
              { country: "France", provider: "AFNIL", url: "afnil.org" }
            ].map((agency) => (
              <div key={agency.country} className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">{agency.country}</span>
                <span className="text-white font-bold text-sm block">{agency.provider}</span>
                <span className="text-xs text-slate-500 font-mono block mt-2 hover:text-indigo-400 transition-colors">
                  {agency.url}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Features list */}
        <section className="space-y-10">
          <h2 className="text-2xl font-black text-white text-center">Everything You Need for Book Barcodes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Check Digit Validation", desc: "Automatic ISBN-13 modulo-10 check digit verification. Catch typos before printing." },
              { title: "300 DPI Print-Ready", desc: "Export at 300 DPI for professional print quality. Meets KDP and IngramSpark requirements." },
              { title: "EAN-5 Price Code", desc: "Optional 5-digit price supplement barcode. Supports USD, GBP, EUR, AUD, and CAD." },
              { title: "PNG & SVG Export", desc: "Download as high-res PNG for direct use, or SVG for integration in design software." },
              { title: "Custom Colors", desc: "Match your cover design with custom bar and background colors." },
              { title: "Instant & Free", desc: "No account, no watermark, no limits. Generate as many barcodes as you need." }
            ].map((feat) => (
              <div key={feat.title} className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  {feat.title}
                </h4>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed pl-6">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* F.A.Q. Section */}
        <section className="bg-slate-900/20 border border-slate-900/50 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What is an ISBN barcode?</h3>
              <p className="text-slate-400 font-semibold leading-relaxed">
                An ISBN barcode is an EAN-13 barcode that encodes a book's International Standard Book Number. It appears on the back cover and is scanned by retailers and distributors to identify the book.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">Do I need an ISBN barcode for my KDP book?</h3>
              <p className="text-slate-400 font-semibold leading-relaxed">
                If you use Amazon's free ISBN, KDP adds the barcode to your cover automatically during publishing. However, if you use your own ISBN (purchased from Bowker, Nielsen, etc.), you need to add the barcode to your back cover design yourself.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What's the difference between ISBN-10 and ISBN-13?</h3>
              <p className="text-slate-400 font-semibold leading-relaxed">
                ISBN-13 is the current international standard, consisting of 13 digits starting with 978 or 979. ISBN-10 is the older format that was replaced in 2007. Our generator automatically converts ISBN-10 numbers to ISBN-13 format.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-indigo-400">What is the EAN-5 price supplement?</h3>
              <p className="text-slate-500 font-semibold leading-relaxed">
                The EAN-5 is a small 5-digit barcode printed to the right of the main barcode. It encodes the book's suggested retail price, starting with a currency prefix (5=USD, 4=GBP, etc.).
              </p>
            </div>
          </div>
        </section>

        {/* Footer Studio Callout */}
        <section className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-md rounded-[3rem] border border-indigo-900/35 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Barcode ready — now finish the book
            </h2>
            <p className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
              Design a matching cover and compile a print-ready interior in KDPage Studio, then drop this barcode straight onto your back cover.
            </p>
          </div>
          <Link
            href="/studio?tab=cover"
            className="shrink-0 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
          >
            Open Cover Studio
          </Link>
        </section>

      </div>
    </div>
  );
}
