# Food Scan Module (食材掃描)

## 簡介
本模組負責處理食材的影像擷取、上傳與辨識流程。整合了裝置相機、Cloudinary 圖片服務與後端辨識 API，提供使用者直覺的食材輸入體驗。

## 核心功能
1.  **影像擷取**: 支援即時相機預覽與拍照。
2.  **圖片上傳**: 整合 Cloudinary 服務，自動處理圖片壓縮與格式轉換。
3.  **使用指引**: 提供首次使用或功能說明的模態視窗。
4.  **結果展示**: 顯示辨識後的食材資訊，供使用者確認與編輯。

## 目錄結構說明

### `components/` (UI 元件)
- **`CameraOverlay.tsx`**: 
  - 相機介面的覆蓋層，包含掃描框、操作按鈕 (拍照、切換鏡頭、相簿)。
  - 負責處理使用者的拍攝互動。
- **`InstructionsModal.tsx`**: 
  - 掃描功能的使用說明彈窗。
  - 引導使用者如何正確拍攝食材以提高辨識率。
- **`ScanResultCard.tsx`**: 
  - 顯示辨識結果的卡片元件。
  - 包含食材名稱、預估數量、分類等資訊的編輯介面。

### `hooks/` (邏輯封裝)
- **`useWebcam.ts`**: 
  - 封裝 `react-webcam` 的操作邏輯。
  - 提供開啟/關閉相機、切換前後鏡頭、擷取影像等方法。
- **`useImageUpload.ts`**: 
  - 處理圖片上傳至 Cloudinary 的完整流程。
  - 包含上傳狀態管理 (Uploading, Success, Error) 與錯誤處理。

### `services/` (API 服務)
- 負責與後端辨識 API 進行通訊，傳送圖片 URL 並接收分析結果。

## 整合流程
1.  使用者開啟掃描頁面 -> 觸發 `useWebcam` 啟動相機。
2.  顯示 `CameraOverlay` 介面。
3.  使用者點擊拍照 -> `useWebcam` 擷取影像 (Base64/Blob)。
4.  呼叫 `useImageUpload` 將影像上傳至 Cloudinary。
5.  取得圖片 URL 後，呼叫辨識 API。
6.  將回傳資料呈現於 `ScanResultCard` 供使用者確認。
