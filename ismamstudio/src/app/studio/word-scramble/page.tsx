import WordScrambleGenerator from "@/components/tools/WordScrambleGenerator";

export const metadata = {
  title: "Word Scramble Generator | Ismam Studio",
  description: "Create print-ready word scramble puzzle books for Amazon KDP.",
};

export default function WordScramblePage() {
  return (
    <div className="bg-[#F8FAFC]">
      <WordScrambleGenerator />
    </div>
  );
}
