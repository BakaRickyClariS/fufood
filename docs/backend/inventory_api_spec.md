# Inventory Module & Foods Module API Specification

**版本**: v1.0
**文件用途**: 供後端開發人員實作參考
**涵蓋範圍**: Inventory (庫存管理) 與 Foods (食材主檔) 模組

---

## 1. 基礎規範

### 1.1 認證 (Authentication)

- **Access Token**: 放入 Header `Authorization: Bearer <access_token>` (亦支援 `httpOnly` Cookie)
- **Refresh Token**: **必須**使用 `httpOnly` Cookie 傳遞以確保安全性
- **Cookie 設定**: 需設定 `Secure` (HTTPS only) 與 `SameSite=Strict`

### 1.2 Base URL

```
/api/v1
```

### 1.3 標準回應格式與狀態碼 (Standard Response & Status Codes)

**成功回應 (Success)**:

| 狀態碼             | 描述     | 適用情境                          |
| :----------------- | :------- | :-------------------------------- |
| **200 OK**         | 請求成功 | 一般查詢、修改成功回傳資料時      |
| **201 Created**    | 建立成功 | 資源建立成功 (如新增食材)         |
| **204 No Content** | 無內容   | 請求成功但無回傳資料 (如刪除成功) |

**錯誤回應 (Error)**:

標準錯誤格式：

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

| 狀態碼                        | 描述       | 適用情境                                 |
| :---------------------------- | :--------- | :--------------------------------------- |
| **400 Bad Request**           | 請求錯誤   | 參數格式錯誤、必填欄位缺失               |
| **401 Unauthorized**          | 未認證     | Token 無效、逾時或未提供 (Cookie/Header) |
| **403 Forbidden**             | 無權限     | 已認證但無權限存取該資源                 |
| **404 Not Found**             | 找不到資源 | 請求的路徑或 ID 不存在                   |
| **422 Unprocessable Entity**  | 驗證失敗   | 格式正確但邏輯驗證失敗 (如庫存不足)      |
| **429 Too Many Requests**     | 請求過多   | 超過 API 若用的頻率限制                  |
| **500 Internal Server Error** | 伺服器錯誤 | 系統內部發生非預期錯誤                   |

---

## 2. 資料模型 (Data Models)

### 2.1 FoodItem (庫存食材)

```typescript
type FoodItem = {
  id: string; // UUID
  name: string; // 食材名稱
  category: string; // 分類 (參考 2.4)
  quantity: number; // 數量
  unit: string; // 單位 (個, g, ml, etc.)
  imageUrl?: string; // 圖片 URL
  purchaseDate: string; // 購買日期 (YYYY-MM-DD)
  expiryDate: string; // 過期日期 (YYYY-MM-DD)
  lowStockAlert: boolean; // 是否開啟低庫存提醒
  lowStockThreshold: number; // 低庫存閥值
  notes?: string; // 備註
  groupId?: string; // 所屬群組 ID (若為個人則為 null 或 undefined)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
```

### 2.2 Food (食材主檔)

```typescript
type Food = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  nutritionInfo?: any; // 營養資訊 (JSON)
};
```

### 2.3 InventoryStats (庫存統計)

```typescript
type InventoryStats = {
  totalItems: number; // 總項目數
  totalQuantity: number; // 總數量
  expiredCount: number; // 過期項目數
  expiringSoonCount: number; // 即將過期項目數
  value: number; // 預估總價值 (選填)
  categoryBreakdown: Record<string, number>; // 各分類數量
};
```

### 2.4 Categories (分類列舉)

- 蔬果類
- 冷凍調理類
- 主食烘焙類
- 乳製品飲料類
- 冷凍海鮮類
- 肉品類
- 其他

---

## 3. Inventory API (庫存管理)

### 3.1 取得庫存列表

- **Method**: `GET`
- **Path**: `/inventory`
- **Query Params**:
  - `groupId`: (Optional) 群組 ID
  - `category`: (Optional) 分類篩選
  - `status`: (Optional) `expired` | `expiring-soon` | `low-stock` | `normal`
  - `page`: (Optional) 頁碼，預設 1
  - `limit`: (Optional) 每頁筆數，預設 20
- **Success Response**:
  ```json
  {
    "items": [ ...FoodItem Objects ],
    "total": 100,
    "stats": { ...InventoryStats Object }
  }
  ```

### 3.2 取得單一食材詳情

- **Method**: `GET`
- **Path**: `/inventory/{id}`
- **Success Response**: `FoodItem` Object

### 3.3 新增食材

- **Method**: `POST`
- **Path**: `/inventory`
- **Request Body**: `Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>`
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
- **Request Body**: `Partial<FoodItem>`
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Updated successfully",
    "data": { ...Updated FoodItem }
  }
  ```

### 3.5 刪除食材

- **Method**: `DELETE`
- **Path**: `/inventory/{id}`
- **Success Response**: `204 No Content` 或 `{ "success": true }`

### 3.6 批次操作 (新增/更新/刪除)

- **Method**: `POST` / `PUT` / `DELETE`
- **Path**: `/inventory/batch`
- **Request Body**:
  - POST (Batch Add): `{ "items": [ ...NewFoodItems ] }`
  - PUT (Batch Update): `{ "items": [ ...UpdatedFoodItemsWithId ] }`
  - DELETE (Batch Delete): `{ "ids": [ "id1", "id2" ] }`
- **Success Response**: `{ "success": true }`

### 3.7 取得庫存統計

- **Method**: `GET`
- **Path**: `/inventory/stats`
- **Query Params**: `groupId` (Optional)
- **Success Response**: `InventoryStats` Object

### 3.8 取得分類列表

- **Method**: `GET`
- **Path**: `/inventory/categories`
- **Success Response**: `CategoryInfo[]`

### 3.9 取得庫存概況 (Summary)

- **Method**: `GET`
- **Path**: `/inventory/summary`
- **Success Response**:
  ```json
  {
    "total": 50,
    "expiring": 3,
    "expired": 1
  }
  ```

### 3.10 取得過期/常用清單

- **Method**: `GET`
- **Path**: `/inventory/expired` (過期清單)
- **Path**: `/inventory/frequent` (常用清單)
- **Success Response**: `FoodItem[]`

### 3.11 庫存設定

- **GET** `/inventory/settings`: 取得設定
- **PUT** `/inventory/settings`: 更新設定 (Request Body: InventorySettings)

---

## 4. Foods API (食材主檔)

**用途**: 提供食材的標準資料庫，讓使用者在新增庫存時可以快速選擇標準化的食材。

### 4.1 取得分類下的食材

- **Method**: `GET`
- **Path**: `/foods/category/{catId}`
- **Success Response**: `Food[]`

### 4.2 取得單一食材主檔詳情

- **Method**: `GET`
- **Path**: `/foods/category/{catId}/{id}`
- **Success Response**: `Food` Object

### 4.3 新增食材主檔 (用戶自定義)

- **Method**: `POST`
- **Path**: `/foods`
- **Request Body**: `Omit<Food, 'id'>`
- **Success Response**: `Food` Object

### 4.4 更新食材主檔

- **Method**: `PUT`
- **Path**: `/foods/{id}`
- **Request Body**: `Partial<Food>`
- **Success Response**: `Food` Object

### 4.5 刪除食材主檔

- **Method**: `DELETE`
- **Path**: `/foods/{id}`
- **Success Response**: `204 No Content`
