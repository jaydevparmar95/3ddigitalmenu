/**
 * Intelligent Multi-Cuisine AI Food Photography Engine
 * Automatically detects dish cuisine/flavor profile from dish name and synthesizes
 * photorealistic AI renders + high-definition authentic culinary photography options.
 */

export interface AIGeneratedImageOption {
  id: string;
  url: string;
  label: string;
  prompt: string;
  cuisineTag?: string;
}

interface CuisineProfile {
  cuisine: string;
  promptTemplate: string;
  sampleImages: string[];
}

// Curated High-Definition Food Photography Collections by Cuisine & Dish Types
const CUISINE_KNOWLEDGE_BASE: Record<string, CuisineProfile> = {
  chinese: {
    cuisine: "Chinese & Pan-Asian Wok",
    promptTemplate:
      "Award-winning commercial food photography of authentic Asian {name}, sizzling wok-tossed with fresh scallions, vibrant bell peppers, rich aromatic dark soy and chili garlic glaze, steaming hot, dark slate tabletop, studio lighting, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80", // Noodles wok
      "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80", // Dim sums
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80", // Asian soup / bowl
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", // Fried rice
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80", // Ramen / Noodles
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80", // Dumplings
    ],
  },
  vadapav: {
    cuisine: "Mumbai Street Food & Snacks",
    promptTemplate:
      "Award-winning commercial food photography of authentic Indian {name}, golden crispy spiced potato fritter inside fresh soft ladi pav, sprinkled with spicy dry garlic red coconut chutney and salted fried green chili, rustic wooden board, cinematic lighting, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Street samosa / vada
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", // Indian fried snack
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", // Samosa / Pav
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", // Street snack
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80", // Pav bhaji / curry
    ],
  },
  pakodi: {
    cuisine: "Delhi Chaat & Crispy Fritters",
    promptTemplate:
      "Award-winning commercial food photography of authentic Indian {name}, golden crispy crunchy batter fritters, garnished with fresh mint coriander green chutney and tangy tamarind dip, vibrant traditional ceramic plate, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", // Crispy pakoras
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", // Chaat / snack
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Fried fritters
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", // Crispy snacks
    ],
  },
  pizza: {
    cuisine: "Artisanal Woodfired Pizza & Italian",
    promptTemplate:
      "Award-winning commercial food photography of artisanal woodfired {name}, bubbling hot melted mozzarella cheese stretch, golden blistered sourdough crust, fragrant fresh basil leaves, rich San Marzano tomato sauce, rustic wood board, cinematic pizzeria lighting, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", // Margherita pizza
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", // Gourmet pizza
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", // Fresh slice
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", // Pepperoni / spicy pizza
      "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80", // Woodfired oven pizza
    ],
  },
  pasta: {
    cuisine: "Gourmet Pastas & Starters",
    promptTemplate:
      "Award-winning commercial food photography of freshly prepared {name}, al dente pasta tossed in rich velvety sauce, shaved aged parmesan cheese, cracked black pepper, fresh herb garnish, elegant fine-dining ceramic bowl, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80", // Penne pasta
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80", // Creamy pasta
      "https://images.unsplash.com/photo-1536964549204-cce9eab227bd?auto=format&fit=crop&w=600&q=80", // Spaghetti
      "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=600&q=80", // Garlic bread / starter
    ],
  },
  burger: {
    cuisine: "Gourmet Burgers & Fast Bites",
    promptTemplate:
      "Award-winning commercial food photography of gourmet {name}, toasted brioche bun, juicy grilled patty, melted cheddar cheese cascade, crisp lettuce, sliced heirloom tomato, golden seasoned fries on side, studio food styling, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", // Burger
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80", // Cheeseburger
      "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80", // Crispy fries
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", // Burger with fries
    ],
  },
  beverage: {
    cuisine: "Artisanal Beverages & Shakes",
    promptTemplate:
      "Award-winning commercial beverage photography of refreshing chilled {name}, glistening condensation droplets on frosted tall glassware, vibrant fresh mint and citrus slice garnish, dramatic backlit studio lighting, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", // Mocktail / cocktail
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", // Milkshake
      "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80", // Iced drink
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80", // Artisanal coffee
      "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80", // Hot spiced tea / chai
    ],
  },
  dessert: {
    cuisine: "Decadent Desserts & Sweets",
    promptTemplate:
      "Award-winning dessert photography of gourmet {name}, rich glistening chocolate sauce drizzle or crushed pistachios, delicate powdered sugar dusting, fine-dining porcelain plating, warm ambient rim lighting, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", // Chocolate brownie / lava
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80", // Cake / pastry
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", // Tiramisu / dessert
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80", // Ice cream sundae
    ],
  },
  curry_indian: {
    cuisine: "Aromatic Indian Curries & Gravies",
    promptTemplate:
      "Award-winning commercial food photography of authentic Indian {name}, rich aromatic velvety spiced gravy with swirl of fresh cream and coriander, served in traditional hammered copper handi alongside hot butter naan, 8k resolution",
    sampleImages: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80", // Paneer butter masala / curry
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80", // Biryani / Rice
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80", // Indian thali / gravy
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Tikka / starter
    ],
  },
};

/**
 * Automatically detects the culinary profile and cuisine category from dish name
 */
export function detectCuisineFromDishName(name: string, category: string = ""): CuisineProfile {
  const q = `${name} ${category}`.toLowerCase();

  // 1. Chinese / Asian check
  if (
    q.includes("noodle") ||
    q.includes("hakka") ||
    q.includes("manchurian") ||
    q.includes("fried rice") ||
    q.includes("dimsum") ||
    q.includes("momo") ||
    q.includes("spring roll") ||
    q.includes("wonton") ||
    q.includes("schezwan") ||
    q.includes("soup") ||
    q.includes("chilli paneer") ||
    q.includes("chinese") ||
    q.includes("wok")
  ) {
    return CUISINE_KNOWLEDGE_BASE.chinese;
  }

  // 2. Vadapav / Mumbai Street Snacks
  if (
    q.includes("vada") ||
    q.includes("pav") ||
    q.includes("misal") ||
    q.includes("dabeli") ||
    q.includes("batata") ||
    q.includes("bun") ||
    q.includes("samosa")
  ) {
    return CUISINE_KNOWLEDGE_BASE.vadapav;
  }

  // 3. Pakodi / Delhi Chaat
  if (
    q.includes("pakodi") ||
    q.includes("pakora") ||
    q.includes("bhajia") ||
    q.includes("chaat") ||
    q.includes("pani puri") ||
    q.includes("golgappe") ||
    q.includes("tikki") ||
    q.includes("sev puri") ||
    q.includes("dahi bhalla") ||
    q.includes("fritter")
  ) {
    return CUISINE_KNOWLEDGE_BASE.pakodi;
  }

  // 4. Pizza
  if (q.includes("pizza") || q.includes("margherita") || q.includes("calzone") || q.includes("woodfired")) {
    return CUISINE_KNOWLEDGE_BASE.pizza;
  }

  // 5. Pasta
  if (q.includes("pasta") || q.includes("penne") || q.includes("spaghetti") || q.includes("lasagna") || q.includes("garlic bread")) {
    return CUISINE_KNOWLEDGE_BASE.pasta;
  }

  // 6. Burgers & Fries
  if (q.includes("burger") || q.includes("fries") || q.includes("sandwich") || q.includes("wrap") || q.includes("roll")) {
    return CUISINE_KNOWLEDGE_BASE.burger;
  }

  // 7. Beverages / Drinks
  if (
    q.includes("shake") ||
    q.includes("coffee") ||
    q.includes("tea") ||
    q.includes("chai") ||
    q.includes("juice") ||
    q.includes("mojito") ||
    q.includes("lassi") ||
    q.includes("mocktail") ||
    q.includes("soda") ||
    q.includes("beverage")
  ) {
    return CUISINE_KNOWLEDGE_BASE.beverage;
  }

  // 8. Desserts
  if (
    q.includes("cake") ||
    q.includes("ice cream") ||
    q.includes("brownie") ||
    q.includes("sweet") ||
    q.includes("halwa") ||
    q.includes("jamun") ||
    q.includes("kulfi") ||
    q.includes("tiramisu") ||
    q.includes("dessert")
  ) {
    return CUISINE_KNOWLEDGE_BASE.dessert;
  }

  // 9. North Indian / Curries / Gravies / Biryani
  if (
    q.includes("paneer") ||
    q.includes("curry") ||
    q.includes("biryani") ||
    q.includes("dal") ||
    q.includes("masala") ||
    q.includes("gravy") ||
    q.includes("naan") ||
    q.includes("roti") ||
    q.includes("tikka")
  ) {
    return CUISINE_KNOWLEDGE_BASE.curry_indian;
  }

  // Default fallback
  return CUISINE_KNOWLEDGE_BASE.pizza;
}

/**
 * Generates an optimized AI prompt tailored to the dish name
 */
export function generateFoodImagePrompt(name: string, description: string, category: string): { prompt: string; cuisine: string } {
  const profile = detectCuisineFromDishName(name, category);
  const cleanName = name.trim() || "Delicious Gourmet Dish";
  const prompt = profile.promptTemplate.replace("{name}", cleanName);
  return { prompt, cuisine: profile.cuisine };
}

/**
 * Generates an AI Image URL via Pollinations
 */
export function generateAIImageUrl(prompt: string, seed: number = 42): string {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&seed=${seed}&nologo=true&enhance=true`;
}

/**
 * Generates 4 real-time, highly relevant food image candidates matching the dish name
 */
export function getAIImageOptions(
  name: string,
  description: string = "",
  category: string = ""
): { options: AIGeneratedImageOption[]; cuisineTag: string } {
  const cleanName = name.trim() || "Chef Specialty";
  const { prompt, cuisine } = generateFoodImagePrompt(cleanName, description, category);
  const profile = detectCuisineFromDishName(cleanName, category);

  const seed1 = Math.floor(Math.random() * 10000) + 1;
  const seed2 = Math.floor(Math.random() * 10000) + 2000;

  // Pick 2 diverse HD curated shots from the detected cuisine collection
  const images = [...profile.sampleImages].sort(() => 0.5 - Math.random());
  const curated1 = images[0] || profile.sampleImages[0];
  const curated2 = images[1] || profile.sampleImages[1] || profile.sampleImages[0];

  const options: AIGeneratedImageOption[] = [
    {
      id: "ai-hero-render",
      url: generateAIImageUrl(`${prompt}, close-up commercial restaurant plating, steaming hot, 8k`, seed1),
      label: "AI Studio Master Shot (Fresh & Steaming)",
      prompt,
      cuisineTag: cuisine,
    },
    {
      id: "curated-hd-1",
      url: curated1,
      label: `Authentic ${cuisine.split(" ")[0]} Plating (Instant HD)`,
      prompt: `HD authentic culinary photography of ${cleanName}`,
      cuisineTag: cuisine,
    },
    {
      id: "ai-macro-render",
      url: generateAIImageUrl(`${prompt}, top-down flat-lay food table spread with gourmet garnish`, seed2),
      label: "AI Top-Down Flat-Lay Spread",
      prompt: `${prompt}, top-down flat-lay food table spread`,
      cuisineTag: cuisine,
    },
    {
      id: "curated-hd-2",
      url: curated2,
      label: "Artisanal Kitchen Presentation (Instant HD)",
      prompt: `Artisanal restaurant presentation of ${cleanName}`,
      cuisineTag: cuisine,
    },
  ];

  return { options, cuisineTag: cuisine };
}
