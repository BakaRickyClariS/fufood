# 食物掃描錯誤處理優化規劃

## 問題概述

在食物掃描功能中，當使用者完成圖片拍攝並點擊確認後，系統在上傳和分析階段發生 API 錯誤，導致無法正確處理掃描結果。

### 錯誤訊息

![掃描錯誤截圖](file:///C:/Users/User/.gemini/antigravity/brain/bcc16fc5-c061-4f21-871d-6974550a3b96/uploaded_image_1764652196741.png)

```
API Analyze Error: Error: FoodScan 分析錯誤：API Error: 500
  at Object.recognizeImage (imageRecognition.ts:45:13)
  at async useImageUpload.ts:73:33
  at handleConfirm (Cameracapture.tsx:106:22)
```

### 錯誤發生階段

1. **觸發點**: 使用者點擊確認按鈕（綠色勾選）
2. **上傳階段**: Cloudinary 圖片上傳 ✅ (成功)
3. **分析階段**: AI 圖片分析 API 呼叫 ❌ (失敗，返回 500 錯誤)
4. **結果**: 無法導航到掃描結果編輯頁面

---

## 問題分析

### 1. 錯誤來源定位

#### imageRecognition.ts (L45)
```typescript
const recognizeImage = async (imageUrl: string): Promise<ScanResult> => {
  try {
    const data = await apiClient.post<any>('/ai/analyze-image', { imageUrl });
    return transformScanResult(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`FoodScan 分析錯誤：${message}`); // 錯誤拋出點
  }
};
```

#### useImageUpload.ts (L73)
```typescript
try {
  const analyzeResult = await foodScanApi.recognizeImage(optimizedUrl);
  return analyzeResult;
} catch (error) {
  console.error('API Analyze Error:', error); // 錯誤捕獲點
  setError(
    error instanceof Error 
      ? error.message 
      : '圖片分析失敗，請稍後再試'
  );
  return null;
}
```

#### CameraCapture.tsx (L106)
```typescript
const handleConfirm = async () => {
  if (img) {
    const result = await uploadImage(img);
    if (result) {
      navigate('/upload/scan-result', { state: { result: result.data, imageUrl: img } });
    } else {
      console.error('上傳或分析失敗'); // 失敗處理
      // TODO: Add toast notification here
    }
  }
};
```

### 2. 根本原因

目前可能的原因包括：

- **API 端點問題**: `/ai/analyze-image` 端點可能不存在或未正確設定
- **後端服務錯誤**: AI 分析服務返回 500 內部錯誤
- **請求格式問題**: 傳送的資料格式可能不符合 API 預期
- **環境變數問題**: API 基礎 URL 或認證設定可能有誤
- **CORS 問題**: 跨域請求可能被阻擋
- **Mock API 未啟用**: 若後端未就緒，應該使用 Mock API

---

## 優化方案

### 🎯 短期修復 (立即實施)

#### 1. 改善錯誤處理與用戶反饋

**優先級**: 🔴 高

**目標**: 當 API 失敗時，向使用者提供明確的錯誤訊息和後續操作建議

**修改檔案**:
- [CameraCapture.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/features/CameraCapture.tsx)
- [useImageUpload.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/hooks/useImageUpload.ts)

**實作內容**:
- 在 `CameraCapture` 中添加 Toast 通知功能
- 顯示具體的錯誤訊息而非僅在 console 中記錄
- 提供「重試」或「手動輸入」的選項
- 保留已上傳的圖片，允許使用者重試分析

#### 2. 啟用 Mock API 作為降級方案

**優先級**: 🔴 高

**目標**: 在真實 API 失敗時，自動切換到 Mock API

**修改檔案**:
- [imageRecognition.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/imageRecognition.ts)
- [foodScanApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/foodScanApi.ts)

**實作內容**:
- 檢查環境變數 `VITE_USE_MOCK_API`
- 實作自動降級邏輯：真實 API 失敗後嘗試 Mock API
- 在開發環境中預設使用 Mock API
- 添加環境變數驗證，確保必要的設定都已配置

#### 3. 增強請求錯誤診斷

**優先級**: 🟡 中

**目標**: 提供更詳細的錯誤資訊以便快速定位問題

**修改檔案**:
- `@/lib/apiClient.ts`
- [imageRecognition.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/imageRecognition.ts)

**實作內容**:
- 記錄完整的請求資訊（URL、headers、body）
- 解析並顯示 API 返回的錯誤訊息
- 區分不同類型的錯誤（網路錯誤、伺服器錯誤、認證錯誤等）
- 在開發環境中顯示詳細的除錯資訊

---

### 🚀 中期優化 (後續改進)

#### 4. 實作重試機制

**優先級**: 🟡 中

**實作內容**:
- 在 API 請求失敗時自動重試（最多 3 次）
- 使用指數退避策略 (exponential backoff)
- 只在特定錯誤類型（如暫時性網路錯誤）時重試
- 顯示重試進度給使用者

#### 5. 離線支援與快取

**優先級**: 🟢 低

**實作內容**:
- 當網路不可用時，允許使用者先保存圖片
- 實作本地佇列，網路恢復後自動處理
- 快取成功的分析結果避免重複請求
- 使用 Service Worker 管理離線狀態

#### 6. 添加分析進度指示器

**優先級**: 🟢 低

**實作內容**:
- 顯示上傳和分析的具體進度百分比
- 在等待期間顯示有趣的提示訊息
- 估計剩餘時間
- 允許使用者取消長時間的操作

---

## 實作檢查清單

### Phase 1: 緊急修復
- [ ] 添加 Toast 通知元件到 CameraCapture
- [ ] 實作錯誤訊息的用戶友好顯示
- [ ] 啟用 Mock API 作為開發環境預設選項
- [ ] 實作 API 降級邏輯
- [ ] 測試錯誤情境的使用者體驗

### Phase 2: 診斷加強
- [ ] 改善 apiClient 的錯誤記錄
- [ ] 添加請求/回應的詳細日誌（僅開發環境）
- [ ] 實作錯誤類型分類
- [ ] 建立錯誤監控儀表板（可選）

### Phase 3: 體驗優化
- [ ] 實作自動重試機制
- [ ] 添加重試 UI 指示
- [ ] 實作本地快取策略
- [ ] 添加離線支援
- [ ] 改善載入動畫和進度指示

---

## 技術細節

### 錯誤分類與處理策略

| 錯誤類型 | HTTP 狀態碼 | 處理策略 | 用戶訊息 |
|---------|-----------|---------|---------|
| 網路錯誤 | N/A | 自動重試 3 次 | "網路連線不穩定，正在重試..." |
| 認證錯誤 | 401/403 | 不重試，提示登入 | "請重新登入" |
| 伺服器錯誤 | 500/502/503 | 重試 1 次，然後降級 | "伺服器暫時無法處理，已啟用離線模式" |
| 請求錯誤 | 400/422 | 不重試，提示修正 | "圖片格式不正確，請重新拍攝" |
| 超時錯誤 | 408/504 | 重試 2 次 | "處理時間過長，正在重試..." |

### Mock API 資料範例

```typescript
// 模擬成功的分析結果
const mockScanResult: ScanResult = {
  success: true,
  data: {
    productName: '有機胡蘿蔔',
    category: '蔬果類',
    attributes: '冷藏',
    purchaseQuantity: 1,
    unit: '份',
    purchaseDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    lowStockAlert: true,
    lowStockThreshold: 2,
    notes: 'AI 識別：有機胡蘿蔔',
    imageUrl: ''
  },
  timestamp: new Date().toISOString()
};
```

### 環境變數清單

```bash
# .env.local
VITE_USE_MOCK_API=true  # 開發環境使用 Mock API
VITE_API_BASE_URL=https://api.example.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## 相關檔案

### 核心檔案
- [imageRecognition.ts:45](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/imageRecognition.ts#L45) - 錯誤拋出點
- [useImageUpload.ts:73](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/hooks/useImageUpload.ts#L73) - 錯誤捕獲點
- [CameraCapture.tsx:106](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/features/CameraCapture.tsx#L106) - 錯誤處理點

### 相關檔案
- [foodScanApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/api/foodScanApi.ts)
- [mockFoodScanApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/services/mock/mockFoodScanApi.ts)
- [CameraOverlay/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx)

---

## 測試計畫

### 1. 錯誤場景測試
- [ ] 模擬 500 伺服器錯誤
- [ ] 模擬網路中斷
- [ ] 模擬請求超時
- [ ] 模擬認證失敗

### 2. 降級測試
- [ ] 驗證 Mock API 正常運作
- [ ] 驗證真實 API 失敗後能正確降級
- [ ] 驗證降級後的資料格式正確

### 3. 使用者體驗測試
- [ ] 錯誤訊息是否清晰易懂
- [ ] 重試功能是否正常
- [ ] Toast 通知是否適時顯示
- [ ] 頁面狀態是否正確更新

---

## 預期成果

完成此優化後，系統將能夠：

1. ✅ **優雅地處理 API 錯誤**：不會因為後端問題導致功能完全不可用
2. ✅ **提供清晰的錯誤反饋**：使用者能立即了解發生什麼問題
3. ✅ **自動降級到 Mock API**：在開發或後端不可用時仍能測試前端功能
4. ✅ **保留使用者資料**：即使分析失敗，已上傳的圖片也不會遺失
5. ✅ **支援手動重試**：使用者可以在網路恢復後重新嘗試
6. ✅ **詳細的錯誤日誌**：開發者能快速定位問題根源

---

## 更新記錄

- **2025-12-02**: 初始版本，記錄掃描完成後的 API 500 錯誤問題
