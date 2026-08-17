export default function JsonLdSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.kdpage.com/#software",
        "name": "KDPage",
        "alternateName": "KDPage KDP Book Creator",
        "url": "https://www.kdpage.com",
        "image": "https://www.kdpage.com/og-image.png",
        "description": "All-in-one Amazon KDP book creation toolkit. Generate mathematically unique Sudoku grids, shape-masked mazes, word searches, and wrap-around paperback covers with automatic spine calculation for 300 DPI vector PDF publishing.",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "All (Web Browser, Chrome, Safari, Edge, Firefox)",
        "softwareVersion": "2.7.0",
        "author": {
          "@type": "Organization",
          "name": "KDPage",
          "url": "https://www.kdpage.com"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Tier",
            "price": "0",
            "priceCurrency": "USD",
            "url": "https://www.kdpage.com/pricing"
          },
          {
            "@type": "Offer",
            "name": "Starter Creator (Annual)",
            "price": "99.00",
            "priceCurrency": "USD",
            "url": "https://www.kdpage.com/pricing"
          },
          {
            "@type": "Offer",
            "name": "Pro Studio (Annual - 2 Months Free)",
            "price": "179.00",
            "priceCurrency": "USD",
            "url": "https://www.kdpage.com/pricing"
          },
          {
            "@type": "Offer",
            "name": "Publisher Agency (Annual)",
            "price": "329.00",
            "priceCurrency": "USD",
            "url": "https://www.kdpage.com/pricing"
          },
          {
            "@type": "Offer",
            "name": "AppSumo Lifetime Deal",
            "price": "49.00",
            "priceCurrency": "USD",
            "url": "https://www.kdpage.com/redeem"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "128",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "Mathematical Sudoku Generator with Backtracking Single-Solution Solver",
          "Shape-Masked Maze Studio with Vector Pathing (Heart, Circle, Star)",
          "Wrap-Around KDP Paperback & Hardcover Studio with Live Spine Thickness Calculation",
          "Word Search Studio with Custom Niche CSV Import and Multi-Direction Placement",
          "Crossword & Cryptogram Puzzle Engine",
          "300 DPI Vector PDF Exporter for Amazon KDP Print on Demand",
          "30+ Free KDP Publisher Tools (Spine Calculator, Bleed Margin Validator, ISBN Barcode Generator, Royalty Estimator)"
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://www.kdpage.com/#organization",
        "name": "KDPage",
        "url": "https://www.kdpage.com",
        "logo": "https://www.kdpage.com/logo_transparent.png",
        "description": "Provider of algorithmic book publishing software and vector tools for Amazon KDP self-publishers.",
        "sameAs": [
          "https://www.trustpilot.com/review/kdpage.com",
          "https://github.com/iamismamabid/ai-book-generator"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.kdpage.com/#website",
        "url": "https://www.kdpage.com",
        "name": "KDPage",
        "publisher": {
          "@id": "https://www.kdpage.com/#organization"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.kdpage.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Does KDPage produce duplicate content that Amazon KDP could ban?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Unlike static PLR or Canva template packs that hundreds of creators download identically, KDPage uses deterministic mathematical algorithms and backtracking solvers. Every puzzle, maze, and interior layout is synthesized dynamically with custom seed coordinates and user word lists, guaranteeing 100% unique, commercial-grade interiors that comply with Amazon KDP terms."
            }
          },
          {
            "@type": "Question",
            "name": "Are KDPage exported PDF interiors ready to upload to Amazon KDP?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! All interior templates, mazes, word searches, and Sudokus export as high-fidelity, print-ready 300 DPI vector PDFs that strictly respect KDP guidelines, including standard trim sizes (6x9 in, 8.5x11 in), 0.125 in outer bleed margins, and gutter safety margins."
            }
          },
          {
            "@type": "Question",
            "name": "How does the KDP book cover spine thickness calculator work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "KDPage calculates spine thickness dynamically using Amazon's official formula: Page Count multiplied by 0.002252 inches for white paper (or 0.0025 inches for cream paper). The Cover Studio automatically adjusts the wrap-around canvas dimensions in real-time."
            }
          },
          {
            "@type": "Question",
            "name": "Do I own full commercial rights to sell books created with KDPage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All paid subscribers (Starter, Pro, Agency) and AppSumo lifetime code holders receive 100% commercial-use rights and a royalty-free license to publish and sell generated books, covers, and puzzle interiors on Amazon KDP, Etsy, IngramSpark, or personal online stores. You keep 100% of your royalties."
            }
          },
          {
            "@type": "Question",
            "name": "Can I create shape-masked mazes (Hearts, Circles, Stars)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. KDPage Shape-Masked Maze Studio allows publishers to generate labyrinths inside non-rectangular geometric shapes such as hearts, circles, triangles, and stars with complete solution keys."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
