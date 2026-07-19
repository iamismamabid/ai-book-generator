"use client";

import { useEffect, useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  BookOpen, Plus, Trash2, ChevronUp, ChevronDown, Download, Users,
  StickyNote, LayoutList, BarChart2, Info,
} from "lucide-react";

type ChapterStatus = "outline" | "drafting" | "done";

interface Chapter {
  id: string;
  title: string;
  summary: string;
  words: number;
  status: ChapterStatus;
}

interface Character {
  id: string;
  name: string;
  role: string;
  notes: string;
}

interface PlannerState {
  title: string;
  author: string;
  genre: string;
  targetWords: number;
  chapters: Chapter[];
  characters: Character[];
  notes: string;
}

const STORAGE_KEY = "kdpage-book-planner-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const EMPTY: PlannerState = {
  title: "",
  author: "",
  genre: "",
  targetWords: 60000,
  chapters: [],
  characters: [],
  notes: "",
};

const TEMPLATES: Record<string, () => Partial<PlannerState>> = {
  "Novel (3-Act)": () => ({
    targetWords: 80000,
    chapters: [
      "Opening image & ordinary world", "Inciting incident", "Debate & refusal", "Crossing the threshold",
      "New world & allies", "First pinch point", "Midpoint reversal", "Raising stakes",
      "Second pinch point", "All is lost", "Dark night of the soul", "Third act break-in",
      "Climax", "Resolution & final image",
    ].map((t, i) => ({ id: uid(), title: `Ch ${i + 1}: ${t}`, summary: "", words: 0, status: "outline" as ChapterStatus })),
  }),
  "Non-Fiction Guide": () => ({
    targetWords: 45000,
    chapters: [
      "Introduction: the promise", "The problem & why it matters", "Core framework overview",
      "Step 1 — Foundation", "Step 2 — Building", "Step 3 — Refining", "Common mistakes",
      "Case studies", "Advanced tactics", "Your 30-day action plan", "Conclusion & next steps",
    ].map((t, i) => ({ id: uid(), title: `Ch ${i + 1}: ${t}`, summary: "", words: 0, status: "outline" as ChapterStatus })),
  }),
  "Children's Picture Book": () => ({
    targetWords: 700,
    chapters: [
      "Setup — meet the hero", "The problem appears", "First try fails", "Second try fails",
      "Big idea moment", "Climax — it works!", "Warm resolution",
    ].map((t, i) => ({ id: uid(), title: `Spread ${i + 1}: ${t}`, summary: "", words: 0, status: "outline" as ChapterStatus })),
  }),
};

const STATUS_META: Record<ChapterStatus, { label: string; cls: string }> = {
  outline: { label: "Outline", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  drafting: { label: "Drafting", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  done: { label: "Done", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function BookPlanner() {
  const [state, setState] = useState<PlannerState>(EMPTY);
  const [tab, setTab] = useState<"outline" | "characters" | "notes">("outline");
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // corrupted state — start fresh
    }
    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full/unavailable — planner still works in-memory
    }
  }, [state, loaded]);

  const totalWords = useMemo(
    () => state.chapters.reduce((sum, c) => sum + (c.words || 0), 0),
    [state.chapters]
  );
  const doneChapters = state.chapters.filter((c) => c.status === "done").length;
  const progress = state.targetWords > 0 ? Math.min(100, (totalWords / state.targetWords) * 100) : 0;

  const update = (patch: Partial<PlannerState>) => setState((s) => ({ ...s, ...patch }));

  const updateChapter = (id: string, patch: Partial<Chapter>) =>
    update({ chapters: state.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const moveChapter = (id: string, dir: -1 | 1) => {
    const idx = state.chapters.findIndex((c) => c.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= state.chapters.length) return;
    const next = [...state.chapters];
    [next[idx], next[target]] = [next[target], next[idx]];
    update({ chapters: next });
  };

  const updateCharacter = (id: string, patch: Partial<Character>) =>
    update({ characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const exportOutline = () => {
    const lines: string[] = [
      `${state.title || "Untitled Book"}${state.author ? ` — by ${state.author}` : ""}`,
      state.genre ? `Genre: ${state.genre}` : "",
      `Target: ${state.targetWords.toLocaleString()} words | Written: ${totalWords.toLocaleString()} words (${progress.toFixed(0)}%)`,
      "",
      "=== OUTLINE ===",
      ...state.chapters.map(
        (c, i) =>
          `${i + 1}. ${c.title} [${STATUS_META[c.status].label}, ${c.words.toLocaleString()} words]${c.summary ? `\n   ${c.summary}` : ""}`
      ),
      "",
      state.characters.length ? "=== CHARACTERS ===" : "",
      ...state.characters.map((c) => `• ${c.name}${c.role ? ` (${c.role})` : ""}${c.notes ? ` — ${c.notes}` : ""}`),
      "",
      state.notes ? `=== NOTES ===\n${state.notes}` : "",
    ].filter((l) => l !== "");
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(state.title || "book-plan").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-outline.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "w-full bg-slate-950 border border-slate-900 text-white rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none";
  const smallInput =
    "bg-slate-950 border border-slate-900 text-white rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none";

  const faqs = [
    {
      q: "Where is my book plan saved?",
      a: "In your browser's local storage on this device — nothing is uploaded to a server, so clearing browser data will erase it. Export your outline regularly as a backup.",
    },
    {
      q: "Can I use this on my phone and continue on my laptop?",
      a: "Not automatically — local storage is per-device and per-browser. Use the Export Outline button to move your plan between devices.",
    },
    {
      q: "Do the templates lock me into a structure?",
      a: "No — templates just pre-fill chapters as a starting point; add, remove, or reorder them freely.",
    },
  ];

  return (
    <ToolShell
      title="Book"
      highlight="Planner"
      subtitle="Plan chapters, track characters, and watch your word-count progress. Autosaves to your browser — no account needed."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: book meta + stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Book Overview
            </h3>
            <input type="text" value={state.title} onChange={(e) => update({ title: e.target.value })} placeholder="Book title" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={state.author} onChange={(e) => update({ author: e.target.value })} placeholder="Author" className={inputCls} />
              <input type="text" value={state.genre} onChange={(e) => update({ genre: e.target.value })} placeholder="Genre" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Target Word Count
              </label>
              <input
                type="number"
                min={0}
                value={state.targetWords}
                onChange={(e) => update({ targetWords: parseInt(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-yellow-500" /> Writing Progress
            </h3>
            <div>
              <div className="flex justify-between text-xs font-black mb-2">
                <span className="text-slate-400">{totalWords.toLocaleString()} words</span>
                <span className="text-yellow-500">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-yellow-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Chapters</span>
                <span className="text-lg font-black text-white">
                  {doneChapters}/{state.chapters.length}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Remaining</span>
                <span className="text-lg font-black text-white">
                  {Math.max(0, state.targetWords - totalWords).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={exportOutline}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[10px] rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Outline (.txt)
            </button>
          </div>

          {/* Templates */}
          {state.chapters.length === 0 && (
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-3">
              <h3 className="text-sm font-black text-white">Start From a Template</h3>
              {Object.keys(TEMPLATES).map((t) => (
                <button
                  key={t}
                  onClick={() => update(TEMPLATES[t]())}
                  className="w-full text-left px-4 py-3 rounded-xl border bg-slate-950/40 border-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: tabs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex gap-2">
            {([
              ["outline", "Outline", LayoutList],
              ["characters", "Characters", Users],
              ["notes", "Notes", StickyNote],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tab === key
                    ? "bg-yellow-500 text-slate-950"
                    : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === "outline" && (
            <div className="space-y-3">
              {state.chapters.map((c, idx) => (
                <div key={c.id} className="bg-slate-900/35 border border-slate-900 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-600 w-6 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => updateChapter(c.id, { title: e.target.value })}
                      placeholder="Chapter title"
                      className={`flex-1 ${smallInput}`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={c.words || ""}
                      onChange={(e) => updateChapter(c.id, { words: parseInt(e.target.value) || 0 })}
                      placeholder="Words"
                      className={`w-24 ${smallInput}`}
                    />
                    <select
                      value={c.status}
                      onChange={(e) => updateChapter(c.id, { status: e.target.value as ChapterStatus })}
                      className={`${smallInput} border ${STATUS_META[c.status].cls}`}
                    >
                      <option value="outline">Outline</option>
                      <option value="drafting">Drafting</option>
                      <option value="done">Done</option>
                    </select>
                    <div className="flex flex-col">
                      <button onClick={() => moveChapter(c.id, -1)} className="text-slate-600 hover:text-white cursor-pointer" aria-label="Move up">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveChapter(c.id, 1)} className="text-slate-600 hover:text-white cursor-pointer" aria-label="Move down">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => update({ chapters: state.chapters.filter((x) => x.id !== c.id) })}
                      className="text-slate-600 hover:text-rose-400 cursor-pointer"
                      aria-label="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={c.summary}
                    onChange={(e) => updateChapter(c.id, { summary: e.target.value })}
                    placeholder="What happens in this chapter…"
                    className="w-full bg-slate-950/60 border border-slate-900 text-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  update({
                    chapters: [
                      ...state.chapters,
                      { id: uid(), title: `Chapter ${state.chapters.length + 1}`, summary: "", words: 0, status: "outline" },
                    ],
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add Chapter
              </button>
            </div>
          )}

          {tab === "characters" && (
            <div className="space-y-3">
              {state.characters.map((c) => (
                <div key={c.id} className="bg-slate-900/35 border border-slate-900 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCharacter(c.id, { name: e.target.value })}
                      placeholder="Character name"
                      className={`flex-1 ${smallInput}`}
                    />
                    <select
                      value={c.role}
                      onChange={(e) => updateCharacter(c.id, { role: e.target.value })}
                      className={`w-40 ${smallInput}`}
                    >
                      <option value="">Role…</option>
                      <option>Protagonist</option>
                      <option>Antagonist</option>
                      <option>Love Interest</option>
                      <option>Mentor</option>
                      <option>Sidekick</option>
                      <option>Supporting</option>
                    </select>
                    <button
                      onClick={() => update({ characters: state.characters.filter((x) => x.id !== c.id) })}
                      className="text-slate-600 hover:text-rose-400 cursor-pointer"
                      aria-label="Delete character"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={c.notes}
                    onChange={(e) => updateCharacter(c.id, { notes: e.target.value })}
                    placeholder="Appearance, motivation, arc, secrets…"
                    className="w-full bg-slate-950/60 border border-slate-900 text-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  update({ characters: [...state.characters, { id: uid(), name: "", role: "", notes: "" }] })
                }
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add Character
              </button>
            </div>
          )}

          {tab === "notes" && (
            <div className="bg-slate-900/35 border border-slate-900 rounded-2xl p-4">
              <textarea
                rows={16}
                value={state.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="World-building details, research links, plot threads to resolve, marketing ideas…"
                className="w-full bg-slate-950/60 border border-slate-900 text-slate-200 rounded-xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Your plan autosaves to this browser&apos;s local storage — it never leaves your
              device. Export the outline regularly as a backup, and note that clearing browser data
              will erase the plan.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
