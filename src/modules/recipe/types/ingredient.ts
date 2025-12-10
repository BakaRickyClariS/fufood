export type ConsumptionItem = {
  ingredientName: string;
  originalQuantity: string;
  consumedQuantity: number;
  unit: string;
};

export type ConsumptionConfirmation = {
  recipeId: string;
  recipeName: string;
  items: ConsumptionItem[];
  addToShoppingList: boolean;
  timestamp: string;
};
