# Recipe 食譜模組規劃書

## 📋 目標概述

本規劃旨在建立全新的 `recipe` 模組，實現以下目標：

1. **模組化設計 (Modular Design)**：參考 `inventory` 和 `food-scan` 模組的架構模式，建立清晰的模組結構
2. **關注點分離 (Separation of Concerns)**：將業務邏輯、UI 呈現、資料處理清晰分離
3. **API 抽象層設計 (API Abstraction Layer)**：建立統一的 API 服務層，支援假資料與真實 API 無縫切換
4. **完整功能實作**：食譜瀏覽、收藏、食材消耗、烹煮計劃等核心功能

---

## 🎯 功能需求分析

### UI 設計分析

根據提供的 UI 設計圖，Recipe 模組包含以下頁面：

#### 1. 食譜首頁 (Recipe Home)
![食譜首頁](file:///C:/Users/USER/.gemini/antigravity/brain/14194ba2-826a-433d-9e9f-c33b7290c751/uploaded_image_0_1764695654650.png)

**功能要點**：
- FuFood.ai 搜尋框（輸入食材名稱，導向至相關頁面）
- 主題推薦、過火菜、韓味系、快速菜等分類標籤
- 各分類下顯示食譜卡片（圖片、名稱、人數、烹煮時間）
- 收藏食譜專區

#### 2. 食譜詳情頁 (Recipe Detail)
![食譜詳情](file:///C:/Users/USER/.gemini/antigravity/brain/14194ba2-826a-433d-9e9f-c33b7290c751/uploaded_image_1_1764695654650.png)

**功能要點**：
- 食譜圖片與系列標籤（如「慢火煮系列」）
- 食譜名稱與收藏按鈕
- 準備材料清單（食材名稱 + 數量）
- 調味料清單（調味料名稱 + 數量）
- 「確認消耗」按鈕

#### 3. 烹煮方式頁面 (Cooking Steps)
![烹煮方式](file:///C:/Users/USER/.gemini/antigravity/brain/14194ba2-826a-433d-9e9f-c33b7290c751/uploaded_image_2_1764695654650.png)

**功能要點**：
- 烹煮方式標題與分享按鈕
- 步驟化烹煮說明（step1, step2...）
- 「確認消耗」按鈕

#### 4. 消耗通知頁面 (Consumption Confirmation)
![消耗通知](file:///C:/Users/USER/.gemini/antigravity/brain/14194ba2-826a-433d-9e9f-c33b7290c751/uploaded_image_3_1764695654650.png)

**功能要點**：
- 本次消耗的食材列表（食材名稱 + 數量）
- 「已消耗，加入採買清單」按鈕
- 「僅消耗，暫不採買」按鈕
- 「編輯消耗」連結

#### 5. 編輯消耗原因頁面 (Edit Consumption)
![編輯消耗](file:///C:/Users/USER/.gemini/antigravity/brain/14194ba2-826a-433d-9e9f-c33b7290c751/uploaded_image_4_1764695654650.png)

**功能要點**：
- 3D 吉祥物圖示
- 食材消耗列表（可調整每項食材的消耗數量）
- 下拉選單調整數值
- 「儲存」按鈕

---

## 🏗️ 模組目錄結構

參考 `food-scan` 模組的架構設計，建立以下目錄結構：

```
src/modules/recipe/
├── components/
│   ├── ui/                         # 純 UI 元件（可重用）
│   │   ├── RecipeCard.tsx          # 食譜卡片元件
│   │   ├── RecipeSeriesTag.tsx     # 食譜系列標籤
│   │   ├── IngredientList.tsx      # 食材清單
│   │   ├── CookingSteps.tsx        # 烹煮步驟
│   │   ├── ConsumptionModal.tsx    # 消耗通知彈窗
│   │   └── ConsumptionEditor.tsx   # 消耗編輯元件
│   │
│   ├── layout/                     # 版面配置元件
│   │   ├── RecipeHeader.tsx        # 食譜頁面頂部
│   │   ├── CategorySection.tsx     # 分類區塊
│   │   └── SearchBar.tsx           # 搜尋列
│   │
│   └── features/                   # 業務功能元件
│       ├── RecipeList.tsx          # 食譜列表（整合分類、篩選）
│       ├── RecipeDetailView.tsx    # 食譜詳情檢視
│       └── FavoriteRecipes.tsx     # 收藏食譜

├── hooks/
│   ├── useRecipes.ts               # 食譜資料 Hook
│   ├── useFavorite.ts              # 收藏功能 Hook
│   ├── useConsumption.ts           # 消耗管理 Hook
│   └── useMealPlan.ts              # 烹煮計劃 Hook

├── services/
│   ├── api/
│   │   └── recipeApi.ts            # 統一 API 介面
│   │
│   ├── mock/
│   │   ├── mockRecipeApi.ts        # Mock API 實作
│   │   └── mockData.ts             # 假資料定義
│   │
│   └── index.ts                    # API 服務統一出口（環境切換）

├── types/
│   ├── recipe.ts                   # 食譜類型定義
│   ├── ingredient.ts               # 食材類型定義
│   ├── mealPlan.ts                 # 烹煮計劃類型定義
│   └── index.ts                    # 類型統一出口

├── utils/
│   ├── recipeFormatter.ts          # 食譜資料格式化工具
│   └── consumptionCalculator.ts   # 消耗計算工具

├── constants/
│   ├── categories.ts               # 食譜分類常數
│   └── config.ts                   # 模組配置

└── README.md                       # 模組說明文件
```

---

## 🔧 詳細設計規範

### 1️⃣ 類型定義

#### `types/recipe.ts`

```typescript
// types/recipe.ts
export type RecipeCategory = 
  | '主題推薦'
  | '過火菜'
  | '韓味系'
  | '快速菜'
  | '輕食系'
  | '慢火煮'
  | '其他';

export type RecipeDifficulty = '簡單' | '中等' | '困難';

export type RecipeIngredient = {
  name: string;           // 食材名稱
  quantity: string;       // 數量（如 "3-4條"）
  unit?: string;          // 單位（選填）
  category: '準備材料' | '調味料';
};

export type CookingStep = {
  stepNumber: number;     // 步驟編號
  description: string;    // 步驟說明
  time?: string;          // 所需時間（如 "15-20分鐘"）
};

export type Recipe = {
  id: string;
  name: string;           // 食譜名稱
  category: RecipeCategory;
  series?: string;        // 系列名稱（如 "慢火煮系列"）
  imageUrl: string;       // 食譜圖片
  servings: number;       // 幾人份
  cookTime: number;       // 烹煮時間（分鐘）
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  isFavorite?: boolean;   // 是否收藏
  createdAt: string;
  updatedAt?: string;
};

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

#### `types/ingredient.ts`

```typescript
// types/ingredient.ts
export type ConsumptionItem = {
  ingredientName: string;
  originalQuantity: string;    // 原始需要數量
  consumedQuantity: number;    // 實際消耗數量
  unit: string;
};

export type ConsumptionConfirmation = {
  recipeId: string;
  recipeName: string;
  items: ConsumptionItem[];
  addToShoppingList: boolean;  // 是否加入採買清單
  timestamp: string;
};
```

#### `types/mealPlan.ts`

```typescript
// types/mealPlan.ts
export type MealPlan = {
  id: string;
  recipeId: string;
  recipeName: string;
  scheduledDate: string;       // 預計烹煮日期
  servings: number;            // 份數
  status: 'planned' | 'cooking' | 'completed';
  createdAt: string;
};

export type MealPlanInput = {
  recipeId: string;
  scheduledDate: string;
  servings: number;
};
```

---

### 2️⃣ API 服務層設計

#### A. 統一 API 介面 (`services/api/recipeApi.ts`)

```typescript
// services/api/recipeApi.ts
import type { 
  Recipe, 
  RecipeListItem, 
  RecipeCategory,
  ConsumptionConfirmation,
  MealPlan,
  MealPlanInput 
} from '@/modules/recipe/types';

export type RecipeApi = {
  /**
   * 取得所有食譜列表
   * @param category - 篩選分類（選填）
   */
  getRecipes: (category?: RecipeCategory) => Promise<RecipeListItem[]>;

  /**
   * 取得單一食譜詳情
   * @param id - 食譜 ID
   */
  getRecipeById: (id: string) => Promise<Recipe>;

  /**
   * 切換收藏狀態
   * @param id - 食譜 ID
   */
  toggleFavorite: (id: string) => Promise<{ isFavorite: boolean }>;

  /**
   * 取得收藏食譜列表
   */
  getFavorites: () => Promise<RecipeListItem[]>;

  /**
   * 食譜完成烹煮 → 扣除庫存食材
   * @param data - 消耗確認資料
   */
  confirmCook: (data: ConsumptionConfirmation) => Promise<{ success: boolean; message: string }>;

  /**
   * 加入待烹煮計劃
   * @param data - 烹煮計劃資料
   */
  addMealPlan: (data: MealPlanInput) => Promise<MealPlan>;

  /**
   * 取得目前規劃的食譜計畫
   */
  getMealPlans: () => Promise<MealPlan[]>;

  /**
   * 刪除待烹煮計畫
   * @param planId - 計劃 ID
   */
  deleteMealPlan: (planId: string) => Promise<{ success: boolean }>;
};
```

#### B. Mock 資料定義 (`services/mock/mockData.ts`)

```typescript
// services/mock/mockData.ts
import type { Recipe, RecipeListItem } from '@/modules/recipe/types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'recipe-001',
    name: '涼拌小黃瓜',
    category: '慢火煮',
    series: '慢火煮系列',
    imageUrl: '/src/assets/images/recipe/Spicy-cucumber-salad.png',
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '小黃瓜', quantity: '3-4條', category: '準備材料' },
      { name: '蒜頭', quantity: '4-5顆', category: '準備材料' },
      { name: '辣椒', quantity: '1-2根', category: '準備材料' },
      { name: '鹽', quantity: '1/2茶匙', category: '調味料' },
      { name: '醬油', quantity: '1.5大匙', category: '調味料' },
      { name: '黑醋或白醋', quantity: '1大匙', category: '調味料' },
      { name: '砂糖', quantity: '1/2茶匙', category: '調味料' },
      { name: '麻油/香油', quantity: '1/2大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '將小黃瓜拍扁後切段，用 S1/2S 茶匙鹽抓勻，靜置 15-20分鐘瀝出水。',
        time: '15-20分鐘',
      },
      {
        stepNumber: 2,
        description: '倒掉瀝出的水分，準備蒜末、辣椒圈。',
      },
      {
        stepNumber: 3,
        description: '混合醬油、醋、砂糖、麻油/香油（可加花椒油）。',
      },
      {
        stepNumber: 4,
        description: '將瀝乾的黃瓜、蒜末、辣椒圈與醬汁充分拌勻。',
      },
      {
        stepNumber: 5,
        description: '放入冰箱冷藏 30-60分鐘 冰鎮入味。',
        time: '30-60分鐘',
      },
      {
        stepNumber: 6,
        description: '擺盤即可享用。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'recipe-002',
    name: '鐵鍋煎餃',
    category: '快速菜',
    imageUrl: '/src/assets/images/recipe/Pan-fried-dumplings.png',
    servings: 2,
    cookTime: 20,
    difficulty: '簡單',
    ingredients: [
      { name: '水餃', quantity: '15顆', category: '準備材料' },
      { name: '水', quantity: '100ml', category: '準備材料' },
      { name: '油', quantity: '2大匙', category: '調味料' },
      { name: '白芝麻', quantity: '少許', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '熱鍋加油，排入水餃煎至底部金黃。',
        time: '3分鐘',
      },
      {
        stepNumber: 2,
        description: '加入水，蓋上鍋蓋燜煮至水份收乾。',
        time: '10分鐘',
      },
      {
        stepNumber: 3,
        description: '撒上白芝麻，即可起鍋。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'recipe-003',
    name: '青醬義大利麵蛤蠣',
    category: '過火菜',
    imageUrl: '/src/assets/images/recipe/Pesto-spaghetti-clams.png',
    servings: 2,
    cookTime: 25,
    difficulty: '中等',
    ingredients: [
      { name: '義大利麵', quantity: '200g', category: '準備材料' },
      { name: '蛤蠣', quantity: '300g', category: '準備材料' },
      { name: '青醬醬', quantity: '3大匙', category: '調味料' },
      { name: '大蒜', quantity: '3瓣', category: '調味料' },
      { name: '白酒', quantity: '50ml', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '義大利麵煮熟，撈起備用。',
        time: '8-10分鐘',
      },
      {
        stepNumber: 2,
        description: '熱鍋爆香蒜末，加入蛤蠣和白酒。',
      },
      {
        stepNumber: 3,
        description: '蛤蠣開口後，加入義大利麵和青醬醬拌炒均勻。',
      },
    ],
    isFavorite: true,
    createdAt: '2025-01-03T00:00:00Z',
  },
  {
    id: 'recipe-004',
    name: '雞絲飯',
    category: '韓味系',
    imageUrl: '/src/assets/images/recipe/Shredded-chicken-rice.png',
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '雞胸肉', quantity: '200g', category: '準備材料' },
      { name: '白飯', quantity: '2碗', category: '準備材料' },
      { name: '小黃瓜', quantity: '1根', category: '準備材料' },
      { name: '醬油膏', quantity: '2大匙', category: '調味料' },
      { name: '麻油', quantity: '1大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '雞胸肉汆燙至熟，撕成絲。',
        time: '15分鐘',
      },
      {
        stepNumber: 2,
        description: '小黃瓜切絲，與雞絲混合醬油膏、麻油。',
      },
      {
        stepNumber: 3,
        description: '舖在白飯上，即可享用。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-04T00:00:00Z',
  },
  {
    id: 'recipe-005',
    name: '乾炒鮮蝦麵',
    category: '輕食系',
    imageUrl: '/src/assets/images/recipe/Stir-fried-shrimp-noodles.png',
    servings: 2,
    cookTime: 15,
    difficulty: '簡單',
    ingredients: [
      { name: '油麵', quantity: '200g', category: '準備材料' },
      { name: '鮮蝦', quantity: '150g', category: '準備材料' },
      { name: '豆芽菜', quantity: '100g', category: '準備材料' },
      { name: '醬油', quantity: '2大匙', category: '調味料' },
      { name: '蠔油', quantity: '1大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '鮮蝦去殼去腸泥，熟豆芽菜燙熟。',
      },
      {
        stepNumber: 2,
        description: '熱鍋爆香蝦仁，加入油麵、豆芽菜同炒。',
        time: '8分鐘',
      },
      {
        stepNumber: 3,
        description: '加入醬油、蠔油調味，大火快炒均勻。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-05T00:00:00Z',
  },
];

export const MOCK_RECIPE_LIST: RecipeListItem[] = MOCK_RECIPES.map(recipe => ({
  id: recipe.id,
  name: recipe.name,
  category: recipe.category,
  imageUrl: recipe.imageUrl,
  servings: recipe.servings,
  cookTime: recipe.cookTime,
  isFavorite: recipe.isFavorite,
}));
```

#### C. Mock API 實作 (`services/mock/mockRecipeApi.ts`)

```typescript
// services/mock/mockRecipeApi.ts
import type { RecipeApi, ConsumptionConfirmation, MealPlanInput } from '../api/recipeApi';
import type { Recipe, RecipeListItem, RecipeCategory, MealPlan } from '@/modules/recipe/types';
import { MOCK_RECIPES, MOCK_RECIPE_LIST } from './mockData';

export class MockRecipeApi implements RecipeApi {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getRecipes(category?: RecipeCategory): Promise<RecipeListItem[]> {
    await this.delay(600);
    
    if (!category) {
      return MOCK_RECIPE_LIST;
    }
    
    return MOCK_RECIPE_LIST.filter(recipe => recipe.category === category);
  }

  async getRecipeById(id: string): Promise<Recipe> {
    await this.delay(500);
    
    const recipe = MOCK_RECIPES.find(r => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    return recipe;
  }

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    await this.delay(400);
    
    const recipe = MOCK_RECIPES.find(r => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    recipe.isFavorite = !recipe.isFavorite;
    
    // 更新 localStorage
    const favorites = JSON.parse(localStorage.getItem('recipe_favorites') || '[]');
    if (recipe.isFavorite) {
      favorites.push(id);
    } else {
      const index = favorites.indexOf(id);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('recipe_favorites', JSON.stringify(favorites));
    
    return { isFavorite: recipe.isFavorite };
  }

  async getFavorites(): Promise<RecipeListItem[]> {
    await this.delay(500);
    
    const favorites = JSON.parse(localStorage.getItem('recipe_favorites') || '[]');
    return MOCK_RECIPE_LIST.filter(recipe => favorites.includes(recipe.id));
  }

  async confirmCook(data: ConsumptionConfirmation): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    
    // Mock: 記錄消耗資料到 localStorage
    const consumptions = JSON.parse(localStorage.getItem('recipe_consumptions') || '[]');
    consumptions.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('recipe_consumptions', JSON.stringify(consumptions));
    
    // 如果選擇加入採買清單，記錄到 shopping list
    if (data.addToShoppingList) {
      const shoppingList = JSON.parse(localStorage.getItem('shopping_list') || '[]');
      data.items.forEach(item => {
        shoppingList.push({
          name: item.ingredientName,
          quantity: item.consumedQuantity,
          unit: item.unit,
          source: 'recipe',
          recipeId: data.recipeId,
        });
      });
      localStorage.setItem('shopping_list', JSON.stringify(shoppingList));
    }
    
    return { 
      success: true, 
      message: data.addToShoppingList ? '已消耗並加入採買清單' : '已完成消耗記錄' 
    };
  }

  async addMealPlan(data: MealPlanInput): Promise<MealPlan> {
    await this.delay(700);
    
    const recipe = MOCK_RECIPES.find(r => r.id === data.recipeId);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    const newPlan: MealPlan = {
      id: `plan-${Date.now()}`,
      recipeId: data.recipeId,
      recipeName: recipe.name,
      scheduledDate: data.scheduledDate,
      servings: data.servings,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };
    
    const plans = JSON.parse(localStorage.getItem('meal_plans') || '[]');
    plans.push(newPlan);
    localStorage.setItem('meal_plans', JSON.stringify(plans));
    
    return newPlan;
  }

  async getMealPlans(): Promise<MealPlan[]> {
    await this.delay(500);
    return JSON.parse(localStorage.getItem('meal_plans') || '[]');
  }

  async deleteMealPlan(planId: string): Promise<{ success: boolean }> {
    await this.delay(400);
    
    const plans = JSON.parse(localStorage.getItem('meal_plans') || '[]');
    const filtered = plans.filter((plan: MealPlan) => plan.id !== planId);
    localStorage.setItem('meal_plans', JSON.stringify(filtered));
    
    return { success: true };
  }
}
```

#### D. 真實 API 實作骨架 (`services/api/recipeApi.ts`)

```typescript
// services/api/recipeApi.ts
import type { Recipe, RecipeListItem, RecipeCategory, MealPlan } from '@/modules/recipe/types';
import type { ConsumptionConfirmation, MealPlanInput } from '@/modules/recipe/types';
import { apiClient } from '@/services/apiClient';

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

export class RealRecipeApi implements RecipeApi {
  async getRecipes(category?: RecipeCategory): Promise<RecipeListItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await apiClient.get<RecipeListItem[]>(`/api/v1/recipes${query}`);
    return response.data;
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const response = await apiClient.get<Recipe>(`/api/v1/recipes/${id}`);
    return response.data;
  }

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const response = await apiClient.post<{ isFavorite: boolean }>(`/api/v1/recipes/${id}/favorite`);
    return response.data;
  }

  async getFavorites(): Promise<RecipeListItem[]> {
    const response = await apiClient.get<RecipeListItem[]>('/api/v1/recipes/favorites');
    return response.data;
  }

  async confirmCook(data: ConsumptionConfirmation): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/recipes/${data.recipeId}/cook`,
      data
    );
    return response.data;
  }

  async addMealPlan(data: MealPlanInput): Promise<MealPlan> {
    const response = await apiClient.post<MealPlan>('/api/v1/recipes/plan', data);
    return response.data;
  }

  async getMealPlans(): Promise<MealPlan[]> {
    const response = await apiClient.get<MealPlan[]>('/api/v1/recipes/plan');
    return response.data;
  }

  async deleteMealPlan(planId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/v1/recipes/plan/${planId}`);
    return response.data;
  }
}
```

#### E. 環境切換機制 (`services/index.ts`)

```typescript
// services/index.ts
import type { RecipeApi } from './api/recipeApi';
import { RealRecipeApi } from './api/recipeApi';
import { MockRecipeApi } from './mock/mockRecipeApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const recipeApi: RecipeApi = USE_MOCK ? new MockRecipeApi() : new RealRecipeApi();
```

---

### 3️⃣ 自訂 Hooks

#### `hooks/useRecipes.ts`

```typescript
// hooks/useRecipes.ts
import { useState, useEffect } from 'react';
import type { RecipeListItem, RecipeCategory } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';

export const useRecipes = (category?: RecipeCategory) => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recipeApi.getRecipes(category);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入食譜失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [category]);

  return { recipes, isLoading, error, refetch: fetchRecipes };
};
```

#### `hooks/useFavorite.ts`

```typescript
// hooks/useFavorite.ts
import { useState } from 'react';
import { recipeApi } from '@/modules/recipe/services';

export const useFavorite = () => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = async (recipeId: string) => {
    setIsToggling(true);
    try {
      const result = await recipeApi.toggleFavorite(recipeId);
      return result.isFavorite;
    } catch (error) {
      console.error('收藏切換失敗:', error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleFavorite, isToggling };
};
```

#### `hooks/useConsumption.ts`

```typescript
// hooks/useConsumption.ts
import { useState } from 'react';
import type { ConsumptionConfirmation } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';

export const useConsumption = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmConsumption = async (data: ConsumptionConfirmation) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await recipeApi.confirmCook(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '消耗確認失敗';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { confirmConsumption, isSubmitting, error };
};
```

---

### 4️⃣ UI 元件設計

#### `components/ui/RecipeCard.tsx`

```typescript
// components/ui/RecipeCard.tsx
import React from 'react';
import type { RecipeListItem } from '@/modules/recipe/types';

type RecipeCardProps = {
  recipe: RecipeListItem;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onClick, 
  onFavoriteToggle 
}) => {
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-image">
        <img src={recipe.imageUrl} alt={recipe.name} />
        {recipe.isFavorite && <span className="favorite-badge">♥</span>}
      </div>
      <div className="recipe-info">
        <h3>{recipe.name}</h3>
        <div className="recipe-meta">
          <span>👥 {recipe.servings}人</span>
          <span>⏱️ {recipe.cookTime}分</span>
        </div>
      </div>
      <button 
        className="favorite-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle?.();
        }}
      >
        {recipe.isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};
          <span>⏱️ {recipe.cookTime}分</span>
        </div>
      </div>
      <button 
        className="favorite-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle?.();
        }}
      >
        {recipe.isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};
```

#### `components/ui/IngredientList.tsx`

```typescript
// components/ui/IngredientList.tsx
import React from 'react';
import type { RecipeIngredient } from '@/modules/recipe/types';

type IngredientListProps = {
  ingredients: RecipeIngredient[];
  category: '準備材料' | '調味料';
};

export const IngredientList: React.FC<IngredientListProps> = ({ 
  ingredients, 
  category 
}) => {
  const filteredIngredients = ingredients.filter(item => item.category === category);

  return (
    <div className="ingredient-list">
      <h3 className="ingredient-category-title">{category}</h3>
      <ul>
        {filteredIngredients.map((ingredient, index) => (
          <li key={index} className="ingredient-item">
            <span className="ingredient-name">{ingredient.name}</span>
            <span className="ingredient-quantity">{ingredient.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### `components/ui/CookingSteps.tsx`

```typescript
// components/ui/CookingSteps.tsx
import React from 'react';
import type { CookingStep } from '@/modules/recipe/types';

type CookingStepsProps = {
  steps: CookingStep[];
};

export const CookingSteps: React.FC<CookingStepsProps> = ({ steps }) => {
  return (
    <div className="cooking-steps">
      <h2>烹煮方式</h2>
      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.stepNumber} className="step-item">
            <div className="step-number">step{step.stepNumber}.</div>
            <div className="step-content">
              <p>{step.description}</p>
              {step.time && <span className="step-time">⏱️ {step.time}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### 5️⃣ 頁面路由規劃

```
/recipes                 # 食譜首頁（列表）
/recipes/:id             # 食譜詳情頁
/recipes/:id/steps       # 烹煮步驟頁
/recipes/favorites       # 收藏食譜頁
/recipes/meal-plan       # 烹煮計劃頁
```

---

## 📦 需新建檔案清單

### 路由頁面
- `src/routes/Recipe/index.tsx` - 食譜首頁
- `src/routes/Recipe/Detail.tsx` - 食譜詳情
- `src/routes/Recipe/Steps.tsx` - 烹煮步驟
- `src/routes/Recipe/Favorites.tsx` - 收藏列表
- `src/routes/Recipe/MealPlan.tsx` - 烹煮計劃

### 模組檔案（依前述目錄結構）
- 類型定義 (4個檔案)
- API 服務 (4個檔案)
- Hooks (4個檔案)
- UI 元件 (6個檔案)
- Layout 元件 (3個檔案)
- Feature 元件 (3個檔案)
- 常數與工具 (4個檔案)

---

## 🔄 需修改檔案

### [MODIFY] `src/routes/index.tsx`
- 新增 Recipe 相關路由

### [MODIFY] `src/components/layout/BottomNav.tsx`
- 確認「食譜」導航按鈕連結至 `/recipes`

---

## ✅ API 對照表

根據 `API_REFERENCE_V2.md` 的規格：

| API 端點 | HTTP 方法 | 功能 | 對應 Method |
|---------|----------|------|------------|
| `/api/v1/recipes` | GET | 取得所有食譜 | `getRecipes()` |
| `/api/v1/recipes/{id}/favorite` | POST | 收藏/取消收藏 | `toggleFavorite()` |
| `/api/v1/recipes/favorites` | GET | 取得收藏列表 | `getFavorites()` |
| `/api/v1/recipes/{id}/cook` | POST | 烹煮完成→扣庫存 | `confirmCook()` |
| `/api/v1/recipes/plan` | POST | 加入烹煮計劃 | `addMealPlan()` |
| `/api/v1/recipes/plan` | GET | 取得計劃 | `getMealPlans()` |
| `/api/v1/recipes/plan/{planId}` | DELETE | 刪除計劃 | `deleteMealPlan()` |

---

## 🧪 驗證計畫

### 自動化測試
目前專案尚未建立測試框架，建議未來新增：
- 單元測試：測試 Hooks 和工具函式
- 元件測試：測試 UI 元件渲染
- API Mock 測試：驗證 Mock API 行為

### 手動驗證步驟

#### 1. 食譜列表頁
- [ ] 啟動開發伺服器 `npm run dev`
- [ ] 導航至 `/recipes`
- [ ] 驗證是否顯示所有食譜卡片
- [ ] 驗證分類標籤是否正常顯示（主題推薦、過火菜、韓味系等）
- [ ] 點擊分類標籤，驗證是否正確篩選食譜

#### 2. 食譜詳情頁
- [ ] 點擊任一食譜卡片
- [ ] 驗證是否導航至詳情頁 `/recipes/:id`
- [ ] 驗證食譜圖片、名稱、系列標籤顯示正確
- [ ] 驗證「準備材料」與「調味料」清單顯示正確
- [ ] 點擊「收藏」按鈕，驗證收藏狀態切換

#### 3. 烹煮步驟頁
- [ ] 在詳情頁點擊「烹煮方式」或相關按鈕
- [ ] 驗證是否導航至步驟頁 `/recipes/:id/steps`
- [ ] 驗證烹煮步驟顯示正確（step1, step2...）
- [ ] 驗證步驟中的時間標註顯示正確

#### 4. 消耗確認功能
- [ ] 點擊「確認消耗」按鈕
- [ ] 驗證消耗通知彈窗顯示
- [ ] 驗證食材列表與數量正確
- [ ] 點擊「已消耗，加入採買清單」
- [ ] 使用開發工具查看 localStorage，驗證資料已儲存
- [ ] 點擊「編輯消耗」
- [ ] 驗證可調整消耗數量
- [ ] 點擊「儲存」，驗證更新成功

#### 5. 收藏功能
- [ ] 導航至 `/recipes/favorites`
- [ ] 驗證顯示所有已收藏的食譜
- [ ] 取消收藏任一食譜
- [ ] 重新整理頁面，驗證收藏狀態持久化（localStorage）

#### 6. Mock API 切換
- [ ] 確認 `.env` 中 `VITE_USE_MOCK_API=true`
- [ ] 執行上述所有測試
- [ ] 修改為 `VITE_USE_MOCK_API=false`（需後端 API 上線）
- [ ] 重新測試，驗證真實 API 正常運作

---

## 📝 後續優化建議

1. **搜尋功能**：實作 FuFood.ai 搜尋框，可搜尋食譜名稱或食材
2. **食譜推薦演算法**：根據庫存食材推薦可烹煮的食譜
3. **營養資訊**：新增每道食譜的熱量、營養成分顯示
4. **使用者評分與評論**：允許使用者對食譜評分和留言
5. **分享功能**：實作食譜分享至社群媒體
6. **個人化收藏分類**：允許使用者建立收藏資料夾

---

## 📌 注意事項

> [!IMPORTANT]
> 1. 所有 API 呼叫必須透過 `recipeApi` 介面，不可直接呼叫 `fetch` 或 `axios`
> 2. Mock 資料應足夠豐富，涵蓋各種分類與情境
> 3. 消耗功能需與 Inventory 模組整合，確保庫存真實扣除

> [!WARNING]
> 後端 API 尚未實作，初期開發必須使用 Mock API（`VITE_USE_MOCK_API=true`）

---

**文件結束**
