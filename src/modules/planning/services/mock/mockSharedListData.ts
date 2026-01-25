import type { SharedList } from '@/modules/planning/types/sharedList';
import type { SharedListPost } from '@/modules/planning/types/sharedList';
import { COVER_IMAGES } from '../../constants/coverImages';

const NOW = new Date().toISOString();

export const MOCK_SHARED_LISTS: SharedList[] = [
  // 2025年12月 - 當前月份
  {
    id: 'list_dec_001',
    title: '週末聖誕大餐採購',
    coverPhotoPath: COVER_IMAGES[0],
    startsAt: '2025-12-14T00:00:00.000Z',
    status: 'in-progress',
    enableNotifications: true,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
  {
    id: 'list_dec_002',
    title: '聖誕派對食材',
    coverPhotoPath: COVER_IMAGES[1],
    startsAt: '2025-12-24T00:00:00.000Z',
    status: 'in-progress',
    enableNotifications: true,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
  {
    id: 'list_dec_003',
    title: '跨年夜Party',
    coverPhotoPath: COVER_IMAGES[2],
    startsAt: '2025-12-31T00:00:00.000Z',
    status: 'in-progress', // pending -> in-progress as it is future
    enableNotifications: false,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
  // 2026年1月
  {
    id: 'list_001',
    title: 'LOPIA買都買',
    coverPhotoPath: COVER_IMAGES[3],
    startsAt: '2026-01-05T00:00:00.000Z',
    status: 'in-progress',
    enableNotifications: true,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
  {
    id: 'list_002',
    title: '爆買Costco',
    coverPhotoPath: COVER_IMAGES[4],
    startsAt: '2026-01-09T00:00:00.000Z',
    status: 'in-progress',
    enableNotifications: false,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
  // 2025年11月（過去）
  {
    id: 'list_nov_001',
    title: '感恩節火雞',
    coverPhotoPath: COVER_IMAGES[5],
    startsAt: '2025-11-28T00:00:00.000Z',
    status: 'completed',
    enableNotifications: true,
    createdAt: NOW,
    refrigeratorId: 'group_001',
  },
];

const createMockItem = (
  base: Partial<SharedListPost['items'][0]>,
): SharedListPost['items'][0] => ({
  id: base.id || Math.random().toString(36).substr(2, 9),
  name: base.name || 'Mock Item',
  quantity: base.quantity || 1,
  unit: base.unit || '個',
  photoPath: base.photoPath || base.imageUrl || null,
  imageUrl: base.imageUrl || base.photoPath || null,
  creatorId: 'mock-creator',
  shoppingListId: 'mock-list',
  createdAt: NOW,
  updatedAt: NOW,
  ...base,
});

export const MOCK_SHARED_LIST_POSTS: SharedListPost[] = [
  {
    id: 'post_1',
    listId: 'list_1',
    authorId: 'user_1',
    authorName: 'Ricky',
    authorAvatar: 'https://i.pravatar.cc/150?u=ricky',
    content: '準備週末烤肉派對的食材！大家都來幫忙買一點吧～',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    items: [
      createMockItem({
        id: 'item_1',
        name: '美國安格斯牛小排',
        quantity: 2,
        unit: '盒',
        imageUrl:
          'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=200&auto=format&fit=crop',
      }),
      createMockItem({
        id: 'item_2',
        name: '特級梅花豬肉片',
        quantity: 3,
        unit: '盒',
      }),
      createMockItem({
        id: 'item_3',
        name: '日式燒肉醬',
        quantity: 1,
        unit: '罐',
        imageUrl:
          'https://images.unsplash.com/photo-1626507425121-a3c3d52cb348?q=80&w=200&auto=format&fit=crop',
      }),
    ],
  },
  {
    id: 'post_2',
    listId: 'list_1',
    authorId: 'user_2',
    authorName: 'Sarah',
    authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
    content: '飲料和蔬菜的部分我來負責',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    items: [
      createMockItem({
        id: 'item_4',
        name: '可口可樂',
        quantity: 6,
        unit: '罐',
      }),
      createMockItem({
        id: 'item_5',
        name: '玉米筍',
        quantity: 2,
        unit: '包',
      }),
      createMockItem({
        id: 'item_6',
        name: '青椒',
        quantity: 3,
        unit: '個',
      }),
    ],
  },
  {
    id: 'post_3',
    listId: 'list_2',
    authorId: 'user_3',
    authorName: 'Mike',
    authorAvatar: 'https://i.pravatar.cc/150?u=mike',
    content: '火鍋料買這些夠嗎？',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    items: [
      createMockItem({
        id: 'item_7',
        name: '凍豆腐',
        quantity: 1,
        unit: '包',
        imageUrl:
          'https://images.unsplash.com/photo-1549221193-41ec2919d3ee?q=80&w=200&auto=format&fit=crop',
      }),
      createMockItem({
        id: 'item_8',
        name: '貢丸',
        quantity: 1,
        unit: '斤',
      }),
      createMockItem({
        id: 'item_9',
        name: '魚餃',
        quantity: 2,
        unit: '盒',
      }),
    ],
  },
  {
    id: 'post_4',
    listId: 'list_2',
    authorId: 'user_1',
    authorName: 'Ricky',
    authorAvatar: 'https://i.pravatar.cc/150?u=ricky',
    content: '再加一些青菜',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 1 day 1 hour ago
    items: [
      createMockItem({
        id: 'item_10',
        name: '高麗菜',
        quantity: 1,
        unit: '顆',
        imageUrl:
          'https://images.unsplash.com/photo-1629857905757-b08bc8847120?q=80&w=200&auto=format&fit=crop',
      }),
      createMockItem({
        id: 'item_11',
        name: '金針菇',
        quantity: 2,
        unit: '包',
      }),
      createMockItem({
        id: 'item_12',
        name: '茼蒿',
        quantity: 3,
        unit: '把',
      }),
    ],
  },
  {
    id: 'post_5',
    listId: 'list_3',
    authorId: 'user_2',
    authorName: 'Sarah',
    authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
    content: 'Costco 特價清單',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    items: [
      createMockItem({
        id: 'item_13',
        name: '貝果',
        quantity: 2,
        unit: '袋',
      }),
      createMockItem({
        id: 'item_14',
        name: '烤雞',
        quantity: 1,
        unit: '隻',
      }),
      createMockItem({
        id: 'item_15',
        name: '鮮奶',
        quantity: 2,
        unit: '瓶',
      }),
    ],
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
      images: [
        COVER_IMAGES[6],
        COVER_IMAGES[7],
        COVER_IMAGES[0],
        COVER_IMAGES[1],
        COVER_IMAGES[2],
      ],
      items: [
        createMockItem({
          id: 'item_01',
          name: '烏龍麵',
          quantity: 1,
          unit: '份',
          imageUrl: COVER_IMAGES[6],
        }),
        createMockItem({ id: 'item_02', name: '薄豆皮', quantity: 1, unit: '罐' }),
        createMockItem({
          id: 'item_03',
          name: '和牛漢堡（熟食）',
          quantity: 1,
          unit: '份',
          imageUrl: COVER_IMAGES[0],
        }),
      ],
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
        createMockItem({
          id: 'item_04',
          name: '極小粒納豆（1組3盒裝）',
          quantity: 1,
          unit: '組',
        }),
      ],
      createdAt: '2025-01-05T11:00:00.000Z',
    },
  ],
  list_dec_001: [
    {
      id: 'post_dec_001_1',
      listId: 'list_dec_001',
      authorId: 'user_001',
      authorName: 'Ricky',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
      content: '大家記得要買聖誕節的裝飾品喔！',
      images: [COVER_IMAGES[0]],
      items: [
        createMockItem({ id: 'item_dec_01', name: '聖誕樹裝飾球', quantity: 2, unit: '盒' }),
        createMockItem({ id: 'item_dec_02', name: '彩帶', quantity: 3, unit: '捲' }),
      ],
      createdAt: '2025-12-10T10:00:00.000Z',
    },
    {
      id: 'post_dec_001_2',
      listId: 'list_dec_001',
      authorId: 'user_002',
      authorName: 'Zoe',
      authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
      content: '這家的火雞看起來很不錯',
      images: [COVER_IMAGES[5]],
      items: [
        createMockItem({
          id: 'item_dec_03',
          name: '大火雞',
          quantity: 1,
          unit: '隻',
          imageUrl: COVER_IMAGES[5],
        }),
      ],
      createdAt: '2025-12-11T14:30:00.000Z',
    },
  ],
  list_dec_002: [
    {
      id: 'post_dec_002_1',
      listId: 'list_dec_002',
      authorId: 'user_001',
      authorName: 'Ricky',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
      content: '派對飲料清單，還有要補充的嗎？',
      images: [],
      items: [
        createMockItem({ id: 'item_dec_21', name: '可樂', quantity: 6, unit: '瓶' }),
        createMockItem({ id: 'item_dec_22', name: '柳橙汁', quantity: 3, unit: '瓶' }),
        createMockItem({ id: 'item_dec_23', name: '啤酒', quantity: 1, unit: '箱' }),
      ],
      createdAt: '2025-12-20T09:00:00.000Z',
    },
  ],
  list_dec_003: [
    {
      id: 'post_dec_003_1',
      listId: 'list_dec_003',
      authorId: 'user_003',
      authorName: 'Jocelyn',
      authorAvatar:
        'https://ui-avatars.com/api/?name=Jocelyn&background=random',
      content: '跨年就是要看煙火吃炸雞！',
      images: [COVER_IMAGES[2]],
      items: [
        createMockItem({
          id: 'item_dec_31',
          name: '全家福炸雞桶',
          quantity: 2,
          unit: '桶',
          imageUrl: COVER_IMAGES[2],
        }),
        createMockItem({ id: 'item_dec_32', name: '快樂水（可樂）', quantity: 4, unit: '瓶' }),
      ],
      createdAt: '2025-12-31T20:00:00.000Z',
    },
  ],
  list_002: [
    {
      id: 'post_002_1',
      listId: 'list_002',
      authorId: 'user_001',
      authorName: 'Ricky',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ricky&background=random',
      content: 'Costco 必買清單，大家還有要加什麼嗎？',
      images: [COVER_IMAGES[4]],
      items: [
        createMockItem({ id: 'item_002_1', name: '18吋大披薩', quantity: 2, unit: '個' }),
        createMockItem({ id: 'item_002_2', name: '科克蘭衛生紙', quantity: 1, unit: '串' }),
        createMockItem({ id: 'item_002_3', name: '美國頂級牛小排', quantity: 2, unit: '盒' }),
      ],
      createdAt: '2026-01-08T10:00:00.000Z',
    },
  ],
  list_nov_001: [
    {
      id: 'post_nov_001_1',
      listId: 'list_nov_001',
      authorId: 'user_002',
      authorName: 'Zoe',
      authorAvatar: 'https://ui-avatars.com/api/?name=Zoe&background=random',
      content: '感恩節大餐大成功！火雞烤得剛剛好～',
      images: [COVER_IMAGES[5]],
      items: [
        createMockItem({ id: 'item_nov_01', name: '火雞', quantity: 1, unit: '隻' }),
        createMockItem({ id: 'item_nov_02', name: '蔓越莓醬', quantity: 2, unit: '罐' }),
      ],
      createdAt: '2025-11-28T19:00:00.000Z',
    },
  ],
};
