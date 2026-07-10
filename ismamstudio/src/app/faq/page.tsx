import FAQPageInner from "./FAQPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Ismam Studio Help Center",
  description: "Have questions about Ismam Studio? Read our FAQs about puzzle creation, trim size compliance, commercial rights, licensing, and our AppSumo lifetime deals.",
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Ismam Studio and who is it for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ismam Studio is an all-in-one book interior creator designed specifically for self-published authors, educators, and content creators looking to generate print-ready books for Amazon KDP (Kindle Direct Publishing)."
        }
      },
      {
        "@type": "Question",
        "name": "How is Ismam Studio different from other puzzle creators?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike basic generators that produce plain grids or require complex design software, Ismam Studio offers an interactive, real-time visual canvas with zero limits. It formats files specifically to meet Amazon KDP trim sizes, automatically pairs puzzles with matching solution keys on A4/standard trim layouts, and features an integrated Cover Studio so you can build your entire book in the same workflow."
        }
      },
      {
        "@type": "Question",
        "name": "Does Ismam Studio integrate with other self-publishing platforms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Ismam Studio outputs standard, high-resolution vector PDF interiors that are fully compliant with Amazon KDP print specifications. These files can also be uploaded to other print-on-demand networks like IngramSpark, Lulu, Barnes & Noble Press, and Draft2Digital without needing additional formatting."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use the generated puzzles and books for commercial purposes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All puzzle interiors, grids, and cover layouts generated under your account come with full commercial rights. You can publish, print, and sell them as your own books on Amazon KDP or any other marketplace, and you keep 100% of your royalties."
        }
      },
      {
        "@type": "Question",
        "name": "Are there limits on how many pages or puzzles I can generate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No! With our paid tiers, you have unlimited puzzle and page generation. You can compile large compilations, custom activity books, or test different difficulty levels without worrying about monthly generation caps or page count restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "What file formats does Ismam Studio export?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We export print-ready PDF files for book interiors and high-quality PNG/JPG layouts for covers. The PDFs are generated with clean vector lines, ensuring crisp, clear print quality even at high page numbers when printed by Amazon."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AppSumo deal work? Is there a monthly subscription?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "By purchasing the AppSumo Lifetime Deal (LTD), you pay a one-time fee with absolutely no recurring charges or monthly subscription costs. You get lifetime access to all core generators, editors, and future updates. AppSumo buyers are covered by AppSumo's standard 60-day money-back guarantee, which overrides our standard 7-day SaaS refund policy for these promotional licenses."
        }
      }
    ]
  };

  return (
    <>
      <FAQPageInner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
