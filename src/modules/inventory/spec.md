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
- [Mock 資料](#mock-資料)

---

## 概述

本模組負責管理使用者的 **食材庫存**。提供庫存列表檢視、食材新增/編輯/刪除、過期狀態追蹤、以及庫存統計功能。支援多種篩選與排序方式，並透過 Redux 管理全域狀態。

> 新版 API（參考 `API_REFERENCE_V2.md`）：全面採用 `/refrigerators/{refrigeratorId}/inventory` 路徑。已整合過期、常用、統計路由；新增消耗功能。


### 核心功能

1. **庫存管理**：新增、編輯、刪除食材，支援批次刪除
2. **狀態追蹤**：自動計算過期狀態（正常 / 即將過期 / 已過期 / 低庫存 / 常用）
3. **分類檢視**：依 7 大類別檢視食材
4. **篩選排序**：關鍵字搜尋、狀態篩選、多種排序（過期日、購買日、名稱、數量）
5. **統計分析**：庫存總量、過期數量、分類分布、摘要
6. **Mock 模式**：支援離線開發與測試

---

## 目錄結構

```
inventory/
├── api/                  # API 層
│   ├── inventoryApi.ts   # API 介面
│   ├── inventoryApiImpl.ts # 實作（使用 backendApi）
│   ├── index.ts          # API 匯出
│   └── mock/
│       ├── inventoryMockApi.ts
│       └── inventoryMockData.ts
├── components/           # UI 元件
│   ├── layout/           # 佈局元件 (OverviewPanel, CommonItemsPanel...)
│   ├── ui/               # 基礎元件 (FoodCard, CategoryCard...)
│   └── consumption/      # 消耗相關元件 (ConsumptionModal, etc.)

├── hooks/                # 自定義 Hooks
│   ├── index.ts
│   ├── useInventory.ts         # 庫存管理 Hook
│   ├── useInventoryFilter.ts   # 篩選 Hook
│   ├── useInventoryStats.ts    # 統計 Hook
│   └── useExpiryCheck.ts       # 過期檢查 Hook
├── services/             # 服務層
│   ├── inventoryService.ts     # 業務邏輯封裝
│   └── index.ts
├── store/                # Redux 狀態管理
│   ├── inventorySlice.ts
│   └── index.ts
├── types/                # TypeScript 型別
│   ├── inventory.types.ts      # 核心型別
│   ├── api.types.ts            # API 型別
│   ├── filter.types.ts         # 篩選型別
│   └── index.ts
└── index.ts              # 模組匯出
```

> **注意**：庫存 API 使用 `backendApi`（`VITE_BACKEND_API_BASE_URL`），不是 AI API。

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
  attributes?: string[]; // 產品屬性，如 ['葉菜根莖類', '有機']
};
```

### InventoryStatus (庫存狀態)

```typescript
export type InventoryStatus =
  | 'normal'
  | 'low-stock'
  | 'expired'
  | 'expiring-soon'
  | 'frequent';
```

### FoodCategory (食材分類)

> [!IMPORTANT]
> 依據 [前端串接整合指南](../../docs/backend/frontend_integration_guide.md)，API 必須使用英文 Category ID，傳送中文會導致 `500 Foreign Key Error`。

```typescript
// 7 大嚴格分類 ID
export type FoodCategory =
  | 'fruit'    // 蔬果類
  | 'frozen'   // 冷凍調理類
  | 'bake'     // 主食烘焙類
  | 'milk'     // 乳品飲料類
  | 'seafood'  // 冷凍海鮮類
  | 'meat'     // 肉品類
  | 'others';  // 乾貨醬料類
```

| Category ID | 預設中文標題 | 說明                   |
| :---------- | :----------- | :--------------------- |
| `fruit`     | 蔬果類       | 葉菜、根莖、水果、菇類 |
| `frozen`    | 冷凍調理類   | 水餃、雞塊、冰品       |
| `bake`      | 主食烘焙類   | 米、麵、麵包、堅果     |
| `milk`      | 乳品飲料類   | 蛋、奶、起司、飲品     |
| `seafood`   | 冷凍海鮮類   | 魚、蝦、貝類           |
| `meat`      | 肉品類       | 豬/牛/雞肉、加工肉品   |
| `others`    | 乾貨醬料類   | 醬料、油品、其他       |

---

## API 規格

### InventoryApi 介面

```typescript
export const inventoryApi = {
  getInventory: (
    params?: GetInventoryRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; data: { items: FoodItem[]; total: number; stats?: InventoryStats; summary?: InventorySummary } }>;
  getItem: (id: string, refrigeratorId?: string) => Promise<{ status: true; data: { item: FoodItem } }>;
  addItem: (
    data: AddFoodItemRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; message: string; data: { id: string } }>;
  updateItem: (
    id: string,
    data: UpdateFoodItemRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; message: string; data: { id: string } }>;
  deleteItem: (id: string, refrigeratorId?: string) => Promise<{ status: true; message: string }>;
  batchDelete: (
    data: BatchDeleteInventoryRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; message?: string; data: Record<string, never> }>;
  getCategories: (refrigeratorId?: string) => Promise<{ status: true; data: { categories: CategoryInfo[] } }>;
  getSummary: (refrigeratorId?: string) => Promise<{ status: true; data: { summary: InventorySummary } }>;
  getSettings: (refrigeratorId?: string) => Promise<{ status: true; data: { settings: InventorySettings } }>;
  updateSettings: (
    data: UpdateInventorySettingsRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; message?: string; data: { settings: InventorySettings } }>;
  consumeItem: (
    id: string,
    data: ConsumeFoodItemRequest,
    refrigeratorId?: string,
  ) => Promise<{ status: true; message: string; data: { id: string; remainingQuantity: number; consumedAt: string } }>;

};
```

> 說明：`getInventory` 的 `status`（expired / expiring-soon / low-stock / frequent / normal）與 `include=summary,stats` 取代舊的 `/inventory/expired`、`/inventory/frequent`、`/inventory/stats`。批次新增/批次更新暫緩，若後端開啟可再接回。

### FoodsApi 介面（食材主檔）

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

### 1. getInventory — 取得庫存列表

**Endpoint**

```
GET /api/v1/refrigerators/{refrigeratorId}/inventory

```

**Query**

- `groupId`: 群組 ID
- `category`: 分類
- `status`: expired | expiring-soon | low-stock | frequent | normal
- `include`: `summary,stats`（可選）
- `page`, `limit`

**Response**

```typescript
{
  status: true;
  data: {
    items: FoodItem[];
    total: number;
    stats?: InventoryStats;
    summary?: InventorySummary;
  };
}
```

### 2. addItem — 新增食材

**Endpoint**

```
POST /api/v1/refrigerators/{refrigeratorId}/inventory

```

**Body**: `AddFoodItemRequest`  
**Response**

```typescript
{
  status: true;
  message: string;
  data: {
    id: string;
  }
}
```

### 3. 其他核心端點（皆含 `/api/v1` 前綴）

- `GET /refrigerators/{id}/inventory/{itemId}`：單一食材
- `PUT /refrigerators/{id}/inventory/{itemId}`：更新食材
- `DELETE /refrigerators/{id}/inventory/{itemId}`：刪除食材
- `DELETE /refrigerators/{id}/inventory/batch`：批次刪除（可選）
- `GET /refrigerators/{id}/inventory/categories`：分類清單
- `GET /refrigerators/{id}/inventory/summary`：庫存摘要
- `GET /refrigerators/{id}/inventory/settings` / `PUT ...`：取得 / 更新庫存設定
- `POST /refrigerators/{id}/inventory/{itemId}/consume`：消耗食材


> 舊路由 `/inventory/frequent`、`/inventory/expired`、`/inventory/stats` 已被整合；批次新增/更新暫緩。

---

## Hooks 詳解

### `useInventory.ts`

```typescript
```typescript
const useInventory = (groupId?: string) => { // groupId 即 refrigeratorId
  return {
    items: FoodItem[];
    isLoading: boolean;
    error: Error | null;
    addItem: (data: AddFoodItemRequest, refrigeratorId?: string) => Promise<void>;
    updateItem: (id: string, data: UpdateFoodItemRequest, refrigeratorId?: string) => Promise<void>;
    deleteItem: (id: string, refrigeratorId?: string) => Promise<void>;
    batchDelete: (ids: string[], refrigeratorId?: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```


**功能**：管理庫存 CRUD，處理 loading/error，支援批次刪除。

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

**功能**：前端篩選與排序；支援分類、狀態、關鍵字；排序包含過期日/購買日/名稱/數量。

### `useExpiryCheck.ts`

```typescript
const useExpiryCheck = (item: FoodItem) => {
  return {
    isExpired: boolean;
    isExpiringSoon: boolean; // 3 天內
    daysUntilExpiry: number;
    status: InventoryStatus;
  };
};
```

**功能**：計算單一食材的過期/即期狀態與天數。

### `useInventoryStats.ts`

- 即時計算 `expiredCount / expiringSoonCount / lowStockCount / byCategory`
- `refreshStats(groupId?)` 會呼叫 `getInventory({ include: 'stats', limit: 1 })` 取得後端統計（Mock 亦支援）。

---

## Services 服務層

`inventoryService.ts`：封裝 API 呼叫，集中錯誤處理與資料轉換，供 UI/Hooks 使用。

---

## Redux Store

### `inventorySlice.ts`

**State**

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

**Actions**：`setItems`, `addItem`, `updateItem`, `removeItem`, `setFilters`, `setStats`, `setSelectedItem`

---

## 環境變數設定

### 雙 API 架構

| 變數名稱 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_BACKEND_API_BASE_URL` | 後端 API 網址（庫存管理） | `https://api.fufood.jocelynh.me` |
| `VITE_AI_API_BASE_URL` | AI API 網址（影像辨識） | `https://ai-api.vercel.app/api/v1` |
| `VITE_USE_MOCK_API` | Mock 模式 | `true` / `false` |

> `inventory/api/index.ts` 會依 `VITE_USE_MOCK_API` 切換 Mock/Real。

---

## 相關文件

- [前端串接整合指南](../../docs/backend/frontend_integration_guide.md) ⭐ **必讀**
- [完整入庫 API 規格](../../docs/backend/food_intake_api_spec.md)
- [庫存 API 規格](../../docs/backend/inventory_api_spec.md)

---

## Mock 資料

`api/mock/inventoryMockData.ts`：包含各類別樣本（含過期、即期、低庫存案例）。更新資料後請重啟開發伺服器或清除 mock storage 以載入最新內容。
