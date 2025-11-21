# 類別頁面設計實作計畫 (Category Page Design Implementation Plan)

## 1. 目標 (Objective)
根據設計稿更新庫存 (Inventory) 相關頁面的 UI，確保 `HeroCard` 在不同路由下顯示對應內容。

- **庫存主頁 (`/inventory`)**: `HeroCard` 顯示 **成員列表 (Member List)**。
- **類別子頁面 (`/inventory/category/:id`)**: `HeroCard` 顯示 **類別橫幅 (Category Banner)**。

## 2. 元件規劃 (Component Architecture)

### 2.1. 庫存主頁 (Inventory Main)
- **檔案**: `src/routes/Inventory/index.tsx`
- **結構**:
  ```tsx
  <>
    <HeroCard>
      <MemberList />
    </HeroCard>
    <TabsSection />
  </>
  ```

### 2.2. 類別子頁面 (Category Page)
- **檔案**: `src/routes/Inventory/CategoryPage.tsx`
- **變更**: 使用 `HeroCard` 包覆新的 Banner 元件，保持視覺一致性。
- **結構**:
  ```tsx
  <div className="min-h-screen bg-gray-50">
    {/* 1. Header Area (Back button + Title) */}
    <CategoryHeader title={category.title} />

    {/* 2. Hero Section (Replaces MemberList) */}
    <HeroCard>
      <CategoryBanner category={category} />
    </HeroCard>

    <div className="p-4 space-y-4">
      {/* 3. Search Bar */}
      <SearchBar placeholder="搜尋" />

      {/* 4. Item List/Grid */}
      <CategoryItemList categoryId={categoryId} />
    </div>
  </div>
  ```

### 2.3. 新增元件 (New Components)

#### `CategoryBanner`
- **用途**: 顯示於 `HeroCard` 內的類別資訊卡片。
- **內容**:
  - 左側: 標題、Slogan (例如: "新鮮採摘，即時掌握存量")。
  - 右側: 類別圖片 (超出邊界效果)。
- **樣式**: 需適配 `HeroCard` 的圓角與陰影樣式。

#### `CategoryHeader`
- **用途**: 頁面頂部的導航列。
- **內容**: 返回按鈕、頁面標題。

## 3. 實作步驟 (Implementation Steps)

1.  **建立 `CategoryBanner` 元件**:
    - 設計符合 `HeroCard` 內部尺寸的卡片佈局。
2.  **更新 `CategoryPage.tsx`**:
    - 引入 `HeroCard`。
    - 組合 `CategoryHeader`, `HeroCard` (含 `CategoryBanner`), `SearchBar`, `CategoryItemList`。
3.  **樣式調整**:
    - 確保 `CategoryBanner` 在 `HeroCard` 中顯示正確 (可能需要調整 `HeroCard` 的 padding 或 overflow 屬性，如果 Banner 需要滿版效果)。

## 4. 注意事項 (Notes)
- `HeroCard` 目前有預設的 padding 與背景裝飾，需確認 `CategoryBanner` 是否需要覆蓋這些樣式，或者 `HeroCard` 需要接受 props 來調整樣式 (例如 `noPadding`)。
