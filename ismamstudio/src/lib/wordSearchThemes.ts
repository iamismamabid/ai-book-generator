// Curated word lists for the Word Search Studio theme picker, grouped by the
// niches that actually sell as low-content KDP puzzle books. Each theme's
// word count is kept between 12-20 so it comfortably fits a 12-15 grid at
// any difficulty without excessive skipped words.

export interface WordSearchTheme {
  id: string;
  category: string;
  name: string;
  language?: "en" | "es" | "de" | "fr" | "it" | "pt";
  words: string[];
}

export type SupportedLanguageCode = "en" | "es" | "de" | "fr" | "it" | "pt";

export interface LanguageOption {
  code: SupportedLanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  wordSearchTitle: string;
  solutionTitle: string;
}

export const SUPPORTED_PUZZLE_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeName: "English", flag: "🇺🇸", wordSearchTitle: "WORD SEARCH", solutionTitle: "SOLUTIONS" },
  { code: "es", label: "Spanish", nativeName: "Español", flag: "🇪🇸", wordSearchTitle: "SOPA DE LETRAS", solutionTitle: "SOLUCIONES" },
  { code: "de", label: "German", nativeName: "Deutsch", flag: "🇩🇪", wordSearchTitle: "WORTSUCHE", solutionTitle: "LÖSUNGEN" },
  { code: "fr", label: "French", nativeName: "Français", flag: "🇫🇷", wordSearchTitle: "MOTS MÊLÉS", solutionTitle: "SOLUTIONS" },
  { code: "it", label: "Italian", nativeName: "Italiano", flag: "🇮🇹", wordSearchTitle: "CRUCIPUZZLE", solutionTitle: "SOLUZIONI" },
  { code: "pt", label: "Portuguese", nativeName: "Português", flag: "🇧🇷", wordSearchTitle: "CAÇA-PALAVRAS", solutionTitle: "SOLUÇÕES" },
];

export const WORD_SEARCH_THEMES: WordSearchTheme[] = [
  // --- Holidays & Seasons (English) ---
  { id: "christmas", category: "Holidays & Seasons", name: "Christmas", language: "en",
    words: ["SANTA", "REINDEER", "STOCKING", "ORNAMENT", "MISTLETOE", "SLEIGH", "CAROL", "TINSEL", "WREATH", "EGGNOG", "CHIMNEY", "GARLAND", "SNOWMAN", "PRESENT"] },
  { id: "halloween", category: "Holidays & Seasons", name: "Halloween", language: "en",
    words: ["PUMPKIN", "GHOST", "WITCH", "SKELETON", "COSTUME", "CANDY", "SPIDER", "HAUNTED", "VAMPIRE", "CAULDRON", "GOBLIN", "LANTERN", "BROOMSTICK", "ZOMBIE"] },
  { id: "thanksgiving", category: "Holidays & Seasons", name: "Thanksgiving", language: "en",
    words: ["TURKEY", "HARVEST", "STUFFING", "GRAVY", "CRANBERRY", "PILGRIM", "FEAST", "AUTUMN", "PUMPKIN", "FAMILY", "GRATITUDE", "CORNUCOPIA", "PIE"] },
  { id: "valentines", category: "Holidays & Seasons", name: "Valentine's Day", language: "en",
    words: ["CUPID", "ROSES", "CHOCOLATE", "ROMANCE", "SWEETHEART", "HEART", "ARROW", "CANDY", "BOUQUET", "KISSES", "RIBBON", "ADMIRER"] },
  { id: "easter", category: "Holidays & Seasons", name: "Easter", language: "en",
    words: ["BUNNY", "BASKET", "EGGHUNT", "CHICK", "SPRING", "LAMB", "JELLYBEAN", "BONNET", "MEADOW", "TULIP", "CHOCOLATE", "NEST"] },
  { id: "summer", category: "Holidays & Seasons", name: "Summer", language: "en",
    words: ["BEACH", "SUNSHINE", "POPSICLE", "SANDALS", "SWIMMING", "PICNIC", "VACATION", "LEMONADE", "BARBECUE", "SUNSCREEN", "FLIPFLOPS", "HAMMOCK"] },
  { id: "winter", category: "Holidays & Seasons", name: "Winter", language: "en",
    words: ["SNOWFLAKE", "MITTENS", "FIREPLACE", "BLIZZARD", "ICICLE", "SKATING", "SLEDDING", "SCARF", "FROST", "HOTCOCOA", "SNOWBALL", "BLANKET"] },

  // --- Nature & Landscapes (English) ---
  { id: "ocean", category: "Nature & Landscapes", name: "Ocean & Seas", language: "en",
    words: ["CORAL", "SEAWEED", "TIDEPOOL", "CURRENTS", "COAST", "REEF", "WAVES", "SURF", "ISLAND", "LAGOON", "ANCHOR", "BEACH", "HORIZON"] },
  { id: "farm", category: "Nature & Landscapes", name: "Farm & Harvest", language: "en",
    words: ["TRACTOR", "BARN", "PASTURE", "HAYSTACK", "HARVEST", "SILO", "WHEAT", "WINDMILL", "FARMHOUSE", "PLOW", "ORCHARD", "BARROW", "CROPS"] },
  { id: "forest", category: "Nature & Landscapes", name: "Forest & Woodlands", language: "en",
    words: ["REDWOOD", "MAPLE", "CEDAR", "PINE", "SPRUCE", "WILLOW", "ACORN", "FOLIAGE", "BRANCH", "TIMBER", "GROVE", "CANOPY", "EVERGREEN"] },
  { id: "garden", category: "Nature & Landscapes", name: "Garden & Flowers", language: "en",
    words: ["ROSE", "TULIP", "DAISY", "SUNFLOWER", "ORCHID", "LAVENDER", "MARIGOLD", "PETUNIA", "TRELLIS", "BLOSSOM", "SPROUT", "GREENHOUSE"] },
  { id: "weather", category: "Nature & Landscapes", name: "Weather", language: "en",
    words: ["THUNDER", "LIGHTNING", "RAINBOW", "DROUGHT", "HURRICANE", "BREEZE", "HUMIDITY", "FORECAST", "TORNADO", "FROST", "DRIZZLE", "SUNSHINE"] },

  // --- Food & Drink (English) ---
  { id: "baking", category: "Food & Drink", name: "Baking & Desserts", language: "en",
    words: ["CUPCAKE", "BROWNIE", "PANCAKE", "COOKIE", "FROSTING", "PASTRY", "CARAMEL", "MERINGUE", "WAFFLE", "DOUGHNUT", "CINNAMON", "VANILLA", "SPRINKLES"] },
  { id: "coffee", category: "Food & Drink", name: "Coffee & Tea", language: "en",
    words: ["ESPRESSO", "LATTE", "CAPPUCCINO", "MOCHA", "BARISTA", "ROAST", "CHAMOMILE", "TEAPOT", "CARAMEL", "FRAPPE", "AROMA", "STEAM"] },
  { id: "italian", category: "Food & Drink", name: "Italian Cuisine", language: "en",
    words: ["PASTA", "PIZZA", "RISOTTO", "LASAGNA", "GELATO", "PARMESAN", "TIRAMISU", "RAVIOLI", "BRUSCHETTA", "ESPRESSO", "MOZZARELLA", "BASIL"] },

  // --- Travel & Geography (English) ---
  { id: "countries", category: "Travel & Geography", name: "World Countries", language: "en",
    words: ["FRANCE", "JAPAN", "BRAZIL", "EGYPT", "CANADA", "ITALY", "KENYA", "MEXICO", "GREECE", "IRELAND", "THAILAND", "MOROCCO", "NORWAY"] },
  { id: "usstates", category: "Travel & Geography", name: "US States", language: "en",
    words: ["TEXAS", "FLORIDA", "CALIFORNIA", "COLORADO", "GEORGIA", "ARIZONA", "OREGON", "VIRGINIA", "MONTANA", "VERMONT", "ALASKA", "HAWAII"] },
  { id: "cityscapes", category: "Travel & Geography", name: "Famous Cities", language: "en",
    words: ["PARIS", "LONDON", "TOKYO", "ROME", "SYDNEY", "CAIRO", "DUBAI", "VENICE", "BERLIN", "MADRID", "TORONTO", "SINGAPORE"] },
  { id: "camping", category: "Travel & Geography", name: "Camping & Outdoors", language: "en",
    words: ["CAMPFIRE", "TENT", "BACKPACK", "COMPASS", "TRAIL", "LANTERN", "SLEEPINGBAG", "CANOE", "HAMMOCK", "MARSHMALLOW", "RIDGE", "WILDERNESS"] },

  // --- Occupations & Everyday Life (English) ---
  { id: "jobs", category: "Everyday Life", name: "Occupations", language: "en",
    words: ["DOCTOR", "TEACHER", "ENGINEER", "FARMER", "LAWYER", "ARTIST", "PLUMBER", "CHEF", "PILOT", "NURSE", "ELECTRICIAN", "ARCHITECT"] },
  { id: "school", category: "Everyday Life", name: "Back to School", language: "en",
    words: ["PENCIL", "NOTEBOOK", "BACKPACK", "CLASSROOM", "TEACHER", "HOMEWORK", "CRAYON", "SCISSORS", "LOCKER", "RECESS", "TEXTBOOK", "CHALKBOARD"] },
  { id: "wedding", category: "Everyday Life", name: "Wedding Day", language: "en",
    words: ["BRIDE", "GROOM", "BOUQUET", "CEREMONY", "RECEPTION", "TOAST", "VOWS", "BRIDESMAID", "HONEYMOON", "ENGAGEMENT", "CONFETTI", "REGISTRY"] },
  { id: "babyshower", category: "Everyday Life", name: "Baby Shower", language: "en",
    words: ["LULLABY", "STROLLER", "BASSINET", "DIAPER", "RATTLE", "ONESIE", "PACIFIER", "NURSERY", "BOOTIES", "BLANKET", "TEDDYBEAR", "CRADLE"] },

  // --- Seniors & Nostalgia (English) ---
  { id: "classiccars", category: "Seniors & Nostalgia", name: "Classic Cars", language: "en",
    words: ["MUSTANG", "CORVETTE", "CADILLAC", "THUNDERBIRD", "CAMARO", "CHEVROLET", "CONVERTIBLE", "CHROME", "HORSEPOWER", "ROADSTER", "DASHBOARD", "HUBCAP"] },
  { id: "bigband", category: "Seniors & Nostalgia", name: "Big Band Era", language: "en",
    words: ["SWING", "TROMBONE", "CLARINET", "BALLROOM", "SAXOPHONE", "ORCHESTRA", "TRUMPET", "RHYTHM", "CROONER", "JITTERBUG", "RADIO", "VINYL"] },
  { id: "diner", category: "Seniors & Nostalgia", name: "Retro Diner", language: "en",
    words: ["MILKSHAKE", "JUKEBOX", "SODAFOUNTAIN", "BOOTH", "MALTED", "CARHOP", "NEON", "DRIVEIN", "SUNDAE", "COUNTER", "APRON", "BURGER"] },
  { id: "hollywood", category: "Seniors & Nostalgia", name: "Old Hollywood", language: "en",
    words: ["MARQUEE", "STARLET", "PREMIERE", "SPOTLIGHT", "SCREENPLAY", "DIRECTOR", "GLAMOUR", "STUDIO", "PROJECTOR", "REDCARPET", "CINEMA", "MATINEE"] },

  // --- Space, Science & Kids (English) ---
  { id: "space", category: "Space & Science", name: "Outer Space", language: "en",
    words: ["ROCKET", "GALAXY", "ASTRONAUT", "PLANET", "COMET", "NEBULA", "SATELLITE", "METEOR", "TELESCOPE", "ORBIT", "GRAVITY", "STARDUST"] },
  { id: "science", category: "Space & Science", name: "Science & Geology", language: "en",
    words: ["VOLCANO", "CRYSTAL", "MINERAL", "TELESCOPE", "MICROSCOPE", "FOSSIL", "GALAXY", "MAGNET", "PRISM", "GRAVITY", "GEOLOGY", "CRATER"] },
  { id: "sports", category: "Sports & Music", name: "Team Sports", language: "en",
    words: ["SOCCER", "BASKETBALL", "BASEBALL", "HOCKEY", "VOLLEYBALL", "FOOTBALL", "REFEREE", "TOURNAMENT", "STADIUM", "CHAMPION", "SCOREBOARD", "DEFENSE"] },
  { id: "music", category: "Sports & Music", name: "Musical Instruments", language: "en",
    words: ["GUITAR", "PIANO", "VIOLIN", "DRUMS", "FLUTE", "TRUMPET", "CELLO", "HARP", "CLARINET", "SAXOPHONE", "ACCORDION", "UKULELE"] },

  // ==========================================
  // 🇪🇸 SPANISH THEMES (SOPA DE LETRAS)
  // ==========================================
  { id: "es_navidad", category: "Español - Fiestas & Tradiciones", name: "Navidad y Fiestas (ES)", language: "es",
    words: ["NAVIDAD", "CAMPANAS", "REGALOS", "GUIRNALDA", "ESTRELLA", "TURRON", "CHIMENEA", "PESEBRE", "VILLANCICO", "TRINEO", "NIEVE", "FAMILIA", "PASTOR"] },
  { id: "es_naturaleza", category: "Español - Naturaleza & Paisajes", name: "Naturaleza y Paisajes (ES)", language: "es",
    words: ["BOSQUE", "MONTAÑA", "RIO", "SELVA", "PLAYA", "VOLCAN", "LAGO", "VALLE", "ISLA", "CASCADA", "SENDERO", "COLINA", "PRADERA"] },
  { id: "es_ciudades", category: "Español - Geografía & Viajes", name: "Ciudades Hispanas (ES)", language: "es",
    words: ["MADRID", "BARCELONA", "SEVILLA", "BOGOTA", "BUENOSAIRES", "LIMA", "MEXICO", "SANTIAGO", "CARACAS", "HABANA", "QUITO", "MONTEVIDEO", "VALENCIA"] },
  { id: "es_comida", category: "Español - Comida & Cocina", name: "Gastronomía Hispana (ES)", language: "es",
    words: ["PAELLA", "TORTILLA", "EMPANADA", "CHOCOLATE", "GAZPACHO", "CHURROS", "ACEITUNAS", "JAMON", "QUESO", "ENSALADA", "PIMIENTA", "ROMERO", "VAINILLA"] },
  { id: "es_viajes", category: "Español - Geografía & Viajes", name: "Viajes y Playa (ES)", language: "es",
    words: ["PLAYA", "MONTAÑA", "MALETA", "PASAPORTE", "AVION", "CRUCERO", "BRUJULA", "HOTEL", "AVENTURA", "EQUIPAJE", "PAISAJE", "DESTINO", "SENDERO"] },
  { id: "es_familia", category: "Español - Vida Cotidiana", name: "Hogar y Familia (ES)", language: "es",
    words: ["FAMILIA", "ABUELOS", "HERMANOS", "ALEGRIA", "AMISTAD", "ABRAZO", "SONRISA", "JARDIN", "VENTANA", "HISTORIA", "RECUERDOS", "CARIÑO", "COMPAÑIA"] },
  { id: "es_memoria", category: "Español - Mente & Sabiduría", name: "Memoria y Mente Activa (ES)", language: "es",
    words: ["SABIDURIA", "PACIENCIA", "AGILIDAD", "CONCENTRACION", "OPTIMISMO", "VITALIDAD", "SERENIDAD", "EXPERIENCIA", "GRATITUD", "BIENESTAR", "PENSAMIENTO"] },

  // ==========================================
  // 🇩🇪 GERMAN THEMES (WORTSUCHE)
  // ==========================================
  { id: "de_weihnachten", category: "Deutsch - Feste & Jahreszeiten", name: "Weihnachten & Winter (DE)", language: "de",
    words: ["WEIHNACHTEN", "SCHNEEFLOCKE", "TANNENBAUM", "GESCHENKE", "SCHLITTEN", "KERZENSCHEIN", "LEBKUCHEN", "ENGEL", "STERN", "KAMIN", "GLUEHWEIN", "GLOCKE"] },
  { id: "de_natur", category: "Deutsch - Natur & Landschaften", name: "Natur & Landschaften (DE)", language: "de",
    words: ["WALD", "BERG", "FLUSS", "SEE", "TAL", "WIESE", "BAUM", "BLUME", "QUELLE", "GIPFEL", "SCHNEE", "SONNE", "WOLKE"] },
  { id: "de_staedte", category: "Deutsch - Geografie & Reisen", name: "Deutsche Städte (DE)", language: "de",
    words: ["BERLIN", "MUENCHEN", "HAMBURG", "KOELN", "WIEN", "ZUERICH", "DRESDEN", "LEIPZIG", "FRANKFURT", "STUTTGART", "SALZBURG", "BREMEN", "POTSDAM"] },
  { id: "de_kueche", category: "Deutsch - Essen & Trinken", name: "Küche & Genuss (DE)", language: "de",
    words: ["APFELSTRUDEL", "BREZEL", "KUCHEN", "SCHOKOLADE", "ZIMT", "VANILLE", "BROT", "HONIG", "KAFFEE", "MARMELADE", "KRAEUTER", "GEBAECK"] },

  // ==========================================
  // 🇫🇷 FRENCH THEMES (MOTS MÊLÉS)
  // ==========================================
  { id: "fr_noel", category: "Français - Fêtes & Saisons", name: "Noël et Fêtes (FR)", language: "fr",
    words: ["NOEL", "SAPIN", "CADEAUX", "ETOILE", "TRAINEAU", "BOUGIE", "GUIRLANDE", "REVEILLON", "CHEMINEE", "LUTIN", "CHOCOLAT", "FLOCON", "CLOCHES"] },
  { id: "fr_nature", category: "Français - Nature & Paysages", name: "Nature et Paysages (FR)", language: "fr",
    words: ["FORET", "MONTAGNE", "RIVIERE", "FLEUVE", "VALLEE", "CASCADE", "OCEAN", "PLAGE", "SENTIER", "COLLINE", "PRAIRIE", "NATURE", "SOURCE"] },
  { id: "fr_villes", category: "Français - Voyage & Géographie", name: "Villes Francophones (FR)", language: "fr",
    words: ["PARIS", "LYON", "MARSEILLE", "BORDEAUX", "NICE", "STRASBOURG", "TOULOUSE", "NANTES", "LILLE", "BRUXELLES", "GENEVE", "MONTREAL", "QUEBEC"] },
  { id: "fr_cuisine", category: "Français - Cuisine & Gastronomie", name: "Cuisine & Pâtisserie (FR)", language: "fr",
    words: ["CROISSANT", "BAGUETTE", "FROMAGE", "CHOCOLAT", "MACARON", "ECLAIR", "RATATOUILLE", "CREPES", "VANILLE", "CARAMEL", "TARTE", "BRIOCHE"] },

  // ==========================================
  // 🇮🇹 ITALIAN THEMES (CRUCIPUZZLE)
  // ==========================================
  { id: "it_natale", category: "Italiano - Feste & Tradizioni", name: "Natale e Feste (IT)", language: "it",
    words: ["NATALE", "ALBERO", "REGALI", "STELLA", "PRESEPE", "CANDELA", "SLITTA", "CAMINO", "CAMPANE", "DOLCI", "NEVE", "FAMIGLIA", "PANDORO"] },
  { id: "it_cucina", category: "Italiano - Cucina & Sapori", name: "Cucina Italiana (IT)", language: "it",
    words: ["PIZZA", "RISOTTO", "LASAGNE", "GELATO", "TIRAMISU", "RAVIOLI", "ESPRESSO", "BASILICO", "MOZZARELLA", "PARMIGIANO", "PESTO", "BRUSCHETTA"] },
  { id: "it_citta", category: "Italiano - Città & Viaggi", name: "Città d'Italia (IT)", language: "it",
    words: ["ROMA", "FIRENZE", "VENEZIA", "MILANO", "NAPOLI", "TORINO", "BOLOGNA", "PALERMO", "GENOVA", "VERONA", "SIENA", "PISA", "BARI"] },

  // ==========================================
  // 🇧🇷 PORTUGUESE THEMES (CAÇA-PALAVRAS)
  // ==========================================
  { id: "pt_natal", category: "Português - Festas & Tradições", name: "Natal e Celebrações (PT)", language: "pt",
    words: ["NATAL", "PRESENTE", "ESTRELA", "ARVORE", "TRENHO", "VELAS", "GUIRLANDA", "FAMILIA", "CEIA", "SINO", "ALEGRIA", "PAZ", "ABRACO"] },
  { id: "pt_natureza", category: "Português - Natureza & Paisagens", name: "Natureza e Paisagens (PT)", language: "pt",
    words: ["FLORESTA", "MONTANHA", "RIO", "PRAIA", "VALE", "LAGO", "CASCATA", "OCEANO", "CAMPINA", "TRILHA", "COLINA", "SERRA"] },
  { id: "pt_cidades", category: "Português - Cidades & Viagens", name: "Cidades Lusófonas (PT)", language: "pt",
    words: ["LISBOA", "PORTO", "SAOPAULO", "RIODEJANEIRO", "SALVADOR", "BRASILIA", "COIMBRA", "FARO", "CURITIBA", "FORTALEZA", "RECIFE", "MANAUS"] },
];

export const WORD_SEARCH_THEME_CATEGORIES: string[] = Array.from(
  new Set(WORD_SEARCH_THEMES.map(t => t.category))
);

export function getThemeById(id: string): WordSearchTheme | undefined {
  return WORD_SEARCH_THEMES.find(t => t.id === id);
}

export function getThemesByLanguage(lang: SupportedLanguageCode): WordSearchTheme[] {
  return WORD_SEARCH_THEMES.filter(t => (t.language || "en") === lang);
}
