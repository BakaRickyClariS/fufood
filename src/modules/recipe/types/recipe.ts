export type RecipeCategory =
  | '中式料理'
  | '美式料理'
  | '義式料理'
  | '日式料理'
  | '泰式料理'
  | '韓式料理'
  | '墨西哥料理'
  | '川菜'
  | '越南料理'
  | '健康輕食'
  | '甜點'
  | '飲品';

export type RecipeDifficulty = '簡單' | '中等' | '困難';

export type RecipeIngredient = {
  name: string; // ingredient name
  quantity: string; // e.g. "3-4" or "100g"
  unit?: string; // optional unit
  category: '準備材料' | '調味料';
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
