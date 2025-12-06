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
  name: string;           // 食材名稱
  quantity: string;       // 數量（如 "3-4條"）
  unit?: string;          // 單位（選填）
  category: '準備材料' | '調味料';
};

export type CookingStep = {
  stepNumber: number;     // 步驟編號
  description: string;    // 步驟說明
  time?: string;          // 所需時間（如 "15-20分鐘"）
};

export type Recipe = {
  id: string;
  name: string;           // 食譜名稱
  category: RecipeCategory;
  series?: string;        // 系列名稱（如 "慢火煮系列"）
  imageUrl: string;       // 食譜圖片
  servings: number;       // 幾人份
  cookTime: number;       // 烹煮時間（分鐘）
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;   // 是否收藏
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
