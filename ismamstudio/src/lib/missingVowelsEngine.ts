/**
 * KDPage Missing Vowels Puzzle Engine
 * Generates engaging spelling, vocabulary & brain-teaser missing vowel worksheets
 */

export interface MissingVowelItem {
  id: string;
  original: string; // The complete solution (e.g. "ELEPHANT")
  puzzle: string;   // The masked puzzle text (e.g. "_ L _ P H _ N T" or "L P H N T")
  hint?: string;
}

export interface MissingVowelsWorksheet {
  id: string;
  pageNumber: number;
  title: string;
  category: string;
  items: MissingVowelItem[];
  mode: "guided_blanks" | "pure_consonants" | "partial_blanks";
}

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

/**
 * Transforms an original word/phrase into a missing vowels puzzle string
 */
export function maskVowels(
  text: string,
  mode: "guided_blanks" | "pure_consonants" | "partial_blanks" = "guided_blanks"
): string {
  const upper = text.toUpperCase().trim();

  if (mode === "pure_consonants") {
    // Strips all vowels and formats consonants with spacing
    return upper
      .split("")
      .filter((ch) => !VOWELS.has(ch) && ch !== " ")
      .join(" ");
  }

  if (mode === "partial_blanks") {
    // Only masks roughly half of the vowels for easier kids worksheets
    let vowelCount = 0;
    return upper
      .split("")
      .map((ch) => {
        if (VOWELS.has(ch)) {
          vowelCount++;
          return vowelCount % 2 === 1 ? "_" : ch;
        }
        return ch;
      })
      .join(" ");
  }

  // Default: "guided_blanks" -> replaces every vowel with an underscore blank
  return upper
    .split("")
    .map((ch) => {
      if (VOWELS.has(ch)) return "_";
      if (ch === " ") return "  ";
      return ch;
    })
    .join(" ");
}

// -------------------------------------------------------------
// CURATED KDP THEMATIC DICTIONARIES (20+ HIGH-DEMAND NICHES)
// -------------------------------------------------------------

export interface MissingVowelsTheme {
  name: string;
  category: string;
  words: { word: string; hint?: string }[];
}

export const MISSING_VOWELS_THEMES: MissingVowelsTheme[] = [
  {
    name: "Wild Animals",
    category: "Animals & Wildlife",
    words: [
      { word: "ELEPHANT", hint: "Largest land mammal with a long trunk" },
      { word: "KANGAROO", hint: "Australian marsupial that hops" },
      { word: "CROCODILE", hint: "Large predatory aquatic reptile" },
      { word: "CHIMPANZEE", hint: "Highly intelligent primate" },
      { word: "RHINOCEROS", hint: "Horned African herbivore" },
      { word: "HIPPOPOTAMUS", hint: "Heavy river-dwelling African mammal" },
      { word: "ALLIGATOR", hint: "Freshwater crocodilian with broad snout" },
      { word: "PORCUPINE", hint: "Rodent covered in sharp quills" },
      { word: "GIRAFFE", hint: "Tallest living terrestrial animal" },
      { word: "LEOPARD", hint: "Spotted stealthy big cat" },
      { word: "CHEETAH", hint: "Fastest land animal on Earth" },
      { word: "ZEBRA", hint: "African equine with black and white stripes" },
    ],
  },
  {
    name: "Solar System & Space",
    category: "Science & Astronomy",
    words: [
      { word: "MERCURY", hint: "Closest planet to our Sun" },
      { word: "VENUS", hint: "Hottest terrestrial planet in our system" },
      { word: "JUPITER", hint: "Largest planet with the Great Red Spot" },
      { word: "SATURN", hint: "Famous for its magnificent ring system" },
      { word: "URANUS", hint: "Ice giant planet rotating on its side" },
      { word: "NEPTUNE", hint: "Distant deep blue windy ice giant" },
      { word: "ASTEROID", hint: "Rocky body orbiting in the asteroid belt" },
      { word: "TELESCOPE", hint: "Optical instrument used to view stars" },
      { word: "CONSTELLATION", hint: "Pattern of stars forming a mythical figure" },
      { word: "ASTRONAUT", hint: "Human trained to pilot space missions" },
      { word: "SUPERNOVA", hint: "Explosion marking the death of a massive star" },
      { word: "SATELLITE", hint: "Orbital probe relaying data to Earth" },
    ],
  },
  {
    name: "World Capitals",
    category: "Geography & Travel",
    words: [
      { word: "WASHINGTON", hint: "Capital city of the United States" },
      { word: "LONDON", hint: "Capital city of the United Kingdom" },
      { word: "PARIS", hint: "Capital of France known as City of Light" },
      { word: "TOKYO", hint: "Ultra-modern capital city of Japan" },
      { word: "BERLIN", hint: "Historic capital city of Germany" },
      { word: "CANBERRA", hint: "Planned capital city of Australia" },
      { word: "OTTAWA", hint: "National capital city of Canada" },
      { word: "STOCKHOLM", hint: "Capital of Sweden built across 14 islands" },
      { word: "AMSTERDAM", hint: "Canal-filled capital of the Netherlands" },
      { word: "BEIJING", hint: "Ancient and modern capital of China" },
      { word: "BRASILIA", hint: "Futuristic aircraft-shaped capital of Brazil" },
      { word: "REYKJAVIK", hint: "Northernmost capital of Iceland" },
    ],
  },
  {
    name: "Famous Countries",
    category: "Geography & Travel",
    words: [
      { word: "ARGENTINA", hint: "South American tango and soccer powerhouse" },
      { word: "SWITZERLAND", hint: "Alpine nation famed for watches and chocolate" },
      { word: "MADAGASCAR", hint: "African island nation with unique wildlife" },
      { word: "PORTUGAL", hint: "Iberian coastal country with rich maritime history" },
      { word: "SINGAPORE", hint: "Modern island city-state in Southeast Asia" },
      { word: "NETHERLANDS", hint: "European land of windmills and tulips" },
      { word: "PHILIPPINES", hint: "Archipelago nation of over 7,000 islands" },
      { word: "INDONESIA", hint: "Vast island nation home to Bali and Komodo" },
      { word: "NEW ZEALAND", hint: "Home of Kiwi birds, fjords, and Middle-earth" },
      { word: "SOUTH AFRICA", hint: "Rainbow Nation at the southern tip of Africa" },
      { word: "DENMARK", hint: "Scandinavian kingdom home of Hans Christian Andersen" },
      { word: "COLOMBIA", hint: "South American nation known for coffee and emeralds" },
    ],
  },
  {
    name: "Delicious Foods & Fruits",
    category: "Food & Culinary",
    words: [
      { word: "PINEAPPLE", hint: "Tropical spiky fruit with sweet yellow flesh" },
      { word: "STRAWBERRY", hint: "Sweet red berry with external seeds" },
      { word: "WATERMELON", hint: "Large summer melon with sweet pink interior" },
      { word: "POMEGRANATE", hint: "Ancient fruit packed with ruby red seeds" },
      { word: "AVOCADO", hint: "Creamy green fruit used in guacamole" },
      { word: "SPAGHETTI", hint: "Long cylindrical Italian pasta strands" },
      { word: "CROISSANT", hint: "Flaky, buttery French crescent pastry" },
      { word: "CHOCOLATE", hint: "Sweet confection prepared from roasted cacao" },
      { word: "BLUEBERRY", hint: "Antioxidant-rich indigo-colored berry" },
      { word: "BROCCOLI", hint: "Cruciferous green vegetable resembling miniature trees" },
      { word: "CINNAMON", hint: "Fragrant sweet spice derived from tree bark" },
      { word: "CUCUMBER", hint: "Cool, crisp salad vegetable high in water content" },
    ],
  },
  {
    name: "Musical Instruments",
    category: "Music & Arts",
    words: [
      { word: "SAXOPHONE", hint: "Curved brass wind instrument popular in jazz" },
      { word: "TROMBONE", hint: "Brass instrument that uses a telescoping slide" },
      { word: "HARMONICA", hint: "Pocket-sized reed mouth organ" },
      { word: "XYLOPHONE", hint: "Percussion instrument with wooden bars" },
      { word: "CLARINET", hint: "Woodwind instrument with a straight cylindrical tube" },
      { word: "ACCORDION", hint: "Bellows-driven handheld acoustic instrument" },
      { word: "TAMBOURINE", hint: "Shallow drum frame fitted with pairs of jingles" },
      { word: "UKULELE", hint: "Small four-stringed Hawaiian guitar" },
      { word: "BAGPIPES", hint: "Traditional Scottish reeded wind instrument" },
      { word: "HARPSICHORD", hint: "Keyboard instrument where strings are plucked" },
      { word: "VIOLONCELLO", hint: "Large bass member of the violin family (Cello)" },
      { word: "METRONOME", hint: "Device that produces regular ticks for musicians" },
    ],
  },
  {
    name: "Professions & Careers",
    category: "Education & Daily Life",
    words: [
      { word: "ARCHITECT", hint: "Professional who designs buildings and blueprints" },
      { word: "ASTRONOMER", hint: "Scientist who observes celestial objects" },
      { word: "PEDIATRICIAN", hint: "Medical doctor specializing in children" },
      { word: "PHARMACIST", hint: "Healthcare professional dispensing medications" },
      { word: "FIREFIGHTER", hint: "Brave responder who extinguishes blazes" },
      { word: "JOURNALIST", hint: "Investigative writer reporting news events" },
      { word: "ELECTRICIAN", hint: "Technician wiring buildings and circuits" },
      { word: "VETERINARIAN", hint: "Doctor caring for animal health" },
      { word: "PHOTOGRAPHER", hint: "Artist capturing moments through a lens" },
      { word: "PARAMEDIC", hint: "Emergency medical technician in ambulances" },
      { word: "CARPENTER", hint: "Craftsman skilled in timber woodwork" },
      { word: "ARCHEOLOGIST", hint: "Scientist excavating ancient human civilizations" },
    ],
  },
  {
    name: "Sports & Athletics",
    category: "Sports & Recreation",
    words: [
      { word: "BASKETBALL", hint: "Court game played with hoops and dribbling" },
      { word: "VOLLEYBALL", hint: "Game where players strike a ball over a high net" },
      { word: "GYMNASTICS", hint: "Sport of acrobatic flexibility and balance" },
      { word: "BADMINTON", hint: "Racquet sport played with a feathered shuttlecock" },
      { word: "SNOWBOARD", hint: "Winter sport gliding down snow-covered slopes" },
      { word: "EQUESTRIAN", hint: "Horseback riding and show jumping competition" },
      { word: "WATERPOLO", hint: "Team swimming ball game scored in goals" },
      { word: "TRIATHLON", hint: "Endurance race combining swim, cycle, and run" },
      { word: "WRESTLING", hint: "Ancient hand-to-hand combat grapple sport" },
      { word: "ARCHERY", hint: "Precision sport shooting arrows at target rings" },
      { word: "SKATEBOARD", hint: "Action sport executing aerial street tricks on wheels" },
      { word: "MARATHON", hint: "Legendary 26.2-mile long-distance footrace" },
    ],
  },
];

/**
 * Generate a list of Missing Vowels worksheets for a full KDP book
 */
export function generateMissingVowelsBook(
  pageCount: number,
  wordsPerPage: number = 8,
  mode: "guided_blanks" | "pure_consonants" | "partial_blanks" = "guided_blanks",
  customWordList?: string[]
): MissingVowelsWorksheet[] {
  const worksheets: MissingVowelsWorksheet[] = [];

  // If user provided a custom list of words
  if (customWordList && customWordList.length > 0) {
    const cleanList = customWordList.filter((w) => w.trim().length > 0);
    const pagesNeeded = Math.ceil(cleanList.length / wordsPerPage);

    for (let p = 0; p < Math.min(pageCount, pagesNeeded); p++) {
      const slice = cleanList.slice(p * wordsPerPage, (p + 1) * wordsPerPage);
      const items: MissingVowelItem[] = slice.map((word, idx) => ({
        id: `custom-${p + 1}-${idx + 1}`,
        original: word.toUpperCase().trim(),
        puzzle: maskVowels(word, mode),
      }));

      worksheets.push({
        id: `worksheet-custom-${p + 1}`,
        pageNumber: p + 1,
        title: `Custom Worksheet #${p + 1}`,
        category: "Custom Word Bank",
        items,
        mode,
      });
    }

    if (worksheets.length >= pageCount) {
      return worksheets;
    }
  }

  // Generate from curated thematic dictionaries
  let themeIndex = 0;
  for (let p = worksheets.length; p < pageCount; p++) {
    const theme = MISSING_VOWELS_THEMES[themeIndex % MISSING_VOWELS_THEMES.length];
    themeIndex++;

    // Pick words for this page
    const selectedWords = theme.words.slice(0, wordsPerPage);
    const items: MissingVowelItem[] = selectedWords.map((item, idx) => ({
      id: `${theme.name.toLowerCase().replace(/\s+/g, "-")}-${p + 1}-${idx + 1}`,
      original: item.word,
      puzzle: maskVowels(item.word, mode),
      hint: item.hint,
    }));

    worksheets.push({
      id: `worksheet-${p + 1}`,
      pageNumber: p + 1,
      title: `${theme.name} Puzzle`,
      category: theme.category,
      items,
      mode,
    });
  }

  return worksheets;
}
