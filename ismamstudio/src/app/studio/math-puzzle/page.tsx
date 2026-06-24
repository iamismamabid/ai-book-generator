import MathPuzzleGenerator from "@/components/tools/MathPuzzleGenerator";

export const metadata = {
  title: "Math Puzzle Generator | Ismam.AI Studio",
  description: "Create print-ready addition, multiplication, and arithmetic logic puzzle books for KDP.",
};

export default function MathPuzzlePage() {
  return (
    <div className="bg-[#F8FAFC]">
      <MathPuzzleGenerator />
    </div>
  );
}
