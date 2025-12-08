# Recipes Module API Specification

**版本**: v1.0  
**涵蓋範圍**: 食譜列表/詳情、收藏、烹煮、Meal Plan

---

## 1. 基本規範
- Base URL: `/api/v1`
- 需帶 Access Token
- 成功/錯誤格式同 `auth_api_spec.md`

---

## 2. 資料模型

### 2.1 Recipe
```typescript
type Recipe = {
  id: string;
  name: string;
  category: string;
  series?: string;
  imageUrl: string;
  servings: number;
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

### 2.2 RecipeIngredient
```typescript
type RecipeIngredient = {
  name: string;
  quantity: number | string;
  unit?: string;
  foodId?: string; // 對應庫存/食材主檔
};
```

### 2.3 CookingStep
```typescript
type CookingStep = {
  order: number;
  description: string;
  imageUrl?: string;
};
```

### 2.4 MealPlanInput
```typescript
type MealPlanInput = {
  recipeId: string;
  scheduledDate: string; // YYYY-MM-DD
  servings?: number;
};
```

### 2.5 ConsumptionConfirmation
```typescript
type ConsumptionConfirmation = {
  recipeId: string;
  items?: Array<{ foodId: string; quantity: number; unit?: string }>;
};
```

---

## 3. Recipes API

### 3.1 取得食譜列表
- **GET** `/recipes`
- Query: `category?`
- 200 → `Recipe[]`（或精簡列表型別）

### 3.2 取得單一食譜
- **GET** `/recipes/{id}`
- 200 → `Recipe`

### 3.3 收藏/取消收藏
- **POST** `/recipes/{id}/favorite`
- 200 → `{ isFavorite: boolean }`

### 3.4 取得收藏清單
- **GET** `/recipes/favorites`
- 200 → `Recipe[]`

### 3.5 食譜烹煮完成（扣庫存）
- **POST** `/recipes/{id}/cook`
- Body: `ConsumptionConfirmation`
- 200 → `{ success: boolean, message: string }`

### 3.6 新增 Meal Plan
- **POST** `/recipes/plan`
- Body: `MealPlanInput`
- 201 → `MealPlan`

### 3.7 取得 Meal Plans
- **GET** `/recipes/plan`
- 200 → `MealPlan[]`

### 3.8 刪除 Meal Plan
- **DELETE** `/recipes/plan/{planId}`
- 204 或 `{ success: true }`

