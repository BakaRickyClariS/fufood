/**
 * 通知模組 API 型別定義
 */
import type {
  NotificationCategory,
  NotificationMessage,
  NotificationSettings,
} from './notification.types';

// 標準 API 回應（符合後端實際格式）
export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

// 取得通知列表請求
export type GetNotificationsRequest = {
  category?: NotificationCategory;
  page?: number;
  limit?: number;
  isRead?: boolean;
};

// 取得通知列表回應
export type GetNotificationsResponse = {
  items: NotificationMessage[];
  total: number;
  unreadCount: number;
};

// 取得設定回應（後端回傳 data 直接是 NotificationSettings）
export type GetSettingsResponse = ApiSuccess<NotificationSettings>;

// 更新設定請求
export type UpdateSettingsRequest = Partial<NotificationSettings>;

// 更新設定回應
export type UpdateSettingsResponse = ApiSuccess<NotificationSettings>;

// 批次刪除請求/回應
export type BatchDeleteRequest = { ids: string[] };
export type BatchDeleteResponse = ApiSuccess<{ deletedCount: number }>;

// 批次標記已讀請求/回應
export type BatchMarkAsReadRequest = { ids: string[]; isRead: boolean };
export type BatchMarkAsReadResponse = ApiSuccess<{ updatedCount: number }>;
