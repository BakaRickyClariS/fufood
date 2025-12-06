# Recipe Module (食譜管理模組)

## 📋 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [Hooks 詳解](#hooks-詳解)
- [元件結構](#元件結構)
- [工具函式](#工具函式)
- [路由設定](#路由設定)
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責管理**食譜瀏覽、收藏、食材消耗與烹煮計劃**等功能。整合庫存模組實現食材扣除，並支援將缺料項目加入採買清單。

> **路由變更**: 本模組已遷移至 `/planning/recipes/*` 路徑下，隸屬於 Planning 模組。

### 核心功能
1.  **食譜瀏覽**: 支援關鍵字搜尋與 12 種分類篩選
2.  **食譜詳情**: 顯示完整食材清單與烹煮步驟
3.  **收藏管理**: 收藏/取消收藏喜歡的食譜
4.  **食材消耗**: 烹煮完成後，可選擇扣除庫存食材
5.  **採買整合**: 缺料項目可一鍵加入採買清單
6.  **烹煮計劃**: 安排未來的烹煮行程 (Meal Plan)
7.  **AI 智慧搜尋**: 透過 AI 推薦食譜
8.  **Mock 模式**: 支援離線開發與測試

---

## 目錄結構

```
recipe/
├── components/               # UI 元件
│   ├── features/            # 業務功能視圖
│   │   ├── RecipeList.tsx       # 食譜列表
│   │   ├── RecipeDetailView.tsx # 食譜詳情
│   │   └── FavoriteRecipes.tsx  # 收藏頁面
│   ├── layout/              # 版面配置
│   │   └── RecipeHeader.tsx     # 頂部導航
│   └── ui/                  # 基礎元件
│       ├── AISearchCard.tsx     # AI 搜尋卡片
│       ├── HeroCard.tsx         # 主視覺卡片
│       ├── RecipeSeriesTag.tsx  # 系列標籤
│       ├── IngredientList.tsx   # 食材清單
│       ├── CookingSteps.tsx     # 烹煮步驟
│       ├── ConsumptionModal.tsx # 消耗確認彈窗
│       └── ConsumptionEditor.tsx# 消耗編輯器
├── hooks/                    # 自定義 Hooks
│   ├── index.ts
│   ├── useRecipes.ts        # 食譜查詢
│   ├── useFavorite.ts       # 收藏操作
│   ├── useConsumption.ts    # 消耗確認
│   └── useMealPlan.ts       # 烹煮計劃
├── services/                 # 服務層
│   ├── api/
│   │   └── recipeApi.ts     # API 介面與真實實作
│   ├── mock/
│   │   ├── mockRecipeApi.ts # Mock API 實作
│   │   └── mockData.ts      # Mock 資料
│   └── index.ts             # 服務匯出 (切換 Mock/Real)
├── types/                    # TypeScript 型別
│   ├── index.ts
│   ├── recipe.ts            # 食譜核心型別
│   ├── ingredient.ts        # 食材消耗型別
│   └── mealPlan.ts          # 烹煮計劃型別
├── utils/                    # 工具函式
│   ├── parseQuantity.ts     # 數量解析
│   └── ...
├── constants/                # 常數定義
│   └── categories.ts        # 分類常數與圖片
└── README.md
```

---

## 型別定義 (Types)

### Recipe (食譜)
```typescript
export type Recipe = {
  id: string;
  name: string;              // 食譜名稱
  category: RecipeCategory;
  series?: string;           // 系列名稱（如 "慢火煮系列"）
  imageUrl: string;
  servings: number;          // 幾人份
  cookTime: number;          // 烹煮時間（分鐘）
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

### RecipeCategory (食譜分類)
```typescript
export type RecipeCategory = 
  | '中式料理' | '美式料理' | '義式料理' | '日式料理'
  | '泰式料理' | '韓式料理' | '墨西哥料理' | '川菜'
  | '越南料理' | '健康輕食' | '甜點' | '飲品';
```

---

## API 規格

根據 [API_REFERENCE_V2.md](../API_REFERENCE_V2.md) 定義：

| # | Method | API Path | 功能說明 | 狀態 |
|---|--------|----------|---------|------|
| 40 | GET | `/api/v1/recipes` | 取得所有食譜 | 🆕 |
| 41 | GET | `/api/v1/recipes/{id}` | 取得單一食譜詳情 | 🆕 |
| 42 | POST | `/api/v1/recipes/{id}/favorite` | 收藏/取消收藏食譜 | 🆕 |
| 43 | GET | `/api/v1/recipes/favorites` | 取得收藏食譜清單 | 🆕 |
| 44 | POST | `/api/v1/recipes/{id}/cook` | 食譜完成 → 扣除庫存食材 | 🆕 |
| 45 | POST | `/api/v1/recipes/plan` | 加入待烹煮計劃 (MealPlan) | 🆕 |
| 46 | GET | `/api/v1/recipes/plan` | 取得目前規劃的食譜計畫 | 🆕 |
| 47 | DELETE | `/api/v1/recipes/plan/{planId}` | 刪除待烹煮計畫 | 🆕 |

### RecipeApi 介面
```typescript
export interface RecipeApi {
  getRecipes(category?: RecipeCategory): Promise<RecipeListItem[]>;
  getRecipeById(id: string): Promise<Recipe>;
  toggleFavorite(id: string): Promise<{ isFavorite: boolean }>;
  getFavorites(): Promise<RecipeListItem[]>;
  confirmCook(data: ConsumptionConfirmation): Promise<{ success: boolean; message: string }>;
  addMealPlan(data: MealPlanInput): Promise<MealPlan>;
  getMealPlans(): Promise<MealPlan[]>;
  deleteMealPlan(planId: string): Promise<{ success: boolean }>;
}
```

---

## Hooks 詳解

### `useRecipes.ts`
```typescript
const useRecipes = (category?: RecipeCategory) => {
  return {
    recipes: RecipeListItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  };
};
```

### `useFavorite.ts`
```typescript
const useFavorite = () => {
  return {
    toggleFavorite: (recipeId: string) => Promise<boolean>;
    isToggling: boolean;
  };
};
```

### `useConsumption.ts`
```typescript
const useConsumption = () => {
  return {
    confirmConsumption: (data: ConsumptionConfirmation) => Promise<{ success: boolean; message: string }>;
    isSubmitting: boolean;
    error: string | null;
  };
};
```

---

## 元件結構

| 分類 | 元件 | 說明 |
|------|------|------|
| Features | `RecipeList.tsx` | 食譜列表頁面，支援分類篩選 |
| Features | `RecipeDetailView.tsx` | 食譜詳情頁，顯示食材與步驟 |
| Features | `FavoriteRecipes.tsx` | 收藏食譜列表 |
| Layout | `RecipeHeader.tsx` | 頂部導航列，含返回與收藏按鈕 |
| UI | `AISearchCard.tsx` | AI 智慧搜尋卡片 |
| UI | `IngredientList.tsx` | 食材清單展示 |
| UI | `CookingSteps.tsx` | 烹煮步驟展示 |
| UI | `ConsumptionModal.tsx` | 消耗確認彈窗 |

---

## 路由設定

本模組路由已整合至 Planning 模組：

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/planning?tab=recipes` | PlanningHome | 食譜推薦 Tab |
| `/planning/recipes/:id` | RecipeDetailView | 食譜詳情頁 |
| `/planning/recipes/favorites` | FavoriteRecipes | 收藏食譜 |
| `/planning/recipes/ai-query` | AIQueryPage | AI 智慧查詢 |

---

## 環境變數設定

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | 後端 API 網址 | `http://localhost:3000` |

---

## Mock 資料

Mock 資料位於 `services/mock/mockData.ts`，使用 `localStorage` 模擬資料持久化。
