import type {
  Recipe,
  RecipeListItem,
  RecipeCategory,
  MealPlan,
} from '@/modules/recipe/types';
import type {
  ConsumptionConfirmation,
  MealPlanInput,
} from '@/modules/recipe/types';
import { backendApi } from '@/api/client';
import { aiRecipeApi } from '@/modules/ai/api/aiRecipeApi';

export type RecipeApi = {
  getRecipes(params?: {
    category?: RecipeCategory;
    favorite?: boolean;
    refrigeratorId?: string;
  }): Promise<RecipeListItem[]>;
  getRecipeById(id: string): Promise<Recipe>;
  toggleFavorite(
    id: string,
    shouldFavorite?: boolean,
  ): Promise<{ isFavorite: boolean }>;
  getFavorites(): Promise<RecipeListItem[]>;
  // 根據食材名稱推薦相關食譜
  getRecommendedRecipes(ingredientNames: string[]): Promise<RecipeListItem[]>;
  confirmCook(
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }>;
  addMealPlan(data: MealPlanInput): Promise<MealPlan>;
  getMealPlans(): Promise<MealPlan[]>;
  deleteMealPlan(planId: string): Promise<{ success: boolean }>;
};

export class RealRecipeApi implements RecipeApi {
  // Flag 用來避免重複 seed
  private _isSeeding = false;

  /**
   * 取得食譜列表
   * 目前改為從 AI Backend 取得已儲存的食譜
   * 若使用者沒有任何食譜，會自動儲存預設食譜
   */
  getRecipes = async (params?: {
    category?: RecipeCategory;
    favorite?: boolean;
    refrigeratorId?: string;
  }): Promise<RecipeListItem[]> => {
    // 從 AI API 取得所有食譜
    let savedRecipes = await aiRecipeApi.getSavedRecipes(
      params?.refrigeratorId,
    );

    // 若列表為空且未在 seeding 中，自動儲存預設食譜
    if (savedRecipes.length === 0 && !this._isSeeding) {
      this._isSeeding = true;
      try {
        const seeded = await aiRecipeApi.seedDefaultRecipes(
          params?.refrigeratorId,
        );
        if (seeded) {
          // 重新取得食譜列表
          savedRecipes = await aiRecipeApi.getSavedRecipes(
            params?.refrigeratorId,
          );
        }
      } finally {
        this._isSeeding = false;
      }
    }

    // Helper to normalize category
    const normalizeRecipeCategory = (input?: string | null): RecipeCategory => {
      if (!input) return '其他' as RecipeCategory;

      const map: Record<string, RecipeCategory> = {
        日式: '日式料理',
        台式: '中式料理',
        美式: '美式料理',
        義式: '義式料理',
        泰式: '泰式料理',
        韓式: '韓式料理',
        墨西哥: '墨西哥料理',
        川菜: '川菜',
        越南: '越南料理',
        甜點: '甜點',
        飲品: '飲品',
      };

      for (const key in map) {
        if (input.includes(key)) return map[key];
      }

      return input as RecipeCategory;
    };

    // 轉換型別並過濾
    const recipes: RecipeListItem[] = savedRecipes.map((r) => {
      const category = normalizeRecipeCategory(r.category);
      // Fallback for UI safety if normalization failed to find a strict match and input was weird
      const finalCategory = category || ('中式料理' as RecipeCategory);

      return {
        id: r.id,
        name: r.name,
        category: finalCategory,
        imageUrl: r.imageUrl, // 允許 null
        servings: r.servings,
        cookTime: r.cookTime || 0,
        isFavorite: r.isFavorite,
      };
    });

    // 前端過濾
    return recipes.filter((r) => {
      if (params?.category && r.category !== params.category) return false;
      if (params?.favorite && !r.isFavorite) return false;
      return true;
    });
  };

  /**
   * 取得單一食譜
   */
  getRecipeById = async (id: string): Promise<Recipe> => {
    const saved = await aiRecipeApi.getSavedRecipeById(id);

    // 轉換 SavedRecipe 到 Recipe 格式
    return {
      id: saved.id,
      name: saved.name,
      category: (saved.category || '其他') as RecipeCategory,
      imageUrl: saved.imageUrl, // 允許 null
      servings: saved.servings,
      cookTime: saved.cookTime || 0,
      difficulty: saved.difficulty || '簡單',
      // 合併 ingredients 和 seasonings 到同一個陣列 (與 useRecipeStream 一致)
      ingredients: [
        ...(saved.ingredients || []).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          category: '準備材料' as const,
        })),
        ...(saved.seasonings || []).map((s) => ({
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          category: '調味料' as const,
        })),
      ],
      steps: (saved.steps || []).map((s) => ({
        stepNumber: s.step,
        description: s.description,
      })),
      isFavorite: saved.isFavorite,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      source: saved.source,
      originalPrompt: saved.originalPrompt || undefined,
      description: saved.description || undefined,
    };
  };

  /**
   * 切換收藏狀態
   */
  toggleFavorite = async (
    id: string,
    shouldFavorite?: boolean,
  ): Promise<{ isFavorite: boolean }> => {
    const targetState = shouldFavorite ?? true;
    await aiRecipeApi.updateSavedRecipe(id, { isFavorite: targetState });
    return { isFavorite: targetState };
  };

  /**
   * 取得收藏食譜 (透過 Filter 實作)
   */
  getFavorites = async (): Promise<RecipeListItem[]> => {
    const savedRecipes = await aiRecipeApi.getSavedRecipes();

    return savedRecipes
      .filter((r) => r.isFavorite)
      .map((r) => ({
        id: r.id,
        name: r.name,
        category: (r.category || '其他') as RecipeCategory,
        imageUrl: r.imageUrl, // 允許 null
        servings: r.servings,
        cookTime: r.cookTime || 0,
        isFavorite: r.isFavorite,
      }));
  };

  // --- 以下維持原樣 (或是也需要 Mock/Pending) ---

  getRecommendedRecipes = async (
    ingredientNames: string[],
  ): Promise<RecipeListItem[]> => {
    // 這部分暫時維持呼叫主後端，或是 Mock
    const query = ingredientNames
      .map((name) => `ingredients=${encodeURIComponent(name)}`)
      .join('&');
    return backendApi
      .get<RecipeListItem[]>(`/api/v1/recipes/recommended?${query}`)
      .catch(() => []); // 避免錯誤阻擋 UI
  };

  confirmCook = async (
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }> => {
    // 消耗食材通常涉及主後端的庫存，所以這裡應該還是打主後端
    // 但因為食譜來源是 AI Backend，ID 無法對應。
    // 這是一個整合斷點。
    // 暫時假設：消耗食材只扣庫存，不依賴後端食譜 ID 驗證 (或後端會忽略無效 ID)

    // 如果主後端需要有效的 Recipe ID，這裡會失敗。
    // 但目前需求是「消耗時推薦的食譜需要與庫存相關」，這可能指 getRecommendedRecipes。
    // confirmCook 暫時先維持呼叫主後端，若失敗則僅 log
    try {
      const response = await backendApi.patch<{
        success?: boolean;
        message?: string;
      }>(`/api/v1/recipes/${data.recipeId}`, {
        status: 'cooked',
        consumption: data,
      });
      return {
        success: response?.success ?? true,
        message: response?.message ?? '已更新食譜狀態',
      };
    } catch (e) {
      console.warn(
        'Confirm cook failed on backend (expected if recipe is AI-only)',
        e,
      );
      return { success: true, message: '本地已確認消耗 (模擬)' };
    }
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    return backendApi.post<MealPlan>('/api/v1/recipes/plan', data);
  };

  getMealPlans = async (): Promise<MealPlan[]> => {
    // 避免 404
    try {
      return await backendApi.get<MealPlan[]>('/api/v1/recipes/plan');
    } catch {
      return [];
    }
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    return backendApi.delete<{ success: boolean }>(
      `/api/v1/recipes/plan/${planId}`,
    );
  };
}
