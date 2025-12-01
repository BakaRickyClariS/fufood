# Fufood API 完整參考文件

**版本**: v2.0  
**最後更新**: 2025-12-02  
**說明**: 本文件統整了 Fufood 專案中所有模組的 API 規格與使用說明

---

## 🚀 API 路由總覽表

### 快速索引
- [Auth (8個)](#1️⃣-auth-module-使用者認證模組) | [Groups (10個)](#2️⃣-groups-module-群組管理模組) | [Inventory (11個)](#3️⃣-inventory-module-庫存管理模組)
- [Foods (5個)](#4️⃣-foods-module-食材主檔) | [Recipes (7個)](#5️⃣-recipes-module-食譜管理模組) | [Shopping Lists (6個)](#6️⃣-shopping-lists-module-購物清單模組)
- [AI Service (2個)](#7️⃣-ai-service-module-ai-服務模組) | [Notifications (2個)](#8️⃣-notifications-module-通知設定模組) 
- [LINE Bot (2個)](#9️⃣-line-bot-module) | [Media (1個)](#🔟-media-upload-module-媒體上傳模組)

### 完整 API 清單 (總計 52 個)

| # | 模組 | Method | API Path | 功能說明 | 狀態 |
|---|------|--------|----------|---------|------|
| **Auth Module (使用者認證)** |
| 1 | Auth | POST | `/api/v1/auth/register` | 使用者註冊 | ✅ |
| 2 | Auth | POST | `/api/v1/auth/login` | 使用者登入 | ✅ |
| 3 | Auth | POST | `/api/v1/auth/logout` | 登出・清除 Cookie | ✅ |
| 4 | Auth | GET | `/api/v1/auth/me` | 取得目前登入使用者資料 | ✅ |
| 5 | Auth | GET | `/api/v1/auth/check` | 驗證帳號Token | 🆕 |
| 6 | Auth | GET | `/api/v1/auth/line/login` | 導向 LINE OAuth 登入頁 | 🆕 |
| 7 | Auth | GET | `/api/v1/auth/line/callback` | LINE 登入成功後回呼 | 🆕 |
| 8 | Auth | PUT | `/api/v1/auth/update-profile` | 更新使用者基本資料 | 🆕 |
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
| 20 | Inventory | GET | `/api/v1/inventory` | 取得庫存列表 | ✅ |
| 21 | Inventory | GET | `/api/v1/inventory/summary` | 取得目前庫存概況 | 🆕 |
| 22 | Inventory | GET | `/api/v1/inventory/expired` | 取得已過期食材清單 | 🆕 |
| 23 | Inventory | GET | `/api/v1/inventory/frequent` | 取得常用食材清單 | 🆕 |
| 24 | Inventory | GET | `/api/v1/inventory/stats` | 取得庫存統計(食材進類) | ✅ |
| 25 | Inventory | GET | `/api/v1/inventory/settings` | 取得庫存設定 | 🆕 |
| 26 | Inventory | PUT | `/api/v1/inventory/settings` | 更新庫存管理設定 | 🆕 |
| 27 | Inventory | GET | `/api/v1/inventory/categories` | 取得分類資訊 | ✅ |
| 28 | Inventory | GET | `/api/v1/inventory/{id}` | 取得單一食材詳情 | ✅ |
| 29 | Inventory | POST | `/api/v1/inventory` | 新增食材 (整合自 food-items) | ✅ |
| 30 | Inventory | PUT | `/api/v1/inventory/{id}` | 更新食材資訊 | ✅ |
| 31 | Inventory | DELETE | `/api/v1/inventory/{id}` | 刪除食材 | ✅ |
| **Foods Module (食材主檔)** |
| 32 | Foods | GET | `/api/v1/foods/category/{catId}` | 取得使用者分類食材 | 🆕 |
| 33 | Foods | GET | `/api/v1/foods/category/{catId}/{id}` | 取得分類內單一食材資訊 | 🆕 |
| 34 | Foods | POST | `/api/v1/foods` | 新增食材(含圖片 URL) | 🆕 |
| 35 | Foods | PUT | `/api/v1/foods/{id}` | 編輯食材資訊 | 🆕 |
| 36 | Foods | DELETE | `/api/v1/foods/{id}` | 刪除食材 | 🆕 |
| **Recipes Module (食譜管理)** |
| 37 | Recipes | GET | `/api/v1/recipes` | 取得所有食譜(按照菜系類別排序) | 🆕 |
| 38 | Recipes | POST | `/api/v1/recipes/{id}/favorite` | 收藏/取消收藏食譜 | 🆕 |
| 39 | Recipes | GET | `/api/v1/recipes/favorites` | 取得收藏食譜清單 | 🆕 |
| 40 | Recipes | POST | `/api/v1/recipes/{id}/used` | 食譜完成 → 扣除庫存食材 | 🆕 |
| 41 | Recipes | POST | `/api/v1/recipes/plan` | 加入待烹煮計劃 (MealPlan) | 🆕 |
| 42 | Recipes | GET | `/api/v1/recipes/plan` | 取得目前規劃的食譜計畫(烹煮意計劃) | 🆕 |
| 43 | Recipes | DELETE | `/api/v1/recipes/plan/{planId}` | 刪除待烹煮計畫 | 🆕 |
| **Shopping Lists Module (購物清單)** |
| 44 | Shopping | GET | `/api/v1/shopping-lists` | 取得所有購物清單 | 🆕 |
| 45 | Shopping | POST | `/api/v1/shopping-lists` | 建立購物清單 | 🆕 |
| 46 | Shopping | GET | `/api/v1/shopping-lists/{id}` | 取得單一購物清單內容 | 🆕 |
| 47 | Shopping | PUT | `/api/v1/shopping-lists/{id}` | 編輯購物清單 | 🆕 |
| 48 | Shopping | DELETE | `/api/v1/shopping-lists/{id}` | 刪除購物清單 | 🆕 |
| 49 | Shopping | POST | `/api/v1/shopping-lists/checkout` | 標記已購買項目 → 更新庫存 | 🆕 |
| **AI Service Module (AI 服務)** |
| 50 | AI | POST | `/recipe/analyze-image` | 上傳圖片 → GPT大模型 (OCR)  | ✅ |
| 51 | AI | POST | `/api/v1/ai/recipe` | 傳入食材清單 → GPT 生成食譜 | 🆕 |
| **Notifications Module (通知設定)** |
| 52 | Notify | GET | `/api/v1/notifications` | 取得使用者通知設定 | 🆕 |
| 53 | Notify | POST | `/api/v1/notifications` | 建立/更新通知設定 | 🆕 |
| **LINE Bot Module** |
| 54 | LINE | POST | `/api/v1/line/webhook` | LINE Bot Webhook (接收訊息事件) | 🆕 |
| 55 | LINE | POST | `/api/v1/line/push` | 伺服器端主動推提醒 | 🆕 |
| **Media Upload Module (媒體上傳)** |
| 56 | Media | POST | `/api/v1/media/upload` | 上傳食材圖片(回傳 URL) | 🆕 |

**圖例**: ✅ 已實作 | 🆕 新增

---

## 📋 目錄

- [API 路由總覽表](#-api-路由總覽表)
- [核心設計說明](#-核心設計說明)
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
- [環境變數總覽](#環境變數總覽)

---

## 💡 核心設計說明

### 路由命名規範
- **標準前綴**: `/api/v1` (所有 API 統一使用)
- **例外**: `/recipe/analyze-image` (保持原路由名稱)

### Foods vs Inventory 職責劃分

#### 📦 Inventory (庫存) - 我的食材
- **用途**: 記錄使用者實際擁有的食材
- **包含**: 數量、購買日期、效期、狀態追蹤
- **資料表**: `inventory` (user_id, food_name, quantity, expiry_date...)
- **API 前綴**: `/api/v1/inventory`

#### 🍎 Foods (食材主檔) - 食材名錄
- **用途**: 系統維護的食材參考資料庫 (可選實作)
- **包含**: 食材名稱、分類、預設圖片、營養資訊
- **資料表**: `foods` (name, category, default_unit...)
- **API 前綴**: `/api/v1/foods`
- **實作建議**: 初期可不建立,中後期從 inventory 自動提取建立

---

# 1 Auth Module (使用者認證模組)

## 概述
負責處理使用者的**身份驗證**、**註冊**與**登入管理**。支援傳統帳號密碼登入及 LINE 第三方登入,並提供完整的 Token 管理與使用者狀態維護。

## 核心型別

### User (使用者資料)
```typescript
export type User = {
  id: string;
  email: string;
  name?: string;
  avatar: string;       // 頭像 URL 或顏色
  createdAt: Date;
};
```

### AuthToken (認證 Token)
```typescript
export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;    // Token 有效期 (秒)
};
```

### LoginCredentials (登入憑證)
```typescript
export type LoginCredentials = {
  email: string;
  password: string;
};
```

### RegisterData (註冊資料)
```typescript
export type RegisterData = {
  email: string;
  password: string;
  name?: string;
};
```

## API 規格

### 1. register - 使用者註冊

#### 端點
```
POST /api/v1/auth/register
```

#### 請求格式
```typescript
type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
};
```

#### 請求範例
```json
{
  \"email\": \"newuser@example.com\",
  \"password\": \"password123\",
  \"name\": \"李四\",
  \"avatar\": \"bg-green-200\"
}
```

#### 回應格式
```typescript
type RegisterResponse = {
  user: User;
  token: AuthToken;
};
```

#### 回應範例
```json
{
  \"user\": {
    \"id\": \"user-002\",
    \"email\": \"newuser@example.com\",
    \"name\": \"李四\",
    \"avatar\": \"bg-green-200\",
    \"createdAt\": \"2025-12-01T11:00:00.000Z\"
  },
  \"token\": {
    \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",
    \"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",
    \"expiresIn\": 3600
  }
}
```

---


# 2️⃣ Groups Module (群組管理模組)

## 概述
提供完整的群組管理功能，支援多人協作管理食材庫存。包含群組的建立、成員邀請、權限管理等功能。

## 核心型別

### Group (群組)
```typescript
export type Group = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
};
```

### GroupMember (群組成員)
```typescript
export type GroupMember = {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  user?: User; // 關聯的使用者資料
};
```

## API 規格

### 10. getGroups - 取得所有群組
```
GET /api/v1/groups
```
取得當前使用者所屬的所有群組列表。

### 11. createGroup - 建立新群組
```
POST /api/v1/groups
```
**請求格式**:
```json
{
  "name": "我的家庭廚房",
  "description": "家裡的共用冰箱"
}
```

### 12. getGroup - 取得單一群組資訊
```
GET /api/v1/groups/{id}
```

### 13. updateGroup - 更新群組資訊
```
PUT /api/v1/groups/{id}
```

### 14. deleteGroup - 刪除群組
```
DELETE /api/v1/groups/{id}
```

### 15. inviteMember - 邀請成員
```
POST /api/v1/groups/{id}/invite
```
**請求格式**:
```json
{
  "email": "friend@example.com",
  "role": "editor"
}
```

### 16. joinGroup - 加入群組
```
POST /api/v1/groups/{id}/join
```
**請求格式**:
```json
{
  "inviteCode": "INV-123456"
}
```

### 17. leaveGroup - 離開群組
```
DELETE /api/v1/groups/{id}/leave
```

### 18. removeMember - 移除群組成員
```
DELETE /api/v1/groups/{id}/remove/{memberId}
```

### 19. updateMemberRole - 更新成員權限
```
PATCH /api/v1/groups/{id}/members/{memberId}
```
**請求格式**:
```json
{
  "role": "admin"
}
```

---

# 3️⃣ Inventory Module (庫存管理模組)

## 概述
核心模組之一，負責管理使用者的食材庫存。整合了原有的 `food-items` 功能，提供完整的庫存追蹤、效期管理與狀態監控。

## 核心型別

### InventoryItem (庫存項目)
```typescript
export type InventoryItem = {
  id: string;
  groupId: string;
  foodName: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  purchaseDate: Date;
  category: string;
  status: 'normal' | 'expiring' | 'expired' | 'low-stock';
  imageUrl?: string;
  notes?: string;
};
```

## API 規格

### 20. getInventory - 取得庫存列表
```
GET /api/v1/inventory
```
支援篩選參數: `?groupId=xxx&status=expiring`

### 21. getSummary - 取得目前庫存概況
```
GET /api/v1/inventory/summary
```
回傳各狀態的數量統計 (如: 即將過期 3 項, 已過期 1 項)。

### 22. getExpired - 取得已過期食材清單
```
GET /api/v1/inventory/expired
```

### 23. getFrequent - 取得常用食材清單
```
GET /api/v1/inventory/frequent
```
基於歷史使用記錄分析。

### 24. getStats - 取得庫存統計
```
GET /api/v1/inventory/stats
```
按分類統計庫存分佈。

### 25. getSettings - 取得庫存設定
```
GET /api/v1/inventory/settings
```

### 26. updateSettings - 更新庫存管理設定
```
PUT /api/v1/inventory/settings
```
設定如: 過期前幾天通知、低庫存閾值等。

### 27. getCategories - 取得分類資訊
```
GET /api/v1/inventory/categories
```

### 28. getItem - 取得單一食材詳情
```
GET /api/v1/inventory/{id}
```

### 29. addItem - 新增食材
```
POST /api/v1/inventory
```
**請求格式**:
```json
{
  "foodName": "蘋果",
  "quantity": 5,
  "unit": "個",
  "expiryDate": "2025-12-31",
  "category": "fruit",
  "groupId": "group-123"
}
```

### 30. updateItem - 更新食材資訊
```
PUT /api/v1/inventory/{id}
```

### 31. deleteItem - 刪除食材
```
DELETE /api/v1/inventory/{id}
```

---

# 4️⃣ Foods Module (食材主檔)

## 概述
提供食材的參考資料庫，用於標準化食材名稱與分類。此模組為選擇性實作，可輔助使用者快速輸入。

## API 規格

### 32. getCategoryFoods - 取得使用者分類食材
```
GET /api/v1/foods/category/{catId}
```

### 33. getFoodDetail - 取得分類內單一食材資訊
```
GET /api/v1/foods/category/{catId}/{id}
```

### 34. createFood - 新增食材至主檔
```
POST /api/v1/foods
```

### 35. updateFood - 編輯食材資訊
```
PUT /api/v1/foods/{id}
```

### 36. deleteFood - 刪除食材
```
DELETE /api/v1/foods/{id}
```

---

# 5️⃣ Recipes Module (食譜管理模組)

## 概述
提供食譜查詢、收藏以及烹煮計畫 (Meal Plan) 功能。可與庫存連動，烹煮完成後自動扣除食材。

## API 規格

### 37. getRecipes - 取得所有食譜
```
GET /api/v1/recipes
```

### 38. toggleFavorite - 收藏/取消收藏食譜
```
POST /api/v1/recipes/{id}/favorite
```

### 39. getFavorites - 取得收藏食譜清單
```
GET /api/v1/recipes/favorites
```

### 40. cookRecipe - 食譜完成 (扣除庫存)
```
POST /api/v1/recipes/{id}/used
```
**功能**: 標記食譜已烹煮，系統將自動計算所需食材並從庫存中扣除。

### 41. addToPlan - 加入待烹煮計劃
```
POST /api/v1/recipes/plan
```

### 42. getPlan - 取得目前規劃的食譜計畫
```
GET /api/v1/recipes/plan
```

### 43. deletePlan - 刪除待烹煮計畫
```
DELETE /api/v1/recipes/plan/{planId}
```

---

# 6️⃣ Shopping Lists Module (購物清單模組)

## 概述
管理使用者的購物清單，支援從食譜缺料自動加入，並可於購買完成後一鍵轉入庫存。

## API 規格

### 44. getLists - 取得所有購物清單
```
GET /api/v1/shopping-lists
```

### 45. createList - 建立購物清單
```
POST /api/v1/shopping-lists
```

### 46. getList - 取得單一購物清單內容
```
GET /api/v1/shopping-lists/{id}
```

### 47. updateList - 編輯購物清單
```
PUT /api/v1/shopping-lists/{id}
```

### 48. deleteList - 刪除購物清單
```
DELETE /api/v1/shopping-lists/{id}
```

### 49. checkout - 標記已購買 (更新庫存)
```
POST /api/v1/shopping-lists/checkout
```
**功能**: 將購物清單中標記為「已買」的項目自動新增至 Inventory 模組。

---

# 7️⃣ AI Service Module (AI 服務模組)

## 概述
整合 GPT-4o 或其他 AI 模型，提供影像辨識 (OCR) 與食譜生成服務。

## API 規格

### 50. analyzeImage - 辨識食材影像 (OCR)
```
POST /recipe/analyze-image
```
**注意**: 此路由保持原有名稱，不使用 `/api/v1` 前綴。
**功能**: 上傳食材照片，回傳辨識出的食材名稱、數量與建議效期。

### 51. generateRecipe - AI 生成食譜
```
POST /api/v1/ai/recipe
```
**功能**: 傳入現有食材清單，AI 建議可烹煮的食譜。

---

# 8️⃣ Notifications Module (通知設定模組)

## 概述
管理使用者的通知偏好，如過期提醒、低庫存通知等。

## API 規格

### 52. getSettings - 取得通知設定
```
GET /api/v1/notifications
```

### 53. updateSettings - 更新通知設定
```
POST /api/v1/notifications
```

---

# 9️⃣ LINE Bot Module

## 概述
處理與 LINE Messaging API 的整合，包括 Webhook 事件接收與主動推播。

## API 規格

### 54. webhook - LINE Bot Webhook
```
POST /api/v1/line/webhook
```
接收 LINE 平台傳來的事件 (訊息、加入好友等)。

### 55. pushMessage - 主動推播提醒
```
POST /api/v1/line/push
```
伺服器端觸發，向特定使用者發送 LINE 訊息 (如過期提醒)。

---

# 🔟 Media Upload Module (媒體上傳模組)

## 概述
處理圖片與媒體檔案的上傳，通常整合 Cloudinary 或 S3。

## API 規格

### 56. uploadImage - 上傳圖片
```
POST /api/v1/media/upload
```
**功能**: 上傳圖片檔案，回傳公開存取的 URL。

---

# 環境變數總覽

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
