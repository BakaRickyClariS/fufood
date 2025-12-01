# Food Scan 拍照功能修復計畫

## 問題描述

在 Food Scan（食材掃描）功能中，發現以下兩個主要問題：

1. **拍照按鈕無法觸發拍照**：位於 `BottomNav.tsx` 的 FAB 拍照按鈕在相機模式下點擊後無法觸發拍照功能
2. **AI 辨識資料未正常更新**：相機拍攝後的資料流轉可能存在問題

## 根因分析

### 問題 1：拍照按鈕無法觸發

**核心問題**：`CameraProvider` 的作用範圍（Context Scope）問題

#### 當前架構分析

```
App (root)
└── MainLayout (全域佈局)
    ├── TopNav
    ├── Outlet (路由內容)
    │   └── Upload (/upload 路由)
    │       └── CameraCapture
    │           └── CameraProvider ⚠️ (Context 僅在此處提供)
    │               └── CameraOverlay
    └── BottomNav ⚠️ (嘗試使用 useCameraControl，但在 Context 外部)
```

**問題明細**：

1. **Context 作用範圍錯誤**
   - `CameraProvider` 被包裹在 [`CameraCapture.tsx:64`](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/features/CameraCapture.tsx#L64) 內部
   - `BottomNav` 位於 [`MainLayout.tsx:27`](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/MainLayout.tsx#L27)，在應用程式全域層級
   - `BottomNav` 呼叫 `useCameraControl()` 時，該元件並不在 `CameraProvider` 的子元件樹中
   - 根據 React Context 規則，只有在 Provider 子元件樹內的元件才能存取 Context 值

2. **結果**
   - 在 [`BottomNav.tsx:61`](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/BottomNav.tsx#L61)，`useCameraControl()` 回傳 `null`
   - 在 [`BottomNav.tsx:167`](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/BottomNav.tsx#L167) 的條件判斷 `if (isCameraMode && cameraControl)` 中，`cameraControl` 為 `null`
   - 因此即使在相機模式下點擊按鈕，也無法執行 `cameraControl.triggerCapture()`

3. **未使用的 onCapture prop**
   - 在 [`CameraOverlay/index.tsx:17`](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx#L17)，`onCapture` 參數被重命名為 `_onCapture`（底線前綴表示未使用）
   - 實際上在 [`CameraOverlay/index.tsx:94`](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx#L94) 傳遞的是直接的 `capture` 函數
   - 這導致即使 Context 正常運作，overlay 本身也沒有使用透過 Context 傳遞的拍照功能

### 問題 2：AI 辨識資料未更新

**當前資料流**：
1. [`CameraCapture.tsx:44-54`](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/features/CameraCapture.tsx#L44-L54)：`handleConfirm` 函數處理確認動作
2. 呼叫 `uploadImage(img)` 上傳圖片並進行 AI 辨識
3. 辨識成功後，透過 `navigate('/upload/scan-result', { state: { result: result.data, imageUrl: img } })` 導航到結果頁面
4. [`ScanResult.tsx:11`](file:///d:/Work/Course/HexSchool/fufood/src/routes/FoodScan/ScanResult.tsx#L11) 接收 `location.state` 中的資料

**潛在問題**：
- 這個流程本身是正確的，但如果 `CameraProvider` 作用範圍問題導致無法正常拍照
- 則後續的 AI 辨識流程也無法正常啟動

## 修復方案

### 方案選擇：調整 Context Provider 位置

將 `CameraProvider` 提升到更高層級，讓 `BottomNav` 能夠存取到 Context。

#### 方案 A：在 Upload 頁面層級提供 Context（推薦）

**優點**：
- 最小化變更範圍
- Context 只在需要的頁面啟用
- 保持元件隔離性
- 符合 React Context 最佳實踐

**缺點**：
- `BottomNav` 仍然位於 `MainLayout` 中，不在 Upload 頁面的子樹中
- 此方案**無法解決問題** ❌

#### 方案 B：在 MainLayout 層級提供 Context（推薦）✅

**優點**：
- `BottomNav` 和所有路由頁面都能存取 Context
- 完全解決作用範圍問題
- 實作簡單直接

**缺點**：
- Context 在整個應用程式中都可用（即使不在相機頁面）
- 需要在其他頁面確保 `useCameraControl()` 正確處理 `null` 值

**實作方式**：
- 在 `Upload.tsx` 中包裹 `CameraProvider`
- 將 `onCapture` 邏輯從 `CameraCapture` 提取到 `Upload` 層級
- 確保 `BottomNav` 能夠存取到 Context

#### 方案 C：使用全域狀態管理（如 Zustand 或 Redux）

**優點**：
- 完全解耦，不依賴元件樹結構
- 適合複雜的跨元件通訊

**缺點**：
- 過度設計（Overkill）
- 引入額外依賴
- 增加專案複雜度

### 選定方案：方案 B

採用方案 B，在 `Upload.tsx` 層級提供 `CameraProvider`，包裹整個頁面內容（包括透過 portal 渲染的 `BottomNav`，或者確保 Context 可以被全域存取）。

---

## 修改計畫

> [!IMPORTANT]
> 需要解決的核心問題：
> 1. 調整 `CameraProvider` 的位置，確保 `BottomNav` 能夠存取 Context
> 2. 修正 `CameraOverlay` 中未使用的 `onCapture` prop
> 3. 確保資料流轉正確，AI 辨識結果能夠正常顯示

### 階段 1：調整 Context Provider 架構

#### [MODIFY] [Upload.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/FoodScan/Upload.tsx)

**修改內容**：
1. 將 `CameraProvider` 從 `CameraCapture` 元件內部移至 `Upload` 元件
2. 提取 `handleCapture` 邏輯到 `Upload` 層級
3. 透過 `CameraProvider` 的 `onCapture` prop 傳遞拍照函數

**程式碼變更**：
```tsx
// 新增 useWebcam hook 引用
import { useWebcam } from '@/modules/food-scan/hooks/useWebcam';
import { CameraProvider } from '@/modules/food-scan/contexts/CameraContext';

const Upload: React.FC = () => {
  // 將 webcam 邏輯提升到這裡
  const webcamControl = useWebcam();
  
  // 拍照處理函數
  const handleCapture = () => {
    webcamControl.capture();
  };

  return (
    <CameraProvider onCapture={handleCapture}>
      <div className="...">
        <CameraCapture webcamControl={webcamControl} />
        <InstructionsModal ... />
      </div>
    </CameraProvider>
  );
};
```

---

#### [MODIFY] [CameraCapture.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/features/CameraCapture.tsx)

**修改內容**：
1. 移除 `CameraProvider` 包裹
2. 改為接收 `webcamControl` 作為 prop
3. 移除內部的 `useWebcam` 呼叫
4. 保持其他邏輯不變

**程式碼變更**：
```tsx
type CameraCaptureProps = {
  webcamControl: ReturnType<typeof useWebcam>;
};

export const CameraCapture: React.FC<CameraCaptureProps> = ({ webcamControl }) => {
  const { webcamRef, img, isCapturing, capture, retake, setExternalImage } = webcamControl;
  
  // 移除 CameraProvider，其餘邏輯保持不變
  return (
    <div className="relative w-full h-full bg-black">
      {/* ... */}
    </div>
  );
};
```

---

#### [MODIFY] [CameraOverlay/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx)

**修改內容**：
1. 移除未使用的 `onCapture` prop（因為現在透過 Context 處理）
2. 簡化 props 介面

**程式碼變更**：
```tsx
type CameraOverlayProps = {
  status: CameraOverlayStatus;
  // 移除 onCapture prop
  onRetake: () => void;
  onGallerySelect: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  status,
  onRetake,
  onGallerySelect,
  onConfirm,
  onClose,
}) => {
  // ... 元件邏輯保持不變
};
```

---

### 階段 2：確保資料流正確性

#### [VERIFY] 資料流程驗證

確認以下流程正常運作：

1. **拍照觸發**：
   - `BottomNav` FAB 按鈕 → `useCameraControl().triggerCapture()` → `CameraProvider` → `Upload` 的 `handleCapture` → `useWebcam().capture()`

2. **圖片預覽**：
   - `capture()` 更新 `img` 狀態 → `CameraCapture` 顯示預覽圖片

3. **AI 辨識**：
   - 確認按鈕 → `handleConfirm` → `uploadImage(img)` → API 呼叫 → 取得結果

4. **結果顯示**：
   - `navigate('/upload/scan-result', { state: { result, imageUrl } })` → `ScanResult` 接收資料 → 顯示結果卡片

---

## 驗證計畫

### 自動化測試

目前專案中沒有針對 Food Scan 模組的單元測試或整合測試。

**建議新增測試**：
1. `CameraContext.test.tsx`：測試 Context Provider 和 Consumer
2. `CameraCapture.test.tsx`：測試拍照流程
3. `BottomNav.test.tsx`：測試 FAB 按鈕在相機模式下的行為

### 手動測試

#### 測試步驟

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **導航到上傳頁面**
   - 開啟瀏覽器
   - 導航到 `http://localhost:5173/upload`
   - 允許相機權限

3. **測試拍照功能**
   - ✅ 點擊底部導航列的 FAB 紅色拍照按鈕
   - ✅ 確認相機捕捉畫面並顯示預覽
   - ✅ 確認狀態提示從「請將食材放入框內（黃色）」變為「沒問題，掃描即將完成（綠色）」

4. **測試 AI 辨識流程**
   - ✅ 在預覽模式下，點擊綠色確認按鈕（✓）
   - ✅ 觀察上傳和分析狀態提示
   - ✅ 確認成功導航到 `/upload/scan-result` 頁面
   - ✅ 確認辨識結果卡片正確顯示：
     - 產品名稱
     - 分類、屬性
     - 數量、日期
     - 縮圖

5. **測試錯誤處理**
   - ✅ 測試重拍功能（X 按鈕）
   - ✅ 測試從相簿選擇圖片功能
   - ✅ 測試關閉相機功能

#### 預期結果

所有功能應正常運作，包括：
- 拍照按鈕能夠觸發拍照
- 圖片預覽正確顯示
- AI 辨識流程順暢
- 結果資料正確顯示在畫面上

---

## 風險評估

### 潛在風險

1. **Context 位置調整的副作用**
   - 風險：其他頁面可能嘗試使用 `useCameraControl()`
   - 緩解：確保在非相機頁面，`useCameraControl()` 回傳 `null` 時的處理邏輯正確

2. **Props 傳遞層級增加**
   - 風險：`webcamControl` 需要從 `Upload` 傳遞到 `CameraCapture`
   - 緩解：這是合理的 Props Drilling，層級不深（只有一層）

3. **狀態同步問題**
   - 風險：拍照狀態可能在多個元件間不同步
   - 緩解：使用單一來源（`useWebcam` hook）管理狀態

---

## 後續建議

1. **新增測試覆蓋率**
   - 為 `CameraContext`、`CameraCapture`、`BottomNav` 新增單元測試
   - 新增 E2E 測試覆蓋完整的拍照流程

2. **改進錯誤處理**
   - 新增 Toast 通知提示上傳失敗
   - 新增相機權限被拒絕的提示

3. **效能優化**
   - 考慮使用 `useMemo` 快取不常變動的值
   - 優化圖片壓縮和上傳流程

4. **程式碼重構**
   - 考慮將 Camera 相關邏輯進一步模組化
   - 抽取可重用的 hooks 和 utilities
