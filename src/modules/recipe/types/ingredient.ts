export type ConsumptionReason =
  | 'duplicate' // 重複購買
  | 'short_shelf' // 保存時間太短
  | 'bought_too_much' // 買太多
  | 'recipe_consumption' // 食譜消耗
  | 'custom'; // 自訂

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
