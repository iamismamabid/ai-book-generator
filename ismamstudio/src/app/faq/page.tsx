import FAQPageInner from "./FAQPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.kdpage.com/faq" },
  title: "Frequently Asked Questions | KDPage Help Center",
  description: "Have questions about KDPage? Read our FAQs about puzzle creation, trim size compliance, commercial rights, licensing, and subscription plans.",
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is KDPage and who is it for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "KDPage is an all-in-one book interior creator designed specifically for self-published authors, educators, and content creators looking to generate print-ready books for Amazon KDP (Kindle Direct Publishing)."
        }
      },
      {
        "@type": "Question",
        "name": "How is KDPage different from other puzzle creators?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike basic generators that produce plain grids or require complex design software, KDPage offers an interactive, real-time visual canvas with zero limits. It formats files specifically to meet Amazon KDP trim sizes, automatically pairs puzzles with matching solution keys on A4/standard trim layouts, and features an integrated Cover Studio so you can build your entire book in the same workflow."
        }
      },
      {
        "@type": "Question",
        "name": "Does KDPage integrate with other self-publishing platforms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. KDPage outputs standard, high-resolution vector PDF interiors that are fully compliant with Amazon KDP print specifications. These files can also be uploaded to other print-on-demand networks like IngramSpark, Lulu, Barnes & Noble Press, and Draft2Digital without needing additional formatting."
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
          "text": "No! With our paid tiers, you have high-capacity puzzle and page generation limits. You can compile large compilations, custom activity books, or test different difficulty levels without low free tier restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "What file formats does KDPage export?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We export print-ready PDF files for book interiors and high-quality PNG/JPG layouts for covers. The PDFs are generated with clean vector lines, ensuring crisp, clear print quality even at high page numbers when printed by Amazon."
        }
      },
      {
        "@type": "Question",
        "name": "What subscription plans are available and how can I cancel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "KDPage offers flexible Monthly, Annual, and Lifetime Deal plans (Starter Creator, Pro Studio, and Publisher Agency) with a 7-day trial for $1. You can upgrade, downgrade, or cancel your subscription at any time directly from your account dashboard's Manage Billing link."
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
