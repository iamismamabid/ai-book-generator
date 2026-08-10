import WordScrambleGenerator from "@/components/tools/WordScrambleGenerator";

export const metadata = {
  alternates: { canonical: "https://www.kdpage.com/studio/word-scramble" },
  title: "Word Scramble Generator | KDPage",
  description: "Create print-ready word scramble puzzle books for Amazon KDP.",
};

export default function WordScramblePage() {
  return (
    <div className="bg-[#F8FAFC]">
      <h1 className="sr-only">Word Scramble Generator for KDP Publishing</h1>
      <WordScrambleGenerator />
    </div>
  );
}
