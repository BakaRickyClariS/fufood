/**
 * AI 回應驗證工具
 *
 * 確保 AI 輸出符合預期結構，防止惡意內容渲染。
 *
 * @module responseValidator
 */

import type { AIRecipeItem, AIIngredientItem, AICookingStep } from '../types';

// ============================================================
// 常數定義
// ============================================================

/** 食譜名稱最大長度 */
const MAX_RECIPE_NAME_LENGTH = 100;

/** 食譜分類最大長度 */
const MAX_CATEGORY_LENGTH = 50;

/** 步驟描述最大長度 */
const MAX_STEP_LENGTH = 500;

/** 食材名稱最大長度 */
const MAX_INGREDIENT_NAME_LENGTH = 50;

/** 最大步驟數量 */
const MAX_STEPS_COUNT = 30;

/** 最大食材數量 */
const MAX_INGREDIENTS_COUNT = 50;

/** 合理的烹飪時間上限（分鐘） */
const MAX_COOK_TIME = 1440;

/** 合理的份數上限 */
const MAX_SERVINGS = 100;

// ============================================================
// 型別守衛
// ============================================================

/**
 * 檢查是否為有效的食材項目
 */
function isValidIngredient(item: unknown): item is AIIngredientItem {
  if (!item || typeof item !== 'object') return false;

  const i = item as Record<string, unknown>;

  return (
    typeof i.name === 'string' &&
    i.name.length > 0 &&
    i.name.length <= MAX_INGREDIENT_NAME_LENGTH &&
    typeof i.amount === 'string' &&
    typeof i.unit === 'string'
  );
}

/**
 * 檢查是否為有效的烹飪步驟
 */
function isValidStep(step: unknown): step is AICookingStep {
  if (!step || typeof step !== 'object') return false;

  const s = step as Record<string, unknown>;

  return (
    typeof s.step === 'number' &&
    s.step > 0 &&
    typeof s.description === 'string' &&
    s.description.length > 0 &&
    s.description.length <= MAX_STEP_LENGTH
  );
}

// ============================================================
// 核心函式
// ============================================================

/**
 * 驗證單一食譜結構
 *
 * @param recipe - 待驗證的食譜物件
 * @returns 是否為有效食譜
 */
export function validateRecipe(recipe: unknown): recipe is AIRecipeItem {
  if (!recipe || typeof recipe !== 'object') return false;

  const r = recipe as Record<string, unknown>;

  // 必要字串欄位
  if (typeof r.id !== 'string' || r.id.length === 0) return false;
  if (typeof r.name !== 'string' || r.name.length === 0) return false;
  if (r.name.length > MAX_RECIPE_NAME_LENGTH) return false;
  if (typeof r.category !== 'string') return false;
  if (r.category.length > MAX_CATEGORY_LENGTH) return false;

  // 可選圖片 URL
  if (
    r.imageUrl !== null &&
    r.imageUrl !== undefined &&
    typeof r.imageUrl !== 'string'
  ) {
    return false;
  }

  // 數值欄位驗證
  if (
    typeof r.servings !== 'number' ||
    r.servings <= 0 ||
    r.servings > MAX_SERVINGS
  ) {
    return false;
  }
  if (
    typeof r.cookTime !== 'number' ||
    r.cookTime < 0 ||
    r.cookTime > MAX_COOK_TIME
  ) {
    return false;
  }

  // 陣列欄位驗證
  if (!Array.isArray(r.ingredients)) return false;

  return true;
}

/**
 * 清理文字中的潛在 XSS
 *
 * @param text - 原始文字
 * @returns 清理後的文字
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 清理食譜物件中的文字內容
 *
 * @param recipe - 已驗證的食譜物件
 * @returns 清理後的食譜物件
 */
export function sanitizeRecipe(recipe: AIRecipeItem): AIRecipeItem {
  return {
    ...recipe,
    name: sanitizeText(recipe.name).slice(0, MAX_RECIPE_NAME_LENGTH),
    category: sanitizeText(recipe.category).slice(0, MAX_CATEGORY_LENGTH),
    ingredients: (recipe.ingredients || [])
      .filter(isValidIngredient)
      .slice(0, MAX_INGREDIENTS_COUNT)
      .map((ing) => ({
        name: sanitizeText(ing.name).slice(0, MAX_INGREDIENT_NAME_LENGTH),
        amount: sanitizeText(ing.amount),
        unit: sanitizeText(ing.unit),
      })),
    seasonings: (recipe.seasonings || [])
      .filter(isValidIngredient)
      .slice(0, MAX_INGREDIENTS_COUNT)
      .map((sea) => ({
        name: sanitizeText(sea.name).slice(0, MAX_INGREDIENT_NAME_LENGTH),
        amount: sanitizeText(sea.amount),
        unit: sanitizeText(sea.unit),
      })),
    steps: (recipe.steps || [])
      .filter(isValidStep)
      .slice(0, MAX_STEPS_COUNT)
      .map((step) => ({
        step: step.step,
        description: sanitizeText(step.description).slice(0, MAX_STEP_LENGTH),
      })),
  };
}

/**
 * 過濾並驗證食譜陣列
 *
 * @param recipes - AI 回傳的食譜陣列
 * @returns 過濾後的有效食譜陣列
 */
export function validateRecipes(recipes: unknown): AIRecipeItem[] {
  if (!Array.isArray(recipes)) {
    if (import.meta.env.DEV) {
      console.warn('[AI Validator] recipes is not an array');
    }
    return [];
  }

  const validated: AIRecipeItem[] = [];

  for (const recipe of recipes) {
    if (validateRecipe(recipe)) {
      const cleaned = sanitizeRecipe(recipe);
      validated.push(cleaned);
    } else if (import.meta.env.DEV) {
      console.warn('[AI Validator] Invalid recipe filtered out');
    }
  }

  return validated;
}

/**
 * 驗證 AI greeting 文字
 *
 * @param greeting - AI 回傳的問候語
 * @returns 清理後的問候語
 */
export function validateGreeting(greeting: unknown): string {
  if (typeof greeting !== 'string') return '';

  // 移除可能的 System Prompt 洩露
  const suspiciousPatterns = [
    /system\s*prompt/gi,
    /你是.*AI.*助手/gi,
    /your\s*instructions/gi,
    /\[INST\]/gi,
    /<<SYS>>/gi,
  ];

  let cleaned = greeting;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(cleaned)) {
      if (import.meta.env.DEV) {
        console.warn('[AI Validator] Suspicious greeting content detected');
      }
      cleaned = cleaned.replace(pattern, '');
    }
  }

  return sanitizeText(cleaned).slice(0, 500);
}
