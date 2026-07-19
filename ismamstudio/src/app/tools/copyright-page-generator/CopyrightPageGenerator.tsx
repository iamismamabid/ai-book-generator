"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Copyright, Copy, Check, Download, FileText, Info } from "lucide-react";

type BookType = "fiction" | "nonfiction" | "lowcontent";

const FICTION_DISCLAIMER =
  "This is a work of fiction. Names, characters, places, and incidents either are the product of the author's imagination or are used fictitiously. Any resemblance to actual persons, living or dead, businesses, events, or locales is entirely coincidental.";

const NONFICTION_DISCLAIMER =
  "The information in this book is provided for general informational purposes only. While every effort has been made to ensure accuracy, the author and publisher assume no responsibility for errors or omissions, or for any outcome resulting from the use of this material.";

function buildCopyrightPage(opts: {
  title: string;
  author: string;
  year: string;
  publisher: string;
  isbn: string;
  edition: string;
  bookType: BookType;
  includeMoralRights: boolean;
  includeCover: string;
  country: string;
}): string {
  const { title, author, year, publisher, isbn, edition, bookType, includeMoralRights, includeCover, country } = opts;
  const lines: string[] = [];

  if (title) lines.push(title.toUpperCase(), "");
  lines.push(`Copyright © ${year} ${author || "[Author Name]"}`, "");
  lines.push("All rights reserved.", "");
  lines.push(
    "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law."
  );
  lines.push("");

  if (bookType === "fiction") {
    lines.push(FICTION_DISCLAIMER, "");
  } else if (bookType === "nonfiction") {
    lines.push(NONFICTION_DISCLAIMER, "");
  }

  if (includeMoralRights) {
    lines.push(`${author || "[Author Name]"} asserts the moral right to be identified as the author of this work.`, "");
  }

  if (isbn) lines.push(`ISBN: ${isbn}`);
  if (edition) lines.push(`${edition}`);
  if (publisher) lines.push(`Published by ${publisher}`);
  if (includeCover) lines.push(`Cover design by ${includeCover}`);
  if (country) lines.push(`Printed in ${country}`);

  return lines.join("\n");
}

export default function CopyrightPageGenerator() {
  const currentYear = new Date().getFullYear().toString();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(currentYear);
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [edition, setEdition] = useState("First Edition");
  const [bookType, setBookType] = useState<BookType>("fiction");
  const [includeMoralRights, setIncludeMoralRights] = useState(false);
  const [coverDesigner, setCoverDesigner] = useState("");
  const [country, setCountry] = useState("the United States of America");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () =>
      buildCopyrightPage({
        title, author, year, publisher, isbn, edition, bookType,
        includeMoralRights, includeCover: coverDesigner, country,
      }),
    [title, author, year, publisher, isbn, edition, bookType, includeMoralRights, coverDesigner, country]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "copyright-page.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    // 6x9 in book page (points: 432 x 648)
    const doc = new jsPDF({ unit: "pt", format: [432, 648] });
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const margin = 54;
    const width = 432 - margin * 2;
    const paragraphs = output.split("\n");
    let y = 648 * 0.35; // copyright pages traditionally sit lower on the page
    paragraphs.forEach((p) => {
      if (p.trim() === "") {
        y += 10;
        return;
      }
      const wrapped = doc.splitTextToSize(p, width);
      wrapped.forEach((line: string) => {
        if (y > 648 - margin) return;
        doc.text(line, 432 / 2, y, { align: "center" });
        y += 12;
      });
    });
    doc.save("copyright-page.pdf");
  };

  const inputCls =
    "w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none";
  const labelCls = "block text-xs font-black uppercase tracking-wider text-slate-400";

  const faqs = [
    {
      q: "Is this legal advice?",
      a: "No — it generates standard, widely-used copyright page wording, not legal advice. For unusual licensing or co-author situations, consult an IP attorney.",
    },
    {
      q: "Do I need to register my copyright separately?",
      a: "In most countries, including the US, copyright exists automatically at creation. Formal registration is optional but can strengthen your legal position if you ever need to enforce it.",
    },
    {
      q: "Where does the copyright page go in my book?",
      a: "Traditionally on the reverse of the title page — page iv, the back of your book's opening page.",
    },
  ];

  return (
    <ToolShell
      title="Copyright Page"
      highlight="Generator"
      subtitle="Generate a professional, legally-standard copyright page for your book — with the right disclaimer for fiction, non-fiction, or low-content books."
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Copyright className="w-5 h-5 text-indigo-400" /> Book Details
            </h3>

            <div className="space-y-1.5">
              <label className={labelCls}>Book Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Silent Harbor" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Author Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Jane Doe" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Copyright Year</label>
                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Book Type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["fiction", "Fiction"],
                  ["nonfiction", "Non-Fiction"],
                  ["lowcontent", "Low-Content"],
                ] as [BookType, string][]).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setBookType(v)}
                    className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      bookType === v
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>ISBN (optional)</label>
                <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="978-..." className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Edition</label>
                <input type="text" value={edition} onChange={(e) => setEdition(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Publisher / Imprint (optional)</label>
              <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="e.g. Harbor Press" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Cover Designer (optional)</label>
                <input type="text" value={coverDesigner} onChange={(e) => setCoverDesigner(e.target.value)} placeholder="e.g. John Smith" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Printed In</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={includeMoralRights}
                onChange={(e) => setIncludeMoralRights(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">
                Include moral rights assertion (common in UK/Commonwealth editions)
              </span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Live Preview
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Text"}
                </button>
                <button
                  onClick={downloadTxt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> .TXT
                </button>
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> 6×9 PDF
                </button>
              </div>
            </div>

            {/* Book page mockup */}
            <div className="bg-[#faf7f0] text-slate-800 rounded-2xl p-10 md:p-14 shadow-inner min-h-[480px] flex flex-col justify-center">
              <pre className="whitespace-pre-wrap font-serif text-[11px] md:text-xs leading-relaxed text-center">
                {output}
              </pre>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              The copyright page traditionally goes on the reverse of the title page (page iv). In
              most countries copyright exists automatically from the moment of creation — this page
              declares it. This generator provides standard wording, not legal advice.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
