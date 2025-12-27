# Dashboard Module (儀表板)

## 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [關鍵功能](#關鍵功能)
- [元件總覽](#元件總覽)
- [資料來源與 API](#資料來源與-api)
- [整合備註](#整合備註)

---

## 概述
儀表板提供跨模組的快速總覽，聚合庫存摘要、推薦食譜與 AI 入口，協助使用者在首頁直接看到待辦與建議。

## 目錄結構
```
dashboard/
├── components/
│   ├── AiRecommendCard.tsx      # AI 推薦橫幅 CTA
│   ├── InventoryCard.tsx        # 單一庫存統計卡片
│   ├── InventorySection.tsx     # 庫存摘要區塊（含三張卡片）
│   └── RecipeSection.tsx        # 推薦食譜走馬燈區塊
└── README.md
```

## 關鍵功能
- **庫存摘要**：總庫存、低庫存、即將到期的快速數字卡
- **近效期提示**：從庫存模組引導查看到期食材
- **推薦食譜**：走馬燈呈現熱門/推薦食譜，點擊開啟食譜詳細 Modal
- **AI 快速入口**：導向 AI 助理（FuFood.AI）開始互動

## 元件總覽

| 元件 | 說明 | 依賴 |
|------|------|------|
| `InventorySection` | 顯示三張庫存摘要卡（總庫存、低庫存、即將到期），使用 `useInventorySummaryQuery` 取得資料 | `@/modules/inventory/api/queries` |
| `InventoryCard` | 單一統計卡片，顯示標題、數值、狀態圖示，支援載入狀態 | 無外部依賴 |
| `RecipeSection` | 食譜走馬燈，使用 `useRecipesQuery` 取得資料，點擊開啟 `RecipeDetailModal` | `@/modules/recipe/api/queries`, `@/modules/recipe/components/ui/RecipeDetailModal` |
| `AiRecommendCard` | AI 橫幅 CTA，點擊開啟 `AIQueryModal` | `@/modules/ai/components/AIQueryModal` |

## 資料來源與 API

### 庫存摘要
- **Hook**: `useInventorySummaryQuery`
- **端點**: `GET /api/v1/inventory/summary`
- **回應結構**:
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

### 推薦食譜
- **Hook**: `useRecipesQuery`
- **端點**: `GET /api/v1/recipes`
- **注意**: 首頁最多顯示 6 筆食譜

### AI 入口
- **元件**: `AIQueryModal`
- **端點**: 由 AI 模組處理，詳見 [ai_recipe_api_spec.md](../../docs/backend/ai_recipe_api_spec.md)

## 整合備註
- `InventorySection` 已整合後端 API，使用 React Query 管理狀態
- `RecipeSection` 已整合後端 API，支援載入中與錯誤狀態
- `AiRecommendCard` 點擊開啟全螢幕 AI Modal，不需額外路由
- 若後端無回傳 `lastSyncedAt`，前端使用當前時間作為更新時間標記
