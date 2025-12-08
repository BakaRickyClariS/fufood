# Inventory Module (庫存管理模組)

## 📋 目錄

- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [Hooks 詳解](#hooks-詳解)
- [Services 服務層](#services-服務層)
- [Redux Store](#redux-store)
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責管理使用者的**食材庫存**。提供庫存列表檢視、食材新增/編輯/刪除、過期狀態追蹤、以及庫存統計功能。支援多種篩選與排序方式，並透過 Redux 管理全域狀態。

### 核心功能

1.  **庫存管理**: 新增、編輯、刪除食材
2.  **狀態追蹤**: 自動計算過期狀態 (正常/即將過期/已過期/低庫存)
3.  **分類檢視**: 依據 7 大類別檢視食材
4.  **篩選排序**: 支援關鍵字搜尋、狀態篩選、多種排序方式
5.  **統計分析**: 提供庫存總量、過期數量等統計資訊
6.  **Mock 模式**: 支援離線開發與測試

---

## 目錄結構

\`\`\`
inventory/
├── api/ # API 層
│ ├── inventoryApi.ts # API 介面
│ ├── inventoryRealApi.ts # 真實 API 實作
│ ├── index.ts # API 匯出
│ └── mock/
│ ├── inventoryMockApi.ts # Mock API 實作
│ └── inventoryMockData.ts # Mock 資料
├── components/ # UI 元件
│ ├── layout/ # 佈局元件 (OverviewPanel, CommonItemsPanel...)
│ └── ui/ # 基礎元件 (FoodCard, CategoryCard...)
├── hooks/ # 自定義 Hooks
│ ├── index.ts
│ ├── useInventory.ts # 庫存管理 Hook
│ ├── useInventoryFilter.ts # 篩選 Hook
│ ├── useInventoryStats.ts # 統計 Hook
│ └── useExpiryCheck.ts # 過期檢查 Hook
├── services/ # 服務層
│ ├── inventoryService.ts # 業務邏輯封裝
│ └── index.ts
├── store/ # Redux 狀態管理
│ ├── inventorySlice.ts # Inventory Slice
│ └── index.ts
├── types/ # TypeScript 型別
│ ├── inventory.types.ts # 核心型別
│ ├── api.types.ts # API 型別
│ ├── filter.types.ts # 篩選型別
│ └── index.ts
└── index.ts # 模組匯出
\`\`\`

---

## 型別定義 (Types)

### FoodItem (食材項目)

```typescript
export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  imageUrl?: string;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes?: string;
  groupId?: string;
  createdAt: string;
  updatedAt?: string;
};
```

### InventoryStatus (庫存狀態)

```typescript
export type InventoryStatus =
  | 'normal'
  | 'low-stock'
  | 'expired'
  | 'expiring-soon';
```

### FoodCategory (食材分類)

```typescript
export type FoodCategory =
  | '蔬果類'
  | '冷凍調理類'
  | '主食烘焙類'
  | '乳製品飲料類'
  | '冷凍海鮮類'
  | '肉品類'
  | '其他';
```

---

## API 規格

### InventoryApi 介面

```typescript
export const inventoryApi = {
  getInventory: (
    params?: GetInventoryRequest,
  ) => Promise<{ status: true; data: { items: FoodItem[]; total: number; stats: InventoryStats } }>;
  getItem: (id: string) => Promise<{ status: true; data: { item: FoodItem } }>;
  addItem: (
    data: AddFoodItemRequest,
  ) => Promise<{ status: true; message: string; data: { id: string } }>;
  updateItem: (
    id: string,
    data: UpdateFoodItemRequest,
  ) => Promise<{ status: true; message: string; data: { id: string } }>;
  deleteItem: (id: string) => Promise<{ status: true; message: string }>;
  batchAdd: (
    data: BatchAddInventoryRequest,
  ) => Promise<{ status: true; message: string }>;
  batchUpdate: (
    data: BatchUpdateInventoryRequest,
  ) => Promise<{ status: true; message: string }>;
  batchDelete: (
    data: BatchDeleteInventoryRequest,
  ) => Promise<{ status: true; message: string }>;
  getFrequentItems: (limit?: number) => Promise<{ status: true; data: { items: FoodItem[] } }>;
  getExpiredItems: (
    page?: number,
    limit?: number,
  ) => Promise<{ status: true; data: { items: FoodItem[]; total: number } }>;
  getStats: (groupId?: string) => Promise<{ status: true; data: { stats: InventoryStats } }>;
  getCategories: () => Promise<{ status: true; data: { categories: CategoryInfo[] } }>;
  getSummary: () => Promise<{ status: true; data: { summary: InventorySummary } }>;
  getSettings: () => Promise<{ status: true; data: { settings: InventorySettings } }>;
  updateSettings: (
    data: UpdateInventorySettingsRequest,
  ) => Promise<{ status: true; message: string; data: { settings: InventorySettings } }>;
};
```

---

### FoodsApi 介面 (食材主檔)

```typescript
export type Food = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  nutritionInfo?: any;
};

export const foodsApi = {
  getCategoryFoods: (catId: string) => Promise<Food[]>;
  getFoodDetail: (catId: string, id: string) => Promise<Food>;
  createFood: (data: Omit<Food, 'id'>) => Promise<Food>;
  updateFood: (id: string, data: Partial<Food>) => Promise<Food>;
  deleteFood: (id: string) => Promise<void>;
};
```

---

### 1. **getInventory** - 取得庫存列表

#### 端點

\`\`\`
GET /api/v1/inventory
\`\`\`

#### 請求參數 (Query Params)

- `groupId`: 群組 ID
- `category`: 分類
- `status`: 狀態 (expired, expiring-soon, low-stock, normal)
- `page`: 頁碼
- `limit`: 每頁數量

#### 回應格式

```typescript
{
  status: true;
  data: {
    items: FoodItem[];
    total: number;
    stats: InventoryStats;
  };
}
```

---

### 2. **addItem** - 新增食材

#### 端點

\`\`\`
POST /api/v1/inventory
\`\`\`

#### 請求格式

```typescript
AddFoodItemRequest;
```

#### 回應格式

```typescript
{
  status: true;
  message: string;
  data: {
    id: string;
  }
}
```

---

### 3. 其他核心端點（皆採 `/api/v1` 前綴）

- `GET /inventory/{id}`：取得單一食材詳情  
- `PUT /inventory/{id}`：更新食材  
- `DELETE /inventory/{id}`：刪除食材  
- `POST /inventory/batch`：批次新增  
- `PUT /inventory/batch`：批次更新  
- `DELETE /inventory/batch`：批次刪除  
- `GET /inventory/frequent`：取得常用項目  
- `GET /inventory/expired`：取得過期紀錄  
- `GET /inventory/summary`：庫存概況  
- `GET /inventory/stats`：庫存統計  
- `GET /inventory/categories`：分類清單  
- `GET /inventory/settings` / `PUT /inventory/settings`：取得/更新庫存設定

---

## Hooks 詳解

### `useInventory.ts`

```typescript
const useInventory = (groupId?: string) => {
  return {
    items: FoodItem[];
    isLoading: boolean;
    error: Error | null;
    addItem: (data: AddFoodItemRequest) => Promise<void>;
    updateItem: (id: string, data: UpdateFoodItemRequest) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    batchDelete: (ids: string[]) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```

**功能**:

- 管理庫存資料的 CRUD 操作
- 自動處理載入狀態與錯誤
- 提供批次操作功能

---

### `useInventoryFilter.ts`

```typescript
const useInventoryFilter = (items: FoodItem[]) => {
  return {
    filteredItems: FoodItem[];
    filters: FilterOptions;
    setFilter: (key: keyof FilterOptions, value: any) => void;
    clearFilters: () => void;
  };
};
```

**功能**:

- 前端篩選與排序邏輯
- 支援分類、狀態、關鍵字篩選
- 支援多種排序方式 (過期日、購買日、名稱、數量)

---

### `useExpiryCheck.ts`

```typescript
const useExpiryCheck = (item: FoodItem) => {
  return {
    isExpired: boolean;
    isExpiringSoon: boolean;     // 3天內
    daysUntilExpiry: number;
    status: InventoryStatus;
  };
};
```

**功能**:

- 計算單一食材的過期狀態
- 判斷是否即將過期 (預設 3 天)
- 判斷是否低庫存

---

## Redux Store

### `inventorySlice.ts`

**State**:

```typescript
type InventoryState = {
  items: FoodItem[];
  selectedItem: FoodItem | null;
  filters: FilterOptions;
  stats: InventoryStats | null;
  isLoading: boolean;
  error: string | null;
};
```

**Actions**:

- `setItems`, `addItem`, `updateItem`, `removeItem`
- `setFilters`, `setStats`
- `setSelectedItem`

---

## 環境變數設定

### 必要環境變數

```env
# Mock 模式 (開發用)
VITE_USE_MOCK_API=true
```

### 環境變數說明

| 變數名稱              | 說明              | 範例                    |
| --------------------- | ----------------- | ----------------------- |
| `VITE_USE_MOCK_API`   | 是否使用 Mock API | `true` / `false`        |
| `VITE_API_BASE_URL`   | 後端 API 網址     | `http://localhost:3000/api/v1` |

---

## Mock 資料

Mock 資料位於 `api/mock/inventoryMockData.ts`，包含各類別的範例食材，用於開發與測試。
