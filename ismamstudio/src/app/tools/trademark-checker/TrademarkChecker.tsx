"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle, Info, Search } from "lucide-react";

// Commonly trademarked terms that KDP publishers frequently (and accidentally) use.
// This is a heuristic screening list, not a legal database.
const RISKY_TERMS: { term: string; owner: string }[] = [
  { term: "lego", owner: "LEGO Group" },
  { term: "disney", owner: "Disney" },
  { term: "barbie", owner: "Mattel" },
  { term: "hot wheels", owner: "Mattel" },
  { term: "pokemon", owner: "Nintendo / The Pokémon Company" },
  { term: "pokémon", owner: "Nintendo / The Pokémon Company" },
  { term: "pikachu", owner: "Nintendo / The Pokémon Company" },
  { term: "marvel", owner: "Marvel / Disney" },
  { term: "spiderman", owner: "Marvel / Disney" },
  { term: "spider-man", owner: "Marvel / Disney" },
  { term: "batman", owner: "DC Comics / Warner Bros." },
  { term: "superman", owner: "DC Comics / Warner Bros." },
  { term: "harry potter", owner: "Warner Bros. / J.K. Rowling" },
  { term: "hogwarts", owner: "Warner Bros. / J.K. Rowling" },
  { term: "star wars", owner: "Lucasfilm / Disney" },
  { term: "jedi", owner: "Lucasfilm / Disney" },
  { term: "minecraft", owner: "Mojang / Microsoft" },
  { term: "fortnite", owner: "Epic Games" },
  { term: "roblox", owner: "Roblox Corporation" },
  { term: "nintendo", owner: "Nintendo" },
  { term: "mario", owner: "Nintendo" },
  { term: "zelda", owner: "Nintendo" },
  { term: "scrabble", owner: "Hasbro / Mattel" },
  { term: "monopoly", owner: "Hasbro" },
  { term: "nerf", owner: "Hasbro" },
  { term: "play-doh", owner: "Hasbro" },
  { term: "rubik", owner: "Spin Master" },
  { term: "rubik's cube", owner: "Spin Master" },
  { term: "boggle", owner: "Hasbro" },
  { term: "pictionary", owner: "Mattel" },
  { term: "uno", owner: "Mattel" },
  { term: "jenga", owner: "Hasbro" },
  { term: "twister", owner: "Hasbro" },
  { term: "candy land", owner: "Hasbro" },
  { term: "dungeons and dragons", owner: "Wizards of the Coast" },
  { term: "dungeons & dragons", owner: "Wizards of the Coast" },
  { term: "d&d", owner: "Wizards of the Coast" },
  { term: "paw patrol", owner: "Spin Master" },
  { term: "peppa pig", owner: "Hasbro / eOne" },
  { term: "bluey", owner: "BBC Studios" },
  { term: "cocomelon", owner: "Moonbug" },
  { term: "sesame street", owner: "Sesame Workshop" },
  { term: "elmo", owner: "Sesame Workshop" },
  { term: "hello kitty", owner: "Sanrio" },
  { term: "pixar", owner: "Disney" },
  { term: "frozen", owner: "Disney (for related goods)" },
  { term: "elsa", owner: "Disney (character)" },
  { term: "avengers", owner: "Marvel / Disney" },
  { term: "minions", owner: "Universal" },
  { term: "grinch", owner: "Dr. Seuss Enterprises" },
  { term: "dr. seuss", owner: "Dr. Seuss Enterprises" },
  { term: "wordle", owner: "The New York Times" },
  { term: "sharpie", owner: "Newell Brands" },
  { term: "crayola", owner: "Crayola" },
  { term: "post-it", owner: "3M" },
  { term: "velcro", owner: "Velcro Companies" },
  { term: "frisbee", owner: "Wham-O" },
  { term: "hula hoop", owner: "Wham-O" },
  { term: "slinky", owner: "Just Play" },
  { term: "netflix", owner: "Netflix" },
  { term: "tiktok", owner: "ByteDance" },
  { term: "instagram", owner: "Meta" },
  { term: "kindle", owner: "Amazon (as brand in titles)" },
  { term: "amazon", owner: "Amazon (as brand in titles)" },
  { term: "olympics", owner: "IOC" },
  { term: "olympic", owner: "IOC" },
  { term: "super bowl", owner: "NFL" },
  { term: "nfl", owner: "NFL" },
  { term: "nba", owner: "NBA" },
  { term: "fifa", owner: "FIFA" },
  { term: "world cup", owner: "FIFA (for related goods)" },
  { term: "taylor swift", owner: "TAS Rights Management" },
  { term: "swiftie", owner: "TAS Rights Management" },
];

// Generic terms publishers often worry about that are safe to use descriptively.
const SAFE_GENERICS = ["sudoku", "crossword", "word search", "maze", "coloring book", "journal", "planner", "notebook", "puzzle"];

interface Finding {
  term: string;
  owner: string;
}

export default function TrademarkChecker() {
  const [input, setInput] = useState<string>("");
  const [checked, setChecked] = useState<boolean>(false);

  const findings: Finding[] = useMemo(() => {
    const lower = ` ${input.toLowerCase().replace(/\s+/g, " ")} `;
    const seen = new Set<string>();
    const out: Finding[] = [];
    RISKY_TERMS.forEach(({ term, owner }) => {
      const pattern = new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`, "i");
      if (pattern.test(lower) && !seen.has(owner + term)) {
        seen.add(owner + term);
        out.push({ term, owner });
      }
    });
    return out;
  }, [input]);

  const genericsUsed = useMemo(
    () => SAFE_GENERICS.filter((g) => input.toLowerCase().includes(g)),
    [input]
  );

  const usptoUrl = `https://tmsearch.uspto.gov/search/search-information`;
  const euipoUrl = `https://www.tmdn.org/tmview/#/tmview`;

  const faqs = [
    {
      q: "Is this a complete trademark database?",
      a: "No — it's a curated screening list of terms that commonly cause KDP takedowns. Always run an official search (linked below) before finalizing your title.",
    },
    {
      q: "Can I still use a generic word like 'sudoku' or 'crossword'?",
      a: "Yes — generic category terms are safe to use descriptively; they aren't the trademarked brand names this tool screens for.",
    },
    {
      q: "What happens if I publish with a trademarked term in my title?",
      a: "Amazon can block the listing or suspend your account, or the rights holder can send a takedown notice — it's worth removing flagged terms before you upload.",
    },
  ];

  return (
    <ToolShell
      title="Trademark"
      highlight="Checker"
      subtitle="Screen your book title, subtitle, and keywords against commonly trademarked terms before Amazon flags your listing."
      maxWidth="max-w-5xl"
      faqs={faqs}
    >
      <div className="space-y-8">
        <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-5 backdrop-blur-md">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" /> Title, Subtitle & Keywords
          </h3>
          <textarea
            rows={4}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setChecked(false);
            }}
            placeholder={`Paste your full title, subtitle, and all 7 backend keywords.\ne.g. "Word Puzzle Book for Kids Who Love Minecraft and Pokemon"`}
            className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => setChecked(true)}
            disabled={!input.trim()}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
          >
            Check Against {RISKY_TERMS.length}+ Known Trademarks
          </button>
        </div>

        {checked && input.trim() && (
          <>
            {findings.length > 0 ? (
              <div className="bg-rose-500/10 border border-rose-500/25 rounded-[2rem] p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  <h3 className="text-lg font-black text-white">
                    {findings.length} Potential Trademark Issue{findings.length > 1 ? "s" : ""} Found
                  </h3>
                </div>
                <div className="space-y-2">
                  {findings.map((f) => (
                    <div
                      key={f.term}
                      className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-rose-500/20"
                    >
                      <span className="text-sm font-black text-rose-300">&quot;{f.term}&quot;</span>
                      <span className="text-xs font-bold text-slate-400">
                        Commonly associated with: {f.owner}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-rose-200 leading-relaxed">
                  Using trademarked terms in titles, subtitles, or keywords can get your book
                  blocked, your account suspended, or worse — a cease &amp; desist. Remove these
                  terms or verify the specific goods/services class before publishing.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-[2rem] p-8 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-white mb-1">No Known Trademarks Detected</h3>
                  <p className="text-xs font-bold text-emerald-200 leading-relaxed">
                    Your text doesn&apos;t match our screening list of commonly trademarked terms.
                    This is a first-pass screen only — run an official search below before finalizing
                    your title.
                  </p>
                </div>
              </div>
            )}

            {genericsUsed.length > 0 && (
              <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 space-y-2">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" /> Generic Terms — Generally Safe
                </h4>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  {genericsUsed.map((g) => `"${g}"`).join(", ")} — these are generic descriptive
                  terms for book categories and are safe to use descriptively (e.g. &quot;Sudoku
                  Puzzle Book&quot;).
                </p>
              </div>
            )}
          </>
        )}

        {/* Official search links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={usptoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/35 border border-slate-900 hover:border-indigo-500 rounded-3xl p-6 flex items-center justify-between transition-all group"
          >
            <div>
              <span className="text-sm font-black text-white block group-hover:text-indigo-300">
                USPTO Trademark Search
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Official US trademark database (free)
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
          </a>
          <a
            href={euipoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/35 border border-slate-900 hover:border-indigo-500 rounded-3xl p-6 flex items-center justify-between transition-all group"
          >
            <div>
              <span className="text-sm font-black text-white block group-hover:text-indigo-300">
                TMview (EU / Global)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Search 100M+ trademarks across 75+ offices
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
          </a>
        </div>

        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            This tool screens against a curated list of terms that frequently cause KDP takedowns —
            it is not a complete trademark database and not legal advice. Trademarks are registered
            per country and per goods/services class, so always verify with the official databases
            above (or an IP attorney) before publishing.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
