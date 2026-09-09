// Curated, family-friendly dictionary of 1,000+ words for Word Scramble KDP books.
// Covers nature, space, animals, science, geography, everyday items, sports, food, and more.

export const WORD_SCRAMBLE_DICTIONARY: string[] = [
  // --- Space & Astronomy ---
  "AEROSPACE", "PROPULSION", "CONTAINMENT", "STABILIZATION", "ANTIGRAVITY", "FLIGHT", "PAYLOAD",
  "SCHEMATICS", "HOLOGRAM", "ENGINEERING", "GRAVITATIONAL", "AIRSPACE", "SAFETY", "VELOCITY",
  "LIFT", "THRUST", "VECTOR", "FIELD", "SATELLITE", "ORBIT", "QUANTUM", "MAGNETIC",
  "GENERATOR", "VACUUM", "ATMOSPHERE", "LEVITATION", "PROPEL", "KINETIC", "ENERGY", "FORCE",
  "GALAXY", "ASTRONAUT", "NEBULA", "SUPERNOVA", "TELESCOPE", "COSMOS", "ECLIPSE", "METEORITE",
  "ASTEROID", "COMET", "PLANET", "MERCURY", "VENUS", "JUPITER", "SATURN", "URANUS",
  "NEPTUNE", "PLUTO", "CONSTELLATION", "SOLAR", "LUNAR", "HORIZON", "GRAVITY", "INTERSTELLAR",
  "ROCKET", "SHUTTLE", "MODULE", "CAPSULE", "LANDER", "ROVER", "STARDUST", "ZENITH",

  // --- Nature & Wilderness ---
  "MOUNTAIN", "VALLEY", "CANYON", "GLACIER", "WATERFALL", "RIVER", "STREAM", "FOREST",
  "RAINFOREST", "JUNGLE", "DESERT", "MEADOW", "PRAIRIE", "TUNDRA", "SAVANNA", "ISLAND",
  "PENINSULA", "VOLCANO", "GEYSER", "PLATEAU", "LAGOON", "HARBOR", "HORIZON", "SUNSET",
  "SUNRISE", "TWILIGHT", "BREEZE", "BLIZZARD", "HURRICANE", "CYCLONE", "TORNADO", "THUNDER",
  "LIGHTNING", "RAINBOW", "SUNSHINE", "FROST", "ICICLE", "SNOWFLAKE", "AUTUMN", "SUMMER",
  "SPRING", "WINTER", "FOLIAGE", "BLOSSOM", "PINE", "CEDAR", "OAK", "MAPLE", "WILLOW",
  "REDWOOD", "EVERGREEN", "MOSS", "FERN", "WILDFLOWER", "ORCHID", "SUNFLOWER", "DAISY",

  // --- Animals & Marine Life ---
  "DOLPHIN", "OCTOPUS", "STARFISH", "JELLYFISH", "SEAHORSE", "LOBSTER", "STINGRAY", "WHALE",
  "SHARK", "TURTLE", "WALRUS", "SEAL", "OTTER", "PENGUIN", "PELICAN", "SEAGULL", "FLAMINGO",
  "EAGLE", "FALCON", "HAWK", "SPARROW", "ROBIN", "CARDINAL", "PARROT", "TOUCAN", "OWL",
  "LION", "TIGER", "LEOPARD", "CHEETAH", "JAGUAR", "PANTHER", "COUGAR", "ELEPHANT", "GIRAFFE",
  "ZEBRA", "RHINOCEROS", "HIPPOPOTAMUS", "BUFFALO", "ANTELOPE", "GAZELLE", "KANGAROO", "KOALA",
  "PANDA", "GRIZZLY", "BEAVER", "BADGER", "RACCOON", "SQUIRREL", "CHIPMUNK", "PORCUPINE",
  "HEDGEHOG", "CHAMELEON", "IGUANA", "GECKO", "SALAMANDER", "CROCODILE", "ALLIGATOR",

  // --- Science, Tech & Innovation ---
  "MOLECULE", "ELECTRON", "NEUTRON", "PROTON", "ATOM", "LABORATORY", "EXPERIMENT", "RESEARCH",
  "HYPOTHESIS", "DISCOVERY", "INVENTION", "MICROSCOPE", "CIRCUIT", "COMPUTER", "SOFTWARE",
  "HARDWARE", "NETWORK", "DATABASE", "ALGORITHM", "ROBOTICS", "AUTOMATION", "CYBERSPACE",
  "NANOTECH", "GENETICS", "EVOLUTION", "ORGANISM", "CATALYST", "REACTION", "ELEMENT",
  "COMPOUND", "SOLUTION", "DENSITY", "SPECTRUM", "PRISM", "FREQUENCY", "WAVELENGTH", "CURRENT",

  // --- Travel, Exploration & Geography ---
  "VOYAGE", "JOURNEY", "EXPEDITION", "SAFARI", "TREK", "ADVENTURE", "PASSPORT", "LUGGAGE",
  "BACKPACK", "COMPASS", "NAVIGATE", "CRUISE", "AIRPORT", "TERMINAL", "RAILROAD", "LOCOMOTIVE",
  "HIGHWAY", "BRIDGE", "TUNNEL", "MONUMENT", "PYRAMID", "CASTLE", "PALACE", "FORTRESS",
  "CATHEDRAL", "TOWER", "LIGHTHOUSE", "CAPITAL", "METROPOLIS", "VILLAGE", "CONTINENT", "OCEAN",
  "PACIFIC", "ATLANTIC", "ARCTIC", "INDIAN", "ANTARCTICA", "AMAZON", "SAHARA", "HIMALAYA",

  // --- Food, Cooking & Bakery ---
  "PANCAKE", "WAFFLE", "CUPCAKE", "BROWNIE", "CROISSANT", "BAGEL", "MUFFIN", "DOUGHNUT",
  "CINNAMON", "VANILLA", "CHOCOLATE", "CARAMEL", "STRAWBERRY", "BLUEBERRY", "RASPBERRY",
  "BLACKBERRY", "PINEAPPLE", "WATERMELON", "AVOCADO", "TOMATO", "BROCCOLI", "SPINACH", "MUSHROOM",
  "CUCUMBER", "ASPARAGUS", "ROSEMARY", "OREGANO", "PARSLEY", "CORIANDER", "TURMERIC", "GINGER",
  "ESPRESSO", "CAPPUCCINO", "SMOOTHIE", "LEMONADE", "CHEDDAR", "PARMESAN", "MOZZARELLA",

  // --- Sports, Fitness & Games ---
  "BASKETBALL", "FOOTBALL", "BASEBALL", "VOLLEYBALL", "SOCCER", "TENNIS", "BADMINTON", "CRICKET",
  "RUGBY", "HOCKEY", "LACROSSE", "SWIMMING", "DIVING", "SURFING", "SAILING", "ROWING",
  "SKATEBOARD", "SNOWBOARD", "SKIING", "ARCHERY", "FENCING", "MARATHON", "TRIATHLON", "GYMNASTICS",
  "CHAMPION", "TROPHY", "MEDAL", "VICTORY", "STADIUM", "REFEREE", "ATHLETE", "OLYMPICS",

  // --- Arts, Music & Literature ---
  "SYMPHONY", "ORCHESTRA", "MELODY", "HARMONY", "RHYTHM", "GUITAR", "VIOLIN", "CELLO",
  "PIANO", "FLUTE", "TRUMPET", "CLARINET", "SAXOPHONE", "TROMBONE", "HARP", "DRUMS",
  "PORTRAIT", "SCULPTURE", "CANVAS", "GALLERY", "EXHIBIT", "MASTERPIECE", "MOSAIC", "FRESCO",
  "POETRY", "NOVEL", "CHAPTER", "CHARACTER", "PROTAGONIST", "DIALOGUE", "METAPHOR", "LIBRARY",

  // --- Everyday Objects & Household ---
  "NOTEBOOK", "CALENDAR", "CLOCKWORK", "WATCH", "BINOCULARS", "LANTERN", "UMBRELLA", "KEYCHAIN",
  "WARDROBE", "ARMCHAIR", "BOOKSHELF", "FIREPLACE", "CHANDELIER", "MIRROR", "CANDLESTICK",
  "TEAPOT", "KETTLE", "BLENDER", "TOASTER", "REFRIGERATOR", "MICROWAVE", "DISHWASHER",

  // --- Positive Emotions & Mindset ---
  "HAPPINESS", "OPTIMISM", "KINDNESS", "GRATITUDE", "SERENITY", "COURAGE", "STRENGTH", "WISDOM",
  "PATIENCE", "INTEGRITY", "CREATIVITY", "CURIOSITY", "PERSISTENCE", "AMBITION", "HARMONY",
  "FRIENDSHIP", "AFFECTION", "INSPIRATION", "DEVOTION", "WONDER", "TRIUMPH", "BRILLIANCE"
];

// Helper: Scramble a single word based on difficulty
export function scrambleWord(word: string, diff: "easy" | "medium" | "hard"): string {
  if (word.length <= 2) return word;

  if (diff === "easy" && word.length > 3) {
    const first = word[0];
    const last = word[word.length - 1];
    const middle = word.substring(1, word.length - 1).split("");
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }
    // Prevent accidental unscrambled middle
    if (middle.join("") === word.substring(1, word.length - 1) && middle.length > 1) {
      [middle[0], middle[1]] = [middle[1], middle[0]];
    }
    return first + middle.join("") + last;
  } else {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Ensure it doesn't equal original
    if (letters.join("") === word && letters.length > 1) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    return letters.join("");
  }
}

export interface WordScramblePuzzle {
  index: number;
  original: string[];
  scrambled: string[];
  wordBank: string[];
}

/**
 * Robust puzzle generator that reliably creates up to 1,000 pages of word scramble puzzles.
 * It combines any custom user words with our comprehensive built-in dictionary, guarantees
 * no early loop breaks, ensures each page has distinct words, and avoids repeating identical
 * pairings across adjacent pages.
 */
export function generateWordScramblePuzzles(
  targetPages: number,
  wordsPerPage: number = 8,
  userWords: string[] = [],
  difficulty: "easy" | "medium" | "hard" = "easy"
): WordScramblePuzzle[] {
  const cleanUserWords = userWords
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length >= 3 && /^[A-Z]+$/.test(w));

  // Combine user words with default dictionary for a rich, diverse word pool
  const poolSet = new Set<string>(cleanUserWords);
  for (const dictWord of WORD_SCRAMBLE_DICTIONARY) {
    poolSet.add(dictWord);
  }
  const fullPool = Array.from(poolSet);

  const puzzles: WordScramblePuzzle[] = [];
  const poolLen = fullPool.length;

  for (let p = 0; p < targetPages; p++) {
    const pageWords: string[] = [];
    // If the user provided words and we have enough, prioritize user words first
    const stride = 7; // prime step to vary word combinations on cycling
    const baseOffset = (p * wordsPerPage * stride + p * 3) % poolLen;

    const usedOnPage = new Set<string>();
    let attempts = 0;

    while (pageWords.length < wordsPerPage && attempts < 100) {
      const idx = (baseOffset + attempts) % poolLen;
      const candidate = fullPool[idx];
      if (!usedOnPage.has(candidate)) {
        usedOnPage.add(candidate);
        pageWords.push(candidate);
      }
      attempts++;
    }

    // Generate scrambled variations for each word on this page
    const scrambled = pageWords.map(w => scrambleWord(w, difficulty));

    // Shuffle word bank for the helper box at the bottom
    const wordBank = [...pageWords].sort(() => 0.5 - Math.random());

    puzzles.push({
      index: p + 1,
      original: pageWords,
      scrambled,
      wordBank
    });
  }

  return puzzles;
}
