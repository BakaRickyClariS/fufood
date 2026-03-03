import { aiApi } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { NotificationSettings } from '@/modules/notifications/types';

export type RegisterTokenRequest = {
  fcmToken: string;
  deviceType?: 'web' | 'android' | 'ios';
};

export const notificationService = {
  /**
   * 將 FCM Token 傳送至 AI 後端儲存
   */
  registerToken: async (token: string) => {
    return aiApi.post<void>(ENDPOINTS.NOTIFICATIONS.TOKEN, {
      fcmToken: token,
      deviceType: 'web',
    });
  },

  /**
   * 更新通知設定
   */
  updateSettings: async (settings: Partial<NotificationSettings>) => {
    return aiApi.patch(ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
  },

  /**
   * 取得通知設定
   */
  getSettings: async () => {
    return aiApi.get<{ success: boolean; data: NotificationSettings }>(
      ENDPOINTS.NOTIFICATIONS.SETTINGS,
    );
  },

  /**
   * 取得通知列表
   */
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    return aiApi.get(ENDPOINTS.NOTIFICATIONS.LIST, params);
  },
  /**
   * @deprecated 文件已恢復此端點，但建議優先使用後端自動觸發。
   */
  sendNotification: async (data: any) => {
    return aiApi.post<any>(ENDPOINTS.NOTIFICATIONS.SEND, data);
  },
};
