# API 架構分析與重構規劃

**版本**: v1.0  
**日期**: 2025-12-18  
**狀態**: 規劃中

---

## 目錄

- [現況分析](#現況分析)
- [問題識別](#問題識別)
- [重構方案](#重構方案)
- [實作計畫](#實作計畫)
- [驗證計畫](#驗證計畫)

---

## 現況分析

### 環境變數配置

目前系統使用以下環境變數：

| 環境變數 | 用途 | 預設值 |
|---------|------|--------|
| `VITE_API_BASE_URL` | AI API 基底 URL | `/api/v1` 或空字串 |
| `VITE_LINE_API_BASE_URL` | 後端 API 基底 URL | `https://api.fufood.jocelynh.me` |
| `VITE_RECIPE_API_URL` | 食譜 API URL（已棄用？） | - |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary 雲端名稱 | - |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary 上傳預設 | - |

### API 客戶端現況

#### 1. `src/lib/apiClient.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

- **用途**: 主要 API 客戶端，支援完整的 CRUD 操作
- **特性**: 
  - 支援 `credentials: 'include'`（HttpOnly Cookie）
  - 自動處理 JWT Token（透過 `getAuthToken()`）
  - 支援 FormData 上傳
- **使用模組**: `auth` (部分)、`media`

#### 2. `src/services/apiClient.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LINE_API_BASE = import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';
```

- **用途**: 雙 API 客戶端，支援切換 AI API 和後端 API
- **特性**: 
  - 透過 `useLineApi` 參數切換基底 URL
  - 支援 `credentials: 'include'`
- **使用模組**: `recipe`

### 各模組 API 使用情況

| 模組 | API 客戶端 | 基底 URL | 備註 |
|------|-----------|---------|------|
| **auth** | `@/lib/apiClient` + 原生 fetch | `VITE_API_BASE_URL` + `VITE_LINE_API_BASE_URL` | 混用兩個 URL |
| **recipe** | `@/services/apiClient` | `VITE_LINE_API_BASE_URL` | 使用後端 API |
| **inventory** | 型別定義 | - | 尚未實作實際 API |
| **media** | `@/lib/apiClient` | `VITE_API_BASE_URL` | 使用 AI API |
| **food-scan** | 型別定義 | - | 尚未實作實際 API |

### API 端點分類

根據 `API_REFERENCE_V2.md`，API 端點可分為兩類：

#### AI API（使用 `VITE_API_BASE_URL`）

| 端點 | 功能 |
|-----|------|
| `POST /api/v1/ai/analyze-image` | OCR/影像分析 |
| `POST /api/v1/ai/recipe` | AI 產生食譜 |
| `POST /api/v1/media/upload` | 上傳圖片/檔案 |

#### 後端 API（使用 `VITE_LINE_API_BASE_URL` = `https://api.fufood.jocelynh.me`）

| 模組 | 端點數量 | 主要功能 |
|------|---------|---------|
| Auth | 9 | 認證、LINE OAuth、用戶資料 |
| Groups | 8 | 群組管理 |
| Inventory | 10 | 庫存管理 |
| Foods | 5 | 食材主檔 |
| Recipes | 8 | 食譜管理 |
| Shopping Lists | 10 | 購物清單、社群 |
| Notifications | 2 | 通知設定 |
| LINE Bot | 2 | LINE Webhook、推播 |

---

## 問題識別

### 1. API 客戶端重複

存在兩個功能相似的 API 客戶端：
- `src/lib/apiClient.ts`
- `src/services/apiClient.ts`

這導致：
- 維護成本增加
- 功能不一致（如 Token 處理）
- 開發者容易混淆

### 2. 基底 URL 混亂

- `VITE_API_BASE_URL` 預設值不一致（`/api/v1` vs 空字串）
- 部分模組直接硬編碼 LINE API URL
- `authApi.ts` 中多次重複宣告 `LINE_API_BASE`

### 3. API 路徑不一致

- 有些呼叫包含 `/api/v1` 前綴
- 有些模組文檔標示的基底 URL 包含版本前綴，有些不包含

### 4. Mock/Real API 切換機制不統一

- `authApi.ts` 使用 `VITE_USE_MOCK_API` 控制
- 其他模組（如 inventory）使用獨立的 mock 實作

---

## 重構方案

### 方案目標

1. **統一 API 客戶端**: 合併為單一客戶端，支援多個基底 URL
2. **明確分離 API 類型**: AI API vs 後端 API
3. **標準化環境變數**: 清晰的命名和用途

### 環境變數規劃

```bash
# AI API（用於 OCR、食譜生成、媒體上傳）
# 生產環境：https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1
# 本地開發：http://localhost:3000/api/v1
VITE_AI_API_BASE_URL=https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1

# 後端 API（用於認證、庫存、群組等）
VITE_BACKEND_API_BASE_URL=https://api.fufood.jocelynh.me

# Mock 控制
VITE_USE_MOCK_API=true
```

### 統一 API 客戶端設計

```typescript
// src/lib/apiClient.ts
type ApiType = 'ai' | 'backend';

const API_BASES: Record<ApiType, string> = {
  ai: import.meta.env.VITE_AI_API_BASE_URL || '/api/v1',
  backend: import.meta.env.VITE_BACKEND_API_BASE_URL || 'https://api.fufood.jocelynh.me',
};

class UnifiedApiClient {
  private getBaseUrl(apiType: ApiType): string {
    return API_BASES[apiType];
  }

  // GET, POST, PUT, PATCH, DELETE 方法
  // 每個方法接受 apiType 參數
}

// 創建兩個預設實例
export const aiApi = new UnifiedApiClient('ai');
export const backendApi = new UnifiedApiClient('backend');
```

### 模組重構對應

| 模組 | 原 API 客戶端 | 重構後 |
|------|-------------|--------|
| auth | 混用 | `backendApi` |
| recipe | `@/services/apiClient` | `backendApi` |
| inventory | - | `backendApi` |
| media | `@/lib/apiClient` | `aiApi` |
| food-scan (OCR) | - | `aiApi` |
| AI 食譜生成 | - | `aiApi` |

---

## 實作計畫

### 階段一：統一 API 客戶端

#### [MODIFY] [apiClient.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/lib/apiClient.ts)

1. 新增 `ApiType` 型別定義
2. 實作 `API_BASES` 常數物件
3. 重構 `ApiClient` 類別支援多基底 URL
4. 匯出 `aiApi` 和 `backendApi` 實例

#### [DELETE] [apiClient.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/services/apiClient.ts)

移除重複的 API 客戶端，改為從 `@/lib/apiClient` 匯入。

---

### 階段二：更新環境變數

#### [MODIFY] [.env.example](file:///d:/User/Ricky/HexSchool/finalProject/fufood/.env.example)

```diff
- # Backend API base (include version prefix)
- # Example: http://localhost:3000/api/v1
- VITE_RECIPE_API_URL=
+ # AI API（OCR、食譜生成、媒體上傳）
+ VITE_AI_API_BASE_URL=
+
+ # 後端 API（認證、庫存、群組、食譜等）
+ VITE_BACKEND_API_BASE_URL=https://api.fufood.jocelynh.me
```

---

### 階段三：更新各模組 API 實作

#### Auth 模組

**[MODIFY] [authApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/auth/api/authApi.ts)**

- 移除多處 `LINE_API_BASE` 重複宣告
- 使用 `backendApi` 替換原生 fetch 呼叫
- 統一使用 `backendApi` 的認證機制

#### Recipe 模組

**[MODIFY] [recipeApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/services/api/recipeApi.ts)**

- 將 import 從 `@/services/apiClient` 改為 `@/lib/apiClient`
- 使用 `backendApi` 實例

#### Media 模組

**[MODIFY] [mediaApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/media/api/mediaApi.ts)**

- 明確使用 `aiApi` 實例
- 確認媒體上傳端點正確

---

### 階段四：更新文檔

#### [MODIFY] [API_REFERENCE_V2.md](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/API_REFERENCE_V2.md)

更新環境變數說明：
- `VITE_AI_API_BASE_URL`
- `VITE_BACKEND_API_BASE_URL`
- 移除 `VITE_API_BASE_URL` 和 `VITE_LINE_API_BASE_URL`

---

## 驗證計畫

### 自動化測試

> ⚠️ 目前專案中未發現現有的單元測試檔案。建議在重構完成後新增測試。

### 手動測試

#### 1. AI API 測試

| 測試項目 | 步驟 | 預期結果 |
|---------|------|---------|
| 媒體上傳 | 1. 進入相機頁面<br>2. 拍攝/上傳圖片<br>3. 點擊辨識 | 圖片成功上傳並回傳 URL |
| OCR 辨識 | 1. 上傳食材圖片<br>2. 等待辨識結果 | 正確識別食材資訊 |

#### 2. 後端 API 測試

| 測試項目 | 步驟 | 預期結果 |
|---------|------|---------|
| LINE 登入 | 1. 點擊 LINE 登入按鈕<br>2. 完成 LINE 授權<br>3. 返回應用 | 成功登入並顯示用戶頭像 |
| 登出 | 1. 點擊登出按鈕 | 成功清除登入狀態並導向登入頁 |
| 食譜列表 | 1. 進入食譜頁面 | 正確載入食譜列表 |

#### 3. 環境變數切換測試

1. 設定 `VITE_USE_MOCK_API=true`，確認使用 Mock 資料
2. 設定 `VITE_USE_MOCK_API=false`，確認呼叫真實 API

---

## 附錄：當前 API 客戶端程式碼對照

### src/lib/apiClient.ts（主要）

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
// 使用於：auth (部分)、media
```

### src/services/apiClient.ts（待移除）

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LINE_API_BASE = import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';
// 使用於：recipe
```

---

## 風險評估

| 風險 | 影響 | 緩解措施 |
|-----|------|---------|
| API 呼叫失敗 | 功能無法使用 | 漸進式重構，每模組分別測試 |
| 環境變數遺漏 | 部署後無法連線 | 更新部署文檔和 CI/CD 設定 |
| Cookie 認證問題 | 登入失效 | 確保 CORS 設定正確 |

---

## 後續行動

1. **待確認**: 用戶是否同意此重構方案
2. **待確認**: AI API 基底 URL 的正確值
3. **待確認**: 是否需要更新 Vercel 環境變數設定
