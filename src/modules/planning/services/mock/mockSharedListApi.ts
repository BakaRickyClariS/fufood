import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
} from '@/modules/planning/types/sharedList';
import type {
  SharedListPost,
  CreatePostInput,
} from '@/modules/planning/types/post';
import { MOCK_SHARED_LISTS, MOCK_POSTS } from './mockSharedListData';
import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

// 模擬網路延遲
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 記憶體快取 (當 memory_only 或 localStorage 無法使用時作為備援)
let memoryLists: SharedList[] | null = null;
let memoryPosts: Record<string, SharedListPost[]> | null = null;

// 從 LocalStorage 載入或初始化
const getLists = (): SharedList[] => {
  // 檢查是否需要重置
  if (mockRequestHandlers.shouldResetData()) {
    mockRequestHandlers.resetData(['mock_shared_lists']);
    memoryLists = null;
  }

  // 1. 優先嘗試讀取記憶體快取 (Memory Mode 需要)
  if (mockRequestHandlers.shouldUseMemoryOnly() && memoryLists) {
    return memoryLists;
  }

  try {
    const stored = mockRequestHandlers.getItem('mock_shared_lists');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLists = parsed; // Sync to memory
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock lists from localStorage, resetting.', e);
  }

  // 若無資料或解析失敗，寫入預設資料
  const defaults = [...MOCK_SHARED_LISTS]; // Clone to avoid mutation issues
  mockRequestHandlers.setItem('mock_shared_lists', JSON.stringify(defaults));
  memoryLists = defaults;
  return defaults;
};

const getPostsData = (): Record<string, SharedListPost[]> => {
  if (mockRequestHandlers.shouldResetData()) {
    mockRequestHandlers.resetData(['mock_posts']);
    memoryPosts = null;
  }

  if (mockRequestHandlers.shouldUseMemoryOnly() && memoryPosts) {
    return memoryPosts;
  }

  try {
    const stored = mockRequestHandlers.getItem('mock_posts');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        memoryPosts = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock posts from localStorage, resetting.', e);
  }

  const defaults = JSON.parse(JSON.stringify(MOCK_POSTS));
  mockRequestHandlers.setItem('mock_posts', JSON.stringify(defaults));
  memoryPosts = defaults;
  return defaults;
};

const saveLists = (lists: SharedList[]) => {
  memoryLists = lists;
  mockRequestHandlers.setItem('mock_shared_lists', JSON.stringify(lists));
};

const savePosts = (posts: Record<string, SharedListPost[]>) => {
  memoryPosts = posts;
  mockRequestHandlers.setItem('mock_posts', JSON.stringify(posts));
};

export class MockSharedListApi {
  async getSharedLists(
    year?: number,
    month?: number,
  ): Promise<SharedListItem[]> {
    await delay(500);
    const lists = getLists();

    let filteredLists = lists;
    if (year && month) {
      filteredLists = lists.filter((list) => {
        if (!list.scheduledDate) return false;
        const date = new Date(list.scheduledDate);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    }

    return filteredLists.map((list) => ({
      id: list.id,
      name: list.name,
      coverImageUrl: list.coverImageUrl,
      scheduledDate: list.scheduledDate,
      status: list.status,
    }));
  }

  async getSharedListById(id: string): Promise<SharedList> {
    await delay(300);
    const lists = getLists();
    const list = lists.find((l) => l.id === id);
    if (!list) throw new Error('List not found');
    return list;
  }

  async createSharedList(input: CreateSharedListInput): Promise<SharedList> {
    await delay(800);
    const lists = getLists();
    const newList: SharedList = {
      id: `list_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in-progress',
      ...input,
    };
    lists.unshift(newList);
    saveLists(lists);
    return newList;
  }

  async deleteSharedList(id: string): Promise<void> {
    await delay(500);
    const lists = getLists();
    const filteredLists = lists.filter((list) => list.id !== id);
    saveLists(filteredLists);
  }

  async getPosts(listId: string): Promise<SharedListPost[]> {
    await delay(600);
    const allPosts = getPostsData();
    return allPosts[listId] || [];
  }

  async createPost(input: CreatePostInput): Promise<SharedListPost> {
    await delay(800);
    const allPosts = getPostsData();
    const currentPosts = allPosts[input.listId] || [];

    // 模擬當前使用者
    const mockUser = {
      id: 'current_user',
      name: 'Me',
      avatar: 'https://ui-avatars.com/api/?name=Me&background=random',
    };

    const newPost: SharedListPost = {
      id: `post_${Date.now()}`,
      listId: input.listId,
      authorId: mockUser.id,
      authorName: mockUser.name,
      authorAvatar: mockUser.avatar,
      content: input.content,
      images: input.images,
      items: input.items,
      createdAt: new Date().toISOString(),
    };

    currentPosts.unshift(newPost);
    allPosts[input.listId] = currentPosts;
    savePosts(allPosts);
    return newPost;
  }

  async deletePost(postId: string, listId: string): Promise<void> {
    await delay(500);
    const allPosts = getPostsData();
    const listPosts = allPosts[listId] || [];
    const filteredPosts = listPosts.filter((post) => post.id !== postId);
    allPosts[listId] = filteredPosts;
    savePosts(allPosts);
  }

  async updatePost(
    postId: string,
    listId: string,
    input: CreatePostInput,
  ): Promise<SharedListPost> {
    await delay(600);
    const allPosts = getPostsData();
    const listPosts = allPosts[listId] || [];
    const index = listPosts.findIndex((post) => post.id === postId);

    if (index === -1) {
      throw new Error('Post not found');
    }

    const updatedPost: SharedListPost = {
      ...listPosts[index],
      content: input.content,
      images: input.images,
      items: input.items,
    };

    listPosts[index] = updatedPost;
    allPosts[listId] = listPosts;
    savePosts(allPosts);
    return updatedPost;
  }

  async testReset() {
    localStorage.removeItem('mock_shared_lists');
    localStorage.removeItem('mock_posts');
  }
}
