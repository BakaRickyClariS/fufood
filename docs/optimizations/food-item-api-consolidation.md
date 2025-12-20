# FoodItem API 整合規劃

**建立日期**: 2025-12-20  
**狀態**: ✅ 決議完成

---

## 決議摘要

### ✅ 已確認

1. **移除 Foods API** — 入庫流程不需要食材主檔
2. **統一使用 Inventory API** — 入庫、查看、編輯都用同一個 FoodItem 結構
3. **`attributes` 欄位 = 產品子分類**（例如：鮮奶類、葉菜根莖類）

---

## 背景分析

### 原本設計

| API           | 用途                 | 資料歸屬      |
| ------------- | -------------------- | ------------- |
| Foods API     | 食材定義（產品目錄） | 全系統共用    |
| Inventory API | 使用者庫存           | 個人/群組專屬 |

### 實際流程

```
拍照 → AI 辨識 → 回傳完整資料 → 直接存入 Inventory
            ↑
        不需要查詢 Foods 主檔
```

**結論：Foods API 在目前流程中沒有用途，可移除。**

---

## 統一的 FoodItem 結構

根據 UI 欄位整合後的完整結構：

```typescript
/**
 * 庫存食材項目
 * 用於：入庫 (POST)、查看 (GET)、編輯 (PUT)
 */
type FoodItem = {
  // === 基本資訊 ===
  id: string; // 系統產生 (UUID)
  name: string; // 產品名（必填）
  category: FoodCategory; // 分類（必填）- 蔬果類、乳製品飲料類...
  attributes: string; // 屬性（必填）- 鮮奶類、葉菜根莖類...
  quantity: number; // 數量（必填）
  unit: FoodUnit; // 單位（必填）- 顆、罐、包...
  imageUrl?: string; // 圖片 URL

  // === 日期 ===
  purchaseDate: string; // 入庫日期 (YYYY-MM-DD)（必填）
  expiryDate: string; // 過期日期 (YYYY-MM-DD)（必填）
  // shelfLife: number;          // 保存期限（天數）- 前端計算，不需存入資料庫

  // === 提醒設定 ===
  lowStockAlert: boolean; // 是否開啟低庫存提醒
  lowStockThreshold: number; // 低於此數量時通知

  // === 其他 ===
  notes?: string; // 備註
  groupId?: string; // 群組 ID（個人庫存則為空）

  // === 系統欄位 ===
  createdAt: string; // 建立時間 (ISO 8601)
  updatedAt?: string; // 更新時間 (ISO 8601)
};
```

### 欄位對照表

| 欄位                |     入庫表單     | AI辨識結果 |    食物卡片    | 必填 |
| ------------------- | :--------------: | :--------: | :------------: | :--: |
| `name`              |      產品名      | 辨識產品名 |      標題      |  ✅  |
| `category`          |       分類       |  產品分類  |    產品分類    |  ✅  |
| `attributes`        |       屬性       |  產品屬性  |    產品屬性    |  ✅  |
| `quantity`          |     歸納數量     |  單位數量  |    單位數量    |  ✅  |
| `unit`              |       單位       |    單位    |      單位      |  ✅  |
| `purchaseDate`      |     歸納日期     |  入庫日期  |    入庫日期    |  ✅  |
| `expiryDate`        |     過期日期     |  過期日期  |    過期日期    |  ✅  |
| `lowStockAlert`     |     開啟通知     |     ❌     | 開啟低庫存通知 |  ✅  |
| `lowStockThreshold` | 低於此數量時通知 |     ❌     |       ❌       |  ✅  |
| `notes`             |       備註       |    備註    |      備註      |  ❌  |
| `imageUrl`          |        ❌        |    圖片    |      圖片      |  ❌  |

---

## 分類與屬性定義

### FoodCategory（產品分類）

```typescript
type FoodCategory =
  | '蔬果類'
  | '冷凍調理類'
  | '主食烘焙類'
  | '乳製品飲料類'
  | '冷凍海鮮類'
  | '肉品類'
  | '其他';
```

### FoodAttribute（產品屬性 = 產品子分類）

`attributes` 欄位為**產品子分類**，依據主分類的細分類別：

| 主分類       | 屬性（子分類）           |
| ------------ | ------------------------ |
| 蔬果類       | 葉菜根莖類、水果類、菇類 |
| 乳製品飲料類 | 鮮奶類、優格類、飲料類   |
| 肉品類       | 豬肉類、雞肉類、牛肉類   |
| 冷凍海鮮類   | 魚類、蝦蟹類、貝類       |
| 冷凍調理類   | 調理包、冷凍食品         |
| 主食烘焙類   | 麵包類、米麵類           |
| 其他         | 其他                     |

> [!IMPORTANT]
> AI 辨識回傳的 `attributes` 欄位應為「產品子分類」（如：鮮奶類），而非「保存方式」（如：冷藏）。

---

## API 整合後的路由

### 需實作（後端）

#### 庫存管理

| 優先度 |  Method  | 端點                           | 說明             |
| :----: | :------: | ------------------------------ | ---------------- |
|  `P0`  |  `POST`  | `/api/v1/inventory`            | 新增食材（入庫） |
|  `P0`  |  `GET`   | `/api/v1/inventory`            | 取得庫存列表     |
|  `P0`  |  `GET`   | `/api/v1/inventory/categories` | 取得分類列表     |
|  `P1`  |  `GET`   | `/api/v1/inventory/{id}`       | 取得單一食材     |
|  `P1`  |  `PUT`   | `/api/v1/inventory/{id}`       | 更新食材         |
|  `P1`  | `DELETE` | `/api/v1/inventory/{id}`       | 刪除食材         |
|  `P1`  |  `GET`   | `/api/v1/inventory/summary`    | 庫存摘要         |
|  `P1`  |  `GET`   | `/api/v1/inventory/settings`   | 使用者設定       |

#### 消耗記錄

| 優先度 | Method | 端點                             | 說明                             |
| :----: | :----: | -------------------------------- | -------------------------------- |
|  `P1`  | `POST` | `/api/v1/inventory/{id}/consume` | 消耗食材（扣減數量、記錄原因）   |
|  `P1`  | `GET`  | `/api/v1/inventory/consumed`     | 取得消耗列表（待填寫原因的食材） |

### 暫不實作

|   Method   | 端點                          | 原因                                   |
| :--------: | ----------------------------- | -------------------------------------- |
|  ~~ALL~~   | `/api/v1/foods/*`             | 入庫由 AI 直接產生資料，不需要食材主檔 |
| ~~DELETE~~ | `/api/v1/inventory/batch`     | 暫緩功能                               |
|  ~~PUT~~   | `/api/v1/inventory/settings`  | 暫緩功能                               |
|  ~~GET~~   | `/api/v1/consumption/history` | 消耗歷史統計（暫緩）                   |

---

## 相關文件

- [food_intake_api_spec.md](../backend/food_intake_api_spec.md) — 完整入庫 API 規格
- [inventory_api_spec.md](../backend/inventory_api_spec.md) — 庫存 API 規格
- [ai_media_api_spec.md](../backend/ai_media_api_spec.md) — AI 服務 API 規格
