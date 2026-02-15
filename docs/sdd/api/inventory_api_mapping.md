# Inventory 模組 API 連結規劃

> **版本**: v1.0  
> **最後更新**: 2025-12-27  
> **對應 Swagger**: https://api.fufood.jocelynh.me/swagger/index.html  
> **涵蓋範圍**: Inventory、InventoryTransaction、InventoryTransactionItem、Products

---

## 1. API 端點總覽

### 1.1 Inventory（庫存）

| 方法 | 端點 | 說明 |
|:-----|:-----|:-----|
| `GET` | `/api/v1/refrigerators/{refrigeratorId}/inventory` | 取得冰箱庫存列表 |
| `GET` | `/api/v1/refrigerators/{refrigeratorId}/products/{productId}` | 取得特定產品詳情 |

---

### 1.2 InventoryTransaction（庫存交易）

| 方法 | 端點 | 說明 |
|:-----|:-----|:-----|
| `POST` | `/api/v1/refrigerators/{refrigeratorId}/inventory_transactions` | 建立新的庫存交易 |
| `GET` | `/api/v1/refrigerators/{refrigeratorId}/inventory_transactions` | 取得冰箱的庫存交易列表 |
| `GET` | `/api/v1/inventory_transactions/{transactionId}` | 取得特定交易詳情 |
| `POST` | `/api/v1/inventory_transactions/{transactionId}/consume` | 確認消耗交易 |

---

### 1.3 InventoryTransactionItem（交易項目）

| 方法 | 端點 | 說明 |
|:-----|:-----|:-----|
| `POST` | `/api/v1/inventory_transactions/{transactionId}/items` | 新增交易項目 |

---

### 1.4 Products（產品）

| 方法 | 端點 | 說明 |
|:-----|:-----|:-----|
| `GET` | `/api/v1/refrigerators/{refrigeratorId}/products` | 取得冰箱中的產品列表 |
| `GET` | `/api/v1/refrigerators/{refrigeratorId}/products/categories` | 取得產品分類列表 |

---

## 2. 前端模組對應規劃

### 2.1 目標模組

所有 API 應整合至 `src/modules/inventory` 模組

### 2.2 建議的服務層結構

```
src/modules/inventory/
├── services/
│   ├── inventoryApi.ts          # 庫存相關 API
│   ├── inventoryTransactionApi.ts # 交易相關 API
│   └── productsApi.ts           # 產品相關 API
├── types/
│   ├── inventory.types.ts       # 庫存型別定義
│   ├── transaction.types.ts     # 交易型別定義
│   └── product.types.ts         # 產品型別定義
└── hooks/
    ├── useInventory.ts          # 庫存 Hook
    ├── useTransactions.ts       # 交易 Hook
    └── useProducts.ts           # 產品 Hook
```

---

## 3. API 詳細規格

### 3.1 取得冰箱庫存

```http
GET /api/v1/refrigerators/{refrigeratorId}/inventory
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |

**預期回應:**

```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "category": "string",
        "quantity": 0,
        "unit": "string",
        "expiryDate": "YYYY-MM-DD"
      }
    ]
  }
}
```

---

### 3.2 取得特定產品

```http
GET /api/v1/refrigerators/{refrigeratorId}/products/{productId}
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |
| `productId` | string | ✅ | 產品 ID |

---

### 3.3 建立庫存交易

```http
POST /api/v1/refrigerators/{refrigeratorId}/inventory_transactions
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |

**請求 Body:**

```json
{
  "type": "入庫 | 出庫 | 消耗",
  "items": [
    {
      "productId": "string",
      "quantity": 0,
      "unit": "string"
    }
  ],
  "notes": "string"
}
```

---

### 3.4 取得交易列表

```http
GET /api/v1/refrigerators/{refrigeratorId}/inventory_transactions
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |

**查詢參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `page` | number | ❌ | 頁碼 |
| `limit` | number | ❌ | 每頁筆數 |

---

### 3.5 取得特定交易

```http
GET /api/v1/inventory_transactions/{transactionId}
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `transactionId` | string | ✅ | 交易 ID |

---

### 3.6 確認消耗

```http
POST /api/v1/inventory_transactions/{transactionId}/consume
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `transactionId` | string | ✅ | 交易 ID |

**請求 Body:**

```json
{
  "reasons": ["recipe_consumption", "short_shelf"],
  "customReason": "string"
}
```

---

### 3.7 新增交易項目

```http
POST /api/v1/inventory_transactions/{transactionId}/items
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `transactionId` | string | ✅ | 交易 ID |

**請求 Body:**

```json
{
  "productId": "string",
  "quantity": 0,
  "unit": "string"
}
```

---

### 3.8 取得產品列表

```http
GET /api/v1/refrigerators/{refrigeratorId}/products
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |

---

### 3.9 取得產品分類

```http
GET /api/v1/refrigerators/{refrigeratorId}/products/categories
```

**路徑參數:**

| 參數 | 類型 | 必填 | 說明 |
|:-----|:-----|:----:|:-----|
| `refrigeratorId` | string | ✅ | 冰箱 ID |

---

## 4. 與現有文檔的差異

> [!IMPORTANT]
> 以下是與現有 `docs/backend/inventory_api_spec.md` 的主要差異

### 4.1 路徑結構差異

| 現有文檔路徑 | Swagger 新路徑 |
|:------------|:--------------|
| `/api/v1/inventory` | `/api/v1/refrigerators/{refrigeratorId}/inventory` |
| `/api/v1/inventory/{id}` | `/api/v1/refrigerators/{refrigeratorId}/products/{productId}` |
| `/api/v1/inventory/{id}/consume` | `/api/v1/inventory_transactions/{transactionId}/consume` |

### 4.2 新增概念

1. **Refrigerator（冰箱）**: 新增冰箱層級，所有庫存操作需指定 `refrigeratorId`
2. **InventoryTransaction（庫存交易）**: 獨立的交易概念，支援批次操作
3. **InventoryTransactionItem（交易項目）**: 交易中的個別項目

### 4.3 建議更新項目

- [ ] 更新 `inventoryApi.ts` 以使用新的端點路徑
- [ ] 新增 `refrigeratorId` 參數至所有庫存相關請求
- [ ] 實作交易（Transaction）相關的 API 服務
- [ ] 更新 Redux Store 以支援新的資料結構

---

## 5. 參考資料

- [Swagger UI](https://api.fufood.jocelynh.me/swagger/index.html)
- [現有 Inventory API Spec](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/backend/inventory_api_spec.md)
