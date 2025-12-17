# Food Scan Module（AI 食材辨識）

## 目錄
- [概要](#概要)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別](#型別)
- [API 規格](#api-規格)
- [Hooks](#hooks)
- [環境變數](#環境變數)
- [Mock 資料](#mock-資料)

---

## 概要
AI 影像辨識（OCR/食材辨識），透過後端 Proxy 上傳圖片至 Cloudinary (`/api/v1/media/upload`)，再呼叫 `/api/v1/ai/analyze-image` 進行分析，並可直接送入庫存 `/api/v1/inventory`。依精簡版 API：AI 僅保留 `analyze-image` 與 `recipe` 兩條，庫存使用精簡後的 inventory 路由。

### 核心功能
1. 影像上傳（透過後端 Proxy 至 Cloudinary）
2. AI 影像辨識 `/ai/analyze-image`
3.（可選）AI 產生食譜 `/ai/recipe`
4. 將辨識結果提交到庫存 `/inventory`
5. Mock 模式

---

## 目錄結構
```
food-scan/
├── components/
│   ├── features/ (CameraCapture, ScanResultEditor, ScanResultPreview)
│   ├── forms/    (FormInput, FormSelect, FormQuantity, FormDatePicker, FormToggle, FormTextarea, ScanResultEditForm)
│   └── ui/       (CameraOverlay, InstructionsModal, ScanResultCard)
├── constants/    (config.ts, formOptions.ts)
├── hooks/        (useWebcam, useImageUpload, useFoodItemSubmit, useScanInstructions)
├── services/
│   ├── api/
│   │   ├── foodScanApi.ts        # 介面定義
│   │   ├── imageRecognition.ts   # 實際 API 實作
│   │   └── uploadApi.ts          # 圖片上傳 API
│   ├── mock/
│   │   ├── mockData.ts
│   │   └── mockFoodScanApi.ts
│   └── index.ts
├── store/        (cameraSlice.ts)
├── types/        (foodItem.ts, scanResult.ts, index.ts)
└── utils/        (dateHelpers.ts, imageProcessor.ts, validation.ts)
```

---

## 型別
```typescript
export type FoodItemInput = {
  productName: string;
  category: FoodCategory;
  attributes: FoodAttribute;
  purchaseQuantity: number;
  unit: FoodUnit;
  purchaseDate: string;  // YYYY-MM-DD
  expiryDate: string;    // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes: string;
  imageUrl?: string;
};

export type ScanResult = {
  success: boolean;
  data: FoodItemInput;
  timestamp: string;
};

export type FoodItemResponse = {
  success: boolean;
  message: string;
  data: { id: string };
};
```

---

## API 規格

### 路由（對應 API_REFERENCE_V2 #51-#52，及 Inventory #18-#22）
- `POST /api/v1/media/upload`：圖片上傳（Proxy to Cloudinary）
- `POST /api/v1/ai/analyze-image`：影像辨識（OCR/食材）
- `POST /api/v1/ai/recipe`：AI 產生食譜（可選，若未實作可標示 stub）
- `POST /api/v1/inventory`：提交辨識後的食材至庫存（#20）
- `PUT /api/v1/inventory/{id}` / `DELETE /api/v1/inventory/{id}`：更新/刪除庫存（#21/#22，由庫存模組實作）

### FoodScanApi 介面
```typescript
export type FoodScanApi = {
  recognizeImage: (imageUrl: string) => Promise<ScanResult>;
  submitFoodItem: (data: FoodItemInput) => Promise<FoodItemResponse>;
  updateFoodItem: (id: string, data: Partial<FoodItemInput>) => Promise<FoodItemResponse>;
  deleteFoodItem: (id: string) => Promise<{ success: boolean }>;
};
```

#### recognizeImage - 影像辨識
```
POST /api/v1/ai/analyze-image
```
Body: `{ "imageUrl": "https://res.cloudinary.com/..." }`  
Response: `ScanResult`

#### submitFoodItem - 提交庫存
```
POST /api/v1/inventory
```
Body: `FoodItemInput`  
Response: `{ success, message, data: { id } }`

> 已移除獨立 `/inventory/frequent` / `/inventory/expired` / `/inventory/stats`，改由 `status/include` 參數在 `GET /inventory`。

---

## Hooks

### `useImageUpload`
- 使用 **TanStack Query (useMutation)** 管理狀態。
- 流程：呼叫 `uploadApi` 上傳圖片至後端 -> 取得 URL -> 呼叫 `recognizeImage` 進行 AI 分析。
- 狀態：`isUploading` (上傳中), `isAnalyzing` (分析中), `isLoading` (總體等待), `error`, `uploadImage` (mutateAsync)。

### `useFoodItemSubmit`
- 將表單資料提交到 `/inventory`
- 狀態：`isSubmitting`, `error`

### `useWebcam`
- 控制相機、切換鏡頭、拍照取得 Base64

### `useScanInstructions`
- 控制指引 Modal，記錄是否已閱讀（localStorage）

---

## 環境變數
| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API 基底 | `http://localhost:3000/api/v1` |
| `VITE_USE_MOCK_API` | 是否使用 Mock | `true` / `false` |

> 注意：Cloudinary Credentials (`VITE_CLOUDINARY_...`) 已移除，改由後端環境變數管理。

---

## Mock 資料
- `mockFoodScanApi.ts`、`mockData.ts`：提供影像辨識與提交庫存的模擬回應，用於本地開發。
