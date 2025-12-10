import { apiClient } from '@/lib/apiClient';

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingListItem[];
  status?: 'pending' | 'purchased';
};

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
};

export const shoppingListApi = {
  getLists: () => apiClient.get<ShoppingList[]>('/api/v1/shopping-lists'),
  createList: (data: { name: string }) =>
    apiClient.post<ShoppingList>('/api/v1/shopping-lists', data),
  getList: (id: string) =>
    apiClient.get<ShoppingList>(`/api/v1/shopping-lists/${id}`),
  updateList: (id: string, data: Partial<ShoppingList>) =>
    apiClient.patch<ShoppingList>(`/api/v1/shopping-lists/${id}`, data),
  deleteList: (id: string) =>
    apiClient.delete<void>(`/api/v1/shopping-lists/${id}`),
  markPurchased: (id: string) =>
    apiClient.patch<ShoppingList>(`/api/v1/shopping-lists/${id}`, {
      status: 'purchased',
    }),
};
