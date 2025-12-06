import { apiClient } from '@/lib/apiClient';

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingListItem[];
};

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
};

export const shoppingListApi = {
  getLists: () => apiClient.get<ShoppingList[]>('/shopping-lists'),
  createList: (data: { name: string }) =>
    apiClient.post<ShoppingList>('/shopping-lists', data),
  getList: (id: string) => apiClient.get<ShoppingList>(`/shopping-lists/${id}`),
  updateList: (id: string, data: Partial<ShoppingList>) =>
    apiClient.put<ShoppingList>(`/shopping-lists/${id}`, data),
  deleteList: (id: string) => apiClient.delete<void>(`/shopping-lists/${id}`),
  purchase: (id: string) =>
    apiClient.post<void>(`/shopping-lists/${id}/purchase`),
};
