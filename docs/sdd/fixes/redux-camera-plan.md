# Food Scan Redux 重構與測試計畫

## 目標
1.  **遷移狀態管理**：將 Food Scan 的相機與流程狀態從 Context API 遷移至 **Redux** (Option C)。
2.  **實作測試功能**：使用指定路徑 `C:\Users\USER\Downloads\meat.jpg` 進行 AI 辨識測試。

## 1. Redux 架構設置

由於專案目前尚未安裝 Redux，需先進行基礎設置。

### 依賴安裝
- `npm install @reduxjs/toolkit react-redux`

### Store 設計
建立 `src/store` 目錄與基礎設定。

#### [NEW] `src/store/index.ts`
- 設定 Redux Store
- 整合 `cameraSlice`

#### [NEW] `src/modules/food-scan/store/cameraSlice.ts`
- **State**:
  - `isCapturing`: boolean (是否正在拍照模式)
  - `image`: string | null (擷取的圖片 Base64 或 URL)
  - `status`: 'idle' | 'capturing' | 'uploading' | 'analyzing' | 'done'
  - `triggerToken`: number (用於觸發拍照的訊號，BottomNav 改變此值，CameraCapture 監聽並執行拍照)
- **Actions**:
  - `triggerCapture()`: 更新 `triggerToken`
  - `setCapturedImage(image)`: 設定圖片並切換狀態
  - `retake()`: 重置狀態
  - `setUploadStatus(status)`: 更新上傳/分析狀態

### 應用程式整合

#### [MODIFY] `src/main.tsx`
- 使用 `Provider` 包裹 `App` 元件。

## 2. 元件重構

### [MODIFY] `src/shared/components/layout/BottomNav.tsx`
- 移除 `useCameraControl` Context 引用。
- 改用 `useDispatch` 發送 `triggerCapture` action。
- 使用 `useSelector` 判斷是否在相機模式 (如果需要)。

### [MODIFY] `src/modules/food-scan/components/features/CameraCapture.tsx`
- 移除 `CameraProvider`。
- 使用 `useSelector` 監聽 `triggerToken`。當 `triggerToken` 改變時，執行 `webcamRef.current.getScreenshot()`。
- 拍照後 dispatch `setCapturedImage`。
- 確認/重拍邏輯改為 dispatch 對應 actions。

### [MODIFY] `src/routes/FoodScan/Upload.tsx`
- 移除 `CameraProvider` 包裹。

## 3. 測試圖片整合 (Test Image Integration)

為了滿足「使用 `C:\Users\USER\Downloads\meat.jpg` 測試」的需求，我們需要將檔案引入專案環境。

### 步驟
1.  **複製檔案**：使用 Agent 指令將檔案從 Downloads 複製到專案目錄 `src/assets/test/meat.jpg` (如果檔案存在)。
2.  **載入機制**：
    - 在 `CameraCapture` 元件中 (僅在開發模式或透過特定操作)，新增一個「載入測試圖片」按鈕。
    - 點擊後，將 `src/assets/test/meat.jpg` 的內容轉換為 Base64 或直接使用路徑 (需透過 import) 更新到 Redux state。

## 4. 驗證計畫

### 自動化測試
- 無 (本次重點在功能實作與手動驗證)

### 手動驗證步驟
1.  **安裝依賴**：執行 `npm install @reduxjs/toolkit react-redux`。
2.  **複製圖片**：確認 `src/assets/test/meat.jpg` 已存在。
3.  **啟動應用**：`npm run dev`。
4.  **測試拍照按鈕**：
    - 進入 `/upload`。
    - 點擊 BottomNav 的紅色按鈕。
    - 確認畫面定格並顯示預覽 (Redux 狀態更新)。
5.  **測試指定圖片**：
    - 點擊畫面上的「載入測試圖片 (Dev)」按鈕 (將新增此按鈕)。
    - 確認畫面顯示肉類圖片。
    - 點擊確認，驗證 AI 辨識流程是否正常執行並跳轉結果頁。

## 風險評估
- **Redux 複雜度**：引入 Redux 會增加專案複雜度，但能有效解決跨元件通訊問題。
- **檔案存取**：瀏覽器無法直接存取本機檔案系統，必須透過「複製到專案」的方式繞過此限制。
