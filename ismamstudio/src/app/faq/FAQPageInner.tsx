"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is Ismam Studio and who is it for?",
    answer: "Ismam Studio is an all-in-one book interior creator designed specifically for self-published authors, educators, and content creators looking to generate print-ready books for Amazon KDP (Kindle Direct Publishing). It helps you build puzzle books (Sudoku, Mazes, Cryptograms, Math grids, Word searches, Scrambles) and write chapter outlines in minutes."
  },
  {
    question: "How is Ismam Studio different from other puzzle creators?",
    answer: "Unlike basic generators that produce plain grids or require complex design software, Ismam Studio offers an interactive, real-time visual canvas with zero limits. It formats files specifically to meet Amazon KDP trim sizes, automatically pairs puzzles with matching solution keys on A4/standard trim layouts, and features an integrated Cover Studio so you can build your entire book in the same workflow."
  },
  {
    question: "Does Ismam Studio integrate with other self-publishing platforms?",
    answer: "Yes. Ismam Studio outputs standard, high-resolution vector PDF interiors that are fully compliant with Amazon KDP print specifications. These files can also be uploaded to other print-on-demand networks like IngramSpark, Lulu, Barnes & Noble Press, and Draft2Digital without needing additional formatting."
  },
  {
    question: "Can I use the generated puzzles and books for commercial purposes?",
    answer: "Yes! All puzzle interiors, grids, and cover layouts generated under your account come with full commercial rights. You can publish, print, and sell them as your own books on Amazon KDP or any other marketplace, and you keep 100% of your royalties."
  },
  {
    question: "Are there limits on how many pages or puzzles I can generate?",
    answer: "No! With our paid tiers, you have unlimited puzzle and page generation. You can compile large compilations, custom activity books, or test different difficulty levels without worrying about monthly generation caps or page count restrictions."
  },
  {
    question: "What file formats does Ismam Studio export?",
    answer: "We export print-ready PDF files for book interiors and high-quality PNG/JPG layouts for covers. The PDFs are generated with clean vector lines, ensuring crisp, clear print quality even at high page numbers when printed by Amazon."
  },
  {
    question: "How does the AppSumo deal work? Is there a monthly subscription?",
    answer: "By purchasing the AppSumo Lifetime Deal (LTD), you pay a one-time fee with absolutely no recurring charges or monthly subscription costs. You get lifetime access to all core generators, editors, and future updates. AppSumo buyers are covered by AppSumo's standard 60-day money-back guarantee, which overrides our standard 7-day SaaS refund policy for these promotional licenses."
  }
];

export default function FAQPageInner() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Frequently Asked Questions</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Ismam Studio Help & Support</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-800/85 bg-slate-900/30 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex justify-between items-center gap-4 font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 animate-fade-in" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-slate-300 text-sm font-semibold leading-relaxed border-t border-slate-800/50 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
