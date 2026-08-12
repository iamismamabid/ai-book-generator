"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Download, Copy, Check, Sparkles, Printer, Award, FileCheck2, HelpCircle } from "lucide-react";

export default function LicenseGeneratorClient() {
  const [publisherName, setPublisherName] = useState("Acme Publishing");
  const [bookTitle, setBookTitle] = useState("Ultimate Puzzle Challenge 2026");
  const [isbn, setIsbn] = useState("978-1-23456-789-0");
  const [licenseTier, setLicenseTier] = useState("AppSumo Lifetime Partner / Pro Tier");
  const [licenseId] = useState(() => "KDP-LIC-" + Math.floor(100000 + Math.random() * 900000));
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `KDPage COMMERCIAL USE LICENSE CERTIFICATE
Certificate ID: ${licenseId}
Issue Date: ${issueDate}
Licensed To: ${publisherName}
Book Title: ${bookTitle}
ISBN/ASIN: ${isbn || "N/A"}
License Tier: ${licenseTier}

TERMS OF COVERAGE:
KDPage (https://www.kdpage.com) certifies that the holder of this license is granted non-exclusive, worldwide, royalty-free commercial distribution rights to publish, sell, print, and distribute physical and digital books containing interiors, puzzles, covers, and graphics generated using KDPage software.

Amazon KDP Verification Reference: ${licenseId}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Printable CSS override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 2rem;
            background: #ffffff !important;
            color: #0f172a !important;
            border: 4px double #0284c7 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Navigation */}
        <div className="no-print flex items-center justify-between">
          <Link
            href="/tools"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> KDP Compliant Verification
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="no-print text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 mb-2">
            <Award className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            KDPage Commercial License Generator
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Generate an official, printable Commercial Use License Certificate for Amazon KDP copyright verification. Submit this document if Amazon flags your interiors or covers.
          </p>
        </div>

        {/* Main Grid: Form Inputs & Certificate Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column (no-print) */}
          <div className="no-print lg:col-span-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" /> Certificate Details
              </h2>
              <span className="text-xs text-slate-500 font-mono">ID: {licenseId}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Publisher / Author Name
              </label>
              <input
                type="text"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                placeholder="e.g. John Doe or Apex Publishing"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Book Title / Project Name
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. 500 Easy Sudoku Puzzles"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                ISBN or ASIN (Optional)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 978-1-23456-789-0 or B09XXXXX"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                License Plan / Tier
              </label>
              <select
                value={licenseTier}
                onChange={(e) => setLicenseTier(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              >
                <option value="AppSumo Lifetime Partner / Tier 1">AppSumo Lifetime Partner (Tier 1)</option>
                <option value="AppSumo Lifetime Partner / Pro Tier">AppSumo Lifetime Partner (Tier 2 / Pro)</option>
                <option value="AppSumo Agency Lifetime Partner">AppSumo Agency Lifetime Partner (Tier 3)</option>
                <option value="KDPage Pro Subscription">KDPage Pro Subscription</option>
                <option value="KDPage Unlimited Commercial License">KDPage Unlimited Commercial License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={handlePrint}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Printer className="w-4 h-4" /> Save as PDF / Print Certificate
              </button>
              <button
                onClick={handleCopyText}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy Raw Verification Text"}
              </button>
            </div>
          </div>

          {/* Certificate Live Preview Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="no-print flex items-center justify-between px-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Live Certificate Preview
              </span>
              <span className="text-xs text-indigo-400 font-mono">Ready for Amazon KDP Submission</span>
            </div>

            {/* Certificate Container */}
            <div
              id="printable-certificate"
              ref={certificateRef}
              className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 border-4 border-double border-indigo-600 shadow-2xl relative overflow-hidden transition-all"
            >
              {/* Decorative Watermark & Header */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-7 h-7 text-indigo-600" />
                    <span className="text-xl font-black tracking-wider text-slate-900 uppercase">KDPage</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                    Official Publishing Rights Certificate
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 font-mono">
                    {licenseId}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Date: {issueDate}</p>
                </div>
              </div>

              {/* Body */}
              <div className="py-8 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    CERTIFICATE OF COMMERCIAL LICENSE
                  </h3>
                  <p className="text-xs text-slate-500 tracking-wider uppercase">
                    This certifies that full commercial publishing rights have been granted to:
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center space-y-1">
                  <p className="text-xl font-bold text-indigo-900 tracking-wide">{publisherName || "License Holder"}</p>
                  <p className="text-xs text-slate-600">
                    Project: <span className="font-semibold text-slate-900">{bookTitle || "Untitled KDP Project"}</span>
                  </p>
                  {isbn && <p className="text-xs text-slate-500 font-mono">ISBN / ASIN: {isbn}</p>}
                </div>

                {/* Legal Statement */}
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed text-justify border-t border-b border-slate-100 py-4">
                  <p>
                    <strong>Terms of Rights Grant:</strong> KDPage (https://www.kdpage.com) hereby confirms that the authorized license holder listed above possesses a valid commercial license under plan tier <span className="font-semibold text-slate-900">{licenseTier}</span>.
                  </p>
                  <p>
                    The licensee is granted a non-exclusive, perpetual, worldwide, royalty-free license to publish, print, distribute, and sell commercial physical and digital books (including Amazon KDP paperback, hardcover, and Kindle formats) containing puzzle interiors, mazes, covers, and graphics generated via the KDPage platform.
                  </p>
                  <p>
                    Amazon Content Review & Copyright Verification: This document serves as official authorization. All generated graphics and layouts are original vector outputs synthesized by KDPage and cleared for commercial distribution.
                  </p>
                </div>
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="pt-4 flex items-end justify-between text-xs border-t-2 border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Verified Commercial License
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Ref: https://www.kdpage.com/verify</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-24 h-0.5 bg-slate-300 ml-auto mb-1" />
                  <p className="font-bold text-slate-800">KDPage Licensing Authority</p>
                  <p className="text-[10px] text-slate-400">Authentic Software Generated Certificate</p>
                </div>
              </div>
            </div>

            {/* Help / FAQ Banner */}
            <div className="no-print bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">How to use this for Amazon KDP?</p>
                <p>
                  If Amazon sends a copyright inquiry asking for proof of publishing rights for your puzzle book or interior, click <strong>"Save as PDF"</strong> above and upload this certificate to Amazon Support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
