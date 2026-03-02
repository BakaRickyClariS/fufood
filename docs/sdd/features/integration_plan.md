# Recipe API 與 Fufood 整合計畫

## 目標
將 `fufood` 的上傳功能與 `recipe-api` 連結。使用者在 `fufood` 上傳照片到 Cloudinary 後，將圖片縮小至 500x500 以下，傳送給 `recipe-api` 進行辨識，並顯示辨識結果。

## 使用者審查事項
> [!WARNING]
> **Recipe API 狀態異常**: 檢測到 `https://gemini-ai-recipe-gen-mvp.vercel.app/` 目前回應 **500 Internal Server Error**。
> **開發策略**: 由於 API 目前無法使用，開發期間將會使用 **Mock Data (模擬資料)** 來驗證前端流程與 UI 顯示。待 API 恢復後再進行真實串接測試。

## 擬定變更

### 1. 環境變數設定
設定 Recipe API 的 Base URL。

#### [MODIFY] [.env.example](file:///d:/Work/Course/HexSchool/fufood/.env.example)
- 新增 `VITE_RECIPE_API_URL=https://gemini-ai-recipe-gen-mvp.vercel.app`

### 2. API 服務層
建立新的 API 服務以處理與 `recipe-api` 的通訊。

#### [NEW] [src/api/recipe.ts](file:///d:/Work/Course/HexSchool/fufood/src/api/recipe.ts)
- 定義 `recognizeImage(imageUrl: string)` 函式。
- **Endpoint**: `/api/analyze-image`
- **Method**: `POST`
- **Request Body**: `{ "imageUrl": "..." }`
- **Response Type** (注意：本專案統一使用 `type` 定義型別):
  ```typescript
  type AnalyzeResponse = {
    success: boolean;
    data: {
      productName: string;
      category: string;
      attributes: string;
      quantity: string;
      expiryDate: string;
      notes: string;
    };
    timestamp: string;
  };
  ```

### 3. 路由設定
新增掃描結果頁面的路由。

#### [MODIFY] [src/routes/FoodInput/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/FoodInput/index.tsx)
- 新增 `scan-result` 路徑，對應到 `ScanResult` 元件。

### 4. UI 元件開發
#### [NEW] [src/routes/FoodInput/ScanResult.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/FoodInput/ScanResult.tsx)
- 實作「掃描結果」頁面。
- 接收並顯示 API 回傳的辨識資料 (透過 `useLocation` 的 `state` 接收)。
- 顯示項目：
    - 辨識產品名 (大標題)
    - 產品圖片 (圓形縮圖)
    - 詳細資訊表格：產品分類、產品屬性、單位數量、入庫日期 (預設今天)、保存期限、過期日期、備註。
- 包含「編輯草稿」與「確認歸納倉庫」按鈕 (目前僅實作 UI)。

#### [MODIFY] [src/routes/FoodInput/Upload.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/FoodInput/Upload.tsx)
- 在 `uploadImage` 函式中：
    1. 上傳圖片至 Cloudinary。
    2. 使用 Cloudinary SDK 產生 `w_500,c_limit` 的縮圖 URL。
    3. 呼叫 `recognizeImage` API。
    4. **錯誤處理**: 若 API 失敗 (或回傳 500)，則使用 Mock Data 繼續流程 (為了展示目的)，並顯示 Toast 提示使用者目前使用模擬數據。
    5. 成功後，使用 `useNavigate` 導向至 `/upload/scan-result`，並將結果透過 `state` 傳遞。
- 增加 `isAnalyzing` 狀態，在 API 呼叫期間顯示「辨識中...」的 UI 回饋。

## 驗證計畫

### 手動驗證
1. **Cloudinary 縮圖驗證**
   - 上傳照片，檢查 Console Log 中的縮圖 URL 是否包含 `w_500`。

2. **API 串接與 Mock Fallback**
   - 由於 API 目前 500，預期會觸發 Catch Block 並使用 Mock Data。
   - 確認流程能順利進入結果頁面，且顯示 Mock Data。
   - 若 API 恢復，則確認顯示真實辨識資料。

3. **結果頁面 UI**
   - 確認掃描結果頁面是否正確顯示資料。
   - 檢查 RWD 效果 (手機版面)。
