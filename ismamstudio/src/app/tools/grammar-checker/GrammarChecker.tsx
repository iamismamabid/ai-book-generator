"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { analyzeText, readabilityScores, fleschLabel, splitSentences } from "@/components/tools/textStats";
import { PenTool, AlertTriangle, CheckCircle2, Info, Gauge } from "lucide-react";

type Severity = "error" | "warning" | "style";

interface Issue {
  severity: Severity;
  category: string;
  message: string;
  excerpt: string;
}

const CLICHES = [
  "at the end of the day", "in the nick of time", "avoid like the plague", "dead as a doornail",
  "take the bull by the horns", "low-hanging fruit", "think outside the box", "the calm before the storm",
  "every cloud has a silver lining", "time will tell", "easier said than done", "when all is said and done",
  "cold sweat", "heart of gold", "last but not least", "leave no stone unturned", "needle in a haystack",
  "tip of the iceberg", "a matter of time", "in this day and age",
];

const FILLERS = ["very", "really", "just", "quite", "actually", "basically", "literally", "totally", "simply", "somewhat", "rather", "definitely"];

const IRREGULAR_PARTICIPLES = "known|done|made|given|taken|seen|found|shown|told|thought|written|held|left|put|set|kept|paid|built|sent|brought|bought|caught|taught|sold|heard|felt|meant|led|read|said|understood|chosen|broken|spoken|driven|eaten|fallen|forgotten|hidden|drawn|grown|thrown|worn|born";

function clip(s: string, max = 90): string {
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

function checkText(text: string): Issue[] {
  const issues: Issue[] = [];
  const sentences = splitSentences(text);
  const lower = text.toLowerCase();

  // --- Mechanics (errors) ---
  const doubles = text.match(/\b(\w+)\s+\1\b/gi) || [];
  doubles.forEach((m) =>
    issues.push({ severity: "error", category: "Repeated word", message: "Duplicated word — delete one.", excerpt: clip(m) })
  );

  if (/ {2,}/.test(text.replace(/\n/g, ""))) {
    const count = (text.match(/ {2,}/g) || []).length;
    issues.push({ severity: "error", category: "Double spaces", message: `${count} double-space${count > 1 ? "s" : ""} found — KDP typesetting looks cleaner with single spaces.`, excerpt: "" });
  }

  (text.match(/\s+[,.;:!?]/g) || []).forEach(() =>
    issues.push({ severity: "error", category: "Spacing", message: "Space before punctuation mark.", excerpt: "" })
  );

  (text.match(/[,.;:!?]{2,}/g) || [])
    .filter((m) => !/^(\.\.\.|!!|\?\?|\?!|!\?)$/.test(m) && m !== "..")
    .forEach((m) =>
      issues.push({ severity: "warning", category: "Punctuation", message: "Unusual punctuation cluster.", excerpt: clip(m) })
    );

  sentences.forEach((s) => {
    if (/^[a-z]/.test(s) && s.length > 3) {
      issues.push({ severity: "warning", category: "Capitalization", message: "Sentence may be missing a capital letter.", excerpt: clip(s) });
    }
  });

  // --- Style ---
  const passiveRe = new RegExp(`\\b(am|is|are|was|were|be|been|being)\\s+(\\w+ed|${IRREGULAR_PARTICIPLES})\\b`, "gi");
  const passives = text.match(passiveRe) || [];
  passives.slice(0, 8).forEach((m) =>
    issues.push({ severity: "style", category: "Passive voice", message: "Consider active voice for stronger prose.", excerpt: clip(m) })
  );

  sentences.forEach((s) => {
    const w = s.split(/\s+/).length;
    if (w > 35) {
      issues.push({ severity: "warning", category: "Long sentence", message: `${w} words — consider splitting for readability.`, excerpt: clip(s) });
    }
  });

  sentences.forEach((s) => {
    if (/^(there (is|are|was|were)|it is|it was)\b/i.test(s.trim())) {
      issues.push({ severity: "style", category: "Weak opener", message: "Sentence opens with a filler construction — try leading with the subject.", excerpt: clip(s) });
    }
  });

  FILLERS.forEach((f) => {
    const count = (lower.match(new RegExp(`\\b${f}\\b`, "g")) || []).length;
    if (count >= 3) {
      issues.push({ severity: "style", category: "Filler words", message: `"${f}" appears ${count} times — most can be cut without losing meaning.`, excerpt: "" });
    }
  });

  const advCount = (lower.match(/\b\w+ly\b/g) || []).length;
  const wordTotal = (lower.match(/\b\w+\b/g) || []).length;
  if (wordTotal > 100 && advCount / wordTotal > 0.04) {
    issues.push({ severity: "style", category: "Adverb overuse", message: `${advCount} “-ly” adverbs (${((advCount / wordTotal) * 100).toFixed(1)}% of words) — strong verbs beat adverbs.`, excerpt: "" });
  }

  CLICHES.forEach((c) => {
    if (lower.includes(c)) {
      issues.push({ severity: "style", category: "Cliché", message: "Well-worn phrase — consider something fresher.", excerpt: c });
    }
  });

  return issues;
}

const SEVERITY_STYLES: Record<Severity, { chip: string; label: string }> = {
  error: { chip: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Fix" },
  warning: { chip: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Check" },
  style: { chip: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20", label: "Style" },
};

export default function GrammarChecker() {
  const [text, setText] = useState<string>("");

  const issues = useMemo(() => (text.trim() ? checkText(text) : []), [text]);
  const stats = useMemo(() => analyzeText(text), [text]);
  const scores = useMemo(() => readabilityScores(stats), [stats]);
  const hasText = stats.words >= 10;

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;
  const styleCount = issues.filter((i) => i.severity === "style").length;

  // Clarity score: start at 100, subtract weighted issues per 100 words
  const per100 = Math.max(1, stats.words / 100);
  const clarity = hasText
    ? Math.max(0, Math.min(100, Math.round(100 - (errorCount * 8 + warnCount * 4 + styleCount * 2) / per100)))
    : 0;

  const faqs = [
    {
      q: "Does this catch every grammar mistake?",
      a: "No — it's a rule-based checker for mechanical slips, passive voice, filler words, and clichés. For a final manuscript, pair it with a human proofread.",
    },
    {
      q: "Is my text uploaded anywhere?",
      a: "No — every check runs locally in your browser; nothing is sent to a server.",
    },
    {
      q: "What does the Clarity Score measure?",
      a: "A 0-100 estimate that weighs how many mechanical errors and style warnings appear relative to your text length — higher is cleaner.",
    },
  ];

  return (
    <ToolShell
      title="Grammar & Style"
      highlight="Checker"
      subtitle="Rule-based checks for mechanics, passive voice, filler words, clichés, and readability — private, instant, and free. Nothing leaves your browser."
      faqs={faqs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-400" /> Your Text
            </h3>
            <textarea
              rows={18}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your book description, blurb, or chapter here. The checker looks for mechanical errors, passive voice, filler words, weak openers, clichés, and overlong sentences."
              className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Words</span>
                <span className="text-sm font-black text-white">{stats.words.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Sentences</span>
                <span className="text-sm font-black text-white">{stats.sentences.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Reading Ease</span>
                <span className="text-sm font-black text-white">
                  {hasText ? scores.fleschReadingEase.toFixed(0) : "—"}
                </span>
              </div>
            </div>
            {hasText && (
              <p className="text-[11px] font-bold text-slate-500">
                Readability: {fleschLabel(scores.fleschReadingEase).label} —{" "}
                {fleschLabel(scores.fleschReadingEase).audience}
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-6">
          {/* Clarity score */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/35 border border-indigo-500/20 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" /> Clarity Score
              </span>
              <div className="flex gap-2 text-[10px] font-black">
                <span className="text-rose-400">{errorCount} fix</span>
                <span className="text-amber-400">{warnCount} check</span>
                <span className="text-indigo-300">{styleCount} style</span>
              </div>
            </div>
            <span className="text-5xl font-black text-white">{hasText ? clarity : "—"}</span>
            <span className="text-xl font-black text-slate-500">/100</span>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 mt-4">
              <div
                className={`h-full rounded-full transition-all ${
                  clarity >= 80 ? "bg-emerald-500" : clarity >= 55 ? "bg-yellow-500" : "bg-rose-500"
                }`}
                style={{ width: `${clarity}%` }}
              />
            </div>
          </div>

          {/* Issues */}
          {hasText && issues.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-sm font-bold text-emerald-200">
                No issues found by the rule-based checks. Clean copy!
              </p>
            </div>
          ) : issues.length > 0 ? (
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-2 max-h-[480px] overflow-y-auto">
              {issues.slice(0, 60).map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-900/60"
                >
                  <span
                    className={`shrink-0 text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-md mt-0.5 ${SEVERITY_STYLES[issue.severity].chip}`}
                  >
                    {SEVERITY_STYLES[issue.severity].label}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-white block">{issue.category}</span>
                    <span className="text-[11px] font-semibold text-slate-400 block">{issue.message}</span>
                    {issue.excerpt && (
                      <span className="text-[11px] font-mono text-yellow-500/90 block mt-1 truncate">
                        “{issue.excerpt}”
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {issues.length > 60 && (
                <p className="text-[11px] font-bold text-slate-500 text-center pt-2">
                  + {issues.length - 60} more — fix the ones above and re-check.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-10 text-center">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                Paste at least 10 words to run the checks.
              </p>
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              This is a rule-based checker — it catches mechanical slips and style patterns, not
              every grammatical error. For a final manuscript, pair it with a human proofread.
              Your text is processed entirely in your browser and never uploaded.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
