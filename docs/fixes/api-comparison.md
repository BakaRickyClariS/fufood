# API 差異分析報告

**文件建立日期**: 2025-12-02  
**目的**: 比較目前專案 API 文件與實際規劃的 API 清單之間的差異

---

## 📊 比較總覽

### 統計數據

| 類別 | 規劃數量 | 已記錄數量 | 差異 |
|------|---------|-----------|------|
| **Auth** | 8 | 5 | -3 |
| **Groups** | 7 | 8 | +1 |
| **Notifications** | 2 | 0 | -2 |
| **LINE Bot** | 2 | 0 | -2 |
| **AI Service** | 2 | 0 | -2 |
| **Recipes** | 7 | 0 | -7 |
| **Inventory** | 6 | 8 | +2 |
| **Shopping Lists** | 6 | 0 | -6 |
| **Media Upload** | 1 | 0 | -1 |
| **Foods** | 4 | 2 | -2 |
| **總計** | **45** | **23** | **-22** |

---

## 🔍 詳細差異分析

### 1️⃣ Auth Module (使用者認證模組)

#### ✅ 已記錄 (5個)
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/line` - LINE 登入
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 取得當前使用者

#### ❌ 缺少記錄 (3個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/auth/check` | GET | 驗證帳號Token | 🔴 高 |
| `/v1/auth/line/login` | GET | 導向 LINE OAuth 登入頁 | 🟡 中 |
| `/v1/auth/line/callback` | GET | LINE 登入成功後回呼 | 🟡 中 |
| `/v1/auth/update-profile` | PUT | 更新使用者基本資料 | 🟡 中 |

#### 🔧 差異說明
- 目前文件中 LINE 登入僅記錄為 `POST /api/auth/line`
- 實際規劃使用標準 OAuth 流程,包含 `/line/login` 和 `/line/callback`
- 缺少 Token 驗證端點
- 缺少使用者資料更新端點

---

### 2️⃣ Groups Module (群組管理模組)

#### ✅ 已記錄 (8個)
- `GET /api/groups` - 取得所有群組
- `GET /api/groups/:groupId/members` - 取得群組成員
- `POST /api/groups` - 建立群組
- `PUT /api/groups/:id` - 更新群組
- `DELETE /api/groups/:id` - 刪除群組
- `POST /api/groups/:groupId/members` - 邀請成員
- `DELETE /api/groups/:groupId/members/:memberId` - 移除成員
- `PATCH /api/groups/:groupId/members/:memberId` - 更新成員權限

#### ❌ 缺少記錄 (但在規劃中)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/groups/{id}` | GET | 取得單一群組資訊 | 🟡 中 |
| `/v1/groups/{id}/invite` | POST | 邀請成員 | 🟢 低 (已有類似) |
| `/v1/groups/{id}/join` | POST | 加入群組 | 🟡 中 |
| `/v1/groups/{id}/leave` | DELETE | 離開群組 | 🟡 中 |

#### ⚠️ 多記錄但未在規劃中
- `PUT /api/groups/:id` - 更新群組 (規劃中未明確列出)
- `PATCH /api/groups/:groupId/members/:memberId` - 更新成員權限 (規劃中未明確列出)

#### 🔧 差異說明
- 文件使用 `/api/groups/:groupId/members` 邀請成員
- 規劃使用 `/v1/groups/{id}/invite`
- 規劃有獨立的「加入」和「離開」端點,更符合 RESTful 設計

---

### 3️⃣ **Notifications Module (通知設定) - 未記錄**

#### ❌ 完全缺少 (2個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/notifications` | GET | 取得使用者通知設定 | 🟡 中 |
| `/v1/notifications` | POST | 建立/更新通知設定 | 🟡 中 |

#### 🔧 建議
- 新增 Notifications Module
- 定義通知設定的資料結構(LINE 推播、Email 通知等)

---

### 4️⃣ **LINE Bot Module - 未記錄**

#### ❌ 完全缺少 (2個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/line/webhook` | POST | LINE Bot Webhook (接收訊息事件) | 🔴 高 |
| `/v1/line/push` | POST | 伺服器端主動推提醒 | 🟡 中 |

#### 🔧 建議
- 新增 LINE Bot Module
- 定義 Webhook 事件處理邏輯
- 定義主動推播訊息格式

---

### 5️⃣ **AI Service Module - 未記錄**

#### ❌ 完全缺少 (2個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/ai/vision` | POST | 上傳圖片 → GPT大模型 | 🔴 高 |
| `/v1/ai/recipe` | POST | 傳入食材清單 → GPT 生成食譜 | 🟡 中 |

#### 🔧 差異說明
- 目前 Food Scan Module 使用 `/recipe/analyze-image`
- 規劃中使用更通用的 `/v1/ai/vision` 端點
- 新增了 AI 生成食譜的功能

#### 🔧 建議
- 統一 AI 服務端點命名
- 建議使用 `/v1/ai/vision` 取代 `/recipe/analyze-image`

---

### 6️⃣ **Recipes Module (食譜管理) - 未記錄**

#### ❌ 完全缺少 (7個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/recipes` | GET | 取得所有食譜(按照菜系類別排序) | 🔴 高 |
| `/v1/recipes/{id}/favorite` | POST | 收藏/取消收藏食譜 | 🟡 中 |
| `/v1/recipes/favorites` | GET | 取得收藏食譜清單 | 🟡 中 |
| `/v1/recipes/{id}/used` | POST | 食譜完成 → 扣除庫存食材 | 🔴 高 |
| `/v1/recipes/plan` | POST | 加入待烹煮計劃 (MealPlan) | 🟡 中 |
| `/v1/recipes/plan` | GET | 取得目前規劃的食譜計畫 | 🟡 中 |
| `/v1/recipes/plan/{planId}` | DELETE | 刪除待烹煮計畫 | 🟢 低 |

#### 🔧 建議
- **緊急**: 新增完整的 Recipes Module
- 這是核心功能之一,目前完全缺少文件
- 需定義食譜資料結構、MealPlan 結構

---

### 7️⃣ Inventory Module (庫存管理模組)

#### ✅ 已記錄 (8個)
- `GET /api/inventory` - 取得庫存列表
- `GET /api/inventory/:id` - 取得單一食材
- `POST /api/inventory` - 新增食材
- `PUT /api/inventory/:id` - 更新食材
- `DELETE /api/inventory/:id` - 刪除食材
- `POST /api/inventory/batch` - 批次操作
- `GET /api/inventory/stats` - 取得統計資訊
- `GET /api/inventory/categories` - 取得分類資訊

#### ❌ 缺少記錄 (但在規劃中)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/inventory/summary` | GET | 取得目前庫存概況 | 🟡 中 |
| `/v1/inventory/expired` | GET | 取得已過期食材清單 | 🔴 高 |
| `/v1/inventory/frequent` | GET | 取得常用食材清單 | 🟢 低 |
| `/v1/inventory/settings` | GET | 取得庫存設定 | 🟢 低 |
| `/v1/inventory/settings` | PUT | 更新庫存管理設定 | 🟢 低 |

#### ⚠️ 多記錄但未在規劃中
- `POST /api/inventory/batch` - 批次操作 (規劃中未明確列出)
- `GET /api/inventory/categories` - 取得分類資訊 (規劃中未明確列出)

#### 🔧 差異說明
- 文件有 `batch` 和 `categories` 端點,但規劃中未列出
- 規劃中有更細緻的查詢端點 (summary, expired, frequent)
- 建議保留兩邊的優點,合併使用

---

### 8️⃣ **Shopping Lists Module (購物清單) - 未記錄**

#### ❌ 完全缺少 (6個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/shopping-lists` | GET | 取得所有購物清單 | 🟡 中 |
| `/v1/shopping-lists` | POST | 建立購物清單 | 🟡 中 |
| `/v1/shopping-lists/{id}` | GET | 取得單一購物清單內容 | 🟡 中 |
| `/v1/shopping-lists/{id}` | PUT | 編輯購物清單 | 🟡 中 |
| `/v1/shopping-lists/{id}` | DELETE | 刪除購物清單 | 🟢 低 |
| `/v1/shopping-lists/checkout` | POST | 標記已購買項目 → 更新庫存 | 🔴 高 |

#### 🔧 建議
- **重要**: 新增完整的 Shopping Lists Module
- 這是重要功能,與 Inventory 緊密整合
- `/checkout` 端點特別重要,連結購物清單與庫存

---

### 9️⃣ **Media Upload Module - 未記錄**

#### ❌ 完全缺少 (1個)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/media/upload` | POST | 上傳食材圖片(回傳 URL) | 🟡 中 |

#### 🔧 差異說明
- 目前 Food Scan Module 直接使用 Cloudinary 前端上傳
- 規劃中有獨立的媒體上傳端點
- 建議評估: 前端直傳 vs 後端代為上傳

---

### 🔟 Foods Module (食材管理)

#### ✅ 已記錄 (部分在 Food Scan Module)
- `POST /food-items` - 新增食材 (submitFoodItem)
- ⚠️ 其他 CRUD 標註為「未實作」

#### ❌ 缺少記錄 (但在規劃中)
| API Path | Method | 功能說明 | 優先級 |
|----------|--------|---------|--------|
| `/v1/foods/category/{catId}` | GET | 取得使用者分類食材 | 🟡 中 |
| `/v1/foods/category/{catId}/{id}` | GET | 取得分類內單一食材資訊 | 🟢 低 |
| `/v1/foods` | POST | 新增食材(含圖片 URL) | 🔴 高 |
| `/v1/foods/{id}` | PUT | 編輯食材資訊 | 🔴 高 |
| `/v1/foods/{id}` | DELETE | 刪除食材 | 🟡 中 |

#### 🔧 差異說明
- 目前 Foods 與 Inventory 的界線不清晰
- 規劃中有獨立的 Foods 端點,按分類查詢
- 建議釐清: Foods vs Inventory 的職責劃分

---

## 🎯 優先級建議

### 🔴 高優先級 (需立即補充文件)
1. **Recipes Module** (7個 API) - 核心功能完全缺失
2. **AI Service Module** (`/v1/ai/vision`) - 與 Food Scan 功能重疊
3. **Shopping Lists Module** (特別是 `/checkout`) - 與庫存整合的關鍵
4. **LINE Bot Webhook** - 通知功能的基礎
5. **Foods CRUD** - 基本的增刪改查功能

### 🟡 中優先級
1. **Notifications Module** - 使用者體驗相關
2. **Inventory 查詢端點** (summary, expired, frequent)
3. **Auth 額外端點** (check, update-profile)
4. **Groups 端點** (join, leave)

### 🟢 低優先級
1. **Inventory Settings** - 進階設定功能
2. **LINE Push** - 主動推播
3. **其他細節端點**

---

## 📝 路由命名差異

### 目前使用的格式
- `/api/auth/*`
- `/api/groups/*`
- `/api/inventory/*`
- `/recipe/analyze-image`
- `/food-items`

### 規劃使用的格式
- `/v1/auth/*`
- `/v1/groups/*`
- `/v1/inventory/*`
- `/v1/ai/*`
- `/v1/recipes/*`
- `/v1/foods/*`
- `/v1/shopping-lists/*`
- `/v1/notifications/*`
- `/v1/line/*`
- `/v1/media/*`

### 🔧 建議統一方案
**採用版本化的 API 路由**: `/v1/*`

**優點**:
- 方便未來 API 版本升級 (v2, v3)
- 更清晰的模組劃分
- 符合業界最佳實踐

**需要更新的模組**:
- ✅ 統一使用 `/v1` 前綴
- ✅ 將 `/recipe/analyze-image` 改為 `/v1/ai/vision`
- ✅ 將 `/food-items` 整合至 `/v1/foods` 或 `/v1/inventory`

---

## 🚀 後續行動建議

### 階段一: 文件補充 (1-2天)
1. 新增缺失的模組 README:
   - [ ] `src/modules/recipes/README.md`
   - [ ] `src/modules/shopping-lists/README.md`
   - [ ] `src/modules/notifications/README.md`
   - [ ] `src/modules/line-bot/README.md`
   - [ ] `src/modules/ai-service/README.md`
   - [ ] `src/modules/media/README.md`

2. 更新現有模組 README:
   - [ ] `auth/README.md` - 補充缺失的 4 個端點
   - [ ] `groups/README.md` - 補充 join/leave 端點
   - [ ] `inventory/README.md` - 補充查詢端點
   - [ ] `food-scan/README.md` - 重新命名為 `foods` 並整合

3. 更新 `src/modules/API_REFERENCE.md`
   - [ ] 新增所有缺失的 API
   - [ ] 統一路由格式為 `/v1/*`

### 階段二: 路由標準化 (3-5天)
1. 統一所有 API 使用 `/v1` 前綴
2. 更新所有 API 實作檔案
3. 更新前端呼叫的所有端點

### 階段三: 實作缺失功能 (視專案進度)
1. 優先實作 Recipes Module
2. 優先實作 Shopping Lists Module
3. 其他功能依優先級逐步實作

---

## 📌 注意事項

1. **Foods vs Inventory 職責劃分需釐清**
   - 建議: Foods = 食材主檔 (基本資料、分類)
   - 建議: Inventory = 庫存記錄 (數量、效期、購買日期)

2. **API 版本化策略**
   - 建議所有新 API 使用 `/v1` 前綴
   - 舊 API 可保留別名,逐步遷移

3. **Mock 資料一致性**
   - 新增的模組都需要對應的 Mock API
   - 確保 `VITE_USE_MOCK_API=true` 時所有 API 都可用

---

**文件結束**
