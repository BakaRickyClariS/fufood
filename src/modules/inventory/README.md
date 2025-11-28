# Inventory Module (庫存管理)

## 簡介
本模組是應用程式的核心資料管理中心，負責維護使用者的所有食材庫存。採用 Redux Toolkit 進行全域狀態管理，確保資料在不同頁面間的一致性。

## 核心功能
1.  **庫存列表**: 依據分類 (Category) 或狀態 (一般/過期) 顯示食材。
2.  **分類管理**: 提供不同食材類別的切換與篩選。
3.  **狀態追蹤**: 自動計算食材過期日，並區分「一般物品」與「過期紀錄」。
4.  **CRUD 操作**: 支援食材的新增、讀取、更新與刪除。

## 目錄結構說明

### `components/` (UI 元件)
- **`layout/`**: 
  - 庫存頁面的主要佈局元件。
  - 包含列表容器、分類導航列等結構性元件。
- **`ui/`**: 
  - **`FoodCard`**: 單一食材的顯示卡片，展示圖片、名稱、數量與到期日。
  - **`CategoryTabs`**: 分類切換標籤。
  - 其他庫存專用的微型元件。

### `store/` (狀態管理)
- **`inventorySlice.ts`**: 
  - 定義 Inventory 的 Redux Slice。
  - **State**: 包含 `items` (所有食材列表), `loading` (載入狀態), `error` (錯誤訊息)。
  - **Actions**: `setItems`, `addItem`, `updateItem`, `removeItem` 等 Reducers。
  - **Selectors**: 提供篩選特定分類或過期食材的 Selector 函式。

### `services/` (API 服務)
- 負責與後端資料庫同步庫存資料。
- 包含 `fetchInventory`, `addFoodItem`, `deleteFoodItem` 等 API 函式。

### `constants/` (常數定義)
- 定義食材分類的列舉 (Enums) 或常數物件 (如：`CATEGORY_LABELS`)。
- 定義過期狀態的判斷標準。

## 資料流向
1.  應用程式啟動或進入庫存頁面 -> Dispatch `fetchInventory`。
2.  `inventorySlice` 更新 Store 中的 `items`。
3.  `InventoryPage` 透過 Selector 訂閱資料變更。
4.  使用者操作 (如刪除) -> Dispatch `deleteItem` Action -> 更新 Store -> 同步呼叫 API 更新後端。
