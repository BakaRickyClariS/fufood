import { api } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { NotificationsApi } from './notificationsApi';
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  BatchDeleteResponse,
  BatchMarkAsReadResponse,
} from '../types';

export const notificationsApiImpl: NotificationsApi = {
  // 發送通知 (v2)
  /** @deprecated 文件已恢復此端點，但建議優先使用後端自動觸發 */
  sendNotification: async (data: any) => {
    return api.post<any>(ENDPOINTS.NOTIFICATIONS.SEND, data);
  },

  // 取得通知列表
  getNotifications: async (params?: GetNotificationsRequest) => {
    const response = await api.get<GetNotificationsResponse>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      params as Record<string, any>,
    );

    if (response.items) {
      response.items = response.items.map((item: any) => ({
        ...item,
        groupName: item.groupName || item.group_name,
        actorName: item.actorName || item.actor_name,
        actorId: item.actorId || item.actor_id,
      }));
    }

    return response;
  },

  // 取得單一通知 (Stub)
  getNotification: async (id: string) => {
    console.warn(
      '⚠️ [API Correction] getNotification is deprecated. Use getNotifications list instead.',
      id,
    );
    return { success: false, message: 'Endpoint removed' };
  },

  // 標記已讀 (Legacy Wrapper)
  markAsRead: async (id: string, data: { isRead: boolean }) => {
    return notificationsApiImpl.markAsReadBatch([id], data.isRead);
  },

  // 刪除通知 (Legacy Wrapper)
  deleteNotification: async (id: string) => {
    return notificationsApiImpl.deleteNotifications([id]);
  },

  // 全部讀取 (Stub)
  readAll: async () => {
    return { success: false, message: 'Endpoint removed' };
  },

  // 取得通知設定
  getSettings: async () => {
    const response = await api.get<GetSettingsResponse>(
      ENDPOINTS.NOTIFICATIONS.SETTINGS,
    );
    return response;
  },

  // 更新通知設定
  updateSettings: async (data: UpdateSettingsRequest) => {
    const response = await api.patch<UpdateSettingsResponse>(
      ENDPOINTS.NOTIFICATIONS.SETTINGS,
      data,
    );
    return response;
  },

  // 批量刪除通知 (Legacy Wrapper)
  deleteNotifications: async (ids: string[]) => {
    const response = await api.post<BatchDeleteResponse>(
      ENDPOINTS.NOTIFICATIONS.BATCH_DELETE,
      { notificationIds: ids },
    );
    return response;
  },

  // 批量標記已讀 (Legacy Wrapper)
  markAsReadBatch: async (ids: string[], isRead: boolean) => {
    const response = await api.patch<BatchMarkAsReadResponse>(
      ENDPOINTS.NOTIFICATIONS.BATCH_READ,
      { notificationIds: ids, isRead },
    );
    return response;
  },
};
