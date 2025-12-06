import type { SharedList } from '@/modules/planning/types/sharedList';
import type { SharedListPost } from '@/modules/planning/types/post';
import { COVER_IMAGES } from '../../constants/coverImages';

const NOW = new Date().toISOString();

export const MOCK_SHARED_LISTS: SharedList[] = [
  // 2025年12月 - 當前月份
  {
    id: 'list_dec_001',
    name: '週末聖誕大餐採購',
    coverImageUrl: COVER_IMAGES[0],
    scheduledDate: '2025-12-14T00:00:00.000Z',
    status: 'in-progress',
    notifyEnabled: true,
    createdAt: NOW,
    groupId: 'group_001',
  },
  {
    id: 'list_dec_002',
    name: '聖誕派對食材',
    coverImageUrl: COVER_IMAGES[1],
    scheduledDate: '2025-12-24T00:00:00.000Z',
    status: 'in-progress',
    notifyEnabled: true,
    createdAt: NOW,
    groupId: 'group_001',
  },
  {
    id: 'list_dec_003',
    name: '跨年夜Party',
    coverImageUrl: COVER_IMAGES[2],
    scheduledDate: '2025-12-31T00:00:00.000Z',
    status: 'pending-purchase',
    notifyEnabled: false,
    createdAt: NOW,
    groupId: 'group_001',
  },
  // 2026年1月
  {
    id: 'list_001',
    name: 'LOPIA買都買',
    coverImageUrl: COVER_IMAGES[3],
    scheduledDate: '2026-01-05T00:00:00.000Z',
    status: 'in-progress',
    notifyEnabled: true,
    createdAt: NOW,
    groupId: 'group_001',
  },
  {
    id: 'list_002',
    name: '爆買Costco',
    coverImageUrl: COVER_IMAGES[4],
    scheduledDate: '2026-01-09T00:00:00.000Z',
    status: 'pending-purchase',
    notifyEnabled: false,
    createdAt: NOW,
    groupId: 'group_001',
  },
  // 2025年11月（過去）
  {
    id: 'list_nov_001',
    name: '感恩節火雞',
    coverImageUrl: COVER_IMAGES[5],
    scheduledDate: '2025-11-28T00:00:00.000Z',
    status: 'completed',
    notifyEnabled: true,
    createdAt: NOW,
    groupId: 'group_001',
  },
];

export const MOCK_POSTS: Record<string, SharedListPost[]> = {
  list_001: [
    {
      id: 'post_001',
      listId: 'list_001',
      authorId: 'user_001',
      authorName: 'Ricky',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
      content: '',
      images: [COVER_IMAGES[6], COVER_IMAGES[7]],
      items: [
        { id: 'item_01', name: '烏龍麵', quantity: 1, unit: '份' },
        { id: 'item_02', name: '薄豆皮', quantity: 1, unit: '罐' },
        { id: 'item_03', name: '和牛漢堡（熟食）', quantity: 1, unit: '份' },
      ],
      likesCount: 1,
      commentsCount: 1,
      isLiked: true,
      createdAt: '2025-01-05T10:00:00.000Z',
    },
    {
      id: 'post_002',
      listId: 'list_001',
      authorId: 'user_002',
      authorName: 'Zoe',
      authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
      content: '特價中！',
      images: [],
      items: [
        {
          id: 'item_04',
          name: '極小粒納豆（1組3盒裝）',
          quantity: 1,
          unit: '組',
        },
      ],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: '2025-01-05T11:00:00.000Z',
    },
  ],
};
