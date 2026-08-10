import CrosswordGenerator from "@/components/tools/CrosswordGenerator";

export const metadata = {
  alternates: { canonical: "https://www.kdpage.com/studio/crossword" },
  title: "Crossword Generator | KDPage",
  description: "Create print-ready crossword puzzle interiors for Amazon KDP self-publishing.",
};

export default function CrosswordPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <h1 className="sr-only">Crossword Generator for KDP Publishing</h1>
      <CrosswordGenerator />
    </div>
  );
}
