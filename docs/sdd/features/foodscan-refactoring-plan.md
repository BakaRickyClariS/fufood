# Food Scan 模組重構規劃書

## 📋 目標概述

本規劃旨在對 `food-scan` 模組進行全面性的重構，實現以下目標：

1. **關注點分離 (Separation of Concerns)**：將業務邏輯、UI 呈現、資料處理清晰分離
2. **元件化整理 (Componentization)**：將可重用的 UI 元件與業務元件分層管理
3. **API 抽象層設計 (API Abstraction Layer)**：建立統一的 API 服務層，支援假資料與真實 API 無縫切換
4. **提升可維護性與可測試性**：透過模組化設計，降低耦合度，提高程式碼品質

---

## 🎯 當前架構分析

### 現有目錄結構

```
src/modules/food-scan/
├── components/          # UI 元件
│   ├── CameraOverlay.tsx
│   ├── InstructionsModal.tsx
│   ├── ScanResultCard.tsx
│   ├── ScanResultEditForm.tsx
│   └── Form*.tsx (7個表單元件)
├── hooks/              # 自訂 Hooks
│   ├── useWebcam.ts
│   └── useImageUpload.ts
└── services/           # API 服務
    └── ocrService.ts
```

### 使用場景

```
src/routes/FoodScan/
├── Upload.tsx          # 掃描上傳頁面
└── ScanResult.tsx      # 掃描結果頁面
```

### 問題識別

1. **元件職責不清**
   - `CameraOverlay` 既負責 UI 也處理部分邏輯
   - 表單元件散落在 `components` 根目錄，缺乏分類

2. **API 耦合度高**
   - `useImageUpload` 直接呼叫 `recognizeImage` API
   - 假資料 fallback 邏輯寫死在 hook 中，不利於測試與切換

3. **缺乏統一的資料模型管理**
   - 類型定義分散在各檔案中
   - 沒有統一的 mock data 管理機制

4. **業務邏輯與 UI 混雜**
   - `Upload.tsx` 內包含狀態管理、事件處理、UI 渲染
   - `ScanResult.tsx` 同時處理表單邏輯與頁面布局

---

## 🏗️ 重構後的目錄結構

```
src/modules/food-scan/
├── components/
│   ├── ui/                      # 純 UI 元件（可重用）
│   │   ├── CameraOverlay/
│   │   │   ├── index.tsx
│   │   │   └── CameraFrame.tsx
│   │   ├── InstructionsModal.tsx
│   │   └── ScanResultCard.tsx
│   │
│   ├── forms/                   # 表單相關元件
│   │   ├── ScanResultEditForm.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormQuantity.tsx
│   │   ├── FormDatePicker.tsx
│   │   ├── FormToggle.tsx
│   │   └── FormTextarea.tsx
│   │
│   └── features/                # 業務功能元件
│       ├── CameraCapture.tsx    # [NEW] 整合相機邏輯的功能元件
│       └── ScanResultEditor.tsx # [NEW] 整合編輯邏輯的功能元件
│
├── hooks/
│   ├── useWebcam.ts
│   ├── useImageUpload.ts        # [MODIFY] 移除 API 直接呼叫
│   ├── useFoodItemSubmit.ts     # [NEW] 提交食材邏輯
│   └── useScanInstructions.ts   # [NEW] 使用說明邏輯
│
├── services/
│   ├── api/
│   │   ├── foodScanApi.ts       # [NEW] 統一 API 介面
│   │   ├── imageRecognition.ts  # [MODIFY] 重命名 ocrService.ts
│   │   └── foodItemService.ts   # [NEW] 食材項目 CRUD API
│   │
│   ├── mock/
│   │   ├── mockFoodScanApi.ts   # [NEW] Mock API 實作
│   │   └── mockData.ts          # [NEW] 假資料定義
│   │
│   └── index.ts                 # [NEW] API 服務統一出口（環境切換）
│
├── types/
│   ├── foodItem.ts              # [NEW] 食材項目類型定義
│   ├── scanResult.ts            # [NEW] 掃描結果類型定義
│   └── index.ts                 # [NEW] 類型統一出口
│
├── utils/
│   ├── imageProcessor.ts        # [NEW] 圖片處理工具
│   └── validation.ts            # [NEW] 表單驗證規則
│
└── constants/
    ├── formOptions.ts           # [NEW] 表單選項常數
    └── config.ts                # [NEW] 模組配置
```

---

## 🔧 重構細節

### 1️⃣ 關注點分離策略

#### A. UI 元件層 (`components/ui/`)
**職責**：純粹的視覺呈現，不包含業務邏輯

```tsx
// components/ui/CameraOverlay/index.tsx
type CameraOverlayProps = {
  status: 'idle' | 'capturing' | 'uploading' | 'analyzing';
  onCapture: () => void;
  onRetake: () => void;
  onGallerySelect: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};
```

**變更點**：
- 移除內部狀態管理
- 僅接收 props 渲染 UI
- 所有互動透過 callback 向上傳遞

#### B. 業務功能元件層 (`components/features/`)
**職責**：整合 UI 與業務邏輯

```tsx
// components/features/CameraCapture.tsx
export const CameraCapture = () => {
  const { webcamRef, img, isCapturing, capture, retake } = useWebcam();
  const { uploadImage, isUploading, isAnalyzing } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async () => {
    if (img) {
      await uploadImage(img);
    }
  };

  return (
    <>
      {isCapturing ? (
        <Webcam ref={webcamRef} {...videoConstraints} />
      ) : (
        <img src={img} />
      )}
      <CameraOverlay
        status={getStatus(isCapturing, isUploading, isAnalyzing)}
        onCapture={capture}
        onRetake={retake}
        onConfirm={handleConfirm}
        // ...
      />
    </>
  );
};
```

#### C. Hooks 層 (`hooks/`)
**職責**：封裝可重用的業務邏輯

```tsx
// hooks/useScanInstructions.ts
export const useScanInstructions = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(INSTRUCTIONS_KEY);
    if (!seen) setShowInstructions(true);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(INSTRUCTIONS_KEY, 'true');
    }
    setShowInstructions(false);
  };

  return { showInstructions, dontShowAgain, setDontShowAgain, handleClose };
};
```

---

### 2️⃣ API 抽象層設計

#### A. 統一 API 介面 (`services/api/foodScanApi.ts`)

```typescript
// services/api/foodScanApi.ts
export interface FoodScanApi {
  /**
   * 辨識圖片中的食材
   */
  recognizeImage(imageUrl: string): Promise<ScanResult>;

  /**
   * 提交食材項目到倉庫
   */
  submitFoodItem(data: FoodItemInput): Promise<FoodItemResponse>;

  /**
   * 更新食材項目
   */
  updateFoodItem(id: string, data: Partial<FoodItemInput>): Promise<FoodItemResponse>;

  /**
   * 刪除食材項目
   */
  deleteFoodItem(id: string): Promise<{ success: boolean }>;

  /**
   * 取得食材項目列表
   */
  getFoodItems(filters?: FoodItemFilters): Promise<FoodItem[]>;
}
```

#### B. 真實 API 實作 (`services/api/imageRecognition.ts`)

```typescript
// services/api/imageRecognition.ts
import type { FoodScanApi, ScanResult, FoodItemInput } from '@/modules/food-scan/types';

export class RealFoodScanApi implements FoodScanApi {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_RECIPE_API_URL || '';
  }

  async recognizeImage(imageUrl: string): Promise<ScanResult> {
    const response = await fetch(`${this.baseURL}/recipe/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformScanResult(data);
  }

  async submitFoodItem(data: FoodItemInput): Promise<FoodItemResponse> {
    const response = await fetch(`${this.baseURL}/food-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Submit Error: ${response.statusText}`);
    }

    return response.json();
  }

  // ... 其他方法實作
}
```

#### C. Mock API 實作 (`services/mock/mockFoodScanApi.ts`)

```typescript
// services/mock/mockFoodScanApi.ts
import type { FoodScanApi, ScanResult, FoodItemInput } from '@/modules/food-scan/types';
import { MOCK_SCAN_RESULTS, MOCK_FOOD_ITEMS } from './mockData';

export class MockFoodScanApi implements FoodScanApi {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async recognizeImage(imageUrl: string): Promise<ScanResult> {
    // 模擬網路延遲
    await this.delay(1500);
    
    // 隨機返回一個 mock 結果
    const mockResult = MOCK_SCAN_RESULTS[
      Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)
    ];

    return {
      ...mockResult,
      timestamp: new Date().toISOString(),
    };
  }

  async submitFoodItem(data: FoodItemInput): Promise<FoodItemResponse> {
    await this.delay(1000);
    
    const newItem = {
      id: `mock-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };

    // 可選：存入 localStorage 模擬持久化
    const existing = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
    existing.push(newItem);
    localStorage.setItem('mock_food_items', JSON.stringify(existing));

    return {
      success: true,
      message: '成功歸納至倉庫',
      data: { id: newItem.id },
    };
  }

  // ... 其他方法實作
}
```

#### D. Mock 資料定義 (`services/mock/mockData.ts`)

```typescript
// services/mock/mockData.ts
import type { ScanResult } from '@/modules/food-scan/types';

export const MOCK_SCAN_RESULTS: ScanResult['data'][] = [
  {
    productName: '鮮奶',
    category: '乳製品',
    attributes: '冷藏',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 2,
    notes: '常備品',
  },
  {
    productName: '雞蛋',
    category: '蛋類',
    attributes: '冷藏',
    purchaseQuantity: 10,
    unit: '顆',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 5,
    notes: '每週必買',
  },
  {
    productName: '花椰菜',
    category: '蔬菜',
    attributes: '冷藏',
    purchaseQuantity: 1,
    unit: '顆',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lowStockAlert: false,
    lowStockThreshold: 1,
    notes: '趁新鮮吃完',
  },
  {
    productName: '豬肉片',
    category: '肉類',
    attributes: '冷凍',
    purchaseQuantity: 500,
    unit: 'g',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 200,
    notes: '備用食材',
  },
  {
    productName: '番茄醬',
    category: '調味料',
    attributes: '常溫',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '',
  },
];
```

#### E. 環境切換機制 (`services/index.ts`)

```typescript
// services/index.ts
import type { FoodScanApi } from '@/modules/food-scan/types';
import { RealFoodScanApi } from './api/imageRecognition';
import { MockFoodScanApi } from './mock/mockFoodScanApi';

/**
 * 根據環境變數決定使用真實 API 或 Mock API
 * 
 * 環境變數設定：
 * - VITE_USE_MOCK_API=true  → 使用假資料
 * - VITE_USE_MOCK_API=false → 使用真實 API
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const foodScanApi: FoodScanApi = USE_MOCK 
  ? new MockFoodScanApi() 
  : new RealFoodScanApi();

// 也可以提供手動切換的方法（用於開發/測試）
export const createFoodScanApi = (useMock: boolean): FoodScanApi => {
  return useMock ? new MockFoodScanApi() : new RealFoodScanApi();
};
```

---

### 3️⃣ 類型定義整合

#### `types/foodItem.ts`

```typescript
// types/foodItem.ts
export type FoodCategory = 
  | '蔬菜' 
  | '水果' 
  | '肉類' 
  | '海鮮' 
  | '乳製品' 
  | '飲品' 
  | '零食' 
  | '調味料' 
  | '其他';

export type FoodAttribute = '常溫' | '冷藏' | '冷凍';

export type FoodUnit = 
  | '個' 
  | '包' 
  | '瓶' 
  | '罐' 
  | '盒' 
  | 'kg' 
  | 'g' 
  | 'L' 
  | 'ml' 
  | '顆';

export interface FoodItemInput {
  productName: string;
  category: FoodCategory;
  attributes: FoodAttribute;
  purchaseQuantity: number;
  unit: FoodUnit;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes: string;
  imageUrl?: string;
}

export interface FoodItem extends FoodItemInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FoodItemResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

export interface FoodItemFilters {
  category?: FoodCategory;
  attribute?: FoodAttribute;
  isExpiringSoon?: boolean; // 即將過期
  isLowStock?: boolean;     // 低庫存
}
```

#### `types/scanResult.ts`

```typescript
// types/scanResult.ts
import type { FoodItemInput } from './foodItem';

export interface ScanResult {
  success: boolean;
  data: FoodItemInput;
  timestamp: string;
}
```

---

### 4️⃣ 修改現有檔案

#### A. `hooks/useImageUpload.ts` - 移除 API 直接呼叫

**修改前**：
```typescript
import { recognizeImage } from '@/modules/food-scan/services/ocrService';

const analyzeResult = await recognizeImage(optimizedUrl);
```

**修改後**：
```typescript
import { foodScanApi } from '@/modules/food-scan/services';

const analyzeResult = await foodScanApi.recognizeImage(optimizedUrl);
```

**優點**：
- 解除與特定 API 實作的耦合
- 可透過環境變數切換 API 來源
- 方便單元測試時注入 mock 實作

#### B. `routes/FoodScan/Upload.tsx` - 提取業務邏輯

**修改前**：所有邏輯寫在頁面元件中

**修改後**：使用業務功能元件

```tsx
// routes/FoodScan/Upload.tsx
import { CameraCapture } from '@/modules/food-scan/components/features/CameraCapture';
import { useScanInstructions } from '@/modules/food-scan/hooks/useScanInstructions';

const Upload: React.FC = () => {
  const { showInstructions, dontShowAgain, setDontShowAgain, handleClose } = 
    useScanInstructions();

  return (
    <div className="fixed inset-0">
      <CameraCapture />
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleClose}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
      />
    </div>
  );
};
```

#### C. `routes/FoodScan/ScanResult.tsx` - 提取編輯邏輯

```tsx
// routes/FoodScan/ScanResult.tsx
import { ScanResultEditor } from '@/modules/food-scan/components/features/ScanResultEditor';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl } = location.state || {};

  if (!result) {
    return <EmptyState onBack={() => navigate('/upload')} />;
  }

  return (
    <ScanResultEditor 
      initialData={result} 
      imageUrl={imageUrl}
      onSuccess={() => navigate('/inventory')}
      onBack={() => navigate('/upload')}
    />
  );
};
```

---

## 📦 新增檔案清單

### Constants

```typescript
// constants/formOptions.ts
export const CATEGORY_OPTIONS = [
  { value: '蔬菜', label: '蔬菜' },
  { value: '水果', label: '水果' },
  { value: '肉類', label: '肉類' },
  // ...
];

export const ATTRIBUTE_OPTIONS = [
  { value: '常溫', label: '常溫' },
  { value: '冷藏', label: '冷藏' },
  { value: '冷凍', label: '冷凍' },
];

export const UNIT_OPTIONS = [
  { value: '個', label: '個' },
  { value: '包', label: '包' },
  // ...
];
```

```typescript
// constants/config.ts
export const INSTRUCTIONS_KEY = 'fufood_upload_instructions_seen';
export const DEFAULT_LOW_STOCK_THRESHOLD = 2;
export const MOCK_API_DELAY = 1500; // ms
```

### Utils

```typescript
// utils/imageProcessor.ts
export const base64ToBlob = (base64: string): Blob => {
  const [metadata, base64Data] = base64.split(',');
  const mime = metadata.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64Data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

```typescript
// utils/validation.ts
export const validateExpiryDate = (purchaseDate: string, expiryDate: string): boolean => {
  return new Date(expiryDate) > new Date(purchaseDate);
};

export const validateQuantity = (value: number, min = 1, max = 999): boolean => {
  return value >= min && value <= max;
};
```

---

## 🔄 API 功能規劃

### 已實作功能
1. ✅ 圖片辨識 (`recognizeImage`)
2. ✅ 食材項目提交 (`submitFoodItem`)

### 預計新增功能
以下為後端開發後可能需要的 API 功能，先以 Mock 方式實作：

#### 1. 更新食材項目
```typescript
async updateFoodItem(id: string, data: Partial<FoodItemInput>): Promise<FoodItemResponse>
```

**使用場景**：使用者在倉庫中編輯已存在的食材資訊

**Mock 實作**：
```typescript
async updateFoodItem(id: string, data: Partial<FoodItemInput>) {
  await this.delay(800);
  const items = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
  const index = items.findIndex((item: FoodItem) => item.id === id);
  
  if (index === -1) {
    throw new Error('Item not found');
  }
  
  items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem('mock_food_items', JSON.stringify(items));
  
  return { success: true, message: '更新成功', data: { id } };
}
```

#### 2. 刪除食材項目
```typescript
async deleteFoodItem(id: string): Promise<{ success: boolean }>
```

**使用場景**：使用者從倉庫中移除食材

**Mock 實作**：
```typescript
async deleteFoodItem(id: string) {
  await this.delay(500);
  const items = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
  const filtered = items.filter((item: FoodItem) => item.id !== id);
  localStorage.setItem('mock_food_items', JSON.stringify(filtered));
  
  return { success: true };
}
```

#### 3. 取得食材列表
```typescript
async getFoodItems(filters?: FoodItemFilters): Promise<FoodItem[]>
```

**使用場景**：倉庫頁面顯示食材列表，支援篩選

**Mock 實作**：
```typescript
async getFoodItems(filters?: FoodItemFilters) {
  await this.delay(600);
  let items: FoodItem[] = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
  
  if (filters?.category) {
    items = items.filter(item => item.category === filters.category);
  }
  
  if (filters?.isExpiringSoon) {
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    items = items.filter(item => new Date(item.expiryDate) <= threeDaysLater);
  }
  
  if (filters?.isLowStock) {
    items = items.filter(item => 
      item.lowStockAlert && item.purchaseQuantity <= item.lowStockThreshold
    );
  }
  
  return items;
}
```

#### 4. 批次上傳圖片
```typescript
async recognizeMultipleImages(imageUrls: string[]): Promise<ScanResult[]>
```

**使用場景**：使用者一次掃描多個食材

**Mock 實作**：
```typescript
async recognizeMultipleImages(imageUrls: string[]) {
  await this.delay(2000);
  return imageUrls.map(() => ({
    success: true,
    data: MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)],
    timestamp: new Date().toISOString(),
  }));
}
```

---

## 🚀 實作步驟

### Phase 1：基礎架構建立（優先）
1. ✅ 建立類型定義檔案 (`types/`)
2. ✅ 建立 Mock 資料與 Mock API (`services/mock/`)
3. ✅ 建立統一 API 介面與切換機制 (`services/index.ts`)
4. ✅ 建立常數與工具函式 (`constants/`, `utils/`)

### Phase 2：元件重構
5. 🔄 重新組織 `components/` 目錄結構
   - 將表單元件移至 `forms/`
   - 建立 `ui/` 和 `features/` 分層
6. 🔄 建立業務功能元件
   - `CameraCapture.tsx`
   - `ScanResultEditor.tsx`

### Phase 3：邏輯提取
7. 🔄 建立新的 Hooks
   - `useFoodItemSubmit.ts`
   - `useScanInstructions.ts`
8. 🔄 修改現有 Hooks 移除 API 耦合
   - `useImageUpload.ts`

### Phase 4：頁面簡化
9. 🔄 重構 `Upload.tsx`
10. 🔄 重構 `ScanResult.tsx`

### Phase 5：測試與驗證
11. ✅ 驗證環境切換機制正常運作
12. ✅ 測試所有 Mock API 功能
13. ✅ 確認 UI 與邏輯分離完整

---

## ⚙️ 環境變數設定

需在 `.env` 中新增：

```bash
# API 模式切換
VITE_USE_MOCK_API=true  # 開發階段使用假資料
# VITE_USE_MOCK_API=false  # 後端完成後切換為真實 API

# 真實 API URL（已存在）
VITE_RECIPE_API_URL=https://your-backend-api.com
```

---

## 📝 使用範例

### 開發階段（使用 Mock）

```typescript
// .env
VITE_USE_MOCK_API=true

// 程式碼中
import { foodScanApi } from '@/modules/food-scan/services';

const result = await foodScanApi.recognizeImage(imageUrl);
// → 返回 MOCK_SCAN_RESULTS 中的隨機資料
```

### 生產階段（使用真實 API）

```typescript
// .env
VITE_USE_MOCK_API=false

// 程式碼不變
import { foodScanApi } from '@/modules/food-scan/services';

const result = await foodScanApi.recognizeImage(imageUrl);
// → 呼叫真實後端 API
```

### 測試時手動注入 Mock

```typescript
import { createFoodScanApi } from '@/modules/food-scan/services';

const mockApi = createFoodScanApi(true);
const result = await mockApi.recognizeImage('test.jpg');
// 強制使用 Mock，不受環境變數影響
```

---

## ✅ 預期效益

1. **關注點分離**
   - ✅ UI 元件不包含業務邏輯，可獨立開發與測試
   - ✅ 業務邏輯集中在 Hooks 與功能元件，易於維護

2. **API 抽象化**
   - ✅ 前端開發不受後端進度阻塞
   - ✅ 一行環境變數即可切換 Mock/Real API
   - ✅ 方便進行單元測試與整合測試

3. **可維護性提升**
   - ✅ 目錄結構清晰，檔案職責明確
   - ✅ Mock 資料集中管理，易於擴充
   - ✅ 類型定義統一，減少類型錯誤

4. **開發效率**
   - ✅ 多個開發者可並行開發不同層次
   - ✅ 後端 API 完成後無需大幅修改前端程式碼
   - ✅ 豐富的 Mock 資料可用於 Demo 與測試

---

## 🎯 後續優化建議

1. **狀態管理優化**
   - 若模組持續擴展，考慮引入 Zustand 或 Context API 管理全域狀態

2. **錯誤處理增強**
   - 建立統一的錯誤處理機制
   - 實作 API retry 與錯誤回報功能

3. **效能優化**
   - 圖片壓縮在上傳前就在前端處理
   - 使用 React.memo 優化頻繁渲染的元件

4. **可測試性**
   - 為核心業務邏輯編寫單元測試
   - 使用 Testing Library 測試元件互動

---

## 📚 參考文件

- [React Hook 最佳實踐](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript Interface vs Type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [API 設計模式](https://martinfowler.com/articles/patterns-of-distributed-systems/)

---

**文件版本**: v1.0  
**建立日期**: 2025-11-30  
**最後更新**: 2025-11-30
