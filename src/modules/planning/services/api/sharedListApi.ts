import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
  CreateSharedListItemInput,
} from '@/modules/planning/types/sharedList';
import { api } from '@/api/client';

export type SharedListApi = {
  // Lists
  getSharedLists(groupId: string): Promise<SharedList[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(
    groupId: string,
    input: CreateSharedListInput,
  ): Promise<SharedList>;
  updateSharedList(
    id: string,
    input: Partial<CreateSharedListInput>,
  ): Promise<SharedList>;
  deleteSharedList(id: string): Promise<void>;

  // Items (單一採購項目)
  getSharedListItems(listId: string): Promise<SharedListItem[]>;
  createSharedListItem(
    listId: string,
    input: CreateSharedListItemInput,
  ): Promise<SharedListItem>;
  updateSharedListItem(
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ): Promise<void>;
  deleteSharedListItem(itemId: string): Promise<void>;
};

// 真實 API 實作
export class RealSharedListApi implements SharedListApi {
  // List Operations
  async getSharedLists(groupId: string): Promise<SharedList[]> {
    const response = await api.get<{ data: SharedList[] }>(
      `/api/v2/groups/${groupId}/shopping-lists`,
    );
    // V2 return format standard check: might be response.data or response is array
    if (Array.isArray(response)) return response;
    return response.data || [];
  }

  async getSharedListById(id: string): Promise<SharedList> {
    const response = await api.get<{ data: SharedList }>(
      `/api/v2/shopping-lists/${id}`,
    );
    return response.data || (response as unknown as SharedList);
  }

  async createSharedList(
    groupId: string,
    input: CreateSharedListInput,
  ): Promise<SharedList> {
    const response = await api.post<{ data: SharedList }>(
      `/api/v2/groups/${groupId}/shopping-lists`,
      input,
    );
    return response.data || (response as unknown as SharedList);
  }

  async updateSharedList(
    id: string,
    input: Partial<CreateSharedListInput>,
  ): Promise<SharedList> {
    const response = await api.put<{ data: SharedList }>(
      `/api/v2/shopping-lists/${id}`,
      input,
    );
    return response.data || (response as unknown as SharedList);
  }

  async deleteSharedList(id: string): Promise<void> {
    return api.delete<void>(`/api/v2/shopping-lists/${id}`);
  }

  // Item Operations
  async getSharedListItems(listId: string): Promise<SharedListItem[]> {
    const response = await api.get<{ data: any[] }>(
      `/api/v2/shopping-lists/${listId}/items`,
    );
    const rawItems = Array.isArray(response) ? response : response.data || [];

    // Map snake_case from DB to camelCase for frontend
    return rawItems.map((item: any) => ({
      ...item,
      creatorId: item.creator_id || item.creatorId,
      photoPath: item.photo_path || item.photoPath,
      shoppingListId: item.shopping_list_id || item.shoppingListId,
      // If there's a nested creator object, make sure it's accessible
      creator: item.creator || undefined,
    }));
  }

  async createSharedListItem(
    listId: string,
    input: CreateSharedListItemInput,
  ): Promise<SharedListItem> {
    const response = await api.post<{ data: SharedListItem }>(
      `/api/v2/shopping-lists/${listId}/items`,
      input,
    );
    return response.data || (response as unknown as SharedListItem);
  }

  async updateSharedListItem(
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ): Promise<void> {
    return api.put<void>(`/api/v2/shopping-list-items/${itemId}`, input);
  }

  async deleteSharedListItem(itemId: string): Promise<void> {
    return api.delete<void>(`/api/v2/shopping-list-items/${itemId}`);
  }
}

// 暫時強制使用 Real API
export const sharedListApi: SharedListApi = new RealSharedListApi();
