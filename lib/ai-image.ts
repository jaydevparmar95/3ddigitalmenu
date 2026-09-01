/**
 * AI Food Image Generator Helper for Pizza World
 */

const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
  starters: [
    "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80",
  ],
  woodfired: [
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80",
  ],
  gourmet: [
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
  ],
  pastas: [
    "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1536964549204-cce9eab227bd?auto=format&fit=crop&w=600&q=80",
  ],
  beverages: [
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
  ],
  desserts: [
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
  ],
};

export interface AIGeneratedImageOption {
  id: string;
  url: string;
  label: string;
  prompt: string;
}

export function generateFoodImagePrompt(name: string, description: string, category: string): string {
  const cleanName = name.trim() || "Delicious Artisanal Woodfired Pizza";
  const cleanDesc = description.trim() ? `, ${description.trim()}` : "";
  return `Award-winning appetizing commercial food photography of ${cleanName}${cleanDesc}, ${category} course, bubbling hot melted mozzarella, golden crispy sourdough crust, fresh basil leaves, cinematic warm pizzeria oven glow, 8k resolution`;
}

export function generateAIImageUrl(prompt: string, seed: number = 42): string {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&seed=${seed}&nologo=true&enhance=true`;
}

export function getAIImageOptions(name: string, description: string, category: string): AIGeneratedImageOption[] {
  const prompt = generateFoodImagePrompt(name, description, category);
  const fallbacks = FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES.woodfired;
  const randomSeed1 = Math.floor(Math.random() * 10000);
  const randomSeed2 = Math.floor(Math.random() * 10000) + 1000;

  return [
    {
      id: "ai-v1",
      url: generateAIImageUrl(prompt, randomSeed1),
      label: "AI Studio Pizzeria Shot (Melty & Crispy)",
      prompt,
    },
    {
      id: "ai-v2",
      url: generateAIImageUrl(
        `${prompt}, top-down macro shot with cheese pull and fresh oregano`,
        randomSeed2
      ),
      label: "AI Macro Closeup (Cheese Pull Focus)",
      prompt: `${prompt}, top-down macro shot with cheese pull and fresh oregano`,
    },
    {
      id: "curated-1",
      url: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      label: "Curated Master Oven Plating (Instant HD)",
      prompt: "High-resolution curated Italian pizzeria photography",
    },
  ];
}
