import { apiClient } from '@/lib/apiClient';

// Types for Foods API

export type Food = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  nutritionInfo?: any;
};

export const foodsApi = {
  getCategoryFoods: (catId: string) =>
    apiClient.get<Food[]>(`/foods/category/${catId}`),
  getFoodDetail: (catId: string, id: string) =>
    apiClient.get<Food>(`/foods/category/${catId}/${id}`),
  createFood: (data: Omit<Food, 'id'>) => apiClient.post<Food>('/foods', data),
  updateFood: (id: string, data: Partial<Food>) =>
    apiClient.put<Food>(`/foods/${id}`, data),
  deleteFood: (id: string) => apiClient.delete<void>(`/foods/${id}`),
};
