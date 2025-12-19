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

export type RecipeApi = {
  getRecipes(params?: {
    category?: RecipeCategory;
    favorite?: boolean;
  }): Promise<RecipeListItem[]>;
  getRecipeById(id: string): Promise<Recipe>;
  toggleFavorite(
    id: string,
    shouldFavorite?: boolean,
  ): Promise<{ isFavorite: boolean }>;
  getFavorites(): Promise<RecipeListItem[]>;
  confirmCook(
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }>;
  addMealPlan(data: MealPlanInput): Promise<MealPlan>;
  getMealPlans(): Promise<MealPlan[]>;
  deleteMealPlan(planId: string): Promise<{ success: boolean }>;
};

export class RealRecipeApi implements RecipeApi {
  getRecipes = async (params?: {
    category?: RecipeCategory;
    favorite?: boolean;
  }): Promise<RecipeListItem[]> => {
    const query = [];
    if (params?.category) {
      query.push(`category=${encodeURIComponent(params.category)}`);
    }
    if (params?.favorite) {
      query.push('favorite=true');
    }
    const queryString = query.length ? `?${query.join('&')}` : '';
    return backendApi.get<RecipeListItem[]>(
      `/api/v1/recipes${queryString}`,
    );
  };

  getRecipeById = async (id: string): Promise<Recipe> => {
    return backendApi.get<Recipe>(`/api/v1/recipes/${id}`);
  };

  toggleFavorite = async (
    id: string,
    shouldFavorite?: boolean,
  ): Promise<{ isFavorite: boolean }> => {
    if (shouldFavorite === false) {
      const response = await backendApi.delete<{ isFavorite?: boolean }>(
        `/api/v1/recipes/${id}/favorite`,
      );
      return { isFavorite: response?.isFavorite ?? false };
    }

    const response = await backendApi.post<{ isFavorite?: boolean }>(
      `/api/v1/recipes/${id}/favorite`,
    );
    return { isFavorite: response?.isFavorite ?? true };
  };

  getFavorites = async (): Promise<RecipeListItem[]> => {
    return backendApi.get<RecipeListItem[]>(
      '/api/v1/recipes?favorite=true',
    );
  };

  confirmCook = async (
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }> => {
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
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    return backendApi.post<MealPlan>(
      '/api/v1/recipes/plan',
      data,
    );
  };

  getMealPlans = async (): Promise<MealPlan[]> => {
    return backendApi.get<MealPlan[]>('/api/v1/recipes/plan');
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    return backendApi.delete<{ success: boolean }>(
      `/api/v1/recipes/plan/${planId}`,
    );
  };
}
