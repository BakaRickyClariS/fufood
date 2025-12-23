# Notifications Module API Specification

**版本**: v2.0  
**最後更新**: 2025-12-24  
**涵蓋範圍**: 通知訊息管理與設定

---

## 路由總表

| #   | Method | Path                             | 功能                         |
| --- | ------ | -------------------------------- | ---------------------------- |
| 1   | GET    | `/api/v1/notifications`          | 取得通知列表（支援分類篩選） |
| 2   | GET    | `/api/v1/notifications/{id}`     | 取得單一通知詳情             |
| 3   | PATCH  | `/api/v1/notifications/{id}`     | 標記已讀                     |
| 4   | DELETE | `/api/v1/notifications/{id}`     | 刪除通知                     |
| 5   | POST   | `/api/v1/notifications/read-all` | 全部標記已讀                 |
| 6   | GET    | `/api/v1/notifications/settings` | 取得通知設定                 |
| 7   | PATCH  | `/api/v1/notifications/settings` | 更新通知設定                 |

---

## 1. 基本規範

- **Base URL**: `/api/v1`
- 需帶 Access Token (HttpOnly Cookie)
- 成功/錯誤格式同 `auth_api_spec.md`

---

## 2. 資料模型

### 2.1 NotificationMessage

```typescript
type NotificationCategory = 'stock' | 'inspiration' | 'official';
type NotificationType = 'stock' | 'shared' | 'system';
type NotificationActionType =
  | 'inventory'
  | 'shopping-list'
  | 'recipe'
  | 'detail';

type NotificationMessage = {
  id: string; // UUID
  category: NotificationCategory; // 分類
  type: NotificationType; // 類型標籤
  title: string; // 標題
  description: string; // 內容描述
  isRead: boolean; // 是否已讀
  createdAt: string; // ISO 8601
  actionType: NotificationActionType; // 點擊動作類型
  actionPayload?: {
    // 動作參數
    itemId?: string; // 庫存食材 ID
    listId?: string; // 共享清單 ID
    recipeId?: string; // 食譜 ID
  };
};
```

### 2.2 NotificationSettings

```typescript
type NotificationSettings = {
  notifyOnExpiry: boolean; // 過期通知
  notifyOnLowStock: boolean; // 低庫存通知
  daysBeforeExpiry: number; // 過期前幾天通知
  enablePush: boolean; // 推播通知
  enableEmail: boolean; // Email 通知
};
```

---

## 3. API 端點

### 3.1 取得通知列表

**GET** `/api/v1/notifications`

**Query Parameters**:
| 參數 | 類型 | 說明 |
|------|------|------|
| category | string | 分類篩選：stock/inspiration/official |
| isRead | boolean | 已讀狀態篩選 |
| page | number | 頁碼，預設 1 |
| limit | number | 每頁數量，預設 20 |

**Response 200**:

```json
{
  "status": true,
  "data": {
    "items": [NotificationMessage],
    "total": 10,
    "unreadCount": 3
  }
}
```

---

### 3.2 取得單一通知

**GET** `/api/v1/notifications/{id}`

**Response 200**:

```json
{
  "status": true,
  "data": {
    "item": NotificationMessage
  }
}
```

---

### 3.3 標記已讀

**PATCH** `/api/v1/notifications/{id}`

**Body**:

```json
{ "isRead": true }
```

**Response 200**:

```json
{
  "status": true,
  "data": { "id": "notification-id" }
}
```

---

### 3.4 刪除通知

**DELETE** `/api/v1/notifications/{id}`

**Response 200**:

```json
{ "status": true, "data": {} }
```

---

### 3.5 全部標記已讀

**POST** `/api/v1/notifications/read-all`

**Response 200**:

```json
{
  "status": true,
  "data": { "count": 5 }
}
```

---

### 3.6 取得通知設定

**GET** `/api/v1/notifications/settings`

**Response 200**:

```json
{
  "status": true,
  "data": { "settings": NotificationSettings }
}
```

---

### 3.7 更新通知設定

**PATCH** `/api/v1/notifications/settings`

**Body**: `Partial<NotificationSettings>`

**Response 200**:

```json
{
  "status": true,
  "data": { "settings": NotificationSettings }
}
```

---

## 4. 點擊跳轉邏輯

| actionType    | 前端跳轉目標                        |
| ------------- | ----------------------------------- |
| inventory     | `/inventory/:itemId`                |
| shopping-list | `/planning?tab=shopping&id=:listId` |
| recipe        | `/recipes/:recipeId`                |
| detail        | `/notifications/:id`                |

---

## 5. 後端實作備註

1. **通知來源**：通知由後端根據以下事件自動產生
   - 食材即將過期 / 已過期
   - 低庫存警告
   - 共享清單更新
   - 系統公告

2. **推播整合**：可配合 LINE Bot 或 Web Push 發送

3. **分頁**：建議預設 limit 為 20，避免一次載入過多資料
