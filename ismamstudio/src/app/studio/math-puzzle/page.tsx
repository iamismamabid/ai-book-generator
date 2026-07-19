import MathPuzzleGenerator from "@/components/tools/MathPuzzleGenerator";

export const metadata = {
  alternates: { canonical: "https://www.kdpage.com/studio/math-puzzle" },
  title: "Math Puzzle Generator | KDPage",
  description: "Create print-ready addition, multiplication, and arithmetic logic puzzle books for KDP.",
};

export default function MathPuzzlePage() {
  return (
    <div className="bg-[#F8FAFC]">
      <MathPuzzleGenerator />
    </div>
  );
}
