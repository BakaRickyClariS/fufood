import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
  CreateSharedListItemInput,
} from '@/modules/planning/types/sharedList';
import { api } from '@/api/client';

export type SharedListApi = {
  // Lists
  getSharedLists(refrigeratorId: string): Promise<SharedList[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(
    refrigeratorId: string,
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
  async getSharedLists(refrigeratorId: string): Promise<SharedList[]> {
    const response = await api.get<{ data: SharedList[] }>(
      `/api/v2/groups/${refrigeratorId}/shopping-lists`,
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
    refrigeratorId: string,
    input: CreateSharedListInput,
  ): Promise<SharedList> {
    const response = await api.post<{ data: SharedList }>(
      `/api/v2/groups/${refrigeratorId}/shopping-lists`,
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
    const response = await api.get<{ data: SharedListItem[] }>(
      `/api/v2/shopping-lists/${listId}/items`,
    );
    if (Array.isArray(response)) return response;
    return response.data || [];
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
    // V2 doesn't have explicit shopping-list-items endpoint detailed in doc I read (only create/get in list),
    // but typically it's PUT /api/v2/shopping-list-items/:id
    // Checking doc snippet for item update: "PUT /shopping-list-items/:itemId"
    return api.put<void>(`/api/v2/shopping-list-items/${itemId}`, input);
  }

  async deleteSharedListItem(itemId: string): Promise<void> {
    return api.delete<void>(`/api/v2/shopping-list-items/${itemId}`);
  }
}

// 暫時強制使用 Real API
export const sharedListApi: SharedListApi = new RealSharedListApi();
