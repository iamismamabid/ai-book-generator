// Shared text-analysis helpers for the free readability / grammar / density tools.
// Everything runs client-side — no text ever leaves the browser.

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z"'“(])|(?<=[.!?])$/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function splitWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-zÀ-ɏ']+/g) || []).filter(Boolean);
}

/** Heuristic English syllable counter — accurate enough for readability formulas. */
export function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  // Remove trailing silent-e patterns (but keep "-le" as in "table")
  w = w.replace(/(?:[^l]e|ed|es)$/, "").replace(/^y/, "");
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export interface TextStats {
  sentences: number;
  words: number;
  characters: number;
  letters: number;
  syllables: number;
  complexWords: number; // 3+ syllables
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export function analyzeText(text: string): TextStats {
  const sentenceList = splitSentences(text);
  const wordList = splitWords(text);
  const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);
  const complexWords = wordList.filter((w) => countSyllables(w) >= 3).length;
  const letters = (text.match(/[a-zA-Z0-9]/g) || []).length;

  const sentences = Math.max(1, sentenceList.length);
  const words = wordList.length;

  return {
    sentences: sentenceList.length,
    words,
    characters: text.length,
    letters,
    syllables,
    complexWords,
    avgWordsPerSentence: words / sentences,
    avgSyllablesPerWord: words > 0 ? syllables / words : 0,
  };
}

export interface ReadabilityScores {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smog: number;
  colemanLiau: number;
  ari: number;
}

export function readabilityScores(stats: TextStats): ReadabilityScores {
  const { words, syllables, complexWords, letters } = stats;
  const sentences = Math.max(1, stats.sentences);
  const w = Math.max(1, words);

  const fleschReadingEase = 206.835 - 1.015 * (w / sentences) - 84.6 * (syllables / w);
  const fleschKincaidGrade = 0.39 * (w / sentences) + 11.8 * (syllables / w) - 15.59;
  const gunningFog = 0.4 * (w / sentences + 100 * (complexWords / w));
  const smog = 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291;
  const L = (letters / w) * 100;
  const S = (sentences / w) * 100;
  const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;
  const ari = 4.71 * (letters / w) + 0.5 * (w / sentences) - 21.43;

  return { fleschReadingEase, fleschKincaidGrade, gunningFog, smog, colemanLiau, ari };
}

export function fleschLabel(score: number): { label: string; audience: string } {
  if (score >= 90) return { label: "Very Easy", audience: "5th grade — children's books" };
  if (score >= 80) return { label: "Easy", audience: "6th grade — easy conversational" };
  if (score >= 70) return { label: "Fairly Easy", audience: "7th grade — popular fiction" };
  if (score >= 60) return { label: "Standard", audience: "8th–9th grade — most bestsellers" };
  if (score >= 50) return { label: "Fairly Difficult", audience: "10th–12th grade — serious non-fiction" };
  if (score >= 30) return { label: "Difficult", audience: "College — academic writing" };
  return { label: "Very Difficult", audience: "Postgraduate — technical papers" };
}

export const STOPWORDS = new Set(
  "a,an,the,and,or,but,if,then,else,when,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,once,here,there,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,can,will,just,should,now,i,me,my,myself,we,our,ours,ourselves,you,your,yours,yourself,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,would,could,ought,as,of,it's,don't,didn't,isn't,aren't,wasn't,weren't,i'm,you're,we're,they're,i've,you've,we've,they've".split(
    ","
  )
);
