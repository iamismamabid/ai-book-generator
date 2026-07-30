// Curated word lists for the Word Search Studio theme picker, grouped by the
// niches that actually sell as low-content KDP puzzle books. Each theme's
// word count is kept between 12-20 so it comfortably fits a 12-15 grid at
// any difficulty without excessive skipped words.

export interface WordSearchTheme {
  id: string;
  category: string;
  name: string;
  words: string[];
}

export const WORD_SEARCH_THEMES: WordSearchTheme[] = [
  // --- Holidays & Seasons ---
  { id: "christmas", category: "Holidays & Seasons", name: "Christmas",
    words: ["SANTA", "REINDEER", "STOCKING", "ORNAMENT", "MISTLETOE", "SLEIGH", "CAROL", "TINSEL", "WREATH", "EGGNOG", "CHIMNEY", "GARLAND", "SNOWMAN", "PRESENT"] },
  { id: "halloween", category: "Holidays & Seasons", name: "Halloween",
    words: ["PUMPKIN", "GHOST", "WITCH", "SKELETON", "COSTUME", "CANDY", "SPIDER", "HAUNTED", "VAMPIRE", "CAULDRON", "GOBLIN", "LANTERN", "BROOMSTICK", "ZOMBIE"] },
  { id: "thanksgiving", category: "Holidays & Seasons", name: "Thanksgiving",
    words: ["TURKEY", "HARVEST", "STUFFING", "GRAVY", "CRANBERRY", "PILGRIM", "FEAST", "AUTUMN", "PUMPKIN", "FAMILY", "GRATITUDE", "CORNUCOPIA", "PIE"] },
  { id: "valentines", category: "Holidays & Seasons", name: "Valentine's Day",
    words: ["CUPID", "ROSES", "CHOCOLATE", "ROMANCE", "SWEETHEART", "HEART", "ARROW", "CANDY", "BOUQUET", "KISSES", "RIBBON", "ADMIRER"] },
  { id: "easter", category: "Holidays & Seasons", name: "Easter",
    words: ["BUNNY", "BASKET", "EGGHUNT", "CHICK", "SPRING", "LAMB", "JELLYBEAN", "BONNET", "MEADOW", "TULIP", "CHOCOLATE", "NEST"] },
  { id: "summer", category: "Holidays & Seasons", name: "Summer",
    words: ["BEACH", "SUNSHINE", "POPSICLE", "SANDALS", "SWIMMING", "PICNIC", "VACATION", "LEMONADE", "BARBECUE", "SUNSCREEN", "FLIPFLOPS", "HAMMOCK"] },
  { id: "winter", category: "Holidays & Seasons", name: "Winter",
    words: ["SNOWFLAKE", "MITTENS", "FIREPLACE", "BLIZZARD", "ICICLE", "SKATING", "SLEDDING", "SCARF", "FROST", "HOTCOCOA", "SNOWBALL", "BLANKET"] },

  // --- Nature & Animals ---
  { id: "ocean", category: "Nature & Animals", name: "Ocean Life",
    words: ["DOLPHIN", "OCTOPUS", "STARFISH", "CORAL", "SHARK", "WHALE", "JELLYFISH", "SEAHORSE", "LOBSTER", "STINGRAY", "SEAWEED", "TIDEPOOL", "URCHIN"] },
  { id: "farm", category: "Nature & Animals", name: "Farm Animals",
    words: ["COW", "PIG", "CHICKEN", "HORSE", "SHEEP", "GOAT", "DUCK", "ROOSTER", "TRACTOR", "BARN", "PASTURE", "HAYSTACK", "TURKEY"] },
  { id: "jungle", category: "Nature & Animals", name: "Jungle & Safari",
    words: ["LION", "ELEPHANT", "GIRAFFE", "ZEBRA", "MONKEY", "LEOPARD", "GORILLA", "CROCODILE", "RHINO", "HIPPO", "CHEETAH", "PARROT", "PYTHON"] },
  { id: "birds", category: "Nature & Animals", name: "Birdwatching",
    words: ["SPARROW", "EAGLE", "ROBIN", "CARDINAL", "HUMMINGBIRD", "OWL", "FALCON", "WOODPECKER", "SWALLOW", "PELICAN", "FEATHER", "NEST", "BIRDSONG"] },
  { id: "garden", category: "Nature & Animals", name: "Garden & Flowers",
    words: ["ROSE", "TULIP", "DAISY", "SUNFLOWER", "ORCHID", "LAVENDER", "MARIGOLD", "PETUNIA", "TRELLIS", "BLOSSOM", "SPROUT", "GREENHOUSE"] },
  { id: "weather", category: "Nature & Animals", name: "Weather",
    words: ["THUNDER", "LIGHTNING", "RAINBOW", "DROUGHT", "HURRICANE", "BREEZE", "HUMIDITY", "FORECAST", "TORNADO", "FROST", "DRIZZLE", "SUNSHINE"] },

  // --- Food & Drink ---
  { id: "baking", category: "Food & Drink", name: "Baking & Desserts",
    words: ["CUPCAKE", "BROWNIE", "PANCAKE", "COOKIE", "FROSTING", "PASTRY", "CARAMEL", "MERINGUE", "WAFFLE", "DOUGHNUT", "CINNAMON", "VANILLA", "SPRINKLES"] },
  { id: "coffee", category: "Food & Drink", name: "Coffee & Tea",
    words: ["ESPRESSO", "LATTE", "CAPPUCCINO", "MOCHA", "BARISTA", "ROAST", "CHAMOMILE", "TEAPOT", "CARAMEL", "FRAPPE", "AROMA", "STEAM"] },
  { id: "italian", category: "Food & Drink", name: "Italian Cuisine",
    words: ["PASTA", "PIZZA", "RISOTTO", "LASAGNA", "GELATO", "PARMESAN", "TIRAMISU", "RAVIOLI", "BRUSCHETTA", "ESPRESSO", "PROSCIUTTO", "BASIL"] },

  // --- Travel & Geography ---
  { id: "countries", category: "Travel & Geography", name: "World Countries",
    words: ["FRANCE", "JAPAN", "BRAZIL", "EGYPT", "CANADA", "ITALY", "KENYA", "MEXICO", "GREECE", "IRELAND", "THAILAND", "MOROCCO", "NORWAY"] },
  { id: "usstates", category: "Travel & Geography", name: "US States",
    words: ["TEXAS", "FLORIDA", "CALIFORNIA", "COLORADO", "GEORGIA", "ARIZONA", "OREGON", "VIRGINIA", "MONTANA", "VERMONT", "ALASKA", "HAWAII"] },
  { id: "cityscapes", category: "Travel & Geography", name: "Famous Cities",
    words: ["PARIS", "LONDON", "TOKYO", "ROME", "SYDNEY", "CAIRO", "DUBAI", "VENICE", "BERLIN", "MADRID", "TORONTO", "SINGAPORE"] },
  { id: "camping", category: "Travel & Geography", name: "Camping & Outdoors",
    words: ["CAMPFIRE", "TENT", "BACKPACK", "COMPASS", "TRAIL", "LANTERN", "SLEEPINGBAG", "CANOE", "HAMMOCK", "MARSHMALLOW", "RIDGE", "WILDERNESS"] },

  // --- Occupations & Everyday Life ---
  { id: "jobs", category: "Everyday Life", name: "Occupations",
    words: ["DOCTOR", "TEACHER", "ENGINEER", "FARMER", "LAWYER", "ARTIST", "PLUMBER", "CHEF", "PILOT", "NURSE", "ELECTRICIAN", "ARCHITECT"] },
  { id: "school", category: "Everyday Life", name: "Back to School",
    words: ["PENCIL", "NOTEBOOK", "BACKPACK", "CLASSROOM", "TEACHER", "HOMEWORK", "CRAYON", "SCISSORS", "LOCKER", "RECESS", "TEXTBOOK", "CHALKBOARD"] },
  { id: "wedding", category: "Everyday Life", name: "Wedding Day",
    words: ["BRIDE", "GROOM", "BOUQUET", "CEREMONY", "RECEPTION", "TOAST", "VOWS", "BRIDESMAID", "HONEYMOON", "ENGAGEMENT", "CONFETTI", "REGISTRY"] },
  { id: "babyshower", category: "Everyday Life", name: "Baby Shower",
    words: ["LULLABY", "STROLLER", "BASSINET", "DIAPER", "RATTLE", "ONESIE", "PACIFIER", "NURSERY", "BOOTIES", "BLANKET", "TEDDYBEAR", "CRADLE"] },

  // --- Seniors & Nostalgia (a strong-selling KDP niche) ---
  { id: "classiccars", category: "Seniors & Nostalgia", name: "Classic Cars",
    words: ["MUSTANG", "CORVETTE", "CADILLAC", "THUNDERBIRD", "CAMARO", "CHEVROLET", "CONVERTIBLE", "CHROME", "HORSEPOWER", "ROADSTER", "DASHBOARD", "HUBCAP"] },
  { id: "bigband", category: "Seniors & Nostalgia", name: "Big Band Era",
    words: ["SWING", "TROMBONE", "CLARINET", "BALLROOM", "SAXOPHONE", "ORCHESTRA", "TRUMPET", "RHYTHM", "CROONER", "JITTERBUG", "RADIO", "VINYL"] },
  { id: "diner", category: "Seniors & Nostalgia", name: "Retro Diner",
    words: ["MILKSHAKE", "JUKEBOX", "SODAFOUNTAIN", "BOOTH", "MALTED", "CARHOP", "NEON", "DRIVEIN", "SUNDAE", "COUNTER", "APRON", "BURGER"] },
  { id: "hollywood", category: "Seniors & Nostalgia", name: "Old Hollywood",
    words: ["MARQUEE", "STARLET", "PREMIERE", "SPOTLIGHT", "SCREENPLAY", "DIRECTOR", "GLAMOUR", "STUDIO", "PROJECTOR", "REDCARPET", "CINEMA", "MATINEE"] },

  // --- Space, Science & Kids ---
  { id: "space", category: "Space & Science", name: "Outer Space",
    words: ["ROCKET", "GALAXY", "ASTRONAUT", "PLANET", "COMET", "NEBULA", "SATELLITE", "METEOR", "TELESCOPE", "ORBIT", "GRAVITY", "STARDUST"] },
  { id: "dinosaurs", category: "Space & Science", name: "Dinosaurs",
    words: ["TREX", "TRICERATOPS", "VELOCIRAPTOR", "STEGOSAURUS", "FOSSIL", "PTERODACTYL", "JURASSIC", "EXTINCT", "PALEONTOLOGY", "BRACHIOSAURUS", "CLAW", "SWAMP"] },
  { id: "alphabet", category: "Space & Science", name: "Simple Animals (Kids)",
    words: ["CAT", "DOG", "BIRD", "FISH", "FROG", "DUCK", "BEAR", "LION", "GOAT", "MOUSE", "SHEEP", "SNAKE"] },

  // --- Sports & Music ---
  { id: "sports", category: "Sports & Music", name: "Team Sports",
    words: ["SOCCER", "BASKETBALL", "BASEBALL", "HOCKEY", "VOLLEYBALL", "FOOTBALL", "REFEREE", "TOURNAMENT", "STADIUM", "CHAMPION", "SCOREBOARD", "DEFENSE"] },
  { id: "music", category: "Sports & Music", name: "Musical Instruments",
    words: ["GUITAR", "PIANO", "VIOLIN", "DRUMS", "FLUTE", "TRUMPET", "CELLO", "HARP", "CLARINET", "SAXOPHONE", "ACCORDION", "UKULELE"] },

  // --- Faith ---
  { id: "bible", category: "Faith", name: "Bible Stories",
    words: ["NOAH", "MOSES", "DAVID", "GOLIATH", "GENESIS", "PARABLE", "SHEPHERD", "COVENANT", "PSALM", "DISCIPLE", "PROPHET", "BLESSING"] },
];

export const WORD_SEARCH_THEME_CATEGORIES: string[] = Array.from(
  new Set(WORD_SEARCH_THEMES.map(t => t.category))
);

export function getThemeById(id: string): WordSearchTheme | undefined {
  return WORD_SEARCH_THEMES.find(t => t.id === id);
}
