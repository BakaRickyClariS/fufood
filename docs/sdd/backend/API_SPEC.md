# Fufood Backend API 文件

**版本**: v2.4  
**最後更新**: 2025-12-18

---

## API 基底

| 環境 | URL |
|------|-----|
| 生產環境 | `https://api.fufood.jocelynh.me` |
| AI API | `https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1` |

---

## 認證方式

- **HttpOnly Cookie**: 登入成功後由後端設置
- **Bearer Token**: 可選，透過 `Authorization` header 傳遞

---

## API 端點總覽

### Auth（認證）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/oauth/line/init` | LINE OAuth 入口 |
| GET | `/oauth/line/callback` | LINE OAuth 回呼 |
| GET | `/api/v1/profile` | 取得用戶資料（HttpOnly Cookie） |
| POST | `/api/v1/auth/logout` | 登出並清除 Cookie |
| POST | `/api/v1/auth/refresh` | 刷新 Token |

---

### Refrigerators（冰箱/群組）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/v1/refrigerators` | 取得所有冰箱 |
| POST | `/api/v1/refrigerators` | 建立冰箱 |
| GET | `/api/v1/refrigerators/{id}` | 取得單一冰箱 |
| PUT | `/api/v1/refrigerators/{id}` | 更新冰箱 |
| DELETE | `/api/v1/refrigerators/{id}` | 刪除冰箱 |
| GET | `/api/v1/refrigerators/{id}/members` | 取得成員列表 |
| POST | `/api/v1/refrigerators/{id}/members` | 新增/邀請成員 |
| DELETE | `/api/v1/refrigerators/{id}/members/{memberId}` | 移除成員 |
| PATCH | `/api/v1/refrigerators/{id}/members/{memberId}` | 更新成員權限 |

---

### Inventory（庫存）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/v1/inventory` | 取得庫存列表 |
| POST | `/api/v1/inventory` | 新增食材 |
| GET | `/api/v1/inventory/{id}` | 取得單一食材 |
| PUT | `/api/v1/inventory/{id}` | 更新食材 |
| DELETE | `/api/v1/inventory/{id}` | 刪除食材 |
| DELETE | `/api/v1/inventory/batch` | 批次刪除 |
| GET | `/api/v1/inventory/summary` | 庫存摘要 |
| GET | `/api/v1/inventory/categories` | 類別列表 |
| GET | `/api/v1/inventory/settings` | 庫存設定 |
| PUT | `/api/v1/inventory/settings` | 更新設定 |

**Query Parameters（GET /inventory）**:
- `status`: `expired` | `expiring-soon` | `low-stock` | `frequent` | `normal`
- `category`: 類別篩選
- `groupId`: 群組篩選
- `page`, `limit`: 分頁
- `include`: `summary` | `stats`

---

### Recipes（食譜）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/v1/recipes` | 取得食譜列表 |
| GET | `/api/v1/recipes/{id}` | 取得單一食譜 |
| PATCH | `/api/v1/recipes/{id}` | 更新食譜狀態（如已烹煮） |
| POST | `/api/v1/recipes/{id}/favorite` | 加入收藏 |
| DELETE | `/api/v1/recipes/{id}/favorite` | 取消收藏 |
| GET | `/api/v1/recipes/plan` | 取得餐期計畫 |
| POST | `/api/v1/recipes/plan` | 新增餐期計畫 |
| DELETE | `/api/v1/recipes/plan/{planId}` | 刪除餐期計畫 |

---

### Shopping Lists（購物清單）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/v1/shopping-lists` | 取得清單列表 |
| POST | `/api/v1/shopping-lists` | 建立清單 |
| GET | `/api/v1/shopping-lists/{id}` | 取得單一清單 |
| PATCH | `/api/v1/shopping-lists/{id}` | 更新清單/標記購買 |
| DELETE | `/api/v1/shopping-lists/{id}` | 刪除清單 |

---

### AI Service（AI 服務）

> **注意**: AI API 使用獨立的基底 URL

| Method | Path | 說明 |
|--------|------|------|
| POST | `/api/v1/ai/analyze-image` | 圖片分析（OCR） |
| POST | `/api/v1/ai/recipe` | AI 食譜生成 |
| POST | `/api/v1/media/upload` | 媒體上傳 |

---

### Notifications（通知）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/v1/notifications` | 取得通知設定 |
| POST | `/api/v1/notifications` | 更新通知設定 |

---

## 標準回應格式

### 成功回應

```json
{
  "status": true,
  "message": "ok",
  "data": { ... }
}
```

### 錯誤回應

```json
{
  "code": "AUTH_001",
  "message": "錯誤訊息",
  "details": {},
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## CORS 設定建議

允許的 Origins:
- `https://fufood.vercel.app`
- `http://localhost:5173`

Cookie 設定:
- `SameSite=None`
- `Secure=true`
- `HttpOnly=true`
