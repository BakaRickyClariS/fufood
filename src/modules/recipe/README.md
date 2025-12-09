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

### 核心功能
1. 食譜列表/詳情
2. 收藏/取消收藏
3. 烹煮完成（更新狀態）
4. 餐期計畫 CRUD
5.（可選）AI 產生食譜入口

---

## 目錄結構
```
recipe/
├── components/
│   ├── features/ (RecipeList, RecipeDetailView, FavoriteRecipes)
│   ├── layout/   (RecipeHeader)
│   └── ui/       (AISearchCard, HeroCard, RecipeSeriesTag, IngredientList, CookingSteps, ConsumptionModal, ConsumptionEditor)
├── hooks/        (useRecipes, useFavorite, useConsumption, useMealPlan)
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
  status?: 'draft' | 'published' | 'cooked';
  createdAt: string;
  updatedAt?: string;
};
```

---

## API 規格

### 路由（對應 API_REFERENCE_V2 #33-#40）
- `GET /api/v1/recipes`：列表，支援 `category`、`favorite=true`
- `GET /api/v1/recipes/{id}`：詳情
- `POST /api/v1/recipes/{id}/favorite`：加入最愛
- `DELETE /api/v1/recipes/{id}/favorite`：取消最愛
- `PATCH /api/v1/recipes/{id}`：更新狀態 `{ status: 'cooked' }` 等（取代 POST /cook）
- `POST /api/v1/recipes/plan`：新增餐期計畫
- `GET /api/v1/recipes/plan`：取得餐期計畫
- `DELETE /api/v1/recipes/plan/{planId}`：移除餐期計畫

### RecipeApi 介面
```typescript
export interface RecipeApi {
  getRecipes: (params?: { category?: RecipeCategory; favorite?: boolean }) => Promise<RecipeListItem[]>;
  getRecipeById: (id: string) => Promise<Recipe>;
  addFavorite: (id: string) => Promise<{ isFavorite: boolean }>;
  removeFavorite: (id: string) => Promise<{ isFavorite: boolean }>;
  updateRecipe: (id: string, data: Partial<Recipe>) => Promise<Recipe>; // 用於狀態 cooked
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
  markCooked: (id: string) => Promise<void>, // 呼叫 PATCH /recipes/{id} { status: 'cooked' }
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

## Mock 資料
- `services/mock/mockData.ts`：含食譜、收藏、餐期計畫等測試資料。

--- 

**備註**：烹煮動作統一使用 `PATCH /recipes/{id}`（例如 `{ status: 'cooked' }`），收藏列表改由 `GET /recipes?favorite=true`。
