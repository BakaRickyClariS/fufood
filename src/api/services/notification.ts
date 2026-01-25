import { aiApi } from '@/api/client';
import type { 
  NotificationSettings,
  SendNotificationRequest,
} from '@/modules/notifications/types';

export type RegisterTokenRequest = {
  fcmToken: string;
  deviceType?: 'web' | 'android' | 'ios';
};

export type SendNotificationResponse = {
  success: boolean;
  data: {
    sent: number;
    failed: number;
    details: {
      success: string[];
      failed: string[];
    };
  };
};

export const notificationService = {
  /**
   * 將 FCM Token 傳送至 AI 後端儲存
   */
  registerToken: async (token: string) => {
    return aiApi.post<void>('/notifications/token', {
      fcmToken: token,
      deviceType: 'web',
    });
  },

  /**
   * 更新通知設定
   */
  updateSettings: async (settings: Partial<NotificationSettings>) => {
    return aiApi.patch('/notifications/settings', settings);
  },

  /**
   * 取得通知設定
   */
  getSettings: async () => {
    return aiApi.get<{ success: boolean; data: NotificationSettings }>('/notifications/settings');
  },

  /**
   * 取得通知列表
   */
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    return aiApi.get('/notifications', params);
  },

  /**
   * 發送推播通知給多個使用者
   * 用於：入庫、消耗、群組變更、購物清單更新等事件
   */
  sendNotification: async (data: SendNotificationRequest) => {
    console.log('🚀 [Notification Debug] Payload:', JSON.stringify(data, null, 2));
    try {
      return await aiApi.post<SendNotificationResponse>('/notifications/send', data);
    } catch (error: any) {
      console.error('❌ [Notification Debug] Error:', error);
      if (error.data) {
        console.error('❌ [Notification Debug] Error Data:', JSON.stringify(error.data, null, 2));
      }
      throw error;
    }
  },
};
