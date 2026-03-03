/**
 * 通知 API 介面定義
 */
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  BatchDeleteResponse,
  BatchMarkAsReadResponse,
} from '../types';

export type NotificationsApi = {
  /** @deprecated 文件已恢復此端點，但建議優先使用後端自動觸發 */
  sendNotification: (data: any) => Promise<any>;

  // 取得通知列表
  getNotifications: (
    params?: GetNotificationsRequest,
  ) => Promise<GetNotificationsResponse>;

  /** @deprecated 文件已移除此端點，請從列表取得資料 */
  getNotification: (id: string) => Promise<any>;

  // 標記已讀（單筆應整合至批次）
  /** @deprecated 請改用 markAsReadBatch */
  markAsRead: (id: string, data: { isRead: boolean }) => Promise<any>;

  // 刪除通知（單筆應整合至批次）
  /** @deprecated 請改用 deleteNotifications */
  deleteNotification: (id: string) => Promise<any>;

  /** @deprecated 文件已移除此端點 */
  readAll: () => Promise<any>;

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
