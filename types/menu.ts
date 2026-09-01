export type DietaryType = "veg" | "non-veg";

export type MenuCategoryType =
  | "starters"
  | "veg-pizzas"
  | "paneer-special"
  | "nonveg-pizzas"
  | "pastas-beverages"
  | "desserts";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategoryType;
  image: string;
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
  size?: string;
  isChefSpecial?: boolean;
  calories?: number;
  dietary?: string[];
}

export interface Category {
  id: MenuCategoryType;
  name: string;
  description: string;
  subtitle?: string;
}

export type DietaryTag = string;
