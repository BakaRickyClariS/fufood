import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
} from '@/modules/planning/types/sharedList';
import type {
  SharedListPost,
  CreatePostInput,
  PostComment,
} from '@/modules/planning/types/post';
import { MockSharedListApi } from '../mock/mockSharedListApi';
import { backendApi } from '@/api/client';

export type SharedListApi = {
  getSharedLists(year?: number, month?: number): Promise<SharedListItem[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(input: CreateSharedListInput): Promise<SharedList>;
  deleteSharedList(id: string): Promise<void>;
  getPosts(listId: string): Promise<SharedListPost[]>;
  createPost(input: CreatePostInput): Promise<SharedListPost>;
  togglePostLike(postId: string, listId: string): Promise<SharedListPost>;
  getPostComments(postId: string): Promise<PostComment[]>;
  createPostComment(postId: string, content: string): Promise<PostComment>;
  createPostComment(postId: string, content: string): Promise<PostComment>;
  deletePost(postId: string, listId: string): Promise<void>;
  updatePost(
    postId: string,
    listId: string,
    input: CreatePostInput,
  ): Promise<SharedListPost>;
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
    return backendApi.get<SharedListItem[]>(
      `/api/v1/shopping-lists${queryString}`,
    );
  }

  async getSharedListById(id: string): Promise<SharedList> {
    return backendApi.get<SharedList>(
      `/api/v1/shopping-lists/${id}`,
    );
  }

  async createSharedList(input: CreateSharedListInput): Promise<SharedList> {
    return backendApi.post<SharedList>(
      '/api/v1/shopping-lists',
      input,
    );
  }

  async deleteSharedList(id: string): Promise<void> {
    return backendApi.delete<void>(`/api/v1/shopping-lists/${id}`);
  }

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

  async togglePostLike(
    postId: string,
    listId: string,
  ): Promise<SharedListPost> {
    return backendApi.post<SharedListPost>(
      `/api/v1/posts/${postId}/like`,
      { listId },
    );
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    return backendApi.get<PostComment[]>(`/api/v1/posts/${postId}/comments`);
  }

  async createPostComment(postId: string, content: string): Promise<PostComment> {
    return backendApi.post<PostComment>(`/api/v1/posts/${postId}/comments`, {
      content,
    });
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

// 根據環境變數決定使用 Mock 或 Real API
const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const sharedListApi: SharedListApi = useMock
  ? new MockSharedListApi()
  : new RealSharedListApi();
