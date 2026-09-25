export interface BookPageItem {
  type: string;
  title?: string;
  config?: any;
}

export type KdpBookLanguage = "en" | "es" | "de" | "fr" | "it" | "pt";

export interface MetadataGeneratorOptions {
  bookPages: BookPageItem[];
  title?: string;
  subtitle?: string;
  author?: string;
  trimSize?: { label: string; w: number; h: number };
  language?: KdpBookLanguage;
}

export interface KdpMetadataResult {
  title: string;
  subtitle: string;
  author: string;
  genre: string;
  language: string;
  languageCode: KdpBookLanguage;
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
    language = "en",
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
  const hasNonogram = (typeCounts["nonogram"] || 0) > 0;
  const hasCalcudoku = (typeCounts["calcudoku"] || 0) > 0;
  const hasMissingVowels = (typeCounts["missing_vowels"] || 0) > 0;

  // Language Labels
  const languageNames: Record<KdpBookLanguage, { label: string; kdpSelect: string }> = {
    en: { label: "English", kdpSelect: "English" },
    es: { label: "Spanish (Español)", kdpSelect: "Spanish" },
    de: { label: "German (Deutsch)", kdpSelect: "German" },
    fr: { label: "French (Français)", kdpSelect: "French" },
    it: { label: "Italian (Italiano)", kdpSelect: "Italian" },
    pt: { label: "Portuguese (Português)", kdpSelect: "Portuguese" },
  };
  const activeLangMeta = languageNames[language] || languageNames.en;

  // Determine genre & localized defaults
  let genre = "Variety Puzzle Book";
  let defaultTitle = "";
  let defaultSubtitle = "";
  const featureList: string[] = [];
  let keywords: string[] = [];
  let htmlDescription = "";
  let plainDescription = "";

  const typesPresent = Object.keys(typeCounts);

  if (language === "es") {
    // 🇪🇸 SPANISH METADATA
    if (typesPresent.length === 1 && hasWordSearch) genre = "Libro de Sopa de Letras";
    else if (typesPresent.length === 1 && hasSudoku) genre = "Libro de Sudokus para Adultos";
    else if (typesPresent.length === 1 && hasCrossword) genre = "Libro de Crucigramas";
    else if (typesPresent.length === 1 && hasColoring) genre = "Libro de Colorear para Adultos";
    else genre = "Libro de Pasatiempos y Retos Mentales";

    defaultTitle = userTitle?.trim() || (
      hasWordSearch && typesPresent.length === 1
        ? "Sopa de Letras para Adultos Letra Grande"
        : hasSudoku && typesPresent.length === 1
        ? "Sudoku Desafío Mental para Adultos"
        : hasColoring
        ? "Libro de Colorear y Relajación para Adultos"
        : "El Gran Libro de Pasatiempos para Adultos"
    );

    defaultSubtitle = userSubtitle?.trim() ||
      `Juegos Mentales y Pasatiempos con Letra Grande y Soluciones Incluidas (${trimSize.w}" x ${trimSize.h}", ${pageCount} Páginas)`;

    if (hasWordSearch) featureList.push("Desafiantes Sopas de Letras con vocabulario enriquecedor");
    if (hasSudoku) featureList.push("Sudokus clásicos para estimular la lógica y concentración");
    if (hasCrossword) featureList.push("Crucigramas temáticos con pistas y soluciones");
    if (hasMaze) featureList.push("Laberintos divertidos para entrenar la orientación espacial");
    if (hasCryptogram) featureList.push("Criptogramas con citas célebres inspiradoras");
    if (hasColoring) featureList.push("Ilustraciones relajantes para colorear y aliviar el estrés");
    if (featureList.length === 0) {
      featureList.push("Pasatiempos variados para ejercitar la memoria y agilidad mental");
      featureList.push("Soluciones completas al final del libro");
    }

    keywords = [
      `sopa de letras para adultos letra grande`.slice(0, 50),
      `libros de pasatiempos en español mayores`.slice(0, 50),
      `juegos mentales agilidad memoria adultos`.slice(0, 50),
      `pasatiempos sopa de letras crucigramas`.slice(0, 50),
      `libro de actividades relajacion antiestres`.slice(0, 50),
      `regalo personas mayores abuelos pasatiempos`.slice(0, 50),
      `letra grande ${trimSize.w}x${trimSize.h} con soluciones`.slice(0, 50),
    ];

    htmlDescription = `<h2><b>¡Mantén tu mente activa, reduce el estrés y disfruta de horas de entretenimiento saludable!</b></h2>

<p>¿Buscas una forma entretenida y relajante de ejercitar tu memoria? <b>${defaultTitle}</b> está especialmente diseñado para ofrecer el equilibrio perfecto entre reto y diversión para adultos y personas mayores.</p>

<hr>

<h3><b>🌟 Características Destacadas de Este Libro:</b></h3>
<ul>
  <li><b>Letra Grande de Fácil Lectura (${trimSize.w}" x ${trimSize.h}"):</b> Cuadrículas amplias y tipografía de alto contraste diseñadas para no forzar la vista.</li>
  <li><b>${pageCount} Páginas Completas de Diversión:</b> Contenido entretenido y de alta calidad sin páginas de relleno.</li>
${featureList.map((f) => `  <li><b>${f}.</b></li>`).join("\n")}
  <li><b>Soluciones Completas Incluidas:</b> Todas las respuestas al final del libro para consultar cuando lo necesites.</li>
  <li><b>Diseño Optimizado para KDP:</b> Márgenes amplios que facilitan escribir cómodamente.</li>
</ul>

<hr>

<h3><b>🎁 El Regalo Ideal para Cualquier Ocasión:</b></h3>
<p>Perfecto para relajarse con el café de la mañana, viajes, vacaciones o como un regalo lleno de cariño para padres, abuelos y amantes de los pasatiempos.</p>

<p><b>👉 ¡Haz clic en "Comprar ya" y comienza tu entrenamiento mental hoy mismo!</b></p>`;

    plainDescription = `${defaultTitle}\n${defaultSubtitle}\n\n${featureList.join("\n")}`;

  } else if (language === "de") {
    // 🇩🇪 GERMAN METADATA
    genre = hasWordSearch ? "Wortsuche Rätselbuch" : "Großes Rätselbuch für Erwachsene";
    defaultTitle = userTitle?.trim() || "Großes Rätselbuch für Erwachsene";
    defaultSubtitle = userSubtitle?.trim() || `Großdruck Denksportaufgaben mit allen Lösungen (${trimSize.w}" x ${trimSize.h}", ${pageCount} Seiten)`;
    keywords = [
      `wortsuche fuer erwachsene grossdruck`.slice(0, 50),
      `raetselbuch fuer senioren grosses format`.slice(0, 50),
      `gedaechtnistraining fuer senioren spiele`.slice(0, 50),
      `denksport und konzentration aufgaben`.slice(0, 50),
      `sudoku und wortsuche raetselheft`.slice(0, 50),
      `geschenk fuer rentner oma opa raetsel`.slice(0, 50),
      `grossdruck ${trimSize.w}x${trimSize.h} mit loesungen`.slice(0, 50),
    ];
    htmlDescription = `<h2><b>Halten Sie Ihren Geist fit und genießen Sie entspannende Rätselstunden!</b></h2>
<p><b>${defaultTitle}</b> bietet die perfekte Mischung aus geistiger Herausforderung und purer Entspannung im augenfreundlichen Großdruck.</p>
<hr>
<h3><b>🌟 Besonderheiten dieses Buches:</b></h3>
<ul>
  <li><b>Augenfreundlicher Großdruck (${trimSize.w}" x ${trimSize.h}"):</b> Klare Typografie und bequemes Ausfüllen.</li>
  <li><b>${pageCount} Seiten Rätselspaß:</b> Vielseitige Aufgaben für Gedächtnis und Konzentration.</li>
  <li><b>Alle Lösungen am Ende des Buches:</b> Zur schnellen Selbstkontrolle.</li>
</ul>`;
    plainDescription = `${defaultTitle}\n${defaultSubtitle}`;

  } else if (language === "fr") {
    // 🇫🇷 FRENCH METADATA
    genre = hasWordSearch ? "Livre de Mots Mêlés" : "Grand Livre de Jeux et Casse-Têtes";
    defaultTitle = userTitle?.trim() || "Grand Livre de Mots Mêlés et Jeux pour Adultes";
    defaultSubtitle = userSubtitle?.trim() || `Gros Caractères avec Solutions Complètes Incluses (${trimSize.w}" x ${trimSize.h}", ${pageCount} Pages)`;
    keywords = [
      `mots meles pour adultes gros caracteres`.slice(0, 50),
      `livre de jeux et enigmes seniors`.slice(0, 50),
      `entrainement cerebral memoire concentration`.slice(0, 50),
      `mots croises et mots fleches adulte`.slice(0, 50),
      `cahier d activites relaxation anti stress`.slice(0, 50),
      `cadeau pour grands parents retraite jeux`.slice(0, 50),
      `grand format ${trimSize.w}x${trimSize.h} avec solutions`.slice(0, 50),
    ];
    htmlDescription = `<h2><b>Stimulez votre mémoire et détendez-vous avec des heures de divertissement sain!</b></h2>
<p><b>${defaultTitle}</b> est conçu pour offrir des défis captivants et un plaisir durable avec une typographie claire en gros caractères.</p>
<hr>
<h3><b>🌟 Ce qui rend ce livre unique:</b></h3>
<ul>
  <li><b>Gros Caractères (${trimSize.w}" x ${trimSize.h}"):</b> Confort visuel optimal sans fatigue oculaire.</li>
  <li><b>${pageCount} Pages Complètes de Jeux:</b> Idéal pour seniors et passionnés.</li>
  <li><b>Solutions Complètes en Fin de Livre:</b> Pour vérifier facilement ses réponses.</li>
</ul>`;
    plainDescription = `${defaultTitle}\n${defaultSubtitle}`;

  } else {
    // 🇺🇸 ENGLISH METADATA (DEFAULT)
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

    defaultTitle =
      userTitle?.trim() ||
      (genre === "Word Search Puzzle Book"
        ? "Word Search for Adults & Seniors"
        : genre === "Sudoku Puzzle Book"
        ? "Sudoku Master Challenge for Adults"
        : genre === "Coloring Book"
        ? "Mindful Relaxation Coloring Book"
        : "The Ultimate Variety Puzzle Book for Adults");

    defaultSubtitle =
      userSubtitle?.trim() ||
      `Large Print Brain Games with Complete Solutions Included (${trimSize.w}" x ${trimSize.h}", ${pageCount} Pages)`;

    if (hasWordSearch) featureList.push(`Engaging Word Search Puzzles to expand vocabulary`);
    if (hasSudoku) featureList.push(`Classic Sudoku Challenges for logic and deductive focus`);
    if (hasCrossword) featureList.push(`Themed Crosswords with smart clues and answer keys`);
    if (hasMaze) featureList.push(`Intricate Mazes designed to test spatial navigation`);
    if (hasCryptogram) featureList.push(`Inspiring Cryptograms featuring wisdom quotes`);
    if (hasScramble) featureList.push(`Word Scramble games for anagram enthusiasts`);
    if (hasKakuro) featureList.push(`Kakuro (Cross-Sums) mathematical logic grids`);
    if (hasMath) featureList.push(`Creative Math Puzzles to keep mental math sharp`);
    if (hasNonogram) featureList.push(`Engaging Nonogram Pixel Art Puzzles to test deductive logic`);
    if (hasCalcudoku) featureList.push(`Math-Driven Calcudoku Logic Grids to sharpen arithmetic skills`);
    if (hasMissingVowels) featureList.push(`Missing Vowels Word Play Puzzles to test vocabulary and deduction`);
    if (hasColoring) featureList.push(`Stress-Relieving Coloring Illustrations with bold clean outlines`);

    if (featureList.length === 0) {
      featureList.push(`Handcrafted variety puzzles designed to stimulate memory and mental agility`);
      featureList.push(`Complete solutions conveniently located at the back`);
    }

    keywords = [
      `large print ${genre.toLowerCase()} adults seniors`.slice(0, 50),
      `brain games memory retention cognitive activity`.slice(0, 50),
      `relaxing travel puzzles anti stress boredom buster`.slice(0, 50),
      `easy to medium word search sudoku crosswords`.slice(0, 50),
      `gift for mom dad grandparents retirement gift`.slice(0, 50),
      `mindfulness offline screen free brain workout book`.slice(0, 50),
      `large font ${trimSize.w}x${trimSize.h} puzzles with solutions`.slice(0, 50),
    ];

    htmlDescription = `<h2><b>Keep Your Mind Sharp, Calm Your Stress, and Enjoy Hours of Screen-Free Entertainment!</b></h2>

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

    plainDescription = `${defaultTitle}\n${defaultSubtitle}\n\n${featureList.join("\n")}`;
  }

  const author = userAuthor.trim() || "KDPage Press";

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
  const printingCostUsd = Number((1.0 + pageCount * 0.012).toFixed(2));
  let suggestedPriceUsd = 8.99;
  if (pageCount >= 160) suggestedPriceUsd = 12.99;
  else if (pageCount >= 100) suggestedPriceUsd = 9.99;
  const estimatedRoyaltyUsd = Math.max(0, Number((suggestedPriceUsd * 0.6 - printingCostUsd).toFixed(2)));

  // Master Cheatsheet Text
  const cheatsheetText = `================================================================================
AMAZON KDP PUBLISHING CHEATSHEET & METADATA GUIDE
Generated by KDPage All-in-One Studio (${activeLangMeta.label})
================================================================================

1. BOOK DETAILS & LANGUAGE
--------------------------------------------------------------------------------
• Amazon Language Setting: Select "${activeLangMeta.kdpSelect}"
• Book Title:              ${defaultTitle}
• Subtitle:                ${defaultSubtitle}
• Author / Pen Name:       ${author}
• Target Language:         ${activeLangMeta.label}
• Trim Size:               ${trimSize.label} (${trimSize.w}" x ${trimSize.h}")
• Page Count:              ${pageCount} Pages
• Interior Paper Type:     Black & White interior with white paper
• Bleed Settings:
    - Interior PDF: "No Bleed"
    - Cover PDF:    "Bleed (PDF-only)" (Cover has exact 0.125" bleed included)
• Cover Finish:            Matte (Recommended for puzzle/activity books) or Glossy

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
    language: activeLangMeta.label,
    languageCode: language,
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
