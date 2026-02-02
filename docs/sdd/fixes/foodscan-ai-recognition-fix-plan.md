# FoodScan AI 辨識 API 無作用修正計畫

本文說明為何 FoodScan 的 AI 辨識流程「看起來沒有作用」，並提出可逐步落地的修正方案與驗證清單。

## 背景與症狀

- 使用相機拍照或載入測試圖片後，頁面未顯示正確的辨識結果或一直顯示 Loading/錯誤。
- 後端實際 API 為 `http://localhost:3000/api/v1/recipe/analyze-image`（見 `test-api.js`），但前端呼叫似乎沒有命中該端點。

## 快速結論（TL;DR）

1. 未設定必要的環境變數，導致：
   - Cloudinary 上傳失敗（`VITE_CLOUDINARY_UPLOAD_PRESET`、`VITE_CLOUDINARY_CLOUD_NAME`）。
   - 後端 Base URL 為空字串，請求落到 Vite 開發主機根目錄（404），而非後端（`VITE_RECIPE_API_URL`）。
2. 開發環境無 dev server 代理設定，使用相對路徑時不會自動轉發到後端。
3. `imageRecognition.ts` 的 `transformScanResult` 尚未實作，後端回傳格式未轉成 UI 需要的 `FoodItemInput` 結構，造成「辨識有呼叫但結果沒顯示」的體感。
4. 未啟用 mock API 時（預設），若後端未啟動/未通或 CORS 未開，整段流程就會中斷。

## 根因分析

- 前端 API 建立：`src/modules/food-scan/services/api/imageRecognition.ts`
  - `baseURL = import.meta.env.VITE_RECIPE_API_URL || ''`，未設定時會呼叫 `'/recipe/analyze-image'` 相對路徑，Vite 預設不會轉發至後端，導致 404。
  - `transformScanResult` 標註 TODO，未將後端回應轉換為 UI 所需欄位。
- Mock 切換：`src/modules/food-scan/services/index.ts`
  - 由 `VITE_USE_MOCK_API` 控制，未設定時走「真實 API」。
- 上傳流程：`src/modules/food-scan/hooks/useImageUpload.ts`
  - 需要 `VITE_CLOUDINARY_UPLOAD_PRESET` 與 `VITE_CLOUDINARY_CLOUD_NAME`，缺一會失敗；上傳失敗就不會進入分析階段。
- 後端端點路徑：`test-api.js` 呼叫 `http://localhost:3000/api/v1/recipe/analyze-image`，前端需要對齊 Base URL（含 `/api/v1`）。

## 修正方案

1) 新增並對齊環境變數（建立 `.env.example` 與本機 `.env.local`）

```
# 後端 API Base（需含版本前綴以符合 test-api.js）
VITE_RECIPE_API_URL=http://localhost:3000/api/v1

# Cloudinary（專案已使用）
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# 開發時可先用 mock API
VITE_USE_MOCK_API=true
```

2) 開發代理（可擇一）

- 在 `vite.config.ts` 加入代理，統一以相對路徑呼叫：

```ts
// vite.config.ts
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- 或統一要求設定 `VITE_RECIPE_API_URL`，並於程式碼檢查缺值時給出明確錯誤訊息。

3) 實作 `transformScanResult`（將後端回傳映射到 UI）

- 依後端實際回傳結構，整理為 `ScanResult` 與 `FoodItemInput` 所需欄位。例如：

```ts
// 假設後端回傳 { success: boolean, data: { productName, category, unit, ... } }
const transformScanResult = (resp: any): ScanResult => {
  const payload = resp?.data ?? resp;
  return {
    success: true,
    data: {
      productName: payload.productName ?? '',
      category: payload.category ?? '其他',
      attributes: payload.attributes ?? '常溫',
      purchaseQuantity: payload.purchaseQuantity ?? 1,
      unit: payload.unit ?? '份',
      purchaseDate: payload.purchaseDate ?? new Date().toISOString().slice(0, 10),
      expiryDate: payload.expiryDate ?? '',
      lowStockAlert: payload.lowStockAlert ?? true,
      lowStockThreshold: payload.lowStockThreshold ?? 2,
      notes: payload.notes ?? '',
      imageUrl: payload.imageUrl ?? '',
    },
    timestamp: new Date().toISOString(),
  };
};
```

4) 改善錯誤處理與開發預設

- 在 `createRealFoodScanApi()` 建立時若 `VITE_RECIPE_API_URL` 缺值，直接丟出可讀訊息，避免靜默失敗。
- 開發預設可先使用 mock：`.env.local` 設 `VITE_USE_MOCK_API=true`，待後端正常後再切回。

5) 文件與檔案

- 新增/更新 `.env.example`，列出所有必要的 `VITE_` 變數與說明。
- 在 `README.md` 補上「本機開發」段落，說明如何設定後端 Base URL 與選擇 mock/real API。

## 變更影響範圍

- 前端只涉及設定與 `imageRecognition.ts` 的資料映射，對 UI 結構影響極小。
- 若加入 `vite` 代理，不影響生產環境（僅 dev server 生效）。

## 風險與回滾

- 若後端回傳格式改動，需要同步更新 `transformScanResult`。可在結果頁加上防呆預設值（目前已有）。
- 若代理導致路徑衝突，可改回使用明確 `VITE_RECIPE_API_URL`。

## 驗證清單

- 設定正確的 `.env.local`，重啟 `npm run dev`。
- 使用「載入測試圖片」或拍照：
  - 應看到上傳 → 分析狀態切換（上傳/分析指示）。
  - 能導到 `/upload/scan-result` 並顯示可用的初始欄位。
- Network 面板可見對 Cloudinary 的 200 與對 `${VITE_RECIPE_API_URL}/recipe/analyze-image` 的 200。
- 切換 `VITE_USE_MOCK_API=true` 時，無需後端也能走完整流程。

## 待辦（若同意本計畫）

1. 提交 `.env.example`（不含密鑰，僅示意）。
2. 在 `vite.config.ts` 加入 dev 代理（或明文化要求一律設 `VITE_RECIPE_API_URL`）。
3. 完成 `transformScanResult` 實作並對齊 `FoodItemInput`。
4. 加強錯誤訊息（環境變數缺失、上傳/分析失敗）。
5. README 更新本機開發與切換 mock 方式。

