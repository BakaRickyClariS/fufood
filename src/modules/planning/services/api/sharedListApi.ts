import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
} from '@/modules/planning/types/sharedList';
import type {
  SharedListPost,
  CreatePostInput,
} from '@/modules/planning/types/post';
import { MockSharedListApi } from '../mock/mockSharedListApi';
import { apiClient } from '@/services/apiClient';

export type SharedListApi = {
  getSharedLists(year?: number, month?: number): Promise<SharedListItem[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(input: CreateSharedListInput): Promise<SharedList>;
  getPosts(listId: string): Promise<SharedListPost[]>;
  createPost(input: CreatePostInput): Promise<SharedListPost>;
  togglePostLike(postId: string, listId: string): Promise<SharedListPost>;
};

// 真實 API 實作
export class RealSharedListApi implements SharedListApi {
  async getSharedLists(
    year?: number,
    month?: number,
  ): Promise<SharedListItem[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    // 如果有參數，附加到 URL
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<SharedListItem[]>(
      `/api/v1/shopping-lists${queryString}`,
    );
    return response.data;
  }

  async getSharedListById(id: string): Promise<SharedList> {
    const response = await apiClient.get<SharedList>(
      `/api/v1/shopping-lists/${id}`,
    );
    return response.data;
  }

  async createSharedList(input: CreateSharedListInput): Promise<SharedList> {
    const response = await apiClient.post<SharedList>(
      '/api/v1/shopping-lists',
      input,
    );
    return response.data;
  }

  async getPosts(listId: string): Promise<SharedListPost[]> {
    const response = await apiClient.get<SharedListPost[]>(
      `/api/v1/shopping-lists/${listId}/posts`,
    );
    return response.data;
  }

  async createPost(input: CreatePostInput): Promise<SharedListPost> {
    const response = await apiClient.post<SharedListPost>(
      `/api/v1/shopping-lists/${input.listId}/posts`,
      input,
    );
    return response.data;
  }

  async togglePostLike(
    postId: string,
    listId: string,
  ): Promise<SharedListPost> {
    const response = await apiClient.post<SharedListPost>(
      `/api/v1/posts/${postId}/like`,
      { listId },
    );
    return response.data;
  }
}

// 根據環境變數決定使用 Mock 或 Real API
const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const sharedListApi: SharedListApi = useMock
  ? new MockSharedListApi()
  : new RealSharedListApi();
