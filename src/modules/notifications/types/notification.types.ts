/**
 * 通知模組型別定義
 * 依據後端 API 規格 (push-notification-frontend-guide.md) 定義
 */

// 通知分類（對應三個 Tab）
export type NotificationCategory = 'stock' | 'inspiration' | 'official';

// 通知類型標籤（用於顯示標籤樣式）
// 後端使用: inventory | group | shopping | system | recipe | user
export type NotificationType =
  | 'inventory'
  | 'group'
  | 'shopping'
  | 'system'
  | 'recipe'
  | 'user'; // New type for self actions

// 通知子類型，對應具體標籤樣式
export type NotificationSubType =
  | 'generate' // 生成 (Yellow)
  | 'stock' // 庫存 (Green)
  | 'consume' // 消耗 (Pink)
  | 'stockIn' // 入庫 (Red)
  | 'share' // 共享 (Light Blue)
  | 'list' // 清單 (Blue)
  | 'self' // 本人 (White)
  | 'member'; // 成員 (Grey)

// 點擊動作類型
export type NotificationActionType =
  | 'inventory' // 跳轉到庫存食材頁面
  | 'shopping-list' // 跳轉到共享清單
  | 'recipe' // 跳轉到食譜
  | 'detail' // 跳轉到通知詳情頁
  | 'group'; // 跳轉到群組頁

// 通知動作結構（後端使用合併物件格式）
export type NotificationAction = {
  type: NotificationActionType;
  payload?: {
    refrigeratorId?: string;
    itemId?: string;
    listId?: string;
    recipeId?: string;
  };
};

// 單一通知訊息
export type NotificationMessage = {
  id: string;
  type: NotificationType;
  subType?: NotificationSubType; // 新增子類型
  title: string;
  message: string; // 後端使用 message 而非 description
  isRead: boolean;
  createdAt: string; // ISO 8601
  action?: NotificationAction; // 後端使用合併物件格式
  // 保留 category 供前端 Tab 分類使用（可由 type 映射）
  category?: NotificationCategory;
  
  // 新增顯示欄位
  groupName?: string;
  actorName?: string;
  actorId?: string; // 觸發通知的使用者 UID，用於過濾本人操作
};

// 按日期分組的通知
export type NotificationGroup = {
  date: string; // YYYY/MM/DD
  items: NotificationMessage[];
};

// 通知設定（依後端欄位名稱）
export type NotificationSettings = {
  notifyPush: boolean; // 推播總開關
  notifyExpiry: boolean; // 過期提醒
  notifyMarketing: boolean; // 行銷活動
  notifyLowStock?: boolean; // 低庫存 (後端規劃中)
  daysBeforeExpiry?: number; // 過期天數 (預設 3)
};

// 發送通知請求型別
export type SendNotificationRequest = {
  userIds?: string[]; // 指定特定使用者的 Firebase UID (若為空則依 groupId 發給全員)
  groupId?: string; // 指定群組 ID
  title: string;
  body: string;
  type: NotificationType;
  subType?: NotificationSubType;
  action?: NotificationAction;
  // 新增顯示欄位 (前端傳入，後端直接儲存)
  groupName?: string; // 群組名稱
  actorName?: string; // 操作者名稱
  actorId?: string;   // 操作者 ID
  // Compatibility with snake_case backends
  group_name?: string;
  actor_name?: string;
  actor_id?: string;
};
