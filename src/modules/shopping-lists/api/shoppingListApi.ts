import { api } from '@/api/client';
import { identity } from '@/shared/utils/identity';

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
  /**
   * 取得群組購物清單
   * GET /api/v2/groups/{groupId}/shopping-lists
   */
  getLists: (groupId?: string) => {
    const targetGroupId = groupId || identity.getRefrigeratorId();
    if (!targetGroupId) {
      console.warn('Get shopping lists requires a valid groupId.');
      return Promise.resolve([]);
    }
    return api.get<ShoppingList[]>(
      ENDPOINTS.SHOPPING_LISTS.GROUP_LISTS(targetGroupId),
    );
  },

  /**
   * 建立群組購物清單
   * POST /api/v2/groups/{groupId}/shopping-lists
   */
  createList: (data: { name: string }, groupId?: string) => {
    const targetGroupId = groupId || identity.getRefrigeratorId();
    if (!targetGroupId) {
      throw new Error('Create shopping list requires a valid groupId.');
    }
    return api.post<ShoppingList>(
      ENDPOINTS.SHOPPING_LISTS.GROUP_LISTS(targetGroupId),
      data,
    );
  },

  /**
   * 取得單一購物清單詳情
   * GET /api/v2/shopping-lists/{id}
   */
  getList: (id: string) =>
    api.get<ShoppingList>(ENDPOINTS.SHOPPING_LISTS.BY_ID(id)),

  /**
   * 更新購物清單
   * PUT /api/v2/shopping-lists/{id} (Note: V2 doc says PUT)
   */
  updateList: (id: string, data: Partial<ShoppingList>) =>
    api.put<ShoppingList>(ENDPOINTS.SHOPPING_LISTS.BY_ID(id), data),

  /**
   * 刪除購物清單
   * DELETE /api/v2/shopping-lists/{id}
   */
  deleteList: (id: string) =>
    api.delete<void>(ENDPOINTS.SHOPPING_LISTS.BY_ID(id)),

  /**
   * 標記為已購買
   * PATCH /api/v2/shopping-lists/{id} ? No specific endpoint in docs, assuming updateList logic
   */
  markPurchased: (id: string) =>
    api.put<ShoppingList>(`/api/v2/shopping-lists/${id}`, {
      status: 'purchased',
    }),
};
