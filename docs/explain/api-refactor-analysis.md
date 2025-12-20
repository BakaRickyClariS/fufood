# API 重構與圖片上傳遷移分析報告

**日期**: 2025-12-19  
**分支**: `Feature-connect-and-sort-ai-api`  
**分析目的**: 比較 dev 分支合併後的 API 重構變更與圖片上傳遷移需求

---

## 📋 摘要

| 項目 | 狀態 | 說明 |
|------|------|------|
| API Client 重構 | ✅ 已完成 | 統一為 `aiApi` + `backendApi` 雙實例架構 |
| 圖片上傳 (`uploadApi.ts`) | ✅ **已刪除** | 功能已整合至 `mediaApi.ts` |
| 圖片上傳 (`mediaApi.ts`) | ✅ **已更新** | 使用 `aiApi`，支援 File/Blob |
| `useImageUpload.ts` | ✅ **已更新** | 改用 `mediaApi` |

> [!TIP]
> 後端 AI API 規格已產出至 [ai_media_api_spec.md](../backend/ai_media_api_spec.md)



## 🔍 詳細分析

### 1. Dev 分支 API 重構內容

從 PR `#76 Feature-api-client-refactor` 合併的主要變更：

#### 新的 API 架構 (`src/api/client.ts`)

```typescript
// 兩個獨立的 API 實例
export const aiApi = new ApiClient('ai');       // AI 服務
export const backendApi = new ApiClient('backend'); // 後端服務

// 向後相容（已標記棄用）
/** @deprecated 請使用 aiApi 或 backendApi */
export const apiClient = aiApi;
```

#### 環境變數配置

| 變數 | 用途 | 預設值 |
|------|------|--------|
| `VITE_AI_API_BASE_URL` | AI 服務 (OCR、食譜生成、**媒體上傳**) | `/api/v1` |
| `VITE_BACKEND_API_BASE_URL` | 後端服務 (認證、庫存等) | `https://api.fufood.jocelynh.me` |

#### 已遷移的模組

| 檔案 | Client | 狀態 |
|------|--------|------|
| `auth/api/*.ts` | `backendApi` | ✅ |
| `inventory/api/*.ts` | `backendApi` | ✅ |
| `groups/api/*.ts` | `backendApi` | ✅ |
| `recipe/services/api/*.ts` | `backendApi` | ✅ |
| `shopping-lists/api/*.ts` | `backendApi` | ✅ |
| `planning/services/api/*.ts` | `backendApi` | ✅ |
| `notifications/api/*.ts` | `backendApi` | ✅ |
| `media/api/mediaApi.ts` | `aiApi` | ✅ |
| `food-scan/services/api/imageRecognition.ts` | `aiApi` | ✅ |

---

### 2. 需要修改的問題

#### ⚠️ 問題一：`uploadApi.ts` 使用已棄用的路徑

**檔案**: `src/modules/food-scan/services/api/uploadApi.ts`

```typescript
// ❌ 目前程式碼 - 引用不存在的路徑
import { apiClient } from '@/lib/apiClient';

// ✅ 應該修改為
import { aiApi } from '@/api/client';
```

> [!CAUTION]
> `@/lib/apiClient` 已不存在！此檔案在執行時會報錯。

#### ⚠️ 問題二：功能重複

目前有兩個檔案處理圖片上傳：

| 檔案 | API 端點 | 引用方式 |
|------|----------|----------|
| `uploadApi.ts` | `/media/upload` | ❌ `apiClient` (已棄用) |
| `mediaApi.ts` | `/api/v1/media/upload` | ✅ `aiApi` |

**差異**:
- `uploadApi.ts`: 路徑為 `/media/upload`，回傳 `Promise<string>` (直接回傳 URL)
- `mediaApi.ts`: 路徑為 `/api/v1/media/upload`，回傳 `Promise<{ url: string }>`

由於 `aiApi` 的 base URL 已經是 `/api/v1`，實際上兩者呼叫的是同一個端點。

---

### 3. 建議的修改方案

#### 方案 A：修復並保留兩者（最小變更）

1. **修改 `uploadApi.ts`**:
   ```typescript
   // import { apiClient } from '@/lib/apiClient';
   import { aiApi } from '@/api/client';
   
   // 調整 API 呼叫路徑（移除 /api/v1 前綴）
   const response = await aiApi.post<UploadResponse>('/media/upload', formData);
   ```

2. 保持 `mediaApi.ts` 不變

#### 方案 B：整合為單一 API（推薦）

1. **刪除 `uploadApi.ts`**，統一使用 `mediaApi.ts`

2. **更新 `mediaApi.ts`** 以支援更完整的介面：
   ```typescript
   import { aiApi } from '@/api/client';

   export type UploadResponse = {
     success: boolean;
     data: {
       url: string;
       publicId?: string;
     };
   };

   export const mediaApi = {
     uploadImage: async (file: File | Blob): Promise<string> => {
       const formData = new FormData();
       formData.append('file', file);
       
       const response = await aiApi.post<UploadResponse>('/media/upload', formData);
       
       if (response.success && response.data?.url) {
         return response.data.url;
       }
       throw new Error('Upload failed: No URL returned');
     },
   };
   ```

3. **更新 `useImageUpload.ts`**：
   ```typescript
   // import { uploadApi } from '../services/api/uploadApi';
   import { mediaApi } from '@/modules/media/api/mediaApi';
   
   // 替換
   const optimizedUrl = await mediaApi.uploadImage(blob);
   ```

---

## ✅ 建議的行動項目

| 優先順序 | 任務 | 複雜度 |
|:--------:|------|:------:|
| 🔴 P0 | 修復 `uploadApi.ts` 的 import 路徑 | 低 |
| 🟡 P1 | 整合 `uploadApi.ts` 與 `mediaApi.ts` | 中 |
| 🟢 P2 | 考慮移除 `@/lib/apiClient.ts` 的別名（若確認無其他引用） | 低 |

---

## 📂 相關檔案參考

- [API Client](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/api/client.ts)
- [uploadApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/uploadApi.ts)
- [mediaApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/media/api/mediaApi.ts)
- [useImageUpload.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/hooks/useImageUpload.ts)
- [API 參考文件](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/API_REFERENCE_V2.md)
