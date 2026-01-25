/**
 * 通知模組 Mock 資料
 * 依據後端 API 規格更新
 */
import type { NotificationMessage, NotificationSettings } from '../../types';

// 食材管家通知
export const STOCK_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: 'stock-1',
    category: 'stock',
    type: 'inventory',
    title: 'AI 辨識完成！食材已入庫',
    message: '剛買的食材已安全進入庫房，快去看看庫房！',
    isRead: false,
    createdAt: '2026-01-05T10:30:00Z',
    action: { type: 'inventory', payload: { itemId: 'veg-1' } },
  },
  {
    id: 'stock-2',
    category: 'stock',
    type: 'inventory',
    title: '最後救援！檸檬塔 今天到期',
    message:
      '就是今天！它是冰箱裡最需要被吃掉的，現在把它變成美味料理，放進肚子裡吧！',
    isRead: false,
    createdAt: '2026-01-05T09:00:00Z',
    action: { type: 'inventory', payload: { itemId: 'manual-expired-1' } },
  },
  {
    id: 'stock-3',
    category: 'stock',
    type: 'group',
    title: '生烏龍麵 快沒了，該補貨囉！',
    message:
      '報告！庫存已低於安全水位，小隊已自動幫你加入「共享採買清單」，下班順路帶它回家吧！',
    isRead: true,
    createdAt: '2026-01-04T14:20:00Z',
    action: { type: 'shopping-list', payload: { listId: 'list-1' } },
  },
  {
    id: 'stock-4',
    category: 'stock',
    type: 'inventory',
    title: '搶救倒數！檸檬塔 快過期了',
    message:
      '冰箱小隊發現它只剩 2 天就要變垃圾了！別讓錢錢飛走，快點我看看「智慧食譜」怎麼變美味！',
    isRead: true,
    createdAt: '2026-01-03T16:45:00Z',
    action: { type: 'recipe', payload: { recipeId: 'dashboard-1' } },
  },
  {
    id: 'stock-5',
    category: 'stock',
    type: 'inventory',
    title: '阿福發現，白花椰菜 正在變老...',
    message:
      '蔬菜鮮度正在下降中！為了營養與口感，今天優先料理它們吧，守護你的零浪費生活！',
    isRead: true,
    createdAt: '2026-01-03T11:30:00Z',
    action: { type: 'inventory', payload: { itemId: 'veg-3' } },
  },
];

// 靈感生活通知
export const INSPIRATION_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: 'insp-1',
    category: 'inspiration',
    type: 'system',
    title: '今晚吃什麼？我有靈感！',
    message:
      '冰箱還有大陸A菜 和 生烏龍麵，試試這道「20分鐘快速上菜」吧，今晚就要吃得營養又輕鬆！',
    isRead: false,
    createdAt: '2026-01-05T18:00:00Z',
    action: { type: 'recipe', payload: { recipeId: 'dashboard-2' } },
  },
  {
    id: 'insp-2',
    category: 'inspiration',
    type: 'system',
    title: '週末清冰箱，釋放新空間！',
    message:
      '清掉舊食材，才能裝下週的新鮮！點我看還有哪些隱藏隊員需要被優先消耗。',
    isRead: true,
    createdAt: '2026-01-03T10:00:00Z',
    action: { type: 'inventory' },
  },
];

// 官方公告通知
export const OFFICIAL_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: 'official-1',
    category: 'official',
    type: 'system',
    title: '服務維護通知',
    message:
      '為了提供更穩定的 100GB 雲端空間，我們將於 [日期/時間] 進行短暫維護，敬請見諒。',
    isRead: false,
    createdAt: '2026-01-05T08:00:00Z',
    action: { type: 'detail' },
  },
  {
    id: 'official-2',
    category: 'official',
    type: 'system',
    title: '冰箱小隊進化了！新功能登場',
    message:
      '我們優化了 AI 辨識速度與介面體驗，快來更新 App，感受更流暢的智慧管理吧！',
    isRead: false,
    createdAt: '2026-01-05T07:30:00Z',
    action: { type: 'detail' },
  },
  {
    id: 'official-3',
    category: 'official',
    type: 'system',
    title: '給小隊員的驚喜更新',
    message:
      '發現新版本！修復了已知問題並加入更多可愛插畫，快去更新，讓管理冰箱變得更有趣。',
    isRead: true,
    createdAt: '2026-01-03T09:00:00Z',
    action: { type: 'detail' },
  },
];

// 所有通知
export const ALL_NOTIFICATIONS: NotificationMessage[] = [
  ...STOCK_NOTIFICATIONS,
  ...INSPIRATION_NOTIFICATIONS,
  ...OFFICIAL_NOTIFICATIONS,
];

// 預設通知設定（依後端欄位名稱）
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notifyPush: true,
  notifyExpiry: true,
  notifyMarketing: false,
  notifyLowStock: true,
  daysBeforeExpiry: 3,
};
