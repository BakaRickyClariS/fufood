# 修改規畫書：集中管理 Max Width

## 目標
將專案中分散的 `max-width` 設定（特別是重複使用的 `800px`）集中到一處管理，以便於未來調整與維護。

## 現況分析
目前在多個檔案中發現硬編碼的 `max-width-[800px]`，主要用於限制內容區域的最大寬度：
- `src/routes/Dashboard/index.tsx`
- `src/features/dashboard/components/RecipeSection.tsx`
- `src/features/dashboard/components/InventorySection.tsx`
- `src/features/dashboard/components/AiRecommendCard.tsx`
- `src/features/inventory/components/layout/TabsSection.tsx`
- `src/features/inventory/components/layout/OverviewPanel.tsx`

此外，專案使用 **Tailwind CSS v4** 架構，設定檔位於 `src/style/index.css` 的 `@theme inline` 區塊中。

## 修改計畫

### 1. 定義全域變數
在 `src/style/index.css` 的 `@theme inline` 區塊中，新增自定義的 max-width 變數。

```css
@theme inline {
  /* ... 其他變數 ... */
  
  /* 新增 Layout 寬度變數 */
  --max-width-layout-container: 800px;
}
```

### 2. 替換硬編碼樣式
將上述檔案中的 `max-w-[800px]` 替換為 `max-w-layout-container`。

#### 修改檔案列表：
- [ ] `src/routes/Dashboard/index.tsx`
- [ ] `src/features/dashboard/components/RecipeSection.tsx`
- [ ] `src/features/dashboard/components/InventorySection.tsx`
- [ ] `src/features/dashboard/components/AiRecommendCard.tsx`
- [ ] `src/features/inventory/components/layout/TabsSection.tsx`
- [ ] `src/features/inventory/components/layout/OverviewPanel.tsx`

### 3. 驗證
- 確認所有修改後的頁面在寬螢幕下是否維持 800px 的最大寬度限制。
- 確認 RWD 行為是否正常。

## 預期效益
- **集中管理**：未來若需調整版面寬度（例如改為 900px），只需修改 `index.css` 一處。
- **語意清晰**：`max-w-layout-container` 比 `max-w-[800px]` 更具語意，表達這是「版面容器」的寬度。
