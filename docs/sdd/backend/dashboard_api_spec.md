# Dashboard API Specification

本文件描述 Dashboard 模組所使用的後端 API 端點。

> **注意**: Dashboard 模組本身不提供獨立的 API 端點，而是消費其他模組的資料。

---

## 所需 API 端點

### 1. 庫存摘要 (Inventory Summary)

Dashboard 的 `InventorySection` 元件需要取得庫存統計摘要。

#### 端點
```
GET /api/v1/inventory/summary
```

#### 請求標頭
```
Authorization: Bearer <access_token>
```

#### 回應格式
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 25,
      "lowStock": 3,
      "expiring": 5
    }
  }
}
```

#### 欄位說明
| 欄位 | 類型 | 說明 |
|------|------|------|
| `total` | number | 總庫存數量 |
| `lowStock` | number | 低庫存項目數量 |
| `expiring` | number | 即將到期項目數量（通常為 7 天內） |

---

### 2. 食譜列表 (Recipes List)

Dashboard 的 `RecipeSection` 元件需要取得推薦食譜列表。

#### 端點
```
GET /api/v1/recipes
```

#### 請求標頭
```
Authorization: Bearer <access_token>
```

#### 查詢參數（可選）
| 參數 | 類型 | 說明 |
|------|------|------|
| `limit` | number | 限制回傳筆數（Dashboard 使用 6） |
| `sort` | string | 排序方式 (e.g., `popular`, `recent`) |

#### 回應格式
```json
{
  "success": true,
  "data": [
    {
      "id": "recipe-001",
      "name": "日式照燒雞腿丼",
      "category": "日式料理",
      "imageUrl": "https://example.com/recipe.jpg",
      "servings": 2,
      "cookTime": 30,
      "isFavorite": false
    }
  ]
}
```

---

### 3. AI 食譜推薦 (AI Recipe Generation)

Dashboard 的 `AiRecommendCard` 元件會開啟 AI Modal，該 Modal 使用以下端點：

#### 端點
```
POST /api/v1/ai/recipe/generate
```

詳細規格請參考 [ai_recipe_api_spec.md](./ai_recipe_api_spec.md)

---

## 前端整合狀態

| 功能 | 狀態 | 說明 |
|------|------|------|
| 庫存摘要 | ✅ 已整合 | 使用 `useInventorySummaryQuery` |
| 食譜列表 | ✅ 已整合 | 使用 `useRecipesQuery` |
| AI 入口 | ✅ 已整合 | 使用 `AIQueryModal` |

---

## 相關文件
- [Inventory API Spec](./inventory_api_spec.md)
- [Recipes API Spec](./recipes_api_spec.md)
- [AI Recipe API Spec](./ai_recipe_api_spec.md)
