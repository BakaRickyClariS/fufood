# Backend API 修改建議與問題反饋

日期：2025-12-27  
針對模組：Inventory（庫存管理）

---

## 反饋大綱 (Outline)
1. **API 路徑一致性** (Priority: High)
   - 前端與後端路徑不一致 (`/inventory` vs `/refrigerators/...`)
2. **消耗功能 API** (Priority: High)
   - 缺少簡易消耗 API，Swagger 僅有複雜交易模式
3. **缺失的產品主檔 API** (Priority: Medium)
   - 若採用新架構，缺少取得產品列表的 API
4. **交易 (Transaction) 模式複雜度** (Design Review)
5. **回傳格式標準化** (Architectural)

---

## 路由狀態總表 (Route Status Summary)

| 狀態 (Status) | Method | Endpoint Path | 說明 (Note) |
| :--- | :--- | :--- | :--- |
| **⚠️ 需修正** | `GET` | `/api/v1/refrigerators/{id}/inventory` | 前端已更新支援此路由，需後端確認是否已實作 |
| **⚠️ 需修正** | `POST` | `/api/v1/refrigerators/{id}/inventory` | 前端已更新支援此路由，需後端確認 |
| **⚠️ 需修正** | `PUT` | `/api/v1/refrigerators/{id}/inventory/{itemId}` | 前端已更新支援此路由，需後端確認 |

| **🆕 需新增** | `POST` | `/api/v1/refrigerators/{id}/inventory/{itemId}/consume` | **缺失**：需要一個簡單的單步消耗 API，而非兩段式交易 |
| **🆕 需新增** | `GET` | `/api/v1/refrigerators/{id}/products` | **缺失**：若庫存與產品分離，需有 API 取得該冰箱的產品主檔 |
| **🆕 需新增** | `GET` | `/api/v1/refrigerators/{id}/products/categories` | **缺失**：取得產品相關分類 |
| **✅ 沒問題** | `GET` | `/api/v1/inventory/categories` | 全域類別列表目前運作正常 (但建議也移至 Refrigerator 下?) |
| **✅ 沒問題** | `GET` | `/api/v1/inventory/settings` | 庫存設定 (建議移至 `/refrigerators/{id}/inventory/settings`) |

---

## 1. API 路徑結構確認 (Priority: High)

### 問題描述
前端程式碼 (`inventoryApiImpl.ts`) 已更新以支援 `/api/v1/refrigerators/{refrigeratorId}/inventory` 路徑（當 `refrigeratorId` 存在時）。然而，目前後端是否已全面部署此路由尚未確認。


### 影響

兩種路徑結構代表不同的資料模型：
- **目前**: 庫存是全域的，不區分冰箱
- **新版**: 庫存歸屬於特定冰箱（refrigerator/群組）

### 需要確認

1. 後端目前實際支援哪種路徑？
2. 是否需要在所有庫存 API 加入 `refrigeratorId` 參數？
3. 若採用新版路徑，舊版路徑是否仍相容？

### 建議

請提供明確的 API 端點文件，確認實際可用的路徑格式。

---

## 2. 消耗 API 設計差異 (Priority: High)

### 問題描述

前端目前使用：
```http
POST /api/v1/inventory/{id}/consume
Body: { quantity: number, reasons: string[], customReason?: string }
```

但 Swagger 顯示消耗是基於「交易」概念：
```http
POST /api/v1/inventory_transactions/{transactionId}/consume
```

### 設計差異

| 項目 | 前端實作 | Swagger 規劃 |
|:-----|:---------|:-------------|
| 識別符 | 食材 ID (`inventory/{id}`) | 交易 ID (`transactions/{transactionId}`) |
| 流程 | 直接消耗食材 | 先建立交易，再確認消耗 |
| 複雜度 | 低（一步完成） | 高（兩步驟） |

### 需要確認

1. 後端採用哪種消耗流程？
2. 若採用交易模式，前端需要先呼叫什麼 API 建立交易？
3. 消耗紀錄是否需要保留於交易歷史？

### 建議

如果消耗功能需要追蹤歷史記錄，建議採用交易模式。否則簡單的 `/inventory/{id}/consume` 較易實作。

---

## 3. 缺失的 API 端點 (Design Review)

### 前端需要但可能未實作的 API

#### 3.1 庫存交易相關

| Endpoint | 說明 | 前端需求程度 |
|:---------|:-----|:-------------|
| `POST /api/v1/refrigerators/{refrigeratorId}/inventory_transactions` | 建立庫存交易 | 若採用交易模式則需要 |
| `GET /api/v1/refrigerators/{refrigeratorId}/inventory_transactions` | 取得交易列表 | 歷史紀錄功能需要 |
| `GET /api/v1/inventory_transactions/{transactionId}` | 取得交易詳情 | 可選 |
| `POST /api/v1/inventory_transactions/{transactionId}/items` | 新增交易項目 | 批次消耗需要 |

#### 3.2 產品相關

| Endpoint | 說明 | 前端需求程度 |
|:---------|:-----|:-------------|
| `GET /api/v1/refrigerators/{refrigeratorId}/products` | 取得冰箱產品列表 | 若路徑改變則需要 |
| `GET /api/v1/refrigerators/{refrigeratorId}/products/categories` | 取得產品分類 | 若路徑改變則需要 |

---

## 4. 回傳格式標準化 (Architectural)

### 觀察

目前前端假設所有 API 都使用統一的信封格式：

```json
{
  "status": true,
  "message": "optional message",
  "data": { /* payload */ }
}
```

### 建議

請確保所有 Inventory 相關 API 遵循相同格式，特別注意：

1. **成功回應** 應包含 `status: true` 和 `data`
2. **錯誤回應** 應包含 `status: false` 或適當的錯誤代碼
3. **分頁資料** 應在 `data` 中包含 `items`、`total`、`page`、`limit`

---

## 5. 交易 (Transaction) 概念整合 (Future Enhancement)

### 觀察

Swagger 文件引入了新的概念結構：

- **Refrigerator（冰箱）**: 庫存的容器，對應群組
- **Inventory**: 冰箱內的庫存
- **InventoryTransaction**: 庫存異動記錄（入庫/出庫/消耗）
- **InventoryTransactionItem**: 交易中的個別項目

### 前端影響評估

如果採用此結構，前端需要：

1. 修改所有 API 呼叫，加入 `refrigeratorId`
2. 實作交易建立和確認流程
3. 更新 Redux store 結構
4. 調整 hooks 和 services

### 建議

請提供明確的 migration 指南，說明：
- 哪些舊版 API 仍然支援
- 新版 API 的必要參數
- 預計的 deprecation 時程

---

## 參考資料

- [Swagger UI](https://api.fufood.jocelynh.me/swagger/index.html)
- [Inventory API Mapping](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/api/inventory_api_mapping.md)
- [API Reference V2](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/API_REFERENCE_V2.md)
- [Inventory API Spec](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/backend/inventory_api_spec.md)
