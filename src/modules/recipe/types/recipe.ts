export type RecipeCategory =
  | 'chinese'
  | 'american'
  | 'italian'
  | 'japanese'
  | 'thai'
  | 'korean'
  | 'mexican'
  | 'sichuan'
  | 'vietnamese'
  | 'healthy'
  | 'dessert'
  | 'drink';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type RecipeIngredient = {
  name: string; // ingredient name
  quantity: string; // e.g. "3-4" or "100g"
  unit?: string; // optional unit
  category: 'ingredient' | 'seasoning';
};

export type CookingStep = {
  stepNumber: number;
  description: string;
  time?: string; // optional duration like "15-20min"
};

export type Recipe = {
  id: string;
  name: string;
  category: RecipeCategory;
  series?: string;
  imageUrl: string;
  servings: number;
  cookTime: number;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type RecipeListItem = {
  id: string;
  name: string;
  category: RecipeCategory;
  imageUrl: string;
  servings: number;
  cookTime: number;
  isFavorite?: boolean;
};
