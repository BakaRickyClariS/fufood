/**
 * 通知模組型別定義
 */

// 通知分類（對應三個 Tab）
export type NotificationCategory = 'stock' | 'inspiration' | 'official';

// 通知類型標籤（用於顯示標籤樣式）
export type NotificationType = 'stock' | 'shared' | 'system';

// 點擊動作類型
export type NotificationActionType =
  | 'inventory' // 跳轉到庫存食材頁面
  | 'shopping-list' // 跳轉到共享清單
  | 'recipe' // 跳轉到食譜
  | 'detail'; // 跳轉到通知詳情頁

// 動作 payload 類型
export type NotificationActionPayload = {
  itemId?: string; // 庫存食材 ID
  listId?: string; // 共享清單 ID
  recipeId?: string; // 食譜 ID
};

// 單一通知訊息
export type NotificationMessage = {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string; // ISO 8601
  actionType: NotificationActionType;
  actionPayload?: NotificationActionPayload;
};

// 按日期分組的通知
export type NotificationGroup = {
  date: string; // YYYY/MM/DD
  items: NotificationMessage[];
};

// 通知設定
export type NotificationSettings = {
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  daysBeforeExpiry: number;
  enablePush: boolean;
  enableEmail: boolean;
};
