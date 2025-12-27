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

const getPosts = (): Record<string, SharedListPost[]> => {
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

  async togglePostLike(
    postId: string,
    listId: string,
  ): Promise<SharedListPost> {
    await delay(400);
    const allPosts = getPosts();
    const listPosts = allPosts[listId] || [];
    const targetIndex = listPosts.findIndex((post) => post.id === postId);

    if (targetIndex === -1) {
      throw new Error('Post not found');
    }

    const target = listPosts[targetIndex];
    const isLiked = !target.isLiked;
    const likesCount = Math.max(0, target.likesCount + (isLiked ? 1 : -1));
    const updatedPost: SharedListPost = { ...target, isLiked, likesCount };

    listPosts[targetIndex] = updatedPost;
    allPosts[listId] = listPosts;
    savePosts(allPosts);

    return updatedPost;
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    await delay(600);
    const allComments = getComments();
    return allComments[postId] || [];
  }

  async createPostComment(
    postId: string,
    content: string,
  ): Promise<PostComment> {
    await delay(600);
    const allComments = getComments();
    const postComments = allComments[postId] || [];

    // 模擬當前使用者
    const mockUser = {
      id: 'current_user',
      name: 'Me',
      avatar: 'https://ui-avatars.com/api/?name=Me&background=random',
    };

    const newComment: PostComment = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: mockUser.id,
      authorName: mockUser.name,
      authorAvatar: mockUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    postComments.push(newComment);
    allComments[postId] = postComments;
    saveComments(allComments);

    // Update post comments count
    const allPosts = getPosts();
    // For simplicity, search all lists.
    for (const listId in allPosts) {
        const listPosts = allPosts[listId];
        const postIndex = listPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            listPosts[postIndex] = {
                ...listPosts[postIndex],
                commentsCount: listPosts[postIndex].commentsCount + 1
            };
            allPosts[listId] = listPosts;
            savePosts(allPosts);
            break;
        }
    }

    return newComment;
  }

  async deletePost(postId: string, listId: string): Promise<void> {
    await delay(500);
    const allPosts = getPosts();
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
    const allPosts = getPosts();
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
      // Keep other fields
    };

    listPosts[index] = updatedPost;
    allPosts[listId] = listPosts;
    savePosts(allPosts);
    return updatedPost;
  }

  async testReset() {
    localStorage.removeItem('mock_shared_lists');
    localStorage.removeItem('mock_posts');
    localStorage.removeItem('mock_comments');
  }
}

// 內部 helper 存取 comments
let memoryComments: Record<string, PostComment[]> | null = null;

const getComments = (): Record<string, PostComment[]> => {
    if (mockRequestHandlers.shouldResetData()) {
        mockRequestHandlers.resetData(['mock_comments']);
        memoryComments = null;
    }

    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryComments) {
        return memoryComments;
    }

    try {
        const stored = mockRequestHandlers.getItem('mock_comments');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null) {
                memoryComments = parsed;
                return parsed;
            }
        }
    } catch (e) {
         console.warn('Failed to parse mock comments, resetting.', e);
    }

    const defaults: Record<string, PostComment[]> = {
        // 貼文 post_001 的留言
        'post_001': [
            {
                id: 'comment_001',
                postId: 'post_001',
                authorId: 'user_002',
                authorName: 'Zoe',
                authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
                content: '這個烏龍麵看起來超好吃！在哪裡買的？',
                createdAt: '2025-01-05T10:30:00.000Z',
            },
            {
                id: 'comment_002',
                postId: 'post_001',
                authorId: 'user_003',
                authorName: 'Jocelyn',
                authorAvatar: 'https://ui-avatars.com/api/?name=Jocelyn&background=random',
                content: '和牛漢堡必須買！上次吃過超讚 🍔',
                createdAt: '2025-01-05T11:00:00.000Z',
            },
            {
                id: 'comment_003',
                postId: 'post_001',
                authorId: 'user_001',
                authorName: 'Ricky',
                authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
                content: '烏龍麵是在 LOPIA 的熟食區，薄豆皮在冷藏區喔！',
                createdAt: '2025-01-05T11:15:00.000Z',
            },
        ],
        // 貼文 post_dec_001_1 的留言
        'post_dec_001_1': [
            {
                id: 'comment_004',
                postId: 'post_dec_001_1',
                authorId: 'user_003',
                authorName: 'Jocelyn',
                authorAvatar: 'https://ui-avatars.com/api/?name=Jocelyn&background=random',
                content: '裝飾球要買紅色跟金色的嗎？',
                createdAt: '2025-12-10T12:00:00.000Z',
            },
            {
                id: 'comment_005',
                postId: 'post_dec_001_1',
                authorId: 'user_001',
                authorName: 'Ricky',
                authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
                content: '對！紅金配色最有聖誕感 🎄',
                createdAt: '2025-12-10T12:30:00.000Z',
            },
        ],
        // 貼文 post_dec_002_1 的留言
        'post_dec_002_1': [
            {
                id: 'comment_006',
                postId: 'post_dec_002_1',
                authorId: 'user_002',
                authorName: 'Zoe',
                authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
                content: '可以加一些氣泡水嗎？',
                createdAt: '2025-12-20T10:00:00.000Z',
            },
            {
                id: 'comment_007',
                postId: 'post_dec_002_1',
                authorId: 'user_003',
                authorName: 'Jocelyn',
                authorAvatar: 'https://ui-avatars.com/api/?name=Jocelyn&background=random',
                content: '啤酒一箱夠嗎？來的人很多耶',
                createdAt: '2025-12-20T11:00:00.000Z',
            },
            {
                id: 'comment_008',
                postId: 'post_dec_002_1',
                authorId: 'user_001',
                authorName: 'Ricky',
                authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
                content: '好，氣泡水加進去！啤酒我再多買一箱 🍻',
                createdAt: '2025-12-20T11:30:00.000Z',
            },
            {
                id: 'comment_009',
                postId: 'post_dec_002_1',
                authorId: 'user_004',
                authorName: 'Andy',
                authorAvatar: 'https://ui-avatars.com/api/?name=Andy&background=random',
                content: '我可以帶一些手工餅乾過去！',
                createdAt: '2025-12-20T14:00:00.000Z',
            },
            {
                id: 'comment_010',
                postId: 'post_dec_002_1',
                authorId: 'user_002',
                authorName: 'Zoe',
                authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
                content: '太棒了！期待派對～ 🎉',
                createdAt: '2025-12-20T15:00:00.000Z',
            },
        ],
    };
    
    mockRequestHandlers.setItem('mock_comments', JSON.stringify(defaults));
    memoryComments = defaults;
    return defaults;
};

const saveComments = (comments: Record<string, PostComment[]>) => {
    memoryComments = comments;
    mockRequestHandlers.setItem('mock_comments', JSON.stringify(comments));
};
