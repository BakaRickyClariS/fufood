export type ConsumptionReason =
  | 'duplicate'
  | 'short_shelf'
  | 'bought_too_much'
  | 'custom';

export type ConsumptionItem = {
  ingredientName: string;
  originalQuantity: string;
  consumedQuantity: number;
  unit: string;
  expiryDate?: string;
  reasons?: ConsumptionReason[];
  customReason?: string;
};

export type ConsumptionConfirmation = {
  recipeId: string;
  recipeName: string;
  items: ConsumptionItem[];
  addToShoppingList: boolean;
  timestamp: string;
};
