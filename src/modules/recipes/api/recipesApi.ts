import { apiClient } from '@/lib/apiClient';

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: any[];
  steps: string[];
  imageUrl?: string;
};

export type MealPlan = {
  id: string;
  recipeId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
};

export const recipesApi = {
  getRecipes: () => apiClient.get<Recipe[]>('/recipes'),
  toggleFavorite: (id: string) => apiClient.post<void>(`/recipes/${id}/favorite`),
  getFavorites: () => apiClient.get<Recipe[]>('/recipes/favorites'),
  cookRecipe: (id: string) => apiClient.post<void>(`/recipes/${id}/cook`),
  addToPlan: (data: Omit<MealPlan, 'id'>) => apiClient.post<MealPlan>('/recipes/plan', data),
  getPlan: () => apiClient.get<MealPlan[]>('/recipes/plan'),
  deletePlan: (planId: string) => apiClient.delete<void>(`/recipes/plan/${planId}`),
};
