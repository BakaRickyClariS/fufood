import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
  CreateSharedListItemInput,
  SharedListPost,
} from '@/modules/planning/types/sharedList';
import type {
  CreatePostInput,
} from '@/modules/planning/types/post';
import { MOCK_SHARED_LISTS, MOCK_POSTS } from './mockSharedListData';
import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';
import type { SharedListApi } from '@/modules/planning/services/api/sharedListApi';

// 模擬網路延遲
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 記憶體快取
let memoryLists: SharedList[] | null = null;
let memoryPosts: Record<string, SharedListPost[]> | null = null;
let memoryItems: Record<string, SharedListItem[]> = {}; // Mock Items storage

// 從 LocalStorage 載入或初始化
const getLists = (): SharedList[] => {
  if (mockRequestHandlers.shouldResetData()) {
    mockRequestHandlers.resetData(['mock_shared_lists']);
    memoryLists = null;
  }

  if (mockRequestHandlers.shouldUseMemoryOnly() && memoryLists) {
    return memoryLists;
  }

  try {
    const stored = mockRequestHandlers.getItem('mock_shared_lists');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLists = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock lists from localStorage, resetting.', e);
  }

  const defaults = [...MOCK_SHARED_LISTS];
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

export class MockSharedListApi implements SharedListApi {
  async getSharedLists(refrigeratorId: string): Promise<SharedList[]> {
    await delay(500);
    const lists = getLists();
    // 依 refrigeratorId 篩選
    return lists.filter((list) => list.refrigeratorId === refrigeratorId);
  }

  async getSharedListById(id: string): Promise<SharedList> {
    await delay(300);
    const lists = getLists();
    const list = lists.find((l) => l.id === id);
    if (!list) throw new Error('List not found');
    return list;
  }

  async createSharedList(
    refrigeratorId: string,
    input: CreateSharedListInput,
  ): Promise<SharedList> {
    await delay(800);
    const lists = getLists();
    const newList: SharedList = {
      id: `list_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in-progress',
      refrigeratorId,
      coverPhotoPath: input.coverPhotoPath || null,
      enableNotifications: input.enableNotifications ?? true,
      ...input,
    };
    lists.unshift(newList);
    saveLists(lists);
    return newList;
  }

  async updateSharedList(
    id: string,
    input: Partial<CreateSharedListInput>,
  ): Promise<SharedList> {
    await delay(500);
    const lists = getLists();
    const index = lists.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('List not found');

    const updatedList = {
      ...lists[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    lists[index] = updatedList;
    saveLists(lists);
    return updatedList;
  }

  async deleteSharedList(id: string): Promise<void> {
    await delay(500);
    const lists = getLists();
    const filteredLists = lists.filter((list) => list.id !== id);
    saveLists(filteredLists);
  }

  // Items
  async getSharedListItems(listId: string): Promise<SharedListItem[]> {
    await delay(300);
    return memoryItems[listId] || [];
  }

  async createSharedListItem(
    listId: string,
    input: CreateSharedListItemInput,
  ): Promise<SharedListItem> {
    await delay(300);
    const newItem: SharedListItem = {
      id: `item_${Date.now()}`,
      shoppingListId: listId,
      creatorId: 'mock_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: input.name,
      quantity: input.quantity || 1,
      unit: input.unit || '個',
      photoPath: input.photoPath || null,
    };
    if (!memoryItems[listId]) memoryItems[listId] = [];
    memoryItems[listId].push(newItem);
    return newItem;
  }

  async updateSharedListItem(
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ): Promise<void> {
    await delay(300);
    // 簡易實作：遍歷所有 list 尋找 item
    for (const listId in memoryItems) {
      const items = memoryItems[listId];
      const index = items.findIndex((i) => i.id === itemId);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...input,
          updatedAt: new Date().toISOString(),
        };
        break;
      }
    }
  }

  async deleteSharedListItem(itemId: string): Promise<void> {
    await delay(300);
    for (const listId in memoryItems) {
      memoryItems[listId] = memoryItems[listId].filter((i) => i.id !== itemId);
    }
  }

  // Posts
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
      items: input.items.map(item => ({
        ...item,
        unit: item.unit || '個',
        photoPath: item.imageUrl || null,
        creatorId: mockUser.id,
        shoppingListId: input.listId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
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
      items: input.items.map(item => ({
        ...item,
        unit: item.unit || '個',
        photoPath: item.imageUrl || null,
        creatorId: 'mock_user', // Preserve existing or use generic
        shoppingListId: listId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
    };

    listPosts[index] = updatedPost;
    allPosts[listId] = listPosts;
    savePosts(allPosts);
    return updatedPost;
  }

  async testReset() {
    localStorage.removeItem('mock_shared_lists');
    localStorage.removeItem('mock_posts');
    memoryLists = null;
    memoryPosts = null;
    memoryItems = {};
  }
}
