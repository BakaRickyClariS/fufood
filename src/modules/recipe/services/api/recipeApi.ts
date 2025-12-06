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
import { apiClient } from '@/services/apiClient';

export type RecipeApi = {
  getRecipes(category?: RecipeCategory): Promise<RecipeListItem[]>;
  getRecipeById(id: string): Promise<Recipe>;
  toggleFavorite(id: string): Promise<{ isFavorite: boolean }>;
  getFavorites(): Promise<RecipeListItem[]>;
  confirmCook(
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }>;
  addMealPlan(data: MealPlanInput): Promise<MealPlan>;
  getMealPlans(): Promise<MealPlan[]>;
  deleteMealPlan(planId: string): Promise<{ success: boolean }>;
};

export class RealRecipeApi implements RecipeApi {
  getRecipes = async (category?: RecipeCategory): Promise<RecipeListItem[]> => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await apiClient.get<RecipeListItem[]>(
      `/api/v1/recipes${query}`,
    );
    return response.data;
  };

  getRecipeById = async (id: string): Promise<Recipe> => {
    const response = await apiClient.get<Recipe>(`/api/v1/recipes/${id}`);
    return response.data;
  };

  toggleFavorite = async (id: string): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.post<{ isFavorite: boolean }>(
      `/api/v1/recipes/${id}/favorite`,
    );
    return response.data;
  };

  getFavorites = async (): Promise<RecipeListItem[]> => {
    const response = await apiClient.get<RecipeListItem[]>(
      '/api/v1/recipes/favorites',
    );
    return response.data;
  };

  confirmCook = async (
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/api/v1/recipes/${data.recipeId}/cook`, data);
    return response.data;
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    const response = await apiClient.post<MealPlan>(
      '/api/v1/recipes/plan',
      data,
    );
    return response.data;
  };

  getMealPlans = async (): Promise<MealPlan[]> => {
    const response = await apiClient.get<MealPlan[]>('/api/v1/recipes/plan');
    return response.data;
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/v1/recipes/plan/${planId}`,
    );
    return response.data;
  };
}
