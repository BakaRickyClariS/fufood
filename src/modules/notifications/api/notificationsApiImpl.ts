import { aiApi } from '@/api/client';
import type { NotificationsApi } from './notificationsApi';
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetNotificationResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  DeleteNotificationResponse,
  ReadAllResponse,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  BatchDeleteResponse,
  BatchMarkAsReadResponse,
  SendNotificationRequest, // Added
  SendNotificationResponse, // Added
} from '../types';

export const notificationsApiImpl: NotificationsApi = {
  // 發送通知
  sendNotification: async (data: SendNotificationRequest) => {
    return aiApi.post<SendNotificationResponse>(
      '/api/v1/notifications/send',
      data,
    );
  },

  // 取得通知列表
  getNotifications: async (params?: GetNotificationsRequest) => {
    const response = await aiApi.get<GetNotificationsResponse>(
      '/api/v1/notifications',
      params as Record<string, any>,
    );

    if (response.success && response.data.items) {
      console.log(
        '🔍 [Notification Debug] Raw Items from Backend:',
        // 只印出前 3 筆以避免 log 過長
        response.data.items.slice(0, 3).map((i) => ({
          type: i.type,
          subType: i.subType,
          actor_name: (i as any).actor_name,
          actorName: i.actorName,
          group_name: (i as any).group_name,
          groupName: i.groupName,
        })),
      );

      // 資料轉換：處理後端 snake_case 轉前端 camelCase
      response.data.items = response.data.items.map((item: any) => ({
        ...item,
        groupName: item.groupName || item.group_name,
        actorName: item.actorName || item.actor_name,
        actorId: item.actorId || item.actor_id,
      }));
    }

    return response;
  },

  // 取得單一通知
  getNotification: async (id: string) => {
    const response = await aiApi.get<GetNotificationResponse>(
      `/api/v1/notifications/${id}`,
    );

    if (response.success && response.data.item) {
      const item: any = response.data.item;
      response.data.item = {
        ...item,
        groupName: item.groupName || item.group_name,
        actorName: item.actorName || item.actor_name,
        actorId: item.actorId || item.actor_id,
      };
    }

    return response;
  },

  // 標記已讀
  markAsRead: async (id: string, data: MarkAsReadRequest) => {
    return aiApi.patch<MarkAsReadResponse>(
      `/api/v1/notifications/${id}/read`,
      data,
    );
  },

  // 刪除通知
  deleteNotification: async (id: string) => {
    return aiApi.delete<DeleteNotificationResponse>(
      `/api/v1/notifications/${id}`,
    );
  },

  // 全部標記已讀
  readAll: async () => {
    return aiApi.post<ReadAllResponse>('/api/v1/notifications/read-all');
  },

  // 取得設定
  getSettings: async () => {
    return aiApi.get<GetSettingsResponse>('/api/v1/notifications/settings');
  },

  // 更新設定
  updateSettings: async (data: UpdateSettingsRequest) => {
    return aiApi.patch<UpdateSettingsResponse>(
      '/api/v1/notifications/settings',
      data,
    );
  },

  // 批次刪除
  deleteNotifications: async (ids: string[]) => {
    // 使用 HTTP DELETE with body (注意：並非所有後端/瀏覽器都完美支援 DELETE body，
    // 若後端不支援，可改用 POST /notifications/batch-delete)
    // 這裡假設後端支援或改用 POST
    // 為了相容性，建議用 POST
    return aiApi.post<BatchDeleteResponse>(
      '/api/v1/notifications/batch-delete',
      {
        ids,
      },
    );
  },

  // 批次標記已讀
  markAsReadBatch: async (ids: string[], isRead: boolean) => {
    return aiApi.post<BatchMarkAsReadResponse>(
      '/api/v1/notifications/batch-read',
      {
        ids,
        isRead,
      },
    );
  },
};
