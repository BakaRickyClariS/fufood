# Fufood API 優化建議與修改方向

**版本**: v1.0  
**建立日期**: 2025-12-02  
**基於**: API_REFERENCE_V2.md  
**目的**: 針對目前的 API 設計提供優化建議,改善架構、效能、安全性與開發體驗

---

## 📋 目錄

- [整體架構優化](#整體架構優化)
- [API 設計優化](#api-設計優化)
- [效能優化](#效能優化)
- [安全性強化](#安全性強化)
- [開發體驗改善](#開發體驗改善)
- [優先級建議](#優先級建議)

---

## 🏗️ 整體架構優化

### 1. RESTful 設計一致性改善

#### 問題現況
目前 API 設計存在部分不一致的地方:
- `/recipe/analyze-image` 未遵循 `/api/v1` 標準前綴
- 部分端點命名不符合 RESTful 慣例

#### 建議改善

**統一路由前綴**
```diff
- POST /recipe/analyze-image
+ POST /api/v1/ai/analyze-image
```

**理由**: 
- 保持 API 版本控制一致性
- 方便未來 API Gateway 或 Middleware 統一處理
- 易於建立統一的 CORS、Rate Limiting 規則

---

### 2. 模組職責劃分優化

#### 問題現況
`Foods` 與 `Inventory` 模組職責有些重疊,可能造成混淆。

#### 建議改善方案

**階段性實作策略**

**第一階段 (MVP)**: 
- 僅實作 `Inventory` 模組
- 食材名稱直接儲存為字串
- 分類使用預定義的 enum

**第二階段 (擴展期)**:
- 建立 `Foods` 主檔模組
- 從 `Inventory` 累積的食材資料自動提取建立
- 提供食材自動完成、營養資訊等進階功能

**資料表關聯建議**
```typescript
// Inventory (現階段)
{
  id: string;
  foodName: string; // 直接儲存名稱
  category: FoodCategory; // enum
  ...
}

// Foods (未來擴展)
{
  id: string;
  name: string;
  category: FoodCategory;
  defaultUnit: string;
  nutritionInfo?: NutritionData;
  imageUrl?: string;
}

// Inventory (擴展後)
{
  id: string;
  foodId?: string; // 關聯到 Foods 主檔 (optional)
  foodName: string; // 保留向下相容
  ...
}
```

> [!TIP]
> **建議**: 初期專注於 `Inventory` 核心功能,待累積足夠資料後再建立 `Foods` 主檔,可避免過早優化

---

## 🎯 API 設計優化

### 3. 查詢參數標準化

#### 問題現況
文件中缺乏統一的查詢參數規範,可能導致前後端理解不一致。

#### 建議改善

**定義標準查詢參數格式**

```typescript
// 分頁參數 (Pagination)
interface PaginationParams {
  page?: number;      // 頁碼 (從 1 開始)
  limit?: number;     // 每頁數量 (預設 20, 最大 100)
  offset?: number;    // 偏移量 (替代方案)
}

// 排序參數 (Sorting)
interface SortParams {
  sortBy?: string;    // 排序欄位 (例: 'expiryDate', 'createdAt')
  order?: 'asc' | 'desc'; // 排序方向
}

// 篩選參數 (Filtering)
interface FilterParams {
  status?: string;    // 狀態篩選
  category?: string;  // 分類篩選
  groupId?: string;   // 群組篩選
  dateFrom?: string;  // 日期範圍起始 (ISO 8601)
  dateTo?: string;    // 日期範圍結束
  search?: string;    // 關鍵字搜尋
}
```

**實際應用範例**
```
GET /api/v1/inventory?groupId=group-123&status=expiring&sortBy=expiryDate&order=asc&page=1&limit=20
```

**標準回應格式**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;      // 總筆數
    totalPages: number; // 總頁數
  };
  meta?: {
    filters?: object;   // 套用的篩選條件
    sort?: object;      // 套用的排序方式
  };
}
```

---

### 4. 錯誤處理標準化

#### 建議新增

**統一錯誤回應格式**
```typescript
interface ApiError {
  code: string;           // 錯誤代碼 (例: 'AUTH_001', 'VALIDATION_ERROR')
  message: string;        // 使用者友善的錯誤訊息
  details?: object;       // 詳細錯誤資訊 (例: 驗證錯誤欄位)
  timestamp: string;      // 錯誤發生時間 (ISO 8601)
  path?: string;          // 請求路徑
  requestId?: string;     // 請求追蹤 ID
}
```

**HTTP 狀態碼使用規範**

| 狀態碼 | 使用情境 | 範例 |
|--------|---------|------|
| 200 | 成功 | 取得資料成功 |
| 201 | 建立成功 | 新增食材成功 |
| 204 | 成功但無內容 | 刪除成功 |
| 400 | 請求格式錯誤 | 缺少必填欄位 |
| 401 | 未認證 | Token 無效或過期 |
| 403 | 無權限 | 非群組成員嘗試存取 |
| 404 | 資源不存在 | 食材 ID 不存在 |
| 409 | 資源衝突 | 重複建立相同食材 |
| 422 | 驗證失敗 | 日期格式錯誤 |
| 429 | 請求過於頻繁 | Rate Limit 超過 |
| 500 | 伺服器錯誤 | 未預期的系統錯誤 |

**錯誤代碼命名規範**
```
模組_錯誤類型_序號

範例:
- AUTH_001: Token 無效
- AUTH_002: Token 過期
- INVENTORY_001: 食材不存在
- INVENTORY_002: 數量不足
- GROUP_001: 群組不存在
- GROUP_002: 無權限操作
```

---

### 5. API 端點命名優化

#### 建議改善

**REST 資源命名**
```diff
# 更語義化的端點名稱

- POST /api/v1/recipes/{id}/used
+ POST /api/v1/recipes/{id}/cook
或
+ POST /api/v1/recipes/{id}/complete

- POST /api/v1/shopping-lists/checkout
+ POST /api/v1/shopping-lists/{id}/complete
或
+ POST /api/v1/shopping-lists/{id}/purchase
```

**批次操作端點**
```typescript
// 建議新增批次操作 API
POST /api/v1/inventory/batch        // 批次新增食材
PUT /api/v1/inventory/batch         // 批次更新食材
DELETE /api/v1/inventory/batch      // 批次刪除食材

// 請求格式
{
  "items": [
    { "foodName": "蘋果", "quantity": 5, ... },
    { "foodName": "香蕉", "quantity": 3, ... }
  ]
}
```

---

## ⚡ 效能優化

### 6. 查詢效能優化

#### 建議新增端點

**欄位選擇 (Field Selection)**
```
GET /api/v1/inventory?fields=id,foodName,expiryDate,status
```
- 減少不必要的資料傳輸
- 提升 API 回應速度
- 特別適用於行動裝置

**資料預載 (Include/Expand)**
```
GET /api/v1/groups/{id}?include=members,inventoryStats
```
- 減少多次請求
- 一次取得關聯資料

#### 建議實作快取策略

**適合快取的端點**
```typescript
// 1. 靜態資料 (長時間快取)
GET /api/v1/inventory/categories     // Cache: 1 天
GET /api/v1/foods/category/{catId}   // Cache: 1 小時

// 2. 使用者相關資料 (短時間快取)
GET /api/v1/auth/me                  // Cache: 5 分鐘
GET /api/v1/inventory/summary        // Cache: 1 分鐘

// 3. 群組資料 (條件式快取)
GET /api/v1/groups                   // Cache: 5 分鐘, invalidate on update
```

**快取標頭建議**
```
Cache-Control: public, max-age=3600
ETag: "686897696a7c876b7e"
Last-Modified: Mon, 02 Dec 2025 10:00:00 GMT
```

---

### 7. 即時通知與 WebSocket 整合

#### 問題現況
目前設計依賴輪詢 (Polling) 來取得更新,效率較低。

#### 建議改善

**WebSocket 端點規劃**
```
ws://api.fufood.com/api/v1/ws
```

**事件類型定義**
```typescript
type WebSocketEvent = 
  | { type: 'inventory.updated', data: InventoryItem }
  | { type: 'inventory.deleted', data: { id: string } }
  | { type: 'inventory.expiring', data: InventoryItem[] }
  | { type: 'group.member_joined', data: GroupMember }
  | { type: 'group.member_left', data: { userId: string } }
  | { type: 'shopping_list.completed', data: { listId: string } }
  | { type: 'notification.push', data: Notification };

// 訂閱機制
{
  "action": "subscribe",
  "channels": ["group:group-123", "user:user-456"]
}
```

**適用場景**
- 群組成員即時看到其他人新增的食材
- 即時通知食材即將過期
- 購物清單共同編輯時的即時更新

> [!IMPORTANT]
> WebSocket 可作為第二階段優化,初期仍使用 HTTP 輪詢即可

---

## 🔒 安全性強化

### 8. 認證與授權機制

#### 建議改善

**Token 刷新機制**
```typescript
// 新增端點
POST /api/v1/auth/refresh

// 請求
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// 回應
{
  "accessToken": "new_access_token",
  "expiresIn": 3600
}
```

**權限驗證中介層**
```typescript
// 定義權限層級
type Permission = 
  | 'inventory.read'
  | 'inventory.write'
  | 'inventory.delete'
  | 'group.manage'
  | 'member.invite'
  | 'member.remove';

// 角色權限映射
const RolePermissions = {
  owner: ['*'],  // 所有權限
  admin: ['inventory.*', 'member.invite'],
  editor: ['inventory.read', 'inventory.write'],
  viewer: ['inventory.read']
};
```

---

### 9. 資料驗證與清理

#### 建議實作

**輸入驗證規範**
```typescript
// 使用 Zod 或類似 schema 驗證庫
import { z } from 'zod';

const InventoryItemSchema = z.object({
  foodName: z.string().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  expiryDate: z.string().datetime(),
  category: z.enum(['vegetable', 'fruit', 'meat', 'dairy', 'grain', 'other']),
  groupId: z.string().uuid(),
  notes: z.string().max(500).optional()
});
```

**輸出清理 (Sanitization)**
- 移除敏感欄位 (如: password hash)
- 統一日期格式為 ISO 8601
- 數值精度控制

---

### 10. Rate Limiting 與 API 使用限制

#### 建議實作

**限制規則**
```typescript
const RateLimits = {
  // 一般 API (每分鐘 60 次)
  default: { window: '1m', max: 60 },
  
  // 登入相關 (每分鐘 5 次,防暴力破解)
  auth: { window: '1m', max: 5 },
  
  // AI 相關 (每小時 10 次,成本考量)
  ai: { window: '1h', max: 10 },
  
  // 檔案上傳 (每分鐘 5 次)
  upload: { window: '1m', max: 5 }
};
```

**回應標頭**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1638432000
Retry-After: 60
```

---

## 🛠️ 開發體驗改善

### 11. API 文件自動化

#### 建議工具與實作

**使用 OpenAPI / Swagger**
```yaml
openapi: 3.0.0
info:
  title: Fufood API
  version: 2.0.0
  description: 食材庫存管理系統 API 文件

paths:
  /api/v1/inventory:
    get:
      summary: 取得庫存列表
      tags: [Inventory]
      parameters:
        - name: groupId
          in: query
          schema:
            type: string
      responses:
        200:
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InventoryList'
```

**自動生成工具**
- **Swagger UI**: 互動式 API 測試介面
- **Redoc**: 美觀的靜態文件
- **Postman Collection**: 從 OpenAPI 自動生成

---

### 12. TypeScript 型別定義

#### 建議實作

**建立 API Client 套件**
```typescript
// @fufood/api-client
export class FufoodApiClient {
  constructor(private baseUrl: string, private token: string) {}

  // 自動型別推斷
  async getInventory(params: GetInventoryParams): Promise<InventoryItem[]> {
    // ...
  }

  async addInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    // ...
  }
}

// 使用
const client = new FufoodApiClient(apiUrl, token);
const items = await client.getInventory({ groupId: 'xxx', status: 'expiring' });
//    ^? InventoryItem[] (自動推斷型別)
```

---

### 13. Mock API 與測試環境

#### 建議改善

**Mock API 規範**
```typescript
// 使用 MSW (Mock Service Worker)
import { rest } from 'msw';

const handlers = [
  rest.get('/api/v1/inventory', (req, res, ctx) => {
    const groupId = req.url.searchParams.get('groupId');
    return res(
      ctx.status(200),
      ctx.json({
        data: mockInventoryData.filter(item => item.groupId === groupId),
        pagination: { page: 1, limit: 20, total: 15, totalPages: 1 }
      })
    );
  })
];
```

**環境切換機制**
```typescript
// 環境變數控制
const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  useMock: import.meta.env.VITE_USE_MOCK_API === 'true'
});
```

---

### 14. API 版本管理策略

#### 建議實作

**向下相容的改動**
- 新增欄位 (可選)
- 新增端點
- 新增查詢參數 (可選)

範例:
```diff
// v1 回應
{
  "id": "item-001",
  "foodName": "蘋果",
  "quantity": 5
+ "nutritionInfo": { ... }  // 新增欄位,不影響現有客戶端
}
```

**破壞性改動時的版本升級**
```
v1: /api/v1/inventory
v2: /api/v2/inventory  // 當需要重大改動時
```

**版本棄用流程**
1. 發布新版本 (v2)
2. 標記舊版本為 deprecated (回應標頭加入 `Deprecation: true`)
3. 給予至少 6 個月過渡期
4. 逐步關閉舊版本

---

## 📊 優先級建議

### 高優先級 (立即實施)

| 項目 | 理由 | 預估工時 |
|-----|------|---------|
| [錯誤處理標準化](#4-錯誤處理標準化) | 影響所有 API,提升除錯效率 | 2-3 天 |
| [查詢參數標準化](#3-查詢參數標準化) | 統一前後端介面,減少溝通成本 | 1-2 天 |
| [輸入驗證規範](#9-資料驗證與清理) | 提升安全性與資料品質 | 2-3 天 |
| [Token 刷新機制](#8-認證與授權機制) | 改善使用者體驗,減少重新登入 | 1-2 天 |

### 中優先級 (第二階段)

| 項目 | 理由 | 預估工時 |
|-----|------|---------|
| [RESTful 路由統一](#1-restful-設計一致性改善) | 提升 API 一致性 | 1 天 |
| [批次操作端點](#5-api-端點命名優化) | 提升效率,減少請求次數 | 2-3 天 |
| [快取策略](#6-查詢效能優化) | 降低伺服器負載,提升效能 | 3-5 天 |
| [Rate Limiting](#10-rate-limiting-與-api-使用限制) | 保護系統資源 | 1-2 天 |

### 低優先級 (優化階段)

| 項目 | 理由 | 預估工時 |
|-----|------|---------|
| [WebSocket 整合](#7-即時通知與-websocket-整合) | 提升即時性,但非必要功能 | 5-7 天 |
| [Foods 主檔模組](#2-模組職責劃分優化) | 進階功能,可待資料累積後實作 | 3-5 天 |
| [OpenAPI 文件](#11-api-文件自動化) | 改善文件維護,但現有文件已足夠 | 2-3 天 |

---

## 📝 實施建議

### 階段性推進計畫

#### Phase 1: 基礎強化 (1-2 週)
- [ ] 實作統一錯誤處理
- [ ] 定義查詢參數規範
- [ ] 加入輸入驗證
- [ ] 實作 Token 刷新機制

#### Phase 2: 功能完善 (2-3 週)
- [ ] 統一 API 路由前綴
- [ ] 新增批次操作端點
- [ ] 實作 Rate Limiting
- [ ] 建立快取策略

#### Phase 3: 體驗優化 (3-4 週)
- [ ] 整合 WebSocket
- [ ] 建立 Foods 主檔模組
- [ ] 自動化 API 文件
- [ ] TypeScript 型別套件

---

## 🔄 後續追蹤

### 需要與團隊討論的事項

1. **RESTful 路由變更**: `/recipe/analyze-image` 是否需要保持向下相容?
2. **Foods 模組實作時機**: 是否在 MVP 階段就建立,還是等資料累積後?
3. **WebSocket 需求**: 即時更新功能的優先級如何?
4. **快取策略**: Redis 或其他快取方案的選擇?

### 指標追蹤

建議追蹤以下 API 效能指標:
- API 回應時間 (P50, P95, P99)
- 錯誤率 (4xx, 5xx)
- Rate Limit 觸發次數
- 快取命中率

---

**文件結束**

> 如有任何疑問或需要進一步討論,請隨時聯繫開發團隊。
