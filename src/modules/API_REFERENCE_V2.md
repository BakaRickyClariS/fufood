# Fufood API 完整參考文件

**版本**: v2.1
**最後更新**: 2025-12-02
**說明**: 本文件統整了 Fufood 專案中所有模組的 API 規格與使用說明，並包含 API 設計規範與優化項目。

---

## 🚀 API 路由總覽表

### 快速索引
- [Auth (9個)](#1️⃣-auth-module-使用者認證模組) | [Groups (10個)](#2️⃣-groups-module-群組管理模組) | [Inventory (14個)](#3️⃣-inventory-module-庫存管理模組)
- [Foods (5個)](#4️⃣-foods-module-食材主檔) | [Recipes (8個)](#5️⃣-recipes-module-食譜管理模組) | [Shopping Lists (6個)](#6️⃣-shopping-lists-module-購物清單模組)
- [AI Service (2個)](#7️⃣-ai-service-module-ai-服務模組) | [Notifications (2個)](#8️⃣-notifications-module-通知設定模組) 
- [LINE Bot (2個)](#9️⃣-line-bot-module) | [Media (1個)](#🔟-media-upload-module-媒體上傳模組)

### 完整 API 清單 (總計 60 個)

| # | 模組 | Method | API Path | 功能說明 | 狀態 |
|---|------|--------|----------|---------|------|
| **Auth Module (使用者認證)** |
| 1 | Auth | POST | `/api/v1/auth/register` | 使用者註冊 | ✅ |
| 2 | Auth | POST | `/api/v1/auth/login` | 使用者登入 | ✅ |
| 3 | Auth | POST | `/api/v1/auth/logout` | 登出・清除 Cookie | ✅ |
| 4 | Auth | POST | `/api/v1/auth/refresh` | 刷新 Access Token | 🆕 |
| 5 | Auth | GET | `/api/v1/auth/me` | 取得目前登入使用者資料 | ✅ |
| 6 | Auth | GET | `/api/v1/auth/check` | 驗證帳號Token | 🆕 |
| 7 | Auth | GET | `/api/v1/auth/line/login` | 導向 LINE OAuth 登入頁 | 🆕 |
| 8 | Auth | GET | `/api/v1/auth/line/callback` | LINE 登入成功後回呼 | 🆕 |
| 9 | Auth | PUT | `/api/v1/auth/update-profile` | 更新使用者基本資料 | 🆕 |
| **Groups Module (群組管理)** |
| 10 | Groups | GET | `/api/v1/groups` | 取得所有我參加的群組 | ✅ |
| 11 | Groups | POST | `/api/v1/groups` | 建立新群組 | ✅ |
| 12 | Groups | GET | `/api/v1/groups/{id}` | 取得單一群組資訊 | 🆕 |
| 13 | Groups | PUT | `/api/v1/groups/{id}` | 更新群組資訊 | ✅ |
| 14 | Groups | DELETE | `/api/v1/groups/{id}` | 刪除群組 | ✅ |
| 15 | Groups | POST | `/api/v1/groups/{id}/invite` | 邀請成員 | ✅ |
| 16 | Groups | POST | `/api/v1/groups/{id}/join` | 加入群組 | 🆕 |
| 17 | Groups | DELETE | `/api/v1/groups/{id}/leave` | 離開群組 | 🆕 |
| 18 | Groups | DELETE | `/api/v1/groups/{id}/remove/{memberId}` | 移除群組成員 | ✅ |
| 19 | Groups | PATCH | `/api/v1/groups/{id}/members/{memberId}` | 更新成員權限 | ✅ |
| **Inventory Module (庫存管理)** |
| 20 | Inventory | GET | `/api/v1/inventory` | 取得庫存列表 (支援分頁/篩選) | ✅ |
| 21 | Inventory | GET | `/api/v1/inventory/summary` | 取得目前庫存概況 | 🆕 |
| 22 | Inventory | GET | `/api/v1/inventory/expired` | 取得已過期食材清單 | 🆕 |
| 23 | Inventory | GET | `/api/v1/inventory/frequent` | 取得常用食材清單 | 🆕 |
| 24 | Inventory | GET | `/api/v1/inventory/stats` | 取得庫存統計(食材進類) | ✅ |
| 25 | Inventory | GET | `/api/v1/inventory/settings` | 取得庫存設定 | 🆕 |
| 26 | Inventory | PUT | `/api/v1/inventory/settings` | 更新庫存管理設定 | 🆕 |
| 27 | Inventory | GET | `/api/v1/inventory/categories` | 取得分類資訊 | ✅ |
| 28 | Inventory | GET | `/api/v1/inventory/{id}` | 取得單一食材詳情 | ✅ |
| 29 | Inventory | POST | `/api/v1/inventory` | 新增食材 | ✅ |
| 30 | Inventory | POST | `/api/v1/inventory/batch` | 批次新增食材 | 🆕 |
| 31 | Inventory | PUT | `/api/v1/inventory/{id}` | 更新食材資訊 | ✅ |
| 32 | Inventory | PUT | `/api/v1/inventory/batch` | 批次更新食材 | 🆕 |
| 33 | Inventory | DELETE | `/api/v1/inventory/{id}` | 刪除食材 | ✅ |
| 34 | Inventory | DELETE | `/api/v1/inventory/batch` | 批次刪除食材 | 🆕 |
| **Foods Module (食材主檔)** |
| 35 | Foods | GET | `/api/v1/foods/category/{catId}` | 取得使用者分類食材 | 🆕 |
| 36 | Foods | GET | `/api/v1/foods/category/{catId}/{id}` | 取得分類內單一食材資訊 | 🆕 |
| 37 | Foods | POST | `/api/v1/foods` | 新增食材(含圖片 URL) | 🆕 |
| 38 | Foods | PUT | `/api/v1/foods/{id}` | 編輯食材資訊 | 🆕 |
| 39 | Foods | DELETE | `/api/v1/foods/{id}` | 刪除食材 | 🆕 |
| **Recipes Module (食譜管理)** |
| 40 | Recipes | GET | `/api/v1/recipes` | 取得所有食譜 | 🆕 |
| 41 | Recipes | GET | `/api/v1/recipes/{id}` | 取得單一食譜詳情 | 🆕 |
| 42 | Recipes | POST | `/api/v1/recipes/{id}/favorite` | 收藏/取消收藏食譜 | 🆕 |
| 43 | Recipes | GET | `/api/v1/recipes/favorites` | 取得收藏食譜清單 | 🆕 |
| 44 | Recipes | POST | `/api/v1/recipes/{id}/cook` | 食譜完成 → 扣除庫存食材 | 🆕 |
| 45 | Recipes | POST | `/api/v1/recipes/plan` | 加入待烹煮計劃 (MealPlan) | 🆕 |
| 46 | Recipes | GET | `/api/v1/recipes/plan` | 取得目前規劃的食譜計畫 | 🆕 |
| 47 | Recipes | DELETE | `/api/v1/recipes/plan/{planId}` | 刪除待烹煮計畫 | 🆕 |
| **Shopping Lists Module (購物清單)** |
| 48 | Shopping | GET | `/api/v1/shopping-lists` | 取得所有購物清單 | 🆕 |
| 49 | Shopping | POST | `/api/v1/shopping-lists` | 建立購物清單 | 🆕 |
| 50 | Shopping | GET | `/api/v1/shopping-lists/{id}` | 取得單一購物清單內容 | 🆕 |
| 51 | Shopping | PUT | `/api/v1/shopping-lists/{id}` | 編輯購物清單 | 🆕 |
| 52 | Shopping | DELETE | `/api/v1/shopping-lists/{id}` | 刪除購物清單 | 🆕 |
| 53 | Shopping | POST | `/api/v1/shopping-lists/{id}/purchase` | 標記清單已購買 → 更新庫存 | 🆕 |
| **AI Service Module (AI 服務)** |
| 54 | AI | POST | `/api/v1/ai/analyze-image` | 上傳圖片 → GPT大模型 (OCR)  | ✅ |
| 55 | AI | POST | `/api/v1/ai/recipe` | 傳入食材清單 → GPT 生成食譜 | 🆕 |
| **Notifications Module (通知設定)** |
| 56 | Notify | GET | `/api/v1/notifications` | 取得使用者通知設定 | 🆕 |
| 57 | Notify | POST | `/api/v1/notifications` | 建立/更新通知設定 | 🆕 |
| **LINE Bot Module** |
| 58 | LINE | POST | `/api/v1/line/webhook` | LINE Bot Webhook | 🆕 |
| 59 | LINE | POST | `/api/v1/line/push` | 伺服器端主動推提醒 | 🆕 |
| **Media Upload Module (媒體上傳)** |
| 60 | Media | POST | `/api/v1/media/upload` | 上傳食材圖片(回傳 URL) | 🆕 |

**圖例**: ✅ 已實作 | 🆕 新增

---

## 📋 目錄

- [API 路由總覽表](#-api-路由總覽表)
- [核心設計規範](#-核心設計規範)
- [1️⃣ Auth Module (使用者認證模組)](#1️⃣-auth-module-使用者認證模組)
- [2️⃣ Groups Module (群組管理模組)](#2️⃣-groups-module-群組管理模組)
- [3️⃣ Inventory Module (庫存管理模組)](#3️⃣-inventory-module-庫存管理模組)
- [4️⃣ Foods Module (食材主檔)](#4️⃣-foods-module-食材主檔)
- [5️⃣ Recipes Module (食譜管理模組)](#5️⃣-recipes-module-食譜管理模組)
- [6️⃣ Shopping Lists Module (購物清單模組)](#6️⃣-shopping-lists-module-購物清單模組)
- [7️⃣ AI Service Module (AI 服務模組)](#7️⃣-ai-service-module-ai-服務模組)
- [8️⃣ Notifications Module (通知設定模組)](#8️⃣-notifications-module-通知設定模組)
- [9️⃣ LINE Bot Module](#9️⃣-line-bot-module)
- [🔟 Media Upload Module (媒體上傳模組)](#🔟-media-upload-module-媒體上傳模組)

---

## 💡 核心設計規範

### 1. 路由命名規範
- **標準前綴**: `/api/v1` (所有 API 統一使用)
- **資源命名**: 使用複數名詞 (如 `groups`, `foods`)
- **動作命名**: 使用標準 HTTP Method，特殊動作使用動詞後綴 (如 `/cook`, `/purchase`)

### 2. 標準查詢參數 (Query Parameters)
所有列表類 API 支援以下標準參數：

```typescript
type StandardQueryParams = {
  // 分頁
  page?: number;      // 頁碼 (預設 1)
  limit?: number;     // 每頁數量 (預設 20, 最大 100)
  
  // 排序
  sortBy?: string;    // 排序欄位 (如 'expiryDate')
  order?: 'asc' | 'desc'; // 排序方向 (預設 'asc')
  
  // 篩選 (依各 API 定義)
  // fields?: string; // 欄位選擇 (如 'id,name,status')
};
```

### 3. 標準錯誤回應
所有 API 發生錯誤時，回傳統一格式：

```typescript
type ApiErrorResponse = {
  code: string;       // 錯誤代碼 (如 'AUTH_001')
  message: string;    // 錯誤訊息
  details?: any;      // 詳細資訊 (如驗證錯誤欄位)
  timestamp: string;  // ISO 8601 時間
};
```

### 4. 狀態碼規範
- `200 OK`: 請求成功
- `201 Created`: 資源建立成功
- `204 No Content`: 請求成功但無回傳內容 (如刪除)
- `400 Bad Request`: 請求格式錯誤
- `401 Unauthorized`: 未認證或 Token 無效
- `403 Forbidden`: 無權限存取
- `404 Not Found`: 資源不存在
- `422 Unprocessable Entity`: 資料驗證失敗
- `429 Too Many Requests`: 請求過於頻繁

---

# 1️⃣ Auth Module (使用者認證模組)

## 概述
負責處理使用者的**身份驗證**、**註冊**與**登入管理**。支援傳統帳號密碼登入及 LINE 第三方登入,並提供完整的 Token 管理與使用者狀態維護。

## API 規格

### 1. register - 使用者註冊
`POST /api/v1/auth/register`

### 2. login - 使用者登入
`POST /api/v1/auth/login`

### 3. logout - 登出
`POST /api/v1/auth/logout`

### 4. refresh - 刷新 Token
`POST /api/v1/auth/refresh`
**請求**: `{ "refreshToken": "..." }`
**回應**: `{ "accessToken": "...", "expiresIn": 3600 }`

### 5. me - 取得個人資料
`GET /api/v1/auth/me`

### 6. check - 驗證 Token
`GET /api/v1/auth/check`

### 7. lineLogin - LINE 登入導向
`GET /api/v1/auth/line/login`

### 8. lineCallback - LINE 登入回呼
`GET /api/v1/auth/line/callback`

### 9. updateProfile - 更新個人資料
`PUT /api/v1/auth/update-profile`

---

# 2️⃣ Groups Module (群組管理模組)

## 概述
提供完整的群組管理功能，支援多人協作管理食材庫存。

## API 規格

### 10-14. 群組 CRUD
- `GET /api/v1/groups`: 列表
- `POST /api/v1/groups`: 建立
- `GET /api/v1/groups/{id}`: 詳情
- `PUT /api/v1/groups/{id}`: 更新
- `DELETE /api/v1/groups/{id}`: 刪除

### 15-19. 成員管理
- `POST /api/v1/groups/{id}/invite`: 邀請
- `POST /api/v1/groups/{id}/join`: 加入 (使用邀請碼)
- `DELETE /api/v1/groups/{id}/leave`: 離開
- `DELETE /api/v1/groups/{id}/remove/{memberId}`: 移除成員
- `PATCH /api/v1/groups/{id}/members/{memberId}`: 更新權限

---

# 3️⃣ Inventory Module (庫存管理模組)

## 概述
核心模組之一，負責管理使用者的食材庫存。

## API 規格

### 20. getInventory - 取得庫存列表
`GET /api/v1/inventory`
支援參數: `?groupId=xxx&status=expiring&page=1&limit=20`

### 21-27. 統計與設定
- `GET /api/v1/inventory/summary`: 概況
- `GET /api/v1/inventory/expired`: 過期清單
- `GET /api/v1/inventory/frequent`: 常用清單
- `GET /api/v1/inventory/stats`: 統計
- `GET /api/v1/inventory/settings`: 設定查詢
- `PUT /api/v1/inventory/settings`: 設定更新
- `GET /api/v1/inventory/categories`: 分類列表

### 28-34. 食材 CRUD 與批次操作
- `GET /api/v1/inventory/{id}`: 詳情
- `POST /api/v1/inventory`: 新增
- `PUT /api/v1/inventory/{id}`: 更新
- `DELETE /api/v1/inventory/{id}`: 刪除
- `POST /api/v1/inventory/batch`: **批次新增** `{ "items": [...] }`
- `PUT /api/v1/inventory/batch`: **批次更新** `{ "items": [...] }`
- `DELETE /api/v1/inventory/batch`: **批次刪除** `{ "ids": [...] }`

---

# 4️⃣ Foods Module (食材主檔)

## 概述
提供食材的參考資料庫，用於標準化食材名稱與分類。

## API 規格
- `GET /api/v1/foods/category/{catId}`: 分類食材
- `GET /api/v1/foods/category/{catId}/{id}`: 食材詳情
- `POST /api/v1/foods`: 新增
- `PUT /api/v1/foods/{id}`: 編輯
- `DELETE /api/v1/foods/{id}`: 刪除

---

# 5️⃣ Recipes Module (食譜管理模組)

## 概述
提供食譜查詢、收藏以及烹煮計畫 (Meal Plan) 功能。

## API 規格
- `GET /api/v1/recipes`: 列表 (支援 `?category=` 篩選)
- `GET /api/v1/recipes/{id}`: **取得單一食譜詳情** 🆕
- `POST /api/v1/recipes/{id}/favorite`: 收藏切換
- `GET /api/v1/recipes/favorites`: 收藏列表
- `POST /api/v1/recipes/{id}/cook`: **烹煮完成** (原 `used`) - 自動扣除庫存
- `POST /api/v1/recipes/plan`: 加入計畫
- `GET /api/v1/recipes/plan`: 取得計畫
- `DELETE /api/v1/recipes/plan/{planId}`: 刪除計畫

---

# 6️⃣ Shopping Lists Module (購物清單模組)

## 概述
管理使用者的購物清單，支援從食譜缺料自動加入。

## API 規格
- `GET /api/v1/shopping-lists`: 列表
- `POST /api/v1/shopping-lists`: 建立
- `GET /api/v1/shopping-lists/{id}`: 詳情
- `PUT /api/v1/shopping-lists/{id}`: 更新
- `DELETE /api/v1/shopping-lists/{id}`: 刪除
- `POST /api/v1/shopping-lists/{id}/purchase`: **購買完成** (原 `checkout`) - 將清單項目轉入庫存

---

# 7️⃣ AI Service Module (AI 服務模組)

## 概述
整合 GPT-4o 或其他 AI 模型，提供影像辨識 (OCR) 與食譜生成服務。

## API 規格

### 53. analyzeImage - 辨識食材影像
`POST /api/v1/ai/analyze-image` (原 `/recipe/analyze-image`)
**功能**: 上傳食材照片，回傳辨識出的食材名稱、數量與建議效期。

### 54. generateRecipe - AI 生成食譜
`POST /api/v1/ai/recipe`
**功能**: 傳入現有食材清單，AI 建議可烹煮的食譜。

---

# 8️⃣ Notifications Module (通知設定模組)

## API 規格
- `GET /api/v1/notifications`: 取得設定
- `POST /api/v1/notifications`: 更新設定

---

# 9️⃣ LINE Bot Module

## API 規格
- `POST /api/v1/line/webhook`: Webhook
- `POST /api/v1/line/push`: 主動推播

---

# 🔟 Media Upload Module (媒體上傳模組)

## API 規格
- `POST /api/v1/media/upload`: 上傳圖片

---

## 環境變數總覽

| 變數名稱 | 說明 | 範例值 |
|---------|------|-------|
| `VITE_API_BASE_URL` | API 基礎路徑 | `http://localhost:3000` |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` |
| `VITE_LINE_CLIENT_ID` | LINE Login Channel ID | `1234567890` |
| `VITE_LINE_REDIRECT_URI` | LINE Login Callback URL | `http://localhost:5173/login/callback` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `demo` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | `fufood_preset` |

---
**文件結束**
