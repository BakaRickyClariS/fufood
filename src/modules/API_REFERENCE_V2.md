# Fufood API 參考 v2.2（精簡版）

**版本**: v2.2  
**最後更新**: 2025-12-02  
**說明**: 依需求精簡路由，保留必要驗證（含 `/auth/check`）、社群貼文按讚／留言，並將「批次新增／批次修改」標註暫緩。

---

## 快速索引

- [Auth](#1-auth-使用者認證) | [Groups](#2-groups-群組管理) | [Inventory](#3-inventory-庫存管理)
- [Foods](#4-foods-食材主檔) | [Recipes](#5-recipes-食譜管理) | [Shopping Lists](#6-shopping-lists-購物清單)
- [AI](#7-ai-service-ai-服務) | [Notifications](#8-notifications-通知) | [LINE Bot](#9-line-bot) | [Media](#10-media-upload-媒體上傳)

---

## 設計規則（摘要）

- 基底路徑: `/api/v1`
- 查詢參數: `page, limit, sortBy, order`，其餘依功能自訂
- 標準回應：
  ```json
  {
    "status": true,
    "message": "ok",
    "data": {
      /* payload */
    }
  }
  ```
- 標準錯誤：
  ```json
  {
    "code": "AUTH_001",
    "message": "error",
    "details": {},
    "timestamp": "2025-01-01T00:00:00Z"
  }
  ```

---

## 路由總表（精簡後）

| #                                                          | 模組      | Method | Path                                     | 功能                                                                                                     | 備註                                 |
| ---------------------------------------------------------- | --------- | ------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Auth（保留 `/auth/check`）**                             |
| 1                                                          | Auth      | POST   | `/api/v1/auth/register`                  | 使用者註冊                                                                                               |                                      |
| 2                                                          | Auth      | POST   | `/api/v1/auth/login`                     | 使用者登入                                                                                               |                                      |
| 3                                                          | Auth      | POST   | `/api/v1/auth/logout`                    | 登出並清除 Cookie                                                                                        |                                      |
| 4                                                          | Auth      | POST   | `/api/v1/auth/refresh`                   | 更新 Access Token                                                                                        |                                      |
| 5                                                          | Auth      | GET    | `/api/v1/auth/me`                        | 取得登入者資訊                                                                                           |                                      |
| 6                                                          | Auth      | GET    | `/api/v1/auth/check`                     | 輕量驗證 Token 有效性（回 204/401）                                                                      | 保留                                 |
| 7                                                          | Auth      | GET    | `/api/v1/auth/line/login`                | LINE OAuth 入口                                                                                          |                                      |
| 8                                                          | Auth      | GET    | `/api/v1/auth/line/callback`             | LINE OAuth 回呼                                                                                          |                                      |
| 9                                                          | Auth      | PUT    | `/api/v1/auth/update-profile`            | 更新個人資料                                                                                             |                                      |
| **Groups（合併成員操作）**                                 |
| 10                                                         | Groups    | GET    | `/api/v1/groups`                         | 群組列表                                                                                                 |                                      |
| 11                                                         | Groups    | POST   | `/api/v1/groups`                         | 建立群組                                                                                                 |                                      |
| 12                                                         | Groups    | GET    | `/api/v1/groups/{id}`                    | 群組詳情                                                                                                 |                                      |
| 13                                                         | Groups    | PUT    | `/api/v1/groups/{id}`                    | 更新群組                                                                                                 |                                      |
| 14                                                         | Groups    | DELETE | `/api/v1/groups/{id}`                    | 刪除群組                                                                                                 |                                      |
| 15                                                         | Groups    | POST   | `/api/v1/groups/{id}/members`            | 加入／邀請成員（依 body 區分）                                                                           | 合併 join/invite                     |
| 16                                                         | Groups    | DELETE | `/api/v1/groups/{id}/members/{memberId}` | 離開或移除成員                                                                                           | 合併 leave/remove                    |
| 17                                                         | Groups    | PATCH  | `/api/v1/groups/{id}/members/{memberId}` | 更新成員權限                                                                                             |                                      |
| **Inventory（庫存，批次新增/修改暫緩）**                   |
| 18                                                         | Inventory | GET    | `/api/v1/inventory`                      | 庫存列表，可用 `status` 篩選（expired/expiring-soon/low-stock/frequent/normal），`include=summary,stats` | 取代 expired/frequent/stats 獨立路由 |
| 19                                                         | Inventory | GET    | `/api/v1/inventory/{id}`                 | 單一食材詳情                                                                                             |                                      |
| 20                                                         | Inventory | POST   | `/api/v1/inventory`                      | 新增食材                                                                                                 |                                      |
| 21                                                         | Inventory | PUT    | `/api/v1/inventory/{id}`                 | 更新食材                                                                                                 |                                      |
| 22                                                         | Inventory | DELETE | `/api/v1/inventory/{id}`                 | 刪除食材                                                                                                 |                                      |
| 23                                                         | Inventory | DELETE | `/api/v1/inventory/batch`                | 批次刪除                                                                                                 | 可選；如前端可迭代則可移除           |
| 24                                                         | Inventory | GET    | `/api/v1/inventory/categories`           | 類別列表                                                                                                 |                                      |
| 25                                                         | Inventory | GET    | `/api/v1/inventory/settings`             | 取得庫存設定                                                                                             |                                      |
| 26                                                         | Inventory | PUT    | `/api/v1/inventory/settings`             | 更新庫存設定                                                                                             |                                      |
| 27                                                         | Inventory | GET    | `/api/v1/inventory/summary`              | 庫存摘要                                                                                                 | 若已用 include，可選                 |
| **暫緩**                                                   | Inventory | POST   | `/api/v1/inventory/batch`                | 批次新增                                                                                                 | 先不做                               |
| **暫緩**                                                   | Inventory | PUT    | `/api/v1/inventory/batch`                | 批次修改                                                                                                 | 先不做                               |
| **Foods（合併 category 查詢）**                            |
| 28                                                         | Foods     | GET    | `/api/v1/foods`                          | 食材列表，`?category=` 篩選                                                                              | 取代 `/foods/category/{catId}`       |
| 29                                                         | Foods     | GET    | `/api/v1/foods/{id}`                     | 食材詳情                                                                                                 | 取代 `/foods/category/{catId}/{id}`  |
| 30                                                         | Foods     | POST   | `/api/v1/foods`                          | 建立食材                                                                                                 |                                      |
| 31                                                         | Foods     | PUT    | `/api/v1/foods/{id}`                     | 更新食材                                                                                                 |                                      |
| 32                                                         | Foods     | DELETE | `/api/v1/foods/{id}`                     | 刪除食材                                                                                                 |                                      |
| **Recipes（烹煮改用 PATCH）**                              |
| 33                                                         | Recipes   | GET    | `/api/v1/recipes`                        | 食譜列表（可含 `category`, `favorite=true`）                                                             |                                      |
| 34                                                         | Recipes   | GET    | `/api/v1/recipes/{id}`                   | 食譜詳情                                                                                                 |                                      |
| 35                                                         | Recipes   | POST   | `/api/v1/recipes/{id}/favorite`          | 加入最愛                                                                                                 |                                      |
| 36                                                         | Recipes   | DELETE | `/api/v1/recipes/{id}/favorite`          | 取消最愛                                                                                                 |                                      |
| 37                                                         | Recipes   | PATCH  | `/api/v1/recipes/{id}`                   | 更新狀態 `{ status: 'cooked' }` 等                                                                       | 取代 POST /cook                      |
| 38                                                         | Recipes   | POST   | `/api/v1/recipes/plan`                   | 新增餐期計畫                                                                                             |                                      |
| 39                                                         | Recipes   | GET    | `/api/v1/recipes/plan`                   | 取得餐期計畫                                                                                             |                                      |
| 40                                                         | Recipes   | DELETE | `/api/v1/recipes/plan/{planId}`          | 移除餐期計畫                                                                                             |                                      |
| **Shopping Lists（購買改 PATCH，保留社群貼文/按讚/留言）** |
| 41                                                         | Shopping  | GET    | `/api/v1/shopping-lists`                 | 清單列表                                                                                                 |                                      |
| 42                                                         | Shopping  | POST   | `/api/v1/shopping-lists`                 | 建立清單                                                                                                 |                                      |
| 43                                                         | Shopping  | GET    | `/api/v1/shopping-lists/{id}`            | 清單詳情                                                                                                 |                                      |
| 44                                                         | Shopping  | PATCH  | `/api/v1/shopping-lists/{id}`            | 更新清單、標記購買 `{ status: 'purchased' }`                                                             | 取代 POST /purchase                  |
| 45                                                         | Shopping  | DELETE | `/api/v1/shopping-lists/{id}`            | 刪除清單                                                                                                 |                                      |
| 46                                                         | Shopping  | GET    | `/api/v1/shopping-lists/{id}/posts`      | 取得貼文                                                                                                 | 社群                                 |
| 47                                                         | Shopping  | POST   | `/api/v1/shopping-lists/{id}/posts`      | 發佈貼文                                                                                                 | 社群                                 |
| 48                                                         | Shopping  | POST   | `/api/v1/posts/{postId}/like`            | 按讚貼文                                                                                                 | 社群                                 |
| 49                                                         | Shopping  | GET    | `/api/v1/posts/{postId}/comments`        | 取得留言                                                                                                 | 社群                                 |
| 50                                                         | Shopping  | POST   | `/api/v1/posts/{postId}/comments`        | 新增留言                                                                                                 | 社群                                 |
| **AI Service**                                             |
| 51                                                         | AI        | POST   | `/api/v1/ai/analyze-image`               | OCR/影像分析                                                                                             |                                      |
| 52                                                         | AI        | POST   | `/api/v1/ai/recipe`                      | AI 產生食譜                                                                                              |                                      |
| **Notifications**                                          |
| 53                                                         | Notify    | GET    | `/api/v1/notifications`                  | 取得通知設定                                                                                             |                                      |
| 54                                                         | Notify    | POST   | `/api/v1/notifications`                  | 建立/更新通知                                                                                            |                                      |
| **LINE Bot**                                               |
| 55                                                         | LINE      | POST   | `/api/v1/line/webhook`                   | LINE Webhook                                                                                             |                                      |
| 56                                                         | LINE      | POST   | `/api/v1/line/push`                      | 伺服端主動推播                                                                                           |                                      |
| **Media Upload**                                           |
| 57                                                         | Media     | POST   | `/api/v1/media/upload`                   | 上傳圖片/檔案                                                                                            |                                      |

---

## 重要說明

- **Auth**：`/auth/check` 保留作輕量心跳；`/auth/me` 回傳使用者資料。
- **Inventory**：`status` 篩選取代 `expired`/`frequent` 獨立路由；批次新增/批次修改標註暫緩。批次刪除可保留或以前端多次刪除取代。
- **Foods**：以查詢參數 `category` 取代多層 category 路徑；詳情統一 `/foods/{id}`。
- **Recipes**：烹煮完成改 `PATCH /recipes/{id}`（狀態欄位）；收藏列表用 `GET /recipes?favorite=true`。
- **Shopping**：購買改 `PATCH /shopping-lists/{id}`（`status=purchased`）；社群貼文、按讚、留言路徑保留。
- **Groups**：成員加入/邀請合併為單一路徑，移除重複的 join/leave/remove/invite 路徑。

---

## 環境變數（沿用）

| 變數                            | 說明                     | 範例                                   |
| ------------------------------- | ------------------------ | -------------------------------------- |
| `VITE_API_BASE_URL`             | API 基底                 | `http://localhost:3000`                |
| `VITE_USE_MOCK_API`             | 是否使用 Mock            | `true`                                 |
| `VITE_LINE_CLIENT_ID`           | LINE Login Channel ID    | `1234567890`                           |
| `VITE_LINE_REDIRECT_URI`        | LINE Login Callback URL  | `http://localhost:5173/login/callback` |
| `VITE_CLOUDINARY_CLOUD_NAME`    | Cloudinary Cloud Name    | `demo`                                 |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | `fufood_preset`                        |

---

**附註**：上述為精簡草案，若需再調整（例如保留/移除 `inventory` 批次刪除、`summary` 獨立路徑），可依實作狀況微調。\*\*\*

# Fufood API 參考 v2.2（完整精簡版）

**版本**: v2.2  
**最後更新**: 2025-12-02  
**說明**: 依需求精簡路由並補齊完整描述；保留 `/auth/check` 供輕量驗證，社群貼文/按讚/留言保留；「批次新增」「批次修改」標註暫緩，不實作。

---

## 快速索引

- [設計規則](#設計規則)
- [路由總表](#路由總表)
- [1 Auth（使用者認證）](#1-auth-使用者認證)
- [2 Groups（群組管理）](#2-groups-群組管理)
- [3 Inventory（庫存管理）](#3-inventory-庫存管理)
- [4 Foods（食材主檔）](#4-foods-食材主檔)
- [5 Recipes（食譜管理）](#5-recipes-食譜管理)
- [6 Shopping Lists（購物清單）](#6-shopping-lists-購物清單)
- [7 AI Service（AI 服務）](#7-ai-service-ai-服務)
- [8 Notifications（通知）](#8-notifications-通知)
- [9 LINE Bot](#9-line-bot)
- [10 Media Upload（媒體上傳）](#10-media-upload-媒體上傳)
- [環境變數](#環境變數)

---

## 設計規則

- **基底路徑**: `/api/v1`
- **常用查詢參數**: `page`, `limit`, `sortBy`, `order`，其餘依功能自訂。
- **標準回應**
  ```json
  {
    "status": true,
    "message": "ok",
    "data": {
      /* payload */
    }
  }
  ```
- **標準錯誤**
  ```json
  {
    "code": "AUTH_001",
    "message": "error",
    "details": {},
    "timestamp": "2025-01-01T00:00:00Z"
  }
  ```
- **HTTP 狀態碼**: 200/201 成功，400/401/403/404/422/429 依情境。

---

## 路由總表

| #                                            | 模組      | Method | Path                                     | 功能                                                                                                | 備註                                 |
| -------------------------------------------- | --------- | ------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Auth（保留 `/auth/check`）**               |
| 1                                            | Auth      | POST   | `/api/v1/auth/register`                  | 使用者註冊                                                                                          |                                      |
| 2                                            | Auth      | POST   | `/api/v1/auth/login`                     | 使用者登入                                                                                          |                                      |
| 3                                            | Auth      | POST   | `/api/v1/auth/logout`                    | 登出並清除 Cookie                                                                                   |                                      |
| 4                                            | Auth      | POST   | `/api/v1/auth/refresh`                   | 更新 Access Token                                                                                   |                                      |
| 5                                            | Auth      | GET    | `/api/v1/auth/me`                        | 取得登入者資訊                                                                                      |                                      |
| 6                                            | Auth      | GET    | `/api/v1/auth/check`                     | 輕量驗證 Token（204/401）                                                                           | 保留                                 |
| 7                                            | Auth      | GET    | `/api/v1/auth/line/login`                | LINE OAuth 入口                                                                                     |                                      |
| 8                                            | Auth      | GET    | `/api/v1/auth/line/callback`             | LINE OAuth 回呼                                                                                     |                                      |
| 9                                            | Auth      | PUT    | `/api/v1/auth/update-profile`            | 更新個人資料                                                                                        |                                      |
| **Groups（合併成員操作）**                   |
| 10                                           | Groups    | GET    | `/api/v1/groups`                         | 群組列表                                                                                            |                                      |
| 11                                           | Groups    | POST   | `/api/v1/groups`                         | 建立群組                                                                                            |                                      |
| 12                                           | Groups    | GET    | `/api/v1/groups/{id}`                    | 群組詳情                                                                                            |                                      |
| 13                                           | Groups    | PUT    | `/api/v1/groups/{id}`                    | 更新群組                                                                                            |                                      |
| 14                                           | Groups    | DELETE | `/api/v1/groups/{id}`                    | 刪除群組                                                                                            |                                      |
| 15                                           | Groups    | POST   | `/api/v1/groups/{id}/members`            | 加入/邀請成員（依 body 區分）                                                                       | 合併 join/invite                     |
| 16                                           | Groups    | DELETE | `/api/v1/groups/{id}/members/{memberId}` | 離開或移除成員                                                                                      | 合併 leave/remove                    |
| 17                                           | Groups    | PATCH  | `/api/v1/groups/{id}/members/{memberId}` | 更新成員權限                                                                                        |                                      |
| **Inventory（庫存，批次新增/修改暫緩）**     |
| 18                                           | Inventory | GET    | `/api/v1/inventory`                      | 庫存列表，`status` 篩選（expired/expiring-soon/low-stock/frequent/normal），`include=summary,stats` | 取代 expired/frequent/stats 獨立路由 |
| 19                                           | Inventory | GET    | `/api/v1/inventory/{id}`                 | 單一食材詳情                                                                                        |                                      |
| 20                                           | Inventory | POST   | `/api/v1/inventory`                      | 新增食材                                                                                            |                                      |
| 21                                           | Inventory | PUT    | `/api/v1/inventory/{id}`                 | 更新食材                                                                                            |                                      |
| 22                                           | Inventory | DELETE | `/api/v1/inventory/{id}`                 | 刪除食材                                                                                            |                                      |
| 23                                           | Inventory | DELETE | `/api/v1/inventory/batch`                | 批次刪除                                                                                            | 可選；前端可迭代單刪                 |
| 24                                           | Inventory | GET    | `/api/v1/inventory/categories`           | 類別列表                                                                                            |                                      |
| 25                                           | Inventory | GET    | `/api/v1/inventory/settings`             | 取得庫存設定                                                                                        |                                      |
| 26                                           | Inventory | PUT    | `/api/v1/inventory/settings`             | 更新庫存設定                                                                                        |                                      |
| 27                                           | Inventory | GET    | `/api/v1/inventory/summary`              | 庫存摘要                                                                                            | 若用 include 可移除                  |
| **暫緩**                                     | Inventory | POST   | `/api/v1/inventory/batch`                | 批次新增                                                                                            | 先不做                               |
| **暫緩**                                     | Inventory | PUT    | `/api/v1/inventory/batch`                | 批次修改                                                                                            | 先不做                               |
| **Foods（合併 category 查詢）**              |
| 28                                           | Foods     | GET    | `/api/v1/foods`                          | 食材列表，`?category=` 篩選                                                                         | 取代 `/foods/category/{catId}`       |
| 29                                           | Foods     | GET    | `/api/v1/foods/{id}`                     | 食材詳情                                                                                            | 取代 `/foods/category/{catId}/{id}`  |
| 30                                           | Foods     | POST   | `/api/v1/foods`                          | 建立食材                                                                                            |                                      |
| 31                                           | Foods     | PUT    | `/api/v1/foods/{id}`                     | 更新食材                                                                                            |                                      |
| 32                                           | Foods     | DELETE | `/api/v1/foods/{id}`                     | 刪除食材                                                                                            |                                      |
| **Recipes（烹煮改用 PATCH）**                |
| 33                                           | Recipes   | GET    | `/api/v1/recipes`                        | 食譜列表（`category`、`favorite=true`）                                                             |                                      |
| 34                                           | Recipes   | GET    | `/api/v1/recipes/{id}`                   | 食譜詳情                                                                                            |                                      |
| 35                                           | Recipes   | POST   | `/api/v1/recipes/{id}/favorite`          | 加入最愛                                                                                            |                                      |
| 36                                           | Recipes   | DELETE | `/api/v1/recipes/{id}/favorite`          | 取消最愛                                                                                            |                                      |
| 37                                           | Recipes   | PATCH  | `/api/v1/recipes/{id}`                   | 更新狀態 `{ status: 'cooked' }` 等                                                                  | 取代 POST /cook                      |
| 38                                           | Recipes   | POST   | `/api/v1/recipes/plan`                   | 新增餐期計畫                                                                                        |                                      |
| 39                                           | Recipes   | GET    | `/api/v1/recipes/plan`                   | 取得餐期計畫                                                                                        |                                      |
| 40                                           | Recipes   | DELETE | `/api/v1/recipes/plan/{planId}`          | 移除餐期計畫                                                                                        |                                      |
| **Shopping Lists（購買改 PATCH，保留社群）** |
| 41                                           | Shopping  | GET    | `/api/v1/shopping-lists`                 | 清單列表                                                                                            |                                      |
| 42                                           | Shopping  | POST   | `/api/v1/shopping-lists`                 | 建立清單                                                                                            |                                      |
| 43                                           | Shopping  | GET    | `/api/v1/shopping-lists/{id}`            | 清單詳情                                                                                            |                                      |
| 44                                           | Shopping  | PATCH  | `/api/v1/shopping-lists/{id}`            | 更新清單/標記購買 `{ status: 'purchased' }`                                                         | 取代 POST /purchase                  |
| 45                                           | Shopping  | DELETE | `/api/v1/shopping-lists/{id}`            | 刪除清單                                                                                            |                                      |
| 46                                           | Shopping  | GET    | `/api/v1/shopping-lists/{id}/posts`      | 取得貼文                                                                                            | 社群                                 |
| 47                                           | Shopping  | POST   | `/api/v1/shopping-lists/{id}/posts`      | 發佈貼文                                                                                            | 社群                                 |
| 48                                           | Shopping  | POST   | `/api/v1/posts/{postId}/like`            | 按讚貼文                                                                                            | 社群                                 |
| 49                                           | Shopping  | GET    | `/api/v1/posts/{postId}/comments`        | 取得留言                                                                                            | 社群                                 |
| 50                                           | Shopping  | POST   | `/api/v1/posts/{postId}/comments`        | 新增留言                                                                                            | 社群                                 |
| **AI Service**                               |
| 51                                           | AI        | POST   | `/api/v1/ai/analyze-image`               | OCR/影像分析                                                                                        |                                      |
| 52                                           | AI        | POST   | `/api/v1/ai/recipe`                      | AI 產生食譜                                                                                         |                                      |
| **Notifications**                            |
| 53                                           | Notify    | GET    | `/api/v1/notifications`                  | 取得通知設定                                                                                        |                                      |
| 54                                           | Notify    | POST   | `/api/v1/notifications`                  | 建立/更新通知                                                                                       |                                      |
| **LINE Bot**                                 |
| 55                                           | LINE      | POST   | `/api/v1/line/webhook`                   | LINE Webhook                                                                                        |                                      |
| 56                                           | LINE      | POST   | `/api/v1/line/push`                      | 伺服端主動推播                                                                                      |                                      |
| **Media Upload**                             |
| 57                                           | Media     | POST   | `/api/v1/media/upload`                   | 上傳圖片/檔案                                                                                       |                                      |

---

## 1. Auth（使用者認證）

負責註冊、登入、登出、Token 更新、LINE OAuth、個人資料更新。

- `POST /auth/register`：註冊。
- `POST /auth/login`：登入。
- `POST /auth/logout`：清除 Session/Cookie。
- `POST /auth/refresh`：用 refresh token 換 access token。
- `GET /auth/me`：回傳使用者資料，401 視為未登入。
- `GET /auth/check`：僅驗 Token，成功 204/200，失敗 401，適合心跳。
- `GET /auth/line/login` / `GET /auth/line/callback`：LINE OAuth。
- `PUT /auth/update-profile`：更新個人資料。

### User 型別

```typescript
type MembershipTier = 'free' | 'premium' | 'vip';

type User = {
  id: string;
  email?: string;           // LINE 登入可能無 email
  name?: string;
  avatar: string;
  createdAt: Date;
  lineId?: string;          // LINE 專屬
  displayName?: string;     // LINE 專屬
  pictureUrl?: string;      // LINE 專屬
  membershipTier?: MembershipTier; // 會員等級（用於 TopNav 徽章顯示）
};
```

> **Mock 模式**：前端開發環境提供假登入功能（電子郵件帳號），不經過後端 API，僅在前端模擬 Token 發發。

---

## 2. Groups（群組管理）

支援群組 CRUD 及成員管理，將加入/邀請、離開/移除合併。

- `GET /groups`：列表。
- `POST /groups`：建立。
- `GET /groups/{id}`：詳情。
- `PUT /groups/{id}`：更新。
- `DELETE /groups/{id}`：刪除。
- `POST /groups/{id}/members`：加入或邀請（依 body 指定 mode 或邀請碼）。
- `DELETE /groups/{id}/members/{memberId}`：離開或移除。
- `PATCH /groups/{id}/members/{memberId}`：更新權限/角色。

---

## 3. Inventory（庫存管理）

庫存 CRUD、設定、摘要；批次新增/修改暫緩；過期/常用統一用 `status` 篩選。

### FoodItem 欄位

| 欄位                | 類型         | 說明                                |
| ------------------- | ------------ | ----------------------------------- |
| `id`                | string       | UUID                                |
| `name`              | string       | 食材名稱                            |
| `category`          | FoodCategory | 分類                                |
| `quantity`          | number       | 數量                                |
| `unit`              | string       | 單位                                |
| `imageUrl?`         | string       | 圖片 URL                            |
| `purchaseDate`      | string       | 購買日 (YYYY-MM-DD)                 |
| `expiryDate`        | string       | 保存期限 (YYYY-MM-DD)               |
| `lowStockAlert`     | boolean      | 是否啟用低庫存提醒                  |
| `lowStockThreshold` | number       | 低庫存門檻                          |
| `notes?`            | string       | 備註                                |
| `groupId?`          | string       | 所屬群組ID                          |
| `createdAt`         | string       | 建立時間 (ISO 8601)                 |
| `updatedAt?`        | string       | 更新時間 (ISO 8601)                 |
| `attributes?`       | string[]     | 產品屬性，如 ['葉菜根莖類', '有機'] |

### 路由

- `GET /inventory`：列表，支援 `groupId`, `category`, `status`（expired/expiring-soon/low-stock/frequent/normal），`page/limit`，`include=summary,stats`。
- `GET /inventory/{id}`：單筆。
- `POST /inventory`：新增。
- `PUT /inventory/{id}`：更新。
- `DELETE /inventory/{id}`：刪除。
- `DELETE /inventory/batch`：批次刪除（可選）。
- `GET /inventory/categories`：類別列表。
- `GET /inventory/settings` / `PUT /inventory/settings`：設定讀/寫。
- `GET /inventory/summary`：摘要（若列表已 include，則可移除）。
- **暫緩** `POST /inventory/batch`：批次新增。
- **暫緩** `PUT /inventory/batch`：批次修改。

---

## 4. Foods（食材主檔）

以查詢參數取代多層 category 路徑，詳情統一 `/foods/{id}`。

- `GET /foods`：列表，`?category=` 篩選。
- `GET /foods/{id}`：詳情。
- `POST /foods`：新增。
- `PUT /foods/{id}`：更新。
- `DELETE /foods/{id}`：刪除。

---

## 5. Recipes（食譜管理）

烹煮改用 PATCH；收藏列表用查詢參數。

- `GET /recipes`：列表，可用 `category`、`favorite=true`。
- `GET /recipes/{id}`：詳情。
- `POST /recipes/{id}/favorite` / `DELETE /recipes/{id}/favorite`：收藏/取消。
- `PATCH /recipes/{id}`：更新狀態（例如 `{ status: 'cooked' }`）。
- `POST /recipes/plan` / `GET /recipes/plan` / `DELETE /recipes/plan/{planId}`：餐期計畫 CRUD。

---

## 6. Shopping Lists（購物清單）

購買改 PATCH；社群貼文/按讚/留言保留。

- `GET /shopping-lists` / `POST /shopping-lists`：列表/建立。
- `GET /shopping-lists/{id}`：詳情。
- `PATCH /shopping-lists/{id}`：更新，含 `{ status: 'purchased' }` 標記購買。
- `DELETE /shopping-lists/{id}`：刪除。
- `GET /shopping-lists/{id}/posts` / `POST /shopping-lists/{id}/posts`：清單貼文列表/發佈。
- `POST /posts/{postId}/like`：按讚貼文。
- `GET /posts/{postId}/comments` / `POST /posts/{postId}/comments`：留言列表/新增。

---

## 7. AI Service（AI 服務）

- `POST /ai/analyze-image`：上傳圖片做 OCR/食材辨識。
- `POST /ai/recipe`：輸入食材清單產生食譜（可標示實作中）。

---

## 8. Notifications（通知）

- `GET /notifications`：取得通知設定。
- `POST /notifications`：建立/更新通知設定。

---

## 9. LINE Bot

- `POST /line/webhook`：Webhook 入口。
- `POST /line/push`：主動推播。

---

## 10. Media Upload（媒體上傳）

- `POST /media/upload`：上傳圖片或檔案（可回傳 URL）。

---

## 環境變數

| 變數                            | 說明                     | 範例                                   |
| ------------------------------- | ------------------------ | -------------------------------------- |
| `VITE_API_BASE_URL`             | API 基底                 | `http://localhost:3000`                |
| `VITE_USE_MOCK_API`             | 是否使用 Mock            | `true`                                 |
| `VITE_LINE_CLIENT_ID`           | LINE Login Channel ID    | `1234567890`                           |
| `VITE_LINE_REDIRECT_URI`        | LINE Login Callback URL  | `http://localhost:5173/login/callback` |
| `VITE_CLOUDINARY_CLOUD_NAME`    | Cloudinary Cloud Name    | `demo`                                 |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | `fufood_preset`                        |

---

**附註**: 本表為精簡後的完整版本；若未來需要重新開啟批次新增/修改或拆分 summary/stats 獨立路由，可再調整。\*\*\*
