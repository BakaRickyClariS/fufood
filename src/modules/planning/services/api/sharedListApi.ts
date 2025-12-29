import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
  CreateSharedListItemInput,
} from '@/modules/planning/types/sharedList';
import type {
  SharedListPost,
  CreatePostInput,
} from '@/modules/planning/types/post';
import { backendApi } from '@/api/client';

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

  // Items
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

  // Posts (Legacy/Existing)
  getPosts(listId: string): Promise<SharedListPost[]>;
  createPost(input: CreatePostInput): Promise<SharedListPost>;
  deletePost(postId: string, listId: string): Promise<void>;
  updatePost(
    postId: string,
    listId: string,
    input: CreatePostInput,
  ): Promise<SharedListPost>;
};

// 真實 API 實作
export class RealSharedListApi implements SharedListApi {
  // List Operations
  async getSharedLists(refrigeratorId: string): Promise<SharedList[]> {
    const response = await backendApi.get<{ data: SharedList[] }>(
      `/api/v1/refrigerators/${refrigeratorId}/shopping_lists`,
    );
    return response.data || [];
  }

  async getSharedListById(id: string): Promise<SharedList> {
    const response = await backendApi.get<{ data: SharedList }>(
      `/api/v1/shopping_lists/${id}`,
    );
    return response.data;
  }

  async createSharedList(
    refrigeratorId: string,
    input: CreateSharedListInput,
  ): Promise<SharedList> {
    const response = await backendApi.post<{ data: SharedList }>(
      `/api/v1/refrigerators/${refrigeratorId}/shopping_lists`,
      input,
    );
    return response.data;
  }

  async updateSharedList(
    id: string,
    input: Partial<CreateSharedListInput>,
  ): Promise<SharedList> {
    const response = await backendApi.put<{ data: SharedList }>(
      `/api/v1/shopping_lists/${id}`,
      input,
    );
    return response.data;
  }

  async deleteSharedList(id: string): Promise<void> {
    return backendApi.delete<void>(`/api/v1/shopping_lists/${id}`);
  }

  // Item Operations
  async getSharedListItems(listId: string): Promise<SharedListItem[]> {
    const response = await backendApi.get<{ data: SharedListItem[] }>(
      `/api/v1/shopping_lists/${listId}/items`,
    );
    return response.data || [];
  }

  async createSharedListItem(
    listId: string,
    input: CreateSharedListItemInput,
  ): Promise<SharedListItem> {
    const response = await backendApi.post<{ data: SharedListItem }>(
      `/api/v1/shopping_lists/${listId}/items`,
      input,
    );
    return response.data;
  }

  async updateSharedListItem(
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ): Promise<void> {
    return backendApi.put<void>(
      `/api/v1/shopping_list_items/${itemId}/`,
      input,
    );
  }

  async deleteSharedListItem(itemId: string): Promise<void> {
    return backendApi.delete<void>(`/api/v1/shopping_list_items/${itemId}/`);
  }

  // Post Operations
  async getPosts(listId: string): Promise<SharedListPost[]> {
    return backendApi.get<SharedListPost[]>(
      `/api/v1/shopping-lists/${listId}/posts`,
    );
  }

  async createPost(input: CreatePostInput): Promise<SharedListPost> {
    return backendApi.post<SharedListPost>(
      `/api/v1/shopping-lists/${input.listId}/posts`,
      input,
    );
  }

  async deletePost(postId: string, listId: string): Promise<void> {
    return backendApi.delete<void>(`/api/v1/posts/${postId}`, {
      body: { listId },
    });
  }

  async updatePost(
    postId: string,
    listId: string,
    input: CreatePostInput,
  ): Promise<SharedListPost> {
    return backendApi.put<SharedListPost>(`/api/v1/posts/${postId}`, {
      ...input,
      listId,
    });
  }
}

// 暫時強制使用 Real API，或根據需要保留 Mock
// const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const sharedListApi: SharedListApi = new RealSharedListApi();
