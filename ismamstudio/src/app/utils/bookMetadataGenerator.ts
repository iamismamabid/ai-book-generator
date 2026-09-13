export interface BookPageItem {
  type: string;
  title?: string;
  config?: any;
}

export interface MetadataGeneratorOptions {
  bookPages: BookPageItem[];
  title?: string;
  subtitle?: string;
  author?: string;
  trimSize?: { label: string; w: number; h: number };
}

export interface KdpMetadataResult {
  title: string;
  subtitle: string;
  author: string;
  genre: string;
  pageCount: number;
  htmlDescription: string;
  plainDescription: string;
  keywords: string[];
  categories: string[];
  suggestedPriceUsd: number;
  printingCostUsd: number;
  estimatedRoyaltyUsd: number;
  cheatsheetText: string;
}

export function generateKdpMetadata(options: MetadataGeneratorOptions): KdpMetadataResult {
  const {
    bookPages = [],
    title: userTitle,
    subtitle: userSubtitle,
    author: userAuthor = "KDPage Publishing",
    trimSize = { label: '8.5" x 11"', w: 8.5, h: 11 },
  } = options;

  const pageCount = Math.max(bookPages.length, 24);

  // Count puzzle / page types
  const typeCounts: Record<string, number> = {};
  bookPages.forEach((p) => {
    const t = p.type || "puzzle";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const hasWordSearch = (typeCounts["word_search"] || 0) > 0;
  const hasSudoku = (typeCounts["sudoku"] || 0) > 0;
  const hasCrossword = (typeCounts["crossword"] || 0) > 0;
  const hasMaze = (typeCounts["maze"] || 0) > 0;
  const hasKakuro = (typeCounts["kakuro"] || 0) > 0;
  const hasScramble = (typeCounts["word_scramble"] || 0) > 0;
  const hasCryptogram = (typeCounts["cryptogram"] || 0) > 0;
  const hasMath = (typeCounts["math_puzzle"] || 0) > 0;
  const hasColoring = (typeCounts["coloring"] || 0) > 0;

  // Determine genre
  let genre = "Variety Puzzle Book";
  const typesPresent = Object.keys(typeCounts);

  if (typesPresent.length === 1) {
    if (hasWordSearch) genre = "Word Search Puzzle Book";
    else if (hasSudoku) genre = "Sudoku Puzzle Book";
    else if (hasCrossword) genre = "Crossword Puzzle Book";
    else if (hasMaze) genre = "Mazes Activity Book";
    else if (hasColoring) genre = "Coloring Book";
    else if (hasCryptogram) genre = "Cryptogram Puzzle Book";
  } else if (hasColoring && typesPresent.length <= 2) {
    genre = "Coloring & Activity Book";
  } else {
    genre = "Variety Brain Games & Puzzle Book";
  }

  // Titles
  const defaultTitle =
    userTitle?.trim() ||
    (genre === "Word Search Puzzle Book"
      ? "Word Search for Adults & Seniors"
      : genre === "Sudoku Puzzle Book"
      ? "Sudoku Master Challenge for Adults"
      : genre === "Coloring Book"
      ? "Mindful Relaxation Coloring Book"
      : "The Ultimate Variety Puzzle Book for Adults");

  const defaultSubtitle =
    userSubtitle?.trim() ||
    `Large Print Brain Games with Complete Solutions Included (${trimSize.w}" x ${trimSize.h}", ${pageCount} Pages)`;

  const author = userAuthor.trim() || "KDPage Press";

  // Build feature highlights
  const featureList: string[] = [];
  if (hasWordSearch) featureList.push(`Engaging Word Search Puzzles to expand vocabulary`);
  if (hasSudoku) featureList.push(`Classic Sudoku Challenges for logic and deductive focus`);
  if (hasCrossword) featureList.push(`Themed Crosswords with smart clues and answer keys`);
  if (hasMaze) featureList.push(`Intricate Mazes designed to test spatial navigation`);
  if (hasCryptogram) featureList.push(`Inspiring Cryptograms featuring wisdom quotes`);
  if (hasScramble) featureList.push(`Word Scramble games for anagram enthusiasts`);
  if (hasKakuro) featureList.push(`Kakuro (Cross-Sums) mathematical logic grids`);
  if (hasMath) featureList.push(`Creative Math Puzzles to keep mental math sharp`);
  if (hasColoring) featureList.push(`Stress-Relieving Coloring Illustrations with bold clean outlines`);

  if (featureList.length === 0) {
    featureList.push(`Handcrafted variety puzzles designed to stimulate memory and mental agility`);
    featureList.push(`Complete solutions conveniently located at the back`);
  }

  // HTML Description (strictly following Amazon KDP supported HTML tags)
  const htmlDescription = `<h2><b>Keep Your Mind Sharp, Calm Your Stress, and Enjoy Hours of Screen-Free Entertainment!</b></h2>

<p>Looking for a fun and relaxing way to exercise your cognitive skills? <b>${defaultTitle}</b> is thoughtfully crafted to provide the perfect balance of challenge and pure relaxation for adults, seniors, and puzzle lovers of all skill levels.</p>

<hr>

<h3><b>🌟 What Makes This Book Special:</b></h3>
<ul>
  <li><b>High-Quality Large Print (${trimSize.w}" x ${trimSize.h}"):</b> Easy on the eyes with clear, spacious grids and high-contrast typography designed to prevent eye strain.</li>
  <li><b>${pageCount} Full Pages of Quality Entertainment:</b> Packed from cover to cover with zero fluff.</li>
${featureList.map((f) => `  <li><b>${f}.</b></li>`).join("\n")}
  <li><b>Complete Solutions Included:</b> Full answer keys at the back of the book so you never stay stuck for long.</li>
  <li><b>Premium Print-Ready Layout:</b> Optimized binding margins with ample gutter room for comfortable writing and flat-lay solving.</li>
</ul>

<hr>

<h3><b>🎁 The Perfect Gift for Any Occasion:</b></h3>
<p>Whether for daily morning coffee routines, weekend relaxation, travel, or a thoughtful gift for parents, grandparents, and puzzle enthusiasts, this book delivers lasting mental joy and stress relief.</p>

<p><b>👉 Scroll Up, Click "Buy Now" (or "Add to Cart"), and start your daily brain workout today!</b></p>`;

  // Plaintext Description for clipboard or non-HTML usage
  const plainDescription = `${defaultTitle}
${defaultSubtitle}

Keep Your Mind Sharp, Calm Your Stress, and Enjoy Hours of Screen-Free Entertainment!

Looking for a fun and relaxing way to exercise your cognitive skills? ${defaultTitle} is thoughtfully crafted to provide the perfect balance of challenge and pure relaxation for adults, seniors, and puzzle lovers of all skill levels.

--- What Makes This Book Special: ---
• High-Quality Large Print (${trimSize.w}" x ${trimSize.h}"): Easy on the eyes with clear, spacious grids.
• ${pageCount} Full Pages of Quality Entertainment.
${featureList.map((f) => `• ${f}`).join("\n")}
• Complete Solutions Included at the back.
• Premium Print-Ready Layout with generous gutter margins.

The Perfect Gift for Any Occasion!
Scroll Up and Click "Buy Now" to get your copy today!`;

  // 7 Amazon KDP Backend Keywords (under 50 chars each, no prohibited keywords)
  const keywords: string[] = [
    `large print ${genre.toLowerCase()} adults seniors`.slice(0, 50),
    `brain games memory retention cognitive activity`.slice(0, 50),
    `relaxing travel puzzles anti stress boredom buster`.slice(0, 50),
    `easy to medium word search sudoku crosswords`.slice(0, 50),
    `gift for mom dad grandparents retirement gift`.slice(0, 50),
    `mindfulness offline screen free brain workout book`.slice(0, 50),
    `large font ${trimSize.w}x${trimSize.h} puzzles with solutions`.slice(0, 50),
  ];

  // Amazon BISAC Categories
  const categories: string[] = [
    "GAMES & ACTIVITIES / Puzzles",
    hasWordSearch
      ? "GAMES & ACTIVITIES / Word & Word Search"
      : hasSudoku
      ? "GAMES & ACTIVITIES / Logic & Brain Teasers"
      : "GAMES & ACTIVITIES / Activity Books",
    "HEALTH & FITNESS / Aging / Memory Improvement & Brain Training",
  ];

  // Pricing calculations (KDP standard black & white interior on white paper)
  // KDP formula: Fixed cost ($1.00) + (per page cost $0.012 * pageCount)
  const printingCostUsd = Number((1.0 + pageCount * 0.012).toFixed(2));
  // Recommended retail price: usually $8.99 for <100 pages, $9.99 for 100-150, $11.99 for 150+
  let suggestedPriceUsd = 8.99;
  if (pageCount >= 160) suggestedPriceUsd = 12.99;
  else if (pageCount >= 100) suggestedPriceUsd = 9.99;

  // Royalty at 60% standard rate: (List Price * 0.60) - Printing Cost
  const estimatedRoyaltyUsd = Math.max(0, Number((suggestedPriceUsd * 0.6 - printingCostUsd).toFixed(2)));

  // Master Cheatsheet Text
  const cheatsheetText = `================================================================================
AMAZON KDP PUBLISHING CHEATSHEET & METADATA GUIDE
Generated by KDPage All-in-One Studio
================================================================================

1. BOOK DETAILS
--------------------------------------------------------------------------------
• Title: ${defaultTitle}
• Subtitle: ${defaultSubtitle}
• Author / Pen Name: ${author}
• Trim Size: ${trimSize.label} (${trimSize.w}" x ${trimSize.h}")
• Page Count: ${pageCount} Pages
• Interior Paper Type: Black & White interior with white paper
• Bleed Settings:
    - Interior PDF: "No Bleed"
    - Cover PDF: "Bleed (PDF-only)" (Cover has exact 0.125" bleed included)
• Cover Finish: Matte (Recommended for puzzle/activity books) or Glossy

2. 7 KDP BACKEND KEYWORDS (Paste into KDP Keyword boxes 1 to 7)
--------------------------------------------------------------------------------
[Box 1]: ${keywords[0]}
[Box 2]: ${keywords[1]}
[Box 3]: ${keywords[2]}
[Box 4]: ${keywords[3]}
[Box 5]: ${keywords[4]}
[Box 6]: ${keywords[5]}
[Box 7]: ${keywords[6]}

3. RECOMMENDED AMAZON CATEGORIES
--------------------------------------------------------------------------------
• Primary:   ${categories[0]}
• Secondary: ${categories[1]}
• Tertiary:  ${categories[2]}

4. RECOMMENDED PRICING & ROYALTY BREAKDOWN (US Marketplace)
--------------------------------------------------------------------------------
• Suggested List Price:  $${suggestedPriceUsd.toFixed(2)} USD
• Amazon Printing Cost:  $${printingCostUsd.toFixed(2)} USD (Formula: $1.00 base + $0.012/page)
• Estimated 60% Royalty: $${estimatedRoyaltyUsd.toFixed(2)} USD per copy sold!
• Suggested UK Price:    £${(suggestedPriceUsd * 0.8).toFixed(2)} GBP
• Suggested EU Price:    €${(suggestedPriceUsd * 0.95).toFixed(2)} EUR

5. AMAZON KDP HTML DESCRIPTION (Copy & paste directly into Amazon description box)
--------------------------------------------------------------------------------
${htmlDescription}

================================================================================
KDPage Studio - Ready to Publish & Profit!
================================================================================`;

  return {
    title: defaultTitle,
    subtitle: defaultSubtitle,
    author,
    genre,
    pageCount,
    htmlDescription,
    plainDescription,
    keywords,
    categories,
    suggestedPriceUsd,
    printingCostUsd,
    estimatedRoyaltyUsd,
    cheatsheetText,
  };
}
