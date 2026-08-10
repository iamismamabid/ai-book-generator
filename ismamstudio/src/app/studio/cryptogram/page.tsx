import CryptogramGenerator from "@/components/tools/CryptogramGenerator";

export const metadata = {
  alternates: { canonical: "https://www.kdpage.com/studio/cryptogram" },
  title: "Cryptogram Generator | KDPage",
  description: "Create print-ready cryptogram quote puzzles for KDP publishing.",
};

export default function CryptogramPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <h1 className="sr-only">Cryptogram Generator for KDP Publishing</h1>
      <CryptogramGenerator />
    </div>
  );
}
