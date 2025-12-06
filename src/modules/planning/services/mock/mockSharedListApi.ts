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

// 模擬網路延遲
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 從 LocalStorage 載入或初始化
const getLists = (): SharedList[] => {
  try {
    const stored = localStorage.getItem('mock_shared_lists');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock lists from localStorage, resetting.', e);
  }

  // 若無資料或解析失敗，寫入預設資料
  localStorage.setItem('mock_shared_lists', JSON.stringify(MOCK_SHARED_LISTS));
  return MOCK_SHARED_LISTS;
};

const getPosts = (): Record<string, SharedListPost[]> => {
  try {
    const stored = localStorage.getItem('mock_posts');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock posts from localStorage, resetting.', e);
  }

  localStorage.setItem('mock_posts', JSON.stringify(MOCK_POSTS));
  return MOCK_POSTS;
};

const saveLists = (lists: SharedList[]) => {
  localStorage.setItem('mock_shared_lists', JSON.stringify(lists));
};

const savePosts = (posts: Record<string, SharedListPost[]>) => {
  localStorage.setItem('mock_posts', JSON.stringify(posts));
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

  async getPosts(listId: string): Promise<SharedListPost[]> {
    await delay(600);
    const allPosts = getPosts();
    return allPosts[listId] || [];
  }

  async createPost(input: CreatePostInput): Promise<SharedListPost> {
    await delay(800);
    const allPosts = getPosts();
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
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    currentPosts.unshift(newPost);
    allPosts[input.listId] = currentPosts;
    savePosts(allPosts);
    return newPost;
  }

  async testReset() {
    localStorage.removeItem('mock_shared_lists');
    localStorage.removeItem('mock_posts');
  }
}
