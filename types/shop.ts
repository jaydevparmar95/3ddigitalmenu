export interface ShopCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ShopMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
  isChefSpecial?: boolean;
}

export interface Shop {
  id: string; // unique alphanumeric ID e.g. "SHP-9A8F2K" or "pizza-world"
  name: string;
  tagline: string;
  ownerName?: string;
  phone: string;
  timings: string;
  establishedYear?: string;
  cuisineType: string;
  theme?: "emerald" | "crimson" | "sapphire" | "terracotta";
  features: string[];
  categories: ShopCategory[];
  items: ShopMenuItem[];
  createdAt: string;
  isDeleted?: boolean;
  visitorsCount?: number;
}

