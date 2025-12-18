import { backendApi } from '@/api/client';

// Types for Foods API

export type Food = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  nutritionInfo?: Record<string, unknown>;
};

export const foodsApi = {
  getCategoryFoods: (catId: string) =>
    backendApi.get<Food[]>(`/foods/category/${catId}`),
  getFoodDetail: (catId: string, id: string) =>
    backendApi.get<Food>(`/foods/category/${catId}/${id}`),
  createFood: (data: Omit<Food, 'id'>) => backendApi.post<Food>('/foods', data),
  updateFood: (id: string, data: Partial<Food>) =>
    backendApi.put<Food>(`/foods/${id}`, data),
  deleteFood: (id: string) => backendApi.delete<void>(`/foods/${id}`),
};
