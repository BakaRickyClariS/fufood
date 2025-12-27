/**
 * 通知模組 Mock API 實作
 */
import type { NotificationsApi } from '../notificationsApi';
import type {
  GetNotificationsRequest,
  NotificationCategory,
  NotificationSettings,
} from '../../types';
import {
  ALL_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from './notificationsMockData';

// 模擬延遲
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 本地儲存的通知狀態
let notifications = [...ALL_NOTIFICATIONS];
let settings: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };

// 根據分類取得通知
const getNotificationsByCategory = (category?: NotificationCategory) => {
  if (!category) return notifications;

  switch (category) {
    case 'stock':
      return notifications.filter((n) => n.category === 'stock');
    case 'inspiration':
      return notifications.filter((n) => n.category === 'inspiration');
    case 'official':
      return notifications.filter((n) => n.category === 'official');
    default:
      return notifications;
  }
};

export const notificationsMockApi: NotificationsApi = {
  // 取得通知列表
  getNotifications: async (params?: GetNotificationsRequest) => {
    await delay(300);

    let items = getNotificationsByCategory(params?.category);

    // 依已讀狀態篩選
    if (params?.isRead !== undefined) {
      items = items.filter((n) => n.isRead === params.isRead);
    }

    // 分頁
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      status: true,
      data: {
        items: paginatedItems,
        total: items.length,
        unreadCount: items.filter((n) => !n.isRead).length,
      },
    };
  },

  // 取得單一通知
  getNotification: async (id: string) => {
    await delay(200);

    const item = notifications.find((n) => n.id === id);
    if (!item) {
      throw new Error('Notification not found');
    }

    return {
      status: true,
      data: { item },
    };
  },

  // 標記已讀
  markAsRead: async (id: string, data) => {
    await delay(200);

    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], isRead: data.isRead };
    }

    return {
      status: true,
      data: { id },
    };
  },

  // 刪除通知
  deleteNotification: async (id: string) => {
    await delay(200);

    notifications = notifications.filter((n) => n.id !== id);

    return {
      status: true,
      data: {},
    };
  },

  // 全部標記已讀
  readAll: async () => {
    await delay(300);

    const count = notifications.filter((n) => !n.isRead).length;
    notifications = notifications.map((n) => ({ ...n, isRead: true }));

    return {
      status: true,
      data: { count },
    };
  },

  // 取得設定
  getSettings: async () => {
    await delay(200);

    return {
      status: true,
      data: { settings },
    };
  },

  // 更新設定
  updateSettings: async (data) => {
    await delay(200);

    settings = { ...settings, ...data };

    return {
      status: true,
      data: { settings },
    };
  },

  // 批次刪除
  deleteNotifications: async (ids: string[]) => {
    await delay(200);

    const initialLength = notifications.length;
    notifications = notifications.filter((n) => !ids.includes(n.id));
    const deletedCount = initialLength - notifications.length;

    return {
      status: true,
      data: { deletedCount },
    };
  },

  // 批次標記已讀
  markAsReadBatch: async (ids: string[], isRead: boolean) => {
    await delay(300);

    let updatedCount = 0;
    notifications = notifications.map((n) => {
      if (ids.includes(n.id)) {
        if (n.isRead !== isRead) {
          updatedCount++;
        }
        return { ...n, isRead };
      }
      return n;
    });

    return {
      status: true,
      data: { updatedCount },
    };
  },
};
