import { MenuItem } from "./menu";

export interface SelectedChoice {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique hash for item instance
  menuItem: MenuItem;
  quantity: number;
  selectedChoices: SelectedChoice[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type DiningMode = "dine-in" | "takeaway" | "room-service";

export interface OrderState {
  items: CartItem[];
  tableNumber: string;
  diningMode: DiningMode;
  specialRequests: string;
  tipPercentage: number;
  promoCode: string;
  discountPercentage: number;
}
