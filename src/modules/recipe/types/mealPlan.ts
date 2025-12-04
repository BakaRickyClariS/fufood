export type MealPlan = {
  id: string;
  recipeId: string;
  recipeName: string;
  scheduledDate: string;       // 預計烹煮日期
  servings: number;            // 份數
  status: 'planned' | 'cooking' | 'completed';
  createdAt: string;
};

export type MealPlanInput = {
  recipeId: string;
  scheduledDate: string;
  servings: number;
};
