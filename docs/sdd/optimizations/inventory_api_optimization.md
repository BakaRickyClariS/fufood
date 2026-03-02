# Inventory API Optimization Plan

## 1. 現狀分析 (Current Analysis)

### 1.1 檔案結構
目前 `src/modules/inventory/api` 包含以下檔案：
- `inventoryApi.ts`: 定義 `InventoryApi` 介面
- `inventoryRealApi.ts`: 真實 API 實作
- `foodsApi.ts`: 食材主檔 API (獨立定義)
- `mock/inventoryMockApi.ts`: Mock 實作

### 1.2 路由與實作對照 (Route & Implementation Mapping)

| API 描述 (API_REFERENCE_V2) | HTTP Method | Path | 程式碼對應 (inventoryRealApi.ts) | 狀態 | 備註 |
|-------------------|-------------|------|----------------------------------|------|------|
| getInventory | GET | /api/v1/inventory | `getItems` | ⚠️ 名稱不一致 | 建議統一為 `getInventoryList` 或保持 `getItems` 但更新文件 |
| getSummary | GET | /api/v1/inventory/summary | `getSummary` | ✅ 一致 | |
| getStats | GET | /api/v1/inventory/stats | `getStats` | ✅ 一致 | |
| getSettings | GET | /api/v1/inventory/settings | `getSettings` | ✅ 一致 | |
| updateSettings | PUT | /api/v1/inventory/settings | `updateSettings` | ✅ 一致 | |
| getCategories | GET | /api/v1/inventory/categories | `getCategories` | ✅ 一致 | |
| getItem | GET | /api/v1/inventory/{id} | `getItem` | ✅ 一致 | |
| addItem | POST | /api/v1/inventory | `addItem` | ✅ 一致 | |
| updateItem | PUT | /api/v1/inventory/{id} | `updateItem` | ✅ 一致 | |
| deleteItem | DELETE | /api/v1/inventory/{id} | `deleteItem` | ✅ 一致 | |
| batchAdd | POST | /api/v1/inventory/batch | `batchOperation` ('add') | ⚠️ 實作方式不同 | 程式碼使用單一 `batchOperation` 方法處理所有批次操作 |
| batchUpdate | PUT | /api/v1/inventory/batch | `batchOperation` ('update') | ⚠️ 實作方式不同 | 同上 |
| batchDelete | DELETE | /api/v1/inventory/batch | `batchOperation` ('delete') | ⚠️ 實作方式不同 | 同上 |
| getExpired | GET | /api/v1/inventory/expired | **未實作** | ❌ 缺失 | 需新增介面與實作 |
| getFrequent | GET | /api/v1/inventory/frequent | **未實作** | ❌ 缺失 | 需新增介面與實作 |

### 1.3 Foods API 對照

| API 描述 (API_REFERENCE_V2) | HTTP Method | Path | 程式碼對應 (foodsApi.ts) | 狀態 |
|-------------------|-------------|------|--------------------------|------|
| getCategoryFoods | GET | /api/v1/foods/category/{catId} | `getCategoryFoods` | ✅ 一致 |
| getFoodDetail | GET | /api/v1/foods/category/{catId}/{id} | `getFoodDetail` | ✅ 一致 |
| createFood | POST | /api/v1/foods | `createFood` | ✅ 一致 |
| updateFood | PUT | /api/v1/foods/{id} | `updateFood` | ✅ 一致 |
| deleteFood | DELETE | /api/v1/foods/{id} | `deleteFood` | ✅ 一致 |

---

## 2. 發現的問題 (Issues Identified)

### 2.1 命名不一致
- 程式碼使用 `getItems`，文件稱之為 `getInventory`。雖然語意相近，但建議統一名稱以減少混淆。
- `batchOperation` 是一個通用的函式，但在 API 文件中被拆分為三個獨立的端點。這在調用層面上可能不夠直觀。

### 2.2 功能缺失
- 缺少 `getExpired` (取得過期食材) 實作。
- 缺少 `getFrequent` (取得常用食材) 實作。

### 2.3 環境變數與 Base URL 用法
- `API_REFERENCE_V2.md` 範例 `VITE_API_BASE_URL` 為 `http://localhost:3000` (無 `/api/v1`)。
- `inventory/README.md` 範例為 `http://localhost:3000/api/v1`。
- `apiClient.ts` 預設值為 `/api/v1`。
- 目前程式碼中路徑寫法為 `/inventory`。
- **風險**: 若 User 設定 `VITE_API_BASE_URL=http://localhost:3000`，程式碼會請求 `http://localhost:3000/inventory` (缺少 `/api/v1`)。需修正 `apiClient` 或統一開發規範。

---

## 3. 優化規劃 (Optimization Plan)

### 3.1 Step 1: 修正 API Client 與環境變數規範
- **動作**: 統一所有 Base URL 邏輯。建議 `VITE_API_BASE_URL` 只包含 Host，Path 版本號由 `apiClient` 或 API 定義統一管理。
- **修改**: 確認 `apiClient` 行為，確保請求正確指向 `/api/v1/inventory`。

### 3.2 Step 2: 統一方法命名 (Refactor Naming)
- **動作**: 將 `inventoryApi.ts` 中的 `getItems` 重新命名為 `getInventory` 以符合文件 (或更新文件)。
- **建議**: 採用 `getInventory` 更明確。

### 3.3 Step 3: 拆分批次操作 (Split Batch Operations)
- **動作**: 廢棄 `batchOperation`，拆分為明確的 `batchAdd`, `batchUpdate`, `batchDelete` 方法。
- **優點**: 提高程式碼可讀性，與 Swagger/API 文件定義一對一對應。

### 3.4 Step 4: 補全缺失 API (Implement Missing APIs)
- **動作**: 在 `inventoryApi.ts` 與 `inventoryRealApi.ts` (及 Mock) 中實作以下兩個對應 UI Tabs 的端點：

#### 3.4.1 過期紀錄 (Expired History)
- **UI 對應**: Inventory 頁面「過期紀錄」Tab。
- **Endpoint**: `GET /api/v1/inventory/expired`
- **功能**: 取得歷史上已過期的食材清單（可能包含已移除的或僅標記為過期的，視後端實作而定，目前前端預期接收 `FoodItem[]`）。
- **Request**:
  ```typescript
  type GetExpiredRequest = {
    page?: number;
    limit?: number;
  }
  ```
- **Response**:
  ```typescript
  type GetExpiredResponse = {
    items: FoodItem[];
    total: number;
    stats?: InventoryStats;
  }
  ```

#### 3.4.2 常用項目 (Frequent Items)
- **UI 對應**: Inventory 頁面「常用項目」Tab。
- **Endpoint**: `GET /api/v1/inventory/frequent`
- **功能**: 取得使用者經常購買或使用的食材建議清單。
- **Request**:
  ```typescript
  type GetFrequentRequest = {
    limit?: number; //例如 Top 10
  }
  ```
- **Response**:
  ```typescript
  type GetFrequentResponse = {
    items: FoodItem[]; // 或者是簡化的 Food 結構，視設計而定，這裡建議沿用 FoodItem 或擴充欄位
  }
  ```

### 3.5 Step 5: 更新文件 (Update Documentation)
- **動作**: 更新 `src/modules/inventory/README.md` 以反映最新的程式碼結構與命名。

---

## 4. 執行建議 (Execution Proposal)

建議優先執行 **Step 2 (命名)** 與 **Step 3 (拆分批次)** 與 **Step 4**。

### 擬定修改後的 Interface

```typescript
export type InventoryApi = {
  getInventory: (params?: GetInventoryRequest) => Promise<GetInventoryResponse>; // Renamed from getItems
  getItem: (id: string) => Promise<FoodItem>;
  addItem: (data: AddFoodItemRequest) => Promise<AddFoodItemResponse>;
  updateItem: (id: string, data: UpdateFoodItemRequest) => Promise<UpdateFoodItemResponse>;
  deleteItem: (id: string) => Promise<DeleteFoodItemResponse>;
  
  // Split Batch Operations
  batchAdd: (data: BatchAddInventoryRequest) => Promise<BatchOperationResponse>;
  batchUpdate: (data: BatchUpdateInventoryRequest) => Promise<BatchOperationResponse>;
  batchDelete: (data: BatchDeleteInventoryRequest) => Promise<BatchOperationResponse>;
  
  // New Methods
  getExpiredItems: () => Promise<FoodItem[]>;
  getFrequentItems: () => Promise<FoodItem[]>;
  
  // Existing
  getStats: (groupId?: string) => Promise<InventoryStats>;
  getCategories: () => Promise<CategoryInfo[]>;
  getSummary: () => Promise<InventorySummary>;
  getSettings: () => Promise<InventorySettings>;
  updateSettings: (data: UpdateInventorySettingsRequest) => Promise<void>;
};
```
