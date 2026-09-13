import KdpBookDescriptionGeneratorClient from "./KdpBookDescriptionGeneratorClient";
import type { Metadata } from "next";

const SITE_URL = "https://www.kdpage.com";

export const metadata: Metadata = {
  title: "[2026] KDP Book Description Generator — Free Amazon HTML Editor & Live Preview | KDPage",
  description:
    "The #1 free Amazon KDP book description generator. Format clean Amazon-compliant HTML with bolding, headlines, bullet points, 4,000-character counter, and real-time Amazon product page preview.",
  keywords: [
    "kdp book description generator",
    "amazon book description generator",
    "amazon kdp html description generator",
    "kdp description formatter",
    "amazon book description editor",
    "kdp book description html tool",
    "amazon book blurb generator",
    "kdp html description formatter free 2026",
    "kindle book description generator",
    "amazon description character counter"
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kdp-book-description-generator`,
  },
  openGraph: {
    title: "[2026] KDP Book Description Generator — Free Amazon HTML Editor | KDPage",
    description:
      "Format clean, compliant Amazon KDP book descriptions with live Amazon product page preview, allowed HTML tags, and real-time 4,000-character counter.",
    url: `${SITE_URL}/tools/kdp-book-description-generator`,
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDP Book Description Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "[2026] KDP Book Description Generator | KDPage",
    description:
      "Create high-converting Amazon KDP book descriptions with live preview and 1-click compliant HTML export.",
    images: ["/og-image.png"],
  },
};

export default function KdpBookDescriptionGeneratorPage() {
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KDP Book Description Generator & HTML Formatter",
    "operatingSystem": "All modern web browsers (Chrome, Safari, Edge, Firefox)",
    "applicationCategory": "DesignApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "320",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Interactive Amazon KDP book description HTML generator and live product page preview tool. Automatically formats clean, compliant HTML headers, bullet lists, and bold text with a 4,000-character safeguard counter.",
    "url": `${SITE_URL}/tools/kdp-book-description-generator`,
    "author": {
      "@type": "Organization",
      "name": "KDPage",
      "url": SITE_URL
    }
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What HTML tags are allowed in Amazon KDP book descriptions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon strictly permits: <h2>, <h3>, <h4>, <h5>, <h6>, <b>, <strong>, <i>, <em>, <u>, <s>, <strike>, <ol>, <ul>, <li>, <p>, <br>, <sub>, and <sup>. Any unapproved tags such as <div>, <span>, or <style> are automatically stripped by Amazon."
        }
      },
      {
        "@type": "Question",
        "name": "What is the maximum character limit for Amazon KDP descriptions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon limits book descriptions to 4,000 characters total, including all HTML tags, spaces, and punctuation. If your code exceeds 4,000 characters, Amazon will either reject your publishing submission or abruptly cut off the text."
        }
      },
      {
        "@type": "Question",
        "name": "Why does my book description look unformatted on Amazon?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When you paste standard text into KDP without HTML tags, Amazon collapses all line breaks and ignores formatting. You must wrap headings in <h2> or <h3>, bold text in <b>, and lists in <ul><li> tags so Amazon renders them properly on the product page."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use emojis in my Amazon KDP book description?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, basic Unicode emojis (such as ⭐, 🚀, ✅, 🏆) are supported by Amazon and help catch the buyer's attention. However, avoid overloading your description with emojis as Amazon's automated review system may flag it for keyword stuffing or spam."
        }
      },
      {
        "@type": "Question",
        "name": "How does a well-formatted description increase book sales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Online shoppers scan before reading. Using bold headlines, short 2-sentence paragraphs, and bullet points highlights key benefits and hooks immediately, leading to significantly higher conversion rates from ad clicks and search impressions."
        }
      }
    ]
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Generate an Amazon-Compliant KDP Book Description",
    "description": "Write and format an Amazon KDP book description with clean HTML in 3 simple steps.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Choose a High-Converting Template or Write Your Blurb",
        "text": "Select from fiction, non-fiction, activity, or puzzle book templates, or type your custom description into the visual editor.",
        "url": `${SITE_URL}/tools/kdp-book-description-generator#step1`
      },
      {
        "@type": "HowToStep",
        "name": "Format with Amazon-Approved Tags & Check Character Limit",
        "text": "Add headlines, bolding, and bullet points while keeping the character count under Amazon's 4,000-character ceiling.",
        "url": `${SITE_URL}/tools/kdp-book-description-generator#step2`
      },
      {
        "@type": "HowToStep",
        "name": "Copy Clean HTML & Paste Directly into KDP Dashboard",
        "text": "Click 'Copy Amazon HTML' and paste it directly into the Description field in your Amazon KDP book details tab.",
        "url": `${SITE_URL}/tools/kdp-book-description-generator#step3`
      }
    ]
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Free KDP Tools",
        "item": `${SITE_URL}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "KDP Book Description Generator",
        "item": `${SITE_URL}/tools/kdp-book-description-generator`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <KdpBookDescriptionGeneratorClient />
    </>
  );
}
