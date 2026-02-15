# 類別子路由規劃書 (Category Sub-route Planning)

## 1. 目標 (Objective)
為庫存 (Inventory) 區塊實作子路由系統，讓使用者可以導航至特定類別頁面（例如：點擊「蔬果類」開啟顯示所有蔬果項目的頁面）。

## 2. 路由結構 (Routing Structure)

目前路由：
- `/inventory`: 顯示主要庫存儀表板 (Hero, MemberList, Tabs, Category Grid)。

建議路由：
- `/inventory`: 保持為主要儀表板。
- `/inventory/category/:categoryId`: 特定類別的動態路由。
  - `categoryId`: 對應 `categories.ts` 中的 `id` 欄位 (例如：`fruit`, `frozen`, `bake`)。

## 3. 元件架構 (Component Architecture)

### 3.1. 路由器配置 (Router Configuration)
修改路由器配置（預計在 `src/routes/index.tsx` 或 `src/App.tsx` - *待確認*）以包含巢狀路由。

```tsx
// 路由器結構範例
{
  path: 'inventory',
  element: <InventoryLayout />, // 可選：如果需要共用版型
  children: [
    {
      index: true,
      element: <InventoryDashboard />, // 目前 Inventory/index.tsx 的內容
    },
    {
      path: 'category/:categoryId',
      element: <CategoryPage />, // 新元件
    },
  ],
}
```

或者，如果不使用帶有共用版型的巢狀路由，我們可以新增一個並列路由或在 `Inventory` 內部處理（雖然獨立路由較利於深度連結）。

### 3.2. 新增元件 (New Components)

#### `CategoryPage.tsx`
- **位置**: `src/routes/Inventory/CategoryPage.tsx`
- **用途**: 顯示屬於特定類別的項目。
- **功能**:
  - **標題**: 顯示類別標題 (例如：「蔬果類」)。
  - **返回按鈕**: 返回 `/inventory`。
  - **內容**: 該類別的項目列表或網格。
  - **邏輯**:
    - 使用 `useParams()` 取得 `categoryId`。
    - 從 `categories.ts` 查找類別詳細資訊。
    - 根據 `categoryId` 獲取/篩選項目。

### 3.3. 修改元件 (Modified Components)

#### `CategoryCard.tsx`
- **位置**: `src/components/ui/CategoryCard.tsx`
- **變更**: 將卡片內容（或卡片本身）包覆在 `Link` 元件中（來自 `react-router-dom`）。
- **Props**: 新增 `id` 或 `href` prop 以建構連結 URL。

#### `CategorySection.tsx`
- **位置**: `src/components/layout/inventory/CategorySection.tsx`
- **變更**: 將 `id` 傳遞給 `CategoryCard`，使其能連結至 `/inventory/category/${id}`。

## 4. 資料流 (Data Flow)

1.  **導航**: 使用者點擊 `/inventory` 頁面上的 `CategoryCard`。
2.  **URL 變更**: 瀏覽器 URL 變更為 `/inventory/category/fruit`。
3.  **路由**: 路由器匹配 `/inventory/category/:categoryId` 並渲染 `CategoryPage`。
4.  **資料載入**:
    - `CategoryPage` 讀取 `categoryId` = "fruit"。
    - 在 `categories.ts` 中查找 "fruit" 以取得標題 "蔬果類" 和樣式 (bgColor 等)。
    - (未來) 獲取 `category === 'fruit'` 的庫存項目。

## 5. 實作步驟 (Implementation Steps)

1.  **建立 `CategoryPage` 元件**:
    - 基本架構，包含 `useParams`。
    - 顯示類別標題。
2.  **更新路由器**:
    - 新增路由定義。
3.  **更新 `CategorySection` 與 `CategoryCard`**:
    - 為卡片新增 `Link`。
4.  **驗證**:
    - 點擊類別 -> 前往新頁面。
    - 檢查 URL。
    - 點擊返回 -> 回到庫存頁面。

## 6. 未來考量 (Future Considerations)
- **麵包屑導航 (Breadcrumbs)**: 新增麵包屑導航 (首頁 > 庫存 > 蔬果類)。
- **轉場效果 (Transitions)**: 新增頁面轉場動畫。
- **空狀態 (Empty States)**: 處理無效的 `categoryId` (404 或重新導向)。
