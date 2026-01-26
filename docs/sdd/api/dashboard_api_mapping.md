# Dashboard API Mapping

本文件描述 Dashboard 模組前端與後端 API 的對應關係。

---

## API 對應表

| 前端功能 | React Query Hook | API 端點 | 方法 |
|----------|------------------|----------|------|
| 庫存摘要 | `useInventorySummaryQuery` | `/api/v1/inventory/summary` | GET |
| 食譜列表 | `useRecipesQuery` | `/api/v1/recipes` | GET |
| AI 推薦入口 | `useAIRecipeGenerate` | `/api/v1/ai/recipe/generate` | POST |
| AI 建議標籤 | `useRecipeSuggestions` | `/api/v1/ai/recipe/suggestions` | GET |

---

## 元件與 API 依賴

### InventorySection
```typescript
// 使用的 Hook
import { useInventorySummaryQuery } from '@/modules/inventory/api/queries';

// API 回應結構
type InventorySummaryResponse = {
  success: boolean;
  data: {
    summary: {
      total: number;
      lowStock: number;
      expiring: number;
    }
  }
}
```

### RecipeSection
```typescript
// 使用的 Hook
import { useRecipesQuery } from '@/modules/recipe/api/queries';

// API 回應結構 (陣列)
type RecipeListItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  servings: number;
  cookTime: number;
  isFavorite: boolean;
}
```

### AiRecommendCard
```typescript
// 使用的 Hook (透過 AIQueryModal)
import { useAIRecipeGenerate, useRecipeSuggestions } from '@/modules/ai';

// 開啟 Modal 後由 AI 模組處理 API 通訊
```

---

## 錯誤處理

| 錯誤碼 | 說明 | 前端處理 |
|--------|------|----------|
| 401 | 未授權 | 重導向至登入頁 |
| 500 | 伺服器錯誤 | 顯示錯誤訊息 |
| 網路超時 | 連線失敗 | 顯示「無法載入」提示 |

---

## 相關文件
- [Dashboard Module README](../../src/modules/dashboard/README.md)
- [Dashboard Backend API Spec](../backend/dashboard_api_spec.md)
