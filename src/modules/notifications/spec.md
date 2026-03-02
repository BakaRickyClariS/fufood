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

| Method | Path                                 | 功能         |
| ------ | ------------------------------------ | ------------ |
| GET    | `/api/v1/notifications`              | 取得通知列表 |
| GET    | `/api/v1/notifications/{id}`         | 取得單一通知 |
| PATCH  | `/api/v1/notifications/{id}`         | 標記已讀     |
| DELETE | `/api/v1/notifications/{id}`         | 刪除通知     |
| POST   | `/api/v1/notifications/read-all`     | 全部標記已讀 |
| POST   | `/api/v1/notifications/batch/delete` | 批次刪除通知 |
| POST   | `/api/v1/notifications/batch/read`   | 批次標記已讀 |
| GET    | `/api/v1/notifications/settings`     | 取得設定     |
| PATCH  | `/api/v1/notifications/settings`     | 更新設定     |

---

## TanStack Query Hooks

```typescript
// 依分類取得通知
useNotificationsByCategoryQuery(category);

// 標記已讀
useMarkAsReadMutation();

// 全部標記已讀
useReadAllMutation();

// 批次刪除
useDeleteNotificationsMutation();

// 批次標記已讀
useMarkAsReadBatchMutation();
```

---

## 互動邏輯 (Interaction Logic)

主要採用 **Inline Modal** 以避免頁面跳轉，提升使用者體驗。

| actionType      | 行為描述                                                 |
| --------------- | -------------------------------------------------------- |
| `inventory`     | **Inline Modal**: 在通知頁面直接開啟 `FoodDetailModal`   |
| `recipe`        | **Inline Modal**: 在通知頁面直接開啟 `RecipeDetailModal` |
| `shopping-list` | **Navigate**: 跳轉至 `/planning?tab=shopping&id=:listId` |
| `detail`        | **Navigate**: 跳轉至 `/notifications/:id`                |

---

## UI Components

主要組件位於 `components/ui/`：

- `NotificationItem`: 單則通知項目，支援編輯模式 (CheckboxSelection) 與樣式變化。
- `EditMenu`: 編輯模式切換選單 (選取/全選)。
- `EditActionBar`: 底部浮動操作欄 (批次刪除/已讀)。
