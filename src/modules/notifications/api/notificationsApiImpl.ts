import { backendApi } from '@/api/client';
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
    // backendApi.get 會自動處理 response.json()
    // 假設後端回傳格式符合 GetNotificationsResponse
    // 這裡需要根據實際後端回傳格式做調整，如果後端直接回傳 { items: [], total: 0 }
    // 而不用 ApiSuccess 包裹，可能需要手動包裝
    
    // 暫定後端回傳標準格式
    return backendApi.get<GetNotificationsResponse>('/api/v1/notifications', params as Record<string, any>);
  },

  // 取得單一通知
  getNotification: async (id: string) => {
    return backendApi.get<GetNotificationResponse>(`/api/v1/notifications/${id}`);
  },

  // 標記已讀
  markAsRead: async (id: string, data: MarkAsReadRequest) => {
    return backendApi.patch<MarkAsReadResponse>(`/api/v1/notifications/${id}/read`, data);
  },

  // 刪除通知
  deleteNotification: async (id: string) => {
    return backendApi.delete<DeleteNotificationResponse>(`/api/v1/notifications/${id}`);
  },

  // 全部標記已讀
  readAll: async () => {
    return backendApi.post<ReadAllResponse>('/api/v1/notifications/read-all');
  },

  // 取得設定
  getSettings: async () => {
    return backendApi.get<GetSettingsResponse>('/api/v1/notifications/settings');
  },

  // 更新設定
  updateSettings: async (data: UpdateSettingsRequest) => {
    return backendApi.patch<UpdateSettingsResponse>('/api/v1/notifications/settings', data);
  },

  // 批次刪除
  deleteNotifications: async (ids: string[]) => {
    // 使用 HTTP DELETE with body (注意：並非所有後端/瀏覽器都完美支援 DELETE body，
    // 若後端不支援，可改用 POST /api/v1/notifications/batch-delete)
    // 這裡假設後端支援或改用 POST
    // 為了相容性，建議用 POST
    return backendApi.post<BatchDeleteResponse>('/api/v1/notifications/batch-delete', { ids });
  },

  // 批次標記已讀
  markAsReadBatch: async (ids: string[], isRead: boolean) => {
    return backendApi.post<BatchMarkAsReadResponse>('/api/v1/notifications/batch-read', { ids, isRead });
  },
};
