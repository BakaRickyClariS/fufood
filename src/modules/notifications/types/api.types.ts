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
export type GetNotificationsResponse = ApiSuccess<{
  items: NotificationMessage[];
  total: number;
  unreadCount: number;
}>;

// 取得單一通知回應
export type GetNotificationResponse = ApiSuccess<{
  item: NotificationMessage;
}>;

// 標記已讀請求
export type MarkAsReadRequest = {
  isRead: boolean;
};

// 標記已讀回應
export type MarkAsReadResponse = ApiSuccess<{
  id: string;
}>;

// 刪除通知回應
export type DeleteNotificationResponse = ApiSuccess<Record<string, never>>;

// 全部標記已讀回應
export type ReadAllResponse = ApiSuccess<{
  count: number;
}>;

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
