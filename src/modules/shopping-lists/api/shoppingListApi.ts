import { backendApi } from '@/api/client';

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
  getLists: () => backendApi.get<ShoppingList[]>('/api/v1/shopping-lists'),
  createList: (data: { name: string }) =>
    backendApi.post<ShoppingList>('/api/v1/shopping-lists', data),
  getList: (id: string) =>
    backendApi.get<ShoppingList>(`/api/v1/shopping-lists/${id}`),
  updateList: (id: string, data: Partial<ShoppingList>) =>
    backendApi.patch<ShoppingList>(`/api/v1/shopping-lists/${id}`, data),
  deleteList: (id: string) =>
    backendApi.delete<void>(`/api/v1/shopping-lists/${id}`),
  markPurchased: (id: string) =>
    backendApi.patch<ShoppingList>(`/api/v1/shopping-lists/${id}`, {
      status: 'purchased',
    }),
};
