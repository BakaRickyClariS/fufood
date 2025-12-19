# Vercel 環境變數設定指南

本文檔說明如何在 Vercel 上設定 Fufood 前端專案的環境變數。

## 環境變數列表

### 必要設定

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_AI_API_BASE_URL` | AI API 基底 URL（OCR、食譜生成、媒體上傳） | `https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1` |
| `VITE_BACKEND_API_BASE_URL` | 後端 API 基底 URL（認證、庫存、群組等） | `https://api.fufood.jocelynh.me` |

### 可選設定

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `false`（生產環境建議） |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | - |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | - |

## Vercel 設定步驟

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的 Fufood 前端專案
3. 進入 **Settings** > **Environment Variables**
4. 新增以下環境變數：

### Production 環境

```
VITE_AI_API_BASE_URL = https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1
VITE_BACKEND_API_BASE_URL = https://api.fufood.jocelynh.me
VITE_USE_MOCK_API = false
```

### Preview 環境（可選）

```
VITE_AI_API_BASE_URL = https://gemini-ai-recipe-gen-mvp.vercel.app/api/v1
VITE_BACKEND_API_BASE_URL = https://api.fufood.jocelynh.me
VITE_USE_MOCK_API = true
```

### Development 環境（本地開發）

```
VITE_AI_API_BASE_URL = http://localhost:3000/api/v1
VITE_BACKEND_API_BASE_URL = https://api.fufood.jocelynh.me
VITE_USE_MOCK_API = true
```

## 注意事項

1. **重新部署**: 設定環境變數後，需要重新部署專案才會生效
2. **API 版本前綴**: AI API URL 已包含 `/api/v1` 前綴
3. **CORS 設定**: 確保後端 API 已正確設定 CORS，允許 `https://your-vercel-domain.vercel.app` 的請求
4. **Cookie 設定**: 確保後端設定的 Cookie 為 `SameSite=None; Secure` 以支援跨域認證

## 舊版環境變數遷移

如果您之前使用舊版環境變數，請按照以下對應關係更新：

| 舊變數名稱 | 新變數名稱 |
|-----------|-----------|
| `VITE_API_BASE_URL` | `VITE_AI_API_BASE_URL` |
| `VITE_LINE_API_BASE_URL` | `VITE_BACKEND_API_BASE_URL` |
| `VITE_RECIPE_API_URL` | 已棄用，使用 `VITE_AI_API_BASE_URL` |

## 驗證設定

設定完成後，可透過以下方式驗證：

1. 檢查瀏覽器 Console 是否有 API 錯誤
2. 測試 LINE 登入功能
3. 測試圖片上傳和 OCR 辨識功能
