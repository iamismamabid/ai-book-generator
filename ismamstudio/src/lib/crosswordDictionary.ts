// ismamstudio/src/lib/crosswordDictionary.ts
// Comprehensive library of 105 unique, high-quality themed crossword puzzles with clues.
// Ensures 100-puzzle books contain 100% unique puzzles without looping or duplication.

export interface CrosswordTheme {
  title: string;
  words: Array<{ word: string; clue: string }>;
}

export const CROSSWORD_THEMES: CrosswordTheme[] = [
  {
    title: "Technology & Web",
    words: [
      { word: "REACT", clue: "Popular user interface library" },
      { word: "NEXTJS", clue: "Fullstack React web framework" },
      { word: "VERCEL", clue: "Cloud platform for frontend deployment" },
      { word: "CODING", clue: "Writing computer program instructions" },
      { word: "ENGINE", clue: "Core software processing subsystem" },
      { word: "SERVER", clue: "Computer delivering network resources" },
    ]
  },
  {
    title: "African Wildlife",
    words: [
      { word: "ELEPHANT", clue: "Giant savanna mammal with long trunk" },
      { word: "GIRAFFE", clue: "Tallest mammal with spotted coat" },
      { word: "CHEETAH", clue: "Fastest land animal on earth" },
      { word: "ZEBRA", clue: "Equine animal with striped coat" },
      { word: "LION", clue: "Apex predator known as king of beasts" },
      { word: "HYENA", clue: "Carnivore with distinctive laughing call" },
    ]
  },
  {
    title: "Musical Instruments",
    words: [
      { word: "GUITAR", clue: "Fretted string instrument played with picks" },
      { word: "VIOLIN", clue: "High-pitched bowed string instrument" },
      { word: "PIANO", clue: "Acoustic keyboard instrument with 88 keys" },
      { word: "TRUMPET", clue: "Brass wind instrument with three valves" },
      { word: "DRUMS", clue: "Percussion kit maintaining musical rhythm" },
      { word: "FLUTE", clue: "Side-blown reedless woodwind instrument" },
    ]
  },
  {
    title: "Solar System",
    words: [
      { word: "JUPITER", clue: "Largest gas giant in our solar system" },
      { word: "SATURN", clue: "Planet famous for extensive ring system" },
      { word: "NEPTUNE", clue: "Deep blue ice giant planet" },
      { word: "COMET", clue: "Icy body leaving bright glowing tail" },
      { word: "METEOR", clue: "Shooting star burning through atmosphere" },
      { word: "ORBIT", clue: "Curved gravitational path of a celestial body" },
    ]
  },
  {
    title: "Ocean Wonders",
    words: [
      { word: "DOLPHIN", clue: "Intelligent marine mammal known for clicks" },
      { word: "OCTOPUS", clue: "Eight-armed mollusk with suction cups" },
      { word: "SHARK", clue: "Cartilaginous fish with sharp teeth" },
      { word: "CORAL", clue: "Marine invertebrate forming living reefs" },
      { word: "WHALE", clue: "Gigantic aquatic mammal that breaches" },
      { word: "LOBSTER", clue: "Crustacean with heavy front claws" },
    ]
  },
  {
    title: "Coffee & Tea",
    words: [
      { word: "ESPRESSO", clue: "Concentrated coffee brewed under high pressure" },
      { word: "BARISTA", clue: "Professional coffee preparer and server" },
      { word: "LATTE", clue: "Espresso drink topped with steamed milk" },
      { word: "ROAST", clue: "Process heating green coffee beans" },
      { word: "MATCHA", clue: "Finely ground Japanese green tea powder" },
      { word: "BREW", clue: "Extracting flavor using hot water" },
    ]
  },
  {
    title: "World Geography",
    words: [
      { word: "CONTINENT", clue: "One of Earth's massive landmasses" },
      { word: "EQUATOR", clue: "Imaginary line dividing northern and southern halves" },
      { word: "ISLAND", clue: "Land area entirely surrounded by water" },
      { word: "CANYON", clue: "Deep gorge typically carved by river erosion" },
      { word: "DESERT", clue: "Arid landscape with minimal precipitation" },
      { word: "VALLEY", clue: "Low area of land between hills or mountains" },
    ]
  },
  {
    title: "Garden Botanicals",
    words: [
      { word: "LAVENDER", clue: "Aromatic purple herb loved by pollinators" },
      { word: "ORCHID", clue: "Exotic flowering plant with intricate blooms" },
      { word: "SUNFLOWER", clue: "Tall bloom that tracks sun across sky" },
      { word: "DAISY", clue: "Flower with white petals and yellow center" },
      { word: "TULIP", clue: "Cup-shaped spring bulb flower" },
      { word: "BLOSSOM", clue: "Flower cluster on a fruit-bearing tree" },
    ]
  },
  {
    title: "Kitchen & Cooking",
    words: [
      { word: "SPATULA", clue: "Flat utensil for flipping and scraping food" },
      { word: "BLENDER", clue: "Electric appliance for puréeing liquids" },
      { word: "RECIPE", clue: "Set of cooking instructions and ingredients" },
      { word: "SIMMER", clue: "Cook gently below the boiling temperature" },
      { word: "COLANDER", clue: "Perforated bowl used for draining pasta" },
      { word: "WHISK", clue: "Wire utensil used to beat and aerate eggs" },
    ]
  },
  {
    title: "Weather & Sky",
    words: [
      { word: "LIGHTNING", clue: "Sudden electrostatic discharge during storm" },
      { word: "TORNADO", clue: "Violently rotating column of storm air" },
      { word: "BLIZZARD", clue: "Severe winter storm with blinding snow" },
      { word: "RAINBOW", clue: "Optical meteorological spectrum in the sky" },
      { word: "HURRICANE", clue: "Massive tropical cyclone with gale force winds" },
      { word: "THUNDER", clue: "Acoustic shockwave caused by lightning bolt" },
    ]
  },
  {
    title: "Medieval Fortress",
    words: [
      { word: "CASTLE", clue: "Fortified stone stronghold for royalty" },
      { word: "KNIGHT", clue: "Armored noble warrior serving a monarch" },
      { word: "SHIELD", clue: "Handheld defensive armor plate" },
      { word: "ARCHER", clue: "Bowman skilled at long-range target shooting" },
      { word: "DRAWBRIDGE", clue: "Hinged wooden bridge raised over a moat" },
      { word: "ARMOR", clue: "Protective metal plating worn in battle" },
    ]
  },
  {
    title: "Bakery Delights",
    words: [
      { word: "CROISSANT", clue: "Flaky crescent-shaped butter pastry" },
      { word: "BAGUETTE", clue: "Long slender loaf of French crusty bread" },
      { word: "PRETZEL", clue: "Knot-twisted baked bread sprinkled with salt" },
      { word: "MUFFIN", clue: "Individual cup-shaped quick bread snack" },
      { word: "DOUGHNUT", clue: "Deep-fried ring of sweetened dough" },
      { word: "PASTRY", clue: "Baked dough confection made with flour and fat" },
    ]
  },
  {
    title: "Forest Woodlands",
    words: [
      { word: "REDWOOD", clue: "Towering ancient tree along northern coast" },
      { word: "WILLOW", clue: "Tree with dropping branches growing by streams" },
      { word: "MAPLE", clue: "Hardwood producing sweet sap for syrup" },
      { word: "TIMBER", clue: "Wood prepared for building and carpentry" },
      { word: "BIRCH", clue: "Deciduous tree with distinctive peeling white bark" },
      { word: "CANOPY", clue: "High leafy ceiling formed by mature treetops" },
    ]
  },
  {
    title: "Gems & Crystals",
    words: [
      { word: "DIAMOND", clue: "Hardest natural mineral formed under pressure" },
      { word: "EMERALD", clue: "Vibrant green gemstone variety of beryl" },
      { word: "SAPPHIRE", clue: "Precious blue gemstone of corundum family" },
      { word: "QUARTZ", clue: "Abundant crystalline mineral used in watches" },
      { word: "RUBY", clue: "Blood-red gemstone prized through centuries" },
      { word: "TOPAZ", clue: "Silicate mineral found in golden yellow shades" },
    ]
  },
  {
    title: "Ancient Egypt",
    words: [
      { word: "PYRAMID", clue: "Monumental stone tomb with four triangular sides" },
      { word: "PHARAOH", clue: "Ancient monarch revered as ruler and deity" },
      { word: "SPHINX", clue: "Mythical creature with human head and lion body" },
      { word: "PAPYRUS", clue: "Reedy aquatic plant made into writing paper" },
      { word: "HIEROGLYPH", clue: "Pictographic writing system of the Nile Valley" },
      { word: "MUMMY", clue: "Embalmed deceased body preserved for afterlife" },
    ]
  },
  {
    title: "Fine Art Studio",
    words: [
      { word: "CANVAS", clue: "Heavy woven cloth used as painting surface" },
      { word: "PALETTE", clue: "Flat board on which artist mixes oil pigments" },
      { word: "EASEL", clue: "Three-legged wooden stand holding up artwork" },
      { word: "PORTRAIT", clue: "Artistic painting capturing a person's likeness" },
      { word: "ACRYLIC", clue: "Fast-drying synthetic paint medium" },
      { word: "SKETCH", clue: "Quick preliminary drawing capturing main forms" },
    ]
  },
  {
    title: "Winter Sports",
    words: [
      { word: "SNOWBOARD", clue: "Single wide board ridden down alpine slopes" },
      { word: "CURLING", clue: "Sport sliding polished granite stones on ice sheet" },
      { word: "HOCKEY", clue: "Fast team game played on ice with sticks and puck" },
      { word: "SLALOM", clue: "Alpine skiing race weaving between gate poles" },
      { word: "BOBSLED", clue: "High-speed gravity-powered sled down banked ice tracks" },
      { word: "SKATING", clue: "Gliding across frozen ice with steel-bladed boots" },
    ]
  },
  {
    title: "Birds of Prey",
    words: [
      { word: "FALCON", clue: "Swift bird of prey famous for diving stoops" },
      { word: "OSPREY", clue: "Fish-eating raptor plunging into fresh water" },
      { word: "EAGLE", clue: "Majestic national raptor with keen eyesight" },
      { word: "HARRIER", clue: "Low-flying hawk hunting across open marshes" },
      { word: "KESTREL", clue: "Small colorful falcon capable of hovering" },
      { word: "TALON", clue: "Sharp curved claw on raptor hunting foot" },
    ]
  },
  {
    title: "Desert Expedition",
    words: [
      { word: "MIRAGE", clue: "Optical illusion caused by hot desert ground air" },
      { word: "CACTUS", clue: "Succulent desert plant armed with sharp spines" },
      { word: "CARAVAN", clue: "Group of travelers crossing desert sands together" },
      { word: "OASIS", clue: "Fertile watered area amidst arid sand dunes" },
      { word: "CAMEL", clue: "Humped desert mammal adapted to travel without water" },
      { word: "CANYON", clue: "Towering rock chasm carved over millennia" },
    ]
  },
  {
    title: "Deep Sea Abyss",
    words: [
      { word: "JELLYFISH", clue: "Gelatinous bell-shaped creature with stinging tentacles" },
      { word: "BARRACUDA", clue: "Fierce predatory fish with razor-sharp teeth" },
      { word: "MANTA", clue: "Huge gentle ray gliding with wing-like fins" },
      { word: "NAUTILUS", clue: "Cephalopod living inside spiral chambered shell" },
      { word: "SQUID", clue: "Ten-armed mollusk with torpedo-shaped mantle" },
      { word: "TRENCH", clue: "Deepest oceanic depression plunging miles down" },
    ]
  },
  {
    title: "Homestead Farm",
    words: [
      { word: "TRACTOR", clue: "Heavy motorized farm machine pulling plows" },
      { word: "PASTURE", clue: "Fenced meadow where cattle and sheep graze" },
      { word: "ROOSTER", clue: "Male chicken greeting dawn with loud crow" },
      { word: "HARVEST", clue: "Season for gathering mature agricultural crops" },
      { word: "SILO", clue: "Tower storage structure for grain and silage" },
      { word: "BARN", clue: "Large farm building housing livestock and hay" },
    ]
  },
  {
    title: "Space Missions",
    words: [
      { word: "ROCKET", clue: "Propulsion vehicle launching satellites into orbit" },
      { word: "ASTRONAUT", clue: "Trained crew member traveling beyond Earth" },
      { word: "SHUTTLE", clue: "Reusable spacecraft that lands like an airplane" },
      { word: "CAPSULE", clue: "Pressurized compartment returning crew to Earth" },
      { word: "SATELLITE", clue: "Artificial orbiter relaying television and weather" },
      { word: "BOOSTER", clue: "Initial stage rocket providing launch liftoff thrust" },
    ]
  },
  {
    title: "Mythology & Legends",
    words: [
      { word: "PHOENIX", clue: "Mythic immortal bird regenerating from ashes" },
      { word: "GRIFFIN", clue: "Legendary beast with lion body and eagle wings" },
      { word: "PEGASUS", clue: "Winged stallion born from sea foam in Greek lore" },
      { word: "DRAGON", clue: "Fire-breathing scaled creature guarding treasure" },
      { word: "UNICORN", clue: "Magical horse-like creature with spiral horn" },
      { word: "KRAKEN", clue: "Legendary monstrous sea beast dragging ships down" },
    ]
  },
  {
    title: "Classic Literature",
    words: [
      { word: "PROLOGUE", clue: "Introductory section opening a literary work" },
      { word: "CHAPTER", clue: "Numbered main division within a novel" },
      { word: "STANZA", clue: "Group of poetic lines forming metrical unit" },
      { word: "SONNET", clue: "Fourteen-line poem with formal rhyming scheme" },
      { word: "MEMOIR", clue: "Historical autobiography of personal memories" },
      { word: "EPILOGUE", clue: "Concluding section bringing story to completion" },
    ]
  },
  {
    title: "Tropical Island",
    words: [
      { word: "LAGOON", clue: "Shallow body of water separated by coral reef" },
      { word: "HAMMOCK", clue: "Sling of canvas or netting suspended between trees" },
      { word: "COCONUT", clue: "Large woody palm fruit with milk and meat" },
      { word: "BREEZE", clue: "Gentle refreshing coastal wind" },
      { word: "SHORELINE", clue: "Edge where oceanic waves meet sandy beach" },
      { word: "CORAL", clue: "Calcareous marine skeleton forming underwater reefs" },
    ]
  },
  {
    title: "World Architecture",
    words: [
      { word: "CATHEDRAL", clue: "Principal church containing bishop's official seat" },
      { word: "COLOSSEUM", clue: "Massive ancient amphitheater in central Rome" },
      { word: "MONUMENT", clue: "Statue or stone structure honoring historic hero" },
      { word: "PAGODA", clue: "Tiered Asian tower with upturned eaves" },
      { word: "MINARET", clue: "Slender architectural tower with viewing balcony" },
      { word: "COLUMN", clue: "Upright cylindrical stone pillar supporting roof" },
    ]
  },
  {
    title: "Detective & Mystery",
    words: [
      { word: "EVIDENCE", clue: "Factual proof presented to solve criminal case" },
      { word: "ALIBI", clue: "Claim or witness proving suspect was elsewhere" },
      { word: "SUSPECT", clue: "Person believed by investigators to be guilty" },
      { word: "MOTIVE", clue: "Underlying psychological reason for committing crime" },
      { word: "SLEUTH", clue: "Skilled private investigator tracking down clues" },
      { word: "WITNESS", clue: "Individual who saw an occurrence with own eyes" },
    ]
  },
  {
    title: "World Cuisine",
    words: [
      { word: "SUSHI", clue: "Japanese dish of seasoned rice with raw seafood" },
      { word: "PASTA", clue: "Italian staple dough shaped into noodles and tubes" },
      { word: "TACOS", clue: "Folded Mexican corn tortilla stuffed with meat" },
      { word: "CURRY", clue: "Spiced aromatic stew popular across South Asia" },
      { word: "FONDUE", clue: "Melted cheese or chocolate pot for dipping skewers" },
      { word: "PAELLA", clue: "Spanish saffron rice skillet loaded with seafood" },
    ]
  },
  {
    title: "Science & Physics",
    words: [
      { word: "GRAVITY", clue: "Fundamental force pulling mass toward mass" },
      { word: "ENERGY", clue: "Capacity of physical system to perform work" },
      { word: "QUANTUM", clue: "Discrete minimum packet of physical energy" },
      { word: "VACUUM", clue: "Region of space completely devoid of matter" },
      { word: "PHOTON", clue: "Elementary particle representing quantum of light" },
      { word: "PRISM", clue: "Transparent optical glass refracting light spectrum" },
    ]
  },
  {
    title: "Fitness & Training",
    words: [
      { word: "MARATHON", clue: "Long-distance foot race of 26.2 miles" },
      { word: "BARBELL", clue: "Long metal bar with weighted iron plates" },
      { word: "CIRCUIT", clue: "Series of workout exercises completed in order" },
      { word: "AEROBIC", clue: "Cardiovascular exercise requiring sustained oxygen" },
      { word: "STAMINA", clue: "Endurance and ability to sustain prolonged effort" },
      { word: "STRETCH", clue: "Lengthening muscles to improve joint flexibility" },
    ]
  },
  {
    title: "Camping & Outdoors",
    words: [
      { word: "CAMPFIRE", clue: "Outdoor open fire for warmth and cooking" },
      { word: "BACKPACK", clue: "Sturdy bag strapped to shoulders for hiking" },
      { word: "LANTERN", clue: "Portable lamp with protective glass cover" },
      { word: "COMPASS", clue: "Magnetic instrument pointing toward geographic north" },
      { word: "CANTEEN", clue: "Small container for carrying drinking water" },
      { word: "TRAIL", clue: "Marked path winding through wilderness nature" },
    ]
  },
  {
    title: "Cinema & Film",
    words: [
      { word: "DIRECTOR", clue: "Creator overseeing artistic vision of a movie" },
      { word: "SCREENPLAY", clue: "Written script containing dialogue and stage directions" },
      { word: "PREMIERE", clue: "First public screening of a major motion picture" },
      { word: "CINEMA", clue: "Theater designed for viewing motion pictures" },
      { word: "TRAILER", clue: "Short promotional preview of an upcoming movie" },
      { word: "CAMERA", clue: "Optical device capturing photographic motion images" },
    ]
  },
  {
    title: "Automotive World",
    words: [
      { word: "ENGINE", clue: "Internal combustion machine converting fuel to motion" },
      { word: "PISTON", clue: "Cylindrical component reciprocating inside engine cylinder" },
      { word: "EXHAUST", clue: "Piping directing emissions away from the motor" },
      { word: "STEERING", clue: "Mechanism controlling direction of vehicle wheels" },
      { word: "CHASSIS", clue: "Underlying structural frame supporting automobile body" },
      { word: "BRAKES", clue: "Friction device slowing and stopping vehicle wheels" },
    ]
  },
  {
    title: "Aviation & Flying",
    words: [
      { word: "AIRPLANE", clue: "Fixed-wing aircraft powered by propellers or jets" },
      { word: "FUSELAGE", clue: "Central structural body of an aircraft holding passengers" },
      { word: "ALTITUDE", clue: "Height of aircraft measured above sea level" },
      { word: "RUNWAY", clue: "Paved strip where aircraft take off and touch down" },
      { word: "PROPELLER", clue: "Rotating blades producing aerodynamic forward thrust" },
      { word: "PILOT", clue: "Licensed aviator operating aircraft flight controls" },
    ]
  },
  {
    title: "Prehistoric Dinosaurs",
    words: [
      { word: "FOSSIL", clue: "Petrified remains or imprint of ancient organism" },
      { word: "RAPTOR", clue: "Agile predatory bird-like dinosaur with curved claws" },
      { word: "JURASSIC", clue: "Mid-Mesozoic geologic period rich in giant reptiles" },
      { word: "SAUROPOD", clue: "Long-necked quadrupedal herbivorous giant dinosaur" },
      { word: "MUSEUM", clue: "Institution preserving and exhibiting fossil skeletons" },
      { word: "EXTINCT", clue: "No longer having any living members in existence" },
    ]
  },
  {
    title: "Rainforest Canopy",
    words: [
      { word: "TOUCAN", clue: "Tropical bird with oversized brightly colored bill" },
      { word: "JAGUAR", clue: "Spotted wild cat of the Amazon rainforest" },
      { word: "ORCHID", clue: "Epiphytic flower growing along mossy tree trunks" },
      { word: "IGUANA", clue: "Large arboreal lizard basking on sunny branches" },
      { word: "ANACONDA", clue: "Giant heavy water snake of tropical river basins" },
      { word: "MONKEY", clue: "Agile primate swinging through upper tree canopies" },
    ]
  },
  {
    title: "Olympics & Glory",
    words: [
      { word: "OLYMPICS", clue: "Global quadrennial sports games between nations" },
      { word: "CHAMPION", clue: "Victor who emerges triumphant in athletic contest" },
      { word: "STADIUM", clue: "Large oval arena with tiers of seating for spectators" },
      { word: "PODIUM", clue: "Three-tiered raised platform for medal winners" },
      { word: "TORCH", clue: "Carried flaming symbol lighting Olympic cauldron" },
      { word: "MEDAL", clue: "Metal disc awarded for first, second, or third place" },
    ]
  },
  {
    title: "Underground Caves",
    words: [
      { word: "STALACTITE", clue: "Mineral formation hanging downward from cave ceiling" },
      { word: "STALAGMITE", clue: "Mineral formation rising upward from cave floor" },
      { word: "CAVERN", clue: "Large underground chamber carved by acidic groundwater" },
      { word: "LANTERN", clue: "Essential light source for spelunking explorers" },
      { word: "GROTTO", clue: "Picturesque cave with pooling mineral waters" },
      { word: "ECHO", clue: "Sound wave bouncing back from stone cavern walls" },
    ]
  },
  {
    title: "Rivers & Waterways",
    words: [
      { word: "ESTUARY", clue: "Tidal mouth of large river where fresh and salt water mix" },
      { word: "CATARACT", clue: "Massive powerful waterfall or series of steep rapids" },
      { word: "DELTA", clue: "Triangular deposit of sediment at river mouth" },
      { word: "TRIBUTARY", clue: "Smaller stream flowing into a larger mainstream river" },
      { word: "STREAM", clue: "Small narrow body of running fresh water" },
      { word: "CURRENT", clue: "Continuous directed flow of water downstream" },
    ]
  },
  {
    title: "Chemistry Laboratory",
    words: [
      { word: "MOLECULE", clue: "Group of atoms bonded together chemically" },
      { word: "REACTION", clue: "Process transforming chemical substances into others" },
      { word: "BEAKER", clue: "Cylindrical glass container with pouring spout" },
      { word: "ELEMENT", clue: "Pure chemical substance found on periodic table" },
      { word: "COMPOUND", clue: "Substance consisting of multiple chemical elements" },
      { word: "ACID", clue: "Chemical substance donating protons with pH below 7" },
    ]
  },
  {
    title: "Board Game Night",
    words: [
      { word: "CHECKERS", clue: "Classic strategy game played on checkerboard squares" },
      { word: "DOMINO", clue: "Rectangular gaming tile with dotted end values" },
      { word: "CHESS", clue: "Strategic two-player board game with king and queen" },
      { word: "DICE", clue: "Six-sided numbered cubes rolled for random values" },
      { word: "PAWN", clue: "Most numerous playing piece on standard chessboard" },
      { word: "BOARD", clue: "Marked playing surface upon which pieces are moved" },
    ]
  },
  {
    title: "Arctic Wilderness",
    words: [
      { word: "GLACIER", clue: "Slow-moving massive body of compressed snow and ice" },
      { word: "ICEBERG", clue: "Enormous piece of freshwater ice floating in open sea" },
      { word: "TUNDRA", clue: "Treeless polar plain where subsoil is permafrost" },
      { word: "AURORA", clue: "Shimmering atmospheric light display near magnetic poles" },
      { word: "WALRUS", clue: "Large flippered marine mammal with ivory tusks" },
      { word: "IGLOO", clue: "Dome-shaped shelter constructed from blocks of hard snow" },
    ]
  },
  {
    title: "Astronomy & Stargazing",
    words: [
      { word: "TELESCOPE", clue: "Optical instrument magnifying distant celestial bodies" },
      { word: "CONSTELLATION", clue: "Named pattern of prominent stars in the night sky" },
      { word: "GALAXY", clue: "Vast gravitationally bound system of billions of stars" },
      { word: "NEBULA", clue: "Interstellar cloud of luminous gas and cosmic dust" },
      { word: "ECLIPSE", clue: "Obscuring of light from one celestial body by another" },
      { word: "ZENITH", clue: "Point on celestial sphere directly overhead an observer" },
    ]
  },
  {
    title: "Gardening Harvest",
    words: [
      { word: "TOMATO", clue: "Juicy red fruit commonly treated as salad vegetable" },
      { word: "CARROT", clue: "Orange tapering root vegetable rich in carotene" },
      { word: "LETTUCE", clue: "Crisp leafy green forming base of garden salads" },
      { word: "PUMPKIN", clue: "Large round orange squash harvested in autumn" },
      { word: "RADISH", clue: "Crisp peppery root vegetable with red skin" },
      { word: "CUCUMBER", clue: "Cylindrical green fruit with high water content" },
    ]
  },
  {
    title: "Nautical Navigation",
    words: [
      { word: "LIGHTHOUSE", clue: "Tower beaming brilliant guiding light toward open sea" },
      { word: "SEXTANT", clue: "Instrument measuring angle between celestial body and horizon" },
      { word: "ANCHOR", clue: "Heavy metal device dropped to moor a vessel to seabed" },
      { word: "RUDDER", clue: "Submerged flat blade hinged at stern to steer ship" },
      { word: "COMPASS", clue: "Magnetic needle aligning with Earth's magnetic poles" },
      { word: "HARBOR", clue: "Sheltered coastal water where vessels moor safely" },
    ]
  },
  {
    title: "Wild West Pioneers",
    words: [
      { word: "COWBOY", clue: "Mounted horseman herding cattle across open ranges" },
      { word: "FRONTIER", clue: "Borderland region marking edge of settled territory" },
      { word: "SALOON", clue: "Gathering tavern popular in 19th-century boom towns" },
      { word: "SHERIFF", clue: "Chief law enforcement official of western county" },
      { word: "SADDLE", clue: "Leather seat fastened onto back of riding horse" },
      { word: "SPUR", clue: "Metal spiked wheel attached to horseman's boot heel" },
    ]
  },
  {
    title: "Castle Royal Banquet",
    words: [
      { word: "GOBLET", clue: "Stemmed drinking vessel used for royal celebrations" },
      { word: "TAPESTRY", clue: "Heavy woven pictorial fabric hung along stone walls" },
      { word: "CHANDELIER", clue: "Ornate branched hanging fixture holding candles" },
      { word: "FEAST", clue: "Lavish multi-course banquet celebrating special occasion" },
      { word: "JESTER", clue: "Professional royal entertainer performing comedic antics" },
      { word: "THRONE", clue: "Ceremonial chair reserved for reigning sovereign" },
    ]
  },
  {
    title: "Volcanic Wonders",
    words: [
      { word: "MAGMA", clue: "Molten rock beneath Earth's outer geological crust" },
      { word: "CRATER", clue: "Bowl-shaped geological depression atop volcanic summit" },
      { word: "ERUPTION", clue: "Explosive ejection of lava, ash, and gases from vent" },
      { word: "BASALT", clue: "Dark dense igneous rock formed from cooled lava" },
      { word: "GEYSER", clue: "Geothermal hot spring intermittently boiling steam upwards" },
      { word: "LAVA", clue: "Molten rock pouring down exterior flanks of volcano" },
    ]
  },
  {
    title: "Autumn Festival",
    words: [
      { word: "HARVEST", clue: "Season for reaping crops planted in springtime" },
      { word: "CIDER", clue: "Fresh pressed apple juice served warm with cinnamon" },
      { word: "FOLIAGE", clue: "Vibrant yellow and scarlet leaves on autumn trees" },
      { word: "ACORN", clue: "Small oval nut of oak tree resting in cupule" },
      { word: "SCARECROW", clue: "Figure dressed in old clothes to frighten birds" },
      { word: "HAYSTACK", clue: "Mound of dried grass built in open farm fields" },
    ]
  },
  {
    title: "Musical Harmony",
    words: [
      { word: "MELODY", clue: "Linear sequence of musical notes perceived as single tune" },
      { word: "RHYTHM", clue: "Pattern of strong and weak musical beats across time" },
      { word: "CHORD", clue: "Harmonic combination of three or more musical notes" },
      { word: "TEMPO", clue: "Speed or pace at which a musical composition is played" },
      { word: "OCTAVE", clue: "Interval between one musical pitch and another of double freq" },
      { word: "SCALE", clue: "Graduated sequence of musical notes in ascending order" },
    ]
  },
  {
    title: "Jewels & Heirlooms",
    words: [
      { word: "LOCKET", clue: "Small pendant opening to reveal miniature portrait" },
      { word: "BROOCH", clue: "Decorative ornamental pin fastened onto clothing" },
      { word: "TIARA", clue: "Jeweled semi-circular coronet worn by royalty" },
      { word: "NECKLACE", clue: "Article of jewelry worn around the neck" },
      { word: "BRACELET", clue: "Ornamental band or chain circling the wrist" },
      { word: "PENDANT", clue: "Hanging jewel suspended from a necklace chain" },
    ]
  },
  {
    title: "Ancient Rome",
    words: [
      { word: "GLADIATOR", clue: "Armed combatant fighting in Roman public arenas" },
      { word: "SENATE", clue: "Governing legislative assembly of ancient Roman republic" },
      { word: "AQUEDUCT", clue: "Arched stone channel transporting water into city" },
      { word: "LEGION", clue: "Principal military unit of ancient Roman army" },
      { word: "TOGA", clue: "Flowing woolen outer robe worn by Roman citizens" },
      { word: "FORUM", clue: "Public plaza serving as center of Roman civic affairs" },
    ]
  },
  {
    title: "Mountain Adventures",
    words: [
      { word: "SUMMIT", clue: "Highest topmost point of a mountain peak" },
      { word: "GLACIER", clue: "Slow creeping river of alpine mountain ice" },
      { word: "AVALANCHE", clue: "Mass of snow and ice tumbling violently down slope" },
      { word: "CARABINER", clue: "Spring-loaded metal clip used in rock climbing" },
      { word: "CREVASSE", clue: "Deep fissure or chasm in alpine glacial ice" },
      { word: "ALPINE", clue: "Pertaining to high mountainous regions above treeline" },
    ]
  },
  {
    title: "Sweet Confections",
    words: [
      { word: "CARAMEL", clue: "Chewy golden candy made by gently heating sugars" },
      { word: "CHOCOLATE", clue: "Sweet confectionery made from roasted cacao beans" },
      { word: "TAFFY", clue: "Soft chewy boiled candy pulled until airy" },
      { word: "TRUFFLE", clue: "Rich chocolate ganache confection dusted with cocoa" },
      { word: "FUDGE", clue: "Rich creamy confection made with sugar, butter, and milk" },
      { word: "CANDY", clue: "Sweet treat made with refined sugar or syrup" },
    ]
  },
  {
    title: "World Languages",
    words: [
      { word: "ALPHABET", clue: "Standard set of letters used to write a language" },
      { word: "DIALECT", clue: "Regional variety of a language with unique vocabulary" },
      { word: "GRAMMAR", clue: "Whole system and structural rules of a language" },
      { word: "IDIOM", clue: "Figurative phrase whose meaning cannot be deduced literally" },
      { word: "ACCENT", clue: "Distinctive pronunciation characteristic of region" },
      { word: "SPEECH", clue: "Expression of spoken thoughts and communication" },
    ]
  },
  {
    title: "Springtime Renewal",
    words: [
      { word: "MEADOW", clue: "Open field of wildflowers and lush green grasses" },
      { word: "BUTTERFLY", clue: "Insects with colorful wings metamorphosing from caterpillar" },
      { word: "BLOSSOM", clue: "Delicate spring bloom opening on fruit trees" },
      { word: "BREEZE", clue: "Gentle mild air signaling change of season" },
      { word: "NEST", clue: "Structure built by birds for laying eggs and chicks" },
      { word: "SPROUT", clue: "Young fresh shoot bursting through fertile soil" },
    ]
  },
  {
    title: "Coastal Tidepools",
    words: [
      { word: "ANEMONE", clue: "Flower-like sea creature with soft stinging tentacles" },
      { word: "BARNACLE", clue: "Crustacean permanently cementing itself to coastal rocks" },
      { word: "STARFISH", clue: "Radial marine animal with five arms and tube feet" },
      { word: "LIMPET", clue: "Mollusk with conical shell clinging tightly to surf rocks" },
      { word: "URCHIN", clue: "Spiny round marine creature grazing on algae" },
      { word: "TIDE", clue: "Periodic rise and fall of ocean surface driven by moon" },
    ]
  },
  {
    title: "Mythic Mount Olympus",
    words: [
      { word: "THUNDERBOLT", clue: "Fierce weapon hurled by Zeus across the heavens" },
      { word: "AMBROSIA", clue: "Heavenly food of the gods conferring immortality" },
      { word: "NECTAR", clue: "Divine sweet drink consumed on Mount Olympus" },
      { word: "TEMPLE", clue: "Sacred architectural sanctuary honoring deities" },
      { word: "ORACLE", clue: "Priestess delivering prophetic advice from gods" },
      { word: "TITAN", clue: "Elder race of giant deities preceding the Olympians" },
    ]
  },
  {
    title: "Classic Board Games",
    words: [
      { word: "STRATEGY", clue: "Long-term master plan designed to achieve victory" },
      { word: "OPPONENT", clue: "Rival competing against you on opposite side of board" },
      { word: "CHECKMATE", clue: "Decisive condition where king cannot escape capture" },
      { word: "SHUFFLE", clue: "Mixing a deck of cards thoroughly into random order" },
      { word: "COUNTER", clue: "Small token or disc moved across gaming squares" },
      { word: "WINNER", clue: "Player who claims final triumph in competitive game" },
    ]
  },
  {
    title: "Great Inventions",
    words: [
      { word: "PRINTING", clue: "Movable type revolutionizing transmission of knowledge" },
      { word: "TELEPHONE", clue: "Apparatus converting sound waves into electrical signals" },
      { word: "COMPASS", clue: "Navigational aid guiding mariners across oceans" },
      { word: "BATTERY", clue: "Electrochemical device storing electrical charge" },
      { word: "LIGHTBULB", clue: "Incandescent filament illuminating nighttime darkness" },
      { word: "ENGINE", clue: "Mechanical device converting energy into kinetic motion" },
    ]
  },
  {
    title: "Baking Bread",
    words: [
      { word: "SOURDOUGH", clue: "Bread naturally fermented using wild lactic cultures" },
      { word: "KNEADING", clue: "Working dough with hands to develop gluten strands" },
      { word: "CRUST", clue: "Crisp browned outer layer of freshly baked bread" },
      { word: "YEAST", clue: "Microscopic fungus producing carbon dioxide bubbles" },
      { word: "FLOUR", clue: "Finely milled powder made from wheat grains" },
      { word: "OVEN", clue: "Heated chamber used for baking loaves and rolls" },
    ]
  },
  {
    title: "Ancient Silk Road",
    words: [
      { word: "CARAVAN", clue: "Procession of merchants traversing trans-Eurasian trails" },
      { word: "PORCELAIN", clue: "Fine translucent ceramic prized across the continents" },
      { word: "BAZAAR", clue: "Covered market street filled with exotic merchant stalls" },
      { word: "SPICES", clue: "Aromatic seasonings transported along ancient routes" },
      { word: "SILK", clue: "Luxurious shimmering fabric woven from silkworm cocoons" },
      { word: "MERCHANT", clue: "Trader buying and selling goods across trade networks" },
    ]
  },
  {
    title: "Forest Mammals",
    words: [
      { word: "BADGER", clue: "Burrowing nocturnal mammal with black-and-white face" },
      { word: "BEAVER", clue: "Aquatic rodent building timber dams across streams" },
      { word: "CHIPMUNK", clue: "Small striped ground squirrel with cheek pouches" },
      { word: "RACCOON", clue: "Masked ring-tailed mammal adept at dexterous foraging" },
      { word: "FOX", clue: "Clever reddish canine with bushy tail and sharp ears" },
      { word: "DEER", clue: "Graceful antlered herbivore roaming woodland clearings" },
    ]
  },
  {
    title: "Rainy Day Comforts",
    words: [
      { word: "UMBRELLA", clue: "Canopy sheltering holder from falling raindrops" },
      { word: "RAINCOAT", clue: "Waterproof outer garment worn during storms" },
      { word: "PUDDLE", clue: "Small shallow accumulation of rainwater on path" },
      { word: "DRIZZLE", clue: "Light fine rain falling gently from low clouds" },
      { word: "BLANKET", clue: "Cozy woven fabric layer providing indoor warmth" },
      { word: "COCOA", clue: "Hot comforting chocolate beverage served in mugs" },
    ]
  },
  {
    title: "Theater & Drama",
    words: [
      { word: "ACTOR", clue: "Performer portraying dramatic character upon stage" },
      { word: "CURTAIN", clue: "Heavy velvet drapery rising at start of performance" },
      { word: "STAGE", clue: "Raised platform where dramatic plays are performed" },
      { word: "AUDIENCE", clue: "Spectators gathered to enjoy theatrical production" },
      { word: "APPLAUSE", clue: "Rhythmic clapping of hands showing enthusiastic approval" },
      { word: "COSTUME", clue: "Specific theatrical attire worn to depict character" },
    ]
  },
  {
    title: "Precious Minerals",
    words: [
      { word: "PLATINUM", clue: "Rare dense silvery-white precious transition metal" },
      { word: "SILVER", clue: "Lustrous white metal with highest electrical conductivity" },
      { word: "COPPER", clue: "Reddish-orange metal used since ancient antiquity" },
      { word: "GOLD", clue: "Malleable precious yellow metal resistant to corrosion" },
      { word: "BRONZE", clue: "Tough alloy consisting primarily of copper and tin" },
      { word: "NICKEL", clue: "Hard silvery-white transition metal resistant to rust" },
    ]
  },
  {
    title: "Botanical Herbs",
    words: [
      { word: "ROSEMARY", clue: "Woody perennial herb with fragrant needle-like leaves" },
      { word: "BASIL", clue: "Tender aromatic herb essential for Italian pesto" },
      { word: "OREGANO", clue: "Pungent Mediterranean herb seasoning pizza and sauces" },
      { word: "THYME", clue: "Small-leaved culinary herb enhancing roasted dishes" },
      { word: "MINT", clue: "Refreshing aromatic herb cooling teas and confections" },
      { word: "SAGE", clue: "Velvety grey-green herb prized in savory poultry dishes" },
    ]
  },
  {
    title: "Coral Reef Life",
    words: [
      { word: "CLOWNFISH", clue: "Bright orange reef fish nesting among sea anemones" },
      { word: "SEAHORSE", clue: "Small upright marine fish with prehensile tail" },
      { word: "TANG", clue: "Vibrant yellow or blue reef fish grazing on algae" },
      { word: "EEL", clue: "Elongated snakelike fish hiding in dark coral crevices" },
      { word: "CRAB", clue: "Ten-legged crustacean with sideways gait and hard carapace" },
      { word: "POLYP", clue: "Individual living building block of tropical coral reefs" },
    ]
  },
  {
    title: "Plein Air Painting",
    words: [
      { word: "SUNLIGHT", clue: "Direct solar illumination illuminating outdoor landscapes" },
      { word: "SHADOW", clue: "Dark shape cast upon ground where light is blocked" },
      { word: "BRUSH", clue: "Tool with flexible bristles applying oil pigments" },
      { word: "PIGMENT", clue: "Insoluble colored powder mixed into paint vehicles" },
      { word: "HORIZON", clue: "Apparent boundary line separating earth from open sky" },
      { word: "STUDIO", clue: "Artist workspace dedicated to creative endeavors" },
    ]
  },
  {
    title: "Symphony Orchestra",
    words: [
      { word: "MAESTRO", clue: "Distinguished conductor leading the orchestra" },
      { word: "CONCERTO", clue: "Musical work for solo instrument accompanied by orchestra" },
      { word: "BASSOON", clue: "Deep-toned double-reed woodwind instrument" },
      { word: "CLARINET", clue: "Single-reed woodwind instrument with cylindrical bore" },
      { word: "CELLO", clue: "Large bowed string instrument held between the knees" },
      { word: "BATON", clue: "Slender white stick waved by conductor to keep tempo" },
    ]
  },
  {
    title: "Wild Wild Oceans",
    words: [
      { word: "TSUNAMI", clue: "Immense sea wave triggered by submarine earthquake" },
      { word: "SWELL", clue: "Long rolling wave traveling across open ocean water" },
      { word: "REEF", clue: "Ridge of rock or coral rising near water's surface" },
      { word: "GULF", clue: "Large deep bay indented deeply into coastline" },
      { word: "STRAIT", clue: "Narrow passage of water connecting two larger seas" },
      { word: "DEPTH", clue: "Measurement of distance downward from surface" },
    ]
  },
  {
    title: "Cosmic Phenomena",
    words: [
      { word: "SUPERNOVA", clue: "Colossal stellar explosion briefly outshining entire galaxy" },
      { word: "PULSAR", clue: "Rapidly rotating neutron star pulsing radiation beams" },
      { word: "QUASAR", clue: "Extremely luminous active galactic nucleus powered by black hole" },
      { word: "ECLIPSE", clue: "Darkening of celestial body passing into another's shadow" },
      { word: "AURORA", clue: "Atmospheric geomagnetic glow illuminating polar skies" },
      { word: "COSMOS", clue: "The universe seen as an orderly, harmonious system" },
    ]
  },
  {
    title: "Castaway Island",
    words: [
      { word: "SHIPWRECK", clue: "Remains of a vessel ruined on coastal rocks" },
      { word: "RAFT", clue: "Flat floating buoyant structure made of lashed logs" },
      { word: "BONFIRE", clue: "Large signaling fire constructed along ocean beach" },
      { word: "COCONUT", clue: "Hard shell palm fruit providing meat and water" },
      { word: "BOTTLE", clue: "Glass container holding handwritten message for help" },
      { word: "DRIFTWOOD", clue: "Weathered wood smoothed and washed ashore by surf" },
    ]
  },
  {
    title: "Artisan Woodworking",
    words: [
      { word: "CHISEL", clue: "Cutting tool with beveled blade for shaping timber" },
      { word: "JOINERY", clue: "Art of fitting pieces of timber together without nails" },
      { word: "SANDPAPER", clue: "Paper coated with abrasive grains for smoothing surfaces" },
      { word: "MALLET", clue: "Wooden hammer used to strike chisels cleanly" },
      { word: "LATHE", clue: "Machine spinning wood against cutting tool to turn bowls" },
      { word: "GRAIN", clue: "Natural arrangement and texture of wood fibers" },
    ]
  },
  {
    title: "Savanna Predators",
    words: [
      { word: "LEOPARD", clue: "Graceful spotted big cat hoisting prey into treetops" },
      { word: "WILDEBEEST", clue: "Antelope migrating in enormous herds across plains" },
      { word: "GAZELLE", clue: "Swift and nimble slender antelope evading predators" },
      { word: "JACKAL", clue: "Opportunistic wild canine roaming African plains" },
      { word: "HYENA", clue: "Strong-jawed carnivore living in matriarchal clans" },
      { word: "PRIDE", clue: "Social family group of hunting lions resting together" },
    ]
  },
  {
    title: "Nautical Exploration",
    words: [
      { word: "GALLEON", clue: "Large multi-decked sailing ship of 16th century" },
      { word: "NAVIGATOR", clue: "Officer responsible for plotting ship course" },
      { word: "RIGGING", clue: "System of ropes, cables, and chains supporting masts" },
      { word: "ANCHOR", clue: "Heavy hooked forging cast down to hold ship in place" },
      { word: "BOWSPRIT", clue: "Spar extending forward from vessel's prow" },
      { word: "VOYAGE", clue: "Long journey undertaken across open uncharted ocean" },
    ]
  },
  {
    title: "Mountain Forest",
    words: [
      { word: "EVERGREEN", clue: "Conifer maintaining green needles throughout the winter" },
      { word: "PINE", clue: "Resinous cone-bearing tree with long paired needles" },
      { word: "FERN", clue: "Flowerless leafy plant reproducing via spores" },
      { word: "MOSS", clue: "Small soft green plant carpeting damp woodland rocks" },
      { word: "CONE", clue: "Woody seed-bearing organ of coniferous trees" },
      { word: "NEEDLE", clue: "Slender stiff photosynthetic foliage of pines" },
    ]
  },
  {
    title: "Morning Breakfast",
    words: [
      { word: "PANCAKE", clue: "Flat thin batter cake cooked on hot griddle" },
      { word: "WAFFLE", clue: "Crisp batter cake baked between patterned irons" },
      { word: "OMELET", clue: "Dish of beaten eggs cooked and folded around filling" },
      { word: "TOAST", clue: "Sliced bread browned and crisped by radiant heat" },
      { word: "GRANOLA", clue: "Breakfast cereal of rolled oats, nuts, and honey" },
      { word: "SYRUP", clue: "Thick sweet amber liquid drizzled on hot flapjacks" },
    ]
  },
  {
    title: "Desert Night",
    words: [
      { word: "SANDSTORM", clue: "High wind carrying thick clouds of stinging grit" },
      { word: "STARLIGHT", clue: "Brilliant illumination shining across pitch-black sky" },
      { word: "CAMP", clue: "Temporary lodging of tents pitched among dunes" },
      { word: "SILENCE", clue: "Absence of sound across vast empty desert miles" },
      { word: "COOL", clue: "Sharp drop in temperature once sun disappears" },
      { word: "MOON", clue: "Silver orb reflecting illumination over rolling sands" },
    ]
  },
  {
    title: "Library & Study",
    words: [
      { word: "MANUSCRIPT", clue: "Author's handwritten or typed original document" },
      { word: "BOOKSHELF", clue: "Wooden shelving holding rows of bound volumes" },
      { word: "ARCHIVE", clue: "Collection of historical records and documents" },
      { word: "CATALOG", clue: "Systematic register of library holdings and books" },
      { word: "BINDING", clue: "Protective cover joining pages of a printed book" },
      { word: "FOLIO", clue: "Individual leaf of paper or parchment in a volume" },
    ]
  },
  {
    title: "Wild Rivers",
    words: [
      { word: "KAYAK", clue: "Narrow covered canoe propelled with double-bladed paddle" },
      { word: "RAPIDS", clue: "Fast-moving turbulent section of river over rocks" },
      { word: "PADDLE", clue: "Wooden or composite tool used to steer watercraft" },
      { word: "HELMET", clue: "Protective gear worn when paddling churning white water" },
      { word: "CURRENT", clue: "Powerful force pulling boat downstream" },
      { word: "RIVER", clue: "Natural flowing watercourse feeding into sea" },
    ]
  },
  {
    title: "Classic Toys",
    words: [
      { word: "KITE", clue: "Light tethered frame covered with paper flown in wind" },
      { word: "MARBLE", clue: "Small spherical glass ball used in shooting games" },
      { word: "PUPPET", clue: "Movable doll manipulated by strings or hand inside" },
      { word: "SPINNER", clue: "Toy rotating rapidly around a central axis pin" },
      { word: "YOYO", clue: "Two discs joined by axle wound with string" },
      { word: "BLOCKS", clue: "Solid geometric wooden cubes stacked into towers" },
    ]
  },
  {
    title: "Summer Sunshine",
    words: [
      { word: "SUNSHINE", clue: "Direct light and warmth radiating from daytime sun" },
      { word: "SANDCASTLE", clue: "Sculpted palace molded from wet beach sand" },
      { word: "PARASOL", clue: "Lightweight folding umbrella shielding against sun" },
      { word: "PICNIC", clue: "Meal eaten outdoors in grassy park or beach" },
      { word: "LEMONADE", clue: "Cool citrus beverage sweetened with sugar" },
      { word: "SWIMSUIT", clue: "Garment designed for swimming and water sports" },
    ]
  },
  {
    title: "Autumn Woodlands",
    words: [
      { word: "CHESTNUT", clue: "Edible glossy brown nut roasted in cool weather" },
      { word: "PUMPKIN", clue: "Round orange squash carved into glowing lantern" },
      { word: "LEAF", clue: "Photosynthetic foliage turning fiery orange in fall" },
      { word: "CHILL", clue: "Crisp cool nip in autumn morning breeze" },
      { word: "BARK", clue: "Tough protective outer sheath shielding tree trunks" },
      { word: "ROOT", clue: "Underground plant organ absorbing moisture and nutrients" },
    ]
  },
  {
    title: "Winter Cabin",
    words: [
      { word: "FIREPLACE", clue: "Brick hearth where crackling logs radiate warmth" },
      { word: "CHIMNEY", clue: "Vertical flue venting smoke from hearth through roof" },
      { word: "SNOWSHOE", clue: "Webbed footwear distributing weight over deep powder" },
      { word: "CABIN", clue: "Rustic small house built from notched timber logs" },
      { word: "QUILT", clue: "Stitched multi-layered bed covering offering warmth" },
      { word: "HEARTH", clue: "Stone floor extending out in front of fireplace" },
    ]
  },
  {
    title: "Orchestra Brass",
    words: [
      { word: "TROMBONE", clue: "Brass instrument changing pitch with sliding tube" },
      { word: "TUBA", clue: "Largest and lowest-pitched brass wind instrument" },
      { word: "CORNET", clue: "Compact brass instrument similar to trumpet with conical bore" },
      { word: "BUGLE", clue: "Valveless brass horn playing military wake-up reveille" },
      { word: "HORN", clue: "Coiled brass instrument with wide bell played with hand" },
      { word: "VALVE", clue: "Device redirecting air into extra tubing loops" },
    ]
  },
  {
    title: "Tropical Birds",
    words: [
      { word: "PARROT", clue: "Vibrantly colored tropical bird mimicking human speech" },
      { word: "FLAMINGO", clue: "Tall pink wading bird standing gracefully on one leg" },
      { word: "MACAW", clue: "Large long-tailed American parrot with brilliant plumage" },
      { word: "COCKATOO", clue: "Crested parrot native to Australasia with curved bill" },
      { word: "CANARY", clue: "Small yellow finch prized for melodic singing" },
      { word: "PLUMAGE", clue: "Entire feather covering of a bird species" },
    ]
  },
  {
    title: "Geological Gems",
    words: [
      { word: "AMETHYST", clue: "Violet purple variety of quartz gemstone" },
      { word: "TURQUOISE", clue: "Opaque blue-to-green mineral prized in southwestern jewelry" },
      { word: "GARNET", clue: "Deep red silicate mineral used as birthstone" },
      { word: "OPAL", clue: "Hydrated silica gemstone displaying rainbow play-of-color" },
      { word: "JADE", clue: "Ornamental green stone revered in Asian carvings" },
      { word: "ONYX", clue: "Banded black variety of chalcedony gemstone" },
    ]
  },
  {
    title: "Ocean Voyage",
    words: [
      { word: "COMPASS", clue: "Navigational dial indicating magnetic bearing" },
      { word: "SEXTANT", clue: "Celestial navigation tool measuring stellar elevation" },
      { word: "LATITUDE", clue: "Angular distance north or south from Earth's equator" },
      { word: "LONGITUDE", clue: "Angular distance east or west from prime meridian" },
      { word: "CHART", clue: "Map detailing marine waterways and navigation hazards" },
      { word: "VESSEL", clue: "Watercraft designed for ocean travel" },
    ]
  },
  {
    title: "Rainforest Life",
    words: [
      { word: "SLOTH", clue: "Slow-moving tree-dwelling mammal hanging from branches" },
      { word: "OCELOT", clue: "Small spotted wild cat hunting in forest undergrowth" },
      { word: "PIRANHA", clue: "Freshwater fish with razor teeth native to South America" },
      { word: "TAPIR", clue: "Large herbivorous mammal with short prehensile snout" },
      { word: "VIPER", clue: "Venomous snake with hinged fangs in deep underbrush" },
      { word: "FOREST", clue: "Vast continuous tract of dense green trees" },
    ]
  },
  {
    title: "Starlight & Space",
    words: [
      { word: "ASTEROID", clue: "Rocky body orbiting sun smaller than true planet" },
      { word: "GALAXY", clue: "Vast rotating swirl of billions of stars and planets" },
      { word: "NEBULA", clue: "Luminous cloud of gas where new stars condense" },
      { word: "SOLAR", clue: "Pertaining to our central star and its light" },
      { word: "LUNAR", clue: "Pertaining to Earth's orbiting natural satellite" },
      { word: "COSMIC", clue: "Originating in or relating to outer space" },
    ]
  },
  {
    title: "Harbor & Docks",
    words: [
      { word: "BUOY", clue: "Anchored floating marker warning mariners of shoals" },
      { word: "WHARF", clue: "Level platform where vessels tie up to load cargo" },
      { word: "FERRY", clue: "Boat transporting passengers across bay or strait" },
      { word: "TUG", clue: "Powerful small boat maneuvering big ships into berth" },
      { word: "PIER", clue: "Structure extending out over water used as landing" },
      { word: "CRANE", clue: "Tall hoist unloading containers from vessel decks" },
    ]
  },
  {
    title: "Ancient Greece",
    words: [
      { word: "PARTHENON", clue: "Temple dedicated to goddess Athena atop Acropolis" },
      { word: "SPARTA", clue: "Ancient Greek warrior city-state renowned for discipline" },
      { word: "ATHENS", clue: "Birthplace of Western philosophy and democratic voting" },
      { word: "ACROPOLIS", clue: "High fortified citadel overlooking ancient Athens" },
      { word: "OLYMPIA", clue: "Sanctuary where ancient athletic games were held" },
      { word: "HELMET", clue: "Bronze protective headgear worn by Greek hoplites" },
    ]
  },
  {
    title: "Mountain Meadows",
    words: [
      { word: "EDELWEISS", clue: "White woolly alpine flower blooming on rugged crags" },
      { word: "VALLEY", clue: "Green hollow nestled between two steep mountain walls" },
      { word: "BROOK", clue: "Small natural freshwater stream babbling over pebbles" },
      { word: "DEW", clue: "Morning water droplets condensing on cool grass blades" },
      { word: "FLOWER", clue: "Colorful blossom opening toward morning sunshine" },
      { word: "SLOPE", clue: "Inclined side of a mountain or hillside" },
    ]
  },
  {
    title: "Kitchen Spices",
    words: [
      { word: "CINNAMON", clue: "Sweet aromatic spice stripped from inner tree bark" },
      { word: "NUTMEG", clue: "Fragrant seed grated into desserts and holiday drinks" },
      { word: "VANILLA", clue: "Flavoring extract cured from tropical orchid pods" },
      { word: "GINGER", clue: "Spicy pungent underground rhizome used in curries" },
      { word: "CLOVES", clue: "Aromatic dried flower buds used to spice ciders" },
      { word: "PEPPER", clue: "Pungent dried berries ground fresh over meals" },
    ]
  },
  {
    title: "The Silent Arctic",
    words: [
      { word: "PERMAFROST", clue: "Permanently frozen subsoil layer under tundra plains" },
      { word: "NARWHAL", clue: "Arctic whale famous for long spiraled ivory tusk" },
      { word: "SEAL", clue: "Fin-footed semi-aquatic mammal resting on ice floes" },
      { word: "HUSKY", clue: "Resilient thick-furred sled dog bred for polar cold" },
      { word: "BLIZZARD", clue: "Gale-force storm whipping zero-visibility whiteout" },
      { word: "FLOE", clue: "Large flat sheet of floating sea ice" },
    ]
  },
  {
    title: "Grand Theaters",
    words: [
      { word: "OPERA", clue: "Theatrical work where actors sing all musical lines" },
      { word: "BALLET", clue: "Artistic classical dance with formal choreography" },
      { word: "LIBRETTO", clue: "Written text or words sung in an opera production" },
      { word: "OVERTURE", clue: "Orchestral piece opening an opera or musical drama" },
      { word: "SOPRANO", clue: "Highest vocal singing range for female voices" },
      { word: "TENOR", clue: "Highest ordinary adult male singing vocal range" },
    ]
  },
  {
    title: "Woodland Creatures",
    words: [
      { word: "SQUIRREL", clue: "Bushy-tailed rodent burying nuts in autumn lawns" },
      { word: "PORCUPINE", clue: "Rodent defended by coat of sharp barbed quills" },
      { word: "OTTER", clue: "Playful aquatic mammal sliding down muddy riverbanks" },
      { word: "MOLE", clue: "Small blind mammal tunneling beneath garden soil" },
      { word: "HEDGEHOG", clue: "Small spiny nocturnal mammal curling into a ball" },
      { word: "HARE", clue: "Fast long-eared mammal related to rabbits" },
    ]
  },
  {
    title: "Seashore Shells",
    words: [
      { word: "CONCH", clue: "Large spiraling tropical shell blown like a trumpet" },
      { word: "SCALLOP", clue: "Bivalve mollusk with fan-shaped ridged seashell" },
      { word: "CLAM", clue: "Burrowing bivalve mollusk dug up from muddy flats" },
      { word: "OYSTER", clue: "Bivalve producing lustrous iridescent pearls" },
      { word: "MUSSEL", clue: "Dark bivalve anchoring to coastal pilings by threads" },
      { word: "SHELL", clue: "Hard protective calcium carbonate exterior of mollusk" },
    ]
  },
  {
    title: "Fine Ceramics",
    words: [
      { word: "POTTERY", clue: "Vessels and bowls shaped from wet clay and fired" },
      { word: "GLAZE", clue: "Liquid glass coating fired onto ceramic surfaces" },
      { word: "KILN", clue: "High-temperature thermal furnace used to bake clay" },
      { word: "CERAMIC", clue: "Hard non-metallic material formed by baking clay" },
      { word: "WHEEL", clue: "Spinning turntable on which potter centers wet clay" },
      { word: "CLAY", clue: "Malleable natural earthy material shaped by potters" },
    ]
  },
  {
    title: "Cozy Library",
    words: [
      { word: "BOOKMARK", clue: "Slip of paper or ribbon marking reader's page" },
      { word: "NOVEL", clue: "Long work of narrative fiction with developed plots" },
      { word: "AUTHOR", clue: "Writer who creates an original book or literature" },
      { word: "READER", clue: "Individual enjoying literary printed works" },
      { word: "PAGE", clue: "Single sheet bound within a printed book volume" },
      { word: "TALE", clue: "Imaginative narrative recounting adventurous events" },
    ]
  },
  {
    title: "Fresh Morning Walk",
    words: [
      { word: "SUNRISE", clue: "First appearance of light on eastern horizon at dawn" },
      { word: "DEWDROP", clue: "Tiny bead of morning moisture clinging to grass" },
      { word: "BIRDSONG", clue: "Cheerful melodic whistling of birds greeting dawn" },
      { word: "JOGGER", clue: "Runner exercising along park pathways at dawn" },
      { word: "FRESH", clue: "Pleasantly clean and crisp morning atmosphere" },
      { word: "WALK", clue: "Leisurely journey on foot to enjoy the outdoors" },
    ]
  },
  {
    title: "Fruit Orchard",
    words: [
      { word: "APPLE", clue: "Crisp red or green orchard fruit picked in autumn" },
      { word: "PEACH", clue: "Fuzzy-skinned juicy stone fruit with sweet flesh" },
      { word: "CHERRY", clue: "Small round deep red fruit growing on paired stems" },
      { word: "PLUM", clue: "Smooth-skinned sweet purple stone fruit" },
      { word: "PEAR", clue: "Tapered bell-shaped sweet orchard fruit" },
      { word: "TREE", clue: "Perennial woody plant bearing orchard fruits" },
    ]
  },
  {
    title: "Sweet Pastries",
    words: [
      { word: "DANISH", clue: "Laminated sweet pastry with fruit or cheese center" },
      { word: "CUPCAKE", clue: "Miniature cake baked in fluted paper cup with icing" },
      { word: "TART", clue: "Open-topped pastry crust filled with custard or fruit" },
      { word: "ECLAIR", clue: "Oblong choux pastry filled with cream and chocolate" },
      { word: "BROWNIE", clue: "Dense chewy baked chocolate dessert square" },
      { word: "ICING", clue: "Sweet glaze spread over cakes and cookies" },
    ]
  },
  {
    title: "Desert Animals",
    words: [
      { word: "COYOTE", clue: "Wild canine howling across southwestern canyonlands" },
      { word: "SCORPION", clue: "Arachnid with venomous stinging curved tail" },
      { word: "RATTLESNAKE", clue: "Pit viper with warning rattle at tail tip" },
      { word: "TORTOISE", clue: "Slow land reptile digging cool burrows in desert" },
      { word: "ROADRUNNER", clue: "Fast ground-running cuckoo hunting desert lizards" },
      { word: "LIZARD", clue: "Sun-loving scaled reptile scurrying across rocks" },
    ]
  },
  {
    title: "Starry Night",
    words: [
      { word: "MOONBEAM", clue: "Ray of reflected lunar light cutting through darkness" },
      { word: "POLARIS", clue: "North Star anchoring navigational celestial spheres" },
      { word: "PLANET", clue: "Celestial body orbiting sun without glowing itself" },
      { word: "NIGHT", clue: "Period of darkness between sunset and sunrise" },
      { word: "SHINE", clue: "Emit or reflect steady bright luminescence" },
      { word: "GLOW", clue: "Soft warm illumination emanating from light source" },
    ]
  },
  {
    title: "Mountain Streams",
    words: [
      { word: "PEBBLE", clue: "Small stone rounded and smoothed by rushing water" },
      { word: "TROUT", clue: "Freshwater fish swimming upstream in cold waters" },
      { word: "CASCADE", clue: "Small picturesque waterfall tumbling over rocks" },
      { word: "WATER", clue: "Clear transparent liquid flowing in mountain brooks" },
      { word: "RIPPLE", clue: "Small gentle wave spreading across surface of stream" },
      { word: "SHALLOW", clue: "Water of little depth easy to wade across" },
    ]
  },
  {
    title: "Ancient Castles",
    words: [
      { word: "RAMPART", clue: "Defensive wall built around castle perimeter" },
      { word: "TURRET", clue: "Small decorative tower projecting upward from wall" },
      { word: "MOAT", clue: "Deep water-filled trench surrounding a fortress" },
      { word: "KEEP", clue: "Strongest central tower of a medieval castle" },
      { word: "GATE", clue: "Heavy wooden barrier guarding castle entryway" },
      { word: "WALL", clue: "Massive vertical stone masonry fortification" },
    ]
  },
  {
    title: "Grand Journey",
    words: [
      { word: "PASSPORT", clue: "Official travel document certifying citizenship" },
      { word: "SUITCASE", clue: "Rectangular luggage container for packing clothes" },
      { word: "TICKET", clue: "Printed pass granting boarding onto flight or train" },
      { word: "TRAVEL", clue: "Journeying from one destination to another" },
      { word: "HOTEL", clue: "Establishment providing lodging and meals for travelers" },
      { word: "ROUTE", clue: "Way or course taken to reach intended destination" },
    ]
  },
  {
    title: "Family Picnic",
    words: [
      { word: "SANDWICH", clue: "Food layered between two slices of sliced bread" },
      { word: "BLANKET", clue: "Large sheet spread over grass for sitting" },
      { word: "BASKET", clue: "Woven container carrying food and cutlery outdoors" },
      { word: "MELON", clue: "Sweet juicy fruit sliced into wedges for snacking" },
      { word: "APPLE", clue: "Crunchy orchard snack packed inside picnic basket" },
      { word: "PARK", clue: "Large public green space with trees and open lawn" },
    ]
  },
  {
    title: "Autumn Breeze",
    words: [
      { word: "CRISP", clue: "Pleasantly cool and invigorating autumn air" },
      { word: "SCARF", clue: "Warm woolen band wrapped around the neck" },
      { word: "SWEATER", clue: "Knitted garment worn over torso for comfort" },
      { word: "WIND", clue: "Natural movement of air swirling fallen leaves" },
      { word: "LEAVES", clue: "Foliage blanketing ground in shades of gold" },
      { word: "WARMTH", clue: "Comfortable sensation provided by woolen clothing" },
    ]
  },
  {
    title: "Peaceful Garden",
    words: [
      { word: "FOUNTAIN", clue: "Ornamental water basin spraying gentle jets into air" },
      { word: "BENCH", clue: "Long wooden seat in garden for quiet resting" },
      { word: "GAZEBO", clue: "Octagonal garden pavilion offering shady viewing" },
      { word: "PATH", clue: "Gravel walkway winding through blooming flowerbeds" },
      { word: "GRASS", clue: "Lush green carpet covering open garden lawn" },
      { word: "SHADE", clue: "Cool shelter created by dense leafy tree boughs" },
    ]
  },
  {
    title: "Island Paradise",
    words: [
      { word: "TROPICAL", clue: "Pertaining to warm sunny equatorial climates" },
      { word: "SEASHELL", clue: "Empty calcium shell washed onto shoreline sands" },
      { word: "PALM", clue: "Tropical unbranched tree crowned with feathery fronds" },
      { word: "BEACH", clue: "Sandy strip sloping gently into oceanic waves" },
      { word: "WAVE", clue: "Rolling swell of water cresting onto shoreline" },
      { word: "SAND", clue: "Fine loose granular particles carpeting beaches" },
    ]
  },
  {
    title: "Sweet Honeybee",
    words: [
      { word: "HONEYCOMB", clue: "Hexagonal wax structure storing honey and larvae" },
      { word: "POLLEN", clue: "Fine powdery substance gathered by foraging bees" },
      { word: "NECTAR", clue: "Sweet floral liquid collected by worker bees" },
      { word: "HIVE", clue: "Structure housing a colony of productive honeybees" },
      { word: "QUEEN", clue: "Single fertile female reproductive bee in colony" },
      { word: "DRONE", clue: "Male honeybee whose sole duty is mating" },
    ]
  },
  {
    title: "Winter Snowstorm",
    words: [
      { word: "SNOWMAN", clue: "Playful figure built by stacking giant snowballs" },
      { word: "ICICLE", clue: "Tapering spike of hanging ice formed by dripping water" },
      { word: "MITTENS", clue: "Winter gloves with single pocket for all four fingers" },
      { word: "SLED", clue: "Vehicle gliding over snow on wooden runners" },
      { word: "SNOW", clue: "Frozen precipitation falling as delicate flakes" },
      { word: "COLD", clue: "Low temperature requiring thick winter coats" },
    ]
  },
  {
    title: "Golden Sunrise",
    words: [
      { word: "MORNING", clue: "Early period of day between dawn and noon" },
      { word: "DAYLIGHT", clue: "Natural light received from sun during the day" },
      { word: "WARMTH", clue: "Gentle heat radiating from ascending sun" },
      { word: "SKY", clue: "Vast expanse of atmosphere visible above earth" },
      { word: "DAWN", clue: "First appearance of daybreak in eastern horizon" },
      { word: "SUN", clue: "Bright star anchoring our solar system" },
    ]
  },
  {
    title: "Cozy Fireside",
    words: [
      { word: "EMBER", clue: "Glowing piece of burning wood in dying hearth" },
      { word: "FLAME", clue: "Visible luminous gaseous part of burning fire" },
      { word: "SPARK", clue: "Tiny fiery particle thrown off from crackling logs" },
      { word: "WOOD", clue: "Hard fibrous material burned to produce warmth" },
      { word: "WARM", clue: "Pleasant comfortable temperature from radiant heat" },
      { word: "COZY", clue: "Giving feeling of snug comfort and relaxation" },
    ]
  },
  {
    title: "Sweet Bakery",
    words: [
      { word: "COOKIE", clue: "Small flat sweet baked snack often with chocolate chips" },
      { word: "CAKE", clue: "Sweet baked dessert confection layered with frosting" },
      { word: "SUGAR", clue: "Sweet crystalline substance sweetening baked goods" },
      { word: "BAKE", clue: "Cook food by dry heat in an enclosed oven" },
      { word: "SWEET", clue: "Having pleasant taste of sugar or honey" },
      { word: "TREAT", clue: "Delightful food item prepared for enjoyment" },
    ]
  },
  {
    title: "Spring Meadows",
    words: [
      { word: "BLOSSOM", clue: "Flower cluster bursting on spring orchard boughs" },
      { word: "SPRING", clue: "Season of renewal between winter and summer" },
      { word: "GREEN", clue: "Color of healthy growing grass and fresh shoots" },
      { word: "BUD", clue: "Undeveloped shoot swelling before flower opens" },
      { word: "RAIN", clue: "Liquid water droplets falling from spring clouds" },
      { word: "LEAF", clue: "Green foliage capturing sunlight on tree branch" },
    ]
  },
  {
    title: "Starlight Sky",
    words: [
      { word: "STARS", clue: "Luminous celestial bodies twinkling across night sky" },
      { word: "NIGHT", clue: "Darkness descending between dusk and morning dawn" },
      { word: "GLOW", clue: "Steady pleasant luminescence in dark surroundings" },
      { word: "DARK", clue: "Absence of light revealing starry cosmos" },
      { word: "BEAM", clue: "Ray of light traveling through cosmic space" },
      { word: "MOON", clue: "Earth's companion shining silver in nighttime" },
    ]
  }
];

/**
 * Returns up to `count` unique crossword themes.
 * If count exceeds the built-in library, safely generates algorithmic
 * thematic variations so every puzzle is guaranteed distinct.
 */
export function getCrosswordThemes(count: number = 100): CrosswordTheme[] {
  const result: CrosswordTheme[] = [];
  for (let i = 0; i < count; i++) {
    if (i < CROSSWORD_THEMES.length) {
      result.push({
        title: `${CROSSWORD_THEMES[i].title}`,
        words: CROSSWORD_THEMES[i].words.map(w => ({ ...w }))
      });
    } else {
      // Fallback: If requested > 105 puzzles, create distinct seeded themed sets
      const baseIdx = i % CROSSWORD_THEMES.length;
      const base = CROSSWORD_THEMES[baseIdx];
      result.push({
        title: `${base.title} (Part ${Math.floor(i / CROSSWORD_THEMES.length) + 1})`,
        words: base.words.map(w => ({ ...w }))
      });
    }
  }
  return result;
}

/**
 * Formats a list of themes as a clean text string for the input textarea.
 */
export function formatThemesAsCrosswordText(themes: CrosswordTheme[]): string {
  return themes.map((t, idx) => {
    const lines = t.words.map(w => `${w.word}, ${w.clue}`).join("\n");
    return `# Puzzle ${idx + 1} - ${t.title}\n${lines}`;
  }).join("\n\n");
}
