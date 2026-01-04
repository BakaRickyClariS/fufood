/**
 * AI 食譜資料轉換工具
 *
 * 將 AI API 回傳的 AIRecipeItem 轉換為前端顯示用的 DisplayRecipe 格式
 * 集中處理 amount → quantity、合併 ingredients/seasonings 等邏輯
 */

import type { AIRecipeItem, AIDifficulty } from '../types';

// ============================================================
// 前端顯示用型別
// ============================================================

/** 前端顯示用的食材項目 */
export type DisplayIngredient = {
  name: string;
  quantity: string;
  unit: string;
  category: '準備材料' | '調味料';
};

/** 前端顯示用的烹煮步驟 */
export type DisplayStep = {
  step: number;
  description: string;
};

/** 前端顯示用的食譜 */
export type DisplayRecipe = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  servings: number;
  cookTime: number;
  isFavorite: boolean;
  difficulty: AIDifficulty;
  ingredients: DisplayIngredient[];
  steps: DisplayStep[];
};

// ============================================================
// 轉換函式
// ============================================================

/**
 * 將 AIRecipeItem 轉換為 DisplayRecipe
 *
 * @param recipe - AI API 回傳的食譜項目
 * @param savedId - 可選，儲存後的真實 ID（覆蓋原始 ID）
 * @returns 前端顯示用的食譜物件
 *
 * @example
 * ```ts
 * const displayRecipe = transformAIRecipeToDisplayModel(aiRecipe, savedRecipe.id);
 * ```
 */
export function transformAIRecipeToDisplayModel(
  recipe: AIRecipeItem,
  savedId?: string,
): DisplayRecipe {
  // 合併 ingredients 和 seasonings，並轉換 amount → quantity
  const transformedIngredients: DisplayIngredient[] = [
    ...(recipe.ingredients || []).map((i) => ({
      name: i.name,
      quantity: String(i.amount),
      unit: i.unit || '',
      category: '準備材料' as const,
    })),
    ...(recipe.seasonings || []).map((s) => ({
      name: s.name,
      quantity: String(s.amount),
      unit: s.unit || '',
      category: '調味料' as const,
    })),
  ];

  // 轉換步驟
  const transformedSteps: DisplayStep[] = (recipe.steps || []).map((s) => ({
    step: s.step,
    description: s.description,
  }));

  return {
    id: savedId || recipe.id,
    name: recipe.name,
    category: recipe.category || '其他',
    imageUrl: recipe.imageUrl,
    servings: recipe.servings,
    cookTime: recipe.cookTime || 0,
    isFavorite: recipe.isFavorite || false,
    difficulty: recipe.difficulty || '簡單',
    ingredients: transformedIngredients,
    steps: transformedSteps,
  };
}

/**
 * 批次轉換多個 AIRecipeItem
 *
 * @param recipes - AI API 回傳的食譜陣列
 * @param savedIds - 可選，儲存後的真實 ID 陣列（順序對應）
 * @returns 前端顯示用的食譜陣列
 */
export function transformAIRecipesToDisplayModels(
  recipes: AIRecipeItem[],
  savedIds?: string[],
): DisplayRecipe[] {
  return recipes.map((recipe, index) =>
    transformAIRecipeToDisplayModel(recipe, savedIds?.[index]),
  );
}
