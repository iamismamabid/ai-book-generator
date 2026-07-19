import CrosswordGenerator from "@/components/tools/CrosswordGenerator";

export const metadata = {
  alternates: { canonical: "https://www.kdpage.com/studio/crossword" },
  title: "Crossword Generator | KDPage",
  description: "Create print-ready crossword puzzle interiors for Amazon KDP self-publishing.",
};

export default function CrosswordPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <CrosswordGenerator />
    </div>
  );
}
