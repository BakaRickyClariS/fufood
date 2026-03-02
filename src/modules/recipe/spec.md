# Recipe Module（食譜管理）

## 目錄
- [概要](#概要)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別](#型別)
- [API 規格](#api-規格)
- [Hooks](#hooks)
- [元件總覽](#元件總覽)
- [路由設定](#路由設定)
- [環境變數](#環境變數)
- [Mock 資料](#mock-資料)

---

## 概要

管理食譜瀏覽、詳情、收藏、烹煮狀態與餐期計畫。依精簡後 API：烹煮改用 `PATCH /recipes/{id}`，收藏列表用查詢參數，移除獨立 `/recipes/favorites`。餐期計畫保留 `POST/GET/DELETE /recipes/plan`。

> [!TIP]
> AI 食譜生成相關規格請參考 [前端串接整合指南](../../docs/backend/frontend_integration_guide.md) 第 2.3 節。

### 核心功能

1. 食譜列表/詳情
2. 收藏/取消收藏
3. 烹煮完成（更新狀態）
4. 餐期計畫 CRUD
5. AI 產生食譜（`POST /api/v1/ai/recipe`）

---

## 目錄結構
recipe/
├── api/          (queries.ts - React Query hooks)
├── components/
│   ├── features/ (RecipeList, RecipeDetailView, FavoriteRecipes)
│   ├── layout/   (RecipeHeader)
│   └── ui/       (AISearchCard, HeroCard, RecipeSeriesTag, IngredientList, CookingSteps, ConsumptionModal, ConsumptionEditor)
├── hooks/        (useRecipes, useFavorite, useConsumption, useMealPlan, useRecipeDetailLogic)
├── services/
│   ├── api/      (recipeApi.ts)
│   ├── mock/     (mockRecipeApi.ts, mockData.ts)
│   └── index.ts
├── types/        (recipe.ts, ingredient.ts, mealPlan.ts, index.ts)
├── utils/        (parseQuantity.ts ...)
└── constants/    (categories.ts)
```

---

## 型別
```typescript
export type RecipeCategory =
  | '中式料理'
  | '美式料理'
  | '義式料理'
  | '日式料理'
  | '泰式料理'
  | '韓式料理'
  | '墨西哥料理'
  | '川菜'
  | '越南料理'
  | '健康輕食'
  | '甜點'
  | '飲品';

export type RecipeDifficulty = '簡單' | '中等' | '困難';

export type RecipeIngredient = {
  name: string; // ingredient name
  quantity: string; // e.g. "3-4" or "100g"
  unit?: string; // optional unit
  category: '準備材料' | '調味料';
};

export type CookingStep = {
  stepNumber: number;
  description: string;
  time?: string; // optional duration like "15-20min"
};

export type Recipe = {
  id: string;
  name: string;
  category: RecipeCategory;
  series?: string;
  imageUrl: string;
  servings: number;
  cookTime: number;          // 分鐘
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

---

## API 規格

### 食譜儲存 API（Saved Recipes）

| 方法     | 端點                                | 說明       |
| :------- | :---------------------------------- | :--------- |
| `GET`    | `/api/v1/recipes`                   | 取得列表   |
| `POST`   | `/api/v1/recipes`                   | 新增食譜   |
| `GET`    | `/api/v1/recipes/{id}`              | 取得單筆   |
| `PUT`    | `/api/v1/recipes/{id}`              | 更新食譜   |
| `DELETE` | `/api/v1/recipes/{id}`              | 刪除食譜   |
| `POST`   | `/api/v1/recipes/{id}/favorite`     | 加入最愛   |
| `DELETE` | `/api/v1/recipes/{id}/favorite`     | 取消最愛   |
| `PATCH`  | `/api/v1/recipes/{id}`              | 更新狀態   |

### AI 食譜生成 API

> 依據 [前端串接整合指南](../../docs/backend/frontend_integration_guide.md) 第 2.3 節

**Endpoint**: `POST /api/v1/ai/recipe`

**Request**:
```typescript
{
  prompt: string;                 // "清冰箱料理"
  selectedIngredients?: string[]; // ["雞胸肉", "高麗菜"]
  excludeIngredients?: string[];
  recipeCount?: number;           // 2
  servings?: number;              // 2
  difficulty?: "簡單" | "中等" | "困難";
  category?: string;              // "日式"
}
```

**Response**:
```typescript
{
  status: true,
  data: {
    greeting: string;
    recipes: {
      id: string;
      name: string;
      category: string;           // 料理類型 (日式, 台式...)
      servings: number;
      cookTime: number;
      difficulty: string;
      imageUrl: string;           // AI 生成圖
      ingredients: { name, amount, unit }[]; // 核心食材
      seasonings: { name, amount, unit }[];  // 調味料
      steps: { step, description }[];
    }[];
    remainingQueries: number;
  }
}
```

### RecipeApi 介面

```typescript
export interface RecipeApi {
  getRecipes: (params?: { category?: RecipeCategory; favorite?: boolean }) => Promise<RecipeListItem[]>;
  getRecipeById: (id: string) => Promise<Recipe>;
  addFavorite: (id: string) => Promise<{ isFavorite: boolean }>;
  removeFavorite: (id: string) => Promise<{ isFavorite: boolean }>;
  getFavorites: () => Promise<RecipeListItem[]>;
  toggleFavorite: (id: string, shouldFavorite?: boolean) => Promise<{ isFavorite: boolean }>;
  getRecommendedRecipes: (ingredientNames: string[]) => Promise<RecipeListItem[]>;
  confirmCook: (data: ConsumptionConfirmation) => Promise<{ success: boolean; message: string }>;
  addMealPlan: (data: MealPlanInput) => Promise<MealPlan>;
  getMealPlans: () => Promise<MealPlan[]>;
  deleteMealPlan: (planId: string) => Promise<{ success: boolean }>;
}
```

---

## Hooks

### `useRecipes.ts`
```typescript
const useRecipes = (params?: { category?: RecipeCategory; favorite?: boolean }) => ({
  recipes: RecipeListItem[],
  isLoading: boolean,
  error: string | null,
  refetch: () => Promise<void>,
});
```

### `useFavorite.ts`
```typescript
const useFavorite = () => ({
  addFavorite: (id: string) => Promise<boolean>,
  removeFavorite: (id: string) => Promise<boolean>,
  isToggling: boolean,
});
```

### `useConsumption.ts`（對應烹煮/耗用）
```typescript
const useConsumption = () => ({
  confirmConsumption: (data: ConsumptionConfirmation) => Promise<{ success: boolean; message: string }>,
  isSubmitting: boolean,
  error: string | null,
});
```

### `useMealPlan.ts`
```typescript
const useMealPlan = () => ({
  addMealPlan: (data: MealPlanInput) => Promise<void>,
  getMealPlans: () => Promise<MealPlan[]>,
  deleteMealPlan: (planId: string) => Promise<void>,
  isLoading: boolean,
  error: string | null,
});
```

---

## 元件總覽
| 類別 | 元件 | 說明 |
|------|------|------|
| Features | `RecipeList.tsx` | 列表頁，支援分類/收藏篩選 |
| Features | `RecipeDetailView.tsx` | 詳情頁，含食材與步驟 |
| Features | `FavoriteRecipes.tsx` | 收藏列表 |
| UI | `AISearchCard.tsx` | AI 智能找食譜入口（可選） |
| UI | `IngredientList.tsx` | 食材清單 |
| UI | `CookingSteps.tsx` | 烹煮步驟 |
| UI | `ConsumptionModal.tsx` | 烹煮/耗用確認 |

---

## 路由設定
（隸屬 Planning 模組）
| 路徑 | 元件 | 說明 |
|------|------|------|
| `/planning?tab=recipes` | PlanningHome | 食譜總覽 Tab |
| `/planning/recipes/:id` | RecipeDetailView | 食譜詳情 |
| `/planning/recipes/favorites` | FavoriteRecipes | 收藏列表 |
| `/planning/recipes/ai-query` | AIQueryPage | AI 智能查詢（可選） |

---

## 環境變數
| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | 後端 API 網址 | `http://localhost:3000` |

---

## 相關文件

- [前端串接整合指南](../../docs/backend/frontend_integration_guide.md) ⭐ **必讀**
- [AI 食譜 API 規格](../../docs/backend/ai_recipe_api_spec.md)
- [儲存食譜 API 規格](../../docs/backend/saved_recipes_api_spec.md)

---

## Mock 資料

- `services/mock/mockData.ts`：含食譜、收藏、餐期計畫等測試資料。

---

**備註**：烹煮動作統一使用 `PATCH /recipes/{id}`（例如 `{ status: 'cooked' }`），收藏列表改由 `GET /recipes?favorite=true`。
