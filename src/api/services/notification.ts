import { backendApi } from '@/api/client';
import type { 
  NotificationSettings 
} from '@/modules/notifications/types';

export interface RegisterTokenRequest {
  fcmToken: string;
  deviceType?: 'web' | 'android' | 'ios';
}

export const notificationService = {
  /**
   * 將 FCM Token 傳送至後端儲存
   */
  registerToken: async (token: string) => {
    return backendApi.post<void>('/api/v1/notifications/token', {
      fcmToken: token,
      deviceType: 'web',
    });
  },

  /**
   * 更新通知設定
   */
  updateSettings: async (settings: Partial<NotificationSettings>) => {
    return backendApi.patch('/api/v1/notifications/settings', settings);
  },

  /**
   * 取得通知設定
   */
  getSettings: async () => {
    // 假設後端回傳結構符合 GetSettingsResponse.data
    // 這裡直接回傳 data 部分
    return backendApi.get<{ settings: NotificationSettings }>('/api/v1/notifications/settings');
  },

  /**
   * 取得通知列表
   */
  getNotifications: async (params?: any) => {
    return backendApi.get('/api/v1/notifications', { params });
  }
};

