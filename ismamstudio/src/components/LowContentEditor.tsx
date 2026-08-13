"use client";

import React from "react";
import { Sliders, Type, FileText, LayoutTemplate } from "lucide-react";

interface LowContentEditorProps {
  page: any;
  updatePage: (config: any) => void;
}

const TEMPLATE_METADATA: Record<string, { label: string; desc: string; icon: string }> = {
  lined_journal: { label: "Lined Journal", desc: "Classic horizontal ruled writing sheets", icon: "📖" },
  dot_grid: { label: "Dot Grid Notebook", desc: "Subtle bullet grid for bullet journaling", icon: "🔲" },
  graph: { label: "Graph Paper", desc: "Quarter-inch square grid for drawing and math", icon: "📐" },
  cornell: { label: "Cornell Notes", desc: "Cue column, main notes section & summary area", icon: "📝" },
  weekly_planner: { label: "Weekly Planner", desc: "7-day layout with a notes section", icon: "📅" },
  daily_planner: { label: "Daily Planner", desc: "Detailed schedule, tasks, and hydration logs", icon: "☀️" },
  habit_tracker: { label: "Habit Tracker", desc: "Monthly grid to log up to 10 custom habits", icon: "📈" },
  password_keeper: { label: "Password Keeper", desc: "Organized tables for site details", icon: "🔐" },
  budget_log: { label: "Budget Log", desc: "Income, expenses, and balance spreadsheets", icon: "💵" },
  recipe_journal: { label: "Recipe Journal", desc: "Detailed spaces for ingredients and instructions", icon: "🍳" },
  gratitude_journal: { label: "Gratitude Journal", desc: "Mindful prompt sections for positive writing", icon: "✨" },
  guest_book: { label: "Guest Book", desc: "Row templates for visitor signatures and messages", icon: "✍️" },
  meal_planner: { label: "Meal Planner", desc: "Weekly meal scheduling spread and grocery list", icon: "🥗" },
  workout_log: { label: "Workout Tracker", desc: "Exercise, sets, reps, weight & cardio log", icon: "🏋️" },
  reading_log: { label: "Reading Log", desc: "Book title, author, ratings & review notes", icon: "📚" },
};

export default function LowContentEditor({ page, updatePage }: LowContentEditorProps) {
  const templateType = page.config.template || "lined_journal";
  const meta = TEMPLATE_METADATA[templateType] || TEMPLATE_METADATA.lined_journal;

  // Configuration values with defaults
  const pageTitle = page.config.pageTitle !== undefined ? page.config.pageTitle : meta.label;
  const lineSpacing = page.config.lineSpacing || 24; // in pixels for preview
  const headingFont = page.config.headingFont || "Helvetica";

  const handleChangeTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTmpl = e.target.value;
    const newMeta = TEMPLATE_METADATA[newTmpl] || TEMPLATE_METADATA.lined_journal;
    updatePage({
      ...page.config,
      template: newTmpl,
      pageTitle: newMeta.label
    });
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage({ ...page.config, pageTitle: e.target.value });
  };

  const handleChangeSpacing = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage({ ...page.config, lineSpacing: Number(e.target.value) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
      
      {/* Settings Panel */}
      <div className="col-span-1 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.icon}</span>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase">{meta.label}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{meta.desc}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Template Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" /> Interior Style
            </label>
            <select
              value={templateType}
              onChange={handleChangeTemplate}
              className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all text-slate-800 outline-none cursor-pointer"
            >
              {Object.entries(TEMPLATE_METADATA).map(([key, tMeta]) => (
                <option key={key} value={key}>
                  {tMeta.icon} {tMeta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title Editor */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-500" /> Page Heading
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={handleChangeTitle}
              className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all text-slate-800"
              placeholder="e.g. My Thoughts, Daily Schedule..."
            />
          </div>

          {/* Template-specific sliders */}
          {templateType === "lined_journal" && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Line Spacing
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={18}
                  max={36}
                  value={lineSpacing}
                  onChange={handleChangeSpacing}
                  className="flex-1 accent-indigo-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500">{lineSpacing}px</span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Format Compliance</span>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              This layout automatically applies the <strong>0.375" Gutter Shift</strong> during compilation to prevent text or lines from bleeding into the binding area.
            </p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-300" /> Compliant PDF Vector Template
        </div>
      </div>

      {/* Preview Panel */}
      <div className="col-span-2 bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-[420px] aspect-[1/1.4] bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col justify-between text-slate-900 relative">
          
          {/* Header */}
          <div className="w-full text-center mb-4">
            <h2 
              className="text-lg font-black text-slate-800 tracking-tight uppercase"
              style={{ fontFamily: headingFont }}
            >
              {pageTitle}
            </h2>
            <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-1.5" />
          </div>

          {/* Interactive CSS Preview depending on template type */}
          <div className="flex-1 w-full overflow-hidden flex flex-col justify-start relative">
            
            {/* Lined Journal */}
            {templateType === "lined_journal" && (
              <div className="w-full h-full flex flex-col gap-0.5 relative" style={{ gap: `${lineSpacing}px` }}>
                <div className="absolute top-0 bottom-0 left-6 w-px bg-red-400/60" />
                {Array.from({ length: Math.floor(250 / lineSpacing) }).map((_, i) => (
                  <div key={i} className="w-full border-b border-slate-200 h-px" />
                ))}
              </div>
            )}

            {/* Dot Grid */}
            {templateType === "dot_grid" && (
              <div 
                className="w-full h-full border border-slate-100 rounded-lg"
                style={{
                  backgroundImage: "radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)",
                  backgroundSize: "20px 20px"
                }}
              />
            )}

            {/* Graph Paper */}
            {templateType === "graph" && (
              <div 
                className="w-full h-full border border-slate-200 rounded-lg"
                style={{
                  backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }}
              />
            )}

            {/* Cornell Notes */}
            {templateType === "cornell" && (
              <div className="w-full h-full flex flex-col justify-between gap-2 border border-slate-200 rounded-lg p-3">
                <div className="flex flex-1 gap-3 border-b border-slate-200 pb-2">
                  <div className="w-1/3 border-r border-slate-200 pr-2">
                    <span className="text-[7px] font-black uppercase text-indigo-600">Cues / Keywords</span>
                  </div>
                  <div className="w-2/3 pl-1 space-y-2">
                    <span className="text-[7px] font-black uppercase text-indigo-600">Notes</span>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border-b border-slate-100 w-full h-px" />
                    ))}
                  </div>
                </div>
                <div className="h-12 pt-1">
                  <span className="text-[7px] font-black uppercase text-indigo-600">Summary</span>
                </div>
              </div>
            )}

            {/* Weekly Planner */}
            {templateType === "weekly_planner" && (
              <div className="w-full h-full grid grid-cols-2 gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Weekend", "Notes"].map((day, i) => (
                  <div key={i} className={`border border-slate-200 rounded-lg p-2 flex flex-col justify-between ${day === "Notes" ? "col-span-2 h-16" : "h-14"}`}>
                    <span className="text-[8px] font-black uppercase text-indigo-600">{day}</span>
                    <div className="border-b border-slate-100 w-full h-px" />
                  </div>
                ))}
              </div>
            )}

            {/* Daily Planner */}
            {templateType === "daily_planner" && (
              <div className="w-full h-full grid grid-cols-2 gap-4">
                {/* Schedule */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 h-full">
                  <span className="text-[8px] font-black uppercase text-indigo-600 block mb-1">Today's Schedule</span>
                  {["7:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"].map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[6px] font-bold text-slate-400">
                      <span>{t}</span>
                      <div className="flex-1 border-b border-slate-100 h-px" />
                    </div>
                  ))}
                </div>
                {/* Tasks & Hydration */}
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <span className="text-[8px] font-black uppercase text-indigo-600 block mb-1">Top Priorities</span>
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded border border-slate-200" />
                        <div className="flex-1 border-b border-slate-100 h-px" />
                      </div>
                    ))}
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[8px] font-black uppercase text-indigo-600 block mb-2">Water Intake</span>
                    <div className="flex justify-center gap-1.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-3.5 h-4.5 border border-indigo-400/50 rounded-b flex items-center justify-center text-[7px] text-indigo-500 font-bold">💧</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Habit Tracker */}
            {templateType === "habit_tracker" && (
              <div className="w-full h-full flex flex-col gap-2">
                <span className="text-[8px] font-black uppercase text-indigo-600 block shrink-0">Monthly Habits</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[6px] font-black flex-1 flex flex-col">
                  <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 p-1.5 text-slate-400 uppercase shrink-0">
                    <span className="col-span-2">Habit Description</span>
                    <span className="text-center col-span-4">Days (1 - 31)</span>
                  </div>
                  {Array.from({ length: 8 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-6 border-b border-slate-100 p-1.5 items-center last:border-b-0 flex-1">
                      <div className="col-span-2 border-b border-slate-100 h-3 w-4/5" />
                      <div className="col-span-4 flex justify-between px-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Keeper */}
            {templateType === "password_keeper" && (
              <div className="w-full h-full flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, block) => (
                  <div key={block} className="border border-slate-200 rounded-lg p-2.5 space-y-2 text-[6px] font-bold text-slate-400 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2"><span>Website:</span><div className="flex-1 border-b border-slate-100 h-px" /></div>
                    <div className="flex items-center gap-2"><span>Username:</span><div className="flex-1 border-b border-slate-100 h-px" /></div>
                    <div className="flex items-center gap-2"><span>Password:</span><div className="flex-1 border-b border-slate-100 h-px" /></div>
                  </div>
                ))}
              </div>
            )}

            {/* Budget Log */}
            {templateType === "budget_log" && (
              <div className="w-full h-full flex flex-col">
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[6px] font-black flex-1 flex flex-col">
                  <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 p-1.5 text-slate-400 uppercase shrink-0">
                    <span>Date</span>
                    <span className="col-span-2">Description</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {Array.from({ length: 10 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-4 border-b border-slate-100 p-2 items-center last:border-b-0 flex-1">
                      <div className="border-b border-slate-100 h-2 w-3/4" />
                      <div className="col-span-2 border-b border-slate-100 h-2 w-11/12" />
                      <div className="border-b border-slate-100 h-2 w-1/2 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Journal */}
            {templateType === "recipe_journal" && (
              <div className="w-full h-full space-y-3">
                <div className="grid grid-cols-3 gap-2 text-[6px] font-bold text-slate-400">
                  <div className="border border-slate-100 rounded p-1">Servings: ______</div>
                  <div className="border border-slate-100 rounded p-1">Prep Time: _____</div>
                  <div className="border border-slate-100 rounded p-1">Cook Time: _____</div>
                </div>
                <div className="grid grid-cols-2 gap-3 h-full">
                  <div className="border border-slate-200 rounded-lg p-2.5 h-[120px] space-y-2">
                    <span className="text-[7px] font-black uppercase text-indigo-600 block">Ingredients</span>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
                        <div className="flex-1 border-b border-slate-100 h-px" />
                      </div>
                    ))}
                  </div>
                  <div className="border border-slate-200 rounded-lg p-2.5 h-[120px] space-y-2">
                    <span className="text-[7px] font-black uppercase text-indigo-600 block">Instructions</span>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-[6px] font-bold text-slate-400">{i}.</span>
                        <div className="flex-1 border-b border-slate-100 h-px mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Gratitude Journal */}
            {templateType === "gratitude_journal" && (
              <div className="w-full h-full space-y-3">
                {[
                  "Three things I am grateful for today...",
                  "A self-reflection / quote that inspired me...",
                  "The highlights and wins of my day..."
                ].map((prompt, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <span className="text-[6px] font-black uppercase text-indigo-600 block">{prompt}</span>
                    <div className="border-b border-slate-100 w-full h-px" />
                    <div className="border-b border-slate-100 w-full h-px" />
                  </div>
                ))}
              </div>
            )}

            {/* Guest Book */}
            {templateType === "guest_book" && (
              <div className="w-full h-full flex flex-col gap-2.5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-2.5 space-y-2 text-[6px] font-bold text-slate-400 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center gap-2">
                      <span className="w-12">Visitor Name:</span>
                      <div className="flex-1 border-b border-slate-100 h-px" />
                      <span className="w-12 text-right">Date: ________</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Message / Thoughts:</span>
                      <div className="flex-1 border-b border-slate-100 h-px" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meal Planner */}
            {templateType === "meal_planner" && (
              <div className="w-full h-full space-y-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-1.5 flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-indigo-600 w-8">{day}</span>
                    <div className="flex-1 border-b border-slate-100 h-px ml-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Workout Tracker */}
            {templateType === "workout_log" && (
              <div className="w-full h-full flex flex-col">
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[6px] font-black flex-1 flex flex-col">
                  <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200 p-1.5 text-slate-400 uppercase shrink-0">
                    <span className="col-span-2">Exercise</span>
                    <span>Sets</span>
                    <span>Reps</span>
                    <span>Weight</span>
                  </div>
                  {Array.from({ length: 7 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-5 border-b border-slate-100 p-1.5 items-center last:border-b-0 flex-1">
                      <div className="col-span-2 border-b border-slate-100 h-2 w-4/5" />
                      <div className="border-b border-slate-100 h-2 w-2/3" />
                      <div className="border-b border-slate-100 h-2 w-2/3" />
                      <div className="border-b border-slate-100 h-2 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reading Log */}
            {templateType === "reading_log" && (
              <div className="w-full h-full flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-2 space-y-1.5 text-[6px] font-bold text-slate-400 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2"><span>Book Title:</span><div className="flex-1 border-b border-slate-100 h-px" /></div>
                    <div className="flex items-center gap-2"><span>Author:</span><div className="flex-1 border-b border-slate-100 h-px" /></div>
                    <div className="flex items-center gap-2"><span>Rating: ⭐⭐⭐⭐⭐</span><div className="flex-1 border-b border-slate-100 h-px ml-2" /></div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Footer page number indicator */}
          <div className="w-full text-center border-t border-slate-100 pt-2 flex justify-between items-center text-[6px] font-black text-slate-500 uppercase">
            <span>Compliant Safe-zone margins</span>
            <span>Page PageNumber</span>
          </div>

        </div>
      </div>

    </div>
  );
}
