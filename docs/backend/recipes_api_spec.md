# Recipes Module API Specification

**版本**: v1.1  
**最後更新**: 2025-12-29  
**涵蓋範圍**: 食譜列表/詳情、收藏、烹煮、Meal Plan

> [!TIP]
> AI 食譜生成規格請參考 [前端串接整合指南](./frontend_integration_guide.md) 第 2.3 節。

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
  category: string;           // 料理類型（如：日式、台式、義式...）
  series?: string;
  imageUrl: string;
  servings: number;
  cookTime: number;           // 分鐘
  difficulty: '簡單' | '中等' | '困難';
  ingredients: RecipeIngredient[];
  seasonings?: RecipeIngredient[];  // 調味料
  steps: CookingStep[];
  isFavorite?: boolean;
  source?: 'ai_generated' | 'manual';
  originalPrompt?: string;
  createdAt: string;
  updatedAt?: string;
};
```

### 2.2 RecipeIngredient / IngredientItem

```typescript
// 食譜模組使用的食材格式
type RecipeIngredient = {
  name: string;
  quantity: string;           // e.g. "3-4" or "100g"
  unit?: string;
  category: '準備材料' | '調味料';
};

// AI 回傳的食材格式
type IngredientItem = {
  name: string;
  amount: string;             // 數量
  unit: string;               // 單位
};
```

### 2.3 CookingStep

```typescript
type CookingStep = {
  step: number;
  description: string;
  time?: string;
};
```

### 2.4 MealPlanInput

```typescript
type MealPlanInput = {
  recipeId: string;
  scheduledDate: string;      // YYYY-MM-DD
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

## 3. Recipes API（儲存食譜）

Base Path: `/api/v1/recipes`

| Method   | Endpoint            | 說明         |
| :------- | :------------------ | :----------- |
| `GET`    | `/`                 | 取得列表     |
| `POST`   | `/`                 | 新增食譜     |
| `GET`    | `/:id`              | 取得單筆     |
| `PUT`    | `/:id`              | 更新食譜     |
| `DELETE` | `/:id`              | 刪除食譜     |
| `POST`   | `/:id/favorite`     | 加入最愛     |
| `DELETE` | `/:id/favorite`     | 取消最愛     |

### 3.1 取得食譜列表

- **GET** `/api/v1/recipes`
- Query: `category?`, `favorite? (true/false)`, `limit?`, `offset?`
- 200 → `{ success: true, data: { recipes: Recipe[], pagination: {...} } }`

### 3.2 取得單一食譜

- **GET** `/api/v1/recipes/{id}`
- 200 → `{ success: true, data: Recipe }`

### 3.3 收藏/取消收藏

- **POST** `/api/v1/recipes/{id}/favorite`（加入最愛）
- **DELETE** `/api/v1/recipes/{id}/favorite`（取消最愛）
- 200 → `{ isFavorite: boolean }`

### 3.4 食譜烹煮完成（扣庫存/更新狀態）

- **PATCH** `/api/v1/recipes/{id}`
- Body: `ConsumptionConfirmation` 或 `{ status: 'cooked' }`
- 200 → `{ success: boolean, message: string }`

---

## 4. Meal Plan API

### 4.1 新增 Meal Plan

- **POST** `/api/v1/recipes/plan`
- Body: `MealPlanInput`
- 201 → `MealPlan`

### 4.2 取得 Meal Plans

- **GET** `/api/v1/recipes/plan`
- 200 → `MealPlan[]`

### 4.3 刪除 Meal Plan

- **DELETE** `/api/v1/recipes/plan/{planId}`
- 204 或 `{ success: true }`

---

## 5. 相關文件

- [前端串接整合指南](./frontend_integration_guide.md) ⭐ **必讀**
- [AI 食譜生成 API 規格](./ai_recipe_api_spec.md)
- [儲存食譜 API 規格](./saved_recipes_api_spec.md)
