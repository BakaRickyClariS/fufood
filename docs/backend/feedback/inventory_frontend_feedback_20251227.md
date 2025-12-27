# Frontend 實作狀態與待辦事項

日期：2025-12-27  
針對模組：Inventory（庫存管理）

---

## 目錄

1. [API 實作狀態總覽](#1-api-實作狀態總覽)
2. [TanStack Query Hooks 狀態](#2-tanstack-query-hooks-狀態)
3. [待實作項目](#3-待實作項目)
4. [程式碼位置參考](#4-程式碼位置參考)
5. [與後端對接注意事項](#5-與後端對接注意事項)

---

## 1. API 實作狀態總覽

### 1.1 Inventory API（已實作）

| 狀態 | API 方法 | 路徑 | 說明 |
|:-----|:---------|:-----|:-----|
| ✅ | `getInventory` | `GET /inventory` | 庫存列表（支援 status/include） |
| ✅ | `getItem` | `GET /inventory/{id}` | 單一食材詳情 |
| ✅ | `addItem` | `POST /inventory` | 新增食材 |
| ✅ | `updateItem` | `PUT /inventory/{id}` | 更新食材 |
| ✅ | `deleteItem` | `DELETE /inventory/{id}` | 刪除食材 |
| ✅ | `batchDelete` | `DELETE /inventory/batch` | 批次刪除 |
| ✅ | `getSummary` | `GET /inventory/summary` | 庫存摘要 |
| ✅ | `getCategories` | `GET /inventory/categories` | 類別列表 |
| ✅ | `getSettings` | `GET /inventory/settings` | 取得設定 |
| ✅ | `updateSettings` | `PUT /inventory/settings` | 更新設定 |
| ✅ | `consumeItem` | `POST /inventory/{id}/consume` | 消耗食材 |

### 1.2 Foods API（已實作）

| 狀態 | API 方法 | 路徑 | 說明 |
|:-----|:---------|:-----|:-----|
| ✅ | `getCategoryFoods` | `GET /foods/category/{catId}` | 分類食材列表 |
| ✅ | `getFoodDetail` | `GET /foods/category/{catId}/{id}` | 食材詳情 |
| ✅ | `createFood` | `POST /foods` | 建立食材 |
| ✅ | `updateFood` | `PUT /foods/{id}` | 更新食材 |
| ✅ | `deleteFood` | `DELETE /foods/{id}` | 刪除食材 |

---

## 2. TanStack Query Hooks 狀態

### 2.1 已實作的 Hooks

| Hook 名稱 | 類型 | 對應 API | 檔案位置 |
|:----------|:-----|:---------|:---------|
| `useInventoryQuery` | Query | `getInventory` | `queries.ts:29` |
| `useInventoryItemQuery` | Query | `getItem` | `queries.ts:40` |
| `useInventorySummaryQuery` | Query | `getSummary` | `queries.ts:51` |
| `useInventoryCategoriesQuery` | Query | `getCategories` | `queries.ts:62` |
| `useInventorySettingsQuery` | Query | `getSettings` | `queries.ts:73` |
| `useAddInventoryItemMutation` | Mutation | `addItem` | `queries.ts:83` |
| `useUpdateInventoryItemMutation` | Mutation | `updateItem` | `queries.ts:99` |
| `useDeleteInventoryItemMutation` | Mutation | `deleteItem` | `queries.ts:116` |
| `useUpdateInventorySettingsMutation` | Mutation | `updateSettings` | `queries.ts:131` |

### 2.2 缺失的 Hooks（待實作）

| Hook 名稱 | 類型 | 對應 API | 優先級 |
|:----------|:-----|:---------|:-------|
| `useConsumeItemMutation` | Mutation | `consumeItem` | **High** |
| `useBatchDeleteInventoryMutation` | Mutation | `batchDelete` | Medium |

---

## 3. 待實作項目

### 3.1 高優先級

#### `useConsumeItemMutation` Hook

**位置**: `src/modules/inventory/api/queries.ts`

**建議實作**:

```typescript
/**
 * 消耗食材 Mutation
 */
export const useConsumeItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: { quantity: number; reasons: string[]; customReason?: string } 
    }) => inventoryApi.consumeItem(id, data),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
};
```

---

### 3.2 中優先級

#### `useBatchDeleteInventoryMutation` Hook

**建議實作**:

```typescript
/**
 * 批次刪除食材 Mutation
 */
export const useBatchDeleteInventoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => inventoryApi.batchDelete({ ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
};
```

---

### 3.3 低優先級 / 待後端確認

#### Foods API Hooks

目前 `foodsApi.ts` 沒有對應的 TanStack Query hooks。若需要：

- `useFoodsQuery` - 取得食材列表
- `useFoodDetailQuery` - 取得食材詳情
- `useCreateFoodMutation` - 建立食材
- `useUpdateFoodMutation` - 更新食材
- `useDeleteFoodMutation` - 刪除食材

---

## 4. 程式碼位置參考

### 4.1 目錄結構

```
src/modules/inventory/
├── api/
│   ├── index.ts              # API 匯出與 Mock 切換
│   ├── inventoryApi.ts       # API 介面定義
│   ├── inventoryApiImpl.ts   # 實際 API 實作
│   ├── queries.ts            # TanStack Query hooks
│   ├── foodsApi.ts           # Foods API
│   └── mock/
│       ├── inventoryMockApi.ts   # Mock 實作
│       └── inventoryMockData.ts  # Mock 資料
├── hooks/
│   ├── useInventory.ts       # 庫存管理 Hook（非 TanStack）
│   ├── useInventoryStats.ts  # 統計 Hook
│   ├── useInventoryFilter.ts # 篩選 Hook
│   └── useExpiryCheck.ts     # 過期檢查 Hook
├── types/
│   ├── inventory.types.ts    # 核心型別
│   ├── api.types.ts          # API 型別
│   └── filter.types.ts       # 篩選型別
└── services/
    └── inventoryService.ts   # 業務邏輯封裝
```

### 4.2 重要檔案

| 檔案 | 說明 |
|:-----|:-----|
| [inventoryApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/api/inventoryApi.ts) | API 介面定義（Type） |
| [inventoryApiImpl.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/api/inventoryApiImpl.ts) | API 實際實作 |
| [queries.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/api/queries.ts) | TanStack Query Hooks |
| [inventoryMockApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/api/mock/inventoryMockApi.ts) | Mock API 實作 |

---

## 5. 與後端對接注意事項

### 5.1 路徑可能變更

> [!WARNING]
> 後端可能已改用 `/refrigerators/{refrigeratorId}/inventory` 路徑結構。
> 前端需確認後再決定是否更新。

**如果需要更新，影響範圍**:

1. `inventoryApiImpl.ts` - 所有 API 路徑
2. `inventoryApi.ts` - 介面參數需加入 `refrigeratorId`
3. `queries.ts` - Query keys 需加入 `refrigeratorId`
4. `useInventory.ts` - 需傳入 `refrigeratorId`
5. 所有呼叫這些 hooks 的元件

### 5.2 消耗 API 設計

目前實作假設消耗是針對「食材」的簡單操作：

```typescript
// 目前實作
consumeItem(id, { quantity, reasons, customReason })
```

如果後端改用「交易」模式，需要：

1. 先呼叫 `createTransaction` 建立交易
2. 再呼叫 `confirmConsumption` 確認消耗

### 5.3 Mock 模式

目前 Mock API 完整實作了所有功能，包括 `consumeItem`。切換至真實 API 時，確保：

```typescript
// .env
VITE_USE_MOCK_API=false
```

---

## 參考文件

- [Inventory README](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/README.md)
- [API Reference V2](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/API_REFERENCE_V2.md)
- [Inventory API Spec](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/backend/inventory_api_spec.md)
