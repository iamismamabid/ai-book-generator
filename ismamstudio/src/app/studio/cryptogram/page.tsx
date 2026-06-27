import CryptogramGenerator from "@/components/tools/CryptogramGenerator";

export const metadata = {
  title: "Cryptogram Generator | Ismam Studio",
  description: "Create print-ready cryptogram quote puzzles for KDP publishing.",
};

export default function CryptogramPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <CryptogramGenerator />
    </div>
  );
}
