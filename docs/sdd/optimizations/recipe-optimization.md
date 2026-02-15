# Recipe 模組優化建議

**建立日期**: 2025-12-05  
**狀態**: 待執行

---

## 📋 目錄
- [概述](#概述)
- [發現問題](#發現問題)
- [優化建議](#優化建議)
- [API Reference 補充](#api-reference-補充)

---

## 概述

本文件記錄對 `src/modules/recipe` 模組的分析結果與優化建議，確保模組結構與文件品質符合專案標準。

---

## 發現問題

### 1. API Reference 端點缺失

**問題描述**：  
`API_REFERENCE_V2.md` 中的 Recipes Module 缺少 `GET /api/v1/recipes/{id}` 端點的定義，但實際程式碼中 `recipeApi.ts` 已實作 `getRecipeById` 方法。

**現有 API Reference 內容** (第 274-280 行):
```markdown
- `GET /api/v1/recipes`: 列表
- `POST /api/v1/recipes/{id}/favorite`: 收藏切換
- `GET /api/v1/recipes/favorites`: 收藏列表
- `POST /api/v1/recipes/{id}/cook`: 烹煮完成
- `POST /api/v1/recipes/plan`: 加入計畫
- `GET /api/v1/recipes/plan`: 取得計畫
- `DELETE /api/v1/recipes/plan/{planId}`: 刪除計畫
```

**缺少的端點**:
```
GET /api/v1/recipes/{id} - 取得單一食譜詳情
```

---

### 2. README 格式不符規範

**問題描述**：  
目前 `recipe/README.md` 僅有 56 行，內容過於簡略。相較於 `inventory/README.md` (279 行)，缺少以下章節：

| 章節 | inventory | recipe |
|------|-----------|--------|
| 概述 | ✅ | ✅ (簡略) |
| 目錄結構 | ✅ | ✅ |
| 型別定義 (Types) | ✅ 詳細範例 | ❌ |
| API 規格 | ✅ 完整參數/回應 | ❌ |
| Hooks 詳解 | ✅ 簽名與功能說明 | ❌ |
| Redux Store | ✅ | N/A |
| 環境變數設定 | ✅ | ✅ (簡略) |

---

## 優化建議

### 1. 補充 API Reference

在 `API_REFERENCE_V2.md` 的 Recipes Module 區塊新增以下內容：

```markdown
# 5️⃣ Recipes Module (食譜管理模組)

## 概述
提供食譜查詢、收藏以及烹煮計畫 (Meal Plan) 功能。

## API 規格

### 40. getRecipes - 取得食譜列表
`GET /api/v1/recipes`
**查詢參數**: `?category=中式料理`
**回應**: `RecipeListItem[]`

### 41. getRecipeById - 取得單一食譜詳情 🆕
`GET /api/v1/recipes/{id}`
**回應**: `Recipe` (含完整食材與步驟)

### 42. toggleFavorite - 收藏/取消收藏
`POST /api/v1/recipes/{id}/favorite`
**回應**: `{ isFavorite: boolean }`

### 43. getFavorites - 取得收藏列表
`GET /api/v1/recipes/favorites`
**回應**: `RecipeListItem[]`

### 44. confirmCook - 烹煮完成
`POST /api/v1/recipes/{id}/cook`
**請求**: `ConsumptionConfirmation`
**功能**: 確認烹煮完成，自動扣除庫存食材

### 45-47. MealPlan 烹煮計畫
- `POST /api/v1/recipes/plan`: 加入計畫
- `GET /api/v1/recipes/plan`: 取得計畫
- `DELETE /api/v1/recipes/plan/{planId}`: 刪除計畫
```

---

### 2. 重構 README.md

建議將 `recipe/README.md` 參照 `inventory/README.md` 格式重構，包含：

1. **概述**: 完整列出核心功能
2. **目錄結構**: 更新為實際結構
3. **型別定義**: 加入 `Recipe`, `RecipeListItem`, `ConsumptionConfirmation`, `MealPlan` 等型別的完整定義
4. **API 規格**: 詳列 `RecipeApi` 介面的每個方法，包含端點、請求/回應格式
5. **Hooks 詳解**: 說明 4 個 hooks 的功能與使用方式
6. **環境變數**: 補充說明

---

## 執行計劃

| 優先順序 | 任務 | 影響範圍 |
|---------|------|----------|
| 🔴 高 | 更新 `recipe/README.md` 格式 | 開發文件 |
| 🟡 中 | 補充 `API_REFERENCE_V2.md` 端點 | API 文件 |

---

## 相關檔案

- [recipe/README.md](file:///d:/Work/Course/HexSchool/fufood/src/modules/recipe/README.md)
- [inventory/README.md](file:///d:/Work/Course/HexSchool/fufood/src/modules/inventory/README.md)
- [API_REFERENCE_V2.md](file:///d:/Work/Course/HexSchool/fufood/src/modules/API_REFERENCE_V2.md)
