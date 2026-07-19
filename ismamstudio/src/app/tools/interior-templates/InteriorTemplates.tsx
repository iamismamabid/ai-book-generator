"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { LayoutTemplate, Download, Info, Loader2 } from "lucide-react";

type TemplateKey =
  | "lined" | "dot-grid" | "graph" | "blank" | "cornell"
  | "daily-planner" | "weekly-planner" | "habit-tracker" | "gratitude" | "meal-planner";

interface TemplateDef {
  key: TemplateKey;
  label: string;
  desc: string;
}

const TEMPLATES: TemplateDef[] = [
  { key: "lined", label: "Lined Paper", desc: "Classic ruled journal pages" },
  { key: "dot-grid", label: "Dot Grid", desc: "Bullet journal dot matrix" },
  { key: "graph", label: "Graph Paper", desc: "Quarter-inch square grid" },
  { key: "blank", label: "Blank Sketch Page", desc: "Plain page with margin guide" },
  { key: "cornell", label: "Cornell Notes", desc: "Cue, notes, and summary sections" },
  { key: "daily-planner", label: "Daily Planner", desc: "Schedule, priorities, and notes" },
  { key: "weekly-planner", label: "Weekly Planner", desc: "7-day spread with goals" },
  { key: "habit-tracker", label: "Habit Tracker", desc: "Monthly grid for daily habits" },
  { key: "gratitude", label: "Gratitude Journal", desc: "Daily reflection prompts" },
  { key: "meal-planner", label: "Meal Planner", desc: "Weekly meals & grocery list" },
];

const TRIMS: { label: string; w: number; h: number }[] = [
  { label: '6" × 9" (Standard)', w: 6, h: 9 },
  { label: '8.5" × 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" × 8.5" (Compact)', w: 5.5, h: 8.5 },
  { label: '7" × 10" (Large)', w: 7, h: 10 },
];

async function generatePdf(template: TemplateKey, w: number, h: number, pageCount: number) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "in", format: [w, h] });
  const margin = 0.5;

  const drawLined = () => {
    doc.setDrawColor(190, 200, 215);
    doc.setLineWidth(0.008);
    const lineGap = 0.28;
    for (let y = margin + 0.3; y < h - margin; y += lineGap) {
      doc.line(margin, y, w - margin, y);
    }
    doc.setDrawColor(220, 100, 100);
    doc.setLineWidth(0.01);
    doc.line(margin + 0.4, margin - 0.1, margin + 0.4, h - margin);
  };

  const drawDotGrid = () => {
    doc.setFillColor(170, 180, 195);
    const gap = 0.2;
    for (let y = margin; y <= h - margin; y += gap) {
      for (let x = margin; x <= w - margin; x += gap) {
        doc.circle(x, y, 0.008, "F");
      }
    }
  };

  const drawGraph = () => {
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.006);
    const gap = 0.25;
    for (let x = margin; x <= w - margin; x += gap) doc.line(x, margin, x, h - margin);
    for (let y = margin; y <= h - margin; y += gap) doc.line(margin, y, w - margin, y);
  };

  const drawBlank = () => {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.006);
    doc.rect(margin, margin, w - margin * 2, h - margin * 2);
  };

  const drawCornell = () => {
    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.01);
    const cueW = w * 0.3;
    const summaryH = 1.2;
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 145);
    doc.text("Topic:", margin, margin - 0.1);
    doc.line(margin, margin + 0.15, w - margin, margin + 0.15);
    doc.line(margin + cueW, margin + 0.3, margin + cueW, h - margin - summaryH);
    doc.line(margin, h - margin - summaryH, w - margin, h - margin - summaryH);
    doc.text("Cues", margin + 0.05, margin + 0.28);
    doc.text("Notes", margin + cueW + 0.1, margin + 0.28);
    doc.text("Summary", margin + 0.05, h - margin - summaryH + 0.15);
    // faint lines within notes area
    doc.setDrawColor(225, 230, 238);
    for (let y = margin + 0.5; y < h - margin - summaryH; y += 0.26) {
      doc.line(margin + cueW + 0.1, y, w - margin, y);
    }
  };

  const header = (title: string, dateLine = true) => {
    doc.setFontSize(13);
    doc.setTextColor(40, 45, 55);
    doc.text(title, margin, margin + 0.05);
    if (dateLine) {
      doc.setFontSize(9);
      doc.setTextColor(140, 148, 160);
      doc.text("Date: ___________________", w - margin - 1.8, margin + 0.05);
    }
    doc.setDrawColor(40, 45, 55);
    doc.setLineWidth(0.012);
    doc.line(margin, margin + 0.18, w - margin, margin + 0.18);
  };

  const box = (x: number, y: number, bw: number, bh: number, title: string) => {
    doc.setDrawColor(200, 208, 220);
    doc.setLineWidth(0.008);
    doc.rect(x, y, bw, bh);
    doc.setFontSize(8);
    doc.setTextColor(130, 138, 150);
    doc.text(title.toUpperCase(), x + 0.08, y + 0.16);
  };

  const drawDailyPlanner = () => {
    header("Daily Planner");
    let y = margin + 0.45;
    box(margin, y, w - margin * 2, 0.5, "Today's Priorities");
    y += 0.65;
    const half = (w - margin * 2 - 0.15) / 2;
    box(margin, y, half, 2.2, "Schedule");
    box(margin + half + 0.15, y, half, 2.2, "To-Do List");
    doc.setDrawColor(230, 234, 240);
    for (let ly = y + 0.35; ly < y + 2.1; ly += 0.24) {
      doc.line(margin + 0.08, ly, margin + half - 0.08, ly);
    }
    y += 2.35;
    box(margin, y, w - margin * 2, h - margin - y - 0.05, "Notes");
  };

  const drawWeeklyPlanner = () => {
    header("Weekly Planner", false);
    doc.setFontSize(9);
    doc.setTextColor(140, 148, 160);
    doc.text("Week of: ___________________", margin, margin + 0.14);
    let y = margin + 0.5;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const rowH = (h - margin - y - 0.9) / days.length;
    days.forEach((d) => {
      box(margin, y, w - margin * 2, rowH, d);
      y += rowH;
    });
    box(margin, y + 0.05, w - margin * 2, 0.8, "Weekly Goals");
  };

  const drawHabitTracker = () => {
    header("Habit Tracker", false);
    doc.setFontSize(9);
    doc.setTextColor(140, 148, 160);
    doc.text("Month: ___________________", margin, margin + 0.14);
    const rows = 10;
    const cols = 31;
    const gridX = margin + 1.6;
    const gridY = margin + 0.5;
    const cellW = (w - margin - gridX) / cols;
    const rowH = 0.28;
    doc.setFontSize(7);
    for (let r = 0; r < rows; r++) {
      doc.setDrawColor(210, 216, 228);
      doc.line(margin, gridY + r * rowH + rowH, w - margin, gridY + r * rowH + rowH);
      doc.text(`Habit ${r + 1}`, margin, gridY + r * rowH + rowH - 0.08);
    }
    for (let c = 0; c <= cols; c++) {
      doc.setDrawColor(225, 230, 238);
      doc.line(gridX + c * cellW, gridY, gridX + c * cellW, gridY + rows * rowH);
      if (c < cols) doc.text(String(c + 1), gridX + c * cellW + cellW / 2 - 0.03, gridY - 0.05);
    }
    doc.setDrawColor(120, 128, 140);
    doc.line(gridX, gridY, w - margin, gridY);
  };

  const drawGratitude = () => {
    header("Gratitude Journal");
    let y = margin + 0.5;
    const prompts = [
      "Three things I'm grateful for today:",
      "Something that made me smile:",
      "A win I had today, big or small:",
      "Someone I appreciate and why:",
      "One thing I'm looking forward to:",
    ];
    doc.setFontSize(10);
    prompts.forEach((p) => {
      doc.setTextColor(70, 78, 90);
      doc.text(p, margin, y);
      y += 0.22;
      doc.setDrawColor(220, 226, 236);
      for (let i = 0; i < 2; i++) {
        doc.line(margin, y, w - margin, y);
        y += 0.24;
      }
      y += 0.15;
    });
  };

  const drawMealPlanner = () => {
    header("Weekly Meal Planner", false);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const meals = ["Breakfast", "Lunch", "Dinner"];
    const gridX = margin + 0.9;
    const gridY = margin + 0.4;
    const colW = (w - margin - gridX) / days.length;
    const rowH = 0.9;
    doc.setFontSize(8);
    meals.forEach((m, r) => {
      doc.setTextColor(120, 128, 140);
      doc.text(m, margin, gridY + r * rowH + rowH / 2);
      doc.setDrawColor(210, 216, 228);
      doc.line(margin, gridY + r * rowH + rowH, w - margin, gridY + r * rowH + rowH);
    });
    days.forEach((d, c) => {
      doc.setTextColor(70, 78, 90);
      doc.text(d, gridX + c * colW + colW / 2 - 0.12, gridY - 0.08);
      doc.setDrawColor(225, 230, 238);
      doc.line(gridX + c * colW, gridY, gridX + c * colW, gridY + meals.length * rowH);
    });
    doc.setDrawColor(120, 128, 140);
    doc.line(gridX, gridY, w - margin, gridY);
    const groceryY = gridY + meals.length * rowH + 0.2;
    box(margin, groceryY, w - margin * 2, h - margin - groceryY - 0.05, "Grocery List");
  };

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) doc.addPage([w, h]);
    switch (template) {
      case "lined": drawLined(); break;
      case "dot-grid": drawDotGrid(); break;
      case "graph": drawGraph(); break;
      case "blank": drawBlank(); break;
      case "cornell": drawCornell(); break;
      case "daily-planner": drawDailyPlanner(); break;
      case "weekly-planner": drawWeeklyPlanner(); break;
      case "habit-tracker": drawHabitTracker(); break;
      case "gratitude": drawGratitude(); break;
      case "meal-planner": drawMealPlanner(); break;
    }
  }

  doc.save(`${template}-template-${w}x${h}-${pageCount}pg.pdf`);
}

export default function InteriorTemplates() {
  const [template, setTemplate] = useState<TemplateKey>("lined");
  const [trimIdx, setTrimIdx] = useState(0);
  const [pageCount, setPageCount] = useState(100);
  const [working, setWorking] = useState(false);

  const trim = TRIMS[trimIdx];

  const faqs = [
    {
      q: "Are these templates sized to KDP's exact trims?",
      a: "Yes — every trim size option matches Amazon KDP's standard no-bleed trim dimensions exactly.",
    },
    {
      q: "Can I edit the generated PDF?",
      a: "The PDF is a print-ready layout, not an editable template file — use it as-is for upload, or as a visual reference in design software like Canva or InDesign.",
    },
    {
      q: "How long does a large page count take to generate?",
      a: "Generation happens in your browser; 200+ page documents may take a few seconds, but there's no server-side processing limit or wait queue.",
    },
  ];

  const download = async () => {
    setWorking(true);
    try {
      await generatePdf(template, trim.w, trim.h, pageCount);
    } finally {
      setWorking(false);
    }
  };

  return (
    <ToolShell
      title="Interior"
      highlight="Templates"
      subtitle="Download ready-to-use interior templates for journals, planners, and notebooks — sized to standard KDP trims and generated on demand."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Template picker */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTemplate(t.key)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                  template === t.key
                    ? "bg-indigo-600/20 border-indigo-500"
                    : "bg-slate-900/35 border-slate-900 hover:border-slate-700"
                }`}
              >
                <LayoutTemplate className={`w-5 h-5 mb-2 ${template === t.key ? "text-indigo-300" : "text-slate-500"}`} />
                <span className={`text-sm font-black block ${template === t.key ? "text-white" : "text-slate-300"}`}>
                  {t.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md sticky top-6">
            <h3 className="text-lg font-black text-white">Export Settings</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Trim Size
              </label>
              <select
                value={trimIdx}
                onChange={(e) => setTrimIdx(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {TRIMS.map((t, i) => (
                  <option key={t.label} value={i}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Page Count — {pageCount}
              </label>
              <input
                type="range" min={10} max={300} value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <input
                type="number" min={1} max={800} value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={download}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {working ? "Generating…" : `Download ${pageCount}-Page PDF`}
            </button>

            <p className="text-[10px] font-bold text-slate-500 text-center">
              {TEMPLATES.find((t) => t.key === template)?.label} · {trim.label} · {pageCount} pages
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3 mt-8">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
          Every template repeats across your chosen page count and is sized to match KDP&apos;s
          standard no-bleed trims exactly — upload as-is or use as a base layer in your design
          software. Large page counts (200+) may take a few seconds to generate.
        </p>
      </div>
    </ToolShell>
  );
}
