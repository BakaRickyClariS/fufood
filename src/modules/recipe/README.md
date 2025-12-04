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
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責管理**食譜瀏覽、收藏、食材消耗與烹煮計劃**等功能。整合庫存模組實現食材扣除，並支援將缺料項目加入採買清單。

### 核心功能
1.  **食譜瀏覽**: 支援關鍵字搜尋與 12 種分類篩選
2.  **食譜詳情**: 顯示完整食材清單與烹煮步驟
3.  **收藏管理**: 收藏/取消收藏喜歡的食譜
4.  **食材消耗**: 烹煮完成後，可選擇扣除庫存食材
5.  **採買整合**: 缺料項目可一鍵加入採買清單
6.  **烹煮計劃**: 安排未來的烹煮行程 (Meal Plan)
7.  **Mock 模式**: 支援離線開發與測試

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
│   │   ├── RecipeHeader.tsx     # 頂部導航
│   │   └── SearchBar.tsx        # 搜尋列
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
│   ├── consumptionCalculator.ts # 消耗計算
│   ├── parseQuantity.ts         # 數量解析
│   └── recipeFormatter.ts       # 格式化工具
├── constants/                # 常數定義
│   ├── categories.ts        # 分類常數
│   └── config.ts            # 模組設定
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

### RecipeListItem (食譜列表項目)
```typescript
export type RecipeListItem = {
  id: string;
  name: string;
  category: RecipeCategory;
  imageUrl: string;
  servings: number;
  cookTime: number;
  isFavorite?: boolean;
};
```

### RecipeCategory (食譜分類)
```typescript
export type RecipeCategory = 
  | '中式料理' | '美式料理' | '義式料理' | '日式料理'
  | '泰式料理' | '韓式料理' | '墨西哥料理' | '川菜'
  | '越南料理' | '健康輕食' | '甜點' | '飲品';
```

### RecipeIngredient (食譜食材)
```typescript
export type RecipeIngredient = {
  name: string;              // 食材名稱
  quantity: string;          // 數量（如 "3-4條"）
  unit?: string;             // 單位
  category: '準備材料' | '調味料';
};
```

### ConsumptionConfirmation (消耗確認)
```typescript
export type ConsumptionConfirmation = {
  recipeId: string;
  recipeName: string;
  items: ConsumptionItem[];
  addToShoppingList: boolean;  // 是否加入採買清單
  timestamp: string;
};
```

### MealPlan (烹煮計劃)
```typescript
export type MealPlan = {
  id: string;
  recipeId: string;
  recipeName: string;
  scheduledDate: string;     // 預計烹煮日期
  servings: number;
  status: 'planned' | 'cooking' | 'completed';
  createdAt: string;
};
```

---

## API 規格

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

### 1. **getRecipes** - 取得食譜列表

#### 端點
```
GET /api/v1/recipes
```

#### 請求參數 (Query Params)
- `category`: 分類篩選 (可選)

#### 回應格式
```typescript
RecipeListItem[]
```

---

### 2. **getRecipeById** - 取得單一食譜詳情

#### 端點
```
GET /api/v1/recipes/{id}
```

#### 回應格式
```typescript
Recipe  // 含完整食材清單與烹煮步驟
```

---

### 3. **toggleFavorite** - 收藏/取消收藏

#### 端點
```
POST /api/v1/recipes/{id}/favorite
```

#### 回應格式
```typescript
{ isFavorite: boolean }
```

---

### 4. **getFavorites** - 取得收藏列表

#### 端點
```
GET /api/v1/recipes/favorites
```

#### 回應格式
```typescript
RecipeListItem[]
```

---

### 5. **confirmCook** - 烹煮完成 (扣除庫存)

#### 端點
```
POST /api/v1/recipes/{id}/cook
```

#### 請求格式
```typescript
ConsumptionConfirmation
```

#### 回應格式
```typescript
{ success: boolean; message: string }
```

---

### 6-8. **MealPlan** 烹煮計劃 API

| 方法 | 端點 | 說明 |
|------|------|------|
| `addMealPlan` | `POST /api/v1/recipes/plan` | 加入烹煮計劃 |
| `getMealPlans` | `GET /api/v1/recipes/plan` | 取得計劃列表 |
| `deleteMealPlan` | `DELETE /api/v1/recipes/plan/{planId}` | 刪除計劃 |

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

**功能**:
- 根據分類查詢食譜列表
- 自動處理載入狀態與錯誤
- 支援手動重新載入

---

### `useFavorite.ts`

```typescript
const useFavorite = () => {
  return {
    toggleFavorite: (recipeId: string) => Promise<boolean>;
    isToggling: boolean;
  };
};
```

**功能**:
- 切換食譜收藏狀態
- 回傳最新的收藏狀態

---

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

**功能**:
- 提交烹煮完成確認
- 自動處理庫存扣除與採買清單整合

---

### `useMealPlan.ts`

```typescript
const useMealPlan = () => {
  return {
    mealPlans: MealPlan[];
    isLoading: boolean;
    error: string | null;
    addMealPlan: (data: MealPlanInput) => Promise<void>;
    deleteMealPlan: (planId: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```

**功能**:
- 管理烹煮計劃的 CRUD 操作
- 支援 **樂觀更新 (Optimistic Update)**
- 自動回滾失敗操作

---

## 元件結構

### Features 元件 (業務功能)
| 元件 | 說明 |
|------|------|
| `RecipeList.tsx` | 食譜列表頁面，支援分類篩選 |
| `RecipeDetailView.tsx` | 食譜詳情頁，顯示食材與步驟 |
| `FavoriteRecipes.tsx` | 收藏食譜列表 |

### Layout 元件 (版面配置)
| 元件 | 說明 |
|------|------|
| `RecipeHeader.tsx` | 頂部導航列 |
| `SearchBar.tsx` | 搜尋輸入框 |

### UI 元件 (可重用)
| 元件 | 說明 |
|------|------|
| `AISearchCard.tsx` | AI 智慧搜尋卡片 |
| `HeroCard.tsx` | 主視覺大圖卡片 |
| `RecipeSeriesTag.tsx` | 系列標籤 (如 "慢火煮系列") |
| `IngredientList.tsx` | 食材清單展示 |
| `CookingSteps.tsx` | 烹煮步驟展示 |
| `ConsumptionModal.tsx` | 消耗確認彈窗 |
| `ConsumptionEditor.tsx` | 消耗數量編輯器 |

---

## 工具函式

### `parseQuantity.ts`
解析食譜中的數量字串（如 "3-4條"）為數值格式。

### `consumptionCalculator.ts`
計算食材消耗數量，用於庫存扣除。

### `recipeFormatter.ts`
食譜資料格式化工具，用於顯示處理。

---

## 環境變數設定

### 必要環境變數

```env
# Mock 模式 (開發用)
VITE_USE_MOCK_API=true

# API 基礎路徑
VITE_API_BASE_URL=http://localhost:3000
```

### 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | 後端 API 網址 | `http://localhost:3000` |

---

## Mock 資料

Mock 資料位於 `services/mock/mockData.ts`，包含：
- 完整食譜範例 (`MOCK_RECIPES`)
- 食譜列表項目 (`MOCK_RECIPE_LIST`)

Mock API 使用 `localStorage` 模擬資料持久化，包括：
- `recipe_favorites`: 收藏食譜 ID 列表
- `recipe_consumptions`: 消耗記錄
- `meal_plans`: 烹煮計劃列表
- `shopping_list`: 採買清單
