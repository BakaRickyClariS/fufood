# Recipe 食譜模組

本模組負責管理食譜瀏覽、收藏、食材消耗與烹煮計劃等功能。

## 目錄結構

```
src/modules/recipe/
├── components/
│   ├── ui/                         # 純 UI 元件（可重用）
│   │   ├── RecipeCard.tsx          # 食譜卡片
│   │   ├── RecipeSeriesTag.tsx     # 系列標籤
│   │   ├── IngredientList.tsx      # 食材清單
│   │   ├── CookingSteps.tsx        # 烹煮步驟
│   │   ├── ConsumptionModal.tsx    # 消耗確認彈窗
│   │   └── ConsumptionEditor.tsx   # 消耗編輯器
│   │
│   ├── layout/                     # 版面配置元件
│   │   ├── RecipeHeader.tsx        # 頂部導航
│   │   ├── CategorySection.tsx     # 分類選單
│   │   └── SearchBar.tsx           # 搜尋列
│   │
│   └── features/                   # 業務功能視圖
│       ├── RecipeList.tsx          # 食譜列表頁面內容
│       ├── RecipeDetailView.tsx    # 食譜詳情頁面內容
│       └── FavoriteRecipes.tsx     # 收藏頁面內容
│
├── hooks/
│   ├── useRecipes.ts               # 食譜查詢 Hook
│   ├── useFavorite.ts              # 收藏操作 Hook
│   ├── useConsumption.ts           # 消耗確認 Hook
│   └── useMealPlan.ts              # 烹煮計劃 Hook
│
├── services/
│   ├── api/                        # API 定義
│   ├── mock/                       # Mock 資料與實作
│   └── index.ts                    # 服務入口（切換 Mock/Real）
│
├── types/                          # TypeScript 類型定義
├── utils/                          # 工具函式
└── constants/                      # 常數定義
```

## 功能說明

1.  **食譜瀏覽**：支援關鍵字搜尋與分類篩選。
2.  **食譜詳情**：顯示食材、步驟，並支援「確認消耗」功能。
3.  **食材消耗**：烹煮完成後，可選擇扣除庫存食材，並可選擇是否加入採買清單。
4.  **收藏功能**：可收藏喜歡的食譜。
5.  **烹煮計劃**：(規劃中) 安排未來的烹煮行程。

## API 服務

本模組使用 `RecipeApi` 介面進行資料存取，支援 Mock 與真實 API 切換。
設定 `VITE_USE_MOCK_API=true` 可強制使用 Mock 資料。
