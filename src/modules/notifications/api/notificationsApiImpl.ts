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
} from '../types';

export const notificationsApiImpl: NotificationsApi = {
  // 取得通知列表
  getNotifications: async (params?: GetNotificationsRequest) => {
    // aiApi.get 會自動處理 response.json()
    // 假設後端回傳格式符合 GetNotificationsResponse
    // 這裡需要根據實際後端回傳格式做調整，如果後端直接回傳 { items: [], total: 0 }
    // 而不用 ApiSuccess 包裹，可能需要手動包裝
    
    // 暫定後端回傳標準格式
    return aiApi.get<GetNotificationsResponse>('/notifications', params as Record<string, any>);
  },

  // 取得單一通知
  getNotification: async (id: string) => {
    return aiApi.get<GetNotificationResponse>(`/notifications/${id}`);
  },

  // 標記已讀
  markAsRead: async (id: string, data: MarkAsReadRequest) => {
    return aiApi.patch<MarkAsReadResponse>(`/notifications/${id}/read`, data);
  },

  // 刪除通知
  deleteNotification: async (id: string) => {
    return aiApi.delete<DeleteNotificationResponse>(`/notifications/${id}`);
  },

  // 全部標記已讀
  readAll: async () => {
    return aiApi.post<ReadAllResponse>('/notifications/read-all');
  },

  // 取得設定
  getSettings: async () => {
    return aiApi.get<GetSettingsResponse>('/notifications/settings');
  },

  // 更新設定
  updateSettings: async (data: UpdateSettingsRequest) => {
    return aiApi.patch<UpdateSettingsResponse>('/notifications/settings', data);
  },

  // 批次刪除
  deleteNotifications: async (ids: string[]) => {
    // 使用 HTTP DELETE with body (注意：並非所有後端/瀏覽器都完美支援 DELETE body，
    // 若後端不支援，可改用 POST /notifications/batch-delete)
    // 這裡假設後端支援或改用 POST
    // 為了相容性，建議用 POST
    return aiApi.post<BatchDeleteResponse>('/notifications/batch-delete', { ids });
  },

  // 批次標記已讀
  markAsReadBatch: async (ids: string[], isRead: boolean) => {
    return aiApi.post<BatchMarkAsReadResponse>('/notifications/batch-read', { ids, isRead });
  },
};
