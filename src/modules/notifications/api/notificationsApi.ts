/**
 * 通知 API 介面定義
 */
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
} from '../types';

export type NotificationsApi = {
  // 取得通知列表
  getNotifications: (
    params?: GetNotificationsRequest,
  ) => Promise<GetNotificationsResponse>;

  // 取得單一通知
  getNotification: (id: string) => Promise<GetNotificationResponse>;

  // 標記已讀
  markAsRead: (
    id: string,
    data: MarkAsReadRequest,
  ) => Promise<MarkAsReadResponse>;

  // 刪除通知
  deleteNotification: (id: string) => Promise<DeleteNotificationResponse>;

  // 全部標記已讀
  readAll: () => Promise<ReadAllResponse>;

  // 取得設定
  getSettings: () => Promise<GetSettingsResponse>;

  // 更新設定
  updateSettings: (
    data: UpdateSettingsRequest,
  ) => Promise<UpdateSettingsResponse>;
};
