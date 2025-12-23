# Notifications Module (通知模組)

## 概述

管理使用者的通知訊息，包含食材管家、靈感生活、官方公告三種分類。支援點擊跳轉至相關頁面。

---

## 目錄結構

```
notifications/
├── api/
│   ├── index.ts                 # API 匯出
│   ├── notificationsApi.ts      # API 介面
│   ├── queries.ts               # TanStack Query hooks
│   └── mock/
│       ├── notificationsMockApi.ts
│       └── notificationsMockData.ts
├── components/
│   ├── index.ts
│   └── ui/
│       ├── index.ts
│       └── NotificationItem.tsx
├── types/
│   ├── index.ts
│   ├── notification.types.ts    # 核心型別
│   └── api.types.ts             # API 型別
└── README.md
```

---

## 核心型別

### NotificationMessage

```typescript
type NotificationMessage = {
  id: string;
  category: 'stock' | 'inspiration' | 'official';
  type: 'stock' | 'shared' | 'system';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  actionType: 'inventory' | 'shopping-list' | 'recipe' | 'detail';
  actionPayload?: { itemId?: string; listId?: string; recipeId?: string };
};
```

---

## API 端點

| Method | Path                             | 功能         |
| ------ | -------------------------------- | ------------ |
| GET    | `/api/v1/notifications`          | 取得通知列表 |
| GET    | `/api/v1/notifications/{id}`     | 取得單一通知 |
| PATCH  | `/api/v1/notifications/{id}`     | 標記已讀     |
| DELETE | `/api/v1/notifications/{id}`     | 刪除通知     |
| POST   | `/api/v1/notifications/read-all` | 全部標記已讀 |
| GET    | `/api/v1/notifications/settings` | 取得設定     |
| PATCH  | `/api/v1/notifications/settings` | 更新設定     |

---

## TanStack Query Hooks

```typescript
// 依分類取得通知
useNotificationsByCategoryQuery(category);

// 標記已讀
useMarkAsReadMutation();

// 全部標記已讀
useReadAllMutation();
```

---

## 點擊跳轉邏輯

| actionType      | 跳轉目標                            |
| --------------- | ----------------------------------- |
| `inventory`     | `/inventory/:itemId`                |
| `shopping-list` | `/planning?tab=shopping&id=:listId` |
| `recipe`        | `/recipes/:recipeId`                |
| `detail`        | `/notifications/:id`                |
