export type ConsumptionItem = {
  ingredientName: string;
  originalQuantity: string;    // 原始需要數量
  consumedQuantity: number;    // 實際消耗數量
  unit: string;
};

export type ConsumptionConfirmation = {
  recipeId: string;
  recipeName: string;
  items: ConsumptionItem[];
  addToShoppingList: boolean;  // 是否加入採買清單
  timestamp: string;
};
