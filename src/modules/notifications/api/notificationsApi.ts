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
  BatchDeleteResponse,
  BatchMarkAsReadResponse,
  SendNotificationRequest, // Added
  SendNotificationResponse, // Added
} from '../types';

export type NotificationsApi = {
  // 發送通知 (新增)
  sendNotification: (
    data: SendNotificationRequest,
  ) => Promise<SendNotificationResponse>;

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

  // 批次刪除
  deleteNotifications: (ids: string[]) => Promise<BatchDeleteResponse>;

  // 批次標記已讀
  markAsReadBatch: (
    ids: string[],
    isRead: boolean,
  ) => Promise<BatchMarkAsReadResponse>;
};
