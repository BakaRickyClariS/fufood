**版本**: v2.1（同步 `src/modules/API_REFERENCE_V2.md`）  
**最後更新**: 2025-12-02  
**涵蓋範圍**: Inventory（庫存管理）與 Foods（食材主檔）模組

---

## 1. 基本規範

### 1.1 認證（Authentication）

- **Access Token**: Header `Authorization: Bearer <access_token>`（或 httpOnly Cookie）
- **Refresh Token**: **必須**放在 httpOnly Cookie 以確保安全
- **Cookie 建議**: `Secure`（HTTPS） + `SameSite=Strict`

### 1.2 Base URL

```
/api/v1
```

### 1.3 標準回應與狀態碼

**成功（Success）**:

| 狀態碼             | 描述       | 常見使用情境                 |
| :----------------- | :--------- | :--------------------------- |
| **200 OK**         | 請求成功   | 一般查詢、更新、刪除回傳內容 |
| **201 Created**    | 建立成功   | 新增資源                     |
| **204 No Content** | 無回應內容 | 請求成功但不需要回傳內容     |

**錯誤（Error）**: 統一錯誤格式

```json
{
  "code": "ERROR_CODE",
  "message": "錯誤描述訊息",
  "details": {
    "field": "錯誤欄位",
    "issue": "具體問題"
  },
  "timestamp": "2024-12-07T10:00:00Z"
}
```

| 狀態碼                        | 描述         | 常見使用情境       |
| :---------------------------- | :----------- | :----------------- |
| **400 Bad Request**           | 請求格式錯誤 | 缺少欄位或格式有誤 |
| **401 Unauthorized**          | 未授權       | Token 無效或缺失   |
| **403 Forbidden**             | 禁止存取     | 已登入但無權限     |
| **404 Not Found**             | 找不到資源   | 路徑或 ID 不存在   |
| **422 Unprocessable Entity**  | 驗證失敗     | 例如庫存不足       |
| **429 Too Many Requests**     | 請求過多     | 觸發流量限制       |
| **500 Internal Server Error** | 伺服器錯誤   | 系統內部異常       |

---

## 2. 資料模型

### 2.1 FoodItem（庫存食材）

```typescript
type FoodItem = {
  id: string; // UUID
  name: string; // 食材名稱
  category: FoodCategory; // 類別（見 2.7）
  quantity: number; // 數量
  unit: FoodUnit; // 單位
  imageUrl?: string; // 圖片 URL
  purchaseDate: string; // 購買日期 (YYYY-MM-DD)
  expiryDate: string; // 保存期限 (YYYY-MM-DD)
  lowStockAlert: boolean; // 是否開啟低庫存提醒
  lowStockThreshold: number; // 低庫存門檻
  notes?: string; // 備註
  groupId?: string; // 所屬群組 ID（個人則為 undefined）
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
};
```

### 2.2 CategoryInfo

```typescript
type CategoryInfo = {
  id: string;
  title: string;
  count: number;
  imageUrl: string;
  bgColor: string;
  slogan: string;
  description: string[];
};
```

### 2.3 InventoryStats（庫存統計）

```typescript
type InventoryStats = {
  totalItems: number; // 總項目數
  expiredCount: number; // 已過期數
  expiringSoonCount: number; // 近效期數（預設 3 天內）
  lowStockCount: number; // 低庫存數
  byCategory: Record<FoodCategory, number>; // 各分類數量
};
```

### 2.4 InventorySummary（庫存摘要）

```typescript
type InventorySummary = {
  total: number;
  expiring: number;
  expired: number;
  lowStock: number;
};
```

### 2.5 InventorySettings（庫存設定）

```typescript
type InventorySettings = {
  lowStockThreshold: number;
  expiringSoonDays: number;
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
};
```

### 2.6 Food（食材主檔）

```typescript
type Food = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  nutritionInfo?: any;
};
```

### 2.7 FoodCategory（食材分類）

- 穀類
- 調味料
- 主食類
- 乳製品與飲品
- 肉類海鮮
- 蔬果
- 其他

---

## 3. Inventory API（庫存管理）

### 3.1 取得庫存列表

- **Method**: `GET`
- **Path**: `/inventory`
- **Query Params**: `groupId?`, `category?`, `status? (expired | expiring-soon | low-stock | normal)`, `page?`, `limit?`
- **Success Response**:
  ```json
  {
    "items": [
      /* FoodItem */
    ],
    "total": 100,
    "stats": {
      /* InventoryStats */
    }
  }
  ```

### 3.2 取得單一食材

- **Method**: `GET`
- **Path**: `/inventory/{id}`
- **Success Response**: `FoodItem`

### 3.3 新增食材

- **Method**: `POST`
- **Path**: `/inventory`
- **Request Body**: `AddFoodItemRequest` (`Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>`)
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Created successfully",
    "data": { "id": "new-uuid" }
  }
  ```

### 3.4 更新食材

- **Method**: `PUT`
- **Path**: `/inventory/{id}`
- **Request Body**: `UpdateFoodItemRequest` (`Partial<Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>>`)
- **Success Response**:
  ```json
  { "success": true, "message": "Updated successfully" }
  ```

### 3.5 刪除食材

- **Method**: `DELETE`
- **Path**: `/inventory/{id}`
- **Success Response**:
  ```json
  { "success": true, "message": "Deleted successfully" }
  ```

### 3.6 批次操作

- **Batch Add**
  - **Method**: `POST`
  - **Path**: `/inventory/batch`
  - **Request Body**: `BatchAddInventoryRequest` (`{ "items": [Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>] }`)
  - **Success Response**: `{ "success": true, "message": "Created successfully" }`

- **Batch Update**
  - **Method**: `PUT`
  - **Path**: `/inventory/batch`
  - **Request Body**: `BatchUpdateInventoryRequest` (`{ "items": [Partial<FoodItem> (需包含 id)] }`)
  - **Success Response**: `{ "success": true, "message": "Updated successfully" }`

- **Batch Delete**
  - **Method**: `DELETE`
  - **Path**: `/inventory/batch`
  - **Request Body**: `BatchDeleteInventoryRequest` (`{ "ids": ["id1", "id2"] }`)
  - **Success Response**: `{ "success": true, "message": "Deleted successfully" }`

### 3.7 取得庫存統計

- **Method**: `GET`
- **Path**: `/inventory/stats`
- **Query Params**: `groupId?`
- **Success Response**: `InventoryStats`

### 3.8 取得分類列表

- **Method**: `GET`
- **Path**: `/inventory/categories`
- **Success Response**: `CategoryInfo[]`

### 3.9 取得庫存摘要

- **Method**: `GET`
- **Path**: `/inventory/summary`
- **Success Response**: `InventorySummary`

### 3.10 取得過期/常用清單

- **過期清單**
  - **Method**: `GET`
  - **Path**: `/inventory/expired`
  - **Query Params**: `page?`, `limit?`
  - **Success Response**:
    ```json
    {
      "items": [
        /* FoodItem */
      ],
      "total": 42
    }
    ```

- **常用清單**
  - **Method**: `GET`
  - **Path**: `/inventory/frequent`
  - **Query Params**: `limit?`
  - **Success Response**: `FoodItem[]`

### 3.11 庫存設定

- **GET** `/inventory/settings`: 取得設定，回傳 `InventorySettings`
- **PUT** `/inventory/settings`: 更新設定，Request Body: `UpdateInventorySettingsRequest`

---

## 4. Foods API（食材主檔）

### 4.1 取得分類下食材

- **Method**: `GET`
- **Path**: `/foods/category/{catId}`
- **Success Response**: `Food[]`

### 4.2 取得分類下單一食材

- **Method**: `GET`
- **Path**: `/foods/category/{catId}/{id}`
- **Success Response**: `Food`

### 4.3 新增食材主檔

- **Method**: `POST`
- **Path**: `/foods`
- **Request Body**: `Omit<Food, 'id'>`
- **Success Response**: `Food`

### 4.4 更新食材主檔

- **Method**: `PUT`
- **Path**: `/foods/{id}`
- **Request Body**: `Partial<Food>`
- **Success Response**: `Food`

### 4.5 刪除食材主檔

- **Method**: `DELETE`
- **Path**: `/foods/{id}`
- **Success Response**: `204 No Content`
